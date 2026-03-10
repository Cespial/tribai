"use client";

import { clsx } from "clsx";
import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { ResponsiveContainer, Tooltip, Treemap } from "recharts";

interface LibroEntry {
  name: string;
  value: number;
}

interface LibroTreemapChartProps {
  data: LibroEntry[];
  selectedLibro?: string | null;
  onSelect?: (name: string | null) => void;
}

const COLORS_LIGHT = [
  "hsl(0,0%,10%)", "hsl(0,0%,18%)", "hsl(0,0%,28%)", "hsl(0,0%,36%)",
  "hsl(0,0%,46%)", "hsl(0,0%,56%)", "hsl(0,0%,66%)",
];
const COLORS_DARK = [
  "hsl(0,0%,90%)", "hsl(0,0%,80%)", "hsl(0,0%,70%)", "hsl(0,0%,60%)",
  "hsl(0,0%,50%)", "hsl(0,0%,40%)", "hsl(0,0%,30%)",
];

const sub = () => () => {};

export function LibroTreemapChart({ data, selectedLibro, onSelect }: LibroTreemapChartProps) {
  const { resolvedTheme } = useTheme();
  const mounted = useSyncExternalStore(sub, () => true, () => false);
  const COLORS = mounted && resolvedTheme === "dark" ? COLORS_DARK : COLORS_LIGHT;

  const payload = data.map((entry, index) => ({
    ...entry,
    fill: COLORS[index % COLORS.length],
  }));

  return (
    <div className="rounded-lg border border-border/60 bg-card p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="heading-serif text-lg">Distribución por libro</h3>
        {selectedLibro && (
          <button
            onClick={() => onSelect?.(null)}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Limpiar filtro
          </button>
        )}
      </div>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <Treemap
            data={payload}
            dataKey="value"
            aspectRatio={4 / 3}
            stroke="var(--border)"
            fill="var(--muted-foreground)"
            onClick={(node) => {
              if (node && node.name) {
                onSelect?.(node.name === selectedLibro ? null : node.name);
              }
            }}
          >
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--background)",
                border: "1px solid var(--border)",
                borderRadius: "0.5rem",
                fontSize: "0.75rem",
              }}
              formatter={(value) => [String(value ?? 0), "Artículos"]}
            />
          </Treemap>
        </ResponsiveContainer>
      </div>
      <div className="mt-3 grid gap-1 text-xs text-muted-foreground sm:grid-cols-2">
        {payload.map((entry) => (
          <button
            key={entry.name}
            onClick={() => onSelect?.(entry.name === selectedLibro ? null : entry.name)}
            className={clsx(
              "flex items-center gap-1.5 text-left transition-opacity",
              selectedLibro && selectedLibro !== entry.name && "opacity-40"
            )}
          >
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: entry.fill }}
            />
            <span className={clsx(selectedLibro === entry.name && "font-bold text-foreground")}>
              {entry.name}: {entry.value}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
