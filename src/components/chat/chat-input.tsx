"use client";

import { FormEvent, useRef, useEffect, useCallback } from "react";
import { Send, Loader2 } from "lucide-react";

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
}

export function ChatInput({
  input,
  setInput,
  onSubmit,
  isLoading,
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, 120) + "px";
    }
  }, [input]);

  // Cmd/Ctrl+K shortcut to focus input
  useEffect(() => {
    function handleGlobalKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        textareaRef.current?.focus();
      }
      if (e.key === "Escape" && document.activeElement === textareaRef.current) {
        textareaRef.current?.blur();
      }
    }
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        if (input.trim() && !isLoading && formRef.current) {
          formRef.current.requestSubmit();
        }
      }
    },
    [input, isLoading]
  );

  return (
    <form ref={formRef} onSubmit={onSubmit} className="border-t border-border/40 px-4 py-3">
      <div className="mx-auto flex max-w-4xl items-end gap-2">
        <div className="relative flex-1">
          <label htmlFor="chat-input" className="sr-only">
            Pregunta sobre tributaria colombiana
          </label>
          <textarea
            id="chat-input"
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isLoading ? "Procesando respuesta..." : "Escriba su pregunta..."}
            rows={1}
            className="w-full resize-none rounded-xl border border-border/60 bg-card px-4 py-3 pr-12 text-sm outline-none transition-all focus:border-foreground/30 focus:shadow-sm focus-visible:ring-1 focus-visible:ring-foreground/10 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isLoading}
          />
        </div>
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-foreground text-background transition-all hover:opacity-90 disabled:opacity-30 focus-visible:ring-2 focus-visible:ring-foreground/20 focus-visible:outline-none"
          aria-label={isLoading ? "Procesando" : "Enviar mensaje"}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </button>
      </div>
      <p className="mt-2 text-center text-[10px] text-muted-foreground/70">
        Herramienta informativa &middot; Derechos Reservados de tribai e inplux
      </p>
    </form>
  );
}
