"use client";

import {
  STORAGE_EVENTS,
  STORAGE_KEYS,
  dispatchStorageEvent,
  readJsonStorage,
  writeJsonStorage,
} from "@/lib/storage/productivity-storage";
import type { UIMessage } from "ai";

export interface PlanificacionConversation {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: UIMessage[];
  hasExogena?: boolean;
}

const MAX_CONVERSATIONS = 30;
const MAX_MESSAGES = 80;

function sanitize(c: PlanificacionConversation): PlanificacionConversation {
  return {
    ...c,
    title: c.title.trim() || "Conversación sin título",
    updatedAt: Date.now(),
    messages: c.messages.slice(-MAX_MESSAGES),
  };
}

let _cache: { raw: string; parsed: PlanificacionConversation[] } | null = null;

export function readConversations(): PlanificacionConversation[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(STORAGE_KEYS.planificacionConversations) ?? "";
  if (_cache && _cache.raw === raw) return _cache.parsed;
  const parsed = readJsonStorage<PlanificacionConversation[]>(STORAGE_KEYS.planificacionConversations, [])
    .map((c) => ({
      ...c,
      title: c.title || "Conversación sin título",
      messages: Array.isArray(c.messages) ? c.messages : [],
    }))
    .sort((a, b) => b.updatedAt - a.updatedAt);
  _cache = { raw, parsed };
  return parsed;
}

function writeConversations(conversations: PlanificacionConversation[]): void {
  _cache = null;
  const cleaned = conversations
    .map(sanitize)
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, MAX_CONVERSATIONS);
  writeJsonStorage(STORAGE_KEYS.planificacionConversations, cleaned);
  dispatchStorageEvent(STORAGE_EVENTS.planificacionConversations);
}

export function upsertConversation(conversation: PlanificacionConversation): void {
  const current = readConversations();
  const next = current.filter((c) => c.id !== conversation.id);
  writeConversations([sanitize(conversation), ...next]);
}

export function deleteConversation(conversationId: string): void {
  const current = readConversations();
  writeConversations(current.filter((c) => c.id !== conversationId));
}
