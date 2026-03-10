"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { MessageBubble } from "./message-bubble";
import { SourceCitation } from "./source-citation";
import { MessageActions } from "./message-actions";
import { TypingIndicator } from "./typing-indicator";
import { ConfidenceBadge } from "./confidence-badge";
import { ArrowDown } from "lucide-react";
import type { UIMessage } from "ai";
import type { SourceCitation as SourceType } from "@/types/rag";

interface RagMetadata {
  confidenceLevel?: "high" | "medium" | "low";
  evidenceQuality?: number;
  pipelineMs?: number;
  degradedMode?: boolean;
}

interface MessageMetadata {
  suggestedCalculators?: { name: string; href: string; description: string }[];
  sources?: SourceType[];
  timestamp?: string;
  ragMetadata?: RagMetadata;
}

interface MessageListProps {
  messages: UIMessage[];
  sources: SourceType[];
  isLoading: boolean;
  typingLabel?: string;
  conversationId: string;
  onAskAgain: (prompt: string) => void;
  onDeepen: (prompt: string) => void;
  onShare: (text: string) => void;
  onFeedback: (messageId: string, value: "up" | "down") => void;
  getFeedback: (messageId: string) => "up" | "down" | undefined;
}

function getMessageText(message: UIMessage): string {
  return message.parts
    ?.filter((part) => part.type === "text")
    .map((part) => (part as { type: "text"; text: string }).text)
    .join("") || "";
}

export function MessageList({
  messages,
  sources,
  isLoading,
  typingLabel,
  onAskAgain,
  onDeepen,
  onShare,
  onFeedback,
  getFeedback,
}: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isNearBottomRef = useRef(true);
  const prevMessageCountRef = useRef(messages.length);
  const userScrolledUpRef = useRef(false);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const handleScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 100;
    isNearBottomRef.current = nearBottom;
    setShowScrollButton(!nearBottom && messages.length > 2);

    if (!nearBottom) {
      userScrolledUpRef.current = true;
    } else {
      userScrolledUpRef.current = false;
    }
  }, [messages.length]);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    const el = containerRef.current;
    if (!el) return;
    if (behavior === "smooth") {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    } else {
      el.scrollTop = el.scrollHeight;
    }
  }, []);

  useEffect(() => {
    const isNewMessage = messages.length !== prevMessageCountRef.current;
    prevMessageCountRef.current = messages.length;

    if (isNewMessage) {
      userScrolledUpRef.current = false;
      setShowScrollButton(false);
      scrollToBottom("smooth");
      return;
    }

    if (userScrolledUpRef.current) return;

    if (isLoading && isNearBottomRef.current) {
      scrollToBottom("instant");
    }
  }, [messages, isLoading, scrollToBottom]);

  return (
    <div className="relative h-full">
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="h-full space-y-4 overflow-y-auto p-4"
      >
        {messages.map((message, index) => {
          const metadata = (message.metadata as MessageMetadata | undefined) || {};
          const ragMetadata = metadata.ragMetadata;
          const isLastMessage = index === messages.length - 1;
          const text = getMessageText(message);

          // Sources: use per-message metadata, fallback to prop sources for last message
          const messageSources = metadata.sources || (isLastMessage ? sources : []);

          return (
            <div key={message.id}>
              <MessageBubble message={message} timestamp={metadata.timestamp} />

              {/* Source citations — shown for ALL assistant messages */}
              {message.role === "assistant" && messageSources.length > 0 && (
                <div className="ml-11 mt-2 flex flex-wrap gap-1.5">
                  {messageSources.map((source) => (
                    <SourceCitation
                      key={`${message.id}-${source.idArticulo}`}
                      idArticulo={source.idArticulo}
                      titulo={source.titulo}
                      url={source.url}
                      categoriaLibro={source.categoriaLibro}
                      estado={source.estado}
                      slug={source.slug}
                    />
                  ))}
                </div>
              )}

              {/* Confidence badge — shown for ALL assistant messages that have it */}
              {message.role === "assistant" && ragMetadata?.confidenceLevel && (
                <div className="ml-11 mt-1.5">
                  <ConfidenceBadge
                    confidenceLevel={ragMetadata.confidenceLevel}
                    sourcesCount={messageSources.length}
                    pipelineMs={ragMetadata.pipelineMs}
                    degradedMode={ragMetadata.degradedMode}
                  />
                </div>
              )}

              {/* Message actions — for ALL assistant messages with text */}
              {message.role === "assistant" && text && (
                <div className="ml-11">
                  <MessageActions
                    text={text}
                    onAskAgain={() => onAskAgain(text)}
                    onDeepen={() => onDeepen(text)}
                    onShare={() => onShare(text)}
                    feedback={getFeedback(message.id)}
                    onFeedback={(value) => onFeedback(message.id, value)}
                  />
                </div>
              )}
            </div>
          );
        })}

        {isLoading && messages[messages.length - 1]?.role === "user" && (
          <TypingIndicator label={typingLabel} />
        )}

        <div ref={bottomRef} />
      </div>

      {/* Scroll to bottom FAB */}
      {showScrollButton && (
        <button
          onClick={() => {
            userScrolledUpRef.current = false;
            setShowScrollButton(false);
            scrollToBottom("smooth");
          }}
          className="absolute bottom-4 left-1/2 z-10 flex h-8 w-8 -translate-x-1/2 items-center justify-center rounded-full border border-border bg-card shadow-md transition-all hover:bg-muted"
          aria-label="Ir al final"
        >
          <ArrowDown className="h-4 w-4 text-muted-foreground" />
        </button>
      )}
    </div>
  );
}
