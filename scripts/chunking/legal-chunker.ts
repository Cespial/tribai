/**
 * Phase 5 — Legal Chunker (Optimized)
 *
 * Intelligent chunking for Colombian legal text that respects document structure:
 * - Never cuts mid-paragraph, mid-numeral, mid-literal
 * - Chunk size: 512 target, 768 max tokens (aligned with e5-large 512 token window)
 * - Overlap: 75 tokens (semantic: last complete sentence)
 * - Respects hierarchy: Artículo > Parágrafo > Numeral > Literal > Inciso
 */

export interface LegalChunk {
  text: string;
  index: number;
  totalChunks: number;
  metadata: Record<string, unknown>;
}

export interface ChunkOptions {
  /** Target chunk size in tokens (default: 512) */
  targetTokens?: number;
  /** Maximum chunk size in tokens (default: 768) */
  maxTokens?: number;
  /** Overlap in tokens (default: 75) */
  overlapTokens?: number;
}

// Calibrated for Spanish legal text (~3.2-3.8 chars/token with multilingual-e5-large)
const CHARS_PER_TOKEN = 3.5;

/**
 * Legal boundary patterns, ordered by hierarchy (highest priority first).
 * High-priority patterns (artículo, parágrafo) use a wider search window
 * to avoid cutting structural units in half.
 */
const BOUNDARY_PATTERNS_HIGH = [
  // Artículo boundary
  /(?=ART[IÍ]CULO\s+\d)/i,
  // Parágrafo boundary (including "PARÁGRAFO." without number)
  /(?=PAR[AÁ]GRAFO\s+(?:TRANSITORIO\s+)?(?:\d|\.|\b))/i,
  // Inciso boundary (e.g., "Inciso 2o.", "Inciso segundo")
  /(?=INCISO\s+(?:\d|primero|segundo|tercero|cuarto|quinto))/i,
];

const BOUNDARY_PATTERNS_LOW = [
  // Numeral boundary
  /(?=\n\s*\d+\.\s+)/,
  // Literal boundary
  /(?=\n\s*[a-z]\)\s+)/,
  /(?=\n\s*[a-z]\.\s+)/,
  // Paragraph boundary (double newline)
  /\n\s*\n/,
  // Single newline as last resort
  /\n/,
];

function estimateTokens(text: string): number {
  return Math.ceil(text.length / CHARS_PER_TOKEN);
}

/**
 * Get semantic overlap: last complete sentence(s) from previous chunk.
 */
function getSemanticOverlap(previousChunk: string, maxChars: number = 263): string {
  const sentences = previousChunk.split(/(?<=[.;:])\s+/);
  let overlap = "";
  for (let i = sentences.length - 1; i >= 0; i--) {
    if ((overlap + sentences[i]).length > maxChars) break;
    overlap = sentences[i] + " " + overlap;
  }
  // Fallback: if no complete sentence fits, take last maxChars characters
  if (overlap.trim().length === 0 && previousChunk.length > 0) {
    return previousChunk.slice(-maxChars).trim();
  }
  return overlap.trim();
}

/**
 * Split text at the best legal boundary near the target position.
 * Uses a wider window (±400 chars) for high-priority structural boundaries
 * (artículo, parágrafo, inciso) to avoid cutting legal units in half.
 */
function findBestSplit(text: string, targetChars: number): number {
  // Wide window for high-priority patterns (structural boundaries)
  const wideStart = Math.max(0, targetChars - 400);
  const wideEnd = Math.min(text.length, targetChars + 400);
  const wideWindow = text.slice(wideStart, wideEnd);

  for (const pattern of BOUNDARY_PATTERNS_HIGH) {
    const matches = [...wideWindow.matchAll(new RegExp(pattern, "g"))];
    if (matches.length > 0) {
      // Find the match closest to target
      let bestMatch = matches[0];
      let bestDist = Math.abs(
        (wideStart + bestMatch.index!) - targetChars
      );

      for (const match of matches) {
        const dist = Math.abs((wideStart + match.index!) - targetChars);
        if (dist < bestDist) {
          bestMatch = match;
          bestDist = dist;
        }
      }

      return wideStart + bestMatch.index!;
    }
  }

  // Narrow window for lower-priority patterns (numeral, literal, paragraph)
  const narrowStart = Math.max(0, targetChars - 200);
  const narrowEnd = Math.min(text.length, targetChars + 200);
  const narrowWindow = text.slice(narrowStart, narrowEnd);

  for (const pattern of BOUNDARY_PATTERNS_LOW) {
    const matches = [...narrowWindow.matchAll(new RegExp(pattern, "g"))];
    if (matches.length > 0) {
      let bestMatch = matches[0];
      let bestDist = Math.abs(
        (narrowStart + bestMatch.index!) - targetChars
      );

      for (const match of matches) {
        const dist = Math.abs((narrowStart + match.index!) - targetChars);
        if (dist < bestDist) {
          bestMatch = match;
          bestDist = dist;
        }
      }

      return narrowStart + bestMatch.index!;
    }
  }

  // Fallback: split at target position (last resort)
  return targetChars;
}

/**
 * Validate a chunk meets minimum quality standards.
 */
function validateChunk(text: string): boolean {
  const trimmed = text.trim();
  if (trimmed.length < 50) return false;           // Too short
  if (/^[\d\s.,;:]+$/.test(trimmed)) return false; // Only numbers/punctuation
  return true;
}

/**
 * Generate a contextual prefix for a chunk (Anthropic-style Contextual Retrieval).
 * Prepends document-level context before the chunk text to improve embedding quality.
 */
export function generateContextualPrefix(
  metadata: Record<string, unknown>
): string {
  const parts: string[] = [];

  if (metadata.id_articulo) {
    parts.push(`[Artículo ${metadata.id_articulo} del Estatuto Tributario]`);
  }
  if (metadata.titulo) {
    parts.push(`Título: ${metadata.titulo}`);
  }
  if (metadata.categoria_libro) {
    parts.push(`Libro: ${metadata.categoria_libro}`);
  }
  if (metadata.estado) {
    parts.push(`Estado: ${metadata.estado}`);
  }
  if (metadata.doc_type === "doctrina") {
    parts.push(`[Concepto DIAN No. ${metadata.numero || ""}${metadata.fecha ? `, ${metadata.fecha}` : ""}]`);
    if (metadata.tema) parts.push(`Tema: ${metadata.tema}`);
  }
  if (metadata.doc_type === "sentencia") {
    parts.push(`[Sentencia ${metadata.tipo || ""}-${metadata.numero || ""} de ${metadata.year || ""}]`);
    if (metadata.tema) parts.push(`Tema: ${metadata.tema}`);
  }
  if (metadata.doc_type === "decreto") {
    parts.push(`[Decreto ${metadata.decreto_numero || ""}, Art. ${metadata.articulo_numero || ""}]`);
  }
  if (metadata.doc_type === "resolucion") {
    parts.push(`[Resolución DIAN No. ${metadata.numero || ""}${metadata.fecha ? `, ${metadata.fecha}` : ""}]`);
    if (metadata.tema) parts.push(`Tema: ${metadata.tema}`);
  }

  if (parts.length === 0) return "";
  return parts.join(". ") + "\n\n";
}

/**
 * Chunk legal text respecting document structure.
 */
export function chunkLegalText(
  text: string,
  baseMetadata: Record<string, unknown> = {},
  options: ChunkOptions = {}
): LegalChunk[] {
  const {
    targetTokens = 512,
    maxTokens = 768,
    overlapTokens = 75,
  } = options;

  const totalTokens = estimateTokens(text);

  // If text fits in one chunk, return as-is (no overlap needed for single chunks)
  if (totalTokens <= maxTokens) {
    const trimmed = text.trim();
    if (!validateChunk(trimmed)) return [];
    return [
      {
        text: trimmed,
        index: 0,
        totalChunks: 1,
        metadata: { ...baseMetadata },
      },
    ];
  }

  const targetChars = targetTokens * CHARS_PER_TOKEN;
  const chunks: LegalChunk[] = [];
  let position = 0;

  while (position < text.length) {
    const remaining = text.length - position;

    // If remaining fits in max, take it all
    if (remaining <= maxTokens * CHARS_PER_TOKEN) {
      const chunkText = text.slice(position).trim();
      if (validateChunk(chunkText)) {
        chunks.push({
          text: chunkText,
          index: chunks.length,
          totalChunks: 0, // Will be set after
          metadata: { ...baseMetadata },
        });
      }
      break;
    }

    // Find best split point
    const splitAt = findBestSplit(text, position + targetChars);
    const chunkText = text.slice(position, splitAt).trim();

    if (chunkText.length > 0 && validateChunk(chunkText)) {
      chunks.push({
        text: chunkText,
        index: chunks.length,
        totalChunks: 0,
        metadata: { ...baseMetadata },
      });
    }

    // Advance position with semantic overlap
    const overlapText = getSemanticOverlap(
      text.slice(position, splitAt),
      overlapTokens * CHARS_PER_TOKEN
    );
    position = Math.max(position + 1, splitAt - overlapText.length);
  }

  // Set totalChunks on all chunks
  for (const chunk of chunks) {
    chunk.totalChunks = chunks.length;
  }

  return chunks;
}

/**
 * Chunk a doctrina document into pieces suitable for embedding.
 * Separate chunk for conclusionClave if available.
 */
export function chunkDoctrina(
  doc: {
    id: string;
    tipo: string;
    numero: string;
    fecha: string;
    tema: string;
    sintesis: string;
    conclusionClave?: string;
    articulosSlugs: string[];
    vigente: boolean;
    fuenteUrl: string;
    fuenteSitio: string;
  },
  options?: ChunkOptions
): LegalChunk[] {
  const metadata = {
    doc_id: doc.id,
    doc_type: "doctrina",
    numero: doc.numero,
    fecha: doc.fecha,
    tema: doc.tema,
    articulos_et: doc.articulosSlugs.map((s) => `Art. ${s}`),
    articulos_slugs: doc.articulosSlugs,
    vigente: doc.vigente,
    fuente_url: doc.fuenteUrl,
    fuente_sitio: doc.fuenteSitio,
  };

  const chunks = chunkLegalText(doc.sintesis, metadata, options);

  // Add conclusion as separate chunk with enriched metadata
  if (doc.conclusionClave && doc.conclusionClave.trim().length >= 50) {
    chunks.push({
      text: doc.conclusionClave.trim(),
      index: chunks.length,
      totalChunks: chunks.length + 1,
      metadata: { ...metadata, chunk_type: "conclusion" },
    });
    // Update totalChunks
    for (const chunk of chunks) {
      chunk.totalChunks = chunks.length;
    }
  }

  return chunks;
}

/**
 * Chunk a sentencia document.
 * Separate chunks for ratioDecidendi and salvamentoVoto if available.
 */
export function chunkSentencia(
  doc: {
    id: string;
    corte: string;
    tipo: string;
    numero: string;
    year: number;
    tema: string;
    ratioDecidendi?: string;
    salvamentoVoto?: string;
    decision?: string;
    resumen: string;
    articulosSlugs: string[];
    fuenteUrl: string;
  },
  options?: ChunkOptions
): LegalChunk[] {
  const metadata = {
    doc_id: doc.id,
    doc_type: "sentencia",
    corte: doc.corte,
    tipo: doc.tipo,
    numero: doc.numero,
    year: doc.year,
    tema: doc.tema,
    decision: doc.decision,
    articulos_et: doc.articulosSlugs.map((s) => `Art. ${s}`),
    articulos_slugs: doc.articulosSlugs,
    fuente_url: doc.fuenteUrl,
  };

  // Prefer ratio decidendi for embedding, fall back to resumen
  const textToChunk = doc.ratioDecidendi || doc.resumen;
  const chunks = chunkLegalText(textToChunk, metadata, options);

  // Add salvamento de voto as separate chunk if available
  if (doc.salvamentoVoto && doc.salvamentoVoto.trim().length >= 50) {
    chunks.push({
      text: doc.salvamentoVoto.trim(),
      index: chunks.length,
      totalChunks: chunks.length + 1,
      metadata: { ...metadata, chunk_type: "salvamento_voto" },
    });
    for (const chunk of chunks) {
      chunk.totalChunks = chunks.length;
    }
  }

  return chunks;
}

/**
 * Chunk a decreto article.
 */
export function chunkDecreto(
  doc: {
    id: string;
    decretoNumero: string;
    decretoYear: number;
    articuloNumero: string;
    texto: string;
    articulosSlugs: string[];
    vigente: boolean;
    fuenteUrl: string;
  },
  options?: ChunkOptions
): LegalChunk[] {
  const metadata = {
    doc_id: doc.id,
    doc_type: "decreto",
    decreto_numero: doc.decretoNumero,
    decreto_year: doc.decretoYear,
    articulo_numero: doc.articuloNumero,
    articulos_et: doc.articulosSlugs.map((s) => `Art. ${s}`),
    articulos_slugs: doc.articulosSlugs,
    vigente: doc.vigente,
    fuente_url: doc.fuenteUrl,
  };

  return chunkLegalText(doc.texto, metadata, options);
}

/**
 * Chunk a resolución DIAN document.
 */
export function chunkResolucion(
  doc: {
    id: string;
    numero: string;
    year: number;
    fecha: string;
    tema: string;
    texto: string;
    articulosSlugs: string[];
    vigente: boolean;
    fuenteUrl: string;
  },
  options?: ChunkOptions
): LegalChunk[] {
  const metadata = {
    doc_id: doc.id,
    doc_type: "resolucion",
    numero: doc.numero,
    fecha: doc.fecha,
    tema: doc.tema,
    articulos_et: doc.articulosSlugs.map((s) => `Art. ${s}`),
    articulos_slugs: doc.articulosSlugs,
    vigente: doc.vigente,
    fuente_url: doc.fuenteUrl,
    fuente_sitio: "dian",
  };

  return chunkLegalText(doc.texto, metadata, options);
}

/**
 * Chunk a ley tributaria document. Chunks each article separately.
 */
export function chunkLey(
  doc: {
    id: string;
    numero: string;
    year: number;
    titulo: string;
    fecha?: string;
    articulos: Array<{
      numero: string;
      texto: string;
      articulosETModificados: string[];
    }>;
    articulosETAfectados: string[];
    fuenteUrl: string;
  },
  options?: ChunkOptions
): LegalChunk[] {
  const allChunks: LegalChunk[] = [];

  for (const art of doc.articulos) {
    const metadata = {
      doc_id: `${doc.id}-art-${art.numero}`,
      doc_type: "ley",
      numero: doc.numero,
      fecha: doc.fecha || `${doc.year}-01-01`, // Use real date if available
      tema: doc.titulo,
      articulos_et: art.articulosETModificados.map((s) => `Art. ${s}`),
      articulos_slugs: art.articulosETModificados,
      vigente: true,
      fuente_url: doc.fuenteUrl,
      fuente_sitio: "senado",
      ley_articulo: art.numero,
    };

    const chunks = chunkLegalText(art.texto, metadata, options);
    allChunks.push(...chunks);
  }

  return allChunks;
}
