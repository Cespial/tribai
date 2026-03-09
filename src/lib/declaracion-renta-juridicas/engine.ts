/* ═══════════════════════════════════════════════════════════
   engine.ts — Motor de Cálculo Declaración de Renta
   Personas Jurídicas — Formulario 110 DIAN
   Art. 240, 147, 254-259, Ley 2277/2022
   ═══════════════════════════════════════════════════════════ */

import { UVT_VALUES } from "@/config/tax-data";
import {
  TTD_MIN_RATE,
  SOBRETASA_FINANCIERO_THRESHOLD_UVT,
} from "@/config/tax-data-corporativo";
import type {
  DeclaracionJuridicaState,
  TipoEntidad,
  ResultadoDeclaracionJuridica,
  ResultadoPatrimonioJuridico,
  ResultadoDepuracionRenta,
  ResultadoDividendosJuridicos,
  ResultadoGOJuridicas,
  ResultadoDescuentos,
  ResultadoTTD,
  ResultadoSobretasa,
  ResultadoLiquidacionJuridica,
} from "./types";

// ── Utilidades ─────────────────────────────────────────────

function clampMin(val: number, min: number): number {
  return Math.max(val, min);
}

function getUVT(anoGravable: number): number {
  return UVT_VALUES[anoGravable] ?? UVT_VALUES[2025] ?? 49_799;
}

function uvtToCOP(uvts: number, uvt: number): number {
  return uvts * uvt;
}

// ── Determinación de Tarifa ────────────────────────────────

export function determinarTarifa(
  tipo: TipoEntidad,
  porcentajeExportacion: number,
  anosZESE: number
): number {
  switch (tipo) {
    case "sociedad_nacional":
    case "extractivo":
    case "zona_franca_comercial":
      return 0.35;
    case "entidad_financiera":
      return 0.35; // Sobretasa se calcula aparte
    case "generador_hidroelectrico":
      return 0.35; // Sobretasa se calcula aparte
    case "zona_franca_industrial":
      // Post-2022: tarifa mixta basada en % exportación
      return 0.20 * porcentajeExportacion + 0.35 * (1 - porcentajeExportacion);
    case "zona_franca_pre2023":
      return 0.20;
    case "hotelero":
    case "editorial":
      return 0.15;
    case "zese":
      // Primeros 5 años: 0%, años 6-10: 50% de tarifa general
      if (anosZESE <= 5) return 0;
      if (anosZESE <= 10) return 0.175;
      return 0.35;
    case "zomac_micro_pequena":
      // AG 2025-2027: 50% de tarifa general
      return 0.175;
    case "zomac_mediana_grande":
      // AG 2022-2027: 75% de tarifa general
      return 0.2625;
    case "mega_inversion":
      return 0.27;
    case "regimen_especial":
      return 0.20;
    default:
      return 0.35;
  }
}

// ── Patrimonio (Casillas 33-43) ────────────────────────────

function calcPatrimonio(state: DeclaracionJuridicaState): ResultadoPatrimonioJuridico {
  const p = state.patrimonio;
  const patrimonioBruto =
    p.efectivoEquivalentes +
    p.inversionesFinancieras +
    p.cuentasPorCobrar +
    p.inventarios +
    p.activosIntangibles +
    p.activosBiologicos +
    p.ppePlantaEquipo +
    p.otrosActivos;

  return {
    patrimonioBruto,
    pasivos: p.pasivos,
    patrimonioLiquido: clampMin(patrimonioBruto - p.pasivos, 0),
  };
}

// ── Depuración de Renta (Casillas 44-73) ───────────────────

function calcDepuracionRenta(
  state: DeclaracionJuridicaState,
  _uvt: number
): ResultadoDepuracionRenta {
  const ing = state.ingresos;
  const cg = state.costosGastos;

  // Ingresos brutos (Cas 53)
  const ingresosBrutos =
    ing.ingresosOperacionales +
    ing.ingresosFinancieros +
    ing.dividendosSubcedula2 +
    ing.dividendosOtros +
    ing.dividendosTarifa27 +
    ing.ingresosGananciasOcasionales +
    ing.recuperacionDeducciones +
    ing.ingresosParticipaciones +
    ing.otrosIngresos;

  // Ingresos netos (Cas 56)
  const ingresosNetos = clampMin(
    ingresosBrutos - ing.devolucionesDescuentos - ing.ingresosNoCRNGO,
    0
  );

  // Total costos y gastos (Cas 62)
  const totalCostosGastos =
    cg.costos +
    cg.gastosAdministracion +
    cg.gastosVentas +
    cg.gastosFinancieros +
    cg.otrosGastosDeducciones;

  // Renta líquida ordinaria o pérdida (Cas 65-66)
  const rentaLiquidaOrdinaria = clampMin(ingresosNetos - totalCostosGastos, 0);
  const perdidaLiquida = clampMin(totalCostosGastos - ingresosNetos, 0);

  // Compensación de pérdidas (Cas 67, Art. 147 — max 12 años)
  let compensacionPerdidas = 0;
  if (rentaLiquidaOrdinaria > 0) {
    let rentaDisponible = rentaLiquidaOrdinaria;
    for (const perdida of state.compensacion.perdidasAnteriores) {
      if (rentaDisponible <= 0) break;
      const compensable = Math.min(perdida.montoDisponible, rentaDisponible);
      compensacionPerdidas += compensable;
      rentaDisponible -= compensable;
    }
    // Exceso renta presuntiva anterior
    if (rentaDisponible > 0 && state.compensacion.excesoRentaPresuntivaAnterior > 0) {
      const comp = Math.min(state.compensacion.excesoRentaPresuntivaAnterior, rentaDisponible);
      compensacionPerdidas += comp;
    }
  }

  // Renta líquida (Cas 68)
  const rentaLiquida = clampMin(rentaLiquidaOrdinaria - compensacionPerdidas, 0);

  // Renta presuntiva (Cas 69) — 0% desde AG 2021
  const rentaPresuntiva = 0;

  // Renta líquida gravable base (Cas 70) = mayor entre renta líquida y presuntiva
  const rentaLiquidaGravableBase = Math.max(rentaLiquida, rentaPresuntiva);

  // Rentas exentas (Cas 71)
  const re = state.rentasExentas;
  const rentasExentas =
    re.hoteleroTurismo +
    re.energiaRenovable +
    re.viviendaVISVIP +
    re.plantacionesForestales +
    re.reservasPensiones +
    re.creacionesLiterarias +
    re.cinematografia +
    re.conveniosCDI +
    re.otrasRentasExentas;

  // Rentas gravables (Cas 72) — rentas que se adicionan
  const rentasGravables = 0; // Simplificado — se puede expandir

  // Renta líquida gravable final (Cas 73)
  const rentaLiquidaGravable = clampMin(
    rentaLiquidaGravableBase - rentasExentas + rentasGravables,
    0
  );

  return {
    ingresosBrutos,
    devolucionesDescuentos: ing.devolucionesDescuentos,
    incrngo: ing.ingresosNoCRNGO,
    ingresosNetos,
    totalCostosGastos,
    rentaLiquidaOrdinaria,
    perdidaLiquida,
    compensacionPerdidas,
    rentaLiquida,
    rentaPresuntiva,
    rentaLiquidaGravableBase,
    rentasExentas,
    rentasGravables,
    rentaLiquidaGravable,
  };
}

// ── Dividendos Jurídicos (Casillas 74-77, 83-86) ──────────

function calcDividendos(state: DeclaracionJuridicaState): ResultadoDividendosJuridicos {
  const ing = state.ingresos;

  // Dividendos ya vienen clasificados por casilla
  const dividendosTarifa5 = 0; // Simplificado
  const dividendosTarifa35 = ing.dividendosSubcedula2;
  const dividendosTarifa33 = 0; // Simplificado
  const dividendosTarifa27 = ing.dividendosTarifa27;

  return {
    dividendosTarifa5,
    dividendosTarifa35,
    dividendosTarifa33,
    dividendosTarifa27,
    impuestoDividendos5: Math.round(dividendosTarifa5 * 0.05),
    impuestoDividendos35: Math.round(dividendosTarifa35 * 0.35),
    impuestoDividendos33: Math.round(dividendosTarifa33 * 0.33),
    impuestoDividendos27: Math.round(dividendosTarifa27 * 0.27),
  };
}

// ── Ganancias Ocasionales (Casillas 78-81, 90) ─────────────

function calcGananciasOcasionales(state: DeclaracionJuridicaState): ResultadoGOJuridicas {
  const go = state.gananciasOcasionales;
  const gravables = clampMin(go.ingresos - go.costos - go.noGravadasExentas, 0);

  return {
    ingresos: go.ingresos,
    costos: go.costos,
    exentas: go.noGravadasExentas,
    gravables,
    impuesto: Math.round(gravables * 0.15), // Art. 313 ET — 15% para sociedades
  };
}

// ── Descuentos Tributarios (Arts. 254-258) ──────────────────

function calcDescuentos(
  state: DeclaracionJuridicaState,
  impuestoACargo: number
): ResultadoDescuentos {
  const d = state.descuentos;

  // Art. 254 — impuestos pagados en el exterior (sin límite combinado Art. 258)
  const impuestosPagadosExterior = Math.min(d.impuestosPagadosExterior, impuestoACargo);

  // Art. 255 — medio ambiente (25% de la inversión)
  const medioAmbiente = Math.round(d.inversionesMedioAmbiente * 0.25);

  // Art. 256 — I+D+i (30% de la inversión)
  const iDMasI = Math.round(d.investigacionDesarrollo * 0.30);

  // Art. 257 — donaciones (25% estándar)
  const donacionesEstandar = Math.round(d.donacionesEntidadesEspeciales * 0.25);

  // Art. 257 par. 1 — donaciones bancos alimentos (37%)
  const donacionesAlimentos = Math.round(d.donacionesBancosAlimentos * 0.37);
  const donaciones = donacionesEstandar + donacionesAlimentos;

  // Art. 258-1 — IVA activos capital (100%)
  const ivaActivos = d.ivaActivosCapital;

  const otrosDescuentos = d.otrosDescuentos;

  // Límite combinado Art. 258: Arts. 255 + 256 + 257 ≤ 25% del impuesto a cargo
  const sumaSujetaLimite = medioAmbiente + iDMasI + donaciones;
  const limiteCombinadoMax = Math.round(impuestoACargo * 0.25);
  let limitado = false;

  let descuentoLimitado = sumaSujetaLimite;
  if (sumaSujetaLimite > limiteCombinadoMax) {
    descuentoLimitado = limiteCombinadoMax;
    limitado = true;
  }

  // Total descuentos = exterior + limitados + IVA + otros
  // Art. 259: total descuentos no pueden exceder el impuesto básico de renta
  const totalBruto = impuestosPagadosExterior + descuentoLimitado + ivaActivos + otrosDescuentos;
  const totalDescuentos = Math.min(totalBruto, impuestoACargo);

  return {
    impuestosPagadosExterior,
    donaciones: limitado
      ? Math.round(donaciones * (limiteCombinadoMax / sumaSujetaLimite))
      : donaciones,
    iDMasI: limitado
      ? Math.round(iDMasI * (limiteCombinadoMax / sumaSujetaLimite))
      : iDMasI,
    medioAmbiente: limitado
      ? Math.round(medioAmbiente * (limiteCombinadoMax / sumaSujetaLimite))
      : medioAmbiente,
    ivaActivos,
    otrosDescuentos,
    totalDescuentos,
    limitado,
  };
}

// ── TTD — Tasa de Tributación Depurada (Art. 240 Par. 6) ───

function calcTTD(
  state: DeclaracionJuridicaState,
  impuestoNetoRenta: number,
  descuentosExterior: number
): ResultadoTTD {
  const tipo = state.perfil.tipoEntidad;

  // Entidades excluidas del TTD
  const excluidos: TipoEntidad[] = [
    "zese",
    "zomac_micro_pequena",
    "zomac_mediana_grande",
    "hotelero",
    "editorial",
    "regimen_especial",
  ];
  if (excluidos.includes(tipo)) {
    return {
      impuestoDepurado: 0,
      utilidadDepurada: 0,
      tasaTributacionDepurada: 0,
      impuestoAdicionar: 0,
      aplica: false,
      excluido: true,
    };
  }

  const ttd = state.ttdInputs;

  // Impuesto Depurado (ID) = INR - DTC - IRP
  const impuestoDepurado = clampMin(impuestoNetoRenta - descuentosExterior, 0);

  // Utilidad Depurada (UD)
  const utilidadDepurada =
    ttd.utilidadContableAntesImpuestos +
    ttd.diferenciasPermAumentanRenta -
    ttd.incrngoAfectanUtilidad -
    ttd.valorMetodoParticipacion +
    ttd.valorNetoGOAfectanUtilidad -
    ttd.rentasExentasCDI +
    ttd.compensacionNoAfectaUtilidad;

  // Si UD ≤ 0, no aplica (resultado contable negativo)
  if (utilidadDepurada <= 0) {
    return {
      impuestoDepurado,
      utilidadDepurada,
      tasaTributacionDepurada: 0,
      impuestoAdicionar: 0,
      aplica: false,
      excluido: false,
    };
  }

  // TTD = ID / UD
  const tasaTributacionDepurada = impuestoDepurado / utilidadDepurada;

  // Si TTD ≥ 15%, no se adiciona nada
  if (tasaTributacionDepurada >= TTD_MIN_RATE) {
    return {
      impuestoDepurado,
      utilidadDepurada,
      tasaTributacionDepurada,
      impuestoAdicionar: 0,
      aplica: true,
      excluido: false,
    };
  }

  // IA = (UD × 15%) - ID
  const impuestoAdicionar = Math.round(utilidadDepurada * TTD_MIN_RATE - impuestoDepurado);

  return {
    impuestoDepurado,
    utilidadDepurada,
    tasaTributacionDepurada,
    impuestoAdicionar: clampMin(impuestoAdicionar, 0),
    aplica: true,
    excluido: false,
  };
}

// ── Sobretasa (Art. 240 Par. 3 y 4) ────────────────────────

function calcSobretasa(
  state: DeclaracionJuridicaState,
  rentaLiquidaGravable: number,
  uvt: number
): ResultadoSobretasa {
  const tipo = state.perfil.tipoEntidad;

  // Sobretasa sector financiero: +5% si renta ≥ 120,000 UVT
  if (tipo === "entidad_financiera") {
    const umbral = uvtToCOP(SOBRETASA_FINANCIERO_THRESHOLD_UVT, uvt);
    if (rentaLiquidaGravable >= umbral) {
      return {
        aplica: true,
        tasa: 0.05,
        impuestoSobretasa: Math.round(rentaLiquidaGravable * 0.05),
      };
    }
  }

  // Sobretasa generación hidroeléctrica: +3% si renta ≥ 30,000 UVT
  if (tipo === "generador_hidroelectrico") {
    const umbral = uvtToCOP(30_000, uvt);
    if (rentaLiquidaGravable >= umbral) {
      return {
        aplica: true,
        tasa: 0.03,
        impuestoSobretasa: Math.round(rentaLiquidaGravable * 0.03),
      };
    }
  }

  return { aplica: false, tasa: 0, impuestoSobretasa: 0 };
}

// ── Liquidación Final (Casillas 82-103) ────────────────────

function calcLiquidacion(
  depuracion: ResultadoDepuracionRenta,
  dividendos: ResultadoDividendosJuridicos,
  go: ResultadoGOJuridicas,
  descuentosResult: ResultadoDescuentos,
  ttdResult: ResultadoTTD,
  sobretasaResult: ResultadoSobretasa,
  state: DeclaracionJuridicaState,
  tarifa: number
): ResultadoLiquidacionJuridica {
  const ret = state.retenciones;

  // Cas 82: Impuesto sobre renta líquida gravable
  const impuestoRentaLiquidaGravable = Math.round(depuracion.rentaLiquidaGravable * tarifa);

  // Cas 83-86: Impuestos sobre dividendos
  const impuestoDividendosTotal =
    dividendos.impuestoDividendos5 +
    dividendos.impuestoDividendos35 +
    dividendos.impuestoDividendos33 +
    dividendos.impuestoDividendos27;

  // Cas 87: Total impuesto rentas líquidas
  const totalImpuestoRentasLiquidas = impuestoRentaLiquidaGravable + impuestoDividendosTotal;

  // Cas 88: Total descuentos
  const totalDescuentos = descuentosResult.totalDescuentos;

  // Cas 89: Impuesto neto de renta
  const impuestoNetoRenta = clampMin(totalImpuestoRentasLiquidas - totalDescuentos, 0);

  // Cas 90: Impuesto ganancias ocasionales
  const impuestoGananciasOcasionales = go.impuesto;

  // Cas 91: Descuento GO exterior
  const descuentoGOExterior = 0; // Simplificado

  // Cas 92: Total impuesto a cargo (antes de TTD)
  let totalImpuestoCargo = clampMin(
    impuestoNetoRenta + impuestoGananciasOcasionales - descuentoGOExterior,
    0
  );

  // Adicionar TTD si aplica
  totalImpuestoCargo += ttdResult.impuestoAdicionar;

  // Cas 93-94: Anticipos y saldos anteriores
  const anticipoAnterior = ret.anticipoAnoAnterior;
  const saldoFavorAnterior = ret.saldoFavorAnterior;

  // Cas 97: Total retenciones
  const totalRetenciones = ret.autorretenciones + ret.otrasRetenciones;

  // Cas 98: Anticipo siguiente año (Art. 807-810)
  const anos = state.perfil.anosDeclarando;
  let anticipoRate: number;
  if (anos <= 1) anticipoRate = 0.25;
  else if (anos === 2) anticipoRate = 0.50;
  else anticipoRate = 0.75;
  const anticipoSiguienteAno = Math.round(impuestoNetoRenta * anticipoRate);

  // Cas 99: Sobretasa
  const sobretasa = sobretasaResult.impuestoSobretasa;

  // Cas 100: Saldo a pagar
  const totalAPagar =
    totalImpuestoCargo + anticipoSiguienteAno + sobretasa -
    anticipoAnterior - saldoFavorAnterior - totalRetenciones;

  const saldoPagar = clampMin(totalAPagar, 0);

  // Cas 103: Total saldo a favor
  const totalSaldoFavor = clampMin(-totalAPagar, 0);

  return {
    impuestoRentaLiquidaGravable,
    impuestoDividendosTotal,
    totalImpuestoRentasLiquidas,
    totalDescuentos,
    impuestoNetoRenta,
    impuestoGananciasOcasionales,
    descuentoGOExterior,
    totalImpuestoCargo,
    anticipoAnterior,
    saldoFavorAnterior,
    totalRetenciones,
    anticipoSiguienteAno,
    sobretasa,
    saldoPagar,
    sanciones: 0,
    totalSaldoPagar: saldoPagar,
    totalSaldoFavor,
  };
}

// ── Función Principal ──────────────────────────────────────

export function calcularDeclaracionJuridica(
  state: DeclaracionJuridicaState
): ResultadoDeclaracionJuridica {
  const uvt = getUVT(state.perfil.anoGravable);

  // 1. Determinar tarifa aplicable
  const tarifa = determinarTarifa(
    state.perfil.tipoEntidad,
    state.perfil.porcentajeExportacion,
    state.perfil.anosZESE
  );

  // 2. Patrimonio
  const patrimonio = calcPatrimonio(state);

  // 3. Depuración de renta
  const depuracion = calcDepuracionRenta(state, uvt);

  // 4. Dividendos
  const dividendos = calcDividendos(state);

  // 5. Ganancias ocasionales
  const gananciasOcasionales = calcGananciasOcasionales(state);

  // 6. Impuesto bruto para calcular descuentos
  const impuestoBruto = Math.round(depuracion.rentaLiquidaGravable * tarifa) +
    dividendos.impuestoDividendos5 +
    dividendos.impuestoDividendos35 +
    dividendos.impuestoDividendos33 +
    dividendos.impuestoDividendos27;

  // 7. Descuentos tributarios
  const descuentos = calcDescuentos(state, impuestoBruto);

  // 8. Impuesto neto para TTD
  const impuestoNetoParaTTD = clampMin(impuestoBruto - descuentos.totalDescuentos, 0);

  // 9. TTD
  const ttd = calcTTD(state, impuestoNetoParaTTD, descuentos.impuestosPagadosExterior);

  // 10. Sobretasa
  const sobretasa = calcSobretasa(state, depuracion.rentaLiquidaGravable, uvt);

  // 11. Liquidación final
  const liquidacion = calcLiquidacion(
    depuracion,
    dividendos,
    gananciasOcasionales,
    descuentos,
    ttd,
    sobretasa,
    state,
    tarifa
  );

  // 12. Tasa efectiva
  const totalIngresos = depuracion.ingresosBrutos + gananciasOcasionales.ingresos;
  const tasaEfectiva = totalIngresos > 0
    ? liquidacion.totalImpuestoCargo / totalIngresos
    : 0;

  return {
    patrimonio,
    depuracion,
    dividendos,
    gananciasOcasionales,
    descuentos,
    ttd,
    sobretasa,
    liquidacion,
    tarifaAplicada: tarifa,
    tasaEfectiva,
  };
}
