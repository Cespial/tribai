"use client";

import Link from "next/link";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { Info, ExternalLink } from "lucide-react";
import type { IndicatorItem } from "@/config/indicadores-data";
import type { LiveIndicator } from "@/lib/indicadores/live-fetcher";

interface IndicatorsHeroProps {
  indicators: IndicatorItem[];
  liveOverrides?: Map<string, LiveIndicator>;
}

function variationLabel(indicator: IndicatorItem): string {
  if (indicator.history.length < 2) return "Sin variación";
  const prev = indicator.history[indicator.history.length - 2].value;
  const current = indicator.history[indicator.history.length - 1].value;
  if (prev === 0) return "Sin base";
  const pct = ((current - prev) / prev) * 100;
  const sign = pct >= 0 ? "+" : "";
  return `${sign}${pct.toFixed(1)}%`;
}

export function IndicatorsHero({ indicators, liveOverrides }: IndicatorsHeroProps) {
  const handleScrollToDetail = (id: string) => {
    const el = document.getElementById(`trend-${id}`);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="grid gap-4 lg:grid-cols-4">
      {indicators.map((indicator) => {
        const live = liveOverrides?.get(indicator.id);
        const displayValue = live?.valor ?? indicator.valor;

        return (
        <article
          key={indicator.id}
          className="group/card relative cursor-pointer rounded-lg border border-border/60 bg-card p-4 shadow-sm transition-all hover:border-foreground/40 hover:shadow-md"
          onClick={() => handleScrollToDetail(indicator.id)}
        >
          <div className="mb-1 flex items-start justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs font-medium uppercase tracking-[0.05em] text-muted-foreground">
                {indicator.nombre}
              </h3>
              {live && (
                <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-1.5 py-0.5 text-[10px] font-medium text-success">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success" />
                  En vivo
                </span>
              )}
            </div>
            <div className="group relative">
              <Info className="h-3.5 w-3.5 text-muted-foreground" />
              <div className="pointer-events-none absolute right-0 top-5 z-20 w-56 rounded-md border border-border bg-card p-2 text-xs text-muted-foreground opacity-0 shadow-md transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                {indicator.paraQueSirve}
                {live && (
                  <span className="mt-1 block text-success">
                    Fuente: datos.gov.co — {new Date(live.fetchedAt).toLocaleString("es-CO")}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="text-2xl font-semibold tracking-tight text-foreground">{displayValue}</div>
          <div className="mt-1 flex items-center justify-between">
            <div className="text-xs font-medium text-muted-foreground">
              {live
                ? `Corte: ${live.fechaCorte}`
                : `Variación: ${variationLabel(indicator)}`}
            </div>
            <div className="text-[10px] font-medium text-foreground opacity-0 transition-opacity group-hover/card:opacity-100">
              Ver detalle &rarr;
            </div>
          </div>
          <div className="mt-2 h-[52px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={indicator.history} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id={`spark-${indicator.id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--foreground)" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="var(--foreground)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="var(--foreground)"
                  strokeWidth={1.8}
                  fill={`url(#spark-${indicator.id})`}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          {indicator.calculatorHrefs[0] && (
            <Link
              href={indicator.calculatorHrefs[0]}
              className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-foreground underline underline-offset-2 decoration-border hover:decoration-foreground"
            >
              Ir a calculadora
              <ExternalLink className="h-3 w-3" />
            </Link>
          )}
        </article>
        );
      })}
    </section>
  );
}

