import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { ChatRequestSchema, validateMessageLength } from "../../src/lib/api/validation";

describe("integration/api-chat-validation", () => {
  it("accepts minimal valid payload", () => {
    const payload = {
      messages: [
        { id: "m1", role: "user", parts: [{ type: "text", text: "Hola" }] },
      ],
    };
    const parsed = ChatRequestSchema.parse(payload);
    assert.equal(parsed.messages.length, 1);
  });

  it("accepts full payload with all optional fields", () => {
    const payload = {
      messages: [
        { id: "m1", role: "user", parts: [{ type: "text", text: "Hola" }] },
        { id: "m2", role: "assistant", parts: [{ type: "text", text: "Bienvenido" }] },
      ],
      conversationId: "conv-abc",
      filters: { libro: "Libro I" },
      pageContext: {
        pathname: "/calculadoras/renta",
        module: "calculadora" as const,
        calculatorSlug: "renta",
      },
    };
    const parsed = ChatRequestSchema.parse(payload);
    assert.equal(parsed.messages.length, 2);
    assert.equal(parsed.pageContext?.module, "calculadora");
  });

  it("rejects empty messages array", () => {
    const payload = { messages: [] };
    assert.throws(() => ChatRequestSchema.parse(payload));
  });

  it("rejects message without id", () => {
    const payload = {
      messages: [
        { role: "user", parts: [{ type: "text", text: "Hi" }] },
      ],
    };
    assert.throws(() => ChatRequestSchema.parse(payload));
  });

  it("validateMessageLength accepts messages under limit", () => {
    const messages = [
      { id: "m1", role: "user" as const, parts: [{ type: "text" as const, text: "Short" }] },
      { id: "m2", role: "user" as const, parts: [{ type: "text" as const, text: "Also short" }] },
    ];
    assert.equal(validateMessageLength(messages), null);
  });

  it("validateMessageLength rejects any message over limit", () => {
    const messages = [
      { id: "m1", role: "user" as const, parts: [{ type: "text" as const, text: "Short" }] },
      { id: "m2", role: "user" as const, parts: [{ type: "text" as const, text: "x".repeat(5001) }] },
    ];
    const error = validateMessageLength(messages);
    assert.ok(error !== null);
  });
});
