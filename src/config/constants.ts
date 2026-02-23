import { RAGConfig } from "@/types/rag";

export const RAG_CONFIG: RAGConfig = {
  topK: 20,
  similarityThreshold: 0.28,
  maxContextTokens: 12000,
  maxRerankedResults: 10,
  useHyDE: true,
  useLLMRerank: true,
  useQueryExpansion: true,
  useSiblingRetrieval: true,
  useMultiNamespace: true,
  additionalNamespaces: ["doctrina", "jurisprudencia", "decretos", "resoluciones", "leyes"],
  multiNamespaceTopK: 15,
  externalSourceBudgetRatio: 0.30,
  namespaceThresholds: {
    "": 0.28,           // default — adjusted dynamically at runtime
    doctrina: 0.20,     // lower: doctrina embeddings score differently than ET articles
    jurisprudencia: 0.20,
    decretos: 0.23,
    resoluciones: 0.23,
    leyes: 0.23,
  },
};

export const EMBEDDING_MODEL = "multilingual-e5-large";
export const EMBEDDING_DIMS = 1024;

export const PINECONE_HOST =
  "https://estatuto-tributario-vrkkwsx.svc.aped-4627-b74a.pinecone.io";

export const SUGGESTED_QUESTIONS = [
  "Debo declarar renta por ingresos de 2025?",
  "Como calculo retencion en la fuente por salarios?",
  "Que sancion aplica por declarar extemporaneo?",
  "Muestreme el articulo del ET sobre ganancias ocasionales.",
];

/** Boost signals for multi-source reranking */
export const MULTI_SOURCE_BOOST = {
  // Graph-based boosts
  pagerankHigh: 0.10,       // PageRank > 0.01
  sameCommunity: 0.08,      // Same community as query articles
  // Doctrina boosts
  doctrinaVigente: 0.15,    // Vigente doctrina
  doctrinaRevocada: -0.20,  // Revocada doctrina
  // Jurisprudencia boosts
  sentenciaUnificacion: 0.25, // SU- sentencias (highest authority)
  sentenciaC: 0.20,         // C- sentencias (constitutional review)
  sentenciaAntigua: -0.05,  // > 10 years old
  // Decreto boosts
  decretoReciente: 0.10,    // < 3 years old
} as const;
