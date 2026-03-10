"use client";

import Link from "next/link";
import { ChevronDown, ChevronUp, ExternalLink, Tag, Copy, Check } from "lucide-react";
import { useState } from "react";
import { clsx } from "clsx";
import type { NovedadEnriquecida } from "@/config/novedades-data";
import { NovedadImpactBadge } from "@/components/novedades/NovedadImpactBadge";
import { QueSignificaPanel } from "@/components/novedades/QueSignificaPanel";

interface NovedadExpandableCardProps {
  novedad: NovedadEnriquecida;
  expanded: boolean;
  highlighted?: boolean;
  onToggle: () => void;
}

const TIPO_LABEL: Record<NovedadEnriquecida["tipo"], string> = {
  ley: "Ley",
  decreto: "Decreto",
  resolucion: "Resolución",
  circular: "Circular",
  sentencia: "Sentencia",
  concepto: "Concepto",
};

const AUDIENCE_LABEL: Record<NovedadEnriquecida["afectaA"][number], string> = {
  personas_naturales: "Personas naturales",
  personas_juridicas: "Personas jurídicas",
  grandes_contribuyentes: "Grandes contribuyentes",
  independientes: "Independientes",
  empleadores: "Empleadores",
  facturadores_electronicos: "Facturación electrónica",
};

function formatFecha(fechaIso: string): string {
  const [year, month, day] = fechaIso.split("-").map(Number);
  const date = new Date(year, (month ?? 1) - 1, day ?? 1);
  return date.toLocaleDateString("es-CO", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function NovedadExpandableCard({ novedad, expanded, highlighted, onToggle }: NovedadExpandableCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const text = `*${novedad.titulo}*\n\n*Resumen:* ${novedad.resumen}\n\n*Qué significa:* ${novedad.queSignificaParaTi}\n\n*Acción recomendada:* ${novedad.accionRecomendada}\n\n_Vía SuperApp Tributaria Colombia_`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Error al copiar", err);
    }
  };

  return (
    <article
      id={novedad.id}
      className={clsx(
        "rounded-lg border bg-card p-5 shadow-sm transition-all",
        highlighted ? "border-foreground/40 ring-1 ring-foreground/20" : "border-border/60"
      )}
    >
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-border px-2.5 py-0.5 text-xs text-muted-foreground">
            {formatFecha(novedad.fecha)}
          </span>
          <span className="rounded-full border border-border px-2.5 py-0.5 text-xs font-medium text-foreground">
            {TIPO_LABEL[novedad.tipo]}
          </span>
          <NovedadImpactBadge impacto={novedad.impactoVisual} />
        </div>
        
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground hover:text-foreground transition-colors"
          title="Copiar resumen para enviar a clientes"
        >
          {copied ? <Check className="h-3 w-3 text-success" /> : <Copy className="h-3 w-3" />}
          {copied ? "Copiado" : "Copiar resumen"}
        </button>
      </div>

      <h3 className="heading-serif text-xl text-foreground">{novedad.titulo}</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        {novedad.fuente} • {novedad.numero}
      </p>
      <p className={clsx("mt-3 text-sm leading-relaxed text-muted-foreground", !expanded && "line-clamp-2")}>
        {novedad.resumen}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        {novedad.afectaA.map((audience) => (
          <span
            key={audience}
            className="rounded-full border border-border px-2.5 py-0.5 text-[11px] text-muted-foreground"
          >
            {AUDIENCE_LABEL[audience]}
          </span>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-border/40 pt-3">
        <div className="flex flex-wrap items-center gap-2">
          {novedad.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-0.5 text-[11px] text-muted-foreground"
            >
              <Tag className="h-3 w-3" />
              {tag}
            </span>
          ))}
        </div>
        <button
          type="button"
          onClick={onToggle}
          className="inline-flex items-center gap-1 rounded border border-border px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:bg-muted"
        >
          {expanded ? "Ocultar detalle" : "Ver detalle"}
          {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>
      </div>

      {expanded && (
        <div className="mt-4 border-t border-border/40 pt-4">
          <p className="text-sm leading-relaxed text-foreground">{novedad.detalleCompleto}</p>

          <QueSignificaPanel resumen={novedad.queSignificaParaTi} accion={novedad.accionRecomendada} />

          {novedad.articulosET && novedad.articulosET.length > 0 && (
            <div className="mt-3">
              <p className="mb-1 text-xs font-semibold uppercase tracking-[0.05em] text-muted-foreground">
                Artículos ET relacionados
              </p>
              <div className="flex flex-wrap gap-1.5">
                {novedad.articulosET.map((articulo) => (
                  <Link
                    key={articulo}
                    href={`/articulo/${articulo}`}
                    className="inline-flex items-center gap-1 rounded border border-border px-2.5 py-1 text-xs text-foreground transition-colors hover:bg-muted"
                  >
                    Art. {articulo}
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {novedad.cambiaCalendario && (
            <div className="mt-3 rounded-md border border-border/60 bg-muted/20 p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.05em] text-muted-foreground">
                Conexión con calendario
              </p>
              <p className="mt-1 text-sm text-foreground">
                Esta novedad modifica o impacta fechas de cumplimiento para:
              </p>
              {novedad.calendarioRefs && novedad.calendarioRefs.length > 0 && (
                <ul className="mt-1 list-inside list-disc text-xs text-muted-foreground">
                  {novedad.calendarioRefs.map((ref) => (
                    <li key={ref}>{ref}</li>
                  ))}
                </ul>
              )}
              <Link
                href={`/calendario?novedad=${novedad.id}`}
                className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-foreground underline underline-offset-2 decoration-border hover:decoration-foreground"
              >
                Ver fechas impactadas en Calendario
                <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          )}
        </div>
      )}
    </article>
  );
}
