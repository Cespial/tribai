"use client";

import { Bot } from "lucide-react";

interface TypingIndicatorProps {
  label?: string;
}

export function TypingIndicator({ label = "Analizando artículos y redactando respuesta..." }: TypingIndicatorProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
        <Bot className="h-4 w-4" />
      </div>
      <div className="rounded-lg bg-muted px-3 py-2">
        <div className="flex gap-1">
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]" />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]" />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground" />
        </div>
        <p className="mt-1 text-[11px] text-muted-foreground transition-opacity duration-300">
          {label}
        </p>
      </div>
    </div>
  );
}
