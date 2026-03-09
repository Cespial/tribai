"use client";

import { useMemo } from "react";
import { clsx } from "clsx";
import { useDeclaracionJuridica } from "@/lib/declaracion-renta-juridicas/declaracion-juridica-context";
import { WIZARD_STEPS_JURIDICAS } from "@/lib/declaracion-renta-juridicas/types";
import { calcularDeclaracionJuridica } from "@/lib/declaracion-renta-juridicas/engine";
import { WizardSidebar } from "@/components/declaracion-renta/WizardSidebar";
import { WizardMobileStepper } from "@/components/declaracion-renta/WizardMobileStepper";
import { StepJ01Perfil } from "./steps/StepJ01Perfil";
import { StepJ02DatosInformativos } from "./steps/StepJ02DatosInformativos";
import { StepJ03Patrimonio } from "./steps/StepJ03Patrimonio";
import { StepJ04Ingresos } from "./steps/StepJ04Ingresos";
import { StepJ05CostosGastos } from "./steps/StepJ05CostosGastos";
import { StepJ06Compensacion } from "./steps/StepJ06Compensacion";
import { StepJ07RentasExentas } from "./steps/StepJ07RentasExentas";
import { StepJ08Descuentos } from "./steps/StepJ08Descuentos";
import { StepJ09GananciasOcasionales } from "./steps/StepJ09GananciasOcasionales";
import { StepJ10Retenciones } from "./steps/StepJ10Retenciones";
import { StepJ11TTD } from "./steps/StepJ11TTD";
import { StepJ12Resumen } from "./steps/StepJ12Resumen";

const STEP_COMPONENTS = [
  StepJ01Perfil,
  StepJ02DatosInformativos,
  StepJ03Patrimonio,
  StepJ04Ingresos,
  StepJ05CostosGastos,
  StepJ06Compensacion,
  StepJ07RentasExentas,
  StepJ08Descuentos,
  StepJ09GananciasOcasionales,
  StepJ10Retenciones,
  StepJ11TTD,
  StepJ12Resumen,
];

export function DeclaracionJuridicaWizard() {
  const { state, nextStep, prevStep, goToStep, canGoToStep, resetDeclaracion } =
    useDeclaracionJuridica();

  const resultado = useMemo(() => calcularDeclaracionJuridica(state), [state]);

  const currentStep = state.currentStep;
  const StepComponent = STEP_COMPONENTS[currentStep];
  const stepMeta = WIZARD_STEPS_JURIDICAS[currentStep];
  const isLastStep = currentStep === WIZARD_STEPS_JURIDICAS.length - 1;
  const isFirstStep = currentStep === 0;

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <aside className="hidden lg:block lg:w-64 lg:shrink-0">
        <WizardSidebar
          steps={WIZARD_STEPS_JURIDICAS}
          currentStep={currentStep}
          completedSteps={state.completedSteps}
          onGoToStep={goToStep}
          canGoToStep={canGoToStep}
        />
      </aside>

      <div className="min-w-0 flex-1">
        <div className="mb-4 lg:hidden">
          <WizardMobileStepper
            steps={WIZARD_STEPS_JURIDICAS}
            currentStep={currentStep}
            completedSteps={state.completedSteps}
          />
        </div>

        <div className="mb-6">
          <p className="text-xs font-medium uppercase tracking-[0.05em] text-muted-foreground">
            Paso {currentStep + 1} de {WIZARD_STEPS_JURIDICAS.length}
          </p>
          <h2 className="heading-serif mt-1 text-2xl text-foreground">{stepMeta.label}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{stepMeta.description}</p>
        </div>

        <div
          className={clsx(
            "rounded-lg border border-border/60 bg-card p-5 shadow-sm sm:p-6",
            "animate-in fade-in slide-in-from-right-2 duration-300"
          )}
        >
          {StepComponent && <StepComponent resultado={resultado} />}
        </div>

        <div className="mt-6 flex items-center justify-between">
          <div>
            {!isFirstStep && (
              <button
                type="button"
                onClick={prevStep}
                className="inline-flex items-center gap-1.5 rounded border border-border px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                &larr; Anterior
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {state.lastSaved && (
              <span className="text-[11px] text-muted-foreground">
                Guardado automáticamente
              </span>
            )}
            {!isLastStep ? (
              <button
                type="button"
                onClick={nextStep}
                className="btn-primary inline-flex items-center gap-1.5 text-sm"
              >
                Siguiente &rarr;
              </button>
            ) : (
              <button
                type="button"
                onClick={resetDeclaracion}
                className="inline-flex items-center gap-1.5 rounded border border-destructive/50 px-4 py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
              >
                Reiniciar declaración
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
