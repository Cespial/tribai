"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useState, useCallback, useMemo, FormEvent, useEffect, useRef } from "react";
import { Scale, Send, Loader2, ArrowRight } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import { MessageList } from "./message-list";
import { ChatInput } from "./chat-input";
import { FilterChips } from "./filter-chips";
import { CalculatorSuggestions } from "./calculator-suggestions";
import { suggestCalculators } from "@/lib/chat/calculator-context";
import type { SourceCitation } from "@/types/rag";
import { getContextualQuestions, getPageModule } from "@/lib/chat/contextual-questions";
import { useChatHistory } from "@/hooks/useChatHistory";
import { ChatConversation, ChatPageContext } from "@/types/chat-history";
import { ConversationSidebar } from "./conversation-sidebar";
import { trackEvent } from "@/lib/telemetry/events";
import { ChatBottomSheet } from "./chat-bottom-sheet";
import { Download, FileJson, Copy as CopyIcon, Check, MessageSquare, Network } from "lucide-react";
import { clsx } from "clsx";
import dynamic from "next/dynamic";

// Dynamic import for graph to avoid SSR issues
const AssistantGraphView = dynamic(
  () => import("./assistant-graph-view").then((mod) => mod.AssistantGraphView),
  { 
    ssr: false,
    loading: () => (
      <div className="h-full w-full flex items-center justify-center bg-background/50">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }
);

function getMessageText(message: { parts?: Array<{ type: string; text?: string }> }): string {
  return (
    message.parts
      ?.filter((part) => part.type === "text")
      .map((part) => part.text || "")
      .join("") || ""
  );
}

function createConversationId(): string {
  return `conv-${Math.random().toString(36).slice(2, 11)}`;
}

function buildConversationTitle(messages: Array<{ role?: string; parts?: Array<{ type: string; text?: string }> }>, fallback = "Nueva conversación"): string {
  const firstUser = messages.find((message) => message.role === "user");
  if (!firstUser) return fallback;
  const text = getMessageText(firstUser);
  if (!text.trim()) return fallback;
  return text.slice(0, 72);
}

function parsePageContext(pathname: string): ChatPageContext {
  const segments = pathname.split("/").filter(Boolean);
  return {
    pathname,
    module: getPageModule(pathname),
    calculatorSlug: pathname.startsWith("/calculadoras/") ? segments[1] : undefined,
    articleSlug: pathname.startsWith("/articulo/") ? segments[1] : undefined,
  };
}

export function ChatContainer() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isLanding = pathname === "/";
  const pageContext = useMemo(() => parsePageContext(pathname), [pathname]);
  const contextualQuestions = useMemo(() => getContextualQuestions(pathname), [pathname]);
  const prefilledInput = useMemo(() => {
    const prompt = searchParams.get("prompt");
    if (!prompt) return "";
    const contextSlug = searchParams.get("contextSlug");
    return contextSlug
      ? `${prompt}\n\nContexto sugerido: Artículo ${contextSlug}.`
      : prompt;
  }, [searchParams]);

  const [libroFilter, setLibroFilter] = useState<string | undefined>(undefined);
  const [activeView, setActiveView] = useState<"chat" | "graph">("chat");
  const [detectedArticles, setDetectedArticles] = useState<string[]>([]);
  const [input, setInput] = useState(prefilledInput);
  const [selectedConversationId, setSelectedConversationId] = useState(() => createConversationId());
  const [typingLabel, setTypingLabel] = useState("Buscando en el Estatuto Tributario...");
  const [exporting, setExporting] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const persistKeyRef = useRef("");

  const {
    conversations,
    saveConversation,
    removeConversation,
    setFeedback,
    getFeedback,
  } = useChatHistory();

  const currentConversation = conversations.find(
    (conversation) => conversation.id === selectedConversationId
  );

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        body: {
          conversationId: selectedConversationId,
          pageContext,
          ...(libroFilter ? { filters: { libro: libroFilter } } : {}),
        },
      }),
    [libroFilter, pageContext, selectedConversationId]
  );

  const { messages, setMessages, sendMessage, status, error } = useChat({
    id: "superapp-chat-ui",
    transport,
    messages: currentConversation?.messages || [],
    onError: (err) => {
      const msg = err.message || "Error al procesar la consulta";
      if (msg.includes("429") || msg.includes("rate")) {
        setChatError("Ha excedido el límite de consultas. Espere un momento e intente de nuevo.");
      } else if (msg.includes("timeout") || msg.includes("504")) {
        setChatError("La consulta tardó demasiado. Intente con una pregunta más específica.");
      } else {
        setChatError("Ocurrió un error al procesar su consulta. Intente de nuevo.");
      }
    },
  });

  const isLoading = status === "submitted" || status === "streaming";

  // Detect articles from assistant sources to sync with the graph
  useEffect(() => {
    // Only update graph after streaming is done to avoid loops
    if (status !== "ready") return;

    const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant");
    const sources: SourceCitation[] =
      (lastAssistant?.metadata as { sources?: SourceCitation[] } | undefined)?.sources ?? [];
    
    if (sources.length > 0) {
      const ids = sources.map(s => s.idArticulo).filter(Boolean);
      // Avoid updating if the IDs are the same
      if (JSON.stringify(ids) !== JSON.stringify(detectedArticles)) {
        queueMicrotask(() => setDetectedArticles(ids));
      }
    }
  }, [messages, status, detectedArticles]);

  useEffect(() => {
    if (status === "submitted") {
      const t1 = setTimeout(() => setTypingLabel("Analizando artículos relevantes..."), 1500);
      const t2 = setTimeout(() => setTypingLabel("Redactando respuesta jurídica..."), 3500);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    } else if (status === "ready") {
      queueMicrotask(() => setTypingLabel("Buscando en el Estatuto Tributario..."));
    }
  }, [status]);

  const handleExportJSON = () => {
    const data = JSON.stringify(messages, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `conversacion-${selectedConversationId}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setExporting(false);
  };

  const handleCopyAll = async () => {
    const text = messages
      .map((m) => `${m.role === "user" ? "Usuario" : "Asistente"}:\n${getMessageText(m)}`)
      .join("\n\n---\n\n");
    await navigator.clipboard.writeText(text);
    setCopiedAll(true);
    setTimeout(() => {
      setCopiedAll(false);
      setExporting(false);
    }, 2000);
  };

  useEffect(() => {
    const handleCustomQuery = (event: Event) => {
      const customEvent = event as CustomEvent<{ query: string }>;
      const query = customEvent.detail.query;
      if (query && status !== "submitted" && status !== "streaming") {
        setInput("");
        sendMessage({ text: query });
      }
    };

    window.addEventListener("superapp:chat-query", handleCustomQuery);
    return () => window.removeEventListener("superapp:chat-query", handleCustomQuery);
  }, [sendMessage, status, setInput]);

  useEffect(() => {
    if (!currentConversation) return;
    queueMicrotask(() => {
      setMessages(currentConversation.messages || []);
      setLibroFilter(currentConversation.libroFilter);
    });
  }, [currentConversation, setMessages]);

  // Only persist conversations that have actual messages (fixes ghost "Nueva conversación" entries)
  useEffect(() => {
    if (!selectedConversationId || messages.length === 0) return;
    const existing = currentConversation;
    const compactMessages = messages.map((message) => ({
      id: message.id,
      role: message.role,
      text: getMessageText(message),
    }));
    const persistenceKey = JSON.stringify({
      id: selectedConversationId,
      messages: compactMessages,
      libroFilter: libroFilter || null,
      pathname: pageContext.pathname,
    });
    if (persistKeyRef.current === persistenceKey) return;
    persistKeyRef.current = persistenceKey;

    const nextConversation: ChatConversation = {
      id: selectedConversationId,
      title: buildConversationTitle(messages, existing?.title || "Nueva conversación"),
      createdAt: existing?.createdAt || Date.now(),
      updatedAt: Date.now(),
      messages,
      pageContext,
      libroFilter,
    };
    saveConversation(nextConversation);
  }, [
    messages,
    selectedConversationId,
    saveConversation,
    currentConversation,
    pageContext,
    libroFilter,
  ]);

  const handleSubmit = useCallback(
    (e?: FormEvent<HTMLFormElement>) => {
      e?.preventDefault();
      if (!input.trim() || isLoading) return;
      const text = input.trim();
      setInput("");
      setChatError(null);
      sendMessage({ text });
    },
    [input, isLoading, sendMessage]
  );

  const handleQuestionSelect = useCallback(
    (question: string) => {
      setInput("");
      sendMessage({ text: question });
    },
    [sendMessage]
  );

  const handleNewConversation = useCallback(() => {
    const id = createConversationId();
    setSelectedConversationId(id);
    setMessages([]);
    setInput("");
    setLibroFilter(undefined);
    setChatError(null);
    persistKeyRef.current = "";
    // Don't persist until user sends first message — avoids ghost entries in sidebar
  }, [setMessages]);

  const handleDeleteConversation = useCallback(
    (conversationId: string) => {
      removeConversation(conversationId);
      if (conversationId !== selectedConversationId) return;
      const next = conversations.find((conversation) => conversation.id !== conversationId);
      if (next) {
        setSelectedConversationId(next.id);
      } else {
        handleNewConversation();
      }
    },
    [removeConversation, selectedConversationId, conversations, handleNewConversation]
  );

  const lastAssistant = [...messages].reverse().find((message) => message.role === "assistant");
  const sources: SourceCitation[] =
    (lastAssistant?.metadata as { sources?: SourceCitation[] } | undefined)?.sources ?? [];

  const lastUserMessage = [...messages].reverse().find((message) => message.role === "user");
  const userText = lastUserMessage ? getMessageText(lastUserMessage) : "";
  const suggestions = userText ? suggestCalculators(userText, 3, pageContext) : [];

  const isEmpty = messages.length === 0;

  const shareResponse = async (text: string) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Respuesta del Asistente Tributario",
          text,
        });
      } else {
        await navigator.clipboard.writeText(text);
      }
      trackEvent("chat_response_shared", {
        conversationId: selectedConversationId,
      });
    } catch {
      // Share can fail when user cancels.
    }
  };

  return (
    <div className={clsx(
      "flex overflow-hidden transition-all duration-300",
      isLanding ? "h-full rounded-xl border border-border bg-card/50 shadow-sm" : "h-[calc(100vh-3.5rem)]"
    )}>
      {!isLanding && (
        <ConversationSidebar
          conversations={conversations}
          selectedConversationId={selectedConversationId}
          onSelectConversation={setSelectedConversationId}
          onCreateConversation={handleNewConversation}
          onDeleteConversation={handleDeleteConversation}
        />
      )}

      <div className="min-w-0 flex-1">
        <ChatBottomSheet>
          <div className="flex h-full flex-col">
            {/* Toolbar — only show when conversation has messages */}
            {!isEmpty && (
              <div className="flex flex-wrap items-center gap-2 border-b border-border/40 px-4 py-2">
                <div className="min-w-0 flex-1">
                  <FilterChips selected={libroFilter} onChange={setLibroFilter} />
                </div>

                <div className="flex items-center gap-2">
                  {/* Tab Selector */}
                  <div className="flex rounded-lg border border-border/50 bg-muted p-0.5">
                    <button
                      onClick={() => setActiveView("chat")}
                      className={clsx(
                        "flex items-center gap-1.5 rounded-md px-3 py-1 text-[11px] font-medium transition-all",
                        activeView === "chat" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <MessageSquare className="h-3 w-3" />
                      <span className="hidden sm:inline">Chat</span>
                    </button>
                    <button
                      onClick={() => setActiveView("graph")}
                      className={clsx(
                        "flex items-center gap-1.5 rounded-md px-3 py-1 text-[11px] font-medium transition-all",
                        activeView === "graph" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <Network className="h-3 w-3" />
                      <span className="hidden sm:inline">Mapa</span>
                    </button>
                  </div>

                  {/* Export */}
                  <div className="relative">
                    <button
                      onClick={() => setExporting(!exporting)}
                      className="inline-flex items-center gap-1.5 rounded-md border border-border/60 bg-background/50 px-2.5 py-1.5 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Exportar</span>
                    </button>

                    {exporting && (
                      <div className="absolute right-0 top-full z-50 mt-1 w-48 rounded-md border border-border bg-card p-1 shadow-lg animate-in fade-in zoom-in-95">
                        <button
                          onClick={handleExportJSON}
                          className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-xs transition-colors hover:bg-muted"
                        >
                          <FileJson className="h-3.5 w-3.5" />
                          Descargar JSON
                        </button>
                        <button
                          onClick={handleCopyAll}
                          className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-xs transition-colors hover:bg-muted"
                        >
                          {copiedAll ? <Check className="h-3.5 w-3.5 text-success" /> : <CopyIcon className="h-3.5 w-3.5" />}
                          Copiar todo el chat
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {isEmpty ? (
              <div className="flex flex-1 flex-col items-center justify-center px-4 pb-8">
                {/* Hero welcome */}
                <div className="mb-6 text-center">
                  <div className="mb-4 inline-flex rounded-2xl bg-muted/60 p-4">
                    <Scale className="h-8 w-8 text-foreground" />
                  </div>
                  <h2 className="heading-serif text-2xl sm:text-3xl text-foreground">
                    ¿En qué le puedo ayudar?
                  </h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Consulte el Estatuto Tributario, calcule impuestos y resuelva dudas fiscales
                  </p>
                </div>

                {/* Centered hero input */}
                <form
                  onSubmit={handleSubmit}
                  className="w-full max-w-2xl"
                >
                  <div className="relative">
                    <textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          if (input.trim() && !isLoading) handleSubmit();
                        }
                      }}
                      placeholder="Escriba su pregunta tributaria aquí..."
                      rows={1}
                      autoFocus={!isLanding}
                      className="w-full resize-none rounded-2xl border border-border bg-card px-5 py-4 pr-14 text-[15px] shadow-sm outline-none transition-all placeholder:text-muted-foreground/60 focus:border-foreground/30 focus:shadow-md focus:ring-1 focus:ring-foreground/10"
                      style={{ minHeight: "56px", maxHeight: "120px" }}
                      onInput={(e) => {
                        const el = e.currentTarget;
                        el.style.height = "auto";
                        el.style.height = Math.min(el.scrollHeight, 120) + "px";
                      }}
                    />
                    <button
                      type="submit"
                      disabled={!input.trim() || isLoading}
                      className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-xl bg-foreground text-background transition-all hover:opacity-90 disabled:opacity-30"
                      aria-label="Enviar"
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </form>

                {/* Suggested questions as subtle chips */}
                <div className="mt-5 flex w-full max-w-2xl flex-wrap justify-center gap-2">
                  {contextualQuestions.slice(0, 4).map((q) => (
                    <button
                      key={q}
                      onClick={() => handleQuestionSelect(q)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-card/50 px-3.5 py-2 text-xs text-muted-foreground transition-all hover:border-foreground/30 hover:bg-card hover:text-foreground hover:shadow-sm"
                    >
                      <ArrowRight className="h-3 w-3" />
                      <span className="line-clamp-1">{q}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-hidden relative">
                {activeView === "chat" ? (
                  <MessageList
                    messages={messages}
                    sources={sources}
                    isLoading={isLoading}
                    typingLabel={typingLabel}
                    conversationId={selectedConversationId}
                    onAskAgain={(text) =>
                      sendMessage({ text: `Responde de nuevo con otro enfoque profesional:\n\n${text}` })
                    }
                    onDeepen={(text) =>
                      sendMessage({
                        text: `Profundiza jurídicamente esta respuesta con mayor detalle técnico:\n\n${text}`,
                      })
                    }
                    onShare={shareResponse}
                    onFeedback={(messageId, value) => {
                      setFeedback(selectedConversationId, messageId, value);
                      trackEvent("chat_feedback_submitted", {
                        conversationId: selectedConversationId,
                        messageId,
                        value,
                      });
                    }}
                    getFeedback={(messageId) =>
                      getFeedback(selectedConversationId, messageId)?.value
                    }
                  />
                ) : (
                  <AssistantGraphView 
                    articleIds={detectedArticles} 
                    theme={typeof document !== "undefined" && document.documentElement.classList.contains("dark") ? "dark" : "light"}
                  />
                )}
              </div>
            )}

            {/* Error state */}
            {chatError && (
              <div className="mx-4 flex items-start gap-2.5 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3">
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-destructive/20 text-destructive text-[10px] font-bold">!</span>
                <div className="flex-1">
                  <p className="text-sm text-foreground">{chatError}</p>
                  <button
                    onClick={() => setChatError(null)}
                    className="mt-1 text-xs text-muted-foreground hover:text-foreground"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            )}

            {messages.length > 0 && suggestions.length > 0 && activeView === "chat" && (
              <CalculatorSuggestions suggestions={suggestions} />
            )}

            {/* Bottom input — only when conversation has messages (empty state has centered hero input) */}
            {!isEmpty && (
              <ChatInput
                input={input}
                setInput={setInput}
                onSubmit={handleSubmit}
                isLoading={isLoading}
              />
            )}
          </div>
        </ChatBottomSheet>
      </div>
    </div>
  );
}
