import { generateObject } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { z } from "zod";

const judgeSchema = z.object({
  faithfulness: z
    .number()
    .min(1)
    .max(5)
    .describe("How faithful is the answer to the provided context?"),
  completeness: z
    .number()
    .min(1)
    .max(5)
    .describe("How complete is the answer?"),
  relevance: z
    .number()
    .min(1)
    .max(5)
    .describe("How relevant is the answer to the question?"),
  citation_quality: z
    .number()
    .min(1)
    .max(5)
    .describe("How well does the answer cite articles?"),
  clarity: z
    .number()
    .min(1)
    .max(5)
    .describe("How clear and well-structured is the answer?"),
  reasoning: z.string().describe("Brief explanation of scores"),
});

export type JudgeResult = z.infer<typeof judgeSchema>;

/**
 * LLM Judge: evaluates answer quality on 5 dimensions (1-5 scale).
 * Returns null if the judge LLM is unavailable (rate limit, error).
 */
export async function llmJudge(
  question: string,
  answer: string,
  context: string,
  expectedArticles: string[]
): Promise<JudgeResult | null> {
  try {
    const { object } = await generateObject({
      model: anthropic("claude-haiku-4-5-20251001"),
      schema: judgeSchema,
      prompt: `Evalúa la siguiente respuesta sobre el Estatuto Tributario colombiano.

Pregunta: ${question}

Respuesta: ${answer}

Contexto proporcionado (resumen): ${context.slice(0, 4000)}

Artículos esperados: ${expectedArticles.join(", ")}

Evalúa en escala 1-5 cada dimensión:
1. Faithfulness: ¿La respuesta es fiel al contexto proporcionado? (5 = todo viene del contexto, 1 = inventa datos)
2. Completeness: ¿La respuesta cubre todos los aspectos de la pregunta? (5 = completa, 1 = parcial)
3. Relevance: ¿La respuesta es relevante a la pregunta? (5 = directamente relevante, 1 = fuera de tema)
4. Citation quality: ¿Cita correctamente los artículos del ET y fuentes? (5 = citas precisas, 1 = sin citas o inventadas)
5. Clarity: ¿La respuesta es clara y bien estructurada? (5 = excelente estructura, 1 = confusa)`,
    });

    return object;
  } catch (error) {
    const msg = error instanceof Error ? error.message.slice(0, 80) : String(error);
    console.warn(`[llm-judge] Judge unavailable: ${msg}`);
    return null;
  }
}

export function compositeScore(judge: JudgeResult): number {
  return (
    (judge.faithfulness +
      judge.completeness +
      judge.relevance +
      judge.citation_quality +
      judge.clarity) /
    5
  );
}
