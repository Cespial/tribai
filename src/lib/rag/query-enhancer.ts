import { generateText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { openai } from "@ai-sdk/openai";
import { EnhancedQuery } from "@/types/rag";

function getEnhancerModel() {
  const provider = process.env.LLM_PROVIDER || "anthropic";
  if (provider === "openai") {
    return openai("gpt-4o-mini");
  }
  return anthropic("claude-haiku-4-5-20251001");
}
import { extractArticleRefs, articleNumberToId } from "@/lib/utils/article-parser";
import { detectLibro, expandQuery } from "@/lib/utils/legal-terms";
import { ChatPageContext } from "@/types/chat-history";

// Dictionary of frequently ambiguous Colombian tax terms.
// Each entry maps a term to its possible interpretations and a pattern
// that checks whether the user already disambiguated.
const AMBIGUOUS_TERMS: Array<{
  term: RegExp;
  disambiguated: RegExp;
  hint: string;
}> = [
  {
    term: /\bretenci[oó]n\b/i,
    disambiguated: /retenci[oó]n\s+(en la fuente|iva|dividendo|salari|laboral|renta|autoretenci|autorretenci)/i,
    hint: "El término 'retención' puede referirse a: retención en la fuente sobre salarios (Art. 383), retención por otros pagos (Arts. 392-401), retención de IVA (Art. 437-1), o retención sobre dividendos (Art. 242). Cubre todas las interpretaciones relevantes.",
  },
  {
    term: /\btarifa\b/i,
    disambiguated: /tarifa\s+(de\s+)?(renta|iva|rete|retencion|patrimonio|ganancias|personas\s+jur[ií]d|personas\s+natural|pj|pn|general\s+del?\s+iva)/i,
    hint: "El término 'tarifa' puede referirse a: tarifa de renta PJ (Art. 240), tarifa de renta PN (Art. 241), tarifa general de IVA (Art. 468), o tarifas de retención. Cubre todas las tarifas relevantes.",
  },
  {
    term: /\bsanci[oó]n\b/i,
    disambiguated: /sanci[oó]n\s+(por\s+)?(extemporanei|inexactitud|no\s+declar|correcci|omisi|mora|clausura|extemporáne)/i,
    hint: "El término 'sanción' puede referirse a: sanción por extemporaneidad (Art. 641), por no declarar (Art. 643), por inexactitud (Art. 647), o por corrección (Art. 644). Cubre los principales tipos.",
  },
  {
    term: /\bdescuento\b/i,
    disambiguated: /descuento\s+(tributari|iva|impuestos pagados|donacion|inversi)/i,
    hint: "El término 'descuento' puede referirse a: descuento por IVA pagado en activos fijos (Art. 258-1), descuento por impuestos pagados en el exterior (Art. 254), o descuento por donaciones (Art. 257). Cubre las modalidades principales.",
  },
  {
    term: /\brenta\s+exenta\b/i,
    disambiguated: /renta\s+exenta\s+(de\s+)?(laboral|pension|vivienda|primera\s+vez|aportes|fondo)/i,
    hint: "Las 'rentas exentas' incluyen: 25% de renta laboral (Art. 206 num. 10), pensiones (Art. 206 num. 5), vivienda VIS (Art. 235-2), y aportes a fondos voluntarios (Art. 126-1). Cubre los principales beneficios.",
  },
  {
    term: /\bbase\s+gravable\b/i,
    disambiguated: /base\s+gravable\s+(del?\s+)?(iva|renta|retencion|ica|patrimonio|ganancias)/i,
    hint: "La 'base gravable' varía según el impuesto: base gravable del IVA (Art. 447), base gravable del impuesto de renta (depuración Arts. 26-49), o base de retención en la fuente. Cubre las bases principales.",
  },
  {
    term: /\bhecho\s+generador\b/i,
    disambiguated: /hecho\s+generador\s+(del?\s+)?(iva|renta|gmf|patrimonio|consumo|ganancias)/i,
    hint: "El 'hecho generador' depende del impuesto: IVA (Art. 420), renta (Art. 5-7), GMF (Art. 871), impuesto al patrimonio (Art. 292-2). Cubre los principales hechos generadores.",
  },
  {
    term: /\bexclu[ís]d[oa]s?\b/i,
    disambiguated: /exclu[ís]d[oa]s?\s+(del?\s+)?(iva|impuesto|ventas|renta)/i,
    hint: "Los bienes/servicios 'excluidos' pueden referirse a: excluidos de IVA (Arts. 424, 476) o excluidos de renta. Cubre ambas categorías.",
  },
  {
    term: /\bresponsable\b/i,
    disambiguated: /responsable\s+(del?\s+)?(iva|rete|retencion|impuesto|tribut)/i,
    hint: "El término 'responsable' puede referirse a: responsable del IVA (Art. 437), agente retenedor (Art. 368), o responsable del impuesto de renta (Art. 2). Cubre las principales figuras.",
  },
  {
    term: /\bdeclaraci[oó]n\b/i,
    disambiguated: /declaraci[oó]n\s+(de\s+)?(renta|iva|retencion|patrimonio|activos|informaci|exógena)/i,
    hint: "El término 'declaración' puede referirse a: declaración de renta (Art. 591-596), declaración de IVA (Art. 600), declaración de retención (Art. 606), o información exógena. Cubre los principales tipos.",
  },
];

/**
 * Detect ambiguous polysemic terms in the query and return disambiguation context
 * when the user has NOT already specified a sub-type.
 */
function detectAmbiguity(query: string): string | undefined {
  const hints: string[] = [];
  for (const entry of AMBIGUOUS_TERMS) {
    if (entry.term.test(query) && !entry.disambiguated.test(query)) {
      hints.push(entry.hint);
    }
  }
  if (hints.length === 0) return undefined;
  return hints.join("\n");
}

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

  // Detect polysemic terms and add disambiguation context
  const disambiguationHint = detectAmbiguity(query);

  // Early-exit for direct article lookups: skip all LLM calls
  // "Qué dice el Art. 240", "Muéstrame artículo 592", "Art. 383 del ET"
  const isDirectLookup = detectedArticles.length > 0 &&
    query.length < 80 &&
    /^(qu[eé]|cu[aá]l|mu[eé]str|dame|ver|art[ií]culo|art\.)\s/i.test(query) &&
    !isComplexQuery(query);

  if (isDirectLookup) {
    return {
      original: query,
      rewritten: expanded,
      detectedArticles,
      detectedLibro,
    };
  }

  const [rewritten, hyde, subQueries] = await Promise.all([
    rewriteQuery(expanded),
    shouldUseHyDE(query, detectedArticles, options.useHyDE)
      ? generateHyDE(query, disambiguationHint)
      : Promise.resolve(undefined),
    isComplexQuery(query) ? decomposeQuery(query) : Promise.resolve(undefined),
  ]);

  // Detect if all LLM enhancements failed (degraded mode)
  const degraded = rewritten === expanded && !hyde && (!subQueries || subQueries.length === 0) && !isDirectLookup;

  return {
    original: query,
    rewritten,
    hyde,
    subQueries,
    detectedArticles,
    detectedLibro,
    degraded,
    degradedReason: degraded ? "llm_unavailable" : undefined,
    disambiguationHint,
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
      model: getEnhancerModel(),
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
    console.warn("[query-enhancer] rewriteQuery degraded:", (error as Error).message?.slice(0, 80));
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

async function generateHyDE(query: string, disambiguationHint?: string): Promise<string> {
  try {
    const disambiguationCtx = disambiguationHint
      ? `\n\nNota de desambiguación: ${disambiguationHint}\nGenera el párrafo cubriendo las interpretaciones más relevantes.`
      : "";

    const { text } = await generateText({
      model: getEnhancerModel(),
      maxOutputTokens: 200,
      system:
        "Eres un experto en el Estatuto Tributario colombiano. Genera un párrafo hipotético que podría ser el texto de un artículo del Estatuto Tributario que respondería esta pregunta. Escribe SOLO el párrafo, sin preámbulos." +
        disambiguationCtx,
      prompt: query,
    });
    return text.trim();
  } catch (error) {
    console.warn("[query-enhancer] generateHyDE degraded:", (error as Error).message?.slice(0, 80));
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
      model: getEnhancerModel(),
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
    console.warn("[query-enhancer] decomposeQuery degraded:", (error as Error).message?.slice(0, 80));
    return [];
  }
}
