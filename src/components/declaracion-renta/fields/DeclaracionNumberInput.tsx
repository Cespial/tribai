"use client";

import { clsx } from "clsx";
import { Info } from "lucide-react";

interface DeclaracionNumberInputProps {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  helperText?: string;
  tooltipText?: string;
  disabled?: boolean;
}

export function DeclaracionNumberInput({
  id,
  label,
  value,
  onChange,
  min = 0,
  max,
  helperText,
  tooltipText,
  disabled,
}: DeclaracionNumberInputProps) {
  return (
    <div>
      <div className="mb-1.5 flex items-center gap-1.5">
        <label
          htmlFor={id}
          className="block text-xs font-medium uppercase tracking-[0.05em] text-muted-foreground"
        >
          {label}
        </label>
        {tooltipText && (
          <div className="group relative">
            <Info className="h-3.5 w-3.5 text-muted-foreground" />
            <div className="pointer-events-none absolute left-0 top-5 z-20 w-56 rounded-md border border-border bg-card p-2 text-xs text-muted-foreground opacity-0 shadow-md transition-opacity group-hover:opacity-100">
              {tooltipText}
            </div>
          </div>
        )}
      </div>
      <input
        id={id}
        type="number"
        inputMode="numeric"
        value={value}
        onChange={(e) => {
          let v = Number(e.target.value) || 0;
          if (v < min) v = min;
          if (max !== undefined && v > max) v = max;
          onChange(v);
        }}
        min={min}
        max={max}
        disabled={disabled}
        className={clsx(
          "h-12 w-full rounded border border-border bg-card px-3 text-sm outline-none transition-colors duration-200",
          "focus:border-foreground focus:ring-2 focus:ring-foreground/20",
          disabled && "cursor-not-allowed opacity-50"
        )}
      />
      {helperText && <p className="mt-1 text-xs text-muted-foreground">{helperText}</p>}
    </div>
  );
}
