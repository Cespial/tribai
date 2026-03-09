"use client";

import { useDeclaracionJuridica } from "@/lib/declaracion-renta-juridicas/declaracion-juridica-context";
import { UVT_VALUES } from "@/config/tax-data";
import type { ResultadoDeclaracionJuridica } from "@/lib/declaracion-renta-juridicas/types";
import { DeclaracionCurrencyInput } from "@/components/declaracion-renta/fields/DeclaracionCurrencyInput";

interface StepProps {
  resultado: ResultadoDeclaracionJuridica;
}

export function StepJ03Patrimonio({ resultado }: StepProps) {
  const { state, dispatch } = useDeclaracionJuridica();
  const pat = state.patrimonio;
  const uvt = UVT_VALUES[state.perfil.anoGravable] ?? 49_799;
  const rp = resultado.patrimonio;

  const update = (payload: Partial<typeof pat>) =>
    dispatch({ type: "UPDATE_PATRIMONIO", payload });

  return (
    <div className="space-y-6">
      <div className="rounded-md border border-border/60 bg-muted/30 p-4">
        <p className="text-sm text-foreground">
          Estado de situación financiera al 31 de diciembre del año gravable.
          Casillas 33 a 43 del Formulario 110.
        </p>
      </div>

      <h4 className="text-xs font-semibold uppercase tracking-[0.05em] text-muted-foreground">
        Activos
      </h4>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <DeclaracionCurrencyInput
          id="efectivo"
          label="Efectivo y equivalentes (Cas 33)"
          value={pat.efectivoEquivalentes}
          onChange={(v) => update({ efectivoEquivalentes: v })}
          uvtEquivalent={pat.efectivoEquivalentes / uvt}
        />
        <DeclaracionCurrencyInput
          id="inversiones"
          label="Inversiones financieras (Cas 34)"
          value={pat.inversionesFinancieras}
          onChange={(v) => update({ inversionesFinancieras: v })}
          uvtEquivalent={pat.inversionesFinancieras / uvt}
        />
        <DeclaracionCurrencyInput
          id="cxc"
          label="Cuentas por cobrar (Cas 35)"
          value={pat.cuentasPorCobrar}
          onChange={(v) => update({ cuentasPorCobrar: v })}
          uvtEquivalent={pat.cuentasPorCobrar / uvt}
        />
        <DeclaracionCurrencyInput
          id="inventarios"
          label="Inventarios (Cas 36)"
          value={pat.inventarios}
          onChange={(v) => update({ inventarios: v })}
          uvtEquivalent={pat.inventarios / uvt}
        />
        <DeclaracionCurrencyInput
          id="intangibles"
          label="Activos intangibles (Cas 37)"
          value={pat.activosIntangibles}
          onChange={(v) => update({ activosIntangibles: v })}
          uvtEquivalent={pat.activosIntangibles / uvt}
        />
        <DeclaracionCurrencyInput
          id="biologicos"
          label="Activos biológicos (Cas 38)"
          value={pat.activosBiologicos}
          onChange={(v) => update({ activosBiologicos: v })}
          uvtEquivalent={pat.activosBiologicos / uvt}
        />
        <DeclaracionCurrencyInput
          id="ppe"
          label="PPE, propiedad de inversión y ANCMV (Cas 39)"
          value={pat.ppePlantaEquipo}
          onChange={(v) => update({ ppePlantaEquipo: v })}
          uvtEquivalent={pat.ppePlantaEquipo / uvt}
          tooltipText="Propiedad, planta y equipo + propiedades de inversión + activos no corrientes mantenidos para la venta."
        />
        <DeclaracionCurrencyInput
          id="otros-activos"
          label="Otros activos (Cas 40)"
          value={pat.otrosActivos}
          onChange={(v) => update({ otrosActivos: v })}
          uvtEquivalent={pat.otrosActivos / uvt}
        />
      </div>

      <h4 className="text-xs font-semibold uppercase tracking-[0.05em] text-muted-foreground">
        Pasivos
      </h4>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <DeclaracionCurrencyInput
          id="pasivos"
          label="Total pasivos (Cas 42)"
          value={pat.pasivos}
          onChange={(v) => update({ pasivos: v })}
          uvtEquivalent={pat.pasivos / uvt}
        />
      </div>

      {/* Subtotal */}
      <div className="rounded-md border border-border/60 bg-muted/30 p-4">
        <h4 className="mb-2 text-xs font-semibold uppercase tracking-[0.05em] text-muted-foreground">
          Resultado patrimonial
        </h4>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-[11px] text-muted-foreground">Patrimonio bruto (Cas 41)</p>
            <p className="font-values text-lg font-semibold text-foreground">
              ${rp.patrimonioBruto.toLocaleString("es-CO")}
            </p>
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground">Pasivos (Cas 42)</p>
            <p className="font-values text-lg font-semibold text-foreground">
              ${rp.pasivos.toLocaleString("es-CO")}
            </p>
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground">Patrimonio líquido (Cas 43)</p>
            <p className="font-values text-lg font-semibold text-foreground">
              ${rp.patrimonioLiquido.toLocaleString("es-CO")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
