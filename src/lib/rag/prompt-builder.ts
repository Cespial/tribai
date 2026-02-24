import { AssembledContext } from "@/types/rag";
import { buildContextString } from "./context-assembler";
import { buildSystemPrompt } from "../chat/system-prompt";
import { ChatPageContext } from "@/types/chat-history";
import { EvidenceCheckResult } from "./evidence-checker";
import { EVIDENCE_THRESHOLDS } from "@/config/constants";

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
  pageContext?: ChatPageContext,
  evidenceCheck?: EvidenceCheckResult
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

  // Evidence quality signal: use evidence checker result if available, otherwise compute inline
  const topScore = context.articles.length > 0
    ? Math.max(...context.articles.map(a => a.maxScore))
    : 0;
  const uniqueArticles = context.articles.length;
  const confidenceLevel = evidenceCheck?.confidenceLevel ?? (
    topScore >= 0.6 && uniqueArticles >= 2 ? "high"
    : topScore >= 0.35 && uniqueArticles >= 1 ? "medium"
    : "low"
  );
  const qualityLabel = confidenceLevel === "high" ? "alta" : confidenceLevel === "medium" ? "media" : "baja";

  const evidenceTag = `<evidence_quality score="${topScore.toFixed(2)}" articles="${uniqueArticles}" quality="${qualityLabel}" confidence="${confidenceLevel}" />`;

  // Low-evidence warning: injected when topScore is below fallback threshold
  let evidenceWarning = "";
  if (topScore < EVIDENCE_THRESHOLDS.lowEvidenceFallback && topScore > 0) {
    evidenceWarning = `\n<low_evidence_warning>La evidencia disponible tiene baja relevancia (score máximo: ${topScore.toFixed(2)}). Indica al usuario que la información puede ser limitada y sugiere reformular la pregunta con términos más específicos o consultar directamente el Estatuto Tributario.</low_evidence_warning>`;
  } else if (topScore === 0) {
    evidenceWarning = `\n<low_evidence_warning>No se encontraron fuentes relevantes. Responde que no tienes información suficiente para esta consulta y sugiere alternativas.</low_evidence_warning>`;
  }

  // Contradiction warning: injected when evidence checker detects conflicts
  let contradictionWarning = "";
  if (evidenceCheck?.contradictionFlags && evidenceCheck.contradictionDetails.length > 0) {
    const details = evidenceCheck.contradictionDetails.slice(0, 3).join("; ");
    contradictionWarning = `\n<contradiction_warning>Se detectaron posibles contradicciones entre fuentes: ${details}. Menciona estas diferencias al usuario y prioriza la fuente de mayor jerarquía normativa.</contradiction_warning>`;
  }

  const contextBlock = contextString
    ? `${pageContextBlock}${evidenceTag}${evidenceWarning}${contradictionWarning}\n<context>${citationFence}\n${contextString}\n</context>\n\nPregunta del usuario: ${userQuery}`
    : `${pageContextBlock}${evidenceTag}${evidenceWarning}${contradictionWarning}\nNo se encontraron artículos relevantes en las fuentes consultadas para esta consulta.\n\nPregunta del usuario: ${userQuery}`;

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
