"use client";

import { PlanificacionChat } from "@/components/planificacion/planificacion-chat";

export default function PlanificacionPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 text-center">
        <h1 className="heading-serif text-3xl text-foreground sm:text-4xl">
          Planeación Financiera Tributaria
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Un asesor que analiza tu situación fiscal y te guía para optimizar tu declaración de renta.
        </p>
      </div>
      <PlanificacionChat />
    </main>
  );
}
