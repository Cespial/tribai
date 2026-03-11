/* ───────────────────────────────────────────────────────────
   types.ts — Declaración de Renta AG2025 Personas Naturales
   Modelo CETA-level: 4 subcédulas, topes compartidos,
   distribución secuencial, ET 240/241 correcto.
   Formulario 210 DIAN.
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
  /** 1=primer año, 2=segundo, 3+=tercero en adelante (Art. 807 ET) */
  anosDeclarando: number;
}

// ── Umbrales para obligación de declarar ─────────────────

export interface UmbralesDeclarar {
  patrimonioBruto: number;
  ingresoBruto: number;
  comprasConsumos: number;
  consignaciones: number;
  movimientosTarjetas: number;
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
  valorFiscalAnterior: number;
  pais: "colombia" | "exterior";
}

export interface DeudaPatrimonial {
  id: string;
  tipo: "hipoteca" | "credito" | "tarjeta_credito" | "otra_deuda";
  descripcion: string;
  saldoDiciembre31: number;
  saldoAnterior: number;
}

export interface Patrimonio {
  bienes: BienPatrimonial[];
  deudas: DeudaPatrimonial[];
}

// ── Cédula General ───────────────────────────────────────

// Subcédula 1a: Rentas de Trabajo
export interface RentasTrabajo {
  // Ingresos
  salariosYPagosLaborales: number;
  honorariosServicios: number; // Solo si NO reporta en subcédula 1b
  otrosIngresosTrabajo: number;
  prestacionesSociales: number;
  viaticos: number;
  gastosRepresentacion: number;
  compensacionesTrabajo: number;
  indemnizacionesLaborales: number;
  alimentacionNoSalarial: number;
  ingresosCANConvenio: number;
  cesantiasFondo: number;
  interesesCesantias: number;
  cesantiasReembolsoIndependientes: number;
  // INCRGO
  aportesObligatoriosSalud: number;
  aportesObligatoriosPension: number;
  aportesVoluntariosPensionObligatoria: number;
  aportesARL: number;
  fondoSolidaridad: number;
  otrosINCR: number;
  /** Ingreso mensual promedio últimos 6 meses (para tabla cesantías) */
  ingresoMensualPromedio6m: number;
}

// Subcédula 1b: Honorarios con Costos y Gastos (NEW)
export interface RentasHonorarios {
  // Ingresos
  honorarios: number;
  serviciosPersonales: number;
  comisiones: number;
  otrosIngresosHonorarios: number;
  cesantiasReembolso: number;
  compensaciones: number;
  ingresosExterior: number;
  // INCRGO
  aportesObligatoriosPension: number;
  aportesVoluntariosPensionObligatoria: number;
  aportesObligatoriosSalud: number;
  aportesARL: number;
  otrosINCR: number;
  // Costos y Gastos
  costosDirectos: number;
  gastosNomina: number;
  otrosCostos: number;
}

// Subcédula 2: Rentas de Capital
export interface RentasCapital {
  interesesRendimientos: number;
  arrendamientos: number;
  regalias: number;
  otrosIngresosCapital: number;
  ingresosExterior: number;
  // INCRGO
  aportesObligatoriosPension: number;
  aportesVoluntariosPensionObligatoria: number;
  componenteInflacionario: number;
  aportesObligatoriosSalud: number;
  aportesARL: number;
  otrosINCRCapital: number;
  // Costos
  costosGastosCapital: number;
  depreciacion: number;
  otrosCostos: number;
}

// Subcédula 3: Rentas No Laborales
export interface RentasNoLaborales {
  ingresosComerciales: number;
  ingresosIndustriales: number;
  ingresosAgropecuarios: number;
  otrosIngresosNoLaborales: number;
  ingresosExterior: number;
  ingresosECE: number;
  devoluciones: number;
  // INCRGO
  aportesObligatoriosPension: number;
  aportesVoluntariosPensionObligatoria: number;
  aportesObligatoriosSalud: number;
  aportesARL: number;
  componenteInflacionario: number;
  aportesParafiscales: number;
  otrosINCRNoLaborales: number;
  // Costos
  costosVentasServicios: number;
  gastosNomina: number;
  otrosGastos: number;
  depreciacion: number;
}

// ── Deducciones (globales, engine distribuye) ────────────

export interface Deducciones {
  // === Sujetas al límite 40%/1,340 UVT ===
  interesesVivienda: number;
  medicinaPrepagada: number;
  /** Dependientes 10% del ingreso bruto, máx 32 UVT/mes */
  dependientes10Pct: number;
  GMFDeducible: number;
  interesesICETEX: number;
  cesantiasIndependientes: number;
  inversionEnergiaRenovable: number;
  donaciones: number;
  otrasDeducciones: number;

  // === Fuera del límite 40% (ET 336 Num. 3 y 5) ===
  /** Número de dependientes extra (0-4), cada uno 72 UVT */
  dependientesExtra: number;
  comprasFacturaElectronica: number;
}

// ── Exenciones (rentas exentas de la Cédula General) ────

export interface Exenciones {
  // Art. 206.10 - 25% exención laboral
  aplicar25PctLaboral: boolean;

  // Aportes voluntarios pensión/AFC (ET 126-1, 126-4)
  aportesVoluntariosPension: number;
  aportesAFC: number;
  aportesFVP: number;

  // Cesantías (solo aplica en subcédula trabajo)
  cesantiasFondoExentas: number; // Calculado por tabla según ingreso promedio
  interesesCesantiasExentos: number;
  cesantiasReembolsoExentas: number;

  // Ingresos CAN/convenio exentos
  ingresosCANExentos: number;

  // Exenciones especiales (Art. 206 Nums. 1-3, etc.)
  indemnizacionMilitar: number;
  primaEspecialServicios: number;
  gastosReprMagistrados50Pct: number;
  gastosReprJueces25Pct: number;
  seguroInvalMuerteFP: number;
  gastosReprUnivPublicas50Pct: number;
  otrasExentasEspecificas: number;
}

// ── Cédula Pensiones ─────────────────────────────────────

export interface CedulaPensiones {
  pensionesNacionales: number;
  pensionesCAN: number;
  pensionesExterior: number;
  aportesObligatoriosSalud: number;
  /** Aportes vol. pensión/AFC en pensiones (30%/3,800 UVT acumulado) */
  aportesVoluntariosPensionAFC: number;
  /** Parte exenta de pensiones si algún mes > 1,000 UVT (ajuste manual) */
  ajusteExencionMensual: number;
}

// ── Cédula Dividendos ────────────────────────────────────

export interface CedulaDividendos {
  // Dividendos 2016 y anteriores (tabla especial DUT 1.2.1.10.3)
  dividendosNoGravados2016: number;
  dividendosGravados2016: number;
  dividendosExterior2016: number;

  // Subcédula 1: No gravados 2017+ (van a base combinada ET 241)
  dividendosNoGravadosNacionales: number;
  dividendosNoGravadosExterior: number;
  dividendosNoGravadosECE: number;

  // Subcédula 2: Gravados 2017+ (tarifa ET 240 = 35% AG2025)
  dividendosGravadosNacionales: number;
  dividendosGravadosExterior: number;
  dividendosGravadosECE: number;
}

// ── Ganancias Ocasionales ────────────────────────────────

export interface GananciasOcasionales {
  // I. Venta vivienda con AFC (ET 311-1, exenta 5,000 UVT)
  ventaViviendaAFCIngreso: number;
  ventaViviendaAFCCosto: number;
  // II. Venta activos fijos ≥2 años
  ventaActivosIngreso: number;
  ventaActivosCosto: number;
  recuperacionDeducciones: number;
  // III. Herencias, legados, donaciones
  herenciasLegadosDonaciones: number;
  porcionConyugal: number;
  segurosVida: number;
  // IV. Loterías, rifas, apuestas (20%)
  loteriasRifasApuestas: number;
  // V. Otras
  otrasGanancias: number;
}

// ── Descuentos Tributarios (NEW) ─────────────────────────

export interface DescuentosTributarios {
  impuestosExterior: number;
  inversionAmbiental: number;
  inversionID: number;
  donacionesRegimenEspecial: number;
  becasDeportivas: number;
  IVAImportacionActivos: number;
}

// ── Datos Adicionales (anticipo y liquidación) ──────────

export interface DatosAdicionales {
  impuestoNetoAGAnterior: number;
  anticipoAGAnterior: number;
  saldoFavorAGAnterior: number;
  retencionesAGActual: number;
  sanciones: number;
}

// ── Retenciones y Anticipos ──────────────────────────────

export interface RetencionesAnticipos {
  retencionFuenteRenta: number;
  retencionFuenteOtros: number;
  retencionDividendos: number;
  retencionGananciasOcasionales: number;
  anticipoAnoAnterior: number;
  saldoFavorAnterior: number;
}

// ── Estado completo de la declaración ────────────────────

export interface DeclaracionState {
  currentStep: number;
  completedSteps: number[];

  perfil: PerfilContribuyente;
  umbrales: UmbralesDeclarar;
  patrimonio: Patrimonio;
  rentasTrabajo: RentasTrabajo;
  rentasHonorarios: RentasHonorarios;
  rentasCapital: RentasCapital;
  rentasNoLaborales: RentasNoLaborales;
  deducciones: Deducciones;
  exenciones: Exenciones;
  cedulaPensiones: CedulaPensiones;
  cedulaDividendos: CedulaDividendos;
  gananciasOcasionales: GananciasOcasionales;
  descuentosTributarios: DescuentosTributarios;
  datosAdicionales: DatosAdicionales;
  retencionesAnticipos: RetencionesAnticipos;

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
  patrimonioBrutoAnterior: number;
  deudasTotal: number;
  deudasTotalAnterior: number;
  patrimonioLiquido: number;
  patrimonioLiquidoAnterior: number;
  incrementoPatrimonial: number;
  incrementoJustificado: number;
  diferenciaInjustificada: number;
}

export interface ResultadoSubcedula {
  ingresosBrutos: number;
  INCRGO: number;
  costosGastos: number;
  rentaLiquida: number;
  perdida: number;
  // Distribución del límite 40%/1340 UVT
  deduccionesAsignadas: number;
  exencionesAsignadas: number;
  totalImputadoSujetoLimite: number;
  totalImputadoFueraLimite: number;
  rentaLiquidaGravable: number;
}

export interface ResultadoCedulaGeneral {
  // Per-subcédula
  trabajo: ResultadoSubcedula;
  honorarios: ResultadoSubcedula;
  capital: ResultadoSubcedula;
  noLaborales: ResultadoSubcedula;

  // Consolidado
  rentaLiquidaCedulaGeneral: number;
  totalSujetoAlLimite: number;
  limite40_1340: number;
  limiteEfectivo: number;

  // Después de distribución
  rentaLiquidaOrdinaria: number;

  // Compensaciones y rentas gravables
  compensacionPerdidas: number;
  rentasGravables: number;
  rentaLiquidaGravable: number;
  rentaLiquidaGravableUVT: number;

  // Warnings
  limiteExcedido: boolean;
  dependientesCapped: boolean;

  // Accumulated caps (for pension cédula)
  acumVolPensionAFC: number;
}

export interface ResultadoCedulaPensiones {
  ingresosBrutosPensiones: number;
  INCRPensiones: number;
  rentaLiquidaPensiones: number;
  exencionPensionesNacionales: number;
  exencionPensionesCAN: number;
  exencionPensionesExterior: number;
  exencionVoluntariosPension: number;
  totalExenciones: number;
  rentaLiquidaGravablePensiones: number;
}

export interface ResultadoCedulaDividendos {
  // 2016 y anteriores
  dividendos2016Gravables: number;
  impuestoDividendos2016: number;

  // Subcédula 1: No gravados → base combinada ET 241
  subcedula1Total: number;

  // Subcédula 2: Gravados → ET 240 (35%)
  subcedula2Total: number;
  impuestoET240: number;
  excesoSubcedula2: number; // va a base combinada

  impuestoTotalDividendos: number;
}

export interface ResultadoGananciasOcasionales {
  gananciasBrutas: number;
  costosGanancias: number;
  exencionViviendaAFC: number;
  exencionHerencias: number;
  exencionPorcionConyugal: number;
  exencionSegurosVida: number;
  totalExenciones: number;
  gananciaGravableGeneral: number;
  gananciaGravableLoterias: number;
  impuestoGeneralGO: number;
  impuestoLoteriasGO: number;
  impuestoTotalGO: number;
}

export interface ResultadoDescuentos {
  descuentosLimitados: number;
  descuentoIVAActivos: number;
  descuentoDividendos: number;
  totalDescuentos: number;
}

export interface ResultadoLiquidacion {
  // Base combinada ET 241
  baseCombinada: number;
  baseCombidadaUVT: number;
  impuestoET241: number;

  // Dividendos ET 240
  impuestoET240: number;

  // Total impuesto renta
  impuestoRentaTotal: number;

  // Descuentos
  descuentosTributarios: number;
  impuestoNetoRenta: number;

  // Ganancia Ocasional
  impuestoGananciaOcasional: number;

  // Total a cargo
  totalImpuestoCargo: number;

  // Anticipo
  anticipoOpcion1: number;
  anticipoOpcion2: number;
  anticipoRecomendado: number;

  // Liquidación final
  menosAnticipoAnterior: number;
  menosRetenciones: number;
  masSanciones: number;
  saldoPagar: number;
  saldoFavor: number;
}

export interface ResultadoDeclaracion {
  patrimonio: ResultadoPatrimonio;
  cedulaGeneral: ResultadoCedulaGeneral;
  cedulaPensiones: ResultadoCedulaPensiones;
  cedulaDividendos: ResultadoCedulaDividendos;
  gananciasOcasionales: ResultadoGananciasOcasionales;
  descuentos: ResultadoDescuentos;
  liquidacion: ResultadoLiquidacion;
  breakdown: BreakdownRango[];
  tasaEfectivaGlobal: number;
  sugerencias: SugerenciaOptimizacion[];
}

// ── Sugerencias de optimización ──────────────────────────

export interface SugerenciaOptimizacion {
  id: string;
  titulo: string;
  descripcion: string;
  ahorroPotencial: number;
  articuloET: string;
  tipo: "deduccion" | "exencion" | "estrategia" | "descuento";
}

// ── Wizard Steps ─────────────────────────────────────────

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
    description: "Salarios, honorarios con exención 25%, prestaciones, cesantías",
    icon: "Briefcase",
    required: true,
  },
  {
    id: "honorarios",
    label: "Honorarios con costos",
    shortLabel: "Honorarios",
    description: "Honorarios, servicios y comisiones con costos y gastos deducibles",
    icon: "FileText",
    required: false,
  },
  {
    id: "capital",
    label: "Rentas de capital",
    shortLabel: "Capital",
    description: "Intereses, rendimientos, arrendamientos y regalías",
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
    description: "Beneficios tributarios con límite 40%/1,340 UVT (ET 336)",
    icon: "Percent",
    required: true,
  },
  {
    id: "pensiones",
    label: "Pensiones",
    shortLabel: "Pensiones",
    description: "Pensiones nacionales, CAN y del exterior (exención 1,000 UVT/mes)",
    icon: "Heart",
    required: false,
  },
  {
    id: "dividendos",
    label: "Dividendos",
    shortLabel: "Dividendos",
    description: "Dividendos y participaciones (ET 240 + ET 241)",
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
    id: "descuentos",
    label: "Descuentos tributarios",
    shortLabel: "Descuentos",
    description: "Descuentos sobre el impuesto (ET 254-258)",
    icon: "Tag",
    required: false,
  },
  {
    id: "retenciones",
    label: "Retenciones y anticipos",
    shortLabel: "Retenciones",
    description: "Retenciones en la fuente y datos del año anterior",
    icon: "Receipt",
    required: true,
  },
  {
    id: "resumen",
    label: "Resumen y resultado",
    shortLabel: "Resumen",
    description: "Resultado consolidado, anticipo y Formulario 210",
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
  | { type: "UPDATE_RENTAS_HONORARIOS"; payload: Partial<RentasHonorarios> }
  | { type: "UPDATE_RENTAS_CAPITAL"; payload: Partial<RentasCapital> }
  | { type: "UPDATE_RENTAS_NO_LABORALES"; payload: Partial<RentasNoLaborales> }
  | { type: "UPDATE_DEDUCCIONES"; payload: Partial<Deducciones> }
  | { type: "UPDATE_EXENCIONES"; payload: Partial<Exenciones> }
  | { type: "UPDATE_CEDULA_PENSIONES"; payload: Partial<CedulaPensiones> }
  | { type: "UPDATE_CEDULA_DIVIDENDOS"; payload: Partial<CedulaDividendos> }
  | { type: "UPDATE_GANANCIAS_OCASIONALES"; payload: Partial<GananciasOcasionales> }
  | { type: "UPDATE_DESCUENTOS_TRIBUTARIOS"; payload: Partial<DescuentosTributarios> }
  | { type: "UPDATE_DATOS_ADICIONALES"; payload: Partial<DatosAdicionales> }
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
  prestacionesSociales: 0,
  viaticos: 0,
  gastosRepresentacion: 0,
  compensacionesTrabajo: 0,
  indemnizacionesLaborales: 0,
  alimentacionNoSalarial: 0,
  ingresosCANConvenio: 0,
  cesantiasFondo: 0,
  interesesCesantias: 0,
  cesantiasReembolsoIndependientes: 0,
  aportesObligatoriosSalud: 0,
  aportesObligatoriosPension: 0,
  aportesVoluntariosPensionObligatoria: 0,
  aportesARL: 0,
  fondoSolidaridad: 0,
  otrosINCR: 0,
  ingresoMensualPromedio6m: 0,
};

export const DEFAULT_RENTAS_HONORARIOS: RentasHonorarios = {
  honorarios: 0,
  serviciosPersonales: 0,
  comisiones: 0,
  otrosIngresosHonorarios: 0,
  cesantiasReembolso: 0,
  compensaciones: 0,
  ingresosExterior: 0,
  aportesObligatoriosPension: 0,
  aportesVoluntariosPensionObligatoria: 0,
  aportesObligatoriosSalud: 0,
  aportesARL: 0,
  otrosINCR: 0,
  costosDirectos: 0,
  gastosNomina: 0,
  otrosCostos: 0,
};

export const DEFAULT_RENTAS_CAPITAL: RentasCapital = {
  interesesRendimientos: 0,
  arrendamientos: 0,
  regalias: 0,
  otrosIngresosCapital: 0,
  ingresosExterior: 0,
  aportesObligatoriosPension: 0,
  aportesVoluntariosPensionObligatoria: 0,
  componenteInflacionario: 0,
  aportesObligatoriosSalud: 0,
  aportesARL: 0,
  otrosINCRCapital: 0,
  costosGastosCapital: 0,
  depreciacion: 0,
  otrosCostos: 0,
};

export const DEFAULT_RENTAS_NO_LABORALES: RentasNoLaborales = {
  ingresosComerciales: 0,
  ingresosIndustriales: 0,
  ingresosAgropecuarios: 0,
  otrosIngresosNoLaborales: 0,
  ingresosExterior: 0,
  ingresosECE: 0,
  devoluciones: 0,
  aportesObligatoriosPension: 0,
  aportesVoluntariosPensionObligatoria: 0,
  aportesObligatoriosSalud: 0,
  aportesARL: 0,
  componenteInflacionario: 0,
  aportesParafiscales: 0,
  otrosINCRNoLaborales: 0,
  costosVentasServicios: 0,
  gastosNomina: 0,
  otrosGastos: 0,
  depreciacion: 0,
};

export const DEFAULT_DEDUCCIONES: Deducciones = {
  interesesVivienda: 0,
  medicinaPrepagada: 0,
  dependientes10Pct: 0,
  GMFDeducible: 0,
  interesesICETEX: 0,
  cesantiasIndependientes: 0,
  inversionEnergiaRenovable: 0,
  donaciones: 0,
  otrasDeducciones: 0,
  dependientesExtra: 0,
  comprasFacturaElectronica: 0,
};

export const DEFAULT_EXENCIONES: Exenciones = {
  aplicar25PctLaboral: true,
  aportesVoluntariosPension: 0,
  aportesAFC: 0,
  aportesFVP: 0,
  cesantiasFondoExentas: 0,
  interesesCesantiasExentos: 0,
  cesantiasReembolsoExentas: 0,
  ingresosCANExentos: 0,
  indemnizacionMilitar: 0,
  primaEspecialServicios: 0,
  gastosReprMagistrados50Pct: 0,
  gastosReprJueces25Pct: 0,
  seguroInvalMuerteFP: 0,
  gastosReprUnivPublicas50Pct: 0,
  otrasExentasEspecificas: 0,
};

export const DEFAULT_CEDULA_PENSIONES: CedulaPensiones = {
  pensionesNacionales: 0,
  pensionesCAN: 0,
  pensionesExterior: 0,
  aportesObligatoriosSalud: 0,
  aportesVoluntariosPensionAFC: 0,
  ajusteExencionMensual: 0,
};

export const DEFAULT_CEDULA_DIVIDENDOS: CedulaDividendos = {
  dividendosNoGravados2016: 0,
  dividendosGravados2016: 0,
  dividendosExterior2016: 0,
  dividendosNoGravadosNacionales: 0,
  dividendosNoGravadosExterior: 0,
  dividendosNoGravadosECE: 0,
  dividendosGravadosNacionales: 0,
  dividendosGravadosExterior: 0,
  dividendosGravadosECE: 0,
};

export const DEFAULT_GANANCIAS_OCASIONALES: GananciasOcasionales = {
  ventaViviendaAFCIngreso: 0,
  ventaViviendaAFCCosto: 0,
  ventaActivosIngreso: 0,
  ventaActivosCosto: 0,
  recuperacionDeducciones: 0,
  herenciasLegadosDonaciones: 0,
  porcionConyugal: 0,
  segurosVida: 0,
  loteriasRifasApuestas: 0,
  otrasGanancias: 0,
};

export const DEFAULT_DESCUENTOS_TRIBUTARIOS: DescuentosTributarios = {
  impuestosExterior: 0,
  inversionAmbiental: 0,
  inversionID: 0,
  donacionesRegimenEspecial: 0,
  becasDeportivas: 0,
  IVAImportacionActivos: 0,
};

export const DEFAULT_DATOS_ADICIONALES: DatosAdicionales = {
  impuestoNetoAGAnterior: 0,
  anticipoAGAnterior: 0,
  saldoFavorAGAnterior: 0,
  retencionesAGActual: 0,
  sanciones: 0,
};

export const DEFAULT_RETENCIONES_ANTICIPOS: RetencionesAnticipos = {
  retencionFuenteRenta: 0,
  retencionFuenteOtros: 0,
  retencionDividendos: 0,
  retencionGananciasOcasionales: 0,
  anticipoAnoAnterior: 0,
  saldoFavorAnterior: 0,
};

export const INITIAL_STATE: DeclaracionState = {
  currentStep: 0,
  completedSteps: [],
  perfil: DEFAULT_PERFIL,
  umbrales: DEFAULT_UMBRALES,
  patrimonio: DEFAULT_PATRIMONIO,
  rentasTrabajo: DEFAULT_RENTAS_TRABAJO,
  rentasHonorarios: DEFAULT_RENTAS_HONORARIOS,
  rentasCapital: DEFAULT_RENTAS_CAPITAL,
  rentasNoLaborales: DEFAULT_RENTAS_NO_LABORALES,
  deducciones: DEFAULT_DEDUCCIONES,
  exenciones: DEFAULT_EXENCIONES,
  cedulaPensiones: DEFAULT_CEDULA_PENSIONES,
  cedulaDividendos: DEFAULT_CEDULA_DIVIDENDOS,
  gananciasOcasionales: DEFAULT_GANANCIAS_OCASIONALES,
  descuentosTributarios: DEFAULT_DESCUENTOS_TRIBUTARIOS,
  datosAdicionales: DEFAULT_DATOS_ADICIONALES,
  retencionesAnticipos: DEFAULT_RETENCIONES_ANTICIPOS,
  lastSaved: null,
  version: 2,
};
