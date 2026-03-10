"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Square, Copy, Check } from "lucide-react";

interface DemoMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: { article: string; estado: "vigente" | "modificado" | "derogado" }[];
  confidence?: "high" | "medium" | "low";
}

const SUGGESTED_QUESTIONS = [
  "¿Debo declarar renta por ingresos de 2025?",
  "¿Cómo calculo retención por salarios?",
  "¿Qué sanción aplica por extemporáneo?",
  "Explique el artículo 241 del ET",
];

const DEMO_CONVERSATION: DemoMessage[] = [
  {
    id: "1",
    role: "user",
    content: "¿Debo declarar renta por ingresos de 2025?",
  },
  {
    id: "2",
    role: "assistant",
    content:
      "Para el año gravable 2025 (declaración en 2026), usted debe declarar renta si cumple **cualquiera** de los siguientes topes:\n\n- **Ingresos brutos** superiores a 1.400 UVT ($73,323,600)\n- **Patrimonio bruto** superior a 4.500 UVT ($235,683,000)\n- **Consumos con tarjeta** superiores a 1.400 UVT\n- **Compras y consumos** superiores a 1.400 UVT\n- **Consignaciones bancarias** superiores a 1.400 UVT\n\nEstos topes están definidos en los **Arts. 592-594 del ET**, con el UVT 2025 de $52.374.",
    sources: [
      { article: "Art. 592", estado: "vigente" },
      { article: "Art. 593", estado: "vigente" },
      { article: "Art. 594", estado: "modificado" },
    ],
    confidence: "high",
  },
];

function ConfidenceDot({ level }: { level: "high" | "medium" | "low" }) {
  const color =
    level === "high"
      ? "bg-success"
      : level === "medium"
        ? "bg-yellow-500"
        : "bg-destructive";
  return (
    <span className="inline-flex items-center gap-1">
      <span className={`inline-block h-1.5 w-1.5 rounded-full ${color}`} />
      <span className="text-[10px] text-muted-foreground capitalize">{level}</span>
    </span>
  );
}

function EstadoDot({ estado }: { estado: "vigente" | "modificado" | "derogado" }) {
  const color =
    estado === "vigente"
      ? "bg-success"
      : estado === "modificado"
        ? "bg-yellow-500"
        : "bg-destructive";
  return <span className={`inline-block h-1.5 w-1.5 rounded-full ${color}`} />;
}

export function AppChatTab() {
  const [messages, setMessages] = useState<DemoMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const msgCounter = useRef(0);

  /* Smart scroll — only auto-scroll if user is near bottom */
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
    if (isNearBottom) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages]);

  function simulateResponse(question: string) {
    msgCounter.current += 1;
    const userMsg: DemoMessage = {
      id: `user-${msgCounter.current}`,
      role: "user",
      content: question,
    };
    setMessages((prev) => [...prev, userMsg]);
    setShowSuggestions(false);
    setIsStreaming(true);
    setInput("");

    // Simulate streaming delay then show demo response
    setTimeout(() => {
      setMessages((prev) => [...prev, DEMO_CONVERSATION[1]]);
      setIsStreaming(false);
    }, 1500);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;
    simulateResponse(input.trim());
  }

  function handleCopy(text: string, id: string) {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 3000);
  }

  return (
    <div className="flex h-full flex-col">
      {/* Nav bar */}
      <div className="flex shrink-0 items-center justify-between border-b border-border bg-card/80 px-4 pb-2.5 pt-14 backdrop-blur-xl">
        <h1 className="text-[17px] font-semibold text-foreground">Asistente IA</h1>
        <div className="flex h-1.5 w-1.5 rounded-full bg-success" aria-label="En línea" />
      </div>

      {/* Messages area */}
      <div ref={scrollRef} className="phone-scroll-area flex-1 overflow-y-auto px-4 py-4">
        {showSuggestions && messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center px-2">
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-tribai-blue/10">
              <svg className="h-7 w-7 text-tribai-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
              </svg>
            </div>
            <p className="mb-1 text-center text-[15px] font-semibold text-foreground">
              Consulte tributaria colombiana
            </p>
            <p className="mb-6 text-center text-[13px] text-muted-foreground">
              Respuestas con artículos del ET y doctrina DIAN
            </p>
            <div className="flex w-full flex-col gap-2">
              {SUGGESTED_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => simulateResponse(q)}
                  className="rounded-xl border border-border bg-card px-4 py-3 text-left text-[13px] leading-snug text-foreground transition-colors active:bg-muted"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {messages.map((msg) => (
              <div key={msg.id}>
                {msg.role === "user" ? (
                  /* User bubble — right aligned, blue */
                  <div className="flex justify-end">
                    <div className="max-w-[85%] rounded-2xl rounded-br-md bg-tribai-blue px-4 py-2.5 text-[14px] leading-relaxed text-white">
                      {msg.content}
                    </div>
                  </div>
                ) : (
                  /* Assistant bubble — left aligned, card bg */
                  <div className="max-w-[92%]">
                    <div className="rounded-2xl rounded-bl-md border border-border bg-card px-4 py-3 text-[14px] leading-relaxed text-foreground">
                      {/* Render markdown-ish content — safe line-by-line */}
                      {msg.content.split("\n").map((line, i) => {
                        if (line === "") return <br key={i} />;
                        const isBullet = line.startsWith("- ");
                        const text = isBullet ? line.slice(2) : line;
                        const rendered = text.split(/(\*\*[^*]+\*\*)/g).map((seg, j) =>
                          seg.startsWith("**") && seg.endsWith("**") ? (
                            <strong key={j} className="font-semibold">{seg.slice(2, -2)}</strong>
                          ) : (
                            <span key={j}>{seg}</span>
                          )
                        );
                        return (
                          <p key={i} className={isBullet ? "ml-2 py-0.5" : "py-0.5"}>
                            {isBullet && <span className="mr-1 text-muted-foreground">•</span>}
                            {rendered}
                          </p>
                        );
                      })}
                    </div>

                    {/* Source citations */}
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {msg.sources.map((s) => (
                          <span
                            key={s.article}
                            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1 text-[11px] font-medium text-foreground"
                          >
                            <EstadoDot estado={s.estado} />
                            {s.article}
                          </span>
                        ))}
                        {msg.confidence && (
                          <ConfidenceDot level={msg.confidence} />
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="mt-1.5 flex items-center gap-2">
                      <button
                        onClick={() => handleCopy(msg.content, msg.id)}
                        className="flex min-h-[44px] items-center gap-1 rounded-md px-3 py-2 text-[11px] text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="h-3 w-3" /> Copiado
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" /> Copiar
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Typing indicator */}
            {isStreaming && (
              <div className="max-w-[92%]">
                <div className="inline-flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-border bg-card px-4 py-3">
                  <span className="app-typing-dot h-2 w-2 rounded-full bg-muted-foreground" style={{ animationDelay: "0ms" }} />
                  <span className="app-typing-dot h-2 w-2 rounded-full bg-muted-foreground" style={{ animationDelay: "150ms" }} />
                  <span className="app-typing-dot h-2 w-2 rounded-full bg-muted-foreground" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Input bar — iOS style */}
      <div className="shrink-0 border-t border-border bg-card/80 px-3 pb-2 pt-2 backdrop-blur-xl">
        <form onSubmit={handleSubmit} className="flex items-end gap-2">
          <div className="flex-1 rounded-2xl border border-border bg-background px-4 py-2.5 focus-within:border-tribai-blue">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Pregunte sobre tributaria..."
              aria-label="Escriba su consulta tributaria"
              className="w-full bg-transparent text-[14px] text-foreground outline-none placeholder:text-muted-foreground"
              disabled={isStreaming}
            />
          </div>
          <button
            type="submit"
            disabled={!input.trim() || isStreaming}
            aria-label={isStreaming ? "Detener" : "Enviar mensaje"}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-tribai-blue text-white transition-opacity disabled:bg-muted disabled:text-muted-foreground"
          >
            {isStreaming ? (
              <Square className="h-4 w-4" fill="currentColor" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
