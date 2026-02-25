import { streamText, UIMessage } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { openai } from "@ai-sdk/openai";
import { runRAGPipeline } from "@/lib/rag/pipeline";
import { LIBROS } from "@/config/categories";
import { ChatRequestSchema, validateMessageLength } from "@/lib/api/validation";
import { checkRateLimit } from "@/lib/api/rate-limiter";
import { buildConversationContext } from "@/lib/chat/session-memory";
import { suggestCalculators } from "@/lib/chat/calculator-context";
import type { ChatPageContext } from "@/types/chat-history";
import { setRequestId, logger } from "@/lib/logging/structured-logger";

export const maxDuration = 60;

function getChatModel() {
  const provider = process.env.LLM_PROVIDER || "anthropic";
  if (provider === "openai") {
    return openai(process.env.OPENAI_CHAT_MODEL || "gpt-4o");
  }
  return anthropic(process.env.CHAT_MODEL || "claude-sonnet-4-6");
}

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
  const requestStart = performance.now();

  // Run RAG pipeline
  let system: string;
  let contextBlock: string;
  let sources: Awaited<ReturnType<typeof runRAGPipeline>>["sources"];
  let debugInfo: Awaited<ReturnType<typeof runRAGPipeline>>["debugInfo"];
  try {
    const pipeline = await runRAGPipeline(userQuery, {
      libroFilter,
      conversationHistory,
      pageContext: pageContext as ChatPageContext | undefined,
    });
    system = pipeline.system;
    contextBlock = pipeline.contextBlock;
    sources = pipeline.sources;
    debugInfo = pipeline.debugInfo;
  } catch (error) {
    const totalMs = Math.round(performance.now() - requestStart);
    const msg = error instanceof Error ? error.message : String(error);
    logger.error("Chat request failed", {
      durationMs: totalMs,
      metadata: {
        query: userQuery.slice(0, 100),
        ip,
        conversationId,
        error: msg.slice(0, 200),
        stage: "pipeline",
      },
    });
    return new Response(
      JSON.stringify({ error: msg }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  // Suggest Calculators
  const suggestedCalculators = suggestCalculators(
    userQuery,
    3,
    pageContext as ChatPageContext | undefined
  );

  // Consolidated request log — single JSON line with all observability data
  const totalMs = Math.round(performance.now() - requestStart);
  logger.info("request_complete", {
    durationMs: totalMs,
    metadata: {
      requestId,
      query: userQuery.slice(0, 100),
      ip,
      conversationId,
      queryType: debugInfo?.queryType,
      degradedMode: debugInfo?.degradedMode,
      degradedReason: debugInfo?.degradedReason,
      confidenceLevel: debugInfo?.confidenceLevel,
      evidenceQuality: debugInfo?.evidenceQuality
        ? Math.round(debugInfo.evidenceQuality * 100) / 100
        : undefined,
      topScore: debugInfo?.topScore,
      chunksRetrieved: debugInfo?.chunksRetrieved,
      chunksAfterReranking: debugInfo?.chunksAfterReranking,
      uniqueArticles: debugInfo?.uniqueArticles,
      tokensUsed: debugInfo?.contextTokensUsed,
      contradictionFlags: debugInfo?.contradictionFlags,
      namespaceContribution: debugInfo?.namespaceContribution,
      timings: debugInfo?.timings
        ? {
            enhancement: Math.round(debugInfo.timings.queryEnhancement),
            retrieval: Math.round(debugInfo.timings.retrieval),
            reranking: Math.round(debugInfo.timings.reranking),
            assembly: Math.round(debugInfo.timings.contextAssembly),
            prompt: Math.round(debugInfo.timings.promptBuilding),
            total: Math.round(debugInfo.timings.totalPipeline),
          }
        : undefined,
    },
  });

  const result = streamText({
    model: getChatModel(),
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
            queryType: debugInfo?.queryType,
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
            // Evidence quality (Fase 6)
            confidenceLevel: debugInfo?.confidenceLevel,
            evidenceQuality: debugInfo?.evidenceQuality
              ? Math.round(debugInfo.evidenceQuality * 100) / 100
              : undefined,
            namespaceContribution: debugInfo?.namespaceContribution,
            contradictionFlags: debugInfo?.contradictionFlags,
            // Degraded mode
            degradedMode: debugInfo?.degradedMode,
            degradedReason: debugInfo?.degradedReason,
          },
        };
      }
      return undefined;
    },
  });
}
