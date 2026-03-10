"use client";

import { CheckCircle2 } from "lucide-react";
import { clsx } from "clsx";

interface ToastProps {
  message: string;
  visible: boolean;
}

export function Toast({ message, visible }: ToastProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={clsx(
        "pointer-events-none fixed bottom-[calc(env(safe-area-inset-bottom,0px)+1.25rem)] right-5 z-[100] flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 shadow-sm transition-all duration-300 dark:border-emerald-800/60 dark:bg-emerald-900/40 dark:text-emerald-200",
        visible ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
      )}
    >
      <CheckCircle2 className="h-4 w-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

