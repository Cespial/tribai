"use client";

import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCOP } from "@/lib/calculators/format";
import { useChartColors } from "@/lib/hooks/useChartColors";

interface RentaSegment {
  name: string;
  value: number;
}

interface RentaBreakdownChartProps {
  segments: RentaSegment[];
  ingresoBruto: number;
  deduccionesAplicadas: number;
  impuesto: number;
}

export function RentaBreakdownChart({
  segments,
  ingresoBruto,
  deduccionesAplicadas,
  impuesto,
}: RentaBreakdownChartProps) {
  const colors = useChartColors();
  const stackedData = [
    {
      name: "Desglose",
      deducciones: Math.max(0, deduccionesAplicadas),
      impuesto: Math.max(0, impuesto),
      disponible: Math.max(0, ingresoBruto - deduccionesAplicadas - impuesto),
    },
  ];

  return (
    <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
      <div className="rounded-lg border border-border/60 bg-card p-4 shadow-sm">
        <h3 className="mb-3 text-sm font-semibold">Composicion del impuesto por tramos</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={segments} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90}>
                {segments.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCOP(Number(value ?? 0))} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-lg border border-border/60 bg-card p-4 shadow-sm">
        <h3 className="mb-3 text-sm font-semibold">Ingreso bruto: que se descuenta y que queda</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stackedData} margin={{ left: 8, right: 8 }}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={(v) => `$${Math.round(v / 1_000_000)}M`} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(value) => formatCOP(Number(value ?? 0))} />
              <Bar stackId="a" dataKey="disponible" fill={colors[3]} name="Ingreso disponible" />
              <Bar stackId="a" dataKey="deducciones" fill={colors[2]} name="Deducciones + exentas" />
              <Bar stackId="a" dataKey="impuesto" fill={colors[0]} name="Impuesto" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
