"use client";

import { useDeclaracion } from "@/lib/declaracion-renta/declaracion-context";
import { UVT_VALUES } from "@/config/tax-data";
import type { ResultadoDeclaracion } from "@/lib/declaracion-renta/types";
import { DeclaracionCurrencyInput } from "../fields/DeclaracionCurrencyInput";

interface StepProps {
  resultado: ResultadoDeclaracion;
}

export function Step05Honorarios({ resultado }: StepProps) {
  const { state, dispatch } = useDeclaracion();
  const rh = state.rentasHonorarios;
  const uvt = UVT_VALUES[state.perfil.anoGravable] ?? 49_799;

  const update = (payload: Partial<typeof rh>) =>
    dispatch({ type: "UPDATE_RENTAS_HONORARIOS", payload });

  const sub = resultado.cedulaGeneral.honorarios;

  return (
    <div className="space-y-6">
      <div className="rounded-md border border-border/60 bg-muted/30 p-4">
        <p className="text-sm text-foreground">
          Si presta servicios profesionales, técnicos o de consultoría como <strong>independiente</strong> y
          desea deducir costos y gastos directos, reporte sus ingresos aquí en lugar de en rentas de trabajo.
          <strong> No puede reportar los mismos honorarios en ambas subcédulas.</strong>
        </p>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.05em] text-foreground">
          Ingresos brutos — Honorarios con costos
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <DeclaracionCurrencyInput
            id="rh-honorarios"
            label="Honorarios"
            value={rh.honorarios}
            onChange={(v) => update({ honorarios: v })}
            uvtEquivalent={rh.honorarios / uvt}
            tooltipText="Pagos por servicios profesionales independientes."
            articuloET="340"
          />
          <DeclaracionCurrencyInput
            id="rh-servicios"
            label="Servicios personales"
            value={rh.serviciosPersonales}
            onChange={(v) => update({ serviciosPersonales: v })}
            uvtEquivalent={rh.serviciosPersonales / uvt}
          />
          <DeclaracionCurrencyInput
            id="rh-comisiones"
            label="Comisiones"
            value={rh.comisiones}
            onChange={(v) => update({ comisiones: v })}
            uvtEquivalent={rh.comisiones / uvt}
          />
          <DeclaracionCurrencyInput
            id="rh-otros"
            label="Otros ingresos de honorarios"
            value={rh.otrosIngresosHonorarios}
            onChange={(v) => update({ otrosIngresosHonorarios: v })}
            uvtEquivalent={rh.otrosIngresosHonorarios / uvt}
          />
          <DeclaracionCurrencyInput
            id="rh-exterior"
            label="Ingresos del exterior"
            value={rh.ingresosExterior}
            onChange={(v) => update({ ingresosExterior: v })}
            uvtEquivalent={rh.ingresosExterior / uvt}
          />
        </div>
      </div>

      <hr className="border-border/40" />

      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.05em] text-foreground">
          INCRGO — Ingresos no constitutivos de renta
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <DeclaracionCurrencyInput
            id="rh-pension"
            label="Aportes obligatorios a pensión"
            value={rh.aportesObligatoriosPension}
            onChange={(v) => update({ aportesObligatoriosPension: v })}
            uvtEquivalent={rh.aportesObligatoriosPension / uvt}
            articuloET="55"
          />
          <DeclaracionCurrencyInput
            id="rh-salud"
            label="Aportes obligatorios a salud"
            value={rh.aportesObligatoriosSalud}
            onChange={(v) => update({ aportesObligatoriosSalud: v })}
            uvtEquivalent={rh.aportesObligatoriosSalud / uvt}
            articuloET="56"
          />
          <DeclaracionCurrencyInput
            id="rh-otros-incr"
            label="Otros INCR"
            value={rh.otrosINCR}
            onChange={(v) => update({ otrosINCR: v })}
            uvtEquivalent={rh.otrosINCR / uvt}
          />
        </div>
      </div>

      <hr className="border-border/40" />

      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.05em] text-foreground">
          Costos y gastos deducibles
        </h3>
        <p className="mb-3 text-xs text-muted-foreground">
          Costos y gastos directamente relacionados con la generación de los ingresos por honorarios.
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <DeclaracionCurrencyInput
            id="rh-costos"
            label="Costos directos"
            value={rh.costosDirectos}
            onChange={(v) => update({ costosDirectos: v })}
            uvtEquivalent={rh.costosDirectos / uvt}
            tooltipText="Materiales, insumos, subcontrataciones directamente ligados al servicio."
          />
          <DeclaracionCurrencyInput
            id="rh-nomina"
            label="Gastos de nómina"
            value={rh.gastosNomina}
            onChange={(v) => update({ gastosNomina: v })}
            uvtEquivalent={rh.gastosNomina / uvt}
            tooltipText="Salarios y prestaciones de empleados vinculados a la actividad."
          />
          <DeclaracionCurrencyInput
            id="rh-otros-costos"
            label="Otros costos y gastos (Art. 108-5)"
            value={rh.otrosCostos}
            onChange={(v) => update({ otrosCostos: v })}
            uvtEquivalent={rh.otrosCostos / uvt}
            articuloET="108-5"
          />
        </div>
      </div>

      {/* Subtotal */}
      <div className="rounded-md border border-border/60 bg-muted/30 p-4">
        <h4 className="mb-2 text-xs font-semibold uppercase tracking-[0.05em] text-muted-foreground">
          Subtotal honorarios con costos
        </h4>
        <div className="grid grid-cols-2 gap-4 text-center sm:grid-cols-4">
          <div>
            <p className="text-[11px] text-muted-foreground">Ingresos brutos</p>
            <p className="font-values text-lg font-semibold text-foreground">
              ${sub.ingresosBrutos.toLocaleString("es-CO")}
            </p>
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground">INCRGO</p>
            <p className="font-values text-lg font-semibold text-foreground">
              ${sub.INCRGO.toLocaleString("es-CO")}
            </p>
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground">Costos y gastos</p>
            <p className="font-values text-lg font-semibold text-foreground">
              ${sub.costosGastos.toLocaleString("es-CO")}
            </p>
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground">Renta líquida</p>
            <p className="font-values text-lg font-semibold text-foreground">
              ${sub.rentaLiquida.toLocaleString("es-CO")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
