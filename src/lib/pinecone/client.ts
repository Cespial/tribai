import { Pinecone, Index } from "@pinecone-database/pinecone";
import { PINECONE_HOST } from "@/config/constants";

let pineconeClient: Pinecone | null = null;
let pineconeIndex: Index | null = null;

function getPineconeClient(): Pinecone {
  if (!pineconeClient) {
    pineconeClient = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!,
    });
  }
  return pineconeClient;
}

export function getIndex(): Index {
  if (!pineconeIndex) {
    const pc = getPineconeClient();
    pineconeIndex = pc.index(
      process.env.PINECONE_INDEX_NAME || "estatuto-tributario",
      PINECONE_HOST
    );
  }
  return pineconeIndex;
}

/**
 * Simple circuit breaker for Pinecone.
 * After THRESHOLD consecutive failures, trips open for COOLDOWN_MS.
 * During open state, calls fail fast without hitting the API.
 */
const BREAKER_THRESHOLD = 5;
const BREAKER_COOLDOWN_MS = 30_000; // 30s

let consecutiveFailures = 0;
let breakerOpenUntil = 0;

export function getPineconeHealth(): { healthy: boolean; consecutiveFailures: number; breakerOpen: boolean } {
  const now = Date.now();
  return {
    healthy: consecutiveFailures < BREAKER_THRESHOLD || now >= breakerOpenUntil,
    consecutiveFailures,
    breakerOpen: now < breakerOpenUntil,
  };
}

function recordSuccess(): void {
  consecutiveFailures = 0;
}

function recordFailure(): void {
  consecutiveFailures++;
  if (consecutiveFailures >= BREAKER_THRESHOLD) {
    breakerOpenUntil = Date.now() + BREAKER_COOLDOWN_MS;
    console.warn(`[pinecone] Circuit breaker OPEN after ${consecutiveFailures} failures, cooldown ${BREAKER_COOLDOWN_MS}ms`);
  }
}

/**
 * Retry with exponential backoff + circuit breaker for Pinecone operations.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> {
  // Circuit breaker: fail fast if open
  if (Date.now() < breakerOpenUntil) {
    throw new Error("Pinecone circuit breaker is open");
  }

  for (let i = 0; i <= maxRetries; i++) {
    try {
      const result = await fn();
      recordSuccess();
      return result;
    } catch (e) {
      recordFailure();
      if (i === maxRetries) throw e;
      const delay = baseDelay * Math.pow(2, i) + Math.random() * 500;
      console.warn(`[pinecone] Retry ${i + 1}/${maxRetries} after ${Math.round(delay)}ms`);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw new Error("Unreachable");
}

export { getPineconeClient };
