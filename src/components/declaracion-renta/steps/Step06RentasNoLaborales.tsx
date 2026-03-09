"use client";

import { useDeclaracion } from "@/lib/declaracion-renta/declaracion-context";
import { UVT_VALUES } from "@/config/tax-data";
import type { ResultadoDeclaracion } from "@/lib/declaracion-renta/types";
import { DeclaracionCurrencyInput } from "../fields/DeclaracionCurrencyInput";

interface StepProps {
  resultado: ResultadoDeclaracion;
}

export function Step06RentasNoLaborales({ resultado }: StepProps) {
  const { state, dispatch } = useDeclaracion();
  const rnl = state.rentasNoLaborales;
  const uvt = UVT_VALUES[state.perfil.anoGravable] ?? 49_799;

  const update = (payload: Partial<typeof rnl>) =>
    dispatch({ type: "UPDATE_RENTAS_NO_LABORALES", payload });

  const cg = resultado.cedulaGeneral;

  return (
    <div className="space-y-6">
      <div className="rounded-md border border-border/60 bg-muted/30 p-4">
        <p className="text-sm text-foreground">
          Ingrese los ingresos provenientes de actividades comerciales, industriales o agropecuarias
          que no sean rentas de trabajo ni de capital. Estos ingresos corresponden a la{" "}
          <strong>cédula de rentas no laborales</strong> del Formulario 210.
        </p>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.05em] text-foreground">
          Ingresos no laborales
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <DeclaracionCurrencyInput
            id="rnl-comerciales"
            label="Ingresos comerciales"
            value={rnl.ingresosComerciales}
            onChange={(v) => update({ ingresosComerciales: v })}
            uvtEquivalent={rnl.ingresosComerciales / uvt}
            tooltipText="Ventas de bienes, intermediación comercial, comisiones no laborales."
            articuloET="340"
          />
          <DeclaracionCurrencyInput
            id="rnl-industriales"
            label="Ingresos industriales"
            value={rnl.ingresosIndustriales}
            onChange={(v) => update({ ingresosIndustriales: v })}
            uvtEquivalent={rnl.ingresosIndustriales / uvt}
            tooltipText="Ingresos por actividades de manufactura, transformación o producción."
          />
          <DeclaracionCurrencyInput
            id="rnl-agropecuarios"
            label="Ingresos agropecuarios"
            value={rnl.ingresosAgropecuarios}
            onChange={(v) => update({ ingresosAgropecuarios: v })}
            uvtEquivalent={rnl.ingresosAgropecuarios / uvt}
            tooltipText="Ingresos por actividades agrícolas, ganaderas, pesqueras o forestales."
          />
          <DeclaracionCurrencyInput
            id="rnl-otros"
            label="Otros ingresos no laborales"
            value={rnl.otrosIngresosNoLaborales}
            onChange={(v) => update({ otrosIngresosNoLaborales: v })}
            uvtEquivalent={rnl.otrosIngresosNoLaborales / uvt}
          />
        </div>
      </div>

      <hr className="border-border/40" />

      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.05em] text-foreground">
          Costos y gastos no laborales
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <DeclaracionCurrencyInput
            id="rnl-costos"
            label="Costos y gastos procedentes"
            value={rnl.costosGastosNoLaborales}
            onChange={(v) => update({ costosGastosNoLaborales: v })}
            uvtEquivalent={rnl.costosGastosNoLaborales / uvt}
            tooltipText="Costos y gastos directamente relacionados con la actividad generadora de ingreso."
          />
          <DeclaracionCurrencyInput
            id="rnl-incr"
            label="INCR no laborales"
            value={rnl.INCRNoLaborales}
            onChange={(v) => update({ INCRNoLaborales: v })}
            uvtEquivalent={rnl.INCRNoLaborales / uvt}
          />
        </div>
      </div>

      {/* Subtotal */}
      <div className="rounded-md border border-border/60 bg-muted/30 p-4">
        <h4 className="mb-2 text-xs font-semibold uppercase tracking-[0.05em] text-muted-foreground">
          Subtotal rentas no laborales
        </h4>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-[11px] text-muted-foreground">Ingresos brutos</p>
            <p className="font-values text-lg font-semibold text-foreground">
              ${cg.ingresosBrutosNoLaborales.toLocaleString("es-CO")}
            </p>
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground">Costos + INCR</p>
            <p className="font-values text-lg font-semibold text-foreground">
              ${cg.INCRNoLaboralesTotal.toLocaleString("es-CO")}
            </p>
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground">Renta líquida</p>
            <p className="font-values text-lg font-semibold text-foreground">
              ${cg.rentaLiquidaNoLaborales.toLocaleString("es-CO")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
