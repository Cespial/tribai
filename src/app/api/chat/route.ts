import { streamText, UIMessage } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { runRAGPipeline } from "@/lib/rag/pipeline";
import { LIBROS } from "@/config/categories";
import { ChatRequestSchema, validateMessageLength } from "@/lib/api/validation";
import { checkRateLimit } from "@/lib/api/rate-limiter";
import { buildConversationContext } from "@/lib/chat/session-memory";
import { suggestCalculators } from "@/lib/chat/calculator-context";
import type { ChatPageContext } from "@/types/chat-history";
import { setRequestId, logger } from "@/lib/logging/structured-logger";

export const maxDuration = 60;

const CHAT_MODEL = process.env.CHAT_MODEL || "claude-sonnet-4-6";

function getTextFromMessage(message: UIMessage): string {
  return message.parts
    ?.filter((p) => p.type === "text")
    .map((p) => (p as { type: "text"; text: string }).text)
    .join("") || "";
}

function getClientIP(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return "unknown";
}

export async function POST(req: Request) {
  // Rate limiting
  const ip = getClientIP(req);
  const { allowed, retryAfter } = checkRateLimit(ip);
  if (!allowed) {
    return new Response(
      JSON.stringify({ error: "Demasiadas solicitudes. Intenta de nuevo en unos segundos." }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": String(retryAfter),
        },
      }
    );
  }

  // Parse and validate request body
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return new Response(
      JSON.stringify({ error: "Cuerpo de solicitud inválido." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const parsed = ChatRequestSchema.safeParse(body);
  if (!parsed.success) {
    return new Response(
      JSON.stringify({
        error: "Solicitud inválida.",
        details: parsed.error.issues.map((i) => i.message),
      }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const { messages, filters, pageContext, conversationId } = parsed.data;

  // Validate message length
  const lengthError = validateMessageLength(messages);
  if (lengthError) {
    return new Response(
      JSON.stringify({ error: lengthError }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const lastMessage = messages[messages.length - 1];
  if (!lastMessage || lastMessage.role !== "user") {
    return new Response(
      JSON.stringify({ error: "Falta mensaje del usuario." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const userQuery = getTextFromMessage(lastMessage as unknown as UIMessage);

  // Resolve libro filter
  let libroFilter: string | undefined;
  if (filters?.libro) {
    const libro = LIBROS.find((l) => l.key === filters.libro);
    if (libro) libroFilter = libro.filter;
  }

  // Session Memory
  const conversationHistory = buildConversationContext(
    messages as Array<Record<string, unknown>>,
    5,
    pageContext as ChatPageContext | undefined
  );

  // Initialize structured logging for this request
  const requestId = setRequestId();
  logger.info("Chat request received", {
    metadata: { query: userQuery.slice(0, 100), ip, conversationId },
  });

  // Run RAG pipeline
  const { system, contextBlock, sources, debugInfo } = await runRAGPipeline(userQuery, {
    libroFilter,
    conversationHistory,
    pageContext: pageContext as ChatPageContext | undefined,
  });

  // Suggest Calculators
  const suggestedCalculators = suggestCalculators(
    userQuery,
    3,
    pageContext as ChatPageContext | undefined
  );

  logger.info("RAG pipeline completed", {
    metadata: {
      chunksRetrieved: debugInfo?.chunksRetrieved,
      uniqueArticles: debugInfo?.uniqueArticles,
      pipelineMs: debugInfo?.timings?.totalPipeline
        ? Math.round(debugInfo.timings.totalPipeline)
        : undefined,
    },
  });

  const result = streamText({
    model: anthropic(CHAT_MODEL),
    system,
    messages: [
      { role: "user" as const, content: contextBlock },
    ],
  });

  return result.toUIMessageStreamResponse({
    messageMetadata: ({ part }) => {
      if (part.type === "finish") {
        return {
          sources,
          suggestedCalculators,
          timestamp: new Date().toLocaleString("es-CO"),
          conversationId,
          ragMetadata: {
            chunksRetrieved: debugInfo?.chunksRetrieved,
            chunksAfterReranking: debugInfo?.chunksAfterReranking,
            uniqueArticles: debugInfo?.uniqueArticles,
            tokensUsed: debugInfo?.contextTokensUsed,
            tokensBudget: debugInfo?.contextTokensBudget,
            queryEnhanced: debugInfo?.queryEnhanced,
            hydeGenerated: debugInfo?.hydeGenerated,
            subQueriesCount: debugInfo?.subQueriesCount,
            topScore: debugInfo?.topScore,
            medianScore: debugInfo?.medianScore,
            dynamicThreshold: debugInfo?.dynamicThreshold,
            namespacesSearched: debugInfo?.namespacesSearched,
            siblingChunksAdded: debugInfo?.siblingChunksAdded,
            embeddingCacheHitRate: debugInfo?.embeddingCacheHitRate,
            pipelineMs: debugInfo?.timings?.totalPipeline
              ? Math.round(debugInfo.timings.totalPipeline)
              : undefined,
            timings: debugInfo?.timings
              ? {
                  queryEnhancement: Math.round(debugInfo.timings.queryEnhancement),
                  retrieval: Math.round(debugInfo.timings.retrieval),
                  reranking: Math.round(debugInfo.timings.reranking),
                  contextAssembly: Math.round(debugInfo.timings.contextAssembly),
                  promptBuilding: Math.round(debugInfo.timings.promptBuilding),
                }
              : undefined,
          },
        };
      }
      return undefined;
    },
  });
}
