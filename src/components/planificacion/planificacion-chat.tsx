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
    <div className="my-3 rounded-xl border border-border/60 bg-background p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <Calculator className="h-4 w-4 text-primary" />
        <span className="text-xs font-semibold uppercase tracking-[0.05em] text-muted-foreground">
          Resultado de simulación
        </span>
      </div>
      <div
        className={clsx(
          "rounded-lg p-4 text-center",
          isPagar ? "bg-destructive/5 border border-destructive/20" : "bg-success/5 border border-success/20"
        )}
      >
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
          <p className="font-values text-sm font-semibold text-foreground">
            {formatCOP(resumen.impuestoTotal)}
          </p>
        </div>
        <div className="rounded-lg bg-muted/30 p-2">
          <p className="text-[10px] text-muted-foreground">Retenciones</p>
          <p className="font-values text-sm font-semibold text-foreground">
            {formatCOP(resumen.retenciones)}
          </p>
        </div>
        <div className="rounded-lg bg-muted/30 p-2">
          <p className="text-[10px] text-muted-foreground">Anticipo sig.</p>
          <p className="font-values text-sm font-semibold text-foreground">
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
        <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
          <Scale className="h-4 w-4 text-primary" />
        </div>
      )}
      <div
        className={clsx(
          "max-w-[80%] sm:max-w-[75%]",
          isUser
            ? "rounded-2xl rounded-br-md bg-primary px-4 py-3 text-primary-foreground"
            : "rounded-2xl rounded-bl-md bg-muted/40 px-4 py-3 text-foreground"
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
              "prose-chat text-sm leading-relaxed [&_strong]:font-semibold",
              isUser ? "text-primary-foreground [&_a]:text-primary-foreground/80" : "text-foreground [&_a]:text-primary"
            )}
            dangerouslySetInnerHTML={{
              __html: simpleMarkdown(text),
            }}
          />
        )}
      </div>
      {isUser && (
        <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted/60">
          <Briefcase className="h-4 w-4 text-muted-foreground" />
        </div>
      )}
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
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="underline underline-offset-2 transition-colors hover:opacity-80">$1</a>')
    .replace(/^- (.+)/gm, "<li>$1</li>")
    .replace(/(<li>.*<\/li>\n?)+/g, (match) => `<ul class="list-disc pl-4 my-1.5 space-y-0.5">${match}</ul>`)
    .replace(/\n\n/g, '</p><p class="mt-2">')
    .replace(/\n/g, "<br />");
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

// ── Main Component ───────────────────────────────────────

export function PlanificacionChat() {
  const [exogenaSummary, setExogenaSummary] = useState<string | null>(null);
  const [exogenaResumen, setExogenaResumen] = useState<ExogenaResumen | null>(null);
  const [sessionState, setSessionState] = useState<DeclaracionState | null>(null);
  const [showExogenaUpload, setShowExogenaUpload] = useState(false);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  // Focus input after messages load
  useEffect(() => {
    if (!isLoading && textareaRef.current) {
      textareaRef.current.focus({ preventScroll: true });
    }
  }, [isLoading]);

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

  // Inline file upload handler
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
  }, [handleExogenaParsed]);

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
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
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
      {/* Page header — only before conversation starts */}
      {!hasMessages && !showExogenaUpload && (
        <div className="mb-2 text-center">
          <h1 className="heading-serif text-3xl text-foreground sm:text-4xl">
            Planificador Tributario
          </h1>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Analizo tu situación fiscal y te ayudo a encontrar oportunidades de ahorro en tu declaración de renta.
          </p>
        </div>
      )}

      {/* Exógena indicator */}
      {exogenaResumen && (
        <div className="flex items-center gap-2 rounded-lg border border-success/30 bg-success/5 px-4 py-2.5">
          <FileSpreadsheet className="h-4 w-4 shrink-0 text-success" />
          <span className="flex-1 text-xs font-medium text-foreground">
            Exógena {exogenaResumen.ano} cargada
            {exogenaResumen.nombreCompleto && ` — ${exogenaResumen.nombreCompleto}`}
            {" · "}
            {exogenaResumen.rows.length} registros procesados
          </span>
          <button
            type="button"
            onClick={() => {
              setExogenaResumen(null);
              setExogenaSummary(null);
            }}
            className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Chat area */}
      <div
        className={clsx(
          "flex flex-col rounded-xl border border-border/60 bg-card",
          hasMessages ? "min-h-[70vh]" : "min-h-[55vh]"
        )}
      >
        {/* Messages area */}
        <div className="flex flex-1 flex-col gap-5 overflow-y-auto p-5 sm:p-6">
          {/* Empty state */}
          {!hasMessages && !showExogenaUpload && (
            <div className="flex flex-1 flex-col items-center justify-center gap-8">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                  <Scale className="h-7 w-7 text-primary" />
                </div>
                <h2 className="text-lg font-semibold text-foreground">
                  Asesor de Planeación Tributaria
                </h2>
                <p className="mx-auto mt-1.5 max-w-sm text-sm text-muted-foreground">
                  Simulo escenarios, consulto el Estatuto Tributario y te recomiendo estrategias de ahorro.
                </p>
              </div>
              <div className="grid w-full max-w-xl grid-cols-2 gap-3">
                {STARTER_PROMPTS.map((prompt, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleStarter(i)}
                    className="group flex flex-col items-start gap-2 rounded-xl border border-border/60 bg-background p-4 text-left transition-all hover:border-primary/30 hover:bg-muted/20 hover:shadow-sm"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/8 transition-colors group-hover:bg-primary/15">
                      <prompt.icon className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-foreground">
                        {prompt.title}
                      </span>
                      <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
                        {prompt.description}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Exógena upload view */}
          {showExogenaUpload && !hasMessages && (
            <div className="flex flex-1 flex-col items-center justify-center">
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
            </div>
          )}

          {/* Messages */}
          {messages.map((msg) => {
            const text = getMessageText(msg);

            const toolResults: Array<{ toolName: string; result: unknown }> = [];
            if (msg.parts) {
              for (const part of msg.parts) {
                const p = part as { type: string; toolName?: string; state?: string; result?: unknown };
                if (p.type.startsWith("tool-") && p.state === "result" && p.result) {
                  toolResults.push({ toolName: p.toolName ?? "unknown", result: p.result });
                }
              }
            }

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
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <Scale className="h-4 w-4 text-primary" />
              </div>
              <div className="flex items-center gap-2 rounded-2xl rounded-bl-md bg-muted/40 px-4 py-3">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">Analizando...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="border-t border-border/40 p-4">
          <form onSubmit={handleSubmit} className="flex items-end gap-2">
            {/* Upload button */}
            {!exogenaResumen && (
              <button
                type="button"
                onClick={triggerFileUpload}
                title="Subir Exógena"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border/60 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <Upload className="h-4 w-4" />
              </button>
            )}

            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={hasMessages ? "Escribe tu siguiente pregunta..." : "Describe tu situación fiscal..."}
              rows={1}
              disabled={isLoading}
              className="flex-1 resize-none rounded-lg border border-border/60 bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/10 disabled:opacity-50"
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
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-30 disabled:hover:bg-primary"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
          </form>
          <p className="mt-2.5 text-center text-[10px] text-muted-foreground/70">
            Herramienta informativa. No constituye asesoría tributaria profesional.
          </p>
        </div>
      </div>
    </div>
  );
}
