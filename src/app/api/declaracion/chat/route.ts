import { streamText, UIMessage, stepCountIs, smoothStream } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { buildAgentSystemPrompt } from "@/lib/declaracion-renta/agent-prompt";
import {
  createSessionState,
  createSimularDeclaracionTool,
  createConsultarETTool,
  createActualizarPerfilTool,
} from "@/lib/declaracion-renta/agent-tools";
import { checkRateLimitWithHeaders } from "@/lib/api/rate-limiter";
import { logger } from "@/lib/logging/structured-logger";
import type { DeclaracionState } from "@/lib/declaracion-renta/types";
import { getModelForPlan, getUserPlan, isAuthEnabled, type UserPlan } from "@/lib/auth/plan";

export const maxDuration = 120;

function getTextFromMessage(message: UIMessage): string {
  return (
    message.parts
      ?.filter((p) => p.type === "text")
      .map((p) => (p as { type: "text"; text: string }).text)
      .join("") || ""
  );
}

export async function POST(req: Request) {
  // Rate limiting
  const { allowed, retryAfter } = await checkRateLimitWithHeaders(req);
  if (!allowed) {
    return new Response(
      JSON.stringify({ error: "Demasiadas solicitudes. Intenta de nuevo en unos segundos." }),
      {
        status: 429,
        headers: { "Content-Type": "application/json", "Retry-After": String(retryAfter) },
      }
    );
  }

  let body: {
    messages: UIMessage[];
    exogenaSummary?: string;
    sessionState?: DeclaracionState;
    plan?: UserPlan;
  };

  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Cuerpo de solicitud inválido." }, { status: 400 });
  }

  const { messages, exogenaSummary, sessionState: clientState, plan: clientPlan } = body;

  // Resolve plan: verify server-side if auth is available, else trust client
  const plan: UserPlan = isAuthEnabled()
    ? await getUserPlan().catch(() => "basic" as UserPlan)
    : (clientPlan || "basic");

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return Response.json({ error: "No hay mensajes en la solicitud." }, { status: 400 });
  }

  const lastMessage = messages[messages.length - 1];
  if (!lastMessage || lastMessage.role !== "user") {
    return Response.json({ error: "Falta mensaje del usuario." }, { status: 400 });
  }

  const userQuery = getTextFromMessage(lastMessage);
  if (!userQuery.trim()) {
    return Response.json({ error: "El mensaje está vacío." }, { status: 400 });
  }

  // Session state — initialized from client or fresh
  let sessionState = createSessionState(clientState ?? undefined);

  const getState = () => sessionState;
  const setState = (s: DeclaracionState) => { sessionState = s; };

  // Build tools
  const tools = {
    simularDeclaracion: createSimularDeclaracionTool(getState, setState),
    consultarET: createConsultarETTool(),
    actualizarPerfil: createActualizarPerfilTool(getState, setState),
  };

  // Build system prompt
  const system = buildAgentSystemPrompt(exogenaSummary);

  // Build conversation messages for the LLM
  const MAX_HISTORY = 20;
  const MAX_ASSISTANT_CHARS = 3000;

  const previousMessages = messages.slice(0, -1).slice(-MAX_HISTORY);
  const llmMessages: Array<{ role: "user" | "assistant"; content: string }> = [];

  for (const msg of previousMessages) {
    if (msg.role !== "user" && msg.role !== "assistant") continue;
    const text = getTextFromMessage(msg);
    if (!text.trim()) continue;
    const content =
      msg.role === "assistant" && text.length > MAX_ASSISTANT_CHARS
        ? text.slice(0, MAX_ASSISTANT_CHARS) + "..."
        : text;
    const last = llmMessages[llmMessages.length - 1];
    if (last && last.role === msg.role) {
      last.content += "\n\n" + content;
    } else {
      llmMessages.push({ role: msg.role as "user" | "assistant", content });
    }
  }

  // Ensure user-first alternation for Anthropic
  while (llmMessages.length > 0 && llmMessages[0].role !== "user") {
    llmMessages.shift();
  }

  // Add current user message
  const lastLlm = llmMessages[llmMessages.length - 1];
  if (lastLlm && lastLlm.role === "user") {
    llmMessages.push({ role: "assistant" as const, content: "Entendido." });
  }
  llmMessages.push({ role: "user" as const, content: userQuery });

  const requestStart = performance.now();

  try {
    const result = streamText({
      model: anthropic(getModelForPlan(plan, "planificador")),
      system,
      messages: llmMessages,
      tools,
      stopWhen: stepCountIs(5),
      experimental_transform: smoothStream({ delayInMs: 10, chunking: "word" }),
    });

    const totalMs = Math.round(performance.now() - requestStart);
    logger.info("declaracion_agent_request", {
      durationMs: totalMs,
      metadata: {
        query: userQuery.slice(0, 100),
        hasExogena: !!exogenaSummary,
        hasClientState: !!clientState,
        messageCount: messages.length,
      },
    });

    return result.toUIMessageStreamResponse({
      onError: (error) => {
        logger.error("declaracion_agent_stream_error", {
          metadata: {
            error: error instanceof Error ? error.message : String(error),
            query: userQuery.slice(0, 100),
          },
        });
        return "Error al procesar la respuesta del asesor.";
      },
      messageMetadata: ({ part }) => {
        if (part.type === "finish") {
          return {
            sessionState,
            timestamp: new Date().toLocaleString("es-CO"),
          };
        }
        return undefined;
      },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    logger.error("declaracion_agent_failed", {
      metadata: { error: msg.slice(0, 500), query: userQuery.slice(0, 100) },
    });
    return Response.json({ error: "Error al generar la respuesta." }, { status: 500 });
  }
}
