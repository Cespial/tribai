"use client";

import { useEffect, useRef, useCallback } from "react";
import { MessageBubble } from "./message-bubble";
import { SourceCitation } from "./source-citation";
import { CalculatorSuggestions } from "./calculator-suggestions";
import { MessageActions } from "./message-actions";
import { TypingIndicator } from "./typing-indicator";
import { ConfidenceBadge } from "./confidence-badge";
import type { UIMessage } from "ai";
import type { SourceCitation as SourceType } from "@/types/rag";
import { CalculatorSuggestion } from "@/lib/chat/calculator-context";

interface RagMetadata {
  confidenceLevel?: "high" | "medium" | "low";
  evidenceQuality?: number;
  pipelineMs?: number;
  degradedMode?: boolean;
}

interface MessageMetadata {
  suggestedCalculators?: CalculatorSuggestion[];
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

  const handleScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 100;
    isNearBottomRef.current = nearBottom;

    // If the user scrolled away from the bottom, respect their intent
    if (!nearBottom) {
      userScrolledUpRef.current = true;
    } else {
      userScrolledUpRef.current = false;
    }
  }, []);

  // Scroll to bottom — uses instant scroll during streaming for smoothness,
  // and smooth scroll for discrete events like new messages.
  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    const el = containerRef.current;
    if (!el) return;
    el.scrollTop = behavior === "instant" ? el.scrollHeight : el.scrollTop;
    if (behavior === "smooth") {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    } else {
      // Instant: just jump to bottom without animation
      el.scrollTop = el.scrollHeight;
    }
  }, []);

  useEffect(() => {
    const isNewMessage = messages.length !== prevMessageCountRef.current;
    prevMessageCountRef.current = messages.length;

    // 1. New message added (user sent) — always scroll, reset flag
    if (isNewMessage) {
      userScrolledUpRef.current = false;
      scrollToBottom("smooth");
      return;
    }

    // 2. User scrolled up — respect their intent, never auto-scroll
    if (userScrolledUpRef.current) return;

    // 3. Streaming updates — only scroll if still near bottom
    if (isLoading && isNearBottomRef.current) {
      scrollToBottom("instant");
    }
  }, [messages, isLoading, scrollToBottom]);

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="h-full space-y-4 overflow-y-auto p-4"
    >
      {messages.map((message, index) => {
        const metadata = (message.metadata as MessageMetadata | undefined) || {};
        const suggestedCalculators = metadata.suggestedCalculators || [];
        const ragMetadata = metadata.ragMetadata;
        const messageSources = metadata.sources || (index === messages.length - 1 ? sources : []);
        const isLastMessage = index === messages.length - 1;
        const text = getMessageText(message);

        return (
          <div key={message.id}>
            <MessageBubble message={message} timestamp={metadata.timestamp} />

            {message.role === "assistant" && isLastMessage && messageSources.length > 0 && (
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

            {message.role === "assistant" && isLastMessage && ragMetadata?.confidenceLevel && (
              <div className="ml-11 mt-1.5">
                <ConfidenceBadge
                  confidenceLevel={ragMetadata.confidenceLevel}
                  sourcesCount={messageSources.length}
                  pipelineMs={ragMetadata.pipelineMs}
                  degradedMode={ragMetadata.degradedMode}
                />
              </div>
            )}

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

            {message.role === "assistant" && isLastMessage && suggestedCalculators.length > 0 && (
              <div className="ml-11">
                <CalculatorSuggestions suggestions={suggestedCalculators} />
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
  );
}
