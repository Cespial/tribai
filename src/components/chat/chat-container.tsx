"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useState, useCallback, useMemo, FormEvent, useEffect, useRef } from "react";
import { Scale, Send, Loader2, ArrowRight, Upload, FileSpreadsheet, X, Calculator, Sparkles } from "lucide-react";
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
import { Download, FileJson, FileText, Sheet, Copy as CopyIcon, Check, MessageSquare, Network, Crown } from "lucide-react";
import { clsx } from "clsx";
import dynamic from "next/dynamic";
import type { DeclaracionState } from "@/lib/declaracion-renta/types";
import type { ExogenaResumen } from "@/lib/declaracion-renta/exogena-parser";

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

type AssistantMode = "consulta" | "planificador";
type UserPlan = "basic" | "pro";

const MODE_LABELS: Record<AssistantMode, { label: string; description: string }> = {
  consulta: { label: "Consulta", description: "Consulte el Estatuto Tributario, doctrina DIAN y jurisprudencia" },
  planificador: { label: "Planificador", description: "Simule escenarios y optimice su declaración de renta" },
};

const PLAN_LABELS: Record<UserPlan, { label: string; model: string }> = {
  basic: { label: "Básico", model: "Sonnet" },
  pro: { label: "Pro", model: "Opus" },
};

const PLANIFICADOR_STARTERS = [
  { icon: FileSpreadsheet, label: "Subir Exógena", action: "exogena" as const },
  { icon: Calculator, label: "Soy empleado", action: "empleado" as const },
  { icon: Sparkles, label: "Optimizar impuestos", action: "optimizar" as const },
];

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

function formatCOP(value: number): string {
  return "$" + value.toLocaleString("es-CO");
}

// ── Simulation Panel (for planificador tool results) ─────

function SimulationPanel({ data }: { data: Record<string, unknown> }) {
  const resumen = data.resumen as {
    saldoPagar: number; saldoFavor: number; tasaEfectivaPct: string;
    impuestoTotal: number; retenciones: number; anticipoSiguiente: number;
  } | undefined;
  if (!resumen) return null;
  const isPagar = resumen.saldoPagar > 0;

  return (
    <div className="my-3 rounded-xl border border-border/60 bg-background p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <Calculator className="h-4 w-4 text-primary" />
        <span className="text-xs font-semibold uppercase tracking-[0.05em] text-muted-foreground">Resultado de simulación</span>
      </div>
      <div className={clsx("rounded-lg p-4 text-center", isPagar ? "bg-destructive/5 border border-destructive/20" : "bg-success/5 border border-success/20")}>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{isPagar ? "Total a pagar" : "Saldo a favor"}</p>
        <p className="font-values mt-1 text-3xl font-bold text-foreground">{formatCOP(isPagar ? resumen.saldoPagar : resumen.saldoFavor)}</p>
        <p className="mt-1.5 text-xs text-muted-foreground">Tasa efectiva: <strong className="text-foreground">{resumen.tasaEfectivaPct}</strong></p>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-3 text-center">
        {[
          { label: "Impuesto", value: resumen.impuestoTotal },
          { label: "Retenciones", value: resumen.retenciones },
          { label: "Anticipo sig.", value: resumen.anticipoSiguiente },
        ].map((item) => (
          <div key={item.label} className="rounded-lg bg-muted/30 p-2">
            <p className="text-[10px] text-muted-foreground">{item.label}</p>
            <p className="font-values text-sm font-semibold text-foreground">{formatCOP(item.value)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Tool Result Renderer ─────────────────────────────────

function ToolResults({ message }: { message: { parts?: Array<{ type: string; [k: string]: unknown }> } }) {
  if (!message.parts) return null;
  const results: React.ReactNode[] = [];
  for (const part of message.parts) {
    const p = part as { type: string; toolName?: string; state?: string; result?: unknown };
    if (p.type.startsWith("tool-") && p.state === "result" && p.toolName === "simularDeclaracion" && p.result) {
      results.push(<SimulationPanel key={results.length} data={p.result as Record<string, unknown>} />);
    }
  }
  return results.length > 0 ? <div className="ml-11">{results}</div> : null;
}

// ── Export Helpers ────────────────────────────────────────

function exportToPDF(messages: Array<{ role: string; parts?: Array<{ type: string; text?: string }> }>, title: string) {
  const msgHtml = messages.map((m) => {
    const text = getMessageText(m);
    const isUser = m.role === "user";
    const cls = isUser ? "user" : "assistant";
    const role = isUser ? "Usuario" : "Asistente Tributario";
    return '<div class="message ' + cls + '"><div class="role">' + role + "</div><div>" + text.replace(/\n/g, "<br>") + "</div></div>";
  }).join("");

  const html = [
    '<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>' + title + ' — tribai.co</title>',
    "<style>body{font-family:'Segoe UI',system-ui,sans-serif;max-width:800px;margin:40px auto;padding:0 20px;color:#1a1a1a;line-height:1.6}h1{font-size:24px;border-bottom:2px solid #0066FF;padding-bottom:8px}.message{margin:20px 0;padding:16px;border-radius:8px}.user{background:#f0f0f0}.assistant{background:#f8f9ff;border-left:3px solid #0066FF}.role{font-weight:700;font-size:12px;text-transform:uppercase;letter-spacing:.05em;color:#666;margin-bottom:8px}.footer{margin-top:40px;padding-top:16px;border-top:1px solid #e0e0e0;font-size:11px;color:#888;text-align:center}pre{background:#f5f5f5;padding:12px;border-radius:4px;overflow-x:auto}table{border-collapse:collapse;width:100%;margin:12px 0}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f5f5f5}</style></head><body>",
    "<h1>" + title + "</h1>",
    '<p style="color:#666;font-size:13px;">Generado desde tribai.co — ' + new Date().toLocaleString("es-CO") + "</p>",
    msgHtml,
    '<div class="footer">Derechos Reservados de tribai e inplux &middot; tribai.co</div></body></html>',
  ].join("\n");

  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, "_blank");
  if (win) { win.onload = () => { win.print(); URL.revokeObjectURL(url); }; }
}

function exportToCSV(messages: Array<{ role: string; parts?: Array<{ type: string; text?: string; [k: string]: unknown }> }>) {
  // Extract simulation results
  const rows: Array<Record<string, string | number>> = [];
  for (const msg of messages) {
    if (!msg.parts) continue;
    for (const part of msg.parts) {
      const p = part as { type: string; toolName?: string; state?: string; result?: unknown };
      if (p.type.startsWith("tool-") && p.state === "result" && p.toolName === "simularDeclaracion" && p.result) {
        const data = p.result as Record<string, unknown>;
        const resumen = data.resumen as Record<string, unknown> | undefined;
        if (resumen) {
          rows.push({ Concepto: "Impuesto total", Valor: Number(resumen.impuestoTotal) || 0 });
          rows.push({ Concepto: "Retenciones", Valor: Number(resumen.retenciones) || 0 });
          rows.push({ Concepto: "Saldo a pagar", Valor: Number(resumen.saldoPagar) || 0 });
          rows.push({ Concepto: "Saldo a favor", Valor: Number(resumen.saldoFavor) || 0 });
          rows.push({ Concepto: "Tasa efectiva", Valor: String(resumen.tasaEfectivaPct) || "0%" });
          rows.push({ Concepto: "Anticipo siguiente", Valor: Number(resumen.anticipoSiguiente) || 0 });
        }
      }
    }
  }

  if (rows.length === 0) {
    // Fallback: export chat
    const csvRows = messages.map((m) => {
      const text = getMessageText(m).replace(/"/g, '""');
      return '"' + (m.role === "user" ? "Usuario" : "Asesor") + '","' + text + '"';
    });
    const csv = "Rol,Mensaje\n" + csvRows.join("\n");
    downloadBlob(csv, "conversacion.csv");
    return;
  }

  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(","),
    ...rows.map((r) => headers.map((h) => '"' + String(r[h]).replace(/"/g, '""') + '"').join(",")),
  ].join("\n");
  downloadBlob(csv, "simulacion-tributaria.csv");
}

function downloadBlob(content: string, filename: string) {
  const blob = new Blob(["\uFEFF" + content], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Main Component ───────────────────────────────────────

export function ChatContainer() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isLanding = pathname === "/";
  const heroInputRef = useRef<HTMLTextAreaElement>(null);
  const pageContext = useMemo(() => parsePageContext(pathname), [pathname]);
  const contextualQuestions = useMemo(() => getContextualQuestions(pathname), [pathname]);
  const prefilledInput = useMemo(() => {
    const prompt = searchParams.get("prompt");
    if (!prompt) return "";
    const contextSlug = searchParams.get("contextSlug");
    return contextSlug ? `${prompt}\n\nContexto sugerido: Artículo ${contextSlug}.` : prompt;
  }, [searchParams]);

  // Mode & Plan
  const initialMode = (searchParams.get("mode") as AssistantMode) || "consulta";
  const [mode, setMode] = useState<AssistantMode>(initialMode);
  const [plan, setPlan] = useState<UserPlan>(() => {
    if (typeof window === "undefined") return "basic";
    return (localStorage.getItem("tribai-plan") as UserPlan) || "basic";
  });

  // Persist plan selection
  useEffect(() => {
    localStorage.setItem("tribai-plan", plan);
  }, [plan]);

  // Chat state
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

  // Planificador-specific state
  const [exogenaSummary, setExogenaSummary] = useState<string | null>(null);
  const [exogenaResumen, setExogenaResumen] = useState<ExogenaResumen | null>(null);
  const [sessionState, setSessionState] = useState<DeclaracionState | null>(null);

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

  // Transport — switches API based on mode
  const transport = useMemo(
    () => {
      if (mode === "planificador") {
        return new DefaultChatTransport({
          api: "/api/declaracion/chat",
          body: {
            plan,
            exogenaSummary: exogenaSummary ?? undefined,
            sessionState: sessionState ?? undefined,
          },
        });
      }
      return new DefaultChatTransport({
        api: "/api/chat",
        body: {
          conversationId: selectedConversationId,
          pageContext,
          plan,
          ...(libroFilter ? { filters: { libro: libroFilter } } : {}),
        },
      });
    },
    [mode, plan, libroFilter, pageContext, selectedConversationId, exogenaSummary, sessionState]
  );

  const { messages, setMessages, sendMessage, status, error } = useChat({
    id: "superapp-chat-ui",
    transport,
    messages: currentConversation?.messages || [],
    onError: (err) => {
      const msg = err.message || "Error al procesar la consulta";
      console.error("[chat] Error:", msg.slice(0, 300));
      if (msg.includes("429") || msg.includes("rate") || msg.includes("Demasiadas")) {
        setChatError("Ha excedido el límite de consultas. Espere un momento e intente de nuevo.");
      } else if (msg.includes("timeout") || msg.includes("504")) {
        setChatError("La consulta tardó demasiado. Intente con una pregunta más específica.");
      } else {
        setChatError("Ocurrió un error al procesar su consulta. Intente de nuevo.");
      }
    },
  });

  const isLoading = status === "submitted" || status === "streaming";

  // Focus the hero input only on /asistente
  useEffect(() => {
    if (!isLanding && heroInputRef.current) {
      heroInputRef.current.focus({ preventScroll: true });
    }
  }, [isLanding]);

  // Detect articles from assistant sources to sync with the graph
  useEffect(() => {
    if (status !== "ready") return;
    const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant");
    const sources: SourceCitation[] =
      (lastAssistant?.metadata as { sources?: SourceCitation[] } | undefined)?.sources ?? [];
    if (sources.length > 0) {
      const ids = sources.map(s => s.idArticulo).filter(Boolean);
      if (JSON.stringify(ids) !== JSON.stringify(detectedArticles)) {
        queueMicrotask(() => setDetectedArticles(ids));
      }
    }
  }, [messages, status, detectedArticles]);

  // Typing labels — mode-specific
  useEffect(() => {
    if (status === "submitted") {
      if (mode === "planificador") {
        const t1 = setTimeout(() => setTypingLabel("Evaluando escenarios tributarios..."), 1500);
        const t2 = setTimeout(() => setTypingLabel("Generando recomendaciones..."), 3500);
        return () => { clearTimeout(t1); clearTimeout(t2); };
      } else {
        const t1 = setTimeout(() => setTypingLabel("Analizando artículos relevantes..."), 1500);
        const t2 = setTimeout(() => setTypingLabel("Redactando respuesta jurídica..."), 3500);
        return () => { clearTimeout(t1); clearTimeout(t2); };
      }
    } else if (status === "ready") {
      queueMicrotask(() => setTypingLabel(
        mode === "planificador" ? "Analizando situación fiscal..." : "Buscando en el Estatuto Tributario..."
      ));
    }
  }, [status, mode]);

  // Export handlers
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

  const handleExportPDF = () => {
    const title = mode === "planificador" ? "Planificación Tributaria" : "Consulta Tributaria";
    exportToPDF(messages, title);
    setExporting(false);
  };

  const handleExportCSV = () => {
    exportToCSV(messages);
    setExporting(false);
  };

  const handleCopyAll = async () => {
    const text = messages
      .map((m) => `${m.role === "user" ? "Usuario" : "Asistente"}:\n${getMessageText(m)}`)
      .join("\n\n---\n\n");
    await navigator.clipboard.writeText(text);
    setCopiedAll(true);
    setTimeout(() => { setCopiedAll(false); setExporting(false); }, 2000);
  };

  // Custom event listener
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

  // Load conversation
  useEffect(() => {
    if (!currentConversation) return;
    queueMicrotask(() => {
      setMessages(currentConversation.messages || []);
      setLibroFilter(currentConversation.libroFilter);
    });
  }, [currentConversation, setMessages]);

  // Persist
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
  }, [messages, selectedConversationId, saveConversation, currentConversation, pageContext, libroFilter]);

  // Exógena upload (planificador mode)
  const handleExogenaParsed = useCallback(
    (resumen: ExogenaResumen, resumenTexto: string) => {
      setExogenaResumen(resumen);
      setExogenaSummary(resumenTexto);
      const greeting = resumen.nombreCompleto
        ? `Subí mi Exógena ${resumen.ano || ""}. Mi nombre es ${resumen.nombreCompleto}. Analiza mis datos y dime cómo optimizar mi declaración.`
        : `Subí mi Exógena ${resumen.ano || ""}. Analiza mis datos y dime cómo puedo optimizar mi declaración de renta.`;
      sendMessage({ text: greeting });
    },
    [sendMessage]
  );

  const triggerFileUpload = useCallback(() => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = ".xlsx,.xls";
    fileInput.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const formData = new FormData();
      formData.append("file", file);
      try {
        const res = await fetch("/api/declaracion/parse-exogena", { method: "POST", body: formData });
        if (res.ok) {
          const data = await res.json();
          handleExogenaParsed(data.resumen, data.resumenTexto);
        }
      } catch { /* noop */ }
    };
    fileInput.click();
  }, [handleExogenaParsed]);

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
    setExogenaSummary(null);
    setExogenaResumen(null);
    setSessionState(null);
    persistKeyRef.current = "";
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

  const handleModeChange = useCallback((newMode: AssistantMode) => {
    if (newMode === mode) return;
    setMode(newMode);
    // Don't reset conversation — let user switch modes mid-conversation
  }, [mode]);

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
        await navigator.share({ title: "Respuesta del Asistente Tributario", text });
      } else {
        await navigator.clipboard.writeText(text);
      }
      trackEvent("chat_response_shared", { conversationId: selectedConversationId });
    } catch { /* noop */ }
  };

  // Check for simulation results (for CSV export option)
  const hasSimulationResults = messages.some((msg) =>
    msg.parts?.some((part) => {
      const p = part as { type: string; toolName?: string; state?: string };
      return p.type.startsWith("tool-") && p.state === "result" && p.toolName === "simularDeclaracion";
    })
  );

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
            {/* Toolbar */}
            {!isEmpty && (
              <div className="flex flex-wrap items-center gap-2 border-b border-border/40 px-4 py-2">
                {/* Mode selector */}
                <div className="flex rounded-lg border border-border/50 bg-muted p-0.5">
                  <button
                    onClick={() => handleModeChange("consulta")}
                    className={clsx(
                      "flex items-center gap-1.5 rounded-md px-3 py-1 text-[11px] font-medium transition-all",
                      mode === "consulta" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Scale className="h-3 w-3" />
                    <span className="hidden sm:inline">Consulta</span>
                  </button>
                  <button
                    onClick={() => handleModeChange("planificador")}
                    className={clsx(
                      "flex items-center gap-1.5 rounded-md px-3 py-1 text-[11px] font-medium transition-all",
                      mode === "planificador" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Calculator className="h-3 w-3" />
                    <span className="hidden sm:inline">Planificador</span>
                  </button>
                </div>

                {/* Consulta: filter chips */}
                {mode === "consulta" && (
                  <div className="min-w-0 flex-1">
                    <FilterChips selected={libroFilter} onChange={setLibroFilter} />
                  </div>
                )}

                {/* Planificador: Exógena indicator */}
                {mode === "planificador" && (
                  <div className="min-w-0 flex-1 flex items-center gap-2">
                    {exogenaResumen ? (
                      <div className="flex items-center gap-1.5 rounded-md border border-success/30 bg-success/5 px-2.5 py-1">
                        <FileSpreadsheet className="h-3.5 w-3.5 text-success" />
                        <span className="text-[11px] font-medium text-foreground">Exógena {exogenaResumen.ano}</span>
                        <button onClick={() => { setExogenaResumen(null); setExogenaSummary(null); }} className="ml-1 text-muted-foreground hover:text-foreground">
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={triggerFileUpload}
                        className="inline-flex items-center gap-1.5 rounded-md border border-border/60 bg-background/50 px-2.5 py-1.5 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      >
                        <Upload className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Subir Exógena</span>
                      </button>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-2">
                  {/* Plan badge */}
                  <button
                    onClick={() => setPlan(plan === "basic" ? "pro" : "basic")}
                    className={clsx(
                      "flex items-center gap-1 rounded-md px-2.5 py-1 text-[11px] font-medium transition-all border",
                      plan === "pro"
                        ? "border-tribai-gold/40 bg-tribai-gold/10 text-tribai-gold"
                        : "border-border/50 bg-muted/50 text-muted-foreground hover:text-foreground"
                    )}
                    title={plan === "pro" ? "Plan Pro activo — usando modelos avanzados" : "Plan Básico — clic para cambiar a Pro"}
                  >
                    {plan === "pro" && <Crown className="h-3 w-3" />}
                    {plan === "pro" ? "Pro" : "Básico"}
                  </button>

                  {/* View toggle (consulta only) */}
                  {mode === "consulta" && (
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
                  )}

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
                      <div className="absolute right-0 top-full z-50 mt-1 w-52 rounded-md border border-border bg-card p-1 shadow-lg animate-in fade-in zoom-in-95">
                        <button onClick={handleExportPDF} className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-xs transition-colors hover:bg-muted">
                          <FileText className="h-3.5 w-3.5" />
                          Exportar a PDF
                        </button>
                        {mode === "planificador" && (
                          <button onClick={handleExportCSV} className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-xs transition-colors hover:bg-muted">
                            <Sheet className="h-3.5 w-3.5" />
                            {hasSimulationResults ? "Exportar cálculos (CSV)" : "Exportar chat (CSV)"}
                          </button>
                        )}
                        <button onClick={handleExportJSON} className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-xs transition-colors hover:bg-muted">
                          <FileJson className="h-3.5 w-3.5" />
                          Descargar JSON
                        </button>
                        <button onClick={handleCopyAll} className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-xs transition-colors hover:bg-muted">
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
                    {MODE_LABELS[mode].description}
                  </p>
                </div>

                {/* Mode selector (hero state) */}
                <div className="mb-5 flex rounded-xl border border-border/50 bg-muted/30 p-1">
                  <button
                    onClick={() => handleModeChange("consulta")}
                    className={clsx(
                      "flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-all",
                      mode === "consulta" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Scale className="h-4 w-4" />
                    Consulta
                  </button>
                  <button
                    onClick={() => handleModeChange("planificador")}
                    className={clsx(
                      "flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-all",
                      mode === "planificador" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Calculator className="h-4 w-4" />
                    Planificador
                  </button>
                </div>

                {/* Plan selector */}
                <div className="mb-5 flex items-center gap-2">
                  <button
                    onClick={() => setPlan("basic")}
                    className={clsx(
                      "rounded-full px-4 py-1.5 text-xs font-medium transition-all border",
                      plan === "basic"
                        ? "border-foreground/20 bg-foreground/5 text-foreground"
                        : "border-border/50 text-muted-foreground hover:text-foreground"
                    )}
                  >
                    Básico
                  </button>
                  <button
                    onClick={() => setPlan("pro")}
                    className={clsx(
                      "flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-medium transition-all border",
                      plan === "pro"
                        ? "border-tribai-gold/40 bg-tribai-gold/10 text-tribai-gold"
                        : "border-border/50 text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Crown className="h-3 w-3" />
                    Pro
                  </button>
                </div>

                {/* Hero input */}
                <form onSubmit={handleSubmit} className="w-full max-w-2xl">
                  <div className="relative">
                    <textarea
                      ref={heroInputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          if (input.trim() && !isLoading) handleSubmit();
                        }
                      }}
                      placeholder={mode === "planificador" ? "Describe tu situación fiscal..." : "Escriba su pregunta tributaria aquí..."}
                      rows={1}
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
                      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </button>
                  </div>
                </form>

                {/* Starter chips */}
                <div className="mt-5 flex w-full max-w-2xl flex-wrap justify-center gap-2">
                  {mode === "consulta" ? (
                    contextualQuestions.slice(0, 4).map((q) => (
                      <button
                        key={q}
                        onClick={() => handleQuestionSelect(q)}
                        className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-card/50 px-3.5 py-2 text-xs text-muted-foreground transition-all hover:border-foreground/30 hover:bg-card hover:text-foreground hover:shadow-sm"
                      >
                        <ArrowRight className="h-3 w-3" />
                        <span className="line-clamp-1">{q}</span>
                      </button>
                    ))
                  ) : (
                    PLANIFICADOR_STARTERS.map((s) => (
                      <button
                        key={s.label}
                        onClick={() => {
                          if (s.action === "exogena") {
                            triggerFileUpload();
                          } else if (s.action === "empleado") {
                            sendMessage({ text: "Soy empleado asalariado. Quiero optimizar mi declaración de renta. ¿Qué necesitas saber?" });
                          } else {
                            sendMessage({ text: "Quiero explorar estrategias para reducir mi impuesto de renta legalmente. ¿Qué opciones tengo?" });
                          }
                        }}
                        className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-card/50 px-3.5 py-2 text-xs text-muted-foreground transition-all hover:border-foreground/30 hover:bg-card hover:text-foreground hover:shadow-sm"
                      >
                        <s.icon className="h-3 w-3" />
                        <span>{s.label}</span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-hidden relative">
                {activeView === "chat" || mode === "planificador" ? (
                  <>
                    <MessageList
                      messages={messages}
                      sources={mode === "consulta" ? sources : []}
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
                        trackEvent("chat_feedback_submitted", { conversationId: selectedConversationId, messageId, value });
                      }}
                      getFeedback={(messageId) =>
                        getFeedback(selectedConversationId, messageId)?.value
                      }
                      renderAfterMessage={mode === "planificador" ? (message) => <ToolResults message={message} /> : undefined}
                    />
                  </>
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
                  <button onClick={() => setChatError(null)} className="mt-1 text-xs text-muted-foreground hover:text-foreground">Cerrar</button>
                </div>
              </div>
            )}

            {messages.length > 0 && suggestions.length > 0 && activeView === "chat" && mode === "consulta" && (
              <CalculatorSuggestions suggestions={suggestions} />
            )}

            {/* Bottom input */}
            {!isEmpty && (
              <ChatInput
                input={input}
                setInput={setInput}
                onSubmit={handleSubmit}
                isLoading={isLoading}
                leftSlot={mode === "planificador" && !exogenaResumen ? (
                  <button
                    type="button"
                    onClick={triggerFileUpload}
                    title="Subir Exógena"
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border/60 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    <Upload className="h-4 w-4" />
                  </button>
                ) : undefined}
              />
            )}
          </div>
        </ChatBottomSheet>
      </div>
    </div>
  );
}
