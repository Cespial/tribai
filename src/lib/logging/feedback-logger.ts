/**
 * Feedback Logger for RAG Pipeline
 *
 * Logs structured user feedback events for offline analysis.
 * Each feedback entry captures the query, feedback type, and
 * pipeline metadata to help identify patterns in poor responses.
 */

import { logger } from "./structured-logger";

export interface FeedbackEvent {
  query: string;
  feedback: "positive" | "negative";
  /** Optional message from the user explaining their feedback */
  comment?: string;
  /** Pipeline metadata at time of response */
  confidenceLevel?: string;
  topScore?: number;
  queryType?: string;
}

/**
 * Log a feedback event for offline analysis.
 */
export function logFeedback(event: FeedbackEvent): void {
  logger.info("User feedback received", {
    stage: "feedback",
    metadata: {
      query: event.query,
      feedback: event.feedback,
      comment: event.comment,
      confidenceLevel: event.confidenceLevel,
      topScore: event.topScore,
      queryType: event.queryType,
    },
  });
}
