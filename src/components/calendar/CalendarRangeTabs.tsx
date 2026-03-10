"use client";

import { clsx } from "clsx";
import { CALENDARIO_FISCAL_YEAR } from "@/config/calendario-data";

export type CalendarRangeFilter = "semana" | "proximos30" | "mes" | "trimestre" | "anio";

interface CalendarRangeTabsProps {
  value: CalendarRangeFilter;
  onChange: (value: CalendarRangeFilter) => void;
}

const OPTIONS: Array<{ value: CalendarRangeFilter; label: string }> = [
  { value: "semana", label: "Próxima semana" },
  { value: "proximos30", label: "Próximos 30 días" },
  { value: "mes", label: "Este mes" },
  { value: "trimestre", label: "Trimestre" },
  { value: "anio", label: String(CALENDARIO_FISCAL_YEAR) },
];

export function CalendarRangeTabs({ value, onChange }: CalendarRangeTabsProps) {
  return (
    <div className="inline-flex rounded-md border border-border bg-card p-1">
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={clsx(
            "rounded px-3 py-1.5 text-xs font-medium transition-colors sm:text-sm",
            value === option.value
              ? "bg-foreground text-background"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

