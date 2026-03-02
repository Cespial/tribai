import type { LiveIndicatorBundle } from "./live-fetcher";

const TTL_MS = 60 * 60 * 1000; // 1 hour
const MAX_STALE_MS = 24 * 60 * 60 * 1000; // 24 hours

interface CacheEntry {
  data: LiveIndicatorBundle;
  storedAt: number;
}

let cache: CacheEntry | null = null;

export function getCache(): LiveIndicatorBundle | null {
  if (!cache) return null;
  if (Date.now() - cache.storedAt > MAX_STALE_MS) {
    cache = null;
    return null;
  }
  return cache.data;
}

export function setCache(data: LiveIndicatorBundle): void {
  cache = { data, storedAt: Date.now() };
}

export function isCacheStale(): boolean {
  if (!cache) return true;
  return Date.now() - cache.storedAt > TTL_MS;
}
