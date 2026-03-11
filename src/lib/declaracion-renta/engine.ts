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

/** Accumulated shared caps across subcédulas */
interface AcumCaps {
  volObligatorio: number;
  vivienda: number;
  medicina: number;
  ICETEX: number;
  cesantiasIndep: number;
  volPensionAFC: number;
  GMF: number;
  donaciones: number;
  otrasDeducciones: number;
  energiaRenovable: number;
  depExtra: number;       // dependientes extra (fuera límite)
  facturaElectronica: number; // factura electrónica (fuera límite)
}

const ACUM_ZERO: AcumCaps = {
  volObligatorio: 0, vivienda: 0, medicina: 0, ICETEX: 0,
  cesantiasIndep: 0, volPensionAFC: 0, GMF: 0, donaciones: 0,
  otrasDeducciones: 0, energiaRenovable: 0, depExtra: 0, facturaElectronica: 0,
};

type SubcedulaName = "trabajo" | "honorarios" | "capital" | "noLaborales";

/** Shared deduction/exemption calculator for all subcédulas */
function calcDeduccionesComunes(
  state: DeclaracionState,
  uvt: number,
  acum: AcumCaps,
  ingresosBrutos: number,
  totalINCRGO: number,
  rentaLiquida: number,
  subcedula: SubcedulaName,
): {
  dedSujetas: number;
  exSujetas: number;
  noSujetas: number;
  fueraLimite: number;
  nextAcum: AcumCaps;
} {
  const ded = state.deducciones;
  const ex = state.exenciones;
  const rt = state.rentasTrabajo;

  // --- Deducciones sujetas al 40%/1340 UVT ---

  // Intereses vivienda (shared 1,200 UVT)
  const topeVivienda = r3(LEY_2277_LIMITS.interesesViviendaUVT * uvt);
  const viviendaDisp = clamp0(topeVivienda - acum.vivienda);
  const viviendaAplicada = Math.min(clamp0(ded.interesesVivienda - acum.vivienda), viviendaDisp);

  // Medicina prepagada (shared 192 UVT/año)
  const topeMedicina = r3(LEY_2277_LIMITS.medicinaPrepagadaUVTMes * 12 * uvt);
  const medicinaDisp = clamp0(topeMedicina - acum.medicina);
  const medicinaAplicada = Math.min(clamp0(ded.medicinaPrepagada - acum.medicina), medicinaDisp);

  // Dependientes 10% (per subcédula: 10% of own ingresosBrutos, max 32 UVT/mes)
  const topeDep10 = Math.min(ingresosBrutos * 0.10, r3(32 * 12 * uvt));
  const dep10Aplicada = Math.min(clamp0(ded.dependientes10Pct - acum.vivienda * 0), topeDep10);
  // dep10 is global user input, first subcédula claims all
  const dep10Global = clamp0(ded.dependientes10Pct - acum.GMF * 0); // dep10 is not accumulated, first subcédula claims it
  // Simpler: dep10 only applies to trabajo (it's 10% of ingreso bruto laboral)
  const dep10Final = subcedula === "trabajo"
    ? Math.min(ded.dependientes10Pct, topeDep10) : 0;

  // GMF (global, first available subcédula claims remaining)
  const gmfAplicada = clamp0(ded.GMFDeducible - acum.GMF);

  // ICETEX (shared 100 UVT)
  const topeICETEX = r3(LEY_2277_LIMITS.icetexUVT * uvt);
  const icetexAplicada = Math.min(clamp0(ded.interesesICETEX - acum.ICETEX), clamp0(topeICETEX - acum.ICETEX));

  // Cesantías independientes (shared 2,500 UVT) — only trabajo
  let cesIndepAplicada = 0;
  if (subcedula === "trabajo" && ded.cesantiasIndependientes > 0) {
    const topeCesIndep = r3(LEY_2277_LIMITS.cesantiasIndepUVT * uvt);
    const cesIndepDisp = clamp0(topeCesIndep - acum.cesantiasIndep);
    const basePromedioMensual = clamp0(
      rt.salariosYPagosLaborales + rt.honorariosServicios + rt.otrosIngresosTrabajo +
      rt.prestacionesSociales + rt.viaticos + rt.gastosRepresentacion +
      rt.compensacionesTrabajo + rt.alimentacionNoSalarial - totalINCRGO
    ) / 12;
    cesIndepAplicada = Math.min(ded.cesantiasIndependientes, cesIndepDisp, topeCesIndep, basePromedioMensual);
  }

  // Inversión energía renovable (global, first available)
  const energiaAplicada = clamp0(ded.inversionEnergiaRenovable - acum.energiaRenovable);

  // Donaciones (global, first available)
  const donacionesAplicada = clamp0(ded.donaciones - acum.donaciones);

  // Otras deducciones (global, first available)
  const otrasAplicada = clamp0(ded.otrasDeducciones - acum.otrasDeducciones);

  const totalDeduccionesSujetas =
    viviendaAplicada + medicinaAplicada + dep10Final + gmfAplicada +
    icetexAplicada + cesIndepAplicada + energiaAplicada +
    donacionesAplicada + otrasAplicada;

  // --- Exenciones sujetas al 40%/1340 UVT ---

  // Cesantías exentas — only trabajo
  let cesantiasFondoExentas = 0;
  let interesesCesantiasExentos = 0;
  if (subcedula === "trabajo") {
    const pctCesantias = porcentajeExencionCesantias(rt.ingresoMensualPromedio6m, uvt);
    cesantiasFondoExentas = rt.cesantiasFondo > 0 && rt.ingresoMensualPromedio6m > 0
      ? r(rt.cesantiasFondo * pctCesantias) : 0;
    interesesCesantiasExentos = rt.interesesCesantias > 0 && rt.ingresoMensualPromedio6m > 0
      ? r(rt.interesesCesantias * pctCesantias) : 0;
  }

  // Aportes voluntarios pensión/AFC (30%/3,800 UVT shared across all cédulas)
  const topeVolPensionAFC = r3(LEY_2277_LIMITS.volPensionAFCTopeUVT * uvt);
  const volPensionAFCDisp = clamp0(topeVolPensionAFC - acum.volPensionAFC);
  const tope30Pct = ingresosBrutos * LEY_2277_LIMITS.volPensionAFCPct;
  const totalVolPension = ex.aportesVoluntariosPension + ex.aportesAFC + ex.aportesFVP;
  const volPensionAFCAplicado = Math.min(
    clamp0(totalVolPension - acum.volPensionAFC),
    tope30Pct,
    volPensionAFCDisp
  );

  // 25% exemption — only trabajo (ET 206 Num. 10: rentas de trabajo)
  let exenta25 = 0;
  if (subcedula === "trabajo" && ex.aplicar25PctLaboral) {
    const ingresosBase25 = rt.salariosYPagosLaborales + rt.honorariosServicios +
      rt.otrosIngresosTrabajo + rt.prestacionesSociales + rt.viaticos +
      rt.gastosRepresentacion + rt.compensacionesTrabajo + rt.alimentacionNoSalarial;
    const base25 = clamp0(
      ingresosBase25 - totalINCRGO - totalDeduccionesSujetas -
      (ex.indemnizacionMilitar + ex.primaEspecialServicios + ex.gastosReprMagistrados50Pct +
       ex.gastosReprJueces25Pct + ex.seguroInvalMuerteFP + ex.gastosReprUnivPublicas50Pct +
       ex.otrasExentasEspecificas + volPensionAFCAplicado)
    );
    exenta25 = Math.min(base25 * 0.25, r3(LEY_2277_LIMITS.rentasExentasMaxUVT * uvt));
  }

  const totalExencionesSujetas =
    cesantiasFondoExentas + interesesCesantiasExentos +
    volPensionAFCAplicado + exenta25;

  // --- Imputables NO sujetas al 40% (only trabajo) ---
  let noSujetas = 0;
  if (subcedula === "trabajo") {
    noSujetas = Math.min(
      ex.indemnizacionMilitar + ex.primaEspecialServicios +
      ex.gastosReprMagistrados50Pct + ex.gastosReprJueces25Pct +
      ex.seguroInvalMuerteFP + ex.gastosReprUnivPublicas50Pct +
      ex.otrasExentasEspecificas + ex.ingresosCANExentos +
      ex.cesantiasReembolsoExentas,
      rentaLiquida
    );
  }

  // --- Fuera del límite 40% (ET 336 Num. 3 y 5) ---
  let fueraLimite = 0;
  if (subcedula === "trabajo") {
    // dependientes extra (fuera del límite, max 4)
    const depExtraTope = Math.min(ded.dependientesExtra, LEY_2277_LIMITS.maxDependientes);
    const depExtraValor = depExtraTope > 0
      ? Math.min(depExtraTope * r3(LEY_2277_LIMITS.dependienteUVT * uvt), ingresosBrutos) : 0;
    const facturaElectronica = Math.min(ded.comprasFacturaElectronica, ingresosBrutos);
    fueraLimite = depExtraValor + facturaElectronica;
  }

  const nextAcum: AcumCaps = {
    volObligatorio: acum.volObligatorio, // updated by caller (subcédula-specific INCRGO)
    vivienda: acum.vivienda + viviendaAplicada,
    medicina: acum.medicina + medicinaAplicada,
    ICETEX: acum.ICETEX + icetexAplicada,
    cesantiasIndep: acum.cesantiasIndep + cesIndepAplicada,
    volPensionAFC: acum.volPensionAFC + volPensionAFCAplicado,
    GMF: acum.GMF + gmfAplicada,
    donaciones: acum.donaciones + donacionesAplicada,
    otrasDeducciones: acum.otrasDeducciones + otrasAplicada,
    energiaRenovable: acum.energiaRenovable + energiaAplicada,
    depExtra: acum.depExtra,
    facturaElectronica: acum.facturaElectronica,
  };

  return {
    dedSujetas: totalDeduccionesSujetas,
    exSujetas: totalExencionesSujetas,
    noSujetas,
    fueraLimite,
    nextAcum,
  };
}

function calcSubcedulaTrabajo(
  state: DeclaracionState,
  uvt: number,
  acum: AcumCaps,
): SubcedulaCalc & { acum: AcumCaps } {
  const rt = state.rentasTrabajo;

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
  const { dedSujetas, exSujetas, noSujetas, fueraLimite, nextAcum } = calcDeduccionesComunes(
    state, uvt, acum, ingresosBrutos, totalINCRGO, rentaLiquida, "trabajo"
  );

  const totalSujetoAlLimite = Math.min(dedSujetas + exSujetas, rentaLiquida);

  return {
    ingresosBrutos,
    INCRGO: totalINCRGO,
    costosGastos: 0,
    rentaLiquida,
    perdida: 0,
    deduccionesSujetasAlLimite: dedSujetas,
    exencionesSujetasAlLimite: exSujetas,
    totalSujetoAlLimite,
    deduccionesFueraLimite: fueraLimite,
    imputablesNoSujetas: noSujetas,
    acum: nextAcum,
  };
}

// ── Subcédula 1b: Honorarios ────────────────────────────

function calcSubcedulaHonorarios(
  state: DeclaracionState,
  uvt: number,
  acum: AcumCaps,
): SubcedulaCalc & { acum: AcumCaps } {
  const rh = state.rentasHonorarios;

  const ingresosBrutos =
    rh.honorarios + rh.serviciosPersonales + rh.comisiones +
    rh.otrosIngresosHonorarios + rh.cesantiasReembolso +
    rh.compensaciones + rh.ingresosExterior;

  // INCRGO
  const volObligatorioTope = ingresosBrutos * LEY_2277_LIMITS.volObligatorioPct;
  const volObligatorio = Math.min(
    rh.aportesVoluntariosPensionObligatoria,
    volObligatorioTope,
    clamp0(ingresosBrutos * LEY_2277_LIMITS.volObligatorioPct - acum.volObligatorio)
  );

  const totalINCRGO = Math.min(
    rh.aportesObligatoriosPension + volObligatorio +
    rh.aportesObligatoriosSalud + rh.aportesARL + rh.otrosINCR,
    ingresosBrutos
  );

  const costosGastos = rh.costosDirectos + rh.gastosNomina + rh.otrosCostos;
  const rentaLiquida = clamp0(ingresosBrutos - totalINCRGO - costosGastos);
  const perdida = clamp0(totalINCRGO + costosGastos - ingresosBrutos);

  // P2-FIX: Honorarios now claims remaining global deductions
  const { dedSujetas, exSujetas, noSujetas, fueraLimite, nextAcum } = calcDeduccionesComunes(
    state, uvt, acum, ingresosBrutos, totalINCRGO, rentaLiquida, "honorarios"
  );

  const totalSujetoAlLimite = Math.min(dedSujetas + exSujetas, rentaLiquida);

  return {
    ingresosBrutos,
    INCRGO: totalINCRGO,
    costosGastos,
    rentaLiquida,
    perdida,
    deduccionesSujetasAlLimite: dedSujetas,
    exencionesSujetasAlLimite: exSujetas,
    totalSujetoAlLimite,
    deduccionesFueraLimite: fueraLimite,
    imputablesNoSujetas: noSujetas,
    acum: { ...nextAcum, volObligatorio: acum.volObligatorio + volObligatorio },
  };
}

// ── Subcédula 2: Capital ────────────────────────────────

function calcSubcedulaCapital(
  state: DeclaracionState,
  uvt: number,
  acum: AcumCaps,
): SubcedulaCalc & { acum: AcumCaps } {
  const rc = state.rentasCapital;

  const ingresosBrutos =
    rc.interesesRendimientos + rc.arrendamientos + rc.regalias +
    rc.otrosIngresosCapital + rc.ingresosExterior;

  // INCRGO
  const volObligatorioTope = ingresosBrutos * LEY_2277_LIMITS.volObligatorioPct;
  const volObligatorio = Math.min(
    rc.aportesVoluntariosPensionObligatoria,
    volObligatorioTope,
    clamp0(ingresosBrutos * LEY_2277_LIMITS.volObligatorioPct - acum.volObligatorio)
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

  // P2-FIX: Capital now claims remaining global deductions
  const { dedSujetas, exSujetas, noSujetas, fueraLimite, nextAcum } = calcDeduccionesComunes(
    state, uvt, acum, ingresosBrutos, totalINCRGO, rentaLiquida, "capital"
  );

  const totalSujetoAlLimite = Math.min(dedSujetas + exSujetas, rentaLiquida);

  return {
    ingresosBrutos,
    INCRGO: totalINCRGO,
    costosGastos,
    rentaLiquida,
    perdida,
    deduccionesSujetasAlLimite: dedSujetas,
    exencionesSujetasAlLimite: exSujetas,
    totalSujetoAlLimite,
    deduccionesFueraLimite: fueraLimite,
    imputablesNoSujetas: noSujetas,
    acum: { ...nextAcum, volObligatorio: acum.volObligatorio + volObligatorio },
  };
}

// ── Subcédula 3: No Laborales ───────────────────────────

function calcSubcedulaNoLaborales(
  state: DeclaracionState,
  uvt: number,
  acum: AcumCaps,
): SubcedulaCalc & { acum: AcumCaps } {
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
    clamp0(ingresosNetos * LEY_2277_LIMITS.volObligatorioPct - acum.volObligatorio)
  );

  // P6-FIX: Componente inflacionario se limita a ingresos netos
  const componenteInfl = Math.min(rnl.componenteInflacionario, ingresosNetos);

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

  // P2-FIX: NoLaborales now claims remaining global deductions
  const { dedSujetas, exSujetas, noSujetas, fueraLimite, nextAcum } = calcDeduccionesComunes(
    state, uvt, acum, ingresosBrutos, totalINCRGO, rentaLiquida, "noLaborales"
  );

  const totalSujetoAlLimite = Math.min(dedSujetas + exSujetas, rentaLiquida);

  return {
    ingresosBrutos,
    INCRGO: totalINCRGO,
    costosGastos,
    rentaLiquida,
    perdida,
    deduccionesSujetasAlLimite: dedSujetas,
    exencionesSujetasAlLimite: exSujetas,
    totalSujetoAlLimite,
    deduccionesFueraLimite: fueraLimite,
    imputablesNoSujetas: noSujetas,
    acum: { ...nextAcum, volObligatorio: acum.volObligatorio + volObligatorio },
  };
}

// ── Cédula General — Consolidación ──────────────────────

function calcCedulaGeneral(state: DeclaracionState, uvt: number): ResultadoCedulaGeneral {
  // Calculate each subcédula sequentially (shared caps accumulate via AcumCaps)
  const trabajo = calcSubcedulaTrabajo(state, uvt, ACUM_ZERO);
  const honorarios = calcSubcedulaHonorarios(state, uvt, trabajo.acum);
  const capital = calcSubcedulaCapital(state, uvt, honorarios.acum);
  const noLaborales = calcSubcedulaNoLaborales(state, uvt, capital.acum);

  // ── Límite 40% / 1,340 UVT (ET 336 Num. 3) ──

  // P5-FIX: Base for limit = renta líquida cédula general (ET 336 Num. 3)
  const baseLimite =
    trabajo.rentaLiquida + honorarios.rentaLiquida +
    capital.rentaLiquida + noLaborales.rentaLiquida;

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
    // P1-FIX: Pass accumulated vol pension/AFC to avoid recalculating subcédulas
    acumVolPensionAFC: noLaborales.acum.volPensionAFC,
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

  // P3-FIX: Gravable loterías (20%) — primeras 48 UVT exentas (ET 317)
  const gananciaGravableLoterias = clamp0(go.loteriasRifasApuestas - r3(48 * uvt));

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

  // P4-FIX: Anticipo = MIN(op1, op2). Retenciones se restan en liquidación final,
  // no dentro del anticipo (evita doble deducción ya que menosRetenciones también aplica).
  const totalRetenciones = ra.retencionFuenteRenta + ra.retencionFuenteOtros +
    ra.retencionDividendos + ra.retencionGananciasOcasionales;
  const anticipoRecomendado = clamp0(Math.min(anticipoOpcion1, anticipoOpcion2));

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

  // P1-FIX: Use acumVolPensionAFC from cedulaGeneral instead of recalculating
  const cedulaPensiones = calcCedulaPensiones(state, uvt, cedulaGeneral.acumVolPensionAFC);
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

  // P7-FIX: Tasa efectiva incluye impuesto GO (totalImpuestoCargo, no solo renta)
  const tasaEfectivaGlobal = totalIngresos > 0 ? liquidacion.totalImpuestoCargo / totalIngresos : 0;

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
