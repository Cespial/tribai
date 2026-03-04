import { EnhancedQuery } from "../../src/types/rag";
import { ScoredChunk, ChunkMetadata, ScoredMultiSourceChunk, MultiSourceChunkMetadata } from "../../src/types/pinecone";

export function makeEnhancedQuery(overrides: Partial<EnhancedQuery> = {}): EnhancedQuery {
  return {
    original: "¿Qué dice el artículo 240?",
    rewritten: "artículo 240 estatuto tributario tarifa general renta",
    detectedArticles: [],
    ...overrides,
  };
}

const defaultChunkMetadata: ChunkMetadata = {
  id_articulo: "Art. 240",
  titulo: "Tarifa general para personas jurídicas",
  slug: "art-240",
  categoria_libro: "Libro I",
  categoria_titulo: "Renta",
  estado: "vigente",
  chunk_type: "contenido",
  chunk_index: 0,
  total_chunks: 1,
  text: "La tarifa general del impuesto sobre la renta aplicable a las sociedades nacionales...",
  complexity_score: 5,
  has_modifications: true,
  has_derogated_text: false,
  url_origen: "https://estatuto.co/art-240",
  leyes_modificatorias: ["Ley 2277 de 2022"],
  cross_ref_articles: [],
};

export function makeScoredChunk(overrides: { id?: string; score?: number; metadata?: Partial<ChunkMetadata>; subQueryIndex?: number } = {}): ScoredChunk {
  return {
    id: overrides.id ?? `chunk_${Math.random().toString(36).slice(2, 8)}`,
    score: overrides.score ?? 0.75,
    subQueryIndex: overrides.subQueryIndex,
    metadata: { ...defaultChunkMetadata, ...overrides.metadata },
  };
}

const defaultMultiSourceMetadata: MultiSourceChunkMetadata = {
  doc_id: "doc_001",
  doc_type: "doctrina",
  numero: "001234",
  chunk_index: 0,
  total_chunks: 1,
  text: "Texto del concepto DIAN sobre tarifas...",
  vigente: true,
  articulos_et: ["Art. 240"],
  articulos_slugs: ["art-240"],
  tema: "Tarifa general",
  fuente_url: "https://dian.gov.co",
  fuente_sitio: "DIAN",
};

export function makeScoredMultiSourceChunk(
  overrides: { id?: string; score?: number; namespace?: string; metadata?: Partial<MultiSourceChunkMetadata> } = {}
): ScoredMultiSourceChunk {
  return {
    id: overrides.id ?? `ms_${Math.random().toString(36).slice(2, 8)}`,
    score: overrides.score ?? 0.65,
    namespace: overrides.namespace ?? "doctrina",
    metadata: { ...defaultMultiSourceMetadata, ...overrides.metadata },
  };
}
