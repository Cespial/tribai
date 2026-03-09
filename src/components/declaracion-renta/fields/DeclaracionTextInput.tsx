"use client";

import { clsx } from "clsx";

interface DeclaracionTextInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  helperText?: string;
  disabled?: boolean;
  type?: "text" | "email" | "tel";
}

export function DeclaracionTextInput({
  id,
  label,
  value,
  onChange,
  placeholder,
  helperText,
  disabled,
  type = "text",
}: DeclaracionTextInputProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block text-xs font-medium uppercase tracking-[0.05em] text-muted-foreground"
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
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
