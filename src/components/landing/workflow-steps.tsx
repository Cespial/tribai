import { ArrowRight } from "lucide-react";
import { TribaiIconComparador, TribaiIconCalculator, TribaiIconGuias } from "@/components/icons/tribai-icons";
import Link from "next/link";
import { Reveal } from "@/components/ui/reveal";

const STEPS = [
  {
    number: "01",
    icon: TribaiIconComparador,
    title: "Identifique la norma",
    description:
      "Busque el artículo en el Estatuto Tributario o pregúntele a la IA. Encuentre la norma aplicable con su texto vigente, historial de reformas y artículos relacionados.",
  },
  {
    number: "02",
    icon: TribaiIconCalculator,
    title: "Calcule con precisión",
    description:
      "Ejecute la calculadora con datos reales. Retención, renta, sanciones, IVA, laboral — cada resultado muestra la tarifa, la base y el artículo que lo respalda.",
  },
  {
    number: "03",
    icon: TribaiIconGuias,
    title: "Sustente con fuentes",
    description:
      "Cada respuesta viene con citación normativa. Artículo del ET, doctrina DIAN, decreto o jurisprudencia. Su criterio profesional, respaldado por la fuente exacta.",
  },
];

export function WorkflowSteps() {
  return (
    <section
      aria-labelledby="workflow-title"
      className="border-t border-border bg-background px-6 py-10 md:px-12 md:py-24 lg:px-20"
    >
      <Reveal className="mx-auto max-w-[960px]">
        <p className="eyebrow-label">
          Cómo funciona
        </p>
        <h2
          id="workflow-title"
          className="heading-serif mt-4 max-w-3xl text-2xl text-foreground md:text-4xl"
        >
          De su pregunta a su respuesta. En 3 pasos.
        </h2>

        <div className="mt-20 overflow-hidden rounded-lg border border-border md:grid md:grid-cols-3 md:divide-x md:divide-border">
          {STEPS.map((step, index) => (
            <div
              key={step.number}
              className={`p-8 ${index < STEPS.length - 1 ? "border-b border-border md:border-b-0" : ""}`}
            >
              <div className="flex items-center gap-4">
                <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-border bg-background">
                  <step.icon className="h-5 w-5 text-tribai-blue" aria-hidden="true" />
                </div>
                <span className="font-values text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Paso {step.number}
                </span>
              </div>
              <h3 className="mt-5 text-lg font-semibold text-foreground">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-10">
          <Link
            href="/calculadoras"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-tribai-blue transition-colors hover:underline hover:text-tribai-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tribai-blue/30"
          >
            Probar con una consulta real
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
      </Reveal>
    </section>
  );
}
