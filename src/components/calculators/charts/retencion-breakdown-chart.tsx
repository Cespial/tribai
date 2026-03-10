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

interface RetencionBreakdownChartProps {
  monto: number;
  baseDepurada: number;
  retencion: number;
  neto: number;
  isSalarios: boolean;
}

export function RetencionBreakdownChart({
  monto,
  baseDepurada,
  retencion,
  neto,
  isSalarios,
}: RetencionBreakdownChartProps) {
  const colors = useChartColors();

  const pieData = [
    { name: "Retencion", value: Math.max(0, retencion) },
    { name: "Neto", value: Math.max(0, neto) },
  ];

  const stackedData = [
    {
      name: isSalarios ? "Ingreso salarial" : "Pago",
      base: Math.max(0, baseDepurada),
      retencion: Math.max(0, retencion),
      resto: Math.max(0, monto - baseDepurada),
    },
  ];

  return (
    <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
      <div className="rounded-lg border border-border/60 bg-card p-4 shadow-sm">
        <h3 className="mb-3 text-sm font-semibold">Retenido vs neto a pagar</h3>
        <div className="h-60">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={45} outerRadius={88}>
                {pieData.map((_, index) => (
                  <Cell key={`ret-cell-${index}`} fill={index === 0 ? colors[0] : colors[3]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCOP(Number(value ?? 0))} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-lg border border-border/60 bg-card p-4 shadow-sm">
        <h3 className="mb-3 text-sm font-semibold">Base depurada y retencion aplicada</h3>
        <div className="h-60">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stackedData} margin={{ left: 8, right: 8 }}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={(v) => `$${Math.round(v / 1_000_000)}M`} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(value) => formatCOP(Number(value ?? 0))} />
              <Bar stackId="a" dataKey="resto" fill={colors[3]} name="Parte no depurada" />
              <Bar stackId="a" dataKey="base" fill={colors[2]} name="Base depurada" />
              <Bar stackId="a" dataKey="retencion" fill={colors[0]} name="Retencion" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
