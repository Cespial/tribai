import { kv } from "@vercel/kv";

const WINDOW_MS = 60_000; // 1 minute
const WINDOW_SEC = WINDOW_MS / 1000; // 60 seconds (for Redis TTL)
const MAX_REQUESTS = 20;
const MAX_ENTRIES = 10000;

// ---------------------------------------------------------------------------
// Mode detection — logged once on first use
// ---------------------------------------------------------------------------

type RateLimitMode = "kv" | "memory";

let resolvedMode: RateLimitMode | null = null;

function getMode(): RateLimitMode {
  if (resolvedMode) return resolvedMode;

  // Vercel KV requires both KV_REST_API_URL and KV_REST_API_TOKEN.
  // The @vercel/kv package reads them automatically from env, but we
  // check manually so we can fall back gracefully.
  const hasKV =
    typeof process !== "undefined" &&
    !!process.env.KV_REST_API_URL &&
    !!process.env.KV_REST_API_TOKEN;

  resolvedMode = hasKV ? "kv" : "memory";

  // Log which backend is active on first request
  console.log(
    `[rate-limiter] Using ${resolvedMode === "kv" ? "Vercel KV (Redis)" : "in-memory"} rate limiting`
  );

  return resolvedMode;
}

// ---------------------------------------------------------------------------
// In-memory store (fallback)
// ---------------------------------------------------------------------------

interface RequestRecord {
  timestamps: number[];
}

const store = new Map<string, RequestRecord>();

// Only set up interval cleanup in non-edge environments
if (typeof globalThis !== "undefined" && typeof setInterval !== "undefined") {
  try {
    const cleanupTimer = setInterval(() => {
      const now = Date.now();
      for (const [key, record] of store) {
        record.timestamps = record.timestamps.filter((t) => now - t < WINDOW_MS);
        if (record.timestamps.length === 0) store.delete(key);
      }
    }, 60_000);
    if (typeof (cleanupTimer as { unref?: () => void }).unref === "function") {
      (cleanupTimer as { unref: () => void }).unref();
    }
  } catch {
    // Interval not supported in this environment (Edge runtime)
  }
}

function checkRateLimitMemory(ip: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  let record = store.get(ip);

  if (!record) {
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

  record.timestamps = record.timestamps.filter((t) => now - t < WINDOW_MS);

  if (record.timestamps.length >= MAX_REQUESTS) {
    const oldest = record.timestamps[0];
    const retryAfter = Math.ceil((oldest + WINDOW_MS - now) / 1000);
    return { allowed: false, retryAfter };
  }

  record.timestamps.push(now);
  return { allowed: true };
}

// ---------------------------------------------------------------------------
// Vercel KV (Redis) — sliding window via sorted set
// ---------------------------------------------------------------------------

/**
 * Atomic sliding-window rate limit using a Redis sorted set.
 *
 * Key:   ratelimit:{ip}
 * Score: timestamp (ms)
 * Value: unique member = `{timestamp}-{random}`
 *
 * Steps (via MULTI/EXEC pipeline):
 *   1. ZREMRANGEBYSCORE — remove entries older than the window
 *   2. ZCARD            — count remaining entries
 *   3. ZADD             — add current request
 *   4. PEXPIRE          — set TTL equal to window to auto-clean
 *
 * If count >= MAX_REQUESTS *before* the ZADD, we deny the request and
 * immediately remove the entry we just added.
 */
async function checkRateLimitKV(
  ip: string
): Promise<{ allowed: boolean; retryAfter?: number }> {
  const key = `ratelimit:${ip}`;
  const now = Date.now();
  const windowStart = now - WINDOW_MS;
  const member = `${now}-${Math.random().toString(36).slice(2, 8)}`;

  try {
    const pipeline = kv.pipeline();

    // 1. Remove entries outside the sliding window
    pipeline.zremrangebyscore(key, 0, windowStart);
    // 2. Count remaining entries (requests still in the window)
    pipeline.zcard(key);
    // 3. Optimistically add the new request
    pipeline.zadd(key, { score: now, member });
    // 4. Refresh TTL so the key auto-expires if unused
    pipeline.expire(key, WINDOW_SEC);

    const results = await pipeline.exec();

    // results[1] is the ZCARD result (count *before* adding the new entry)
    const countBeforeAdd = results[1] as number;

    if (countBeforeAdd >= MAX_REQUESTS) {
      // Over limit — remove the entry we just added
      await kv.zrem(key, member);

      // Calculate retry-after from the oldest entry still in the window
      const oldest = await kv.zrange(key, 0, 0, { withScores: true });
      let retryAfter = 1;
      if (oldest && oldest.length >= 2) {
        // zrange with withScores returns [member, score, member, score, ...]
        const oldestScore = Number(oldest[1]);
        retryAfter = Math.max(1, Math.ceil((oldestScore + WINDOW_MS - now) / 1000));
      }

      return { allowed: false, retryAfter };
    }

    return { allowed: true };
  } catch (error) {
    // If Redis fails, fall back to in-memory for this request
    console.warn("[rate-limiter] KV error, falling back to in-memory:", error);
    return checkRateLimitMemory(ip);
  }
}

// ---------------------------------------------------------------------------
// Public API — same interface, backend-agnostic
// ---------------------------------------------------------------------------

/**
 * Check rate limit for a given IP.
 *
 * Uses Vercel KV (Redis) when KV_REST_API_URL and KV_REST_API_TOKEN are set,
 * otherwise falls back to in-memory (best-effort in serverless).
 */
export async function checkRateLimit(
  ip: string
): Promise<{ allowed: boolean; retryAfter?: number }> {
  const mode = getMode();

  if (mode === "kv") {
    return checkRateLimitKV(ip);
  }

  return checkRateLimitMemory(ip);
}

/**
 * Enhanced rate limiting using request headers for IP extraction.
 * Falls back to in-memory if Vercel KV is not configured.
 */
export async function checkRateLimitWithHeaders(
  req: Request
): Promise<{ allowed: boolean; retryAfter?: number }> {
  const ip =
    req.headers.get("x-real-ip") ||
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown";

  return checkRateLimit(ip);
}
