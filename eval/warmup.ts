/**
 * Connection warmup for eval/test suites.
 *
 * Primes cold connections to Pinecone (inference + index) and Anthropic (Haiku)
 * so the first real test query doesn't pay the TLS/connection setup penalty.
 */

import { embedQuery } from "../src/lib/pinecone/embedder";
import { getIndex } from "../src/lib/pinecone/client";

export async function warmupConnections(): Promise<number> {
  const start = performance.now();
  process.stdout.write("  Warming up connections... ");

  try {
    // Warm up Pinecone inference (embedding API) + index (vector DB) in parallel
    await Promise.all([
      // 1. Pinecone inference: first embedding call establishes connection
      embedQuery("warmup").catch(() => {}),
      // 2. Pinecone index: dummy query primes the vector DB connection
      getIndex()
        .namespace("")
        .query({ vector: new Array(1024).fill(0), topK: 1 })
        .catch(() => {}),
    ]);
  } catch {
    // Warmup failures are non-fatal — tests will just run with cold start
  }

  const ms = Math.round(performance.now() - start);
  console.log(`done (${ms}ms)`);
  return ms;
}
