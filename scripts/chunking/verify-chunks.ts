/**
 * Chunk Verification Script (Fase 2)
 *
 * Loads all ET articles, chunks them with the improved legal-chunker,
 * and produces statistics to verify chunking quality.
 *
 * Usage:
 *   npx tsx scripts/chunking/verify-chunks.ts
 *   npx tsx scripts/chunking/verify-chunks.ts --verbose   # Show problem chunks
 */

import * as fs from "fs";
import * as path from "path";
import { chunkLegalText } from "./legal-chunker";

interface ArticleJSON {
  id_articulo: string;
  titulo: string;
  titulo_corto: string;
  slug: string;
  url_origen: string;
  libro: string;
  libro_full: string;
  estado: string;
  complexity_score: number;
  contenido_texto: string;
  modificaciones_raw: string;
  total_modificaciones: number;
  ultima_modificacion_year: number;
  leyes_modificatorias: string[];
  texto_derogado: string[];
  cross_references: string[];
  referenced_by: string[];
  concordancias: string;
}

const CHARS_PER_TOKEN = 3.5;
const verbose = process.argv.includes("--verbose");

function estimateTokens(text: string): number {
  return Math.ceil(text.length / CHARS_PER_TOKEN);
}

async function main() {
  const articlesDir = path.resolve("public/data/articles");
  const files = fs.readdirSync(articlesDir).filter((f) => f.endsWith(".json"));
  console.log(`Found ${files.length} articles\n`);

  let totalChunks = 0;
  const chunksByType: Record<string, number> = {
    contenido: 0,
    modificaciones: 0,
    texto_anterior: 0,
  };
  const chunkSizes: number[] = [];
  let paragrafosCutMid = 0;
  let chunksWithCrossRefs = 0;
  let chunksWithVigencia = 0;
  let articlesWithConcordancias = 0;
  let totalCrossRefs = 0;
  const problemChunks: Array<{ article: string; type: string; issue: string; snippet: string }> = [];

  for (const file of files) {
    const raw = fs.readFileSync(path.join(articlesDir, file), "utf-8");
    const article: ArticleJSON = JSON.parse(raw);

    // Merge cross_references with concordancias
    const crossRefs = [...(article.cross_references || [])];
    if (article.concordancias) {
      const concordMatches = article.concordancias.matchAll(/Art(?:s?\.?\s*)(\d+(?:-\d+)?)/gi);
      for (const m of concordMatches) {
        if (!crossRefs.includes(m[1])) crossRefs.push(m[1]);
      }
    }

    if (article.concordancias && article.concordancias.length > 10) {
      articlesWithConcordancias++;
    }

    const leyVigente = article.leyes_modificatorias.length > 0
      ? article.leyes_modificatorias[0]
      : undefined;

    const baseMetadata = {
      id_articulo: article.id_articulo,
      cross_ref_articles: crossRefs,
      vigencia_desde: article.ultima_modificacion_year || undefined,
      ley_vigente: leyVigente,
    };

    // Chunk each text type
    const chunkTypes = [
      { type: "contenido", text: article.contenido_texto },
      { type: "modificaciones", text: article.modificaciones_raw },
      { type: "texto_anterior", text: article.texto_derogado.join("\n\n") },
    ];

    for (const { type, text } of chunkTypes) {
      if (!text || text.trim().length < 50) continue;

      const chunks = chunkLegalText(text, { ...baseMetadata, chunk_type: type });
      totalChunks += chunks.length;
      chunksByType[type] = (chunksByType[type] || 0) + chunks.length;

      for (const chunk of chunks) {
        const tokens = estimateTokens(chunk.text);
        chunkSizes.push(tokens);

        // Check for cross_refs
        if (crossRefs.length > 0) chunksWithCrossRefs++;
        totalCrossRefs += crossRefs.length;

        // Check for vigencia
        if (leyVigente || article.ultima_modificacion_year) chunksWithVigencia++;

        // Check: was a parágrafo cut mid-content?
        const paragrafoPattern = /PAR[AÁ]GRAFO\s+(?:TRANSITORIO\s+)?(?:\d|\.)/i;
        if (paragrafoPattern.test(chunk.text)) {
          // Check if chunk ends mid-paragraph (doesn't end with period or colon)
          const trimmed = chunk.text.trim();
          const lastChar = trimmed[trimmed.length - 1];
          if (lastChar !== "." && lastChar !== ":" && lastChar !== ";") {
            // Check if the next chunk would start with lowercase (continuation)
            // This is a heuristic — if chunk ends without punctuation, likely cut mid-content
            paragrafosCutMid++;
            problemChunks.push({
              article: article.id_articulo,
              type,
              issue: "Parágrafo may be cut mid-content",
              snippet: `...${trimmed.slice(-100)}`,
            });
          }
        }
      }
    }
  }

  // Statistics
  const avgSize = chunkSizes.reduce((a, b) => a + b, 0) / chunkSizes.length;
  const sortedSizes = [...chunkSizes].sort((a, b) => a - b);
  const medianSize = sortedSizes[Math.floor(sortedSizes.length / 2)];
  const p95Size = sortedSizes[Math.floor(sortedSizes.length * 0.95)];
  const minSize = sortedSizes[0];
  const maxSize = sortedSizes[sortedSizes.length - 1];
  const under100 = chunkSizes.filter((s) => s < 100).length;
  const over768 = chunkSizes.filter((s) => s > 768).length;

  console.log("=== CHUNK VERIFICATION REPORT ===\n");
  console.log(`Total articles: ${files.length}`);
  console.log(`Total chunks: ${totalChunks}`);
  console.log(`Avg chunks/article: ${(totalChunks / files.length).toFixed(1)}\n`);

  console.log("--- Chunks by Type ---");
  for (const [type, count] of Object.entries(chunksByType)) {
    console.log(`  ${type}: ${count}`);
  }

  console.log("\n--- Chunk Size (tokens) ---");
  console.log(`  Min: ${minSize}`);
  console.log(`  Avg: ${Math.round(avgSize)}`);
  console.log(`  Median: ${medianSize}`);
  console.log(`  P95: ${p95Size}`);
  console.log(`  Max: ${maxSize}`);
  console.log(`  Under 100 tokens: ${under100} (${((under100 / totalChunks) * 100).toFixed(1)}%)`);
  console.log(`  Over 768 tokens: ${over768} (${((over768 / totalChunks) * 100).toFixed(1)}%)`);

  console.log("\n--- Metadata Quality ---");
  console.log(`  Articles with concordancias: ${articlesWithConcordancias}`);
  console.log(`  Chunks with cross_ref_articles: ${chunksWithCrossRefs} (${((chunksWithCrossRefs / totalChunks) * 100).toFixed(1)}%)`);
  console.log(`  Avg cross_refs per chunk: ${(totalCrossRefs / totalChunks).toFixed(1)}`);
  console.log(`  Chunks with vigencia metadata: ${chunksWithVigencia} (${((chunksWithVigencia / totalChunks) * 100).toFixed(1)}%)`);

  console.log("\n--- Boundary Quality ---");
  console.log(`  Parágrafos potentially cut mid-content: ${paragrafosCutMid}`);
  console.log(`  Cut rate: ${((paragrafosCutMid / totalChunks) * 100).toFixed(2)}%`);

  if (verbose && problemChunks.length > 0) {
    console.log(`\n--- Problem Chunks (first 20) ---`);
    for (const pc of problemChunks.slice(0, 20)) {
      console.log(`  [${pc.article}] ${pc.type}: ${pc.issue}`);
      console.log(`    ${pc.snippet}\n`);
    }
  }

  console.log("\n=== DONE ===");
}

main().catch(console.error);
