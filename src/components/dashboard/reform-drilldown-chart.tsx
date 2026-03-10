"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface ReformYearEntry {
  year: number;
  total: number;
  laws: Array<{ name: string; count: number }>;
}

interface ReformDrilldownChartProps {
  data: ReformYearEntry[];
  selectedYear: number | null;
  onYearSelect: (year: number) => void;
}

export function ReformDrilldownChart({
  data,
  selectedYear,
  onYearSelect,
}: ReformDrilldownChartProps) {
  const selected = data.find((entry) => entry.year === selectedYear) || data[data.length - 1];
  const laws = (selected?.laws || []).slice(0, 10);

  return (
    <div className="rounded-lg border border-border/60 bg-card p-4 shadow-sm">
      <h3 className="heading-serif mb-4 text-lg">Reformas por año (drill-down)</h3>

      <div className="mb-5 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="year" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
            <YAxis tick={{ fontSize: 11 }} className="fill-muted-foreground" />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--background)",
                border: "1px solid var(--border)",
                borderRadius: "0.5rem",
                fontSize: "0.75rem",
              }}
              formatter={(value) => [String(value ?? 0), "Eventos de reforma"]}
            />
            <Bar
              dataKey="total"
              radius={[4, 4, 0, 0]}
              onClick={(entry) => {
                const payload = entry?.payload as ReformYearEntry | undefined;
                if (typeof payload?.year === "number") onYearSelect(payload.year);
              }}
            >
              {data.map((entry) => (
                <Cell
                  key={entry.year}
                  fill={
                    selectedYear === entry.year
                      ? "var(--foreground)"
                      : "var(--muted-foreground)"
                  }
                  className="cursor-pointer"
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-md border border-border/60 bg-muted/20 p-3">
        <p className="mb-2 text-xs uppercase tracking-[0.05em] text-muted-foreground">
          Leyes y decretos en {selected?.year || "N/A"}
        </p>
        {laws.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Sin detalle de leyes para el rango actual.
          </p>
        ) : (
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={laws}
                layout="vertical"
                margin={{ top: 4, right: 8, left: 0, bottom: 4 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={160}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--background)",
                    border: "1px solid var(--border)",
                    borderRadius: "0.5rem",
                    fontSize: "0.75rem",
                  }}
                  formatter={(value) => [String(value ?? 0), "Impactos"]}
                />
                <Bar dataKey="count" fill="var(--foreground)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
