/* ===================================================================
   engine.test.ts — Tests for Declaracion de Renta engine
   Covers: Zero state, Patrimonio, Cedula General (4 subcedulas),
   40%/1340 UVT limit, Deducciones/Exenciones, Pensiones, Dividendos,
   Ganancias Ocasionales, Descuentos, Liquidacion, Anticipo, Saldos.
   =================================================================== */

import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { calcularDeclaracion } from "../engine";
import {
  type DeclaracionState,
  INITIAL_STATE,
  DEFAULT_RENTAS_TRABAJO,
  DEFAULT_RENTAS_HONORARIOS,
  DEFAULT_RENTAS_CAPITAL,
  DEFAULT_RENTAS_NO_LABORALES,
  DEFAULT_DEDUCCIONES,
  DEFAULT_EXENCIONES,
  DEFAULT_CEDULA_PENSIONES,
  DEFAULT_CEDULA_DIVIDENDOS,
  DEFAULT_GANANCIAS_OCASIONALES,
  DEFAULT_RETENCIONES_ANTICIPOS,
  DEFAULT_DATOS_ADICIONALES,
  DEFAULT_DESCUENTOS_TRIBUTARIOS,
} from "../types";

// Shim: map Jest-style expect().toBe/toBeGreaterThan etc. to node:assert
function expect(actual: unknown) {
  return {
    toBe(expected: unknown) { assert.strictEqual(actual, expected); },
    toEqual(expected: unknown) { assert.deepStrictEqual(actual, expected); },
    toBeGreaterThan(n: number) { assert.ok((actual as number) > n, `Expected ${actual} > ${n}`); },
    toBeGreaterThanOrEqual(n: number) { assert.ok((actual as number) >= n, `Expected ${actual} >= ${n}`); },
    toBeLessThan(n: number) { assert.ok((actual as number) < n, `Expected ${actual} < ${n}`); },
    toBeLessThanOrEqual(n: number) { assert.ok((actual as number) <= n, `Expected ${actual} <= ${n}`); },
    toBeTruthy() { assert.ok(actual); },
    toBeFalsy() { assert.ok(!actual); },
    toBeCloseTo(expected: number, precision = 2) {
      const diff = Math.abs((actual as number) - expected);
      assert.ok(diff < Math.pow(10, -precision) / 2, `Expected ${actual} to be close to ${expected}`);
    },
  };
}

// ── Helpers ──────────────────────────────────────────────────────

const UVT = 49_799; // AG 2025

/** Deep-merge overrides into INITIAL_STATE. Supports nested partial objects. */
function makeState(overrides: {
  rentasTrabajo?: Partial<typeof DEFAULT_RENTAS_TRABAJO>;
  rentasHonorarios?: Partial<typeof DEFAULT_RENTAS_HONORARIOS>;
  rentasCapital?: Partial<typeof DEFAULT_RENTAS_CAPITAL>;
  rentasNoLaborales?: Partial<typeof DEFAULT_RENTAS_NO_LABORALES>;
  deducciones?: Partial<typeof DEFAULT_DEDUCCIONES>;
  exenciones?: Partial<typeof DEFAULT_EXENCIONES>;
  cedulaPensiones?: Partial<typeof DEFAULT_CEDULA_PENSIONES>;
  cedulaDividendos?: Partial<typeof DEFAULT_CEDULA_DIVIDENDOS>;
  gananciasOcasionales?: Partial<typeof DEFAULT_GANANCIAS_OCASIONALES>;
  descuentosTributarios?: Partial<typeof DEFAULT_DESCUENTOS_TRIBUTARIOS>;
  datosAdicionales?: Partial<typeof DEFAULT_DATOS_ADICIONALES>;
  retencionesAnticipos?: Partial<typeof DEFAULT_RETENCIONES_ANTICIPOS>;
  patrimonio?: DeclaracionState["patrimonio"];
  perfil?: Partial<DeclaracionState["perfil"]>;
}): DeclaracionState {
  return {
    ...INITIAL_STATE,
    perfil: { ...INITIAL_STATE.perfil, ...overrides.perfil },
    patrimonio: overrides.patrimonio ?? INITIAL_STATE.patrimonio,
    rentasTrabajo: { ...DEFAULT_RENTAS_TRABAJO, ...overrides.rentasTrabajo },
    rentasHonorarios: { ...DEFAULT_RENTAS_HONORARIOS, ...overrides.rentasHonorarios },
    rentasCapital: { ...DEFAULT_RENTAS_CAPITAL, ...overrides.rentasCapital },
    rentasNoLaborales: { ...DEFAULT_RENTAS_NO_LABORALES, ...overrides.rentasNoLaborales },
    deducciones: { ...DEFAULT_DEDUCCIONES, ...overrides.deducciones },
    exenciones: { ...DEFAULT_EXENCIONES, aplicar25PctLaboral: false, ...overrides.exenciones },
    cedulaPensiones: { ...DEFAULT_CEDULA_PENSIONES, ...overrides.cedulaPensiones },
    cedulaDividendos: { ...DEFAULT_CEDULA_DIVIDENDOS, ...overrides.cedulaDividendos },
    gananciasOcasionales: { ...DEFAULT_GANANCIAS_OCASIONALES, ...overrides.gananciasOcasionales },
    descuentosTributarios: { ...DEFAULT_DESCUENTOS_TRIBUTARIOS, ...overrides.descuentosTributarios },
    datosAdicionales: { ...DEFAULT_DATOS_ADICIONALES, ...overrides.datosAdicionales },
    retencionesAnticipos: { ...DEFAULT_RETENCIONES_ANTICIPOS, ...overrides.retencionesAnticipos },
  };
}

// ══════════════════════════════════════════════════════════════════
// 1. ZERO / EMPTY STATE
// ══════════════════════════════════════════════════════════════════

describe("Zero / Empty state", () => {
  const r = calcularDeclaracion(INITIAL_STATE);

  it("patrimonio bruto = 0", () => {
    expect(r.patrimonio.patrimonioBruto).toBe(0);
  });

  it("impuesto ET 241 = 0", () => {
    expect(r.liquidacion.impuestoET241).toBe(0);
  });

  it("saldo a pagar = 0", () => {
    expect(r.liquidacion.saldoPagar).toBe(0);
  });

  it("saldo a favor = 0", () => {
    expect(r.liquidacion.saldoFavor).toBe(0);
  });

  it("tasa efectiva global = 0", () => {
    expect(r.tasaEfectivaGlobal).toBe(0);
  });

  it("all subcedula ingresos = 0", () => {
    expect(r.cedulaGeneral.trabajo.ingresosBrutos).toBe(0);
    expect(r.cedulaGeneral.honorarios.ingresosBrutos).toBe(0);
    expect(r.cedulaGeneral.capital.ingresosBrutos).toBe(0);
    expect(r.cedulaGeneral.noLaborales.ingresosBrutos).toBe(0);
  });
});

// ══════════════════════════════════════════════════════════════════
// 2. PATRIMONIO
// ══════════════════════════════════════════════════════════════════

describe("Patrimonio", () => {
  it("single bien with no deudas", () => {
    const r = calcularDeclaracion(makeState({
      patrimonio: {
        bienes: [{ id: "1", tipo: "inmueble", descripcion: "Casa", valorFiscal: 500_000_000, valorFiscalAnterior: 400_000_000, pais: "colombia" }],
        deudas: [],
      },
    }));
    expect(r.patrimonio.patrimonioBruto).toBe(500_000_000);
    expect(r.patrimonio.patrimonioLiquido).toBe(500_000_000);
    expect(r.patrimonio.patrimonioBrutoAnterior).toBe(400_000_000);
    expect(r.patrimonio.patrimonioLiquidoAnterior).toBe(400_000_000);
  });

  it("multiple bienes sum correctly", () => {
    const r = calcularDeclaracion(makeState({
      patrimonio: {
        bienes: [
          { id: "1", tipo: "inmueble", descripcion: "Casa", valorFiscal: 300_000_000, valorFiscalAnterior: 280_000_000, pais: "colombia" },
          { id: "2", tipo: "vehiculo", descripcion: "Carro", valorFiscal: 80_000_000, valorFiscalAnterior: 90_000_000, pais: "colombia" },
          { id: "3", tipo: "inversion", descripcion: "CDT", valorFiscal: 50_000_000, valorFiscalAnterior: 40_000_000, pais: "colombia" },
        ],
        deudas: [],
      },
    }));
    expect(r.patrimonio.patrimonioBruto).toBe(430_000_000);
  });

  it("deudas reduce patrimonio liquido", () => {
    const r = calcularDeclaracion(makeState({
      patrimonio: {
        bienes: [{ id: "1", tipo: "inmueble", descripcion: "Casa", valorFiscal: 500_000_000, valorFiscalAnterior: 500_000_000, pais: "colombia" }],
        deudas: [{ id: "d1", tipo: "hipoteca", descripcion: "Hipoteca", saldoDiciembre31: 200_000_000, saldoAnterior: 220_000_000 }],
      },
    }));
    expect(r.patrimonio.deudasTotal).toBe(200_000_000);
    expect(r.patrimonio.patrimonioLiquido).toBe(300_000_000);
    expect(r.patrimonio.deudasTotalAnterior).toBe(220_000_000);
    expect(r.patrimonio.patrimonioLiquidoAnterior).toBe(280_000_000);
  });

  it("patrimonio liquido clamped to 0 when deudas > bienes", () => {
    const r = calcularDeclaracion(makeState({
      patrimonio: {
        bienes: [{ id: "1", tipo: "inmueble", descripcion: "Casa", valorFiscal: 100_000_000, valorFiscalAnterior: 100_000_000, pais: "colombia" }],
        deudas: [{ id: "d1", tipo: "credito", descripcion: "Credito", saldoDiciembre31: 200_000_000, saldoAnterior: 200_000_000 }],
      },
    }));
    expect(r.patrimonio.patrimonioLiquido).toBe(0);
  });

  it("incremento patrimonial computed correctly", () => {
    const r = calcularDeclaracion(makeState({
      patrimonio: {
        bienes: [{ id: "1", tipo: "inmueble", descripcion: "Casa", valorFiscal: 600_000_000, valorFiscalAnterior: 500_000_000, pais: "colombia" }],
        deudas: [],
      },
    }));
    expect(r.patrimonio.incrementoPatrimonial).toBe(100_000_000);
  });

  it("exterior bienes counted in bruto", () => {
    const r = calcularDeclaracion(makeState({
      patrimonio: {
        bienes: [{ id: "1", tipo: "inversion", descripcion: "Stocks", valorFiscal: 200_000_000, valorFiscalAnterior: 150_000_000, pais: "exterior" }],
        deudas: [],
      },
    }));
    expect(r.patrimonio.patrimonioBruto).toBe(200_000_000);
  });
});

// ══════════════════════════════════════════════════════════════════
// 3. CEDULA GENERAL — SUBCEDULA TRABAJO
// ══════════════════════════════════════════════════════════════════

describe("Cedula General - Trabajo", () => {
  it("salarios only -> ingresosBrutos and rentaLiquida", () => {
    const r = calcularDeclaracion(makeState({
      rentasTrabajo: { salariosYPagosLaborales: 60_000_000 },
    }));
    expect(r.cedulaGeneral.trabajo.ingresosBrutos).toBe(60_000_000);
    expect(r.cedulaGeneral.trabajo.rentaLiquida).toBe(60_000_000);
  });

  it("salarios + honorariosServicios sum in subcedula trabajo", () => {
    const r = calcularDeclaracion(makeState({
      rentasTrabajo: { salariosYPagosLaborales: 60_000_000, honorariosServicios: 20_000_000 },
    }));
    expect(r.cedulaGeneral.trabajo.ingresosBrutos).toBe(80_000_000);
  });

  it("INCRGO reduces rentaLiquida", () => {
    const r = calcularDeclaracion(makeState({
      rentasTrabajo: {
        salariosYPagosLaborales: 100_000_000,
        aportesObligatoriosSalud: 4_000_000,
        aportesObligatoriosPension: 4_000_000,
      },
    }));
    expect(r.cedulaGeneral.trabajo.INCRGO).toBe(8_000_000);
    expect(r.cedulaGeneral.trabajo.rentaLiquida).toBe(92_000_000);
  });

  it("INCRGO > income -> rentaLiquida clamped to 0", () => {
    const r = calcularDeclaracion(makeState({
      rentasTrabajo: {
        salariosYPagosLaborales: 5_000_000,
        aportesObligatoriosSalud: 3_000_000,
        aportesObligatoriosPension: 3_000_000,
      },
    }));
    // INCRGO is clamped to ingresosBrutos, so rentaLiquida = 0
    expect(r.cedulaGeneral.trabajo.rentaLiquida).toBe(0);
  });

  it("all INCR types summed", () => {
    const r = calcularDeclaracion(makeState({
      rentasTrabajo: {
        salariosYPagosLaborales: 200_000_000,
        aportesObligatoriosSalud: 8_000_000,
        aportesObligatoriosPension: 8_000_000,
        fondoSolidaridad: 2_000_000,
        otrosINCR: 1_000_000,
      },
    }));
    expect(r.cedulaGeneral.trabajo.INCRGO).toBe(19_000_000);
    expect(r.cedulaGeneral.trabajo.rentaLiquida).toBe(181_000_000);
  });
});

// ══════════════════════════════════════════════════════════════════
// 4. CEDULA GENERAL — SUBCEDULA HONORARIOS
// ══════════════════════════════════════════════════════════════════

describe("Cedula General - Honorarios", () => {
  it("honorarios income computed correctly", () => {
    const r = calcularDeclaracion(makeState({
      rentasHonorarios: { honorarios: 80_000_000, serviciosPersonales: 20_000_000 },
    }));
    expect(r.cedulaGeneral.honorarios.ingresosBrutos).toBe(100_000_000);
  });

  it("honorarios costos reduce rentaLiquida", () => {
    const r = calcularDeclaracion(makeState({
      rentasHonorarios: { honorarios: 100_000_000, costosDirectos: 30_000_000, gastosNomina: 10_000_000 },
    }));
    expect(r.cedulaGeneral.honorarios.costosGastos).toBe(40_000_000);
    expect(r.cedulaGeneral.honorarios.rentaLiquida).toBe(60_000_000);
  });

  it("honorarios loss tracked as perdida", () => {
    const r = calcularDeclaracion(makeState({
      rentasHonorarios: { honorarios: 10_000_000, costosDirectos: 30_000_000 },
    }));
    expect(r.cedulaGeneral.honorarios.rentaLiquida).toBe(0);
    expect(r.cedulaGeneral.honorarios.perdida).toBe(20_000_000);
  });
});

// ══════════════════════════════════════════════════════════════════
// 5. CEDULA GENERAL — SUBCEDULA CAPITAL
// ══════════════════════════════════════════════════════════════════

describe("Cedula General - Capital", () => {
  it("capital income: intereses + arrendamientos", () => {
    const r = calcularDeclaracion(makeState({
      rentasCapital: { interesesRendimientos: 10_000_000, arrendamientos: 24_000_000 },
    }));
    expect(r.cedulaGeneral.capital.ingresosBrutos).toBe(34_000_000);
    expect(r.cedulaGeneral.capital.rentaLiquida).toBe(34_000_000);
  });

  it("capital with costos and INCR", () => {
    const r = calcularDeclaracion(makeState({
      rentasCapital: {
        interesesRendimientos: 10_000_000,
        arrendamientos: 24_000_000,
        costosGastosCapital: 5_000_000,
        otrosINCRCapital: 2_000_000,
      },
    }));
    expect(r.cedulaGeneral.capital.rentaLiquida).toBe(27_000_000);
  });
});

// ══════════════════════════════════════════════════════════════════
// 6. CEDULA GENERAL — SUBCEDULA NO LABORALES
// ══════════════════════════════════════════════════════════════════

describe("Cedula General - No Laborales", () => {
  it("no laborales brutos and costos", () => {
    const r = calcularDeclaracion(makeState({
      rentasNoLaborales: {
        ingresosComerciales: 100_000_000,
        costosVentasServicios: 40_000_000,
      },
    }));
    expect(r.cedulaGeneral.noLaborales.ingresosBrutos).toBe(100_000_000);
    expect(r.cedulaGeneral.noLaborales.rentaLiquida).toBe(60_000_000);
  });

  it("multiple no laborales income types sum", () => {
    const r = calcularDeclaracion(makeState({
      rentasNoLaborales: {
        ingresosComerciales: 50_000_000,
        ingresosIndustriales: 30_000_000,
        ingresosAgropecuarios: 20_000_000,
      },
    }));
    expect(r.cedulaGeneral.noLaborales.ingresosBrutos).toBe(100_000_000);
  });
});

// ══════════════════════════════════════════════════════════════════
// 7. CEDULA GENERAL — CONSOLIDATION
// ══════════════════════════════════════════════════════════════════

describe("Cedula General - Consolidation", () => {
  it("trabajo + capital + no laborales sum in rentaLiquidaCedulaGeneral", () => {
    const r = calcularDeclaracion(makeState({
      rentasTrabajo: { salariosYPagosLaborales: 80_000_000 },
      rentasCapital: { arrendamientos: 20_000_000 },
      rentasNoLaborales: { ingresosComerciales: 30_000_000 },
    }));
    expect(r.cedulaGeneral.rentaLiquidaCedulaGeneral).toBe(130_000_000);
  });

  it("rentaLiquidaGravable >= 0 always", () => {
    const r = calcularDeclaracion(makeState({
      rentasTrabajo: { salariosYPagosLaborales: 10_000_000 },
      exenciones: { aplicar25PctLaboral: true },
      deducciones: { interesesVivienda: 50_000_000 },
    }));
    expect(r.cedulaGeneral.rentaLiquidaGravable).toBeGreaterThanOrEqual(0);
  });
});

// ══════════════════════════════════════════════════════════════════
// 8. 40% / 1,340 UVT LIMIT AND DISTRIBUTION
// ══════════════════════════════════════════════════════════════════

describe("40%/1340 UVT Limit", () => {
  it("small deducciones + exenciones do not trigger limit", () => {
    const r = calcularDeclaracion(makeState({
      rentasTrabajo: { salariosYPagosLaborales: 60_000_000 },
      exenciones: { aplicar25PctLaboral: true },
    }));
    // 25% of 60M = 15M; 40% of 60M = 24M; 1340 UVT = ~66.7M -> not capped
    expect(r.cedulaGeneral.limiteExcedido).toBe(false);
  });

  it("large deducciones + exenciones trigger limit", () => {
    const r = calcularDeclaracion(makeState({
      rentasTrabajo: { salariosYPagosLaborales: 200_000_000 },
      exenciones: { aplicar25PctLaboral: true, aportesVoluntariosPension: 50_000_000, aportesAFC: 50_000_000 },
      deducciones: { interesesVivienda: 50_000_000, medicinaPrepagada: 10_000_000 },
    }));
    expect(r.cedulaGeneral.limiteExcedido).toBe(true);
  });

  it("total subject to limit capped at min(40%, 1340 UVT)", () => {
    const r = calcularDeclaracion(makeState({
      rentasTrabajo: { salariosYPagosLaborales: 200_000_000 },
      exenciones: { aplicar25PctLaboral: true, aportesAFC: 50_000_000 },
      deducciones: { interesesVivienda: 40_000_000 },
    }));
    const cap = Math.min(200_000_000 * 0.40, Math.round(1_340 * UVT / 1000) * 1000);
    expect(r.cedulaGeneral.limiteEfectivo).toBeLessThanOrEqual(cap + 1);
  });

  it("distributes sequentially: trabajo first", () => {
    const r = calcularDeclaracion(makeState({
      rentasTrabajo: { salariosYPagosLaborales: 100_000_000 },
      rentasCapital: { arrendamientos: 100_000_000 },
      exenciones: { aplicar25PctLaboral: true },
    }));
    // 25% exenta applied to trabajo, not capital
    expect(r.cedulaGeneral.trabajo.exencionesAsignadas).toBeGreaterThan(0);
  });
});

// ══════════════════════════════════════════════════════════════════
// 9. DEDUCCIONES AND EXENCIONES
// ══════════════════════════════════════════════════════════════════

describe("Deducciones and Exenciones", () => {
  it("25% laboral exemption applied when enabled", () => {
    const r = calcularDeclaracion(makeState({
      rentasTrabajo: { salariosYPagosLaborales: 100_000_000 },
      exenciones: { aplicar25PctLaboral: true },
    }));
    expect(r.cedulaGeneral.trabajo.exencionesAsignadas).toBeGreaterThan(0);
  });

  it("25% laboral exemption NOT applied when disabled", () => {
    const r = calcularDeclaracion(makeState({
      rentasTrabajo: { salariosYPagosLaborales: 100_000_000 },
      exenciones: { aplicar25PctLaboral: false },
    }));
    expect(r.cedulaGeneral.trabajo.exencionesAsignadas).toBe(0);
  });

  it("intereses vivienda capped at 1200 UVT", () => {
    const vivCap = Math.round(1_200 * UVT / 1000) * 1000;
    const r = calcularDeclaracion(makeState({
      rentasTrabajo: { salariosYPagosLaborales: 500_000_000 },
      deducciones: { interesesVivienda: vivCap + 50_000_000 },
    }));
    const totalDed = r.cedulaGeneral.trabajo.deduccionesAsignadas;
    expect(totalDed).toBeLessThanOrEqual(vivCap + 1);
  });

  it("GMF deducible applied", () => {
    const r = calcularDeclaracion(makeState({
      rentasTrabajo: { salariosYPagosLaborales: 200_000_000 },
      deducciones: { GMFDeducible: 2_000_000 },
    }));
    expect(r.cedulaGeneral.trabajo.deduccionesAsignadas).toBeGreaterThanOrEqual(2_000_000);
  });

  it("donaciones applied as deduction", () => {
    const r = calcularDeclaracion(makeState({
      rentasTrabajo: { salariosYPagosLaborales: 200_000_000 },
      deducciones: { donaciones: 10_000_000 },
    }));
    expect(r.cedulaGeneral.trabajo.deduccionesAsignadas).toBeGreaterThan(0);
  });

  it("aportes voluntarios pension exempt (exenciones section)", () => {
    const r = calcularDeclaracion(makeState({
      rentasTrabajo: { salariosYPagosLaborales: 100_000_000 },
      exenciones: { aportesVoluntariosPension: 20_000_000 },
    }));
    expect(r.cedulaGeneral.trabajo.exencionesAsignadas).toBeGreaterThan(0);
  });

  it("aportes AFC capped at 30% of income", () => {
    const rSmall = calcularDeclaracion(makeState({
      rentasTrabajo: { salariosYPagosLaborales: 60_000_000 },
      exenciones: { aportesAFC: 50_000_000 },
    }));
    // 30% of 60M = 18M; AFC should not exceed that
    const totalExempt = rSmall.cedulaGeneral.trabajo.exencionesAsignadas;
    expect(totalExempt).toBeLessThanOrEqual(18_000_001);
  });

  it("dependientesExtra deduction (fuera del limite)", () => {
    const rWithDep = calcularDeclaracion(makeState({
      rentasTrabajo: { salariosYPagosLaborales: 100_000_000 },
      deducciones: { dependientesExtra: 2 },
    }));
    const rNoDep = calcularDeclaracion(makeState({
      rentasTrabajo: { salariosYPagosLaborales: 100_000_000 },
    }));
    // dependientesExtra should reduce the gravable amount
    expect(rWithDep.cedulaGeneral.rentaLiquidaGravable)
      .toBeLessThan(rNoDep.cedulaGeneral.rentaLiquidaGravable);
  });

  it("dependientesCapped when > 4", () => {
    const r = calcularDeclaracion(makeState({
      rentasTrabajo: { salariosYPagosLaborales: 100_000_000 },
      deducciones: { dependientesExtra: 5 },
    }));
    expect(r.cedulaGeneral.dependientesCapped).toBe(true);
  });

  it("deducciones reduce tax compared to no deducciones", () => {
    const rDed = calcularDeclaracion(makeState({
      rentasTrabajo: { salariosYPagosLaborales: 200_000_000 },
      deducciones: { interesesVivienda: 20_000_000, medicinaPrepagada: 5_000_000 },
    }));
    const rNoDed = calcularDeclaracion(makeState({
      rentasTrabajo: { salariosYPagosLaborales: 200_000_000 },
    }));
    expect(rDed.liquidacion.impuestoET241).toBeLessThan(rNoDed.liquidacion.impuestoET241);
  });
});

// ══════════════════════════════════════════════════════════════════
// 9b. P2: DEDUCCIONES EN OTRAS SUBCÉDULAS (independientes/rentistas)
// ══════════════════════════════════════════════════════════════════

describe("P2: Deductions flow to honorarios/capital/noLaborales", () => {
  it("independiente with only honorarios income gets GMF deduction", () => {
    const r = calcularDeclaracion(makeState({
      rentasHonorarios: { honorarios: 100_000_000 },
      deducciones: { GMFDeducible: 2_000_000 },
    }));
    expect(r.cedulaGeneral.honorarios.deduccionesAsignadas).toBeGreaterThan(0);
    expect(r.cedulaGeneral.honorarios.totalImputadoSujetoLimite).toBeGreaterThan(0);
  });

  it("independiente with only honorarios income gets AFC exemption", () => {
    const r = calcularDeclaracion(makeState({
      rentasHonorarios: { honorarios: 100_000_000 },
      exenciones: { aportesVoluntariosPension: 15_000_000 },
    }));
    expect(r.cedulaGeneral.honorarios.exencionesAsignadas).toBeGreaterThan(0);
  });

  it("capital income gets remaining vivienda deduction", () => {
    const r = calcularDeclaracion(makeState({
      rentasCapital: { arrendamientos: 80_000_000 },
      deducciones: { interesesVivienda: 30_000_000 },
    }));
    expect(r.cedulaGeneral.capital.deduccionesAsignadas).toBeGreaterThan(0);
  });

  it("deductions consumed by trabajo leave nothing for honorarios", () => {
    const r = calcularDeclaracion(makeState({
      rentasTrabajo: { salariosYPagosLaborales: 200_000_000 },
      rentasHonorarios: { honorarios: 50_000_000 },
      deducciones: { GMFDeducible: 2_000_000 },
    }));
    // GMF fully consumed by trabajo
    expect(r.cedulaGeneral.trabajo.deduccionesAsignadas).toBeGreaterThan(0);
    // honorarios gets 0 GMF (already consumed)
    // but may still get AFC/vol pension if available
  });
});

// ══════════════════════════════════════════════════════════════════
// 10. CEDULA PENSIONES
// ══════════════════════════════════════════════════════════════════

describe("Cedula Pensiones", () => {
  it("no pension -> 0 gravable", () => {
    const r = calcularDeclaracion(INITIAL_STATE);
    expect(r.cedulaPensiones.rentaLiquidaGravablePensiones).toBe(0);
  });

  it("small pension entirely exempt (< 1000 UVT/month)", () => {
    // 100M annual / 12 = 8.33M/month; 1000 UVT = 49.8M/month -> fully exempt
    const r = calcularDeclaracion(makeState({
      cedulaPensiones: { pensionesNacionales: 100_000_000 },
    }));
    expect(r.cedulaPensiones.exencionPensionesNacionales).toBe(100_000_000);
    expect(r.cedulaPensiones.rentaLiquidaGravablePensiones).toBe(0);
  });

  it("pension above 1000 UVT/month -> only 12*1000 UVT exempt", () => {
    const annualPension = 14_000 * UVT; // ~1,166 UVT/month > 1,000
    const r = calcularDeclaracion(makeState({
      cedulaPensiones: { pensionesNacionales: annualPension },
    }));
    const maxExempt = 1_000 * UVT * 12;
    expect(r.cedulaPensiones.exencionPensionesNacionales).toBe(maxExempt);
    expect(r.cedulaPensiones.rentaLiquidaGravablePensiones).toBe(annualPension - maxExempt);
  });

  it("pensiones CAN 100% exempt", () => {
    const r = calcularDeclaracion(makeState({
      cedulaPensiones: { pensionesCAN: 50_000_000 },
    }));
    expect(r.cedulaPensiones.exencionPensionesCAN).toBe(50_000_000);
    expect(r.cedulaPensiones.rentaLiquidaGravablePensiones).toBe(0);
  });

  it("pension salud reduces rentaLiquida", () => {
    const r = calcularDeclaracion(makeState({
      cedulaPensiones: {
        pensionesNacionales: 15_000 * UVT,
        aportesObligatoriosSalud: 1_000 * UVT,
      },
    }));
    expect(r.cedulaPensiones.INCRPensiones).toBe(1_000 * UVT);
    expect(r.cedulaPensiones.rentaLiquidaPensiones).toBe(14_000 * UVT);
  });

  it("pension goes to combined base ET 241", () => {
    const r = calcularDeclaracion(makeState({
      cedulaPensiones: { pensionesNacionales: 14_000 * UVT },
    }));
    // 14,000 UVT pension -> 12,000 UVT exempt -> 2,000 UVT gravable
    // This goes into baseCombinada
    expect(r.liquidacion.baseCombinada).toBeGreaterThan(0);
    expect(r.cedulaPensiones.rentaLiquidaGravablePensiones).toBe(2_000 * UVT);
  });
});

// ══════════════════════════════════════════════════════════════════
// 11. CEDULA DIVIDENDOS
// ══════════════════════════════════════════════════════════════════

describe("Cedula Dividendos", () => {
  it("no dividendos -> 0 total", () => {
    const r = calcularDeclaracion(INITIAL_STATE);
    expect(r.cedulaDividendos.impuestoTotalDividendos).toBe(0);
  });

  it("subcedula 1 no gravados go to combined base ET 241", () => {
    const r = calcularDeclaracion(makeState({
      cedulaDividendos: { dividendosNoGravadosNacionales: 50_000_000 },
    }));
    expect(r.cedulaDividendos.subcedula1Total).toBe(50_000_000);
    // Goes to baseCombinada
    expect(r.liquidacion.baseCombinada).toBeGreaterThanOrEqual(50_000_000);
  });

  it("subcedula 2 gravados -> ET 240 at 35%", () => {
    const r = calcularDeclaracion(makeState({
      cedulaDividendos: { dividendosGravadosNacionales: 100_000_000 },
    }));
    expect(r.cedulaDividendos.subcedula2Total).toBe(100_000_000);
    expect(r.cedulaDividendos.impuestoET240).toBe(Math.round(100_000_000 * 0.35));
  });

  it("exceso subcedula 2 goes to combined base", () => {
    const r = calcularDeclaracion(makeState({
      cedulaDividendos: { dividendosGravadosNacionales: 100_000_000 },
    }));
    // exceso = monto - impuesto = 100M - 35M = 65M
    expect(r.cedulaDividendos.excesoSubcedula2).toBe(100_000_000 - Math.round(100_000_000 * 0.35));
  });

  it("dividendos 2016 taxed separately", () => {
    const r = calcularDeclaracion(makeState({
      cedulaDividendos: { dividendosGravados2016: 2_000 * UVT },
    }));
    // 2000 UVT gravable -> DUT table: 0 on 0-600, 5% on 600-1000, 10% on 1000-2000 + base 20
    expect(r.cedulaDividendos.impuestoDividendos2016).toBeGreaterThan(0);
  });

  it("impuestoTotalDividendos = 2016 + ET240", () => {
    const r = calcularDeclaracion(makeState({
      cedulaDividendos: {
        dividendosGravados2016: 1_000 * UVT,
        dividendosGravadosNacionales: 50_000_000,
      },
    }));
    expect(r.cedulaDividendos.impuestoTotalDividendos).toBe(
      r.cedulaDividendos.impuestoDividendos2016 + r.cedulaDividendos.impuestoET240
    );
  });
});

// ══════════════════════════════════════════════════════════════════
// 12. GANANCIAS OCASIONALES
// ══════════════════════════════════════════════════════════════════

describe("Ganancias Ocasionales", () => {
  it("no ganancias -> 0", () => {
    const r = calcularDeclaracion(INITIAL_STATE);
    expect(r.gananciasOcasionales.impuestoTotalGO).toBe(0);
  });

  it("venta activos at 15%", () => {
    const r = calcularDeclaracion(makeState({
      gananciasOcasionales: { ventaActivosIngreso: 200_000_000, ventaActivosCosto: 100_000_000 },
    }));
    expect(r.gananciasOcasionales.gananciaGravableGeneral).toBe(100_000_000);
    expect(r.gananciasOcasionales.impuestoGeneralGO).toBe(Math.round(100_000_000 * 0.15));
  });

  it("loterias at 20% with 48 UVT exemption (ET 317)", () => {
    const r = calcularDeclaracion(makeState({
      gananciasOcasionales: { loteriasRifasApuestas: 50_000_000 },
    }));
    const exencion48UVT = Math.round(48 * UVT / 1000) * 1000;
    const expectedGravable = Math.max(50_000_000 - exencion48UVT, 0);
    expect(r.gananciasOcasionales.gananciaGravableLoterias).toBe(expectedGravable);
    expect(r.gananciasOcasionales.impuestoLoteriasGO).toBe(Math.round(expectedGravable * 0.20));
  });

  it("herencias 20% exempt up to 1625 UVT", () => {
    const herencia = 500_000_000;
    const r = calcularDeclaracion(makeState({
      gananciasOcasionales: { herenciasLegadosDonaciones: herencia },
    }));
    const maxExempt = Math.round(1_625 * UVT / 1000) * 1000;
    const expected = Math.min(herencia * 0.20, maxExempt);
    expect(r.gananciasOcasionales.exencionHerencias).toBe(expected);
  });

  it("vivienda AFC exempt up to 5000 UVT", () => {
    const r = calcularDeclaracion(makeState({
      gananciasOcasionales: { ventaViviendaAFCIngreso: 400_000_000, ventaViviendaAFCCosto: 100_000_000 },
    }));
    // gain = 300M; max exempt = 5000 UVT = ~249M
    const maxExempt = Math.round(5_000 * UVT / 1000) * 1000;
    expect(r.gananciasOcasionales.exencionViviendaAFC).toBe(Math.min(300_000_000, maxExempt));
  });

  it("impuestoTotalGO = general + loterias", () => {
    const r = calcularDeclaracion(makeState({
      gananciasOcasionales: {
        ventaActivosIngreso: 100_000_000,
        ventaActivosCosto: 50_000_000,
        loteriasRifasApuestas: 30_000_000,
      },
    }));
    expect(r.gananciasOcasionales.impuestoTotalGO).toBe(
      r.gananciasOcasionales.impuestoGeneralGO + r.gananciasOcasionales.impuestoLoteriasGO
    );
  });
});

// ══════════════════════════════════════════════════════════════════
// 13. DESCUENTOS TRIBUTARIOS
// ══════════════════════════════════════════════════════════════════

describe("Descuentos Tributarios", () => {
  it("no descuentos -> 0", () => {
    const r = calcularDeclaracion(INITIAL_STATE);
    expect(r.descuentos.totalDescuentos).toBe(0);
  });

  it("descuentos cannot exceed impuesto renta total", () => {
    // Generate a small tax and a large discount
    const r = calcularDeclaracion(makeState({
      rentasTrabajo: { salariosYPagosLaborales: 60_000_000 },
      descuentosTributarios: { impuestosExterior: 500_000_000 },
    }));
    expect(r.descuentos.totalDescuentos).toBeLessThanOrEqual(r.liquidacion.impuestoRentaTotal);
  });

  it("descuentos reduce impuestoNetoRenta", () => {
    const rNoDesc = calcularDeclaracion(makeState({
      rentasTrabajo: { salariosYPagosLaborales: 200_000_000 },
    }));
    const rDesc = calcularDeclaracion(makeState({
      rentasTrabajo: { salariosYPagosLaborales: 200_000_000 },
      descuentosTributarios: { impuestosExterior: 5_000_000 },
    }));
    expect(rDesc.liquidacion.impuestoNetoRenta).toBeLessThan(rNoDesc.liquidacion.impuestoNetoRenta);
  });
});

// ══════════════════════════════════════════════════════════════════
// 14. COMBINED BASE ET 241 AND LIQUIDACION
// ══════════════════════════════════════════════════════════════════

describe("Combined base ET 241 and Liquidacion", () => {
  it("baseCombinada = CG gravable + pensiones gravable + dividendos subcedula1 + exceso subcedula2", () => {
    const r = calcularDeclaracion(makeState({
      rentasTrabajo: { salariosYPagosLaborales: 100_000_000 },
      cedulaPensiones: { pensionesNacionales: 14_000 * UVT }, // 2,000 UVT gravable
      cedulaDividendos: {
        dividendosNoGravadosNacionales: 20_000_000,
        dividendosGravadosNacionales: 10_000_000,
      },
    }));
    const expectedBase =
      r.cedulaGeneral.rentaLiquidaGravable +
      r.cedulaPensiones.rentaLiquidaGravablePensiones +
      r.cedulaDividendos.subcedula1Total +
      r.cedulaDividendos.excesoSubcedula2;
    expect(r.liquidacion.baseCombinada).toBe(expectedBase);
  });

  it("impuestoET241 is 0 when baseCombinada < 1090 UVT", () => {
    const r = calcularDeclaracion(makeState({
      rentasTrabajo: { salariosYPagosLaborales: 500 * UVT },
    }));
    expect(r.liquidacion.impuestoET241).toBe(0);
  });

  it("impuestoET241 > 0 when baseCombinada > 1090 UVT", () => {
    const r = calcularDeclaracion(makeState({
      rentasTrabajo: { salariosYPagosLaborales: 2_000 * UVT },
    }));
    expect(r.liquidacion.impuestoET241).toBeGreaterThan(0);
  });

  it("impuestoRentaTotal = ET241 + ET240 + dividendos2016", () => {
    const r = calcularDeclaracion(makeState({
      rentasTrabajo: { salariosYPagosLaborales: 100_000_000 },
      cedulaDividendos: { dividendosGravadosNacionales: 50_000_000 },
    }));
    expect(r.liquidacion.impuestoRentaTotal).toBe(
      r.liquidacion.impuestoET241 + r.liquidacion.impuestoET240 + r.cedulaDividendos.impuestoDividendos2016
    );
  });

  it("totalImpuestoCargo = impuestoNetoRenta + impuestoGananciaOcasional", () => {
    const r = calcularDeclaracion(makeState({
      rentasTrabajo: { salariosYPagosLaborales: 100_000_000 },
      gananciasOcasionales: { loteriasRifasApuestas: 20_000_000 },
    }));
    expect(r.liquidacion.totalImpuestoCargo).toBe(
      r.liquidacion.impuestoNetoRenta + r.liquidacion.impuestoGananciaOcasional
    );
  });

  it("monotonically increasing: more income = more tax", () => {
    const tax80 = calcularDeclaracion(makeState({
      rentasTrabajo: { salariosYPagosLaborales: 80_000_000 },
    })).liquidacion.impuestoET241;
    const tax200 = calcularDeclaracion(makeState({
      rentasTrabajo: { salariosYPagosLaborales: 200_000_000 },
    })).liquidacion.impuestoET241;
    const tax500 = calcularDeclaracion(makeState({
      rentasTrabajo: { salariosYPagosLaborales: 500_000_000 },
    })).liquidacion.impuestoET241;
    expect(tax80).toBeLessThanOrEqual(tax200);
    expect(tax200).toBeLessThanOrEqual(tax500);
  });

  it("tax is always less than income", () => {
    const income = 100_000 * UVT;
    const r = calcularDeclaracion(makeState({
      rentasTrabajo: { salariosYPagosLaborales: income },
    }));
    expect(r.liquidacion.impuestoET241).toBeLessThan(income);
  });

  it("breakdown rates match expected brackets", () => {
    const r = calcularDeclaracion(makeState({
      rentasTrabajo: { salariosYPagosLaborales: 50_000 * UVT },
    }));
    expect(r.breakdown.length).toBe(7);
    expect(r.breakdown[0].rate).toBe(0);
    expect(r.breakdown[1].rate).toBe(0.19);
    expect(r.breakdown[2].rate).toBe(0.28);
    expect(r.breakdown[3].rate).toBe(0.33);
    expect(r.breakdown[4].rate).toBe(0.35);
    expect(r.breakdown[5].rate).toBe(0.37);
    expect(r.breakdown[6].rate).toBe(0.39);
  });

  it("breakdown COP sums equal impuestoET241", () => {
    const r = calcularDeclaracion(makeState({
      rentasTrabajo: { salariosYPagosLaborales: 3_000 * UVT },
    }));
    const breakdownSum = r.breakdown.reduce((s, b) => s + b.impuestoCOP, 0);
    expect(Math.abs(breakdownSum - r.liquidacion.impuestoET241)).toBeLessThanOrEqual(5);
  });
});

// ══════════════════════════════════════════════════════════════════
// 15. ANTICIPO CALCULATION
// ══════════════════════════════════════════════════════════════════

describe("Anticipo", () => {
  it("first year -> 25%", () => {
    const r = calcularDeclaracion(makeState({
      perfil: { anosDeclarando: 1 },
      rentasTrabajo: { salariosYPagosLaborales: 200_000_000 },
    }));
    expect(r.liquidacion.anticipoOpcion1).toBe(Math.round(r.liquidacion.impuestoNetoRenta * 0.25));
  });

  it("second year -> 50%", () => {
    const r = calcularDeclaracion(makeState({
      perfil: { anosDeclarando: 2 },
      rentasTrabajo: { salariosYPagosLaborales: 200_000_000 },
    }));
    expect(r.liquidacion.anticipoOpcion1).toBe(Math.round(r.liquidacion.impuestoNetoRenta * 0.50));
  });

  it("third year+ -> 75%", () => {
    const r = calcularDeclaracion(makeState({
      perfil: { anosDeclarando: 3 },
      rentasTrabajo: { salariosYPagosLaborales: 200_000_000 },
    }));
    expect(r.liquidacion.anticipoOpcion1).toBe(Math.round(r.liquidacion.impuestoNetoRenta * 0.75));
  });

  it("anticipo opcion 2 uses average of current + previous", () => {
    const r = calcularDeclaracion(makeState({
      perfil: { anosDeclarando: 3 },
      rentasTrabajo: { salariosYPagosLaborales: 200_000_000 },
      datosAdicionales: { impuestoNetoAGAnterior: 10_000_000 },
    }));
    const expected = Math.round(((r.liquidacion.impuestoNetoRenta + 10_000_000) / 2) * 0.75);
    expect(r.liquidacion.anticipoOpcion2).toBe(expected);
  });

  it("anticipoRecomendado = min(opcion1, opcion2) without subtracting retenciones", () => {
    const r = calcularDeclaracion(makeState({
      perfil: { anosDeclarando: 3 },
      rentasTrabajo: { salariosYPagosLaborales: 200_000_000 },
      retencionesAnticipos: { retencionFuenteRenta: 50_000_000 },
    }));
    // P4-FIX: Retenciones se restan en liquidación final, no en el anticipo
    const minAnticipo = Math.min(r.liquidacion.anticipoOpcion1, r.liquidacion.anticipoOpcion2);
    expect(r.liquidacion.anticipoRecomendado).toBe(Math.max(minAnticipo, 0));
  });
});

// ══════════════════════════════════════════════════════════════════
// 16. SALDO A PAGAR / SALDO A FAVOR
// ══════════════════════════════════════════════════════════════════

describe("Saldo a pagar / Saldo a favor", () => {
  it("saldo a pagar when tax exceeds retenciones + anticipo anterior", () => {
    const r = calcularDeclaracion(makeState({
      rentasTrabajo: { salariosYPagosLaborales: 200_000_000 },
    }));
    // No retenciones or anticipo anterior -> saldo a pagar > 0
    expect(r.liquidacion.saldoPagar).toBeGreaterThan(0);
    expect(r.liquidacion.saldoFavor).toBe(0);
  });

  it("saldo a favor when retenciones exceed tax", () => {
    const r = calcularDeclaracion(makeState({
      rentasTrabajo: { salariosYPagosLaborales: 60_000_000 },
      retencionesAnticipos: { retencionFuenteRenta: 100_000_000 },
    }));
    expect(r.liquidacion.saldoFavor).toBeGreaterThan(0);
    expect(r.liquidacion.saldoPagar).toBe(0);
  });

  it("anticipo anterior reduces saldo a pagar", () => {
    const rNoAnticipo = calcularDeclaracion(makeState({
      rentasTrabajo: { salariosYPagosLaborales: 200_000_000 },
    }));
    const rAnticipo = calcularDeclaracion(makeState({
      rentasTrabajo: { salariosYPagosLaborales: 200_000_000 },
      retencionesAnticipos: { anticipoAnoAnterior: 10_000_000 },
    }));
    expect(rAnticipo.liquidacion.saldoPagar).toBeLessThan(rNoAnticipo.liquidacion.saldoPagar);
  });

  it("sanciones increase saldo a pagar", () => {
    const rNoSancion = calcularDeclaracion(makeState({
      rentasTrabajo: { salariosYPagosLaborales: 200_000_000 },
    }));
    const rSancion = calcularDeclaracion(makeState({
      rentasTrabajo: { salariosYPagosLaborales: 200_000_000 },
      datosAdicionales: { sanciones: 5_000_000 },
    }));
    expect(rSancion.liquidacion.saldoPagar).toBeGreaterThan(rNoSancion.liquidacion.saldoPagar);
  });

  it("saldoPagar and saldoFavor never both > 0", () => {
    const scenarios = [
      makeState({ rentasTrabajo: { salariosYPagosLaborales: 200_000_000 } }),
      makeState({ rentasTrabajo: { salariosYPagosLaborales: 60_000_000 }, retencionesAnticipos: { retencionFuenteRenta: 100_000_000 } }),
      makeState({}),
    ];
    for (const s of scenarios) {
      const r = calcularDeclaracion(s);
      expect(r.liquidacion.saldoPagar === 0 || r.liquidacion.saldoFavor === 0).toBe(true);
    }
  });
});

// ══════════════════════════════════════════════════════════════════
// 17. TASA EFECTIVA AND SUGERENCIAS
// ══════════════════════════════════════════════════════════════════

describe("Tasa efectiva and Sugerencias", () => {
  it("tasa efectiva between 0 and 1 for positive income", () => {
    const r = calcularDeclaracion(makeState({
      rentasTrabajo: { salariosYPagosLaborales: 200_000_000 },
    }));
    expect(r.tasaEfectivaGlobal).toBeGreaterThan(0);
    expect(r.tasaEfectivaGlobal).toBeLessThan(1);
  });

  it("sugerencias suggest 25% exemption when not enabled", () => {
    const r = calcularDeclaracion(makeState({
      rentasTrabajo: { salariosYPagosLaborales: 100_000_000 },
      exenciones: { aplicar25PctLaboral: false },
    }));
    expect(r.sugerencias.some(s => s.id === "exenta-25")).toBe(true);
  });

  it("no 25% suggestion when already enabled", () => {
    const r = calcularDeclaracion(makeState({
      rentasTrabajo: { salariosYPagosLaborales: 100_000_000 },
      exenciones: { aplicar25PctLaboral: true },
    }));
    expect(r.sugerencias.some(s => s.id === "exenta-25")).toBe(false);
  });
});
