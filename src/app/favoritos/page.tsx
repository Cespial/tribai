"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Bookmark,
  StickyNote,
  Upload,
  Search,
  Clock3,
  Plus,
  FolderOpen,
  ExternalLink,
  Trash2,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { clsx } from "clsx";
import { useBookmarks } from "@/hooks/useBookmarks";
import { useNotes } from "@/hooks/useNotes";
import { useWorkspaces } from "@/hooks/useWorkspaces";
import { useRecents } from "@/hooks/useRecents";
import { WorkspaceSidebar } from "@/components/workspace/workspace-sidebar";
import { WorkspaceCard } from "@/components/workspace/workspace-card";
import { NoteEditor } from "@/components/workspace/note-editor";
import { TagInput } from "@/components/workspace/tag-input";
import { WorkspaceExportMenu } from "@/components/workspace/workspace-export-menu";
import { downloadJsonFile } from "@/lib/export/toJson";
import {
  STORAGE_EVENTS,
  STORAGE_KEYS,
  dispatchStorageEvent,
  writeJsonStorage,
} from "@/lib/storage/productivity-storage";
import { DEFAULT_WORKSPACE_ID } from "@/types/productivity";
import { UI_COPY } from "@/config/ui-copy";
import { trackEvent } from "@/lib/telemetry/events";

type ActiveTab = "favoritos" | "notas";

export default function FavoritosPage() {
  const { workspaces, addWorkspace } = useWorkspaces();
  const {
    bookmarks,
    removeBookmark,
    reorderBookmarks,
    addBookmark,
  } = useBookmarks();
  const { notes, saveNote, deleteNote, updateNote } = useNotes();
  const { recents, clearRecents, removeRecent } = useRecents();

  const [activeTab, setActiveTab] = useState<ActiveTab>("favoritos");
  const [activeWorkspaceId, setActiveWorkspaceId] = useState(DEFAULT_WORKSPACE_ID);
  const [search, setSearch] = useState("");
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const workspaceCounts = useMemo(() => {
    const result: Record<string, number> = {};
    for (const workspace of workspaces) {
      const bookmarkCount = bookmarks.filter((item) => item.workspaceId === workspace.id).length;
      const noteCount = notes.filter((item) => item.workspaceId === workspace.id).length;
      result[workspace.id] = bookmarkCount + noteCount;
    }
    return result;
  }, [bookmarks, notes, workspaces]);

  const activeWorkspace = workspaces.find((workspace) => workspace.id === activeWorkspaceId) || workspaces[0];

  const workspaceBookmarks = useMemo(
    () =>
      bookmarks
        .filter((bookmark) => bookmark.workspaceId === activeWorkspaceId)
        .sort((a, b) => a.order - b.order),
    [bookmarks, activeWorkspaceId]
  );

  const workspaceNotes = useMemo(
    () =>
      notes
        .filter((note) => note.workspaceId === activeWorkspaceId)
        .sort((a, b) => b.updatedAt - a.updatedAt),
    [notes, activeWorkspaceId]
  );

  const filteredBookmarks = useMemo(() => {
    if (!search.trim()) return workspaceBookmarks;
    const q = search.toLowerCase();
    return workspaceBookmarks.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.preview?.toLowerCase().includes(q) ||
        item.tags.some((tag) => tag.toLowerCase().includes(q))
    );
  }, [workspaceBookmarks, search]);

  const filteredNotes = useMemo(() => {
    if (!search.trim()) return workspaceNotes;
    const q = search.toLowerCase();
    return workspaceNotes.filter(
      (note) =>
        note.contentMarkdown.toLowerCase().includes(q) ||
        note.targetId.toLowerCase().includes(q) ||
        note.tags.some((tag) => tag.toLowerCase().includes(q))
    );
  }, [workspaceNotes, search]);

  const handleCreateWorkspace = () => {
    const name = window.prompt("Nombre del nuevo workspace");
    if (!name?.trim()) return;
    addWorkspace({ name: name.trim(), icon: "folder" });
    trackEvent("workspace_created", { name: name.trim() });
  };

  const isSearchActive = search.trim().length > 0;

  const handleDragEnd = () => {
    if (!draggingId || !dragOverId || draggingId === dragOverId) {
      setDraggingId(null);
      setDragOverId(null);
      return;
    }

    // Use full (unfiltered) list to preserve items outside the current filter
    const ids = workspaceBookmarks.map((item) => item.id);
    const from = ids.indexOf(draggingId);
    const to = ids.indexOf(dragOverId);
    if (from < 0 || to < 0) {
      setDraggingId(null);
      setDragOverId(null);
      return;
    }

    const reordered = [...ids];
    const [moved] = reordered.splice(from, 1);
    reordered.splice(to, 0, moved);
    reorderBookmarks(activeWorkspaceId, reordered);
    setDraggingId(null);
    setDragOverId(null);
  };

  const handleExportAll = () => {
    downloadJsonFile(`workspace-tributario-${new Date().toISOString().split("T")[0]}.json`, {
      workspaces,
      bookmarks,
      notes,
      recents,
      exportedAt: new Date().toISOString(),
    });
  };

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const payload = JSON.parse(await file.text());
        if (Array.isArray(payload.workspaces)) {
          writeJsonStorage(STORAGE_KEYS.workspaces, payload.workspaces);
          dispatchStorageEvent(STORAGE_EVENTS.workspaces);
        }
        if (Array.isArray(payload.bookmarks)) {
          writeJsonStorage(STORAGE_KEYS.bookmarks, payload.bookmarks);
          dispatchStorageEvent(STORAGE_EVENTS.bookmarks);
        } else if (Array.isArray(payload.bookmarksLegacy)) {
          writeJsonStorage(STORAGE_KEYS.legacyBookmarks, payload.bookmarksLegacy);
          dispatchStorageEvent(STORAGE_EVENTS.bookmarks);
        }
        if (Array.isArray(payload.notes)) {
          writeJsonStorage(STORAGE_KEYS.notes, payload.notes);
          dispatchStorageEvent(STORAGE_EVENTS.notes);
        }
        if (Array.isArray(payload.recents)) {
          writeJsonStorage(STORAGE_KEYS.recents, payload.recents);
          dispatchStorageEvent(STORAGE_EVENTS.recents);
        }
      } catch {
        alert("No fue posible importar el archivo. Verifique el formato JSON.");
      }
    };
    input.click();
  };

  const quickAddBookmark = () => {
    const title = window.prompt("Título del favorito");
    const href = window.prompt("URL interna (ej: /articulo/240)");
    if (!title?.trim() || !href?.trim()) return;
    addBookmark({
      id: `manual-${Date.now()}`,
      type: href.includes("/calculadoras") ? "calc" : "art",
      title: title.trim(),
      href: href.trim(),
      workspaceId: activeWorkspaceId,
      preview: "Favorito agregado manualmente.",
      tags: [],
    });
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-10">
        <div className="mb-10 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="heading-serif text-3xl">{UI_COPY.favoritos.title}</h1>
            <p className="mt-2 text-base leading-relaxed text-muted-foreground">
              {UI_COPY.favoritos.subtitle}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={quickAddBookmark}
              className="inline-flex items-center gap-2 rounded-lg border border-border/60 bg-card px-3 py-1.5 text-sm font-medium shadow-sm transition-all hover:border-border hover:shadow-md"
            >
              <Plus className="h-4 w-4 text-foreground/70" />
              Quick-add
            </button>
            <button
              onClick={handleImport}
              className="inline-flex items-center gap-2 rounded-lg border border-border/60 bg-card px-3 py-1.5 text-sm font-medium shadow-sm transition-all hover:border-border hover:shadow-md"
            >
              <Upload className="h-4 w-4 text-foreground/70" />
              Importar
            </button>
            <button
              onClick={handleExportAll}
              className="inline-flex items-center gap-2 rounded-lg border border-border/60 bg-card px-3 py-1.5 text-sm font-medium shadow-sm transition-all hover:border-border hover:shadow-md"
            >
              <FolderOpen className="h-4 w-4 text-foreground/70" />
              Exportar todo
            </button>
          </div>
        </div>

        <div className="mb-6 grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
          <WorkspaceSidebar
            workspaces={workspaces}
            activeWorkspaceId={activeWorkspaceId}
            counts={workspaceCounts}
            onSelect={setActiveWorkspaceId}
            onCreate={handleCreateWorkspace}
          />

          <div className="space-y-4">
            {activeWorkspace && (
              <WorkspaceExportMenu
                workspace={activeWorkspace}
                bookmarks={workspaceBookmarks}
                notes={workspaceNotes}
              />
            )}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar en favoritos y notas..."
                className="w-full rounded-lg border border-border/60 bg-card py-2 pl-10 pr-3 text-sm outline-none focus:border-foreground/40 focus:ring-1 focus:ring-foreground/20 shadow-sm"
              />
            </div>

            <div className="flex border-b border-border/60">
              <button
                onClick={() => setActiveTab("favoritos")}
                className={clsx(
                  "flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-medium transition-colors",
                  activeTab === "favoritos"
                    ? "border-foreground text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                <Bookmark className="h-4 w-4" />
                Favoritos ({filteredBookmarks.length})
              </button>
              <button
                onClick={() => setActiveTab("notas")}
                className={clsx(
                  "flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-medium transition-colors",
                  activeTab === "notas"
                    ? "border-foreground text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                <StickyNote className="h-4 w-4" />
                Notas ({filteredNotes.length})
              </button>
            </div>

            {activeTab === "favoritos" ? (
              filteredBookmarks.length === 0 ? (
                <div className="rounded-lg border border-border/60 bg-card p-10 text-center">
                  <p className="text-sm text-muted-foreground">
                    Este workspace no tiene favoritos. Use Quick-add o guarde desde cualquier módulo.
                  </p>
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {filteredBookmarks.map((item) => (
                    <WorkspaceCard
                      key={item.id}
                      item={item}
                      isDragging={!isSearchActive && draggingId === item.id}
                      onDragStart={isSearchActive ? undefined : (id) => setDraggingId(id)}
                      onDragOver={isSearchActive ? undefined : (id) => setDragOverId(id)}
                      onDragEnd={isSearchActive ? undefined : handleDragEnd}
                      onRemove={removeBookmark}
                    />
                  ))}
                </div>
              )
            ) : filteredNotes.length === 0 ? (
              <div className="rounded-lg border border-border/60 bg-card p-10 text-center">
                <p className="text-sm text-muted-foreground">
                  No hay notas en este workspace.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredNotes.map((note) => (
                  <div key={note.id} className="rounded-lg border border-border/60 bg-card p-4 shadow-sm">
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                      <p className="text-xs font-medium uppercase tracking-[0.05em] text-muted-foreground">
                        Referencia: {note.targetId}
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateNote(note.id, { pinned: !note.pinned })}
                          className="rounded-md border border-border px-2 py-1 text-xs hover:bg-muted"
                        >
                          {note.pinned ? "Desfijar" : "Fijar"}
                        </button>
                        <button
                          onClick={() => deleteNote(note.targetId)}
                          className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                          title="Eliminar nota"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    <NoteEditor
                      value={note.contentMarkdown}
                      onChange={(value) =>
                        saveNote(note.targetId, value, {
                          workspaceId: note.workspaceId,
                          targetType: note.targetType,
                          targetSlug: note.targetSlug,
                          tags: note.tags,
                          pinned: note.pinned,
                        })
                      }
                    />

                    <div className="mt-3">
                      <TagInput
                        tags={note.tags}
                        onChange={(tags) => {
                          updateNote(note.id, { tags });
                          if (tags.length > 0) {
                            trackEvent("note_tagged", { noteId: note.id, tags });
                          }
                        }}
                      />
                    </div>

                    <div className="mt-3 flex justify-between text-xs text-muted-foreground">
                      <span>Actualizada: {new Date(note.updatedAt).toLocaleString("es-CO")}</span>
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/asistente?prompt=${encodeURIComponent(
                            `Analiza esta nota y dame recomendaciones prácticas: ${note.contentMarkdown.slice(0, 280)}`
                          )}`}
                          className="hover:text-foreground"
                        >
                          Consultar IA
                        </Link>
                        <Link
                          href={
                            note.targetSlug
                              ? `/articulo/${note.targetSlug}`
                              : `/explorador?art=${encodeURIComponent(note.targetId)}`
                          }
                          className="inline-flex items-center gap-1 hover:text-foreground"
                        >
                          Ver referencia
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <section className="rounded-lg border border-border/60 bg-card p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold">{UI_COPY.favoritos.recentsTitle}</h2>
            {recents.length > 0 && (
              <button
                onClick={clearRecents}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Limpiar
              </button>
            )}
          </div>
          {recents.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Aún no hay artículos recientes. Se llenará automáticamente cuando navegue por el Estatuto.
            </p>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {recents.slice(0, 10).map((item) => (
                <div
                  key={item.id}
                  className="flex items-start justify-between gap-2 rounded-md border border-border/50 bg-muted/30 px-3 py-2"
                >
                  <Link href={item.href} className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{item.title}</p>
                    <p className="mt-1 inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                      <Clock3 className="h-3 w-3" />
                      {new Date(item.visitedAt).toLocaleString("es-CO")}
                    </p>
                  </Link>
                  <button
                    onClick={() => removeRecent(item.id)}
                    className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                    title="Quitar de recientes"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
