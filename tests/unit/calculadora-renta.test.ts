import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { calcLaboral } from "../../src/lib/calculators/comparador-engine";
import { UVT_VALUES, RENTA_BRACKETS } from "../../src/config/tax-data";

const UVT = UVT_VALUES[2026];

/**
 * Reimplements calcImpuestoRenta locally for direct bracket testing.
 * Same logic as comparador-engine.ts (private function).
 */
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

describe("calculadora-renta (Art. 241 ET)", () => {
  it("0–1,090 UVT = $0 impuesto (exento)", () => {
    assert.equal(calcImpuestoRenta(0), 0);
    assert.equal(calcImpuestoRenta(500), 0);
    assert.equal(calcImpuestoRenta(1_090), 0);
  });

  it("1,091 UVT cae en segundo tramo (19%)", () => {
    const impuesto = calcImpuestoRenta(1_091);
    // (1091 - 1090) * 0.19 + 0 = 0.19
    assert.ok(Math.abs(impuesto - 0.19) < 0.01);
  });

  it("1,500 UVT = solo segundo tramo (19%)", () => {
    const impuesto = calcImpuestoRenta(1_500);
    // (1500 - 1090) * 0.19 + 0 = 410 * 0.19 = 77.9
    assert.ok(Math.abs(impuesto - 77.9) < 0.01);
  });

  it("5,000 UVT cruza 4 tramos correctamente", () => {
    const impuesto = calcImpuestoRenta(5_000);
    // Bracket 3: from 4100, rate 0.33, base 788
    // (5000 - 4100) * 0.33 + 788 = 900 * 0.33 + 788 = 297 + 788 = 1085
    assert.ok(Math.abs(impuesto - 1_085) < 0.01);
  });

  it("tasa efectiva razonable para ingreso de 100M COP", () => {
    const ingreso = 100_000_000;
    const rentaLiquidaUVT = ingreso / UVT;
    const impuestoUVT = calcImpuestoRenta(rentaLiquidaUVT);
    const impuestoCOP = impuestoUVT * UVT;
    const tasaEfectiva = impuestoCOP / ingreso;

    // Tasa efectiva entre 5% y 39% for 100M COP (about 1,909 UVT → 2 brackets)
    assert.ok(tasaEfectiva > 0.05, `Tasa demasiado baja: ${(tasaEfectiva * 100).toFixed(1)}%`);
    assert.ok(tasaEfectiva < 0.39, `Tasa demasiado alta: ${(tasaEfectiva * 100).toFixed(1)}%`);
  });

  it("impuesto es monotónicamente creciente", () => {
    let prev = 0;
    for (let uvt = 0; uvt <= 50_000; uvt += 500) {
      const current = calcImpuestoRenta(uvt);
      assert.ok(current >= prev, `Impuesto decrece en ${uvt} UVT`);
      prev = current;
    }
  });

  it("calcLaboral reteFte ≥ 0 para ingreso bajo", () => {
    const result = calcLaboral(2_000_000, false, UVT);
    assert.ok(result.reteFte >= 0);
  });

  it("calcLaboral tasaEfectiva entre 0 y 0.39 para 10M presupuesto", () => {
    const result = calcLaboral(10_000_000, false, UVT);
    assert.ok(result.tasaEfectiva >= 0);
    assert.ok(result.tasaEfectiva < 0.39);
  });
});
