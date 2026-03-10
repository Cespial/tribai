"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

interface LibroEntry {
  name: string;
  value: number;
}

interface LibroDistributionChartProps {
  data: LibroEntry[];
}

const COLORS_LIGHT = [
  "hsl(0, 0%, 15%)", "hsl(0, 0%, 30%)", "hsl(0, 0%, 45%)", "hsl(0, 0%, 55%)",
  "hsl(0, 0%, 65%)", "hsl(0, 0%, 75%)", "hsl(0, 0%, 85%)",
];
const COLORS_DARK = [
  "hsl(0, 0%, 90%)", "hsl(0, 0%, 75%)", "hsl(0, 0%, 60%)", "hsl(0, 0%, 50%)",
  "hsl(0, 0%, 40%)", "hsl(0, 0%, 30%)", "hsl(0, 0%, 20%)",
];

const sub = () => () => {};

export function LibroDistributionChart({ data }: LibroDistributionChartProps) {
  const { resolvedTheme } = useTheme();
  const mounted = useSyncExternalStore(sub, () => true, () => false);
  const COLORS = mounted && resolvedTheme === "dark" ? COLORS_DARK : COLORS_LIGHT;
  return (
    <div className="rounded-lg border border-border/60 bg-card p-4 shadow-sm">
      <h3 className="heading-serif mb-4 text-lg">Distribucion por Libro</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={90}
              paddingAngle={2}
              dataKey="value"
              label={({ name, percent }: { name?: string | number; percent?: number }) =>
                `${String(name || "").split(" - ")[0]} (${((percent || 0) * 100).toFixed(0)}%)`
              }
              labelLine={false}
            >
              {data.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--background)",
                border: "1px solid var(--border)",
                borderRadius: "0.5rem",
                fontSize: "0.75rem",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      {/* Legend below */}
      <div className="mt-2 flex flex-wrap justify-center gap-3">
        {data.map((entry, i) => (
          <div key={entry.name} className="flex items-center gap-1.5 text-xs">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: COLORS[i % COLORS.length] }}
            />
            <span className="text-muted-foreground">
              {entry.name}: {entry.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
