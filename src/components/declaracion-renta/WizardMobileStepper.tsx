"use client";

import { clsx } from "clsx";
interface StepMeta {
  id: string;
  shortLabel: string;
}

interface WizardMobileStepperProps {
  steps: StepMeta[];
  currentStep: number;
  completedSteps: number[];
}

export function WizardMobileStepper({ steps, currentStep, completedSteps }: WizardMobileStepperProps) {
  return (
    <div>
      {/* Progress bar */}
      <div className="mb-2 flex items-center gap-1">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={clsx(
              "h-1 flex-1 rounded-full transition-colors",
              index === currentStep
                ? "bg-foreground"
                : completedSteps.includes(index)
                  ? "bg-success"
                  : "bg-muted"
            )}
          />
        ))}
      </div>
      {/* Label */}
      <p className="text-xs text-muted-foreground">
        <span className="font-medium text-foreground">{currentStep + 1}</span>
        {" / "}
        {steps.length} — {steps[currentStep].shortLabel}
      </p>
    </div>
  );
}
