import { generateText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { EnhancedQuery } from "@/types/rag";
import { extractArticleRefs, articleNumberToId } from "@/lib/utils/article-parser";
import { detectLibro, expandQuery } from "@/lib/utils/legal-terms";
import { ChatPageContext } from "@/types/chat-history";

export async function enhanceQuery(
  query: string,
  options: {
    useHyDE?: boolean;
    useQueryExpansion?: boolean;
    pageContext?: ChatPageContext;
  } = {}
): Promise<EnhancedQuery> {
  const detectedArticles = extractArticleRefs(query).map(articleNumberToId);
  const detectedLibro = detectLibro(query);
  const contextualized = applyPageContextHint(query, options.pageContext);
  const expanded = options.useQueryExpansion !== false ? expandQuery(contextualized) : contextualized;

  const [rewritten, hyde, subQueries] = await Promise.all([
    rewriteQuery(expanded),
    shouldUseHyDE(query, detectedArticles, options.useHyDE)
      ? generateHyDE(query)
      : Promise.resolve(undefined),
    isComplexQuery(query) ? decomposeQuery(query) : Promise.resolve(undefined),
  ]);

  return {
    original: query,
    rewritten,
    hyde,
    subQueries,
    detectedArticles,
    detectedLibro,
  };
}

function applyPageContextHint(query: string, pageContext?: ChatPageContext): string {
  if (!pageContext) return query;
  if (pageContext.module === "tablas-retencion") {
    return `${query} (retención en la fuente, base mínima UVT, tarifas Art. 383/392/401)`;
  }
  if (pageContext.module === "calculadora" && pageContext.calculatorSlug?.includes("renta")) {
    return `${query} (renta personas naturales, Art. 241 ET, depuración de renta)`;
  }
  if (pageContext.module === "calculadora" && pageContext.calculatorSlug?.includes("retencion")) {
    return `${query} (retención en la fuente, Art. 383 y 392 ET)`;
  }
  if (pageContext.module === "comparar") {
    return `${query} (análisis de cambios normativos y versión vigente vs histórica)`;
  }
  return query;
}

async function rewriteQuery(query: string): Promise<string> {
  try {
    const { text } = await generateText({
      model: anthropic("claude-haiku-4-5-20251001"),
      maxOutputTokens: 300,
      system:
        "Eres un experto en el Estatuto Tributario colombiano (Decreto 624 de 1989). " +
        "Reescribe la consulta del usuario usando terminología legal precisa del Estatuto Tributario. " +
        "Ejemplos de terminología: 'renta líquida gravable', 'retención en la fuente', 'hecho generador', " +
        "'base gravable', 'tarifa impositiva', 'período gravable', 'contribuyente', 'responsable del impuesto'. " +
        "Responde SOLO con la consulta reescrita, sin explicaciones.",
      prompt: query,
    });
    return text.trim() || query;
  } catch (error) {
    console.error("[query-enhancer] rewriteQuery failed:", error);
    return query;
  }
}

function shouldUseHyDE(
  query: string,
  detectedArticles: string[],
  forceHyDE?: boolean
): boolean {
  if (forceHyDE !== undefined) return forceHyDE;
  if (query.length < 15) return false;

  // Only disable HyDE for SIMPLE article lookups (e.g., "qué dice el artículo 240")
  // Queries with context like "qué dice el Art. 240 sobre zonas francas?" benefit from HyDE
  if (detectedArticles.length > 0) {
    const isSimpleArticleLookup = query.length < 60 &&
      /^(qu[eé]|cu[aá]l|mu[eé]str|dame|ver)\s+(dice|establece|se[nñ]ala|es|el|la)\s+/i.test(query);
    if (isSimpleArticleLookup) return false;
  }

  // Skip HyDE for very simple direct queries
  if (/^(qu[eé]|cu[aá]l)\s+(dice|establece|se[nñ]ala)\s+(el\s+)?art/i.test(query) && query.length < 50) return false;

  return true;
}

async function generateHyDE(query: string): Promise<string> {
  try {
    const { text } = await generateText({
      model: anthropic("claude-haiku-4-5-20251001"),
      maxOutputTokens: 200,
      system:
        "Eres un experto en el Estatuto Tributario colombiano. Genera un párrafo hipotético que podría ser el texto de un artículo del Estatuto Tributario que respondería esta pregunta. Escribe SOLO el párrafo, sin preámbulos.",
      prompt: query,
    });
    return text.trim();
  } catch (error) {
    console.error("[query-enhancer] generateHyDE failed:", error);
    return "";
  }
}

function isComplexQuery(query: string): boolean {
  const lower = query.toLowerCase();
  const hasConjunctions = /\by\b/.test(lower) && query.length > 80;
  const hasMultipleClauses = (query.match(/[,;]/g) || []).length >= 2;
  // Force decomposition for ALL comparative queries regardless of length
  const hasComparison = /diferencia|compar|versus|vs\b|distinción|mientras que|en cambio|cuál es mejor/i.test(lower);
  return hasConjunctions || hasMultipleClauses || hasComparison;
}

async function decomposeQuery(query: string): Promise<string[]> {
  try {
    const lower = query.toLowerCase();
    const isComparative = /diferencia|compar|versus|vs\b|distinción|mientras que|en cambio|cuál es mejor|entre\s+.*\s+y\s+/i.test(lower);

    const systemPrompt = isComparative
      ? "Eres un experto en el Estatuto Tributario colombiano. " +
        "Dada esta consulta comparativa, genera exactamente 2-3 sub-consultas específicas. " +
        "Cada sub-consulta debe buscar UN SOLO LADO de la comparación e incluir " +
        "el artículo del ET específico si es inferible. " +
        "Ejemplo: 'diferencia entre renta PJ y PN' → " +
        "'tarifa renta personas jurídicas Art. 240 ET' y 'tarifa renta personas naturales Art. 241 ET'. " +
        "Responde con una sub-consulta por línea, sin numeración ni viñetas."
      : "Descompón esta pregunta tributaria en 2-3 sub-preguntas simples. " +
        "Responde con una sub-pregunta por línea, sin numeración ni viñetas.";

    const { text } = await generateText({
      model: anthropic("claude-haiku-4-5-20251001"),
      maxOutputTokens: 300,
      system: systemPrompt,
      prompt: query,
    });
    return text
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 10)
      .slice(0, 3);
  } catch (error) {
    console.error("[query-enhancer] decomposeQuery failed:", error);
    return [];
  }
}
