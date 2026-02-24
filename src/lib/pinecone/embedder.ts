import { getPineconeClient } from "./client";
import { EMBEDDING_MODEL } from "@/config/constants";
import crypto from "crypto";

// LRU Cache for embeddings — 2000 covers ~20 concurrent sessions
const CACHE_LIMIT = 2000;
const embeddingCache = new Map<string, number[]>();

// Cache metrics
let cacheHits = 0;
let cacheMisses = 0;

export function getCacheStats() {
  const total = cacheHits + cacheMisses;
  return {
    hits: cacheHits,
    misses: cacheMisses,
    hitRate: total > 0 ? cacheHits / total : 0,
    size: embeddingCache.size,
  };
}

function getHash(text: string): string {
  return crypto.createHash("md5").update(text).digest("hex");
}

function getFromCache(text: string): number[] | undefined {
  const hash = getHash(text);
  const cached = embeddingCache.get(hash);
  if (cached) {
    cacheHits++;
    // Move to end (most recent)
    embeddingCache.delete(hash);
    embeddingCache.set(hash, cached);
  } else {
    cacheMisses++;
  }
  return cached;
}

function addToCache(text: string, values: number[]) {
  const hash = getHash(text);
  if (embeddingCache.size >= CACHE_LIMIT) {
    // Delete oldest (first)
    const firstKey = embeddingCache.keys().next().value;
    if (firstKey) embeddingCache.delete(firstKey);
  }
  embeddingCache.set(hash, values);
}

export async function embedQuery(text: string): Promise<number[]> {
  const cached = getFromCache(text);
  if (cached) return cached;

  const pc = getPineconeClient();
  const normalized = text.normalize("NFC");

  const result = await pc.inference.embed({
    model: EMBEDDING_MODEL,
    inputs: [normalized],
    parameters: { inputType: "query", truncate: "END" },
  });

  const embedding = result.data[0];
  if ("values" in embedding) {
    const values = embedding.values;
    addToCache(text, values);
    return values;
  }
  throw new Error("Expected dense embedding");
}

export async function embedQueries(texts: string[]): Promise<number[][]> {
  const results: number[][] = new Array(texts.length);
  const missingIndices: number[] = [];
  const missingTexts: string[] = [];

  texts.forEach((text, i) => {
    const cached = getFromCache(text);
    if (cached) {
      results[i] = cached;
    } else {
      missingIndices.push(i);
      missingTexts.push(text.normalize("NFC"));
    }
  });

  if (missingTexts.length === 0) return results;

  const pc = getPineconeClient();
  const apiResult = await pc.inference.embed({
    model: EMBEDDING_MODEL,
    inputs: missingTexts,
    parameters: { inputType: "query", truncate: "END" },
  });

  apiResult.data.forEach((d, i) => {
    if ("values" in d) {
      const values = d.values;
      const originalIndex = missingIndices[i];
      results[originalIndex] = values;
      addToCache(texts[originalIndex], values);
    } else {
      throw new Error("Expected dense embedding");
    }
  });

  return results;
}
