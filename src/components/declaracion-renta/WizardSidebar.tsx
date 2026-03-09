"use client";

import { clsx } from "clsx";
import {
  User,
  Users,
  HelpCircle,
  Building2,
  Landmark,
  Briefcase,
  TrendingUp,
  Store,
  Percent,
  Heart,
  BarChart3,
  Gift,
  Receipt,
  FileCheck,
  Check,
  ArrowDownUp,
  ShieldCheck,
  Gauge,
} from "lucide-react";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  User,
  Users,
  HelpCircle,
  Building2,
  Landmark,
  Briefcase,
  TrendingUp,
  Store,
  Percent,
  Heart,
  BarChart3,
  Gift,
  Receipt,
  FileCheck,
  ArrowDownUp,
  ShieldCheck,
  Gauge,
};

interface StepMeta {
  id: string;
  label: string;
  shortLabel: string;
  description: string;
  icon: string;
  required: boolean;
}

interface WizardSidebarProps {
  steps: StepMeta[];
  currentStep: number;
  completedSteps: number[];
  onGoToStep: (step: number) => void;
  canGoToStep: (step: number) => boolean;
}

export function WizardSidebar({
  steps,
  currentStep,
  completedSteps,
  onGoToStep,
  canGoToStep,
}: WizardSidebarProps) {
  return (
    <nav className="sticky top-24 space-y-1">
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.05em] text-muted-foreground">
        Progreso
      </p>
      {steps.map((step, index) => {
        const Icon = ICON_MAP[step.icon] ?? User;
        const isActive = index === currentStep;
        const isCompleted = completedSteps.includes(index);
        const canNavigate = canGoToStep(index);

        return (
          <button
            key={step.id}
            type="button"
            onClick={() => canNavigate && onGoToStep(index)}
            disabled={!canNavigate}
            className={clsx(
              "flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm transition-colors",
              isActive
                ? "bg-foreground/5 font-medium text-foreground"
                : isCompleted
                  ? "text-foreground/70 hover:bg-muted"
                  : canNavigate
                    ? "text-muted-foreground hover:bg-muted hover:text-foreground"
                    : "cursor-not-allowed text-muted-foreground/50"
            )}
          >
            <span
              className={clsx(
                "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold",
                isActive
                  ? "bg-foreground text-background"
                  : isCompleted
                    ? "bg-success/10 text-success"
                    : "bg-muted text-muted-foreground"
              )}
            >
              {isCompleted ? <Check className="h-3.5 w-3.5" /> : index + 1}
            </span>
            <span className="truncate">{step.shortLabel}</span>
            {!step.required && (
              <span className="ml-auto text-[10px] text-muted-foreground/60">Opcional</span>
            )}
          </button>
        );
      })}

      {/* Completion percentage */}
      <div className="mt-4 border-t border-border/40 pt-4">
        <div className="mb-1.5 flex items-center justify-between text-xs text-muted-foreground">
          <span>Completado</span>
          <span className="font-medium">
            {Math.round((completedSteps.length / steps.length) * 100)}%
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-foreground transition-all duration-500"
            style={{ width: `${(completedSteps.length / steps.length) * 100}%` }}
          />
        </div>
      </div>
    </nav>
  );
}
