// UVT historico 2006-2026
export const UVT_VALUES: Record<number, number> = {
  2006: 20_000,
  2007: 20_974,
  2008: 22_054,
  2009: 23_763,
  2010: 24_555,
  2011: 25_132,
  2012: 26_049,
  2013: 26_841,
  2014: 27_485,
  2015: 28_279,
  2016: 29_753,
  2017: 31_859,
  2018: 33_156,
  2019: 34_270,
  2020: 35_607,
  2021: 36_308,
  2022: 38_004,
  2023: 42_412,
  2024: 47_065,
  2025: 49_799,
  2026: 52_374,
};

export const CURRENT_UVT_YEAR = 2026;

// Tabla marginal Art. 241 ET — Renta personas naturales (cedula general)
export const RENTA_BRACKETS = [
  { from: 0, to: 1_090, rate: 0, base: 0 },
  { from: 1_090, to: 1_700, rate: 0.19, base: 0 },
  { from: 1_700, to: 4_100, rate: 0.28, base: 116 },
  { from: 4_100, to: 8_670, rate: 0.33, base: 788 },
  { from: 8_670, to: 18_970, rate: 0.35, base: 2_296 },
  { from: 18_970, to: 31_000, rate: 0.37, base: 5_901 },
  { from: 31_000, to: Infinity, rate: 0.39, base: 10_352 },
];

// Tabla retencion salarios Art. 383 ET
export const RETENCION_SALARIOS_BRACKETS = [
  { from: 0, to: 95, rate: 0, base: 0 },
  { from: 95, to: 150, rate: 0.19, base: 0 },
  { from: 150, to: 360, rate: 0.28, base: 10 },
  { from: 360, to: 640, rate: 0.33, base: 69 },
  { from: 640, to: 945, rate: 0.35, base: 161 },
  { from: 945, to: 2_300, rate: 0.37, base: 268 },
  { from: 2_300, to: Infinity, rate: 0.39, base: 770 },
];

// Conceptos de retencion en la fuente 2026 (Decreto 0572/2025)
export const RETENCION_CONCEPTOS = [
  { id: "compras", concepto: "Compras generales", baseUVT: 10, tarifa: 0.025, declarante: null, art: "401" },
  { id: "servicios-d", concepto: "Servicios (declarante)", baseUVT: 2, tarifa: 0.04, declarante: true, art: "392" },
  { id: "servicios-nd", concepto: "Servicios (no declarante)", baseUVT: 2, tarifa: 0.06, declarante: false, art: "392" },
  { id: "honorarios-d", concepto: "Honorarios (declarante)", baseUVT: 0, tarifa: 0.10, declarante: true, art: "392" },
  { id: "honorarios-nd", concepto: "Honorarios (no declarante)", baseUVT: 0, tarifa: 0.11, declarante: false, art: "392" },
  { id: "arrendamiento", concepto: "Arrendamiento inmuebles", baseUVT: 10, tarifa: 0.035, declarante: null, art: "401" },
  { id: "loterias", concepto: "Loterias, rifas, apuestas", baseUVT: 48, tarifa: 0.20, declarante: null, art: "317" },
  { id: "activos-fijos", concepto: "Enajenacion activos fijos (PN)", baseUVT: 10, tarifa: 0.01, declarante: null, art: "398" },
  {
    id: "salarios",
    concepto: "Salarios y rentas de trabajo",
    baseUVT: 0,
    tarifa: null,
    declarante: null,
    art: "383",
    progressive: true,
  },
] as const;

// Limites Ley 2277/2022
export const LEY_2277_LIMITS = {
  rentasExentasMaxUVT: 790,
  deduccionesExentasMaxUVT: 1_340,
  dependienteUVT: 72,
  maxDependientes: 4,
  interesesViviendaUVT: 1_200,
  medicinaPrepagadaUVTMes: 16,
  dependientes10PctUVTMes: 32,
  icetexUVT: 100,
  cesantiasIndepUVT: 2_500,
  volPensionAFCPct: 0.30,
  volPensionAFCTopeUVT: 3_800,
  volObligatorioPct: 0.25,
  pensionExentaUVTMes: 1_000,
};

// Tarifas ET 240 por año gravable (dividendos gravados)
export const ET240_RATES: Record<number, number> = {
  2017: 0.35,
  2018: 0.35,
  2019: 0.33,
  2020: 0.32,
  2021: 0.31,
  2022: 0.35,
  2023: 0.35,
  2024: 0.35,
  2025: 0.35,
};

// Tabla exención de cesantías (Art. 206 Num. 4)
// Porcentaje exento según ingreso mensual promedio en UVT
export const CESANTIAS_EXEMPTION_TABLE = [
  { maxUVT: 350, pct: 1.00 },
  { maxUVT: 410, pct: 0.90 },
  { maxUVT: 470, pct: 0.80 },
  { maxUVT: 530, pct: 0.60 },
  { maxUVT: 590, pct: 0.40 },
  { maxUVT: 650, pct: 0.20 },
  { maxUVT: Infinity, pct: 0.00 },
] as const;

// Tabla dividendos 2016 y anteriores (DUT 1.2.1.10.3)
export const DIVIDENDOS_2016_BRACKETS = [
  { from: 0, to: 600, rate: 0, base: 0 },
  { from: 600, to: 1_000, rate: 0.05, base: 0 },
  { from: 1_000, to: Infinity, rate: 0.10, base: 20 },
] as const;

// GMF
export const GMF_RATE = 0.004;
export const GMF_EXEMPT_UVT = 350;

// IVA
export const IVA_RATES = { general: 0.19, reducido: 0.05 };

// ── Comparador de Contratacion 2026 ──
export const SMLMV_2026 = 1_750_905;
export const AUXILIO_TRANSPORTE_2026 = 249_095;
export const SALARIO_INTEGRAL_MIN_SMLMV = 13;

export const EMPLOYER_RATES = {
  salud: 0.085, pension: 0.12, arl: 0.00522,
  sena: 0.02, icbf: 0.03, ccf: 0.04,
  cesantias: 0.0833, intCesantias: 0.01, prima: 0.0833, vacaciones: 0.0417,
};

export const EMPLOYEE_RATES = { salud: 0.04, pension: 0.04 };

export const INDEPENDENT_RATES = {
  baseSS: 0.40, salud: 0.125, pension: 0.17, arl: 0.00522,
};

export const SALARIO_INTEGRAL_RATES = {
  factorPrestacional: 0.30, baseSS: 0.70,
};

export const IVA_THRESHOLD_UVT_ANNUAL = 3_500;

// SIMPLE (ET 908, Decreto 1545/2024)
export const SIMPLE_GROUPS = [
  { id: 1, label: "Grupo 1: Tiendas, mini y micromercados" },
  { id: 2, label: "Grupo 2: Comerciales, industriales" },
  { id: 3, label: "Grupo 3: Servicios profesionales, consultoria" },
  { id: 4, label: "Grupo 4: Expendio comidas y bebidas" },
  { id: 5, label: "Grupo 5: Educacion y salud" },
];

export const SIMPLE_BRACKETS = [
  { from: 0,      to: 6_000,   rates: [0.017, 0.032, 0.059, 0.032, 0.019] },
  { from: 6_000,  to: 15_000,  rates: [0.019, 0.038, 0.073, 0.038, 0.025] },
  { from: 15_000, to: 30_000,  rates: [0.054, 0.039, 0.120, 0.039, 0.042] },
  { from: 30_000, to: 100_000, rates: [0.067, 0.052, 0.145, 0.052, 0.052] },
];

// ── Seguridad Social 2026 ──

/** ARL clases de riesgo — Decreto 1295/1994 Art. 26 */
export const ARL_CLASSES = [
  { clase: "I",   rate: 0.00522, description: "Riesgo minimo (oficinas, administrativo)" },
  { clase: "II",  rate: 0.01044, description: "Riesgo bajo (manufactura liviana)" },
  { clase: "III", rate: 0.02436, description: "Riesgo medio (transporte, electromecanica)" },
  { clase: "IV",  rate: 0.04350, description: "Riesgo alto (mineria, metalurgia)" },
  { clase: "V",   rate: 0.06960, description: "Riesgo maximo (asbesto, bomberos, explosivos)" },
] as const;

/** Fondo de Solidaridad Pensional — Ley 797/2003 Art. 8 (reforma 2024 SUSPENDIDA) */
export const FSP_BRACKETS = [
  { fromSMLMV: 4,  toSMLMV: 16, rate: 0.010, detail: "0.5% solidaridad + 0.5% subsistencia" },
  { fromSMLMV: 16, toSMLMV: 17, rate: 0.012, detail: "0.5% solidaridad + 0.7% subsistencia" },
  { fromSMLMV: 17, toSMLMV: 18, rate: 0.014, detail: "0.5% solidaridad + 0.9% subsistencia" },
  { fromSMLMV: 18, toSMLMV: 19, rate: 0.016, detail: "0.5% solidaridad + 1.1% subsistencia" },
  { fromSMLMV: 19, toSMLMV: 20, rate: 0.018, detail: "0.5% solidaridad + 1.3% subsistencia" },
  { fromSMLMV: 20, toSMLMV: Infinity, rate: 0.020, detail: "0.5% solidaridad + 1.5% subsistencia" },
] as const;

export const IBC_MIN_SMLMV = 1;
export const IBC_MAX_SMLMV = 25;
export const SS_PENSION_TOTAL_RATE = 0.16;
export const SS_SALUD_TOTAL_RATE = 0.125;
export const EXONERATION_THRESHOLD_SMLMV = 10;

// ── Vencimientos AG2025 — Personas Naturales (F210) ──
// Decreto 2229 de 2023 — últimos 2 dígitos del NIT/CC

export const VENCIMIENTOS_AG2025_PN: { digitosFinal: string; fecha: string }[] = [
  { digitosFinal: "01-02", fecha: "2026-08-12" },
  { digitosFinal: "03-04", fecha: "2026-08-13" },
  { digitosFinal: "05-06", fecha: "2026-08-14" },
  { digitosFinal: "07-08", fecha: "2026-08-18" },
  { digitosFinal: "09-10", fecha: "2026-08-19" },
  { digitosFinal: "11-12", fecha: "2026-08-20" },
  { digitosFinal: "13-14", fecha: "2026-08-21" },
  { digitosFinal: "15-16", fecha: "2026-08-22" },
  { digitosFinal: "17-18", fecha: "2026-08-25" },
  { digitosFinal: "19-20", fecha: "2026-08-26" },
  { digitosFinal: "21-22", fecha: "2026-08-27" },
  { digitosFinal: "23-24", fecha: "2026-08-28" },
  { digitosFinal: "25-26", fecha: "2026-08-29" },
  { digitosFinal: "27-28", fecha: "2026-09-01" },
  { digitosFinal: "29-30", fecha: "2026-09-02" },
  { digitosFinal: "31-32", fecha: "2026-09-03" },
  { digitosFinal: "33-34", fecha: "2026-09-04" },
  { digitosFinal: "35-36", fecha: "2026-09-05" },
  { digitosFinal: "37-38", fecha: "2026-09-08" },
  { digitosFinal: "39-40", fecha: "2026-09-09" },
  { digitosFinal: "41-42", fecha: "2026-09-10" },
  { digitosFinal: "43-44", fecha: "2026-09-11" },
  { digitosFinal: "45-46", fecha: "2026-09-12" },
  { digitosFinal: "47-48", fecha: "2026-09-15" },
  { digitosFinal: "49-50", fecha: "2026-09-16" },
  { digitosFinal: "51-52", fecha: "2026-09-17" },
  { digitosFinal: "53-54", fecha: "2026-09-18" },
  { digitosFinal: "55-56", fecha: "2026-09-19" },
  { digitosFinal: "57-58", fecha: "2026-09-22" },
  { digitosFinal: "59-60", fecha: "2026-09-23" },
  { digitosFinal: "61-62", fecha: "2026-09-24" },
  { digitosFinal: "63-64", fecha: "2026-09-25" },
  { digitosFinal: "65-66", fecha: "2026-09-26" },
  { digitosFinal: "67-68", fecha: "2026-09-29" },
  { digitosFinal: "69-70", fecha: "2026-09-30" },
  { digitosFinal: "71-72", fecha: "2026-10-01" },
  { digitosFinal: "73-74", fecha: "2026-10-02" },
  { digitosFinal: "75-76", fecha: "2026-10-03" },
  { digitosFinal: "77-78", fecha: "2026-10-06" },
  { digitosFinal: "79-80", fecha: "2026-10-07" },
  { digitosFinal: "81-82", fecha: "2026-10-08" },
  { digitosFinal: "83-84", fecha: "2026-10-09" },
  { digitosFinal: "85-86", fecha: "2026-10-10" },
  { digitosFinal: "87-88", fecha: "2026-10-14" },
  { digitosFinal: "89-90", fecha: "2026-10-15" },
  { digitosFinal: "91-92", fecha: "2026-10-16" },
  { digitosFinal: "93-94", fecha: "2026-10-17" },
  { digitosFinal: "95-96", fecha: "2026-10-20" },
  { digitosFinal: "97-98", fecha: "2026-10-21" },
  { digitosFinal: "99-00", fecha: "2026-10-22" },
];

/** Look up filing deadline given the last 2 digits of NIT/CC */
export function getVencimientoPN(ultimos2Digitos: number): string | undefined {
  const entry = VENCIMIENTOS_AG2025_PN.find((v) => {
    const [lo, hi] = v.digitosFinal.split("-").map(Number);
    return ultimos2Digitos >= lo && ultimos2Digitos <= hi;
  });
  return entry?.fecha;
}

// ── Porcentaje anticipo por años declarando ──
export const ANTICIPO_PCT: Record<number, number> = {
  1: 0.25, // primer año
  2: 0.50, // segundo año
  3: 0.75, // tercer año en adelante
};
