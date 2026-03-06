"use client";

import { Search } from "lucide-react";
import { useState } from "react";

const LIBROS = ["Todos", "Prelim.", "Libro I", "Libro II", "Libro III"];
const ESTADOS = ["Todos", "Vigente", "Modificado", "Derogado"];

const ARTICLES = [
  { id: "Art. 5", title: "El impuesto sobre la renta y complementarios", libro: "Libro I", estado: "vigente" as const },
  { id: "Art. 9", title: "Impuesto de las personas naturales", libro: "Libro I", estado: "vigente" as const },
  { id: "Art. 12", title: "Sociedades y entidades nacionales", libro: "Libro I", estado: "vigente" as const },
  { id: "Art. 26", title: "Los ingresos son base de la renta líquida", libro: "Libro I", estado: "vigente" as const },
  { id: "Art. 75", title: "Costo de los bienes muebles", libro: "Libro I", estado: "modificado" as const },
  { id: "Art. 115", title: "Deducción de impuestos pagados", libro: "Libro I", estado: "vigente" as const },
  { id: "Art. 240", title: "Tarifa general para personas jurídicas", libro: "Libro I", estado: "modificado" as const },
  { id: "Art. 241", title: "Tarifa para personas naturales residentes", libro: "Libro I", estado: "modificado" as const },
  { id: "Art. 437", title: "Los responsables del IVA", libro: "Libro III", estado: "vigente" as const },
  { id: "Art. 592", title: "Quiénes no están obligados a declarar", libro: "Libro I", estado: "vigente" as const },
];

function EstadoBadge({ estado }: { estado: "vigente" | "modificado" | "derogado" }) {
  const styles = {
    vigente: "bg-green-500/10 text-green-600 dark:text-green-400",
    modificado: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
    derogado: "bg-red-500/10 text-red-600 dark:text-red-400",
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium capitalize ${styles[estado]}`}>
      {estado}
    </span>
  );
}

export function AppETTab() {
  const [search, setSearch] = useState("");

  const filtered = ARTICLES.filter(
    (a) => !search || a.id.toLowerCase().includes(search.toLowerCase()) || a.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex h-full flex-col">
      {/* Nav bar */}
      <div className="shrink-0 border-b border-border bg-card/80 px-4 pb-3 pt-14 backdrop-blur-xl">
        <h1 className="mb-3 text-[28px] font-bold leading-tight tracking-tight text-foreground">
          Estatuto Tributario
        </h1>
        <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar artículos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-[14px] text-foreground outline-none placeholder:text-muted-foreground"
          />
        </div>
        {/* Filter chips */}
        <div className="scrollbar-hide mt-2.5 flex gap-2 overflow-x-auto">
          {LIBROS.map((libro) => (
            <span
              key={libro}
              className="shrink-0 rounded-full border border-border bg-card px-3 py-1.5 text-[12px] font-medium text-foreground"
            >
              {libro}
            </span>
          ))}
        </div>
        <div className="scrollbar-hide mt-2 flex gap-2 overflow-x-auto">
          {ESTADOS.map((estado) => (
            <span
              key={estado}
              className="shrink-0 rounded-full border border-border bg-card px-3 py-1.5 text-[12px] font-medium text-foreground"
            >
              {estado}
            </span>
          ))}
        </div>
      </div>

      {/* Article list */}
      <div className="flex-1 overflow-y-auto">
        <p className="px-4 py-2 text-[12px] text-muted-foreground">
          {filtered.length} artículos
        </p>
        <div className="divide-y divide-border">
          {filtered.map((article) => (
            <div key={article.id} className="flex items-start justify-between px-4 py-3 transition-colors active:bg-muted">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-values text-[14px] font-semibold text-foreground">
                    {article.id}
                  </span>
                  <EstadoBadge estado={article.estado} />
                </div>
                <p className="mt-0.5 text-[13px] leading-snug text-muted-foreground">
                  {article.title}
                </p>
                <span className="mt-1 inline-block text-[10px] text-muted-foreground">
                  {article.libro}
                </span>
              </div>
              <svg className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m9 18 6-6-6-6" />
              </svg>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
