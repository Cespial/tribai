import { ScoredChunk } from "@/types/pinecone";

export function precisionAtK(
  retrieved: ScoredChunk[],
  expectedArticles: string[],
  k: number
): number {
  const topK = retrieved.slice(0, k);
  const relevant = topK.filter((c) =>
    expectedArticles.includes(c.metadata.id_articulo)
  );
  return relevant.length / k;
}

export function recallAtK(
  retrieved: ScoredChunk[],
  expectedArticles: string[],
  k: number
): number {
  if (expectedArticles.length === 0) return 1; // No expected articles = perfect recall
  const topK = retrieved.slice(0, k);
  const foundArticles = new Set(
    topK
      .filter((c) => expectedArticles.includes(c.metadata.id_articulo))
      .map((c) => c.metadata.id_articulo)
  );
  return foundArticles.size / expectedArticles.length;
}

export function meanReciprocalRank(
  retrieved: ScoredChunk[],
  expectedArticles: string[]
): number {
  for (let i = 0; i < retrieved.length; i++) {
    if (expectedArticles.includes(retrieved[i].metadata.id_articulo)) {
      return 1 / (i + 1);
    }
  }
  return 0;
}

export function ndcgAtK(
  retrieved: ScoredChunk[],
  expectedArticles: string[],
  k: number
): number {
  if (expectedArticles.length === 0) return 1; // No expected articles = perfect score
  const topK = retrieved.slice(0, k);

  // DCG
  let dcg = 0;
  for (let i = 0; i < topK.length; i++) {
    const rel = expectedArticles.includes(topK[i].metadata.id_articulo) ? 1 : 0;
    dcg += rel / Math.log2(i + 2);
  }

  // Ideal DCG
  const idealRels = expectedArticles.length;
  let idcg = 0;
  for (let i = 0; i < Math.min(idealRels, k); i++) {
    idcg += 1 / Math.log2(i + 2);
  }

  return idcg > 0 ? dcg / idcg : 0;
}

export interface RetrievalMetrics {
  "precision@3": number;
  "precision@5": number;
  "precision@10": number;
  "recall@3": number;
  "recall@5": number;
  "recall@10": number;
  mrr: number;
  "ndcg@5": number;
  "ndcg@10": number;
}

export function computeRetrievalMetrics(
  retrieved: ScoredChunk[],
  expectedArticles: string[]
): RetrievalMetrics {
  return {
    "precision@3": precisionAtK(retrieved, expectedArticles, 3),
    "precision@5": precisionAtK(retrieved, expectedArticles, 5),
    "precision@10": precisionAtK(retrieved, expectedArticles, 10),
    "recall@3": recallAtK(retrieved, expectedArticles, 3),
    "recall@5": recallAtK(retrieved, expectedArticles, 5),
    "recall@10": recallAtK(retrieved, expectedArticles, 10),
    mrr: meanReciprocalRank(retrieved, expectedArticles),
    "ndcg@5": ndcgAtK(retrieved, expectedArticles, 5),
    "ndcg@10": ndcgAtK(retrieved, expectedArticles, 10),
  };
}

export function precisionAtKAdjusted(
  retrieved: ScoredChunk[],
  expectedArticles: string[],
  k: number
): number {
  if (expectedArticles.length === 0) return 1; // No expected = nothing wrong retrieved
  const topK = retrieved.slice(0, k);
  const relevant = topK.filter((c) =>
    expectedArticles.includes(c.metadata.id_articulo)
  );
  return relevant.length / Math.min(k, expectedArticles.length);
}

export interface RetrievalMetricsAdjusted {
  "precision@3_adj": number;
  "precision@5_adj": number;
  "precision@10_adj": number;
}

export function computeRetrievalMetricsAdjusted(
  retrieved: ScoredChunk[],
  expectedArticles: string[]
): RetrievalMetricsAdjusted {
  return {
    "precision@3_adj": precisionAtKAdjusted(retrieved, expectedArticles, 3),
    "precision@5_adj": precisionAtKAdjusted(retrieved, expectedArticles, 5),
    "precision@10_adj": precisionAtKAdjusted(retrieved, expectedArticles, 10),
  };
}
