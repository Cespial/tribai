import { AssembledContext } from "@/types/rag";
import { buildContextString } from "./context-assembler";
import { ENHANCED_SYSTEM_PROMPT } from "../chat/system-prompt";
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

  const contextBlock = contextString
    ? `${pageContextBlock}<context>${citationFence}\n${contextString}\n</context>\n\nPregunta del usuario: ${userQuery}`
    : `${pageContextBlock}No se encontraron artículos relevantes en las fuentes consultadas para esta consulta.\n\nPregunta del usuario: ${userQuery}`;

  // Always inject citation instructions (not just when external sources are present)
  const enhancedSystem = conversationHistory
    ? `${ENHANCED_SYSTEM_PROMPT}${CITATION_INSTRUCTIONS}\n\n${conversationHistory}`
    : `${ENHANCED_SYSTEM_PROMPT}${CITATION_INSTRUCTIONS}`;

  return {
    system: enhancedSystem,
    contextBlock,
  };
}
