/**
 * Phase 5 — Upsert to Pinecone with namespaces
 *
 * Upserts embedded vectors to the appropriate Pinecone namespace.
 * Supports: doctrina, jurisprudencia, decretos, resoluciones.
 *
 * Usage: npx tsx scripts/embedding/upsert-pinecone.ts [namespace] [data-dir]
 */

import * as fs from "fs";
import * as path from "path";
import { Pinecone } from "@pinecone-database/pinecone";
import * as dotenv from "dotenv";
import { chunkDoctrina, chunkSentencia, chunkDecreto, chunkResolucion, chunkLey } from "../chunking/legal-chunker";
import { enrichChunks, EnrichedChunkMetadata } from "../chunking/metadata-enricher";
import { embedAll, EmbeddingInput, EmbeddingResult } from "./batch-embedder";
import { DoctrinaScraped } from "../scraping/parsers/doctrina-parser";
import { SentenciaScraped } from "../scraping/parsers/sentencia-parser";
import { DecretoScraped } from "../scraping/parsers/decreto-parser";
import { ResolucionScraped } from "../scraping/scrapers/dian-resoluciones";
import { LeyScraped } from "../scraping/scrapers/senado-leyes";

dotenv.config({ path: ".env.local" });
dotenv.config(); // fallback to .env

const PINECONE_HOST =
  "https://estatuto-tributario-vrkkwsx.svc.aped-4627-b74a.pinecone.io";
const UPSERT_BATCH_SIZE = 25; // Keep under Pinecone's 4MB request limit (1024-dim vectors are ~20KB each in JSON)

export type Namespace =
  | ""
  | "doctrina"
  | "jurisprudencia"
  | "decretos"
  | "resoluciones"
  | "leyes";

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Load scraped data from a directory (reads all JSON batch files).
 */
function loadScrapedData<T>(dir: string): T[] {
  if (!fs.existsSync(dir)) {
    console.warn(`[upsert] Directory not found: ${dir}`);
    return [];
  }

  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json"));
  const items: T[] = [];

  for (const file of files) {
    const raw = fs.readFileSync(path.join(dir, file), "utf-8");
    const data = JSON.parse(raw);
    if (Array.isArray(data)) {
      items.push(...data);
    } else {
      items.push(data);
    }
  }

  return items;
}

/**
 * Convert scraped doctrina documents into embedding inputs.
 */
function prepareDoctrinaInputs(docs: DoctrinaScraped[]): EmbeddingInput[] {
  const inputs: EmbeddingInput[] = [];

  for (const doc of docs) {
    const chunks = chunkDoctrina(doc);
    const enriched = enrichChunks(chunks);

    for (const enrichedChunk of enriched) {
      inputs.push({
        id: `${doc.id}-chunk-${enrichedChunk.chunk_index}`,
        text: enrichedChunk.text,
        metadata: flattenMetadata(enrichedChunk),
      });
    }
  }

  return inputs;
}

/**
 * Convert scraped sentencia documents into embedding inputs.
 */
function prepareSentenciaInputs(docs: SentenciaScraped[]): EmbeddingInput[] {
  const inputs: EmbeddingInput[] = [];

  for (const doc of docs) {
    const chunks = chunkSentencia(doc);
    const enriched = enrichChunks(chunks);

    for (const enrichedChunk of enriched) {
      inputs.push({
        id: `${doc.id}-chunk-${enrichedChunk.chunk_index}`,
        text: enrichedChunk.text,
        metadata: flattenMetadata(enrichedChunk),
      });
    }
  }

  return inputs;
}

/**
 * Convert scraped decreto documents into embedding inputs.
 */
function prepareDecretoInputs(docs: DecretoScraped[]): EmbeddingInput[] {
  const inputs: EmbeddingInput[] = [];

  for (const doc of docs) {
    const chunks = chunkDecreto(doc);
    const enriched = enrichChunks(chunks);

    for (const enrichedChunk of enriched) {
      inputs.push({
        id: `${doc.id}-chunk-${enrichedChunk.chunk_index}`,
        text: enrichedChunk.text,
        metadata: flattenMetadata(enrichedChunk),
      });
    }
  }

  return inputs;
}

/**
 * Convert scraped resoluciones into embedding inputs.
 */
function prepareResolucionInputs(docs: ResolucionScraped[]): EmbeddingInput[] {
  const inputs: EmbeddingInput[] = [];

  for (const doc of docs) {
    const chunks = chunkResolucion(doc);
    const enriched = enrichChunks(chunks);

    for (const enrichedChunk of enriched) {
      inputs.push({
        id: `${doc.id}-chunk-${enrichedChunk.chunk_index}`,
        text: enrichedChunk.text,
        metadata: flattenMetadata(enrichedChunk),
      });
    }
  }

  return inputs;
}

/**
 * Convert scraped leyes into embedding inputs.
 */
function prepareLeyInputs(docs: LeyScraped[]): EmbeddingInput[] {
  const inputs: EmbeddingInput[] = [];

  for (const doc of docs) {
    const chunks = chunkLey(doc);
    const enriched = enrichChunks(chunks);

    for (const enrichedChunk of enriched) {
      // Use the per-article doc_id to avoid ID collisions across articles
      inputs.push({
        id: `${enrichedChunk.doc_id}-chunk-${enrichedChunk.chunk_index}`,
        text: enrichedChunk.text,
        metadata: flattenMetadata(enrichedChunk),
      });
    }
  }

  return inputs;
}

/**
 * Flatten metadata to Pinecone-compatible types (strings, numbers, booleans, string arrays).
 */
function flattenMetadata(
  meta: EnrichedChunkMetadata
): Record<string, string | number | boolean | string[]> {
  const flat: Record<string, string | number | boolean | string[]> = {};

  for (const [key, value] of Object.entries(meta)) {
    if (value === undefined || value === null) continue;

    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
      // Truncate long text fields to keep metadata under Pinecone limits
      if (typeof value === "string" && value.length > 2000) {
        flat[key] = value.slice(0, 2000);
      } else {
        flat[key] = value;
      }
    } else if (Array.isArray(value) && value.every((v) => typeof v === "string")) {
      flat[key] = value;
    }
    // Skip complex types (objects, mixed arrays)
  }

  return flat;
}

/**
 * Upsert embedding results to Pinecone.
 */
async function upsertToPinecone(
  results: EmbeddingResult[],
  namespace: Namespace
): Promise<void> {
  const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
  const index = pc.index(
    process.env.PINECONE_INDEX_NAME || "estatuto-tributario",
    PINECONE_HOST
  );
  const ns = index.namespace(namespace);

  console.log(
    `[upsert] Upserting ${results.length} vectors to namespace "${namespace || "default"}"...`
  );

  for (let i = 0; i < results.length; i += UPSERT_BATCH_SIZE) {
    const batch = results.slice(i, i + UPSERT_BATCH_SIZE);
    const records = batch.map((r) => ({
      id: r.id,
      values: r.values,
      metadata: r.metadata as any,
    }));

    // Retry upsert with exponential backoff
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        await ns.upsert({ records });
        break;
      } catch (error) {
        if (attempt < 2) {
          const delay = Math.pow(2, attempt) * 1000;
          console.warn(
            `[upsert] Batch ${i / UPSERT_BATCH_SIZE} attempt ${attempt + 1}/3 failed. Retrying in ${delay}ms...`
          );
          await sleep(delay);
        } else {
          console.error(
            `[upsert] Batch ${i / UPSERT_BATCH_SIZE} failed after 3 attempts:`,
            (error as Error).message
          );
        }
      }
    }

    if ((i + UPSERT_BATCH_SIZE) % 500 < UPSERT_BATCH_SIZE) {
      console.log(
        `[upsert] Progress: ${Math.min(i + UPSERT_BATCH_SIZE, results.length)}/${results.length}`
      );
    }

    // Small delay between batches
    await sleep(200);
  }

  console.log(`[upsert] Complete: ${results.length} vectors in namespace "${namespace || "default"}"`);
}

async function processNamespace(namespace: Namespace): Promise<void> {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`[upsert] Processing namespace: ${namespace}`);
  console.log(`${"=".repeat(60)}`);

  const dir = path.join("data/scraped", namespace);
  if (!fs.existsSync(dir)) {
    console.warn(`[upsert] Directory not found: ${dir}`);
    return;
  }

  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json"));
  console.log(`[upsert] Found ${files.length} files in ${dir}`);

  let totalEmbedded = 0;
  let totalChunksProcessed = 0;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    console.log(`\n[upsert] File ${i + 1}/${files.length}: ${file}`);
    
    const raw = fs.readFileSync(path.join(dir, file), "utf-8");
    const data = JSON.parse(raw);
    const docs = Array.isArray(data) ? data : [data];

    let inputs: EmbeddingInput[] = [];
    switch (namespace) {
      case "doctrina":
        inputs = prepareDoctrinaInputs(docs);
        break;
      case "jurisprudencia":
        inputs = prepareSentenciaInputs(docs);
        break;
      case "decretos":
        inputs = prepareDecretoInputs(docs);
        break;
      case "resoluciones":
        inputs = prepareResolucionInputs(docs);
        break;
      case "leyes":
        inputs = prepareLeyInputs(docs);
        break;
    }

    if (inputs.length === 0) continue;
    
    totalChunksProcessed += inputs.length;
    console.log(`[upsert] Chunks in this file: ${inputs.length}`);

    // Embed all chunks in this file
    const results = await embedAll(inputs, {
      onProgress: (completed, total) => {
        if (completed % 100 === 0 || completed === total) {
          console.log(`[upsert] Embedding progress: ${completed}/${total}`);
        }
      },
    });

    // Upsert results for this file to Pinecone
    if (results.length > 0) {
      await upsertToPinecone(results, namespace);
      totalEmbedded += results.length;
    }
  }

  console.log(`\n[upsert] Pipeline complete for namespace "${namespace}"`);
  console.log(`  Total Chunks: ${totalChunksProcessed}, Total Embedded: ${totalEmbedded}`);
}

async function main() {
  const arg = process.argv[2] || "all";
  const allNamespaces: Namespace[] = [
    "jurisprudencia",
    "decretos",
    "leyes",
    "resoluciones",
    "doctrina",
  ];

  if (arg === "all") {
    console.log("[upsert] Running all namespaces sequentially...");
    for (const ns of allNamespaces) {
      await processNamespace(ns);
    }
    console.log(`\n[upsert] All namespaces complete!`);
  } else {
    const namespace = arg as Namespace;
    if (!allNamespaces.includes(namespace)) {
      console.error(
        `Invalid namespace: ${namespace}. Valid: ${allNamespaces.join(", ")}, all`
      );
      process.exit(1);
    }
    await processNamespace(namespace);
  }
}

main().catch(console.error);
