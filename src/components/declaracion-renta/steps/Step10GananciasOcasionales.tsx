"use client";

import { useDeclaracion } from "@/lib/declaracion-renta/declaracion-context";
import { UVT_VALUES } from "@/config/tax-data";
import type { ResultadoDeclaracion } from "@/lib/declaracion-renta/types";
import { DeclaracionCurrencyInput } from "../fields/DeclaracionCurrencyInput";

interface StepProps {
  resultado: ResultadoDeclaracion;
}

export function Step10GananciasOcasionales({ resultado }: StepProps) {
  const { state, dispatch } = useDeclaracion();
  const go = state.gananciasOcasionales;
  const uvt = UVT_VALUES[state.perfil.anoGravable] ?? 49_799;

  const update = (payload: Partial<typeof go>) =>
    dispatch({ type: "UPDATE_GANANCIAS_OCASIONALES", payload });

  const rgo = resultado.gananciasOcasionales;

  return (
    <div className="space-y-6">
      <div className="rounded-md border border-border/60 bg-muted/30 p-4">
        <p className="text-sm text-foreground">
          Las ganancias ocasionales son ingresos extraordinarios como herencias, loterías o venta de activos
          poseídos por más de 2 años. Si no tuvo este tipo de ingresos, puede saltar este paso.
          Tarifa general: <strong>15%</strong> (Art. 314 ET). Loterías: <strong>20%</strong> (Art. 317 ET).
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <DeclaracionCurrencyInput
          id="go-vivienda"
          label="Venta de vivienda de habitación"
          value={go.ventaVivienda}
          onChange={(v) => update({ ventaVivienda: v })}
          uvtEquivalent={go.ventaVivienda / uvt}
          tooltipText="Utilidad en venta de la vivienda de habitación, con recursos depositados en AFC. Art. 311-1 ET."
          articuloET="311-1"
          helperText={`Exención: primeras 7.500 UVT (${(7_500 * uvt).toLocaleString("es-CO")} COP)`}
        />
        <DeclaracionCurrencyInput
          id="go-otros-activos"
          label="Venta de otros activos (más de 2 años)"
          value={go.ventaOtrosActivos}
          onChange={(v) => update({ ventaOtrosActivos: v })}
          uvtEquivalent={go.ventaOtrosActivos / uvt}
          tooltipText="Utilidad en venta de vehículos, acciones u otros activos poseídos por más de 2 años. Sin exención de vivienda."
          articuloET="300"
        />
        <DeclaracionCurrencyInput
          id="go-herencias"
          label="Herencias y donaciones recibidas"
          value={go.herenciasDonaciones}
          onChange={(v) => update({ herenciasDonaciones: v })}
          uvtEquivalent={go.herenciasDonaciones / uvt}
          tooltipText="Valor recibido por herencia, legado o donación."
          articuloET="302"
          helperText={`Exención: primeras 3.250 UVT (${(3_250 * uvt).toLocaleString("es-CO")} COP)`}
        />
        <DeclaracionCurrencyInput
          id="go-loterias"
          label="Loterías, rifas y apuestas"
          value={go.loterias}
          onChange={(v) => update({ loterias: v })}
          uvtEquivalent={go.loterias / uvt}
          tooltipText="Premios de loterías, rifas, sorteos, apuestas y similares. Tarifa especial del 20%."
          articuloET="304"
          helperText={`Exención: primeras 48 UVT (${(48 * uvt).toLocaleString("es-CO")} COP). Tarifa: 20%`}
        />
        <DeclaracionCurrencyInput
          id="go-indemnizaciones"
          label="Indemnizaciones por seguros de vida"
          value={go.indemnizaciones}
          onChange={(v) => update({ indemnizaciones: v })}
          uvtEquivalent={go.indemnizaciones / uvt}
          articuloET="303"
        />
        <DeclaracionCurrencyInput
          id="go-otras"
          label="Otras ganancias ocasionales"
          value={go.otrasGanancias}
          onChange={(v) => update({ otrasGanancias: v })}
          uvtEquivalent={go.otrasGanancias / uvt}
        />
        <DeclaracionCurrencyInput
          id="go-costos"
          label="Costos atribuibles a ganancias"
          value={go.costosGanancias}
          onChange={(v) => update({ costosGanancias: v })}
          uvtEquivalent={go.costosGanancias / uvt}
          tooltipText="Costo fiscal de los activos vendidos o gastos asociados a la obtención de la ganancia."
        />
      </div>

      {/* Subtotal */}
      {rgo.gananciasBrutas > 0 && (
        <div className="rounded-md border border-border/60 bg-muted/30 p-4">
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-[0.05em] text-muted-foreground">
            Subtotal ganancias ocasionales
          </h4>
          <div className="grid grid-cols-2 gap-4 text-center sm:grid-cols-4">
            <div>
              <p className="text-[11px] text-muted-foreground">Brutas</p>
              <p className="font-values text-lg font-semibold text-foreground">
                ${rgo.gananciasBrutas.toLocaleString("es-CO")}
              </p>
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground">Exentas</p>
              <p className="font-values text-lg font-semibold text-foreground">
                ${rgo.gananciaExenta.toLocaleString("es-CO")}
              </p>
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground">Gravables</p>
              <p className="font-values text-lg font-semibold text-foreground">
                ${rgo.gananciaGravable.toLocaleString("es-CO")}
              </p>
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground">Impuesto</p>
              <p className="font-values text-lg font-semibold text-foreground">
                ${rgo.impuestoGanancias.toLocaleString("es-CO")}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
