"use client";

import { useDeclaracionJuridica } from "@/lib/declaracion-renta-juridicas/declaracion-juridica-context";
import { UVT_VALUES } from "@/config/tax-data";
import type { ResultadoDeclaracionJuridica } from "@/lib/declaracion-renta-juridicas/types";
import { DeclaracionCurrencyInput } from "@/components/declaracion-renta/fields/DeclaracionCurrencyInput";

interface StepProps {
  resultado: ResultadoDeclaracionJuridica;
}

export function StepJ11TTD({ resultado }: StepProps) {
  const { state, dispatch } = useDeclaracionJuridica();
  const ttd = state.ttdInputs;
  const uvt = UVT_VALUES[state.perfil.anoGravable] ?? 49_799;
  const rttd = resultado.ttd;

  const update = (payload: Partial<typeof ttd>) =>
    dispatch({ type: "UPDATE_TTD_INPUTS", payload });

  if (rttd.excluido) {
    return (
      <div className="space-y-6">
        <div className="rounded-md border border-success/30 bg-success/5 p-4">
          <p className="text-sm text-foreground">
            Su tipo de entidad (<strong>{state.perfil.tipoEntidad.replace(/_/g, " ")}</strong>) está
            <strong> excluida</strong> del cálculo de la Tasa de Tributación Depurada (TTD).
            No necesita completar este paso.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-md border border-border/60 bg-muted/30 p-4">
        <p className="text-sm text-foreground">
          Art. 240 Par. 6 ET: la tasa de tributación depurada (TTD) no puede ser inferior al <strong>15%</strong>.
          Si la TTD resulta menor, se adiciona un impuesto para alcanzar la tasa mínima.
          Complete los datos de la conciliación fiscal para este cálculo.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <DeclaracionCurrencyInput
          id="ttd-utilidad"
          label="Utilidad contable antes de impuestos"
          value={ttd.utilidadContableAntesImpuestos}
          onChange={(v) => update({ utilidadContableAntesImpuestos: v })}
          uvtEquivalent={ttd.utilidadContableAntesImpuestos / uvt}
        />
        <DeclaracionCurrencyInput
          id="ttd-dif-perm"
          label="Diferencias permanentes que aumentan renta"
          value={ttd.diferenciasPermAumentanRenta}
          onChange={(v) => update({ diferenciasPermAumentanRenta: v })}
          uvtEquivalent={ttd.diferenciasPermAumentanRenta / uvt}
        />
        <DeclaracionCurrencyInput
          id="ttd-incrngo"
          label="INCRNGO que afectan utilidad"
          value={ttd.incrngoAfectanUtilidad}
          onChange={(v) => update({ incrngoAfectanUtilidad: v })}
          uvtEquivalent={ttd.incrngoAfectanUtilidad / uvt}
        />
        <DeclaracionCurrencyInput
          id="ttd-participacion"
          label="Valor método de participación"
          value={ttd.valorMetodoParticipacion}
          onChange={(v) => update({ valorMetodoParticipacion: v })}
          uvtEquivalent={ttd.valorMetodoParticipacion / uvt}
        />
        <DeclaracionCurrencyInput
          id="ttd-go"
          label="Valor neto GO que afectan utilidad"
          value={ttd.valorNetoGOAfectanUtilidad}
          onChange={(v) => update({ valorNetoGOAfectanUtilidad: v })}
          uvtEquivalent={ttd.valorNetoGOAfectanUtilidad / uvt}
        />
        <DeclaracionCurrencyInput
          id="ttd-cdi"
          label="Rentas exentas por CDI"
          value={ttd.rentasExentasCDI}
          onChange={(v) => update({ rentasExentasCDI: v })}
          uvtEquivalent={ttd.rentasExentasCDI / uvt}
        />
        <DeclaracionCurrencyInput
          id="ttd-comp"
          label="Compensación que no afecta utilidad"
          value={ttd.compensacionNoAfectaUtilidad}
          onChange={(v) => update({ compensacionNoAfectaUtilidad: v })}
          uvtEquivalent={ttd.compensacionNoAfectaUtilidad / uvt}
        />
      </div>

      {/* Resultado TTD */}
      <div className="rounded-md border border-border/60 bg-muted/30 p-4">
        <h4 className="mb-2 text-xs font-semibold uppercase tracking-[0.05em] text-muted-foreground">
          Resultado TTD
        </h4>
        <div className="grid grid-cols-2 gap-4 text-center sm:grid-cols-4">
          <div>
            <p className="text-[11px] text-muted-foreground">Impuesto depurado</p>
            <p className="font-values text-base font-semibold text-foreground">
              ${rttd.impuestoDepurado.toLocaleString("es-CO")}
            </p>
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground">Utilidad depurada</p>
            <p className="font-values text-base font-semibold text-foreground">
              ${rttd.utilidadDepurada.toLocaleString("es-CO")}
            </p>
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground">TTD</p>
            <p className="font-values text-base font-semibold text-foreground">
              {(rttd.tasaTributacionDepurada * 100).toFixed(2)}%
            </p>
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground">Impuesto a adicionar</p>
            <p className={`font-values text-base font-semibold ${rttd.impuestoAdicionar > 0 ? "text-destructive" : "text-foreground"}`}>
              ${rttd.impuestoAdicionar.toLocaleString("es-CO")}
            </p>
          </div>
        </div>
        {rttd.impuestoAdicionar > 0 && (
          <p className="mt-2 text-xs text-destructive">
            La TTD ({(rttd.tasaTributacionDepurada * 100).toFixed(2)}%) es inferior al 15%. Se adiciona impuesto para alcanzar la tasa mínima.
          </p>
        )}
      </div>
    </div>
  );
}
