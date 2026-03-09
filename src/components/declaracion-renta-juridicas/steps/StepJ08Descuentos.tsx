"use client";

import { useDeclaracionJuridica } from "@/lib/declaracion-renta-juridicas/declaracion-juridica-context";
import { UVT_VALUES } from "@/config/tax-data";
import type { ResultadoDeclaracionJuridica } from "@/lib/declaracion-renta-juridicas/types";
import { DeclaracionCurrencyInput } from "@/components/declaracion-renta/fields/DeclaracionCurrencyInput";

interface StepProps {
  resultado: ResultadoDeclaracionJuridica;
}

export function StepJ08Descuentos({ resultado }: StepProps) {
  const { state, dispatch } = useDeclaracionJuridica();
  const desc = state.descuentos;
  const uvt = UVT_VALUES[state.perfil.anoGravable] ?? 49_799;
  const rd = resultado.descuentos;

  const update = (payload: Partial<typeof desc>) =>
    dispatch({ type: "UPDATE_DESCUENTOS", payload });

  return (
    <div className="space-y-6">
      <div className="rounded-md border border-border/60 bg-muted/30 p-4">
        <p className="text-sm text-foreground">
          Descuentos tributarios aplicables al impuesto de renta.
          Arts. 254-258 ET. Los descuentos de los Arts. 255, 256 y 257 tienen un
          <strong> límite combinado del 25%</strong> del impuesto a cargo (Art. 258).
          Si no tiene descuentos, puede saltar este paso.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <DeclaracionCurrencyInput
          id="desc-exterior"
          label="Impuestos pagados en el exterior"
          value={desc.impuestosPagadosExterior}
          onChange={(v) => update({ impuestosPagadosExterior: v })}
          uvtEquivalent={desc.impuestosPagadosExterior / uvt}
          articuloET="254"
          tooltipText="Descuento por impuestos pagados en el exterior sobre rentas de fuente extranjera. No sujeto al límite combinado del 25%."
        />
        <DeclaracionCurrencyInput
          id="desc-ambiente"
          label="Inversiones en medio ambiente (base)"
          value={desc.inversionesMedioAmbiente}
          onChange={(v) => update({ inversionesMedioAmbiente: v })}
          uvtEquivalent={desc.inversionesMedioAmbiente / uvt}
          articuloET="255"
          helperText="Descuento: 25% de la inversión"
        />
        <DeclaracionCurrencyInput
          id="desc-idi"
          label="Investigación y desarrollo (base)"
          value={desc.investigacionDesarrollo}
          onChange={(v) => update({ investigacionDesarrollo: v })}
          uvtEquivalent={desc.investigacionDesarrollo / uvt}
          articuloET="256"
          helperText="Descuento: 30% de la inversión"
        />
        <DeclaracionCurrencyInput
          id="desc-donaciones"
          label="Donaciones a entidades especiales (base)"
          value={desc.donacionesEntidadesEspeciales}
          onChange={(v) => update({ donacionesEntidadesEspeciales: v })}
          uvtEquivalent={desc.donacionesEntidadesEspeciales / uvt}
          articuloET="257"
          helperText="Descuento: 25% de la donación"
        />
        <DeclaracionCurrencyInput
          id="desc-alimentos"
          label="Donaciones bancos de alimentos (base)"
          value={desc.donacionesBancosAlimentos}
          onChange={(v) => update({ donacionesBancosAlimentos: v })}
          uvtEquivalent={desc.donacionesBancosAlimentos / uvt}
          articuloET="257"
          helperText="Descuento: 37% de la donación (Par. 1 Art. 257)"
        />
        <DeclaracionCurrencyInput
          id="desc-iva"
          label="IVA en activos fijos reales productivos"
          value={desc.ivaActivosCapital}
          onChange={(v) => update({ ivaActivosCapital: v })}
          uvtEquivalent={desc.ivaActivosCapital / uvt}
          articuloET="258-1"
          helperText="Descuento: 100% del IVA pagado"
        />
        <DeclaracionCurrencyInput
          id="desc-otros"
          label="Otros descuentos tributarios"
          value={desc.otrosDescuentos}
          onChange={(v) => update({ otrosDescuentos: v })}
          uvtEquivalent={desc.otrosDescuentos / uvt}
        />
      </div>

      {/* Resultado descuentos */}
      {rd.totalDescuentos > 0 && (
        <div className="rounded-md border border-border/60 bg-muted/30 p-4">
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-[0.05em] text-muted-foreground">
            Descuentos aplicados
          </h4>
          <div className="grid grid-cols-2 gap-4 text-center sm:grid-cols-3">
            <div>
              <p className="text-[11px] text-muted-foreground">Exterior</p>
              <p className="font-values text-base font-semibold text-foreground">
                ${rd.impuestosPagadosExterior.toLocaleString("es-CO")}
              </p>
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground">I+D+i</p>
              <p className="font-values text-base font-semibold text-foreground">
                ${rd.iDMasI.toLocaleString("es-CO")}
              </p>
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground">Donaciones</p>
              <p className="font-values text-base font-semibold text-foreground">
                ${rd.donaciones.toLocaleString("es-CO")}
              </p>
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground">Total (Cas 88)</p>
              <p className="font-values text-lg font-semibold text-foreground">
                ${rd.totalDescuentos.toLocaleString("es-CO")}
              </p>
            </div>
          </div>
          {rd.limitado && (
            <p className="mt-2 text-xs text-destructive">
              Los descuentos Arts. 255-257 fueron limitados al 25% del impuesto a cargo (Art. 258 ET).
            </p>
          )}
        </div>
      )}
    </div>
  );
}
