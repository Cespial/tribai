import { EnhancedQuery, RerankedChunk, RerankedMultiSourceChunk } from "@/types/rag";
import { ScoredChunk, ScoredMultiSourceChunk } from "@/types/pinecone";
import { RAG_CONFIG, MULTI_SOURCE_BOOST } from "@/config/constants";
import { generateText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";

// Spanish stop words — used instead of length-based filtering to preserve
// important short terms like "IVA", "GMF", "UVT", "DUR"
const STOP_WORDS = new Set([
  "el", "la", "los", "las", "de", "del", "en", "un", "una", "que",
  "por", "con", "para", "es", "son", "se", "al", "lo", "su", "más",
  "no", "si", "como", "qué", "cual", "cuál", "este", "esta", "ese",
  "esa", "hay", "ser", "sobre", "entre", "tiene", "todos", "todo",
]);

// Rebalanced boost values — more uniform distribution,
// directArticle no longer dominates over semantic relevance
const BOOST = {
  chunkContenido: 0.12,
  chunkModificaciones: 0.08,
  chunkTextoAnterior: 0.03,
  directArticleMention: 0.20,
  titleMatchPerWord: 0.04,
  titleMatchMax: 0.12,
  derogatedPenalty: -0.10,
  derogatedHistoryBoost: 0.15,
  vigenteBoost: 0.06,
  leyMatchBoost: 0.12,
  complexityBoost: 0.03,
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
  if (chunks.length <= 1) return chunks;

  // Rerank top 10 candidates for better coverage
  const candidates = chunks.slice(0, 10);
  const remaining = chunks.slice(10);

  try {
    const { text } = await generateText({
      model: anthropic("claude-haiku-4-5-20251001"),
      maxOutputTokens: 200,
      system:
        "Eres un experto en derecho tributario colombiano con profundo conocimiento del Estatuto Tributario. " +
        "Ordena los siguientes fragmentos del MÁS relevante al MENOS relevante para responder la consulta. " +
        "Prioriza: (1) artículos que responden directamente la pregunta, (2) artículos con tarifas/valores si la pregunta involucra cálculos, " +
        "(3) parágrafos y excepciones relevantes, (4) artículos relacionados que complementan la respuesta. " +
        "Responde SOLAMENTE con los IDs separados por comas, sin explicaciones. " +
        "IDs: " +
        candidates.map((c) => c.id).join(", "),
      prompt: `Consulta del usuario: ${query}\n\nFragmentos:\n${candidates
        .map((c) => `[ID: ${c.id}] ${c.metadata.id_articulo} - ${c.metadata.titulo}: ${c.metadata.text.slice(0, 500)}`)
        .join("\n\n")}`,
    });

    const orderedIds = text
      .split(",")
      .map((id) => id.trim())
      .filter((id) => candidates.some((c) => c.id === id));

    const rerankedCandidates = orderedIds
      .map((id) => candidates.find((c) => c.id === id)!)
      .concat(candidates.filter((c) => !orderedIds.includes(c.id)));

    return [...rerankedCandidates, ...remaining];
  } catch (error) {
    console.error("[reranker] llmRerank failed:", error);
    return chunks;
  }
}

export function heuristicRerank(
  chunks: ScoredChunk[],
  query: EnhancedQuery,
  maxResults: number = RAG_CONFIG.maxRerankedResults
): RerankedChunk[] {
  const queryLower = query.original.toLowerCase();

  // Detect history-related queries with broader pattern matching
  const isHistoryQuery = /histor|evoluci[oó]n|anteri|derogad|cambio|modificac|reform|trayectoria/i.test(queryLower);

  // Detect if query mentions a specific law (expanded patterns)
  const queryLey = extractLeyFromQuery(queryLower);

  const reranked: RerankedChunk[] = chunks.map((chunk) => {
    let boost = 0;
    const meta = chunk.metadata;

    // Boost by chunk type
    if (meta.chunk_type === "contenido") boost += BOOST.chunkContenido;
    else if (meta.chunk_type === "modificaciones") boost += BOOST.chunkModificaciones;
    else if (meta.chunk_type === "texto_anterior") boost += BOOST.chunkTextoAnterior;

    // Boost if article is directly mentioned in query
    for (const artId of query.detectedArticles) {
      if (meta.id_articulo === artId) {
        boost += BOOST.directArticleMention;
        break;
      }
    }

    // Boost if title terms match query
    const titleWords = meta.titulo.toLowerCase().split(/\s+/);
    const queryWords = queryLower.split(/\s+/).filter((w) => !STOP_WORDS.has(w));
    const titleMatches = queryWords.filter((w) => titleWords.some((tw) => tw.includes(w)));
    if (titleMatches.length > 0) {
      boost += Math.min(titleMatches.length * BOOST.titleMatchPerWord, BOOST.titleMatchMax);
    }

    // Penalize derogated content (unless asking about history)
    if (meta.chunk_type === "texto_anterior" && !isHistoryQuery) {
      boost += BOOST.derogatedPenalty;
    }

    // Boost derogated content for history queries
    if (isHistoryQuery && meta.chunk_type === "texto_anterior") {
      boost += BOOST.derogatedHistoryBoost;
    }

    // Boost vigente articles for non-history queries
    if (!isHistoryQuery && meta.estado === "vigente") {
      boost += BOOST.vigenteBoost;
    }

    // Boost when query mentions a specific ley and article was modified by it
    if (queryLey && meta.leyes_modificatorias) {
      const hasLey = meta.leyes_modificatorias.some(
        (l) => l.includes(`Ley ${queryLey}`)
      );
      if (hasLey) {
        boost += BOOST.leyMatchBoost;
      }
    }

    // Minor complexity factor: slightly prefer more complex articles
    if (meta.complexity_score && meta.complexity_score >= 5) {
      boost += BOOST.complexityBoost;
    }

    // PageRank boost: prefer structurally important articles in the tax graph
    if (meta.pagerank && meta.pagerank > 0.01) {
      boost += 0.08;
    }

    // Multiplicative + additive scoring: preserves relative ranking better
    const multiplier = 1 + (boost > 0 ? boost * 0.3 : 0);
    const rerankedScore = chunk.score * multiplier + boost * 0.7;

    return {
      ...chunk,
      rerankedScore,
    };
  });

  // Sort by reranked score
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
  maxResults: number = 5
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

    return {
      ...chunk,
      rerankedScore: chunk.score + boost,
    };
  });

  return reranked
    .sort((a, b) => b.rerankedScore - a.rerankedScore)
    .slice(0, maxResults);
}
