"use client";

import { useCallback } from "react";
import { Plus, Trash2, Building2, Car, Landmark, Wallet, Package } from "lucide-react";
import { useDeclaracion } from "@/lib/declaracion-renta/declaracion-context";
import type { BienPatrimonial, DeudaPatrimonial, ResultadoDeclaracion } from "@/lib/declaracion-renta/types";
import { DeclaracionCurrencyInput } from "../fields/DeclaracionCurrencyInput";
import { DeclaracionSelect } from "../fields/DeclaracionSelect";
import { DeclaracionTextInput } from "../fields/DeclaracionTextInput";

const TIPO_BIEN_OPTIONS = [
  { value: "inmueble", label: "Inmueble (casa, apto, lote)" },
  { value: "vehiculo", label: "Vehículo" },
  { value: "inversion", label: "Inversión financiera" },
  { value: "cuenta_bancaria", label: "Cuenta bancaria" },
  { value: "otro_bien", label: "Otro bien" },
];

const TIPO_DEUDA_OPTIONS = [
  { value: "hipoteca", label: "Crédito hipotecario" },
  { value: "credito", label: "Crédito de consumo / libre inversión" },
  { value: "tarjeta_credito", label: "Tarjeta de crédito" },
  { value: "otra_deuda", label: "Otra deuda" },
];

const BIEN_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  inmueble: Building2,
  vehiculo: Car,
  inversion: Landmark,
  cuenta_bancaria: Wallet,
  otro_bien: Package,
};

interface StepProps {
  resultado: ResultadoDeclaracion;
}

export function Step03Patrimonio({ resultado }: StepProps) {
  const { state, dispatch } = useDeclaracion();
  const { bienes, deudas } = state.patrimonio;

  const addBien = useCallback(() => {
    const bien: BienPatrimonial = {
      id: crypto.randomUUID(),
      tipo: "inmueble",
      descripcion: "",
      valorFiscal: 0,
      valorFiscalAnterior: 0,
      pais: "colombia",
    };
    dispatch({ type: "ADD_BIEN", payload: bien });
  }, [dispatch]);

  const addDeuda = useCallback(() => {
    const deuda: DeudaPatrimonial = {
      id: crypto.randomUUID(),
      tipo: "hipoteca",
      descripcion: "",
      saldoDiciembre31: 0,
      saldoAnterior: 0,
    };
    dispatch({ type: "ADD_DEUDA", payload: deuda });
  }, [dispatch]);

  const rp = resultado.patrimonio;

  return (
    <div className="space-y-6">
      <div className="rounded-md border border-border/60 bg-muted/30 p-4">
        <p className="text-sm text-foreground">
          Registre todos los bienes y deudas que tenía al <strong>31 de diciembre de {state.perfil.anoGravable}</strong>.
          El valor fiscal es el declarado en años anteriores, el avalúo catastral (inmuebles) o el costo de adquisición.
        </p>
      </div>

      {/* Bienes */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-[0.05em] text-foreground">
            Bienes y derechos
          </h3>
          <button
            type="button"
            onClick={addBien}
            className="inline-flex items-center gap-1.5 rounded border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
          >
            <Plus className="h-3.5 w-3.5" /> Agregar bien
          </button>
        </div>

        {bienes.length === 0 ? (
          <div className="rounded-md border border-dashed border-border/60 p-8 text-center">
            <Package className="mx-auto mb-2 h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">
              No ha registrado bienes. Haga clic en &ldquo;Agregar bien&rdquo; para comenzar.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {bienes.map((bien, index) => {
              const Icon = BIEN_ICONS[bien.tipo] ?? Package;
              return (
                <div
                  key={bien.id}
                  className="rounded-md border border-border/60 bg-background p-4"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-xs font-medium text-muted-foreground">
                        Bien #{index + 1}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => dispatch({ type: "REMOVE_BIEN", id: bien.id })}
                      className="inline-flex h-8 w-8 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                    <DeclaracionSelect
                      id={`bien-tipo-${bien.id}`}
                      label="Tipo de bien"
                      value={bien.tipo}
                      onChange={(v) =>
                        dispatch({
                          type: "UPDATE_BIEN",
                          id: bien.id,
                          payload: { tipo: v as BienPatrimonial["tipo"] },
                        })
                      }
                      options={TIPO_BIEN_OPTIONS}
                    />
                    <DeclaracionTextInput
                      id={`bien-desc-${bien.id}`}
                      label="Descripción"
                      value={bien.descripcion}
                      onChange={(v) =>
                        dispatch({ type: "UPDATE_BIEN", id: bien.id, payload: { descripcion: v } })
                      }
                      placeholder="Ej: Apartamento Bogotá"
                    />
                    <DeclaracionCurrencyInput
                      id={`bien-valor-${bien.id}`}
                      label="Valor fiscal"
                      value={bien.valorFiscal}
                      onChange={(v) =>
                        dispatch({ type: "UPDATE_BIEN", id: bien.id, payload: { valorFiscal: v } })
                      }
                      tooltipText="Valor por el cual el bien fue declarado el año anterior, o su costo de adquisición."
                    />
                    <DeclaracionSelect
                      id={`bien-pais-${bien.id}`}
                      label="País"
                      value={bien.pais}
                      onChange={(v) =>
                        dispatch({
                          type: "UPDATE_BIEN",
                          id: bien.id,
                          payload: { pais: v as "colombia" | "exterior" },
                        })
                      }
                      options={[
                        { value: "colombia", label: "Colombia" },
                        { value: "exterior", label: "Exterior" },
                      ]}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Deudas */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-[0.05em] text-foreground">
            Deudas
          </h3>
          <button
            type="button"
            onClick={addDeuda}
            className="inline-flex items-center gap-1.5 rounded border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
          >
            <Plus className="h-3.5 w-3.5" /> Agregar deuda
          </button>
        </div>

        {deudas.length === 0 ? (
          <div className="rounded-md border border-dashed border-border/60 p-8 text-center">
            <p className="text-sm text-muted-foreground">
              No ha registrado deudas. Si no tiene, puede avanzar al siguiente paso.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {deudas.map((deuda, index) => (
              <div
                key={deuda.id}
                className="rounded-md border border-border/60 bg-background p-4"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">
                    Deuda #{index + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => dispatch({ type: "REMOVE_DEUDA", id: deuda.id })}
                    className="inline-flex h-8 w-8 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <DeclaracionSelect
                    id={`deuda-tipo-${deuda.id}`}
                    label="Tipo de deuda"
                    value={deuda.tipo}
                    onChange={(v) =>
                      dispatch({
                        type: "UPDATE_DEUDA",
                        id: deuda.id,
                        payload: { tipo: v as DeudaPatrimonial["tipo"] },
                      })
                    }
                    options={TIPO_DEUDA_OPTIONS}
                  />
                  <DeclaracionTextInput
                    id={`deuda-desc-${deuda.id}`}
                    label="Descripción"
                    value={deuda.descripcion}
                    onChange={(v) =>
                      dispatch({ type: "UPDATE_DEUDA", id: deuda.id, payload: { descripcion: v } })
                    }
                    placeholder="Ej: Hipoteca Bancolombia"
                  />
                  <DeclaracionCurrencyInput
                    id={`deuda-saldo-${deuda.id}`}
                    label="Saldo a 31 de diciembre"
                    value={deuda.saldoDiciembre31}
                    onChange={(v) =>
                      dispatch({ type: "UPDATE_DEUDA", id: deuda.id, payload: { saldoDiciembre31: v } })
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Resumen patrimonio */}
      {(bienes.length > 0 || deudas.length > 0) && (
        <div className="rounded-md border border-border/60 bg-muted/30 p-4">
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-[0.05em] text-muted-foreground">
            Resumen patrimonio
          </h4>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-[11px] text-muted-foreground">Patrimonio bruto</p>
              <p className="text-lg font-semibold text-foreground">
                ${rp.patrimonioBruto.toLocaleString("es-CO")}
              </p>
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground">Deudas</p>
              <p className="text-lg font-semibold text-foreground">
                ${rp.deudasTotal.toLocaleString("es-CO")}
              </p>
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground">Patrimonio líquido</p>
              <p className="text-lg font-semibold text-foreground">
                ${rp.patrimonioLiquido.toLocaleString("es-CO")}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
