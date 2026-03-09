"use client";

import { useDeclaracion } from "@/lib/declaracion-renta/declaracion-context";
import { UVT_VALUES } from "@/config/tax-data";
import type { ResultadoDeclaracion } from "@/lib/declaracion-renta/types";
import { DeclaracionCurrencyInput } from "../fields/DeclaracionCurrencyInput";

interface StepProps {
  resultado: ResultadoDeclaracion;
}

export function Step08Pensiones({ resultado }: StepProps) {
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
          <strong>12.000 UVT anuales</strong> ({(12_000 * uvt).toLocaleString("es-CO")} COP).
          Si no recibe pensión, puede saltar este paso.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <DeclaracionCurrencyInput
          id="cp-jubilacion"
          label="Pensión de jubilación o vejez"
          value={cp.pensionJubilacion}
          onChange={(v) => update({ pensionJubilacion: v })}
          uvtEquivalent={cp.pensionJubilacion / uvt}
          tooltipText="Mesadas pensionales recibidas durante el año por pensión de jubilación, prima media o RAIS."
          articuloET="206"
        />
        <DeclaracionCurrencyInput
          id="cp-sobreviviente"
          label="Pensión de sobrevivientes"
          value={cp.pensionSobreviviente}
          onChange={(v) => update({ pensionSobreviviente: v })}
          uvtEquivalent={cp.pensionSobreviviente / uvt}
        />
        <DeclaracionCurrencyInput
          id="cp-invalidez"
          label="Pensión de invalidez"
          value={cp.pensionInvalidez}
          onChange={(v) => update({ pensionInvalidez: v })}
          uvtEquivalent={cp.pensionInvalidez / uvt}
        />
        <DeclaracionCurrencyInput
          id="cp-otras"
          label="Otras pensiones"
          value={cp.otrasPensiones}
          onChange={(v) => update({ otrasPensiones: v })}
          uvtEquivalent={cp.otrasPensiones / uvt}
          tooltipText="Pensiones del exterior, rentas vitalicias, u otras asimiladas."
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
              <p className="text-[11px] text-muted-foreground">Exención (12.000 UVT)</p>
              <p className="font-values text-lg font-semibold text-foreground">
                ${rp.rentaExentaPensiones.toLocaleString("es-CO")}
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
