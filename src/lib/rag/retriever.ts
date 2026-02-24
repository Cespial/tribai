import { getIndex, withRetry } from "@/lib/pinecone/client";
import { embedQueries } from "@/lib/pinecone/embedder";
import { EnhancedQuery, RetrievalResult, PineconeNamespace } from "@/types/rag";
import { ScoredChunk, ChunkMetadata, ScoredMultiSourceChunk, MultiSourceChunkMetadata } from "@/types/pinecone";
import { RAG_CONFIG } from "@/config/constants";
import { ChatPageContext } from "@/types/chat-history";
import { prioritizeNamespaces, classifyQueryType, getQueryRoutingConfig } from "./namespace-router";

interface RetrieveOptions {
  topK?: number;
  similarityThreshold?: number;
  libroFilter?: string;
  pageContext?: ChatPageContext;
}

export async function retrieve(
  query: EnhancedQuery,
  options: RetrieveOptions = {}
): Promise<RetrievalResult> {
  const {
    similarityThreshold = RAG_CONFIG.similarityThreshold,
  } = options;

  // Classify query type and get routing config
  const queryType = classifyQueryType(query.original);
  const routingConfig = getQueryRoutingConfig(queryType);

  const topK = determineTopK(query, options.topK, routingConfig.topK);
  const filter = buildFilter(query, options.libroFilter, options.pageContext);

  // Build all query texts for parallel embedding — filter empty/duplicate
  const queryTexts: string[] = [
    query.original,
    query.rewritten !== query.original ? query.rewritten : "",
    query.hyde ?? "",
    ...(query.subQueries ?? []),
  ]
    .filter(Boolean)
    .filter((t) => t.trim().length > 5)
    .filter((t, i, arr) => arr.indexOf(t) === i); // dedup

  // Embed all queries in parallel
  const embeddings = await embedQueries(queryTexts);

  // Query Pinecone default namespace with each embedding in parallel
  const index = getIndex();
  const queryPromises = embeddings.map((vector) =>
    withRetry(() =>
      index.query({
        vector,
        topK,
        includeMetadata: true,
        filter: filter || undefined,
      })
    )
  );

  // If specific articles detected, also fetch by metadata
  if (query.detectedArticles.length > 0) {
    for (const artId of query.detectedArticles) {
      queryPromises.push(
        withRetry(() =>
          index.query({
            vector: embeddings[0],
            topK: 25,
            includeMetadata: true,
            filter: { id_articulo: { $eq: artId } },
          })
        )
      );
    }
  }

  const results = await Promise.all(queryPromises);

  // Improved dynamic threshold: use median of top-5 scores across ALL queries
  const allScores = results
    .flatMap((r) => (r.matches || []).map((m) => m.score ?? 0))
    .sort((a, b) => b - a);

  let dynamicThreshold = similarityThreshold;
  if (allScores.length >= 5) {
    const medianTop5 = allScores[2]; // median of top-5
    if (medianTop5 > 0.70) dynamicThreshold = 0.38;
    else if (medianTop5 > 0.55) dynamicThreshold = 0.30;
    else dynamicThreshold = 0.22;
  } else if (allScores.length > 0) {
    const topScore = allScores[0];
    if (topScore > 0.75) dynamicThreshold = 0.35;
    else if (topScore < 0.60) dynamicThreshold = 0.25;
  }

  // Merge and dedup: keep max score per chunk ID
  const chunkMap = new Map<string, ScoredChunk>();

  for (const result of results) {
    for (const match of result.matches || []) {
      if (!match.metadata || (match.score ?? 0) < dynamicThreshold) continue;

      const existing = chunkMap.get(match.id);
      const score = match.score ?? 0;

      if (!existing || score > existing.score) {
        chunkMap.set(match.id, {
          id: match.id,
          score,
          metadata: match.metadata as unknown as ChunkMetadata,
        });
      }
    }
  }

  // Sort by score descending
  const chunks = Array.from(chunkMap.values()).sort(
    (a, b) => b.score - a.score
  );

  // Multi-namespace retrieval — CONDITIONAL based on routing + intent signals
  let multiSourceChunks: ScoredMultiSourceChunk[] | undefined;
  if (RAG_CONFIG.useMultiNamespace && RAG_CONFIG.additionalNamespaces.length > 0) {
    // Collect external namespace signals from routing and intent
    const routingNs = routingConfig.priorityNamespaces.filter((ns) => ns !== "");
    const intentNs = prioritizeNamespaces(query.original).filter((ns) => ns !== "");
    const candidateNs = [...new Set([...routingNs, ...intentNs])];

    // Only retrieve external sources when:
    // 1) Routing or intent explicitly requests external namespaces, OR
    // 2) Default namespace retrieval has low confidence (fallback)
    const shouldRetrieveExternal = candidateNs.length > 0 || dynamicThreshold < 0.30;

    if (shouldRetrieveExternal) {
      const bestEmbedding = embeddings[1] || embeddings[0];
      // Use only the candidate namespaces (routing + intent), NOT all additionalNamespaces
      // Unless this is a low-confidence fallback, then search broadly
      const namespacesToQuery = candidateNs.length > 0
        ? candidateNs
        : RAG_CONFIG.additionalNamespaces;
      multiSourceChunks = await retrieveMultiNamespace(
        bestEmbedding,
        namespacesToQuery as PineconeNamespace[]
      );
    }
  }

  return { chunks, query, multiSourceChunks, dynamicThreshold, queryType };
}

/**
 * Query additional Pinecone namespaces in parallel for external legal sources.
 * Uses per-namespace thresholds from RAG_CONFIG.namespaceThresholds.
 */
async function retrieveMultiNamespace(
  vector: number[],
  namespaces: PineconeNamespace[]
): Promise<ScoredMultiSourceChunk[]> {
  const index = getIndex();
  const topK = RAG_CONFIG.multiNamespaceTopK;
  const nsThresholds = RAG_CONFIG.namespaceThresholds ?? {};
  const fallbackThreshold = RAG_CONFIG.similarityThreshold;

  const nsPromises = namespaces
    .filter((ns) => ns !== "")
    .map(async (ns) => {
      const threshold = nsThresholds[ns] ?? fallbackThreshold;
      try {
        const nsIndex = index.namespace(ns);
        const result = await withRetry(() =>
          nsIndex.query({
            vector,
            topK,
            includeMetadata: true,
          })
        );

        const filtered = (result.matches || [])
          .filter((m) => m.metadata && (m.score ?? 0) >= threshold)
          .map((m) => ({
            id: m.id,
            score: m.score ?? 0,
            metadata: m.metadata as unknown as MultiSourceChunkMetadata,
            namespace: ns,
          }));

        // Cross-namespace score normalization: min-max scale within each namespace
        // so that scores from different namespaces are comparable (0.0–1.0 range)
        if (filtered.length >= 2) {
          const scores = filtered.map((c) => c.score);
          const minS = Math.min(...scores);
          const maxS = Math.max(...scores);
          const range = maxS - minS;
          if (range > 0.01) {
            for (const chunk of filtered) {
              chunk.score = (chunk.score - minS) / range;
            }
          }
        }

        return filtered;
      } catch (error) {
        console.error(`[retriever] Namespace "${ns}" query failed:`, error);
        return [];
      }
    });

  const allResults = await Promise.all(nsPromises);

  // Deduplicate across namespaces by doc_id, keeping the highest score
  const dedupMap = new Map<string, ScoredMultiSourceChunk>();
  for (const chunk of allResults.flat()) {
    const key = `${chunk.metadata.doc_id}::${chunk.metadata.chunk_index}`;
    const existing = dedupMap.get(key);
    if (!existing || chunk.score > existing.score) {
      dedupMap.set(key, chunk);
    }
  }

  return Array.from(dedupMap.values()).sort((a, b) => b.score - a.score);
}

function determineTopK(query: EnhancedQuery, override?: number, routingTopK?: number): number {
  if (override) return override;
  if (query.detectedArticles.length > 0) return 25;
  if (query.subQueries && query.subQueries.length > 1) return Math.max(routingTopK ?? 20, 20);
  return routingTopK ?? RAG_CONFIG.topK;
}

function buildFilter(
  query: EnhancedQuery,
  libroFilter?: string,
  pageContext?: ChatPageContext
): Record<string, unknown> | null {
  const conditions: Record<string, unknown>[] = [];

  if (libroFilter) {
    conditions.push({ categoria_libro: { $eq: libroFilter } });
  } else if (query.detectedLibro) {
    conditions.push({ categoria_libro: { $eq: query.detectedLibro } });
  } else if (pageContext?.module === "tablas-retencion") {
    conditions.push({ categoria_libro: { $eq: "II - Retención en la Fuente" } });
  } else if (pageContext?.module === "calculadora" && pageContext.calculatorSlug?.includes("renta")) {
    conditions.push({
      categoria_libro: { $eq: "I - Impuesto sobre la Renta y Complementarios" },
    });
  } else if (
    pageContext?.module === "calculadora" &&
    pageContext.calculatorSlug?.includes("retencion")
  ) {
    conditions.push({ categoria_libro: { $eq: "II - Retención en la Fuente" } });
  }

  if (conditions.length === 0) return null;
  if (conditions.length === 1) return conditions[0];
  return { $and: conditions };
}
