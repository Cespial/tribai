"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRightLeft, ExternalLink } from "lucide-react";
import { clsx } from "clsx";

interface UvtCopInlineCalculatorProps {
  uvtValue: number;
}

function formatCOP(value: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}

function parseAmount(raw: string): number {
  if (!raw) return 0;
  return Number(raw.replace(/[^\d.,-]/g, "").replace(",", ".")) || 0;
}

export function UvtCopInlineCalculator({ uvtValue }: UvtCopInlineCalculatorProps) {
  const [mode, setMode] = useState<"uvt-to-cop" | "cop-to-uvt">("uvt-to-cop");
  const [input, setInput] = useState("");

  const amount = parseAmount(input);
  const result = mode === "uvt-to-cop" ? amount * uvtValue : amount / uvtValue;

  return (
    <section className="rounded-lg border border-border/60 bg-card p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
        <h3 className="font-semibold text-foreground">Calculadora rápida UVT ↔ Pesos</h3>
      </div>

      <div className="mb-4 inline-flex rounded-md border border-border bg-background p-1">
        <button
          type="button"
          onClick={() => {
            setMode("uvt-to-cop");
            setInput("");
          }}
          className={clsx(
            "rounded px-3 py-1.5 text-xs font-medium sm:text-sm",
            mode === "uvt-to-cop"
              ? "bg-foreground text-background"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          UVT → COP
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("cop-to-uvt");
            setInput("");
          }}
          className={clsx(
            "rounded px-3 py-1.5 text-xs font-medium sm:text-sm",
            mode === "cop-to-uvt"
              ? "bg-foreground text-background"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          COP → UVT
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium uppercase tracking-[0.05em] text-muted-foreground">
            {mode === "uvt-to-cop" ? "Ingrese valor en UVT" : "Ingrese valor en pesos"}
          </label>
          <input
            type="text"
            inputMode="decimal"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder={mode === "uvt-to-cop" ? "Ej: 120" : "Ej: 1500000"}
            className="h-11 w-full rounded border border-border bg-background px-3 text-sm outline-none focus:border-foreground/40 focus:ring-1 focus:ring-foreground/20"
          />
        </div>
        <div>
          <p className="mb-1 text-xs font-medium uppercase tracking-[0.05em] text-muted-foreground">Resultado</p>
          <div className="flex h-11 items-center rounded border border-border bg-muted/30 px-3 text-sm font-semibold text-foreground">
            {input
              ? mode === "uvt-to-cop"
                ? formatCOP(result)
                : `${result.toLocaleString("es-CO", { maximumFractionDigits: 2 })} UVT`
              : "—"}
          </div>
        </div>
      </div>

      <p className="mt-3 text-xs text-muted-foreground">UVT usada para el cálculo: {formatCOP(uvtValue)}</p>
      <Link
        href="/calculadoras/uvt"
        className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-foreground underline underline-offset-2 decoration-border hover:decoration-foreground"
      >
        Abrir conversor completo
        <ExternalLink className="h-3 w-3" />
      </Link>
    </section>
  );
}

