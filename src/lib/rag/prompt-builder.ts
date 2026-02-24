import { AssembledContext } from "@/types/rag";
import { buildContextString } from "./context-assembler";
import { buildSystemPrompt } from "../chat/system-prompt";
import { ChatPageContext } from "@/types/chat-history";

const CITATION_INSTRUCTIONS = `

REGLA ABSOLUTA DE CITACIÓN: SOLO cita artículos y fuentes que aparezcan en el <context>. Si el usuario pregunta por un artículo que NO está en el contexto, di "No tengo ese artículo en mi contexto actual" en lugar de inventar el contenido.

Reglas de citación — Cita SIEMPRE las fuentes con el formato correcto según su tipo:
- Artículos del ET: "Art. X ET" — cuando sea posible, incluye link en formato markdown [Art. X ET](/articulo/X)
- Doctrina DIAN: "Concepto DIAN No. XXXXXX de YYYY" o "Oficio DIAN No. XXXXXX de YYYY"
- Jurisprudencia CC: "Sentencia C-XXX de YYYY" o "Sentencia SU-XXX de YYYY"
- Jurisprudencia CE: "Sentencia CE Sección Cuarta, Exp. XXXXX de YYYY"
- Decretos: "Decreto XXXX de YYYY, Art. X" o "Art. X.X.X.X, DUR 1625 de 2016"
- Resoluciones: "Resolución DIAN No. XXXXXX de YYYY"
- Leyes: "Ley XXXX de YYYY, Art. X"

Cuando el contexto incluya fuentes externas (<doctrina>, <jurisprudencia>, <decreto>, <resolucion>), integra esa información en tu respuesta y cítala correctamente.
Jerarquía de fuentes (de mayor a menor autoridad): Constitución > Leyes > Decretos > Sentencias CC (C-, SU-) > Sentencias CE > Resoluciones DIAN > Doctrina DIAN.
Prioriza doctrina vigente sobre revocada, y sentencias de unificación (SU-) sobre sentencias de tutela (T-).`;

export function buildMessages(
  userQuery: string,
  context: AssembledContext,
  conversationHistory: string = "",
  pageContext?: ChatPageContext
): { system: string; contextBlock: string } {
  const contextString = buildContextString(context);
  const pageContextBlock = pageContext
    ? `<page_context>\n${JSON.stringify(pageContext, null, 2)}\n</page_context>\n\n`
    : "";

  // Build citation fence: explicit list of available articles in context
  const availableArticles = context.articles.map((a) => a.idArticulo);
  const citationFence = availableArticles.length > 0
    ? `\nArtículos disponibles en contexto: ${availableArticles.join(", ")}`
    : "";

  // Evidence quality signal: helps the LLM calibrate confidence
  const topScore = context.articles.length > 0
    ? Math.max(...context.articles.map(a => a.maxScore))
    : 0;
  const uniqueArticles = context.articles.length;
  const evidenceQuality = topScore >= 0.6 && uniqueArticles >= 2
    ? "alta"
    : topScore >= 0.35 && uniqueArticles >= 1
      ? "media"
      : "baja";

  const evidenceTag = `<evidence_quality score="${topScore.toFixed(2)}" articles="${uniqueArticles}" quality="${evidenceQuality}" />`;

  const contextBlock = contextString
    ? `${pageContextBlock}${evidenceTag}\n<context>${citationFence}\n${contextString}\n</context>\n\nPregunta del usuario: ${userQuery}`
    : `${pageContextBlock}${evidenceTag}\nNo se encontraron artículos relevantes en las fuentes consultadas para esta consulta.\n\nPregunta del usuario: ${userQuery}`;

  // Dynamic system prompt with calculator filtering based on query
  const systemPrompt = buildSystemPrompt(userQuery);
  const enhancedSystem = conversationHistory
    ? `${systemPrompt}${CITATION_INSTRUCTIONS}\n\n${conversationHistory}`
    : `${systemPrompt}${CITATION_INSTRUCTIONS}`;

  return {
    system: enhancedSystem,
    contextBlock,
  };
}
