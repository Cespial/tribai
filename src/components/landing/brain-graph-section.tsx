"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import dynamic from "next/dynamic";
import type { ForwardRefExoticComponent, RefAttributes } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ET_BOOK_COLOR_MAP, ET_BOOKS } from "@/lib/constants/et-books";
import { Reveal } from "@/components/ui/reveal";

/* ── Types ── */
interface GraphNode {
  id: string;
  label: string;
  titulo: string;
  libro: string;
  estado: string;
  complexity: number;
  refs_out: number;
  refs_in: number;
  x?: number;
  y?: number;
}

interface ForceGraphComponentProps {
  graphData: { nodes: GraphNode[]; links: { source: string; target: string }[] };
  nodeColor: (node: GraphNode) => string;
  nodeVal: (node: GraphNode) => number;
  linkColor: () => string;
  linkWidth: number;
  cooldownTicks: number;
  nodeCanvasObject: (
    node: GraphNode & { x: number; y: number },
    ctx: CanvasRenderingContext2D,
    globalScale: number
  ) => void;
  onNodeHover: (node: GraphNode | null) => void;
  onNodeClick: (node: GraphNode) => void;
  width?: number;
  height?: number;
  backgroundColor?: string;
  enableZoomInteraction?: boolean;
  enablePanInteraction?: boolean;
}

interface ForceGraphRef {
  zoom: (k: number, ms?: number) => void;
  zoomToFit: (ms?: number, padding?: number) => void;
}

const ForceGraph2D = dynamic(
  () =>
    import("react-force-graph-2d") as Promise<{
      default: React.ComponentType<ForceGraphComponentProps>;
    }>,
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        <div className="flex flex-col items-center gap-3">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-tribai-blue border-t-transparent" />
          <span className="text-xs">Cargando grafo...</span>
        </div>
      </div>
    ),
  }
) as React.ComponentType<ForceGraphComponentProps>;

const ForceGraph2DWithRef =
  ForceGraph2D as unknown as ForwardRefExoticComponent<
    ForceGraphComponentProps & RefAttributes<ForceGraphRef>
  >;

export function BrainGraphSection() {
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<ForceGraphRef | null>(null);
  const [graphData, setGraphData] = useState<{
    nodes: GraphNode[];
    links: { source: string; target: string }[];
  } | null>(null);
  const [dimensions, setDimensions] = useState({ width: 900, height: 520 });
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  /* Load graph data */
  useEffect(() => {
    fetch("/data/graph-data.json")
      .then((r) => r.json())
      .then((data: { nodes: GraphNode[]; edges: { source: string; target: string }[] }) => {
        const sorted = [...data.nodes].sort(
          (a, b) => b.refs_in + b.refs_out - (a.refs_in + a.refs_out)
        );
        const topNodes = sorted.slice(0, 340);
        const nodeIds = new Set(topNodes.map((n) => n.id));
        const links = data.edges.filter(
          (e) => nodeIds.has(e.source) && nodeIds.has(e.target)
        );
        setGraphData({ nodes: topNodes, links });
      })
      .catch(() => {
        setGraphData({ nodes: [], links: [] });
      });
  }, []);

  /* Responsive dimensions */
  useEffect(() => {
    const el = canvasContainerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      if (width > 0 && height > 0) {
        setDimensions({ width: Math.round(width), height: Math.round(height) });
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /* Intersection observer for lazy render */
  useEffect(() => {
    const el = canvasContainerRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.05 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  /* Zoom to fit after simulation settles */
  useEffect(() => {
    if (!isVisible || !graphData) return;
    const timer = setTimeout(() => {
      graphRef.current?.zoomToFit(600, 50);
    }, 3000);
    return () => clearTimeout(timer);
  }, [isVisible, graphData]);

  const isDark = useSyncExternalStore(
    (cb) => {
      const root = document.documentElement;
      const mo = new MutationObserver(cb);
      mo.observe(root, { attributes: true, attributeFilter: ["class"] });
      return () => mo.disconnect();
    },
    () => document.documentElement.classList.contains("dark"),
    () => false
  );

  const bgColor = typeof window === "undefined"
    ? "#FFFFFF"
    : isDark
      ? getComputedStyle(document.documentElement).getPropertyValue("--card").trim() || "#131B2E"
      : getComputedStyle(document.documentElement).getPropertyValue("--background").trim() || "#FFFFFF";

  const nodeCanvasObject = useCallback(
    (
      node: GraphNode & { x: number; y: number },
      ctx: CanvasRenderingContext2D,
      globalScale: number
    ) => {
      const degree = (node.refs_in || 0) + (node.refs_out || 0);
      const baseSize = 2.5 + Math.min(degree * 0.35, 5);
      const color = ET_BOOK_COLOR_MAP[node.libro] || "#6b7280";

      // Soft glow for high-degree nodes
      if (degree > 8) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, baseSize + 5, 0, 2 * Math.PI);
        ctx.fillStyle = `${color}18`;
        ctx.fill();
      }

      // Main node
      ctx.beginPath();
      ctx.arc(node.x, node.y, baseSize, 0, 2 * Math.PI);
      ctx.fillStyle = color;
      ctx.fill();

      // Label on zoom
      if (globalScale > 2.5) {
        ctx.font = `${10 / globalScale}px -apple-system, system-ui, sans-serif`;
        ctx.fillStyle = isDark ? "rgba(255,255,255,0.75)" : "rgba(0,0,0,0.7)";
        ctx.textAlign = "center";
        ctx.fillText(node.label, node.x, node.y + baseSize + 8 / globalScale);
      }
    },
    [isDark]
  );

  const nodeColor = useCallback((node: GraphNode) => {
    return ET_BOOK_COLOR_MAP[node.libro] || "#6b7280";
  }, []);

  const nodeVal = useCallback((node: GraphNode) => {
    return 2 + (node.complexity || 0) * 0.6;
  }, []);

  const linkColorValue = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";

  return (
    <section
      aria-labelledby="brain-title"
      className="border-t border-border bg-background px-6 py-10 md:px-12 md:py-24 lg:px-20"
    >
      <Reveal className="mx-auto max-w-[960px]" delay={50}>
        {/* Header copy */}
        <div className="text-center">
          <p className="eyebrow-label">
            Arquitectura de conocimiento
          </p>
          <h2
            id="brain-title"
            className="heading-serif mx-auto mt-4 max-w-3xl text-2xl text-foreground md:text-4xl"
          >
            Cada respuesta se respalda con una red de 540 artículos conectados.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-foreground-body">
            Cada artículo está conectado a sus normas relacionadas, doctrina
            DIAN y jurisprudencia. Cuando consulta, la IA navega esta red
            para encontrar la respuesta más completa y precisa.
          </p>
        </div>

        {/* Inline stats */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
          <div className="flex items-center gap-2">
            <span className="font-values text-xl font-bold text-foreground">540</span>
            <span className="text-sm text-foreground-body">artículos conectados</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-values text-xl font-bold text-foreground">667</span>
            <span className="text-sm text-foreground-body">relaciones legales</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-values text-xl font-bold text-foreground">6</span>
            <span className="text-sm text-foreground-body">tipos de relación</span>
          </div>
        </div>

        {/* Graph card — same pattern as chat demo */}
        <div className="relative mt-10 overflow-hidden rounded-lg border border-border bg-card">
          {/* Navy header bar */}
          <div className="flex items-center justify-between border-b border-border bg-tribai-navy px-5 py-4">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-success" />
              <h3 className="text-sm font-semibold text-white/90">
                Grafo del Estatuto Tributario — 540 nodos · 667 relaciones
              </h3>
            </div>
            <span className="hidden text-[10px] text-white/40 sm:inline sm:text-xs">
              Zoom con scroll · Arrastra para explorar
            </span>
          </div>

          {/* Graph canvas */}
          <div ref={canvasContainerRef} role="img" aria-label="Grafo interactivo del Estatuto Tributario — 540 artículos conectados por 667 relaciones legales" className="relative h-[420px] sm:h-[500px] md:h-[560px]">
            {isVisible && graphData && (
              <ForceGraph2DWithRef
                ref={graphRef}
                graphData={graphData}
                nodeColor={nodeColor}
                nodeVal={nodeVal}
                linkColor={() => linkColorValue}
                linkWidth={0.5}
                cooldownTicks={200}
                nodeCanvasObject={nodeCanvasObject}
                onNodeHover={setHoveredNode}
                onNodeClick={() => {}}
                width={dimensions.width}
                height={dimensions.height}
                backgroundColor={bgColor}
                enableZoomInteraction={true}
                enablePanInteraction={true}
              />
            )}

            {/* Hovered node tooltip — positioned dynamically */}
            {hoveredNode && (
              <div className="absolute left-3 top-3 z-30 max-w-[220px] rounded-lg border border-border bg-card/95 p-3 shadow-sm backdrop-blur-sm sm:left-auto sm:right-3">
                <p className="font-values text-sm font-semibold text-foreground">
                  {hoveredNode.label}
                </p>
                <p className="mt-0.5 text-[12px] leading-snug text-muted-foreground">
                  {hoveredNode.titulo}
                </p>
                <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                  <span>{hoveredNode.libro}</span>
                  <span>Entrantes: {hoveredNode.refs_in}</span>
                  <span>Salientes: {hoveredNode.refs_out}</span>
                </div>
              </div>
            )}
          </div>

          {/* Legend footer — libro colors */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-border px-5 py-3">
            <span className="text-[11px] font-medium text-muted-foreground">Libros:</span>
            {ET_BOOKS.map((book) => (
              <span
                key={book.key}
                className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground"
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: book.color }}
                />
                {book.shortLabel}
              </span>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-8 flex justify-center">
          <Link
            href="/explorador"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-tribai-blue transition-colors hover:underline hover:text-tribai-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
          >
            Explorar el grafo completo
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
      </Reveal>
    </section>
  );
}
