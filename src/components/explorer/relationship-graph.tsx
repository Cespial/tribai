"use client";

import dynamic from "next/dynamic";
import { useCallback, useMemo, useRef, useState } from "react";
import type { ForwardRefExoticComponent, RefAttributes } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus, RotateCcw, Maximize2 } from "lucide-react";
import { clsx } from "clsx";
import { ET_BOOKS, ET_BOOK_COLOR_MAP } from "@/lib/constants/et-books";

interface ForceGraphComponentProps {
  graphData: { nodes: GraphNode[]; links: { source: string; target: string }[] };
  nodeLabel: (node: GraphNode) => string;
  nodeColor: (node: GraphNode) => string;
  nodeVal: (node: GraphNode) => number;
  linkColor: () => string;
  linkWidth: number;
  linkDirectionalArrowLength: number;
  linkDirectionalArrowRelPos: number;
  onNodeClick: (node: GraphNode) => void;
  onNodeHover: (node: GraphNode | null) => void;
  cooldownTicks: number;
  nodeCanvasObject: (
    node: GraphNode & { x: number; y: number },
    ctx: CanvasRenderingContext2D,
    globalScale: number
  ) => void;
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
        Cargando grafo...
      </div>
    ),
  }
) as React.ComponentType<ForceGraphComponentProps>;
const ForceGraph2DWithRef =
  ForceGraph2D as unknown as ForwardRefExoticComponent<
    ForceGraphComponentProps & RefAttributes<ForceGraphRef>
  >;

interface GraphNode {
  id: string;
  label: string;
  titulo: string;
  libro: string;
  estado: string;
  complexity: number;
  refs_out: number;
  refs_in: number;
}

interface GraphEdge {
  source: string;
  target: string;
}

interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

interface RelationshipGraphProps {
  data: GraphData;
  maxNodes?: number;
}

export function RelationshipGraph({ data, maxNodes = 220 }: RelationshipGraphProps) {
  const router = useRouter();
  const graphRef = useRef<ForceGraphRef | null>(null);
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const [selectedLibro, setSelectedLibro] = useState<string>("");
  const [minDegree, setMinDegree] = useState<number>(1);
  const [visibleNodes, setVisibleNodes] = useState<number>(maxNodes);

  const nodeDegreeMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const node of data.nodes) {
      map.set(node.id, (node.refs_in || 0) + (node.refs_out || 0));
    }
    return map;
  }, [data.nodes]);

  const graphData = useMemo(() => {
    const filteredNodes = data.nodes
      .filter((node) => (selectedLibro ? node.libro === selectedLibro : true))
      .filter((node) => (nodeDegreeMap.get(node.id) || 0) >= minDegree)
      .sort((a, b) => (nodeDegreeMap.get(b.id) || 0) - (nodeDegreeMap.get(a.id) || 0))
      .slice(0, visibleNodes);

    const nodeIds = new Set(filteredNodes.map((n) => n.id));
    const filteredEdges = data.edges.filter(
      (edge) => nodeIds.has(edge.source as string) && nodeIds.has(edge.target as string)
    );

    return {
      nodes: filteredNodes,
      links: filteredEdges.map((edge) => ({ source: edge.source, target: edge.target })),
      totalEdges: filteredEdges.length,
    };
  }, [data, minDegree, nodeDegreeMap, selectedLibro, visibleNodes]);

  const handleNodeClick = useCallback(
    (node: GraphNode) => {
      if (node.id) router.push(`/articulo/${node.id}`);
    },
    [router]
  );

  const nodeColor = useCallback((node: GraphNode) => {
    return ET_BOOK_COLOR_MAP[node.libro] || "#6b7280";
  }, []);

  const nodeVal = useCallback((node: GraphNode) => {
    return 3 + (node.complexity || 0) * 0.8;
  }, []);

  const nodeLabel = useCallback((node: GraphNode) => {
    const degree = (node.refs_in || 0) + (node.refs_out || 0);
    return `${node.label}: ${node.titulo}\n${node.libro}\nEntrantes: ${node.refs_in} · Salientes: ${node.refs_out} · Grado: ${degree}`;
  }, []);

  const nodeCanvasObject = useCallback(
    (
      node: GraphNode & { x: number; y: number },
      ctx: CanvasRenderingContext2D,
      globalScale: number
    ) => {
      const size = 3 + (node.complexity || 0) * 0.8;
      const color = ET_BOOK_COLOR_MAP[node.libro] || "#6b7280";

      ctx.beginPath();
      ctx.arc(node.x, node.y, size, 0, 2 * Math.PI);
      ctx.fillStyle = color;
      ctx.fill();

      if (globalScale > 2.2) {
        ctx.font = `${10 / globalScale}px sans-serif`;
        const textColor = getComputedStyle(document.documentElement).getPropertyValue("--muted-foreground").trim() || "#7a7771";
        ctx.fillStyle = textColor;
        ctx.textAlign = "center";
        ctx.fillText(node.label, node.x, node.y + size + 8 / globalScale);
      }
    },
    []
  );

  const zoomIn = () => graphRef.current?.zoom(1.3, 250);
  const zoomOut = () => graphRef.current?.zoom(0.8, 250);
  const zoomToFit = () => graphRef.current?.zoomToFit(350, 40);

  return (
    <div className="relative h-[640px] w-full overflow-hidden rounded-lg border border-border bg-background">
      <ForceGraph2DWithRef
        ref={graphRef}
        graphData={graphData}
        nodeLabel={nodeLabel}
        nodeColor={nodeColor}
        nodeVal={nodeVal}
        linkColor={() => "rgba(128,128,128,0.25)"}
        linkWidth={0.7}
        linkDirectionalArrowLength={3}
        linkDirectionalArrowRelPos={1}
        onNodeClick={handleNodeClick}
        onNodeHover={setHoveredNode}
        cooldownTicks={120}
        nodeCanvasObject={nodeCanvasObject}
      />

      <div className="absolute left-3 top-3 z-20 space-y-2 rounded-lg border border-border/60 bg-background/95 p-2 backdrop-blur-sm">
        <div className="flex items-center gap-1">
          <button
            onClick={zoomIn}
            className="rounded border border-border p-2 text-muted-foreground hover:text-foreground"
            aria-label="Acercar"
          >
            <Plus className="h-4 w-4" />
          </button>
          <button
            onClick={zoomOut}
            className="rounded border border-border p-2 text-muted-foreground hover:text-foreground"
            aria-label="Alejar"
          >
            <Minus className="h-4 w-4" />
          </button>
          <button
            onClick={zoomToFit}
            className="rounded border border-border p-2 text-muted-foreground hover:text-foreground"
            aria-label="Ajustar a pantalla"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => {
              setSelectedLibro("");
              setMinDegree(1);
              setVisibleNodes(maxNodes);
              zoomToFit();
            }}
            className="rounded border border-border p-2 text-muted-foreground hover:text-foreground"
            aria-label="Reiniciar filtros"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>

        <div className="grid gap-1.5">
          <select
            value={selectedLibro}
            onChange={(event) => setSelectedLibro(event.target.value)}
            className="h-8 rounded border border-border bg-card px-2 text-xs"
          >
            <option value="">Todos los libros</option>
            {ET_BOOKS.map((book) => (
              <option key={book.key} value={book.value}>
                {book.shortLabel}
              </option>
            ))}
          </select>

          <label className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
            Conectividad mínima
            <span className="font-medium text-foreground">{minDegree}</span>
          </label>
          <input
            type="range"
            min={1}
            max={8}
            value={minDegree}
            onChange={(event) => setMinDegree(Number(event.target.value))}
            className="w-full"
          />

          <label className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
            Nodos visibles
            <span className="font-medium text-foreground">{visibleNodes}</span>
          </label>
          <input
            type="range"
            min={80}
            max={Math.min(520, data.nodes.length)}
            value={visibleNodes}
            onChange={(event) => setVisibleNodes(Number(event.target.value))}
            className="w-full"
          />
        </div>
      </div>

      <div className="absolute bottom-3 left-3 z-20 rounded-lg border border-border/60 bg-background/95 p-2 text-xs backdrop-blur-sm">
        <p className="mb-1 text-[11px] uppercase tracking-[0.05em] text-muted-foreground">
          Leyenda por libro
        </p>
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          {ET_BOOKS.map((book) => (
            <button
              key={book.key}
              onClick={() =>
                setSelectedLibro((prev) => (prev === book.value ? "" : book.value))
              }
              className={clsx(
                "flex items-center gap-1.5 text-muted-foreground hover:text-foreground",
                selectedLibro && selectedLibro !== book.value && "opacity-40"
              )}
            >
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: book.color }}
              />
              <span>{book.shortLabel}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="absolute right-3 top-3 z-20 max-w-xs rounded-lg border border-border/60 bg-background/95 p-3 text-xs backdrop-blur-sm">
        <p className="mb-1 text-[11px] uppercase tracking-[0.05em] text-muted-foreground">
          Estado del grafo
        </p>
        <p className="text-muted-foreground">
          Mostrando {graphData.nodes.length} de {data.nodes.length} artículos y{" "}
          {graphData.totalEdges} relaciones visibles. Haga clic para ampliar.
        </p>
        {hoveredNode && (
          <div className="mt-2 border-t border-border/60 pt-2">
            <p className="font-medium text-foreground">{hoveredNode.label}</p>
            <p className="line-clamp-2 text-muted-foreground">{hoveredNode.titulo}</p>
            <p className="mt-1 text-muted-foreground">
              {hoveredNode.libro} · Entrantes {hoveredNode.refs_in} · Salientes{" "}
              {hoveredNode.refs_out}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
