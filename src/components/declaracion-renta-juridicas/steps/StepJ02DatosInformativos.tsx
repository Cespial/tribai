"use client";

import { useDeclaracionJuridica } from "@/lib/declaracion-renta-juridicas/declaracion-juridica-context";
import { UVT_VALUES } from "@/config/tax-data";
import type { ResultadoDeclaracionJuridica } from "@/lib/declaracion-renta-juridicas/types";
import { DeclaracionCurrencyInput } from "@/components/declaracion-renta/fields/DeclaracionCurrencyInput";

interface StepProps {
  resultado: ResultadoDeclaracionJuridica;
}

export function StepJ02DatosInformativos({ resultado }: StepProps) {
  const { state, dispatch } = useDeclaracionJuridica();
  const di = state.datosInformativos;
  const uvt = UVT_VALUES[state.perfil.anoGravable] ?? 49_799;

  const update = (payload: Partial<typeof di>) =>
    dispatch({ type: "UPDATE_DATOS_INFORMATIVOS", payload });

  return (
    <div className="space-y-6">
      <div className="rounded-md border border-border/60 bg-muted/30 p-4">
        <p className="text-sm text-foreground">
          Información sobre costos de nómina y aportes al sistema de seguridad social.
          Estas casillas son <strong>informativas</strong> (Casillas 30-32 del Formulario 110)
          y no afectan directamente el cálculo del impuesto.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <DeclaracionCurrencyInput
          id="costos-nomina"
          label="Total costos y gastos de nómina"
          value={di.totalCostosNomina}
          onChange={(v) => update({ totalCostosNomina: v })}
          uvtEquivalent={di.totalCostosNomina / uvt}
          tooltipText="Valor total de la nómina de la empresa durante el año gravable (salarios, prestaciones, bonificaciones)."
        />
        <DeclaracionCurrencyInput
          id="aportes-seg-social"
          label="Aportes al sistema de seguridad social"
          value={di.aportesSegSocial}
          onChange={(v) => update({ aportesSegSocial: v })}
          uvtEquivalent={di.aportesSegSocial / uvt}
          tooltipText="Aportes a salud, pensión y ARL a cargo del empleador."
        />
        <DeclaracionCurrencyInput
          id="aportes-parafiscales"
          label="Aportes SENA, ICBF y Cajas de Compensación"
          value={di.aportesSenaIcbfCajas}
          onChange={(v) => update({ aportesSenaIcbfCajas: v })}
          uvtEquivalent={di.aportesSenaIcbfCajas / uvt}
          tooltipText="Aportes parafiscales al SENA (2%), ICBF (3%) y Cajas de Compensación Familiar (4%)."
        />
      </div>
    </div>
  );
}
