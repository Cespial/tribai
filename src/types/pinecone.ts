export interface ChunkMetadata {
  id_articulo: string;
  titulo: string;
  categoria_libro: string;
  categoria_titulo: string;
  chunk_type: "contenido" | "modificaciones" | "texto_anterior";
  chunk_index: number;
  total_chunks: number;
  has_modifications: boolean;
  has_derogated_text: boolean;
  url_origen: string;
  text: string;
  // Enriched fields (v2)
  estado?: "vigente" | "modificado" | "derogado";
  total_modificaciones?: number;
  ultima_modificacion_year?: number;
  leyes_modificatorias?: string[];
  cross_ref_articles?: string[];
  has_concordancias?: boolean;
  concordancias?: string;
  has_normas_jurisprudencia?: boolean;
  has_doctrina_dian?: boolean;
  complexity_score?: number;
  slug?: string;
  // Graph metrics (enrichment)
  pagerank?: number;
  community_id?: number;
}

/** Multi-source chunk metadata for doctrina, jurisprudencia, decretos, resoluciones */
export interface MultiSourceChunkMetadata {
  doc_id: string;
  doc_type: "articulo" | "doctrina" | "sentencia" | "decreto" | "resolucion" | "ley";
  numero: string;
  fecha?: string;
  chunk_index: number;
  total_chunks: number;
  text: string;
  articulos_et: string[];
  articulos_slugs: string[];
  tema: string;
  libro_et?: string;
  vigente: boolean;
  // Graph metrics
  pagerank?: number;
  community_id?: number;
  degree_in?: number;
  degree_out?: number;
  // Source
  fuente_url: string;
  fuente_sitio: string;
  // Sentencia-specific
  corte?: string;
  tipo?: string;
  decision?: string;
  // Decreto-specific
  decreto_numero?: string;
  decreto_year?: number;
  articulo_numero?: string;
}

export interface ScoredChunk {
  id: string;
  score: number;
  metadata: ChunkMetadata;
}

export interface ScoredMultiSourceChunk {
  id: string;
  score: number;
  metadata: MultiSourceChunkMetadata;
  namespace: string;
}
