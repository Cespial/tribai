"use client";

import { memo } from "react";
import { clsx } from "clsx";

interface ConfidenceBadgeProps {
  confidenceLevel: "high" | "medium" | "low";
  sourcesCount: number;
  pipelineMs?: number;
  degradedMode?: boolean;
}

const CONFIDENCE_DOT: Record<string, string> = {
  high: "bg-green-500",
  medium: "bg-yellow-500",
  low: "bg-red-500",
};

const CONFIDENCE_LABEL: Record<string, string> = {
  high: "Evidencia alta",
  medium: "Evidencia media",
  low: "Evidencia limitada",
};

function ConfidenceBadgeInner({
  confidenceLevel,
  sourcesCount,
  pipelineMs,
  degradedMode,
}: ConfidenceBadgeProps) {
  const latencyLabel = pipelineMs != null ? `${(pipelineMs / 1000).toFixed(1)}s` : null;

  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-0.5 text-xs font-medium text-foreground",
        degradedMode && "opacity-70"
      )}
    >
      <span
        className={clsx(
          "h-1.5 w-1.5 rounded-full",
          CONFIDENCE_DOT[confidenceLevel]
        )}
      />
      {CONFIDENCE_LABEL[confidenceLevel]}
      <span className="text-muted-foreground">
        · {sourcesCount} {sourcesCount === 1 ? "fuente" : "fuentes"}
        {latencyLabel && ` · ${latencyLabel}`}
      </span>
    </span>
  );
}

export const ConfidenceBadge = memo(ConfidenceBadgeInner);
