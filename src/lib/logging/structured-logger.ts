/**
 * Structured Logger for RAG Pipeline
 *
 * Produces JSON-formatted logs with requestId for tracing.
 * Includes timing information per pipeline stage.
 *
 * In production (Vercel), these logs are captured by Vercel's
 * log drain and can be queried via the Vercel dashboard.
 */

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogEntry {
  level: LogLevel;
  message: string;
  requestId: string;
  timestamp: string;
  stage?: string;
  durationMs?: number;
  metadata?: Record<string, unknown>;
}

let globalRequestId = "";

/**
 * Generate a short unique request ID.
 */
function generateRequestId(): string {
  return `req_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Set the current request ID for all subsequent log calls.
 * Call at the start of each request handler.
 */
export function setRequestId(id?: string): string {
  globalRequestId = id || generateRequestId();
  return globalRequestId;
}

/**
 * Get the current request ID.
 */
export function getRequestId(): string {
  return globalRequestId;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

// Only log info+ in production, debug+ in development
const MIN_LEVEL: LogLevel = process.env.NODE_ENV === "production" ? "info" : "debug";

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[MIN_LEVEL];
}

function log(level: LogLevel, message: string, extra?: Partial<LogEntry>): void {
  if (!shouldLog(level)) return;

  const entry: LogEntry = {
    level,
    message,
    requestId: globalRequestId,
    timestamp: new Date().toISOString(),
    ...extra,
  };

  const output = JSON.stringify(entry);

  switch (level) {
    case "error":
      console.error(output);
      break;
    case "warn":
      console.warn(output);
      break;
    default:
      console.log(output);
  }
}

export const logger = {
  debug: (message: string, extra?: Partial<LogEntry>) => log("debug", message, extra),
  info: (message: string, extra?: Partial<LogEntry>) => log("info", message, extra),
  warn: (message: string, extra?: Partial<LogEntry>) => log("warn", message, extra),
  error: (message: string, extra?: Partial<LogEntry>) => log("error", message, extra),

  /**
   * Time a pipeline stage and log the result.
   */
  async time<T>(
    stage: string,
    fn: () => Promise<T>
  ): Promise<{ result: T; durationMs: number }> {
    const start = performance.now();
    try {
      const result = await fn();
      const durationMs = Math.round(performance.now() - start);
      log("info", `${stage} completed`, { stage, durationMs });
      return { result, durationMs };
    } catch (error) {
      const durationMs = Math.round(performance.now() - start);
      log("error", `${stage} failed`, {
        stage,
        durationMs,
        metadata: { error: (error as Error).message },
      });
      throw error;
    }
  },
};
