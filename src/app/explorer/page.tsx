"use client";

import { useState, useRef } from "react";
import CytoscapeComponent from "react-cytoscapejs";

// Professional graph styles
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const stylesheet: any = [
  {
    selector: "node",
    style: {
      "background-color": "#4A5568",
      label: "data(label)",
      "text-valign": "bottom",
      "text-halign": "center",
      "text-margin-y": 8,
      color: "#2D3748",
      "font-size": "12px",
      "font-weight": "bold",
      width: 30,
      height: 30,
      "transition-property": "background-color, width, height",
      "transition-duration": "0.3s"
    }
  },
  {
    selector: "node[type = 'estatuto']",
    style: {
      "background-color": "#3182CE", // Blue
      width: 40,
      height: 40
    }
  },
  {
    selector: "node[type = 'ley']",
    style: {
      "background-color": "#38A169", // Green
      width: 50,
      height: 50
    }
  },
  {
    selector: "node[type = 'dur'], node[type = 'decreto']",
    style: {
      "background-color": "#DD6B20", // Orange
    }
  },
  {
    selector: "node[type = 'center']",
    style: {
      "background-color": "#E53E3E", // Red
      width: 60,
      height: 60,
      "border-width": 4,
      "border-color": "#FEB2B2"
    }
  },
  {
    selector: "edge",
    style: {
      width: 2,
      "line-color": "#CBD5E0",
      "target-arrow-color": "#CBD5E0",
      "target-arrow-shape": "triangle",
      "curve-style": "bezier",
      label: "data(label)",
      "font-size": "8px",
      color: "#A0AEC0",
      "text-rotation": "autorotate"
    }
  },
  {
    selector: "node:selected",
    style: {
      "border-width": 4,
      "border-color": "#2D3748",
      "background-color": "#2D3748"
    }
  }
];

export default function GraphExplorer() {
  const [query, setQuery] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [graphData, setGraphData] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedNode, setSelectedNode] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cyRef = useRef<any>(null);

  const searchGraph = async () => {
    if (!query) return;
    try {
      const res = await fetch(`/api/tax-graph?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setGraphData(data);
      setSelectedNode(null);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white overflow-hidden">
      {/* Header */}
      <header className="bg-slate-900 text-white p-4 flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center font-bold">T</div>
          <h1 className="text-xl font-semibold tracking-tight">Tax Knowledge Graph</h1>
        </div>
        
        <div className="flex gap-2">
          <input 
            className="bg-slate-800 border-none text-white px-4 py-2 rounded-lg w-64 focus:ring-2 focus:ring-blue-500 transition-all" 
            placeholder="Buscar Artículo (ej: 240)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && searchGraph()}
          />
          <button 
            className="bg-blue-600 hover:bg-blue-500 text-white font-medium px-6 py-2 rounded-lg transition-colors shadow-md"
            onClick={searchGraph}
          >
            Explorar
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 relative overflow-hidden">
        {/* Sidebar */}
        <aside className={`w-80 bg-slate-50 border-r border-slate-200 p-6 overflow-y-auto transition-transform duration-300 z-10 ${selectedNode ? "translate-x-0" : "-translate-x-full absolute"}`}>
          {selectedNode ? (
            <div className="space-y-6">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 bg-slate-200 px-2 py-1 rounded">
                  {selectedNode.type}
                </span>
                <h2 className="text-2xl font-bold text-slate-800 mt-2">{selectedNode.label}</h2>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                  <h3 className="text-sm font-semibold text-slate-500 mb-1">ID del Nodo</h3>
                  <code className="text-xs text-blue-600 font-mono">{selectedNode.id}</code>
                </div>

                <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                  <h3 className="text-sm font-semibold text-slate-500 mb-2">Relaciones</h3>
                  <div className="space-y-2">
                    {graphData.edges
                      .filter((e: { data: { source: string; target: string; label: string } }) => e.data.source === selectedNode.id || e.data.target === selectedNode.id)
                      .map((e: { data: { source: string; target: string; label: string } }, i: number) => (
                        <div key={i} className="text-xs flex justify-between items-center border-b border-slate-100 pb-2">
                          <span className="font-medium text-slate-700">{e.data.label}</span>
                          <span className="text-slate-400">
                            {e.data.source === selectedNode.id ? "→ " + e.data.target : "← " + e.data.source}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>

              <button 
                className="w-full py-2 text-slate-500 hover:text-slate-800 text-sm font-medium transition-colors"
                onClick={() => setSelectedNode(null)}
              >
                Cerrar Detalles
              </button>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center text-slate-400">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
              <p className="text-slate-500 text-sm">Selecciona un nodo para ver sus conexiones detalladas</p>
            </div>
          )}
        </aside>

        {/* Graph Canvas */}
        <main className="flex-1 bg-slate-50 relative">
          {graphData ? (
            <CytoscapeComponent
              elements={CytoscapeComponent.normalizeElements(graphData)}
              style={{ width: "100%", height: "100%" }}
              stylesheet={stylesheet}
              layout={{ 
                name: "cose", 
                animate: true,
                nodeRepulsion: () => 400000,
                idealEdgeLength: () => 100,
              }}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              cy={(cy: any) => {
                cyRef.current = cy;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                cy.on("tap", "node", (evt: any) => {
                  const node = evt.target;
                  setSelectedNode({
                    id: node.id(),
                    label: node.data("label"),
                    type: node.data("type")
                  });
                });
              }}
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50">
              <div className="w-64 h-64 opacity-10 grayscale brightness-0 contrast-200 bg-[url('https://www.dian.gov.co/imagenes/logo_dian.png')] bg-no-repeat bg-center"></div>
              <p className="text-slate-400 font-medium mt-4">Ingresa un número de artículo para mapear su red legal</p>
              <div className="flex gap-4 mt-8">
                <span className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="w-3 h-3 bg-blue-500 rounded-full"></span> Estatuto
                </span>
                <span className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="w-3 h-3 bg-green-500 rounded-full"></span> Leyes
                </span>
                <span className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="w-3 h-3 bg-orange-500 rounded-full"></span> Decretos
                </span>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
