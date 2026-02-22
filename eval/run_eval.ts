import { config } from "dotenv";
config({ path: ".env.local" });

import * as fs from "fs";
import * as path from "path";
import { enhanceQuery } from "../src/lib/rag/query-enhancer";
import { retrieve } from "../src/lib/rag/retriever";
import { heuristicRerank } from "../src/lib/rag/reranker";
import { assembleContext, buildContextString } from "../src/lib/rag/context-assembler";
import { computeRetrievalMetrics, RetrievalMetrics } from "./metrics/retrieval";
import {
  citationAccuracy,
  sourcePresence,
  answerContainsExpected,
} from "./metrics/answer-quality";
import { quickHallucinationCheck } from "./metrics/faithfulness";
import { analyzeErrors, aggregateErrors, ErrorAnalysis } from "./analysis/error-categorizer";
import { EXPERIMENT_GRID, ExperimentConfig } from "./experiments/config-grid";
import { RAG_CONFIG } from "../src/config/constants";

interface EvalQuestion {
  id: string;
  category: string;
  difficulty: string;
  question: string;
  expected_articles: string[];
  expected_chunk_types: string[];
  expected_answer_contains: string[];
  expected_external_sources?: string[];
}

interface EvalResult {
  questionId: string;
  question: string;
  category: string;
  difficulty: string;
  retrievalMetrics: RetrievalMetrics;
  citationAcc: number;
  sourcePresenceScore: number;
  containsExpected: number;
  numChunksRetrieved: number;
  numArticlesInContext: number;
  errorAnalysis: ErrorAnalysis;
  hallucinationCheck: { citedArticles: string[]; uncitedArticles: string[] };
  // Performance tracking
  latencyMs: number;
  tokensUsed: number;
  // Multi-source metrics
  externalSourcePresence: number;
  sourceTypeAccuracy: number;
  timestamp: string;
}

interface CategoryMetrics {
  count: number;
  avgPrecision5: number;
  avgRecall5: number;
  avgMRR: number;
}

interface ExperimentResult {
  experiment: string;
  config: ExperimentConfig;
  results: EvalResult[];
  aggregated: {
    avgPrecisionAt5: number;
    avgRecallAt5: number;
    avgMRR: number;
    avgNDCGAt5: number;
    avgCitationAcc: number;
    avgSourcePresence: number;
    avgContainsExpected: number;
    errorAnalysis: ReturnType<typeof aggregateErrors>;
    // New: metrics by category
    byCategory: Record<string, CategoryMetrics>;
    // New: performance stats
    avgLatencyMs: number;
    p95LatencyMs: number;
    avgTokensUsed: number;
    // New: multi-source metrics
    avgExternalSourcePresence: number;
    avgSourceTypeAccuracy: number;
  };
  timestamp: string;
}

async function runSingleQuestion(
  question: EvalQuestion,
  experimentConfig: ExperimentConfig
): Promise<EvalResult> {
  const startTime = performance.now();
  const mergedConfig = { ...RAG_CONFIG, ...experimentConfig.ragConfig };

  // 1. Enhance query
  const enhanced = await enhanceQuery(question.question, {
    useHyDE: mergedConfig.useHyDE,
    useQueryExpansion: mergedConfig.useQueryExpansion,
  });

  // 2. Retrieve
  const { chunks, multiSourceChunks } = await retrieve(enhanced, {
    topK: mergedConfig.topK,
    similarityThreshold: mergedConfig.similarityThreshold,
  });

  // 3. Retrieval metrics
  const retrievalMetrics = computeRetrievalMetrics(
    chunks,
    question.expected_articles
  );

  // 4. Rerank
  const reranked = heuristicRerank(chunks, enhanced, mergedConfig.maxRerankedResults);

  // 5. Assemble context
  const context = await assembleContext(reranked, {
    useSiblingRetrieval: mergedConfig.useSiblingRetrieval,
    maxTokens: mergedConfig.maxContextTokens,
  });

  // 6. Metrics (no LLM call for speed)
  const contextString = buildContextString(context);
  const citationAcc = citationAccuracy(
    contextString,
    question.expected_articles
  );
  const sourcePresenceScore = sourcePresence(
    context.sources,
    question.expected_articles
  );
  const containsExpected = answerContainsExpected(
    contextString,
    question.expected_answer_contains
  );

  // 7. Error analysis
  const errorAnalysis = analyzeErrors(
    question.id,
    question.expected_articles,
    chunks,
    context,
    contextString
  );

  // 8. Quick hallucination check
  const contextArticleIds = context.sources.map((s) => s.idArticulo);
  const hallucinationCheck = quickHallucinationCheck(contextString, contextArticleIds);

  // 9. Multi-source metrics
  let externalSourcePresence = 0;
  let sourceTypeAccuracy = 0;
  if (question.expected_external_sources && question.expected_external_sources.length > 0) {
    // Check if external sources were retrieved
    const retrievedNamespaces = new Set(
      (multiSourceChunks || []).map((c) => c.namespace)
    );
    const found = question.expected_external_sources.filter((ns) =>
      retrievedNamespaces.has(ns)
    );
    externalSourcePresence = found.length / question.expected_external_sources.length;

    // Check if external sources made it into the context
    const contextExternalTypes = new Set(
      (context.externalSources || []).map((s) => s.namespace)
    );
    const foundInContext = question.expected_external_sources.filter((ns) =>
      contextExternalTypes.has(ns)
    );
    sourceTypeAccuracy = foundInContext.length / question.expected_external_sources.length;
  }

  const latencyMs = Math.round(performance.now() - startTime);
  const tokensUsed = context.totalTokensEstimate;

  return {
    questionId: question.id,
    question: question.question,
    category: question.category,
    difficulty: question.difficulty,
    retrievalMetrics,
    citationAcc,
    sourcePresenceScore,
    containsExpected,
    numChunksRetrieved: chunks.length,
    numArticlesInContext: context.articles.length,
    errorAnalysis,
    hallucinationCheck,
    latencyMs,
    tokensUsed,
    externalSourcePresence,
    sourceTypeAccuracy,
    timestamp: new Date().toISOString(),
  };
}

async function runExperiment(
  experimentConfig: ExperimentConfig,
  questions: EvalQuestion[]
): Promise<ExperimentResult> {
  console.log(`\n--- Experiment: ${experimentConfig.name} ---`);
  console.log(`  ${experimentConfig.description}`);

  const results: EvalResult[] = [];

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    process.stdout.write(`  [${i + 1}/${questions.length}] ${q.id}...`);
    try {
      const result = await runSingleQuestion(q, experimentConfig);
      results.push(result);
      console.log(
        ` MRR=${result.retrievalMetrics.mrr.toFixed(2)} Recall@5=${result.retrievalMetrics["recall@5"].toFixed(2)} Errors=${result.errorAnalysis.errors.length}`
      );
    } catch (err) {
      console.log(` ERROR: ${err}`);
    }
  }

  // Aggregate
  const avg = (arr: number[]) =>
    arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
  const percentile = (arr: number[], p: number) => {
    const sorted = [...arr].sort((a, b) => a - b);
    const idx = Math.ceil((p / 100) * sorted.length) - 1;
    return sorted[Math.max(0, idx)] ?? 0;
  };

  const errorAgg = aggregateErrors(results.map((r) => r.errorAnalysis));

  // Metrics by category
  const categoryMap: Record<string, { p5: number[]; r5: number[]; mrr: number[] }> = {};
  for (const r of results) {
    if (!categoryMap[r.category]) {
      categoryMap[r.category] = { p5: [], r5: [], mrr: [] };
    }
    categoryMap[r.category].p5.push(r.retrievalMetrics["precision@5"]);
    categoryMap[r.category].r5.push(r.retrievalMetrics["recall@5"]);
    categoryMap[r.category].mrr.push(r.retrievalMetrics.mrr);
  }
  const byCategory: Record<string, CategoryMetrics> = {};
  for (const [cat, vals] of Object.entries(categoryMap)) {
    byCategory[cat] = {
      count: vals.p5.length,
      avgPrecision5: avg(vals.p5),
      avgRecall5: avg(vals.r5),
      avgMRR: avg(vals.mrr),
    };
  }

  const latencies = results.map((r) => r.latencyMs);

  const aggregated = {
    avgPrecisionAt5: avg(results.map((r) => r.retrievalMetrics["precision@5"])),
    avgRecallAt5: avg(results.map((r) => r.retrievalMetrics["recall@5"])),
    avgMRR: avg(results.map((r) => r.retrievalMetrics.mrr)),
    avgNDCGAt5: avg(results.map((r) => r.retrievalMetrics["ndcg@5"])),
    avgCitationAcc: avg(results.map((r) => r.citationAcc)),
    avgSourcePresence: avg(results.map((r) => r.sourcePresenceScore)),
    avgContainsExpected: avg(results.map((r) => r.containsExpected)),
    errorAnalysis: errorAgg,
    byCategory,
    avgLatencyMs: avg(latencies),
    p95LatencyMs: percentile(latencies, 95),
    avgTokensUsed: avg(results.map((r) => r.tokensUsed)),
    avgExternalSourcePresence: avg(results.map((r) => r.externalSourcePresence)),
    avgSourceTypeAccuracy: avg(results.map((r) => r.sourceTypeAccuracy)),
  };

  console.log(`\n  AGGREGATED:`);
  console.log(`    Precision@5: ${aggregated.avgPrecisionAt5.toFixed(3)}`);
  console.log(`    Recall@5:    ${aggregated.avgRecallAt5.toFixed(3)}`);
  console.log(`    MRR:         ${aggregated.avgMRR.toFixed(3)}`);
  console.log(`    NDCG@5:      ${aggregated.avgNDCGAt5.toFixed(3)}`);
  console.log(`    Source Pres:  ${aggregated.avgSourcePresence.toFixed(3)}`);
  console.log(`    Contains Exp: ${aggregated.avgContainsExpected.toFixed(3)}`);
  console.log(`    Error Rate:   ${aggregated.errorAnalysis.errorRate.toFixed(3)}`);
  console.log(`    Avg Latency:  ${aggregated.avgLatencyMs.toFixed(0)}ms`);
  console.log(`    P95 Latency:  ${aggregated.p95LatencyMs.toFixed(0)}ms`);
  console.log(`    Avg Tokens:   ${aggregated.avgTokensUsed.toFixed(0)}`);
  console.log(`    Ext Source %: ${aggregated.avgExternalSourcePresence.toFixed(3)}`);
  console.log(`    Src Type Acc: ${aggregated.avgSourceTypeAccuracy.toFixed(3)}`);
  console.log(`\n  BY CATEGORY:`);
  for (const [cat, m] of Object.entries(byCategory)) {
    console.log(`    ${cat.padEnd(16)} n=${String(m.count).padEnd(4)} P@5=${m.avgPrecision5.toFixed(3)} R@5=${m.avgRecall5.toFixed(3)} MRR=${m.avgMRR.toFixed(3)}`);
  }

  return {
    experiment: experimentConfig.name,
    config: experimentConfig,
    results,
    aggregated,
    timestamp: new Date().toISOString(),
  };
}

async function main() {
  const args = process.argv.slice(2);
  const experimentFlag = args.indexOf("--experiment");
  const experimentName =
    experimentFlag >= 0 ? args[experimentFlag + 1] : "baseline";

  // Load dataset
  const datasetPath = path.join(__dirname, "dataset.json");
  const dataset = JSON.parse(fs.readFileSync(datasetPath, "utf-8"));
  const questions: EvalQuestion[] = dataset.questions;

  // Optional category filter
  const categoryFlag = args.indexOf("--category");
  const categoryFilter = categoryFlag >= 0 ? args[categoryFlag + 1] : null;

  const filteredQuestions = categoryFilter
    ? questions.filter((q) => q.category === categoryFilter)
    : questions;

  console.log(`Loaded ${filteredQuestions.length} evaluation questions${categoryFilter ? ` (category: ${categoryFilter})` : ""}`);

  // Find experiment(s)
  let experiments: ExperimentConfig[];
  if (experimentName === "all") {
    experiments = EXPERIMENT_GRID;
  } else {
    const found = EXPERIMENT_GRID.find((e) => e.name === experimentName);
    if (!found) {
      console.error(
        `Unknown experiment: ${experimentName}. Available: ${EXPERIMENT_GRID.map((e) => e.name).join(", ")}`
      );
      process.exit(1);
    }
    experiments = [found];
  }

  // Run experiments
  const allResults: ExperimentResult[] = [];
  for (const exp of experiments) {
    const result = await runExperiment(exp, filteredQuestions);
    allResults.push(result);

    // Save incrementally
    const resultsDir = path.join(__dirname, "results");
    fs.mkdirSync(resultsDir, { recursive: true });
    const outPath = path.join(resultsDir, `${exp.name}_${Date.now()}.json`);
    fs.writeFileSync(outPath, JSON.stringify(result, null, 2));
    console.log(`  Results saved to ${outPath}`);
  }

  // Print comparison table if multiple experiments
  if (allResults.length > 1) {
    console.log("\n\n=== COMPARISON TABLE ===\n");
    console.log(
      "Experiment".padEnd(25) +
        "P@5".padEnd(8) +
        "R@5".padEnd(8) +
        "MRR".padEnd(8) +
        "NDCG@5".padEnd(8) +
        "SrcPres".padEnd(8) +
        "Contains".padEnd(8) +
        "ErrRate".padEnd(8)
    );
    console.log("-".repeat(81));
    for (const r of allResults) {
      console.log(
        r.experiment.padEnd(25) +
          r.aggregated.avgPrecisionAt5.toFixed(3).padEnd(8) +
          r.aggregated.avgRecallAt5.toFixed(3).padEnd(8) +
          r.aggregated.avgMRR.toFixed(3).padEnd(8) +
          r.aggregated.avgNDCGAt5.toFixed(3).padEnd(8) +
          r.aggregated.avgSourcePresence.toFixed(3).padEnd(8) +
          r.aggregated.avgContainsExpected.toFixed(3).padEnd(8) +
          r.aggregated.errorAnalysis.errorRate.toFixed(3).padEnd(8)
      );
    }
  }

  // Save baseline if running optimized-v2
  if (experimentName === "optimized-v2" || experimentName === "baseline") {
    const baselinePath = path.join(__dirname, "baseline-results.json");
    const baselineResult = allResults[0];
    fs.writeFileSync(baselinePath, JSON.stringify(baselineResult.aggregated, null, 2));
    console.log(`\nBaseline saved to ${baselinePath}`);
  }
}

main().catch(console.error);
