"use client";

import { FileSearch, Calculator, ShieldCheck, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Reveal } from "@/components/ui/reveal";

const STEPS = [
  {
    number: "01",
    icon: FileSearch,
    title: "Identifique la norma",
    description:
      "Busque el artículo en el Estatuto Tributario o pregúntele a la IA. Encuentre la norma aplicable con su texto vigente, historial de reformas y artículos relacionados.",
  },
  {
    number: "02",
    icon: Calculator,
    title: "Calcule con precisión",
    description:
      "Ejecute la calculadora con datos reales. Retención, renta, sanciones, IVA, laboral — cada resultado muestra la tarifa, la base y el artículo que lo respalda.",
  },
  {
    number: "03",
    icon: ShieldCheck,
    title: "Sustente con fuentes",
    description:
      "Cada respuesta viene con citación normativa. Artículo del ET, doctrina DIAN, decreto o jurisprudencia. Su criterio profesional, respaldado por la fuente exacta.",
  },
];

export function WorkflowSteps() {
  return (
    <section
      aria-labelledby="workflow-title"
      className="bg-background px-6 py-20 md:px-8 md:py-28"
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

        <div className="relative mt-14 grid gap-8 md:grid-cols-3">
          {/* Connecting line — desktop only */}
          <div className="absolute left-0 right-0 top-[22px] hidden h-px bg-border md:block" aria-hidden="true" />

          {STEPS.map((step, index) => (
            <Reveal key={step.number} delay={index * 100}>
            <div className="relative rounded-xl p-1">
              <div className="flex items-center gap-4">
                <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-tribai-blue bg-background">
                  <step.icon className="h-5 w-5 text-tribai-blue" aria-hidden="true" />
                </div>
                <span className="font-values text-sm font-semibold text-tribai-gold">
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
