"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useState, useCallback, useRef, useMemo, FormEvent, useEffect } from "react";
import {
  Send,
  Loader2,
  Upload,
  FileSpreadsheet,
  X,
  Calculator,
  Scale,
  TrendingDown,
  Sparkles,
  RotateCcw,
  Briefcase,
  Download,
  FileText,
  Sheet,
  Copy as CopyIcon,
  Check,
  ArrowRight,
  Bot,
  User,
} from "lucide-react";
import { clsx } from "clsx";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { UIMessage } from "ai";
import type { DeclaracionState } from "@/lib/declaracion-renta/types";
import type { ExogenaResumen } from "@/lib/declaracion-renta/exogena-parser";
import { ConversationSidebar } from "@/components/chat/conversation-sidebar";
import { TypingIndicator } from "@/components/chat/typing-indicator";
import { usePlanificacionHistory } from "@/hooks/usePlanificacionHistory";
import type { PlanificacionConversation } from "@/lib/planificacion/history-storage";

// ── Helpers ──────────────────────────────────────────────

function getMessageText(message: { parts?: Array<{ type: string; text?: string }> }): string {
  return (
    message.parts
      ?.filter((p) => p.type === "text")
      .map((p) => (p as { type: "text"; text: string }).text || "")
      .join("") || ""
  );
}

function formatCOP(value: number): string {
  return "$" + value.toLocaleString("es-CO");
}

function createConversationId(): string {
  return `plan-${Math.random().toString(36).slice(2, 11)}`;
}

function buildConversationTitle(
  messages: Array<{ role?: string; parts?: Array<{ type: string; text?: string }> }>,
  fallback = "Nueva planificación"
): string {
  const firstUser = messages.find((m) => m.role === "user");
  if (!firstUser) return fallback;
  const text = getMessageText(firstUser);
  if (!text.trim()) return fallback;
  return text.slice(0, 72);
}

// ── Exógena Upload Component ─────────────────────────────

function ExogenaDropzone({
  onParsed,
  isLoading,
}: {
  onParsed: (resumen: ExogenaResumen, resumenTexto: string) => void;
  isLoading: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const processFile = useCallback(
    async (file: File) => {
      setError(null);
      setUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/declaracion/parse-exogena", {
          method: "POST",
          body: formData,
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Error al procesar el archivo.");
        }
        const data = await res.json();
        onParsed(data.resumen, data.resumenTexto);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido.");
      } finally {
        setUploading(false);
      }
    },
    [onParsed]
  );

  if (isLoading) return null;

  return (
    <div className="space-y-2">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const file = e.dataTransfer.files[0];
          if (file) processFile(file);
        }}
        onClick={() => inputRef.current?.click()}
        className={clsx(
          "flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed p-8 transition-all",
          dragOver
            ? "border-primary/60 bg-primary/5 scale-[1.01]"
            : "border-border/60 bg-muted/10 hover:border-primary/40 hover:bg-muted/20"
        )}
      >
        {uploading ? (
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        ) : (
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <Upload className="h-6 w-6 text-primary" />
          </div>
        )}
        <div className="text-center">
          <p className="text-sm font-semibold text-foreground">
            {uploading ? "Procesando tu Exógena..." : "Sube tu reporte Exógena"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Arrastra un archivo .xlsx o haz clic para seleccionar
          </p>
        </div>
        <input ref={inputRef} type="file" accept=".xlsx,.xls" onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) processFile(file);
        }} className="hidden" />
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

// ── Simulation Result Panel ──────────────────────────────

function SimulationPanel({ data }: { data: Record<string, unknown> }) {
  const resumen = data.resumen as {
    saldoPagar: number;
    saldoFavor: number;
    tasaEfectivaPct: string;
    impuestoTotal: number;
    retenciones: number;
    anticipoSiguiente: number;
  } | undefined;

  if (!resumen) return null;
  const isPagar = resumen.saldoPagar > 0;

  return (
    <div className="my-3 rounded-xl border border-border/60 bg-background p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <Calculator className="h-4 w-4 text-primary" />
        <span className="text-xs font-semibold uppercase tracking-[0.05em] text-muted-foreground">
          Resultado de simulación
        </span>
      </div>
      <div className={clsx(
        "rounded-lg p-4 text-center",
        isPagar ? "bg-destructive/5 border border-destructive/20" : "bg-success/5 border border-success/20"
      )}>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {isPagar ? "Total a pagar" : "Saldo a favor"}
        </p>
        <p className="font-values mt-1 text-3xl font-bold text-foreground">
          {formatCOP(isPagar ? resumen.saldoPagar : resumen.saldoFavor)}
        </p>
        <p className="mt-1.5 text-xs text-muted-foreground">
          Tasa efectiva: <strong className="text-foreground">{resumen.tasaEfectivaPct}</strong>
        </p>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-3 text-center">
        <div className="rounded-lg bg-muted/30 p-2">
          <p className="text-[10px] text-muted-foreground">Impuesto</p>
          <p className="font-values text-sm font-semibold text-foreground">{formatCOP(resumen.impuestoTotal)}</p>
        </div>
        <div className="rounded-lg bg-muted/30 p-2">
          <p className="text-[10px] text-muted-foreground">Retenciones</p>
          <p className="font-values text-sm font-semibold text-foreground">{formatCOP(resumen.retenciones)}</p>
        </div>
        <div className="rounded-lg bg-muted/30 p-2">
          <p className="text-[10px] text-muted-foreground">Anticipo sig.</p>
          <p className="font-values text-sm font-semibold text-foreground">{formatCOP(resumen.anticipoSiguiente)}</p>
        </div>
      </div>
    </div>
  );
}

// ── Message Bubble (matches Asistente IA style) ──────────

function PlanMessageBubble({ message }: { message: UIMessage }) {
  const isUser = message.role === "user";
  const text = getMessageText(message);
  const [copied, setCopied] = useState(false);

  const toolResults: Array<{ toolName: string; result: unknown }> = [];
  if (message.parts) {
    for (const part of message.parts) {
      const p = part as { type: string; toolName?: string; state?: string; result?: unknown };
      if (p.type.startsWith("tool-") && p.state === "result" && p.result) {
        toolResults.push({ toolName: p.toolName ?? "unknown", result: p.result });
      }
    }
  }

  if (!text && toolResults.length === 0) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* noop */ }
  };

  return (
    <div className={`group flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      <div className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
        isUser
          ? "bg-foreground text-background"
          : "border border-border bg-gradient-to-br from-muted to-card"
      }`}>
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4 text-foreground" />}
      </div>
      <div className="relative min-w-0 max-w-[85%] sm:max-w-[80%] md:max-w-xl lg:max-w-2xl">
        <div className={`rounded-lg px-4 py-3 ${isUser ? "bg-foreground text-background" : "bg-muted"}`}>
          {/* Tool result cards */}
          {toolResults.map((tr, i) => {
            if (tr.toolName === "simularDeclaracion") {
              return <SimulationPanel key={i} data={tr.result as Record<string, unknown>} />;
            }
            return null;
          })}

          {text && isUser && <p className="break-words text-sm">{text}</p>}
          {text && !isUser && (
            <div className="prose-chat break-words text-sm">
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={{
                a: ({ href, children }) => (
                  <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>
                ),
                table: ({ children }) => (
                  <div className="table-wrapper"><table>{children}</table></div>
                ),
              }}>
                {text}
              </ReactMarkdown>
            </div>
          )}
        </div>
        {!isUser && text && (
          <button
            onClick={handleCopy}
            className="absolute -bottom-1 right-1 rounded-md p-1 text-muted-foreground opacity-100 transition-opacity hover:bg-muted hover:text-foreground sm:opacity-0 sm:group-hover:opacity-100"
            aria-label="Copiar respuesta"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-foreground" /> : <CopyIcon className="h-3.5 w-3.5" />}
          </button>
        )}
      </div>
    </div>
  );
}

// ── Starter Prompts ──────────────────────────────────────

const STARTER_PROMPTS = [
  {
    icon: FileSpreadsheet,
    title: "Tengo mi Exógena",
    description: "Sube tu reporte DIAN y te guío paso a paso",
  },
  {
    icon: Calculator,
    title: "Soy empleado",
    description: "Gano por salario, quiero optimizar mi declaración",
  },
  {
    icon: TrendingDown,
    title: "Soy independiente",
    description: "Facturo por honorarios o servicios personales",
  },
  {
    icon: Sparkles,
    title: "Quiero optimizar",
    description: "Explorar estrategias para reducir el impuesto",
  },
];

// ── Export Helpers ────────────────────────────────────────

function exportToPDF(messages: UIMessage[]) {
  const content = messages
    .map((m) => {
      const text = getMessageText(m);
      return `${m.role === "user" ? "USUARIO" : "ASESOR TRIBUTARIO"}:\n${text}`;
    })
    .join("\n\n" + "─".repeat(60) + "\n\n");

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Planificación Tributaria — tribai.co</title>
  <style>
    body { font-family: 'Segoe UI', system-ui, sans-serif; max-width: 800px; margin: 40px auto; padding: 0 20px; color: #1a1a1a; line-height: 1.6; }
    h1 { font-size: 24px; border-bottom: 2px solid #0066FF; padding-bottom: 8px; }
    .message { margin: 20px 0; padding: 16px; border-radius: 8px; }
    .user { background: #f0f0f0; }
    .assistant { background: #f8f9ff; border-left: 3px solid #0066FF; }
    .role { font-weight: 700; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: #666; margin-bottom: 8px; }
    .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e0e0e0; font-size: 11px; color: #888; text-align: center; }
    pre { background: #f5f5f5; padding: 12px; border-radius: 4px; overflow-x: auto; }
    table { border-collapse: collapse; width: 100%; margin: 12px 0; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background: #f5f5f5; }
  </style>
</head>
<body>
  <h1>Planificación Tributaria</h1>
  <p style="color:#666;font-size:13px;">Generado desde tribai.co — ${new Date().toLocaleString("es-CO")}</p>
  ${messages.map((m) => {
    const text = getMessageText(m);
    const isUser = m.role === "user";
    return `<div class="message ${isUser ? "user" : "assistant"}">
      <div class="role">${isUser ? "Usuario" : "Asesor Tributario"}</div>
      <div>${text.replace(/\n/g, "<br>")}</div>
    </div>`;
  }).join("")}
  <div class="footer">Derechos Reservados de tribai e inplux &middot; tribai.co</div>
</body>
</html>`;

  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, "_blank");
  if (win) {
    win.onload = () => {
      win.print();
      URL.revokeObjectURL(url);
    };
  }
}

function exportToExcel(messages: UIMessage[]) {
  // Extract simulation results from tool invocations
  const rows: Array<Record<string, string | number>> = [];

  for (const msg of messages) {
    if (!msg.parts) continue;
    for (const part of msg.parts) {
      const p = part as { type: string; toolName?: string; state?: string; result?: unknown };
      if (p.type.startsWith("tool-") && p.state === "result" && p.toolName === "simularDeclaracion" && p.result) {
        const data = p.result as Record<string, unknown>;
        const resumen = data.resumen as Record<string, unknown> | undefined;
        if (resumen) {
          rows.push({
            "Concepto": "Impuesto total",
            "Valor": Number(resumen.impuestoTotal) || 0,
          });
          rows.push({
            "Concepto": "Retenciones",
            "Valor": Number(resumen.retenciones) || 0,
          });
          rows.push({
            "Concepto": "Saldo a pagar",
            "Valor": Number(resumen.saldoPagar) || 0,
          });
          rows.push({
            "Concepto": "Saldo a favor",
            "Valor": Number(resumen.saldoFavor) || 0,
          });
          rows.push({
            "Concepto": "Tasa efectiva",
            "Valor": String(resumen.tasaEfectivaPct) || "0%",
          });
          rows.push({
            "Concepto": "Anticipo siguiente",
            "Valor": Number(resumen.anticipoSiguiente) || 0,
          });
        }

        // Cédula breakdown if available
        const cedula = data.cedulaGeneral as Record<string, unknown> | undefined;
        if (cedula) {
          for (const [key, val] of Object.entries(cedula)) {
            if (typeof val === "number") {
              rows.push({ "Concepto": `Cédula general — ${key}`, "Valor": val });
            }
          }
        }
      }
    }
  }

  if (rows.length === 0) {
    // Fallback: export conversation as text
    const csvRows = messages.map((m) => {
      const text = getMessageText(m).replace(/"/g, '""');
      return `"${m.role === "user" ? "Usuario" : "Asesor"}","${text}"`;
    });
    const csv = "Rol,Mensaje\n" + csvRows.join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `planificacion-tributaria-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    return;
  }

  const headers = Object.keys(rows[0]);
  const csvContent = [
    headers.join(","),
    ...rows.map((row) => headers.map((h) => `"${String(row[h]).replace(/"/g, '""')}"`).join(",")),
  ].join("\n");

  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `simulacion-tributaria-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Message List with auto-scroll ────────────────────────

function PlanMessageList({
  messages,
  isLoading,
  typingLabel,
}: {
  messages: UIMessage[];
  isLoading: boolean;
  typingLabel: string;
}) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isNearBottomRef = useRef(true);
  const prevCountRef = useRef(messages.length);
  const userScrolledUpRef = useRef(false);
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  const handleScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 100;
    isNearBottomRef.current = nearBottom;
    setShowScrollBtn(!nearBottom && messages.length > 2);
    userScrolledUpRef.current = !nearBottom;
  }, [messages.length]);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    if (behavior === "smooth") {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    } else {
      const el = containerRef.current;
      if (el) el.scrollTop = el.scrollHeight;
    }
  }, []);

  useEffect(() => {
    const isNew = messages.length !== prevCountRef.current;
    prevCountRef.current = messages.length;
    if (isNew) {
      userScrolledUpRef.current = false;
      setShowScrollBtn(false);
      scrollToBottom("smooth");
      return;
    }
    if (userScrolledUpRef.current) return;
    if (isLoading && isNearBottomRef.current) scrollToBottom("instant");
  }, [messages, isLoading, scrollToBottom]);

  return (
    <div className="relative h-full">
      <div ref={containerRef} onScroll={handleScroll} className="h-full space-y-4 overflow-y-auto p-4">
        {messages.map((msg) => (
          <PlanMessageBubble key={msg.id} message={msg} />
        ))}
        {isLoading && messages[messages.length - 1]?.role === "user" && (
          <TypingIndicator label={typingLabel} />
        )}
        <div ref={bottomRef} />
      </div>
      {showScrollBtn && (
        <button
          onClick={() => {
            userScrolledUpRef.current = false;
            setShowScrollBtn(false);
            scrollToBottom("smooth");
          }}
          className="absolute bottom-4 left-1/2 z-10 flex h-8 w-8 -translate-x-1/2 items-center justify-center rounded-full border border-border bg-card shadow-md transition-all hover:bg-muted"
          aria-label="Ir al final"
        >
          <TrendingDown className="h-4 w-4 text-muted-foreground" />
        </button>
      )}
    </div>
  );
}

// ── Main Component ───────────────────────────────────────

export function PlanificacionChat() {
  const [exogenaSummary, setExogenaSummary] = useState<string | null>(null);
  const [exogenaResumen, setExogenaResumen] = useState<ExogenaResumen | null>(null);
  const [sessionState, setSessionState] = useState<DeclaracionState | null>(null);
  const [showExogenaUpload, setShowExogenaUpload] = useState(false);
  const [input, setInput] = useState("");
  const [selectedConversationId, setSelectedConversationId] = useState(() => createConversationId());
  const [typingLabel, setTypingLabel] = useState("Analizando situación fiscal...");
  const [exporting, setExporting] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);
  const heroInputRef = useRef<HTMLTextAreaElement>(null);
  const persistKeyRef = useRef("");

  const { conversations, saveConversation, removeConversation } = usePlanificacionHistory();

  const currentConversation = conversations.find((c) => c.id === selectedConversationId);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/declaracion/chat",
        body: {
          exogenaSummary: exogenaSummary ?? undefined,
          sessionState: sessionState ?? undefined,
        },
      }),
    [exogenaSummary, sessionState]
  );

  const { messages, setMessages, sendMessage, status } = useChat({
    id: "planificacion-chat-ui",
    transport,
    messages: currentConversation?.messages || [],
  });

  const isLoading = status === "streaming" || status === "submitted";
  const isEmpty = messages.length === 0;

  // Focus hero input
  useEffect(() => {
    if (heroInputRef.current) heroInputRef.current.focus({ preventScroll: true });
  }, []);

  // Typing label stages
  useEffect(() => {
    if (status === "submitted") {
      const t1 = setTimeout(() => setTypingLabel("Evaluando escenarios tributarios..."), 1500);
      const t2 = setTimeout(() => setTypingLabel("Generando recomendaciones..."), 3500);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    } else if (status === "ready") {
      queueMicrotask(() => setTypingLabel("Analizando situación fiscal..."));
    }
  }, [status]);

  // Load conversation when selected
  useEffect(() => {
    if (!currentConversation) return;
    queueMicrotask(() => setMessages(currentConversation.messages || []));
  }, [currentConversation, setMessages]);

  // Persist conversations
  useEffect(() => {
    if (!selectedConversationId || messages.length === 0) return;
    const compactMessages = messages.map((m) => ({
      id: m.id,
      role: m.role,
      text: getMessageText(m),
    }));
    const key = JSON.stringify({ id: selectedConversationId, messages: compactMessages });
    if (persistKeyRef.current === key) return;
    persistKeyRef.current = key;

    const next: PlanificacionConversation = {
      id: selectedConversationId,
      title: buildConversationTitle(messages, currentConversation?.title || "Nueva planificación"),
      createdAt: currentConversation?.createdAt || Date.now(),
      updatedAt: Date.now(),
      messages,
      hasExogena: !!exogenaResumen,
    };
    saveConversation(next);
  }, [messages, selectedConversationId, saveConversation, currentConversation, exogenaResumen]);

  // Handle Exógena upload
  const handleExogenaParsed = useCallback(
    (resumen: ExogenaResumen, resumenTexto: string) => {
      setExogenaResumen(resumen);
      setExogenaSummary(resumenTexto);
      setShowExogenaUpload(false);
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

  const handleStarter = useCallback(
    (index: number) => {
      if (index === 0) { setShowExogenaUpload(true); return; }
      const prompts: Record<number, string> = {
        1: "Soy empleado asalariado. Quiero entender cómo puedo optimizar mi declaración de renta. ¿Qué necesitas saber?",
        2: "Soy independiente y facturo por honorarios y servicios. Quiero planificar mi declaración de renta de forma eficiente. ¿Por dónde empezamos?",
        3: "Ya tengo una idea de cuánto me toca pagar de renta. Quiero explorar estrategias para reducir el impuesto legalmente. ¿Qué opciones tengo?",
      };
      const msg = prompts[index];
      if (msg) sendMessage({ text: msg });
    },
    [sendMessage]
  );

  const handleSubmit = useCallback(
    (e?: FormEvent) => {
      e?.preventDefault();
      if (!input.trim() || isLoading) return;
      sendMessage({ text: input.trim() });
      setInput("");
    },
    [input, isLoading, sendMessage]
  );

  const handleNewConversation = useCallback(() => {
    const id = createConversationId();
    setSelectedConversationId(id);
    setMessages([]);
    setInput("");
    setExogenaSummary(null);
    setExogenaResumen(null);
    setSessionState(null);
    persistKeyRef.current = "";
  }, [setMessages]);

  const handleDeleteConversation = useCallback(
    (conversationId: string) => {
      removeConversation(conversationId);
      if (conversationId !== selectedConversationId) return;
      const next = conversations.find((c) => c.id !== conversationId);
      if (next) setSelectedConversationId(next.id);
      else handleNewConversation();
    },
    [removeConversation, selectedConversationId, conversations, handleNewConversation]
  );

  const handleCopyAll = async () => {
    const text = messages
      .map((m) => `${m.role === "user" ? "Usuario" : "Asesor"}:\n${getMessageText(m)}`)
      .join("\n\n---\n\n");
    await navigator.clipboard.writeText(text);
    setCopiedAll(true);
    setTimeout(() => { setCopiedAll(false); setExporting(false); }, 2000);
  };

  // Check if conversation has simulation results for Excel export
  const hasSimulationResults = messages.some((msg) =>
    msg.parts?.some((part) => {
      const p = part as { type: string; toolName?: string; state?: string };
      return p.type.startsWith("tool-") && p.state === "result" && p.toolName === "simularDeclaracion";
    })
  );

  return (
    <div className="flex h-[calc(100vh-72px)] overflow-hidden">
      {/* Sidebar — reuses ConversationSidebar from Asistente IA */}
      <ConversationSidebar
        conversations={conversations as unknown as import("@/types/chat-history").ChatConversation[]}
        selectedConversationId={selectedConversationId}
        onSelectConversation={setSelectedConversationId}
        onCreateConversation={handleNewConversation}
        onDeleteConversation={handleDeleteConversation}
      />

      {/* Main area */}
      <div className="min-w-0 flex-1">
        <div className="flex h-full flex-col">
          {/* Toolbar — when conversation has messages */}
          {!isEmpty && (
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/40 px-4 py-2">
              {/* Exógena indicator */}
              <div className="flex items-center gap-2">
                {exogenaResumen && (
                  <div className="flex items-center gap-1.5 rounded-md border border-success/30 bg-success/5 px-2.5 py-1">
                    <FileSpreadsheet className="h-3.5 w-3.5 text-success" />
                    <span className="text-[11px] font-medium text-foreground">
                      Exógena {exogenaResumen.ano}
                    </span>
                    <button onClick={() => { setExogenaResumen(null); setExogenaSummary(null); }} className="ml-1 text-muted-foreground hover:text-foreground">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
                {!exogenaResumen && (
                  <button
                    onClick={triggerFileUpload}
                    className="inline-flex items-center gap-1.5 rounded-md border border-border/60 bg-background/50 px-2.5 py-1.5 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Subir Exógena</span>
                  </button>
                )}
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
                  <div className="absolute right-0 top-full z-50 mt-1 w-52 rounded-md border border-border bg-card p-1 shadow-lg animate-in fade-in zoom-in-95">
                    <button
                      onClick={() => { exportToPDF(messages); setExporting(false); }}
                      className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-xs transition-colors hover:bg-muted"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      Exportar a PDF
                    </button>
                    <button
                      onClick={() => { exportToExcel(messages); setExporting(false); }}
                      className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-xs transition-colors hover:bg-muted"
                    >
                      <Sheet className="h-3.5 w-3.5" />
                      {hasSimulationResults ? "Exportar cálculos (CSV)" : "Exportar chat (CSV)"}
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
          )}

          {/* Empty state — hero */}
          {isEmpty ? (
            <div className="flex flex-1 flex-col items-center justify-center px-4 pb-8">
              {!showExogenaUpload ? (
                <>
                  <div className="mb-6 text-center">
                    <div className="mb-4 inline-flex rounded-2xl bg-muted/60 p-4">
                      <Scale className="h-8 w-8 text-foreground" />
                    </div>
                    <h2 className="heading-serif text-2xl sm:text-3xl text-foreground">
                      Planificador Tributario
                    </h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Simulo escenarios, consulto el Estatuto Tributario y te recomiendo estrategias de ahorro
                    </p>
                  </div>

                  {/* Centered hero input */}
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
                        placeholder="Describe tu situación fiscal..."
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
                    {STARTER_PROMPTS.map((prompt, i) => (
                      <button
                        key={i}
                        onClick={() => handleStarter(i)}
                        className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-card/50 px-3.5 py-2 text-xs text-muted-foreground transition-all hover:border-foreground/30 hover:bg-card hover:text-foreground hover:shadow-sm"
                      >
                        <prompt.icon className="h-3 w-3" />
                        <span className="line-clamp-1">{prompt.title}</span>
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                /* Exógena upload view */
                <div className="w-full max-w-md">
                  <ExogenaDropzone onParsed={handleExogenaParsed} isLoading={isLoading} />
                  <button
                    type="button"
                    onClick={() => setShowExogenaUpload(false)}
                    className="mt-4 flex w-full items-center justify-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <RotateCcw className="h-3 w-3" />
                    Volver a las opciones
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Message list */
            <div className="flex-1 overflow-hidden">
              <PlanMessageList messages={messages} isLoading={isLoading} typingLabel={typingLabel} />
            </div>
          )}

          {/* Bottom input — when conversation has messages */}
          {!isEmpty && (
            <div className="border-t border-border/40 px-4 py-3">
              <div className="mx-auto flex max-w-4xl items-end gap-2">
                {!exogenaResumen && (
                  <button
                    type="button"
                    onClick={triggerFileUpload}
                    title="Subir Exógena"
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border/60 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    <Upload className="h-4 w-4" />
                  </button>
                )}
                <form onSubmit={handleSubmit} className="flex flex-1 items-end gap-2">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        if (input.trim() && !isLoading) handleSubmit();
                      }
                    }}
                    placeholder={isLoading ? "Procesando respuesta..." : "Escriba su pregunta..."}
                    rows={1}
                    disabled={isLoading}
                    className="w-full flex-1 resize-none rounded-xl border border-border/60 bg-card px-4 py-3 pr-12 text-sm outline-none transition-all focus:border-foreground/30 focus:shadow-sm focus-visible:ring-1 focus-visible:ring-foreground/10 disabled:cursor-not-allowed disabled:opacity-60"
                    onInput={(e) => {
                      const el = e.currentTarget;
                      el.style.height = "auto";
                      el.style.height = Math.min(el.scrollHeight, 120) + "px";
                    }}
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-foreground text-background transition-all hover:opacity-90 disabled:opacity-30"
                    aria-label="Enviar"
                  >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </button>
                </form>
              </div>
              <p className="mt-2 text-center text-[10px] text-muted-foreground/70">
                Herramienta informativa &middot; Derechos Reservados de tribai e inplux
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
