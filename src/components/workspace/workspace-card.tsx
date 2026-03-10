"use client";

import Link from "next/link";
import { GripVertical, Trash2, Calendar } from "lucide-react";
import { BookmarkItem } from "@/types/productivity";
import { clsx } from "clsx";

interface WorkspaceCardProps {
  item: BookmarkItem;
  isDragging?: boolean;
  onRemove: (id: string) => void;
  onDragStart?: (id: string) => void;
  onDragOver?: (id: string) => void;
  onDragEnd?: () => void;
}

export function WorkspaceCard({
  item,
  isDragging = false,
  onRemove,
  onDragStart,
  onDragOver,
  onDragEnd,
}: WorkspaceCardProps) {
  const draggable = Boolean(onDragStart);

  return (
    <div
      draggable={draggable}
      onDragStart={onDragStart ? () => onDragStart(item.id) : undefined}
      onDragOver={onDragOver ? (e) => {
        e.preventDefault();
        onDragOver(item.id);
      } : undefined}
      onDragEnd={onDragEnd}
      className={clsx(
        "group relative rounded-lg border border-border/60 bg-card p-4 shadow-sm transition-all hover:border-border hover:shadow-md",
        isDragging && "opacity-50"
      )}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <Link href={item.href} className="min-w-0 flex-1">
          <h3 className="line-clamp-2 text-sm font-semibold text-foreground">{item.title}</h3>
        </Link>
        {draggable && <GripVertical className="mt-0.5 h-4 w-4 shrink-0 cursor-grab text-muted-foreground" />}
      </div>

      {item.preview ? (
        <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">{item.preview}</p>
      ) : (
        <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
          Sin vista previa disponible.
        </p>
      )}

      {item.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {item.tags.map((tag) => (
            <span
              key={`${item.id}-${tag}`}
              className="rounded-full border border-border bg-muted px-2 py-0.5 text-[11px] text-muted-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          {new Date(item.updatedAt).toLocaleDateString("es-CO")}
        </span>
        <button
          onClick={() => onRemove(item.id)}
          className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          title="Eliminar favorito"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
