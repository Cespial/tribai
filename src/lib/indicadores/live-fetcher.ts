export interface LiveIndicator {
  id: string;
  valorNumerico: number;
  valor: string;
  fechaCorte: string; // ISO date
  fetchedAt: string; // ISO timestamp
}

export interface LiveIndicatorBundle {
  indicators: LiveIndicator[];
  fetchedAt: string;
  errors: string[];
}

const FETCH_TIMEOUT = 5000;

function formatCOP(value: number): string {
  return "$" + value.toLocaleString("es-CO", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

/**
 * Fetch TRM (Tasa Representativa del Mercado) from datos.gov.co
 * Dataset: 32sa-8pi3 (Socrata SODA API)
 */
export async function fetchTRM(): Promise<LiveIndicator> {
  const url =
    "https://www.datos.gov.co/resource/32sa-8pi3.json?$order=vigenciadesde%20DESC&$limit=1";

  const response = await fetch(url, {
    signal: AbortSignal.timeout(FETCH_TIMEOUT),
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`TRM API responded with status ${response.status}`);
  }

  const data = await response.json();

  if (!Array.isArray(data) || data.length === 0) {
    throw new Error("TRM API returned empty data");
  }

  const record = data[0];
  const valorNumerico = parseFloat(record.valor);

  if (isNaN(valorNumerico)) {
    throw new Error(`TRM API returned invalid value: ${record.valor}`);
  }

  const fechaRaw = record.vigenciadesde || record.vigenciahasta;
  const fechaCorte = fechaRaw
    ? new Date(fechaRaw).toISOString().split("T")[0]
    : new Date().toISOString().split("T")[0];

  return {
    id: "trm",
    valorNumerico: Math.round(valorNumerico),
    valor: formatCOP(Math.round(valorNumerico)),
    fechaCorte,
    fetchedAt: new Date().toISOString(),
  };
}

/**
 * Fetch all live indicators in parallel.
 * Uses Promise.allSettled so individual failures don't block others.
 *
 * Currently only TRM has a reliable public API.
 * DTF (Banrep SDMX) migrated to Angular frontend — no programmatic endpoint.
 */
export async function fetchAllLive(): Promise<LiveIndicatorBundle> {
  const results = await Promise.allSettled([fetchTRM()]);

  const indicators: LiveIndicator[] = [];
  const errors: string[] = [];
  const ids = ["trm"];

  results.forEach((result, index) => {
    if (result.status === "fulfilled") {
      indicators.push(result.value);
    } else {
      const reason =
        result.reason instanceof Error
          ? result.reason.message
          : String(result.reason);
      errors.push(`${ids[index]}: ${reason}`);
      console.error(`[live-fetcher] Failed to fetch ${ids[index]}:`, reason);
    }
  });

  return {
    indicators,
    fetchedAt: new Date().toISOString(),
    errors,
  };
}
