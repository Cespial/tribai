/**
 * Smoke Test Suite — Fase 9
 *
 * 10 complex queries run through the RAG pipeline with pass/fail assertions.
 * Each query checks: expected articles retrieved, expected content present,
 * latency under threshold, confidence_level present.
 *
 * Usage: npx tsx eval/smoke-test.ts
 * Exit code: 0 if all pass, 1 if any fail.
 */

import { config } from "dotenv";
config({ path: ".env.local" });

import { enhanceQuery } from "../src/lib/rag/query-enhancer";
import { retrieve } from "../src/lib/rag/retriever";
import { heuristicRerank, heuristicRerankMultiSource } from "../src/lib/rag/reranker";
import { assembleContext, buildContextString } from "../src/lib/rag/context-assembler";
import { checkEvidence } from "../src/lib/rag/evidence-checker";
import { classifyQueryType, getQueryRoutingConfig } from "../src/lib/rag/namespace-router";
import { RAG_CONFIG } from "../src/config/constants";

interface SmokeTest {
  id: number;
  query: string;
  /** At least one of these articles must appear in context */
  expectedArticles: string[];
  /** At least one of these strings must appear in the context text (case-insensitive) */
  expectedContent: string[];
  /** Whether external sources (doctrina, jurisprudencia, etc.) are expected */
  expectExternalSources?: boolean;
  /** Max allowed latency in ms */
  maxLatencyMs: number;
}

const SMOKE_TESTS: SmokeTest[] = [
  {
    id: 1,
    query: "¿Cuál es la tarifa general del IVA?",
    expectedArticles: ["Art. 468"],
    expectedContent: ["19"],
    maxLatencyMs: 5000,
  },
  {
    id: 2,
    query: "¿Qué dice la doctrina DIAN sobre gastos de representación?",
    expectedArticles: ["Art. 107", "Art. 336-1", "Art. 356-1", "Art. 90"],
    expectedContent: ["gasto"],
    expectExternalSources: true,
    maxLatencyMs: 8000,
  },
  {
    id: 3,
    query: "Diferencia entre bienes excluidos y exentos de IVA",
    expectedArticles: ["Art. 424", "Art. 477"],
    expectedContent: ["excluido", "exento"],
    maxLatencyMs: 8000,
  },
  {
    id: 4,
    query: "¿Cómo se calcula la retención en la fuente por salarios?",
    expectedArticles: ["Art. 383", "Art. 384", "Art. 388", "Art. 395"],
    expectedContent: ["retención"],
    maxLatencyMs: 8000,
  },
  {
    id: 5,
    query: "¿Qué cambios hizo la Ley 2277 de 2022 al Art. 240?",
    expectedArticles: ["Art. 240"],
    expectedContent: ["35", "2277"],
    maxLatencyMs: 8000,
  },
  {
    id: 6,
    query: "¿Debo declarar renta?",
    expectedArticles: ["Art. 592", "Art. 593", "Art. 594", "Art. 6", "Art. 210", "Art. 244"],
    expectedContent: ["renta"],
    maxLatencyMs: 8000,
  },
  {
    id: 7,
    query: "¿Cuál es la sanción por no presentar declaración de renta?",
    expectedArticles: ["Art. 641", "Art. 643", "Art. 644", "Art. 260-9", "Art. 244"],
    expectedContent: ["sanción"],
    maxLatencyMs: 8000,
  },
  {
    id: 8,
    query: "Art. 240-1 tarifa zonas francas",
    expectedArticles: ["Art. 240-1"],
    expectedContent: ["20", "zona"],
    maxLatencyMs: 5000,
  },
  {
    id: 9,
    query: "¿Los dividendos de una SAS a persona natural tributan?",
    expectedArticles: ["Art. 242", "Art. 49"],
    expectedContent: ["dividendo"],
    maxLatencyMs: 8000,
  },
  {
    id: 10,
    query: "¿Qué es la renta presuntiva actualmente?",
    expectedArticles: ["Art. 188"],
    expectedContent: ["presuntiva"],
    maxLatencyMs: 8000,
  },
];

interface TestResult {
  id: number;
  query: string;
  passed: boolean;
  failures: string[];
  latencyMs: number;
  articlesFound: string[];
  confidenceLevel: string;
  externalSources: number;
}

async function runSmokeTest(test: SmokeTest): Promise<TestResult> {
  const failures: string[] = [];
  const start = performance.now();

  try {
    // 1. Enhance query
    const enhanced = await enhanceQuery(test.query, {
      useHyDE: RAG_CONFIG.useHyDE,
      useQueryExpansion: RAG_CONFIG.useQueryExpansion,
    });

    // 2. Classify and route
    const queryType = classifyQueryType(test.query);
    const routingConfig = getQueryRoutingConfig(queryType);

    // 3. Retrieve
    const retrievalResult = await retrieve(enhanced, {
      topK: routingConfig.topK,
    });

    // 4. Rerank
    const reranked = heuristicRerank(
      retrievalResult.chunks,
      enhanced,
      routingConfig.maxRerankedResults,
      retrievalResult.queryType
    );

    const rerankedMultiSource = retrievalResult.multiSourceChunks
      ? heuristicRerankMultiSource(
          retrievalResult.multiSourceChunks,
          enhanced,
          undefined,
          retrievalResult.retrievedArticleSlugs
        )
      : [];

    // 5. Assemble context
    const context = await assembleContext(reranked, {
      useSiblingRetrieval: RAG_CONFIG.useSiblingRetrieval,
      multiSourceChunks: rerankedMultiSource,
    });

    // 6. Evidence check
    const scores = retrievalResult.chunks.map((c) => c.score).sort((a, b) => b - a);
    const topScore = scores[0] ?? 0;
    const medianScore = scores[Math.floor(scores.length / 2)] ?? 0;
    const evidence = checkEvidence(context, topScore, medianScore);

    const latencyMs = Math.round(performance.now() - start);

    // Build context string for content assertions
    const contextString = buildContextString(context).toLowerCase();
    const articlesFound = context.articles.map((a) => a.idArticulo);

    // --- Assertions ---

    // A1: At least one expected article must be in context
    const hasExpectedArticle = test.expectedArticles.some((art) =>
      articlesFound.some((found) => found.includes(art.replace("Art. ", "")))
    );
    if (!hasExpectedArticle) {
      failures.push(
        `ARTICLE: Expected one of [${test.expectedArticles.join(", ")}], found [${articlesFound.join(", ")}]`
      );
    }

    // A2: Expected content must appear in context
    for (const content of test.expectedContent) {
      if (!contextString.includes(content.toLowerCase())) {
        failures.push(`CONTENT: Expected "${content}" in context`);
      }
    }

    // A3: Latency must be under threshold
    if (latencyMs > test.maxLatencyMs) {
      failures.push(
        `LATENCY: ${latencyMs}ms exceeds max ${test.maxLatencyMs}ms`
      );
    }

    // A4: confidence_level must be present
    if (!evidence.confidenceLevel) {
      failures.push("CONFIDENCE: confidence_level missing");
    }

    // A5: External sources if expected
    if (test.expectExternalSources && context.externalSources.length === 0) {
      failures.push("EXTERNAL: Expected external sources but none in context");
    }

    return {
      id: test.id,
      query: test.query,
      passed: failures.length === 0,
      failures,
      latencyMs,
      articlesFound,
      confidenceLevel: evidence.confidenceLevel,
      externalSources: context.externalSources.length,
    };
  } catch (error) {
    const latencyMs = Math.round(performance.now() - start);
    return {
      id: test.id,
      query: test.query,
      passed: false,
      failures: [`ERROR: ${(error as Error).message}`],
      latencyMs,
      articlesFound: [],
      confidenceLevel: "unknown",
      externalSources: 0,
    };
  }
}

async function main() {
  console.log("=== SMOKE TEST SUITE — Fase 9 ===\n");
  console.log(`Running ${SMOKE_TESTS.length} smoke tests...\n`);

  const results: TestResult[] = [];

  for (const test of SMOKE_TESTS) {
    process.stdout.write(`  [${test.id}/10] ${test.query.slice(0, 60).padEnd(60)} `);
    const result = await runSmokeTest(test);
    results.push(result);

    if (result.passed) {
      console.log(`PASS  (${result.latencyMs}ms, ${result.confidenceLevel}, ${result.articlesFound.length} arts, ${result.externalSources} ext)`);
    } else {
      console.log(`FAIL  (${result.latencyMs}ms)`);
      for (const f of result.failures) {
        console.log(`        -> ${f}`);
      }
    }
  }

  // Summary
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;
  const avgLatency = Math.round(
    results.reduce((s, r) => s + r.latencyMs, 0) / results.length
  );

  console.log(`\n${"=".repeat(80)}`);
  console.log(`  SMOKE TEST RESULTS: ${passed}/${SMOKE_TESTS.length} passed, ${failed} failed`);
  console.log(`  Average latency: ${avgLatency}ms`);
  console.log(`${"=".repeat(80)}\n`);

  if (failed > 0) {
    console.log("FAILED TESTS:");
    for (const r of results.filter((r) => !r.passed)) {
      console.log(`  #${r.id}: ${r.query}`);
      for (const f of r.failures) {
        console.log(`    -> ${f}`);
      }
    }
    process.exit(1);
  }

  console.log("All smoke tests passed.");
  process.exit(0);
}

main().catch((err) => {
  console.error("Smoke test suite crashed:", err);
  process.exit(1);
});
