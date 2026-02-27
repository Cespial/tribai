import Link from "next/link";
import { Reveal } from "@/components/ui/reveal";

const COMPARISON_ROWS = [
  {
    criterion: "Tiempo por consulta",
    traditional: "Alto y variable",
    app: "Minutos con ruta clara",
  },
  {
    criterion: "Referencia normativa",
    traditional: "Dispersa",
    app: "Centralizada y consultable",
  },
  {
    criterion: "Costo de arranque",
    traditional: "Frecuentemente alto",
    app: "Gratis para empezar",
  },
  {
    criterion: "Curva de aprendizaje",
    traditional: "Media / alta",
    app: "Baja",
  },
  {
    criterion: "Soporte IA con contexto ET",
    traditional: "Limitado o nulo",
    app: "Incluido",
  },
];

export function ComparisonSection() {
  return (
    <section
      id="comparativa"
      aria-labelledby="comparativa-title"
      className="bg-background px-6 py-16 md:px-8 md:py-24"
    >
      <Reveal className="mx-auto max-w-5xl">
        <h2
          id="comparativa-title"
          className="heading-serif text-3xl text-foreground md:text-5xl"
        >
          Mas practico que el Excel y las busquedas en Google.
        </h2>

        <div className="mt-8 overflow-hidden rounded-2xl border border-border bg-card">
          <div className="hidden md:grid grid-cols-3 border-b border-border bg-muted/50 px-6 py-3 text-xs font-semibold uppercase tracking-[0.05em] text-foreground/75">
            <p>Criterio</p>
            <p>Flujo tradicional</p>
            <p>Tributaria Colombia</p>
          </div>

          {COMPARISON_ROWS.map((row) => (
            <div
              key={row.criterion}
              className="grid grid-cols-1 md:grid-cols-3 border-b border-border px-6 py-5 text-sm text-foreground last:border-b-0 gap-y-3 md:gap-y-0"
            >
              <p className="font-semibold md:font-medium text-base md:text-sm pr-3">{row.criterion}</p>
              
              <div className="flex md:block justify-between items-baseline gap-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70 md:hidden shrink-0">Tradicional:</span>
                <p className="text-muted-foreground md:pr-3 text-right md:text-left">{row.traditional}</p>
              </div>

              <div className="flex md:block justify-between items-baseline gap-4 border-t border-border/40 pt-3 md:border-t-0 md:pt-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70 md:hidden shrink-0">SuperApp:</span>
                <p className="font-semibold md:font-medium text-foreground text-right md:text-left">{row.app}</p>
              </div>
            </div>
          ))}
        </div>

        <Link
          href="/dashboard"
          className="mt-6 inline-flex text-sm font-semibold text-foreground underline underline-offset-4 decoration-border transition-colors hover:decoration-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Probar la plataforma
        </Link>
      </Reveal>
    </section>
  );
}
