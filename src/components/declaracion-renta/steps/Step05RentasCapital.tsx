"use client";

import { useDeclaracion } from "@/lib/declaracion-renta/declaracion-context";
import { UVT_VALUES } from "@/config/tax-data";
import type { ResultadoDeclaracion } from "@/lib/declaracion-renta/types";
import { DeclaracionCurrencyInput } from "../fields/DeclaracionCurrencyInput";

interface StepProps {
  resultado: ResultadoDeclaracion;
}

export function Step05RentasCapital({ resultado }: StepProps) {
  const { state, dispatch } = useDeclaracion();
  const rc = state.rentasCapital;
  const uvt = UVT_VALUES[state.perfil.anoGravable] ?? 49_799;

  const update = (payload: Partial<typeof rc>) =>
    dispatch({ type: "UPDATE_RENTAS_CAPITAL", payload });

  const cg = resultado.cedulaGeneral;

  return (
    <div className="space-y-6">
      <div className="rounded-md border border-border/60 bg-muted/30 p-4">
        <p className="text-sm text-foreground">
          Ingrese los ingresos provenientes de rendimientos financieros, arrendamientos y regalías.
          Estos datos los encuentra en los <strong>certificados de sus entidades financieras</strong>{" "}
          y contratos de arrendamiento.
        </p>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.05em] text-foreground">
          Ingresos de capital
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <DeclaracionCurrencyInput
            id="rc-intereses"
            label="Intereses y rendimientos financieros"
            value={rc.interesesRendimientos}
            onChange={(v) => update({ interesesRendimientos: v })}
            uvtEquivalent={rc.interesesRendimientos / uvt}
            tooltipText="CDTs, cuentas de ahorro, fondos de inversión, bonos, acciones."
            articuloET="338"
          />
          <DeclaracionCurrencyInput
            id="rc-arrendamientos"
            label="Arrendamientos"
            value={rc.arrendamientos}
            onChange={(v) => update({ arrendamientos: v })}
            uvtEquivalent={rc.arrendamientos / uvt}
            tooltipText="Ingresos por arriendo de bienes inmuebles o muebles."
            articuloET="338"
          />
          <DeclaracionCurrencyInput
            id="rc-regalias"
            label="Regalías"
            value={rc.regalias}
            onChange={(v) => update({ regalias: v })}
            uvtEquivalent={rc.regalias / uvt}
            tooltipText="Ingresos por explotación de propiedad intelectual u otros activos."
          />
          <DeclaracionCurrencyInput
            id="rc-otros"
            label="Otros ingresos de capital"
            value={rc.otrosIngresosCapital}
            onChange={(v) => update({ otrosIngresosCapital: v })}
            uvtEquivalent={rc.otrosIngresosCapital / uvt}
          />
        </div>
      </div>

      <hr className="border-border/40" />

      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.05em] text-foreground">
          Costos y gastos de capital
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <DeclaracionCurrencyInput
            id="rc-costos"
            label="Costos y gastos asociados"
            value={rc.costosGastosCapital}
            onChange={(v) => update({ costosGastosCapital: v })}
            uvtEquivalent={rc.costosGastosCapital / uvt}
            tooltipText="Gastos directamente relacionados con la generación de rentas de capital."
          />
          <DeclaracionCurrencyInput
            id="rc-incr"
            label="INCR de capital"
            value={rc.INCRCapital}
            onChange={(v) => update({ INCRCapital: v })}
            uvtEquivalent={rc.INCRCapital / uvt}
            tooltipText="Ingresos no constitutivos de renta asociados a rentas de capital."
          />
        </div>
      </div>

      {/* Subtotal */}
      <div className="rounded-md border border-border/60 bg-muted/30 p-4">
        <h4 className="mb-2 text-xs font-semibold uppercase tracking-[0.05em] text-muted-foreground">
          Subtotal rentas de capital
        </h4>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-[11px] text-muted-foreground">Ingresos brutos</p>
            <p className="font-values text-lg font-semibold text-foreground">
              ${cg.ingresosBrutosCapital.toLocaleString("es-CO")}
            </p>
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground">Costos + INCR</p>
            <p className="font-values text-lg font-semibold text-foreground">
              ${cg.INCRCapitalTotal.toLocaleString("es-CO")}
            </p>
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground">Renta líquida</p>
            <p className="font-values text-lg font-semibold text-foreground">
              ${cg.rentaLiquidaCapital.toLocaleString("es-CO")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
