"use client";

import { useDeclaracion } from "@/lib/declaracion-renta/declaracion-context";
import { UVT_VALUES } from "@/config/tax-data";
import type { ResultadoDeclaracion } from "@/lib/declaracion-renta/types";
import { DeclaracionCurrencyInput } from "../fields/DeclaracionCurrencyInput";

interface StepProps {
  resultado: ResultadoDeclaracion;
}

export function Step12DescuentosTributarios({ resultado }: StepProps) {
  const { state, dispatch } = useDeclaracion();
  const dt = state.descuentosTributarios;
  const uvt = UVT_VALUES[state.perfil.anoGravable] ?? 49_799;

  const update = (payload: Partial<typeof dt>) =>
    dispatch({ type: "UPDATE_DESCUENTOS_TRIBUTARIOS", payload });

  const rd = resultado.descuentos;

  return (
    <div className="space-y-6">
      <div className="rounded-md border border-border/60 bg-muted/30 p-4">
        <p className="text-sm text-foreground">
          Los descuentos tributarios se restan directamente del impuesto calculado, no de la base gravable.
          Son más valiosos que las deducciones. Si no tiene ninguno, puede saltar este paso.
        </p>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.05em] text-foreground">
          Descuentos sobre el impuesto (Art. 254-258 ET)
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <DeclaracionCurrencyInput
            id="dt-exterior"
            label="Impuestos pagados en el exterior"
            value={dt.impuestosExterior}
            onChange={(v) => update({ impuestosExterior: v })}
            uvtEquivalent={dt.impuestosExterior / uvt}
            tooltipText="Impuesto de renta pagado en otro país por ingresos de fuente extranjera. Requiere certificación."
            articuloET="254"
          />
          <DeclaracionCurrencyInput
            id="dt-ambiental"
            label="Inversión en control ambiental"
            value={dt.inversionAmbiental}
            onChange={(v) => update({ inversionAmbiental: v })}
            uvtEquivalent={dt.inversionAmbiental / uvt}
            tooltipText="Inversiones en control y mejoramiento del medio ambiente, certificadas por la autoridad ambiental."
            articuloET="255"
          />
          <DeclaracionCurrencyInput
            id="dt-id"
            label="Inversiones en investigación y desarrollo"
            value={dt.inversionID}
            onChange={(v) => update({ inversionID: v })}
            uvtEquivalent={dt.inversionID / uvt}
            tooltipText="Inversiones en proyectos de I+D aprobados por Colciencias/MinCiencias."
            articuloET="256"
          />
          <DeclaracionCurrencyInput
            id="dt-donaciones"
            label="Donaciones a régimen especial"
            value={dt.donacionesRegimenEspecial}
            onChange={(v) => update({ donacionesRegimenEspecial: v })}
            uvtEquivalent={dt.donacionesRegimenEspecial / uvt}
            tooltipText="El 25% de las donaciones a entidades del régimen tributario especial calificadas por la DIAN."
            articuloET="257"
          />
          <DeclaracionCurrencyInput
            id="dt-becas"
            label="Becas por impuestos / deportivas"
            value={dt.becasDeportivas}
            onChange={(v) => update({ becasDeportivas: v })}
            uvtEquivalent={dt.becasDeportivas / uvt}
            articuloET="257-1"
          />
          <DeclaracionCurrencyInput
            id="dt-iva"
            label="IVA importación activos fijos"
            value={dt.IVAImportacionActivos}
            onChange={(v) => update({ IVAImportacionActivos: v })}
            uvtEquivalent={dt.IVAImportacionActivos / uvt}
            tooltipText="IVA pagado en la importación de maquinaria pesada para industrias básicas."
            articuloET="258-1"
          />
        </div>
      </div>

      {/* Subtotal */}
      {rd.totalDescuentos > 0 && (
        <div className="rounded-md border border-border/60 bg-muted/30 p-4">
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-[0.05em] text-muted-foreground">
            Resumen descuentos tributarios
          </h4>
          <div className="grid grid-cols-2 gap-4 text-center sm:grid-cols-4">
            <div>
              <p className="text-[11px] text-muted-foreground">Descuentos limitados</p>
              <p className="font-values text-lg font-semibold text-foreground">
                ${rd.descuentosLimitados.toLocaleString("es-CO")}
              </p>
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground">Descuento IVA activos</p>
              <p className="font-values text-lg font-semibold text-foreground">
                ${rd.descuentoIVAActivos.toLocaleString("es-CO")}
              </p>
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground">Descuento dividendos</p>
              <p className="font-values text-lg font-semibold text-foreground">
                ${rd.descuentoDividendos.toLocaleString("es-CO")}
              </p>
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground">Total descuentos</p>
              <p className="font-values text-lg font-semibold text-foreground">
                ${rd.totalDescuentos.toLocaleString("es-CO")}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
