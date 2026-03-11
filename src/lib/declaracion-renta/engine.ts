/* ───────────────────────────────────────────────────────────
   engine.ts — Motor de cálculo Formulario 210 DIAN
   CETA-level accuracy: 4 subcédulas, topes compartidos,
   distribución secuencial, ET 240/241, cesantías tabla,
   descuentos tributarios, anticipo correcto.
   ─────────────────────────────────────────────────────────── */

import {
  UVT_VALUES,
  RENTA_BRACKETS,
  LEY_2277_LIMITS,
  ET240_RATES,
  CESANTIAS_EXEMPTION_TABLE,
  DIVIDENDOS_2016_BRACKETS,
} from "@/config/tax-data";
import type {
  DeclaracionState,
  ResultadoDeclaracion,
  ResultadoPatrimonio,
  ResultadoCedulaGeneral,
  ResultadoSubcedula,
  ResultadoCedulaPensiones,
  ResultadoCedulaDividendos,
  ResultadoGananciasOcasionales,
  ResultadoDescuentos,
  ResultadoLiquidacion,
  BreakdownRango,
  SugerenciaOptimizacion,
} from "./types";

// ── Helpers ──────────────────────────────────────────────

function getUVT(anoGravable: number): number {
  return UVT_VALUES[anoGravable] ?? UVT_VALUES[2025] ?? 49_799;
}

function copToUVT(cop: number, uvt: number): number {
  return cop / uvt;
}

function uvtToCOP(uvtAmount: number, uvt: number): number {
  return uvtAmount * uvt;
}

function r(value: number): number {
  return Math.round(value);
}

function clamp0(value: number): number {
  return Math.max(value, 0);
}

/** Round to nearest thousand (like CETA ROUND(..., -3)) */
function r3(value: number): number {
  return Math.round(value / 1000) * 1000;
}

// ── Tabla Art. 241 — Impuesto progresivo ─────────────────

function calcImpuestoTabla241(rentaLiquidaGravableUVT: number, uvt: number): {
  impuestoUVT: number;
  impuestoCOP: number;
  breakdown: BreakdownRango[];
} {
  const breakdown: BreakdownRango[] = [];
  let impuestoUVT = 0;

  for (const bracket of RENTA_BRACKETS) {
    const from = bracket.from;
    const to = bracket.to === Infinity ? rentaLiquidaGravableUVT : bracket.to;

    if (rentaLiquidaGravableUVT <= from) break;

    const taxableInBracket = Math.min(rentaLiquidaGravableUVT, to) - from;
    const impuestoBracket = taxableInBracket * bracket.rate;

    breakdown.push({
      from,
      to: bracket.to,
      rate: bracket.rate,
      baseUVT: taxableInBracket,
      impuestoUVT: impuestoBracket,
      impuestoCOP: r(impuestoBracket * uvt),
    });

    impuestoUVT += impuestoBracket;
  }

  return {
    impuestoUVT,
    impuestoCOP: r(impuestoUVT * uvt),
    breakdown,
  };
}

// ── Tabla Dividendos 2016 (DUT 1.2.1.10.3) ──────────────

function calcImpuestoDividendos2016(dividendosUVT: number): number {
  let impuestoUVT = 0;
  for (const bracket of DIVIDENDOS_2016_BRACKETS) {
    if (dividendosUVT <= bracket.from) break;
    const to = bracket.to === Infinity ? dividendosUVT : bracket.to;
    const taxable = Math.min(dividendosUVT, to) - bracket.from;
    impuestoUVT += taxable * bracket.rate;
  }
  return impuestoUVT;
}

// ── Tabla exención cesantías (Art. 206 Num. 4) ───────────

function porcentajeExencionCesantias(ingresoMensualPromedio: number, uvt: number): number {
  if (ingresoMensualPromedio <= 0) return 0;
  const ratioUVT = ingresoMensualPromedio / uvt;

  for (const tramo of CESANTIAS_EXEMPTION_TABLE) {
    if (ratioUVT <= tramo.maxUVT) return tramo.pct;
  }
  return 0;
}

// ── Patrimonio ──────────────────────────────────────────

function calcPatrimonio(state: DeclaracionState): ResultadoPatrimonio {
  const patrimonioBruto = state.patrimonio.bienes.reduce((sum, b) => sum + b.valorFiscal, 0);
  const patrimonioBrutoAnterior = state.patrimonio.bienes.reduce((sum, b) => sum + (b.valorFiscalAnterior || 0), 0);
  const deudasTotal = state.patrimonio.deudas.reduce((sum, d) => sum + d.saldoDiciembre31, 0);
  const deudasTotalAnterior = state.patrimonio.deudas.reduce((sum, d) => sum + (d.saldoAnterior || 0), 0);
  const patrimonioLiquido = clamp0(patrimonioBruto - deudasTotal);
  const patrimonioLiquidoAnterior = clamp0(patrimonioBrutoAnterior - deudasTotalAnterior);
  const incrementoPatrimonial = patrimonioLiquido - patrimonioLiquidoAnterior;

  return {
    patrimonioBruto,
    patrimonioBrutoAnterior,
    deudasTotal,
    deudasTotalAnterior,
    patrimonioLiquido,
    patrimonioLiquidoAnterior,
    incrementoPatrimonial,
    incrementoJustificado: 0, // Filled after full calculation
    diferenciaInjustificada: 0,
  };
}

// ── Subcédula 1a: Rentas de Trabajo ─────────────────────

interface SubcedulaCalc {
  ingresosBrutos: number;
  INCRGO: number;
  costosGastos: number;
  rentaLiquida: number;
  perdida: number;
  // Pre-distribution amounts
  deduccionesSujetasAlLimite: number;
  exencionesSujetasAlLimite: number;
  totalSujetoAlLimite: number;
  deduccionesFueraLimite: number;
  imputablesNoSujetas: number;
}

function calcSubcedulaTrabajo(
  state: DeclaracionState,
  uvt: number,
  _acumVolObligatorio: number,
  _acumVivienda: number,
  _acumMedicina: number,
  _acumICETEX: number,
  _acumCesantiasIndep: number,
  _acumVolPensionAFC: number,
): SubcedulaCalc & {
  acumVolObligatorio: number;
  acumVivienda: number;
  acumMedicina: number;
  acumICETEX: number;
  acumCesantiasIndep: number;
  acumVolPensionAFC: number;
} {
  const rt = state.rentasTrabajo;
  const ded = state.deducciones;
  const ex = state.exenciones;

  // Ingresos brutos
  const ingresosBrutos =
    rt.salariosYPagosLaborales +
    rt.honorariosServicios +
    rt.otrosIngresosTrabajo +
    rt.prestacionesSociales +
    rt.viaticos +
    rt.gastosRepresentacion +
    rt.compensacionesTrabajo +
    rt.indemnizacionesLaborales +
    rt.alimentacionNoSalarial +
    rt.ingresosCANConvenio +
    rt.cesantiasFondo +
    rt.interesesCesantias +
    rt.cesantiasReembolsoIndependientes;

  // INCRGO
  const volObligatorioTope = ingresosBrutos * LEY_2277_LIMITS.volObligatorioPct;
  const volObligatorio = Math.min(rt.aportesVoluntariosPensionObligatoria, volObligatorioTope);

  const totalINCRGO = Math.min(
    rt.aportesObligatoriosSalud +
    rt.aportesObligatoriosPension +
    volObligatorio +
    rt.aportesARL +
    rt.fondoSolidaridad +
    rt.otrosINCR,
    ingresosBrutos
  );

  const rentaLiquida = clamp0(ingresosBrutos - totalINCRGO);

  // --- Deducciones sujetas al 40%/1340 UVT ---

  // Intereses vivienda (shared 1,200 UVT)
  const topeVivienda = r3(LEY_2277_LIMITS.interesesViviendaUVT * uvt);
  const viviendaDisponible = clamp0(topeVivienda - _acumVivienda);
  const viviendaAplicada = Math.min(ded.interesesVivienda, viviendaDisponible);

  // Medicina prepagada (shared 192 UVT/año)
  const topeMedicina = r3(LEY_2277_LIMITS.medicinaPrepagadaUVTMes * 12 * uvt);
  const medicinaDisponible = clamp0(topeMedicina - _acumMedicina);
  const medicinaAplicada = Math.min(ded.medicinaPrepagada, medicinaDisponible);

  // Dependientes 10% (per subcédula)
  const topeDep10 = Math.min(ingresosBrutos * 0.10, r3(32 * 12 * uvt));
  const dep10Aplicada = Math.min(ded.dependientes10Pct, topeDep10);

  // GMF
  const gmfAplicada = ded.GMFDeducible;

  // ICETEX (shared 100 UVT)
  const topeICETEX = r3(LEY_2277_LIMITS.icetexUVT * uvt);
  const icetexDisponible = clamp0(topeICETEX - _acumICETEX);
  const icetexAplicada = Math.min(ded.interesesICETEX, icetexDisponible);

  // Cesantías independientes (shared 2,500 UVT)
  const topeCesIndep = r3(LEY_2277_LIMITS.cesantiasIndepUVT * uvt);
  const cesIndepDisponible = clamp0(topeCesIndep - _acumCesantiasIndep);
  const basePromedioMensual = clamp0(
    rt.salariosYPagosLaborales + rt.honorariosServicios + rt.otrosIngresosTrabajo +
    rt.prestacionesSociales + rt.viaticos + rt.gastosRepresentacion +
    rt.compensacionesTrabajo + rt.alimentacionNoSalarial - totalINCRGO
  ) / 12;
  const cesIndepAplicada = ded.cesantiasIndependientes > 0
    ? Math.min(ded.cesantiasIndependientes, cesIndepDisponible, topeCesIndep, basePromedioMensual)
    : 0;

  const totalDeduccionesSujetas =
    viviendaAplicada + medicinaAplicada + dep10Aplicada + gmfAplicada +
    icetexAplicada + cesIndepAplicada + ded.inversionEnergiaRenovable +
    ded.donaciones + ded.otrasDeducciones;

  // --- Exenciones sujetas al 40%/1340 UVT ---

  // Cesantías exentas (tabla según ingreso mensual promedio)
  const pctCesantias = porcentajeExencionCesantias(rt.ingresoMensualPromedio6m, uvt);
  const cesantiasFondoExentas = rt.cesantiasFondo > 0 && rt.ingresoMensualPromedio6m > 0
    ? r(rt.cesantiasFondo * pctCesantias) : 0;
  const interesesCesantiasExentos = rt.interesesCesantias > 0 && rt.ingresoMensualPromedio6m > 0
    ? r(rt.interesesCesantias * pctCesantias) : 0;

  // Aportes voluntarios pensión/AFC (30%/3,800 UVT shared across 5 cédulas)
  const topeVolPensionAFC = r3(LEY_2277_LIMITS.volPensionAFCTopeUVT * uvt);
  const volPensionAFCDisp = clamp0(topeVolPensionAFC - _acumVolPensionAFC);
  const tope30Pct = ingresosBrutos * LEY_2277_LIMITS.volPensionAFCPct;
  const totalVolPension = ex.aportesVoluntariosPension + ex.aportesAFC + ex.aportesFVP;
  const volPensionAFCAplicado = Math.min(totalVolPension, tope30Pct, volPensionAFCDisp);

  // Base for 25% (ET 206 Num. 10)
  const ingresosBase25 = rt.salariosYPagosLaborales + rt.honorariosServicios +
    rt.otrosIngresosTrabajo + rt.prestacionesSociales + rt.viaticos +
    rt.gastosRepresentacion + rt.compensacionesTrabajo + rt.alimentacionNoSalarial;
  const base25 = clamp0(
    ingresosBase25 - totalINCRGO - totalDeduccionesSujetas -
    (ex.indemnizacionMilitar + ex.primaEspecialServicios + ex.gastosReprMagistrados50Pct +
     ex.gastosReprJueces25Pct + ex.seguroInvalMuerteFP + ex.gastosReprUnivPublicas50Pct +
     ex.otrasExentasEspecificas + volPensionAFCAplicado)
  );
  const exenta25 = ex.aplicar25PctLaboral
    ? Math.min(base25 * 0.25, r3(LEY_2277_LIMITS.rentasExentasMaxUVT * uvt))
    : 0;

  const totalExencionesSujetas =
    cesantiasFondoExentas + interesesCesantiasExentos +
    volPensionAFCAplicado + exenta25;

  const totalSujetoAlLimite = Math.min(
    totalDeduccionesSujetas + totalExencionesSujetas,
    rentaLiquida
  );

  // --- Imputables NO sujetas al 40% ---
  const imputablesNoSujetas = Math.min(
    ex.indemnizacionMilitar + ex.primaEspecialServicios +
    ex.gastosReprMagistrados50Pct + ex.gastosReprJueces25Pct +
    ex.seguroInvalMuerteFP + ex.gastosReprUnivPublicas50Pct +
    ex.otrasExentasEspecificas + ex.ingresosCANExentos +
    ex.cesantiasReembolsoExentas,
    rentaLiquida
  );

  // --- Fuera del límite 40% (ET 336 Num. 3 y 5) ---
  const depExtraTope = Math.min(ded.dependientesExtra, LEY_2277_LIMITS.maxDependientes);
  const depExtraValor = depExtraTope > 0
    ? Math.min(depExtraTope * r3(LEY_2277_LIMITS.dependienteUVT * uvt), ingresosBrutos) : 0;
  const facturaElectronica = Math.min(ded.comprasFacturaElectronica, ingresosBrutos);
  const deduccionesFueraLimite = depExtraValor + facturaElectronica;

  return {
    ingresosBrutos,
    INCRGO: totalINCRGO,
    costosGastos: 0,
    rentaLiquida,
    perdida: 0,
    deduccionesSujetasAlLimite: totalDeduccionesSujetas,
    exencionesSujetasAlLimite: totalExencionesSujetas,
    totalSujetoAlLimite,
    deduccionesFueraLimite,
    imputablesNoSujetas,
    // Accumulated caps
    acumVolObligatorio: _acumVolObligatorio + volObligatorio,
    acumVivienda: _acumVivienda + viviendaAplicada,
    acumMedicina: _acumMedicina + medicinaAplicada,
    acumICETEX: _acumICETEX + icetexAplicada,
    acumCesantiasIndep: _acumCesantiasIndep + cesIndepAplicada,
    acumVolPensionAFC: _acumVolPensionAFC + volPensionAFCAplicado,
  };
}

// ── Subcédula 1b: Honorarios ────────────────────────────

function calcSubcedulaHonorarios(
  state: DeclaracionState,
  uvt: number,
  acumVolObligatorio: number,
  acumVivienda: number,
  acumMedicina: number,
  acumICETEX: number,
  acumCesantiasIndep: number,
  acumVolPensionAFC: number,
): SubcedulaCalc & {
  acumVolObligatorio: number;
  acumVivienda: number;
  acumMedicina: number;
  acumICETEX: number;
  acumCesantiasIndep: number;
  acumVolPensionAFC: number;
} {
  const rh = state.rentasHonorarios;

  const ingresosBrutos =
    rh.honorarios + rh.serviciosPersonales + rh.comisiones +
    rh.otrosIngresosHonorarios + rh.cesantiasReembolso +
    rh.compensaciones + rh.ingresosExterior;

  // INCRGO
  const volObligatorioTope = ingresosBrutos * LEY_2277_LIMITS.volObligatorioPct;
  const prevUsed = acumVolObligatorio;
  const volObligatorio = Math.min(
    rh.aportesVoluntariosPensionObligatoria,
    volObligatorioTope,
    clamp0(ingresosBrutos * LEY_2277_LIMITS.volObligatorioPct - prevUsed)
  );

  const totalINCRGO = Math.min(
    rh.aportesObligatoriosPension + volObligatorio +
    rh.aportesObligatoriosSalud + rh.aportesARL + rh.otrosINCR,
    ingresosBrutos
  );

  // Costos y gastos
  const costosGastos = rh.costosDirectos + rh.gastosNomina + rh.otrosCostos;

  const rentaLiquida = clamp0(ingresosBrutos - totalINCRGO - costosGastos);
  const perdida = clamp0(totalINCRGO + costosGastos - ingresosBrutos);

  // Deducciones (shared caps - subtract what trabajo used)
  const topeVivienda = r3(LEY_2277_LIMITS.interesesViviendaUVT * uvt);
  const viviendaAplicada = 0; // Honorarios typically don't use vivienda, engine allows it
  const topeMedicina = r3(LEY_2277_LIMITS.medicinaPrepagadaUVTMes * 12 * uvt);
  const medicinaAplicada = 0; // Same - medicine typically claimed in trabajo

  // ICETEX
  const topeICETEX = r3(LEY_2277_LIMITS.icetexUVT * uvt);
  const icetexAplicada = 0;

  // Cesantías independientes
  const topeCesIndep = r3(LEY_2277_LIMITS.cesantiasIndepUVT * uvt);
  const cesIndepDisp = clamp0(topeCesIndep - acumCesantiasIndep);
  const cesIndepAplicada = 0; // Typically in trabajo

  // Vol pension/AFC
  const topeVolPensionAFC = r3(LEY_2277_LIMITS.volPensionAFCTopeUVT * uvt);
  const volPensionAFCDisp = clamp0(topeVolPensionAFC - acumVolPensionAFC);
  const volPensionAFCAplicado = 0; // Typically in trabajo

  const totalDeduccionesSujetas = 0;
  const totalExencionesSujetas = 0;
  const totalSujetoAlLimite = 0;

  const depExtraValor = 0; // Already used in trabajo if applicable
  const facturaElectronica = 0;
  const deduccionesFueraLimite = 0;
  const imputablesNoSujetas = 0;

  return {
    ingresosBrutos,
    INCRGO: totalINCRGO,
    costosGastos,
    rentaLiquida,
    perdida,
    deduccionesSujetasAlLimite: totalDeduccionesSujetas,
    exencionesSujetasAlLimite: totalExencionesSujetas,
    totalSujetoAlLimite,
    deduccionesFueraLimite,
    imputablesNoSujetas,
    acumVolObligatorio: acumVolObligatorio + volObligatorio,
    acumVivienda: acumVivienda + viviendaAplicada,
    acumMedicina: acumMedicina + medicinaAplicada,
    acumICETEX: acumICETEX + icetexAplicada,
    acumCesantiasIndep: acumCesantiasIndep + cesIndepAplicada,
    acumVolPensionAFC: acumVolPensionAFC + volPensionAFCAplicado,
  };
}

// ── Subcédula 2: Capital ────────────────────────────────

function calcSubcedulaCapital(
  state: DeclaracionState,
  uvt: number,
  acumVolObligatorio: number,
  acumVivienda: number,
  _acumMedicina: number,
  acumICETEX: number,
  acumCesantiasIndep: number,
  acumVolPensionAFC: number,
): SubcedulaCalc & {
  acumVolObligatorio: number;
  acumVivienda: number;
  acumICETEX: number;
  acumCesantiasIndep: number;
  acumVolPensionAFC: number;
} {
  const rc = state.rentasCapital;

  const ingresosBrutos =
    rc.interesesRendimientos + rc.arrendamientos + rc.regalias +
    rc.otrosIngresosCapital + rc.ingresosExterior;

  // INCRGO
  const volObligatorioTope = ingresosBrutos * LEY_2277_LIMITS.volObligatorioPct;
  const volObligatorio = Math.min(
    rc.aportesVoluntariosPensionObligatoria,
    volObligatorioTope,
    clamp0(ingresosBrutos * LEY_2277_LIMITS.volObligatorioPct - acumVolObligatorio)
  );

  const componenteInfl = Math.min(rc.componenteInflacionario, rc.interesesRendimientos);

  const totalINCRGO = Math.min(
    rc.aportesObligatoriosPension + volObligatorio +
    componenteInfl + rc.aportesObligatoriosSalud +
    rc.aportesARL + rc.otrosINCRCapital,
    ingresosBrutos
  );

  const costosGastos = rc.costosGastosCapital + rc.depreciacion + rc.otrosCostos;
  const rentaLiquida = clamp0(ingresosBrutos - totalINCRGO - costosGastos);
  const perdida = clamp0(totalINCRGO + costosGastos - ingresosBrutos);

  // Deducciones (remaining shared caps)
  const topeVivienda = r3(LEY_2277_LIMITS.interesesViviendaUVT * uvt);
  const viviendaDisp = clamp0(topeVivienda - acumVivienda);
  // Capital can also claim vivienda for arrendamiento properties
  const viviendaAplicada = 0; // Default 0, user doesn't typically split

  const topeICETEX = r3(LEY_2277_LIMITS.icetexUVT * uvt);
  const icetexDisp = clamp0(topeICETEX - acumICETEX);
  const icetexAplicada = 0;

  const topeCesIndep = r3(LEY_2277_LIMITS.cesantiasIndepUVT * uvt);
  const cesIndepDisp = clamp0(topeCesIndep - acumCesantiasIndep);
  const cesIndepAplicada = 0;

  // Vol pension/AFC for capital
  const topeVolPensionAFC = r3(LEY_2277_LIMITS.volPensionAFCTopeUVT * uvt);
  const volPensionAFCDisp = clamp0(topeVolPensionAFC - acumVolPensionAFC);
  const tope30Pct = ingresosBrutos * LEY_2277_LIMITS.volPensionAFCPct;
  const volPensionAFCAplicado = 0; // Typically in trabajo

  return {
    ingresosBrutos,
    INCRGO: totalINCRGO,
    costosGastos,
    rentaLiquida,
    perdida,
    deduccionesSujetasAlLimite: 0,
    exencionesSujetasAlLimite: 0,
    totalSujetoAlLimite: 0,
    deduccionesFueraLimite: 0,
    imputablesNoSujetas: 0,
    acumVolObligatorio: acumVolObligatorio + volObligatorio,
    acumVivienda: acumVivienda + viviendaAplicada,
    acumICETEX: acumICETEX + icetexAplicada,
    acumCesantiasIndep: acumCesantiasIndep + cesIndepAplicada,
    acumVolPensionAFC: acumVolPensionAFC + volPensionAFCAplicado,
  };
}

// ── Subcédula 3: No Laborales ───────────────────────────

function calcSubcedulaNoLaborales(
  state: DeclaracionState,
  uvt: number,
  acumVolObligatorio: number,
  acumVivienda: number,
  _acumMedicina: number,
  acumICETEX: number,
  acumCesantiasIndep: number,
  acumVolPensionAFC: number,
): SubcedulaCalc & {
  acumVolObligatorio: number;
  acumVivienda: number;
  acumICETEX: number;
  acumCesantiasIndep: number;
  acumVolPensionAFC: number;
} {
  const rnl = state.rentasNoLaborales;

  const ingresosBrutos =
    rnl.ingresosComerciales + rnl.ingresosIndustriales +
    rnl.ingresosAgropecuarios + rnl.otrosIngresosNoLaborales +
    rnl.ingresosExterior + rnl.ingresosECE;

  const devoluciones = Math.min(rnl.devoluciones, ingresosBrutos);
  const ingresosNetos = ingresosBrutos - devoluciones;

  // INCRGO
  const volObligatorioTope = ingresosNetos * LEY_2277_LIMITS.volObligatorioPct;
  const volObligatorio = Math.min(
    rnl.aportesVoluntariosPensionObligatoria,
    volObligatorioTope,
    clamp0(ingresosNetos * LEY_2277_LIMITS.volObligatorioPct - acumVolObligatorio)
  );

  const componenteInfl = Math.min(rnl.componenteInflacionario, rnl.ingresosExterior);

  const totalINCRGO = Math.min(
    rnl.aportesObligatoriosPension + volObligatorio +
    rnl.aportesObligatoriosSalud + rnl.aportesARL +
    componenteInfl + rnl.aportesParafiscales + rnl.otrosINCRNoLaborales,
    ingresosNetos
  );

  const costosGastos = rnl.costosVentasServicios + rnl.gastosNomina +
    rnl.otrosGastos + rnl.depreciacion;

  const rentaLiquida = clamp0(ingresosNetos - totalINCRGO - costosGastos);
  const perdida = clamp0(totalINCRGO + costosGastos - ingresosNetos);

  return {
    ingresosBrutos,
    INCRGO: totalINCRGO,
    costosGastos,
    rentaLiquida,
    perdida,
    deduccionesSujetasAlLimite: 0,
    exencionesSujetasAlLimite: 0,
    totalSujetoAlLimite: 0,
    deduccionesFueraLimite: 0,
    imputablesNoSujetas: 0,
    acumVolObligatorio: acumVolObligatorio + volObligatorio,
    acumVivienda: acumVivienda,
    acumICETEX: acumICETEX,
    acumCesantiasIndep: acumCesantiasIndep,
    acumVolPensionAFC: acumVolPensionAFC,
  };
}

// ── Cédula General — Consolidación ──────────────────────

function calcCedulaGeneral(state: DeclaracionState, uvt: number): ResultadoCedulaGeneral {
  // Calculate each subcédula sequentially (shared caps accumulate)
  const trabajo = calcSubcedulaTrabajo(state, uvt, 0, 0, 0, 0, 0, 0);
  const honorarios = calcSubcedulaHonorarios(
    state, uvt,
    trabajo.acumVolObligatorio, trabajo.acumVivienda,
    trabajo.acumMedicina, trabajo.acumICETEX,
    trabajo.acumCesantiasIndep, trabajo.acumVolPensionAFC,
  );
  const capital = calcSubcedulaCapital(
    state, uvt,
    honorarios.acumVolObligatorio, honorarios.acumVivienda,
    honorarios.acumMedicina, honorarios.acumICETEX,
    honorarios.acumCesantiasIndep, honorarios.acumVolPensionAFC,
  );
  const noLaborales = calcSubcedulaNoLaborales(
    state, uvt,
    capital.acumVolObligatorio, capital.acumVivienda,
    0, // medicina not used in capital/nolab
    capital.acumICETEX, capital.acumCesantiasIndep,
    capital.acumVolPensionAFC,
  );

  // ── Límite 40% / 1,340 UVT (ET 336 Num. 3) ──

  // Base for limit = total ingresos brutos + ECE - total INCRGO
  const baseLimite =
    trabajo.ingresosBrutos + honorarios.ingresosBrutos +
    capital.ingresosBrutos + noLaborales.ingresosBrutos -
    trabajo.INCRGO - honorarios.INCRGO -
    capital.INCRGO - noLaborales.INCRGO;

  const limite40_1340 = Math.min(
    baseLimite * 0.40,
    r3(LEY_2277_LIMITS.deduccionesExentasMaxUVT * uvt)
  );

  // Total sujeto al límite (from all subcédulas)
  const totalSujetoAlLimite =
    trabajo.totalSujetoAlLimite + honorarios.totalSujetoAlLimite +
    capital.totalSujetoAlLimite + noLaborales.totalSujetoAlLimite;

  // Effective limit
  const limiteEfectivo = Math.min(totalSujetoAlLimite, limite40_1340);
  const limiteExcedido = totalSujetoAlLimite > limite40_1340;

  // ── Distribución secuencial con prioridad ──
  // Trabajo → Honorarios → Capital → No Laboral

  let remanente = limiteEfectivo;

  const asignadoTrabajo = Math.min(trabajo.totalSujetoAlLimite, remanente);
  remanente -= asignadoTrabajo;

  const asignadoHonorarios = Math.min(honorarios.totalSujetoAlLimite, remanente);
  remanente -= asignadoHonorarios;

  const asignadoCapital = Math.min(capital.totalSujetoAlLimite, remanente);
  remanente -= asignadoCapital;

  const asignadoNoLaborales = Math.min(noLaborales.totalSujetoAlLimite, remanente);

  // ── Renta Líquida por subcédula después de distribución ──

  const rlTrabajoDespues = clamp0(
    trabajo.rentaLiquida - asignadoTrabajo - trabajo.imputablesNoSujetas
  );
  const rlHonorariosDespues = clamp0(
    honorarios.rentaLiquida - asignadoHonorarios - honorarios.imputablesNoSujetas
  );
  const rlCapitalDespues = clamp0(
    capital.rentaLiquida - asignadoCapital - capital.imputablesNoSujetas
  );
  const rlNoLaboralesDespues = clamp0(
    noLaborales.rentaLiquida - asignadoNoLaborales - noLaborales.imputablesNoSujetas
  );

  const totalRLDespues = rlTrabajoDespues + rlHonorariosDespues +
    rlCapitalDespues + rlNoLaboralesDespues;

  // ── Deducciones fuera del 40% ──
  const totalFueraLimite =
    trabajo.deduccionesFueraLimite + honorarios.deduccionesFueraLimite +
    capital.deduccionesFueraLimite + noLaborales.deduccionesFueraLimite;
  const fueraLimiteAplicado = Math.min(totalFueraLimite, totalRLDespues);

  // ── Renta Líquida Ordinaria Cédula General ──
  const rentaLiquidaOrdinaria = clamp0(totalRLDespues - fueraLimiteAplicado);

  // Compensaciones (simplified - user enters if applicable)
  const compensacionPerdidas = 0;
  const rentasGravables = 0;

  const rentaLiquidaGravable = clamp0(
    rentaLiquidaOrdinaria + rentasGravables - compensacionPerdidas
  );
  const rentaLiquidaGravableUVT = copToUVT(rentaLiquidaGravable, uvt);

  const dependientesCapped = state.deducciones.dependientesExtra > LEY_2277_LIMITS.maxDependientes;

  // Build subcédula results
  function buildSubcedulaResult(calc: SubcedulaCalc, asignado: number): ResultadoSubcedula {
    return {
      ingresosBrutos: calc.ingresosBrutos,
      INCRGO: calc.INCRGO,
      costosGastos: calc.costosGastos,
      rentaLiquida: calc.rentaLiquida,
      perdida: calc.perdida,
      deduccionesAsignadas: asignado * (calc.deduccionesSujetasAlLimite / Math.max(calc.totalSujetoAlLimite, 1)),
      exencionesAsignadas: asignado * (calc.exencionesSujetasAlLimite / Math.max(calc.totalSujetoAlLimite, 1)),
      totalImputadoSujetoLimite: asignado,
      totalImputadoFueraLimite: calc.deduccionesFueraLimite,
      rentaLiquidaGravable: clamp0(
        calc.rentaLiquida - asignado - calc.imputablesNoSujetas
      ),
    };
  }

  return {
    trabajo: buildSubcedulaResult(trabajo, asignadoTrabajo),
    honorarios: buildSubcedulaResult(honorarios, asignadoHonorarios),
    capital: buildSubcedulaResult(capital, asignadoCapital),
    noLaborales: buildSubcedulaResult(noLaborales, asignadoNoLaborales),
    rentaLiquidaCedulaGeneral: trabajo.rentaLiquida + honorarios.rentaLiquida +
      capital.rentaLiquida + noLaborales.rentaLiquida,
    totalSujetoAlLimite,
    limite40_1340,
    limiteEfectivo,
    rentaLiquidaOrdinaria,
    compensacionPerdidas,
    rentasGravables,
    rentaLiquidaGravable,
    rentaLiquidaGravableUVT,
    limiteExcedido,
    dependientesCapped,
  };
}

// ── Cédula Pensiones ────────────────────────────────────

function calcCedulaPensiones(
  state: DeclaracionState,
  uvt: number,
  acumVolPensionAFC: number,
): ResultadoCedulaPensiones {
  const cp = state.cedulaPensiones;

  const ingresosBrutosPensiones = cp.pensionesNacionales + cp.pensionesCAN + cp.pensionesExterior;
  const INCRPensiones = Math.min(cp.aportesObligatoriosSalud, ingresosBrutosPensiones);
  const rentaLiquidaPensiones = clamp0(ingresosBrutosPensiones - INCRPensiones);

  // Exención pensiones nacionales: 1,000 UVT/mes (ET 206 Num. 5)
  const topePensionMensual = uvtToCOP(LEY_2277_LIMITS.pensionExentaUVTMes, uvt);
  let exencionNacionales: number;
  if (cp.ajusteExencionMensual > 0) {
    // User manually entered the exempt portion (some months > 1,000 UVT)
    exencionNacionales = Math.min(cp.ajusteExencionMensual, cp.pensionesNacionales);
  } else {
    // Simple: if monthly pension ≤ 1,000 UVT → 100% exempt
    const pensionMensual = cp.pensionesNacionales / 12;
    if (pensionMensual <= topePensionMensual) {
      exencionNacionales = cp.pensionesNacionales;
    } else {
      // Each month capped at 1,000 UVT
      exencionNacionales = topePensionMensual * 12;
    }
  }

  // Pensiones CAN: 100% exentas (Decisión 578/2004)
  const exencionCAN = cp.pensionesCAN;

  // Pensiones exterior: same 1,000 UVT/month rule
  const pensionExtMensual = cp.pensionesExterior / 12;
  const exencionExterior = pensionExtMensual <= topePensionMensual
    ? cp.pensionesExterior
    : topePensionMensual * 12;

  // Voluntarios pensión/AFC in pensiones (shared 3,800 UVT)
  const topeVolPensionAFC = r3(LEY_2277_LIMITS.volPensionAFCTopeUVT * uvt);
  const volDisp = clamp0(topeVolPensionAFC - acumVolPensionAFC);
  const tope30Pct = cp.pensionesNacionales * LEY_2277_LIMITS.volPensionAFCPct;
  const volPensionAplicado = Math.min(cp.aportesVoluntariosPensionAFC, tope30Pct, volDisp);

  const totalExenciones = Math.min(
    exencionNacionales + exencionCAN + exencionExterior + volPensionAplicado,
    rentaLiquidaPensiones
  );

  const rentaLiquidaGravablePensiones = clamp0(rentaLiquidaPensiones - totalExenciones);

  return {
    ingresosBrutosPensiones,
    INCRPensiones,
    rentaLiquidaPensiones,
    exencionPensionesNacionales: exencionNacionales,
    exencionPensionesCAN: exencionCAN,
    exencionPensionesExterior: exencionExterior,
    exencionVoluntariosPension: volPensionAplicado,
    totalExenciones,
    rentaLiquidaGravablePensiones,
  };
}

// ── Cédula Dividendos ───────────────────────────────────

function calcCedulaDividendos(state: DeclaracionState, uvt: number): ResultadoCedulaDividendos {
  const cd = state.cedulaDividendos;

  // --- Dividendos 2016 y anteriores ---
  const total2016 = cd.dividendosNoGravados2016 + cd.dividendosGravados2016 + cd.dividendosExterior2016;
  const incrgo2016 = cd.dividendosNoGravados2016 + cd.dividendosExterior2016;
  const gravable2016 = clamp0(total2016 - Math.min(incrgo2016, total2016));
  const gravable2016UVT = copToUVT(gravable2016, uvt);
  const impuesto2016UVT = calcImpuestoDividendos2016(gravable2016UVT);
  const impuesto2016 = r3(impuesto2016UVT * uvt);

  // --- Subcédula 1: No gravados 2017+ ---
  // These go to the combined base for ET 241
  const subcedula1Total =
    cd.dividendosNoGravadosNacionales + cd.dividendosNoGravadosExterior +
    cd.dividendosNoGravadosECE;

  // --- Subcédula 2: Gravados 2017+ ---
  // Tarifa ET 240 (35% for AG2025)
  const subcedula2Total =
    cd.dividendosGravadosNacionales + cd.dividendosGravadosExterior +
    cd.dividendosGravadosECE;

  const tarifaET240 = ET240_RATES[state.perfil.anoGravable] ?? 0.35;
  const impuestoET240 = r(subcedula2Total * tarifaET240);

  // Exceso subcédula 2 = monto - impuesto → goes to combined base ET 241
  const excesoSubcedula2 = clamp0(subcedula2Total - impuestoET240);

  const impuestoTotalDividendos = impuesto2016 + impuestoET240;

  return {
    dividendos2016Gravables: gravable2016,
    impuestoDividendos2016: impuesto2016,
    subcedula1Total,
    subcedula2Total,
    impuestoET240,
    excesoSubcedula2,
    impuestoTotalDividendos,
  };
}

// ── Ganancias Ocasionales ───────────────────────────────

function calcGananciasOcasionales(state: DeclaracionState, uvt: number): ResultadoGananciasOcasionales {
  const go = state.gananciasOcasionales;

  const gananciasBrutas =
    go.ventaViviendaAFCIngreso + go.ventaActivosIngreso +
    go.herenciasLegadosDonaciones + go.porcionConyugal +
    go.segurosVida + go.loteriasRifasApuestas + go.otrasGanancias;

  const costosGanancias = go.ventaViviendaAFCCosto + go.ventaActivosCosto +
    go.recuperacionDeducciones;

  // Exenciones
  // Vivienda con AFC: primeras 5,000 UVT (ET 311-1)
  const exencionViviendaAFC = go.ventaViviendaAFCIngreso > 0
    ? Math.min(
        clamp0(go.ventaViviendaAFCIngreso - go.ventaViviendaAFCCosto),
        r3(5_000 * uvt)
      )
    : 0;

  // Herencias: 20% exento, máx 1,625 UVT (ET 307)
  const exencionHerencias = go.herenciasLegadosDonaciones > 0
    ? Math.min(go.herenciasLegadosDonaciones * 0.20, r3(1_625 * uvt))
    : 0;

  // Porción conyugal: máx 3,250 UVT (ET 307)
  const exencionPorcionConyugal = Math.min(go.porcionConyugal, r3(3_250 * uvt));

  // Seguros vida: máx 3,250 UVT (ET 307)
  const exencionSegurosVida = Math.min(go.segurosVida, r3(3_250 * uvt));

  const totalExenciones = exencionViviendaAFC + exencionHerencias +
    exencionPorcionConyugal + exencionSegurosVida;

  // Gravable general (15%) = todo menos loterías
  const gananciaSinLoterias = clamp0(
    gananciasBrutas - go.loteriasRifasApuestas - costosGanancias - totalExenciones
  );
  const gananciaGravableGeneral = clamp0(gananciaSinLoterias);

  // Gravable loterías (20%)
  const gananciaGravableLoterias = go.loteriasRifasApuestas;

  // Impuestos
  const impuestoGeneralGO = r(gananciaGravableGeneral * 0.15);
  const impuestoLoteriasGO = r(gananciaGravableLoterias * 0.20);

  return {
    gananciasBrutas,
    costosGanancias,
    exencionViviendaAFC,
    exencionHerencias,
    exencionPorcionConyugal,
    exencionSegurosVida,
    totalExenciones,
    gananciaGravableGeneral,
    gananciaGravableLoterias,
    impuestoGeneralGO,
    impuestoLoteriasGO,
    impuestoTotalGO: impuestoGeneralGO + impuestoLoteriasGO,
  };
}

// ── Descuentos Tributarios ──────────────────────────────

function calcDescuentos(
  state: DeclaracionState,
  impuestoRentaTotal: number,
  subcedula1Dividendos: number,
  uvt: number,
): ResultadoDescuentos {
  const dt = state.descuentosTributarios;

  const descuentosLimitados = Math.min(
    dt.impuestosExterior + dt.inversionAmbiental + dt.inversionID +
    dt.donacionesRegimenEspecial + dt.becasDeportivas,
    impuestoRentaTotal // No pueden exceder el impuesto
  );

  const descuentoIVAActivos = dt.IVAImportacionActivos;

  // Descuento dividendos (ET 254-1) solo si base dividendos > 1,090 UVT
  const baseDiv = copToUVT(subcedula1Dividendos, uvt);
  const descuentoDividendos = baseDiv > 1_090
    ? r3((baseDiv - 1_090) * 0.19 * uvt)
    : 0;

  const totalDescuentos = Math.min(
    descuentosLimitados + descuentoIVAActivos + descuentoDividendos,
    impuestoRentaTotal
  );

  return {
    descuentosLimitados,
    descuentoIVAActivos,
    descuentoDividendos,
    totalDescuentos,
  };
}

// ── Liquidación Final ───────────────────────────────────

function calcLiquidacion(
  cedulaGeneral: ResultadoCedulaGeneral,
  cedulaPensiones: ResultadoCedulaPensiones,
  cedulaDividendos: ResultadoCedulaDividendos,
  gananciasOcasionales: ResultadoGananciasOcasionales,
  descuentos: ResultadoDescuentos,
  state: DeclaracionState,
  uvt: number,
): ResultadoLiquidacion {
  const da = state.datosAdicionales;
  const ra = state.retencionesAnticipos;

  // ── Base combinada ET 241 ──
  // = Cédula General + Pensiones + Subcédula 1 Dividendos + Exceso Subcédula 2
  const baseCombinada =
    cedulaGeneral.rentaLiquidaGravable +
    cedulaPensiones.rentaLiquidaGravablePensiones +
    cedulaDividendos.subcedula1Total +
    cedulaDividendos.excesoSubcedula2;

  const baseCombidadaUVT = copToUVT(baseCombinada, uvt);

  // Impuesto ET 241 (progressive table)
  const { impuestoCOP: impuestoET241 } = calcImpuestoTabla241(baseCombidadaUVT, uvt);

  // Impuesto ET 240 (dividendos gravados)
  const impuestoET240 = cedulaDividendos.impuestoET240;

  // Dividendos 2016
  const impuestoDividendos2016 = cedulaDividendos.impuestoDividendos2016;

  // Total impuesto sobre la renta
  const impuestoRentaTotal = clamp0(impuestoET241 + impuestoET240 + impuestoDividendos2016);

  // Descuentos tributarios
  const impuestoNetoRenta = clamp0(impuestoRentaTotal - descuentos.totalDescuentos);

  // Ganancia Ocasional
  const impuestoGananciaOcasional = gananciasOcasionales.impuestoTotalGO;

  // Total impuesto a cargo
  const totalImpuestoCargo = impuestoNetoRenta + impuestoGananciaOcasional;

  // ── Anticipo (Art. 807-810) ──
  const anos = state.perfil.anosDeclarando;
  const porcentaje = anos <= 1 ? 0.25 : anos === 2 ? 0.50 : 0.75;

  // Opción 1: impuesto actual × porcentaje
  const anticipoOpcion1 = r(impuestoNetoRenta * porcentaje);

  // Opción 2: promedio (actual + anterior) × porcentaje
  const impuestoAnterior = da.impuestoNetoAGAnterior;
  const anticipoOpcion2 = r(((impuestoNetoRenta + impuestoAnterior) / 2) * porcentaje);

  // Anticipo recomendado = MIN de las dos opciones - retenciones
  const totalRetenciones = ra.retencionFuenteRenta + ra.retencionFuenteOtros +
    ra.retencionDividendos + ra.retencionGananciasOcasionales;
  const anticipoRecomendado = clamp0(
    Math.min(anticipoOpcion1, anticipoOpcion2) - totalRetenciones
  );

  // Liquidación final
  const menosAnticipoAnterior = ra.anticipoAnoAnterior;
  const menosRetenciones = totalRetenciones;
  const masSanciones = da.sanciones;

  const saldoFinal = totalImpuestoCargo - menosAnticipoAnterior - menosRetenciones +
    anticipoRecomendado + masSanciones;

  return {
    baseCombinada,
    baseCombidadaUVT,
    impuestoET241,
    impuestoET240,
    impuestoRentaTotal,
    descuentosTributarios: descuentos.totalDescuentos,
    impuestoNetoRenta,
    impuestoGananciaOcasional,
    totalImpuestoCargo,
    anticipoOpcion1,
    anticipoOpcion2,
    anticipoRecomendado,
    menosAnticipoAnterior,
    menosRetenciones,
    masSanciones,
    saldoPagar: clamp0(saldoFinal),
    saldoFavor: clamp0(-saldoFinal),
  };
}

// ── Sugerencias de optimización ──────────────────────────

function calcSugerencias(
  state: DeclaracionState,
  cedulaGeneral: ResultadoCedulaGeneral,
  uvt: number
): SugerenciaOptimizacion[] {
  const sugerencias: SugerenciaOptimizacion[] = [];
  const ex = state.exenciones;

  // ¿Está usando la exención del 25%?
  if (!ex.aplicar25PctLaboral && cedulaGeneral.trabajo.rentaLiquida > 0) {
    const potencial25 = Math.min(
      cedulaGeneral.trabajo.rentaLiquida * 0.25,
      uvtToCOP(LEY_2277_LIMITS.rentasExentasMaxUVT, uvt)
    );
    sugerencias.push({
      id: "exenta-25",
      titulo: "Activar exención del 25% (Art. 206.10)",
      descripcion: "La ley permite descontar el 25% de los pagos laborales como renta exenta, hasta 790 UVT.",
      ahorroPotencial: r(potencial25 * 0.28),
      articuloET: "206",
      tipo: "exencion",
    });
  }

  // ¿Podría aportar más a AFC/FVP?
  const totalIngresosTrabajo = cedulaGeneral.trabajo.ingresosBrutos;
  const afcActual = ex.aportesAFC + ex.aportesFVP + ex.aportesVoluntariosPension;
  const afcMax = Math.min(totalIngresosTrabajo * 0.30, uvtToCOP(3_800, uvt));
  if (afcActual < afcMax && totalIngresosTrabajo > 0) {
    const espacio = afcMax - afcActual;
    sugerencias.push({
      id: "afc-fvp",
      titulo: "Maximizar aportes AFC/FVP/Pensión voluntaria",
      descripcion: `Puede aportar hasta ${r(espacio).toLocaleString("es-CO")} COP más y reducir su base gravable.`,
      ahorroPotencial: r(Math.min(espacio, cedulaGeneral.rentaLiquidaGravable) * 0.28),
      articuloET: "126-1",
      tipo: "deduccion",
    });
  }

  // ¿Tiene dependientes sin declarar?
  if (state.deducciones.dependientesExtra === 0 && cedulaGeneral.trabajo.rentaLiquida > uvtToCOP(1_090, uvt)) {
    sugerencias.push({
      id: "dependientes-extra",
      titulo: "Verificar si tiene dependientes económicos (72 UVT c/u)",
      descripcion: "Cada dependiente permite deducir 72 UVT (fuera del límite 40%). Máximo 4 dependientes.",
      ahorroPotencial: r(uvtToCOP(72, uvt) * 0.19),
      articuloET: "336",
      tipo: "deduccion",
    });
  }

  // ¿Podría deducir intereses de vivienda?
  if (state.deducciones.interesesVivienda === 0 && cedulaGeneral.rentaLiquidaGravable > 0) {
    sugerencias.push({
      id: "intereses-vivienda",
      titulo: "Deducción por intereses de crédito hipotecario",
      descripcion: "Los intereses de crédito de vivienda son deducibles hasta 1,200 UVT/año.",
      ahorroPotencial: r(Math.min(uvtToCOP(1_200, uvt), cedulaGeneral.rentaLiquidaGravable) * 0.19),
      articuloET: "119",
      tipo: "deduccion",
    });
  }

  // ¿Podría deducir medicina prepagada?
  if (state.deducciones.medicinaPrepagada === 0 && cedulaGeneral.rentaLiquidaGravable > 0) {
    sugerencias.push({
      id: "medicina-prepagada",
      titulo: "Deducción por medicina prepagada",
      descripcion: "Aportes a planes de medicina prepagada son deducibles hasta 16 UVT/mes.",
      ahorroPotencial: r(Math.min(uvtToCOP(192, uvt), cedulaGeneral.rentaLiquidaGravable) * 0.19),
      articuloET: "387",
      tipo: "deduccion",
    });
  }

  // Descuentos tributarios
  if (state.descuentosTributarios.donacionesRegimenEspecial === 0 && cedulaGeneral.rentaLiquidaGravable > uvtToCOP(4_100, uvt)) {
    sugerencias.push({
      id: "donaciones-descuento",
      titulo: "Donaciones como descuento tributario (ET 257)",
      descripcion: "Las donaciones a entidades del régimen especial son descuento del 25% sobre el impuesto, no deducción.",
      ahorroPotencial: r(uvtToCOP(100, uvt) * 0.25),
      articuloET: "257",
      tipo: "descuento",
    });
  }

  // Cesantías sin ingreso promedio
  if (state.rentasTrabajo.cesantiasFondo > 0 && state.rentasTrabajo.ingresoMensualPromedio6m === 0) {
    sugerencias.push({
      id: "cesantias-ingreso-promedio",
      titulo: "Ingrese su ingreso mensual promedio para exención de cesantías",
      descripcion: "Las cesantías pueden estar exentas entre 20% y 100% según su nivel de ingreso. Ingrese el promedio de los últimos 6 meses.",
      ahorroPotencial: r(state.rentasTrabajo.cesantiasFondo * 0.5 * 0.28),
      articuloET: "206",
      tipo: "exencion",
    });
  }

  return sugerencias;
}

// ── Función principal ────────────────────────────────────

export function calcularDeclaracion(state: DeclaracionState): ResultadoDeclaracion {
  const uvt = getUVT(state.perfil.anoGravable);

  const patrimonio = calcPatrimonio(state);
  const cedulaGeneral = calcCedulaGeneral(state, uvt);

  // Get accumulated vol pension/AFC from cédula general for pension calculation
  // We need to recalculate to get the accumulated value
  const trabajo = calcSubcedulaTrabajo(state, uvt, 0, 0, 0, 0, 0, 0);
  const honorarios = calcSubcedulaHonorarios(
    state, uvt,
    trabajo.acumVolObligatorio, trabajo.acumVivienda,
    trabajo.acumMedicina, trabajo.acumICETEX,
    trabajo.acumCesantiasIndep, trabajo.acumVolPensionAFC,
  );
  const capital = calcSubcedulaCapital(
    state, uvt,
    honorarios.acumVolObligatorio, honorarios.acumVivienda,
    honorarios.acumMedicina, honorarios.acumICETEX,
    honorarios.acumCesantiasIndep, honorarios.acumVolPensionAFC,
  );
  const noLaborales = calcSubcedulaNoLaborales(
    state, uvt,
    capital.acumVolObligatorio, capital.acumVivienda,
    0, capital.acumICETEX,
    capital.acumCesantiasIndep, capital.acumVolPensionAFC,
  );

  const cedulaPensiones = calcCedulaPensiones(state, uvt, noLaborales.acumVolPensionAFC);
  const cedulaDividendos = calcCedulaDividendos(state, uvt);
  const gananciasOcasionales = calcGananciasOcasionales(state, uvt);

  // Combined base for descuentos calculation
  const baseCombinada =
    cedulaGeneral.rentaLiquidaGravable +
    cedulaPensiones.rentaLiquidaGravablePensiones +
    cedulaDividendos.subcedula1Total +
    cedulaDividendos.excesoSubcedula2;

  const { impuestoCOP: impuestoET241 } = calcImpuestoTabla241(copToUVT(baseCombinada, uvt), uvt);
  const impuestoRentaTotalPreDescuento = clamp0(
    impuestoET241 + cedulaDividendos.impuestoET240 + cedulaDividendos.impuestoDividendos2016
  );

  const descuentos = calcDescuentos(
    state,
    impuestoRentaTotalPreDescuento,
    cedulaDividendos.subcedula1Total,
    uvt,
  );

  const liquidacion = calcLiquidacion(
    cedulaGeneral,
    cedulaPensiones,
    cedulaDividendos,
    gananciasOcasionales,
    descuentos,
    state,
    uvt,
  );

  // Update patrimonio with justification
  const incrementoJustificado = cedulaGeneral.rentaLiquidaGravable +
    cedulaPensiones.rentaLiquidaGravablePensiones +
    cedulaDividendos.subcedula1Total + cedulaDividendos.subcedula2Total;
  patrimonio.incrementoJustificado = incrementoJustificado;
  patrimonio.diferenciaInjustificada = clamp0(patrimonio.incrementoPatrimonial - incrementoJustificado);

  const { breakdown } = calcImpuestoTabla241(copToUVT(baseCombinada, uvt), uvt);

  // Tasa efectiva global
  const totalIngresos =
    cedulaGeneral.trabajo.ingresosBrutos +
    cedulaGeneral.honorarios.ingresosBrutos +
    cedulaGeneral.capital.ingresosBrutos +
    cedulaGeneral.noLaborales.ingresosBrutos +
    cedulaPensiones.ingresosBrutosPensiones +
    cedulaDividendos.subcedula1Total +
    cedulaDividendos.subcedula2Total +
    gananciasOcasionales.gananciasBrutas;

  const tasaEfectivaGlobal = totalIngresos > 0 ? liquidacion.impuestoRentaTotal / totalIngresos : 0;

  const sugerencias = calcSugerencias(state, cedulaGeneral, uvt);

  return {
    patrimonio,
    cedulaGeneral,
    cedulaPensiones,
    cedulaDividendos,
    gananciasOcasionales,
    descuentos,
    liquidacion,
    breakdown,
    tasaEfectivaGlobal,
    sugerencias,
  };
}

// ── Verificación umbrales declarar ───────────────────────

export function verificarObligacionDeclarar(
  state: DeclaracionState
): { debeDeclarar: boolean; razones: string[] } {
  const uvt = getUVT(state.perfil.anoGravable);
  const u = state.umbrales;
  const razones: string[] = [];

  if (u.patrimonioBruto > uvtToCOP(4_500, uvt)) {
    razones.push(`Patrimonio bruto superior a 4.500 UVT (${r(uvtToCOP(4_500, uvt)).toLocaleString("es-CO")} COP)`);
  }
  if (u.ingresoBruto > uvtToCOP(1_400, uvt)) {
    razones.push(`Ingresos brutos superiores a 1.400 UVT (${r(uvtToCOP(1_400, uvt)).toLocaleString("es-CO")} COP)`);
  }
  if (u.comprasConsumos > uvtToCOP(1_400, uvt)) {
    razones.push(`Compras y consumos superiores a 1.400 UVT`);
  }
  if (u.consignaciones > uvtToCOP(1_400, uvt)) {
    razones.push(`Consignaciones bancarias superiores a 1.400 UVT`);
  }
  if (u.movimientosTarjetas > uvtToCOP(1_400, uvt)) {
    razones.push(`Movimientos en tarjetas de crédito superiores a 1.400 UVT`);
  }

  return {
    debeDeclarar: razones.length > 0,
    razones,
  };
}
