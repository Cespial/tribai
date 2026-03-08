import { AssembledContext } from "@/types/rag";
import { buildContextString } from "./context-assembler";
import { buildSystemPrompt } from "../chat/system-prompt";
import { ChatPageContext } from "@/types/chat-history";
import { EvidenceCheckResult } from "./evidence-checker";
import { EVIDENCE_THRESHOLDS } from "@/config/constants";

function escapeXml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

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
  const safeUserQuery = escapeXml(userQuery);
  const pageContextBlock = pageContext
    ? `<page_context>\n${escapeXml(JSON.stringify(pageContext, null, 2))}\n</page_context>\n\n`
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

  // Abstention logic: mandatory instructions when evidence is truly insufficient.
  // Trigger on topScore < lowEvidenceFallback (0.45), NOT on confidenceLevel,
  // because "low" confidence includes scores 0.45-0.55 which often have enough
  // evidence to answer. The mandatory format prevents the LLM from hallucinating.
  let evidenceWarning = "";
  if (topScore < EVIDENCE_THRESHOLDS.lowEvidenceFallback && topScore > 0) {
    evidenceWarning = `\n<abstention_required>
INSTRUCCIONES OBLIGATORIAS — La evidencia disponible es insuficiente (score máximo: ${topScore.toFixed(2)}, confianza: ${qualityLabel}).
1. DEBES iniciar tu respuesta con: "⚠️ **Nota:** La información disponible en mi contexto actual sobre este tema es limitada."
2. USA lenguaje condicional: "podría", "según la información disponible", "sería recomendable verificar".
3. NO cites artículos que NO aparezcan en el <context> — inventa CERO contenido.
4. SUGIERE al usuario: reformular la pregunta con términos más específicos, consultar directamente el Estatuto Tributario, o consultar a un profesional tributario.
5. Si no puedes responder con la evidencia disponible, di claramente que no tienes información suficiente.
</abstention_required>`;
  } else if (topScore === 0) {
    evidenceWarning = `\n<abstention_required>
INSTRUCCIONES OBLIGATORIAS — No se encontraron fuentes relevantes para esta consulta.
1. DEBES responder que NO tienes información suficiente en tu contexto actual para esta consulta.
2. NO inventes contenido ni cites artículos que no estén en el contexto.
3. SUGIERE alternativas: reformular la pregunta, consultar directamente el Estatuto Tributario en estatuto.co, o consultar a un profesional tributario.
</abstention_required>`;
  }

  // Contradiction warning: injected when evidence checker detects conflicts
  let contradictionWarning = "";
  if (evidenceCheck?.contradictionFlags && evidenceCheck.contradictionDetails.length > 0) {
    const details = evidenceCheck.contradictionDetails.slice(0, 3).join("; ");
    contradictionWarning = `\n<contradiction_warning>Se detectaron posibles contradicciones entre fuentes: ${details}. Menciona estas diferencias al usuario y prioriza la fuente de mayor jerarquía normativa.</contradiction_warning>`;
  }

  const contextBlock = contextString
    ? `${pageContextBlock}${evidenceTag}${evidenceWarning}${contradictionWarning}\n<context>${citationFence}\n${contextString}\n</context>\n\nPregunta del usuario: ${safeUserQuery}`
    : `${pageContextBlock}${evidenceTag}${evidenceWarning}${contradictionWarning}\nNo se encontraron artículos relevantes en las fuentes consultadas para esta consulta.\n\nPregunta del usuario: ${safeUserQuery}`;

  // Dynamic system prompt with calculator filtering based on query
  const systemPrompt = buildSystemPrompt(userQuery);
  const system = `${systemPrompt}${CITATION_INSTRUCTIONS}`;

  // Conversation history goes in the context block (not system prompt) to prevent
  // cross-turn prompt injection via prior user messages
  const historyBlock = conversationHistory
    ? `\n<conversation_history>\n${escapeXml(conversationHistory)}\n</conversation_history>\n`
    : "";

  return {
    system,
    contextBlock: `${historyBlock}${contextBlock}`,
  };
}
