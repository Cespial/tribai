import { ScoredChunk, ScoredMultiSourceChunk } from "./pinecone";

export interface EnhancedQuery {
  original: string;
  rewritten: string;
  hyde?: string;
  subQueries?: string[];
  detectedArticles: string[];
  detectedLibro?: string;
}

export interface RetrievalResult {
  chunks: ScoredChunk[];
  query: EnhancedQuery;
  /** Multi-source chunks from additional namespaces */
  multiSourceChunks?: ScoredMultiSourceChunk[];
  /** Dynamic threshold computed during retrieval */
  dynamicThreshold?: number;
  /** Classified query type for routing decisions */
  queryType?: string;
  /** Article slugs discovered during retrieval (for multi-hop boost in reranker) */
  retrievedArticleSlugs?: string[];
}

export interface RerankedChunk extends ScoredChunk {
  rerankedScore: number;
}

export interface RerankedMultiSourceChunk extends ScoredMultiSourceChunk {
  rerankedScore: number;
}

export interface ArticleGroup {
  idArticulo: string;
  titulo: string;
  categoriaLibro: string;
  categoriaTitulo: string;
  urlOrigen: string;
  contenido: string[];
  modificaciones: string[];
  textoAnterior: string[];
  maxScore: number;
  // Enriched fields
  estado?: "vigente" | "modificado" | "derogado";
  totalModificaciones?: number;
  slug?: string;
  concordancias?: string;
}

/** Group for doctrina, jurisprudencia, decretos, resoluciones */
export interface ExternalSourceGroup {
  docId: string;
  docType: "doctrina" | "sentencia" | "decreto" | "resolucion" | "ley";
  numero: string;
  fecha?: string;
  tema: string;
  texto: string[];
  articulosET: string[];
  maxScore: number;
  vigente: boolean;
  fuenteUrl: string;
  namespace: string;
  // Sentencia-specific
  corte?: string;
  tipoSentencia?: string;
  decision?: string;
  // Decreto-specific
  decretoNumero?: string;
  articuloNumero?: string;
}

export interface AssembledContext {
  articles: ArticleGroup[];
  /** External legal sources (doctrina, jurisprudencia, decretos, resoluciones) */
  externalSources: ExternalSourceGroup[];
  sources: SourceCitation[];
  totalTokensEstimate: number;
}

export interface SourceCitation {
  idArticulo: string;
  titulo: string;
  url: string;
  categoriaLibro: string;
  relevanceScore: number;
  // Enriched fields
  estado?: "vigente" | "modificado" | "derogado";
  totalModificaciones?: number;
  slug?: string;
  // Multi-source fields
  docType?: string;
  namespace?: string;
}

export type PineconeNamespace = "" | "doctrina" | "jurisprudencia" | "decretos" | "resoluciones" | "leyes";

export interface RAGConfig {
  topK: number;
  similarityThreshold: number;
  maxContextTokens: number;
  maxRerankedResults: number;
  useHyDE: boolean;
  useLLMRerank: boolean;
  useQueryExpansion: boolean;
  useSiblingRetrieval: boolean;
  /** Enable multi-namespace retrieval for external sources */
  useMultiNamespace: boolean;
  /** Namespaces to query in addition to default */
  additionalNamespaces: PineconeNamespace[];
  /** Top-K for each additional namespace */
  multiNamespaceTopK: number;
  /** Ratio of token budget for external sources (0-1) */
  externalSourceBudgetRatio: number;
  /** Per-namespace similarity thresholds (lower for external sources) */
  namespaceThresholds?: Partial<Record<PineconeNamespace, number>>;
}

export interface PipelineTimings {
  queryEnhancement: number;
  retrieval: number; // Includes embedding time
  reranking: number;
  contextAssembly: number;
  promptBuilding: number;
  totalPipeline: number;
}

export interface RAGDebugInfo {
  // Retrieval
  chunksRetrieved: number;
  chunksAfterReranking: number;
  uniqueArticles: number;
  namespacesSearched: string[];
  /** Classified query type from namespace-router */
  queryType?: string;
  // Quality signals
  topScore: number;
  medianScore: number;
  dynamicThreshold: number;
  siblingChunksAdded: number;
  // Tokens
  contextTokensUsed: number;
  contextTokensBudget: number;
  // Enhancement
  queryEnhanced: boolean;
  hydeGenerated: boolean;
  subQueriesCount: number;
  // Timing
  timings: PipelineTimings;
  // Cache
  embeddingCacheHitRate: number;
  // Evidence quality (Fase 6)
  /** Overall confidence: "high" | "medium" | "low" */
  confidenceLevel?: "high" | "medium" | "low";
  /** Numeric evidence quality score 0-1 */
  evidenceQuality?: number;
  /** Chunks per namespace in final context */
  namespaceContribution?: Record<string, number>;
  /** Whether contradictions were detected between sources */
  contradictionFlags?: boolean;
}
