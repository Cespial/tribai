"use client";

import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { TribaiIconClock, TribaiIconET, TribaiIconMoney, TribaiIconCertification, TribaiIconBrain } from "@/components/icons/tribai-icons";
import { Reveal } from "@/components/ui/reveal";

const ROWS = [
  {
    icon: TribaiIconClock,
    criterion: "Buscar un artículo del ET",
    traditional: "5–15 min en PDF o Google",
    tribai: "5 segundos — búsqueda indexada",
  },
  {
    icon: TribaiIconET,
    criterion: "Calcular retención salarial",
    traditional: "10–20 min en Excel manual",
    tribai: "30 seg — calculadora 2026",
  },
  {
    icon: TribaiIconMoney,
    criterion: "Costo de arranque",
    traditional: "Suscripción mensual o paywall",
    tribai: "Gratuito. Sin registro.",
  },
  {
    icon: TribaiIconCertification,
    criterion: "Verificar doctrina DIAN",
    traditional: "20–40 min en DIAN.gov.co",
    tribai: "10 seg — 841 conceptos indexados",
  },
  {
    icon: TribaiIconBrain,
    criterion: "Sustento normativo con IA",
    traditional: "ChatGPT genérico — sin fuentes reales",
    tribai: "IA con citación exacta del artículo",
  },
];

export function ComparisonSection() {
  return (
    <section
      id="comparativa"
      aria-labelledby="comparativa-title"
      className="border-t border-border bg-background px-6 py-16 md:px-12 md:py-24 lg:px-20"
    >
      <Reveal className="mx-auto max-w-[960px]">
        <p className="eyebrow-label">
          Por qué confiar en Tribai
        </p>
        <h2
          id="comparativa-title"
          className="heading-serif mt-4 max-w-3xl text-2xl text-foreground md:text-4xl"
        >
          El flujo de siempre vs. el flujo con Tribai.
        </h2>

        {/* Desktop table */}
        <div className="mt-12 hidden overflow-hidden rounded-lg border border-border md:block">
          <div className="grid grid-cols-[1fr_1fr_1fr] bg-muted-section">
            <div className="px-6 py-4 text-sm font-semibold text-foreground">Tarea</div>
            <div className="px-6 py-4 text-sm font-semibold text-muted-foreground">Flujo tradicional</div>
            <div className="bg-tribai-blue/5 dark:bg-tribai-blue/10 px-6 py-4 text-sm font-semibold text-tribai-blue">Con Tribai</div>
          </div>
          {ROWS.map((row) => (
            <div
              key={row.criterion}
              className="grid grid-cols-[1fr_1fr_1fr] border-t border-border transition-colors hover:bg-muted-section"
            >
              <div className="flex items-center gap-3 px-6 py-4">
                <row.icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <span className="text-sm font-medium text-foreground">{row.criterion}</span>
              </div>
              <div className="flex items-center px-6 py-4 text-sm text-muted-foreground">
                {row.traditional}
              </div>
              <div className="flex items-center gap-2 bg-tribai-blue/5 dark:bg-tribai-blue/10 px-6 py-4 text-sm font-medium text-foreground">
                <Check className="h-4 w-4 shrink-0 text-success" aria-hidden="true" />
                {row.tribai}
              </div>
            </div>
          ))}
        </div>

        {/* Mobile stacked */}
        <div className="mt-10 space-y-4 md:hidden">
          {ROWS.map((row) => (
            <div key={row.criterion} className="rounded-lg border border-border bg-card p-5">
              <div className="flex items-center gap-2">
                <row.icon className="h-4 w-4 text-tribai-blue" aria-hidden="true" />
                <h3 className="text-sm font-semibold text-foreground">{row.criterion}</h3>
              </div>
              <div className="mt-3 space-y-2">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Antes</p>
                  <p className="text-sm text-muted-foreground">{row.traditional}</p>
                </div>
                <div className="rounded-lg bg-tribai-blue/5 dark:bg-tribai-blue/10 p-2.5">
                  <p className="text-xs font-medium text-tribai-blue">Con Tribai</p>
                  <p className="mt-0.5 flex items-center gap-1.5 border-l-2 border-tribai-blue pl-3 text-sm font-medium text-foreground">
                    <Check className="h-3.5 w-3.5 shrink-0 text-success" aria-hidden="true" />
                    {row.tribai}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <Link
            href="/calculadoras"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-tribai-blue transition-colors hover:underline hover:text-tribai-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tribai-blue/30"
          >
            Probar la plataforma
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
      </Reveal>
    </section>
  );
}
