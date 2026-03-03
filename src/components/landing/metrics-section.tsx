"use client";

import { useEffect, useRef, useState } from "react";
import { CornerBracket } from "@/components/ui/decorative-svgs";

const METRICS = [
  { value: 35, display: "35", label: "Calculadoras de precisión", sublabel: "Renta, retención, IVA, sanciones, laboral y más" },
  { value: 1294, display: "1.294", label: "Artículos del Estatuto Tributario", sublabel: "Indexados con historial de reformas" },
  { value: 841, display: "841", label: "Conceptos DIAN", sublabel: "Doctrina curada y vinculada al ET" },
  { value: 0, display: "24/7", label: "Asistente IA con fuentes", sublabel: "36K vectores de conocimiento normativo" },
] as const;

function formatNumber(n: number, target: (typeof METRICS)[number]): string {
  if (target.value === 0) return target.display;
  if (target.value >= 1000) return Math.round(n).toLocaleString("es-CO");
  return String(Math.round(n));
}

function useCountUp(target: number, duration: number, active: boolean) {
  const [value, setValue] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!active || target === 0) return;

    const start = performance.now();
    let raf = 0;

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(eased * target);

      if (progress < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        setDone(true);
      }
    }

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, active]);

  return { value, done };
}

export function MetricsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref}>
      <p className="text-sm font-semibold uppercase tracking-widest text-tribai-blue">
        La plataforma hoy
      </p>
      <h2 id="metrics-title" className="heading-serif mt-3 max-w-3xl text-3xl text-foreground md:text-5xl">
        Números que hablan por sí solos.
      </h2>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
        No es solo lectura. Cada artículo, cada calculadora y cada respuesta de
        la IA está diseñada para resolver casos tributarios reales.
      </p>

      <div className="mt-12 grid grid-cols-2 gap-6 md:grid-cols-4">
        {METRICS.map((metric) => (
          <MetricItem key={metric.label} metric={metric} active={visible} />
        ))}
      </div>

      <p className="mt-6 text-xs text-muted-foreground">
        Datos del año fiscal 2026 · UVT $52.374 · Resultados orientativos, validar con criterio profesional.
      </p>
    </div>
  );
}

function MetricItem({
  metric,
  active,
}: {
  metric: (typeof METRICS)[number];
  active: boolean;
}) {
  const { value: count, done } = useCountUp(metric.value, 1500, active);

  return (
    <div className="relative rounded-xl border border-border border-t-2 border-t-tribai-gold bg-card p-6 card-hover-premium">
      <CornerBracket position="top-left" className="absolute -left-1 -top-1 h-5 w-5" />
      <CornerBracket position="bottom-right" className="absolute -bottom-1 -right-1 h-5 w-5" />
      <p className={`font-values text-3xl font-semibold text-tribai-gold md:text-4xl ${done ? "gold-flash" : ""}`}>
        {metric.value === 0 ? metric.display : formatNumber(count, metric)}
      </p>
      <p className="mt-2 text-sm font-semibold text-foreground">{metric.label}</p>
      <p className="mt-1 text-xs text-muted-foreground">{metric.sublabel}</p>
    </div>
  );
}
