import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  PATRIMONIO_BRACKETS,
  PATRIMONIO_THRESHOLD_UVT,
  PATRIMONIO_VIVIENDA_EXCLUSION_UVT,
} from "../../src/config/tax-data-ganancias";

function calcPatrimonio(patrimonioUVT: number): number {
  if (patrimonioUVT <= 0) return 0;
  for (let i = PATRIMONIO_BRACKETS.length - 1; i >= 0; i--) {
    const b = PATRIMONIO_BRACKETS[i];
    if (patrimonioUVT > b.from) {
      return (patrimonioUVT - b.from) * b.rate + b.base;
    }
  }
  return 0;
}

describe("calculadora-patrimonio", () => {
  it("patrimonio ≤ 40,000 UVT = $0 impuesto", () => {
    assert.equal(calcPatrimonio(0), 0);
    assert.equal(calcPatrimonio(30_000), 0);
    assert.equal(calcPatrimonio(40_000), 0);
  });

  it("patrimonio 50,000 UVT = primer tramo (0.5%)", () => {
    const impuesto = calcPatrimonio(50_000);
    // (50000 - 40000) * 0.005 + 0 = 50
    assert.ok(Math.abs(impuesto - 50) < 0.01);
  });

  it("patrimonio 100,000 UVT cruza 2 tramos", () => {
    const impuesto = calcPatrimonio(100_000);
    // Bracket 2: from 70000, rate 0.010, base 150
    // (100000 - 70000) * 0.010 + 150 = 300 + 150 = 450
    assert.ok(Math.abs(impuesto - 450) < 0.01);
  });

  it("impuesto es monotónicamente creciente", () => {
    let prev = 0;
    for (let uvt = 0; uvt <= 500_000; uvt += 10_000) {
      const current = calcPatrimonio(uvt);
      assert.ok(current >= prev, `Impuesto decrece en ${uvt} UVT`);
      prev = current;
    }
  });

  it("constantes de umbral son correctas", () => {
    assert.equal(PATRIMONIO_THRESHOLD_UVT, 40_000);
    assert.equal(PATRIMONIO_VIVIENDA_EXCLUSION_UVT, 12_000);
  });
});
