/**
 * Graph Retriever
 *
 * Provides semantic connections for retrieved documents using the Tax Knowledge Graph.
 * When a vector search finds "Art. 240", this module finds "Decree 1625 Art. 1.2..."
 */

// Types matching build-graph.ts output
interface TaxNode {
  id: string;
  label: string;
  type: string;
  group?: string;
}

interface TaxEdge {
  source: string;
  target: string;
  relation: string;
  type?: string;
  context?: string;
}

interface TaxGraph {
  nodes: TaxNode[];
  edges: TaxEdge[];
}

let cachedGraph: TaxGraph | null = null;

function loadGraph(): TaxGraph {
  if (cachedGraph) return cachedGraph;

  try {
    // Try multiple paths: public/data for Vercel, data/graph for local scripts
    const paths = [
      `${process.cwd()}/public/data/graph-data.json`,
      `${process.cwd()}/data/graph/tax-graph.json`,
    ];

    for (const graphPath of paths) {
      try {
        // Use dynamic import-friendly approach that works in both Node and Edge
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const fs = require("fs");
        if (fs.existsSync(graphPath)) {
          const raw = fs.readFileSync(graphPath, "utf-8");
          cachedGraph = JSON.parse(raw);
          console.log(`[graph-retriever] Loaded graph from ${graphPath} with ${cachedGraph?.nodes.length} nodes`);
          return cachedGraph!;
        }
      } catch {
        continue;
      }
    }

    console.warn("[graph-retriever] Graph file not found in any expected location");
    return { nodes: [], edges: [] };
  } catch (error) {
    console.error("[graph-retriever] Failed to load graph:", error);
    return { nodes: [], edges: [] };
  }
}

// Relation weights for scoring — higher weight = more relevant connection
const RELATION_WEIGHTS: Record<string, number> = {
  MODIFICA: 1.0,
  MODIFIES: 1.0,
  REGLAMENTA: 0.8,
  REGULATES: 0.8,
  INTERPRETA: 0.6,
  INTERPRETS: 0.6,
  ANALIZA: 0.5,
  REFERENCIA: 0.4,
  REFERENCES: 0.4,
  CITED_IN: 0.3,
};

export interface GraphContext {
  sourceId: string;
  relatedId: string;
  relation: string;
  snippet?: string;
  depth: number;
  weight: number;
}

/**
 * Centralized graph ID normalization.
 * Converts various ID formats to the graph's "et-art-NUM" format.
 * Handles: "Art. 240", "Art. 240-1", "Art. 260-1", "art-240", "et-art-240", "240"
 */
export function normalizeGraphId(idArticulo: string): string {
  // Already normalized
  if (idArticulo.startsWith("et-art-")) return idArticulo;

  // Clean prefixes and extract the number(s)
  const cleaned = idArticulo
    .replace(/^Art[íi]culo\s*/i, "")
    .replace(/^Art\.\s*/i, "")
    .replace(/^art-/i, "")
    .trim();

  // Extract compound article pattern: "240-1", "260-1", "23-1", "240", "606-1"
  const match = cleaned.match(/^(\d+(?:-\d+)*)$/);
  if (match) return `et-art-${match[1]}`;

  // Handle "Parágrafo X del Art. Y" → normalize to the article
  const paraMatch = cleaned.match(/par[aá]grafo\s+\w+\s+(?:del\s+)?(?:art[íi]culo\s+)?(\d+(?:-\d+)*)/i);
  if (paraMatch) return `et-art-${paraMatch[1]}`;

  // If it's a complex format, try to extract number
  const numMatch = cleaned.match(/(\d+(?:-\d+)*)/);
  if (numMatch) return `et-art-${numMatch[1]}`;

  return `et-art-${cleaned.toLowerCase().replace(/\s+/g, "-")}`;
}

/**
 * Given a list of document IDs, find related documents in the graph.
 * Supports BFS traversal up to configurable depth with decay.
 */
export function getRelatedContext(docIds: string[], maxDepth = 2): GraphContext[] {
  const graph = loadGraph();
  if (graph.edges.length === 0) return [];

  const visited = new Set<string>();
  const results: GraphContext[] = [];
  let currentLevel = [...docIds];

  for (let depth = 0; depth < maxDepth; depth++) {
    const nextLevel: string[] = [];
    const decayFactor = Math.pow(0.7, depth);

    for (const id of currentLevel) {
      if (visited.has(id)) continue;
      visited.add(id);

      for (const edge of graph.edges) {
        // Check outgoing edges (Source -> Target)
        if (edge.source === id && !visited.has(edge.target)) {
          const weight = (RELATION_WEIGHTS[edge.relation] ?? 0.3) * decayFactor;
          results.push({
            sourceId: edge.source,
            relatedId: edge.target,
            relation: edge.relation,
            snippet: edge.context,
            depth,
            weight,
          });
          nextLevel.push(edge.target);
        }

        // Check incoming edges (Target <- Source)
        if (edge.target === id && !visited.has(edge.source)) {
          const weight = (RELATION_WEIGHTS[edge.relation] ?? 0.3) * decayFactor;
          results.push({
            sourceId: edge.target,
            relatedId: edge.source,
            relation: `INVERSE_${edge.relation}`,
            snippet: edge.context,
            depth,
            weight,
          });
          nextLevel.push(edge.source);
        }
      }
    }

    currentLevel = nextLevel;
  }

  // Sort by weight descending
  return results.sort((a, b) => b.weight - a.weight);
}

/**
 * Get specific regulations for an article
 */
export function getRegulations(articleId: string): string[] {
  const graph = loadGraph();
  return graph.edges
    .filter((e) => e.target === articleId && e.relation === "REGULATES")
    .map((e) => e.source);
}

/**
 * Get modifications history for an article
 */
export function getModifications(articleId: string): string[] {
  const graph = loadGraph();
  return graph.edges
    .filter((e) => e.target === articleId && e.relation === "MODIFIES")
    .map((e) => e.source);
}
