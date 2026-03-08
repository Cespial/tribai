/**
 * Health Check Endpoint
 *
 * Returns minimal system health status for monitoring and alerting.
 *
 * GET /api/health
 */

import { NextResponse } from "next/server";
import { getPineconeHealth } from "@/lib/pinecone/client";

export async function GET() {
  const pinecone = getPineconeHealth();
  const status = pinecone.healthy ? "healthy" : "degraded";

  return NextResponse.json({
    status,
    timestamp: new Date().toISOString(),
  });
}
