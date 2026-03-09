"use client";

import { useDeclaracionJuridica } from "@/lib/declaracion-renta-juridicas/declaracion-juridica-context";
import { UVT_VALUES } from "@/config/tax-data";
import type { ResultadoDeclaracionJuridica } from "@/lib/declaracion-renta-juridicas/types";
import { DeclaracionCurrencyInput } from "@/components/declaracion-renta/fields/DeclaracionCurrencyInput";

interface StepProps {
  resultado: ResultadoDeclaracionJuridica;
}

export function StepJ10Retenciones({ resultado }: StepProps) {
  const { state, dispatch } = useDeclaracionJuridica();
  const ret = state.retenciones;
  const uvt = UVT_VALUES[state.perfil.anoGravable] ?? 49_799;

  const update = (payload: Partial<typeof ret>) =>
    dispatch({ type: "UPDATE_RETENCIONES", payload });

  return (
    <div className="space-y-6">
      <div className="rounded-md border border-border/60 bg-muted/30 p-4">
        <p className="text-sm text-foreground">
          Retenciones practicadas a la empresa, autorretenciones y anticipos de periodos anteriores.
          Casillas 93 a 97 del Formulario 110.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <DeclaracionCurrencyInput
          id="anticipo-anterior"
          label="Anticipo renta año anterior (Cas 93)"
          value={ret.anticipoAnoAnterior}
          onChange={(v) => update({ anticipoAnoAnterior: v })}
          uvtEquivalent={ret.anticipoAnoAnterior / uvt}
          tooltipText="Anticipo al impuesto de renta pagado en la declaración del año anterior."
        />
        <DeclaracionCurrencyInput
          id="saldo-favor-anterior"
          label="Saldo a favor año anterior (Cas 94)"
          value={ret.saldoFavorAnterior}
          onChange={(v) => update({ saldoFavorAnterior: v })}
          uvtEquivalent={ret.saldoFavorAnterior / uvt}
          tooltipText="Saldo a favor de la declaración del periodo anterior, si se solicitó como compensación."
        />
        <DeclaracionCurrencyInput
          id="autorretenciones"
          label="Autorretenciones (Cas 95)"
          value={ret.autorretenciones}
          onChange={(v) => update({ autorretenciones: v })}
          uvtEquivalent={ret.autorretenciones / uvt}
          tooltipText="Total autorretenciones del periodo (Decreto 2201/2016)."
        />
        <DeclaracionCurrencyInput
          id="otras-retenciones"
          label="Otras retenciones (Cas 96)"
          value={ret.otrasRetenciones}
          onChange={(v) => update({ otrasRetenciones: v })}
          uvtEquivalent={ret.otrasRetenciones / uvt}
          tooltipText="Retenciones en la fuente practicadas por terceros durante el año gravable."
        />
      </div>

      {/* Subtotal */}
      <div className="rounded-md border border-border/60 bg-muted/30 p-4 text-center">
        <p className="text-[11px] text-muted-foreground">Total retenciones año gravable (Cas 97)</p>
        <p className="font-values text-lg font-semibold text-foreground">
          ${resultado.liquidacion.totalRetenciones.toLocaleString("es-CO")}
        </p>
      </div>
    </div>
  );
}
