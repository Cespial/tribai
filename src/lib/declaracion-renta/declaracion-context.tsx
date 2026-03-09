"use client";

import { createContext, useContext, useReducer, useEffect, useCallback, type ReactNode } from "react";
import {
  type DeclaracionState,
  type DeclaracionAction,
  INITIAL_STATE,
} from "./types";

const STORAGE_KEY = "tribai-declaracion-renta-v1";

// ── Reducer ──────────────────────────────────────────────

function declaracionReducer(state: DeclaracionState, action: DeclaracionAction): DeclaracionState {
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

    case "UPDATE_UMBRALES":
      return { ...state, umbrales: { ...state.umbrales, ...action.payload } };

    case "UPDATE_PATRIMONIO":
      return { ...state, patrimonio: { ...state.patrimonio, ...action.payload } };

    case "ADD_BIEN":
      return {
        ...state,
        patrimonio: {
          ...state.patrimonio,
          bienes: [...state.patrimonio.bienes, action.payload],
        },
      };

    case "REMOVE_BIEN":
      return {
        ...state,
        patrimonio: {
          ...state.patrimonio,
          bienes: state.patrimonio.bienes.filter((b) => b.id !== action.id),
        },
      };

    case "UPDATE_BIEN":
      return {
        ...state,
        patrimonio: {
          ...state.patrimonio,
          bienes: state.patrimonio.bienes.map((b) =>
            b.id === action.id ? { ...b, ...action.payload } : b
          ),
        },
      };

    case "ADD_DEUDA":
      return {
        ...state,
        patrimonio: {
          ...state.patrimonio,
          deudas: [...state.patrimonio.deudas, action.payload],
        },
      };

    case "REMOVE_DEUDA":
      return {
        ...state,
        patrimonio: {
          ...state.patrimonio,
          deudas: state.patrimonio.deudas.filter((d) => d.id !== action.id),
        },
      };

    case "UPDATE_DEUDA":
      return {
        ...state,
        patrimonio: {
          ...state.patrimonio,
          deudas: state.patrimonio.deudas.map((d) =>
            d.id === action.id ? { ...d, ...action.payload } : d
          ),
        },
      };

    case "UPDATE_RENTAS_TRABAJO":
      return { ...state, rentasTrabajo: { ...state.rentasTrabajo, ...action.payload } };

    case "UPDATE_RENTAS_CAPITAL":
      return { ...state, rentasCapital: { ...state.rentasCapital, ...action.payload } };

    case "UPDATE_RENTAS_NO_LABORALES":
      return { ...state, rentasNoLaborales: { ...state.rentasNoLaborales, ...action.payload } };

    case "UPDATE_DEDUCCIONES":
      return { ...state, deducciones: { ...state.deducciones, ...action.payload } };

    case "UPDATE_CEDULA_PENSIONES":
      return { ...state, cedulaPensiones: { ...state.cedulaPensiones, ...action.payload } };

    case "UPDATE_CEDULA_DIVIDENDOS":
      return { ...state, cedulaDividendos: { ...state.cedulaDividendos, ...action.payload } };

    case "UPDATE_GANANCIAS_OCASIONALES":
      return { ...state, gananciasOcasionales: { ...state.gananciasOcasionales, ...action.payload } };

    case "UPDATE_RETENCIONES_ANTICIPOS":
      return { ...state, retencionesAnticipos: { ...state.retencionesAnticipos, ...action.payload } };

    case "LOAD_SAVED":
      return { ...action.payload, lastSaved: action.payload.lastSaved };

    case "RESET":
      return { ...INITIAL_STATE };

    default:
      return state;
  }
}

// ── Context ──────────────────────────────────────────────

interface DeclaracionContextValue {
  state: DeclaracionState;
  dispatch: React.Dispatch<DeclaracionAction>;
  goToStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  completeCurrentStep: () => void;
  resetDeclaracion: () => void;
  isStepCompleted: (step: number) => boolean;
  canGoToStep: (step: number) => boolean;
}

const DeclaracionContext = createContext<DeclaracionContextValue | null>(null);

// ── Provider ─────────────────────────────────────────────

export function DeclaracionProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(declaracionReducer, INITIAL_STATE);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as DeclaracionState;
        if (parsed.version === INITIAL_STATE.version) {
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
        const toSave: DeclaracionState = {
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
    <DeclaracionContext.Provider
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
    </DeclaracionContext.Provider>
  );
}

// ── Hook ─────────────────────────────────────────────────

export function useDeclaracion() {
  const ctx = useContext(DeclaracionContext);
  if (!ctx) throw new Error("useDeclaracion must be used within DeclaracionProvider");
  return ctx;
}
