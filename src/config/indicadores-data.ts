export type IndicatorCategoryId = "tributarios" | "laborales" | "financieros" | "monetarios";

export const INDICADORES_LAST_UPDATE = "2026-03-02";

export interface IndicatorHistoryPoint {
  period: string;
  value: number;
}

export interface IndicatorItem {
  id: string;
  nombre: string;
  valor: string;
  valorNumerico: number;
  unidad: "cop" | "porcentaje" | "indice";
  fechaCorte: string;
  paraQueSirve: string;
  categoria: IndicatorCategoryId;
  notas?: string;
  articulo?: string;
  calculatorHrefs: string[];
  history: IndicatorHistoryPoint[];
}

export interface IndicatorCategory {
  id: IndicatorCategoryId;
  categoria: string;
  items: IndicatorItem[];
}

export const INDICADORES_ITEMS: IndicatorItem[] = [
  {
    id: "uvt",
    nombre: "UVT 2026",
    valor: "$52,374",
    valorNumerico: 52374,
    unidad: "cop",
    fechaCorte: "2026-01-01",
    paraQueSirve:
      "Sirve para convertir topes, sanciones, deducciones y umbrales del Estatuto Tributario a pesos colombianos.",
    categoria: "tributarios",
    notas: "Resolución DIAN 000238 del 15 de diciembre de 2025. Variación IPC 5.17%.",
    articulo: "868",
    calculatorHrefs: ["/calculadoras/uvt", "/calculadoras/debo-declarar", "/calculadoras/retencion"],
    history: [
      { period: "2017", value: 31859 },
      { period: "2018", value: 33156 },
      { period: "2019", value: 34270 },
      { period: "2020", value: 35607 },
      { period: "2021", value: 36308 },
      { period: "2022", value: 38004 },
      { period: "2023", value: 42412 },
      { period: "2024", value: 47065 },
      { period: "2025", value: 49799 },
      { period: "2026", value: 52374 },
    ],
  },
  {
    id: "smlmv",
    nombre: "SMLMV 2026",
    valor: "$1,750,905",
    valorNumerico: 1750905,
    unidad: "cop",
    fechaCorte: "2026-01-01",
    paraQueSirve:
      "Impacta bases de seguridad social, retención laboral, costos de nómina y beneficios asociados al salario mínimo.",
    categoria: "laborales",
    notas: "Decreto 1469 de 2025. Incluye únicamente salario base, sin auxilio de transporte. Aumento del 23%.",
    calculatorHrefs: ["/calculadoras/nomina-completa", "/calculadoras/seguridad-social"],
    history: [
      { period: "2017", value: 737717 },
      { period: "2018", value: 781242 },
      { period: "2019", value: 828116 },
      { period: "2020", value: 877803 },
      { period: "2021", value: 908526 },
      { period: "2022", value: 1000000 },
      { period: "2023", value: 1160000 },
      { period: "2024", value: 1300000 },
      { period: "2025", value: 1423500 },
      { period: "2026", value: 1750905 },
    ],
  },
  {
    id: "trm",
    nombre: "TRM referencia",
    valor: "$3,766",
    valorNumerico: 3766,
    unidad: "cop",
    fechaCorte: "2026-03-01",
    paraQueSirve:
      "Se usa para convertir obligaciones en moneda extranjera y valorar activos, pasivos y operaciones internacionales.",
    categoria: "financieros",
    notas: "Valor de referencia. La TRM cambia diariamente. Consultar Superfinanciera o Banrep para el valor vigente.",
    calculatorHrefs: ["/calculadoras/renta-juridicas", "/calculadoras/comparador-regimenes"],
    history: [
      { period: "2017", value: 2951 },
      { period: "2018", value: 2956 },
      { period: "2019", value: 3281 },
      { period: "2020", value: 3693 },
      { period: "2021", value: 3743 },
      { period: "2022", value: 4255 },
      { period: "2023", value: 3822 },
      { period: "2024", value: 3908 },
      { period: "2025", value: 4025 },
      { period: "2026", value: 3766 },
    ],
  },
  {
    id: "usura",
    nombre: "Tasa de usura",
    valor: "25.52% E.A.",
    valorNumerico: 25.52,
    unidad: "porcentaje",
    fechaCorte: "2026-03-01",
    paraQueSirve:
      "Define el límite legal para intereses de financiación y sirve de base para calcular intereses moratorios tributarios.",
    categoria: "financieros",
    notas: "Modalidad consumo y ordinario. Superfinanciera certifica mensualmente. Verificar para otras modalidades.",
    calculatorHrefs: ["/calculadoras/intereses-mora"],
    history: [
      { period: "2017", value: 31.0 },
      { period: "2018", value: 30.8 },
      { period: "2019", value: 28.6 },
      { period: "2020", value: 27.1 },
      { period: "2021", value: 25.9 },
      { period: "2022", value: 31.9 },
      { period: "2023", value: 37.6 },
      { period: "2024", value: 34.1 },
      { period: "2025", value: 30.8 },
      { period: "2026", value: 25.52 },
    ],
  },
  {
    id: "auxilio-transporte",
    nombre: "Auxilio de transporte",
    valor: "$249,095",
    valorNumerico: 249095,
    unidad: "cop",
    fechaCorte: "2026-01-01",
    paraQueSirve:
      "Complementa el ingreso de trabajadores con salario hasta dos mínimos y afecta costos laborales mensuales.",
    categoria: "laborales",
    notas: "Decreto 1470 de 2025. Aumento del 24.5%.",
    calculatorHrefs: ["/calculadoras/nomina-completa"],
    history: [
      { period: "2022", value: 117172 },
      { period: "2023", value: 140606 },
      { period: "2024", value: 162000 },
      { period: "2025", value: 200000 },
      { period: "2026", value: 249095 },
    ],
  },
  {
    id: "ipc",
    nombre: "IPC anual",
    valor: "5.35%",
    valorNumerico: 5.35,
    unidad: "porcentaje",
    fechaCorte: "2026-01-31",
    paraQueSirve:
      "Se usa para ajustes de valores tributarios, actualizaciones de topes y proyecciones financieras anuales.",
    categoria: "monetarios",
    notas: "Variación anual enero 2025 a enero 2026. DANE, boletín IPC enero 2026.",
    calculatorHrefs: ["/calculadoras/uvt"],
    history: [
      { period: "2017", value: 4.09 },
      { period: "2018", value: 3.18 },
      { period: "2019", value: 3.8 },
      { period: "2020", value: 1.61 },
      { period: "2021", value: 5.62 },
      { period: "2022", value: 13.12 },
      { period: "2023", value: 9.28 },
      { period: "2024", value: 5.20 },
      { period: "2025", value: 5.10 },
      { period: "2026", value: 5.35 },
    ],
  },
  {
    id: "dtf",
    nombre: "DTF efectiva anual",
    valor: "10.25%",
    valorNumerico: 10.25,
    unidad: "porcentaje",
    fechaCorte: "2026-03-01",
    paraQueSirve:
      "Indicador de referencia para contratos financieros y actualizaciones de costos de financiación empresarial.",
    categoria: "financieros",
    notas: "Tasa de referencia. Banrep subió tasa de política monetaria a 10.25% en febrero 2026.",
    calculatorHrefs: ["/calculadoras/intereses-mora"],
    history: [
      { period: "2019", value: 4.8 },
      { period: "2020", value: 2.7 },
      { period: "2021", value: 2.0 },
      { period: "2022", value: 9.0 },
      { period: "2023", value: 13.2 },
      { period: "2024", value: 11.3 },
      { period: "2025", value: 10.6 },
      { period: "2026", value: 10.25 },
    ],
  },
  {
    id: "sancion-minima",
    nombre: "Sanción mínima",
    valor: "10 UVT ($523,740)",
    valorNumerico: 523740,
    unidad: "cop",
    fechaCorte: "2026-01-01",
    paraQueSirve:
      "Marca el mínimo de sanción tributaria aplicable en procesos de fiscalización y cumplimiento.",
    categoria: "tributarios",
    articulo: "639",
    calculatorHrefs: ["/calculadoras/sanciones", "/calculadoras/sanciones-ampliadas"],
    history: [
      { period: "2022", value: 380040 },
      { period: "2023", value: 424120 },
      { period: "2024", value: 470650 },
      { period: "2025", value: 497990 },
      { period: "2026", value: 523740 },
    ],
  },
  {
    id: "gmf-exento",
    nombre: "GMF exento mensual",
    valor: "350 UVT ($18,330,900)",
    valorNumerico: 18330900,
    unidad: "cop",
    fechaCorte: "2026-01-01",
    paraQueSirve:
      "Permite estimar el límite de movimientos exentos del 4x1000 en cuentas marcadas.",
    categoria: "tributarios",
    articulo: "879",
    calculatorHrefs: ["/calculadoras/gmf"],
    history: [
      { period: "2022", value: 13301400 },
      { period: "2023", value: 14844200 },
      { period: "2024", value: 16472750 },
      { period: "2025", value: 17429650 },
      { period: "2026", value: 18330900 },
    ],
  },
];

export const INDICADORES_DESTACADOS_IDS = ["uvt", "smlmv", "trm", "usura"];

export const INDICADORES_CATEGORIAS: IndicatorCategory[] = [
  {
    id: "tributarios",
    categoria: "Tributarios",
    items: INDICADORES_ITEMS.filter((item) => item.categoria === "tributarios"),
  },
  {
    id: "laborales",
    categoria: "Laborales",
    items: INDICADORES_ITEMS.filter((item) => item.categoria === "laborales"),
  },
  {
    id: "financieros",
    categoria: "Financieros",
    items: INDICADORES_ITEMS.filter((item) => item.categoria === "financieros"),
  },
  {
    id: "monetarios",
    categoria: "Monetarios",
    items: INDICADORES_ITEMS.filter((item) => item.categoria === "monetarios"),
  },
];

export const INDICADORES_MAP = Object.fromEntries(
  INDICADORES_ITEMS.map((item) => [item.id, item])
) as Record<string, IndicatorItem>;

export const UVT_COMPARATIVO = [
  { year: 2024, value: 47065 },
  { year: 2025, value: 49799 },
  { year: 2026, value: 52374 },
];

export const INDICADORES_2026 = INDICADORES_CATEGORIAS;
