"use client";

import { createContext, useContext, useReducer, useEffect, useCallback, type ReactNode } from "react";
import {
  type DeclaracionJuridicaState,
  type PerdidaFiscal,
  type PerfilJuridico,
  type DatosInformativos,
  type PatrimonioJuridico,
  type IngresosJuridicos,
  type CostosGastosJuridicos,
  type CompensacionPerdidas,
  type RentasExentasJuridicas,
  type DescuentosTributariosJuridicos,
  type GananciasOcasionalesJuridicas,
  type RetencionesAnticiposJuridico,
  type TTDInputs,
  INITIAL_STATE_JURIDICA,
} from "./types";

const STORAGE_KEY = "tribai-declaracion-juridica-v1";

// ── Action types ─────────────────────────────────────────

export type DeclaracionJuridicaAction =
  | { type: "SET_STEP"; step: number }
  | { type: "COMPLETE_STEP"; step: number }
  | { type: "UPDATE_PERFIL"; payload: Partial<PerfilJuridico> }
  | { type: "UPDATE_DATOS_INFORMATIVOS"; payload: Partial<DatosInformativos> }
  | { type: "UPDATE_PATRIMONIO"; payload: Partial<PatrimonioJuridico> }
  | { type: "UPDATE_INGRESOS"; payload: Partial<IngresosJuridicos> }
  | { type: "UPDATE_COSTOS_GASTOS"; payload: Partial<CostosGastosJuridicos> }
  | { type: "UPDATE_COMPENSACION"; payload: Partial<CompensacionPerdidas> }
  | { type: "ADD_PERDIDA"; payload: PerdidaFiscal }
  | { type: "REMOVE_PERDIDA"; ano: number }
  | { type: "UPDATE_RENTAS_EXENTAS"; payload: Partial<RentasExentasJuridicas> }
  | { type: "UPDATE_DESCUENTOS"; payload: Partial<DescuentosTributariosJuridicos> }
  | { type: "UPDATE_GANANCIAS_OCASIONALES"; payload: Partial<GananciasOcasionalesJuridicas> }
  | { type: "UPDATE_RETENCIONES"; payload: Partial<RetencionesAnticiposJuridico> }
  | { type: "UPDATE_TTD_INPUTS"; payload: Partial<TTDInputs> }
  | { type: "LOAD_SAVED"; payload: DeclaracionJuridicaState }
  | { type: "RESET" };

// ── Reducer ──────────────────────────────────────────────

function declaracionJuridicaReducer(
  state: DeclaracionJuridicaState,
  action: DeclaracionJuridicaAction
): DeclaracionJuridicaState {
  switch (action.type) {
    case "SET_STEP":
      return { ...state, currentStep: action.step };

    case "COMPLETE_STEP":
      return {
        ...state,
        completedSteps: state.completedSteps.includes(action.step)
          ? state.completedSteps
          : [...state.completedSteps, action.step],
      };

    case "UPDATE_PERFIL":
      return { ...state, perfil: { ...state.perfil, ...action.payload } };

    case "UPDATE_DATOS_INFORMATIVOS":
      return { ...state, datosInformativos: { ...state.datosInformativos, ...action.payload } };

    case "UPDATE_PATRIMONIO":
      return { ...state, patrimonio: { ...state.patrimonio, ...action.payload } };

    case "UPDATE_INGRESOS":
      return { ...state, ingresos: { ...state.ingresos, ...action.payload } };

    case "UPDATE_COSTOS_GASTOS":
      return { ...state, costosGastos: { ...state.costosGastos, ...action.payload } };

    case "UPDATE_COMPENSACION":
      return { ...state, compensacion: { ...state.compensacion, ...action.payload } };

    case "ADD_PERDIDA":
      return {
        ...state,
        compensacion: {
          ...state.compensacion,
          perdidasAnteriores: [...state.compensacion.perdidasAnteriores, action.payload],
        },
      };

    case "REMOVE_PERDIDA":
      return {
        ...state,
        compensacion: {
          ...state.compensacion,
          perdidasAnteriores: state.compensacion.perdidasAnteriores.filter(
            (p) => p.ano !== action.ano
          ),
        },
      };

    case "UPDATE_RENTAS_EXENTAS":
      return { ...state, rentasExentas: { ...state.rentasExentas, ...action.payload } };

    case "UPDATE_DESCUENTOS":
      return { ...state, descuentos: { ...state.descuentos, ...action.payload } };

    case "UPDATE_GANANCIAS_OCASIONALES":
      return { ...state, gananciasOcasionales: { ...state.gananciasOcasionales, ...action.payload } };

    case "UPDATE_RETENCIONES":
      return { ...state, retenciones: { ...state.retenciones, ...action.payload } };

    case "UPDATE_TTD_INPUTS":
      return { ...state, ttdInputs: { ...state.ttdInputs, ...action.payload } };

    case "LOAD_SAVED":
      return { ...action.payload, lastSaved: action.payload.lastSaved };

    case "RESET":
      return { ...INITIAL_STATE_JURIDICA };

    default:
      return state;
  }
}

// ── Context ──────────────────────────────────────────────

interface DeclaracionJuridicaContextValue {
  state: DeclaracionJuridicaState;
  dispatch: React.Dispatch<DeclaracionJuridicaAction>;
  goToStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  completeCurrentStep: () => void;
  resetDeclaracion: () => void;
  isStepCompleted: (step: number) => boolean;
  canGoToStep: (step: number) => boolean;
}

const DeclaracionJuridicaContext = createContext<DeclaracionJuridicaContextValue | null>(null);

// ── Provider ─────────────────────────────────────────────

export function DeclaracionJuridicaProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(declaracionJuridicaReducer, INITIAL_STATE_JURIDICA);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as DeclaracionJuridicaState;
        if (parsed.version === INITIAL_STATE_JURIDICA.version) {
          dispatch({ type: "LOAD_SAVED", payload: parsed });
        }
      }
    } catch {
      // Ignore parse errors, start fresh
    }
  }, []);

  // Auto-save to localStorage on every change (debounced)
  useEffect(() => {
    const timeout = setTimeout(() => {
      try {
        const toSave: DeclaracionJuridicaState = {
          ...state,
          lastSaved: new Date().toISOString(),
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
      } catch {
        // Storage full or unavailable
      }
    }, 500);
    return () => clearTimeout(timeout);
  }, [state]);

  const goToStep = useCallback((step: number) => {
    dispatch({ type: "SET_STEP", step });
  }, []);

  const nextStep = useCallback(() => {
    dispatch({ type: "COMPLETE_STEP", step: state.currentStep });
    dispatch({ type: "SET_STEP", step: state.currentStep + 1 });
  }, [state.currentStep]);

  const prevStep = useCallback(() => {
    if (state.currentStep > 0) {
      dispatch({ type: "SET_STEP", step: state.currentStep - 1 });
    }
  }, [state.currentStep]);

  const completeCurrentStep = useCallback(() => {
    dispatch({ type: "COMPLETE_STEP", step: state.currentStep });
  }, [state.currentStep]);

  const resetDeclaracion = useCallback(() => {
    dispatch({ type: "RESET" });
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore
    }
  }, []);

  const isStepCompleted = useCallback(
    (step: number) => state.completedSteps.includes(step),
    [state.completedSteps]
  );

  const canGoToStep = useCallback(
    (step: number) => {
      if (step === 0) return true;
      // Can go to any completed step or the next uncompleted one
      if (state.completedSteps.includes(step)) return true;
      if (state.completedSteps.includes(step - 1)) return true;
      return false;
    },
    [state.completedSteps]
  );

  return (
    <DeclaracionJuridicaContext.Provider
      value={{
        state,
        dispatch,
        goToStep,
        nextStep,
        prevStep,
        completeCurrentStep,
        resetDeclaracion,
        isStepCompleted,
        canGoToStep,
      }}
    >
      {children}
    </DeclaracionJuridicaContext.Provider>
  );
}

// ── Hook ─────────────────────────────────────────────────

export function useDeclaracionJuridica() {
  const ctx = useContext(DeclaracionJuridicaContext);
  if (!ctx) throw new Error("useDeclaracionJuridica must be used within DeclaracionJuridicaProvider");
  return ctx;
}
