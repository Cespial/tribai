"use client";

import { DeclaracionProvider } from "@/lib/declaracion-renta/declaracion-context";
import { DeclaracionWizard } from "@/components/declaracion-renta/DeclaracionWizard";

export default function DeclaracionRentaPage() {
  return (
    <DeclaracionProvider>
      <div className="mb-8">
        <p className="eyebrow-label mb-2">Formulario 210 — Personas Naturales</p>
        <h1 className="heading-serif text-3xl text-foreground sm:text-4xl">
          Declaración de Renta
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Calcule su impuesto de renta paso a paso con validación automática de topes legales,
          deducciones, rentas exentas y sugerencias de optimización fiscal. Sus datos se guardan
          localmente en su navegador.
        </p>
      </div>

      <DeclaracionWizard />
    </DeclaracionProvider>
  );
}
