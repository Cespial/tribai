/* ───────────────────────────────────────────────────────────
   exogena-parser.ts — Parse Exógena DIAN reports (Excel)
   Extracts financial data and maps to DeclaracionState fields.
   ─────────────────────────────────────────────────────────── */

import * as XLSX from "xlsx";

// ── Types ────────────────────────────────────────────────

export interface ExogenaRow {
  nitReportante: string;
  nombreReportante: string;
  nitReportado: string;
  nombreReportado: string;
  detalle: string;
  valor: number;
  usoDeclaracion: string;
  informacionAdicional: string;
}

export interface ExogenaResumen {
  ano: number;
  tipoDocumento: string;
  identificacion: string;
  nombreCompleto: string;
  rows: ExogenaRow[];
  totales: ExogenaTotales;
}

export interface ExogenaTotales {
  ingresosSalariales: number;
  ingresosHonorarios: number;
  ingresosCapital: number;
  ingresosNoLaborales: number;
  retencionesRenta: number;
  retencionesICA: number;
  retencionesIVA: number;
  aportesEPS: number;
  aportesPension: number;
  aportesFSP: number;
  aportesARL: number;
  patrimonioInmuebles: number;
  patrimonioVehiculos: number;
  patrimonioInversiones: number;
  patrimonioCuentas: number;
  deudasHipotecarias: number;
  deudasFinancieras: number;
  dividendos: number;
  interesesFinancieros: number;
  arrendamientos: number;
  medicinaPrepagada: number;
  interesesVivienda: number;
  GMF: number;
  donaciones: number;
  pensiones: number;
  cesantias: number;
  interesesCesantias: number;
}

const ZERO_TOTALS: ExogenaTotales = {
  ingresosSalariales: 0,
  ingresosHonorarios: 0,
  ingresosCapital: 0,
  ingresosNoLaborales: 0,
  retencionesRenta: 0,
  retencionesICA: 0,
  retencionesIVA: 0,
  aportesEPS: 0,
  aportesPension: 0,
  aportesFSP: 0,
  aportesARL: 0,
  patrimonioInmuebles: 0,
  patrimonioVehiculos: 0,
  patrimonioInversiones: 0,
  patrimonioCuentas: 0,
  deudasHipotecarias: 0,
  deudasFinancieras: 0,
  dividendos: 0,
  interesesFinancieros: 0,
  arrendamientos: 0,
  medicinaPrepagada: 0,
  interesesVivienda: 0,
  GMF: 0,
  donaciones: 0,
  pensiones: 0,
  cesantias: 0,
  interesesCesantias: 0,
};

// ── Keyword classifiers ──────────────────────────────────

const CLASSIFICATION_RULES: Array<{
  field: keyof ExogenaTotales;
  keywords: RegExp;
}> = [
  // Ingresos
  { field: "ingresosSalariales", keywords: /salario|sueldo|pago laboral|n[oó]mina|ingreso laboral|salarial/i },
  { field: "ingresosHonorarios", keywords: /honorario|servicio|comisi[oó]n|consultor[ií]a|independiente/i },
  { field: "ingresosCapital", keywords: /rendimiento financiero|inter[eé]s(?!.*vivienda)(?!.*ces).*CDT|dividendo.*fiduci|rendimiento|CDT|fiducia/i },
  { field: "ingresosNoLaborales", keywords: /ingreso comercial|ingreso no laboral|venta|ingreso.*negocio/i },

  // Retenciones
  { field: "retencionesRenta", keywords: /retenci[oó]n.*(?:fuente|renta)|retefuente|rete.*renta/i },
  { field: "retencionesICA", keywords: /retenci[oó]n.*ICA|reteICA|rete.*industria/i },
  { field: "retencionesIVA", keywords: /retenci[oó]n.*IVA|reteIVA/i },

  // Seguridad social
  { field: "aportesEPS", keywords: /EPS|salud(?!.*prepagada)|aporte.*salud/i },
  { field: "aportesPension", keywords: /pensi[oó]n(?!.*voluntari).*obligatori|fondo.*pensi[oó]n|AFP|aporte.*pensi[oó]n/i },
  { field: "aportesFSP", keywords: /solidaridad.*pensional|fondo.*solidaridad|FSP/i },
  { field: "aportesARL", keywords: /ARL|riesgo.*laboral/i },

  // Patrimonio
  { field: "patrimonioInmuebles", keywords: /inmueble|predio|vivienda|casa|apartamento|lote|bien.*ra[ií]z|finca/i },
  { field: "patrimonioVehiculos", keywords: /veh[ií]culo|automotor|carro|moto/i },
  { field: "patrimonioInversiones", keywords: /inversi[oó]n|acci[oó]n|t[ií]tulo|bono|fondo.*inversi[oó]n/i },
  { field: "patrimonioCuentas", keywords: /cuenta.*(?:ahorro|corriente)|dep[oó]sito|saldo.*bancario/i },

  // Deudas
  { field: "deudasHipotecarias", keywords: /hipoteca|cr[eé]dito.*vivienda|leasing.*habitacional/i },
  { field: "deudasFinancieras", keywords: /cr[eé]dito(?!.*vivienda)|deuda|obligaci[oó]n.*financiera|tarjeta.*cr[eé]dito|pr[eé]stamo/i },

  // Otros ingresos específicos
  { field: "dividendos", keywords: /dividendo|participaci[oó]n.*utilidad/i },
  { field: "interesesFinancieros", keywords: /inter[eé]s.*financiero|rendimiento.*financiero|inter[eé]s.*bancario/i },
  { field: "arrendamientos", keywords: /arrendamiento|arriendo|c[aá]non/i },

  // Deducciones
  { field: "medicinaPrepagada", keywords: /prepagada|medicina.*prepagada|plan.*complementario/i },
  { field: "interesesVivienda", keywords: /inter[eé]s.*vivienda|cr[eé]dito.*hipotecario.*inter[eé]s/i },
  { field: "GMF", keywords: /GMF|gravamen.*financiero|4.*mil|cuatro.*mil/i },
  { field: "donaciones", keywords: /donaci[oó]n/i },

  // Pensiones y cesantías
  { field: "pensiones", keywords: /pensi[oó]n(?!.*obligatori)|mesada.*pensional/i },
  { field: "cesantias", keywords: /cesant[ií]a(?!.*inter[eé]s)/i },
  { field: "interesesCesantias", keywords: /inter[eé]s.*cesant[ií]a/i },
];

// ── Value extractors ─────────────────────────────────────

/**
 * Parse monetary value from strings like "$136,310,048" or "136310048"
 */
function parseMonetaryValue(raw: unknown): number {
  if (typeof raw === "number") return raw;
  if (typeof raw !== "string") return 0;
  const cleaned = raw.replace(/[$.,\s]/g, "").replace(/,/g, "");
  const num = parseInt(cleaned, 10);
  return isNaN(num) ? 0 : num;
}

/**
 * Try to extract a monetary value from a detail string.
 * Handles patterns like "Tope 1 - Ingresos: $136,310,048"
 */
function extractValueFromDetail(detail: string): number | null {
  const match = detail.match(/\$[\d.,]+/);
  if (match) return parseMonetaryValue(match[0]);
  return null;
}

// ── Main parser ──────────────────────────────────────────

/**
 * Parse an Exógena DIAN report from an ArrayBuffer (uploaded Excel file).
 */
export function parseExogena(buffer: ArrayBuffer): ExogenaResumen {
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) throw new Error("El archivo no contiene hojas de cálculo.");

  const sheet = workbook.Sheets[sheetName];
  if (!sheet) throw new Error("No se pudo leer la hoja de cálculo.");

  const jsonData = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: "",
  });

  if (jsonData.length === 0) throw new Error("La hoja de cálculo está vacía.");

  // Extract header info from first rows or column headers
  let ano = 0;
  let tipoDocumento = "";
  let identificacion = "";
  let nombreCompleto = "";

  // Try to find header metadata
  const firstRow = jsonData[0] as Record<string, unknown>;
  const keys = Object.keys(firstRow);

  // Common Exógena column name patterns
  for (const key of keys) {
    const kl = key.toLowerCase();
    if (kl.includes("año") || kl === "año") {
      ano = parseInt(String(firstRow[key]), 10) || 0;
    }
    if (kl.includes("tipo") && kl.includes("documento")) {
      tipoDocumento = String(firstRow[key]);
    }
    if (kl === "identificación" || kl === "identificacion") {
      identificacion = String(firstRow[key]);
    }
    if (kl.includes("nombre") && !kl.includes("report")) {
      nombreCompleto = String(firstRow[key]);
    }
  }

  // Parse all data rows
  const rows: ExogenaRow[] = [];
  const totals = { ...ZERO_TOTALS };

  for (const raw of jsonData) {
    const row = raw as Record<string, unknown>;

    // Find columns dynamically
    let detalle = "";
    let valor = 0;
    let usoDeclaracion = "";
    let infoAdicional = "";
    let nitReportante = "";
    let nombreReportante = "";
    let nitReportado = "";
    let nombreReportado = "";

    for (const [key, val] of Object.entries(row)) {
      const kl = key.toLowerCase();
      if (kl.includes("detalle") || kl.includes("concepto") || kl.includes("descripción")) {
        detalle = String(val);
      }
      if (kl === "valor" || kl.includes("monto") || kl.includes("valor reportado")) {
        valor = parseMonetaryValue(val);
      }
      if (kl.includes("uso") && kl.includes("declaración")) {
        usoDeclaracion = String(val);
      }
      if (kl.includes("información adicional") || kl.includes("informacion adicional")) {
        infoAdicional = String(val);
      }
      if (kl.includes("nit") && kl.includes("reportante")) {
        nitReportante = String(val);
      }
      if (kl.includes("nombre") && kl.includes("reportante")) {
        nombreReportante = String(val);
      }
      if (kl.includes("nit") && kl.includes("reportado")) {
        nitReportado = String(val);
      }
      if (kl.includes("nombre") && kl.includes("reportad")) {
        nombreReportado = String(val);
      }
    }

    // If valor is 0, try to extract from detalle
    if (valor === 0 && detalle) {
      const extracted = extractValueFromDetail(detalle);
      if (extracted !== null) valor = extracted;
    }

    if (!detalle && valor === 0) continue; // Skip empty rows

    const exogenaRow: ExogenaRow = {
      nitReportante,
      nombreReportante,
      nitReportado,
      nombreReportado,
      detalle,
      valor,
      usoDeclaracion,
      informacionAdicional: infoAdicional,
    };
    rows.push(exogenaRow);

    // Classify and accumulate
    const textToMatch = `${detalle} ${usoDeclaracion} ${infoAdicional}`.toLowerCase();
    for (const rule of CLASSIFICATION_RULES) {
      if (rule.keywords.test(textToMatch)) {
        totals[rule.field] += valor;
        break; // First match wins
      }
    }
  }

  // Backfill header info if not found in columns
  if (ano === 0) {
    // Scan all rows for year
    for (const row of jsonData) {
      for (const [key, val] of Object.entries(row as Record<string, unknown>)) {
        if (key.toLowerCase().includes("año")) {
          ano = parseInt(String(val), 10) || 0;
          if (ano > 2000) break;
        }
      }
      if (ano > 2000) break;
    }
  }

  if (!nombreCompleto) {
    // Try "Nombre" column from any row
    for (const row of jsonData) {
      for (const [key, val] of Object.entries(row as Record<string, unknown>)) {
        const kl = key.toLowerCase();
        if (kl === "nombre" || (kl.includes("nombre") && !kl.includes("report"))) {
          const v = String(val).trim();
          if (v && v.length > 3) {
            nombreCompleto = v;
            break;
          }
        }
      }
      if (nombreCompleto) break;
    }
  }

  return {
    ano,
    tipoDocumento,
    identificacion,
    nombreCompleto,
    rows,
    totales: totals,
  };
}

/**
 * Generate a human-readable summary of the Exógena data for the agent.
 */
export function formatExogenaForAgent(resumen: ExogenaResumen): string {
  const t = resumen.totales;
  const sections: string[] = [];

  sections.push(`## Resumen Exógena ${resumen.ano || "(año no detectado)"}`);
  if (resumen.nombreCompleto) sections.push(`**Contribuyente:** ${resumen.nombreCompleto}`);
  if (resumen.identificacion) sections.push(`**${resumen.tipoDocumento || "Doc"}:** ${resumen.identificacion}`);
  sections.push(`**Registros procesados:** ${resumen.rows.length}`);

  // Ingresos
  const ingresos: string[] = [];
  if (t.ingresosSalariales > 0) ingresos.push(`  - Salariales: $${t.ingresosSalariales.toLocaleString("es-CO")}`);
  if (t.ingresosHonorarios > 0) ingresos.push(`  - Honorarios: $${t.ingresosHonorarios.toLocaleString("es-CO")}`);
  if (t.ingresosCapital > 0) ingresos.push(`  - Capital: $${t.ingresosCapital.toLocaleString("es-CO")}`);
  if (t.ingresosNoLaborales > 0) ingresos.push(`  - No laborales: $${t.ingresosNoLaborales.toLocaleString("es-CO")}`);
  if (t.dividendos > 0) ingresos.push(`  - Dividendos: $${t.dividendos.toLocaleString("es-CO")}`);
  if (t.interesesFinancieros > 0) ingresos.push(`  - Intereses financieros: $${t.interesesFinancieros.toLocaleString("es-CO")}`);
  if (t.arrendamientos > 0) ingresos.push(`  - Arrendamientos: $${t.arrendamientos.toLocaleString("es-CO")}`);
  if (t.pensiones > 0) ingresos.push(`  - Pensiones: $${t.pensiones.toLocaleString("es-CO")}`);
  if (ingresos.length > 0) {
    sections.push(`\n### Ingresos detectados\n${ingresos.join("\n")}`);
  }

  // Retenciones
  const retenciones: string[] = [];
  if (t.retencionesRenta > 0) retenciones.push(`  - Retención en la fuente (renta): $${t.retencionesRenta.toLocaleString("es-CO")}`);
  if (t.retencionesICA > 0) retenciones.push(`  - ReteICA: $${t.retencionesICA.toLocaleString("es-CO")}`);
  if (t.retencionesIVA > 0) retenciones.push(`  - ReteIVA: $${t.retencionesIVA.toLocaleString("es-CO")}`);
  if (retenciones.length > 0) {
    sections.push(`\n### Retenciones\n${retenciones.join("\n")}`);
  }

  // Seguridad social
  const segSocial: string[] = [];
  if (t.aportesEPS > 0) segSocial.push(`  - Aportes EPS: $${t.aportesEPS.toLocaleString("es-CO")}`);
  if (t.aportesPension > 0) segSocial.push(`  - Aportes pensión: $${t.aportesPension.toLocaleString("es-CO")}`);
  if (t.aportesFSP > 0) segSocial.push(`  - Fondo solidaridad: $${t.aportesFSP.toLocaleString("es-CO")}`);
  if (t.aportesARL > 0) segSocial.push(`  - ARL: $${t.aportesARL.toLocaleString("es-CO")}`);
  if (segSocial.length > 0) {
    sections.push(`\n### Seguridad Social\n${segSocial.join("\n")}`);
  }

  // Patrimonio
  const patrimonio: string[] = [];
  if (t.patrimonioInmuebles > 0) patrimonio.push(`  - Inmuebles: $${t.patrimonioInmuebles.toLocaleString("es-CO")}`);
  if (t.patrimonioVehiculos > 0) patrimonio.push(`  - Vehículos: $${t.patrimonioVehiculos.toLocaleString("es-CO")}`);
  if (t.patrimonioInversiones > 0) patrimonio.push(`  - Inversiones: $${t.patrimonioInversiones.toLocaleString("es-CO")}`);
  if (t.patrimonioCuentas > 0) patrimonio.push(`  - Cuentas bancarias: $${t.patrimonioCuentas.toLocaleString("es-CO")}`);
  if (patrimonio.length > 0) {
    sections.push(`\n### Patrimonio\n${patrimonio.join("\n")}`);
  }

  // Deudas
  const deudas: string[] = [];
  if (t.deudasHipotecarias > 0) deudas.push(`  - Hipotecarias: $${t.deudasHipotecarias.toLocaleString("es-CO")}`);
  if (t.deudasFinancieras > 0) deudas.push(`  - Financieras: $${t.deudasFinancieras.toLocaleString("es-CO")}`);
  if (deudas.length > 0) {
    sections.push(`\n### Deudas\n${deudas.join("\n")}`);
  }

  // Deducciones detectadas
  const deducciones: string[] = [];
  if (t.medicinaPrepagada > 0) deducciones.push(`  - Medicina prepagada: $${t.medicinaPrepagada.toLocaleString("es-CO")}`);
  if (t.interesesVivienda > 0) deducciones.push(`  - Intereses vivienda: $${t.interesesVivienda.toLocaleString("es-CO")}`);
  if (t.GMF > 0) deducciones.push(`  - GMF (50%): $${t.GMF.toLocaleString("es-CO")}`);
  if (t.donaciones > 0) deducciones.push(`  - Donaciones: $${t.donaciones.toLocaleString("es-CO")}`);
  if (deducciones.length > 0) {
    sections.push(`\n### Deducciones detectadas\n${deducciones.join("\n")}`);
  }

  // Cesantías
  if (t.cesantias > 0 || t.interesesCesantias > 0) {
    sections.push(`\n### Cesantías`);
    if (t.cesantias > 0) sections.push(`  - Cesantías: $${t.cesantias.toLocaleString("es-CO")}`);
    if (t.interesesCesantias > 0) sections.push(`  - Intereses cesantías: $${t.interesesCesantias.toLocaleString("es-CO")}`);
  }

  // Raw rows not classified
  const unclassified = resumen.rows.filter(r => {
    const text = `${r.detalle} ${r.usoDeclaracion} ${r.informacionAdicional}`;
    return !CLASSIFICATION_RULES.some(rule => rule.keywords.test(text));
  });

  if (unclassified.length > 0) {
    sections.push(`\n### Registros sin clasificar (${unclassified.length})`);
    for (const row of unclassified.slice(0, 10)) {
      sections.push(`  - "${row.detalle}": $${row.valor.toLocaleString("es-CO")}`);
    }
    if (unclassified.length > 10) {
      sections.push(`  - ... y ${unclassified.length - 10} más`);
    }
  }

  return sections.join("\n");
}
