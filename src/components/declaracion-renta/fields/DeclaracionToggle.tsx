"use client";

import { clsx } from "clsx";
import { Info } from "lucide-react";

interface DeclaracionToggleProps {
  label: string;
  pressed: boolean;
  onToggle: (pressed: boolean) => void;
  helperText?: string;
  tooltipText?: string;
  articuloET?: string;
}

export function DeclaracionToggle({
  label,
  pressed,
  onToggle,
  helperText,
  tooltipText,
  articuloET,
}: DeclaracionToggleProps) {
  return (
    <div className="flex items-start gap-3">
      <button
        type="button"
        role="switch"
        aria-checked={pressed}
        onClick={() => onToggle(!pressed)}
        className={clsx(
          "relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition-colors",
          pressed ? "bg-foreground" : "bg-muted"
        )}
      >
        <span
          className={clsx(
            "absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-background shadow transition-transform",
            pressed && "translate-x-5"
          )}
        />
      </button>
      <div>
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-medium text-foreground">{label}</span>
          {tooltipText && (
            <div className="group relative">
              <Info className="h-3.5 w-3.5 text-muted-foreground" />
              <div className="pointer-events-none absolute left-0 top-5 z-20 w-56 rounded-md border border-border bg-card p-2 text-xs text-muted-foreground opacity-0 shadow-md transition-opacity group-hover:opacity-100">
                {tooltipText}
                {articuloET && (
                  <span className="mt-1 block font-medium text-foreground">Art. {articuloET} ET</span>
                )}
              </div>
            </div>
          )}
        </div>
        {helperText && <p className="mt-0.5 text-xs text-muted-foreground">{helperText}</p>}
      </div>
    </div>
  );
}
