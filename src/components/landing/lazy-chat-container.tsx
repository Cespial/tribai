"use client";

import dynamic from "next/dynamic";
import { ChatSkeleton } from "@/components/landing/chat-skeleton";

const DynamicChatContainer = dynamic(
  () => import("@/components/chat/chat-container").then((mod) => mod.ChatContainer),
  {
    ssr: false,
    loading: () => (
      <div aria-busy="true" aria-label="Cargando asistente IA">
        <ChatSkeleton />
      </div>
    ),
  }
);

export function LazyChatContainer() {
  return <DynamicChatContainer />;
}
