/**
 * Bootstrap Significance Testing for RAG Evaluation
 *
 * Implements bootstrap confidence intervals (95% CI) for each metric.
 * Compares two experiment results and reports whether the difference
 * is statistically significant (non-overlapping CIs).
 *
 * Usage:
 *   npx tsx eval/analysis/significance.ts results/baseline.json results/optimized.json
 */

import * as fs from "fs";
import * as path from "path";

interface MetricValues {
  [metricName: string]: number[];
}

interface BootstrapResult {
  metric: string;
  mean: number;
  ci95Lower: number;
  ci95Upper: number;
  std: number;
}

interface ComparisonResult {
  metric: string;
  baselineMean: number;
  experimentMean: number;
  delta: number;
  deltaPercent: number;
  baselineCI: [number, number];
  experimentCI: [number, number];
  significant: boolean;
  pValue: number;
}

/**
 * Bootstrap resampling to compute confidence intervals.
 */
function bootstrapCI(
  values: number[],
  nBootstrap: number = 10000,
  alpha: number = 0.05
): BootstrapResult & { samples: number[] } {
  const n = values.length;
  if (n === 0) {
    return {
      metric: "",
      mean: 0,
      ci95Lower: 0,
      ci95Upper: 0,
      std: 0,
      samples: [],
    };
  }

  const bootstrapMeans: number[] = [];

  for (let i = 0; i < nBootstrap; i++) {
    let sum = 0;
    for (let j = 0; j < n; j++) {
      const idx = Math.floor(Math.random() * n);
      sum += values[idx];
    }
    bootstrapMeans.push(sum / n);
  }

  bootstrapMeans.sort((a, b) => a - b);

  const lowerIdx = Math.floor((alpha / 2) * nBootstrap);
  const upperIdx = Math.floor((1 - alpha / 2) * nBootstrap);

  const mean = values.reduce((a, b) => a + b, 0) / n;
  const variance = values.reduce((a, b) => a + (b - mean) ** 2, 0) / n;

  return {
    metric: "",
    mean,
    ci95Lower: bootstrapMeans[lowerIdx],
    ci95Upper: bootstrapMeans[upperIdx],
    std: Math.sqrt(variance),
    samples: bootstrapMeans,
  };
}

/**
 * Permutation test p-value for difference in means.
 */
function permutationTest(
  a: number[],
  b: number[],
  nPermutations: number = 10000
): number {
  const observedDiff = Math.abs(
    a.reduce((s, v) => s + v, 0) / a.length -
    b.reduce((s, v) => s + v, 0) / b.length
  );

  const combined = [...a, ...b];
  const n = a.length;
  let count = 0;

  for (let i = 0; i < nPermutations; i++) {
    // Shuffle combined array
    for (let j = combined.length - 1; j > 0; j--) {
      const k = Math.floor(Math.random() * (j + 1));
      [combined[j], combined[k]] = [combined[k], combined[j]];
    }

    const permA = combined.slice(0, n);
    const permB = combined.slice(n);
    const permDiff = Math.abs(
      permA.reduce((s, v) => s + v, 0) / permA.length -
      permB.reduce((s, v) => s + v, 0) / permB.length
    );

    if (permDiff >= observedDiff) count++;
  }

  return count / nPermutations;
}

/**
 * Compare two sets of metric values with bootstrap CIs and permutation test.
 */
export function compareExperiments(
  baselineValues: MetricValues,
  experimentValues: MetricValues
): ComparisonResult[] {
  const results: ComparisonResult[] = [];
  const metrics = Object.keys(baselineValues);

  for (const metric of metrics) {
    const baseVals = baselineValues[metric] || [];
    const expVals = experimentValues[metric] || [];

    if (baseVals.length === 0 || expVals.length === 0) continue;

    const baseCI = bootstrapCI(baseVals);
    const expCI = bootstrapCI(expVals);
    const pValue = permutationTest(baseVals, expVals);

    const delta = expCI.mean - baseCI.mean;
    const deltaPercent = baseCI.mean > 0 ? (delta / baseCI.mean) * 100 : 0;

    // Significant if CIs don't overlap AND p-value < 0.05
    const significant =
      (expCI.ci95Lower > baseCI.ci95Upper ||
        expCI.ci95Upper < baseCI.ci95Lower) &&
      pValue < 0.05;

    results.push({
      metric,
      baselineMean: baseCI.mean,
      experimentMean: expCI.mean,
      delta,
      deltaPercent,
      baselineCI: [baseCI.ci95Lower, baseCI.ci95Upper],
      experimentCI: [expCI.ci95Lower, expCI.ci95Upper],
      significant,
      pValue,
    });
  }

  return results;
}

/**
 * Extract per-question metric values from experiment results.
 */
function extractMetricValues(results: any[]): MetricValues {
  const metrics: MetricValues = {
    "precision@5": [],
    "recall@5": [],
    mrr: [],
    "ndcg@5": [],
    citationAcc: [],
    sourcePresence: [],
    containsExpected: [],
  };

  for (const r of results) {
    if (r.retrievalMetrics) {
      metrics["precision@5"].push(r.retrievalMetrics["precision@5"] ?? 0);
      metrics["recall@5"].push(r.retrievalMetrics["recall@5"] ?? 0);
      metrics["mrr"].push(r.retrievalMetrics.mrr ?? 0);
      metrics["ndcg@5"].push(r.retrievalMetrics["ndcg@5"] ?? 0);
    }
    if (r.citationAcc !== undefined) metrics["citationAcc"].push(r.citationAcc);
    if (r.sourcePresenceScore !== undefined) metrics["sourcePresence"].push(r.sourcePresenceScore);
    if (r.containsExpected !== undefined) metrics["containsExpected"].push(r.containsExpected);
  }

  return metrics;
}

/**
 * Compute metrics broken down by category.
 */
export function metricsByCategory(
  results: Array<{ category: string; retrievalMetrics: any; citationAcc: number; sourcePresenceScore: number; containsExpected: number }>
): Record<string, { count: number; avgPrecision5: number; avgRecall5: number; avgMRR: number }> {
  const categories: Record<string, { p5: number[]; r5: number[]; mrr: number[] }> = {};

  for (const r of results) {
    if (!categories[r.category]) {
      categories[r.category] = { p5: [], r5: [], mrr: [] };
    }
    categories[r.category].p5.push(r.retrievalMetrics["precision@5"] ?? 0);
    categories[r.category].r5.push(r.retrievalMetrics["recall@5"] ?? 0);
    categories[r.category].mrr.push(r.retrievalMetrics.mrr ?? 0);
  }

  const avg = (arr: number[]) => arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

  const result: Record<string, { count: number; avgPrecision5: number; avgRecall5: number; avgMRR: number }> = {};
  for (const [cat, vals] of Object.entries(categories)) {
    result[cat] = {
      count: vals.p5.length,
      avgPrecision5: avg(vals.p5),
      avgRecall5: avg(vals.r5),
      avgMRR: avg(vals.mrr),
    };
  }

  return result;
}

// CLI mode
if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.log("Usage: npx tsx eval/analysis/significance.ts <baseline.json> <experiment.json>");
    process.exit(1);
  }

  const baselineData = JSON.parse(fs.readFileSync(path.resolve(args[0]), "utf-8"));
  const experimentData = JSON.parse(fs.readFileSync(path.resolve(args[1]), "utf-8"));

  const baselineMetrics = extractMetricValues(baselineData.results || []);
  const experimentMetrics = extractMetricValues(experimentData.results || []);

  const comparisons = compareExperiments(baselineMetrics, experimentMetrics);

  console.log("\n=== Statistical Significance Analysis ===\n");
  console.log(
    "Metric".padEnd(18) +
    "Baseline".padEnd(10) +
    "Experiment".padEnd(12) +
    "Delta".padEnd(10) +
    "Delta%".padEnd(10) +
    "p-value".padEnd(10) +
    "Significant"
  );
  console.log("-".repeat(80));

  for (const c of comparisons) {
    const sig = c.significant ? "YES ***" : "no";
    console.log(
      c.metric.padEnd(18) +
      c.baselineMean.toFixed(3).padEnd(10) +
      c.experimentMean.toFixed(3).padEnd(12) +
      (c.delta >= 0 ? "+" : "") + c.delta.toFixed(3).padEnd(9) +
      (c.deltaPercent >= 0 ? "+" : "") + c.deltaPercent.toFixed(1).padEnd(9) + "%" +
      c.pValue.toFixed(4).padEnd(10) +
      sig
    );
  }

  // Also show metrics by category
  if (baselineData.results) {
    console.log("\n=== Metrics by Category (Baseline) ===\n");
    const byCategory = metricsByCategory(baselineData.results);
    console.log("Category".padEnd(20) + "Count".padEnd(8) + "P@5".padEnd(8) + "R@5".padEnd(8) + "MRR".padEnd(8));
    console.log("-".repeat(52));
    for (const [cat, vals] of Object.entries(byCategory)) {
      console.log(
        cat.padEnd(20) +
        String(vals.count).padEnd(8) +
        vals.avgPrecision5.toFixed(3).padEnd(8) +
        vals.avgRecall5.toFixed(3).padEnd(8) +
        vals.avgMRR.toFixed(3).padEnd(8)
      );
    }
  }
}
