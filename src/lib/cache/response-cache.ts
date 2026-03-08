/**
 * Response Cache for frequent RAG queries.
 *
 * Uses an in-memory LRU cache with TTL for caching pipeline results.
 * For production with Vercel KV (Redis), replace the in-memory store
 * with @vercel/kv when the package is available.
 *
 * Cache key: normalized query string hash.
 * TTL: 24 hours (tax law changes infrequently).
 *
 * v3.5: Added feedback annotations — entries with 2+ negative feedbacks
 * are auto-invalidated to force re-retrieval.
 */

import { PipelineResult } from "@/lib/rag/pipeline";
import crypto from "crypto";

const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const MAX_CACHE_SIZE = 500;
/** Number of negative feedbacks before a cache entry is invalidated */
const NEGATIVE_FEEDBACK_THRESHOLD = 2;

interface CacheEntry {
  result: PipelineResult;
  timestamp: number;
  hitCount: number;
  /** Feedback tracking: positive and negative counts */
  feedbackPositive: number;
  feedbackNegative: number;
}

const cache = new Map<string, CacheEntry>();

/**
 * Normalize and hash a query for cache key.
 * Strips whitespace, lowercases, removes accents for fuzzy matching.
 */
function normalizeQuery(query: string): string {
  const normalized = query
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, ""); // strip accents
  return crypto.createHash("sha256").update(normalized).digest("hex");
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

  // Auto-invalidate entries with too many negative feedbacks
  if (entry.feedbackNegative >= NEGATIVE_FEEDBACK_THRESHOLD) {
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
    feedbackPositive: 0,
    feedbackNegative: 0,
  });
}

/**
 * Record user feedback for a cached query.
 * Returns true if feedback was recorded, false if query not found in cache.
 */
export function recordFeedback(
  query: string,
  feedback: "positive" | "negative"
): boolean {
  const key = normalizeQuery(query);
  const entry = cache.get(key);

  if (!entry) return false;

  if (feedback === "positive") {
    entry.feedbackPositive++;
  } else {
    entry.feedbackNegative++;
  }

  return true;
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
