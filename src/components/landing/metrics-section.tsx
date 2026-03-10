"use client";

import { useEffect, useRef, useState } from "react";

const METRICS = [
  { value: 35, display: "35", label: "Calculadoras listas para usar", sublabel: "Resuelva renta, retención, IVA y sanciones en segundos" },
  { value: 1294, display: "1.294", label: "Artículos del ET navegables", sublabel: "Con historial de reformas y artículos relacionados" },
  { value: 841, display: "841", label: "Conceptos DIAN verificables", sublabel: "Doctrina indexada y vinculada al artículo del ET" },
  { value: 0, display: "24/7", label: "Asistente IA sin registro", sublabel: "Consulte con fuentes normativas en cualquier momento" },
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
      <p className="eyebrow-label">
        En números
      </p>
      <h2 id="metrics-title" className="heading-serif mt-4 max-w-3xl text-2xl text-foreground md:text-4xl">
        Todo lo que necesita. En un solo lugar.
      </h2>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-foreground-body">
        Cada herramienta está diseñada para resolver casos tributarios reales
        — con la norma vigente, el cálculo exacto y la fuente que lo respalda.
      </p>

      <div className="mt-12 grid grid-cols-2 gap-0 divide-x divide-border overflow-hidden rounded-lg border border-border md:grid-cols-4">
        {METRICS.map((metric, index) => (
          <MetricItem key={metric.label} metric={metric} active={visible} index={index} />
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
  index,
}: {
  metric: (typeof METRICS)[number];
  active: boolean;
  index: number;
}) {
  const { value: count } = useCountUp(metric.value, 1500, active);

  return (
    <div className={`p-4 sm:p-6 md:p-8 ${index < 2 ? "border-b border-border md:border-b-0" : ""}`}>
      <p className="font-values text-2xl font-bold text-foreground sm:text-3xl md:text-4xl">
        {metric.value === 0 ? metric.display : formatNumber(count, metric)}
      </p>
      <p className="mt-2 text-sm font-semibold text-foreground">{metric.label}</p>
      <p className="mt-1 text-xs text-muted-foreground">{metric.sublabel}</p>
    </div>
  );
}
