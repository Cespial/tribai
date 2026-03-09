"use client";

import { useMemo } from "react";
import { clsx } from "clsx";
import { useDeclaracion } from "@/lib/declaracion-renta/declaracion-context";
import { WIZARD_STEPS } from "@/lib/declaracion-renta/types";
import { calcularDeclaracion } from "@/lib/declaracion-renta/engine";
import { WizardSidebar } from "./WizardSidebar";
import { WizardMobileStepper } from "./WizardMobileStepper";
import { Step01Perfil } from "./steps/Step01Perfil";
import { Step02DebeDeclarar } from "./steps/Step02DebeDeclarar";
import { Step03Patrimonio } from "./steps/Step03Patrimonio";
import { Step04RentasTrabajo } from "./steps/Step04RentasTrabajo";
import { Step05RentasCapital } from "./steps/Step05RentasCapital";
import { Step06RentasNoLaborales } from "./steps/Step06RentasNoLaborales";
import { Step07Deducciones } from "./steps/Step07Deducciones";
import { Step08Pensiones } from "./steps/Step08Pensiones";
import { Step09Dividendos } from "./steps/Step09Dividendos";
import { Step10GananciasOcasionales } from "./steps/Step10GananciasOcasionales";
import { Step11Retenciones } from "./steps/Step11Retenciones";
import { Step12Resumen } from "./steps/Step12Resumen";

const STEP_COMPONENTS = [
  Step01Perfil,
  Step02DebeDeclarar,
  Step03Patrimonio,
  Step04RentasTrabajo,
  Step05RentasCapital,
  Step06RentasNoLaborales,
  Step07Deducciones,
  Step08Pensiones,
  Step09Dividendos,
  Step10GananciasOcasionales,
  Step11Retenciones,
  Step12Resumen,
];

export function DeclaracionWizard() {
  const { state, nextStep, prevStep, goToStep, isStepCompleted, canGoToStep, resetDeclaracion } =
    useDeclaracion();

  const resultado = useMemo(() => calcularDeclaracion(state), [state]);

  const currentStep = state.currentStep;
  const StepComponent = STEP_COMPONENTS[currentStep];
  const stepMeta = WIZARD_STEPS[currentStep];
  const isLastStep = currentStep === WIZARD_STEPS.length - 1;
  const isFirstStep = currentStep === 0;

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      {/* Sidebar — desktop */}
      <aside className="hidden lg:block lg:w-64 lg:shrink-0">
        <WizardSidebar
          steps={WIZARD_STEPS}
          currentStep={currentStep}
          completedSteps={state.completedSteps}
          onGoToStep={goToStep}
          canGoToStep={canGoToStep}
        />
      </aside>

      {/* Main content */}
      <div className="min-w-0 flex-1">
        {/* Mobile stepper */}
        <div className="mb-4 lg:hidden">
          <WizardMobileStepper
            steps={WIZARD_STEPS}
            currentStep={currentStep}
            completedSteps={state.completedSteps}
          />
        </div>

        {/* Step header */}
        <div className="mb-6">
          <p className="text-xs font-medium uppercase tracking-[0.05em] text-muted-foreground">
            Paso {currentStep + 1} de {WIZARD_STEPS.length}
          </p>
          <h2 className="heading-serif mt-1 text-2xl text-foreground">{stepMeta.label}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{stepMeta.description}</p>
        </div>

        {/* Step content */}
        <div
          className={clsx(
            "rounded-lg border border-border/60 bg-card p-5 shadow-sm sm:p-6",
            "animate-in fade-in slide-in-from-right-2 duration-300"
          )}
        >
          {StepComponent && <StepComponent resultado={resultado} />}
        </div>

        {/* Navigation */}
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
