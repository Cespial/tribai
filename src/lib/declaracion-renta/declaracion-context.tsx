"use client";

import { createContext, useContext, useReducer, useEffect, useCallback, type ReactNode } from "react";
import {
  type DeclaracionState,
  type DeclaracionAction,
  INITIAL_STATE,
  DEFAULT_RENTAS_HONORARIOS,
  DEFAULT_EXENCIONES,
  DEFAULT_DESCUENTOS_TRIBUTARIOS,
  DEFAULT_DATOS_ADICIONALES,
} from "./types";

const STORAGE_KEY = "tribai-declaracion-renta-v2";
const LEGACY_STORAGE_KEY = "tribai-declaracion-renta-v1";

// ── Migration v1 → v2 ───────────────────────────────────

function migrateV1toV2(v1: Record<string, unknown>): DeclaracionState {
  const state = { ...INITIAL_STATE };

  // Preserve compatible fields
  if (v1.currentStep != null) state.currentStep = v1.currentStep as number;
  if (v1.completedSteps != null) state.completedSteps = v1.completedSteps as number[];
  if (v1.perfil != null) state.perfil = { ...state.perfil, ...(v1.perfil as object) };
  if (v1.umbrales != null) state.umbrales = { ...state.umbrales, ...(v1.umbrales as object) };
  if (v1.patrimonio != null) state.patrimonio = { ...state.patrimonio, ...(v1.patrimonio as object) };

  // Migrate rentas trabajo (add new fields with defaults)
  if (v1.rentasTrabajo != null) {
    const old = v1.rentasTrabajo as Record<string, number>;
    state.rentasTrabajo = {
      ...state.rentasTrabajo,
      salariosYPagosLaborales: old.salariosYPagosLaborales ?? 0,
      honorariosServicios: old.honorariosServicios ?? 0,
      otrosIngresosTrabajo: old.otrosIngresosTrabajo ?? 0,
      aportesObligatoriosSalud: old.aportesObligatoriosSalud ?? 0,
      aportesObligatoriosPension: old.aportesObligatoriosPension ?? 0,
      fondoSolidaridad: old.fondoSolidaridad ?? 0,
      otrosINCR: old.otrosINCR ?? 0,
    };
  }

  // Migrate rentas capital
  if (v1.rentasCapital != null) {
    const old = v1.rentasCapital as Record<string, number>;
    state.rentasCapital = {
      ...state.rentasCapital,
      interesesRendimientos: old.interesesRendimientos ?? 0,
      arrendamientos: old.arrendamientos ?? 0,
      regalias: old.regalias ?? 0,
      otrosIngresosCapital: old.otrosIngresosCapital ?? 0,
      costosGastosCapital: old.costosGastosCapital ?? 0,
    };
  }

  // Migrate rentas no laborales
  if (v1.rentasNoLaborales != null) {
    const old = v1.rentasNoLaborales as Record<string, number>;
    state.rentasNoLaborales = {
      ...state.rentasNoLaborales,
      ingresosComerciales: old.ingresosComerciales ?? 0,
      ingresosIndustriales: old.ingresosIndustriales ?? 0,
      ingresosAgropecuarios: old.ingresosAgropecuarios ?? 0,
      otrosIngresosNoLaborales: old.otrosIngresosNoLaborales ?? 0,
    };
  }

  // Migrate deducciones
  if (v1.deducciones != null) {
    const old = v1.deducciones as Record<string, unknown>;
    state.deducciones = {
      ...state.deducciones,
      interesesVivienda: (old.interesesVivienda as number) ?? 0,
      medicinaPrepagada: (old.medicinaPrepagada as number) ?? 0,
      dependientes10Pct: (old.dependientes as number) ?? 0,
      GMFDeducible: (old.GMFDeducible as number) ?? 0,
      donaciones: (old.donaciones as number) ?? 0,
      otrasDeducciones: (old.otrasDeducciones as number) ?? 0,
    };
    // Map old exenta25Porciento to new exenciones.aplicar25PctLaboral
    if (old.exenta25Porciento != null) {
      state.exenciones.aplicar25PctLaboral = old.exenta25Porciento as boolean;
    }
    // Map old AFC/FVP/pensiones to new exenciones
    if (old.aportesAFC != null) state.exenciones.aportesAFC = old.aportesAFC as number;
    if (old.aportesFVP != null) state.exenciones.aportesFVP = old.aportesFVP as number;
    if (old.pensionesVoluntarias != null) state.exenciones.aportesVoluntariosPension = old.pensionesVoluntarias as number;
  }

  // Migrate cédula pensiones
  if (v1.cedulaPensiones != null) {
    const old = v1.cedulaPensiones as Record<string, number>;
    state.cedulaPensiones = {
      ...state.cedulaPensiones,
      pensionesNacionales: (old.pensionJubilacion ?? 0) + (old.pensionSobreviviente ?? 0) + (old.pensionInvalidez ?? 0),
      aportesObligatoriosSalud: old.aportesObligatoriosSalud ?? 0,
    };
  }

  // Migrate cédula dividendos
  if (v1.cedulaDividendos != null) {
    const old = v1.cedulaDividendos as Record<string, number>;
    state.cedulaDividendos = {
      ...state.cedulaDividendos,
      dividendosNoGravados2016: old.dividendosNoGravados2016 ?? 0,
      dividendosNoGravadosNacionales: old.dividendosNoGravados ?? 0,
      dividendosGravadosNacionales: old.dividendosGravados ?? 0,
    };
  }

  // Migrate ganancias ocasionales
  if (v1.gananciasOcasionales != null) {
    const old = v1.gananciasOcasionales as Record<string, number>;
    state.gananciasOcasionales = {
      ...state.gananciasOcasionales,
      ventaViviendaAFCIngreso: old.ventaVivienda ?? 0,
      ventaActivosIngreso: old.ventaOtrosActivos ?? 0,
      herenciasLegadosDonaciones: old.herenciasDonaciones ?? 0,
      loteriasRifasApuestas: old.loterias ?? 0,
      otrasGanancias: (old.indemnizaciones ?? 0) + (old.otrasGanancias ?? 0),
    };
  }

  // Migrate retenciones
  if (v1.retencionesAnticipos != null) {
    const old = v1.retencionesAnticipos as Record<string, number>;
    state.retencionesAnticipos = {
      ...state.retencionesAnticipos,
      retencionFuenteRenta: old.retencionFuenteRenta ?? 0,
      retencionFuenteOtros: old.retencionFuenteOtros ?? 0,
      retencionDividendos: old.retencionDividendos ?? 0,
      anticipoAnoAnterior: old.anticipoAnoAnterior ?? 0,
      saldoFavorAnterior: old.saldoFavorAnterior ?? 0,
    };
  }

  state.version = 2;
  state.lastSaved = new Date().toISOString();
  return state;
}

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

    case "UPDATE_RENTAS_HONORARIOS":
      return { ...state, rentasHonorarios: { ...state.rentasHonorarios, ...action.payload } };

    case "UPDATE_RENTAS_CAPITAL":
      return { ...state, rentasCapital: { ...state.rentasCapital, ...action.payload } };

    case "UPDATE_RENTAS_NO_LABORALES":
      return { ...state, rentasNoLaborales: { ...state.rentasNoLaborales, ...action.payload } };

    case "UPDATE_DEDUCCIONES":
      return { ...state, deducciones: { ...state.deducciones, ...action.payload } };

    case "UPDATE_EXENCIONES":
      return { ...state, exenciones: { ...state.exenciones, ...action.payload } };

    case "UPDATE_CEDULA_PENSIONES":
      return { ...state, cedulaPensiones: { ...state.cedulaPensiones, ...action.payload } };

    case "UPDATE_CEDULA_DIVIDENDOS":
      return { ...state, cedulaDividendos: { ...state.cedulaDividendos, ...action.payload } };

    case "UPDATE_GANANCIAS_OCASIONALES":
      return { ...state, gananciasOcasionales: { ...state.gananciasOcasionales, ...action.payload } };

    case "UPDATE_DESCUENTOS_TRIBUTARIOS":
      return { ...state, descuentosTributarios: { ...state.descuentosTributarios, ...action.payload } };

    case "UPDATE_DATOS_ADICIONALES":
      return { ...state, datosAdicionales: { ...state.datosAdicionales, ...action.payload } };

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

  // Load from localStorage on mount (with v1 migration)
  useEffect(() => {
    try {
      // Try v2 first
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as DeclaracionState;
        if (parsed.version === 2) {
          dispatch({ type: "LOAD_SAVED", payload: parsed });
          return;
        }
      }
      // Try migrating v1
      const legacySaved = localStorage.getItem(LEGACY_STORAGE_KEY);
      if (legacySaved) {
        const parsed = JSON.parse(legacySaved);
        const migrated = migrateV1toV2(parsed);
        dispatch({ type: "LOAD_SAVED", payload: migrated });
        // Save migrated state to new key
        localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
      }
    } catch {
      // Ignore parse errors, start fresh
    }
  }, []);

  // Auto-save to localStorage (debounced)
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
      localStorage.removeItem(LEGACY_STORAGE_KEY);
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
