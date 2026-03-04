/**
 * Helper to build a valid chat request payload for testing.
 */
export function makeChatPayload(overrides: Record<string, unknown> = {}) {
  return {
    messages: [
      {
        id: "m1",
        role: "user",
        parts: [{ type: "text", text: "¿Qué es el UVT?" }],
      },
    ],
    ...overrides,
  };
}

/**
 * Build a valid message array for validateMessageLength testing.
 */
export function makeMessages(texts: string[]) {
  return texts.map((text, i) => ({
    id: `m${i}`,
    role: "user" as const,
    parts: [{ type: "text" as const, text }],
  }));
}
