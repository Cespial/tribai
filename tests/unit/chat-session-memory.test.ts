import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { buildConversationContext } from "../../src/lib/chat/session-memory";

describe("chat/session-memory — buildConversationContext", () => {
  it("returns empty string for no messages", () => {
    assert.equal(buildConversationContext([]), "");
  });

  it("builds context from user and assistant messages", () => {
    const messages = [
      { role: "user", content: "Hola" },
      { role: "assistant", content: "Bienvenido a Tribai" },
    ];
    const result = buildConversationContext(messages);
    assert.ok(result.includes("Usuario: Hola"));
    assert.ok(result.includes("Asistente: Bienvenido a Tribai"));
    assert.ok(result.includes("<conversation_history>"));
  });

  it("respects maxTurns limit", () => {
    const messages = Array.from({ length: 20 }, (_, i) => ({
      role: i % 2 === 0 ? "user" : "assistant",
      content: `Message ${i}`,
    }));
    // maxTurns=2 → last 4 messages (2 turns × 2 roles)
    const result = buildConversationContext(messages, 2);
    assert.ok(!result.includes("Message 0"));
    assert.ok(result.includes("Message 19"));
  });

  it("truncates long messages to 400 chars + ...", () => {
    const longText = "x".repeat(500);
    const messages = [{ role: "user", content: longText }];
    const result = buildConversationContext(messages);
    assert.ok(result.includes("..."));
    assert.ok(!result.includes("x".repeat(500)));
  });

  it("handles messages with parts array", () => {
    const messages = [
      {
        role: "user",
        parts: [
          { type: "text", text: "Pregunta sobre renta" },
        ],
      },
    ];
    const result = buildConversationContext(messages);
    assert.ok(result.includes("Pregunta sobre renta"));
  });

  it("includes pageContext when provided", () => {
    const messages = [{ role: "user", content: "Hola" }];
    const pageContext = { pathname: "/calculadoras/renta", module: "calculadora" as const };
    const result = buildConversationContext(messages, 5, pageContext);
    assert.ok(result.includes("<navigation_context>"));
    assert.ok(result.includes("/calculadoras/renta"));
  });

  it("filters out non-user/assistant roles", () => {
    const messages = [
      { role: "system", content: "System prompt" },
      { role: "user", content: "Pregunta" },
    ];
    const result = buildConversationContext(messages);
    assert.ok(!result.includes("System prompt"));
    assert.ok(result.includes("Pregunta"));
  });
});
