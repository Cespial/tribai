"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Search,
  BookOpen,
  ExternalLink,
  Hash,
  ChevronRight,
  Sparkles,
  Calculator,
  Info,
  Sigma,
  Workflow,
  ClipboardList,
  ShieldAlert,
  Briefcase,
} from "lucide-react";
import { clsx } from "clsx";
import { ReferencePageLayout } from "@/components/layout/ReferencePageLayout";
import { RelatedResourcesRail } from "@/components/knowledge/RelatedResourcesRail";
import { InteractiveTaxText } from "@/components/knowledge/InteractiveTaxText";
import {
  getFrequentGlossaryTerms,
  getRelatedResourcesForTerm,
  getTermOfTheDay,
  searchGlossaryTerms,
} from "@/lib/knowledge/knowledge-index";
import type { CategoriaConocimiento, GlosarioTermEnriched } from "@/types/knowledge";

const CATEGORY_ICON: Record<CategoriaConocimiento, typeof BookOpen> = {
  renta: Briefcase,
  iva: Calculator,
  retencion: ClipboardList,
  procedimiento: Workflow,
  laboral: Info,
  sanciones: ShieldAlert,
  general: BookOpen,
};

const CATEGORY_STYLES: Record<CategoriaConocimiento, string> = {
  renta: "bg-amber-100/70 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200",
  iva: "bg-sky-100/70 text-sky-800 dark:bg-sky-900/40 dark:text-sky-200",
  retencion: "bg-rose-100/70 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200",
  procedimiento: "bg-violet-100/70 text-violet-800 dark:bg-violet-900/40 dark:text-violet-200",
  laboral: "bg-teal-100/70 text-teal-800 dark:bg-teal-900/40 dark:text-teal-200",
  sanciones: "bg-red-100/70 text-red-800 dark:bg-red-900/40 dark:text-red-200",
  general: "bg-muted text-foreground",
};

const LEVEL_LABEL: Record<GlosarioTermEnriched["nivel"], string> = {
  basico: "Básico",
  intermedio: "Intermedio",
  avanzado: "Avanzado",
};

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function computeAndPersistStreakDays(): number {
  if (typeof window === "undefined") return 1;

  const today = new Date();
  const todayKey = today.toISOString().slice(0, 10);
  const lastSeen = localStorage.getItem("tc_glosario_last_seen_date");
  const previousStreak = Number(localStorage.getItem("tc_glosario_streak_days") ?? "0");

  if (lastSeen === todayKey) {
    return previousStreak || 1;
  }

  let nextStreak = 1;
  if (lastSeen) {
    const lastDate = new Date(`${lastSeen}T00:00:00`);
    const dayDiff = Math.floor((today.getTime() - lastDate.getTime()) / 86_400_000);
    nextStreak = dayDiff === 1 ? previousStreak + 1 : 1;
  }

  localStorage.setItem("tc_glosario_last_seen_date", todayKey);
  localStorage.setItem("tc_glosario_streak_days", String(nextStreak));
  return nextStreak;
}

function HighlightText({ text, highlight }: { text: string; highlight: string }) {
  if (!highlight.trim()) return <>{text}</>;

  const safeHighlight = escapeRegExp(highlight.trim());
  const parts = text.split(new RegExp(`(${safeHighlight})`, "gi"));

  return (
    <span>
      {parts.map((part, i) =>
        part.toLowerCase() === highlight.toLowerCase() ? (
          <mark
            key={i}
            className="rounded bg-foreground/10 px-0.5 text-foreground dark:bg-foreground/20"
          >
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  );
}

function FormulaBlock({ term }: { term: GlosarioTermEnriched }) {
  if (!term.formula) return null;

  return (
    <div className="rounded-lg border border-border/60 bg-muted/40 p-4">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <Sigma className="h-3.5 w-3.5" />
          Fórmula Matemática
        </div>
        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
          TAX-MATH v1
        </span>
      </div>
      
      <div className="my-3 flex items-center justify-center rounded-lg bg-card/50 py-4 shadow-inner">
        <p className="heading-serif text-lg font-medium text-foreground tracking-tight sm:text-xl">
          {term.formula.expresion.split("=").map((part, i) => (
            <span key={i}>
              {i > 0 && <span className="mx-2 text-primary">=</span>}
              {part.trim().split(" ").map((word, j) => {
                if (["*", "/", "+", "-"].includes(word)) {
                  return <span key={j} className="mx-1 text-primary font-bold">{word === "*" ? "×" : word}</span>;
                }
                return <span key={j} className={clsx(i === 0 ? "text-foreground" : "text-foreground/80")}>{word} </span>;
              })}
            </span>
          ))}
        </p>
      </div>

      <div className="space-y-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">Lectura</p>
          <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{term.formula.lectura}</p>
        </div>
        
        {term.formula.variables.length > 0 && (
          <div className="grid grid-cols-2 gap-2 border-t border-border/40 pt-2">
            {term.formula.variables.map((item) => (
              <div key={item.simbolo} className="flex flex-col">
                <span className="font-mono text-[10px] font-bold text-primary">{item.simbolo}</span>
                <span className="text-[10px] text-muted-foreground leading-tight">{item.significado}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function DiagramBlock({ term }: { term: GlosarioTermEnriched }) {
  if (!term.diagrama) return null;
  const diagram = term.diagrama;

  return (
    <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
      <div className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        <Workflow className="h-3.5 w-3.5" />
        Flujo de Proceso
      </div>
      
      <div className="relative flex flex-col gap-4">
        {diagram.nodos.map((node, index) => (
          <div key={node.id} className="group/node relative flex items-center gap-3">
            <div className="relative z-10 flex h-7 w-7 items-center justify-center rounded-full border-2 border-primary/30 bg-card text-[10px] font-bold text-primary shadow-sm transition-colors group-hover/node:border-primary group-hover/node:bg-primary group-hover/node:text-primary-foreground">
              {index + 1}
            </div>
            <div className="flex-1 rounded-lg border border-border/50 bg-card/80 p-2 shadow-sm transition-all group-hover/node:border-primary/40 group-hover/node:bg-card">
              <span className="text-xs font-medium text-foreground">{node.etiqueta}</span>
            </div>
            
            {index < diagram.nodos.length - 1 && (
              <div className="absolute left-[13px] top-7 z-0 h-4 w-0.5 bg-gradient-to-b from-primary/30 to-primary/10" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function TermCard({ term, search }: { term: GlosarioTermEnriched; search: string }) {
  const Icon = CATEGORY_ICON[term.categoria];
  const resources = getRelatedResourcesForTerm(term.id);
  const [isSaved, setIsSaved] = useState(() => {
    if (typeof window === "undefined") return false;
    const saved = JSON.parse(localStorage.getItem("tc_glosario_saved") ?? "[]");
    return saved.includes(term.id);
  });

  const toggleSave = () => {
    const saved = JSON.parse(localStorage.getItem("tc_glosario_saved") ?? "[]");
    let nextSaved;
    if (isSaved) {
      nextSaved = saved.filter((id: string) => id !== term.id);
    } else {
      nextSaved = [...saved, term.id];
    }
    localStorage.setItem("tc_glosario_saved", JSON.stringify(nextSaved));
    setIsSaved(!isSaved);
  };

  return (
    <article className="group relative rounded-xl border border-border/60 bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-border hover:shadow-md">
      <button
        onClick={toggleSave}
        className={clsx(
          "absolute right-4 top-4 rounded-full p-2 transition-colors",
          isSaved 
            ? "bg-primary/10 text-primary" 
            : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
        )}
        title={isSaved ? "Quitar de mis términos" : "Guardar término"}
      >
        <Sparkles className={clsx("h-4 w-4", isSaved && "fill-current")} />
      </button>

      <div className="mb-3 flex items-start gap-3">
        <div className="flex items-start gap-2">
          <div
            className={clsx(
              "rounded-lg p-2",
              CATEGORY_STYLES[term.categoria]
            )}
          >
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <h3 className="heading-serif text-lg text-foreground pr-8">
              <HighlightText text={term.termino} highlight={search} />
            </h3>
            <p className="text-xs text-muted-foreground">Nivel {LEVEL_LABEL[term.nivel]}</p>
          </div>
        </div>

        <span className="hidden sm:inline-block rounded-full border border-border px-2 py-0.5 text-[11px] text-muted-foreground">
          {term.categoria}
        </span>
      </div>

      <div className="space-y-3">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">En palabras simples</p>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            <InteractiveTaxText text={term.explicacionSimple} />
          </p>
        </div>

        <div>
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Definición técnica</p>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            <InteractiveTaxText text={term.definicion} />
          </p>
        </div>

        {term.ejemploPractico && (
          <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
              Ejemplo práctico colombiano
            </p>
            <p className="mt-1 text-sm font-medium text-foreground">{term.ejemploPractico.titulo}</p>
            <p className="mt-1 text-sm text-muted-foreground">{term.ejemploPractico.contexto}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">Qué hacer:</span> {term.ejemploPractico.solucion}
            </p>
            {term.ejemploPractico.errorComun && (
              <p className="mt-1 text-xs text-amber-700 dark:text-amber-300">
                Error común: {term.ejemploPractico.errorComun}
              </p>
            )}
          </div>
        )}

        <FormulaBlock term={term} />
        <DiagramBlock term={term} />
      </div>

      <div className="mt-4 border-t border-border/50 pt-3">
        {(term.articulos ?? []).length > 0 && (
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Hash className="h-3.5 w-3.5 text-muted-foreground" />
            {(term.articulos ?? []).slice(0, 4).map((art) => (
              <Link
                key={art}
                href={`/articulo/${art}`}
                className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] text-foreground/85 hover:bg-foreground hover:text-background"
              >
                Art. {art}
                <ExternalLink className="h-2.5 w-2.5" />
              </Link>
            ))}
          </div>
        )}

        <RelatedResourcesRail
          title="Conexiones"
          guides={resources?.guides}
          doctrine={resources?.doctrine}
          calculators={resources?.calculators}
          articles={resources?.articles}
        />
      </div>
    </article>
  );
}

function GlosarioPageContent() {
  const searchParams = useSearchParams();
  const queryParam = searchParams.get("q") ?? "";

  const [search, setSearch] = useState(queryParam);
  const [streakDays] = useState(computeAndPersistStreakDays);

  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  const filteredTerms = useMemo(() => {
    const results = searchGlossaryTerms(search);
    return results.map((result) => result.term);
  }, [search]);

  const groupedGlosario = useMemo(() => {
    const groups: Record<string, GlosarioTermEnriched[]> = {};

    filteredTerms.forEach((term) => {
      const firstLetter = term.termino[0]?.toUpperCase() ?? "#";
      if (!groups[firstLetter]) groups[firstLetter] = [];
      groups[firstLetter].push(term);
    });

    return groups;
  }, [filteredTerms]);

  const frequentTerms = useMemo(() => getFrequentGlossaryTerms(10), []);
  const termOfTheDay = useMemo(() => getTermOfTheDay(new Date()), []);

  const scrollToLetter = (letter: string) => {
    const element = document.getElementById(`letter-${letter}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const askPrompt = search.trim()
    ? `Explícame en lenguaje simple qué significa \"${search.trim()}\" en tributaria colombiana, con ejemplo práctico.`
    : "Explícame los conceptos tributarios más importantes para empezar en Colombia.";

  const copyAskPrompt = async () => {
    try {
      await navigator.clipboard.writeText(askPrompt);
    } catch {
      // Silent fail: clipboard may be blocked by browser permissions.
    }
  };

  return (
    <ReferencePageLayout
      title="Glosario Tributario"
      description="Definiciones, ejemplos y conexiones prácticas del lenguaje tributario colombiano."
      icon={BookOpen}
      rightContent={
        <div className="group relative rounded-lg border border-border/60 bg-card p-4 shadow-sm transition-all hover:border-primary/40">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Término del día</p>
          <p className="mt-1 heading-serif text-xl text-foreground">{termOfTheDay.termino}</p>
          <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{termOfTheDay.explicacionSimple}</p>
          <div className="mt-3 flex items-center gap-2">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-100 text-[10px] font-bold text-amber-600 dark:bg-amber-900/30">
              {streakDays}
            </div>
            <p className="text-[11px] font-medium text-muted-foreground">
              Racha de {streakDays} día{streakDays === 1 ? "" : "s"}
            </p>
          </div>
          
          {/* Streak Tooltip */}
          <div className="absolute -left-4 -top-12 z-20 hidden w-48 rounded-md bg-foreground p-2 text-[10px] text-background shadow-lg group-hover:block">
            Tu racha aumenta cada día que consultas el glosario. ¡Mantén la disciplina para dominar el Estatuto!
            <div className="absolute -bottom-1 left-6 h-2 w-2 rotate-45 bg-foreground" />
          </div>
        </div>
      }
    >
      <section className="rounded-xl border border-border/60 bg-card p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
          <Sparkles className="h-4 w-4 text-amber-500" />
          Términos frecuentes para empezar rápido
        </div>
        <div className="flex flex-wrap gap-2">
          {frequentTerms.map((term) => (
            <button
              key={term.id}
              onClick={() => {
                setSearch(term.termino);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground transition-all hover:border-primary/50 hover:bg-primary/5 hover:text-primary"
            >
              {term.termino}
            </button>
          ))}
        </div>
      </section>

      <div className="sticky top-0 z-10 -mx-6 mb-8 bg-background/95 px-6 py-4 shadow-sm backdrop-blur">
        <div className="mb-4 flex flex-wrap items-center justify-center gap-1 sm:gap-1.5">
          {alphabet.map((letter) => {
            const hasItems = groupedGlosario[letter];

            return (
              <button
                key={letter}
                onClick={() => hasItems && scrollToLetter(letter)}
                title={hasItems ? `Ir a la letra ${letter}` : "No hay términos con esta letra"}
                className={clsx(
                  "flex h-7 w-7 items-center justify-center rounded-md text-[11px] font-bold transition-all",
                  hasItems
                    ? "cursor-pointer bg-muted text-foreground shadow-sm hover:bg-primary hover:text-primary-foreground"
                    : "cursor-default bg-muted/30 text-muted-foreground/40 opacity-50"
                )}
              >
                {letter}
              </button>
            );
          })}
        </div>

        <div className="mx-auto max-w-3xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar término, definición o alias (fuzzy)..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full rounded border border-border/60 bg-card py-3 pl-10 pr-3 text-sm outline-none focus:border-foreground/40 focus:ring-1 focus:ring-foreground/20"
            />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Búsqueda inteligente activa: reconoce variaciones, typos y términos relacionados.
          </p>
        </div>
      </div>

      <div className="space-y-12">
        {Object.keys(groupedGlosario)
          .sort()
          .map((letter) => (
            <section key={letter} id={`letter-${letter}`} className="scroll-mt-40">
              <div className="mb-6 flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-muted text-xl font-bold text-foreground/70">
                  {letter}
                </div>
                <div className="h-px flex-1 bg-border" />
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                {groupedGlosario[letter].map((term) => (
                  <TermCard key={term.id} term={term} search={search} />
                ))}
              </div>
            </section>
          ))}

        {Object.keys(groupedGlosario).length === 0 && (
          <section className="rounded-lg border border-border/60 border-dashed bg-muted/30 py-14 text-center text-muted-foreground">
            <Search className="mx-auto mb-4 h-10 w-10 opacity-20" />
            <p className="text-lg font-medium text-foreground">No encontramos ese término</p>
            <p className="mt-1 text-sm">Prueba con otra palabra o consulta al asistente IA.</p>

            <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
              <button
                onClick={() => setSearch("")}
                className="rounded border border-border px-3 py-2 text-sm text-foreground hover:bg-muted"
              >
                Limpiar búsqueda
              </button>
              <Link
                href="/#asistente"
                className="rounded border border-foreground bg-foreground px-3 py-2 text-sm text-background hover:opacity-90"
              >
                Ir al asistente IA
              </Link>
              <button
                onClick={copyAskPrompt}
                className="rounded border border-border px-3 py-2 text-sm text-foreground hover:bg-muted"
              >
                Copiar pregunta sugerida
              </button>
            </div>
          </section>
        )}
      </div>

      <section className="mt-16 rounded-lg border border-border/60 bg-card p-4 text-sm text-muted-foreground">
        <p>
          ¿No encontraste un término? Puedes preguntar en lenguaje natural al asistente con este formato:
        </p>
        <p className="mt-2 rounded bg-muted px-2 py-1 font-mono text-xs text-foreground">{askPrompt}</p>
      </section>

      <div className="mt-12 pt-8 text-center">
        <button
          onClick={() => {
            setSearch("");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
            <ChevronRight className="h-4 w-4 -rotate-90" />
          </span>
          Volver arriba
        </button>
      </div>
    </ReferencePageLayout>
  );
}

export default function GlosarioPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-muted-foreground">Cargando glosario...</div>}>
      <GlosarioPageContent />
    </Suspense>
  );
}
