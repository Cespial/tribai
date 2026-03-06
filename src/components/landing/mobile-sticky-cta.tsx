"use client";

import { useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";

export function MobileStickyCta() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 animate-in slide-in-from-bottom border-t border-border bg-background p-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] md:hidden">
      <button
        onClick={() => setIsVisible(false)}
        className="absolute -top-12 right-3 flex h-11 w-11 items-center justify-center rounded-lg border border-border bg-background text-foreground"
        aria-label="Cerrar barra fija"
      >
        <X className="h-4 w-4" />
      </button>
      <div className="mx-auto flex max-w-md gap-2">
        <Link
          href="/asistente"
          className="inline-flex h-12 flex-1 items-center justify-center rounded-[10px] bg-tribai-blue px-4 text-sm font-semibold text-white active:scale-[0.98] transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
        >
          Preguntarle a la IA
        </Link>
        <Link
          href="/calculadoras"
          className="inline-flex h-12 flex-1 items-center justify-center rounded-[10px] border border-border bg-card px-4 text-sm font-semibold text-foreground active:scale-[0.98] transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
        >
          Calculadoras
        </Link>
      </div>
    </div>
  );
}
