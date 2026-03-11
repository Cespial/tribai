"use client";

import { useDeclaracion } from "@/lib/declaracion-renta/declaracion-context";
import { UVT_VALUES } from "@/config/tax-data";
import type { ResultadoDeclaracion } from "@/lib/declaracion-renta/types";
import { DeclaracionCurrencyInput } from "../fields/DeclaracionCurrencyInput";

interface StepProps {
  resultado: ResultadoDeclaracion;
}

export function Step04RentasTrabajo({ resultado }: StepProps) {
  const { state, dispatch } = useDeclaracion();
  const rt = state.rentasTrabajo;
  const uvt = UVT_VALUES[state.perfil.anoGravable] ?? 49_799;

  const update = (payload: Partial<typeof rt>) =>
    dispatch({ type: "UPDATE_RENTAS_TRABAJO", payload });

  const cg = resultado.cedulaGeneral;

  return (
    <div className="space-y-6">
      <div className="rounded-md border border-border/60 bg-muted/30 p-4">
        <p className="text-sm text-foreground">
          Ingrese los ingresos recibidos por concepto de trabajo durante el año gravable{" "}
          {state.perfil.anoGravable}. Estos datos generalmente los encuentra en el{" "}
          <strong>certificado de ingresos y retenciones</strong> que le entrega su empleador o
          pagador.
        </p>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.05em] text-foreground">
          Ingresos brutos de trabajo
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <DeclaracionCurrencyInput
            id="rt-salarios"
            label="Salarios y pagos laborales"
            value={rt.salariosYPagosLaborales}
            onChange={(v) => update({ salariosYPagosLaborales: v })}
            uvtEquivalent={rt.salariosYPagosLaborales / uvt}
            tooltipText="Incluye sueldo básico, horas extra, bonificaciones, comisiones, prestaciones, indemnizaciones laborales."
            articuloET="103"
          />
          <DeclaracionCurrencyInput
            id="rt-honorarios"
            label="Honorarios, servicios y comisiones"
            value={rt.honorariosServicios}
            onChange={(v) => update({ honorariosServicios: v })}
            uvtEquivalent={rt.honorariosServicios / uvt}
            tooltipText="Pagos recibidos por prestación de servicios personales bajo contratos de prestación de servicios."
            articuloET="103"
          />
          <DeclaracionCurrencyInput
            id="rt-otros"
            label="Otros ingresos de trabajo"
            value={rt.otrosIngresosTrabajo}
            onChange={(v) => update({ otrosIngresosTrabajo: v })}
            uvtEquivalent={rt.otrosIngresosTrabajo / uvt}
            tooltipText="Otros pagos por compensación de servicios personales."
          />
        </div>
      </div>

      <hr className="border-border/40" />

      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.05em] text-foreground">
          Ingresos no constitutivos de renta (INCR)
        </h3>
        <p className="mb-3 text-xs text-muted-foreground">
          Valores que la ley permite restar de los ingresos brutos antes de calcular la renta líquida.
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <DeclaracionCurrencyInput
            id="rt-salud"
            label="Aportes obligatorios a salud"
            value={rt.aportesObligatoriosSalud}
            onChange={(v) => update({ aportesObligatoriosSalud: v })}
            uvtEquivalent={rt.aportesObligatoriosSalud / uvt}
            tooltipText="Porción del aporte a salud a cargo del trabajador (4% del IBC)."
            articuloET="56"
          />
          <DeclaracionCurrencyInput
            id="rt-pension"
            label="Aportes obligatorios a pensión"
            value={rt.aportesObligatoriosPension}
            onChange={(v) => update({ aportesObligatoriosPension: v })}
            uvtEquivalent={rt.aportesObligatoriosPension / uvt}
            tooltipText="Porción del aporte a pensión a cargo del trabajador (4% del IBC)."
            articuloET="55"
          />
          <DeclaracionCurrencyInput
            id="rt-pension-vol"
            label="Aportes voluntarios a pensión (INCR)"
            value={rt.aportesVoluntariosPensionObligatoria}
            onChange={(v) => update({ aportesVoluntariosPensionObligatoria: v })}
            uvtEquivalent={rt.aportesVoluntariosPensionObligatoria / uvt}
            tooltipText="Aportes a fondos de pensiones voluntarias que no excedan el 25% del ingreso laboral."
            articuloET="126-1"
          />
          <DeclaracionCurrencyInput
            id="rt-solidaridad"
            label="Fondo de solidaridad pensional"
            value={rt.fondoSolidaridad}
            onChange={(v) => update({ fondoSolidaridad: v })}
            uvtEquivalent={rt.fondoSolidaridad / uvt}
            tooltipText="Aporte adicional obligatorio para ingresos superiores a 4 SMLMV."
            articuloET="204"
          />
          <DeclaracionCurrencyInput
            id="rt-otros-incr"
            label="Otros INCR de trabajo"
            value={rt.otrosINCR}
            onChange={(v) => update({ otrosINCR: v })}
            uvtEquivalent={rt.otrosINCR / uvt}
            tooltipText="Otros valores deducibles como INCR según la ley."
          />
        </div>
      </div>

      {/* Subtotal */}
      <div className="rounded-md border border-border/60 bg-muted/30 p-4">
        <h4 className="mb-2 text-xs font-semibold uppercase tracking-[0.05em] text-muted-foreground">
          Subtotal rentas de trabajo
        </h4>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-[11px] text-muted-foreground">Ingresos brutos</p>
            <p className="font-values text-lg font-semibold text-foreground">
              ${cg.trabajo.ingresosBrutos.toLocaleString("es-CO")}
            </p>
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground">INCR</p>
            <p className="font-values text-lg font-semibold text-foreground">
              ${cg.trabajo.INCRGO.toLocaleString("es-CO")}
            </p>
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground">Renta líquida</p>
            <p className="font-values text-lg font-semibold text-foreground">
              ${cg.trabajo.rentaLiquida.toLocaleString("es-CO")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
