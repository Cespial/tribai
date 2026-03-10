import { config } from "dotenv";
config({ path: ".env.local" });

import * as fs from "fs";
import * as path from "path";
import { generateText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { enhanceQuery } from "../src/lib/rag/query-enhancer";
import { retrieve } from "../src/lib/rag/retriever";
import { heuristicRerank, heuristicRerankMultiSource } from "../src/lib/rag/reranker";
import { assembleContext, buildContextString } from "../src/lib/rag/context-assembler";
import { buildMessages } from "../src/lib/rag/prompt-builder";
import { checkEvidence } from "../src/lib/rag/evidence-checker";
import { computeRetrievalMetrics, RetrievalMetrics, computeRetrievalMetricsAdjusted, RetrievalMetricsAdjusted } from "./metrics/retrieval";
import {
  citationAccuracy,
  sourcePresence,
  answerContainsExpected,
} from "./metrics/answer-quality";
import { quickHallucinationCheck } from "./metrics/faithfulness";
import { llmJudge, compositeScore, JudgeResult } from "./metrics/llm-judge";
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
  complexity_tags?: string[];
}

interface EvalResult {
  questionId: string;
  question: string;
  category: string;
  difficulty: string;
  retrievalMetrics: RetrievalMetrics;
  retrievalMetricsAdj: RetrievalMetricsAdjusted;
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
  // Fase 4 metrics
  abstentionQuality: number;
  completenessScore: number;
  complexityTags: string[];
  // RLP-004: LLM Judge (optional, only when --judge flag)
  judgeResult?: JudgeResult | null;
  judgeComposite?: number;
  generatedAnswer?: string;
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
    // Adjusted precision metrics
    avgPrecisionAt5Adj: number;
    // Separated external source metrics
    avgExtSourceRetrieved: number;
    avgExtSourceInContext: number;
    // Fase 4: new metrics
    avgAbstentionQuality: number;
    avgCompletenessScore: number;
    byDifficulty: Record<string, CategoryMetrics>;
    complexQuestionMetrics: {
      count: number;
      avgPrecision5: number;
      avgRecall5: number;
      avgMRR: number;
      avgCompletenessScore: number;
    };
    totalMetricsCount: number;
    // RLP-004: LLM Judge aggregated metrics
    judgeMetrics?: {
      sampleSize: number;
      judgedCount: number;
      avgFaithfulness: number;
      avgCompleteness: number;
      avgRelevance: number;
      avgCitationQuality: number;
      avgClarity: number;
      avgComposite: number;
    };
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
  const { chunks, multiSourceChunks, queryType } = await retrieve(enhanced, {
    topK: mergedConfig.topK,
    similarityThreshold: mergedConfig.similarityThreshold,
  });

  // 3. Retrieval metrics
  const retrievalMetrics = computeRetrievalMetrics(
    chunks,
    question.expected_articles
  );
  const retrievalMetricsAdj = computeRetrievalMetricsAdjusted(chunks, question.expected_articles);

  // 4. Rerank (pass queryType for comparative round-robin diversity)
  const reranked = heuristicRerank(chunks, enhanced, mergedConfig.maxRerankedResults, queryType);

  // 4b. Rerank multi-source chunks (doctrina, jurisprudencia, etc.)
  const rerankedMultiSource = multiSourceChunks
    ? heuristicRerankMultiSource(multiSourceChunks, enhanced)
    : [];

  // 5. Assemble context (with multi-source chunks)
  const context = await assembleContext(reranked, {
    useSiblingRetrieval: mergedConfig.useSiblingRetrieval,
    maxTokens: mergedConfig.maxContextTokens,
    multiSourceChunks: rerankedMultiSource,
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

  // 10. Abstention quality: for questions with no expected articles (negative/abstention),
  // check if system correctly has minimal/no fabricated content
  let abstentionQuality = 0;
  if (question.expected_articles.length === 0) {
    // Should abstain: good if context has few articles and no hallucinated articles
    const uncitedCount = hallucinationCheck.uncitedArticles.length;
    const contextArticleCount = context.articles.length;
    // Perfect abstention: no articles in context for out-of-scope questions
    // Partial credit: few articles (may be tangentially related)
    if (contextArticleCount === 0 && uncitedCount === 0) {
      abstentionQuality = 1.0;
    } else if (contextArticleCount <= 2) {
      abstentionQuality = 0.5;
    } else {
      abstentionQuality = 0.0;
    }
  } else {
    // Has expected articles: abstention quality = 1 if articles were found (should NOT abstain)
    abstentionQuality = sourcePresenceScore > 0 ? 1.0 : 0.0;
  }

  // 11. Completeness score: how many expected_answer_contains terms appear in context
  // This is already computed as containsExpected, but for complex questions we track separately
  const completenessScore = containsExpected;

  return {
    questionId: question.id,
    question: question.question,
    category: question.category,
    difficulty: question.difficulty,
    retrievalMetrics,
    retrievalMetricsAdj,
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
    abstentionQuality,
    completenessScore,
    complexityTags: question.complexity_tags || [],
    timestamp: new Date().toISOString(),
  };
}

async function runExperiment(
  experimentConfig: ExperimentConfig,
  questions: EvalQuestion[],
  judgeOptions?: { enabled: boolean; sampleSize: number }
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

  // Metrics by difficulty
  const difficultyMap: Record<string, { p5: number[]; r5: number[]; mrr: number[] }> = {};
  for (const r of results) {
    if (!difficultyMap[r.difficulty]) {
      difficultyMap[r.difficulty] = { p5: [], r5: [], mrr: [] };
    }
    difficultyMap[r.difficulty].p5.push(r.retrievalMetrics["precision@5"]);
    difficultyMap[r.difficulty].r5.push(r.retrievalMetrics["recall@5"]);
    difficultyMap[r.difficulty].mrr.push(r.retrievalMetrics.mrr);
  }
  const byDifficulty: Record<string, CategoryMetrics> = {};
  for (const [diff, vals] of Object.entries(difficultyMap)) {
    byDifficulty[diff] = {
      count: vals.p5.length,
      avgPrecision5: avg(vals.p5),
      avgRecall5: avg(vals.r5),
      avgMRR: avg(vals.mrr),
    };
  }

  // Complex questions subset (complexity_tags present)
  const complexResults = results.filter((r) => r.complexityTags.length > 0);
  const complexQuestionMetrics = {
    count: complexResults.length,
    avgPrecision5: avg(complexResults.map((r) => r.retrievalMetrics["precision@5"])),
    avgRecall5: avg(complexResults.map((r) => r.retrievalMetrics["recall@5"])),
    avgMRR: avg(complexResults.map((r) => r.retrievalMetrics.mrr)),
    avgCompletenessScore: avg(complexResults.map((r) => r.completenessScore)),
  };

  // Helper for external source metrics (only over relevant questions)
  const extSourceAvg = (mapper: (r: EvalResult) => number) => {
    const qMap = new Map(questions.map((q) => [q.id, q]));
    const relevant = results.filter((r) => {
      const q = qMap.get(r.questionId);
      return q?.expected_external_sources && q.expected_external_sources.length > 0;
    });
    return relevant.length > 0 ? avg(relevant.map(mapper)) : 0;
  };

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
    avgExternalSourcePresence: extSourceAvg((r) => r.externalSourcePresence),
    avgSourceTypeAccuracy: extSourceAvg((r) => r.sourceTypeAccuracy),
    avgPrecisionAt5Adj: avg(results.map((r) => r.retrievalMetricsAdj["precision@5_adj"])),
    avgExtSourceRetrieved: extSourceAvg((r) => r.externalSourcePresence),
    avgExtSourceInContext: extSourceAvg((r) => r.sourceTypeAccuracy),
    // Fase 4: new metrics
    avgAbstentionQuality: avg(results.map((r) => r.abstentionQuality)),
    avgCompletenessScore: avg(results.map((r) => r.completenessScore)),
    byDifficulty,
    complexQuestionMetrics,
    totalMetricsCount: 17,
    judgeMetrics: undefined as ExperimentResult["aggregated"]["judgeMetrics"],
  };

  console.log(`\n  AGGREGATED (${aggregated.totalMetricsCount} metrics):`);
  console.log(`    Precision@5:     ${aggregated.avgPrecisionAt5.toFixed(3)}`);
  console.log(`    P@5 (adj):       ${aggregated.avgPrecisionAt5Adj.toFixed(3)}`);
  console.log(`    Recall@5:        ${aggregated.avgRecallAt5.toFixed(3)}`);
  console.log(`    MRR:             ${aggregated.avgMRR.toFixed(3)}`);
  console.log(`    NDCG@5:          ${aggregated.avgNDCGAt5.toFixed(3)}`);
  console.log(`    Source Pres:     ${aggregated.avgSourcePresence.toFixed(3)}`);
  console.log(`    Contains Exp:    ${aggregated.avgContainsExpected.toFixed(3)}`);
  console.log(`    Error Rate:      ${aggregated.errorAnalysis.errorRate.toFixed(3)}`);
  console.log(`    Avg Latency:     ${aggregated.avgLatencyMs.toFixed(0)}ms`);
  console.log(`    P95 Latency:     ${aggregated.p95LatencyMs.toFixed(0)}ms`);
  console.log(`    Avg Tokens:      ${aggregated.avgTokensUsed.toFixed(0)}`);
  console.log(`    Ext Src Ret:     ${aggregated.avgExtSourceRetrieved.toFixed(3)}`);
  console.log(`    Ext Src Ctx:     ${aggregated.avgExtSourceInContext.toFixed(3)}`);
  console.log(`    Abstention Qual: ${aggregated.avgAbstentionQuality.toFixed(3)}`);
  console.log(`    Completeness:    ${aggregated.avgCompletenessScore.toFixed(3)}`);

  console.log(`\n  BY CATEGORY:`);
  for (const [cat, m] of Object.entries(byCategory)) {
    console.log(`    ${cat.padEnd(24)} n=${String(m.count).padEnd(4)} P@5=${m.avgPrecision5.toFixed(3)} R@5=${m.avgRecall5.toFixed(3)} MRR=${m.avgMRR.toFixed(3)}`);
  }

  console.log(`\n  BY DIFFICULTY:`);
  for (const [diff, m] of Object.entries(byDifficulty)) {
    console.log(`    ${diff.padEnd(12)} n=${String(m.count).padEnd(4)} P@5=${m.avgPrecision5.toFixed(3)} R@5=${m.avgRecall5.toFixed(3)} MRR=${m.avgMRR.toFixed(3)}`);
  }

  if (complexQuestionMetrics.count > 0) {
    console.log(`\n  COMPLEX QUESTIONS (n=${complexQuestionMetrics.count}):`);
    console.log(`    P@5:             ${complexQuestionMetrics.avgPrecision5.toFixed(3)}`);
    console.log(`    R@5:             ${complexQuestionMetrics.avgRecall5.toFixed(3)}`);
    console.log(`    MRR:             ${complexQuestionMetrics.avgMRR.toFixed(3)}`);
    console.log(`    Completeness:    ${complexQuestionMetrics.avgCompletenessScore.toFixed(3)}`);
  }

  // RLP-004: LLM Judge pass (optional, runs on a sample of questions)
  if (judgeOptions?.enabled && results.length > 0) {
    const sampleSize = Math.min(judgeOptions.sampleSize, results.length);
    // Deterministic sample: take evenly spaced indices for reproducibility
    const step = results.length / sampleSize;
    const sampleIndices = Array.from({ length: sampleSize }, (_, i) => Math.floor(i * step));
    const sampleResults = sampleIndices.map((i) => results[i]);

    console.log(`\n  LLM JUDGE (sample=${sampleSize}/${results.length}):`);

    let judgedCount = 0;
    const judgeScores = { faith: [] as number[], comp: [] as number[], rel: [] as number[], cite: [] as number[], clar: [] as number[], composite: [] as number[] };

    for (let i = 0; i < sampleResults.length; i++) {
      const r = sampleResults[i];
      const q = questions.find((qq) => qq.id === r.questionId)!;
      process.stdout.write(`    [${i + 1}/${sampleSize}] ${r.questionId}...`);

      try {
        // Generate LLM answer using the full pipeline
        const enhanced = await enhanceQuery(q.question, {
          useHyDE: RAG_CONFIG.useHyDE,
          useQueryExpansion: RAG_CONFIG.useQueryExpansion,
        });
        const { chunks, multiSourceChunks } = await retrieve(enhanced, {
          topK: RAG_CONFIG.topK,
          similarityThreshold: RAG_CONFIG.similarityThreshold,
        });
        const reranked = heuristicRerank(chunks, enhanced, RAG_CONFIG.maxRerankedResults);
        const rerankedMS = multiSourceChunks ? heuristicRerankMultiSource(multiSourceChunks, enhanced) : [];
        const context = await assembleContext(reranked, {
          useSiblingRetrieval: RAG_CONFIG.useSiblingRetrieval,
          maxTokens: RAG_CONFIG.maxContextTokens,
          multiSourceChunks: rerankedMS,
        });

        // Evidence check for prompt building
        const allScores = chunks.map((c) => c.score).sort((a, b) => b - a);
        const evidenceResult = checkEvidence(context, allScores[0] ?? 0, allScores[Math.floor(allScores.length / 2)] ?? 0);

        const { system, contextBlock } = buildMessages(q.question, context, undefined, evidenceResult);

        // Generate answer (non-streaming)
        const { text: answer } = await generateText({
          model: anthropic(process.env.CHAT_MODEL || "claude-sonnet-4-6"),
          system: system + "\n\n" + contextBlock,
          prompt: q.question,
          maxOutputTokens: 1500,
        });

        // Judge the answer
        const contextString = buildContextString(context);
        const judge = await llmJudge(q.question, answer, contextString, q.expected_articles);

        // Store in the result
        r.generatedAnswer = answer;
        r.judgeResult = judge;
        r.judgeComposite = judge ? compositeScore(judge) : undefined;

        if (judge) {
          judgedCount++;
          judgeScores.faith.push(judge.faithfulness);
          judgeScores.comp.push(judge.completeness);
          judgeScores.rel.push(judge.relevance);
          judgeScores.cite.push(judge.citation_quality);
          judgeScores.clar.push(judge.clarity);
          judgeScores.composite.push(compositeScore(judge));
          console.log(` F=${judge.faithfulness} C=${judge.completeness} R=${judge.relevance} Cite=${judge.citation_quality} Cl=${judge.clarity} => ${compositeScore(judge).toFixed(2)}`);
        } else {
          console.log(` JUDGE DEGRADED`);
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message.slice(0, 60) : String(err);
        console.log(` ERROR: ${msg}`);
      }
    }

    if (judgedCount > 0) {
      aggregated.judgeMetrics = {
        sampleSize,
        judgedCount,
        avgFaithfulness: avg(judgeScores.faith),
        avgCompleteness: avg(judgeScores.comp),
        avgRelevance: avg(judgeScores.rel),
        avgCitationQuality: avg(judgeScores.cite),
        avgClarity: avg(judgeScores.clar),
        avgComposite: avg(judgeScores.composite),
      };
      aggregated.totalMetricsCount = 23; // 17 retrieval + 6 judge

      console.log(`\n    JUDGE AGGREGATED (${judgedCount}/${sampleSize} judged):`);
      console.log(`      Faithfulness:    ${aggregated.judgeMetrics.avgFaithfulness.toFixed(2)}/5`);
      console.log(`      Completeness:    ${aggregated.judgeMetrics.avgCompleteness.toFixed(2)}/5`);
      console.log(`      Relevance:       ${aggregated.judgeMetrics.avgRelevance.toFixed(2)}/5`);
      console.log(`      Citation Qual:   ${aggregated.judgeMetrics.avgCitationQuality.toFixed(2)}/5`);
      console.log(`      Clarity:         ${aggregated.judgeMetrics.avgClarity.toFixed(2)}/5`);
      console.log(`      COMPOSITE:       ${aggregated.judgeMetrics.avgComposite.toFixed(2)}/5`);
    } else {
      console.log(`\n    JUDGE: All queries degraded (LLM unavailable)`);
    }
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

  // Judge mode: --judge enables LLM answer generation + judge scoring
  const judgeEnabled = args.includes("--judge");
  const judgeSampleFlag = args.indexOf("--judge-sample");
  const judgeSampleSize = judgeSampleFlag >= 0 ? parseInt(args[judgeSampleFlag + 1], 10) : 30;

  console.log(`Loaded ${filteredQuestions.length} evaluation questions${categoryFilter ? ` (category: ${categoryFilter})` : ""}${judgeEnabled ? ` [JUDGE mode: sample=${judgeSampleSize}]` : ""}`);

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
    const result = await runExperiment(
      exp,
      filteredQuestions,
      judgeEnabled ? { enabled: true, sampleSize: judgeSampleSize } : undefined
    );
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

  // Quality gates — fail if metrics don't meet minimum thresholds
  const QUALITY_GATES = {
    minPrecisionAt5: 0.20,
    minRecallAt5: 0.55,
    maxErrorRate: 0.60,
    minSourceTypeAcc: 0.50,
    maxAvgLatency: 6000,
  };

  const gateFlag = args.includes("--gates");
  if (gateFlag && allResults.length > 0) {
    const agg = allResults[0].aggregated;
    const failures: string[] = [];

    if (agg.avgPrecisionAt5 < QUALITY_GATES.minPrecisionAt5)
      failures.push(`P@5 ${agg.avgPrecisionAt5.toFixed(3)} < ${QUALITY_GATES.minPrecisionAt5}`);
    if (agg.avgRecallAt5 < QUALITY_GATES.minRecallAt5)
      failures.push(`R@5 ${agg.avgRecallAt5.toFixed(3)} < ${QUALITY_GATES.minRecallAt5}`);
    if (agg.errorAnalysis.errorRate > QUALITY_GATES.maxErrorRate)
      failures.push(`Error Rate ${agg.errorAnalysis.errorRate.toFixed(3)} > ${QUALITY_GATES.maxErrorRate}`);
    if (agg.avgSourceTypeAccuracy < QUALITY_GATES.minSourceTypeAcc)
      failures.push(`Source Type Acc ${agg.avgSourceTypeAccuracy.toFixed(3)} < ${QUALITY_GATES.minSourceTypeAcc}`);
    if (agg.avgLatencyMs > QUALITY_GATES.maxAvgLatency)
      failures.push(`Avg Latency ${agg.avgLatencyMs.toFixed(0)}ms > ${QUALITY_GATES.maxAvgLatency}ms`);

    if (failures.length > 0) {
      console.log("\n  QUALITY GATES FAILED:");
      failures.forEach((f) => console.log(`    - ${f}`));
      process.exit(1);
    } else {
      console.log("\n  QUALITY GATES: ALL PASSED");
    }
  }
}

main().catch(console.error);
