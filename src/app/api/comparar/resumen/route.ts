import { generateText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { z } from "zod/v4";

const Schema = z.object({
  oldText: z.string().min(1),
  newText: z.string().min(1),
  oldLabel: z.string().optional(),
  newLabel: z.string().optional(),
  articleA: z.string().optional(),
  articleB: z.string().optional(),
});

function fallbackSummary(input: z.infer<typeof Schema>): string {
  const wordsA = input.oldText.split(/\s+/).filter(Boolean).length;
  const wordsB = input.newText.split(/\s+/).filter(Boolean).length;
  const delta = wordsB - wordsA;
  const direction =
    delta > 0 ? "ampliación del contenido" : delta < 0 ? "reducción del texto" : "estabilidad textual";
  const articleLabel =
    input.articleA && input.articleB && input.articleA !== input.articleB
      ? `${input.articleA} vs ${input.articleB}`
      : input.articleA || "el artículo analizado";

  return `El análisis comparativo de ${articleLabel} evidencia ${direction}. La versión base (${input.oldLabel || "A"}) contiene ${wordsA} palabras y la versión comparada (${input.newLabel || "B"}) contiene ${wordsB}, con una variación neta de ${Math.abs(delta)} palabras.`;
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return new Response(
      JSON.stringify({ error: "Cuerpo inválido." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return new Response(
      JSON.stringify({ error: "Solicitud inválida." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const payload = parsed.data;
  const fallback = fallbackSummary(payload);

  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({ summary: fallback });
  }

  try {
    const { text } = await generateText({
      model: anthropic(process.env.CHAT_MODEL || "claude-sonnet-4-6"),
      maxOutputTokens: 180,
      system:
        "Eres un abogado tributarista colombiano. Redacta un resumen ejecutivo profesional, en un solo párrafo, sobre cambios entre dos textos normativos. Sé preciso, neutral y accionable. No uses viñetas.",
      prompt: [
        `Artículo A: ${payload.articleA || "N/D"}`,
        `Artículo B: ${payload.articleB || payload.articleA || "N/D"}`,
        `Etiqueta A: ${payload.oldLabel || "Versión A"}`,
        `Etiqueta B: ${payload.newLabel || "Versión B"}`,
        "",
        "Texto base:",
        payload.oldText.slice(0, 6000),
        "",
        "Texto comparado:",
        payload.newText.slice(0, 6000),
      ].join("\n"),
    });

    return Response.json({ summary: text.trim() || fallback });
  } catch {
    return Response.json({ summary: fallback });
  }
}
