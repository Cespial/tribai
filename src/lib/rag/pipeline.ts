import { enhanceQuery } from "./query-enhancer";
import { retrieve } from "./retriever";
import { heuristicRerank, llmRerank, heuristicRerankMultiSource } from "./reranker";
import { assembleContext } from "./context-assembler";
import { buildMessages } from "./prompt-builder";
import { classifyQueryType, getQueryRoutingConfig } from "./namespace-router";
import { AssembledContext, SourceCitation, RAGDebugInfo, PipelineTimings } from "@/types/rag";
import { checkEvidence, EvidenceCheckResult } from "./evidence-checker";
import { RAG_CONFIG } from "@/config/constants";
import { ChatPageContext } from "@/types/chat-history";
import { getCacheStats } from "@/lib/pinecone/embedder";
import { getCachedResult, setCachedResult } from "@/lib/cache/response-cache";

export interface PipelineOptions {
  libroFilter?: string;
  useHyDE?: boolean;
  useLLMRerank?: boolean;
  useQueryExpansion?: boolean;
  useSiblingRetrieval?: boolean;
  conversationHistory?: string;
  pageContext?: ChatPageContext;
}

export interface PipelineResult {
  system: string;
  contextBlock: string;
  sources: SourceCitation[];
  context: AssembledContext;
  debugInfo: RAGDebugInfo;
}

export async function runRAGPipeline(
  query: string,
  options: PipelineOptions = {}
): Promise<PipelineResult> {
  // Check cache for frequent queries (skip if conversation history present)
  if (!options.conversationHistory) {
    const cached = getCachedResult(query);
    if (cached) {
      return cached;
    }
  }

  const pipelineStart = performance.now();
  const timings: PipelineTimings = {
    queryEnhancement: 0,
    retrieval: 0,
    reranking: 0,
    contextAssembly: 0,
    promptBuilding: 0,
    totalPipeline: 0,
  };

  // 1. Enhance query
  let enhancedQuery;
  const enhanceStart = performance.now();
  try {
    enhancedQuery = await enhanceQuery(query, {
      useHyDE: options.useHyDE ?? RAG_CONFIG.useHyDE,
      useQueryExpansion: options.useQueryExpansion ?? RAG_CONFIG.useQueryExpansion,
      pageContext: options.pageContext,
    });
  } catch (error) {
    console.error("[rag-pipeline] Query enhancement failed, using raw query:", error);
    enhancedQuery = {
      original: query,
      rewritten: query,
      detectedArticles: [],
    };
  }
  timings.queryEnhancement = performance.now() - enhanceStart;

  // 1b. Classify query type for dynamic routing
  const queryType = classifyQueryType(query);
  const routingConfig = getQueryRoutingConfig(queryType);

  // 2. Retrieve from Pinecone (with dynamic topK from routing)
  let retrievalResult;
  const retrieveStart = performance.now();
  try {
    retrievalResult = await retrieve(enhancedQuery, {
      topK: routingConfig.topK,
      libroFilter: options.libroFilter || undefined,
      pageContext: options.pageContext,
    });
  } catch (error) {
    console.error("[rag-pipeline] Retrieval failed:", error);
    throw new Error("No se pudieron recuperar los artículos relevantes.");
  }
  timings.retrieval = performance.now() - retrieveStart;

  // 3. Rerank article chunks (dynamic maxRerankedResults from routing)
  const rerankStart = performance.now();
  let reranked = heuristicRerank(retrievalResult.chunks, enhancedQuery, routingConfig.maxRerankedResults, retrievalResult.queryType);

  // Conditional LLM rerank: only run when confidence is low (top score < 0.60)
  // Saves ~500ms for high-confidence queries
  const shouldLLMRerank = (options.useLLMRerank ?? RAG_CONFIG.useLLMRerank) &&
    (retrievalResult.dynamicThreshold ?? 1) < 0.35;
  if (shouldLLMRerank) {
    reranked = await llmRerank(reranked, query);
  }

  // 3b. Rerank multi-source chunks (doctrina, jurisprudencia, etc.)
  // Pass retrievedArticleSlugs for multi-hop boost (sources citing retrieved articles get boosted)
  const rerankedMultiSource = retrievalResult.multiSourceChunks
    ? heuristicRerankMultiSource(retrievalResult.multiSourceChunks, enhancedQuery, undefined, retrievalResult.retrievedArticleSlugs)
    : [];
  timings.reranking = performance.now() - rerankStart;

  // 4. Assemble context
  let context;
  const assembleStart = performance.now();
  try {
    context = await assembleContext(reranked, {
      useSiblingRetrieval: options.useSiblingRetrieval ?? RAG_CONFIG.useSiblingRetrieval,
      multiSourceChunks: rerankedMultiSource,
    });
  } catch (error) {
    console.error("[rag-pipeline] Context assembly failed:", error);
    throw new Error("Error al ensamblar el contexto de respuesta.");
  }
  timings.contextAssembly = performance.now() - assembleStart;

  // 4.5 Evidence check (confidence scoring + contradiction detection)
  const allScoresForEvidence = retrievalResult.chunks.map((c) => c.score).sort((a, b) => b - a);
  const evidenceTopScore = allScoresForEvidence[0] ?? 0;
  const evidenceMedianScore = allScoresForEvidence[Math.floor(allScoresForEvidence.length / 2)] ?? 0;
  const evidenceResult = checkEvidence(context, evidenceTopScore, evidenceMedianScore);

  // 5. Build prompt (pass evidence for low-confidence fallback)
  const promptStart = performance.now();
  const { system, contextBlock } = buildMessages(
    query,
    context,
    options.conversationHistory,
    options.pageContext,
    evidenceResult
  );
  timings.promptBuilding = performance.now() - promptStart;
  timings.totalPipeline = performance.now() - pipelineStart;

  // Compute debug info
  const cacheStats = getCacheStats();
  const uniqueArticles = new Set(reranked.map((c) => c.metadata.id_articulo));
  const namespacesSearched = [""];
  if (RAG_CONFIG.useMultiNamespace) {
    namespacesSearched.push(...RAG_CONFIG.additionalNamespaces.filter((ns) => ns !== ""));
  }

  const debugInfo: RAGDebugInfo = {
    chunksRetrieved: retrievalResult.chunks.length,
    chunksAfterReranking: reranked.length,
    uniqueArticles: uniqueArticles.size,
    namespacesSearched,
    queryType,
    topScore: evidenceTopScore,
    medianScore: evidenceMedianScore,
    dynamicThreshold: retrievalResult.dynamicThreshold ?? RAG_CONFIG.similarityThreshold,
    siblingChunksAdded: Math.max(0, context.articles.reduce(
      (sum, a) => sum + a.contenido.length + a.modificaciones.length + a.textoAnterior.length,
      0
    ) - reranked.length),
    contextTokensUsed: context.totalTokensEstimate,
    contextTokensBudget: RAG_CONFIG.maxContextTokens,
    queryEnhanced: enhancedQuery.rewritten !== query,
    hydeGenerated: !!enhancedQuery.hyde,
    subQueriesCount: enhancedQuery.subQueries?.length ?? 0,
    timings,
    embeddingCacheHitRate: cacheStats.hitRate,
    // Evidence quality (Fase 6)
    confidenceLevel: evidenceResult.confidenceLevel,
    evidenceQuality: evidenceResult.evidenceQuality,
    namespaceContribution: evidenceResult.namespaceContribution,
    contradictionFlags: evidenceResult.contradictionFlags,
  };

  const result: PipelineResult = {
    system,
    contextBlock,
    sources: context.sources,
    context,
    debugInfo,
  };

  // Cache result for future identical queries
  if (!options.conversationHistory) {
    setCachedResult(query, result);
  }

  return result;
}
