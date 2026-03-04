import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  DIVIDENDOS_PN_BRACKETS,
  DIVIDENDOS_NO_GRAVADOS_RATE,
  DIVIDENDOS_DESCUENTO_RATE,
} from "../../src/config/tax-data-ganancias";

function calcDividendosPN(dividendosUVT: number): number {
  if (dividendosUVT <= 0) return 0;
  for (let i = DIVIDENDOS_PN_BRACKETS.length - 1; i >= 0; i--) {
    const b = DIVIDENDOS_PN_BRACKETS[i];
    if (dividendosUVT > b.from) {
      return (dividendosUVT - b.from) * b.rate + b.base;
    }
  }
  return 0;
}

describe("calculadora-dividendos", () => {
  it("dividendos ≤ 1,090 UVT = $0 impuesto", () => {
    assert.equal(calcDividendosPN(0), 0);
    assert.equal(calcDividendosPN(500), 0);
    assert.equal(calcDividendosPN(1_090), 0);
  });

  it("dividendos > 1,090 UVT se gravan al 20%", () => {
    const impuesto = calcDividendosPN(2_000);
    // (2000 - 1090) * 0.20 = 910 * 0.20 = 182
    assert.ok(Math.abs(impuesto - 182) < 0.01);
  });

  it("tarifa no gravados es 35%", () => {
    assert.equal(DIVIDENDOS_NO_GRAVADOS_RATE, 0.35);
  });

  it("descuento dividendos es 19% (Art. 254-1)", () => {
    assert.equal(DIVIDENDOS_DESCUENTO_RATE, 0.19);
  });

  it("brackets son consecutivos", () => {
    for (let i = 1; i < DIVIDENDOS_PN_BRACKETS.length; i++) {
      assert.equal(
        DIVIDENDOS_PN_BRACKETS[i].from,
        DIVIDENDOS_PN_BRACKETS[i - 1].to,
        `Dividendos bracket ${i} no es consecutivo`
      );
    }
  });
});
