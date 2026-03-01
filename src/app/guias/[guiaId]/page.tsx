"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ChevronRight,
  RotateCcw,
  CheckCircle2,
  HelpCircle,
  ExternalLink,
  Undo2,
  Clock3,
  Share2,
  FileDown,
  Save,
  Grip,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { clsx } from "clsx";
import {
  ENRICHED_DOCTRINA,
  ENRICHED_GUIAS,
  getGuideQuestionCount,
} from "@/lib/knowledge/knowledge-index";
import { usePrintExport } from "@/lib/pdf/use-print-export";
import type {
  DoctrinaEnriched,
  GuiaEducativaEnriched,
  GuiaProgressSnapshot,
} from "@/types/knowledge";
import { InteractiveTaxText } from "@/components/knowledge/InteractiveTaxText";
import { RelatedResourcesRail } from "@/components/knowledge/RelatedResourcesRail";

interface SelectedOption {
  nodeId: string;
  label: string;
  nextNodeId: string;
}

interface InitialSession {
  currentNodeId: string;
  history: string[];
  selectedOptions: SelectedOption[];
  startedAt: string;
  resumeSnapshot: GuiaProgressSnapshot | null;
}

const STORAGE_PREFIX = "tc_guia_progress_";

function safeBase64Encode(value: string): string {
  if (typeof window === "undefined") return "";
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function safeBase64Decode(value: string): string {
  const padded = value
    .replace(/-/g, "+")
    .replace(/_/g, "/")
    .padEnd(Math.ceil(value.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function serializeSelectedOptions(options: SelectedOption[]): string {
  // Compress keys to shorten URL
  const compressed = options.map(o => [o.nodeId, o.label, o.nextNodeId]);
  return safeBase64Encode(JSON.stringify(compressed));
}

function deserializeSelectedOptions(value: string): SelectedOption[] | null {
  try {
    const parsed = JSON.parse(safeBase64Decode(value));
    if (!Array.isArray(parsed)) return null;
    return parsed.map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (item: any) => ({
        nodeId: item[0],
        label: item[1],
        nextNodeId: item[2]
      })
    );
  } catch {
    return null;
  }
}

function StepTimeline({
  selectedOptions
}: {
  guide: GuiaEducativaEnriched;
  history: string[];
  currentNodeId: string;
  selectedOptions: SelectedOption[];
}) {
  return (
    <div className="hidden lg:block w-64 shrink-0 space-y-6">
      <div className="rounded-xl border border-border/60 bg-card p-5 shadow-sm">
        <p className="mb-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">Tu Camino</p>
        <div className="relative space-y-4">
          <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-muted" />
          
          {selectedOptions.map((step, i) => (
            <div key={`${step.nodeId}-${i}`} className="relative flex gap-3">
              <div className="relative z-10 mt-1 h-5 w-5 rounded-full border-2 border-primary bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center">
                <CheckCircle2 className="h-3 w-3" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-semibold text-foreground truncate">{step.label}</p>
                <p className="text-[9px] text-muted-foreground truncate">Paso {i + 1}</p>
              </div>
            </div>
          ))}

          <div className="relative flex gap-3">
            <div className="relative z-10 mt-1 h-5 w-5 rounded-full border-2 border-primary bg-card animate-pulse" />
            <div className="flex-1">
              <p className="text-[11px] font-bold text-primary">Actual</p>
              <p className="text-[9px] text-muted-foreground">Respondiendo...</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="rounded-xl border border-border/60 bg-muted/30 p-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-2 mb-2 text-foreground font-medium">
          <HelpCircle className="h-3.5 w-3.5" />
          ¿Necesitas ayuda?
        </div>
        Las respuestas se guardan automáticamente en este dispositivo.
      </div>
    </div>
  );
}

function getStorageKey(guideId: string): string {
  return `${STORAGE_PREFIX}${guideId}`;
}

function hydrateStateFromSelectedPath(
  guide: GuiaEducativaEnriched,
  selectedPath: SelectedOption[]
): Pick<InitialSession, "currentNodeId" | "history" | "selectedOptions"> {
  let currentNodeId = guide.nodoInicial;
  const history: string[] = [];
  const selectedOptions: SelectedOption[] = [];

  for (const step of selectedPath) {
    if (step.nodeId !== currentNodeId) break;

    const node = guide.nodos.find((item) => item.id === step.nodeId);
    const option = node?.opciones?.find((item) => item.nextNodeId === step.nextNodeId);

    if (!node || !option) break;

    history.push(currentNodeId);
    selectedOptions.push({ nodeId: step.nodeId, label: option.label, nextNodeId: option.nextNodeId });
    currentNodeId = option.nextNodeId;
  }

  return { currentNodeId, history, selectedOptions };
}

function readStoredSnapshot(guideId: string): GuiaProgressSnapshot | null {
  if (typeof window === "undefined") return null;

  const raw = localStorage.getItem(getStorageKey(guideId));
  if (!raw) return null;

  try {
    return JSON.parse(raw) as GuiaProgressSnapshot;
  } catch {
    return null;
  }
}

function buildInitialSession(guide: GuiaEducativaEnriched, sharedResult: string | null): InitialSession {
  const now = new Date().toISOString();

  if (sharedResult) {
    const parsed = deserializeSelectedOptions(sharedResult);
    if (parsed) {
      const hydrated = hydrateStateFromSelectedPath(guide, parsed);
      return {
        ...hydrated,
        startedAt: now,
        resumeSnapshot: null,
      };
    }
  }

  const snapshot = readStoredSnapshot(guide.id);
  if (snapshot) {
    return {
      currentNodeId: guide.nodoInicial,
      history: [],
      selectedOptions: [],
      startedAt: snapshot.startedAt ?? now,
      resumeSnapshot:
        !snapshot.completed && snapshot.history.length > 0 ? snapshot : null,
    };
  }

  return {
    currentNodeId: guide.nodoInicial,
    history: [],
    selectedOptions: [],
    startedAt: now,
    resumeSnapshot: null,
  };
}

function GuideSession({
  guide,
  sharedResult,
}: {
  guide: GuiaEducativaEnriched;
  sharedResult: string | null;
}) {
  const initialSession = useMemo(
    () => buildInitialSession(guide, sharedResult),
    [guide, sharedResult]
  );

  const [currentNodeId, setCurrentNodeId] = useState(initialSession.currentNodeId);
  const [history, setHistory] = useState<string[]>(initialSession.history);
  const [selectedOptions, setSelectedOptions] = useState<SelectedOption[]>(
    initialSession.selectedOptions
  );
  const [startedAt, setStartedAt] = useState(initialSession.startedAt);
  const [resumeSnapshot, setResumeSnapshot] = useState<GuiaProgressSnapshot | null>(
    initialSession.resumeSnapshot
  );
  const [shareStatus, setShareStatus] = useState<"idle" | "copied" | "error">("idle");
  const [direction, setDirection] = useState<"forward" | "backward">("forward");

  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const { contentRef, handlePrint } = usePrintExport({
    title: `Resultado guía ${guide.titulo}`,
  });

  const currentNode = guide.nodos.find((node) => node.id === currentNodeId);
  const isResultNode = currentNode?.tipo === "resultado";

  useEffect(() => {
    if (!currentNode) return;

    const snapshot: GuiaProgressSnapshot = {
      guiaId: guide.id,
      currentNodeId,
      history,
      selectedOptions,
      startedAt,
      updatedAt: new Date().toISOString(),
      completed: isResultNode,
    };

    localStorage.setItem(getStorageKey(guide.id), JSON.stringify(snapshot));
  }, [guide.id, currentNode, currentNodeId, history, isResultNode, selectedOptions, startedAt]);

  const totalQuestions = getGuideQuestionCount(guide);
  const answeredQuestions = selectedOptions.length;
  const progressPercent =
    totalQuestions > 0
      ? Math.min(100, Math.round((answeredQuestions / totalQuestions) * 100))
      : 0;
  const stepsRemaining = Math.max(0, totalQuestions - answeredQuestions);
  const estimatedRemainingMin =
    totalQuestions > 0
      ? Math.max(1, Math.round((stepsRemaining / totalQuestions) * guide.tiempoEstimadoMin))
      : 1;

  const resultDoctrine: DoctrinaEnriched[] = (currentNode?.doctrinaRelacionada ?? [])
    .map((docId) => ENRICHED_DOCTRINA.find((doc) => doc.id === docId))
    .filter((doc): doc is DoctrinaEnriched => Boolean(doc));

  const relatedGuides = guide.guiasRelacionadas
    .map((relatedId) => ENRICHED_GUIAS.find((item) => item.id === relatedId))
    .filter((item): item is GuiaEducativaEnriched => Boolean(item))
    .slice(0, 3);

  const startFromScratch = useCallback(() => {
    setCurrentNodeId(guide.nodoInicial);
    setHistory([]);
    setSelectedOptions([]);
    setStartedAt(new Date().toISOString());
    setResumeSnapshot(null);
  }, [guide.nodoInicial]);

  const resumeProgress = useCallback(() => {
    if (!resumeSnapshot) return;

    setCurrentNodeId(resumeSnapshot.currentNodeId);
    setHistory(resumeSnapshot.history);
    setSelectedOptions(resumeSnapshot.selectedOptions);
    setStartedAt(resumeSnapshot.startedAt);
    setResumeSnapshot(null);
  }, [resumeSnapshot]);

  const handleOptionSelect = (option: { label: string; nextNodeId: string }) => {
    if (!currentNodeId) return;

    setDirection("forward");
    setHistory((prev) => [...prev, currentNodeId]);
    setSelectedOptions((prev) => [
      ...prev,
      { nodeId: currentNodeId, label: option.label, nextNodeId: option.nextNodeId },
    ]);
    setCurrentNodeId(option.nextNodeId);
  };

  const handleBack = () => {
    if (history.length === 0) return;

    const previousNode = history[history.length - 1];
    setDirection("backward");
    setHistory((prev) => prev.slice(0, -1));
    setSelectedOptions((prev) => prev.slice(0, -1));
    setCurrentNodeId(previousNode);
  };

  const handleReset = () => {
    setDirection("backward");
    setCurrentNodeId(guide.nodoInicial);
    setHistory([]);
    setSelectedOptions([]);
    setStartedAt(new Date().toISOString());
  };

  const handleShareResult = async () => {
    if (selectedOptions.length === 0) return;

    const encodedResult = serializeSelectedOptions(selectedOptions);
    const shareUrl = `${window.location.origin}/guias/${guide.id}?resultado=${encodedResult}`;

    try {
      await navigator.clipboard.writeText(shareUrl);
      setShareStatus("copied");
      window.setTimeout(() => setShareStatus("idle"), 2000);
    } catch {
      setShareStatus("error");
      window.setTimeout(() => setShareStatus("idle"), 2000);
    }
  };

  const onTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    const touch = event.changedTouches[0];
    touchStartX.current = touch.clientX;
    touchStartY.current = touch.clientY;
  };

  const onTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartX.current === null || touchStartY.current === null) return;

    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - touchStartX.current;
    const deltaY = touch.clientY - touchStartY.current;

    touchStartX.current = null;
    touchStartY.current = null;

    // Swipe right to return to previous step.
    if (Math.abs(deltaY) < 45 && deltaX > 75) {
      handleBack();
    }
  };

  if (!currentNode) {
    return null;
  }

  return (
    <>
      <div className="mx-auto flex w-full max-w-6xl flex-1 gap-8 px-4 py-8">
        <StepTimeline
          guide={guide}
          history={history}
          currentNodeId={currentNodeId}
          selectedOptions={selectedOptions}
        />
        
        <div className="flex-1 min-w-0">
          <Link
            href="/guias"
            className="mb-6 inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a guías
          </Link>

          {resumeSnapshot && (
          <div className="mb-6 rounded-lg border border-border/60 bg-card p-4">
            <p className="text-sm text-foreground">Tienes una sesión guardada de esta guía.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                onClick={resumeProgress}
                className="inline-flex items-center gap-1.5 rounded border border-foreground bg-foreground px-3 py-1.5 text-xs font-medium text-background hover:opacity-90"
              >
                <Save className="h-3.5 w-3.5" />
                Retomar donde iba
              </button>
              <button
                onClick={startFromScratch}
                className="rounded border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted"
              >
                Empezar desde cero
              </button>
            </div>
          </div>
        )}

        <section className="mb-6 rounded-xl border border-border/60 bg-card p-5 shadow-sm">
          <h1 className="heading-serif text-3xl text-foreground">{guide.titulo}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{guide.descripcion}</p>

          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-0.5">
              <Clock3 className="h-3.5 w-3.5" />
              ~{guide.tiempoEstimadoMin} minutos
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-0.5">
              Paso {Math.min(answeredQuestions + 1, totalQuestions)} de {totalQuestions}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-0.5">
              Te faltan ~{estimatedRemainingMin} min
            </span>
          </div>

          <div className="mt-4">
            <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
              <span>Progreso</span>
              <span>{progressPercent}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-foreground transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </section>

        <section
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          className="relative overflow-hidden rounded-xl border border-border/60 bg-card p-5 shadow-sm sm:p-8"
        >
          <div
            key={currentNode.id}
            className={clsx(
              "space-y-6",
              direction === "forward"
                ? "animate-[guide-slide-in-right_220ms_ease-out]"
                : "animate-[guide-slide-in-left_220ms_ease-out]"
            )}
          >
            {currentNode.tipo === "pregunta" ? (
              <>
                <div className="flex items-start gap-3">
                  <div className="mt-1 rounded-full bg-muted p-2 text-foreground/70">
                    <HelpCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="heading-serif text-2xl text-foreground">
                      <InteractiveTaxText text={currentNode.texto} />
                    </h2>
                    {currentNode.ayudaRapida && (
                      <p className="mt-2 text-sm text-muted-foreground">{currentNode.ayudaRapida}</p>
                    )}
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {currentNode.opciones?.map((option) => (
                    <button
                      key={`${currentNode.id}-${option.nextNodeId}`}
                      onClick={() => handleOptionSelect(option)}
                      className="group flex items-center justify-between rounded-lg border border-border bg-card p-4 text-left transition-all hover:border-foreground/30 hover:shadow-sm active:scale-[0.99]"
                    >
                      <span className="font-semibold text-foreground">{option.label}</span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-foreground/70" />
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className="flex items-start gap-3">
                  <div className="mt-1 rounded-full bg-emerald-100 p-2 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="heading-serif text-2xl text-foreground">{currentNode.texto}</h2>
                    {currentNode.recomendacion && (
                      <p className="mt-3 text-base leading-relaxed text-muted-foreground">
                        <InteractiveTaxText text={currentNode.recomendacion} />
                      </p>
                    )}
                  </div>
                </div>

                {currentNode.accionesSugeridas && currentNode.accionesSugeridas.length > 0 && (
                  <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
                    <p className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">
                      Qué hacer ahora
                    </p>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {currentNode.accionesSugeridas.map((action) => (
                        <li key={action} className="flex items-start gap-2">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 text-foreground/70" />
                          <span>{action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {(currentNode.enlaces?.length ?? 0) > 0 && (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {currentNode.enlaces?.map((link) => (
                      <Link
                        key={`${currentNode.id}-${link.href}`}
                        href={link.href}
                        className="flex items-center justify-between rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm font-medium text-foreground transition-all hover:border-foreground/30 hover:shadow-sm"
                      >
                        {link.label}
                        <ExternalLink className="h-4 w-4 text-foreground/70" />
                      </Link>
                    ))}
                  </div>
                )}

                <RelatedResourcesRail
                  title="Soporte normativo y herramientas"
                  doctrine={resultDoctrine}
                  calculators={[
                    ...(currentNode.calculadoraRecomendada
                      ? [currentNode.calculadoraRecomendada.href]
                      : []),
                    ...(currentNode.enlaces
                      ?.filter((link) => link.href.startsWith("/calculadoras/"))
                      .map((link) => link.href) ?? []),
                  ]}
                  articles={currentNode.articulosET}
                />

                <div className="grid gap-2 sm:grid-cols-3">
                  <button
                    onClick={handleShareResult}
                    className="inline-flex items-center justify-center gap-1.5 rounded border border-border px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
                  >
                    <Share2 className="h-4 w-4" />
                    {shareStatus === "copied"
                      ? "Enlace copiado"
                      : shareStatus === "error"
                        ? "No se pudo copiar"
                        : "Compartir resultado"}
                  </button>

                  <button
                    onClick={handlePrint}
                    className="inline-flex items-center justify-center gap-1.5 rounded border border-border px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
                  >
                    <FileDown className="h-4 w-4" />
                    Exportar como PDF
                  </button>

                  <button
                    onClick={handleReset}
                    className="inline-flex items-center justify-center gap-1.5 rounded border border-dashed border-border px-3 py-2 text-sm font-medium text-muted-foreground hover:border-foreground/30 hover:text-foreground"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Reiniciar guía
                  </button>
                </div>

                {relatedGuides.length > 0 && (
                  <div className="rounded-lg border border-border/60 bg-card p-4">
                    <p className="mb-3 text-xs uppercase tracking-wide text-muted-foreground">
                      También te puede interesar
                    </p>
                    <div className="grid gap-2 sm:grid-cols-3">
                      {relatedGuides.map((related) => (
                        <Link
                          key={related.id}
                          href={`/guias/${related.id}`}
                          className="rounded-lg border border-border p-3 text-sm text-foreground hover:bg-muted"
                        >
                          {related.titulo}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="mt-8 flex items-center justify-between border-t border-border/50 pt-5">
            <button
              onClick={handleBack}
              disabled={history.length === 0}
              className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
            >
              <Undo2 className="h-4 w-4" />
              Volver atrás
            </button>

            <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-widest text-muted-foreground/70">
              <Grip className="h-3.5 w-3.5" />
              Desliza a la derecha para volver
            </span>
                      </div>
                    </section>
                  </div>
          
                  <div className="hidden">        <div ref={contentRef} className="p-10 font-sans text-slate-900">
          <header className="mb-8 border-b-2 border-slate-200 pb-6 flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{guide.titulo}</h1>
              <p className="mt-2 text-slate-500 italic max-w-md">{guide.descripcion}</p>
            </div>
            <div className="text-right">
              <div className="bg-slate-900 text-white px-3 py-1 text-xs font-bold rounded mb-2 inline-block">SUPERAPP TRIBUTARIA</div>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest">Reporte de Orientación v2026</p>
            </div>
          </header>

          <section className="mb-10 bg-slate-50 rounded-xl p-8 border border-slate-100 shadow-sm">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Resultado Final</h2>
            <p className="text-2xl font-bold text-slate-900 mb-4">{currentNode.texto}</p>
            {currentNode.recomendacion && (
              <div className="text-slate-700 leading-relaxed bg-white p-5 rounded-lg border border-slate-100">
                {currentNode.recomendacion}
              </div>
            )}
          </section>

          {selectedOptions.length > 0 && (
            <section className="mb-10">
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6 border-b border-slate-100 pb-2">Camino de Decisiones</h2>
              <div className="space-y-4">
                {selectedOptions.map((step, index) => (
                  <div key={`${step.nodeId}-${index}`} className="flex gap-4 items-start">
                    <div className="flex-none w-6 h-6 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-[10px] font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{step.label}</p>
                      <p className="text-[10px] text-slate-400 uppercase">Seleccionado en Paso {index + 1}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {currentNode.accionesSugeridas && currentNode.accionesSugeridas.length > 0 && (
            <section className="mb-10 bg-emerald-50/30 rounded-xl p-8 border border-emerald-100">
              <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-600 mb-4">Acciones Recomendadas</h2>
              <ul className="space-y-3">
                {currentNode.accionesSugeridas.map((action, i) => (
                  <li key={i} className="flex gap-3 text-slate-700 text-sm">
                    <span className="text-emerald-500 font-bold">•</span>
                    {action}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <footer className="mt-20 pt-10 border-t border-slate-100 grid grid-cols-2 gap-8 items-end">
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">Generado el</p>
              <p className="text-sm text-slate-600">
                {new Date().toLocaleDateString("es-CO", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit"
                })}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-slate-300">Este documento es una guía informativa basada en las respuestas proporcionadas y no constituye una asesoría legal formal.</p>
            </div>
          </footer>
        </div>
      </div>
    </div>
  </>
);
}

function GuiaInteractivaPageContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const rawGuiaId = params?.guiaId;
  const guiaId = Array.isArray(rawGuiaId) ? rawGuiaId[0] : rawGuiaId;

  const guide = useMemo(
    () => ENRICHED_GUIAS.find((item) => item.id === guiaId),
    [guiaId]
  );

  const sharedResult = searchParams.get("resultado");

  if (!guide) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <div className="container py-20 text-center">
          <h1 className="heading-serif text-2xl">Guía no encontrada</h1>
          <p className="mt-2 text-muted-foreground">La guía que buscas no existe o fue removida.</p>
          <Link
            href="/guias"
            className="mt-4 inline-block text-foreground underline underline-offset-2 decoration-border hover:decoration-foreground"
          >
            Volver al índice de guías
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <GuideSession key={`${guide.id}-${sharedResult ?? "local"}`} guide={guide} sharedResult={sharedResult} />
    </div>
  );
}

export default function GuiaInteractivaPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-muted-foreground">Cargando guia...</div>}>
      <GuiaInteractivaPageContent />
    </Suspense>
  );
}
