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
} from "lucide-react";
import { clsx } from "clsx";
import type { DeclaracionState } from "@/lib/declaracion-renta/types";
import type { ExogenaResumen } from "@/lib/declaracion-renta/exogena-parser";

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

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  if (isLoading) return null;

  return (
    <div className="space-y-2">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={clsx(
          "flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed p-6 transition-colors",
          dragOver
            ? "border-primary/60 bg-primary/5"
            : "border-border/60 bg-muted/20 hover:border-primary/40 hover:bg-muted/30"
        )}
      >
        {uploading ? (
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        ) : (
          <Upload className="h-8 w-8 text-muted-foreground" />
        )}
        <div className="text-center">
          <p className="text-sm font-medium text-foreground">
            {uploading ? "Procesando Exógena..." : "Sube tu reporte Exógena"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Arrastra un archivo .xlsx o haz clic para seleccionar
          </p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
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
    <div className="my-3 rounded-lg border border-border/60 bg-card p-4">
      <div className="mb-3 flex items-center gap-2">
        <Calculator className="h-4 w-4 text-primary" />
        <span className="text-xs font-semibold uppercase tracking-[0.05em] text-muted-foreground">
          Resultado de simulación
        </span>
      </div>
      <div
        className={clsx(
          "rounded-md p-3 text-center",
          isPagar ? "bg-destructive/5" : "bg-success/5"
        )}
      >
        <p className="text-[11px] font-semibold uppercase text-muted-foreground">
          {isPagar ? "Total a pagar" : "Saldo a favor"}
        </p>
        <p className="font-values text-2xl font-semibold text-foreground">
          {formatCOP(isPagar ? resumen.saldoPagar : resumen.saldoFavor)}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Tasa efectiva: <strong>{resumen.tasaEfectivaPct}</strong>
        </p>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-3 text-center">
        <div>
          <p className="text-[10px] text-muted-foreground">Impuesto</p>
          <p className="font-values text-sm font-medium text-foreground">
            {formatCOP(resumen.impuestoTotal)}
          </p>
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground">Retenciones</p>
          <p className="font-values text-sm font-medium text-foreground">
            {formatCOP(resumen.retenciones)}
          </p>
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground">Anticipo sig.</p>
          <p className="font-values text-sm font-medium text-foreground">
            {formatCOP(resumen.anticipoSiguiente)}
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Message Bubble ───────────────────────────────────────

function MessageBubble({
  role,
  text,
  toolResults,
}: {
  role: string;
  text: string;
  toolResults?: Array<{ toolName: string; result: unknown }>;
}) {
  const isUser = role === "user";

  return (
    <div className={clsx("flex gap-3", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10">
          <Scale className="h-3.5 w-3.5 text-primary" />
        </div>
      )}
      <div
        className={clsx(
          "max-w-[85%] rounded-2xl px-4 py-3",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted/50 text-foreground"
        )}
      >
        {/* Tool result cards */}
        {toolResults?.map((tr, i) => {
          if (tr.toolName === "simularDeclaracion") {
            return <SimulationPanel key={i} data={tr.result as Record<string, unknown>} />;
          }
          return null;
        })}

        {/* Text content */}
        {text && (
          <div
            className={clsx(
              "prose-chat text-sm leading-relaxed",
              isUser ? "text-primary-foreground" : "text-foreground"
            )}
            dangerouslySetInnerHTML={{
              __html: simpleMarkdown(text),
            }}
          />
        )}
      </div>
    </div>
  );
}

/**
 * Minimal markdown → HTML for chat bubbles.
 */
function simpleMarkdown(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="underline underline-offset-2 hover:text-primary">$1</a>')
    .replace(/^- (.+)/gm, "<li>$1</li>")
    .replace(/(<li>.*<\/li>\n?)+/g, (match) => `<ul class="list-disc pl-4 my-1">${match}</ul>`)
    .replace(/\n/g, "<br />");
}

// ── Starter Prompts ──────────────────────────────────────

const STARTER_PROMPTS = [
  {
    icon: FileSpreadsheet,
    title: "Tengo mi Exógena",
    description: "Sube tu reporte y te guío paso a paso",
  },
  {
    icon: Calculator,
    title: "Soy empleado",
    description: "Gano por salario, quiero optimizar mi renta",
  },
  {
    icon: TrendingDown,
    title: "Soy independiente",
    description: "Facturo por honorarios/servicios",
  },
  {
    icon: Sparkles,
    title: "Quiero optimizar",
    description: "Ya sé cuánto debo pagar, quiero reducirlo",
  },
];

// ── Main Component ───────────────────────────────────────

export function PlanificacionChat() {
  const [exogenaSummary, setExogenaSummary] = useState<string | null>(null);
  const [exogenaResumen, setExogenaResumen] = useState<ExogenaResumen | null>(null);
  const [sessionState, setSessionState] = useState<DeclaracionState | null>(null);
  const [showExogenaUpload, setShowExogenaUpload] = useState(false);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  const { messages, sendMessage, status } = useChat({
    transport,
  });

  const isLoading = status === "streaming" || status === "submitted";

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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

  // Handle starter prompt click
  const handleStarter = useCallback(
    (index: number) => {
      if (index === 0) {
        setShowExogenaUpload(true);
        return;
      }
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

  // Handle form submit
  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      if (!input.trim() || isLoading) return;
      sendMessage({ text: input.trim() });
      setInput("");
    },
    [input, isLoading, sendMessage]
  );

  // Handle keyboard
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit(e as unknown as FormEvent);
      }
    },
    [handleSubmit]
  );

  const hasMessages = messages.length > 0;

  return (
    <div className="flex flex-col gap-4">
      {/* Exógena indicator */}
      {exogenaResumen && (
        <div className="flex items-center gap-2 rounded-md border border-success/30 bg-success/5 px-3 py-2">
          <FileSpreadsheet className="h-4 w-4 text-success" />
          <span className="flex-1 text-xs text-foreground">
            Exógena {exogenaResumen.ano} cargada
            {exogenaResumen.nombreCompleto && ` — ${exogenaResumen.nombreCompleto}`}
            {" · "}
            {exogenaResumen.rows.length} registros
          </span>
          <button
            type="button"
            onClick={() => {
              setExogenaResumen(null);
              setExogenaSummary(null);
            }}
            className="rounded p-0.5 text-muted-foreground hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Chat area */}
      <div className="min-h-[60vh] rounded-xl border border-border/60 bg-card">
        {/* Messages */}
        <div className="flex flex-col gap-4 p-4 sm:p-6" style={{ minHeight: "50vh" }}>
          {!hasMessages && !showExogenaUpload && (
            <div className="flex flex-1 flex-col items-center justify-center gap-6">
              <div className="text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Scale className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-lg font-semibold text-foreground">
                  Asesor de Planeación Tributaria
                </h2>
                <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                  Te ayudo a planificar tu declaración de renta y encontrar oportunidades de ahorro fiscal.
                </p>
              </div>
              <div className="grid w-full max-w-lg grid-cols-2 gap-3">
                {STARTER_PROMPTS.map((prompt, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleStarter(i)}
                    className="flex flex-col items-start gap-1.5 rounded-lg border border-border/60 bg-background p-3 text-left transition-colors hover:border-primary/30 hover:bg-muted/30"
                  >
                    <prompt.icon className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-foreground">
                      {prompt.title}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      {prompt.description}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {showExogenaUpload && !hasMessages && (
            <div className="mx-auto w-full max-w-md pt-8">
              <ExogenaDropzone onParsed={handleExogenaParsed} isLoading={isLoading} />
              <button
                type="button"
                onClick={() => setShowExogenaUpload(false)}
                className="mt-3 w-full text-center text-xs text-muted-foreground hover:text-foreground"
              >
                Cancelar
              </button>
            </div>
          )}

          {messages.map((msg) => {
            const text = getMessageText(msg);

            // Collect tool results from parts
            const toolResults: Array<{ toolName: string; result: unknown }> = [];
            if (msg.parts) {
              for (const part of msg.parts) {
                const p = part as { type: string; toolName?: string; state?: string; result?: unknown };
                if (p.type.startsWith("tool-") && p.state === "result" && p.result) {
                  toolResults.push({ toolName: p.toolName ?? "unknown", result: p.result });
                }
              }
            }

            // Skip messages that are only tool calls with no text
            if (!text && toolResults.length === 0) return null;

            return (
              <MessageBubble
                key={msg.id}
                role={msg.role}
                text={text}
                toolResults={toolResults}
              />
            );
          })}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Analizando...
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-border/40 p-3 sm:p-4">
          {/* Upload button (when no exógena loaded and conversation started) */}
          {!exogenaResumen && hasMessages && (
            <div className="mb-2">
              <button
                type="button"
                onClick={() => {
                  const fileInput = document.createElement("input");
                  fileInput.type = "file";
                  fileInput.accept = ".xlsx,.xls";
                  fileInput.onchange = async (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (!file) return;
                    const formData = new FormData();
                    formData.append("file", file);
                    try {
                      const res = await fetch("/api/declaracion/parse-exogena", {
                        method: "POST",
                        body: formData,
                      });
                      if (res.ok) {
                        const data = await res.json();
                        handleExogenaParsed(data.resumen, data.resumenTexto);
                      }
                    } catch {
                      // Silently fail
                    }
                  };
                  fileInput.click();
                }}
                className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <Upload className="h-3 w-3" />
                Subir Exógena
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex items-end gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escribe tu pregunta sobre renta..."
              rows={1}
              disabled={isLoading}
              className="flex-1 resize-none rounded-lg border border-border/60 bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/20 disabled:opacity-50"
              style={{ maxHeight: "120px" }}
              onInput={(e) => {
                const el = e.currentTarget;
                el.style.height = "auto";
                el.style.height = Math.min(el.scrollHeight, 120) + "px";
              }}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-40"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
          </form>
          <p className="mt-2 text-center text-[10px] text-muted-foreground">
            Herramienta informativa. No constituye asesoría tributaria profesional.
          </p>
        </div>
      </div>
    </div>
  );
}
