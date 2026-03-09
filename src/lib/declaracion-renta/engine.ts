/* ───────────────────────────────────────────────────────────
   engine.ts — Motor de cálculo Formulario 210 DIAN
   Implementa la lógica completa de liquidación del impuesto
   de renta para personas naturales en Colombia.
   ─────────────────────────────────────────────────────────── */

import { UVT_VALUES, RENTA_BRACKETS, LEY_2277_LIMITS } from "@/config/tax-data";
import type {
  DeclaracionState,
  ResultadoDeclaracion,
  ResultadoPatrimonio,
  ResultadoCedulaGeneral,
  ResultadoCedulaPensiones,
  ResultadoCedulaDividendos,
  ResultadoGananciasOcasionales,
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

function clampMin(value: number, min: number): number {
  return Math.max(value, min);
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
      impuestoCOP: Math.round(impuestoBracket * uvt),
    });

    impuestoUVT += impuestoBracket;
  }

  return {
    impuestoUVT,
    impuestoCOP: Math.round(impuestoUVT * uvt),
    breakdown,
  };
}

// ── Tabla Art. 242 — Dividendos no gravados ──────────────

function calcImpuestoDividendos242(dividendosUVT: number, uvt: number): number {
  // Sub-cédula 1: 0-300 UVT → 0%, 300-1090 UVT → 10%, >1090 UVT → 15%
  if (dividendosUVT <= 300) return 0;
  if (dividendosUVT <= 1_090) {
    return Math.round((dividendosUVT - 300) * 0.10 * uvt);
  }
  const tramo2 = (1_090 - 300) * 0.10;
  const tramo3 = (dividendosUVT - 1_090) * 0.15;
  return Math.round((tramo2 + tramo3) * uvt);
}

// ── Sección: Patrimonio ──────────────────────────────────

function calcPatrimonio(state: DeclaracionState): ResultadoPatrimonio {
  const patrimonioBruto = state.patrimonio.bienes.reduce((sum, b) => sum + b.valorFiscal, 0);
  const deudasTotal = state.patrimonio.deudas.reduce((sum, d) => sum + d.saldoDiciembre31, 0);
  return {
    patrimonioBruto,
    deudasTotal,
    patrimonioLiquido: clampMin(patrimonioBruto - deudasTotal, 0),
  };
}

// ── Sección: Cédula General ──────────────────────────────

function calcCedulaGeneral(state: DeclaracionState, uvt: number): ResultadoCedulaGeneral {
  const rt = state.rentasTrabajo;
  const rc = state.rentasCapital;
  const rnl = state.rentasNoLaborales;
  const ded = state.deducciones;

  // ─ Rentas de Trabajo
  const ingresosBrutosTrabajo = rt.salariosYPagosLaborales + rt.honorariosServicios + rt.otrosIngresosTrabajo;
  const INCRTrabajo =
    rt.aportesObligatoriosSalud +
    rt.aportesObligatoriosPension +
    rt.aportesVoluntariosPension +
    rt.fondoSolidaridad +
    rt.otrosINCR;
  const rentaLiquidaTrabajo = clampMin(ingresosBrutosTrabajo - INCRTrabajo, 0);

  // ─ Rentas de Capital
  const ingresosBrutosCapital = rc.interesesRendimientos + rc.arrendamientos + rc.regalias + rc.otrosIngresosCapital;
  const INCRCapitalTotal = rc.costosGastosCapital + rc.INCRCapital;
  const rentaLiquidaCapital = clampMin(ingresosBrutosCapital - INCRCapitalTotal, 0);

  // ─ Rentas No Laborales
  const ingresosBrutosNoLaborales =
    rnl.ingresosComerciales + rnl.ingresosIndustriales + rnl.ingresosAgropecuarios + rnl.otrosIngresosNoLaborales;
  const INCRNoLaboralesTotal = rnl.costosGastosNoLaborales + rnl.INCRNoLaborales;
  const rentaLiquidaNoLaborales = clampMin(ingresosBrutosNoLaborales - INCRNoLaboralesTotal, 0);

  // ─ Consolidado Cédula General
  const rentaLiquidaCedulaGeneral = rentaLiquidaTrabajo + rentaLiquidaCapital + rentaLiquidaNoLaborales;

  // ─ Deducciones
  // Dependientes: max 72 UVT/mes × 12 = 864 UVT/año, max 4 dependientes
  const dependientesCapped = ded.dependientes > LEY_2277_LIMITS.maxDependientes;
  const numDependientes = Math.min(ded.dependientes, LEY_2277_LIMITS.maxDependientes);
  const deduccionDependientes = Math.min(
    numDependientes * LEY_2277_LIMITS.dependienteUVT * 12 * uvt,
    rentaLiquidaCedulaGeneral
  );

  // Intereses vivienda: max 100 UVT/mes = 1,200 UVT/año
  const interesesViviendaCap = uvtToCOP(1_200, uvt);
  const interesesViviendaAplicados = Math.min(ded.interesesVivienda, interesesViviendaCap);

  // Medicina prepagada: max 16 UVT/mes = 192 UVT/año
  const medicinaCap = uvtToCOP(192, uvt);
  const medicinaAplicada = Math.min(ded.medicinaPrepagada, medicinaCap);

  // AFC + FVP: max 30% ingreso laboral, tope 3,800 UVT
  const afcFvpCap = Math.min(ingresosBrutosTrabajo * 0.30, uvtToCOP(3_800, uvt));
  const afcFvpAplicado = Math.min(ded.aportesAFC + ded.aportesFVP, afcFvpCap);

  // Pensiones voluntarias: max 30% ingreso, tope 3,800 UVT
  const pensVolCap = Math.min(ingresosBrutosTrabajo * 0.30, uvtToCOP(3_800, uvt));
  const pensVolAplicada = Math.min(ded.pensionesVoluntarias, pensVolCap);

  const totalDeducciones =
    deduccionDependientes +
    interesesViviendaAplicados +
    medicinaAplicada +
    afcFvpAplicado +
    pensVolAplicada +
    ded.donaciones +
    ded.GMFDeducible +
    ded.otrasDeducciones;

  // ─ Rentas exentas (25% Art. 206.10)
  const exenta25Base = ded.exenta25Porciento ? rentaLiquidaTrabajo * 0.25 : 0;
  const exenta25Cap = uvtToCOP(LEY_2277_LIMITS.rentasExentasMaxUVT, uvt); // 790 UVT
  let rentasExentasAplicadas = Math.min(exenta25Base, exenta25Cap);
  const exentasCapped = exenta25Base > exenta25Cap;

  // ─ Tope combinado: deducciones + exentas ≤ 40% renta líquida, max 1,340 UVT
  const combinadoMax40 = rentaLiquidaCedulaGeneral * 0.40;
  const combinadoMaxUVT = uvtToCOP(LEY_2277_LIMITS.deduccionesExentasMaxUVT, uvt); // 1,340 UVT
  const combinadoMaxTotal = Math.min(combinadoMax40, combinadoMaxUVT);
  let deduccionesAplicadas = totalDeducciones;

  if (deduccionesAplicadas + rentasExentasAplicadas > combinadoMaxTotal) {
    // Proportionally reduce
    const ratio = combinadoMaxTotal / (deduccionesAplicadas + rentasExentasAplicadas);
    deduccionesAplicadas = Math.round(deduccionesAplicadas * ratio);
    rentasExentasAplicadas = Math.round(rentasExentasAplicadas * ratio);
  }

  const combinadoCapped = totalDeducciones + exenta25Base > combinadoMaxTotal;

  // ─ Renta Líquida Gravable
  const rentaLiquidaGravable = clampMin(
    rentaLiquidaCedulaGeneral - deduccionesAplicadas - rentasExentasAplicadas,
    0
  );
  const rentaLiquidaGravableUVT = copToUVT(rentaLiquidaGravable, uvt);

  // ─ Impuesto Cédula General (Art. 241)
  const { impuestoCOP } = calcImpuestoTabla241(rentaLiquidaGravableUVT, uvt);

  return {
    ingresosBrutosTrabajo,
    INCRTrabajo,
    rentaLiquidaTrabajo,
    ingresosBrutosCapital,
    INCRCapitalTotal,
    rentaLiquidaCapital,
    ingresosBrutosNoLaborales,
    INCRNoLaboralesTotal,
    rentaLiquidaNoLaborales,
    rentaLiquidaCedulaGeneral,
    deduccionesAplicadas,
    rentasExentasAplicadas,
    rentaLiquidaGravable,
    rentaLiquidaGravableUVT,
    impuestoCedulaGeneral: impuestoCOP,
    exentasCapped,
    combinadoCapped,
    dependientesCapped,
  };
}

// ── Sección: Cédula Pensiones ────────────────────────────

function calcCedulaPensiones(state: DeclaracionState, uvt: number): ResultadoCedulaPensiones {
  const cp = state.cedulaPensiones;
  const ingresosBrutosPensiones =
    cp.pensionJubilacion + cp.pensionSobreviviente + cp.pensionInvalidez + cp.otrasPensiones;
  const INCRPensiones = cp.aportesObligatoriosSalud;
  const rentaLiquidaPensiones = clampMin(ingresosBrutosPensiones - INCRPensiones, 0);

  // Exención: primeras 12,000 UVT anuales
  const exencionPensiones = Math.min(rentaLiquidaPensiones, uvtToCOP(12_000, uvt));
  const rentaLiquidaGravablePensiones = clampMin(rentaLiquidaPensiones - exencionPensiones, 0);

  const { impuestoCOP } = calcImpuestoTabla241(copToUVT(rentaLiquidaGravablePensiones, uvt), uvt);

  return {
    ingresosBrutosPensiones,
    INCRPensiones,
    rentaExentaPensiones: exencionPensiones,
    rentaLiquidaGravablePensiones,
    impuestoCedulaPensiones: impuestoCOP,
  };
}

// ── Sección: Cédula Dividendos ───────────────────────────

function calcCedulaDividendos(state: DeclaracionState, uvt: number): ResultadoCedulaDividendos {
  const cd = state.cedulaDividendos;

  // Sub-cédula 1: Dividendos no gravados (Art. 242)
  const subCedula1Total = cd.dividendosNoGravados + cd.participacionesNoGravadas + cd.dividendosNoGravados2016;
  const subCedula1Impuesto = calcImpuestoDividendos242(copToUVT(subCedula1Total, uvt), uvt);

  // Sub-cédula 2: Dividendos gravados (Art. 241 + recargo Art. 242)
  const subCedula2Total = cd.dividendosGravados + cd.participacionesGravadas;
  const { impuestoCOP: impuesto241 } = calcImpuestoTabla241(copToUVT(subCedula2Total, uvt), uvt);
  const recargo242 = calcImpuestoDividendos242(copToUVT(subCedula2Total, uvt), uvt);
  const subCedula2Impuesto = impuesto241 + recargo242;

  return {
    subCedula1Total,
    subCedula1Impuesto,
    subCedula2Total,
    subCedula2Impuesto,
    impuestoTotalDividendos: subCedula1Impuesto + subCedula2Impuesto,
  };
}

// ── Sección: Ganancias Ocasionales ───────────────────────

function calcGananciasOcasionales(state: DeclaracionState, uvt: number): ResultadoGananciasOcasionales {
  const go = state.gananciasOcasionales;

  const gananciasBrutas =
    go.ventaVivienda + go.ventaOtrosActivos + go.herenciasDonaciones + go.loterias + go.indemnizaciones + go.otrasGanancias;
  const gananciasTotales = clampMin(gananciasBrutas - go.costosGanancias, 0);

  // Exenciones
  let gananciaExenta = 0;
  // Loterías: primeras 48 UVT exentas (Art. 306)
  if (go.loterias > 0) {
    gananciaExenta += Math.min(go.loterias, uvtToCOP(48, uvt));
  }
  // Herencias: primeras 3,250 UVT exentas (Art. 307)
  if (go.herenciasDonaciones > 0) {
    gananciaExenta += Math.min(go.herenciasDonaciones, uvtToCOP(3_250, uvt));
  }
  // Venta vivienda habitación: primeras 7,500 UVT exentas (Art. 311-1)
  // Solo aplica a ventaVivienda, no a ventaOtrosActivos
  if (go.ventaVivienda > 0) {
    gananciaExenta += Math.min(go.ventaVivienda, uvtToCOP(7_500, uvt));
  }

  gananciaExenta = Math.min(gananciaExenta, gananciasTotales);
  const gananciaGravable = clampMin(gananciasTotales - gananciaExenta, 0);

  // Tarifa: 15% general (Art. 314), loterías 20% (Art. 317)
  // Bound lottery gravable by total gananciaGravable to prevent over-taxation when costs reduce total
  const impuestoLoteriaGravable = Math.min(
    clampMin(go.loterias - uvtToCOP(48, uvt), 0),
    gananciaGravable
  );
  const impuestoLoteria = Math.round(impuestoLoteriaGravable * 0.20);
  const impuestoRestoGanancias = Math.round(
    clampMin(gananciaGravable - clampMin(impuestoLoteriaGravable, 0), 0) * 0.15
  );

  return {
    gananciasBrutas,
    costosGanancias: go.costosGanancias,
    gananciaExenta,
    gananciaGravable,
    impuestoGanancias: impuestoLoteria + impuestoRestoGanancias,
  };
}

// ── Liquidación Final ────────────────────────────────────

function calcLiquidacion(
  cedulaGeneral: ResultadoCedulaGeneral,
  cedulaPensiones: ResultadoCedulaPensiones,
  cedulaDividendos: ResultadoCedulaDividendos,
  gananciasOcasionales: ResultadoGananciasOcasionales,
  state: DeclaracionState,
  uvt: number
): ResultadoLiquidacion {
  const ra = state.retencionesAnticipos;

  const impuestoRentaTotal =
    cedulaGeneral.impuestoCedulaGeneral +
    cedulaPensiones.impuestoCedulaPensiones +
    cedulaDividendos.impuestoTotalDividendos +
    gananciasOcasionales.impuestoGanancias;

  // Sin descuentos tributarios por ahora (se puede expandir)
  const descuentosTributarios = 0;
  const impuestoNeto = clampMin(impuestoRentaTotal - descuentosTributarios, 0);

  // Anticipo siguiente año (Art. 807-810): 25% primer año, 50% segundo, 75% tercero+
  let anticipoSiguienteAno: number;
  const anos = state.perfil.anosDeclarando;
  if (anos <= 1) {
    anticipoSiguienteAno = Math.round(impuestoNeto * 0.25);
  } else if (anos === 2) {
    anticipoSiguienteAno = Math.round(impuestoNeto * 0.50);
  } else {
    anticipoSiguienteAno = Math.round(impuestoNeto * 0.75);
  }

  const totalRetenciones = ra.retencionFuenteRenta + ra.retencionFuenteOtros + ra.retencionDividendos;
  const saldoFavorAnterior = ra.saldoFavorAnterior;
  const anticipoAnterior = ra.anticipoAnoAnterior;

  const totalAPagar =
    impuestoNeto + anticipoSiguienteAno - totalRetenciones - saldoFavorAnterior - anticipoAnterior;

  return {
    impuestoRentaTotal,
    descuentosTributarios,
    impuestoNeto,
    anticipoSiguienteAno,
    totalRetenciones,
    saldoFavorAnterior,
    anticipoAnterior,
    saldoPagar: clampMin(totalAPagar, 0),
    saldoFavor: clampMin(-totalAPagar, 0),
  };
}

// ── Sugerencias de optimización ──────────────────────────

function calcSugerencias(
  state: DeclaracionState,
  cedulaGeneral: ResultadoCedulaGeneral,
  uvt: number
): SugerenciaOptimizacion[] {
  const sugerencias: SugerenciaOptimizacion[] = [];
  const ded = state.deducciones;

  // ¿Está usando la exención del 25%?
  if (!ded.exenta25Porciento && cedulaGeneral.rentaLiquidaTrabajo > 0) {
    const potencial25 = Math.min(
      cedulaGeneral.rentaLiquidaTrabajo * 0.25,
      uvtToCOP(LEY_2277_LIMITS.rentasExentasMaxUVT, uvt)
    );
    sugerencias.push({
      id: "exenta-25",
      titulo: "Activar exención del 25% (Art. 206.10)",
      descripcion:
        "La ley permite descontar el 25% de los pagos laborales como renta exenta, hasta 790 UVT mensuales.",
      ahorroPotencial: Math.round(potencial25 * 0.28),
      articuloET: "206",
      tipo: "exencion",
    });
  }

  // ¿Podría aportar más a AFC/FVP?
  const afcActual = ded.aportesAFC + ded.aportesFVP;
  const afcMax = Math.min(
    cedulaGeneral.ingresosBrutosTrabajo * 0.30,
    uvtToCOP(3_800, uvt)
  );
  if (afcActual < afcMax && cedulaGeneral.ingresosBrutosTrabajo > 0) {
    const espacio = afcMax - afcActual;
    sugerencias.push({
      id: "afc-fvp",
      titulo: "Maximizar aportes AFC/FVP",
      descripcion: `Puede aportar hasta ${Math.round(espacio).toLocaleString("es-CO")} COP más a AFC o FVP y reducir su base gravable.`,
      ahorroPotencial: Math.round(Math.min(espacio, cedulaGeneral.rentaLiquidaGravable) * 0.28),
      articuloET: "126-1",
      tipo: "deduccion",
    });
  }

  // ¿Tiene dependientes sin declarar?
  if (ded.dependientes === 0 && cedulaGeneral.rentaLiquidaTrabajo > uvtToCOP(1_090, uvt)) {
    sugerencias.push({
      id: "dependientes",
      titulo: "Verificar si tiene dependientes económicos",
      descripcion:
        "Cada dependiente le permite deducir hasta 72 UVT mensuales (864 UVT/año). Máximo 4 dependientes.",
      ahorroPotencial: Math.round(uvtToCOP(864, uvt) * 0.19),
      articuloET: "387",
      tipo: "deduccion",
    });
  }

  // ¿Podría deducir intereses de vivienda?
  if (ded.interesesVivienda === 0 && cedulaGeneral.rentaLiquidaGravable > 0) {
    sugerencias.push({
      id: "intereses-vivienda",
      titulo: "Deducción por intereses de crédito hipotecario",
      descripcion: "Los intereses de crédito de vivienda son deducibles hasta 100 UVT mensuales (1,200 UVT/año).",
      ahorroPotencial: Math.round(Math.min(uvtToCOP(1_200, uvt), cedulaGeneral.rentaLiquidaGravable) * 0.19),
      articuloET: "119",
      tipo: "deduccion",
    });
  }

  // ¿Podría deducir medicina prepagada?
  if (ded.medicinaPrepagada === 0 && cedulaGeneral.rentaLiquidaGravable > 0) {
    sugerencias.push({
      id: "medicina-prepagada",
      titulo: "Deducción por medicina prepagada",
      descripcion: "Los aportes a planes de medicina prepagada son deducibles hasta 16 UVT mensuales.",
      ahorroPotencial: Math.round(Math.min(uvtToCOP(192, uvt), cedulaGeneral.rentaLiquidaGravable) * 0.19),
      articuloET: "387",
      tipo: "deduccion",
    });
  }

  return sugerencias;
}

// ── Función principal ────────────────────────────────────

export function calcularDeclaracion(state: DeclaracionState): ResultadoDeclaracion {
  const uvt = getUVT(state.perfil.anoGravable);

  const patrimonio = calcPatrimonio(state);
  const cedulaGeneral = calcCedulaGeneral(state, uvt);
  const cedulaPensiones = calcCedulaPensiones(state, uvt);
  const cedulaDividendos = calcCedulaDividendos(state, uvt);
  const gananciasOcasionales = calcGananciasOcasionales(state, uvt);
  const liquidacion = calcLiquidacion(
    cedulaGeneral,
    cedulaPensiones,
    cedulaDividendos,
    gananciasOcasionales,
    state,
    uvt
  );

  const { breakdown } = calcImpuestoTabla241(cedulaGeneral.rentaLiquidaGravableUVT, uvt);

  // Tasa efectiva global
  const totalIngresos =
    cedulaGeneral.ingresosBrutosTrabajo +
    cedulaGeneral.ingresosBrutosCapital +
    cedulaGeneral.ingresosBrutosNoLaborales +
    cedulaPensiones.ingresosBrutosPensiones +
    cedulaDividendos.subCedula1Total +
    cedulaDividendos.subCedula2Total +
    gananciasOcasionales.gananciasBrutas;

  const tasaEfectivaGlobal = totalIngresos > 0 ? liquidacion.impuestoRentaTotal / totalIngresos : 0;

  const sugerencias = calcSugerencias(state, cedulaGeneral, uvt);

  return {
    patrimonio,
    cedulaGeneral,
    cedulaPensiones,
    cedulaDividendos,
    gananciasOcasionales,
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
    razones.push(`Patrimonio bruto superior a 4.500 UVT (${Math.round(uvtToCOP(4_500, uvt)).toLocaleString("es-CO")} COP)`);
  }
  if (u.ingresoBruto > uvtToCOP(1_400, uvt)) {
    razones.push(`Ingresos brutos superiores a 1.400 UVT (${Math.round(uvtToCOP(1_400, uvt)).toLocaleString("es-CO")} COP)`);
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
