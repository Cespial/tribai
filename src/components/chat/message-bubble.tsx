"use client";

import { memo, useState, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { User, Bot, Copy, Check } from "lucide-react";
import type { UIMessage } from "ai";

interface MessageBubbleProps {
  message: UIMessage;
  timestamp?: string;
}

function getMessageText(message: UIMessage): string {
  return message.parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("");
}

function MessageBubbleInner({ message, timestamp }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const text = getMessageText(message);
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API not available
    }
  }, [text]);

  return (
    <div className={`group flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      <div
        className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
          isUser
            ? "bg-foreground text-background"
            : "border border-border bg-gradient-to-br from-muted to-card"
        }`}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4 text-foreground" />}
      </div>
      <div className="relative min-w-0 max-w-[85%] sm:max-w-[80%] md:max-w-xl lg:max-w-2xl">
        <div
          className={`rounded-lg px-4 py-3 ${
            isUser ? "bg-foreground text-background" : "bg-muted"
          }`}
        >
          {isUser ? (
            <p className="break-words text-sm">{text}</p>
          ) : (
            <div className="prose-chat break-words text-sm">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  a: ({ href, children }) => (
                    <a href={href} target="_blank" rel="noopener noreferrer">
                      {children}
                    </a>
                  ),
                  table: ({ children }) => (
                    <div className="table-wrapper">
                      <table>{children}</table>
                    </div>
                  ),
                }}
              >
                {text}
              </ReactMarkdown>
            </div>
          )}
        </div>
        {/* Copy button — always visible on mobile (no hover), hover-reveal on desktop */}
        {!isUser && text && (
          <button
            onClick={handleCopy}
            className="absolute -bottom-1 right-1 rounded-md p-1 text-muted-foreground opacity-100 transition-opacity hover:bg-muted hover:text-foreground sm:opacity-0 sm:group-hover:opacity-100 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-foreground/20 focus-visible:outline-none"
            aria-label="Copiar respuesta"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-foreground" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </button>
        )}
        {timestamp && (
          <p
            className={`mt-1 text-[11px] ${
              isUser ? "text-right text-muted-foreground/80" : "text-muted-foreground/80"
            }`}
          >
            {timestamp}
          </p>
        )}
      </div>
    </div>
  );
}

export const MessageBubble = memo(MessageBubbleInner);
