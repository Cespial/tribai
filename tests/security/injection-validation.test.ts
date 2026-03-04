import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  ChatRequestSchema,
  MAX_MESSAGE_LENGTH,
  validateMessageLength,
} from "../../src/lib/api/validation";

describe("security/injection-validation", () => {
  it("ChatRequestSchema rechaza role 'admin'", () => {
    const payload = {
      messages: [
        { id: "m1", role: "admin", parts: [{ type: "text", text: "Hola" }] },
      ],
    };
    assert.throws(() => ChatRequestSchema.parse(payload));
  });

  it("ChatRequestSchema rechaza role 'function'", () => {
    const payload = {
      messages: [
        { id: "m1", role: "function", parts: [{ type: "text", text: "Hola" }] },
      ],
    };
    assert.throws(() => ChatRequestSchema.parse(payload));
  });

  it("ChatRequestSchema rechaza > 50 mensajes", () => {
    const payload = {
      messages: Array.from({ length: 51 }, (_, i) => ({
        id: `m${i}`,
        role: "user",
        parts: [{ type: "text", text: "x" }],
      })),
    };
    assert.throws(() => ChatRequestSchema.parse(payload));
  });

  it("ChatRequestSchema acepta exactamente 50 mensajes", () => {
    const payload = {
      messages: Array.from({ length: 50 }, (_, i) => ({
        id: `m${i}`,
        role: "user",
        parts: [{ type: "text", text: "x" }],
      })),
    };
    const parsed = ChatRequestSchema.parse(payload);
    assert.equal(parsed.messages.length, 50);
  });

  it("validateMessageLength rechaza > 5,000 chars", () => {
    const messages = [
      {
        id: "m1",
        role: "user" as const,
        parts: [{ type: "text" as const, text: "x".repeat(MAX_MESSAGE_LENGTH + 1) }],
      },
    ];
    const error = validateMessageLength(messages);
    assert.ok(error !== null);
    assert.ok(error!.includes("5000"));
  });

  it("pageContext rechaza pathname > 500 chars", () => {
    const payload = {
      messages: [{ id: "m1", role: "user", parts: [{ type: "text", text: "Hi" }] }],
      pageContext: {
        pathname: "/" + "a".repeat(501),
        module: "home",
      },
    };
    assert.throws(() => ChatRequestSchema.parse(payload));
  });

  it("pageContext rechaza module no listado", () => {
    const payload = {
      messages: [{ id: "m1", role: "user", parts: [{ type: "text", text: "Hi" }] }],
      pageContext: {
        pathname: "/",
        module: "evil-module",
      },
    };
    assert.throws(() => ChatRequestSchema.parse(payload));
  });
});
