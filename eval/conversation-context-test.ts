/**
 * Conversation Context Test Suite
 *
 * Tests multi-turn conversational context: verifies that follow-up questions
 * correctly resolve references from previous turns and that the query enhancer
 * produces accurate rewrites when conversation history is present.
 *
 * Metrics tested:
 * 1. Reference resolution — follow-up queries find correct articles
 * 2. Query rewriting quality — Haiku contextualizes ambiguous queries
 * 3. Topic isolation — unrelated follow-ups don't carry wrong context
 * 4. RAG precision — retrieved articles match expected for each turn
 * 5. Evidence quality — confidence levels remain high across turns
 * 6. Latency impact — conversation context doesn't degrade performance
 *
 * Usage: npx tsx eval/conversation-context-test.ts
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

// ─── Types ───────────────────────────────────────────────────────────────────

interface ConversationTurn {
  role: "user" | "assistant";
  content: string;
}

interface ConversationTestCase {
  id: string;
  name: string;
  /** Description of what this test verifies */
  description: string;
  /** Simulated conversation turns before the test query */
  previousTurns: ConversationTurn[];
  /** The follow-up query to test */
  query: string;
  /** At least one of these articles must appear in context */
  expectedArticles: string[];
  /** At least one of these strings must appear in context (case-insensitive) */
  expectedContent: string[];
  /** The rewritten query should contain at least one of these terms */
  expectedRewriteContains?: string[];
  /** The rewritten query should NOT contain these terms (topic isolation) */
  rewriteShouldNotContain?: string[];
  /** Max allowed latency in ms */
  maxLatencyMs: number;
  /** Whether external sources are expected */
  expectExternalSources?: boolean;
  /** Minimum expected confidence level */
  minConfidence?: "high" | "medium" | "low";
}

interface TestResult {
  id: string;
  name: string;
  passed: boolean;
  failures: string[];
  latencyMs: number;
  rewrittenQuery: string;
  articlesFound: string[];
  confidenceLevel: string;
  evidenceQuality: number;
  externalSources: number;
  degradedMode: boolean;
}

// ─── Test Cases ──────────────────────────────────────────────────────────────

const CONVERSATION_TESTS: ConversationTestCase[] = [
  // ── Group 1: Basic reference resolution ─────────────────────────────────
  {
    id: "conv-01",
    name: "IVA follow-up: excepciones",
    description: "After asking about IVA rate, user asks about exceptions — should find excluidos/exentos articles",
    previousTurns: [
      { role: "user", content: "¿Cuál es la tarifa general del IVA en Colombia?" },
      { role: "assistant", content: "La tarifa general del impuesto sobre las ventas (IVA) en Colombia es del 19%, según el artículo 468 del Estatuto Tributario." },
    ],
    query: "¿Y cuáles son las excepciones?",
    expectedArticles: ["Art. 424", "Art. 476", "Art. 477"],
    expectedContent: ["excluido", "exento", "exención"],
    expectedRewriteContains: ["IVA", "exclu", "exen", "impuesto sobre las ventas"],
    maxLatencyMs: 10000,
  },
  {
    id: "conv-02",
    name: "Renta PN follow-up: tarifa",
    description: "After discussing renta for personas naturales, 'cuánto es?' should find tarifa PN",
    previousTurns: [
      { role: "user", content: "¿Quiénes deben declarar renta como persona natural?" },
      { role: "assistant", content: "Según los artículos 592 a 594 del ET, las personas naturales deben declarar renta cuando superen ciertos topes de ingresos, patrimonio, consignaciones o compras." },
    ],
    query: "¿Y cuánto es la tarifa?",
    expectedArticles: ["Art. 241", "Art. 240", "Art. 242"],
    expectedContent: ["tarifa", "persona"],
    expectedRewriteContains: ["tarifa", "renta", "persona", "natural"],
    maxLatencyMs: 10000,
  },
  {
    id: "conv-03",
    name: "Retención salarios follow-up: porcentaje",
    description: "After discussing retención por salarios, '¿cuánto me descuentan?' should stay in salary context",
    previousTurns: [
      { role: "user", content: "¿Cómo funciona la retención en la fuente por salarios?" },
      { role: "assistant", content: "La retención en la fuente por salarios se calcula según el Art. 383 del ET, aplicando una tabla progresiva sobre el ingreso mensual del trabajador, después de restar los ingresos no constitutivos de renta y las deducciones." },
    ],
    query: "¿Cuáles son los porcentajes?",
    expectedArticles: ["Art. 383"],
    expectedContent: ["retención", "salario"],
    expectedRewriteContains: ["retención", "salario", "porcentaje", "tarifa"],
    maxLatencyMs: 10000,
  },

  // ── Group 2: Multi-turn deeper context ──────────────────────────────────
  {
    id: "conv-04",
    name: "3-turn conversation: dividendos chain",
    description: "Three turns about dividends, asking about a specific detail",
    previousTurns: [
      { role: "user", content: "¿Los dividendos tributan en Colombia?" },
      { role: "assistant", content: "Sí, los dividendos tributan en Colombia. Para personas naturales residentes, el Art. 242 del ET establece una tarifa especial." },
      { role: "user", content: "¿Y para personas jurídicas?" },
      { role: "assistant", content: "Para las personas jurídicas, los dividendos recibidos de otras sociedades nacionales son no gravados según el Art. 49, siempre que provengan de utilidades que ya tributaron." },
    ],
    query: "¿Qué pasa si son de una empresa del exterior?",
    expectedArticles: ["Art. 245", "Art. 254"],
    expectedContent: ["dividendo", "exterior"],
    expectedRewriteContains: ["dividendo", "exterior", "extranjera"],
    maxLatencyMs: 10000,
  },
  {
    id: "conv-05",
    name: "3-turn: sanciones chain",
    description: "After discussing extemporaneidad, user asks about reducing the sanction",
    previousTurns: [
      { role: "user", content: "¿Cuál es la sanción por presentar una declaración extemporánea?" },
      { role: "assistant", content: "Según el Art. 641 del ET, la sanción por extemporaneidad es del 5% del impuesto a cargo por cada mes o fracción de mes de retardo, sin exceder el 100%." },
      { role: "user", content: "¿Y si me doy cuenta del error yo mismo?" },
      { role: "assistant", content: "Si presenta la declaración antes de que la DIAN le emplace, la sanción se reduce. Esto es la sanción reducida por corrección del Art. 644." },
    ],
    query: "¿Cómo puedo reducirla aún más?",
    expectedArticles: ["Art. 640", "Art. 641", "Art. 644"],
    expectedContent: ["sanción", "reduc"],
    expectedRewriteContains: ["sanción", "reduc", "disminu"],
    maxLatencyMs: 10000,
  },

  // ── Group 3: Topic isolation ────────────────────────────────────────────
  {
    id: "conv-06",
    name: "Topic switch: IVA → renta (clean break)",
    description: "After discussing IVA, user asks about renta — should NOT carry IVA context into renta query",
    previousTurns: [
      { role: "user", content: "¿Cuál es la tarifa del IVA?" },
      { role: "assistant", content: "La tarifa general del IVA es del 19% según el Art. 468 del ET." },
    ],
    query: "¿Cuáles son las deducciones permitidas en renta para personas naturales?",
    expectedArticles: ["Art. 336", "Art. 387", "Art. 119"],
    expectedContent: ["deducci", "renta"],
    rewriteShouldNotContain: ["IVA", "impuesto sobre las ventas"],
    maxLatencyMs: 10000,
  },
  {
    id: "conv-07",
    name: "Independent query with history present",
    description: "User asks a completely new topic — history should not interfere",
    previousTurns: [
      { role: "user", content: "¿Qué es la retención en la fuente?" },
      { role: "assistant", content: "La retención en la fuente es un mecanismo de recaudo anticipado del impuesto." },
      { role: "user", content: "¿Cuáles son las bases mínimas?" },
      { role: "assistant", content: "Las bases mínimas varían según el concepto de pago, establecidas en los Arts. 383 y 392 del ET." },
    ],
    query: "¿Qué es el impuesto de timbre y cuándo aplica?",
    expectedArticles: ["Art. 519"],
    expectedContent: ["timbre"],
    maxLatencyMs: 10000,
  },

  // ── Group 4: Pronoun/implicit reference resolution ──────────────────────
  {
    id: "conv-08",
    name: "Pronoun resolution: 'eso' referring to previous topic",
    description: "User uses 'eso' to refer to zona franca tariff discussed before",
    previousTurns: [
      { role: "user", content: "¿Cuál es la tarifa de renta para zonas francas?" },
      { role: "assistant", content: "Las zonas francas tienen una tarifa especial del 20% según el Art. 240-1 del ET, para usuarios industriales de bienes y servicios." },
    ],
    query: "¿Qué requisitos hay para acceder a eso?",
    expectedArticles: ["Art. 240-1"],
    expectedContent: ["zona franca", "requisit"],
    expectedRewriteContains: ["zona franca", "requisit"],
    maxLatencyMs: 10000,
  },
  {
    id: "conv-09",
    name: "Implicit reference: 'el artículo' without number",
    description: "User references 'el artículo' after a specific one was discussed",
    previousTurns: [
      { role: "user", content: "¿Qué dice el artículo 588 del ET?" },
      { role: "assistant", content: "El artículo 588 del ET regula las correcciones de declaraciones tributarias que aumentan el impuesto a cargo o disminuyen el saldo a favor." },
    ],
    query: "¿Tiene algún parágrafo?",
    expectedArticles: ["Art. 588"],
    expectedContent: ["588"],
    expectedRewriteContains: ["588", "parágrafo"],
    maxLatencyMs: 10000,
  },

  // ── Group 5: Edge cases ─────────────────────────────────────────────────
  {
    id: "conv-10",
    name: "Very short follow-up: 'y el plazo?'",
    description: "Minimal follow-up after discussing declaración de renta",
    previousTurns: [
      { role: "user", content: "¿Quiénes deben declarar renta en 2026?" },
      { role: "assistant", content: "Deben declarar renta las personas naturales que superen los topes del Art. 592 del ET: ingresos brutos superiores a 1.400 UVT." },
    ],
    query: "¿Y el plazo?",
    expectedArticles: ["Art. 592", "Art. 603", "Art. 811"],
    expectedContent: ["plazo", "declar"],
    expectedRewriteContains: ["plazo", "declaración", "renta"],
    maxLatencyMs: 10000,
  },
  {
    id: "conv-11",
    name: "Comparison follow-up: 'vs el otro régimen'",
    description: "After discussing régimen ordinario, user asks about comparison with SIMPLE",
    previousTurns: [
      { role: "user", content: "¿Cómo funciona el régimen ordinario de renta?" },
      { role: "assistant", content: "En el régimen ordinario, las personas naturales y jurídicas calculan su impuesto de renta sobre la renta líquida gravable, aplicando las tarifas de los Arts. 240 y 241." },
    ],
    query: "¿Y cómo se compara con el régimen SIMPLE?",
    expectedArticles: ["Art. 903", "Art. 904", "Art. 905", "Art. 910", "Art. 916"],
    expectedContent: ["SIMPLE", "régimen"],
    expectedRewriteContains: ["SIMPLE", "régimen", "compar"],
    maxLatencyMs: 10000,
  },
  {
    id: "conv-12",
    name: "Numeric reference: 'esa tarifa del 35%'",
    description: "User references a specific number from previous context",
    previousTurns: [
      { role: "user", content: "¿Cuál es la tarifa de renta para personas jurídicas?" },
      { role: "assistant", content: "La tarifa general del impuesto de renta para personas jurídicas es del 35% según el Art. 240 del ET, vigente desde la Ley 2277 de 2022." },
    ],
    query: "¿Hay alguna excepción a esa tarifa del 35%?",
    expectedArticles: ["Art. 240", "Art. 240-1"],
    expectedContent: ["tarifa", "35"],
    expectedRewriteContains: ["tarifa", "renta", "persona jurídica", "excepción"],
    maxLatencyMs: 10000,
  },
];

// ─── Test Runner ─────────────────────────────────────────────────────────────

function buildTestConversationHistory(turns: ConversationTurn[]): string {
  if (turns.length === 0) return "";
  const summary = turns
    .map((t) => {
      const label = t.role === "user" ? "Usuario" : "Asistente";
      const truncated = t.content.length > 400 ? t.content.slice(0, 400) + "..." : t.content;
      return `${label}: ${truncated}`;
    })
    .join("\n");
  return summary;
}

async function runConversationTest(test: ConversationTestCase): Promise<TestResult> {
  const failures: string[] = [];
  const start = performance.now();

  try {
    // Build conversation history from previous turns
    const conversationHistory = buildTestConversationHistory(test.previousTurns);

    // 1. Enhance query WITH conversation history (the key change being tested)
    const enhanced = await enhanceQuery(test.query, {
      useHyDE: RAG_CONFIG.useHyDE,
      useQueryExpansion: RAG_CONFIG.useQueryExpansion,
      conversationHistory,
    });

    // 2. Classify and route
    const queryType = classifyQueryType(enhanced.rewritten);
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

    const degradedMode = enhanced.degraded ?? false;
    const latencyMs = Math.round(performance.now() - start);

    // Build context string for content assertions
    const contextString = buildContextString(context).toLowerCase();
    const articlesFound = context.articles.map((a) => a.idArticulo);

    // ─── Assertions ────────────────────────────────────────────────────

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
    const hasExpectedContent = test.expectedContent.some((content) =>
      contextString.includes(content.toLowerCase())
    );
    if (!hasExpectedContent) {
      failures.push(
        `CONTENT: Expected one of [${test.expectedContent.join(", ")}] in context`
      );
    }

    // A3: Rewrite quality — rewritten query should contain contextual terms
    if (test.expectedRewriteContains && test.expectedRewriteContains.length > 0) {
      const rewrittenLower = enhanced.rewritten.toLowerCase();
      const hasRewriteTerm = test.expectedRewriteContains.some((term) =>
        rewrittenLower.includes(term.toLowerCase())
      );
      if (!hasRewriteTerm) {
        failures.push(
          `REWRITE: Expected one of [${test.expectedRewriteContains.join(", ")}] in rewritten query "${enhanced.rewritten}"`
        );
      }
    }

    // A4: Topic isolation — rewrite should NOT contain certain terms
    if (test.rewriteShouldNotContain && test.rewriteShouldNotContain.length > 0) {
      const rewrittenLower = enhanced.rewritten.toLowerCase();
      for (const term of test.rewriteShouldNotContain) {
        if (rewrittenLower.includes(term.toLowerCase())) {
          failures.push(
            `ISOLATION: Rewritten query "${enhanced.rewritten}" should NOT contain "${term}"`
          );
        }
      }
    }

    // A5: Latency must be under threshold
    if (latencyMs > test.maxLatencyMs) {
      failures.push(`LATENCY: ${latencyMs}ms exceeds max ${test.maxLatencyMs}ms`);
    }

    // A6: Confidence level check
    if (test.minConfidence) {
      const levelOrder = { high: 3, medium: 2, low: 1 };
      const actual = levelOrder[evidence.confidenceLevel as keyof typeof levelOrder] ?? 0;
      const expected = levelOrder[test.minConfidence];
      if (actual < expected) {
        failures.push(
          `CONFIDENCE: Expected at least "${test.minConfidence}", got "${evidence.confidenceLevel}"`
        );
      }
    }

    // A7: External sources if expected
    if (test.expectExternalSources && context.externalSources.length === 0) {
      failures.push("EXTERNAL: Expected external sources but none in context");
    }

    return {
      id: test.id,
      name: test.name,
      passed: failures.length === 0,
      failures,
      latencyMs,
      rewrittenQuery: enhanced.rewritten,
      articlesFound,
      confidenceLevel: evidence.confidenceLevel,
      evidenceQuality: Math.round(evidence.evidenceQuality * 100) / 100,
      externalSources: context.externalSources.length,
      degradedMode,
    };
  } catch (error) {
    const latencyMs = Math.round(performance.now() - start);
    return {
      id: test.id,
      name: test.name,
      passed: false,
      failures: [`ERROR: ${(error as Error).message}`],
      latencyMs,
      rewrittenQuery: "",
      articlesFound: [],
      confidenceLevel: "unknown",
      evidenceQuality: 0,
      externalSources: 0,
      degradedMode: true,
    };
  }
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log("=== CONVERSATION CONTEXT TEST SUITE ===\n");
  console.log(`Running ${CONVERSATION_TESTS.length} conversation context tests...\n`);

  const results: TestResult[] = [];
  const groupNames = [
    "Basic reference resolution",
    "Multi-turn deeper context",
    "Topic isolation",
    "Pronoun/implicit reference",
    "Edge cases",
  ];

  let currentGroup = -1;
  for (const test of CONVERSATION_TESTS) {
    // Print group headers
    const groupIndex = test.id === "conv-01" ? 0
      : test.id === "conv-04" ? 1
      : test.id === "conv-06" ? 2
      : test.id === "conv-08" ? 3
      : test.id === "conv-10" ? 4
      : -1;
    if (groupIndex >= 0 && groupIndex !== currentGroup) {
      currentGroup = groupIndex;
      console.log(`\n  ── ${groupNames[groupIndex]} ${"─".repeat(50)}\n`);
    }

    process.stdout.write(`  [${test.id}] ${test.name.padEnd(50)} `);
    const result = await runConversationTest(test);
    results.push(result);

    if (result.passed) {
      console.log(
        `PASS  (${result.latencyMs}ms, ${result.confidenceLevel}, eq:${result.evidenceQuality}, ${result.articlesFound.length} arts)`
      );
      // Show rewritten query for debugging
      if (result.rewrittenQuery !== test.query) {
        console.log(`        rewrite: "${result.rewrittenQuery.slice(0, 100)}"`);
      }
    } else {
      console.log(`FAIL  (${result.latencyMs}ms)`);
      if (result.rewrittenQuery) {
        console.log(`        rewrite: "${result.rewrittenQuery.slice(0, 100)}"`);
      }
      for (const f of result.failures) {
        console.log(`        -> ${f}`);
      }
    }
  }

  // ─── Summary ─────────────────────────────────────────────────────────────

  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;
  const avgLatency = Math.round(results.reduce((s, r) => s + r.latencyMs, 0) / results.length);
  const avgEvidenceQuality = Math.round(
    (results.reduce((s, r) => s + r.evidenceQuality, 0) / results.length) * 100
  ) / 100;
  const degradedCount = results.filter((r) => r.degradedMode).length;

  // Group pass rates
  const groups = [
    { name: "Reference resolution", ids: ["conv-01", "conv-02", "conv-03"] },
    { name: "Multi-turn context", ids: ["conv-04", "conv-05"] },
    { name: "Topic isolation", ids: ["conv-06", "conv-07"] },
    { name: "Pronoun/implicit ref", ids: ["conv-08", "conv-09"] },
    { name: "Edge cases", ids: ["conv-10", "conv-11", "conv-12"] },
  ];

  console.log(`\n${"=".repeat(80)}`);
  console.log(`  CONVERSATION CONTEXT RESULTS: ${passed}/${CONVERSATION_TESTS.length} passed, ${failed} failed`);
  console.log(`  Average latency: ${avgLatency}ms`);
  console.log(`  Average evidence quality: ${avgEvidenceQuality}`);
  if (degradedCount > 0) {
    console.log(`  Degraded mode: ${degradedCount}/${CONVERSATION_TESTS.length} queries`);
  }

  console.log(`\n  Group pass rates:`);
  for (const group of groups) {
    const groupResults = results.filter((r) => group.ids.includes(r.id));
    const groupPassed = groupResults.filter((r) => r.passed).length;
    const icon = groupPassed === groupResults.length ? "✓" : "✗";
    console.log(`    ${icon} ${group.name}: ${groupPassed}/${groupResults.length}`);
  }

  // Rewrite quality summary
  const rewriteTests = results.filter((r) => r.rewrittenQuery && r.rewrittenQuery !== "");
  const rewriteDifferent = rewriteTests.filter((r) => {
    const test = CONVERSATION_TESTS.find((t) => t.id === r.id)!;
    return r.rewrittenQuery !== test.query;
  });
  console.log(`\n  Rewrite stats:`);
  console.log(`    Queries rewritten: ${rewriteDifferent.length}/${rewriteTests.length}`);

  // Confidence distribution
  const confDist = { high: 0, medium: 0, low: 0 };
  for (const r of results) {
    if (r.confidenceLevel in confDist) {
      confDist[r.confidenceLevel as keyof typeof confDist]++;
    }
  }
  console.log(`\n  Confidence distribution:`);
  console.log(`    High: ${confDist.high}  Medium: ${confDist.medium}  Low: ${confDist.low}`);

  console.log(`${"=".repeat(80)}\n`);

  if (failed > 0) {
    console.log("FAILED TESTS:");
    for (const r of results.filter((r) => !r.passed)) {
      console.log(`  ${r.id}: ${r.name}`);
      for (const f of r.failures) {
        console.log(`    -> ${f}`);
      }
    }
    console.log();
    process.exit(1);
  }

  console.log("All conversation context tests passed.\n");
  process.exit(0);
}

main().catch((err) => {
  console.error("Conversation context test suite crashed:", err);
  process.exit(1);
});
