/**
 * Feedback API Endpoint
 *
 * Collects thumbs up/down feedback from chat responses.
 * Uses in-memory store with write-through to /tmp/feedback.json for
 * persistence across warm invocations. Full persistence requires
 * migration to Vercel KV (Redis).
 *
 * POST /api/feedback
 * Body: { conversationId, messageIndex, rating: "up" | "down", query?, comment? }
 */

import { NextResponse } from "next/server";
import { readFileSync, writeFileSync } from "fs";

interface FeedbackEntry {
  conversationId: string;
  messageIndex: number;
  rating: "up" | "down";
  query?: string;
  comment?: string;
  timestamp: string;
  ip?: string;
}

const FEEDBACK_FILE = "/tmp/feedback.json";
const MAX_ENTRIES = 10000;
const FLUSH_INTERVAL = 5; // flush to disk every N writes

// In-memory store — loaded from /tmp on cold start
let feedbackStore: FeedbackEntry[] = [];
let writesSinceFlush = 0;
let initialized = false;

/** Load feedback from /tmp on cold start */
function ensureInitialized(): void {
  if (initialized) return;
  initialized = true;
  try {
    const data = readFileSync(FEEDBACK_FILE, "utf-8");
    const parsed = JSON.parse(data);
    if (Array.isArray(parsed)) {
      feedbackStore = parsed.slice(-MAX_ENTRIES);
    }
  } catch {
    // File doesn't exist or is corrupted — start fresh
    feedbackStore = [];
  }
}

/** Flush in-memory store to /tmp (best-effort, non-blocking) */
function flushToDisk(): void {
  try {
    writeFileSync(FEEDBACK_FILE, JSON.stringify(feedbackStore), "utf-8");
  } catch {
    // /tmp write failed — silently continue (data still in memory)
  }
}

export async function POST(req: Request) {
  ensureInitialized();

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

    // Write-through: flush to /tmp every FLUSH_INTERVAL writes
    writesSinceFlush++;
    if (writesSinceFlush >= FLUSH_INTERVAL) {
      flushToDisk();
      writesSinceFlush = 0;
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  ensureInitialized();

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
    persistedToDisk: true,
  });
}
