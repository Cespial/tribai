export const STORAGE_KEYS = {
  workspaces: "superapp-workspaces-v1",
  bookmarks: "superapp-bookmarks-v2",
  notes: "superapp-notes-v2",
  recents: "superapp-recents-v1",
  chatConversations: "superapp-chat-conversations-v1",
  chatFeedback: "superapp-chat-feedback-v1",
  planificacionConversations: "superapp-planificacion-conversations-v1",
  legacyBookmarks: "superapp-bookmarks",
  legacyNotes: "superapp-notes",
} as const;

export const STORAGE_EVENTS = {
  workspaces: "workspaces-changed",
  bookmarks: "bookmarks-changed",
  notes: "notes-changed",
  recents: "recents-changed",
  chatConversations: "chat-conversations-changed",
  chatFeedback: "chat-feedback-changed",
  planificacionConversations: "planificacion-conversations-changed",
} as const;

export function readJsonStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  const raw = localStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeJsonStorage<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

export function dispatchStorageEvent(eventName: string): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(eventName));
}
