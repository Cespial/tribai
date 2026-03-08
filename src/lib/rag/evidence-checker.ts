import { AssembledContext } from "@/types/rag";
import { EVIDENCE_THRESHOLDS } from "@/config/constants";

export type ConfidenceLevel = "high" | "medium" | "low";

export interface EvidenceCheckResult {
  /** Overall confidence in the evidence quality */
  confidenceLevel: ConfidenceLevel;
  /** Numeric score 0-1 based on retrieval quality signals */
  evidenceQuality: number;
  /** How many chunks/sources per namespace made it into final context */
  namespaceContribution: Record<string, number>;
  /** Whether contradictory information was detected between sources */
  contradictionFlags: boolean;
  /** Specific contradiction details (empty if none) */
  contradictionDetails: string[];
}

/**
 * Check evidence quality and detect contradictions in the assembled context.
 * Designed to run in < 5ms (pure heuristic, no LLM calls).
 */
export function checkEvidence(
  context: AssembledContext,
  topScore: number,
  medianScore: number
): EvidenceCheckResult {
  const namespaceContribution = computeNamespaceContribution(context);
  const totalSources = context.articles.length + (context.externalSources?.length ?? 0);
  const confidenceLevel = classifyConfidence(topScore, totalSources);
  const evidenceQuality = computeEvidenceQuality(topScore, medianScore, totalSources, context);
  const { contradictionFlags, contradictionDetails } = detectContradictions(context);

  return {
    confidenceLevel,
    evidenceQuality,
    namespaceContribution,
    contradictionFlags,
    contradictionDetails,
  };
}

/**
 * Classify confidence level based on retrieval quality signals.
 */
function classifyConfidence(topScore: number, totalSources: number): ConfidenceLevel {
  if (topScore >= EVIDENCE_THRESHOLDS.highConfidenceScore && totalSources >= EVIDENCE_THRESHOLDS.highConfidenceSources) {
    return "high";
  }
  if (topScore >= EVIDENCE_THRESHOLDS.mediumConfidenceScore && totalSources >= 1) {
    return "medium";
  }
  return "low";
}

/**
 * Compute a 0-1 evidence quality score combining multiple signals.
 */
function computeEvidenceQuality(
  topScore: number,
  medianScore: number,
  totalSources: number,
  context: AssembledContext
): number {
  // Score components (weighted average):
  // - Top score relevance (40%): how well the best result matches
  // - Source coverage (30%): number of distinct sources found
  // - Score distribution (20%): median vs top (tighter = more consistent)
  // - External source diversity (10%): presence of external sources

  const topScoreNorm = Math.min(1, topScore / 0.85); // normalize: 0.85+ = perfect
  const coverageNorm = Math.min(1, totalSources / 5); // 5+ sources = perfect
  const distributionNorm = topScore > 0 ? Math.min(1, medianScore / topScore) : 0;
  const externalDiversity = context.externalSources?.length
    ? Math.min(1, new Set(context.externalSources.map(s => s.namespace)).size / 3)
    : 0;

  return (
    topScoreNorm * 0.4 +
    coverageNorm * 0.3 +
    distributionNorm * 0.2 +
    externalDiversity * 0.1
  );
}

/**
 * Count how many sources from each namespace ended up in the final context.
 */
function computeNamespaceContribution(context: AssembledContext): Record<string, number> {
  const contribution: Record<string, number> = {};

  // ET articles are in the default namespace
  if (context.articles.length > 0) {
    contribution["estatuto_tributario"] = context.articles.length;
  }

  // External sources by namespace
  for (const src of context.externalSources ?? []) {
    contribution[src.namespace] = (contribution[src.namespace] ?? 0) + 1;
  }

  return contribution;
}

// --- Contradiction Detection (heuristic, no LLM) ---

/** Patterns that indicate vigencia/derogation status */
const DEROGATION_PATTERNS = [
  /derogad[oa]/i,
  /sin vigencia/i,
  /inexequible/i,
  /no aplicable/i,
  /sustituido por/i,
];

/** Patterns for numerical values (tarifas, topes, plazos) */
const NUMERIC_PATTERN = /(\d+(?:[.,]\d+)?)\s*%/g;

/**
 * Detect potential contradictions between sources in the assembled context.
 * Uses fast heuristics — no LLM calls.
 *
 * Checks for:
 * 1. Derogated ET articles cited alongside vigente external sources
 * 2. External sources referencing derogated/inexequible content
 * 3. Conflicting percentage values across sources on the same topic
 */
function detectContradictions(context: AssembledContext): {
  contradictionFlags: boolean;
  contradictionDetails: string[];
} {
  const details: string[] = [];

  // Check 1: Derogated ET articles in context
  for (const article of context.articles) {
    if (article.estado === "derogado") {
      // Check if any external source references this article as vigente
      const artSlug = article.idArticulo.replace(/^Art\.\s*/, "");
      const slugPattern = new RegExp(`(?:^|\\b)${artSlug.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?:\\b|$)`);
      for (const ext of context.externalSources ?? []) {
        if (ext.vigente && ext.articulosET.some(a => slugPattern.test(a))) {
          details.push(
            `${article.idArticulo} está derogado pero ${ext.docType} ${ext.numero} lo referencia como vigente`
          );
        }
      }
    }
  }

  // Check 2: External sources with derogation signals
  for (const ext of context.externalSources ?? []) {
    const fullText = ext.texto.join(" ").slice(0, 2000);
    for (const pattern of DEROGATION_PATTERNS) {
      if (pattern.test(fullText)) {
        // Only flag if the source itself is marked as vigente (contradiction)
        if (ext.vigente) {
          details.push(
            `${ext.docType} ${ext.numero} contiene señales de derogación pero está marcado como vigente`
          );
        }
        break;
      }
    }
  }

  // Check 3: Conflicting tarifa percentages across ET articles and external sources
  const articlePercentages = new Map<string, Set<string>>();
  for (const article of context.articles) {
    const text = article.contenido.join(" ");
    const matches = [...text.matchAll(NUMERIC_PATTERN)];
    if (matches.length > 0) {
      const key = article.idArticulo;
      articlePercentages.set(key, new Set(matches.map(m => m[1])));
    }
  }

  for (const ext of context.externalSources ?? []) {
    if (!ext.articulosET.length) continue;
    const extText = ext.texto.join(" ").slice(0, 2000);
    const extMatches = [...extText.matchAll(NUMERIC_PATTERN)];
    if (extMatches.length === 0) continue;

    const extPercentages = new Set(extMatches.map(m => m[1]));

    for (const artRef of ext.articulosET) {
      // Find matching article in context
      for (const [artId, artPcts] of articlePercentages) {
        if (artId.includes(artRef) || artRef.includes(artId.replace("Art. ", ""))) {
          // Check if external source has different percentages
          for (const pct of extPercentages) {
            if (artPcts.size > 0 && !artPcts.has(pct)) {
              // Could be a legitimate different value (e.g., different ranges)
              // Only flag if the article has exactly one percentage and external differs
              if (artPcts.size === 1) {
                const artPct = [...artPcts][0];
                details.push(
                  `${artId} indica ${artPct}% pero ${ext.docType} ${ext.numero} menciona ${pct}%`
                );
              }
            }
          }
        }
      }
    }
  }

  return {
    contradictionFlags: details.length > 0,
    contradictionDetails: details,
  };
}
