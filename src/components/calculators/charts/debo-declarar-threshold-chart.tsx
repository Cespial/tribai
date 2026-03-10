"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useChartColors } from "@/lib/hooks/useChartColors";

interface ThresholdRow {
  name: string;
  value: number;
  limit: number;
}

interface DeboDeclararThresholdChartProps {
  rows: ThresholdRow[];
}

export function DeboDeclararThresholdChart({
  rows,
}: DeboDeclararThresholdChartProps) {
  const colors = useChartColors();
  const data = rows.map((row) => ({
    name: row.name,
    pct: row.limit > 0 ? (row.value / row.limit) * 100 : 0,
  }));

  return (
    <div className="mb-6 rounded-lg border border-border/60 bg-card p-4 shadow-sm">
      <h3 className="mb-3 text-sm font-semibold">Que tan cerca esta de cada tope legal</h3>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 10, bottom: 10, left: 10, right: 40 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" tickFormatter={(v) => `${Math.round(v)}%`} />
            <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 11 }} />
            <Tooltip formatter={(value) => `${Number(value ?? 0).toFixed(1)}% del tope`} />
            <ReferenceLine x={100} stroke={colors[0]} strokeDasharray="5 5" label="Tope legal" />
            <Bar dataKey="pct" fill={colors[1]} radius={[0, 4, 4, 0]}>
              <LabelList dataKey="pct" position="right" formatter={(value) => `${Number(value ?? 0).toFixed(0)}%`} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
