/**
 * Contextual Retrieval Re-embedding Script
 *
 * Implements the Anthropic Contextual Retrieval pattern:
 * Prepends each chunk with rich document-level context BEFORE embedding.
 * This dramatically improves retrieval quality because the embedding model
 * understands what document/article the chunk belongs to.
 *
 * Usage:
 *   npx tsx scripts/embedding/contextual-reembed.ts              # Re-embed ET articles (namespace "")
 *   npx tsx scripts/embedding/contextual-reembed.ts --dry-run     # Preview without embedding
 *   npx tsx scripts/embedding/contextual-reembed.ts --namespace doctrina  # Re-embed external sources
 *
 * Estimated time: ~20 min for 1,294 articles (~5,000 chunks)
 * Estimated cost: ~$0.50 (Pinecone Inference embedding)
 */

import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";
import { Pinecone } from "@pinecone-database/pinecone";
import { chunkLegalText } from "../chunking/legal-chunker";
import { embedAll, EmbeddingInput } from "./batch-embedder";

dotenv.config({ path: ".env.local" });
dotenv.config();

const PINECONE_HOST =
  "https://estatuto-tributario-vrkkwsx.svc.aped-4627-b74a.pinecone.io";
const UPSERT_BATCH_SIZE = 25;

interface ArticleJSON {
  id_articulo: string;
  titulo: string;
  titulo_corto: string;
  slug: string;
  url_origen: string;
  libro: string;
  libro_full: string;
  estado: string;
  complexity_score: number;
  contenido_texto: string;
  modificaciones_raw: string;
  total_modificaciones: number;
  ultima_modificacion_year: number;
  leyes_modificatorias: string[];
  texto_derogado: string[];
  cross_references: string[];
  referenced_by: string[];
  concordancias: string;
}

/**
 * Generate a rich contextual prefix for an ET article chunk.
 * This is the core of Contextual Retrieval — gives the embedding model
 * full context about what document this chunk belongs to.
 */
function generateArticleContextualPrefix(
  article: ArticleJSON,
  chunkType: "contenido" | "modificaciones" | "texto_anterior"
): string {
  const parts: string[] = [];

  // Identity
  parts.push(`[${article.id_articulo} del Estatuto Tributario colombiano]`);
  parts.push(`Título: ${article.titulo_corto}`);
  parts.push(`Libro: ${article.libro_full}`);
  parts.push(`Estado: ${article.estado}`);

  // Modification history (crucial for temporal queries)
  if (article.total_modificaciones > 0) {
    parts.push(
      `Modificado ${article.total_modificaciones} veces. Última modificación: ${article.ultima_modificacion_year}.`
    );
    if (article.leyes_modificatorias.length > 0) {
      parts.push(
        `Leyes modificatorias: ${article.leyes_modificatorias.slice(0, 5).join(", ")}`
      );
    }
  }

  // Cross-references (crucial for comparative queries)
  if (article.cross_references.length > 0) {
    const refs = article.cross_references.slice(0, 8).join(", ");
    parts.push(`Artículos relacionados: ${refs}`);
  }

  // Concordancias
  if (article.concordancias && article.concordancias.length > 10) {
    const concordShort = article.concordancias.slice(0, 200);
    parts.push(`Concordancias: ${concordShort}`);
  }

  // Chunk type context
  if (chunkType === "contenido") {
    parts.push("Tipo: Contenido vigente del artículo.");
  } else if (chunkType === "modificaciones") {
    parts.push("Tipo: Historial de modificaciones normativas.");
  } else if (chunkType === "texto_anterior") {
    parts.push("Tipo: Texto anterior derogado.");
  }

  return parts.join("\n") + "\n\n";
}

/**
 * Chunk an article into embedding inputs WITH contextual prefixes.
 */
function chunkArticleWithContext(article: ArticleJSON): EmbeddingInput[] {
  const inputs: EmbeddingInput[] = [];
  // Merge cross_references with parsed concordancias slugs for comprehensive linking
  const crossRefs = [...(article.cross_references || [])];
  if (article.concordancias) {
    const concordMatches = article.concordancias.matchAll(/Art(?:s?\.?\s*)(\d+(?:-\d+)?)/gi);
    for (const m of concordMatches) {
      if (!crossRefs.includes(m[1])) crossRefs.push(m[1]);
    }
  }

  // Extract ley_vigente (most recent modifying law)
  const leyVigente = article.leyes_modificatorias.length > 0
    ? article.leyes_modificatorias[0]  // First entry is most recent
    : undefined;

  const baseMetadata = {
    id_articulo: article.id_articulo,
    titulo: article.titulo,
    categoria_libro: article.libro_full,
    categoria_titulo: article.libro,
    url_origen: article.url_origen,
    estado: article.estado,
    complexity_score: article.complexity_score,
    total_modificaciones: article.total_modificaciones,
    ultima_modificacion_year: article.ultima_modificacion_year,
    leyes_modificatorias: article.leyes_modificatorias,
    cross_ref_articles: crossRefs,
    has_concordancias: !!(article.concordancias && article.concordancias.length > 10),
    concordancias: article.concordancias?.slice(0, 500) || "",
    slug: article.slug,
    has_modifications: article.total_modificaciones > 0,
    has_derogated_text: article.texto_derogado.length > 0,
    // Vigencia metadata (Fase 2)
    vigencia_desde: article.ultima_modificacion_year > 0 ? article.ultima_modificacion_year : undefined,
    ley_vigente: leyVigente,
  };

  // 1. Chunk contenido (main content)
  if (article.contenido_texto && article.contenido_texto.trim().length > 50) {
    const prefix = generateArticleContextualPrefix(article, "contenido");
    const chunks = chunkLegalText(article.contenido_texto, {
      ...baseMetadata,
      chunk_type: "contenido",
    });

    for (const chunk of chunks) {
      // Prepend contextual prefix to the embedding text
      const contextualText = prefix + chunk.text;
      inputs.push({
        id: `${article.slug}-contenido-${chunk.index}`,
        text: contextualText,
        metadata: {
          ...flattenMetadata(chunk.metadata),
          chunk_index: chunk.index,
          total_chunks: chunk.totalChunks,
          // Store original text in metadata (without prefix) for display
          text: chunk.text.slice(0, 2000),
        },
      });
    }
  }

  // 2. Chunk modificaciones
  if (article.modificaciones_raw && article.modificaciones_raw.trim().length > 50) {
    const prefix = generateArticleContextualPrefix(article, "modificaciones");
    const chunks = chunkLegalText(article.modificaciones_raw, {
      ...baseMetadata,
      chunk_type: "modificaciones",
    });

    for (const chunk of chunks) {
      const contextualText = prefix + chunk.text;
      inputs.push({
        id: `${article.slug}-modificaciones-${chunk.index}`,
        text: contextualText,
        metadata: {
          ...flattenMetadata(chunk.metadata),
          chunk_index: chunk.index,
          total_chunks: chunk.totalChunks,
          text: chunk.text.slice(0, 2000),
        },
      });
    }
  }

  // 3. Chunk texto derogado
  if (article.texto_derogado.length > 0) {
    const prefix = generateArticleContextualPrefix(article, "texto_anterior");
    const derogatedText = article.texto_derogado.join("\n\n");
    if (derogatedText.trim().length > 50) {
      const chunks = chunkLegalText(derogatedText, {
        ...baseMetadata,
        chunk_type: "texto_anterior",
      });

      for (const chunk of chunks) {
        const contextualText = prefix + chunk.text;
        inputs.push({
          id: `${article.slug}-texto_anterior-${chunk.index}`,
          text: contextualText,
          metadata: {
            ...flattenMetadata(chunk.metadata),
            chunk_index: chunk.index,
            total_chunks: chunk.totalChunks,
            text: chunk.text.slice(0, 2000),
          },
        });
      }
    }
  }

  return inputs;
}

/**
 * Flatten metadata for Pinecone (only strings, numbers, booleans, string[]).
 */
function flattenMetadata(
  meta: Record<string, unknown>
): Record<string, string | number | boolean | string[]> {
  const flat: Record<string, string | number | boolean | string[]> = {};

  for (const [key, value] of Object.entries(meta)) {
    if (value === undefined || value === null) continue;

    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
      if (typeof value === "string" && value.length > 2000) {
        flat[key] = value.slice(0, 2000);
      } else {
        flat[key] = value;
      }
    } else if (Array.isArray(value) && value.every((v) => typeof v === "string")) {
      flat[key] = value as string[];
    }
  }

  return flat;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Upsert vectors to Pinecone.
 */
async function upsertToPinecone(
  results: Array<{ id: string; values: number[]; metadata: Record<string, unknown> }>,
  namespace: string
): Promise<void> {
  const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
  const index = pc.index(
    process.env.PINECONE_INDEX_NAME || "estatuto-tributario",
    PINECONE_HOST
  );
  const ns = index.namespace(namespace);

  console.log(`[upsert] Upserting ${results.length} vectors to namespace "${namespace || "default"}"...`);

  for (let i = 0; i < results.length; i += UPSERT_BATCH_SIZE) {
    const batch = results.slice(i, i + UPSERT_BATCH_SIZE);
    const records = batch.map((r) => ({
      id: r.id,
      values: r.values,
      metadata: r.metadata as any,
    }));

    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        await ns.upsert({ records });
        break;
      } catch (error) {
        if (attempt < 2) {
          const delay = Math.pow(2, attempt) * 2000;
          console.warn(`[upsert] Batch ${Math.floor(i / UPSERT_BATCH_SIZE)} retry ${attempt + 1}/3...`);
          await sleep(delay);
        } else {
          console.error(`[upsert] Batch failed after 3 attempts:`, (error as Error).message);
        }
      }
    }

    if ((i + UPSERT_BATCH_SIZE) % 500 < UPSERT_BATCH_SIZE) {
      console.log(`[upsert] Progress: ${Math.min(i + UPSERT_BATCH_SIZE, results.length)}/${results.length}`);
    }

    await sleep(200);
  }

  console.log(`[upsert] Done: ${results.length} vectors in "${namespace || "default"}"`);
}

async function main() {
  const args = process.argv.slice(2);
  const isDryRun = args.includes("--dry-run");
  const nsFlag = args.indexOf("--namespace");
  const namespace = nsFlag >= 0 ? args[nsFlag + 1] : "";

  if (namespace !== "") {
    console.log(`[contextual-reembed] External namespace "${namespace}" not yet supported.`);
    console.log(`[contextual-reembed] Currently only ET articles (default namespace) are supported.`);
    process.exit(1);
  }

  // Load all article JSONs
  const articlesDir = path.resolve("public/data/articles");
  const files = fs.readdirSync(articlesDir).filter((f) => f.endsWith(".json"));
  console.log(`[contextual-reembed] Found ${files.length} articles in ${articlesDir}`);

  // Chunk all articles with contextual prefixes
  const allInputs: EmbeddingInput[] = [];
  let articlesProcessed = 0;

  for (const file of files) {
    const raw = fs.readFileSync(path.join(articlesDir, file), "utf-8");
    const article: ArticleJSON = JSON.parse(raw);
    const inputs = chunkArticleWithContext(article);
    allInputs.push(...inputs);
    articlesProcessed++;

    if (articlesProcessed % 200 === 0) {
      console.log(`[contextual-reembed] Chunked ${articlesProcessed}/${files.length} articles (${allInputs.length} chunks so far)`);
    }
  }

  console.log(`\n[contextual-reembed] Total: ${articlesProcessed} articles → ${allInputs.length} chunks`);

  // Show sample
  console.log(`\n--- Sample chunk (first) ---`);
  console.log(`ID: ${allInputs[0].id}`);
  console.log(`Text preview (first 500 chars):\n${allInputs[0].text.slice(0, 500)}`);
  console.log(`Metadata keys: ${Object.keys(allInputs[0].metadata).join(", ")}`);
  console.log(`---\n`);

  if (isDryRun) {
    console.log(`[contextual-reembed] Dry run complete. ${allInputs.length} chunks would be embedded.`);

    // Stats
    const byType: Record<string, number> = {};
    for (const input of allInputs) {
      const type = (input.metadata as any).chunk_type || "unknown";
      byType[type] = (byType[type] || 0) + 1;
    }
    console.log(`\nChunks by type:`);
    for (const [type, count] of Object.entries(byType)) {
      console.log(`  ${type}: ${count}`);
    }

    // Estimate
    const avgTextLen = allInputs.reduce((s, i) => s + i.text.length, 0) / allInputs.length;
    console.log(`\nAvg text length: ${Math.round(avgTextLen)} chars (~${Math.round(avgTextLen / 3.5)} tokens)`);
    console.log(`Estimated batches: ${Math.ceil(allInputs.length / 96)}`);
    console.log(`Estimated time: ${Math.round((Math.ceil(allInputs.length / 96) * 16) / 60)} minutes`);
    return;
  }

  // Embed all chunks
  console.log(`[contextual-reembed] Embedding ${allInputs.length} chunks with contextual prefixes...`);
  const results = await embedAll(allInputs, {
    onProgress: (completed, total) => {
      if (completed % 200 === 0 || completed === total) {
        console.log(`[contextual-reembed] Embedding: ${completed}/${total}`);
      }
    },
  });

  console.log(`[contextual-reembed] Embedded ${results.length} chunks successfully.`);

  // Upsert to Pinecone (default namespace)
  await upsertToPinecone(results, "");

  console.log(`\n[contextual-reembed] COMPLETE!`);
  console.log(`  Articles: ${articlesProcessed}`);
  console.log(`  Chunks embedded: ${results.length}`);
  console.log(`  Namespace: "" (default)`);
  console.log(`  Pattern: Contextual Retrieval (Anthropic)`);
}

main().catch(console.error);
