/* ───────────────────────────────────────────────────────────
   types.ts — Declaración de Renta Personas Jurídicas
   Modela el Formulario 110 DIAN, perfil tributario,
   depuración de renta, descuentos, TTD y liquidación.
   ─────────────────────────────────────────────────────────── */

// ── Perfil de la persona jurídica ──────────────────────────

export type TipoEntidad =
  | "sociedad_nacional"
  | "entidad_financiera"
  | "generador_hidroelectrico"
  | "zona_franca_industrial"
  | "zona_franca_comercial"
  | "zona_franca_pre2023"
  | "hotelero"
  | "editorial"
  | "zese"
  | "zomac_micro_pequena"
  | "zomac_mediana_grande"
  | "mega_inversion"
  | "regimen_especial"
  | "extractivo";

export type TamanoEmpresa = "micro" | "pequena" | "mediana" | "grande";

export interface PerfilJuridico {
  razonSocial: string;
  nit: string;
  digitoVerificacion: string;
  codigoDireccionSeccional: string;
  actividadEconomica: string;
  tipoEntidad: TipoEntidad;
  tamano: TamanoEmpresa;
  anoGravable: number;
  anosDeclarando: number; // 1=primer año, 2=segundo, 3+=tercero+
  /** Porcentaje de ingresos de exportación (para zonas francas post-2022) */
  porcentajeExportacion: number;
  /** Años ZESE activos (1-10) */
  anosZESE: number;
}

// ── Datos Informativos (Casillas 30-32) ────────────────────

export interface DatosInformativos {
  totalCostosNomina: number;
  aportesSegSocial: number;
  aportesSenaIcbfCajas: number;
}

// ── Patrimonio ESF (Casillas 33-43) ────────────────────────

export interface PatrimonioJuridico {
  efectivoEquivalentes: number; // Cas 33
  inversionesFinancieras: number; // Cas 34
  cuentasPorCobrar: number; // Cas 35
  inventarios: number; // Cas 36
  activosIntangibles: number; // Cas 37
  activosBiologicos: number; // Cas 38
  ppePlantaEquipo: number; // Cas 39 (PPE + propiedades inversión + ANCMV)
  otrosActivos: number; // Cas 40
  pasivos: number; // Cas 42
}

// ── Ingresos (Casillas 44-56) ──────────────────────────────

export interface IngresosJuridicos {
  ingresosOperacionales: number; // Cas 44
  ingresosFinancieros: number; // Cas 45
  dividendosSubcedula2: number; // Cas 46 (gravados Art. 49 par. 2)
  dividendosOtros: number; // Cas 47
  dividendosTarifa27: number; // Cas 48 (entidades Art. 240)
  ingresosGananciasOcasionales: number; // Cas 49
  recuperacionDeducciones: number; // Cas 50
  ingresosParticipaciones: number; // Cas 51
  otrosIngresos: number; // Cas 52
  devolucionesDescuentos: number; // Cas 54
  ingresosNoCRNGO: number; // Cas 55 (INCRNGO)
}

// ── Costos y Gastos (Casillas 57-62) ───────────────────────

export interface CostosGastosJuridicos {
  costos: number; // Cas 57
  gastosAdministracion: number; // Cas 58
  gastosVentas: number; // Cas 59
  gastosFinancieros: number; // Cas 60
  otrosGastosDeducciones: number; // Cas 61
}

// ── Compensación de Pérdidas (Art. 147 ET) ─────────────────

export interface PerdidaFiscal {
  ano: number;
  montoOriginal: number;
  montoDisponible: number; // Lo que queda sin compensar
}

export interface CompensacionPerdidas {
  perdidasAnteriores: PerdidaFiscal[];
  /** Exceso de renta presuntiva de años anteriores (cuando tasa era > 0%) */
  excesoRentaPresuntivaAnterior: number;
}

// ── Rentas Exentas Jurídicas ───────────────────────────────

export interface RentasExentasJuridicas {
  hoteleroTurismo: number; // Art. 207-2 num. 3-5
  energiaRenovable: number; // Art. 235-2 num. 3
  viviendaVISVIP: number; // Art. 235-2 num. 4
  plantacionesForestales: number; // Art. 235-2 num. 5
  reservasPensiones: number; // Art. 235-2 num. 7
  creacionesLiterarias: number; // Art. 235-2 num. 8
  cinematografia: number; // Ley 397/1997
  conveniosCDI: number; // Convenios doble imposición
  otrasRentasExentas: number;
}

// ── Descuentos Tributarios (Arts. 254-258) ──────────────────

export interface DescuentosTributariosJuridicos {
  impuestosPagadosExterior: number; // Art. 254
  inversionesMedioAmbiente: number; // Art. 255 (25%)
  investigacionDesarrollo: number; // Art. 256 (30%)
  donacionesEntidadesEspeciales: number; // Art. 257 (25%)
  donacionesBancosAlimentos: number; // Art. 257 par. 1 (37%)
  ivaActivosCapital: number; // Art. 258-1 (100%)
  otrosDescuentos: number;
}

// ── Ganancias Ocasionales Jurídicas ────────────────────────

export interface GananciasOcasionalesJuridicas {
  ingresos: number; // Cas 78
  costos: number; // Cas 79
  noGravadasExentas: number; // Cas 80
}

// ── Retenciones y Anticipos ────────────────────────────────

export interface RetencionesAnticiposJuridico {
  anticipoAnoAnterior: number; // Cas 93
  saldoFavorAnterior: number; // Cas 94
  autorretenciones: number; // Cas 95
  otrasRetenciones: number; // Cas 96
}

// ── TTD — Tasa de Tributación Depurada (Art. 240 Par. 6) ───

export interface TTDInputs {
  utilidadContableAntesImpuestos: number;
  diferenciasPermAumentanRenta: number;
  incrngoAfectanUtilidad: number;
  valorMetodoParticipacion: number;
  valorNetoGOAfectanUtilidad: number;
  rentasExentasCDI: number;
  compensacionNoAfectaUtilidad: number;
}

// ── Estado completo de la declaración jurídica ─────────────

export interface DeclaracionJuridicaState {
  currentStep: number;
  completedSteps: number[];

  perfil: PerfilJuridico;
  datosInformativos: DatosInformativos;
  patrimonio: PatrimonioJuridico;
  ingresos: IngresosJuridicos;
  costosGastos: CostosGastosJuridicos;
  compensacion: CompensacionPerdidas;
  rentasExentas: RentasExentasJuridicas;
  descuentos: DescuentosTributariosJuridicos;
  gananciasOcasionales: GananciasOcasionalesJuridicas;
  retenciones: RetencionesAnticiposJuridico;
  ttdInputs: TTDInputs;

  lastSaved: string | null;
  version: number;
}

// ── Resultados del cálculo ─────────────────────────────────

export interface ResultadoPatrimonioJuridico {
  patrimonioBruto: number; // Cas 41
  pasivos: number; // Cas 42
  patrimonioLiquido: number; // Cas 43
}

export interface ResultadoDepuracionRenta {
  ingresosBrutos: number; // Cas 53
  devolucionesDescuentos: number; // Cas 54
  incrngo: number; // Cas 55
  ingresosNetos: number; // Cas 56
  totalCostosGastos: number; // Cas 62
  rentaLiquidaOrdinaria: number; // Cas 65
  perdidaLiquida: number; // Cas 66
  compensacionPerdidas: number; // Cas 67
  rentaLiquida: number; // Cas 68
  rentaPresuntiva: number; // Cas 69 (0% desde 2021)
  rentaLiquidaGravableBase: number; // Cas 70 = max(68, 69)
  rentasExentas: number; // Cas 71
  rentasGravables: number; // Cas 72
  rentaLiquidaGravable: number; // Cas 73
}

export interface ResultadoDividendosJuridicos {
  dividendosTarifa5: number; // Cas 74
  dividendosTarifa35: number; // Cas 75
  dividendosTarifa33: number; // Cas 76
  dividendosTarifa27: number; // Cas 77
  impuestoDividendos5: number; // Cas 83
  impuestoDividendos35: number; // Cas 84
  impuestoDividendos33: number; // Cas 85
  impuestoDividendos27: number; // Cas 86
}

export interface ResultadoGOJuridicas {
  ingresos: number; // Cas 78
  costos: number; // Cas 79
  exentas: number; // Cas 80
  gravables: number; // Cas 81
  impuesto: number; // Cas 90
}

export interface ResultadoDescuentos {
  impuestosPagadosExterior: number;
  donaciones: number;
  iDMasI: number;
  medioAmbiente: number;
  ivaActivos: number;
  otrosDescuentos: number;
  totalDescuentos: number; // Cas 88
  limitado: boolean;
}

export interface ResultadoTTD {
  impuestoDepurado: number;
  utilidadDepurada: number;
  tasaTributacionDepurada: number;
  impuestoAdicionar: number;
  aplica: boolean;
  excluido: boolean; // True si la entidad está excluida del TTD
}

export interface ResultadoSobretasa {
  aplica: boolean;
  tasa: number;
  impuestoSobretasa: number; // Cas 99
}

export interface ResultadoLiquidacionJuridica {
  impuestoRentaLiquidaGravable: number; // Cas 82
  impuestoDividendosTotal: number; // sum 83-86
  totalImpuestoRentasLiquidas: number; // Cas 87
  totalDescuentos: number; // Cas 88
  impuestoNetoRenta: number; // Cas 89
  impuestoGananciasOcasionales: number; // Cas 90
  descuentoGOExterior: number; // Cas 91
  totalImpuestoCargo: number; // Cas 92
  anticipoAnterior: number; // Cas 93
  saldoFavorAnterior: number; // Cas 94
  totalRetenciones: number; // Cas 97
  anticipoSiguienteAno: number; // Cas 98
  sobretasa: number; // Cas 99
  saldoPagar: number; // Cas 100
  sanciones: number; // Cas 101
  totalSaldoPagar: number; // Cas 102
  totalSaldoFavor: number; // Cas 103
}

export interface ResultadoDeclaracionJuridica {
  patrimonio: ResultadoPatrimonioJuridico;
  depuracion: ResultadoDepuracionRenta;
  dividendos: ResultadoDividendosJuridicos;
  gananciasOcasionales: ResultadoGOJuridicas;
  descuentos: ResultadoDescuentos;
  ttd: ResultadoTTD;
  sobretasa: ResultadoSobretasa;
  liquidacion: ResultadoLiquidacionJuridica;
  tarifaAplicada: number;
  tasaEfectiva: number;
}

// ── Defaults ───────────────────────────────────────────────

export const DEFAULT_PERFIL_JURIDICO: PerfilJuridico = {
  razonSocial: "",
  nit: "",
  digitoVerificacion: "",
  codigoDireccionSeccional: "",
  actividadEconomica: "",
  tipoEntidad: "sociedad_nacional",
  tamano: "mediana",
  anoGravable: 2025,
  anosDeclarando: 3,
  porcentajeExportacion: 0,
  anosZESE: 0,
};

export const DEFAULT_DATOS_INFORMATIVOS: DatosInformativos = {
  totalCostosNomina: 0,
  aportesSegSocial: 0,
  aportesSenaIcbfCajas: 0,
};

export const DEFAULT_PATRIMONIO_JURIDICO: PatrimonioJuridico = {
  efectivoEquivalentes: 0,
  inversionesFinancieras: 0,
  cuentasPorCobrar: 0,
  inventarios: 0,
  activosIntangibles: 0,
  activosBiologicos: 0,
  ppePlantaEquipo: 0,
  otrosActivos: 0,
  pasivos: 0,
};

export const DEFAULT_INGRESOS_JURIDICOS: IngresosJuridicos = {
  ingresosOperacionales: 0,
  ingresosFinancieros: 0,
  dividendosSubcedula2: 0,
  dividendosOtros: 0,
  dividendosTarifa27: 0,
  ingresosGananciasOcasionales: 0,
  recuperacionDeducciones: 0,
  ingresosParticipaciones: 0,
  otrosIngresos: 0,
  devolucionesDescuentos: 0,
  ingresosNoCRNGO: 0,
};

export const DEFAULT_COSTOS_GASTOS: CostosGastosJuridicos = {
  costos: 0,
  gastosAdministracion: 0,
  gastosVentas: 0,
  gastosFinancieros: 0,
  otrosGastosDeducciones: 0,
};

export const DEFAULT_COMPENSACION: CompensacionPerdidas = {
  perdidasAnteriores: [],
  excesoRentaPresuntivaAnterior: 0,
};

export const DEFAULT_RENTAS_EXENTAS_JURIDICAS: RentasExentasJuridicas = {
  hoteleroTurismo: 0,
  energiaRenovable: 0,
  viviendaVISVIP: 0,
  plantacionesForestales: 0,
  reservasPensiones: 0,
  creacionesLiterarias: 0,
  cinematografia: 0,
  conveniosCDI: 0,
  otrasRentasExentas: 0,
};

export const DEFAULT_DESCUENTOS_JURIDICOS: DescuentosTributariosJuridicos = {
  impuestosPagadosExterior: 0,
  inversionesMedioAmbiente: 0,
  investigacionDesarrollo: 0,
  donacionesEntidadesEspeciales: 0,
  donacionesBancosAlimentos: 0,
  ivaActivosCapital: 0,
  otrosDescuentos: 0,
};

export const DEFAULT_GO_JURIDICAS: GananciasOcasionalesJuridicas = {
  ingresos: 0,
  costos: 0,
  noGravadasExentas: 0,
};

export const DEFAULT_RETENCIONES_JURIDICO: RetencionesAnticiposJuridico = {
  anticipoAnoAnterior: 0,
  saldoFavorAnterior: 0,
  autorretenciones: 0,
  otrasRetenciones: 0,
};

export const DEFAULT_TTD_INPUTS: TTDInputs = {
  utilidadContableAntesImpuestos: 0,
  diferenciasPermAumentanRenta: 0,
  incrngoAfectanUtilidad: 0,
  valorMetodoParticipacion: 0,
  valorNetoGOAfectanUtilidad: 0,
  rentasExentasCDI: 0,
  compensacionNoAfectaUtilidad: 0,
};

export const INITIAL_STATE_JURIDICA: DeclaracionJuridicaState = {
  currentStep: 0,
  completedSteps: [],
  perfil: DEFAULT_PERFIL_JURIDICO,
  datosInformativos: DEFAULT_DATOS_INFORMATIVOS,
  patrimonio: DEFAULT_PATRIMONIO_JURIDICO,
  ingresos: DEFAULT_INGRESOS_JURIDICOS,
  costosGastos: DEFAULT_COSTOS_GASTOS,
  compensacion: DEFAULT_COMPENSACION,
  rentasExentas: DEFAULT_RENTAS_EXENTAS_JURIDICAS,
  descuentos: DEFAULT_DESCUENTOS_JURIDICOS,
  gananciasOcasionales: DEFAULT_GO_JURIDICAS,
  retenciones: DEFAULT_RETENCIONES_JURIDICO,
  ttdInputs: DEFAULT_TTD_INPUTS,
  lastSaved: null,
  version: 1,
};

// ── Wizard Step metadata ─────────────────────────────────

export interface WizardStepMetaJuridica {
  id: string;
  label: string;
  shortLabel: string;
  description: string;
  icon: string;
  required: boolean;
}

export const WIZARD_STEPS_JURIDICAS: WizardStepMetaJuridica[] = [
  {
    id: "perfil",
    label: "Perfil de la empresa",
    shortLabel: "Perfil",
    description: "Razón social, NIT, tipo de entidad y régimen tributario",
    icon: "Building2",
    required: true,
  },
  {
    id: "datos-informativos",
    label: "Datos informativos",
    shortLabel: "Informativos",
    description: "Nómina, seguridad social y aportes parafiscales",
    icon: "Users",
    required: true,
  },
  {
    id: "patrimonio",
    label: "Patrimonio (ESF)",
    shortLabel: "Patrimonio",
    description: "Estado de situación financiera al cierre del año",
    icon: "Landmark",
    required: true,
  },
  {
    id: "ingresos",
    label: "Ingresos",
    shortLabel: "Ingresos",
    description: "Ingresos operacionales, financieros, dividendos y otros",
    icon: "TrendingUp",
    required: true,
  },
  {
    id: "costos-gastos",
    label: "Costos y gastos",
    shortLabel: "Costos",
    description: "Costos de operación, administración, ventas y financieros",
    icon: "Receipt",
    required: true,
  },
  {
    id: "compensacion",
    label: "Compensación de pérdidas",
    shortLabel: "Pérdidas",
    description: "Pérdidas fiscales de años anteriores (Art. 147 ET)",
    icon: "ArrowDownUp",
    required: false,
  },
  {
    id: "rentas-exentas",
    label: "Rentas exentas",
    shortLabel: "Exentas",
    description: "Rentas exentas aplicables al régimen de la entidad",
    icon: "ShieldCheck",
    required: false,
  },
  {
    id: "descuentos",
    label: "Descuentos tributarios",
    shortLabel: "Descuentos",
    description: "Descuentos Arts. 254-258 ET con límite combinado del 25%",
    icon: "Percent",
    required: false,
  },
  {
    id: "ganancias-ocasionales",
    label: "Ganancias ocasionales",
    shortLabel: "Ganancias OC",
    description: "Ingresos extraordinarios gravados al 15%",
    icon: "Gift",
    required: false,
  },
  {
    id: "retenciones",
    label: "Retenciones y anticipos",
    shortLabel: "Retenciones",
    description: "Autorretenciones, retenciones de terceros y anticipos",
    icon: "FileCheck",
    required: true,
  },
  {
    id: "ttd",
    label: "Tasa de tributación depurada",
    shortLabel: "TTD",
    description: "Art. 240 Par. 6 — Tasa mínima del 15%",
    icon: "Gauge",
    required: false,
  },
  {
    id: "resumen",
    label: "Resultado y liquidación",
    shortLabel: "Resumen",
    description: "Liquidación completa del Formulario 110",
    icon: "BarChart3",
    required: true,
  },
];
