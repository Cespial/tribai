"use client";

import { useCallback, useSyncExternalStore } from "react";
import {
  readConversations,
  upsertConversation,
  deleteConversation,
  PlanificacionConversation,
} from "@/lib/planificacion/history-storage";
import { STORAGE_EVENTS } from "@/lib/storage/productivity-storage";

const subscribe = (callback: () => void) => {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", callback);
  window.addEventListener(STORAGE_EVENTS.planificacionConversations, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(STORAGE_EVENTS.planificacionConversations, callback);
  };
};

export function usePlanificacionHistory() {
  const conversations = useSyncExternalStore(subscribe, readConversations, () => []);

  const saveConversation = useCallback((conversation: PlanificacionConversation) => {
    upsertConversation(conversation);
  }, []);

  const removeConversation = useCallback((conversationId: string) => {
    deleteConversation(conversationId);
  }, []);

  return { conversations, saveConversation, removeConversation };
}
