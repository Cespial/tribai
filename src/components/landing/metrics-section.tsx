"use client";

import { useEffect, useRef, useState } from "react";

const METRICS = [
  { value: 35, display: "35", label: "Calculadoras listas" },
  { value: 1294, display: "1.294", label: "Articulos ET" },
  { value: 841, display: "841", label: "Doctrinas DIAN" },
  { value: 0, display: "24/7", label: "Asistente IA" },
] as const;

function formatNumber(n: number, target: (typeof METRICS)[number]): string {
  if (target.value === 0) return target.display;
  if (target.value >= 1000) return Math.round(n).toLocaleString("es-CO");
  return String(Math.round(n));
}

function useCountUp(target: number, duration: number, active: boolean) {
  const [value, setValue] = useState(0);

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
      }
    }

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, active]);

  return value;
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
    <div ref={ref} className="rounded-2xl border border-border bg-card p-6 md:p-10">
      <h2 id="metrics-title" className="heading-serif text-3xl text-foreground md:text-5xl">
        Lo que tiene la plataforma hoy, listo para usar.
      </h2>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
        No es solo lectura: es su herramienta de trabajo diaria para
        consultas, calculos y validacion normativa.
      </p>

      <div className="mt-10 grid grid-cols-2 gap-8 md:grid-cols-4 md:gap-10">
        {METRICS.map((metric) => (
          <MetricItem key={metric.label} metric={metric} active={visible} />
        ))}
      </div>

      <p className="mt-6 rounded-lg border border-border bg-muted/40 px-4 py-3 text-xs leading-relaxed text-muted-foreground">
        Actualizado para temporada fiscal 2026. Herramienta informativa; valide
        casos complejos con criterio profesional.
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
  const count = useCountUp(metric.value, 1500, active);

  return (
    <div className="text-center">
      <p className="heading-serif text-5xl text-foreground md:text-6xl lg:text-7xl">
        {metric.value === 0 ? metric.display : formatNumber(count, metric)}
      </p>
      <p className="mt-3 text-xs font-medium uppercase tracking-[0.05em] text-muted-foreground md:text-sm">
        {metric.label}
      </p>
    </div>
  );
}
