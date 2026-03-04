import assert from "node:assert/strict";
import { describe, it } from "node:test";

/**
 * Tests for feedback API validation logic.
 * Tests the validation patterns from src/app/api/feedback/route.ts
 * without importing Next.js server components.
 */

function validateFeedbackBody(body: Record<string, unknown>): { valid: boolean; error?: string } {
  const { conversationId, messageIndex, rating } = body;
  if (!conversationId || messageIndex === undefined || !["up", "down"].includes(rating as string)) {
    return {
      valid: false,
      error: "Invalid feedback data. Required: conversationId, messageIndex, rating (up/down)",
    };
  }
  return { valid: true };
}

describe("integration/api-feedback-validation", () => {
  it("accepts valid feedback payload (up)", () => {
    const result = validateFeedbackBody({
      conversationId: "conv-123",
      messageIndex: 0,
      rating: "up",
    });
    assert.equal(result.valid, true);
  });

  it("accepts valid feedback payload (down) with optional fields", () => {
    const result = validateFeedbackBody({
      conversationId: "conv-123",
      messageIndex: 2,
      rating: "down",
      query: "¿Qué es el UVT?",
      comment: "Respuesta incompleta",
    });
    assert.equal(result.valid, true);
  });

  it("rejects payload without conversationId", () => {
    const result = validateFeedbackBody({
      messageIndex: 0,
      rating: "up",
    });
    assert.equal(result.valid, false);
  });

  it("rejects payload without rating", () => {
    const result = validateFeedbackBody({
      conversationId: "conv-123",
      messageIndex: 0,
    });
    assert.equal(result.valid, false);
  });

  it("rejects invalid rating value", () => {
    const result = validateFeedbackBody({
      conversationId: "conv-123",
      messageIndex: 0,
      rating: "neutral",
    });
    assert.equal(result.valid, false);
  });
});
