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
      className="bg-background px-6 py-28 md:px-8 md:py-36"
    >
      <Reveal className="mx-auto max-w-6xl">
        <p className="text-sm font-semibold uppercase tracking-widest text-tribai-blue">
          Cómo funciona
        </p>
        <h2
          id="workflow-title"
          className="heading-serif mt-3 max-w-3xl text-3xl text-foreground md:text-5xl"
        >
          De su pregunta a su respuesta. En 3 pasos.
        </h2>

        <div className="mt-16 grid gap-10 md:grid-cols-3">
          {STEPS.map((step, index) => (
            <Reveal key={step.number} delay={index * 100}>
            <div className="relative rounded-xl p-1">
              <div className="flex items-center gap-4">
                <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-tribai-blue bg-background">
                  <step.icon className="h-5 w-5 text-tribai-blue" aria-hidden="true" />
                </div>
                <span className="font-values text-sm font-semibold text-muted-foreground">
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
            </Reveal>
          ))}
        </div>

        <div className="mt-10">
          <Link
            href="/calculadoras"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-tribai-blue transition-colors hover:text-tribai-blue/80"
          >
            Empezar ahora
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
      </Reveal>
    </section>
  );
}
