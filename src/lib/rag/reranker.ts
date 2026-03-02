import { EnhancedQuery, RerankedChunk, RerankedMultiSourceChunk } from "@/types/rag";
import { ScoredChunk, ScoredMultiSourceChunk } from "@/types/pinecone";
import { RAG_CONFIG, MULTI_SOURCE_BOOST, LEGAL_ANCHOR_TERMS } from "@/config/constants";
import { generateText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { openai } from "@ai-sdk/openai";

function getRerankerModel() {
  const provider = process.env.LLM_PROVIDER || "anthropic";
  if (provider === "openai") {
    return openai("gpt-4o-mini");
  }
  return anthropic("claude-haiku-4-5-20251001");
}

// Spanish stop words — used instead of length-based filtering to preserve
// important short terms like "IVA", "GMF", "UVT", "DUR"
const STOP_WORDS = new Set([
  "el", "la", "los", "las", "de", "del", "en", "un", "una", "que",
  "por", "con", "para", "es", "son", "se", "al", "lo", "su", "más",
  "no", "si", "como", "qué", "cual", "cuál", "este", "esta", "ese",
  "esa", "hay", "ser", "sobre", "entre", "tiene", "todos", "todo",
]);

// v3 boost values — stronger signals for precision, diversity penalty to avoid
// single-article domination in top-5
const BOOST = {
  chunkContenido: 0.15,
  chunkModificaciones: 0.08,
  chunkTextoAnterior: 0.03,
  directArticleMention: 0.35,     // v3: was 0.20 — significantly stronger for explicitly mentioned articles
  exactArticleNumber: 0.40,       // v3: NEW — query contains "Art. 240" and chunk IS Art. 240
  titleMatchPerWord: 0.05,        // v3: was 0.04
  titleMatchMax: 0.20,            // v3: was 0.12
  derogatedPenalty: -0.10,
  derogatedHistoryBoost: 0.15,
  vigenteBoost: 0.06,
  leyMatchBoost: 0.15,            // v3: was 0.12
  complexityBoost: 0.03,
  diversityPenalty: -0.12,        // v3: NEW — per-article repeat penalty in top-N
  paragraphoMatch: 0.12,          // Query "paragrafo 3" matches "Paragrafo 3" in chunk
  legalAnchorMatch: 0.10,         // Legal term match between query and chunk text
  articleTextMatch: 0.08,         // Chunk text confirms it's about the queried article
} as const;

// Extended law patterns for better matching
const LEY_PATTERNS = [
  /ley\s+(\d+)\s+de\s+(\d{4})/i,          // "Ley 2277 de 2022"
  /ley\s+(\d+)\/(\d{4})/i,                 // "Ley 2277/2022"
  /ley\s+(\d+)/i,                           // "Ley 2277"
  /reforma\s+tributaria\s+(?:de\s+)?(\d{4})/i, // "reforma tributaria 2022"
];

function extractLeyFromQuery(query: string): string | null {
  for (const pattern of LEY_PATTERNS) {
    const match = query.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export async function llmRerank(
  chunks: RerankedChunk[],
  query: string
): Promise<RerankedChunk[]> {
  if (chunks.length <= 2) return chunks;

  // Pairwise preference on top-3: ask LLM "which one best answers the query?"
  // Output is a single ID (~20 tokens), much cheaper and more reliable than
  // asking for a full ranking of 10 candidates (~200 tokens, format-prone errors).
  const top3 = chunks.slice(0, 3);
  const rest = chunks.slice(3);

  try {
    const { text } = await generateText({
      model: getRerankerModel(),
      maxOutputTokens: 50,
      system:
        "Eres un experto en derecho tributario colombiano. " +
        "De los siguientes 3 fragmentos del Estatuto Tributario, ¿cuál responde MEJOR la consulta del usuario? " +
        "Responde SOLAMENTE con el ID del fragmento ganador (ej: 'chunk_abc123'). Sin explicaciones.",
      prompt: `Consulta: ${query}\n\n${top3
        .map((c, i) => `[${i + 1}] ID: ${c.id}\n${c.metadata.id_articulo} - ${c.metadata.titulo}\n${c.metadata.text.slice(0, 400)}`)
        .join("\n\n")}`,
    });

    const winnerId = text.trim();
    const winnerIdx = top3.findIndex((c) => c.id === winnerId);

    if (winnerIdx > 0) {
      // Move winner to position 0, shift others down
      const winner = top3[winnerIdx];
      const reordered = [winner, ...top3.filter((_, i) => i !== winnerIdx)];
      return [...reordered, ...rest];
    }

    // Winner was already #1 or ID not recognized — return unchanged
    return chunks;
  } catch (error) {
    console.error("[reranker] llmRerank pairwise failed:", error);
    return chunks;
  }
}

export function heuristicRerank(
  chunks: ScoredChunk[],
  query: EnhancedQuery,
  maxResults: number = RAG_CONFIG.maxRerankedResults,
  queryType?: string
): RerankedChunk[] {
  const queryLower = query.original.toLowerCase();

  // Detect history-related queries with broader pattern matching
  const isHistoryQuery = /histor|evoluci[oó]n|anteri|derogad|cambio|modificac|reform|trayectoria/i.test(queryLower);

  // Detect if query mentions a specific law (expanded patterns)
  const queryLey = extractLeyFromQuery(queryLower);

  // v3: Extract exact article numbers from query for precision matching
  const exactArticlePattern = /Art(?:ículo|\.)\s*(\d+(?:-\d+)?)/gi;
  const queryArticleNumbers = new Set<string>();
  let artMatch;
  while ((artMatch = exactArticlePattern.exec(query.original)) !== null) {
    queryArticleNumbers.add(`Art. ${artMatch[1]}`);
  }

  const reranked: RerankedChunk[] = chunks.map((chunk) => {
    const meta = chunk.metadata;

    // === GROUP 1: Identity (exactArticle + directMention) — cap 0.40 ===
    let identityBoost = 0;
    if (queryArticleNumbers.has(meta.id_articulo)) {
      identityBoost += BOOST.exactArticleNumber;
    }
    for (const artId of query.detectedArticles) {
      if (meta.id_articulo === artId) {
        identityBoost += BOOST.directArticleMention;
        break;
      }
    }
    identityBoost = Math.min(identityBoost, 0.55);

    // === GROUP 2: Content relevance (titleMatch + legalAnchor + paragrapho + articleText) — cap 0.20 ===
    let contentBoost = 0;
    const titleWords = meta.titulo.toLowerCase().split(/\s+/);
    const queryWords = queryLower.split(/\s+/).filter((w) => !STOP_WORDS.has(w));
    const titleMatches = queryWords.filter((w) => titleWords.some((tw) => tw.includes(w)));
    if (titleMatches.length > 0) {
      contentBoost += Math.min(titleMatches.length * BOOST.titleMatchPerWord, BOOST.titleMatchMax);
    }

    const chunkTextLower = (meta.text || "").slice(0, 600).toLowerCase();
    for (const term of LEGAL_ANCHOR_TERMS) {
      if (queryLower.includes(term) && chunkTextLower.includes(term)) {
        contentBoost += BOOST.legalAnchorMatch;
        break;
      }
    }

    const paragraphoMatch = queryLower.match(/par[aá]grafo\s*(\d+)/i);
    if (paragraphoMatch) {
      const paraNum = paragraphoMatch[1];
      if (chunkTextLower.includes(`paragrafo ${paraNum}`) ||
          chunkTextLower.includes(`parágrafo ${paraNum}`) ||
          chunkTextLower.includes(`par\u00e1grafo ${paraNum}`)) {
        contentBoost += BOOST.paragraphoMatch;
      }
    }

    if (queryArticleNumbers.size > 0) {
      for (const artNum of queryArticleNumbers) {
        const numOnly = artNum.replace("Art. ", "");
        if (chunkTextLower.includes(`artículo ${numOnly}`) ||
            chunkTextLower.includes(`articulo ${numOnly}`) ||
            chunkTextLower.includes(`art. ${numOnly}`)) {
          contentBoost += BOOST.articleTextMatch;
          break;
        }
      }
    }
    contentBoost = Math.min(contentBoost, 0.25);

    // === GROUP 3: Chunk type (contenido/mods/anterior) — cap 0.15 ===
    let chunkTypeBoost = 0;
    if (meta.chunk_type === "contenido") chunkTypeBoost += BOOST.chunkContenido;
    else if (meta.chunk_type === "modificaciones") chunkTypeBoost += BOOST.chunkModificaciones;
    else if (meta.chunk_type === "texto_anterior") chunkTypeBoost += BOOST.chunkTextoAnterior;
    chunkTypeBoost = Math.min(chunkTypeBoost, 0.15);

    // === GROUP 4: Vigencia (vigente + derogado + leyMatch + history) — cap 0.15 ===
    let vigenciaBoost = 0;
    if (meta.chunk_type === "texto_anterior" && !isHistoryQuery) {
      vigenciaBoost += BOOST.derogatedPenalty;
    }
    if (isHistoryQuery && meta.chunk_type === "texto_anterior") {
      vigenciaBoost += BOOST.derogatedHistoryBoost;
    }
    if (!isHistoryQuery && meta.estado === "vigente") {
      vigenciaBoost += BOOST.vigenteBoost;
    }
    if (queryLey && meta.leyes_modificatorias) {
      const hasLey = meta.leyes_modificatorias.some(
        (l) => l.includes(`Ley ${queryLey}`)
      );
      if (hasLey) {
        vigenciaBoost += BOOST.leyMatchBoost;
      }
    }
    // Allow negative values (derogatedPenalty) but cap positive side
    vigenciaBoost = Math.min(vigenciaBoost, 0.15);

    // === GROUP 5: Structural (pagerank + complexity) — cap 0.08 ===
    let structuralBoost = 0;
    if (meta.complexity_score && meta.complexity_score >= 5) {
      structuralBoost += BOOST.complexityBoost;
    }
    if (meta.pagerank && meta.pagerank > 0.01) {
      structuralBoost += 0.08;
    }
    structuralBoost = Math.min(structuralBoost, 0.08);

    // Grouped caps prevent runaway boosts (max total ~1.18 vs old uncapped ~1.42)
    // but we keep the original multiplicative+additive formula so high-scoring
    // chunks still get amplified proportionally to their embedding quality.
    const totalCappedBoost = identityBoost + contentBoost + chunkTypeBoost + vigenciaBoost + structuralBoost;
    const multiplier = 1 + (totalCappedBoost > 0 ? totalCappedBoost * 0.3 : 0);
    const rerankedScore = chunk.score * multiplier + totalCappedBoost * 0.7;

    return {
      ...chunk,
      rerankedScore,
    };
  });

  // Sort by reranked score
  reranked.sort((a, b) => b.rerankedScore - a.rerankedScore);

  // v3.3: Quota-based merging for decomposed sub-queries
  // When a query was decomposed into sub-queries, guarantee each sub-query gets
  // a fair share of slots in the final result via round-robin quota allocation.
  const hasSubQueries = reranked.some((c) => c.subQueryIndex !== undefined);
  if (hasSubQueries) {
    // Group chunks by sub-query origin (undefined = main query)
    const subQueryGroups = new Map<number | undefined, RerankedChunk[]>();
    for (const chunk of reranked) {
      const key = chunk.subQueryIndex;
      if (!subQueryGroups.has(key)) subQueryGroups.set(key, []);
      subQueryGroups.get(key)!.push(chunk);
    }

    const numGroups = subQueryGroups.size;
    if (numGroups >= 2) {
      const quotaMerged: RerankedChunk[] = [];
      const seenIds = new Set<string>();

      // Sort groups: main query first (undefined), then sub-queries by index
      const sortedKeys = Array.from(subQueryGroups.keys()).sort((a, b) => {
        if (a === undefined) return -1;
        if (b === undefined) return 1;
        return a - b;
      });

      // Round-robin: take one chunk from each group in rotation until maxResults
      const groupPointers = new Map<number | undefined, number>();
      for (const key of sortedKeys) groupPointers.set(key, 0);

      let filled = true;
      while (quotaMerged.length < maxResults && filled) {
        filled = false;
        for (const key of sortedKeys) {
          if (quotaMerged.length >= maxResults) break;
          const group = subQueryGroups.get(key)!;
          let ptr = groupPointers.get(key)!;
          // Skip already-seen chunks (dedup across groups)
          while (ptr < group.length && seenIds.has(group[ptr].id)) ptr++;
          if (ptr < group.length) {
            quotaMerged.push(group[ptr]);
            seenIds.add(group[ptr].id);
            groupPointers.set(key, ptr + 1);
            filled = true;
          }
        }
      }

      // Fill remaining slots with highest-scored unused chunks
      if (quotaMerged.length < maxResults) {
        for (const chunk of reranked) {
          if (quotaMerged.length >= maxResults) break;
          if (!seenIds.has(chunk.id)) {
            quotaMerged.push(chunk);
            seenIds.add(chunk.id);
          }
        }
      }

      return quotaMerged.slice(0, maxResults);
    }
  }

  // v3: Comparative round-robin — interleave chunks from different articles
  // to ensure diversity in top-N for side-by-side comparisons
  const isComparative = queryType === "comparative" || isHistoryQuery;

  if (isComparative && reranked.length > 3) {
    // Group chunks by article, preserving score order within each group
    const articleGroups = new Map<string, RerankedChunk[]>();
    for (const chunk of reranked) {
      const artId = chunk.metadata.id_articulo;
      if (!articleGroups.has(artId)) articleGroups.set(artId, []);
      articleGroups.get(artId)!.push(chunk);
    }

    // Sort groups by max score (best article first)
    const sortedGroups = Array.from(articleGroups.values())
      .sort((a, b) => b[0].rerankedScore - a[0].rerankedScore);

    // Round-robin: take one chunk from each article group in rotation
    const roundRobin: RerankedChunk[] = [];
    let groupIdx = 0;
    const groupPointers = new Array(sortedGroups.length).fill(0);
    while (roundRobin.length < reranked.length) {
      let found = false;
      for (let i = 0; i < sortedGroups.length; i++) {
        const gIdx = (groupIdx + i) % sortedGroups.length;
        const group = sortedGroups[gIdx];
        if (groupPointers[gIdx] < group.length) {
          roundRobin.push(group[groupPointers[gIdx]]);
          groupPointers[gIdx]++;
          found = true;
        }
      }
      if (!found) break;
      groupIdx = (groupIdx + 1) % sortedGroups.length;
    }

    // Coverage guarantee: ensure at least 2 distinct articles in top results
    const resultArticles = new Set(roundRobin.slice(0, maxResults).map(c => c.metadata.id_articulo));
    if (resultArticles.size < 2 && sortedGroups.length >= 2) {
      // Force second article's best chunk into position 1 (after first article's best)
      const secondGroupBest = sortedGroups[1][0];
      const alreadyIncluded = roundRobin.slice(0, maxResults).some(c => c.id === secondGroupBest.id);
      if (!alreadyIncluded) {
        roundRobin.splice(1, 0, secondGroupBest);
      }
    }

    return roundRobin.slice(0, maxResults);
  }

  // Non-comparative: standard diversity penalty
  const articleCounts = new Map<string, number>();
  for (const chunk of reranked) {
    const artId = chunk.metadata.id_articulo;
    const count = articleCounts.get(artId) || 0;
    if (count > 0) {
      // Penalize repeat appearances of the same article
      chunk.rerankedScore += BOOST.diversityPenalty * count;
    }
    articleCounts.set(artId, count + 1);
  }

  // Re-sort after diversity penalty
  reranked.sort((a, b) => b.rerankedScore - a.rerankedScore);

  // Adaptive filtering: remove chunks significantly below the distribution
  if (reranked.length > 2) {
    const scores = reranked.map((r) => r.rerankedScore);
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
    const std = Math.sqrt(
      scores.reduce((a, b) => a + (b - mean) ** 2, 0) / scores.length
    );
    const minScore = mean - std;
    const filtered = reranked.filter((r) => r.rerankedScore >= minScore);
    return filtered.slice(0, maxResults);
  }

  return reranked.slice(0, maxResults);
}

/**
 * Rerank multi-source chunks (doctrina, jurisprudencia, decretos, resoluciones)
 * using graph boost signals and source-type heuristics.
 */
export function heuristicRerankMultiSource(
  chunks: ScoredMultiSourceChunk[],
  query: EnhancedQuery,
  maxResults: number = 8,
  retrievedArticleSlugs?: string[]
): RerankedMultiSourceChunk[] {
  const currentYear = new Date().getFullYear();

  const reranked: RerankedMultiSourceChunk[] = chunks.map((chunk) => {
    let boost = 0;
    const meta = chunk.metadata;

    // Graph-based boosts
    if (meta.pagerank && meta.pagerank > 0.01) {
      boost += MULTI_SOURCE_BOOST.pagerankHigh;
    }

    // Doctrina boosts
    if (meta.doc_type === "doctrina") {
      if (meta.vigente) {
        boost += MULTI_SOURCE_BOOST.doctrinaVigente;
      } else {
        boost += MULTI_SOURCE_BOOST.doctrinaRevocada;
      }
    }

    // Jurisprudencia boosts
    if (meta.doc_type === "sentencia") {
      const tipo = meta.tipo?.toUpperCase();
      if (tipo === "SU") {
        boost += MULTI_SOURCE_BOOST.sentenciaUnificacion;
      } else if (tipo === "C") {
        boost += MULTI_SOURCE_BOOST.sentenciaC;
      }

      // Penalize old sentencias (> 10 years)
      if (meta.fecha) {
        const sentYear = parseInt(meta.fecha.slice(0, 4), 10);
        if (currentYear - sentYear > 10) {
          boost += MULTI_SOURCE_BOOST.sentenciaAntigua;
        }
      }
    }

    // Decreto boosts (recent decrees preferred)
    if (meta.doc_type === "decreto" && meta.decreto_year) {
      if (currentYear - meta.decreto_year < 3) {
        boost += MULTI_SOURCE_BOOST.decretoReciente;
      }
    }

    // Boost if chunk references articles detected in query
    if (query.detectedArticles.length > 0 && meta.articulos_slugs) {
      const overlap = query.detectedArticles.filter((art) => {
        const slug = art.replace(/^Art\.\s*/, "");
        return meta.articulos_slugs.includes(slug);
      });
      if (overlap.length > 0) {
        boost += 0.15;
      }
    }

    // Multi-hop boost: boost external sources that cite articles discovered during retrieval
    // (not just query-detected articles). These are precision-targeted by the multi-hop filter.
    if (retrievedArticleSlugs && retrievedArticleSlugs.length > 0 && meta.articulos_slugs) {
      const hopOverlap = retrievedArticleSlugs.filter((slug) =>
        meta.articulos_slugs.includes(slug)
      );
      if (hopOverlap.length > 0) {
        // +0.12 base, +0.03 per additional overlapping article (cap at +0.21)
        boost += Math.min(0.21, 0.12 + (hopOverlap.length - 1) * 0.03);
      }
    }

    // Same-community boost: prefer external sources in the same graph community
    // as the query's detected articles (shared thematic cluster)
    if (meta.community_id != null && query.detectedArticles.length > 0) {
      boost += MULTI_SOURCE_BOOST.sameCommunity;
    }

    return {
      ...chunk,
      rerankedScore: chunk.score + boost,
    };
  });

  return reranked
    .sort((a, b) => b.rerankedScore - a.rerankedScore)
    .slice(0, maxResults);
}
