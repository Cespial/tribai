import { getIndex } from "@/lib/pinecone/client";
import { RerankedChunk, RerankedMultiSourceChunk, ArticleGroup, ExternalSourceGroup, AssembledContext, SourceCitation } from "@/types/rag";
import { ChunkMetadata } from "@/types/pinecone";
import { estimateTokens } from "@/lib/utils/article-parser";
import { RAG_CONFIG } from "@/config/constants";
import { getRelatedContext, normalizeGraphId } from "./graph-retriever";

export async function assembleContext(
  chunks: RerankedChunk[],
  options: {
    useSiblingRetrieval?: boolean;
    maxTokens?: number;
    multiSourceChunks?: RerankedMultiSourceChunk[];
  } = {}
): Promise<AssembledContext> {
  const {
    useSiblingRetrieval = RAG_CONFIG.useSiblingRetrieval,
    maxTokens = RAG_CONFIG.maxContextTokens,
    multiSourceChunks = [],
  } = options;

  let allChunks = [...chunks];

  // Sibling retrieval: fetch all chunks of the same article if it was split
  if (useSiblingRetrieval) {
    allChunks = await fetchSiblingChunks(allChunks);
  }

  // Dedup by composite key
  const deduped = dedup(allChunks);

  // Group by article
  const groups = groupByArticle(deduped);

  // Sort groups by max score
  groups.sort((a, b) => b.maxScore - a.maxScore);

  // Proportional external budget: scales with number of external sources
  // Min 25% when any external sources exist, up to 45% with many sources
  let externalRatio = 0;
  if (multiSourceChunks && multiSourceChunks.length > 0) {
    externalRatio = Math.max(0.25, Math.min(0.45, 0.15 + multiSourceChunks.length * 0.04));
  }
  const externalBudget = Math.floor(maxTokens * externalRatio);
  const articleBudget = maxTokens - externalBudget;

  // Apply token budget for articles
  const { articles, totalTokens: articleTokens } = applyTokenBudget(groups, articleBudget);

  // Group and format external sources
  const externalSources = groupExternalSources(multiSourceChunks);
  const { sources: selectedExternal, totalTokens: externalTokens } =
    applyExternalTokenBudget(externalSources, externalBudget);

  // Build source citations for articles
  const articleCitations: SourceCitation[] = articles.map((g) => ({
    idArticulo: g.idArticulo,
    titulo: g.titulo,
    url: g.urlOrigen,
    categoriaLibro: g.categoriaLibro,
    relevanceScore: g.maxScore,
    estado: g.estado,
    totalModificaciones: g.totalModificaciones,
    slug: g.slug,
  }));

  // Build source citations for external sources
  const externalCitations: SourceCitation[] = selectedExternal.map((g) => ({
    idArticulo: g.docId,
    titulo: `${g.docType}: ${g.numero}`,
    url: g.fuenteUrl,
    categoriaLibro: g.namespace,
    relevanceScore: g.maxScore,
    docType: g.docType,
    namespace: g.namespace,
  }));

  return {
    articles,
    externalSources: selectedExternal,
    sources: [...articleCitations, ...externalCitations],
    totalTokensEstimate: articleTokens + externalTokens,
  };
}

async function fetchSiblingChunks(
  chunks: RerankedChunk[]
): Promise<RerankedChunk[]> {
  const MAX_SIBLINGS_PER_ARTICLE = 2;
  const index = getIndex();

  // Find articles that have multiple chunks (total_chunks > 1)
  const articlesToExpand: string[] = [];
  const existingIds = new Set(chunks.map((c) => c.id));

  for (const chunk of chunks) {
    if (chunk.metadata.total_chunks > 1 && !articlesToExpand.includes(chunk.metadata.id_articulo)) {
      articlesToExpand.push(chunk.metadata.id_articulo);
    }
  }

  if (articlesToExpand.length === 0) return [...chunks];

  // Batch sibling retrieval: single query with $in filter instead of N individual queries
  const bestChunk = chunks.sort((a, b) => b.rerankedScore - a.rerankedScore)[0];
  let allMatches: Array<{ id: string; score?: number; metadata?: Record<string, unknown> }> = [];

  try {
    const result = await index.query({
      id: bestChunk.id,
      topK: articlesToExpand.length * 6, // ~6 chunks per article max
      includeMetadata: true,
      filter: { id_articulo: { $in: articlesToExpand } },
    });
    allMatches = result.matches || [];
  } catch (error) {
    console.warn("[sibling-retrieval] Batch query failed, falling back to individual queries:", error);
    // Fallback: individual queries (only if batch fails)
    const siblingPromises = articlesToExpand.map(async (artId) => {
      try {
        const artBestChunk = chunks
          .filter(c => c.metadata.id_articulo === artId)
          .sort((a, b) => b.rerankedScore - a.rerankedScore)[0];
        const result = await index.query({
          id: artBestChunk.id,
          topK: 8,
          includeMetadata: true,
          filter: { id_articulo: { $eq: artId } },
        });
        return result.matches || [];
      } catch {
        return [];
      }
    });
    const results = await Promise.all(siblingPromises);
    allMatches = results.flat();
  }

  // Find the max score for each article from the original chunks
  const articleScores = new Map<string, number>();
  for (const chunk of chunks) {
    const current = articleScores.get(chunk.metadata.id_articulo) ?? 0;
    articleScores.set(
      chunk.metadata.id_articulo,
      Math.max(current, chunk.rerankedScore)
    );
  }

  // Build result as a NEW array (don't mutate input)
  const result: RerankedChunk[] = [...chunks];
  const siblingsAdded = new Map<string, number>();

  // Sort all matches: prioritize contenido chunks, then by chunk_index
  const sorted = [...allMatches].sort((a, b) => {
    const aMeta = a.metadata as unknown as ChunkMetadata;
    const bMeta = b.metadata as unknown as ChunkMetadata;
    // Prioritize contenido chunks over others
    const typeOrder: Record<string, number> = { contenido: 0, modificaciones: 1, texto_anterior: 2 };
    const aType = typeOrder[aMeta?.chunk_type] ?? 3;
    const bType = typeOrder[bMeta?.chunk_type] ?? 3;
    if (aType !== bType) return aType - bType;
    return (aMeta?.chunk_index ?? 0) - (bMeta?.chunk_index ?? 0);
  });

  for (const match of sorted) {
    if (!existingIds.has(match.id) && match.metadata) {
      const meta = match.metadata as unknown as ChunkMetadata;
      const artId = meta.id_articulo;
      const added = siblingsAdded.get(artId) ?? 0;

      if (added >= MAX_SIBLINGS_PER_ARTICLE) continue;

      const artScore = articleScores.get(artId) ?? 0;

      result.push({
        id: match.id,
        score: match.score ?? 0,
        metadata: meta,
        rerankedScore: artScore * 0.9,
      });
      existingIds.add(match.id);
      siblingsAdded.set(artId, added + 1);
    }
  }

  return result;
}

function dedup(chunks: RerankedChunk[]): RerankedChunk[] {
  const seen = new Map<string, RerankedChunk>();

  for (const chunk of chunks) {
    const key = `${chunk.metadata.id_articulo}::${chunk.metadata.chunk_type}::${chunk.metadata.chunk_index}`;
    const existing = seen.get(key);

    if (!existing || chunk.rerankedScore > existing.rerankedScore) {
      seen.set(key, chunk);
    }
  }

  return Array.from(seen.values());
}

function groupByArticle(chunks: RerankedChunk[]): ArticleGroup[] {
  const groups = new Map<string, ArticleGroup>();

  for (const chunk of chunks) {
    const artId = chunk.metadata.id_articulo;
    let group = groups.get(artId);

    if (!group) {
      group = {
        idArticulo: artId,
        titulo: chunk.metadata.titulo,
        categoriaLibro: chunk.metadata.categoria_libro,
        categoriaTitulo: chunk.metadata.categoria_titulo,
        urlOrigen: chunk.metadata.url_origen,
        contenido: [],
        modificaciones: [],
        textoAnterior: [],
        maxScore: 0,
        // Enriched fields from v2 metadata
        estado: chunk.metadata.estado,
        totalModificaciones: chunk.metadata.total_modificaciones,
        slug: chunk.metadata.slug,
        concordancias: chunk.metadata.concordancias,
      };
      groups.set(artId, group);
    }

    group.maxScore = Math.max(group.maxScore, chunk.rerankedScore);

    const text = chunk.metadata.text;
    switch (chunk.metadata.chunk_type) {
      case "contenido":
        group.contenido.push(text);
        break;
      case "modificaciones":
        group.modificaciones.push(text);
        break;
      case "texto_anterior":
        group.textoAnterior.push(text);
        break;
    }
  }

  return Array.from(groups.values());
}

function applyTokenBudget(
  groups: ArticleGroup[],
  maxTokens: number
): { articles: ArticleGroup[]; totalTokens: number } {
  const selected: ArticleGroup[] = [];
  let totalTokens = 0;

  for (const group of groups) {
    const articleText = formatArticleForContext(group);
    const tokens = estimateTokens(articleText);

    if (totalTokens + tokens <= maxTokens) {
      selected.push(group);
      totalTokens += tokens;
    } else if (selected.length > 0) {
      // Bin-packing: try to fit a minimal version (content only, no modifications/history)
      const minimalGroup: ArticleGroup = {
        ...group,
        modificaciones: [],
        textoAnterior: [],
      };
      const minimalText = formatArticleForContext(minimalGroup);
      const minTokens = estimateTokens(minimalText);

      if (totalTokens + minTokens <= maxTokens) {
        selected.push(minimalGroup);
        totalTokens += minTokens;
      } else {
        // 3rd fallback: truncate contenido to fit within remaining budget
        const remainingBudget = maxTokens - totalTokens;
        if (remainingBudget > 200) {
          const truncatedContenido = group.contenido.map(c => c).join("\n\n");
          // Estimate chars per token (~3.5 for Spanish legal text)
          const maxChars = Math.floor(remainingBudget * 3.5);
          const truncated = truncatedContenido.slice(0, maxChars);
          if (truncated.length > 100) {
            const truncatedGroup: ArticleGroup = {
              ...group,
              contenido: [truncated + "\n[...texto truncado...]"],
              modificaciones: [],
              textoAnterior: [],
            };
            const truncTokens = estimateTokens(formatArticleForContext(truncatedGroup));
            if (totalTokens + truncTokens <= maxTokens) {
              selected.push(truncatedGroup);
              totalTokens += truncTokens;
            }
          }
        }
      }
      // If even truncated doesn't fit, skip and try next (don't break — smaller articles might fit)
    } else {
      // First article always included even if it overflows
      selected.push(group);
      totalTokens += tokens;
    }
  }

  // "Lost in the middle" mitigation: most relevant at start AND end
  if (selected.length >= 3) {
    // Re-sort by score descending to pick best positions
    const sorted = [...selected].sort((a, b) => b.maxScore - a.maxScore);
    const first = sorted[0];   // Best → start
    const second = sorted[1];  // Second best → end
    const middle = sorted.slice(2); // Rest → middle, sorted ascending (least relevant center)
    middle.sort((a, b) => a.maxScore - b.maxScore);
    return { articles: [first, ...middle, second], totalTokens };
  }

  return { articles: selected, totalTokens };
}

export function formatArticleForContext(group: ArticleGroup): string {
  const parts: string[] = [];

  parts.push(`## ${group.titulo}`);
  parts.push(`Categoría: ${group.categoriaLibro} > ${group.categoriaTitulo}`);
  parts.push(`URL: ${group.urlOrigen}`);
  if (group.estado) {
    parts.push(`Estado: ${group.estado}`);
  }
  parts.push("");

  // GRAPH ENRICHMENT: Add structural connections
  try {
    const graphId = normalizeGraphId(group.idArticulo);
    const connections = getRelatedContext([graphId]);
    
    if (connections.length > 0) {
      parts.push("### Conexiones Normativas (Grafo)");
      const lines = connections.map(c => {
        let verb = c.relation;
        if (c.relation === "MODIFIES") verb = "Modificado por";
        if (c.relation === "REGULATES") verb = "Reglamentado por";
        if (c.relation === "INVERSE_MODIFIES") verb = "Modificado por"; 
        
        // Clean up related ID for readability (e.g., "ley-2277-2022" -> "Ley 2277 de 2022")
        let relatedDisplay = c.relatedId;
        if (c.relatedId.startsWith("ley-")) {
            const segments = c.relatedId.split("-");
            if (segments.length >= 3) relatedDisplay = `Ley ${segments[1]} de ${segments[2]}`;
        } else if (c.relatedId.startsWith("dur-")) {
            relatedDisplay = `Decreto Único Reglamentario (DUR) ${c.relatedId.replace("dur-", "")}`;
        }

        return `- **${verb}**: ${relatedDisplay}`;
      });
      // Unique connections only
      const uniqueLines = Array.from(new Set(lines));
      parts.push(uniqueLines.join("\n"));
      parts.push("");
    }
  } catch {
    // Fail silently if graph not loaded or ID format mismatch
  }

  // Include concordancias if available
  if (group.concordancias) {
    parts.push(`Concordancias: ${group.concordancias}`);
    parts.push("");
  }

  if (group.contenido.length > 0) {
    parts.push("### Contenido vigente");
    parts.push(group.contenido.join("\n\n"));
    parts.push("");
  }

  if (group.modificaciones.length > 0) {
    parts.push("### Modificaciones");
    parts.push(group.modificaciones.join("\n\n"));
    parts.push("");
  }

  if (group.textoAnterior.length > 0) {
    parts.push("### Texto anterior (derogado)");
    parts.push(group.textoAnterior.join("\n\n"));
    parts.push("");
  }

  return parts.join("\n");
}

function groupExternalSources(
  chunks: RerankedMultiSourceChunk[]
): ExternalSourceGroup[] {
  const groups = new Map<string, ExternalSourceGroup>();

  for (const chunk of chunks) {
    const docId = chunk.metadata.doc_id;
    let group = groups.get(docId);

    if (!group) {
      group = {
        docId,
        docType: chunk.metadata.doc_type as ExternalSourceGroup["docType"],
        numero: chunk.metadata.numero,
        fecha: chunk.metadata.fecha,
        tema: chunk.metadata.tema,
        texto: [],
        articulosET: chunk.metadata.articulos_et || [],
        maxScore: 0,
        vigente: chunk.metadata.vigente,
        fuenteUrl: chunk.metadata.fuente_url,
        namespace: chunk.namespace,
        corte: chunk.metadata.corte,
        tipoSentencia: chunk.metadata.tipo,
        decision: chunk.metadata.decision,
        decretoNumero: chunk.metadata.decreto_numero,
        articuloNumero: chunk.metadata.articulo_numero,
      };
      groups.set(docId, group);
    }

    group.maxScore = Math.max(group.maxScore, chunk.rerankedScore);
    group.texto.push(chunk.metadata.text);
  }

  return Array.from(groups.values()).sort((a, b) => b.maxScore - a.maxScore);
}

function applyExternalTokenBudget(
  groups: ExternalSourceGroup[],
  maxTokens: number
): { sources: ExternalSourceGroup[]; totalTokens: number } {
  const selected: ExternalSourceGroup[] = [];
  let totalTokens = 0;

  // Namespace-diversity round-robin: ensure each namespace gets at least one source
  // before filling the rest by score order. This prevents one namespace from
  // hogging the budget and causing Ext Src Ctx regressions.
  const byNamespace = new Map<string, ExternalSourceGroup[]>();
  for (const group of groups) {
    const ns = group.namespace;
    if (!byNamespace.has(ns)) byNamespace.set(ns, []);
    byNamespace.get(ns)!.push(group);
  }

  // Phase 1: Take the best source from each namespace (round-robin by score)
  const namespacesRanked = Array.from(byNamespace.entries())
    .sort((a, b) => b[1][0].maxScore - a[1][0].maxScore);

  const usedIds = new Set<string>();
  for (const [, nsGroups] of namespacesRanked) {
    const best = nsGroups[0];
    const text = formatExternalSourceForContext(best);
    const tokens = estimateTokens(text);
    if (totalTokens + tokens <= maxTokens || selected.length === 0) {
      selected.push(best);
      usedIds.add(best.docId);
      totalTokens += tokens;
    }
  }

  // Phase 2: Fill remaining budget with highest-scored sources across all namespaces
  for (const group of groups) {
    if (usedIds.has(group.docId)) continue;
    const text = formatExternalSourceForContext(group);
    const tokens = estimateTokens(text);
    if (totalTokens + tokens > maxTokens) continue; // skip oversized, try next
    selected.push(group);
    usedIds.add(group.docId);
    totalTokens += tokens;
  }

  // Re-sort by score descending for consistent context ordering
  selected.sort((a, b) => b.maxScore - a.maxScore);

  return { sources: selected, totalTokens };
}

export function formatExternalSourceForContext(
  group: ExternalSourceGroup
): string {
  const parts: string[] = [];

  switch (group.docType) {
    case "doctrina":
      parts.push(
        `<doctrina tipo="${group.docType}" numero="${group.numero}" fecha="${group.fecha || ""}" vigente="${group.vigente}">`
      );
      if (group.tema) parts.push(`Tema: ${group.tema}`);
      parts.push(group.texto.join("\n\n"));
      parts.push("</doctrina>");
      break;

    case "sentencia":
      parts.push(
        `<jurisprudencia tipo="${group.tipoSentencia || ""}" numero="${group.numero}" year="${group.fecha?.slice(0, 4) || ""}" decision="${group.decision || ""}">`
      );
      if (group.tema) parts.push(`Tema: ${group.tema}`);
      parts.push(group.texto.join("\n\n"));
      parts.push("</jurisprudencia>");
      break;

    case "decreto":
      parts.push(
        `<decreto numero="${group.decretoNumero || ""}" articulo="${group.articuloNumero || ""}" vigente="${group.vigente}">`
      );
      parts.push(group.texto.join("\n\n"));
      parts.push("</decreto>");
      break;

    case "resolucion":
      parts.push(
        `<resolucion numero="${group.numero}" fecha="${group.fecha || ""}" vigente="${group.vigente}">`
      );
      if (group.tema) parts.push(`Tema: ${group.tema}`);
      parts.push(group.texto.join("\n\n"));
      parts.push("</resolucion>");
      break;

    default:
      parts.push(group.texto.join("\n\n"));
  }

  return parts.join("\n");
}

export function buildContextString(context: AssembledContext): string {
  const articleParts = context.articles
    .map(formatArticleForContext)
    .join("\n---\n\n");

  if (!context.externalSources || context.externalSources.length === 0) {
    return articleParts;
  }

  const externalParts = context.externalSources
    .map(formatExternalSourceForContext)
    .join("\n\n");

  return `${articleParts}\n\n--- Fuentes Externas ---\n\n${externalParts}`;
}
