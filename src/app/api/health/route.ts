/**
 * Health Check Endpoint
 *
 * Returns system health status for monitoring and alerting.
 * Checks Pinecone circuit breaker, feedback store, and basic runtime info.
 *
 * GET /api/health
 */

import { NextResponse } from "next/server";
import { getPineconeHealth } from "@/lib/pinecone/client";
import { getCacheStats } from "@/lib/pinecone/embedder";

const startTime = Date.now();

export async function GET() {
  const pinecone = getPineconeHealth();
  const embeddingCache = getCacheStats();

  const status = pinecone.healthy ? "healthy" : "degraded";

  return NextResponse.json({
    status,
    timestamp: new Date().toISOString(),
    uptimeMs: Date.now() - startTime,
    components: {
      pinecone: {
        healthy: pinecone.healthy,
        consecutiveFailures: pinecone.consecutiveFailures,
        breakerOpen: pinecone.breakerOpen,
      },
      embeddingCache: {
        size: embeddingCache.size,
        hitRate: Math.round(embeddingCache.hitRate * 1000) / 1000,
      },
    },
  });
}
