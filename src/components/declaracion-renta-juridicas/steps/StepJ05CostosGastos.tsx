"use client";

import { useDeclaracionJuridica } from "@/lib/declaracion-renta-juridicas/declaracion-juridica-context";
import { UVT_VALUES } from "@/config/tax-data";
import type { ResultadoDeclaracionJuridica } from "@/lib/declaracion-renta-juridicas/types";
import { DeclaracionCurrencyInput } from "@/components/declaracion-renta/fields/DeclaracionCurrencyInput";

interface StepProps {
  resultado: ResultadoDeclaracionJuridica;
}

export function StepJ05CostosGastos({ resultado }: StepProps) {
  const { state, dispatch } = useDeclaracionJuridica();
  const cg = state.costosGastos;
  const uvt = UVT_VALUES[state.perfil.anoGravable] ?? 49_799;
  const dep = resultado.depuracion;

  const update = (payload: Partial<typeof cg>) =>
    dispatch({ type: "UPDATE_COSTOS_GASTOS", payload });

  return (
    <div className="space-y-6">
      <div className="rounded-md border border-border/60 bg-muted/30 p-4">
        <p className="text-sm text-foreground">
          Registre los costos y gastos deducibles del año gravable.
          Casillas 57 a 62 del Formulario 110.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <DeclaracionCurrencyInput
          id="costos"
          label="Costos (Cas 57)"
          value={cg.costos}
          onChange={(v) => update({ costos: v })}
          uvtEquivalent={cg.costos / uvt}
          tooltipText="Costo de ventas o de prestación de servicios."
        />
        <DeclaracionCurrencyInput
          id="gastos-admin"
          label="Gastos de administración (Cas 58)"
          value={cg.gastosAdministracion}
          onChange={(v) => update({ gastosAdministracion: v })}
          uvtEquivalent={cg.gastosAdministracion / uvt}
        />
        <DeclaracionCurrencyInput
          id="gastos-ventas"
          label="Gastos de ventas (Cas 59)"
          value={cg.gastosVentas}
          onChange={(v) => update({ gastosVentas: v })}
          uvtEquivalent={cg.gastosVentas / uvt}
        />
        <DeclaracionCurrencyInput
          id="gastos-financieros"
          label="Gastos financieros (Cas 60)"
          value={cg.gastosFinancieros}
          onChange={(v) => update({ gastosFinancieros: v })}
          uvtEquivalent={cg.gastosFinancieros / uvt}
        />
        <DeclaracionCurrencyInput
          id="otros-gastos"
          label="Otros gastos y deducciones (Cas 61)"
          value={cg.otrosGastosDeducciones}
          onChange={(v) => update({ otrosGastosDeducciones: v })}
          uvtEquivalent={cg.otrosGastosDeducciones / uvt}
        />
      </div>

      {/* Subtotal */}
      <div className="rounded-md border border-border/60 bg-muted/30 p-4">
        <h4 className="mb-2 text-xs font-semibold uppercase tracking-[0.05em] text-muted-foreground">
          Depuración de renta
        </h4>
        <div className="grid grid-cols-2 gap-4 text-center sm:grid-cols-4">
          <div>
            <p className="text-[11px] text-muted-foreground">Total costos y gastos (Cas 62)</p>
            <p className="font-values text-lg font-semibold text-foreground">
              ${dep.totalCostosGastos.toLocaleString("es-CO")}
            </p>
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground">Renta líquida (Cas 65)</p>
            <p className="font-values text-lg font-semibold text-foreground">
              ${dep.rentaLiquidaOrdinaria.toLocaleString("es-CO")}
            </p>
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground">Pérdida líquida (Cas 66)</p>
            <p className="font-values text-lg font-semibold text-foreground">
              ${dep.perdidaLiquida.toLocaleString("es-CO")}
            </p>
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground">Renta gravable (Cas 73)</p>
            <p className="font-values text-lg font-semibold text-foreground">
              ${dep.rentaLiquidaGravable.toLocaleString("es-CO")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
