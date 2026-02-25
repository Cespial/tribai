import {
  RENTA_BRACKETS,
  RETENCION_SALARIOS_BRACKETS,
  LEY_2277_LIMITS,
  SMLMV_2026,
  AUXILIO_TRANSPORTE_2026,
  SALARIO_INTEGRAL_MIN_SMLMV,
  EMPLOYER_RATES,
  EMPLOYEE_RATES,
  INDEPENDENT_RATES,
  SALARIO_INTEGRAL_RATES,
  IVA_THRESHOLD_UVT_ANNUAL,
  SIMPLE_BRACKETS,
} from "@/config/tax-data";

// ── Helpers ──

function calcRetencionMensual(baseGravableUVT: number): number {
  if (baseGravableUVT <= 0) return 0;
  for (let i = RETENCION_SALARIOS_BRACKETS.length - 1; i >= 0; i--) {
    const b = RETENCION_SALARIOS_BRACKETS[i];
    if (baseGravableUVT > b.from) {
      return (baseGravableUVT - b.from) * b.rate + b.base;
    }
  }
  return 0;
}

function calcImpuestoRenta(rentaLiquidaUVT: number): number {
  if (rentaLiquidaUVT <= 0) return 0;
  for (let i = RENTA_BRACKETS.length - 1; i >= 0; i--) {
    const b = RENTA_BRACKETS[i];
    if (rentaLiquidaUVT > b.from) {
      return (rentaLiquidaUVT - b.from) * b.rate + b.base;
    }
  }
  return 0;
}

function calcSimple(ingresoBrutoAnualUVT: number, groupIndex: number): number {
  let impuesto = 0;
  let remaining = ingresoBrutoAnualUVT;
  for (const bracket of SIMPLE_BRACKETS) {
    if (remaining <= 0) break;
    const taxableInBracket = Math.min(remaining, bracket.to - bracket.from);
    impuesto += taxableInBracket * bracket.rates[groupIndex];
    remaining -= taxableInBracket;
  }
  return impuesto;
}

// ── Calculation Functions ──

export function calcLaboral(presupuesto: number, esPensionado: boolean, uvt: number) {
  const empPension = esPensionado ? 0 : EMPLOYER_RATES.pension;
  const workerPension = esPensionado ? 0 : EMPLOYEE_RATES.pension;

  const factorSSLaboral = EMPLOYER_RATES.salud + empPension + EMPLOYER_RATES.arl;
  const factorParafiscales = EMPLOYER_RATES.sena + EMPLOYER_RATES.icbf + EMPLOYER_RATES.ccf;
  const factorPrestaciones =
    EMPLOYER_RATES.cesantias + EMPLOYER_RATES.intCesantias + EMPLOYER_RATES.prima + EMPLOYER_RATES.vacaciones;

  const factorTotal = factorSSLaboral + factorParafiscales + factorPrestaciones;
  let salarioLaboral = presupuesto / (1 + factorTotal);

  let auxilioTransporte = 0;
  if (salarioLaboral <= 2 * SMLMV_2026) {
    const factorConAux =
      factorSSLaboral +
      factorParafiscales +
      EMPLOYER_RATES.vacaciones +
      (EMPLOYER_RATES.cesantias + EMPLOYER_RATES.intCesantias + EMPLOYER_RATES.prima);
    const factorAux = 1 + EMPLOYER_RATES.cesantias + EMPLOYER_RATES.intCesantias + EMPLOYER_RATES.prima;
    salarioLaboral = (presupuesto - AUXILIO_TRANSPORTE_2026 * factorAux) / (1 + factorConAux);
    if (salarioLaboral > 2 * SMLMV_2026) {
      salarioLaboral = presupuesto / (1 + factorTotal);
      auxilioTransporte = 0;
    } else {
      auxilioTransporte = AUXILIO_TRANSPORTE_2026;
    }
  }

  const basePrestaciones = salarioLaboral + auxilioTransporte;

  const labSaludEmp = salarioLaboral * EMPLOYER_RATES.salud;
  const labPensionEmp = salarioLaboral * empPension;
  const labArlEmp = salarioLaboral * EMPLOYER_RATES.arl;
  const labSena = salarioLaboral * EMPLOYER_RATES.sena;
  const labIcbf = salarioLaboral * EMPLOYER_RATES.icbf;
  const labCcf = salarioLaboral * EMPLOYER_RATES.ccf;
  const labCesantias = basePrestaciones * EMPLOYER_RATES.cesantias;
  const labIntCesantias = basePrestaciones * EMPLOYER_RATES.intCesantias;
  const labPrima = basePrestaciones * EMPLOYER_RATES.prima;
  const labVacaciones = salarioLaboral * EMPLOYER_RATES.vacaciones;

  const labCostoEmpresa =
    salarioLaboral + auxilioTransporte + labSaludEmp + labPensionEmp + labArlEmp +
    labSena + labIcbf + labCcf + labCesantias + labIntCesantias + labPrima + labVacaciones;

  const labSaludWorker = salarioLaboral * EMPLOYEE_RATES.salud;
  const labPensionWorker = salarioLaboral * workerPension;
  const labTotalSSWorker = labSaludWorker + labPensionWorker;

  const labNetoMensual = salarioLaboral + auxilioTransporte - labTotalSSWorker;
  const labPrestacionesAnuales = labCesantias * 12 + labIntCesantias * 12 + labPrima * 12;
  const labNetoAnualSinReteFte = labNetoMensual * 12 + labPrestacionesAnuales;

  // Retencion
  const topeExentasMensual = (LEY_2277_LIMITS.deduccionesExentasMaxUVT * uvt) / 12;
  const labIngresoMensual = salarioLaboral;
  const labSSIncrngo = labTotalSSWorker;
  const labIngresoNeto = labIngresoMensual - labSSIncrngo;
  const labExenta25 = Math.min(labIngresoNeto * 0.25, topeExentasMensual);
  const labBaseGravable = Math.max(0, labIngresoNeto - labExenta25);
  const labBaseGravableUVT = labBaseGravable / uvt;
  const labReteFteUVT = calcRetencionMensual(labBaseGravableUVT);
  const labReteFte = labReteFteUVT * uvt;

  // Renta Anual
  const topeExentasAnual = LEY_2277_LIMITS.deduccionesExentasMaxUVT * uvt;
  const labIngresoBrutoAnual = salarioLaboral * 12 + labPrestacionesAnuales;
  const labSSAnual = labTotalSSWorker * 12;
  const labIngresoNetoAnual = labIngresoBrutoAnual - labSSAnual;
  const labExenta25Anual = Math.min(labIngresoNetoAnual * 0.25, topeExentasAnual);
  const labRentaLiquida = Math.max(0, labIngresoNetoAnual - labExenta25Anual);
  const labRentaLiquidaUVT = labRentaLiquida / uvt;
  const labImpuestoRentaUVT = calcImpuestoRenta(labRentaLiquidaUVT);
  const labImpuestoRenta = labImpuestoRentaUVT * uvt;
  const labRetencionesAnuales = labReteFte * 12;
  const labSaldoRenta = labImpuestoRenta - labRetencionesAnuales;
  const labTasaEfectiva = labIngresoBrutoAnual > 0 ? labImpuestoRenta / labIngresoBrutoAnual : 0;

  return {
    salario: salarioLaboral, auxilio: auxilioTransporte, basePrestaciones,
    saludEmp: labSaludEmp, pensionEmp: labPensionEmp, arlEmp: labArlEmp,
    sena: labSena, icbf: labIcbf, ccf: labCcf,
    cesantias: labCesantias, intCesantias: labIntCesantias, prima: labPrima, vacaciones: labVacaciones,
    costoEmpresa: labCostoEmpresa,
    saludWorker: labSaludWorker, pensionWorker: labPensionWorker, totalSSWorker: labTotalSSWorker,
    netoMensual: labNetoMensual, prestacionesAnuales: labPrestacionesAnuales, netoAnual: labNetoAnualSinReteFte,
    ingresoMensual: labIngresoMensual, ssIncrngo: labSSIncrngo, ingresoNeto: labIngresoNeto,
    exenta25: labExenta25, baseGravable: labBaseGravable, baseGravableUVT: labBaseGravableUVT,
    reteFte: labReteFte,
    ingresoBrutoAnual: labIngresoBrutoAnual, ssAnual: labSSAnual,
    exenta25Anual: labExenta25Anual, rentaLiquida: labRentaLiquida, rentaLiquidaUVT: labRentaLiquidaUVT,
    impuestoRenta: labImpuestoRenta, retencionesAnuales: labRetencionesAnuales,
    saldoRenta: labSaldoRenta, tasaEfectiva: labTasaEfectiva,
  };
}

export function calcIntegral(presupuesto: number, esPensionado: boolean, uvt: number) {
  const empPension = esPensionado ? 0 : EMPLOYER_RATES.pension;
  const workerPension = esPensionado ? 0 : EMPLOYEE_RATES.pension;

  const minIntegral = SALARIO_INTEGRAL_MIN_SMLMV * SMLMV_2026;
  const factorSSIntegral =
    (EMPLOYER_RATES.salud + empPension + EMPLOYER_RATES.arl) * SALARIO_INTEGRAL_RATES.baseSS;
  const factorParafiscales = EMPLOYER_RATES.sena + EMPLOYER_RATES.icbf + EMPLOYER_RATES.ccf;
  const factorIntegral = factorSSIntegral + factorParafiscales;
  const salarioIntegral = presupuesto / (1 + factorIntegral);
  const integralNA = salarioIntegral < minIntegral;

  const intBase70 = salarioIntegral * SALARIO_INTEGRAL_RATES.baseSS;
  const intSaludEmp = intBase70 * EMPLOYER_RATES.salud;
  const intPensionEmp = intBase70 * empPension;
  const intArlEmp = intBase70 * EMPLOYER_RATES.arl;
  const intSena = salarioIntegral * EMPLOYER_RATES.sena;
  const intIcbf = salarioIntegral * EMPLOYER_RATES.icbf;
  const intCcf = salarioIntegral * EMPLOYER_RATES.ccf;

  const intCostoEmpresa = salarioIntegral + intSaludEmp + intPensionEmp + intArlEmp + intSena + intIcbf + intCcf;

  const intSaludWorker = intBase70 * EMPLOYEE_RATES.salud;
  const intPensionWorker = intBase70 * workerPension;
  const intTotalSSWorker = intSaludWorker + intPensionWorker;

  const intNetoMensual = salarioIntegral - intTotalSSWorker;
  const intNetoAnualSinReteFte = intNetoMensual * 12;

  // Retencion
  const topeExentasMensual = (LEY_2277_LIMITS.deduccionesExentasMaxUVT * uvt) / 12;
  const intIngresoMensual = intBase70;
  const intSSIncrngo = intTotalSSWorker;
  const intIngresoNeto = intIngresoMensual - intSSIncrngo;
  const intExenta25 = Math.min(intIngresoNeto * 0.25, topeExentasMensual);
  const intBaseGravable = Math.max(0, intIngresoNeto - intExenta25);
  const intBaseGravableUVT = intBaseGravable / uvt;
  const intReteFteUVT = calcRetencionMensual(intBaseGravableUVT);
  const intReteFte = intReteFteUVT * uvt;

  // Renta Anual
  const topeExentasAnual = LEY_2277_LIMITS.deduccionesExentasMaxUVT * uvt;
  const intIngresoBrutoAnual = salarioIntegral * 12;
  const intSSAnual = intTotalSSWorker * 12;
  const intIngresoNetoAnual = intBase70 * 12 - intSSAnual;
  const intExenta25Anual = Math.min(intIngresoNetoAnual * 0.25, topeExentasAnual);
  const intRentaLiquida = Math.max(0, intIngresoNetoAnual - intExenta25Anual);
  const intRentaLiquidaUVT = intRentaLiquida / uvt;
  const intImpuestoRentaUVT = calcImpuestoRenta(intRentaLiquidaUVT);
  const intImpuestoRenta = intImpuestoRentaUVT * uvt;
  const intRetencionesAnuales = intReteFte * 12;
  const intSaldoRenta = intImpuestoRenta - intRetencionesAnuales;
  const intTasaEfectiva = intIngresoBrutoAnual > 0 ? intImpuestoRenta / intIngresoBrutoAnual : 0;

  return {
    salario: salarioIntegral, na: integralNA, base70: intBase70,
    saludEmp: intSaludEmp, pensionEmp: intPensionEmp, arlEmp: intArlEmp,
    sena: intSena, icbf: intIcbf, ccf: intCcf,
    costoEmpresa: intCostoEmpresa,
    saludWorker: intSaludWorker, pensionWorker: intPensionWorker, totalSSWorker: intTotalSSWorker,
    netoMensual: intNetoMensual, netoAnual: intNetoAnualSinReteFte,
    ingresoMensual: intIngresoMensual, ssIncrngo: intSSIncrngo, ingresoNeto: intIngresoNeto,
    exenta25: intExenta25, baseGravable: intBaseGravable, baseGravableUVT: intBaseGravableUVT,
    reteFte: intReteFte,
    ingresoBrutoAnual: intIngresoBrutoAnual, ssAnual: intSSAnual,
    exenta25Anual: intExenta25Anual, rentaLiquida: intRentaLiquida, rentaLiquidaUVT: intRentaLiquidaUVT,
    impuestoRenta: intImpuestoRenta, retencionesAnuales: intRetencionesAnuales,
    saldoRenta: intSaldoRenta, tasaEfectiva: intTasaEfectiva,
  };
}

export function calcIndependiente(presupuesto: number, esPensionado: boolean, uvt: number) {
  const indPension = esPensionado ? 0 : INDEPENDENT_RATES.pension;
  const honorario = presupuesto;
  const indBaseSS = honorario * INDEPENDENT_RATES.baseSS;
  const indSalud = indBaseSS * INDEPENDENT_RATES.salud;
  const indPensionVal = indBaseSS * indPension;
  const indArl = indBaseSS * INDEPENDENT_RATES.arl;
  const indTotalSS = indSalud + indPensionVal + indArl;

  const ingresoAnualUVT = (honorario * 12) / uvt;
  const indIVA = ingresoAnualUVT > IVA_THRESHOLD_UVT_ANNUAL ? honorario * 0.19 : 0;

  const indNetoMensual = honorario - indTotalSS;
  const indNetoAnualSinReteFte = indNetoMensual * 12;

  // Retencion
  const topeExentasMensual = (LEY_2277_LIMITS.deduccionesExentasMaxUVT * uvt) / 12;
  const indIngresoMensual = honorario;
  const indSSIncrngo = indTotalSS;
  const indIngresoNeto = indIngresoMensual - indSSIncrngo;
  const indExenta25 = Math.min(indIngresoNeto * 0.25, topeExentasMensual);
  const indBaseGravable = Math.max(0, indIngresoNeto - indExenta25);
  const indBaseGravableUVT = indBaseGravable / uvt;
  const indReteFteUVT = calcRetencionMensual(indBaseGravableUVT);
  const indReteFte = indReteFteUVT * uvt;

  // Renta Anual
  const topeExentasAnual = LEY_2277_LIMITS.deduccionesExentasMaxUVT * uvt;
  const indIngresoBrutoAnual = honorario * 12;
  const indSSAnual = indTotalSS * 12;
  const indIngresoNetoAnual = indIngresoBrutoAnual - indSSAnual;
  const indExenta25Anual = Math.min(indIngresoNetoAnual * 0.25, topeExentasAnual);
  const indRentaLiquida = Math.max(0, indIngresoNetoAnual - indExenta25Anual);
  const indRentaLiquidaUVT = indRentaLiquida / uvt;
  const indImpuestoRentaUVT = calcImpuestoRenta(indRentaLiquidaUVT);
  const indImpuestoRenta = indImpuestoRentaUVT * uvt;
  const indRetencionesAnuales = indReteFte * 12;
  const indSaldoRenta = indImpuestoRenta - indRetencionesAnuales;
  const indTasaEfectiva = indIngresoBrutoAnual > 0 ? indImpuestoRenta / indIngresoBrutoAnual : 0;

  return {
    honorario, baseSS: indBaseSS, salud: indSalud, pension: indPensionVal, arl: indArl, totalSS: indTotalSS,
    iva: indIVA,
    netoMensual: indNetoMensual, netoAnual: indNetoAnualSinReteFte,
    ingresoMensual: indIngresoMensual, ssIncrngo: indSSIncrngo, ingresoNeto: indIngresoNeto,
    exenta25: indExenta25, baseGravable: indBaseGravable, baseGravableUVT: indBaseGravableUVT,
    reteFte: indReteFte,
    ingresoBrutoAnual: indIngresoBrutoAnual, ssAnual: indSSAnual,
    exenta25Anual: indExenta25Anual, rentaLiquida: indRentaLiquida, rentaLiquidaUVT: indRentaLiquidaUVT,
    impuestoRenta: indImpuestoRenta, retencionesAnuales: indRetencionesAnuales,
    saldoRenta: indSaldoRenta, tasaEfectiva: indTasaEfectiva,
  };
}

export function calculateComparison(
  presupuesto: number,
  esPensionado: boolean,
  grupoSimpleIndex: number,
  uvt: number
) {
  if (presupuesto <= 0) return null;

  const lab = calcLaboral(presupuesto, esPensionado, uvt);
  const int = calcIntegral(presupuesto, esPensionado, uvt);
  const ind = calcIndependiente(presupuesto, esPensionado, uvt);

  // SIMPLE vs Ordinaria
  const indBrutoAnualUVT = ind.ingresoBrutoAnual / uvt;
  const simpleImpuestoUVT = calcSimple(indBrutoAnualUVT, grupoSimpleIndex);
  const simpleImpuesto = simpleImpuestoUVT * uvt;

  // Best for worker
  const netos = [lab.netoAnual, int.na ? -Infinity : int.netoAnual, ind.netoAnual];
  const bestIndex = netos.indexOf(Math.max(...netos));

  return {
    lab,
    int,
    ind,
    simple: {
      impuesto: simpleImpuesto,
      ordinaria: ind.impuestoRenta,
      diferencia: ind.impuestoRenta - simpleImpuesto,
    },
    bestIndex,
  };
}
