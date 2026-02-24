/**
 * Response Cache for frequent RAG queries.
 *
 * Uses an in-memory LRU cache with TTL for caching pipeline results.
 * For production with Vercel KV (Redis), replace the in-memory store
 * with @vercel/kv when the package is available.
 *
 * Cache key: normalized query string hash.
 * TTL: 24 hours (tax law changes infrequently).
 */

import { PipelineResult } from "@/lib/rag/pipeline";

const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const MAX_CACHE_SIZE = 500;

interface CacheEntry {
  result: PipelineResult;
  timestamp: number;
  hitCount: number;
}

const cache = new Map<string, CacheEntry>();

/**
 * Normalize and hash a query for cache key.
 * Strips whitespace, lowercases, removes accents for fuzzy matching.
 */
function normalizeQuery(query: string): string {
  return query
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, ""); // strip accents
}

/**
 * Get a cached pipeline result if available and not expired.
 */
export function getCachedResult(query: string): PipelineResult | null {
  const key = normalizeQuery(query);
  const entry = cache.get(key);

  if (!entry) return null;

  // Check TTL
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    cache.delete(key);
    return null;
  }

  entry.hitCount++;
  return entry.result;
}

/**
 * Cache a pipeline result.
 */
export function setCachedResult(query: string, result: PipelineResult): void {
  const key = normalizeQuery(query);

  // LRU eviction
  if (cache.size >= MAX_CACHE_SIZE) {
    // Remove least recently used (oldest timestamp with lowest hits)
    let lruKey = "";
    let lruScore = Infinity;
    for (const [k, v] of cache) {
      const score = v.hitCount * 1000 + (Date.now() - v.timestamp);
      if (score < lruScore) {
        lruScore = score;
        lruKey = k;
      }
    }
    if (lruKey) cache.delete(lruKey);
  }

  cache.set(key, {
    result,
    timestamp: Date.now(),
    hitCount: 0,
  });
}

/**
 * Get cache statistics.
 */
export function getCacheStats(): {
  size: number;
  maxSize: number;
  oldestEntryAge: number;
} {
  let oldestAge = 0;
  for (const entry of cache.values()) {
    const age = Date.now() - entry.timestamp;
    if (age > oldestAge) oldestAge = age;
  }

  return {
    size: cache.size,
    maxSize: MAX_CACHE_SIZE,
    oldestEntryAge: oldestAge,
  };
}

/**
 * Invalidate all cached results (e.g., after data update).
 */
export function invalidateCache(): void {
  cache.clear();
}
