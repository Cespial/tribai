/* ───────────────────────────────────────────────────────────
   types.ts — Declaración de Renta Personas Naturales
   Modela el Formulario 210 DIAN, perfil tributario,
   documentos y resultado del cálculo.
   ─────────────────────────────────────────────────────────── */

// ── Perfil del contribuyente ─────────────────────────────

export type TipoDocumento = "CC" | "CE" | "NIT" | "TI" | "PA";
export type TipoContribuyente =
  | "empleado"
  | "independiente"
  | "pensionado"
  | "rentista_capital"
  | "mixto";

export type ActividadEconomica =
  | "salarios"
  | "honorarios"
  | "servicios"
  | "comercial"
  | "agropecuaria"
  | "industrial"
  | "profesion_liberal"
  | "otro";

export interface PerfilContribuyente {
  nombres: string;
  apellidos: string;
  tipoDocumento: TipoDocumento;
  numeroDocumento: string;
  digitoVerificacion: string;
  direccion: string;
  municipio: string;
  departamento: string;
  tipoContribuyente: TipoContribuyente;
  actividadEconomica: ActividadEconomica;
  esGranContribuyente: boolean;
  esResponsableIVA: boolean;
  anoGravable: number;
  /** Años que lleva declarando renta: 1=primer año, 2=segundo, 3+=tercero en adelante.
   *  Determina el % del anticipo (Art. 807 ET): 25% / 50% / 75%. */
  anosDeclarando: number;
}

// ── Umbrales para obligación de declarar ─────────────────

export interface UmbralesDeclarar {
  patrimonioBruto: number; // > 4,500 UVT
  ingresoBruto: number; // > 1,400 UVT
  comprasConsumos: number; // > 1,400 UVT
  consignaciones: number; // > 1,400 UVT
  movimientosTarjetas: number; // > 1,400 UVT
}

export interface ResultadoUmbrales {
  debeDeclarar: boolean;
  razones: string[];
}

// ── Patrimonio (Casillas 29-42 F210) ─────────────────────

export interface BienPatrimonial {
  id: string;
  tipo: "inmueble" | "vehiculo" | "inversion" | "cuenta_bancaria" | "otro_bien";
  descripcion: string;
  valorFiscal: number;
  pais: "colombia" | "exterior";
}

export interface DeudaPatrimonial {
  id: string;
  tipo: "hipoteca" | "credito" | "tarjeta_credito" | "otra_deuda";
  descripcion: string;
  saldoDiciembre31: number;
}

export interface Patrimonio {
  bienes: BienPatrimonial[];
  deudas: DeudaPatrimonial[];
}

// ── Cédula General ───────────────────────────────────────

// Rentas de Trabajo (Casillas 43-67)
export interface RentasTrabajo {
  salariosYPagosLaborales: number;
  honorariosServicios: number;
  otrosIngresosTrabajo: number;
  aportesObligatoriosSalud: number;
  aportesObligatoriosPension: number;
  aportesVoluntariosPension: number;
  fondoSolidaridad: number;
  otrosINCR: number;
}

// Rentas de Capital (Casillas 68-75)
export interface RentasCapital {
  interesesRendimientos: number;
  arrendamientos: number;
  regalias: number;
  otrosIngresosCapital: number;
  costosGastosCapital: number;
  INCRCapital: number;
}

// Rentas No Laborales (Casillas 76-84)
export interface RentasNoLaborales {
  ingresosComerciales: number;
  ingresosIndustriales: number;
  ingresosAgropecuarios: number;
  otrosIngresosNoLaborales: number;
  costosGastosNoLaborales: number;
  INCRNoLaborales: number;
}

// ── Deducciones y Rentas Exentas ─────────────────────────

export interface Deducciones {
  // Art. 206.10 - 25% exenta
  exenta25Porciento: boolean;
  // Art. 387 - Dependientes (max 72 UVT/mes, max 4)
  dependientes: number;
  // Art. 119 - Intereses vivienda (max 100 UVT/mes = 1,200 UVT/año)
  interesesVivienda: number;
  // Art. 387 - Medicina prepagada (max 16 UVT/mes = 192 UVT/año)
  medicinaPrepagada: number;
  // Art. 126-1 - AFC y FVP (max 30% ingreso, tope 3,800 UVT)
  aportesAFC: number;
  aportesFVP: number;
  // Art. 126-4 - Pensiones voluntarias (max 30% ingreso, tope 3,800 UVT)
  pensionesVoluntarias: number;
  // Art. 257 - Donaciones
  donaciones: number;
  // Gravamen movimientos financieros (50% deducible)
  GMFDeducible: number;
  // Otras deducciones
  otrasDeducciones: number;
}

// ── Cédula Pensiones (Casillas 85-92) ────────────────────

export interface CedulaPensiones {
  pensionJubilacion: number;
  pensionSobreviviente: number;
  pensionInvalidez: number;
  otrasPensiones: number;
  aportesObligatoriosSalud: number;
}

// ── Cédula Dividendos (Casillas 93-102) ──────────────────

export interface CedulaDividendos {
  dividendosNoGravados2016: number; // Distribuidos antes de 2017
  dividendosNoGravados: number; // Sub-cédula 1 (Art. 242)
  dividendosGravados: number; // Sub-cédula 2 (Art. 241 + 242)
  participacionesNoGravadas: number;
  participacionesGravadas: number;
}

// ── Ganancias Ocasionales (Casillas 103-112) ─────────────

export interface GananciasOcasionales {
  ventaVivienda: number; // Venta vivienda habitación (Art. 311-1, exención 7,500 UVT)
  ventaOtrosActivos: number; // Otros activos poseídos +2 años (sin exención vivienda)
  herenciasDonaciones: number;
  loterias: number;
  indemnizaciones: number;
  otrasGanancias: number;
  costosGanancias: number;
}

// ── Retenciones y Anticipos ──────────────────────────────

export interface RetencionesAnticipos {
  retencionFuenteRenta: number;
  retencionFuenteOtros: number;
  anticipoAnoAnterior: number;
  saldoFavorAnterior: number;
  retencionDividendos: number;
}

// ── Estado completo de la declaración ────────────────────

export interface DeclaracionState {
  // Paso actual del wizard
  currentStep: number;
  completedSteps: number[];

  // Datos
  perfil: PerfilContribuyente;
  umbrales: UmbralesDeclarar;
  patrimonio: Patrimonio;
  rentasTrabajo: RentasTrabajo;
  rentasCapital: RentasCapital;
  rentasNoLaborales: RentasNoLaborales;
  deducciones: Deducciones;
  cedulaPensiones: CedulaPensiones;
  cedulaDividendos: CedulaDividendos;
  gananciasOcasionales: GananciasOcasionales;
  retencionesAnticipos: RetencionesAnticipos;

  // Metadata
  lastSaved: string | null;
  version: number;
}

// ── Resultado del cálculo ────────────────────────────────

export interface BreakdownRango {
  from: number;
  to: number;
  rate: number;
  baseUVT: number;
  impuestoUVT: number;
  impuestoCOP: number;
}

export interface ResultadoPatrimonio {
  patrimonioBruto: number;
  deudasTotal: number;
  patrimonioLiquido: number;
}

export interface ResultadoCedulaGeneral {
  // Trabajo
  ingresosBrutosTrabajo: number;
  INCRTrabajo: number;
  rentaLiquidaTrabajo: number;
  // Capital
  ingresosBrutosCapital: number;
  INCRCapitalTotal: number;
  rentaLiquidaCapital: number;
  // No Laborales
  ingresosBrutosNoLaborales: number;
  INCRNoLaboralesTotal: number;
  rentaLiquidaNoLaborales: number;
  // Consolidado
  rentaLiquidaCedulaGeneral: number;
  deduccionesAplicadas: number;
  rentasExentasAplicadas: number;
  rentaLiquidaGravable: number;
  rentaLiquidaGravableUVT: number;
  impuestoCedulaGeneral: number;
  // Warnings
  exentasCapped: boolean;
  combinadoCapped: boolean;
  dependientesCapped: boolean;
}

export interface ResultadoCedulaPensiones {
  ingresosBrutosPensiones: number;
  INCRPensiones: number;
  rentaExentaPensiones: number;
  rentaLiquidaGravablePensiones: number;
  impuestoCedulaPensiones: number;
}

export interface ResultadoCedulaDividendos {
  subCedula1Total: number;
  subCedula1Impuesto: number;
  subCedula2Total: number;
  subCedula2Impuesto: number;
  impuestoTotalDividendos: number;
}

export interface ResultadoGananciasOcasionales {
  gananciasBrutas: number;
  costosGanancias: number;
  gananciaExenta: number;
  gananciaGravable: number;
  impuestoGanancias: number;
}

export interface ResultadoLiquidacion {
  impuestoRentaTotal: number;
  descuentosTributarios: number;
  impuestoNeto: number;
  anticipoSiguienteAno: number;
  totalRetenciones: number;
  saldoFavorAnterior: number;
  anticipoAnterior: number;
  saldoPagar: number;
  saldoFavor: number;
}

export interface ResultadoDeclaracion {
  patrimonio: ResultadoPatrimonio;
  cedulaGeneral: ResultadoCedulaGeneral;
  cedulaPensiones: ResultadoCedulaPensiones;
  cedulaDividendos: ResultadoCedulaDividendos;
  gananciasOcasionales: ResultadoGananciasOcasionales;
  liquidacion: ResultadoLiquidacion;
  breakdown: BreakdownRango[];
  tasaEfectivaGlobal: number;
  // Optimización
  sugerencias: SugerenciaOptimizacion[];
}

// ── Sugerencias de optimización ──────────────────────────

export interface SugerenciaOptimizacion {
  id: string;
  titulo: string;
  descripcion: string;
  ahorroPotencial: number;
  articuloET: string;
  tipo: "deduccion" | "exencion" | "estrategia";
}

// ── Wizard Step metadata ─────────────────────────────────

export interface WizardStepMeta {
  id: string;
  label: string;
  shortLabel: string;
  description: string;
  icon: string;
  required: boolean;
}

export const WIZARD_STEPS: WizardStepMeta[] = [
  {
    id: "perfil",
    label: "Datos personales",
    shortLabel: "Perfil",
    description: "Información básica del contribuyente",
    icon: "User",
    required: true,
  },
  {
    id: "obligacion",
    label: "¿Debo declarar?",
    shortLabel: "Obligación",
    description: "Verificación de umbrales Art. 592-594 ET",
    icon: "HelpCircle",
    required: true,
  },
  {
    id: "patrimonio",
    label: "Patrimonio",
    shortLabel: "Patrimonio",
    description: "Bienes, inversiones y deudas al 31 de diciembre",
    icon: "Building2",
    required: true,
  },
  {
    id: "trabajo",
    label: "Rentas de trabajo",
    shortLabel: "Trabajo",
    description: "Salarios, honorarios, servicios y comisiones",
    icon: "Briefcase",
    required: true,
  },
  {
    id: "capital",
    label: "Rentas de capital",
    shortLabel: "Capital",
    description: "Intereses, rendimientos y arrendamientos",
    icon: "TrendingUp",
    required: false,
  },
  {
    id: "no-laborales",
    label: "Rentas no laborales",
    shortLabel: "No laborales",
    description: "Ingresos comerciales, industriales y agropecuarios",
    icon: "Store",
    required: false,
  },
  {
    id: "deducciones",
    label: "Deducciones y exenciones",
    shortLabel: "Deducciones",
    description: "Beneficios tributarios con validación de topes legales",
    icon: "Percent",
    required: true,
  },
  {
    id: "pensiones",
    label: "Pensiones",
    shortLabel: "Pensiones",
    description: "Ingresos por pensión de jubilación, invalidez o sobrevivientes",
    icon: "Heart",
    required: false,
  },
  {
    id: "dividendos",
    label: "Dividendos",
    shortLabel: "Dividendos",
    description: "Dividendos y participaciones recibidas",
    icon: "BarChart3",
    required: false,
  },
  {
    id: "ganancias-ocasionales",
    label: "Ganancias ocasionales",
    shortLabel: "Ganancias",
    description: "Herencias, loterías, venta de activos de largo plazo",
    icon: "Gift",
    required: false,
  },
  {
    id: "retenciones",
    label: "Retenciones y anticipos",
    shortLabel: "Retenciones",
    description: "Retenciones en la fuente practicadas y anticipos pagados",
    icon: "Receipt",
    required: true,
  },
  {
    id: "resumen",
    label: "Resumen y resultado",
    shortLabel: "Resumen",
    description: "Resultado consolidado del impuesto y Formulario 210",
    icon: "FileCheck",
    required: true,
  },
];

// ── Actions del reducer ──────────────────────────────────

export type DeclaracionAction =
  | { type: "SET_STEP"; step: number }
  | { type: "COMPLETE_STEP"; step: number }
  | { type: "UPDATE_PERFIL"; payload: Partial<PerfilContribuyente> }
  | { type: "UPDATE_UMBRALES"; payload: Partial<UmbralesDeclarar> }
  | { type: "UPDATE_PATRIMONIO"; payload: Partial<Patrimonio> }
  | { type: "ADD_BIEN"; payload: BienPatrimonial }
  | { type: "REMOVE_BIEN"; id: string }
  | { type: "UPDATE_BIEN"; id: string; payload: Partial<BienPatrimonial> }
  | { type: "ADD_DEUDA"; payload: DeudaPatrimonial }
  | { type: "REMOVE_DEUDA"; id: string }
  | { type: "UPDATE_DEUDA"; id: string; payload: Partial<DeudaPatrimonial> }
  | { type: "UPDATE_RENTAS_TRABAJO"; payload: Partial<RentasTrabajo> }
  | { type: "UPDATE_RENTAS_CAPITAL"; payload: Partial<RentasCapital> }
  | { type: "UPDATE_RENTAS_NO_LABORALES"; payload: Partial<RentasNoLaborales> }
  | { type: "UPDATE_DEDUCCIONES"; payload: Partial<Deducciones> }
  | { type: "UPDATE_CEDULA_PENSIONES"; payload: Partial<CedulaPensiones> }
  | { type: "UPDATE_CEDULA_DIVIDENDOS"; payload: Partial<CedulaDividendos> }
  | { type: "UPDATE_GANANCIAS_OCASIONALES"; payload: Partial<GananciasOcasionales> }
  | { type: "UPDATE_RETENCIONES_ANTICIPOS"; payload: Partial<RetencionesAnticipos> }
  | { type: "LOAD_SAVED"; payload: DeclaracionState }
  | { type: "RESET" };

// ── Defaults ─────────────────────────────────────────────

export const DEFAULT_PERFIL: PerfilContribuyente = {
  nombres: "",
  apellidos: "",
  tipoDocumento: "CC",
  numeroDocumento: "",
  digitoVerificacion: "",
  direccion: "",
  municipio: "",
  departamento: "",
  tipoContribuyente: "empleado",
  actividadEconomica: "salarios",
  esGranContribuyente: false,
  esResponsableIVA: false,
  anoGravable: 2025,
  anosDeclarando: 3,
};

export const DEFAULT_UMBRALES: UmbralesDeclarar = {
  patrimonioBruto: 0,
  ingresoBruto: 0,
  comprasConsumos: 0,
  consignaciones: 0,
  movimientosTarjetas: 0,
};

export const DEFAULT_PATRIMONIO: Patrimonio = {
  bienes: [],
  deudas: [],
};

export const DEFAULT_RENTAS_TRABAJO: RentasTrabajo = {
  salariosYPagosLaborales: 0,
  honorariosServicios: 0,
  otrosIngresosTrabajo: 0,
  aportesObligatoriosSalud: 0,
  aportesObligatoriosPension: 0,
  aportesVoluntariosPension: 0,
  fondoSolidaridad: 0,
  otrosINCR: 0,
};

export const DEFAULT_RENTAS_CAPITAL: RentasCapital = {
  interesesRendimientos: 0,
  arrendamientos: 0,
  regalias: 0,
  otrosIngresosCapital: 0,
  costosGastosCapital: 0,
  INCRCapital: 0,
};

export const DEFAULT_RENTAS_NO_LABORALES: RentasNoLaborales = {
  ingresosComerciales: 0,
  ingresosIndustriales: 0,
  ingresosAgropecuarios: 0,
  otrosIngresosNoLaborales: 0,
  costosGastosNoLaborales: 0,
  INCRNoLaborales: 0,
};

export const DEFAULT_DEDUCCIONES: Deducciones = {
  exenta25Porciento: true,
  dependientes: 0,
  interesesVivienda: 0,
  medicinaPrepagada: 0,
  aportesAFC: 0,
  aportesFVP: 0,
  pensionesVoluntarias: 0,
  donaciones: 0,
  GMFDeducible: 0,
  otrasDeducciones: 0,
};

export const DEFAULT_CEDULA_PENSIONES: CedulaPensiones = {
  pensionJubilacion: 0,
  pensionSobreviviente: 0,
  pensionInvalidez: 0,
  otrasPensiones: 0,
  aportesObligatoriosSalud: 0,
};

export const DEFAULT_CEDULA_DIVIDENDOS: CedulaDividendos = {
  dividendosNoGravados2016: 0,
  dividendosNoGravados: 0,
  dividendosGravados: 0,
  participacionesNoGravadas: 0,
  participacionesGravadas: 0,
};

export const DEFAULT_GANANCIAS_OCASIONALES: GananciasOcasionales = {
  ventaVivienda: 0,
  ventaOtrosActivos: 0,
  herenciasDonaciones: 0,
  loterias: 0,
  indemnizaciones: 0,
  otrasGanancias: 0,
  costosGanancias: 0,
};

export const DEFAULT_RETENCIONES_ANTICIPOS: RetencionesAnticipos = {
  retencionFuenteRenta: 0,
  retencionFuenteOtros: 0,
  anticipoAnoAnterior: 0,
  saldoFavorAnterior: 0,
  retencionDividendos: 0,
};

export const INITIAL_STATE: DeclaracionState = {
  currentStep: 0,
  completedSteps: [],
  perfil: DEFAULT_PERFIL,
  umbrales: DEFAULT_UMBRALES,
  patrimonio: DEFAULT_PATRIMONIO,
  rentasTrabajo: DEFAULT_RENTAS_TRABAJO,
  rentasCapital: DEFAULT_RENTAS_CAPITAL,
  rentasNoLaborales: DEFAULT_RENTAS_NO_LABORALES,
  deducciones: DEFAULT_DEDUCCIONES,
  cedulaPensiones: DEFAULT_CEDULA_PENSIONES,
  cedulaDividendos: DEFAULT_CEDULA_DIVIDENDOS,
  gananciasOcasionales: DEFAULT_GANANCIAS_OCASIONALES,
  retencionesAnticipos: DEFAULT_RETENCIONES_ANTICIPOS,
  lastSaved: null,
  version: 1,
};
