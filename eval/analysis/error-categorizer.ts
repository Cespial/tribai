import { ScoredChunk } from "../../src/types/pinecone";
import { AssembledContext } from "../../src/types/rag";

export enum ErrorCategory {
  MISSING_ARTICLE = "article_not_retrieved",
  WRONG_RANKING = "article_ranked_too_low",
  TRUNCATION = "context_truncated",
  HALLUCINATION = "fact_not_in_context",
  CITATION_ERROR = "wrong_citation_format",
  EMPTY_CONTEXT = "no_relevant_context",
}

export interface ErrorAnalysis {
  questionId: string;
  errors: Array<{
    category: ErrorCategory;
    detail: string;
    severity: "low" | "medium" | "high";
  }>;
  overallSeverity: "low" | "medium" | "high";
}

/**
 * Analyze retrieval errors for a single evaluation question.
 */
export function analyzeErrors(
  questionId: string,
  expectedArticles: string[],
  retrievedChunks: ScoredChunk[],
  context: AssembledContext,
  answer: string,
  topK: number = 5
): ErrorAnalysis {
  const errors: ErrorAnalysis["errors"] = [];

  const retrievedArticles = new Set(retrievedChunks.map((c) => c.metadata.id_articulo));
  const contextArticles = new Set(context.sources.map((s) => s.idArticulo));
  const topKArticles = new Set(
    retrievedChunks.slice(0, topK).map((c) => c.metadata.id_articulo)
  );

  // Check for missing articles
  for (const expected of expectedArticles) {
    if (!retrievedArticles.has(expected)) {
      errors.push({
        category: ErrorCategory.MISSING_ARTICLE,
        detail: `Expected ${expected} not found in any retrieved chunks`,
        severity: "high",
      });
    } else if (!topKArticles.has(expected)) {
      // Retrieved but not in top-K
      const rank = retrievedChunks.findIndex(
        (c) => c.metadata.id_articulo === expected
      );
      errors.push({
        category: ErrorCategory.WRONG_RANKING,
        detail: `${expected} retrieved at rank ${rank + 1} (outside top-${topK})`,
        severity: "medium",
      });
    }
  }

  // Check for empty context
  if (context.articles.length === 0) {
    errors.push({
      category: ErrorCategory.EMPTY_CONTEXT,
      detail: "No articles assembled in context",
      severity: "high",
    });
  }

  // Check for context truncation
  for (const expected of expectedArticles) {
    if (contextArticles.has(expected)) {
      const articleGroup = context.articles.find((a) => a.idArticulo === expected);
      if (articleGroup && articleGroup.contenido.length === 0) {
        errors.push({
          category: ErrorCategory.TRUNCATION,
          detail: `${expected} in context but contenido is empty (truncated?)`,
          severity: "medium",
        });
      }
    }
  }

  // Check for expected articles missing from assembled context
  // (Previously this scanned the context string for cross-referenced article
  //  mentions and counted each as a "hallucination" error — this inflated the
  //  error count massively since legal texts naturally cite many articles.)
  for (const expected of expectedArticles) {
    if (contextArticles.has(expected)) {
      // Expected article IS in context — check it has content
      const articleGroup = context.articles.find((a) => a.idArticulo === expected);
      if (articleGroup && articleGroup.contenido.length > 0) {
        // Good — article is present with content, no error
        continue;
      }
      // Falls through to truncation check above (already handled)
    } else if (retrievedArticles.has(expected)) {
      // Retrieved but didn't make it into assembled context (token budget cut)
      errors.push({
        category: ErrorCategory.TRUNCATION,
        detail: `${expected} was retrieved but excluded from assembled context (token budget)`,
        severity: "medium",
      });
    }
    // MISSING_ARTICLE and WRONG_RANKING already handled above
  }

  // Determine overall severity
  const hasHigh = errors.some((e) => e.severity === "high");
  const hasMedium = errors.some((e) => e.severity === "medium");
  const overallSeverity = hasHigh ? "high" : hasMedium ? "medium" : "low";

  return { questionId, errors, overallSeverity };
}

/**
 * Aggregate error analysis across multiple questions.
 */
export function aggregateErrors(analyses: ErrorAnalysis[]): {
  totalErrors: number;
  byCategory: Record<string, number>;
  bySeverity: Record<string, number>;
  errorRate: number;
} {
  const byCategory: Record<string, number> = {};
  const bySeverity: Record<string, number> = { low: 0, medium: 0, high: 0 };
  let totalErrors = 0;

  for (const analysis of analyses) {
    for (const error of analysis.errors) {
      totalErrors++;
      byCategory[error.category] = (byCategory[error.category] || 0) + 1;
      bySeverity[error.severity]++;
    }
  }

  return {
    totalErrors,
    byCategory,
    bySeverity,
    errorRate: analyses.length > 0
      ? analyses.filter((a) => a.errors.length > 0).length / analyses.length
      : 0,
  };
}
