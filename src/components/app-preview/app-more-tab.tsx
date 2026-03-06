"use client";

import {
  Calendar,
  BarChart3,
  BookMarked,
  Scale,
  FileText,
  Compass,
  Newspaper,
  Heart,
  BarChart2,
  Share2,
} from "lucide-react";

const SECTIONS = [
  {
    title: "Herramientas",
    items: [
      { icon: Calendar, title: "Calendario Fiscal 2026", desc: "Vencimientos por NIT" },
      { icon: BarChart3, title: "Indicadores Económicos", desc: "UVT, SMLMV e inflación" },
      { icon: BookMarked, title: "Glosario Tributario", desc: "Términos de A a Z" },
      { icon: Scale, title: "Tabla de Retención", desc: "Conceptos y tarifas" },
    ],
  },
  {
    title: "Contenido",
    items: [
      { icon: FileText, title: "Doctrina DIAN", desc: "841 conceptos curados" },
      { icon: Compass, title: "Guías Interactivas", desc: "Árboles de decisión" },
      { icon: Newspaper, title: "Novedades Normativas", desc: "Últimos cambios" },
    ],
  },
  {
    title: "Personal",
    items: [{ icon: Heart, title: "Favoritos", desc: "Artículos y calculadoras" }],
  },
  {
    title: "Herramientas Avanzadas",
    items: [
      { icon: BarChart2, title: "Dashboard Analítico", desc: "Estadísticas del ET" },
      { icon: Share2, title: "Grafo de Relaciones", desc: "Artículos conectados" },
    ],
  },
];

export function AppMoreTab() {
  return (
    <div className="flex h-full flex-col">
      {/* Nav bar */}
      <div className="shrink-0 border-b border-border bg-card/80 px-4 pb-3 pt-14 backdrop-blur-xl">
        <h1 className="text-[28px] font-bold leading-tight tracking-tight text-foreground">
          Mas
        </h1>
      </div>

      {/* Sections */}
      <div className="flex-1 overflow-y-auto">
        {SECTIONS.map((section) => (
          <div key={section.title}>
            <p className="px-4 pb-1 pt-5 text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">
              {section.title}
            </p>
            <div className="divide-y divide-border">
              {section.items.map((item) => (
                <div
                  key={item.title}
                  className="flex items-center gap-3 px-4 py-3 transition-colors active:bg-muted"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-tribai-blue/10">
                    <item.icon className="h-4 w-4 text-tribai-blue" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[14px] font-medium text-foreground">{item.title}</p>
                    <p className="text-[12px] text-muted-foreground">{item.desc}</p>
                  </div>
                  <svg className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m9 18 6-6-6-6" />
                  </svg>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Footer */}
        <div className="px-4 pb-8 pt-6 text-center">
          <p className="text-[11px] text-muted-foreground">tribai.co v1.0</p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            UVT 2026: $52.374 · SMLMV: $1.750.905
          </p>
        </div>
      </div>
    </div>
  );
}
