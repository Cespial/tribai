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

interface NominaCostChartProps {
  salario: number;
  auxilio: number;
  ssParafiscales: number;
  prestaciones: number;
  netoTrabajador: number;
  descuentosTrabajador: number;
}

export function NominaCostChart({
  salario,
  auxilio,
  ssParafiscales,
  prestaciones,
  netoTrabajador,
  descuentosTrabajador,
}: NominaCostChartProps) {
  const colors = useChartColors();

  const employerData = [
    {
      name: "Costo mensual",
      salario: Math.max(0, salario),
      auxilio: Math.max(0, auxilio),
      ss: Math.max(0, ssParafiscales),
      prestaciones: Math.max(0, prestaciones),
    },
  ];

  const workerData = [
    { name: "Neto trabajador", value: Math.max(0, netoTrabajador) },
    { name: "Deducciones", value: Math.max(0, descuentosTrabajador) },
  ];

  return (
    <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
      <div className="rounded-lg border border-border/60 bg-card p-4 shadow-sm">
        <h3 className="mb-3 text-sm font-semibold">Desglose del costo empresa</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
              <BarChart data={employerData} margin={{ left: 8, right: 8 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={(v) => `$${Math.round(v / 1_000_000)}M`} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(value) => formatCOP(Number(value ?? 0))} />
                <Bar stackId="a" dataKey="salario" fill={colors[0]} name="Salario" />
                <Bar stackId="a" dataKey="auxilio" fill={colors[1]} name="Auxilio transporte" />
                <Bar stackId="a" dataKey="ss" fill={colors[2]} name="SS y parafiscales" />
              <Bar stackId="a" dataKey="prestaciones" fill={colors[3]} name="Prestaciones" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-lg border border-border/60 bg-card p-4 shadow-sm">
        <h3 className="mb-3 text-sm font-semibold">Distribucion neto vs deducciones trabajador</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={workerData} dataKey="value" nameKey="name" innerRadius={45} outerRadius={88}>
                {workerData.map((_, index) => (
                  <Cell key={`nom-cell-${index}`} fill={index === 0 ? colors[0] : colors[3]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCOP(Number(value ?? 0))} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
