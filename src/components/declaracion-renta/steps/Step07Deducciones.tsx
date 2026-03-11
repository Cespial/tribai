"use client";

import { AlertTriangle } from "lucide-react";
import { clsx } from "clsx";
import { useDeclaracion } from "@/lib/declaracion-renta/declaracion-context";
import { UVT_VALUES, LEY_2277_LIMITS } from "@/config/tax-data";
import type { ResultadoDeclaracion } from "@/lib/declaracion-renta/types";
import { DeclaracionCurrencyInput } from "../fields/DeclaracionCurrencyInput";
import { DeclaracionToggle } from "../fields/DeclaracionToggle";

interface StepProps {
  resultado: ResultadoDeclaracion;
}

export function Step08Deducciones({ resultado }: StepProps) {
  const { state, dispatch } = useDeclaracion();
  const ded = state.deducciones;
  const uvt = UVT_VALUES[state.perfil.anoGravable] ?? 49_799;

  const exc = state.exenciones;

  const update = (payload: Partial<typeof ded>) =>
    dispatch({ type: "UPDATE_DEDUCCIONES", payload });

  const updateExenciones = (payload: Partial<typeof exc>) =>
    dispatch({ type: "UPDATE_EXENCIONES", payload });

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
      {cg.limiteExcedido && (
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
          pressed={exc.aplicar25PctLaboral}
          onToggle={(v) => updateExenciones({ aplicar25PctLaboral: v })}
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
          <DeclaracionCurrencyInput
            id="ded-dependientes"
            label="Dependientes 10% ingreso bruto"
            value={ded.dependientes10Pct}
            onChange={(v) => update({ dependientes10Pct: v })}
            uvtEquivalent={ded.dependientes10Pct / uvt}
            helperText={`10% del ingreso bruto, máx. 32 UVT/mes (${(32 * 12 * uvt).toLocaleString("es-CO")} COP/año)`}
            tooltipText="Hijos menores de 18, hijos hasta 25 años estudiando, cónyuge o compañero(a) dependiente, padres o hermanos en situación de dependencia."
            articuloET="387"
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
            id="exc-afc"
            label="Aportes AFC"
            value={exc.aportesAFC}
            onChange={(v) => updateExenciones({ aportesAFC: v })}
            uvtEquivalent={exc.aportesAFC / uvt}
            tooltipText="Aportes a cuentas de ahorro para el fomento de la construcción (AFC)."
            articuloET="126-1"
            helperText="Tope: 30% ingreso laboral, máx. 3.800 UVT"
          />
          <DeclaracionCurrencyInput
            id="exc-fvp"
            label="Aportes FVP (Fondo de Vivienda)"
            value={exc.aportesFVP}
            onChange={(v) => updateExenciones({ aportesFVP: v })}
            uvtEquivalent={exc.aportesFVP / uvt}
            tooltipText="Aportes a fondos de vivienda de interés prioritario (FVP)."
            articuloET="126-1"
          />
          <DeclaracionCurrencyInput
            id="exc-pensiones-vol"
            label="Pensiones voluntarias"
            value={exc.aportesVoluntariosPension}
            onChange={(v) => updateExenciones({ aportesVoluntariosPension: v })}
            uvtEquivalent={exc.aportesVoluntariosPension / uvt}
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

      {/* 40% / 1,340 UVT Limit Indicator */}
      {cg.rentaLiquidaCedulaGeneral > 0 && (
        <div className="rounded-md border border-border/60 bg-muted/30 p-4">
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-[0.05em] text-muted-foreground">
            Tope 40% / {LEY_2277_LIMITS.deduccionesExentasMaxUVT.toLocaleString("es-CO")} UVT (Art. 336 Num. 3)
          </h4>
          {(() => {
            const used = cg.totalSujetoAlLimite;
            const cap = cg.limiteEfectivo;
            const pct = cap > 0 ? Math.min(used / cap, 1) : 0;
            const remaining = Math.max(cap - used, 0);
            const isOver = used > cap;
            return (
              <div>
                <div className="mb-2 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    Usado: <span className="font-values font-medium text-foreground">${used.toLocaleString("es-CO")}</span>
                  </span>
                  <span className={clsx("font-values font-medium", isOver ? "text-destructive" : "text-success")}>
                    {isOver ? "Excedido" : `Disponible: $${remaining.toLocaleString("es-CO")}`}
                  </span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={clsx(
                      "h-full rounded-full transition-all duration-500",
                      pct >= 1 ? "bg-destructive" : pct >= 0.8 ? "bg-amber-500" : "bg-success"
                    )}
                    style={{ width: `${pct * 100}%` }}
                  />
                </div>
                <div className="mt-1.5 flex justify-between text-[10px] text-muted-foreground">
                  <span>0%</span>
                  <span>
                    Límite: ${cap.toLocaleString("es-CO")}
                    {" "}({cg.limite40_1340 === cg.limiteEfectivo ? "1.340 UVT" : "40% renta líquida"})
                  </span>
                  <span>100%</span>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Resumen */}
      <div className="rounded-md border border-border/60 bg-muted/30 p-4">
        <h4 className="mb-2 text-xs font-semibold uppercase tracking-[0.05em] text-muted-foreground">
          Resumen cédula general
        </h4>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-[11px] text-muted-foreground">Renta líquida</p>
            <p className="font-values text-lg font-semibold text-foreground">
              ${cg.rentaLiquidaCedulaGeneral.toLocaleString("es-CO")}
            </p>
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground">Límite efectivo</p>
            <p className="font-values text-lg font-semibold text-foreground">
              ${cg.limiteEfectivo.toLocaleString("es-CO")}
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
