"use client";

import {
  MessageCircle,
  Calculator,
  BookOpen,
  Calendar,
  Scale,
  BarChart3,
  Compass,
  BookMarked,
} from "lucide-react";

type AppTab = "home" | "chat" | "calculators" | "et" | "more";

interface Props {
  onNavigate: (tab: AppTab) => void;
}

const QUICK_CALCS = [
  { icon: Calculator, title: "Renta" },
  { icon: Scale, title: "Retención" },
  { icon: BarChart3, title: "IVA" },
  { icon: Calculator, title: "Sanciones" },
];

const FEATURES: {
  icon: typeof MessageCircle;
  title: string;
  description: string;
  tab: AppTab;
}[] = [
  {
    icon: MessageCircle,
    title: "Asistente IA",
    description: "Consulte con fuentes",
    tab: "chat",
  },
  {
    icon: Calculator,
    title: "Calculadoras",
    description: "35 calculadoras 2026",
    tab: "calculators",
  },
  {
    icon: BookOpen,
    title: "Estatuto",
    description: "1.294 artículos",
    tab: "et",
  },
  {
    icon: Calendar,
    title: "Calendario",
    description: "Vencimientos DIAN",
    tab: "more",
  },
  {
    icon: Compass,
    title: "Doctrina",
    description: "841 conceptos",
    tab: "more",
  },
  {
    icon: BookMarked,
    title: "Guías",
    description: "Paso a paso",
    tab: "more",
  },
];

function formatCOP(n: number) {
  return "$" + n.toLocaleString("es-CO");
}

export function AppHomeTab({ onNavigate }: Props) {
  return (
    <div className="px-4 pb-6 pt-14">
      {/* iOS-style large title */}
      <h1 className="mb-4 text-[28px] font-bold leading-tight tracking-tight text-foreground">
        Tribai
      </h1>

      {/* Tax constants header */}
      <div className="mb-4">
        <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Constantes 2026
        </p>
        <div className="flex gap-2">
          <div className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5">
            <span className="text-[11px] text-muted-foreground">UVT</span>
            <span className="font-values text-[13px] font-semibold text-foreground">
              {formatCOP(52374)}
            </span>
          </div>
          <div className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5">
            <span className="text-[11px] text-muted-foreground">SMLMV</span>
            <span className="font-values text-[13px] font-semibold text-foreground">
              {formatCOP(1750905)}
            </span>
          </div>
        </div>
      </div>

      {/* Quick access calculators — horizontal scroll */}
      <div className="relative mb-5">
        <h2 className="mb-2 text-lg font-semibold text-foreground">Acceso rápido</h2>
        <div className="scrollbar-hide flex gap-2 overflow-x-auto">
          {QUICK_CALCS.map((calc) => (
            <button
              key={calc.title}
              onClick={() => onNavigate("calculators")}
              className="flex shrink-0 items-center gap-2 rounded-lg border border-border bg-card px-3.5 py-2.5 transition-colors hover:bg-muted active:bg-muted"
            >
              <calc.icon className="h-3.5 w-3.5 text-foreground" />
              <span className="text-[13px] font-medium text-foreground">{calc.title}</span>
            </button>
          ))}
        </div>
        <div className="pointer-events-none absolute right-0 top-8 h-10 w-6 bg-gradient-to-l from-white to-transparent" />
      </div>

      {/* Key indicators */}
      <div className="mb-5 grid grid-cols-2 gap-2">
        <div className="rounded-lg border border-border bg-card p-3">
          <p className="text-[11px] text-muted-foreground">Auxilio Transporte</p>
          <p className="font-values mt-0.5 text-[14px] font-semibold text-foreground">
            {formatCOP(249095)}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-3">
          <p className="text-[11px] text-muted-foreground">Sanción Mínima</p>
          <p className="font-values mt-0.5 text-[14px] font-semibold text-foreground">
            {formatCOP(523740)}
          </p>
        </div>
      </div>

      {/* Features grid */}
      <h2 className="mb-3 text-lg font-semibold text-foreground">Herramientas</h2>
      <div className="grid grid-cols-2 gap-2">
        {FEATURES.map((feature) => (
          <button
            key={feature.title}
            onClick={() => onNavigate(feature.tab)}
            className="flex flex-col items-start gap-2 rounded-lg border border-border bg-card p-3.5 text-left transition-colors hover:bg-muted active:bg-muted"
          >
            <feature.icon className="h-6 w-6 text-foreground" strokeWidth={1.6} />
            <div>
              <p className="text-[14px] font-semibold leading-tight text-foreground">
                {feature.title}
              </p>
              <p className="mt-0.5 text-[11px] leading-tight text-muted-foreground">
                {feature.description}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
