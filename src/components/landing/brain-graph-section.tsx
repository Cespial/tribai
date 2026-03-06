"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { ForwardRefExoticComponent, RefAttributes } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ET_BOOK_COLOR_MAP, ET_BOOKS } from "@/lib/constants/et-books";

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
  { ssr: false }
) as React.ComponentType<ForceGraphComponentProps>;

const ForceGraph2DWithRef =
  ForceGraph2D as unknown as ForwardRefExoticComponent<
    ForceGraphComponentProps & RefAttributes<ForceGraphRef>
  >;

/* ── Stat counter with count-up animation ── */
function AnimatedStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <span className="font-values text-2xl font-bold text-white md:text-3xl">
        {value}
      </span>
      <p className="mt-1 text-[12px] text-white/50">{label}</p>
    </div>
  );
}

/* ── Relation type pill ── */
function RelationPill({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] text-white/60">
      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
      {label}
    </span>
  );
}

export function BrainGraphSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<ForceGraphRef | null>(null);
  const [graphData, setGraphData] = useState<{
    nodes: GraphNode[];
    links: { source: string; target: string }[];
  } | null>(null);
  const [dimensions, setDimensions] = useState({ width: 900, height: 600 });
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  /* Load graph data */
  useEffect(() => {
    fetch("/data/graph-data.json")
      .then((r) => r.json())
      .then((data: { nodes: GraphNode[]; edges: { source: string; target: string }[] }) => {
        // Take top nodes by connectivity for a dense, impressive visual
        const sorted = [...data.nodes].sort(
          (a, b) => b.refs_in + b.refs_out - (a.refs_in + a.refs_out)
        );
        const topNodes = sorted.slice(0, 340);
        const nodeIds = new Set(topNodes.map((n) => n.id));
        const links = data.edges.filter(
          (e) => nodeIds.has(e.source) && nodeIds.has(e.target)
        );
        setGraphData({ nodes: topNodes, links });
      });
  }, []);

  /* Responsive dimensions */
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setDimensions({ width: Math.round(width), height: Math.round(height) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /* Intersection observer for lazy render */
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  /* Zoom to fit after cooldown */
  useEffect(() => {
    if (!isVisible || !graphData) return;
    const timer = setTimeout(() => {
      graphRef.current?.zoomToFit(600, 60);
    }, 3000);
    return () => clearTimeout(timer);
  }, [isVisible, graphData]);

  const nodeColor = useCallback((node: GraphNode) => {
    return ET_BOOK_COLOR_MAP[node.libro] || "#6b7280";
  }, []);

  const nodeVal = useCallback((node: GraphNode) => {
    return 2 + (node.complexity || 0) * 0.6;
  }, []);

  const nodeCanvasObject = useCallback(
    (
      node: GraphNode & { x: number; y: number },
      ctx: CanvasRenderingContext2D,
      globalScale: number
    ) => {
      const degree = (node.refs_in || 0) + (node.refs_out || 0);
      const baseSize = 2 + Math.min(degree * 0.3, 4);
      const color = ET_BOOK_COLOR_MAP[node.libro] || "#6b7280";

      // Glow for high-degree nodes
      if (degree > 8) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, baseSize + 4, 0, 2 * Math.PI);
        ctx.fillStyle = `${color}33`;
        ctx.fill();
      }

      // Main node
      ctx.beginPath();
      ctx.arc(node.x, node.y, baseSize, 0, 2 * Math.PI);
      ctx.fillStyle = color;
      ctx.fill();

      // Label on zoom
      if (globalScale > 3) {
        ctx.font = `${9 / globalScale}px -apple-system, system-ui, sans-serif`;
        ctx.fillStyle = "rgba(255,255,255,0.7)";
        ctx.textAlign = "center";
        ctx.fillText(node.label, node.x, node.y + baseSize + 7 / globalScale);
      }
    },
    []
  );

  const totalNodes = 540;
  const totalEdges = 667;

  return (
    <section
      aria-labelledby="brain-title"
      className="relative overflow-hidden bg-[#070B14] px-6 py-16 md:px-12 md:py-24 lg:px-20"
    >
      {/* Graph canvas — full background */}
      <div
        ref={containerRef}
        className="absolute inset-0 z-0"
      >
        {isVisible && graphData && (
          <ForceGraph2DWithRef
            ref={graphRef}
            graphData={graphData}
            nodeColor={nodeColor}
            nodeVal={nodeVal}
            linkColor={() => "rgba(255,255,255,0.06)"}
            linkWidth={0.5}
            cooldownTicks={200}
            nodeCanvasObject={nodeCanvasObject}
            onNodeHover={setHoveredNode}
            onNodeClick={() => {}}
            width={dimensions.width}
            height={dimensions.height}
            backgroundColor="#070B14"
            enableZoomInteraction={true}
            enablePanInteraction={true}
          />
        )}
      </div>

      {/* Gradient overlays for readability */}
      <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-r from-[#070B14] via-[#070B14]/70 to-transparent" />
      <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-[#070B14] via-transparent to-[#070B14]/60" />

      {/* Content overlay */}
      <div className="relative z-20 mx-auto max-w-[960px]">
        <div className="max-w-lg">
          <p className="eyebrow-label !text-tribai-gold">
            Arquitectura de conocimiento
          </p>
          <h2
            id="brain-title"
            className="heading-serif mt-4 text-2xl text-white md:text-4xl"
          >
            El cerebro normativo que alimenta cada respuesta.
          </h2>
          <p className="mt-5 max-w-md text-[15px] leading-relaxed text-white/60">
            Cada artículo del Estatuto Tributario está conectado con sus
            referencias cruzadas, leyes modificatorias, decretos reglamentarios
            y doctrina DIAN. No es una base de datos — es una red de
            conocimiento legal con PageRank, comunidades temáticas y relaciones
            tipadas.
          </p>

          {/* Stats */}
          <div className="mt-8 flex gap-8">
            <AnimatedStat value={String(totalNodes)} label="artículos conectados" />
            <AnimatedStat value={String(totalEdges)} label="relaciones legales" />
            <AnimatedStat value="6" label="tipos de relación" />
          </div>

          {/* Relation types */}
          <div className="mt-6 flex flex-wrap gap-x-4 gap-y-2">
            <RelationPill color="#ef4444" label="Modifica" />
            <RelationPill color="#a855f7" label="Reglamenta" />
            <RelationPill color="#3b82f6" label="Interpreta" />
            <RelationPill color="#22c55e" label="Analiza" />
            <RelationPill color="#6b7280" label="Referencia" />
            <RelationPill color="#f59e0b" label="Contiene" />
          </div>

          {/* Legend by Libro */}
          <div className="mt-6 flex flex-wrap gap-x-4 gap-y-1.5">
            {ET_BOOKS.map((book) => (
              <span
                key={book.key}
                className="inline-flex items-center gap-1.5 text-[11px] text-white/40"
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: book.color }}
                />
                {book.shortLabel}
              </span>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/asistente"
              className="btn-primary h-12 px-6"
            >
              Consultar con esta inteligencia
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              href="/explorador"
              className="inline-flex h-12 items-center gap-2 rounded-lg border border-white/20 px-6 text-[14px] font-medium text-white/70 transition-colors hover:border-white/40 hover:text-white"
            >
              Explorar el grafo completo
            </Link>
          </div>
        </div>

        {/* Hovered node tooltip */}
        {hoveredNode && (
          <div className="absolute bottom-6 right-6 z-30 max-w-xs rounded-lg border border-white/10 bg-[#0D1322]/95 p-3 backdrop-blur-sm">
            <p className="font-values text-sm font-semibold text-white">
              {hoveredNode.label}
            </p>
            <p className="mt-0.5 text-[12px] leading-snug text-white/60">
              {hoveredNode.titulo}
            </p>
            <div className="mt-2 flex gap-3 text-[11px] text-white/40">
              <span>{hoveredNode.libro}</span>
              <span>Entrantes: {hoveredNode.refs_in}</span>
              <span>Salientes: {hoveredNode.refs_out}</span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
