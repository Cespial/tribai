/**
 * Phase 8 — Advanced Tax Knowledge Graph Builder
 *
 * Builds a comprehensive multidimensional graph from ALL sources:
 * - Nodes: All 1,294 ET Articles + Leyes + Decretos + Doctrina + Jurisprudencia
 * - Edges: Typed relations (MODIFICA, REGLAMENTA, REFERENCIA, INTERPRETA, ANALIZA)
 *
 * Outputs:
 *   - data/graph/tax-graph.json (full graph for scripts)
 *   - public/data/graph-data.json (Vercel-friendly copy)
 *
 * Usage: npx tsx scripts/graph/build-graph.ts
 */

import * as fs from "fs";
import * as path from "path";
import { glob } from "glob";

// Graph Types
interface TaxNode {
  id: string;
  label: string;
  type: "estatuto" | "ley" | "decreto" | "sentencia" | "doctrina" | "resolucion" | "libro" | "root";
  group?: string;
  year?: number;
  topic?: string;
}

type EdgeRelation = "MODIFICA" | "REGLAMENTA" | "REFERENCIA" | "INTERPRETA" | "ANALIZA" | "CONTIENE";

interface TaxEdge {
  source: string;
  target: string;
  relation: EdgeRelation;
  // Keep legacy field for backward compatibility with graph-retriever
  type?: string;
  context?: string;
  year?: number;
}

interface TaxGraph {
  nodes: TaxNode[];
  edges: TaxEdge[];
  metadata: {
    generatedAt: string;
    stats: {
      nodes: number;
      edges: number;
      byType: Record<string, number>;
      byRelation: Record<string, number>;
    };
  };
}

// Regex Patterns
const REGEX_MODIFIES = /(?:modif[ií]quese|adici[oó]nese|der[oó]guese|sustit[uú]yase)(?:[\s\S]{1,100}?)art[ií]culo\s+(\d+(?:-\d+)?)(?:[\s\S]{1,100}?)(?:estatuto|E\.?T\.?)/gi;

function inferTopicFromArt(num: string): string {
  const n = parseInt(num);
  if (isNaN(n)) return "Especial";
  if (n <= 364) return "Renta";
  if (n <= 419) return "Retención";
  if (n <= 512) return "IVA";
  if (n <= 616) return "Consumo / Timbre";
  return "Procedimiento";
}

function inferTopic(title: string): string {
  const t = title.toLowerCase();
  if (t.includes("renta")) return "Renta";
  if (t.includes("iva") || t.includes("ventas")) return "IVA";
  if (t.includes("procedimiento")) return "Procedimiento";
  if (t.includes("igualdad") || t.includes("reforma")) return "Reforma Estructural";
  return "General";
}

async function buildGraph() {
  console.log("[graph] Starting Advanced Tax Graph construction...");

  const nodes: Map<string, TaxNode> = new Map();
  const edgeSet = new Set<string>();
  const edges: TaxEdge[] = [];

  const addNode = (id: string, label: string, type: TaxNode["type"], extra: Partial<TaxNode> = {}) => {
    if (!nodes.has(id)) {
      nodes.set(id, { id, label, type, ...extra });
    } else {
      const existing = nodes.get(id)!;
      nodes.set(id, { ...existing, ...extra });
    }
  };

  const addEdge = (source: string, target: string, relation: EdgeRelation, extra: Partial<TaxEdge> = {}) => {
    const key = `${source}|${target}|${relation}`;
    if (!edgeSet.has(key)) {
      edgeSet.add(key);
      edges.push({ source, target, relation, type: relation, ...extra });
    }
  };

  // 0. Load ALL 1,294 ET Articles as nodes (ensure complete coverage)
  const articleFiles = glob.sync("public/data/articles/*.json");
  console.log(`[graph] Loading ${articleFiles.length} ET articles...`);

  for (const file of articleFiles) {
    try {
      const data = JSON.parse(fs.readFileSync(file, "utf-8"));
      const slug = data.slug || path.basename(file, ".json");
      const nodeId = `et-art-${slug}`;

      addNode(nodeId, data.titulo_corto || data.titulo || `Art. ${slug} ET`, "estatuto", {
        topic: inferTopicFromArt(slug),
        group: data.libro,
      });

      // Add cross_references as REFERENCIA edges
      for (const refSlug of data.cross_references || []) {
        const targetId = `et-art-${refSlug}`;
        addEdge(nodeId, targetId, "REFERENCIA", {
          context: `Art. ${slug} ET referencia Art. ${refSlug} ET`,
        });
      }

      // Add referenced_by as reverse REFERENCIA edges
      for (const refSlug of data.referenced_by || []) {
        const sourceId = `et-art-${refSlug}`;
        addEdge(sourceId, nodeId, "REFERENCIA", {
          context: `Art. ${refSlug} ET referencia Art. ${slug} ET`,
        });
      }

      // Add modifications as MODIFICA edges
      for (const mod of data.modificaciones_parsed || []) {
        if (mod.norma_tipo && mod.norma_numero && mod.norma_year) {
          const lawId = `ley-${mod.norma_numero}-${mod.norma_year}`;
          addNode(lawId, `${mod.norma_tipo} ${mod.norma_numero} de ${mod.norma_year}`, "ley", {
            year: mod.norma_year,
          });
          addEdge(lawId, nodeId, "MODIFICA", {
            year: mod.norma_year,
            context: `${mod.norma_tipo} ${mod.norma_numero} modifica Art. ${slug} ET`,
          });
        }
      }
    } catch {
      // Skip malformed article files
    }
  }

  // 1. Process LEYES (The Modifiers)
  const leyFiles = glob.sync("data/scraped/leyes/*.json");
  console.log(`[graph] Processing ${leyFiles.length} Ley files...`);

  for (const file of leyFiles) {
    try {
      const raw = fs.readFileSync(file, "utf-8");
      const data = JSON.parse(raw);
      const docs = Array.isArray(data) ? data : [data];

      for (const ley of docs) {
        if (!ley.numero) continue;
        const leyId = `ley-${ley.numero}-${ley.year}`;

        addNode(leyId, `Ley ${ley.numero} de ${ley.year}`, "ley", {
          year: ley.year,
          group: ley.titulo,
          topic: inferTopic(ley.titulo || ""),
        });

        // Process articles within the law
        if (ley.articulos) {
          for (const art of ley.articulos) {
            let match;
            REGEX_MODIFIES.lastIndex = 0;
            while ((match = REGEX_MODIFIES.exec(art.texto || "")) !== null) {
              const etArtNum = match[1];
              const etNodeId = `et-art-${etArtNum}`;

              addNode(etNodeId, `Art. ${etArtNum} ET`, "estatuto", {
                topic: inferTopicFromArt(etArtNum),
              });

              addEdge(leyId, etNodeId, "MODIFICA", {
                year: ley.year,
                context: `Ley ${ley.numero} Art. ${art.numero} modifica Art. ${etArtNum} ET`,
              });
            }

            // Also use articulosETModificados if available
            for (const etSlug of art.articulosETModificados || []) {
              const etNodeId = `et-art-${etSlug}`;
              addNode(etNodeId, `Art. ${etSlug} ET`, "estatuto", {
                topic: inferTopicFromArt(etSlug),
              });
              addEdge(leyId, etNodeId, "MODIFICA", {
                year: ley.year,
                context: `Ley ${ley.numero} modifica Art. ${etSlug} ET`,
              });
            }
          }
        }

        // Use articulosETAfectados if available
        for (const etSlug of ley.articulosETAfectados || []) {
          const etNodeId = `et-art-${etSlug}`;
          addNode(etNodeId, `Art. ${etSlug} ET`, "estatuto", {
            topic: inferTopicFromArt(etSlug),
          });
          addEdge(leyId, etNodeId, "MODIFICA", {
            year: ley.year,
          });
        }
      }
    } catch {
      // Skip malformed files
    }
  }

  // 2. Process DECRETOS (The Regulators)
  const decFiles = glob.sync("data/scraped/decretos/*.json");
  console.log(`[graph] Processing ${decFiles.length} Decreto files...`);

  for (const file of decFiles) {
    try {
      const raw = fs.readFileSync(file, "utf-8");
      const json = JSON.parse(raw);
      const docs = Array.isArray(json) ? json : [json];

      for (const doc of docs) {
        if (!doc.id) continue;
        const decNodeId = doc.id;
        const year = doc.decretoYear || 2016;

        addNode(decNodeId, `DUR Art. ${doc.articuloNumero || doc.id.split("-").pop()}`, "decreto", {
          year,
          topic: "Reglamentación",
        });

        for (const slug of doc.articulosSlugs || []) {
          const etNodeId = `et-art-${slug}`;
          addNode(etNodeId, `Art. ${slug} ET`, "estatuto", {
            topic: inferTopicFromArt(slug),
          });
          addEdge(decNodeId, etNodeId, "REGLAMENTA", {
            year,
            context: `DUR 1625 reglamenta Art. ${slug} ET`,
          });
        }
      }
    } catch {
      // Skip malformed files
    }
  }

  // 3. Process DOCTRINA (The Interpreters)
  const docFiles = glob.sync("data/scraped/doctrina/*.json");
  console.log(`[graph] Processing ${docFiles.length} Doctrina files...`);

  for (const file of docFiles) {
    try {
      const raw = fs.readFileSync(file, "utf-8");
      const json = JSON.parse(raw);
      const docs = Array.isArray(json) ? json : [json];

      for (const doc of docs) {
        if (!doc.id) continue;
        const docNodeId = doc.id;
        const year = doc.fecha ? parseInt(doc.fecha.slice(0, 4), 10) : undefined;

        addNode(docNodeId, `${doc.tipo || "Concepto"} DIAN ${doc.numero}`, "doctrina", {
          year,
          topic: doc.tema || "Doctrina DIAN",
        });

        for (const slug of doc.articulosSlugs || []) {
          const etNodeId = `et-art-${slug}`;
          addNode(etNodeId, `Art. ${slug} ET`, "estatuto", {
            topic: inferTopicFromArt(slug),
          });
          addEdge(docNodeId, etNodeId, "INTERPRETA", {
            year,
            context: `${doc.tipo || "Concepto"} DIAN ${doc.numero} interpreta Art. ${slug} ET`,
          });
        }
      }
    } catch {
      // Skip malformed files
    }
  }

  // 4. Process JURISPRUDENCIA (The Analyzers)
  const sentFiles = glob.sync("data/scraped/jurisprudencia/*.json");
  console.log(`[graph] Processing ${sentFiles.length} Jurisprudencia files...`);

  for (const file of sentFiles) {
    try {
      const raw = fs.readFileSync(file, "utf-8");
      const json = JSON.parse(raw);
      const docs = Array.isArray(json) ? json : [json];

      for (const doc of docs) {
        if (!doc.id) continue;
        const sentNodeId = doc.id;
        const year = doc.year || (doc.fecha ? parseInt(doc.fecha.slice(0, 4), 10) : undefined);

        addNode(sentNodeId, `Sentencia ${doc.tipo || ""}-${doc.numero} de ${year || "?"}`, "sentencia", {
          year,
          topic: doc.tema || "Jurisprudencia",
        });

        for (const slug of doc.articulosSlugs || []) {
          const etNodeId = `et-art-${slug}`;
          addNode(etNodeId, `Art. ${slug} ET`, "estatuto", {
            topic: inferTopicFromArt(slug),
          });
          addEdge(sentNodeId, etNodeId, "ANALIZA", {
            year,
            context: `Sentencia ${doc.tipo}-${doc.numero} analiza Art. ${slug} ET`,
          });
        }
      }
    } catch {
      // Skip malformed files
    }
  }

  // 5. Process RESOLUCIONES
  const resFiles = glob.sync("data/scraped/resoluciones/*.json");
  console.log(`[graph] Processing ${resFiles.length} Resolución files...`);

  for (const file of resFiles) {
    try {
      const raw = fs.readFileSync(file, "utf-8");
      const json = JSON.parse(raw);
      const docs = Array.isArray(json) ? json : [json];

      for (const doc of docs) {
        if (!doc.id) continue;
        const resNodeId = doc.id;
        const year = doc.year || (doc.fecha ? parseInt(doc.fecha.slice(0, 4), 10) : undefined);

        addNode(resNodeId, `Resolución DIAN ${doc.numero}`, "resolucion", {
          year,
          topic: doc.tema || "Resolución",
        });

        for (const slug of doc.articulosSlugs || []) {
          const etNodeId = `et-art-${slug}`;
          addNode(etNodeId, `Art. ${slug} ET`, "estatuto", {
            topic: inferTopicFromArt(slug),
          });
          addEdge(resNodeId, etNodeId, "REGLAMENTA", {
            year,
            context: `Resolución DIAN ${doc.numero} reglamenta Art. ${slug} ET`,
          });
        }
      }
    } catch {
      // Skip malformed files
    }
  }

  // Count by type and relation
  const byType: Record<string, number> = {};
  for (const node of nodes.values()) {
    byType[node.type] = (byType[node.type] || 0) + 1;
  }

  const byRelation: Record<string, number> = {};
  for (const edge of edges) {
    byRelation[edge.relation] = (byRelation[edge.relation] || 0) + 1;
  }

  // Final Assembly
  const graph: TaxGraph = {
    nodes: Array.from(nodes.values()),
    edges,
    metadata: {
      generatedAt: new Date().toISOString(),
      stats: {
        nodes: nodes.size,
        edges: edges.length,
        byType,
        byRelation,
      },
    },
  };

  // Write to both locations
  const graphDir = path.resolve("data/graph");
  if (!fs.existsSync(graphDir)) fs.mkdirSync(graphDir, { recursive: true });

  const outputPath = path.resolve("data/graph/tax-graph.json");
  fs.writeFileSync(outputPath, JSON.stringify(graph, null, 2));

  const publicOutputPath = path.resolve("public/data/graph-data.json");
  fs.writeFileSync(publicOutputPath, JSON.stringify(graph, null, 2));

  console.log(`\n=== Graph Build Stats ===`);
  console.log(`Total Nodes: ${nodes.size}`);
  for (const [type, count] of Object.entries(byType)) {
    console.log(`  ${type}: ${count}`);
  }
  console.log(`Total Edges: ${edges.length}`);
  for (const [rel, count] of Object.entries(byRelation)) {
    console.log(`  ${rel}: ${count}`);
  }
  console.log(`\nOutput: ${outputPath}`);
  console.log(`Output: ${publicOutputPath}`);
}

buildGraph().catch(console.error);
