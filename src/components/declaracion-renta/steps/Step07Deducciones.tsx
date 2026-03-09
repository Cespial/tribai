"use client";

import { AlertTriangle } from "lucide-react";
import { useDeclaracion } from "@/lib/declaracion-renta/declaracion-context";
import { UVT_VALUES, LEY_2277_LIMITS } from "@/config/tax-data";
import type { ResultadoDeclaracion } from "@/lib/declaracion-renta/types";
import { DeclaracionCurrencyInput } from "../fields/DeclaracionCurrencyInput";
import { DeclaracionNumberInput } from "../fields/DeclaracionNumberInput";
import { DeclaracionToggle } from "../fields/DeclaracionToggle";

interface StepProps {
  resultado: ResultadoDeclaracion;
}

export function Step07Deducciones({ resultado }: StepProps) {
  const { state, dispatch } = useDeclaracion();
  const ded = state.deducciones;
  const uvt = UVT_VALUES[state.perfil.anoGravable] ?? 49_799;

  const update = (payload: Partial<typeof ded>) =>
    dispatch({ type: "UPDATE_DEDUCCIONES", payload });

  const cg = resultado.cedulaGeneral;

  return (
    <div className="space-y-6">
      <div className="rounded-md border border-border/60 bg-muted/30 p-4">
        <p className="text-sm text-foreground">
          Las deducciones y rentas exentas reducen su base gravable. La Ley 2277 de 2022 estableció un tope
          combinado de <strong>1.340 UVT</strong> ({(1_340 * uvt).toLocaleString("es-CO")} COP) y no pueden
          superar el <strong>40%</strong> de la renta líquida de la cédula general.
        </p>
      </div>

      {/* Warnings */}
      {cg.exentasCapped && (
        <div className="flex items-start gap-3 rounded-md border border-destructive/30 bg-destructive/5 p-4">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
          <p className="text-sm text-foreground">
            La renta exenta del 25% fue limitada a <strong>{LEY_2277_LIMITS.rentasExentasMaxUVT} UVT</strong> anuales
            ({(LEY_2277_LIMITS.rentasExentasMaxUVT * uvt).toLocaleString("es-CO")} COP).
          </p>
        </div>
      )}
      {cg.combinadoCapped && (
        <div className="flex items-start gap-3 rounded-md border border-destructive/30 bg-destructive/5 p-4">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
          <p className="text-sm text-foreground">
            El total de deducciones + rentas exentas excede el tope combinado. Se aplicó el límite de{" "}
            <strong>{LEY_2277_LIMITS.deduccionesExentasMaxUVT} UVT</strong> o el 40% de la renta líquida, el menor.
          </p>
        </div>
      )}
      {cg.dependientesCapped && (
        <div className="flex items-start gap-3 rounded-md border border-destructive/30 bg-destructive/5 p-4">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
          <p className="text-sm text-foreground">
            Máximo 4 dependientes permitidos. Se ajustó el número automáticamente.
          </p>
        </div>
      )}

      {/* Exención 25% */}
      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.05em] text-foreground">
          Rentas exentas
        </h3>
        <DeclaracionToggle
          label="Aplicar exención del 25% sobre rentas de trabajo"
          pressed={ded.exenta25Porciento}
          onToggle={(v) => update({ exenta25Porciento: v })}
          helperText={`Tope máximo: 790 UVT/año (${(790 * uvt).toLocaleString("es-CO")} COP)`}
          tooltipText="El 25% de los pagos laborales se considera renta exenta, con límite de 790 UVT anuales."
          articuloET="206"
        />
      </div>

      <hr className="border-border/40" />

      {/* Dependientes */}
      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.05em] text-foreground">
          Deducciones
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <DeclaracionNumberInput
            id="ded-dependientes"
            label="Número de dependientes"
            value={ded.dependientes}
            onChange={(v) => update({ dependientes: v })}
            min={0}
            max={4}
            helperText={`Máx. 4 dependientes. Deducción: 72 UVT/mes c/u (${(72 * 12 * uvt).toLocaleString("es-CO")} COP/año)`}
            tooltipText="Hijos menores de 18, hijos hasta 25 años estudiando, cónyuge o compañero(a) dependiente, padres o hermanos en situación de dependencia."
          />
          <DeclaracionCurrencyInput
            id="ded-vivienda"
            label="Intereses crédito de vivienda"
            value={ded.interesesVivienda}
            onChange={(v) => update({ interesesVivienda: v })}
            uvtEquivalent={ded.interesesVivienda / uvt}
            tooltipText="Intereses pagados por crédito hipotecario de vivienda del contribuyente."
            articuloET="119"
            helperText={`Tope: 100 UVT/mes (${(1_200 * uvt).toLocaleString("es-CO")} COP/año)`}
          />
          <DeclaracionCurrencyInput
            id="ded-medicina"
            label="Medicina prepagada"
            value={ded.medicinaPrepagada}
            onChange={(v) => update({ medicinaPrepagada: v })}
            uvtEquivalent={ded.medicinaPrepagada / uvt}
            tooltipText="Pagos a planes de medicina prepagada o seguros de salud."
            articuloET="387"
            helperText={`Tope: 16 UVT/mes (${(192 * uvt).toLocaleString("es-CO")} COP/año)`}
          />
          <DeclaracionCurrencyInput
            id="ded-afc"
            label="Aportes AFC"
            value={ded.aportesAFC}
            onChange={(v) => update({ aportesAFC: v })}
            uvtEquivalent={ded.aportesAFC / uvt}
            tooltipText="Aportes a cuentas de ahorro para el fomento de la construcción (AFC)."
            articuloET="126-1"
            helperText="Tope: 30% ingreso laboral, máx. 3.800 UVT"
          />
          <DeclaracionCurrencyInput
            id="ded-fvp"
            label="Aportes FVP (Fondo de Vivienda)"
            value={ded.aportesFVP}
            onChange={(v) => update({ aportesFVP: v })}
            uvtEquivalent={ded.aportesFVP / uvt}
            tooltipText="Aportes a fondos de vivienda de interés prioritario (FVP)."
            articuloET="126-1"
          />
          <DeclaracionCurrencyInput
            id="ded-pensiones-vol"
            label="Pensiones voluntarias"
            value={ded.pensionesVoluntarias}
            onChange={(v) => update({ pensionesVoluntarias: v })}
            uvtEquivalent={ded.pensionesVoluntarias / uvt}
            tooltipText="Aportes a fondos de pensiones voluntarias."
            articuloET="126-1"
            helperText="Tope: 30% ingreso laboral, máx. 3.800 UVT"
          />
          <DeclaracionCurrencyInput
            id="ded-donaciones"
            label="Donaciones"
            value={ded.donaciones}
            onChange={(v) => update({ donaciones: v })}
            uvtEquivalent={ded.donaciones / uvt}
            tooltipText="Donaciones a entidades sin ánimo de lucro calificadas."
            articuloET="257"
          />
          <DeclaracionCurrencyInput
            id="ded-gmf"
            label="GMF deducible (50% del 4×1000)"
            value={ded.GMFDeducible}
            onChange={(v) => update({ GMFDeducible: v })}
            uvtEquivalent={ded.GMFDeducible / uvt}
            tooltipText="El 50% del gravamen a los movimientos financieros (4×1000) es deducible."
            articuloET="115"
          />
          <DeclaracionCurrencyInput
            id="ded-otras"
            label="Otras deducciones"
            value={ded.otrasDeducciones}
            onChange={(v) => update({ otrasDeducciones: v })}
            uvtEquivalent={ded.otrasDeducciones / uvt}
          />
        </div>
      </div>

      {/* Resumen */}
      <div className="rounded-md border border-border/60 bg-muted/30 p-4">
        <h4 className="mb-2 text-xs font-semibold uppercase tracking-[0.05em] text-muted-foreground">
          Resumen cédula general
        </h4>
        <div className="grid grid-cols-2 gap-4 text-center sm:grid-cols-4">
          <div>
            <p className="text-[11px] text-muted-foreground">Renta líquida</p>
            <p className="font-values text-lg font-semibold text-foreground">
              ${cg.rentaLiquidaCedulaGeneral.toLocaleString("es-CO")}
            </p>
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground">Deducciones aplicadas</p>
            <p className="font-values text-lg font-semibold text-foreground">
              ${cg.deduccionesAplicadas.toLocaleString("es-CO")}
            </p>
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground">Exentas aplicadas</p>
            <p className="font-values text-lg font-semibold text-foreground">
              ${cg.rentasExentasAplicadas.toLocaleString("es-CO")}
            </p>
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground">Base gravable</p>
            <p className="font-values text-lg font-semibold text-foreground">
              ${cg.rentaLiquidaGravable.toLocaleString("es-CO")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
