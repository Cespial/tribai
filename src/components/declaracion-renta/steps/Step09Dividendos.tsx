"use client";

import { useDeclaracion } from "@/lib/declaracion-renta/declaracion-context";
import { UVT_VALUES } from "@/config/tax-data";
import type { ResultadoDeclaracion } from "@/lib/declaracion-renta/types";
import { DeclaracionCurrencyInput } from "../fields/DeclaracionCurrencyInput";

interface StepProps {
  resultado: ResultadoDeclaracion;
}

export function Step09Dividendos({ resultado }: StepProps) {
  const { state, dispatch } = useDeclaracion();
  const cd = state.cedulaDividendos;
  const uvt = UVT_VALUES[state.perfil.anoGravable] ?? 49_799;

  const update = (payload: Partial<typeof cd>) =>
    dispatch({ type: "UPDATE_CEDULA_DIVIDENDOS", payload });

  const rd = resultado.cedulaDividendos;

  return (
    <div className="space-y-6">
      <div className="rounded-md border border-border/60 bg-muted/30 p-4">
        <p className="text-sm text-foreground">
          Si recibió dividendos o participaciones de sociedades colombianas o del exterior, ingrese los valores aquí.
          Los dividendos tienen dos sub-cédulas con tarifas diferentes según el Art. 242 ET.
          Si no recibe dividendos, puede saltar este paso.
        </p>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.05em] text-foreground">
          Sub-cédula 1 — Dividendos no gravados (Art. 242)
        </h3>
        <p className="mb-3 text-xs text-muted-foreground">
          Dividendos que ya pagaron impuesto a nivel de la sociedad. Tarifa: 0-300 UVT → 0%, 300-1.090 UVT → 10%, {">"}1.090 UVT → 15%.
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <DeclaracionCurrencyInput
            id="cd-no-gravados"
            label="Dividendos no gravados (post-2016)"
            value={cd.dividendosNoGravados}
            onChange={(v) => update({ dividendosNoGravados: v })}
            uvtEquivalent={cd.dividendosNoGravados / uvt}
            tooltipText="Dividendos distribuidos de utilidades generadas a partir de 2017 que ya fueron gravados en la sociedad."
            articuloET="242"
          />
          <DeclaracionCurrencyInput
            id="cd-no-gravados-2016"
            label="Dividendos pre-2017"
            value={cd.dividendosNoGravados2016}
            onChange={(v) => update({ dividendosNoGravados2016: v })}
            uvtEquivalent={cd.dividendosNoGravados2016 / uvt}
            tooltipText="Dividendos de utilidades generadas antes de 2017 (régimen transitorio)."
          />
          <DeclaracionCurrencyInput
            id="cd-participaciones-ng"
            label="Participaciones no gravadas"
            value={cd.participacionesNoGravadas}
            onChange={(v) => update({ participacionesNoGravadas: v })}
            uvtEquivalent={cd.participacionesNoGravadas / uvt}
          />
        </div>
      </div>

      <hr className="border-border/40" />

      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.05em] text-foreground">
          Sub-cédula 2 — Dividendos gravados (Art. 241 + 242)
        </h3>
        <p className="mb-3 text-xs text-muted-foreground">
          Dividendos que NO pagaron impuesto en la sociedad. Se aplica la tabla Art. 241 + recargo Art. 242.
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <DeclaracionCurrencyInput
            id="cd-gravados"
            label="Dividendos gravados"
            value={cd.dividendosGravados}
            onChange={(v) => update({ dividendosGravados: v })}
            uvtEquivalent={cd.dividendosGravados / uvt}
            tooltipText="Dividendos que la sociedad no había gravado (utilidades no distribuidas que exceden la base Art. 49)."
            articuloET="242"
          />
          <DeclaracionCurrencyInput
            id="cd-participaciones-g"
            label="Participaciones gravadas"
            value={cd.participacionesGravadas}
            onChange={(v) => update({ participacionesGravadas: v })}
            uvtEquivalent={cd.participacionesGravadas / uvt}
          />
        </div>
      </div>

      {/* Subtotal */}
      {(rd.subCedula1Total > 0 || rd.subCedula2Total > 0) && (
        <div className="rounded-md border border-border/60 bg-muted/30 p-4">
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-[0.05em] text-muted-foreground">
            Subtotal cédula dividendos
          </h4>
          <div className="grid grid-cols-2 gap-4 text-center sm:grid-cols-4">
            <div>
              <p className="text-[11px] text-muted-foreground">Sub-cédula 1</p>
              <p className="font-values text-lg font-semibold text-foreground">
                ${rd.subCedula1Total.toLocaleString("es-CO")}
              </p>
              <p className="text-[10px] text-muted-foreground">
                Impuesto: ${rd.subCedula1Impuesto.toLocaleString("es-CO")}
              </p>
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground">Sub-cédula 2</p>
              <p className="font-values text-lg font-semibold text-foreground">
                ${rd.subCedula2Total.toLocaleString("es-CO")}
              </p>
              <p className="text-[10px] text-muted-foreground">
                Impuesto: ${rd.subCedula2Impuesto.toLocaleString("es-CO")}
              </p>
            </div>
            <div className="col-span-2">
              <p className="text-[11px] text-muted-foreground">Impuesto total dividendos</p>
              <p className="font-values text-xl font-semibold text-foreground">
                ${rd.impuestoTotalDividendos.toLocaleString("es-CO")}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
