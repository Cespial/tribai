"use client";

import { DeclaracionJuridicaProvider } from "@/lib/declaracion-renta-juridicas/declaracion-juridica-context";
import { DeclaracionJuridicaWizard } from "@/components/declaracion-renta-juridicas/DeclaracionJuridicaWizard";

export default function DeclaracionRentaJuridicasPage() {
  return (
    <DeclaracionJuridicaProvider>
      <div className="mb-8">
        <p className="eyebrow-label mb-2">Formulario 110 — Personas Jurídicas</p>
        <h1 className="heading-serif text-3xl text-foreground sm:text-4xl">
          Declaración de Renta Jurídicas
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Calcule el impuesto de renta de su empresa paso a paso. Art. 240 ET, tarifa general del 35%,
          regímenes especiales (ZESE, ZOMAC, zonas francas), TTD, sobretasas, descuentos tributarios
          y compensación de pérdidas. Sus datos se guardan localmente en su navegador.
        </p>
      </div>

      <DeclaracionJuridicaWizard />
    </DeclaracionJuridicaProvider>
  );
}
