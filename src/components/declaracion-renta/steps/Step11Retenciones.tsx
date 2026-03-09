"use client";

import { useDeclaracion } from "@/lib/declaracion-renta/declaracion-context";
import { UVT_VALUES } from "@/config/tax-data";
import type { ResultadoDeclaracion } from "@/lib/declaracion-renta/types";
import { DeclaracionCurrencyInput } from "../fields/DeclaracionCurrencyInput";

interface StepProps {
  resultado: ResultadoDeclaracion;
}

export function Step11Retenciones({ resultado }: StepProps) {
  const { state, dispatch } = useDeclaracion();
  const ra = state.retencionesAnticipos;
  const uvt = UVT_VALUES[state.perfil.anoGravable] ?? 49_799;

  const update = (payload: Partial<typeof ra>) =>
    dispatch({ type: "UPDATE_RETENCIONES_ANTICIPOS", payload });

  const liq = resultado.liquidacion;

  return (
    <div className="space-y-6">
      <div className="rounded-md border border-border/60 bg-muted/30 p-4">
        <p className="text-sm text-foreground">
          Las retenciones en la fuente son anticipos del impuesto que ya le practicaron durante el año.
          Estos valores los encuentra en los <strong>certificados de retención en la fuente</strong>{" "}
          que le entregan sus pagadores y en el <strong>certificado del año anterior</strong> si tuvo saldo a favor o anticipo.
        </p>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.05em] text-foreground">
          Retenciones practicadas
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <DeclaracionCurrencyInput
            id="ra-retencion-renta"
            label="Retención en la fuente por renta"
            value={ra.retencionFuenteRenta}
            onChange={(v) => update({ retencionFuenteRenta: v })}
            uvtEquivalent={ra.retencionFuenteRenta / uvt}
            tooltipText="Total de retenciones practicadas durante el año por concepto de renta (salarios, honorarios, servicios, etc.)."
            articuloET="365"
          />
          <DeclaracionCurrencyInput
            id="ra-retencion-otros"
            label="Otras retenciones"
            value={ra.retencionFuenteOtros}
            onChange={(v) => update({ retencionFuenteOtros: v })}
            uvtEquivalent={ra.retencionFuenteOtros / uvt}
            tooltipText="Retenciones por rendimientos financieros, arrendamientos, y otros conceptos."
          />
          <DeclaracionCurrencyInput
            id="ra-retencion-dividendos"
            label="Retención sobre dividendos"
            value={ra.retencionDividendos}
            onChange={(v) => update({ retencionDividendos: v })}
            uvtEquivalent={ra.retencionDividendos / uvt}
            tooltipText="Retención practicada al momento de pagar o abonar dividendos."
            articuloET="242"
          />
        </div>
      </div>

      <hr className="border-border/40" />

      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.05em] text-foreground">
          Anticipo y saldo a favor del año anterior
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <DeclaracionCurrencyInput
            id="ra-anticipo-anterior"
            label="Anticipo del año anterior"
            value={ra.anticipoAnoAnterior}
            onChange={(v) => update({ anticipoAnoAnterior: v })}
            uvtEquivalent={ra.anticipoAnoAnterior / uvt}
            tooltipText="Anticipo que pagó en la declaración del año anterior (casilla del formulario anterior)."
            articuloET="807"
          />
          <DeclaracionCurrencyInput
            id="ra-saldo-favor"
            label="Saldo a favor del año anterior"
            value={ra.saldoFavorAnterior}
            onChange={(v) => update({ saldoFavorAnterior: v })}
            uvtEquivalent={ra.saldoFavorAnterior / uvt}
            tooltipText="Si en la declaración anterior tuvo saldo a favor y solicitó imputación al año siguiente."
            articuloET="815"
          />
        </div>
      </div>

      {/* Subtotal */}
      <div className="rounded-md border border-border/60 bg-muted/30 p-4">
        <h4 className="mb-2 text-xs font-semibold uppercase tracking-[0.05em] text-muted-foreground">
          Resumen retenciones y anticipos
        </h4>
        <div className="grid grid-cols-2 gap-4 text-center sm:grid-cols-4">
          <div>
            <p className="text-[11px] text-muted-foreground">Total retenciones</p>
            <p className="font-values text-lg font-semibold text-foreground">
              ${liq.totalRetenciones.toLocaleString("es-CO")}
            </p>
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground">Anticipo anterior</p>
            <p className="font-values text-lg font-semibold text-foreground">
              ${liq.anticipoAnterior.toLocaleString("es-CO")}
            </p>
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground">Saldo a favor anterior</p>
            <p className="font-values text-lg font-semibold text-foreground">
              ${liq.saldoFavorAnterior.toLocaleString("es-CO")}
            </p>
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground">Total a descontar</p>
            <p className="font-values text-lg font-semibold text-foreground">
              ${(liq.totalRetenciones + liq.anticipoAnterior + liq.saldoFavorAnterior).toLocaleString("es-CO")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
