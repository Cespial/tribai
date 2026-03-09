"use client";

import { clsx } from "clsx";
import { Info } from "lucide-react";

interface DeclaracionSelectProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  helperText?: string;
  tooltipText?: string;
  articuloET?: string;
  disabled?: boolean;
}

export function DeclaracionSelect({
  id,
  label,
  value,
  onChange,
  options,
  helperText,
  tooltipText,
  articuloET,
  disabled,
}: DeclaracionSelectProps) {
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
              {articuloET && (
                <span className="mt-1 block font-medium text-foreground">
                  Art. {articuloET} ET
                </span>
              )}
            </div>
          </div>
        )}
      </div>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={clsx(
          "h-12 w-full rounded border border-border bg-card px-3 text-sm outline-none transition-colors duration-200",
          "focus:border-foreground focus:ring-2 focus:ring-foreground/20",
          disabled && "cursor-not-allowed opacity-50"
        )}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {helperText && <p className="mt-1 text-xs text-muted-foreground">{helperText}</p>}
    </div>
  );
}
