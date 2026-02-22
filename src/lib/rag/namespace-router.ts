import { PineconeNamespace } from "@/types/rag";
import { RAG_CONFIG } from "@/config/constants";

export type QueryType = "factual" | "comparative" | "procedural" | "temporal" | "calculative" | "doctrinal" | "general";

/**
 * Classify query type for routing to specialized pipeline behavior.
 */
export function classifyQueryType(query: string): QueryType {
  const lower = query.toLowerCase();

  // Calculative: needs calculations
  if (/calcul|cuánto|monto|valor|tarifa.*aplic|base.*grav|liquidar|retenci[oó]n.*fuente.*salario/i.test(lower)) {
    return "calculative";
  }

  // Comparative: needs multiple articles side by side
  if (/diferencia|compar|versus|vs\b|distinción|mientras que|en cambio|cuál es mejor/i.test(lower)) {
    return "comparative";
  }

  // Temporal: history, changes, modifications
  if (/histor|evoluci[oó]n|antes|anterior|cambio|modific|reform|trayectoria|vigente desde|derogad/i.test(lower)) {
    return "temporal";
  }

  // Procedural: filing, deadlines, procedures
  if (/procedimiento|plazo|vencimiento|declarar|formulario|formato|c[oó]mo se|pasos|requisito|sanción|multa/i.test(lower)) {
    return "procedural";
  }

  // Doctrinal: DIAN concepts, court rulings
  if (/concepto|dian|doctrina|interpreta|sentencia|corte|constitucional|jurisprudencia/i.test(lower)) {
    return "doctrinal";
  }

  // Factual: simple lookups
  if (/qu[eé] (dice|establece|señala)|cu[aá]l es|define|definición|tarifa|tasa|porcentaje/i.test(lower)) {
    return "factual";
  }

  return "general";
}

/**
 * Get query routing configuration based on query type.
 */
export function getQueryRoutingConfig(queryType: QueryType): {
  topK: number;
  maxRerankedResults: number;
  priorityNamespaces: PineconeNamespace[];
} {
  switch (queryType) {
    case "factual":
      return { topK: 10, maxRerankedResults: 5, priorityNamespaces: [""] };
    case "comparative":
      return { topK: 25, maxRerankedResults: 12, priorityNamespaces: ["", "leyes"] };
    case "temporal":
      return { topK: 20, maxRerankedResults: 10, priorityNamespaces: ["", "leyes"] };
    case "procedural":
      return { topK: 20, maxRerankedResults: 8, priorityNamespaces: ["", "resoluciones", "decretos"] };
    case "calculative":
      return { topK: 15, maxRerankedResults: 6, priorityNamespaces: [""] };
    case "doctrinal":
      return { topK: 20, maxRerankedResults: 10, priorityNamespaces: ["doctrina", "", "jurisprudencia"] };
    default:
      return { topK: RAG_CONFIG.topK, maxRerankedResults: RAG_CONFIG.maxRerankedResults, priorityNamespaces: ["", ...RAG_CONFIG.additionalNamespaces] };
  }
}

/**
 * Prioritize namespaces based on query intent detection.
 * Returns namespaces in order of priority for the given query.
 */
export function prioritizeNamespaces(query: string): PineconeNamespace[] {
  const lower = query.toLowerCase();

  // Doctrina/conceptos DIAN
  if (/concepto|dian|doctrina|interpreta|oficio|circular/i.test(lower)) {
    return ["doctrina", "", "resoluciones"];
  }

  // Jurisprudencia
  if (/sentencia|corte|constitucional|exequib|inexequib|magistrad|tutela/i.test(lower)) {
    return ["jurisprudencia", ""];
  }

  // Decretos reglamentarios
  if (/decreto|reglament|dur\s|1625/i.test(lower)) {
    return ["decretos", ""];
  }

  // Resoluciones DIAN
  if (/resoluc|procedimiento|plazo|formato|formulario|declaraci[oó]n/i.test(lower)) {
    return ["resoluciones", ""];
  }

  // Leyes tributarias
  if (/ley\s+\d|reforma|tributaria\s+\d{4}/i.test(lower)) {
    return ["leyes", ""];
  }

  // Default: artículos first, then all additional namespaces
  return ["", ...RAG_CONFIG.additionalNamespaces];
}
