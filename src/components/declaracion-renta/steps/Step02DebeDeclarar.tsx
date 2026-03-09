"use client";

import { useMemo } from "react";
import { CheckCircle2, AlertTriangle } from "lucide-react";
import { useDeclaracion } from "@/lib/declaracion-renta/declaracion-context";
import { verificarObligacionDeclarar } from "@/lib/declaracion-renta/engine";
import { UVT_VALUES } from "@/config/tax-data";
import type { ResultadoDeclaracion } from "@/lib/declaracion-renta/types";
import { DeclaracionCurrencyInput } from "../fields/DeclaracionCurrencyInput";

interface StepProps {
  resultado: ResultadoDeclaracion;
}

export function Step02DebeDeclarar(_props: StepProps) {
  const { state, dispatch } = useDeclaracion();
  const u = state.umbrales;
  const uvt = UVT_VALUES[state.perfil.anoGravable] ?? 49_799;

  const update = (payload: Partial<typeof u>) =>
    dispatch({ type: "UPDATE_UMBRALES", payload });

  const resultado = useMemo(() => verificarObligacionDeclarar(state), [state]);

  return (
    <div className="space-y-6">
      <div className="rounded-md border border-border/60 bg-muted/30 p-4">
        <p className="text-sm text-foreground">
          Según los artículos 592, 593 y 594 del ET, una persona natural debe declarar renta si
          supera <strong>cualquiera</strong> de los siguientes umbrales durante el año gravable{" "}
          {state.perfil.anoGravable}. Ingrese sus valores aproximados.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <DeclaracionCurrencyInput
          id="umbral-patrimonio"
          label="Patrimonio bruto al 31 de diciembre"
          value={u.patrimonioBruto}
          onChange={(v) => update({ patrimonioBruto: v })}
          uvtEquivalent={u.patrimonioBruto / uvt}
          tooltipText="Suma de todos los bienes y derechos a 31 de diciembre. Umbral: 4.500 UVT."
          articuloET="592"
          helperText={`Umbral: ${(4_500 * uvt).toLocaleString("es-CO")} COP (4.500 UVT)`}
        />
        <DeclaracionCurrencyInput
          id="umbral-ingresos"
          label="Ingresos brutos del año"
          value={u.ingresoBruto}
          onChange={(v) => update({ ingresoBruto: v })}
          uvtEquivalent={u.ingresoBruto / uvt}
          tooltipText="Total de ingresos recibidos durante el año gravable. Umbral: 1.400 UVT."
          articuloET="592"
          helperText={`Umbral: ${(1_400 * uvt).toLocaleString("es-CO")} COP (1.400 UVT)`}
        />
        <DeclaracionCurrencyInput
          id="umbral-compras"
          label="Compras y consumos del año"
          value={u.comprasConsumos}
          onChange={(v) => update({ comprasConsumos: v })}
          uvtEquivalent={u.comprasConsumos / uvt}
          tooltipText="Total de compras y consumos con tarjeta o efectivo. Umbral: 1.400 UVT."
          articuloET="594-3"
          helperText={`Umbral: ${(1_400 * uvt).toLocaleString("es-CO")} COP (1.400 UVT)`}
        />
        <DeclaracionCurrencyInput
          id="umbral-consignaciones"
          label="Consignaciones bancarias del año"
          value={u.consignaciones}
          onChange={(v) => update({ consignaciones: v })}
          uvtEquivalent={u.consignaciones / uvt}
          tooltipText="Suma de todas las consignaciones y depósitos en cuentas bancarias. Umbral: 1.400 UVT."
          articuloET="594-3"
          helperText={`Umbral: ${(1_400 * uvt).toLocaleString("es-CO")} COP (1.400 UVT)`}
        />
        <DeclaracionCurrencyInput
          id="umbral-tarjetas"
          label="Movimientos en tarjetas de crédito"
          value={u.movimientosTarjetas}
          onChange={(v) => update({ movimientosTarjetas: v })}
          uvtEquivalent={u.movimientosTarjetas / uvt}
          tooltipText="Total de compras con tarjeta de crédito durante el año. Umbral: 1.400 UVT."
          articuloET="594-3"
          helperText={`Umbral: ${(1_400 * uvt).toLocaleString("es-CO")} COP (1.400 UVT)`}
        />
      </div>

      {/* Resultado */}
      {(u.patrimonioBruto > 0 || u.ingresoBruto > 0 || u.comprasConsumos > 0 || u.consignaciones > 0 || u.movimientosTarjetas > 0) && (
        <div
          className={`rounded-lg border p-5 ${
            resultado.debeDeclarar
              ? "border-destructive/30 bg-destructive/5"
              : "border-success/30 bg-success/5"
          }`}
        >
          <div className="flex items-start gap-3">
            {resultado.debeDeclarar ? (
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
            ) : (
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" />
            )}
            <div>
              <h3 className="font-semibold text-foreground">
                {resultado.debeDeclarar
                  ? "Sí, usted está obligado a declarar renta"
                  : "Con estos datos, NO estaría obligado a declarar"}
              </h3>
              {resultado.debeDeclarar && resultado.razones.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {resultado.razones.map((razon) => (
                    <li key={razon} className="text-sm text-foreground/80">
                      • {razon}
                    </li>
                  ))}
                </ul>
              )}
              {!resultado.debeDeclarar && (
                <p className="mt-1 text-sm text-muted-foreground">
                  Sin embargo, puede continuar con el ejercicio para conocer su situación fiscal.
                  Declarar voluntariamente puede generar saldo a favor.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
