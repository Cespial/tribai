import {
  ProposalPipeline,
  ProposalConstellation,
  ProposalNetwork,
} from "@/components/landing/hero-diagram-proposals";

const PROPOSALS = [
  {
    id: "A",
    name: "Pipeline Flow",
    subtitle: "Flujo vertical — Consulta → IA → Fuentes → Respuesta",
    description:
      "El más informativo. Explica qué hace el producto de un vistazo. Muestra las 3 capas de fuentes (ET, Doctrina, Decretos) y el flujo de procesamiento. Similar al estilo de Pinecone.io.",
    recommendation: true,
    Component: ProposalPipeline,
  },
  {
    id: "B",
    name: "Constellation",
    subtitle: "Hub radial — IA central con 6 fuentes orbitando",
    description:
      "El más visual. Crea la sensación de un 'universo de conocimiento'. La IA al centro conectada a 6 namespaces de datos. Números prominentes en cada nodo satélite.",
    recommendation: false,
    Component: ProposalConstellation,
  },
  {
    id: "C",
    name: "Knowledge Network",
    subtitle: "Malla abstracta — Nodos interconectados con clusters",
    description:
      "El más atmosférico. Red de nodos representando el knowledge graph real. 3 clusters (ET, Doctrina, Jurisprudencia) conectados por puentes. Estética Linear/Stripe.",
    recommendation: false,
    Component: ProposalNetwork,
  },
];

export default function PropuestasPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-background px-6 py-10 md:px-8">
        <div className="mx-auto max-w-6xl">
          <p className="eyebrow-label">Propuestas de diagrama</p>
          <h1 className="heading-serif mt-3 text-3xl text-foreground md:text-5xl">
            Hero Diagram — 3 opciones
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-foreground-body">
            Cada diagrama reemplaza el SVG actual del hero (columna derecha, visible solo en desktop).
            Se muestra sobre fondo blanco y sobre fondo navy para evaluar contraste.
          </p>
        </div>
      </div>

      {/* Proposals */}
      <div className="mx-auto max-w-6xl space-y-20 px-6 py-16 md:px-8">
        {PROPOSALS.map(({ id, name, subtitle, description, recommendation, Component }) => (
          <section key={id} className="scroll-mt-8" id={`propuesta-${id.toLowerCase()}`}>
            {/* Title */}
            <div className="mb-8">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-tribai-blue text-sm font-bold text-white">
                  {id}
                </span>
                <h2 className="heading-serif text-2xl text-foreground md:text-3xl">
                  {name}
                </h2>
                {recommendation && (
                  <span className="rounded-full bg-tribai-blue/10 px-3 py-1 text-xs font-semibold text-tribai-blue">
                    Recomendada
                  </span>
                )}
              </div>
              <p className="mt-2 text-sm font-medium text-foreground-body">{subtitle}</p>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">{description}</p>
            </div>

            {/* Preview grid: light + dark */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Light background */}
              <div className="overflow-hidden rounded-lg border border-border">
                <div className="border-b border-border bg-muted-section px-4 py-2">
                  <p className="text-xs font-medium text-muted-foreground">Fondo claro (hero actual)</p>
                </div>
                <div className="flex items-center justify-center bg-white p-8 text-foreground">
                  <div className="w-full max-w-sm">
                    <Component />
                  </div>
                </div>
              </div>

              {/* Dark background */}
              <div className="overflow-hidden rounded-lg border border-border">
                <div className="border-b border-border bg-muted-section px-4 py-2">
                  <p className="text-xs font-medium text-muted-foreground">Fondo navy (si se quisiera hero oscuro)</p>
                </div>
                <div className="flex items-center justify-center p-8 text-white" style={{ background: "#0A1628" }}>
                  <div className="w-full max-w-sm">
                    <Component />
                  </div>
                </div>
              </div>
            </div>

            {/* Simulated hero context */}
            <div className="mt-6 overflow-hidden rounded-lg border border-border">
              <div className="border-b border-border bg-muted-section px-4 py-2">
                <p className="text-xs font-medium text-muted-foreground">En contexto del hero (desktop split layout)</p>
              </div>
              <div className="bg-white p-8">
                <div className="mx-auto flex max-w-5xl items-center gap-12">
                  {/* Mock text column */}
                  <div className="flex-1 space-y-4">
                    <div className="h-3 w-48 rounded bg-muted" />
                    <div className="space-y-2">
                      <div className="h-6 w-full rounded bg-foreground/10" />
                      <div className="h-6 w-4/5 rounded bg-foreground/10" />
                    </div>
                    <div className="space-y-1.5">
                      <div className="h-3 w-full rounded bg-muted" />
                      <div className="h-3 w-11/12 rounded bg-muted" />
                      <div className="h-3 w-3/4 rounded bg-muted" />
                    </div>
                    <div className="flex gap-3">
                      <div className="h-10 w-40 rounded-lg bg-tribai-blue" />
                      <div className="h-10 w-32 rounded-lg border border-border" />
                    </div>
                  </div>
                  {/* Diagram column */}
                  <div className="hidden w-80 shrink-0 text-foreground md:block">
                    <Component />
                  </div>
                </div>
              </div>
            </div>
          </section>
        ))}
      </div>

      {/* Navigation */}
      <div className="sticky bottom-0 border-t border-border bg-background/95 px-6 py-4 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Visita cada sección o haz scroll para comparar
          </p>
          <div className="flex gap-2">
            {PROPOSALS.map(({ id, name, recommendation }) => (
              <a
                key={id}
                href={`#propuesta-${id.toLowerCase()}`}
                className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition-colors ${
                  recommendation
                    ? "border-tribai-blue bg-tribai-blue text-white"
                    : "border-border text-foreground hover:border-tribai-blue/30"
                }`}
              >
                {id}: {name}
              </a>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
