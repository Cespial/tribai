"use client";

import { useDeclaracionJuridica } from "@/lib/declaracion-renta-juridicas/declaracion-juridica-context";
import { UVT_VALUES } from "@/config/tax-data";
import type { ResultadoDeclaracionJuridica } from "@/lib/declaracion-renta-juridicas/types";
import { DeclaracionCurrencyInput } from "@/components/declaracion-renta/fields/DeclaracionCurrencyInput";

interface StepProps {
  resultado: ResultadoDeclaracionJuridica;
}

export function StepJ04Ingresos({ resultado }: StepProps) {
  const { state, dispatch } = useDeclaracionJuridica();
  const ing = state.ingresos;
  const uvt = UVT_VALUES[state.perfil.anoGravable] ?? 49_799;
  const dep = resultado.depuracion;

  const update = (payload: Partial<typeof ing>) =>
    dispatch({ type: "UPDATE_INGRESOS", payload });

  return (
    <div className="space-y-6">
      <div className="rounded-md border border-border/60 bg-muted/30 p-4">
        <p className="text-sm text-foreground">
          Totalice los ingresos brutos de la persona jurídica durante el año gravable.
          Casillas 44 a 56 del Formulario 110.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <DeclaracionCurrencyInput
          id="ing-operacionales"
          label="Ingresos operacionales (Cas 44)"
          value={ing.ingresosOperacionales}
          onChange={(v) => update({ ingresosOperacionales: v })}
          uvtEquivalent={ing.ingresosOperacionales / uvt}
          tooltipText="Ingresos derivados de la actividad económica principal de la empresa."
        />
        <DeclaracionCurrencyInput
          id="ing-financieros"
          label="Ingresos financieros (Cas 45)"
          value={ing.ingresosFinancieros}
          onChange={(v) => update({ ingresosFinancieros: v })}
          uvtEquivalent={ing.ingresosFinancieros / uvt}
          tooltipText="Rendimientos financieros, intereses y diferencia en cambio."
        />
        <DeclaracionCurrencyInput
          id="dividendos-sub2"
          label="Dividendos gravados Art. 49 Par. 2 (Cas 46)"
          value={ing.dividendosSubcedula2}
          onChange={(v) => update({ dividendosSubcedula2: v })}
          uvtEquivalent={ing.dividendosSubcedula2 / uvt}
          articuloET="49"
        />
        <DeclaracionCurrencyInput
          id="dividendos-otros"
          label="Otros dividendos y participaciones (Cas 47)"
          value={ing.dividendosOtros}
          onChange={(v) => update({ dividendosOtros: v })}
          uvtEquivalent={ing.dividendosOtros / uvt}
        />
        <DeclaracionCurrencyInput
          id="dividendos-27"
          label="Dividendos tarifa Art. 240 (Cas 48)"
          value={ing.dividendosTarifa27}
          onChange={(v) => update({ dividendosTarifa27: v })}
          uvtEquivalent={ing.dividendosTarifa27 / uvt}
          articuloET="240"
        />
        <DeclaracionCurrencyInput
          id="ing-go"
          label="Ingresos por ganancias ocasionales (Cas 49)"
          value={ing.ingresosGananciasOcasionales}
          onChange={(v) => update({ ingresosGananciasOcasionales: v })}
          uvtEquivalent={ing.ingresosGananciasOcasionales / uvt}
        />
        <DeclaracionCurrencyInput
          id="recuperacion-deducciones"
          label="Recuperación de deducciones (Cas 50)"
          value={ing.recuperacionDeducciones}
          onChange={(v) => update({ recuperacionDeducciones: v })}
          uvtEquivalent={ing.recuperacionDeducciones / uvt}
        />
        <DeclaracionCurrencyInput
          id="ing-participaciones"
          label="Ingresos por participaciones (Cas 51)"
          value={ing.ingresosParticipaciones}
          onChange={(v) => update({ ingresosParticipaciones: v })}
          uvtEquivalent={ing.ingresosParticipaciones / uvt}
        />
        <DeclaracionCurrencyInput
          id="otros-ingresos"
          label="Otros ingresos (Cas 52)"
          value={ing.otrosIngresos}
          onChange={(v) => update({ otrosIngresos: v })}
          uvtEquivalent={ing.otrosIngresos / uvt}
        />
        <DeclaracionCurrencyInput
          id="devoluciones"
          label="Devoluciones, rebajas y descuentos (Cas 54)"
          value={ing.devolucionesDescuentos}
          onChange={(v) => update({ devolucionesDescuentos: v })}
          uvtEquivalent={ing.devolucionesDescuentos / uvt}
          tooltipText="Se restan de los ingresos brutos para obtener ingresos netos."
        />
        <DeclaracionCurrencyInput
          id="incrngo"
          label="Ingresos no constitutivos de renta (Cas 55)"
          value={ing.ingresosNoCRNGO}
          onChange={(v) => update({ ingresosNoCRNGO: v })}
          uvtEquivalent={ing.ingresosNoCRNGO / uvt}
          tooltipText="INCRNGO — Ingresos no constitutivos de renta ni ganancia ocasional. Arts. 36 a 57-2 ET."
        />
      </div>

      {/* Subtotal */}
      <div className="rounded-md border border-border/60 bg-muted/30 p-4">
        <h4 className="mb-2 text-xs font-semibold uppercase tracking-[0.05em] text-muted-foreground">
          Subtotal ingresos
        </h4>
        <div className="grid grid-cols-2 gap-4 text-center sm:grid-cols-3">
          <div>
            <p className="text-[11px] text-muted-foreground">Ingresos brutos (Cas 53)</p>
            <p className="font-values text-lg font-semibold text-foreground">
              ${dep.ingresosBrutos.toLocaleString("es-CO")}
            </p>
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground">(−) Devoluc. + INCRNGO</p>
            <p className="font-values text-lg font-semibold text-foreground">
              ${(dep.devolucionesDescuentos + dep.incrngo).toLocaleString("es-CO")}
            </p>
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground">Ingresos netos (Cas 56)</p>
            <p className="font-values text-lg font-semibold text-foreground">
              ${dep.ingresosNetos.toLocaleString("es-CO")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
