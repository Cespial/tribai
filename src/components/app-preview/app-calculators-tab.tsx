"use client";

import { Search, Calculator, Scale, BarChart3, Receipt, Building2, Landmark, Percent, DollarSign, FileText } from "lucide-react";
import { useState } from "react";

const CATEGORIES = ["Todas", "Renta", "Retención", "IVA", "Laboral", "Sanciones"];

const CALCULATORS = [
  { icon: Calculator, title: "Renta personas naturales", desc: "Año gravable 2025", category: "Renta" },
  { icon: Scale, title: "Retención en la fuente", desc: "Salarios y servicios", category: "Retención" },
  { icon: BarChart3, title: "IVA régimen común", desc: "Declaración bimestral", category: "IVA" },
  { icon: Receipt, title: "Sanciones tributarias", desc: "Extemporaneidad y corrección", category: "Sanciones" },
  { icon: Building2, title: "Nómina completa", desc: "Costos laborales 2026", category: "Laboral" },
  { icon: Landmark, title: "SIMPLE", desc: "Régimen Simple de Tributación", category: "Renta" },
  { icon: Percent, title: "GMF (4x1000)", desc: "Gravamen a movimientos financieros", category: "Renta" },
  { icon: DollarSign, title: "Patrimonio", desc: "Impuesto al patrimonio", category: "Renta" },
  { icon: FileText, title: "¿Debo declarar?", desc: "Verificación de topes", category: "Renta" },
  { icon: Scale, title: "Retención servicios", desc: "Personas naturales", category: "Retención" },
];

export function AppCalculatorsTab() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Todas");

  const filtered = CALCULATORS.filter((c) => {
    const matchSearch = !search || c.title.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "Todas" || c.category === category;
    return matchSearch && matchCat;
  });

  return (
    <div className="flex h-full flex-col">
      {/* Nav bar */}
      <div className="shrink-0 border-b border-border bg-card/80 px-4 pb-3 pt-14 backdrop-blur-xl">
        <h1 className="mb-3 text-[28px] font-bold leading-tight tracking-tight text-foreground">
          Calculadoras
        </h1>
        {/* Search */}
        <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 focus-within:border-tribai-blue">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar calculadora..."
            aria-label="Buscar calculadora"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-[14px] text-foreground outline-none placeholder:text-muted-foreground"
          />
        </div>
        {/* Category chips */}
        <div className="scrollbar-hide mt-2.5 flex gap-2 overflow-x-auto">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-[12px] font-medium transition-colors ${
                category === cat
                  ? "bg-tribai-blue text-white"
                  : "border border-border bg-card text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="phone-scroll-area flex-1 overflow-y-auto px-4 py-4">
        <div className="grid grid-cols-2 gap-2">
          {filtered.length === 0 && (
            <p className="col-span-2 py-8 text-center text-[13px] text-muted-foreground">
              No se encontraron calculadoras.
            </p>
          )}
          {filtered.map((calc) => (
            <button
              key={calc.title}
              className="flex flex-col gap-1.5 rounded-lg border border-border bg-card p-3 text-left transition-colors hover:bg-muted active:bg-muted"
            >
              <calc.icon className="h-5 w-5 text-foreground" strokeWidth={1.6} />
              <p className="text-[13px] font-semibold leading-tight text-foreground">
                {calc.title}
              </p>
              <p className="text-[11px] leading-tight text-muted-foreground">
                {calc.desc}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
