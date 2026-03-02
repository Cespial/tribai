"use client";

import Link from "next/link";
import { Copy, ExternalLink, Info } from "lucide-react";
import type { IndicatorItem } from "@/config/indicadores-data";
import { isIndicatorStale } from "@/config/indicadores-data";
import type { LiveIndicator } from "@/lib/indicadores/live-fetcher";

interface IndicatorCardProps {
  item: IndicatorItem;
  onCopy: (item: IndicatorItem) => void;
  liveValue?: LiveIndicator;
}

export function IndicatorCard({ item, onCopy, liveValue }: IndicatorCardProps) {
  const displayValue = liveValue?.valor ?? item.valor;
  const displayDate = liveValue?.fechaCorte ?? item.fechaCorte;
  const stale = !liveValue && isIndicatorStale(item);

  return (
    <article className="rounded-md border border-border/60 bg-background p-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-1.5">
            <h4 className="text-sm font-medium text-foreground">{item.nombre}</h4>
            {liveValue && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                En vivo
              </span>
            )}
            {stale && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                Pendiente
              </span>
            )}
            <div className="group relative">
              <Info className="h-3.5 w-3.5 text-muted-foreground" />
              <div className="pointer-events-none absolute left-0 top-5 z-20 w-56 rounded-md border border-border bg-card p-2 text-xs text-muted-foreground opacity-0 shadow-md transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                {item.paraQueSirve}
                {liveValue && (
                  <span className="mt-1 block text-emerald-600 dark:text-emerald-400">
                    Fuente: datos.gov.co — {new Date(liveValue.fetchedAt).toLocaleString("es-CO")}
                  </span>
                )}
              </div>
            </div>
          </div>
          <p className="mt-1 text-xl font-semibold tracking-tight text-foreground">{displayValue}</p>
          <p className="mt-1 text-[11px] text-muted-foreground">Corte: {displayDate}</p>
        </div>
        <button
          type="button"
          onClick={() => onCopy(liveValue ? { ...item, valor: liveValue.valor, valorNumerico: liveValue.valorNumerico } : item)}
          className="inline-flex h-8 w-8 items-center justify-center rounded border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          title="Copiar valor"
        >
          <Copy className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        {item.calculatorHrefs.map((href) => (
          <Link
            key={href}
            href={href}
            className="inline-flex items-center gap-1 rounded border border-border px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            Calculadora
            <ExternalLink className="h-3 w-3" />
          </Link>
        ))}
      </div>
      {item.notas && <p className="mt-2 text-xs italic text-muted-foreground">{item.notas}</p>}
    </article>
  );
}

