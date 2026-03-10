"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { X, ExternalLink, ArrowRight } from "lucide-react";
import Link from "next/link";
import DOMPurify from "isomorphic-dompurify";
import { useArticlePanel } from "@/contexts/article-panel-context";
import { clsx } from "clsx";
import { useRecents } from "@/hooks/useRecents";

interface ArticleData {
  id_articulo: string;
  titulo: string;
  titulo_corto: string;
  slug: string;
  url_origen: string;
  libro: string;
  estado: string;
  complexity_score: number;
  contenido_texto: string;
  contenido_html?: string;
  total_modificaciones: number;
  ultima_modificacion_year: number | null;
  modificaciones_parsed: Array<{ tipo: string; norma_tipo: string; norma_numero: string; norma_year: number }>;
  normas_parsed: Record<string, string[]>;
}

const ESTADO_COLORS: Record<string, string> = {
  vigente: "bg-foreground",
  modificado: "bg-foreground/60",
  derogado: "bg-foreground/30",
};

const ESTADO_LABELS: Record<string, string> = {
  vigente: "Vigente",
  modificado: "Modificado",
  derogado: "Derogado",
};

export function SlideOutPanel() {
  const { isOpen, slug, closePanel } = useArticlePanel();
  const { trackRecent } = useRecents();
  const [article, setArticle] = useState<ArticleData | null>(null);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const cacheRef = useRef<Map<string, ArticleData>>(new Map());
  useEffect(() => {
    if (!slug) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setArticle(null);
      return;
    }

    // Check cache first
    const cached = cacheRef.current.get(slug);
    if (cached) {
      setArticle(cached);
      return;
    }

    setLoading(true);
    fetch(`/data/articles/${slug}.json`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) {
          cacheRef.current.set(slug, data);
        }
        setArticle(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (!article || !isOpen) return;
    trackRecent({
      id: article.id_articulo,
      title: article.titulo_corto || article.titulo,
      href: `/articulo/${article.slug}`,
      slug: article.slug,
      type: "art",
    });
  }, [article, isOpen, trackRecent]);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) closePanel();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, closePanel]);

  // Focus trap
  const handleFocusTrap = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen || e.key !== "Tab" || !panelRef.current) return;

      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    },
    [isOpen]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleFocusTrap);
    return () => document.removeEventListener("keydown", handleFocusTrap);
  }, [handleFocusTrap]);

  // Focus close button when panel opens
  useEffect(() => {
    if (isOpen && closeButtonRef.current) {
      closeButtonRef.current.focus();
    }
  }, [isOpen]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={clsx(
          "fixed inset-0 z-50 bg-black/50 transition-opacity duration-300",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={closePanel}
        aria-hidden="true"
      />
      {/* Panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={article ? `Detalle del ${article.id_articulo}` : "Detalle del artículo"}
        className={clsx(
          "fixed right-0 top-0 z-50 h-full w-full max-w-[min(28rem,calc(100vw-3rem))] overflow-y-auto border-l border-border/60 bg-background shadow transition-transform duration-300",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between border-b border-border bg-background p-4">
          <div className="flex items-center gap-2">
            {article && (
              <span
                className={clsx(
                  "h-2.5 w-2.5 rounded-full",
                  ESTADO_COLORS[article.estado] || "bg-foreground/40"
                )}
                title={ESTADO_LABELS[article.estado] || article.estado}
              />
            )}
            <span className="heading-serif">
              {article?.id_articulo || "Cargando..."}
            </span>
          </div>
          <button
            ref={closeButtonRef}
            onClick={closePanel}
            className="rounded-md p-1.5 hover:bg-muted focus-visible:ring-2 focus-visible:ring-foreground/20 focus-visible:outline-none"
            aria-label="Cerrar panel"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {loading && (
          <div className="flex items-center justify-center p-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
          </div>
        )}

        {article && !loading && (
          <div className="space-y-4 p-4">
            {/* Title */}
            <div>
              <h3 className="heading-serif text-lg">{article.titulo_corto}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{article.libro}</p>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-lg bg-muted p-2 text-center">
                <div className="font-mono text-lg font-semibold">{article.total_modificaciones}</div>
                <div className="text-xs text-muted-foreground">Modificaciones</div>
              </div>
              <div className="rounded-lg bg-muted p-2 text-center">
                <div className="font-mono text-lg font-semibold">{article.ultima_modificacion_year || "N/A"}</div>
                <div className="text-xs text-muted-foreground">Última mod.</div>
              </div>
              <div className="rounded-lg bg-muted p-2 text-center">
                <div className="font-mono text-lg font-semibold">{article.complexity_score}/10</div>
                <div className="text-xs text-muted-foreground">Complejidad</div>
              </div>
            </div>

            {/* Content preview */}
            <div>
              <h4 className="mb-1 text-sm font-semibold">Contenido</h4>
              {article.contenido_html ? (
                <div
                  className="line-clamp-6 text-sm text-muted-foreground"
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(article.contenido_html) }}
                />
              ) : (
                <p className="line-clamp-6 text-sm text-muted-foreground">
                  {article.contenido_texto || "Sin contenido disponible"}
                </p>
              )}
            </div>

            {/* Mini timeline */}
            {article.modificaciones_parsed.length > 0 && (
              <div>
                <h4 className="mb-2 text-sm font-semibold">
                  Modificaciones ({article.modificaciones_parsed.length})
                </h4>
                <div className="space-y-1.5">
                  {article.modificaciones_parsed.slice(0, 5).map((mod, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 text-xs text-muted-foreground"
                    >
                      <span
                        className={clsx(
                          "h-1.5 w-1.5 rounded-full",
                          mod.tipo === "derogado" ? "bg-foreground/30" : "bg-foreground/60"
                        )}
                      />
                      <span>
                        {mod.norma_tipo} {mod.norma_numero}/{mod.norma_year}
                      </span>
                      <span className="capitalize text-muted-foreground/70">
                        ({mod.tipo})
                      </span>
                    </div>
                  ))}
                  {article.modificaciones_parsed.length > 5 && (
                    <p className="text-xs text-muted-foreground">
                      +{article.modificaciones_parsed.length - 5} más...
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Normas summary */}
            {article.normas_parsed && Object.values(article.normas_parsed).some(arr => arr.length > 0) && (
              <div>
                <h4 className="mb-1 text-sm font-semibold">Normas relacionadas</h4>
                <div className="flex flex-wrap gap-1">
                  {Object.entries(article.normas_parsed).map(([key, items]) => {
                    if (!items || items.length === 0) return null;
                    return (
                      <span
                        key={key}
                        className="rounded-full bg-muted px-2 py-0.5 text-xs"
                      >
                        {key}: {items.length}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <Link
                href={`/articulo/${article.slug}`}
                className="flex flex-1 items-center justify-center gap-2 rounded bg-foreground px-4 py-2 text-sm font-medium text-background transition-colors duration-300 hover:bg-foreground/90 focus-visible:ring-2 focus-visible:ring-foreground/20 focus-visible:outline-none"
                onClick={closePanel}
              >
                Ver ficha completa
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href={article.url_origen}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 rounded border border-border px-3 py-2 text-sm transition-colors duration-300 hover:bg-muted focus-visible:ring-2 focus-visible:ring-foreground/20 focus-visible:outline-none"
                aria-label="Ver en estatuto.co"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
