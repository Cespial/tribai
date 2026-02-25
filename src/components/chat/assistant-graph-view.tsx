"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import CytoscapeComponent from "react-cytoscapejs";
import { Network, Globe, Loader2, RotateCcw } from "lucide-react";
import { clsx } from "clsx";

interface AssistantGraphViewProps {
  articleIds: string[];
  theme?: "light" | "dark";
}

export function AssistantGraphView({ articleIds, theme = "light" }: AssistantGraphViewProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [graphData, setGraphData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"context" | "general">("context");
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cyRef = useRef<any>(null);

  // Design Tokens
  const colors = {
    estatuto: theme === "light" ? "#0f0e0d" : "#fafaf9",
    ley: "#16a34a",
    decreto: "#ea580c",
    libro: "#2563eb",
    modifica: "#dc2626",
    reglamenta: "#9333ea",
    edge: theme === "light" ? "#e5e5e3" : "#33312c",
    text: theme === "light" ? "#706d66" : "#8f8b85",
  };

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const stylesheet: any = [
    {
// ... (rest of the stylesheet remains same) ...

      selector: "node",
      style: {
        "background-color": colors.estatuto,
        label: "data(label)",
        "text-valign": "bottom",
        "text-halign": "center",
        "text-margin-y": 6,
        color: colors.text,
        "font-size": "9px",
        "font-family": "var(--font-geist-sans)",
        "font-weight": "500",
        width: 20,
        height: 20,
        "transition-property": "background-color, width, height, border-width",
        "transition-duration": "0.3s",
        "overlay-opacity": 0
      }
    },
    {
      selector: "node[type = 'ley']",
      style: { "background-color": colors.ley, width: 30, height: 30 }
    },
    {
      selector: "node[type = 'decreto']",
      style: { "background-color": colors.decreto }
    },
    {
      selector: "node[type = 'libro']",
      style: { 
        "background-color": colors.libro,
        width: 35,
        height: 35,
        "font-size": "11px",
        "font-weight": "bold"
      }
    },
    {
      selector: "edge",
      style: {
        width: 1.5,
        "line-color": colors.edge,
        "target-arrow-color": colors.edge,
        "target-arrow-shape": "triangle",
        "curve-style": "bezier",
        "opacity": 0.4,
        "arrow-scale": 0.8
      }
    },
    {
      selector: "edge[label = 'MODIFIES']",
      style: { "line-color": colors.modifica, "opacity": 0.6 }
    },
    {
      selector: "edge[label = 'REGULATES']",
      style: { "line-color": colors.reglamenta, "opacity": 0.6 }
    },
    {
      selector: "node:selected",
      style: {
        "border-width": 3,
        "border-color": colors.estatuto,
        "width": 35,
        "height": 35
      }
    }
  ];

  // Filtering Logic
  const filteredElements = useMemo(() => {
    if (!graphData) return [];
    let nodes = [...graphData.nodes];
    let edges = [...graphData.edges];

    if (selectedTopic) {
      nodes = nodes.filter(n => n.data.topic === selectedTopic || n.data.type === "root" || n.data.type === "libro");
    }
    if (selectedYear) {
      nodes = nodes.filter(n => n.data.year === selectedYear || !n.data.year);
    }

    // Keep only edges where both nodes exist
    const nodeIds = new Set(nodes.map(n => n.data.id));
    edges = edges.filter(e => nodeIds.has(e.data.source) && nodeIds.has(e.data.target));

    return [...nodes, ...edges];
  }, [graphData, selectedTopic, selectedYear]);

  const topics = ["Renta", "IVA", "Retención", "Procedimiento"];
  const years = [2022, 2021, 2019, 2018, 2016];

  useEffect(() => {
    const fetchGraph = async () => {
      setLoading(true);
      try {
        let url = `/api/tax-graph?mode=${viewMode}`;
        if (viewMode === "context" && articleIds.length > 0) {
          url = `/api/tax-graph?ids=${encodeURIComponent(articleIds.join(","))}`;
        }
        const res = await fetch(url);
        const data = await res.json();
        setGraphData(data);
      } catch (err) {
        console.error("Graph fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchGraph();
  }, [articleIds, viewMode]);

  return (
    <div className="h-full w-full relative bg-background flex flex-col group overflow-hidden border-l border-border/40">
      {/* Dynamic Header / Toolbar */}
      <div className="absolute top-3 left-3 right-3 z-20 flex flex-wrap gap-2 pointer-events-none">
        {/* View Toggle */}
        <div className="flex bg-card/90 backdrop-blur border border-border p-1 rounded-lg shadow-sm pointer-events-auto">
          <button
            onClick={() => setViewMode("context")}
            className={clsx(
              "p-1.5 rounded-md transition-all",
              viewMode === "context" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
            )}
            title="Contexto de la conversación"
          >
            <Network className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode("general")}
            className={clsx(
              "p-1.5 rounded-md transition-all",
              viewMode === "general" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
            )}
            title="Mapa General del Estatuto"
          >
            <Globe className="w-4 h-4" />
          </button>
        </div>

        {/* Topic Filters */}
        <div className="flex bg-card/90 backdrop-blur border border-border p-1 rounded-lg shadow-sm pointer-events-auto">
          {topics.map(t => (
            <button
              key={t}
              onClick={() => setSelectedTopic(selectedTopic === t ? null : t)}
              className={clsx(
                "px-2 py-1 text-[10px] font-medium rounded-md transition-all",
                selectedTopic === t ? "bg-blue-600 text-white" : "text-muted-foreground hover:bg-muted"
              )}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Year Filters */}
        <div className="flex bg-card/90 backdrop-blur border border-border p-1 rounded-lg shadow-sm pointer-events-auto">
          {years.map(y => (
            <button
              key={y}
              onClick={() => setSelectedYear(selectedYear === y ? null : y)}
              className={clsx(
                "px-2 py-1 text-[10px] font-medium rounded-md transition-all",
                selectedYear === y ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
              )}
            >
              {y}
            </button>
          ))}
        </div>

        <button 
          onClick={() => { setSelectedTopic(null); setSelectedYear(null); }}
          className="bg-card/90 backdrop-blur border border-border p-1.5 rounded-lg shadow-sm pointer-events-auto text-muted-foreground hover:text-foreground"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/40 backdrop-blur-[2px]">
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
        </div>
      )}

      <div className="flex-1">
        {graphData && (
          <CytoscapeComponent
            elements={CytoscapeComponent.normalizeElements({ nodes: filteredElements.filter(e => !e.data.source), edges: filteredElements.filter(e => e.data.source) })}
            style={{ width: "100%", height: "100%" }}
            stylesheet={stylesheet}
            layout={{ 
              name: viewMode === "general" ? "breadthfirst" : "cose", 
              animate: true,
              padding: 40,
              nodeRepulsion: 8000,
              idealEdgeLength: 80,
            }}
            cy={(cy: any) => {
              cyRef.current = cy;
              cy.on("tap", "node", (evt: any) => {
                // Focus animation on click
                cy.animate({ center: { elef: evt.target }, zoom: 1.2 }, { duration: 400 });
              });
            }}
          />
        )}
      </div>

      {/* Modern Legend */}
      <div className="px-4 py-2 border-t border-border/40 flex items-center justify-between bg-card/30">
        <div className="flex gap-4">
          <span className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-tighter text-muted-foreground">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span> Libro
          </span>
          <span className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-tighter text-muted-foreground">
            <span className="w-1.5 h-1.5 rounded-full bg-primary"></span> Artículo
          </span>
          <span className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-tighter text-muted-foreground">
            <span className="w-1.5 h-1.5 rounded-full bg-green-600"></span> Ley
          </span>
        </div>
        <div className="flex gap-3">
          <span className="flex items-center gap-1 text-[9px] text-red-600 font-bold italic">
            ── Modifica
          </span>
          <span className="flex items-center gap-1 text-[9px] text-purple-600 font-bold italic">
            ── Reglamenta
          </span>
        </div>
      </div>
    </div>
  );
}
