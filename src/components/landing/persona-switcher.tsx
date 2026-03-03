"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface Persona {
  key: string;
  label: string;
  title: string;
  description: string;
  points: string[];
  cta: string;
  href: string;
}

const PERSONAS: Persona[] = [
  {
    key: "contador",
    label: "Contador",
    title: "Contador público independiente",
    description:
      "Liquide más casos al día sin rehacer plantillas ni buscar artículos manualmente.",
    points: [
      "Retención, renta, sanciones e intereses en un solo flujo",
      "Consulta inmediata de artículos del ET",
      "Respuestas del asistente con contexto normativo",
    ],
    cta: "Ir a herramientas para contadores",
    href: "/calculadoras/retencion",
  },
  {
    key: "pyme",
    label: "PyME",
    title: "Empresario PyME",
    description:
      "Entienda qué debe pagar, cuándo y por qué, sin lenguaje enredado.",
    points: [
      "Ruta guiada para obligaciones frecuentes",
      "Calendario fiscal 2026 por tipo de obligación",
      "Calculadoras listas para tomar decisiones",
    ],
    cta: "Ver ruta para PyME",
    href: "/calendario",
  },
  {
    key: "abogado",
    label: "Abogado",
    title: "Abogado tributarista",
    description:
      "Acelere validaciones técnicas con consulta profunda del ET y doctrina.",
    points: [
      "Explorador por artículo con historial de reformas",
      "Comparador de artículos entre versiones",
      "Doctrina DIAN y novedades normativas",
    ],
    cta: "Ir al explorador técnico",
    href: "/explorador",
  },
  {
    key: "natural",
    label: "Persona natural",
    title: "Persona natural declarante",
    description:
      "Resuelva primero la pregunta clave: ¿debo declarar renta?",
    points: [
      "Validación por topes y condiciones vigentes",
      "Explicación clara de resultados",
      "Siguiente paso sugerido con artículo de referencia",
    ],
    cta: "Validar si debo declarar",
    href: "/calculadoras/debo-declarar",
  },
  {
    key: "equipo",
    label: "Equipo",
    title: "Departamento contable",
    description:
      "Centralice consulta, cálculo y referencia para todo el equipo.",
    points: [
      "Panel unificado de consulta y cálculo",
      "Favoritos y notas por cliente",
      "Estandarización de criterios normativos",
    ],
    cta: "Abrir panel del equipo",
    href: "/dashboard",
  },
];

export function PersonaSwitcher() {
  const [activeKey, setActiveKey] = useState<string>(PERSONAS[0].key);

  const activePersona = useMemo(
    () => PERSONAS.find((persona) => persona.key === activeKey) ?? PERSONAS[0],
    [activeKey]
  );

  return (
    <div className="relative">
      <div
        role="tablist"
        aria-label="Seleccion de perfil"
        className="mb-8 flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-6 px-6 md:mx-0 md:px-0"
      >
        {PERSONAS.map((persona) => {
          const isActive = persona.key === activePersona.key;
          return (
            <button
              key={persona.key}
              role="tab"
              aria-selected={isActive}
              aria-controls={`persona-panel-${persona.key}`}
              data-active={isActive}
              onClick={() => setActiveKey(persona.key)}
              className="whitespace-nowrap rounded-full border border-border px-5 py-2.5 text-sm font-medium text-foreground transition-all duration-300 hover:border-tribai-blue/30 data-[active=true]:border-tribai-blue data-[active=true]:bg-tribai-blue data-[active=true]:text-white"
            >
              {persona.label}
            </button>
          );
        })}
      </div>

      <div className="pointer-events-none absolute right-0 top-0 h-10 w-12 bg-gradient-to-l from-background via-background/60 to-transparent md:hidden" />
      <div className="pointer-events-none absolute left-0 top-0 h-10 w-12 bg-gradient-to-r from-background via-background/60 to-transparent md:hidden" />

      <article
        key={activePersona.key}
        id={`persona-panel-${activePersona.key}`}
        role="tabpanel"
        className="persona-panel-enter rounded-2xl border border-border bg-card p-6 md:p-8"
      >
        <h3 className="heading-serif text-2xl text-foreground md:text-4xl">
          {activePersona.title}
        </h3>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
          {activePersona.description}
        </p>

        <ul className="mt-4 space-y-2.5 text-sm leading-relaxed text-muted-foreground">
          {activePersona.points.map((point) => (
            <li key={point} className="flex items-start gap-2.5">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-tribai-blue/40" aria-hidden="true" />
              {point}
            </li>
          ))}
        </ul>

        <Link
          href={activePersona.href}
          className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-tribai-blue transition-colors hover:text-tribai-blue/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tribai-blue/30"
        >
          {activePersona.cta}
          <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
        </Link>
      </article>
    </div>
  );
}
