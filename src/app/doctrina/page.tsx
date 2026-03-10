"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Search,
  Scale,
  Filter,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Sparkles,
  List,
  CalendarClock,
  Bot,
  Copy,
} from "lucide-react";
import { clsx } from "clsx";
import {
  buildSemanticDoctrineAnswer,
  DOCTRINA_STATUS_LABELS,
  ENRICHED_DOCTRINA,
  ENRICHED_GUIAS,
  getUniqueArticlesET,
  PROFILE_LABELS,
  semanticDoctrineSearch,
} from "@/lib/knowledge/knowledge-index";
import type {
  DoctrinaEnriched,
  EstadoVigenciaDoctrina,
  PerfilContribuyente,
} from "@/types/knowledge";
import { VigenciaBadge } from "@/components/knowledge/VigenciaBadge";
import { InteractiveTaxText } from "@/components/knowledge/InteractiveTaxText";
import { RelatedResourcesRail } from "@/components/knowledge/RelatedResourcesRail";

type ViewMode = "lista" | "timeline";

const TIPO_DOC_CONFIG: Record<
  DoctrinaEnriched["tipoDocumento"],
  { label: string; color: string }
> = {
  concepto: {
    label: "Concepto",
    color: "bg-muted text-foreground border-border",
  },
  oficio: {
    label: "Oficio",
    color: "bg-muted text-foreground border-border",
  },
  "doctrina-general": {
    label: "Doctrina General",
    color: "bg-muted text-foreground border-border",
  },
  circular: {
    label: "Circular",
    color: "bg-muted text-foreground border-border",
  },
};

const PERFIL_LIST: PerfilContribuyente[] = [
  "persona-natural",
  "persona-juridica",
  "gran-contribuyente",
  "independiente",
  "pyme",
  "esal",
];

function formatFecha(fecha: string): string {
  const date = new Date(`${fecha}T12:00:00`);
  return date.toLocaleDateString("es-CO", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function DoctrineCard({
  doc,
  isExpanded,
  toggleExpand,
}: {
  doc: DoctrinaEnriched;
  isExpanded: boolean;
  toggleExpand: (id: string) => void;
}) {
  const tipoConf = TIPO_DOC_CONFIG[doc.tipoDocumento];
  const relatedGuides = doc.guiasRelacionadas
    .map((guideId) => ENRICHED_GUIAS.find((guide) => guide.id === guideId))
    .filter((guide): guide is (typeof ENRICHED_GUIAS)[number] => Boolean(guide));

  return (
    <article
      id={doc.id}
      className="group overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm transition-all hover:border-border hover:shadow-md"
    >
      <div className="p-5 sm:p-6">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="font-mono text-sm font-semibold text-foreground">{doc.numero}</span>
          <span className="text-sm text-muted-foreground">{formatFecha(doc.fecha)}</span>
          <span
            className={clsx(
              "ml-auto inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
              tipoConf.color
            )}
          >
            {tipoConf.label}
          </span>
          <VigenciaBadge status={doc.vigencia} />
        </div>

        <h3
          className={clsx(
            "heading-serif text-xl text-foreground",
            doc.vigencia === "revocado" && "line-through decoration-destructive/50"
          )}
        >
          {doc.tema}
        </h3>

        <p className="mt-3 rounded-md border border-border/50 bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
          <InteractiveTaxText text={doc.contextoClaro} />
        </p>

        <p className="mt-3 text-sm italic text-muted-foreground">
          “<InteractiveTaxText text={doc.pregunta} />”
        </p>

        <div className="mt-4 rounded-md border-l-4 border-border bg-muted/50 p-3">
          <p className="text-sm font-medium leading-relaxed text-foreground">
            <InteractiveTaxText text={doc.conclusionClave} />
          </p>
        </div>

        <button
          onClick={() => toggleExpand(doc.id)}
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-foreground underline underline-offset-2 decoration-border hover:decoration-foreground"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="h-4 w-4" />
              Ocultar síntesis completa
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4" />
              Ver síntesis completa
            </>
          )}
        </button>

        {isExpanded && (
          <div className="mt-4 rounded-lg border border-border/60 bg-muted/30 p-4 text-sm leading-relaxed text-muted-foreground animate-in slide-in-from-top-2 duration-200">
            <InteractiveTaxText text={doc.sintesis} />
          </div>
        )}

        {doc.revocadoPor && (
          <p className="mt-3 text-xs text-destructive">
            Documento revocado por: {doc.revocadoPor}
          </p>
        )}
      </div>

      <div className="border-t border-border/40 bg-muted/20 px-5 py-4 sm:px-6">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          {doc.articulosET.length > 0 && (
            <>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                E.T.
              </span>
              {doc.articulosET.map((art) => (
                <Link
                  key={`${doc.id}-${art}`}
                  href={`/articulo/${art}`}
                  className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-0.5 text-xs text-foreground/85 hover:bg-muted"
                >
                  Art. {art}
                  <ExternalLink className="h-2.5 w-2.5 opacity-60" />
                </Link>
              ))}
            </>
          )}
        </div>

        <div className="mb-3 flex flex-wrap gap-1.5">
          {doc.descriptores.map((descriptor) => (
            <span
              key={`${doc.id}-${descriptor}`}
              className="inline-flex items-center rounded-full border border-border px-2.5 py-0.5 text-xs text-muted-foreground"
            >
              {descriptor}
            </span>
          ))}
        </div>

        <RelatedResourcesRail
          title="Conexiones"
          guides={relatedGuides}
          calculators={doc.calculadorasRelacionadas}
          articles={doc.articulosET}
        />
      </div>
    </article>
  );
}

function DoctrinaPageContent() {
  const searchParams = useSearchParams();
  const docParam = searchParams.get("doc");
  const articuloParam = searchParams.get("articulo");

  const [search, setSearch] = useState("");
  const [tipoFiltro, setTipoFiltro] = useState<
    "todos" | "concepto" | "oficio" | "doctrina-general" | "circular"
  >("todos");
  const [vigenciaFiltro, setVigenciaFiltro] = useState<"todos" | EstadoVigenciaDoctrina>("todos");
  const [articuloFiltro, setArticuloFiltro] = useState(articuloParam ?? "");
  const [showArtSuggestions, setShowArtSuggestions] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    if (typeof window === "undefined") return "lista";
    const savedMode = localStorage.getItem("tc_doctrina_view_mode");
    return savedMode === "timeline" ? "timeline" : "lista";
  });
  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    () => new Set(docParam ? [docParam] : [])
  );
  const [activeProfiles, setActiveProfiles] = useState<PerfilContribuyente[]>([]);
  const [semanticQuestion, setSemanticQuestion] = useState("");
  const [semanticAnswer, setSemanticAnswer] = useState<string | null>(null);
  const [semanticDocs, setSemanticDocs] = useState<DoctrinaEnriched[]>([]);

  useEffect(() => {
    localStorage.setItem("tc_doctrina_view_mode", viewMode);
  }, [viewMode]);

  const allArticles = useMemo(() => getUniqueArticlesET(), []);

  const artSuggestions = useMemo(() => {
    if (!articuloFiltro.trim()) return [];
    return allArticles.filter(art => 
      art.toLowerCase().includes(articuloFiltro.toLowerCase())
    ).slice(0, 5);
  }, [articuloFiltro, allArticles]);

  useEffect(() => {
    if (!docParam) return;

    const timer = window.setTimeout(() => {
      const target = document.getElementById(docParam);
      target?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 150);

    return () => window.clearTimeout(timer);
  }, [docParam, viewMode]);

  const doctrinaClave = useMemo(
    () => ENRICHED_DOCTRINA.filter((doc) => doc.esDoctrinaClave).slice(0, 8),
    []
  );

  const filtered = useMemo(() => {
    const ranked = semanticDoctrineSearch(search, {
      estado: vigenciaFiltro,
      tipo: tipoFiltro,
      perfiles: activeProfiles,
    });

    const docs = ranked
      .map((item) => item.doc)
      .filter((doc) =>
        !articuloFiltro.trim()
          ? true
          : doc.articulosET.some((article) =>
              article.toLowerCase().includes(articuloFiltro.toLowerCase())
            )
      );

    if (!search.trim()) {
      return docs.sort((a, b) => b.fecha.localeCompare(a.fecha));
    }

    return docs;
  }, [search, tipoFiltro, vigenciaFiltro, articuloFiltro, activeProfiles]);

  const timelineByYear = useMemo(() => {
    return filtered.reduce<Record<string, DoctrinaEnriched[]>>((acc, doc) => {
      const year = doc.fecha.slice(0, 4);
      if (!acc[year]) acc[year] = [];
      acc[year].push(doc);
      return acc;
    }, {});
  }, [filtered]);

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleProfile = (profile: PerfilContribuyente) => {
    setActiveProfiles((prev) =>
      prev.includes(profile)
        ? prev.filter((item) => item !== profile)
        : [...prev, profile]
    );
  };

  const handleSemanticSearch = () => {
    const results = semanticDoctrineSearch(semanticQuestion, {
      estado: vigenciaFiltro,
      tipo: tipoFiltro,
      perfiles: activeProfiles,
    }).slice(0, 6);

    setSemanticDocs(results.map((item) => item.doc));
    setSemanticAnswer(buildSemanticDoctrineAnswer(semanticQuestion, results));
  };

  const copySemanticPrompt = async () => {
    const prompt = semanticQuestion.trim()
      ? `Analiza doctrina DIAN sobre: ${semanticQuestion.trim()}. Cita número de concepto/oficio y artículo ET relacionado.`
      : "Analiza doctrina DIAN relevante para mi caso y cita artículos ET clave.";

    try {
      await navigator.clipboard.writeText(prompt);
    } catch {
      // Ignore clipboard failures.
    }
  };

  return (
    <div className="animate-in fade-in duration-500">
      <header className="mb-10 rounded-xl border border-border/60 bg-card p-6">
        <div className="mb-3 flex items-center gap-3">
          <div className="rounded-lg bg-muted p-2 text-foreground/70">
            <Scale className="h-8 w-8" />
          </div>
          <h1 className="heading-serif text-3xl text-foreground">Doctrina DIAN</h1>
        </div>
        <p className="max-w-3xl text-base leading-relaxed text-muted-foreground">
          Conceptos, oficios, doctrina general y circulares para sustentar decisiones tributarias con lenguaje claro.
        </p>
      </header>

      <section className="mb-8 rounded-xl border border-border/60 bg-card p-5">
        <div className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
          <Sparkles className="h-4 w-4" />
          Doctrina clave de alto impacto práctico
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {doctrinaClave.map((doc) => (
            <button
              key={doc.id}
              onClick={() => {
                setSearch(doc.tema);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="rounded-lg border border-border p-3 text-left hover:bg-muted"
            >
              <p className="text-xs text-muted-foreground">{doc.numero}</p>
              <p className="mt-1 text-sm font-medium text-foreground line-clamp-2">{doc.tema}</p>
            </button>
          ))}
        </div>
      </section>

      <section className="mb-8 rounded-xl border border-border/60 bg-card p-5">
        <div className="grid gap-4 lg:grid-cols-4">
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar por tema, número, síntesis o descriptor..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="h-12 w-full rounded border border-border/60 bg-card px-4 pl-10 text-sm outline-none focus:border-foreground/40 focus:ring-1 focus:ring-foreground/20"
            />
          </div>

          <select
            value={tipoFiltro}
            onChange={(event) =>
              setTipoFiltro(event.target.value as typeof tipoFiltro)
            }
            className="h-12 w-full rounded border border-border/60 bg-card px-4 text-sm outline-none focus:border-foreground/40 focus:ring-1 focus:ring-foreground/20"
          >
            <option value="todos">Todos los tipos</option>
            <option value="concepto">Concepto</option>
            <option value="oficio">Oficio</option>
            <option value="doctrina-general">Doctrina General</option>
            <option value="circular">Circular</option>
          </select>

          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground">
              Art.
            </span>
            <input
              type="text"
              placeholder="Ej: 240, 383..."
              value={articuloFiltro}
              onChange={(event) => {
                setArticuloFiltro(event.target.value);
                setShowArtSuggestions(true);
              }}
              onFocus={() => setShowArtSuggestions(true)}
              onBlur={() => setTimeout(() => setShowArtSuggestions(false), 200)}
              className="h-12 w-full rounded border border-border/60 bg-card px-4 pl-12 text-sm outline-none focus:border-foreground/40 focus:ring-1 focus:ring-foreground/20"
            />
            {showArtSuggestions && artSuggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full z-20 mt-1 rounded-md border border-border bg-card shadow-lg">
                {artSuggestions.map((art) => (
                  <button
                    key={art}
                    onClick={() => {
                      setArticuloFiltro(art);
                      setShowArtSuggestions(false);
                    }}
                    className="flex w-full items-center px-3 py-2 text-left text-xs hover:bg-muted"
                  >
                    Artículo {art}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div>
            <p className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">Estado de vigencia</p>
            <div className="flex flex-wrap gap-2">
              {(["todos", "vigente", "revocado", "suspendido"] as const).map((estado) => (
                <button
                  key={estado}
                  onClick={() => setVigenciaFiltro(estado)}
                  className={clsx(
                    "rounded-full border px-3 py-1 text-xs font-medium",
                    vigenciaFiltro === estado
                      ? "border-foreground bg-foreground text-background"
                      : "border-border text-muted-foreground hover:border-foreground/30"
                  )}
                >
                  {estado === "todos" ? "Todos" : DOCTRINA_STATUS_LABELS[estado]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">
              Relevante para mí
            </p>
            <div className="flex flex-wrap gap-2">
              {PERFIL_LIST.map((profile) => (
                <label
                  key={profile}
                  className={clsx(
                    "inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1 text-xs",
                    activeProfiles.includes(profile)
                      ? "border-foreground bg-foreground text-background"
                      : "border-border text-muted-foreground"
                  )}
                >
                  <input
                    type="checkbox"
                    checked={activeProfiles.includes(profile)}
                    onChange={() => toggleProfile(profile)}
                    className="sr-only"
                  />
                  {PROFILE_LABELS[profile]}
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border/50 pt-4">
          <p className="text-xs font-medium uppercase tracking-[0.05em] text-muted-foreground">
            {filtered.length} documento{filtered.length !== 1 ? "s" : ""} encontrado{filtered.length !== 1 ? "s" : ""}
          </p>

          <div className="inline-flex rounded-lg border border-border p-1">
            <button
              onClick={() => setViewMode("lista")}
              className={clsx(
                "inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs",
                viewMode === "lista"
                  ? "bg-foreground text-background"
                  : "text-muted-foreground"
              )}
            >
              <List className="h-3.5 w-3.5" />
              Lista
            </button>
            <button
              onClick={() => setViewMode("timeline")}
              className={clsx(
                "inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs",
                viewMode === "timeline"
                  ? "bg-foreground text-background"
                  : "text-muted-foreground"
              )}
            >
              <CalendarClock className="h-3.5 w-3.5" />
              Timeline
            </button>
          </div>
        </div>
      </section>

      <section className="mb-8 rounded-xl border border-border/60 bg-card p-5">
        <div className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
          <Bot className="h-4 w-4" />
          Buscador semántico + asistente IA
        </div>
        <div className="flex flex-wrap gap-2">
          <input
            type="text"
            value={semanticQuestion}
            onChange={(event) => setSemanticQuestion(event.target.value)}
            placeholder="Ej: ¿Qué doctrina reciente aplica para deducción por dependientes?"
            className="h-11 min-w-[240px] flex-1 rounded border border-border/60 bg-card px-3 text-sm outline-none focus:border-foreground/40 focus:ring-1 focus:ring-foreground/20"
          />
          <button
            onClick={handleSemanticSearch}
            className="h-11 rounded border border-foreground bg-foreground px-4 text-sm font-medium text-background hover:opacity-90"
          >
            Buscar semánticamente
          </button>
          <button
            onClick={copySemanticPrompt}
            className="inline-flex h-11 items-center gap-1.5 rounded border border-border px-4 text-sm font-medium text-foreground hover:bg-muted"
          >
            <Copy className="h-4 w-4" />
            Copiar prompt IA
          </button>
          <Link
            href="/#asistente"
            className="inline-flex h-11 items-center rounded border border-border px-4 text-sm font-medium text-foreground hover:bg-muted"
          >
            Abrir asistente IA
          </Link>
        </div>

        {semanticAnswer && (
          <div className="mt-4 rounded-lg border border-border/60 bg-muted/30 p-4 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">Respuesta sugerida</p>
            <p className="mt-2 whitespace-pre-line leading-relaxed">{semanticAnswer}</p>
            {semanticDocs.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {semanticDocs.map((doc) => (
                  <button
                    key={`semantic-${doc.id}`}
                    onClick={() => {
                      setSearch(doc.tema);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="rounded-full border border-border px-2.5 py-1 text-xs text-foreground/80 hover:bg-muted"
                  >
                    {doc.numero}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      {filtered.length === 0 ? (
        <section className="rounded-lg border border-border/60 border-dashed bg-muted/30 py-20 text-center text-muted-foreground">
          <Filter className="mx-auto mb-4 h-10 w-10 opacity-20" />
          <p className="text-lg font-medium text-foreground">No se encontraron documentos</p>
          <p className="text-sm">Intente con otra búsqueda o modifique los filtros.</p>
          <button
            onClick={() => {
              setSearch("");
              setTipoFiltro("todos");
              setVigenciaFiltro("todos");
              setArticuloFiltro("");
              setActiveProfiles([]);
            }}
            className="mt-4 text-sm font-medium text-foreground underline underline-offset-2 decoration-border hover:decoration-foreground"
          >
            Limpiar filtros
          </button>
        </section>
      ) : viewMode === "lista" ? (
        <section className="space-y-4">
          {filtered.map((doc) => (
            <DoctrineCard
              key={doc.id}
              doc={doc}
              isExpanded={expandedIds.has(doc.id)}
              toggleExpand={toggleExpand}
            />
          ))}
        </section>
      ) : (
        <section className="rounded-xl border border-border/60 bg-card p-5">
          <div className="relative pl-6">
            <div className="absolute bottom-0 left-2 top-0 w-px bg-border" />
            {Object.keys(timelineByYear)
              .sort((a, b) => Number(b) - Number(a))
              .map((year) => (
                <div key={year} className="mb-8">
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="relative -left-[18px] h-3 w-3 rounded-full bg-foreground" />
                      <h3 className="heading-serif text-2xl text-foreground">{year}</h3>
                    </div>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground uppercase">
                      {timelineByYear[year].length} Concepto{timelineByYear[year].length !== 1 ? "s" : ""}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {timelineByYear[year].map((doc) => (
                      <DoctrineCard
                        key={doc.id}
                        doc={doc}
                        isExpanded={expandedIds.has(doc.id)}
                        toggleExpand={toggleExpand}
                      />
                    ))}
                  </div>
                </div>
              ))}
          </div>
        </section>
      )}

      <div className="mt-8 rounded-lg border border-border/60 bg-card p-4 text-xs text-muted-foreground shadow-sm">
        <p>
          <strong>Nota legal:</strong> Esta sección es informativa. La doctrina DIAN puede ser modificada,
          revocada o suspendida. Verifique siempre la fuente oficial y valide su caso con un profesional.
        </p>
      </div>
    </div>
  );
}

export default function DoctrinaPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-muted-foreground">Cargando doctrina...</div>}>
      <DoctrinaPageContent />
    </Suspense>
  );
}
