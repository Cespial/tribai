"use client";

import { useDeclaracion } from "@/lib/declaracion-renta/declaracion-context";
import { UVT_VALUES } from "@/config/tax-data";
import type { ResultadoDeclaracion } from "@/lib/declaracion-renta/types";
import { DeclaracionCurrencyInput } from "../fields/DeclaracionCurrencyInput";

interface StepProps {
  resultado: ResultadoDeclaracion;
}

export function Step09Pensiones({ resultado }: StepProps) {
  const { state, dispatch } = useDeclaracion();
  const cp = state.cedulaPensiones;
  const uvt = UVT_VALUES[state.perfil.anoGravable] ?? 49_799;

  const update = (payload: Partial<typeof cp>) =>
    dispatch({ type: "UPDATE_CEDULA_PENSIONES", payload });

  const rp = resultado.cedulaPensiones;

  return (
    <div className="space-y-6">
      <div className="rounded-md border border-border/60 bg-muted/30 p-4">
        <p className="text-sm text-foreground">
          Si recibe pensión de jubilación, invalidez o sobrevivientes, ingrese los valores aquí.
          Las pensiones tienen una exención especial de las primeras{" "}
          <strong>1.000 UVT mensuales</strong> ({(1_000 * uvt).toLocaleString("es-CO")} COP).
          Si no recibe pensión, puede saltar este paso.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <DeclaracionCurrencyInput
          id="cp-nacionales"
          label="Pensiones nacionales"
          value={cp.pensionesNacionales}
          onChange={(v) => update({ pensionesNacionales: v })}
          uvtEquivalent={cp.pensionesNacionales / uvt}
          tooltipText="Mesadas pensionales recibidas durante el año por pensión de jubilación, vejez, invalidez o sobrevivientes en Colombia."
          articuloET="206"
        />
        <DeclaracionCurrencyInput
          id="cp-can"
          label="Pensiones CAN (Comunidad Andina)"
          value={cp.pensionesCAN}
          onChange={(v) => update({ pensionesCAN: v })}
          uvtEquivalent={cp.pensionesCAN / uvt}
          tooltipText="Pensiones recibidas de países de la Comunidad Andina de Naciones."
        />
        <DeclaracionCurrencyInput
          id="cp-exterior"
          label="Pensiones del exterior"
          value={cp.pensionesExterior}
          onChange={(v) => update({ pensionesExterior: v })}
          uvtEquivalent={cp.pensionesExterior / uvt}
          tooltipText="Pensiones recibidas de países fuera de la CAN."
        />
        <DeclaracionCurrencyInput
          id="cp-salud"
          label="Aportes obligatorios a salud"
          value={cp.aportesObligatoriosSalud}
          onChange={(v) => update({ aportesObligatoriosSalud: v })}
          uvtEquivalent={cp.aportesObligatoriosSalud / uvt}
          tooltipText="El 12% de la mesada pensional destinado a salud (cotización obligatoria)."
          articuloET="56"
        />
      </div>

      {/* Subtotal */}
      {rp.ingresosBrutosPensiones > 0 && (
        <div className="rounded-md border border-border/60 bg-muted/30 p-4">
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-[0.05em] text-muted-foreground">
            Subtotal cédula pensiones
          </h4>
          <div className="grid grid-cols-2 gap-4 text-center sm:grid-cols-4">
            <div>
              <p className="text-[11px] text-muted-foreground">Ingresos brutos</p>
              <p className="font-values text-lg font-semibold text-foreground">
                ${rp.ingresosBrutosPensiones.toLocaleString("es-CO")}
              </p>
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground">INCR (salud)</p>
              <p className="font-values text-lg font-semibold text-foreground">
                ${rp.INCRPensiones.toLocaleString("es-CO")}
              </p>
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground">Exención (1.000 UVT/mes)</p>
              <p className="font-values text-lg font-semibold text-foreground">
                ${rp.totalExenciones.toLocaleString("es-CO")}
              </p>
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground">Gravable</p>
              <p className="font-values text-lg font-semibold text-foreground">
                ${rp.rentaLiquidaGravablePensiones.toLocaleString("es-CO")}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
