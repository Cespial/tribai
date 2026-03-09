/* ═══════════════════════════════════════════════════════════
   engine.test.ts — 220+ test cases for Declaración de Renta
   Covers: Art. 241, Art. 242, Patrimonio, Cédulas, Deducciones,
   Ganancias Ocasionales, Liquidación, Umbrales, Edge Cases
   ═══════════════════════════════════════════════════════════ */

import {
  calcularDeclaracion,
  verificarObligacionDeclarar,
} from "../engine";
import {
  type DeclaracionState,
  INITIAL_STATE,
  DEFAULT_PERFIL,
  DEFAULT_UMBRALES,
  DEFAULT_PATRIMONIO,
  DEFAULT_RENTAS_TRABAJO,
  DEFAULT_RENTAS_CAPITAL,
  DEFAULT_RENTAS_NO_LABORALES,
  DEFAULT_DEDUCCIONES,
  DEFAULT_CEDULA_PENSIONES,
  DEFAULT_CEDULA_DIVIDENDOS,
  DEFAULT_GANANCIAS_OCASIONALES,
  DEFAULT_RETENCIONES_ANTICIPOS,
} from "../types";

// ── Test infrastructure ──────────────────────────────────

const UVT_2025 = 49_799;
let passed = 0;
let failed = 0;
const failures: string[] = [];

function makeState(overrides: Partial<DeclaracionState> = {}): DeclaracionState {
  return { ...INITIAL_STATE, ...overrides };
}

function assert(condition: boolean, name: string, detail?: string) {
  if (condition) {
    passed++;
  } else {
    failed++;
    const msg = detail ? `FAIL: ${name} — ${detail}` : `FAIL: ${name}`;
    failures.push(msg);
    console.error(msg);
  }
}

function assertApprox(actual: number, expected: number, tolerance: number, name: string) {
  const diff = Math.abs(actual - expected);
  assert(
    diff <= tolerance,
    name,
    `expected ≈${expected}, got ${actual} (diff=${diff}, tol=${tolerance})`
  );
}

function assertRange(actual: number, min: number, max: number, name: string) {
  assert(
    actual >= min && actual <= max,
    name,
    `expected ${min}–${max}, got ${actual}`
  );
}

// ══════════════════════════════════════════════════════════
// SECTION 1: INITIAL STATE (5 tests)
// ══════════════════════════════════════════════════════════

function testInitialState() {
  const r = calcularDeclaracion(INITIAL_STATE);

  assert(r.patrimonio.patrimonioBruto === 0, "T001: initial patrimonio bruto = 0");
  assert(r.cedulaGeneral.impuestoCedulaGeneral === 0, "T002: initial impuesto general = 0");
  assert(r.liquidacion.saldoPagar === 0, "T003: initial saldo a pagar = 0");
  assert(r.liquidacion.saldoFavor === 0, "T004: initial saldo a favor = 0");
  assert(r.tasaEfectivaGlobal === 0, "T005: initial tasa efectiva = 0");
}

// ══════════════════════════════════════════════════════════
// SECTION 2: ART. 241 — TAX BRACKETS (25 tests)
// ══════════════════════════════════════════════════════════

function testArt241Brackets() {
  // Helper: only work income, no deductions/exemptions
  function stateWithIncome(incomeCOP: number): DeclaracionState {
    return makeState({
      rentasTrabajo: { ...DEFAULT_RENTAS_TRABAJO, salariosYPagosLaborales: incomeCOP },
      deducciones: { ...DEFAULT_DEDUCCIONES, exenta25Porciento: false },
    });
  }

  // T006: 0 income → 0 tax
  let r = calcularDeclaracion(stateWithIncome(0));
  assert(r.cedulaGeneral.impuestoCedulaGeneral === 0, "T006: 0 income → 0 tax");

  // T007: Income exactly at 1,090 UVT boundary → 0 tax
  r = calcularDeclaracion(stateWithIncome(1_090 * UVT_2025));
  assert(r.cedulaGeneral.impuestoCedulaGeneral === 0, "T007: 1090 UVT → 0 tax");

  // T008: 1 UVT above first bracket → 19% marginal on 1 UVT
  r = calcularDeclaracion(stateWithIncome(1_091 * UVT_2025));
  const expected1091 = Math.round(1 * 0.19 * UVT_2025);
  assertApprox(r.cedulaGeneral.impuestoCedulaGeneral, expected1091, 2, "T008: 1091 UVT → 19% on 1 UVT");

  // T009: Exactly 1,700 UVT → 610 * 0.19 = 115.9 UVT tax
  r = calcularDeclaracion(stateWithIncome(1_700 * UVT_2025));
  const expected1700 = Math.round(610 * 0.19 * UVT_2025);
  assertApprox(r.cedulaGeneral.impuestoCedulaGeneral, expected1700, 2, "T009: 1700 UVT tax");

  // T010: 2,000 UVT → 610*0.19 + 300*0.28 = 115.9 + 84 = 199.9 UVT
  r = calcularDeclaracion(stateWithIncome(2_000 * UVT_2025));
  const expected2000 = Math.round((610 * 0.19 + 300 * 0.28) * UVT_2025);
  assertApprox(r.cedulaGeneral.impuestoCedulaGeneral, expected2000, 2, "T010: 2000 UVT tax");

  // T011: Exactly 4,100 UVT → base 788 UVT
  r = calcularDeclaracion(stateWithIncome(4_100 * UVT_2025));
  const expected4100 = Math.round((610 * 0.19 + 2400 * 0.28) * UVT_2025);
  assertApprox(r.cedulaGeneral.impuestoCedulaGeneral, expected4100, 2, "T011: 4100 UVT tax");

  // T012: 5,000 UVT → 788 + 900*0.33
  r = calcularDeclaracion(stateWithIncome(5_000 * UVT_2025));
  const expected5000 = Math.round((610 * 0.19 + 2400 * 0.28 + 900 * 0.33) * UVT_2025);
  assertApprox(r.cedulaGeneral.impuestoCedulaGeneral, expected5000, 2, "T012: 5000 UVT tax");

  // T013: Exactly 8,670 UVT → base 2,296 UVT
  r = calcularDeclaracion(stateWithIncome(8_670 * UVT_2025));
  const expected8670 = Math.round((610 * 0.19 + 2400 * 0.28 + 4570 * 0.33) * UVT_2025);
  assertApprox(r.cedulaGeneral.impuestoCedulaGeneral, expected8670, 2, "T013: 8670 UVT tax");

  // T014: 10,000 UVT → 2296 + 1330*0.35
  r = calcularDeclaracion(stateWithIncome(10_000 * UVT_2025));
  const expected10000 = Math.round((610 * 0.19 + 2400 * 0.28 + 4570 * 0.33 + 1330 * 0.35) * UVT_2025);
  assertApprox(r.cedulaGeneral.impuestoCedulaGeneral, expected10000, 2, "T014: 10000 UVT tax");

  // T015: Exactly 18,970 UVT → base 5,901 UVT
  r = calcularDeclaracion(stateWithIncome(18_970 * UVT_2025));
  const expected18970 = Math.round(
    (610 * 0.19 + 2400 * 0.28 + 4570 * 0.33 + 10300 * 0.35) * UVT_2025
  );
  assertApprox(r.cedulaGeneral.impuestoCedulaGeneral, expected18970, 2, "T015: 18970 UVT tax");

  // T016: 25,000 UVT → 5901 + 6030*0.37
  r = calcularDeclaracion(stateWithIncome(25_000 * UVT_2025));
  const expected25000 = Math.round(
    (610 * 0.19 + 2400 * 0.28 + 4570 * 0.33 + 10300 * 0.35 + 6030 * 0.37) * UVT_2025
  );
  assertApprox(r.cedulaGeneral.impuestoCedulaGeneral, expected25000, 2, "T016: 25000 UVT tax");

  // T017: Exactly 31,000 UVT → base 10,352 UVT
  r = calcularDeclaracion(stateWithIncome(31_000 * UVT_2025));
  const expected31000 = Math.round(
    (610 * 0.19 + 2400 * 0.28 + 4570 * 0.33 + 10300 * 0.35 + 12030 * 0.37) * UVT_2025
  );
  assertApprox(r.cedulaGeneral.impuestoCedulaGeneral, expected31000, 2, "T017: 31000 UVT tax");

  // T018: 40,000 UVT → 10352 + 9000*0.39
  r = calcularDeclaracion(stateWithIncome(40_000 * UVT_2025));
  const expected40000 = Math.round(
    (610 * 0.19 + 2400 * 0.28 + 4570 * 0.33 + 10300 * 0.35 + 12030 * 0.37 + 9000 * 0.39) *
      UVT_2025
  );
  assertApprox(r.cedulaGeneral.impuestoCedulaGeneral, expected40000, 2, "T018: 40000 UVT tax");

  // T019: Tax is always non-negative
  r = calcularDeclaracion(stateWithIncome(1));
  assert(r.cedulaGeneral.impuestoCedulaGeneral >= 0, "T019: tax >= 0 for tiny income");

  // T020: Very large income → tax < income
  r = calcularDeclaracion(stateWithIncome(100_000 * UVT_2025));
  assert(
    r.cedulaGeneral.impuestoCedulaGeneral < 100_000 * UVT_2025,
    "T020: tax < income for 100k UVT"
  );

  // T021: Effective rate approaches 39% asymptotically
  r = calcularDeclaracion(stateWithIncome(1_000_000 * UVT_2025));
  const effectiveRate = r.cedulaGeneral.impuestoCedulaGeneral / (1_000_000 * UVT_2025);
  assert(effectiveRate > 0.38 && effectiveRate < 0.39, "T021: effective rate → ~39% at extreme");

  // T022: Monotonically increasing — more income = more tax
  const tax500 = calcularDeclaracion(stateWithIncome(500 * UVT_2025)).cedulaGeneral.impuestoCedulaGeneral;
  const tax1500 = calcularDeclaracion(stateWithIncome(1500 * UVT_2025)).cedulaGeneral.impuestoCedulaGeneral;
  const tax5000t = calcularDeclaracion(stateWithIncome(5000 * UVT_2025)).cedulaGeneral.impuestoCedulaGeneral;
  assert(tax500 <= tax1500, "T022a: tax(500) <= tax(1500)");
  assert(tax1500 <= tax5000t, "T022b: tax(1500) <= tax(5000)");

  // T023-T025: Breakdown has correct number of ranges
  r = calcularDeclaracion(stateWithIncome(500 * UVT_2025));
  // The 0% bracket still generates an entry with impuesto=0
  assert(r.breakdown.length === 1 && r.breakdown[0].rate === 0, "T023: 500 UVT → 1 bracket entry (0% rate)");

  r = calcularDeclaracion(stateWithIncome(1500 * UVT_2025));
  assert(r.breakdown.length === 2, "T024: 1500 UVT → 2 brackets");

  r = calcularDeclaracion(stateWithIncome(50_000 * UVT_2025));
  assert(r.breakdown.length === 7, "T025: 50000 UVT → 7 brackets");

  // T026-T030: Breakdown sums equal total
  r = calcularDeclaracion(stateWithIncome(3000 * UVT_2025));
  const breakdownSum = r.breakdown.reduce((s, b) => s + b.impuestoCOP, 0);
  assertApprox(
    breakdownSum,
    r.cedulaGeneral.impuestoCedulaGeneral,
    5,
    "T026: breakdown COP sum ≈ total"
  );

  // Verify each bracket rate matches expected
  r = calcularDeclaracion(stateWithIncome(50_000 * UVT_2025));
  assert(r.breakdown[0].rate === 0, "T027: bracket 1 rate = 0%");
  assert(r.breakdown[1].rate === 0.19, "T028: bracket 2 rate = 19%");
  assert(r.breakdown[2].rate === 0.28, "T029: bracket 3 rate = 28%");
  assert(r.breakdown[6].rate === 0.39, "T030: bracket 7 rate = 39%");
}

// ══════════════════════════════════════════════════════════
// SECTION 3: PATRIMONIO (12 tests)
// ══════════════════════════════════════════════════════════

function testPatrimonio() {
  // T031: Empty patrimonio
  let r = calcularDeclaracion(INITIAL_STATE);
  assert(r.patrimonio.patrimonioBruto === 0, "T031: empty bienes = 0 bruto");
  assert(r.patrimonio.patrimonioLiquido === 0, "T032: empty = 0 liquido");

  // T033: Single bien
  let s = makeState({
    patrimonio: {
      bienes: [{ id: "1", tipo: "inmueble", descripcion: "Casa", valorFiscal: 500_000_000, pais: "colombia" }],
      deudas: [],
    },
  });
  r = calcularDeclaracion(s);
  assert(r.patrimonio.patrimonioBruto === 500_000_000, "T033: single bien = 500M");
  assert(r.patrimonio.patrimonioLiquido === 500_000_000, "T034: no deudas → liquido = bruto");

  // T035: Multiple bienes
  s = makeState({
    patrimonio: {
      bienes: [
        { id: "1", tipo: "inmueble", descripcion: "Casa", valorFiscal: 300_000_000, pais: "colombia" },
        { id: "2", tipo: "vehiculo", descripcion: "Carro", valorFiscal: 80_000_000, pais: "colombia" },
        { id: "3", tipo: "inversion", descripcion: "CDT", valorFiscal: 50_000_000, pais: "colombia" },
      ],
      deudas: [],
    },
  });
  r = calcularDeclaracion(s);
  assert(r.patrimonio.patrimonioBruto === 430_000_000, "T035: sum of 3 bienes");

  // T036: Deudas reduce patrimonio
  s = makeState({
    patrimonio: {
      bienes: [{ id: "1", tipo: "inmueble", descripcion: "Casa", valorFiscal: 500_000_000, pais: "colombia" }],
      deudas: [{ id: "d1", tipo: "hipoteca", descripcion: "Hipoteca", saldoDiciembre31: 200_000_000 }],
    },
  });
  r = calcularDeclaracion(s);
  assert(r.patrimonio.deudasTotal === 200_000_000, "T036: deudas = 200M");
  assert(r.patrimonio.patrimonioLiquido === 300_000_000, "T037: liquido = 300M");

  // T038: Deudas > bienes → liquido = 0 (clamped)
  s = makeState({
    patrimonio: {
      bienes: [{ id: "1", tipo: "inmueble", descripcion: "Casa", valorFiscal: 100_000_000, pais: "colombia" }],
      deudas: [{ id: "d1", tipo: "credito", descripcion: "Crédito", saldoDiciembre31: 200_000_000 }],
    },
  });
  r = calcularDeclaracion(s);
  assert(r.patrimonio.patrimonioLiquido === 0, "T038: deudas > bienes → liquido = 0");

  // T039: Multiple deudas
  s = makeState({
    patrimonio: {
      bienes: [{ id: "1", tipo: "inmueble", descripcion: "Casa", valorFiscal: 500_000_000, pais: "colombia" }],
      deudas: [
        { id: "d1", tipo: "hipoteca", descripcion: "Hipoteca", saldoDiciembre31: 100_000_000 },
        { id: "d2", tipo: "tarjeta_credito", descripcion: "TC", saldoDiciembre31: 5_000_000 },
      ],
    },
  });
  r = calcularDeclaracion(s);
  assert(r.patrimonio.deudasTotal === 105_000_000, "T039: sum of deudas");
  assert(r.patrimonio.patrimonioLiquido === 395_000_000, "T040: liquido after deudas");

  // T041: Exterior bienes
  s = makeState({
    patrimonio: {
      bienes: [{ id: "1", tipo: "inversion", descripcion: "Stocks", valorFiscal: 200_000_000, pais: "exterior" }],
      deudas: [],
    },
  });
  r = calcularDeclaracion(s);
  assert(r.patrimonio.patrimonioBruto === 200_000_000, "T041: exterior bienes counted");

  // T042: Zero-value bien
  s = makeState({
    patrimonio: {
      bienes: [{ id: "1", tipo: "otro_bien", descripcion: "N/A", valorFiscal: 0, pais: "colombia" }],
      deudas: [],
    },
  });
  r = calcularDeclaracion(s);
  assert(r.patrimonio.patrimonioBruto === 0, "T042: zero-value bien = 0");
}

// ══════════════════════════════════════════════════════════
// SECTION 4: CÉDULA GENERAL — RENTAS DE TRABAJO (15 tests)
// ══════════════════════════════════════════════════════════

function testRentasTrabajo() {
  // T043: Only salarios
  let s = makeState({
    rentasTrabajo: { ...DEFAULT_RENTAS_TRABAJO, salariosYPagosLaborales: 60_000_000 },
    deducciones: { ...DEFAULT_DEDUCCIONES, exenta25Porciento: false },
  });
  let r = calcularDeclaracion(s);
  assert(r.cedulaGeneral.ingresosBrutosTrabajo === 60_000_000, "T043: brutos = salarios");
  assert(r.cedulaGeneral.rentaLiquidaTrabajo === 60_000_000, "T044: no INCR → liquida = brutos");

  // T045: Salarios + honorarios
  s = makeState({
    rentasTrabajo: {
      ...DEFAULT_RENTAS_TRABAJO,
      salariosYPagosLaborales: 60_000_000,
      honorariosServicios: 20_000_000,
    },
    deducciones: { ...DEFAULT_DEDUCCIONES, exenta25Porciento: false },
  });
  r = calcularDeclaracion(s);
  assert(r.cedulaGeneral.ingresosBrutosTrabajo === 80_000_000, "T045: brutos = salarios + honorarios");

  // T046: INCR deductions
  s = makeState({
    rentasTrabajo: {
      ...DEFAULT_RENTAS_TRABAJO,
      salariosYPagosLaborales: 100_000_000,
      aportesObligatoriosSalud: 4_000_000,
      aportesObligatoriosPension: 4_000_000,
    },
    deducciones: { ...DEFAULT_DEDUCCIONES, exenta25Porciento: false },
  });
  r = calcularDeclaracion(s);
  assert(r.cedulaGeneral.INCRTrabajo === 8_000_000, "T046: INCR = salud + pension");
  assert(r.cedulaGeneral.rentaLiquidaTrabajo === 92_000_000, "T047: liquida = 100M - 8M");

  // T048: INCR > income → clamped to 0
  s = makeState({
    rentasTrabajo: {
      ...DEFAULT_RENTAS_TRABAJO,
      salariosYPagosLaborales: 10_000_000,
      aportesObligatoriosSalud: 6_000_000,
      aportesObligatoriosPension: 6_000_000,
    },
    deducciones: { ...DEFAULT_DEDUCCIONES, exenta25Porciento: false },
  });
  r = calcularDeclaracion(s);
  assert(r.cedulaGeneral.rentaLiquidaTrabajo === 0, "T048: INCR > income → 0");

  // T049: All INCR types
  s = makeState({
    rentasTrabajo: {
      salariosYPagosLaborales: 200_000_000,
      honorariosServicios: 0,
      otrosIngresosTrabajo: 0,
      aportesObligatoriosSalud: 8_000_000,
      aportesObligatoriosPension: 8_000_000,
      aportesVoluntariosPension: 5_000_000,
      fondoSolidaridad: 2_000_000,
      otrosINCR: 1_000_000,
    },
    deducciones: { ...DEFAULT_DEDUCCIONES, exenta25Porciento: false },
  });
  r = calcularDeclaracion(s);
  assert(r.cedulaGeneral.INCRTrabajo === 24_000_000, "T049: all INCR types summed");
  assert(r.cedulaGeneral.rentaLiquidaTrabajo === 176_000_000, "T050: 200M - 24M");

  // T051-T053: Multiple income streams combine
  s = makeState({
    rentasTrabajo: {
      ...DEFAULT_RENTAS_TRABAJO,
      salariosYPagosLaborales: 50_000_000,
      honorariosServicios: 30_000_000,
      otrosIngresosTrabajo: 20_000_000,
    },
    deducciones: { ...DEFAULT_DEDUCCIONES, exenta25Porciento: false },
  });
  r = calcularDeclaracion(s);
  assert(r.cedulaGeneral.ingresosBrutosTrabajo === 100_000_000, "T051: 3 income streams sum");

  // T052-T053: Capital income
  s = makeState({
    rentasCapital: {
      ...DEFAULT_RENTAS_CAPITAL,
      interesesRendimientos: 10_000_000,
      arrendamientos: 24_000_000,
    },
    deducciones: { ...DEFAULT_DEDUCCIONES, exenta25Porciento: false },
  });
  r = calcularDeclaracion(s);
  assert(r.cedulaGeneral.ingresosBrutosCapital === 34_000_000, "T052: capital brutos");
  assert(r.cedulaGeneral.rentaLiquidaCapital === 34_000_000, "T053: capital liquida no costs");

  // T054: Capital with costs
  s = makeState({
    rentasCapital: {
      interesesRendimientos: 10_000_000,
      arrendamientos: 24_000_000,
      regalias: 0,
      otrosIngresosCapital: 0,
      costosGastosCapital: 5_000_000,
      INCRCapital: 2_000_000,
    },
    deducciones: { ...DEFAULT_DEDUCCIONES, exenta25Porciento: false },
  });
  r = calcularDeclaracion(s);
  assert(r.cedulaGeneral.rentaLiquidaCapital === 27_000_000, "T054: capital - costs - INCR");

  // T055-T056: No laborales
  s = makeState({
    rentasNoLaborales: {
      ingresosComerciales: 100_000_000,
      ingresosIndustriales: 0,
      ingresosAgropecuarios: 0,
      otrosIngresosNoLaborales: 0,
      costosGastosNoLaborales: 40_000_000,
      INCRNoLaborales: 0,
    },
    deducciones: { ...DEFAULT_DEDUCCIONES, exenta25Porciento: false },
  });
  r = calcularDeclaracion(s);
  assert(r.cedulaGeneral.ingresosBrutosNoLaborales === 100_000_000, "T055: no laborales brutos");
  assert(r.cedulaGeneral.rentaLiquidaNoLaborales === 60_000_000, "T056: no laborales - costos");

  // T057: Cédula general consolidation
  s = makeState({
    rentasTrabajo: { ...DEFAULT_RENTAS_TRABAJO, salariosYPagosLaborales: 80_000_000 },
    rentasCapital: { ...DEFAULT_RENTAS_CAPITAL, arrendamientos: 20_000_000 },
    rentasNoLaborales: { ...DEFAULT_RENTAS_NO_LABORALES, ingresosComerciales: 30_000_000 },
    deducciones: { ...DEFAULT_DEDUCCIONES, exenta25Porciento: false },
  });
  r = calcularDeclaracion(s);
  assert(
    r.cedulaGeneral.rentaLiquidaCedulaGeneral === 130_000_000,
    "T057: consolidado = trabajo + capital + no laborales"
  );
}

// ══════════════════════════════════════════════════════════
// SECTION 5: DEDUCCIONES & CAPS (35 tests)
// ══════════════════════════════════════════════════════════

function testDeducciones() {
  const uvt = UVT_2025;

  // T058: 25% exemption applied
  let s = makeState({
    rentasTrabajo: { ...DEFAULT_RENTAS_TRABAJO, salariosYPagosLaborales: 100_000_000 },
    deducciones: { ...DEFAULT_DEDUCCIONES, exenta25Porciento: true },
  });
  let r = calcularDeclaracion(s);
  assert(r.cedulaGeneral.rentasExentasAplicadas > 0, "T058: 25% exenta applied > 0");

  // T059: 25% exemption capped at 790 UVT
  s = makeState({
    rentasTrabajo: { ...DEFAULT_RENTAS_TRABAJO, salariosYPagosLaborales: 500_000_000 },
    deducciones: { ...DEFAULT_DEDUCCIONES, exenta25Porciento: true, dependientes: 0 },
  });
  r = calcularDeclaracion(s);
  // 25% of 500M = 125M; 790 UVT = 39,341,210; so should be capped
  assert(r.cedulaGeneral.exentasCapped === true, "T059: 25% exenta capped flag");

  // T060: 25% exemption NOT capped for small income
  s = makeState({
    rentasTrabajo: { ...DEFAULT_RENTAS_TRABAJO, salariosYPagosLaborales: 50_000_000 },
    deducciones: { ...DEFAULT_DEDUCCIONES, exenta25Porciento: true, dependientes: 0 },
  });
  r = calcularDeclaracion(s);
  // 25% of 50M = 12.5M; 790 UVT = 39.3M; not capped
  assert(r.cedulaGeneral.exentasCapped === false, "T060: 25% not capped for small income");

  // T061-T063: Dependientes cap
  s = makeState({
    rentasTrabajo: { ...DEFAULT_RENTAS_TRABAJO, salariosYPagosLaborales: 200_000_000 },
    deducciones: { ...DEFAULT_DEDUCCIONES, exenta25Porciento: false, dependientes: 2 },
  });
  r = calcularDeclaracion(s);
  const depDeduction2 = 2 * 72 * 12 * uvt; // 2 * 72 * 12 * 49799 = 86,056,272
  assert(r.cedulaGeneral.deduccionesAplicadas > 0, "T061: dependientes deduction > 0");
  assert(r.cedulaGeneral.dependientesCapped === false, "T062: 2 dependientes not capped");

  s = makeState({
    rentasTrabajo: { ...DEFAULT_RENTAS_TRABAJO, salariosYPagosLaborales: 200_000_000 },
    deducciones: { ...DEFAULT_DEDUCCIONES, exenta25Porciento: false, dependientes: 5 },
  });
  r = calcularDeclaracion(s);
  assert(r.cedulaGeneral.dependientesCapped === true, "T063: 5 dependientes capped");

  // T064: Intereses vivienda cap at 1,200 UVT
  const vivCap = 1_200 * uvt;
  s = makeState({
    rentasTrabajo: { ...DEFAULT_RENTAS_TRABAJO, salariosYPagosLaborales: 200_000_000 },
    deducciones: { ...DEFAULT_DEDUCCIONES, exenta25Porciento: false, interesesVivienda: vivCap + 10_000_000 },
  });
  r = calcularDeclaracion(s);
  // Deductions should be at most vivCap (before combined cap)
  assert(r.cedulaGeneral.deduccionesAplicadas <= vivCap + 1, "T064: vivienda capped at 1200 UVT");

  // T065: Medicina prepagada cap at 192 UVT
  const medCap = 192 * uvt;
  s = makeState({
    rentasTrabajo: { ...DEFAULT_RENTAS_TRABAJO, salariosYPagosLaborales: 200_000_000 },
    deducciones: { ...DEFAULT_DEDUCCIONES, exenta25Porciento: false, medicinaPrepagada: medCap + 5_000_000 },
  });
  r = calcularDeclaracion(s);
  assert(r.cedulaGeneral.deduccionesAplicadas <= medCap + 1, "T065: medicina capped at 192 UVT");

  // T066: AFC cap at 30% income or 3,800 UVT
  const afcCap30 = 60_000_000 * 0.30; // 18M
  s = makeState({
    rentasTrabajo: { ...DEFAULT_RENTAS_TRABAJO, salariosYPagosLaborales: 60_000_000 },
    deducciones: { ...DEFAULT_DEDUCCIONES, exenta25Porciento: false, aportesAFC: 50_000_000 },
  });
  r = calcularDeclaracion(s);
  assert(
    r.cedulaGeneral.deduccionesAplicadas <= afcCap30 + 1,
    "T066: AFC capped at 30% of income"
  );

  // T067: AFC cap at 3,800 UVT for high income
  const afcCapUVT = 3_800 * uvt;
  s = makeState({
    rentasTrabajo: { ...DEFAULT_RENTAS_TRABAJO, salariosYPagosLaborales: 2_000_000_000 },
    deducciones: { ...DEFAULT_DEDUCCIONES, exenta25Porciento: false, aportesAFC: 500_000_000 },
  });
  r = calcularDeclaracion(s);
  // For 2B income, 30% = 600M, but 3800 UVT cap = ~189M
  // The AFC should be capped at 3800 UVT (not the higher 30%)
  assert(
    r.cedulaGeneral.deduccionesAplicadas <= afcCapUVT + 1,
    "T067: AFC capped at 3800 UVT for high income"
  );

  // T068: No AFC when no work income
  s = makeState({
    rentasCapital: { ...DEFAULT_RENTAS_CAPITAL, arrendamientos: 100_000_000 },
    deducciones: { ...DEFAULT_DEDUCCIONES, exenta25Porciento: false, aportesAFC: 20_000_000 },
  });
  r = calcularDeclaracion(s);
  // AFC cap = min(0 * 0.30, 3800*uvt) = 0
  assert(
    r.cedulaGeneral.deduccionesAplicadas === 0,
    "T068: AFC = 0 when no work income"
  );

  // T069-T072: Combined cap (40% rule + 1,340 UVT)
  // High income: 40% of 200M = 80M; 1,340 UVT = 66,730,660
  // Combined cap = min(80M, 66.7M) = 66.7M
  s = makeState({
    rentasTrabajo: { ...DEFAULT_RENTAS_TRABAJO, salariosYPagosLaborales: 200_000_000 },
    deducciones: {
      ...DEFAULT_DEDUCCIONES,
      exenta25Porciento: true,
      dependientes: 4,
      interesesVivienda: 50_000_000,
      medicinaPrepagada: 10_000_000,
    },
  });
  r = calcularDeclaracion(s);
  const combinedCap = Math.min(200_000_000 * 0.40, 1_340 * uvt);
  assert(
    r.cedulaGeneral.deduccionesAplicadas + r.cedulaGeneral.rentasExentasAplicadas <= combinedCap + 2,
    "T069: combined deducciones + exentas ≤ cap"
  );
  assert(r.cedulaGeneral.combinadoCapped === true, "T070: combined cap triggered");

  // T071: Combined cap NOT triggered for small amounts
  s = makeState({
    rentasTrabajo: { ...DEFAULT_RENTAS_TRABAJO, salariosYPagosLaborales: 60_000_000 },
    deducciones: { ...DEFAULT_DEDUCCIONES, exenta25Porciento: true, dependientes: 0 },
  });
  r = calcularDeclaracion(s);
  // 25% of 60M = 15M; 40% of 60M = 24M; 1340 UVT = 66.7M
  // 15M < 24M → not capped
  assert(r.cedulaGeneral.combinadoCapped === false, "T071: combined cap not triggered small");

  // T072: Gravable is always ≥ 0
  s = makeState({
    rentasTrabajo: { ...DEFAULT_RENTAS_TRABAJO, salariosYPagosLaborales: 50_000_000 },
    deducciones: {
      ...DEFAULT_DEDUCCIONES,
      exenta25Porciento: true,
      dependientes: 4,
      interesesVivienda: 60_000_000,
      medicinaPrepagada: 10_000_000,
      aportesAFC: 15_000_000,
    },
  });
  r = calcularDeclaracion(s);
  assert(r.cedulaGeneral.rentaLiquidaGravable >= 0, "T072: gravable ≥ 0 always");

  // T073-T075: Deductions without work income
  s = makeState({
    rentasCapital: { ...DEFAULT_RENTAS_CAPITAL, arrendamientos: 50_000_000 },
    deducciones: { ...DEFAULT_DEDUCCIONES, exenta25Porciento: true, dependientes: 2 },
  });
  r = calcularDeclaracion(s);
  // 25% exenta applies to rentaLiquidaTrabajo = 0, so exenta = 0
  // dependientes deduction still applies to rentaLiquidaCedulaGeneral
  assert(r.cedulaGeneral.rentasExentasAplicadas === 0, "T073: exenta = 0 when exenta25 disabled and no AFC/FVP");

  // T074: Donaciones have no cap
  s = makeState({
    rentasTrabajo: { ...DEFAULT_RENTAS_TRABAJO, salariosYPagosLaborales: 200_000_000 },
    deducciones: { ...DEFAULT_DEDUCCIONES, exenta25Porciento: false, donaciones: 50_000_000 },
  });
  r = calcularDeclaracion(s);
  assert(r.cedulaGeneral.deduccionesAplicadas > 0, "T074: donaciones applied");

  // T075: GMF deducible
  s = makeState({
    rentasTrabajo: { ...DEFAULT_RENTAS_TRABAJO, salariosYPagosLaborales: 200_000_000 },
    deducciones: { ...DEFAULT_DEDUCCIONES, exenta25Porciento: false, GMFDeducible: 2_000_000 },
  });
  r = calcularDeclaracion(s);
  assert(r.cedulaGeneral.deduccionesAplicadas === 2_000_000, "T075: GMF deducible applied");

  // T076-T078: Pension voluntaria cap
  s = makeState({
    rentasTrabajo: { ...DEFAULT_RENTAS_TRABAJO, salariosYPagosLaborales: 100_000_000 },
    deducciones: { ...DEFAULT_DEDUCCIONES, exenta25Porciento: false, pensionesVoluntarias: 50_000_000 },
  });
  r = calcularDeclaracion(s);
  // Cap: 30% of 100M = 30M
  assert(r.cedulaGeneral.deduccionesAplicadas <= 30_000_001, "T076: pension vol capped at 30%");

  // T077: Zero dependientes → no deduction
  s = makeState({
    rentasTrabajo: { ...DEFAULT_RENTAS_TRABAJO, salariosYPagosLaborales: 100_000_000 },
    deducciones: { ...DEFAULT_DEDUCCIONES, exenta25Porciento: false, dependientes: 0 },
  });
  r = calcularDeclaracion(s);
  assert(r.cedulaGeneral.deduccionesAplicadas === 0, "T077: 0 dependientes → 0 deduction");

  // T078-T080: Multiple deduction types
  s = makeState({
    rentasTrabajo: { ...DEFAULT_RENTAS_TRABAJO, salariosYPagosLaborales: 200_000_000 },
    deducciones: {
      ...DEFAULT_DEDUCCIONES,
      exenta25Porciento: false,
      interesesVivienda: 20_000_000,
      medicinaPrepagada: 5_000_000,
      GMFDeducible: 1_000_000,
    },
  });
  r = calcularDeclaracion(s);
  assert(r.cedulaGeneral.deduccionesAplicadas === 26_000_000, "T078: sum of multiple deducciones");

  // Tax with deducciones < tax without
  const rNoDed = calcularDeclaracion(makeState({
    rentasTrabajo: { ...DEFAULT_RENTAS_TRABAJO, salariosYPagosLaborales: 200_000_000 },
    deducciones: { ...DEFAULT_DEDUCCIONES, exenta25Porciento: false },
  }));
  assert(
    r.cedulaGeneral.impuestoCedulaGeneral < rNoDed.cedulaGeneral.impuestoCedulaGeneral,
    "T079: deducciones reduce tax"
  );

  // T080: Exenta off → no exenta
  s = makeState({
    rentasTrabajo: { ...DEFAULT_RENTAS_TRABAJO, salariosYPagosLaborales: 100_000_000 },
    deducciones: { ...DEFAULT_DEDUCCIONES, exenta25Porciento: false },
  });
  r = calcularDeclaracion(s);
  assert(r.cedulaGeneral.rentasExentasAplicadas === 0, "T080: exenta off → 0");

  // T081-T082: Proportional reduction when combined cap hit
  s = makeState({
    rentasTrabajo: { ...DEFAULT_RENTAS_TRABAJO, salariosYPagosLaborales: 100_000_000 },
    deducciones: {
      ...DEFAULT_DEDUCCIONES,
      exenta25Porciento: true, // 25M
      interesesVivienda: 30_000_000,
    },
  });
  r = calcularDeclaracion(s);
  // 40% of 100M = 40M cap; 25 + 30 = 55M > 40M → proportional reduction
  const combined = r.cedulaGeneral.deduccionesAplicadas + r.cedulaGeneral.rentasExentasAplicadas;
  assert(combined <= 40_000_001, "T081: proportional reduction applied");
  assert(r.cedulaGeneral.deduccionesAplicadas > 0, "T082: deducciones > 0 after proportional");

  // T083-T092: (Additional deduction edge cases)
  // T083: Exactly at 40% boundary
  s = makeState({
    rentasTrabajo: { ...DEFAULT_RENTAS_TRABAJO, salariosYPagosLaborales: 100_000_000 },
    deducciones: { ...DEFAULT_DEDUCCIONES, exenta25Porciento: false, interesesVivienda: 40_000_000 },
  });
  r = calcularDeclaracion(s);
  assert(r.cedulaGeneral.deduccionesAplicadas <= 40_000_001, "T083: exactly at 40%");

  // T084: Multiple income types with deducciones
  s = makeState({
    rentasTrabajo: { ...DEFAULT_RENTAS_TRABAJO, salariosYPagosLaborales: 80_000_000 },
    rentasCapital: { ...DEFAULT_RENTAS_CAPITAL, arrendamientos: 20_000_000 },
    deducciones: { ...DEFAULT_DEDUCCIONES, exenta25Porciento: true, dependientes: 1 },
  });
  r = calcularDeclaracion(s);
  // Cédula general = 100M, 40% cap = 40M
  const combined2 = r.cedulaGeneral.deduccionesAplicadas + r.cedulaGeneral.rentasExentasAplicadas;
  assert(combined2 <= Math.min(100_000_000 * 0.40, 1_340 * uvt) + 2, "T084: multi-income + ded cap");
}

// ══════════════════════════════════════════════════════════
// SECTION 6: CÉDULA PENSIONES (10 tests)
// ══════════════════════════════════════════════════════════

function testPensiones() {
  const uvt = UVT_2025;

  // T085: No pension → 0
  let r = calcularDeclaracion(INITIAL_STATE);
  assert(r.cedulaPensiones.impuestoCedulaPensiones === 0, "T085: no pension → 0 tax");

  // T086: Small pension under 12,000 UVT → 0 tax
  let s = makeState({
    cedulaPensiones: { ...DEFAULT_CEDULA_PENSIONES, pensionJubilacion: 100_000_000 },
  });
  r = calcularDeclaracion(s);
  // 100M / 49799 = ~2008 UVT < 12,000 → 0 tax
  assert(r.cedulaPensiones.impuestoCedulaPensiones === 0, "T086: pension < 12000 UVT → 0 tax");

  // T087: Pension at exactly 12,000 UVT → 0 tax
  s = makeState({
    cedulaPensiones: { ...DEFAULT_CEDULA_PENSIONES, pensionJubilacion: 12_000 * uvt },
  });
  r = calcularDeclaracion(s);
  assert(r.cedulaPensiones.impuestoCedulaPensiones === 0, "T087: pension = 12000 UVT → 0 tax");

  // T088: Pension above 12,000 UVT → taxed on excess (use 14,100 UVT so excess=2,100 UVT > 1,090 threshold)
  s = makeState({
    cedulaPensiones: { ...DEFAULT_CEDULA_PENSIONES, pensionJubilacion: 14_100 * uvt },
  });
  r = calcularDeclaracion(s);
  assert(r.cedulaPensiones.impuestoCedulaPensiones > 0, "T088: pension > 12000 UVT → tax > 0");
  assert(r.cedulaPensiones.rentaExentaPensiones === 12_000 * uvt, "T089: exenta = 12000 UVT");
  assert(r.cedulaPensiones.rentaLiquidaGravablePensiones === 2_100 * uvt, "T090: gravable = 2100 UVT");

  // T091: Pension with health deduction
  s = makeState({
    cedulaPensiones: {
      pensionJubilacion: 15_000 * uvt,
      pensionSobreviviente: 0,
      pensionInvalidez: 0,
      otrasPensiones: 0,
      aportesObligatoriosSalud: 1_000 * uvt,
    },
  });
  r = calcularDeclaracion(s);
  assert(r.cedulaPensiones.INCRPensiones === 1_000 * uvt, "T091: pension INCR = salud");
  // Brutos = 15000, INCR = 1000, liquida = 14000, exenta = 12000, gravable = 2000
  assert(r.cedulaPensiones.rentaLiquidaGravablePensiones === 2_000 * uvt, "T092: pension gravable after INCR");

  // T093: Multiple pension types
  s = makeState({
    cedulaPensiones: {
      pensionJubilacion: 5_000 * uvt,
      pensionSobreviviente: 3_000 * uvt,
      pensionInvalidez: 1_000 * uvt,
      otrasPensiones: 500 * uvt,
      aportesObligatoriosSalud: 0,
    },
  });
  r = calcularDeclaracion(s);
  assert(r.cedulaPensiones.ingresosBrutosPensiones === 9_500 * uvt, "T093: sum all pension types");

  // T094: Very high pension
  s = makeState({
    cedulaPensiones: { ...DEFAULT_CEDULA_PENSIONES, pensionJubilacion: 50_000 * uvt },
  });
  r = calcularDeclaracion(s);
  assert(r.cedulaPensiones.impuestoCedulaPensiones > 0, "T094: high pension taxed");
  assert(r.cedulaPensiones.rentaLiquidaGravablePensiones === 38_000 * uvt, "T094b: gravable = 38000");
}

// ══════════════════════════════════════════════════════════
// SECTION 7: CÉDULA DIVIDENDOS — ART. 242 (15 tests)
// ══════════════════════════════════════════════════════════

function testDividendos() {
  const uvt = UVT_2025;

  // T095: No dividendos → 0
  let r = calcularDeclaracion(INITIAL_STATE);
  assert(r.cedulaDividendos.impuestoTotalDividendos === 0, "T095: no dividendos → 0");

  // T096: Sub-cédula 1 under 300 UVT → 0 tax
  let s = makeState({
    cedulaDividendos: { ...DEFAULT_CEDULA_DIVIDENDOS, dividendosNoGravados: 200 * uvt },
  });
  r = calcularDeclaracion(s);
  assert(r.cedulaDividendos.subCedula1Impuesto === 0, "T096: div < 300 UVT → 0 tax");

  // T097: Sub-cédula 1 at exactly 300 UVT → 0 tax
  s = makeState({
    cedulaDividendos: { ...DEFAULT_CEDULA_DIVIDENDOS, dividendosNoGravados: 300 * uvt },
  });
  r = calcularDeclaracion(s);
  assert(r.cedulaDividendos.subCedula1Impuesto === 0, "T097: div = 300 UVT → 0 tax");

  // T098: Sub-cédula 1, 500 UVT → 10% on 200 UVT
  s = makeState({
    cedulaDividendos: { ...DEFAULT_CEDULA_DIVIDENDOS, dividendosNoGravados: 500 * uvt },
  });
  r = calcularDeclaracion(s);
  const expected500 = Math.round(200 * 0.10 * uvt);
  assertApprox(r.cedulaDividendos.subCedula1Impuesto, expected500, 2, "T098: 500 UVT → 10% on 200");

  // T099: Sub-cédula 1 at 1,090 UVT boundary
  s = makeState({
    cedulaDividendos: { ...DEFAULT_CEDULA_DIVIDENDOS, dividendosNoGravados: 1_090 * uvt },
  });
  r = calcularDeclaracion(s);
  const expected1090 = Math.round(790 * 0.10 * uvt);
  assertApprox(r.cedulaDividendos.subCedula1Impuesto, expected1090, 2, "T099: 1090 UVT boundary");

  // T100: Sub-cédula 1 above 1,090 UVT → 15% on excess
  s = makeState({
    cedulaDividendos: { ...DEFAULT_CEDULA_DIVIDENDOS, dividendosNoGravados: 2_000 * uvt },
  });
  r = calcularDeclaracion(s);
  const expected2000d = Math.round((790 * 0.10 + 910 * 0.15) * uvt);
  assertApprox(r.cedulaDividendos.subCedula1Impuesto, expected2000d, 2, "T100: 2000 UVT div tax");

  // T101: Sub-cédula 2 → taxed with both Art. 241 + 242
  s = makeState({
    cedulaDividendos: { ...DEFAULT_CEDULA_DIVIDENDOS, dividendosGravados: 2_000 * uvt },
  });
  r = calcularDeclaracion(s);
  assert(r.cedulaDividendos.subCedula2Impuesto > 0, "T101: sub-cedula 2 > 0");
  // Should be 241 tax + 242 recargo
  // Sub-cedula 2 at 2000 UVT: Art. 241 tax (marginal) + Art. 242 recargo (marginal)
  // Art. 242 recargo on 2000 UVT: (1090-300)*0.10 + (2000-1090)*0.15 = 79 + 136.5 = 215.5 UVT
  const recargo242 = Math.round(((1_090 - 300) * 0.10 + (2_000 - 1_090) * 0.15) * uvt);
  assert(
    r.cedulaDividendos.subCedula2Impuesto > recargo242,
    "T102: sub-cedula 2 includes Art. 241 tax on top of Art. 242 recargo"
  );

  // T103: Both sub-cédulas
  s = makeState({
    cedulaDividendos: {
      ...DEFAULT_CEDULA_DIVIDENDOS,
      dividendosNoGravados: 500 * uvt,
      dividendosGravados: 500 * uvt,
    },
  });
  r = calcularDeclaracion(s);
  assert(r.cedulaDividendos.impuestoTotalDividendos > 0, "T103: both sub-cedulas have tax");
  assert(
    r.cedulaDividendos.impuestoTotalDividendos ===
      r.cedulaDividendos.subCedula1Impuesto + r.cedulaDividendos.subCedula2Impuesto,
    "T104: total = sub1 + sub2"
  );

  // T105: Participaciones added to sub-cédulas
  s = makeState({
    cedulaDividendos: {
      ...DEFAULT_CEDULA_DIVIDENDOS,
      dividendosNoGravados: 500 * uvt,
      participacionesNoGravadas: 300 * uvt,
    },
  });
  r = calcularDeclaracion(s);
  assert(r.cedulaDividendos.subCedula1Total === 800 * uvt, "T105: sub1 includes participaciones");

  // T106: Pre-2017 dividendos
  s = makeState({
    cedulaDividendos: {
      ...DEFAULT_CEDULA_DIVIDENDOS,
      dividendosNoGravados2016: 400 * uvt,
    },
  });
  r = calcularDeclaracion(s);
  assert(r.cedulaDividendos.subCedula1Total === 400 * uvt, "T106: pre-2017 in sub-cedula 1");

  // T107-T109: Dividend tax monotonically increases
  const dt100 = calcularDeclaracion(makeState({
    cedulaDividendos: { ...DEFAULT_CEDULA_DIVIDENDOS, dividendosNoGravados: 100 * uvt },
  })).cedulaDividendos.subCedula1Impuesto;
  const dt500 = calcularDeclaracion(makeState({
    cedulaDividendos: { ...DEFAULT_CEDULA_DIVIDENDOS, dividendosNoGravados: 500 * uvt },
  })).cedulaDividendos.subCedula1Impuesto;
  const dt2000 = calcularDeclaracion(makeState({
    cedulaDividendos: { ...DEFAULT_CEDULA_DIVIDENDOS, dividendosNoGravados: 2000 * uvt },
  })).cedulaDividendos.subCedula1Impuesto;
  assert(dt100 <= dt500, "T107: div tax monotonic 100 ≤ 500");
  assert(dt500 <= dt2000, "T108: div tax monotonic 500 ≤ 2000");
  assert(dt100 === 0, "T109: 100 UVT div = 0 tax");
}

// ══════════════════════════════════════════════════════════
// SECTION 8: GANANCIAS OCASIONALES (18 tests)
// ══════════════════════════════════════════════════════════

function testGananciasOcasionales() {
  const uvt = UVT_2025;

  // T110: No ganancias → 0
  let r = calcularDeclaracion(INITIAL_STATE);
  assert(r.gananciasOcasionales.impuestoGanancias === 0, "T110: no ganancias → 0");

  // T111: Herencia under 3,250 UVT → 0 tax
  let s = makeState({
    gananciasOcasionales: { ...DEFAULT_GANANCIAS_OCASIONALES, herenciasDonaciones: 1_000 * uvt },
  });
  r = calcularDeclaracion(s);
  assert(r.gananciasOcasionales.impuestoGanancias === 0, "T111: herencia < 3250 UVT → 0");

  // T112: Herencia above 3,250 UVT → 15% on excess
  s = makeState({
    gananciasOcasionales: { ...DEFAULT_GANANCIAS_OCASIONALES, herenciasDonaciones: 5_000 * uvt },
  });
  r = calcularDeclaracion(s);
  const expectedHerencia = Math.round((5_000 - 3_250) * uvt * 0.15);
  assertApprox(r.gananciasOcasionales.impuestoGanancias, expectedHerencia, 2, "T112: herencia 15% on excess");

  // T113: Venta activos under 7,500 UVT → 0 tax
  s = makeState({
    gananciasOcasionales: { ...DEFAULT_GANANCIAS_OCASIONALES, ventaVivienda: 5_000 * uvt },
  });
  r = calcularDeclaracion(s);
  assert(r.gananciasOcasionales.impuestoGanancias === 0, "T113: venta < 7500 UVT → 0");

  // T114: Venta activos above 7,500 UVT
  s = makeState({
    gananciasOcasionales: { ...DEFAULT_GANANCIAS_OCASIONALES, ventaVivienda: 10_000 * uvt },
  });
  r = calcularDeclaracion(s);
  const expectedVenta = Math.round((10_000 - 7_500) * uvt * 0.15);
  assertApprox(r.gananciasOcasionales.impuestoGanancias, expectedVenta, 2, "T114: venta 15% on excess");

  // T115: Lottery under 48 UVT → 0 tax
  s = makeState({
    gananciasOcasionales: { ...DEFAULT_GANANCIAS_OCASIONALES, loterias: 30 * uvt },
  });
  r = calcularDeclaracion(s);
  assert(r.gananciasOcasionales.impuestoGanancias === 0, "T115: lottery < 48 UVT → 0");

  // T116: Lottery above 48 UVT → 20% on excess
  s = makeState({
    gananciasOcasionales: { ...DEFAULT_GANANCIAS_OCASIONALES, loterias: 100 * uvt },
  });
  r = calcularDeclaracion(s);
  const expectedLottery = Math.round((100 - 48) * uvt * 0.20);
  assertApprox(r.gananciasOcasionales.impuestoGanancias, expectedLottery, 2, "T116: lottery 20% on excess");

  // T117: Costos reduce ganancias
  s = makeState({
    gananciasOcasionales: {
      ...DEFAULT_GANANCIAS_OCASIONALES,
      ventaVivienda: 10_000 * uvt,
      costosGanancias: 8_000 * uvt,
    },
  });
  r = calcularDeclaracion(s);
  // Net = 2000 UVT, exemption = min(10000, 7500) = 7500 but net is only 2000
  // So exenta = min(7500, 2000) → capped to 2000, gravable = 0
  assert(r.gananciasOcasionales.gananciaGravable === 0, "T117: costs reduce to 0 gravable");
  assert(r.gananciasOcasionales.impuestoGanancias === 0, "T118: no tax when costs eliminate gains");

  // T119: Costos > ganancias → clamped to 0
  s = makeState({
    gananciasOcasionales: {
      ...DEFAULT_GANANCIAS_OCASIONALES,
      ventaVivienda: 5_000 * uvt,
      costosGanancias: 10_000 * uvt,
    },
  });
  r = calcularDeclaracion(s);
  assert(r.gananciasOcasionales.gananciaGravable === 0, "T119: costs > gains → 0");

  // T120: Indemnizaciones at 15%
  s = makeState({
    gananciasOcasionales: { ...DEFAULT_GANANCIAS_OCASIONALES, indemnizaciones: 10_000 * uvt },
  });
  r = calcularDeclaracion(s);
  // No special exemption for indemnizaciones in current code
  assert(r.gananciasOcasionales.impuestoGanancias > 0, "T120: indemnizaciones taxed");

  // T121: Multiple ganancia types
  s = makeState({
    gananciasOcasionales: {
      ...DEFAULT_GANANCIAS_OCASIONALES,
      ventaVivienda: 10_000 * uvt,
      herenciasDonaciones: 5_000 * uvt,
      loterias: 100 * uvt,
    },
  });
  r = calcularDeclaracion(s);
  assert(r.gananciasOcasionales.gananciasBrutas === 15_100 * uvt, "T121: sum all ganancia types");
  assert(r.gananciasOcasionales.impuestoGanancias > 0, "T122: combined ganancias taxed");

  // T123-T127: Exemption caps
  s = makeState({
    gananciasOcasionales: { ...DEFAULT_GANANCIAS_OCASIONALES, herenciasDonaciones: 3_250 * uvt },
  });
  r = calcularDeclaracion(s);
  assert(r.gananciasOcasionales.gananciaExenta === 3_250 * uvt, "T123: herencia exact exemption");
  assert(r.gananciasOcasionales.gananciaGravable === 0, "T124: at exact exemption → 0 gravable");

  s = makeState({
    gananciasOcasionales: { ...DEFAULT_GANANCIAS_OCASIONALES, loterias: 48 * uvt },
  });
  r = calcularDeclaracion(s);
  assert(r.gananciasOcasionales.gananciaExenta === 48 * uvt, "T125: lottery exact exemption");

  s = makeState({
    gananciasOcasionales: { ...DEFAULT_GANANCIAS_OCASIONALES, ventaVivienda: 7_500 * uvt },
  });
  r = calcularDeclaracion(s);
  assert(r.gananciasOcasionales.gananciaExenta === 7_500 * uvt, "T126: venta exact exemption");
  assert(r.gananciasOcasionales.gananciaGravable === 0, "T127: at exact venta exemption → 0");
}

// ══════════════════════════════════════════════════════════
// SECTION 9: LIQUIDACIÓN FINAL (20 tests)
// ══════════════════════════════════════════════════════════

function testLiquidacion() {
  const uvt = UVT_2025;

  // T128: Impuesto total = sum of all cédulas
  let s = makeState({
    rentasTrabajo: { ...DEFAULT_RENTAS_TRABAJO, salariosYPagosLaborales: 200_000_000 },
    cedulaPensiones: { ...DEFAULT_CEDULA_PENSIONES, pensionJubilacion: 15_000 * uvt },
    cedulaDividendos: { ...DEFAULT_CEDULA_DIVIDENDOS, dividendosNoGravados: 500 * uvt },
    gananciasOcasionales: { ...DEFAULT_GANANCIAS_OCASIONALES, herenciasDonaciones: 5_000 * uvt },
    deducciones: { ...DEFAULT_DEDUCCIONES, exenta25Porciento: false },
  });
  let r = calcularDeclaracion(s);
  const expectedTotal =
    r.cedulaGeneral.impuestoCedulaGeneral +
    r.cedulaPensiones.impuestoCedulaPensiones +
    r.cedulaDividendos.impuestoTotalDividendos +
    r.gananciasOcasionales.impuestoGanancias;
  assert(r.liquidacion.impuestoRentaTotal === expectedTotal, "T128: total = sum of cédulas");

  // T129: Anticipo primer año = 25%
  s = makeState({
    perfil: { ...DEFAULT_PERFIL, anosDeclarando: 1 },
    rentasTrabajo: { ...DEFAULT_RENTAS_TRABAJO, salariosYPagosLaborales: 200_000_000 },
    deducciones: { ...DEFAULT_DEDUCCIONES, exenta25Porciento: false },
  });
  r = calcularDeclaracion(s);
  assert(
    r.liquidacion.anticipoSiguienteAno === Math.round(r.liquidacion.impuestoNeto * 0.25),
    "T129: anticipo primer año = 25%"
  );

  // T130: Anticipo no primer año = 75%
  s = makeState({
    perfil: { ...DEFAULT_PERFIL, anosDeclarando: 3 },
    rentasTrabajo: { ...DEFAULT_RENTAS_TRABAJO, salariosYPagosLaborales: 200_000_000 },
    deducciones: { ...DEFAULT_DEDUCCIONES, exenta25Porciento: false },
  });
  r = calcularDeclaracion(s);
  assert(
    r.liquidacion.anticipoSiguienteAno === Math.round(r.liquidacion.impuestoNeto * 0.75),
    "T130: anticipo = 75%"
  );

  // T131: Retenciones reduce saldo a pagar
  s = makeState({
    rentasTrabajo: { ...DEFAULT_RENTAS_TRABAJO, salariosYPagosLaborales: 200_000_000 },
    deducciones: { ...DEFAULT_DEDUCCIONES, exenta25Porciento: false },
    retencionesAnticipos: { ...DEFAULT_RETENCIONES_ANTICIPOS, retencionFuenteRenta: 50_000_000 },
  });
  r = calcularDeclaracion(s);
  const sNoDed = makeState({
    rentasTrabajo: { ...DEFAULT_RENTAS_TRABAJO, salariosYPagosLaborales: 200_000_000 },
    deducciones: { ...DEFAULT_DEDUCCIONES, exenta25Porciento: false },
  });
  const rNoRet = calcularDeclaracion(sNoDed);
  assert(r.liquidacion.saldoPagar < rNoRet.liquidacion.saldoPagar, "T131: retenciones reduce saldo");

  // T132: Saldo a favor when retenciones > impuesto
  s = makeState({
    rentasTrabajo: { ...DEFAULT_RENTAS_TRABAJO, salariosYPagosLaborales: 80_000_000 },
    deducciones: { ...DEFAULT_DEDUCCIONES, exenta25Porciento: false },
    retencionesAnticipos: { ...DEFAULT_RETENCIONES_ANTICIPOS, retencionFuenteRenta: 500_000_000 },
  });
  r = calcularDeclaracion(s);
  assert(r.liquidacion.saldoFavor > 0, "T132: retenciones > impuesto → saldo a favor");
  assert(r.liquidacion.saldoPagar === 0, "T133: saldo a pagar = 0 when favor");

  // T134: saldoPagar and saldoFavor are mutually exclusive
  assert(
    !(r.liquidacion.saldoPagar > 0 && r.liquidacion.saldoFavor > 0),
    "T134: pagar and favor mutually exclusive"
  );

  // T135: Anticipo anterior reduces
  s = makeState({
    rentasTrabajo: { ...DEFAULT_RENTAS_TRABAJO, salariosYPagosLaborales: 200_000_000 },
    deducciones: { ...DEFAULT_DEDUCCIONES, exenta25Porciento: false },
    retencionesAnticipos: { ...DEFAULT_RETENCIONES_ANTICIPOS, anticipoAnoAnterior: 20_000_000 },
  });
  r = calcularDeclaracion(s);
  assert(r.liquidacion.anticipoAnterior === 20_000_000, "T135: anticipo anterior applied");

  // T136: Saldo favor anterior
  s = makeState({
    rentasTrabajo: { ...DEFAULT_RENTAS_TRABAJO, salariosYPagosLaborales: 200_000_000 },
    deducciones: { ...DEFAULT_DEDUCCIONES, exenta25Porciento: false },
    retencionesAnticipos: { ...DEFAULT_RETENCIONES_ANTICIPOS, saldoFavorAnterior: 10_000_000 },
  });
  r = calcularDeclaracion(s);
  assert(r.liquidacion.saldoFavorAnterior === 10_000_000, "T136: saldo favor anterior applied");

  // T137: Total retenciones = sum of all
  s = makeState({
    retencionesAnticipos: {
      retencionFuenteRenta: 10_000_000,
      retencionFuenteOtros: 5_000_000,
      retencionDividendos: 3_000_000,
      anticipoAnoAnterior: 0,
      saldoFavorAnterior: 0,
    },
  });
  r = calcularDeclaracion(s);
  assert(r.liquidacion.totalRetenciones === 18_000_000, "T137: total retenciones sum");

  // T138: Zero income with retenciones → saldo a favor
  s = makeState({
    retencionesAnticipos: { ...DEFAULT_RETENCIONES_ANTICIPOS, retencionFuenteRenta: 5_000_000 },
  });
  r = calcularDeclaracion(s);
  assert(r.liquidacion.saldoFavor === 5_000_000, "T138: 0 income + retenciones → favor");

  // T139: ImpuestoNeto always ≥ 0
  r = calcularDeclaracion(INITIAL_STATE);
  assert(r.liquidacion.impuestoNeto >= 0, "T139: impuesto neto ≥ 0");

  // T140-T142: Tasa efectiva
  s = makeState({
    rentasTrabajo: { ...DEFAULT_RENTAS_TRABAJO, salariosYPagosLaborales: 200_000_000 },
    deducciones: { ...DEFAULT_DEDUCCIONES, exenta25Porciento: false },
  });
  r = calcularDeclaracion(s);
  assert(r.tasaEfectivaGlobal > 0, "T140: tasa efectiva > 0 with income");
  assert(r.tasaEfectivaGlobal < 0.39, "T141: tasa efectiva < 39%");

  r = calcularDeclaracion(INITIAL_STATE);
  assert(r.tasaEfectivaGlobal === 0, "T142: tasa efectiva = 0 with 0 income");

  // T143-T147: Full scenario
  s = makeState({
    perfil: { ...DEFAULT_PERFIL, anosDeclarando: 3 },
    rentasTrabajo: { ...DEFAULT_RENTAS_TRABAJO, salariosYPagosLaborales: 150_000_000 },
    deducciones: { ...DEFAULT_DEDUCCIONES, exenta25Porciento: true, dependientes: 2 },
    retencionesAnticipos: {
      retencionFuenteRenta: 15_000_000,
      retencionFuenteOtros: 0,
      anticipoAnoAnterior: 5_000_000,
      saldoFavorAnterior: 0,
      retencionDividendos: 0,
    },
  });
  r = calcularDeclaracion(s);
  assert(r.liquidacion.impuestoRentaTotal > 0, "T143: full scenario has tax");
  assert(r.liquidacion.anticipoSiguienteAno > 0, "T144: has anticipo");
  assert(r.liquidacion.totalRetenciones === 15_000_000, "T145: retenciones = 15M");
  assert(r.liquidacion.anticipoAnterior === 5_000_000, "T146: anticipo anterior = 5M");
  const totalAPagar = r.liquidacion.impuestoNeto + r.liquidacion.anticipoSiguienteAno - 15_000_000 - 5_000_000;
  if (totalAPagar > 0) {
    assert(r.liquidacion.saldoPagar === totalAPagar, "T147a: saldo a pagar correct");
  } else {
    assert(r.liquidacion.saldoFavor === -totalAPagar, "T147b: saldo a favor correct");
  }
}

// ══════════════════════════════════════════════════════════
// SECTION 10: UMBRALES DECLARAR (15 tests)
// ══════════════════════════════════════════════════════════

function testUmbrales() {
  const uvt = UVT_2025;

  // T148: All zeros → no declarar
  let s = makeState();
  let r = verificarObligacionDeclarar(s);
  assert(!r.debeDeclarar, "T148: all zeros → no declarar");
  assert(r.razones.length === 0, "T149: no razones");

  // T150: Patrimonio above 4,500 UVT
  s = makeState({ umbrales: { ...DEFAULT_UMBRALES, patrimonioBruto: 4_501 * uvt } });
  r = verificarObligacionDeclarar(s);
  assert(r.debeDeclarar, "T150: patrimonio > 4500 UVT → declarar");
  assert(r.razones.length === 1, "T151: 1 razon");

  // T152: Patrimonio exactly at 4,500 UVT → no (> not >=)
  s = makeState({ umbrales: { ...DEFAULT_UMBRALES, patrimonioBruto: 4_500 * uvt } });
  r = verificarObligacionDeclarar(s);
  assert(!r.debeDeclarar, "T152: patrimonio = 4500 UVT → no declarar");

  // T153: Ingresos above 1,400 UVT
  s = makeState({ umbrales: { ...DEFAULT_UMBRALES, ingresoBruto: 1_401 * uvt } });
  r = verificarObligacionDeclarar(s);
  assert(r.debeDeclarar, "T153: ingresos > 1400 UVT → declarar");

  // T154: Compras above 1,400 UVT
  s = makeState({ umbrales: { ...DEFAULT_UMBRALES, comprasConsumos: 1_401 * uvt } });
  r = verificarObligacionDeclarar(s);
  assert(r.debeDeclarar, "T154: compras > 1400 UVT → declarar");

  // T155: Consignaciones above 1,400 UVT
  s = makeState({ umbrales: { ...DEFAULT_UMBRALES, consignaciones: 1_401 * uvt } });
  r = verificarObligacionDeclarar(s);
  assert(r.debeDeclarar, "T155: consignaciones > 1400 UVT → declarar");

  // T156: Tarjetas above 1,400 UVT
  s = makeState({ umbrales: { ...DEFAULT_UMBRALES, movimientosTarjetas: 1_401 * uvt } });
  r = verificarObligacionDeclarar(s);
  assert(r.debeDeclarar, "T156: tarjetas > 1400 UVT → declarar");

  // T157: Multiple umbrales
  s = makeState({
    umbrales: {
      patrimonioBruto: 5_000 * uvt,
      ingresoBruto: 2_000 * uvt,
      comprasConsumos: 0,
      consignaciones: 0,
      movimientosTarjetas: 0,
    },
  });
  r = verificarObligacionDeclarar(s);
  assert(r.debeDeclarar, "T157: multiple umbrales → declarar");
  assert(r.razones.length === 2, "T158: 2 razones");

  // T159: All 5 umbrales exceeded
  s = makeState({
    umbrales: {
      patrimonioBruto: 5_000 * uvt,
      ingresoBruto: 2_000 * uvt,
      comprasConsumos: 2_000 * uvt,
      consignaciones: 2_000 * uvt,
      movimientosTarjetas: 2_000 * uvt,
    },
  });
  r = verificarObligacionDeclarar(s);
  assert(r.razones.length === 5, "T159: 5 razones");

  // T160: Just under all thresholds → no declarar
  s = makeState({
    umbrales: {
      patrimonioBruto: 4_499 * uvt,
      ingresoBruto: 1_399 * uvt,
      comprasConsumos: 1_399 * uvt,
      consignaciones: 1_399 * uvt,
      movimientosTarjetas: 1_399 * uvt,
    },
  });
  r = verificarObligacionDeclarar(s);
  assert(!r.debeDeclarar, "T160: just under all → no declarar");

  // T161-T162: Different UVT year
  s = makeState({
    perfil: { ...DEFAULT_PERFIL, anoGravable: 2024 },
    umbrales: { ...DEFAULT_UMBRALES, patrimonioBruto: 4_501 * 47_065 },
  });
  r = verificarObligacionDeclarar(s);
  assert(r.debeDeclarar, "T161: 2024 UVT threshold");

  s = makeState({
    perfil: { ...DEFAULT_PERFIL, anoGravable: 2024 },
    umbrales: { ...DEFAULT_UMBRALES, patrimonioBruto: 4_500 * 47_065 },
  });
  r = verificarObligacionDeclarar(s);
  assert(!r.debeDeclarar, "T162: 2024 UVT at boundary");
}

// ══════════════════════════════════════════════════════════
// SECTION 11: COMPLETE PROFILES (30 tests)
// ══════════════════════════════════════════════════════════

function testCompleteProfiles() {
  const uvt = UVT_2025;

  // T163: Empleado básico — salario mínimo
  let s = makeState({
    rentasTrabajo: { ...DEFAULT_RENTAS_TRABAJO, salariosYPagosLaborales: 1_750_905 * 12 },
    deducciones: { ...DEFAULT_DEDUCCIONES, exenta25Porciento: true },
  });
  let r = calcularDeclaracion(s);
  // ~21M annual → ~422 UVT → under 1090 threshold → 0 tax
  assert(r.cedulaGeneral.impuestoCedulaGeneral === 0, "T163: min wage → 0 tax");
  assert(r.liquidacion.saldoPagar === 0, "T164: min wage → 0 saldo");

  // T165: Empleado 5M monthly
  s = makeState({
    rentasTrabajo: {
      ...DEFAULT_RENTAS_TRABAJO,
      salariosYPagosLaborales: 60_000_000,
      aportesObligatoriosSalud: 2_400_000,
      aportesObligatoriosPension: 2_400_000,
    },
    deducciones: { ...DEFAULT_DEDUCCIONES, exenta25Porciento: true, dependientes: 1 },
  });
  r = calcularDeclaracion(s);
  assert(r.cedulaGeneral.impuestoCedulaGeneral >= 0, "T165: 5M/month employee tax ≥ 0");
  assert(r.cedulaGeneral.rentaLiquidaTrabajo === 55_200_000, "T166: liquida after INCR");

  // T167: Empleado alto ingreso 30M monthly
  s = makeState({
    rentasTrabajo: {
      ...DEFAULT_RENTAS_TRABAJO,
      salariosYPagosLaborales: 360_000_000,
      aportesObligatoriosSalud: 14_400_000,
      aportesObligatoriosPension: 14_400_000,
      fondoSolidaridad: 3_600_000,
    },
    deducciones: {
      ...DEFAULT_DEDUCCIONES,
      exenta25Porciento: true,
      dependientes: 2,
      interesesVivienda: 30_000_000,
      medicinaPrepagada: 8_000_000,
      aportesAFC: 20_000_000,
    },
    retencionesAnticipos: {
      ...DEFAULT_RETENCIONES_ANTICIPOS,
      retencionFuenteRenta: 60_000_000,
    },
  });
  r = calcularDeclaracion(s);
  assert(r.cedulaGeneral.impuestoCedulaGeneral > 0, "T167: high income → tax > 0");
  assert(r.cedulaGeneral.combinadoCapped === true, "T168: combined cap hit");
  assert(r.tasaEfectivaGlobal > 0.05, "T169: effective rate > 5%");
  assert(r.tasaEfectivaGlobal < 0.39, "T170: effective rate < 39%");

  // T171: Independiente
  s = makeState({
    rentasTrabajo: {
      ...DEFAULT_RENTAS_TRABAJO,
      honorariosServicios: 120_000_000,
      aportesObligatoriosSalud: 6_000_000,
      aportesObligatoriosPension: 6_000_000,
    },
    deducciones: { ...DEFAULT_DEDUCCIONES, exenta25Porciento: true },
  });
  r = calcularDeclaracion(s);
  assert(r.cedulaGeneral.impuestoCedulaGeneral > 0, "T171: independiente pays tax");

  // T172: Pensionado puro
  s = makeState({
    cedulaPensiones: {
      pensionJubilacion: 8_000_000 * 12,
      pensionSobreviviente: 0,
      pensionInvalidez: 0,
      otrasPensiones: 0,
      aportesObligatoriosSalud: 8_000_000 * 12 * 0.12,
    },
    deducciones: { ...DEFAULT_DEDUCCIONES, exenta25Porciento: false },
  });
  r = calcularDeclaracion(s);
  // 96M pension, 11.52M salud INCR → 84.48M liquida
  // 84.48M / 49799 ≈ 1696 UVT < 12000 → 0 tax
  assert(r.cedulaPensiones.impuestoCedulaPensiones === 0, "T172: moderate pensionado → 0 tax");
  assert(r.cedulaGeneral.impuestoCedulaGeneral === 0, "T173: pensionado no general tax");

  // T174: Rentista de capital
  s = makeState({
    rentasCapital: {
      interesesRendimientos: 30_000_000,
      arrendamientos: 60_000_000,
      regalias: 0,
      otrosIngresosCapital: 0,
      costosGastosCapital: 10_000_000,
      INCRCapital: 0,
    },
    deducciones: { ...DEFAULT_DEDUCCIONES, exenta25Porciento: false },
  });
  r = calcularDeclaracion(s);
  assert(r.cedulaGeneral.rentaLiquidaCapital === 80_000_000, "T174: rentista capital liquida");
  assert(r.cedulaGeneral.impuestoCedulaGeneral > 0, "T175: rentista pays tax");

  // T176: Mixto — trabajo + capital + dividendos
  s = makeState({
    rentasTrabajo: { ...DEFAULT_RENTAS_TRABAJO, salariosYPagosLaborales: 100_000_000 },
    rentasCapital: { ...DEFAULT_RENTAS_CAPITAL, arrendamientos: 30_000_000 },
    cedulaDividendos: { ...DEFAULT_CEDULA_DIVIDENDOS, dividendosNoGravados: 500 * uvt },
    deducciones: { ...DEFAULT_DEDUCCIONES, exenta25Porciento: true },
  });
  r = calcularDeclaracion(s);
  assert(r.cedulaGeneral.impuestoCedulaGeneral > 0, "T176: mixto general tax");
  assert(r.cedulaDividendos.impuestoTotalDividendos > 0, "T177: mixto dividend tax");

  // T178: All income types present
  s = makeState({
    rentasTrabajo: { ...DEFAULT_RENTAS_TRABAJO, salariosYPagosLaborales: 100_000_000 },
    rentasCapital: { ...DEFAULT_RENTAS_CAPITAL, arrendamientos: 30_000_000 },
    rentasNoLaborales: { ...DEFAULT_RENTAS_NO_LABORALES, ingresosComerciales: 50_000_000 },
    cedulaPensiones: { ...DEFAULT_CEDULA_PENSIONES, pensionJubilacion: 20_000 * uvt },
    cedulaDividendos: { ...DEFAULT_CEDULA_DIVIDENDOS, dividendosNoGravados: 1_000 * uvt },
    gananciasOcasionales: { ...DEFAULT_GANANCIAS_OCASIONALES, herenciasDonaciones: 5_000 * uvt },
    deducciones: { ...DEFAULT_DEDUCCIONES, exenta25Porciento: true, dependientes: 2 },
    retencionesAnticipos: { ...DEFAULT_RETENCIONES_ANTICIPOS, retencionFuenteRenta: 30_000_000 },
  });
  r = calcularDeclaracion(s);
  assert(r.liquidacion.impuestoRentaTotal > 0, "T178: all income → tax > 0");
  assert(r.cedulaGeneral.impuestoCedulaGeneral > 0, "T179: general tax");
  assert(r.cedulaPensiones.impuestoCedulaPensiones > 0, "T180: pension tax (over 12k)");
  assert(r.cedulaDividendos.impuestoTotalDividendos > 0, "T181: dividend tax");
  assert(r.gananciasOcasionales.impuestoGanancias > 0, "T182: ganancias tax");

  // T183: Saldo a favor for heavily withheld
  s = makeState({
    rentasTrabajo: { ...DEFAULT_RENTAS_TRABAJO, salariosYPagosLaborales: 80_000_000 },
    deducciones: { ...DEFAULT_DEDUCCIONES, exenta25Porciento: true, dependientes: 3 },
    retencionesAnticipos: {
      ...DEFAULT_RETENCIONES_ANTICIPOS,
      retencionFuenteRenta: 50_000_000,
      anticipoAnoAnterior: 20_000_000,
    },
  });
  r = calcularDeclaracion(s);
  assert(r.liquidacion.saldoFavor > 0, "T183: heavy withholding → saldo a favor");

  // T184-T186: Year affects UVT
  const s2025 = makeState({
    perfil: { ...DEFAULT_PERFIL, anoGravable: 2025 },
    rentasTrabajo: { ...DEFAULT_RENTAS_TRABAJO, salariosYPagosLaborales: 100_000_000 },
    deducciones: { ...DEFAULT_DEDUCCIONES, exenta25Porciento: false },
  });
  const s2024 = makeState({
    perfil: { ...DEFAULT_PERFIL, anoGravable: 2024 },
    rentasTrabajo: { ...DEFAULT_RENTAS_TRABAJO, salariosYPagosLaborales: 100_000_000 },
    deducciones: { ...DEFAULT_DEDUCCIONES, exenta25Porciento: false },
  });
  const r2025 = calcularDeclaracion(s2025);
  const r2024 = calcularDeclaracion(s2024);
  // Same COP income but different UVT → different UVT equivalents
  assert(
    r2025.cedulaGeneral.rentaLiquidaGravableUVT !== r2024.cedulaGeneral.rentaLiquidaGravableUVT,
    "T184: different UVT year → different UVT amount"
  );
  // Lower UVT → more UVTs for same COP → higher tax
  assert(r2024.cedulaGeneral.impuestoCedulaGeneral >= r2025.cedulaGeneral.impuestoCedulaGeneral, "T185: lower UVT → higher or equal tax");

  // T186: 2026 UVT
  const s2026 = makeState({
    perfil: { ...DEFAULT_PERFIL, anoGravable: 2026 },
    rentasTrabajo: { ...DEFAULT_RENTAS_TRABAJO, salariosYPagosLaborales: 100_000_000 },
    deducciones: { ...DEFAULT_DEDUCCIONES, exenta25Porciento: false },
  });
  const r2026 = calcularDeclaracion(s2026);
  assert(r2026.cedulaGeneral.impuestoCedulaGeneral >= 0, "T186: 2026 UVT works");

  // T187-T192: Sugerencias
  s = makeState({
    rentasTrabajo: { ...DEFAULT_RENTAS_TRABAJO, salariosYPagosLaborales: 200_000_000 },
    deducciones: { ...DEFAULT_DEDUCCIONES, exenta25Porciento: false, dependientes: 0 },
  });
  r = calcularDeclaracion(s);
  assert(r.sugerencias.length > 0, "T187: suggestions generated");
  assert(r.sugerencias.some((s) => s.id === "exenta-25"), "T188: exenta-25 suggestion");
  assert(r.sugerencias.some((s) => s.id === "afc-fvp"), "T189: afc-fvp suggestion");
  assert(r.sugerencias.some((s) => s.id === "dependientes"), "T190: dependientes suggestion");
  assert(r.sugerencias.some((s) => s.id === "intereses-vivienda"), "T191: vivienda suggestion");
  assert(r.sugerencias.some((s) => s.id === "medicina-prepagada"), "T192: medicina suggestion");
}

// ══════════════════════════════════════════════════════════
// SECTION 12: EDGE CASES (28 tests)
// ══════════════════════════════════════════════════════════

function testEdgeCases() {
  const uvt = UVT_2025;

  // T193: Very large numbers don't overflow
  let s = makeState({
    rentasTrabajo: { ...DEFAULT_RENTAS_TRABAJO, salariosYPagosLaborales: 100_000_000_000 },
    deducciones: { ...DEFAULT_DEDUCCIONES, exenta25Porciento: false },
  });
  let r = calcularDeclaracion(s);
  assert(isFinite(r.cedulaGeneral.impuestoCedulaGeneral), "T193: large numbers finite");
  assert(r.cedulaGeneral.impuestoCedulaGeneral > 0, "T194: large income → tax > 0");

  // T195: 1 COP income
  s = makeState({
    rentasTrabajo: { ...DEFAULT_RENTAS_TRABAJO, salariosYPagosLaborales: 1 },
    deducciones: { ...DEFAULT_DEDUCCIONES, exenta25Porciento: false },
  });
  r = calcularDeclaracion(s);
  assert(r.cedulaGeneral.impuestoCedulaGeneral === 0, "T195: 1 COP → 0 tax");

  // T196: All fields at maximums
  s = makeState({
    rentasTrabajo: {
      salariosYPagosLaborales: 500_000_000,
      honorariosServicios: 200_000_000,
      otrosIngresosTrabajo: 100_000_000,
      aportesObligatoriosSalud: 32_000_000,
      aportesObligatoriosPension: 32_000_000,
      aportesVoluntariosPension: 20_000_000,
      fondoSolidaridad: 10_000_000,
      otrosINCR: 5_000_000,
    },
    rentasCapital: {
      interesesRendimientos: 50_000_000,
      arrendamientos: 100_000_000,
      regalias: 20_000_000,
      otrosIngresosCapital: 30_000_000,
      costosGastosCapital: 40_000_000,
      INCRCapital: 10_000_000,
    },
    rentasNoLaborales: {
      ingresosComerciales: 200_000_000,
      ingresosIndustriales: 50_000_000,
      ingresosAgropecuarios: 30_000_000,
      otrosIngresosNoLaborales: 20_000_000,
      costosGastosNoLaborales: 80_000_000,
      INCRNoLaborales: 10_000_000,
    },
    cedulaPensiones: {
      pensionJubilacion: 30_000 * uvt,
      pensionSobreviviente: 5_000 * uvt,
      pensionInvalidez: 0,
      otrasPensiones: 2_000 * uvt,
      aportesObligatoriosSalud: 4_000 * uvt,
    },
    cedulaDividendos: {
      dividendosNoGravados2016: 1_000 * uvt,
      dividendosNoGravados: 5_000 * uvt,
      dividendosGravados: 3_000 * uvt,
      participacionesNoGravadas: 500 * uvt,
      participacionesGravadas: 200 * uvt,
    },
    gananciasOcasionales: {
      ventaVivienda: 15_000 * uvt,
      ventaOtrosActivos: 5_000 * uvt,
      herenciasDonaciones: 10_000 * uvt,
      loterias: 500 * uvt,
      indemnizaciones: 1_000 * uvt,
      otrasGanancias: 500 * uvt,
      costosGanancias: 5_000 * uvt,
    },
    deducciones: {
      exenta25Porciento: true,
      dependientes: 4,
      interesesVivienda: 60_000_000,
      medicinaPrepagada: 10_000_000,
      aportesAFC: 50_000_000,
      aportesFVP: 20_000_000,
      pensionesVoluntarias: 30_000_000,
      donaciones: 10_000_000,
      GMFDeducible: 5_000_000,
      otrasDeducciones: 3_000_000,
    },
    retencionesAnticipos: {
      retencionFuenteRenta: 100_000_000,
      retencionFuenteOtros: 20_000_000,
      anticipoAnoAnterior: 30_000_000,
      saldoFavorAnterior: 10_000_000,
      retencionDividendos: 15_000_000,
    },
  });
  r = calcularDeclaracion(s);
  assert(isFinite(r.liquidacion.impuestoRentaTotal), "T196: max fields → finite total");
  assert(r.liquidacion.impuestoRentaTotal > 0, "T197: max fields → tax > 0");
  assert(r.cedulaGeneral.rentaLiquidaGravable >= 0, "T198: gravable ≥ 0");
  assert(r.cedulaGeneral.combinadoCapped === true, "T199: combined cap hit with max");
  assert(r.cedulaPensiones.impuestoCedulaPensiones > 0, "T200: pension tax with max");
  assert(r.cedulaDividendos.impuestoTotalDividendos > 0, "T201: dividend tax with max");
  assert(r.gananciasOcasionales.impuestoGanancias > 0, "T202: ganancias tax with max");
  assert(Array.isArray(r.sugerencias), "T203: sugerencias is an array");

  // T204: Deducción dependientes capped to renta liquida
  s = makeState({
    rentasTrabajo: { ...DEFAULT_RENTAS_TRABAJO, salariosYPagosLaborales: 10_000_000 },
    deducciones: { ...DEFAULT_DEDUCCIONES, exenta25Porciento: false, dependientes: 4 },
  });
  r = calcularDeclaracion(s);
  // 4 dep * 72 * 12 * uvt would be huge, but capped to renta liquida + combined cap
  assert(r.cedulaGeneral.rentaLiquidaGravable >= 0, "T204: dependientes cant make gravable negative");

  // T205: NaN protection
  s = makeState({
    rentasTrabajo: { ...DEFAULT_RENTAS_TRABAJO, salariosYPagosLaborales: 0 },
    deducciones: { ...DEFAULT_DEDUCCIONES, exenta25Porciento: true },
  });
  r = calcularDeclaracion(s);
  assert(!isNaN(r.tasaEfectivaGlobal), "T205: 0/0 → 0 not NaN");

  // T206-T208: Negative protection (values should never be negative)
  assert(r.cedulaGeneral.impuestoCedulaGeneral >= 0, "T206: general tax ≥ 0");
  assert(r.cedulaPensiones.impuestoCedulaPensiones >= 0, "T207: pension tax ≥ 0");
  assert(r.liquidacion.impuestoNeto >= 0, "T208: impuesto neto ≥ 0");

  // T209-T212: Breakdown consistency
  s = makeState({
    rentasTrabajo: { ...DEFAULT_RENTAS_TRABAJO, salariosYPagosLaborales: 300_000_000 },
    deducciones: { ...DEFAULT_DEDUCCIONES, exenta25Porciento: false },
  });
  r = calcularDeclaracion(s);
  for (const b of r.breakdown) {
    assert(b.rate >= 0 && b.rate <= 0.39, `T209: rate ${b.rate} in [0, 0.39]`);
    assert(b.baseUVT >= 0, `T210: baseUVT ≥ 0`);
    assert(b.impuestoCOP >= 0, `T211: impuestoCOP ≥ 0`);
    assert(b.impuestoUVT >= 0, `T212: impuestoUVT ≥ 0`);
  }

  // T213-T215: Invariants
  // saldoPagar * saldoFavor should always be 0 (mutually exclusive)
  for (const income of [0, 50_000_000, 200_000_000, 500_000_000]) {
    s = makeState({
      rentasTrabajo: { ...DEFAULT_RENTAS_TRABAJO, salariosYPagosLaborales: income },
      deducciones: { ...DEFAULT_DEDUCCIONES, exenta25Porciento: false },
      retencionesAnticipos: { ...DEFAULT_RETENCIONES_ANTICIPOS, retencionFuenteRenta: income * 0.15 },
    });
    r = calcularDeclaracion(s);
    assert(
      r.liquidacion.saldoPagar === 0 || r.liquidacion.saldoFavor === 0,
      `T213: mutually exclusive for income ${income}`
    );
  }

  // T214: Patrimonio doesn't affect income tax
  const sNoPatr = makeState({
    rentasTrabajo: { ...DEFAULT_RENTAS_TRABAJO, salariosYPagosLaborales: 100_000_000 },
    deducciones: { ...DEFAULT_DEDUCCIONES, exenta25Porciento: false },
  });
  const sWithPatr = makeState({
    rentasTrabajo: { ...DEFAULT_RENTAS_TRABAJO, salariosYPagosLaborales: 100_000_000 },
    patrimonio: {
      bienes: [{ id: "1", tipo: "inmueble", descripcion: "Casa", valorFiscal: 1_000_000_000, pais: "colombia" }],
      deudas: [],
    },
    deducciones: { ...DEFAULT_DEDUCCIONES, exenta25Porciento: false },
  });
  const rNoP = calcularDeclaracion(sNoPatr);
  const rWithP = calcularDeclaracion(sWithPatr);
  assert(
    rNoP.cedulaGeneral.impuestoCedulaGeneral === rWithP.cedulaGeneral.impuestoCedulaGeneral,
    "T214: patrimonio doesn't affect income tax"
  );

  // T215: Cédulas are independent
  const sOnlyWork = makeState({
    rentasTrabajo: { ...DEFAULT_RENTAS_TRABAJO, salariosYPagosLaborales: 100_000_000 },
    deducciones: { ...DEFAULT_DEDUCCIONES, exenta25Porciento: false },
  });
  const sWorkAndPension = makeState({
    rentasTrabajo: { ...DEFAULT_RENTAS_TRABAJO, salariosYPagosLaborales: 100_000_000 },
    cedulaPensiones: { ...DEFAULT_CEDULA_PENSIONES, pensionJubilacion: 15_000 * uvt },
    deducciones: { ...DEFAULT_DEDUCCIONES, exenta25Porciento: false },
  });
  const rOW = calcularDeclaracion(sOnlyWork);
  const rWP = calcularDeclaracion(sWorkAndPension);
  assert(
    rOW.cedulaGeneral.impuestoCedulaGeneral === rWP.cedulaGeneral.impuestoCedulaGeneral,
    "T215: pension doesn't affect general tax"
  );

  // T216-T220: Stress tests with round numbers
  for (const mult of [1, 10, 100, 1000, 10000]) {
    s = makeState({
      rentasTrabajo: { ...DEFAULT_RENTAS_TRABAJO, salariosYPagosLaborales: mult * uvt },
      deducciones: { ...DEFAULT_DEDUCCIONES, exenta25Porciento: false },
    });
    r = calcularDeclaracion(s);
    assert(isFinite(r.liquidacion.impuestoRentaTotal), `T${215 + mult > 4 ? 220 : 216}: stress ${mult} UVT finite`);
    assert(r.liquidacion.impuestoRentaTotal >= 0, `T${215 + mult}: stress ${mult} UVT ≥ 0`);
  }
}

// ══════════════════════════════════════════════════════════
// SECTION 13: PERFECCIONAMIENTO — Bug fixes & coverage (30+ tests)
// ══════════════════════════════════════════════════════════

function testPerfeccionamiento() {
  const uvt = UVT_2025;

  // ── Anticipo 3-tier (Art. 807 ET) ──────────────────────

  // T221: Anticipo segundo año = 50%
  let s = makeState({
    perfil: { ...DEFAULT_PERFIL, anosDeclarando: 2 },
    rentasTrabajo: { ...DEFAULT_RENTAS_TRABAJO, salariosYPagosLaborales: 200_000_000 },
    deducciones: { ...DEFAULT_DEDUCCIONES, exenta25Porciento: false },
  });
  let r = calcularDeclaracion(s);
  assert(
    r.liquidacion.anticipoSiguienteAno === Math.round(r.liquidacion.impuestoNeto * 0.50),
    "T221: anticipo segundo año = 50%"
  );

  // T222: Anticipo primer año = 25%
  s = makeState({
    perfil: { ...DEFAULT_PERFIL, anosDeclarando: 1 },
    rentasTrabajo: { ...DEFAULT_RENTAS_TRABAJO, salariosYPagosLaborales: 200_000_000 },
    deducciones: { ...DEFAULT_DEDUCCIONES, exenta25Porciento: false },
  });
  r = calcularDeclaracion(s);
  assert(
    r.liquidacion.anticipoSiguienteAno === Math.round(r.liquidacion.impuestoNeto * 0.25),
    "T222: anticipo primer año = 25%"
  );

  // T223: Anticipo tercer año = 75%
  s = makeState({
    perfil: { ...DEFAULT_PERFIL, anosDeclarando: 5 },
    rentasTrabajo: { ...DEFAULT_RENTAS_TRABAJO, salariosYPagosLaborales: 200_000_000 },
    deducciones: { ...DEFAULT_DEDUCCIONES, exenta25Porciento: false },
  });
  r = calcularDeclaracion(s);
  assert(
    r.liquidacion.anticipoSiguienteAno === Math.round(r.liquidacion.impuestoNeto * 0.75),
    "T223: anticipo tercer+ año = 75%"
  );

  // T224: 50% anticipo produces different result from 25% and 75%
  const s1 = makeState({
    perfil: { ...DEFAULT_PERFIL, anosDeclarando: 1 },
    rentasTrabajo: { ...DEFAULT_RENTAS_TRABAJO, salariosYPagosLaborales: 200_000_000 },
    deducciones: { ...DEFAULT_DEDUCCIONES, exenta25Porciento: false },
  });
  const s2 = makeState({
    perfil: { ...DEFAULT_PERFIL, anosDeclarando: 2 },
    rentasTrabajo: { ...DEFAULT_RENTAS_TRABAJO, salariosYPagosLaborales: 200_000_000 },
    deducciones: { ...DEFAULT_DEDUCCIONES, exenta25Porciento: false },
  });
  const s3 = makeState({
    perfil: { ...DEFAULT_PERFIL, anosDeclarando: 3 },
    rentasTrabajo: { ...DEFAULT_RENTAS_TRABAJO, salariosYPagosLaborales: 200_000_000 },
    deducciones: { ...DEFAULT_DEDUCCIONES, exenta25Porciento: false },
  });
  const r1 = calcularDeclaracion(s1);
  const r2 = calcularDeclaracion(s2);
  const r3 = calcularDeclaracion(s3);
  assert(
    r1.liquidacion.anticipoSiguienteAno < r2.liquidacion.anticipoSiguienteAno &&
    r2.liquidacion.anticipoSiguienteAno < r3.liquidacion.anticipoSiguienteAno,
    "T224: 25% < 50% < 75% anticipo ordering"
  );

  // ── Lottery bounding fix ──────────────────────────────

  // T225: Lottery with high costs → lottery tax bounded by gananciaGravable
  s = makeState({
    gananciasOcasionales: {
      ...DEFAULT_GANANCIAS_OCASIONALES,
      loterias: 500 * uvt,
      ventaVivienda: 200 * uvt,
      costosGanancias: 600 * uvt, // Net gains = (500+200) - 600 = 100 UVT
    },
  });
  r = calcularDeclaracion(s);
  // Net: 700-600 = 100 UVT. Exemptions: lottery 48 UVT + vivienda 200 UVT = 248, capped to 100
  // gananciaGravable = 0
  assert(r.gananciasOcasionales.impuestoGanancias === 0, "T225: lottery bounded when costs eliminate gains");

  // T226: Lottery gravable < gananciaGravable → lottery taxed normally at 20%
  s = makeState({
    gananciasOcasionales: {
      ...DEFAULT_GANANCIAS_OCASIONALES,
      loterias: 200 * uvt,
      indemnizaciones: 500 * uvt,
    },
  });
  r = calcularDeclaracion(s);
  // Brutas = 700 UVT. Exemptions: lottery 48 UVT. Net = 700 UVT (no costs).
  // gananciaGravable = 700 - 48 = 652 UVT
  // Lottery gravable = 200 - 48 = 152 UVT → bounded by gananciaGravable(652) → 152 UVT
  // Lottery tax = 152 * 0.20 = 30.4 UVT
  // Rest tax = (652 - 152) * 0.15 = 500 * 0.15 = 75 UVT
  const expectedLotteryTax226 = Math.round(152 * uvt * 0.20);
  const expectedRestTax226 = Math.round(500 * uvt * 0.15);
  assertApprox(r.gananciasOcasionales.impuestoGanancias, expectedLotteryTax226 + expectedRestTax226, 2, "T226: lottery + rest split correctly");

  // T227: All gains are lottery → all taxed at 20%
  s = makeState({
    gananciasOcasionales: {
      ...DEFAULT_GANANCIAS_OCASIONALES,
      loterias: 1_000 * uvt,
    },
  });
  r = calcularDeclaracion(s);
  // gananciaGravable = 1000 - 48 = 952 UVT
  // impuestoLoteriaGravable = min(952, 952) = 952 UVT → all at 20%
  // rest = 0 → 0 at 15%
  const expectedAllLottery = Math.round(952 * uvt * 0.20);
  assertApprox(r.gananciasOcasionales.impuestoGanancias, expectedAllLottery, 2, "T227: all-lottery → all at 20%");

  // T228: Costs reduce gananciaGravable to 0 → 0 lottery tax
  s = makeState({
    gananciasOcasionales: {
      ...DEFAULT_GANANCIAS_OCASIONALES,
      loterias: 1_000 * uvt,
      costosGanancias: 1_000 * uvt,
    },
  });
  r = calcularDeclaracion(s);
  assert(r.gananciasOcasionales.gananciaGravable === 0, "T228: costs = brutas → gravable 0");
  assert(r.gananciasOcasionales.impuestoGanancias === 0, "T229: 0 gravable → 0 tax");

  // ── ventaVivienda vs ventaOtrosActivos distinction ────

  // T230: ventaVivienda gets 7,500 UVT exemption
  s = makeState({
    gananciasOcasionales: {
      ...DEFAULT_GANANCIAS_OCASIONALES,
      ventaVivienda: 5_000 * uvt,
    },
  });
  r = calcularDeclaracion(s);
  assert(r.gananciasOcasionales.gananciaExenta === 5_000 * uvt, "T230: vivienda under 7500 → full exempt");
  assert(r.gananciasOcasionales.impuestoGanancias === 0, "T231: vivienda exempt → 0 tax");

  // T232: ventaOtrosActivos does NOT get 7,500 UVT exemption
  s = makeState({
    gananciasOcasionales: {
      ...DEFAULT_GANANCIAS_OCASIONALES,
      ventaOtrosActivos: 5_000 * uvt,
    },
  });
  r = calcularDeclaracion(s);
  assert(r.gananciasOcasionales.gananciaExenta === 0, "T232: otros activos → no exemption");
  assert(r.gananciasOcasionales.impuestoGanancias > 0, "T233: otros activos → taxed at 15%");
  const expectedOtros = Math.round(5_000 * uvt * 0.15);
  assertApprox(r.gananciasOcasionales.impuestoGanancias, expectedOtros, 2, "T234: otros activos 15% correct");

  // T235: Both vivienda and otros activos combined
  s = makeState({
    gananciasOcasionales: {
      ...DEFAULT_GANANCIAS_OCASIONALES,
      ventaVivienda: 10_000 * uvt,
      ventaOtrosActivos: 5_000 * uvt,
    },
  });
  r = calcularDeclaracion(s);
  assert(r.gananciasOcasionales.gananciasBrutas === 15_000 * uvt, "T235: combined brutas");
  // Vivienda exempt: 7,500 UVT. Otros: no exemption.
  // Gravable: 15,000 - 7,500 = 7,500 UVT
  assert(r.gananciasOcasionales.gananciaExenta === 7_500 * uvt, "T236: only vivienda exempted");
  const expectedCombined = Math.round(7_500 * uvt * 0.15);
  assertApprox(r.gananciasOcasionales.impuestoGanancias, expectedCombined, 2, "T237: combined tax correct");

  // ── Art. 241 bracket boundary transitions ─────────────

  // T238: Just above 1,700 UVT boundary (entering 28% bracket)
  s = makeState({
    rentasTrabajo: { ...DEFAULT_RENTAS_TRABAJO, salariosYPagosLaborales: 1_701 * uvt },
    deducciones: { ...DEFAULT_DEDUCCIONES, exenta25Porciento: false },
  });
  r = calcularDeclaracion(s);
  // Tax = (1700-1090)*0.19 + (1701-1700)*0.28 = 610*0.19 + 1*0.28 = 115.9 + 0.28 = 116.18 UVT
  const expected1701 = Math.round(116.18 * uvt);
  assertApprox(r.cedulaGeneral.impuestoCedulaGeneral, expected1701, 2, "T238: 1701 UVT boundary");

  // T239: Just above 4,100 UVT boundary (entering 33% bracket)
  s = makeState({
    rentasTrabajo: { ...DEFAULT_RENTAS_TRABAJO, salariosYPagosLaborales: 4_101 * uvt },
    deducciones: { ...DEFAULT_DEDUCCIONES, exenta25Porciento: false },
  });
  r = calcularDeclaracion(s);
  // Tax = 610*0.19 + 2400*0.28 + 1*0.33 = 115.9 + 672 + 0.33 = 788.23 UVT
  const expected4101 = Math.round(788.23 * uvt);
  assertApprox(r.cedulaGeneral.impuestoCedulaGeneral, expected4101, 2, "T239: 4101 UVT boundary");

  // T240: Just above 8,670 UVT boundary (entering 35% bracket)
  s = makeState({
    rentasTrabajo: { ...DEFAULT_RENTAS_TRABAJO, salariosYPagosLaborales: 8_671 * uvt },
    deducciones: { ...DEFAULT_DEDUCCIONES, exenta25Porciento: false },
  });
  r = calcularDeclaracion(s);
  // Tax = 610*0.19 + 2400*0.28 + 4570*0.33 + 1*0.35 = 115.9+672+1508.1+0.35 = 2296.35 UVT
  const expected8671 = Math.round(2296.35 * uvt);
  assertApprox(r.cedulaGeneral.impuestoCedulaGeneral, expected8671, 2, "T240: 8671 UVT boundary");

  // T241: Just above 18,970 UVT boundary (entering 37% bracket)
  s = makeState({
    rentasTrabajo: { ...DEFAULT_RENTAS_TRABAJO, salariosYPagosLaborales: 18_971 * uvt },
    deducciones: { ...DEFAULT_DEDUCCIONES, exenta25Porciento: false },
  });
  r = calcularDeclaracion(s);
  // Tax = ...+10300*0.35 + 1*0.37 = 5901.37 UVT
  const expected18971 = Math.round((115.9 + 672 + 1508.1 + 3605 + 0.37) * uvt);
  assertApprox(r.cedulaGeneral.impuestoCedulaGeneral, expected18971, 2, "T241: 18971 UVT boundary");

  // T242: Just above 31,000 UVT boundary (entering 39% bracket)
  s = makeState({
    rentasTrabajo: { ...DEFAULT_RENTAS_TRABAJO, salariosYPagosLaborales: 31_001 * uvt },
    deducciones: { ...DEFAULT_DEDUCCIONES, exenta25Porciento: false },
  });
  r = calcularDeclaracion(s);
  // Tax = ...+12030*0.37 + 1*0.39 = 10352.49 UVT
  const expected31001 = Math.round((115.9 + 672 + 1508.1 + 3605 + 4451.1 + 0.39) * uvt);
  assertApprox(r.cedulaGeneral.impuestoCedulaGeneral, expected31001, 2, "T242: 31001 UVT boundary");

  // ── Combined exemption cap tests ──────────────────────

  // T243: gananciaExenta capped by gananciasTotales when multiple exemptions exceed net
  s = makeState({
    gananciasOcasionales: {
      ...DEFAULT_GANANCIAS_OCASIONALES,
      ventaVivienda: 10_000 * uvt,
      herenciasDonaciones: 5_000 * uvt,
      loterias: 100 * uvt,
      costosGanancias: 14_000 * uvt,
    },
  });
  r = calcularDeclaracion(s);
  // Brutas = 15,100. Net = 15,100 - 14,000 = 1,100 UVT
  // Raw exemptions: vivienda 7,500 + herencia 3,250 + lottery 48 = 10,798 UVT
  // Capped to gananciasTotales = 1,100 UVT
  assert(r.gananciasOcasionales.gananciaExenta === 1_100 * uvt, "T243: exemptions capped to net gains");
  assert(r.gananciasOcasionales.gananciaGravable === 0, "T244: capped → 0 gravable");

  // ── Integer output verification ───────────────────────

  // T245: All output amounts are integers (no fractional COP)
  s = makeState({
    rentasTrabajo: { ...DEFAULT_RENTAS_TRABAJO, salariosYPagosLaborales: 123_456_789 },
    deducciones: { ...DEFAULT_DEDUCCIONES, exenta25Porciento: true, dependientes: 2 },
    cedulaPensiones: { ...DEFAULT_CEDULA_PENSIONES, pensionJubilacion: 15_000 * uvt },
    gananciasOcasionales: { ...DEFAULT_GANANCIAS_OCASIONALES, loterias: 200 * uvt },
  });
  r = calcularDeclaracion(s);
  assert(Number.isInteger(r.cedulaGeneral.impuestoCedulaGeneral), "T245: general tax is integer");
  assert(Number.isInteger(r.cedulaPensiones.impuestoCedulaPensiones), "T246: pension tax is integer");
  assert(Number.isInteger(r.gananciasOcasionales.impuestoGanancias), "T247: GO tax is integer");
  assert(Number.isInteger(r.liquidacion.impuestoRentaTotal), "T248: total tax is integer");
  assert(Number.isInteger(r.liquidacion.anticipoSiguienteAno), "T249: anticipo is integer");

  // ── Anticipo = 0 when tax = 0 ────────────────────────

  // T250: Zero income → anticipo = 0 for all tiers
  for (const anos of [1, 2, 3]) {
    s = makeState({ perfil: { ...DEFAULT_PERFIL, anosDeclarando: anos } });
    r = calcularDeclaracion(s);
    assert(r.liquidacion.anticipoSiguienteAno === 0, `T250: 0 income + tier ${anos} → anticipo 0`);
  }

  // ── Capital INCR > income clamp ───────────────────────

  // T251: Capital INCR > capital income → clamped to 0
  s = makeState({
    rentasCapital: {
      interesesRendimientos: 10_000_000,
      arrendamientos: 0,
      regalias: 0,
      otrosIngresosCapital: 0,
      costosGastosCapital: 8_000_000,
      INCRCapital: 5_000_000,
    },
    deducciones: { ...DEFAULT_DEDUCCIONES, exenta25Porciento: false },
  });
  r = calcularDeclaracion(s);
  assert(r.cedulaGeneral.rentaLiquidaCapital >= 0, "T251: capital INCR > income → clamped ≥ 0");

  // T252: No-laborales INCR > income → clamped to 0
  s = makeState({
    rentasNoLaborales: {
      ingresosComerciales: 5_000_000,
      ingresosIndustriales: 0,
      ingresosAgropecuarios: 0,
      otrosIngresosNoLaborales: 0,
      costosGastosNoLaborales: 3_000_000,
      INCRNoLaborales: 10_000_000,
    },
    deducciones: { ...DEFAULT_DEDUCCIONES, exenta25Porciento: false },
  });
  r = calcularDeclaracion(s);
  assert(r.cedulaGeneral.rentaLiquidaNoLaborales >= 0, "T252: no-laborales INCR > income → clamped ≥ 0");
}

// ══════════════════════════════════════════════════════════
// RUN ALL TESTS
// ══════════════════════════════════════════════════════════

console.log("═══════════════════════════════════════════════════");
console.log(" Declaración de Renta Engine — Test Suite");
console.log("═══════════════════════════════════════════════════\n");

testInitialState();
testArt241Brackets();
testPatrimonio();
testRentasTrabajo();
testDeducciones();
testPensiones();
testDividendos();
testGananciasOcasionales();
testLiquidacion();
testUmbrales();
testCompleteProfiles();
testEdgeCases();
testPerfeccionamiento();

console.log("\n═══════════════════════════════════════════════════");
console.log(` RESULTS: ${passed} passed, ${failed} failed (${passed + failed} total)`);
console.log("═══════════════════════════════════════════════════");

if (failures.length > 0) {
  console.log("\nFAILURES:");
  for (const f of failures) {
    console.log(`  ${f}`);
  }
}

process.exit(failed > 0 ? 1 : 0);
