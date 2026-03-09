"use client";

import { useState } from "react";
import { Trash2, Plus } from "lucide-react";
import { useDeclaracionJuridica } from "@/lib/declaracion-renta-juridicas/declaracion-juridica-context";
import { UVT_VALUES } from "@/config/tax-data";
import type { ResultadoDeclaracionJuridica } from "@/lib/declaracion-renta-juridicas/types";
import { DeclaracionCurrencyInput } from "@/components/declaracion-renta/fields/DeclaracionCurrencyInput";
import { DeclaracionNumberInput } from "@/components/declaracion-renta/fields/DeclaracionNumberInput";

interface StepProps {
  resultado: ResultadoDeclaracionJuridica;
}

export function StepJ06Compensacion({ resultado }: StepProps) {
  const { state, dispatch } = useDeclaracionJuridica();
  const comp = state.compensacion;
  const uvt = UVT_VALUES[state.perfil.anoGravable] ?? 49_799;
  const anoGravable = state.perfil.anoGravable;

  const [nuevoAno, setNuevoAno] = useState(anoGravable - 1);
  const [nuevoMonto, setNuevoMonto] = useState(0);

  const addPerdida = () => {
    if (nuevoMonto > 0 && !comp.perdidasAnteriores.some(p => p.ano === nuevoAno)) {
      dispatch({
        type: "ADD_PERDIDA",
        payload: { ano: nuevoAno, montoOriginal: nuevoMonto, montoDisponible: nuevoMonto },
      });
      setNuevoMonto(0);
      setNuevoAno(nuevoAno - 1);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-md border border-border/60 bg-muted/30 p-4">
        <p className="text-sm text-foreground">
          Pérdidas fiscales de años anteriores compensables con la renta líquida del periodo.
          Art. 147 ET: las pérdidas fiscales se pueden compensar en los <strong>12 años siguientes</strong>.
          Si no tiene pérdidas por compensar, puede saltar este paso.
        </p>
      </div>

      {/* Pérdidas existentes */}
      {comp.perdidasAnteriores.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-[0.05em] text-muted-foreground">
            Pérdidas registradas
          </h4>
          {comp.perdidasAnteriores.map((p) => (
            <div key={p.ano} className="flex items-center gap-3 rounded-md border border-border/40 bg-card p-3">
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">Año {p.ano}</p>
                <p className="text-xs text-muted-foreground">
                  Disponible: ${p.montoDisponible.toLocaleString("es-CO")}
                  {p.montoOriginal !== p.montoDisponible && (
                    <span> (original: ${p.montoOriginal.toLocaleString("es-CO")})</span>
                  )}
                </p>
              </div>
              <button
                type="button"
                onClick={() => dispatch({ type: "REMOVE_PERDIDA", ano: p.ano })}
                className="rounded p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Agregar pérdida */}
      <div className="rounded-md border border-border/60 bg-muted/20 p-4">
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-[0.05em] text-muted-foreground">
          Agregar pérdida
        </h4>
        <div className="flex flex-wrap items-end gap-3">
          <div className="w-32">
            <DeclaracionNumberInput
              id="perdida-ano"
              label="Año"
              value={nuevoAno}
              onChange={setNuevoAno}
              min={anoGravable - 12}
              max={anoGravable - 1}
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <DeclaracionCurrencyInput
              id="perdida-monto"
              label="Monto disponible"
              value={nuevoMonto}
              onChange={setNuevoMonto}
              uvtEquivalent={nuevoMonto / uvt}
            />
          </div>
          <button
            type="button"
            onClick={addPerdida}
            disabled={nuevoMonto <= 0}
            className="inline-flex items-center gap-1.5 rounded border border-border px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            Agregar
          </button>
        </div>
      </div>

      {/* Exceso renta presuntiva */}
      <DeclaracionCurrencyInput
        id="exceso-rp"
        label="Exceso de renta presuntiva de años anteriores"
        value={comp.excesoRentaPresuntivaAnterior}
        onChange={(v) => dispatch({ type: "UPDATE_COMPENSACION", payload: { excesoRentaPresuntivaAnterior: v } })}
        uvtEquivalent={comp.excesoRentaPresuntivaAnterior / uvt}
        helperText="Aplica cuando la renta presuntiva superó la renta líquida en años anteriores (tasa presuntiva era > 0%)."
      />

      {/* Resultado compensación */}
      {resultado.depuracion.compensacionPerdidas > 0 && (
        <div className="rounded-md border border-success/30 bg-success/5 p-4">
          <p className="text-sm text-foreground">
            Compensación aplicada al periodo:{" "}
            <strong className="font-values">${resultado.depuracion.compensacionPerdidas.toLocaleString("es-CO")}</strong>
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Renta líquida después de compensación:{" "}
            <strong className="font-values">${resultado.depuracion.rentaLiquida.toLocaleString("es-CO")}</strong>
          </p>
        </div>
      )}
    </div>
  );
}
