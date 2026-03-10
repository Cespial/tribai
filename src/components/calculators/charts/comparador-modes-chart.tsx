"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCOP } from "@/lib/calculators/format";
import { useChartColors } from "@/lib/hooks/useChartColors";

interface ComparadorModeChartRow {
  mode: string;
  costoEmpresa: number;
  netoAnual: number;
  impuestoRenta: number;
  descuentosHastaNeto: number;
}

interface ComparadorModesChartProps {
  rows: ComparadorModeChartRow[];
}

export function ComparadorModesChart({ rows }: ComparadorModesChartProps) {
  const colors = useChartColors();

  const metricsData = rows.map((row) => ({
    mode: row.mode,
    "Costo empresa": row.costoEmpresa,
    "Neto anual": row.netoAnual,
    "Impuesto renta": row.impuestoRenta,
  }));

  const stackData = rows.map((row) => ({
    mode: row.mode,
    Neto: row.netoAnual,
    Descuentos: row.descuentosHastaNeto,
  }));

  return (
    <div className="mb-6 space-y-4">
      <div className="rounded-lg border border-border/60 bg-card p-4 shadow-sm">
        <h3 className="mb-3 text-sm font-semibold">Comparativo principal por modalidad</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={metricsData} margin={{ left: 8, right: 8 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mode" tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={(v) => `$${Math.round(v / 1_000_000)}M`} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(value) => formatCOP(Number(value ?? 0))} />
              <Legend />
              <Bar dataKey="Costo empresa" fill={colors[0]} />
              <Bar dataKey="Neto anual" fill={colors[1]} />
              <Bar dataKey="Impuesto renta" fill={colors[2]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-lg border border-border/60 bg-card p-4 shadow-sm">
        <h3 className="mb-3 text-sm font-semibold">Desde ingreso anual hasta neto final</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stackData} margin={{ left: 8, right: 8 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mode" tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={(v) => `$${Math.round(v / 1_000_000)}M`} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(value) => formatCOP(Number(value ?? 0))} />
              <Legend />
              <Bar stackId="a" dataKey="Neto" fill={colors[1]} />
              <Bar stackId="a" dataKey="Descuentos" fill={colors[3]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
