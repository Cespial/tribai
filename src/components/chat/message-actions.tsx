"use client";

import { Copy, ThumbsDown, ThumbsUp, RefreshCcw, ArrowDownCircle, Share2, Check } from "lucide-react";
import { useState } from "react";
import { clsx } from "clsx";

interface MessageActionsProps {
  text: string;
  onAskAgain: () => void;
  onDeepen: () => void;
  onShare: () => void;
  feedback?: "up" | "down";
  onFeedback: (value: "up" | "down") => void;
}

export function MessageActions({
  text,
  onAskAgain,
  onDeepen,
  onShare,
  feedback,
  onFeedback,
}: MessageActionsProps) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard unavailable.
    }
  };

  return (
    <div className="mt-2 flex flex-wrap items-center gap-1.5">
      <button
        onClick={copy}
        className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-2.5 py-1 text-[11px] text-muted-foreground hover:text-foreground"
      >
        {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
        Copiar
      </button>
      <button
        onClick={onAskAgain}
        className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-2.5 py-1 text-[11px] text-muted-foreground hover:text-foreground"
      >
        <RefreshCcw className="h-3 w-3" />
        Preguntar de nuevo
      </button>
      <button
        onClick={onDeepen}
        className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-2.5 py-1 text-[11px] text-muted-foreground hover:text-foreground"
      >
        <ArrowDownCircle className="h-3 w-3" />
        Profundizar
      </button>
      <button
        onClick={onShare}
        className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-2.5 py-1 text-[11px] text-muted-foreground hover:text-foreground"
      >
        <Share2 className="h-3 w-3" />
        Compartir
      </button>
      <button
        onClick={() => onFeedback("up")}
        title="Respuesta útil"
        className={clsx(
          "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px]",
          feedback === "up"
            ? "border-foreground bg-foreground text-background"
            : "border-border bg-card text-muted-foreground hover:text-foreground"
        )}
      >
        <ThumbsUp className="h-3 w-3" />
      </button>
      <button
        onClick={() => onFeedback("down")}
        title="Respuesta mejorable"
        className={clsx(
          "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px]",
          feedback === "down"
            ? "border-foreground bg-foreground text-background"
            : "border-border bg-card text-muted-foreground hover:text-foreground"
        )}
      >
        <ThumbsDown className="h-3 w-3" />
      </button>
    </div>
  );
}
