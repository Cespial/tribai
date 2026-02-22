/**
 * Feedback API Endpoint
 *
 * Collects thumbs up/down feedback from chat responses.
 * Stores in-memory for now; can be migrated to Vercel KV (Redis) later.
 *
 * POST /api/feedback
 * Body: { conversationId, messageIndex, rating: "up" | "down", query?, comment? }
 */

import { NextResponse } from "next/server";

interface FeedbackEntry {
  conversationId: string;
  messageIndex: number;
  rating: "up" | "down";
  query?: string;
  comment?: string;
  timestamp: string;
  ip?: string;
}

// In-memory store (replace with Vercel KV for persistence)
const feedbackStore: FeedbackEntry[] = [];
const MAX_ENTRIES = 10000;

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { conversationId, messageIndex, rating, query, comment } = body;

    if (!conversationId || messageIndex === undefined || !["up", "down"].includes(rating)) {
      return NextResponse.json(
        { error: "Invalid feedback data. Required: conversationId, messageIndex, rating (up/down)" },
        { status: 400 }
      );
    }

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

    const entry: FeedbackEntry = {
      conversationId,
      messageIndex,
      rating,
      query: query?.slice(0, 500),
      comment: comment?.slice(0, 1000),
      timestamp: new Date().toISOString(),
      ip,
    };

    // LRU eviction
    if (feedbackStore.length >= MAX_ENTRIES) {
      feedbackStore.shift();
    }

    feedbackStore.push(entry);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Return feedback summary (for admin/eval use)
  const total = feedbackStore.length;
  const upCount = feedbackStore.filter((f) => f.rating === "up").length;
  const downCount = feedbackStore.filter((f) => f.rating === "down").length;

  // Get recent negative feedback queries for eval dataset improvement
  const recentNegative = feedbackStore
    .filter((f) => f.rating === "down" && f.query)
    .slice(-20)
    .map((f) => ({
      query: f.query,
      comment: f.comment,
      timestamp: f.timestamp,
    }));

  return NextResponse.json({
    total,
    upCount,
    downCount,
    satisfactionRate: total > 0 ? upCount / total : 0,
    recentNegative,
  });
}
