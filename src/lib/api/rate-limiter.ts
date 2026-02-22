const WINDOW_MS = 60_000; // 1 minute
const MAX_REQUESTS = 20;
const MAX_ENTRIES = 10000;

interface RequestRecord {
  timestamps: number[];
}

// In-memory store — works for long-lived servers but NOT for Vercel serverless.
// For serverless, we fall back to Vercel's built-in headers or a best-effort
// per-invocation counter that still provides basic protection.
const store = new Map<string, RequestRecord>();

// Only set up interval cleanup in non-edge environments
if (typeof globalThis !== "undefined" && typeof setInterval !== "undefined") {
  try {
    // Clean old entries every 5 minutes
    setInterval(() => {
      const now = Date.now();
      for (const [key, record] of store) {
        record.timestamps = record.timestamps.filter((t) => now - t < WINDOW_MS);
        if (record.timestamps.length === 0) store.delete(key);
      }
    }, 5 * 60_000);
  } catch {
    // Interval not supported in this environment (Edge runtime)
  }
}

/**
 * Check rate limit for a given IP.
 * In Vercel serverless, the in-memory store resets between invocations,
 * so this provides best-effort protection. For stricter limiting,
 * check Vercel Edge headers (x-vercel-ip-*) or use Vercel KV.
 */
export function checkRateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  let record = store.get(ip);

  if (!record) {
    // LRU Eviction if store is full
    if (store.size >= MAX_ENTRIES) {
      const oldestKey = store.keys().next().value;
      if (oldestKey) store.delete(oldestKey);
    }
    record = { timestamps: [] };
    store.set(ip, record);
  } else {
    // Refresh position for LRU
    store.delete(ip);
    store.set(ip, record);
  }

  // Remove timestamps outside the window
  record.timestamps = record.timestamps.filter((t) => now - t < WINDOW_MS);

  if (record.timestamps.length >= MAX_REQUESTS) {
    const oldest = record.timestamps[0];
    const retryAfter = Math.ceil((oldest + WINDOW_MS - now) / 1000);
    return { allowed: false, retryAfter };
  }

  record.timestamps.push(now);
  return { allowed: true };
}

/**
 * Enhanced rate limiting using Vercel Edge headers.
 * Use this in the chat route for serverless-friendly rate limiting.
 * Falls back to in-memory if headers not available.
 */
export function checkRateLimitWithHeaders(
  req: Request
): { allowed: boolean; retryAfter?: number } {
  // Extract IP from Vercel headers (most reliable in serverless)
  const ip =
    req.headers.get("x-real-ip") ||
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown";

  return checkRateLimit(ip);
}
