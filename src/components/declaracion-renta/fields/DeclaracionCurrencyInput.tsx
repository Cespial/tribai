"use client";

import { useState, useCallback } from "react";
import { clsx } from "clsx";
import { Info } from "lucide-react";

interface DeclaracionCurrencyInputProps {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  helperText?: string;
  articuloET?: string;
  tooltipText?: string;
  uvtEquivalent?: number;
  error?: string;
  disabled?: boolean;
  placeholder?: string;
}

function formatDisplay(value: number): string {
  if (value === 0) return "";
  return value.toLocaleString("es-CO");
}

function parseInput(raw: string): number {
  const cleaned = raw.replace(/[^\d]/g, "");
  return Number(cleaned) || 0;
}

export function DeclaracionCurrencyInput({
  id,
  label,
  value,
  onChange,
  helperText,
  articuloET,
  tooltipText,
  uvtEquivalent,
  error,
  disabled,
  placeholder = "0",
}: DeclaracionCurrencyInputProps) {
  const [focused, setFocused] = useState(false);
  const [displayValue, setDisplayValue] = useState(formatDisplay(value));

  const handleFocus = useCallback(() => {
    setFocused(true);
    setDisplayValue(value === 0 ? "" : String(value));
  }, [value]);

  const handleBlur = useCallback(() => {
    setFocused(false);
    setDisplayValue(formatDisplay(value));
  }, [value]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      if (focused) {
        setDisplayValue(raw);
        onChange(parseInput(raw));
      } else {
        const parsed = parseInput(raw);
        onChange(parsed);
        setDisplayValue(formatDisplay(parsed));
      }
    },
    [focused, onChange]
  );

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
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
          $
        </span>
        <input
          id={id}
          type="text"
          inputMode="numeric"
          value={focused ? displayValue : formatDisplay(value)}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          placeholder={placeholder}
          className={clsx(
            "h-12 w-full rounded border bg-card pl-7 pr-3 text-sm outline-none transition-colors duration-200",
            "focus:border-foreground focus:ring-2 focus:ring-foreground/20",
            error
              ? "border-destructive focus:ring-destructive/20"
              : "border-border",
            disabled && "cursor-not-allowed opacity-50"
          )}
        />
      </div>
      <div className="mt-1 flex items-center justify-between">
        {(helperText || error) && (
          <p className={clsx("text-xs", error ? "text-destructive" : "text-muted-foreground")}>
            {error ?? helperText}
          </p>
        )}
        {uvtEquivalent !== undefined && value > 0 && (
          <p className="text-xs font-medium text-muted-foreground">
            ≈ {uvtEquivalent.toLocaleString("es-CO", { maximumFractionDigits: 1 })} UVT
          </p>
        )}
      </div>
    </div>
  );
}
