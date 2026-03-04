import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  ChatRequestSchema,
  MAX_MESSAGE_LENGTH,
  validateMessageLength,
} from "../../src/lib/api/validation";

describe("api/validation", () => {
  it("acepta payload válido de chat", () => {
    const payload = {
      messages: [
        {
          id: "m1",
          role: "user",
          parts: [{ type: "text", text: "Hola" }],
        },
      ],
      conversationId: "conv-1",
      pageContext: {
        pathname: "/",
        module: "home",
      },
    };

    const parsed = ChatRequestSchema.parse(payload);
    assert.equal(parsed.messages.length, 1);
  });

  it("rechaza más de 50 mensajes", () => {
    const payload = {
      messages: Array.from({ length: 51 }, (_, i) => ({
        id: `m${i}`,
        role: "user",
        parts: [{ type: "text", text: "x" }],
      })),
    };

    assert.throws(() => ChatRequestSchema.parse(payload));
  });

  it("rechaza roles inválidos", () => {
    const payload = {
      messages: [
        {
          id: "m1",
          role: "bot",
          parts: [{ type: "text", text: "Hola" }],
        },
      ],
    };

    assert.throws(() => ChatRequestSchema.parse(payload));
  });

  it("validateMessageLength retorna null cuando no excede límite", () => {
    const messages = [
      {
        id: "m1",
        role: "user" as const,
        parts: [{ type: "text" as const, text: "corto" }],
      },
    ];

    assert.equal(validateMessageLength(messages), null);
  });

  it("validateMessageLength retorna error cuando excede límite", () => {
    const messages = [
      {
        id: "m1",
        role: "user" as const,
        parts: [{ type: "text" as const, text: "x".repeat(MAX_MESSAGE_LENGTH + 1) }],
      },
    ];

    assert.equal(
      validateMessageLength(messages),
      `El mensaje excede el límite de ${MAX_MESSAGE_LENGTH} caracteres.`
    );
  });
});
