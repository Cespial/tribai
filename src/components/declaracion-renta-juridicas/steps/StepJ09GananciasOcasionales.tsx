"use client";

import { useDeclaracionJuridica } from "@/lib/declaracion-renta-juridicas/declaracion-juridica-context";
import { UVT_VALUES } from "@/config/tax-data";
import type { ResultadoDeclaracionJuridica } from "@/lib/declaracion-renta-juridicas/types";
import { DeclaracionCurrencyInput } from "@/components/declaracion-renta/fields/DeclaracionCurrencyInput";

interface StepProps {
  resultado: ResultadoDeclaracionJuridica;
}

export function StepJ09GananciasOcasionales({ resultado }: StepProps) {
  const { state, dispatch } = useDeclaracionJuridica();
  const go = state.gananciasOcasionales;
  const uvt = UVT_VALUES[state.perfil.anoGravable] ?? 49_799;
  const rgo = resultado.gananciasOcasionales;

  const update = (payload: Partial<typeof go>) =>
    dispatch({ type: "UPDATE_GANANCIAS_OCASIONALES", payload });

  return (
    <div className="space-y-6">
      <div className="rounded-md border border-border/60 bg-muted/30 p-4">
        <p className="text-sm text-foreground">
          Ganancias ocasionales de la persona jurídica. Art. 313 ET:
          tarifa del <strong>15%</strong> para sociedades.
          Si no tuvo ganancias ocasionales, puede saltar este paso.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <DeclaracionCurrencyInput
          id="go-ingresos"
          label="Ingresos por ganancias ocasionales (Cas 78)"
          value={go.ingresos}
          onChange={(v) => update({ ingresos: v })}
          uvtEquivalent={go.ingresos / uvt}
          articuloET="299"
        />
        <DeclaracionCurrencyInput
          id="go-costos"
          label="Costos ganancias ocasionales (Cas 79)"
          value={go.costos}
          onChange={(v) => update({ costos: v })}
          uvtEquivalent={go.costos / uvt}
        />
        <DeclaracionCurrencyInput
          id="go-exentas"
          label="Ganancias no gravadas y exentas (Cas 80)"
          value={go.noGravadasExentas}
          onChange={(v) => update({ noGravadasExentas: v })}
          uvtEquivalent={go.noGravadasExentas / uvt}
        />
      </div>

      {rgo.gravables > 0 && (
        <div className="rounded-md border border-border/60 bg-muted/30 p-4">
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-[0.05em] text-muted-foreground">
            Resultado ganancias ocasionales
          </h4>
          <div className="grid grid-cols-2 gap-4 text-center sm:grid-cols-3">
            <div>
              <p className="text-[11px] text-muted-foreground">Gravables (Cas 81)</p>
              <p className="font-values text-lg font-semibold text-foreground">
                ${rgo.gravables.toLocaleString("es-CO")}
              </p>
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground">Impuesto 15% (Cas 90)</p>
              <p className="font-values text-lg font-semibold text-foreground">
                ${rgo.impuesto.toLocaleString("es-CO")}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
