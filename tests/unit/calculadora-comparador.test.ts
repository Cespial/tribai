import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  calcLaboral,
  calcIntegral,
  calcIndependiente,
  calculateComparison,
} from "../../src/lib/calculators/comparador-engine";
import {
  UVT_VALUES,
  SMLMV_2026,
  AUXILIO_TRANSPORTE_2026,
} from "../../src/config/tax-data";

const UVT = UVT_VALUES[2026];

describe("calculadora-comparador", () => {
  // ── calcLaboral ──

  it("calcLaboral: auxilio transporte cuando salario ≤ 2 SMLMV", () => {
    const presupuesto = SMLMV_2026 * 1.5;
    const result = calcLaboral(presupuesto, false, UVT);
    assert.equal(result.auxilio, AUXILIO_TRANSPORTE_2026);
  });

  it("calcLaboral: sin auxilio transporte cuando salario > 2 SMLMV", () => {
    const presupuesto = SMLMV_2026 * 5;
    const result = calcLaboral(presupuesto, false, UVT);
    assert.equal(result.auxilio, 0);
  });

  it("calcLaboral: costoEmpresa ≤ presupuesto + 1%", () => {
    const presupuesto = 8_000_000;
    const result = calcLaboral(presupuesto, false, UVT);
    assert.ok(
      result.costoEmpresa <= presupuesto * 1.01,
      `costoEmpresa ${result.costoEmpresa} > presupuesto * 1.01 (${presupuesto * 1.01})`
    );
  });

  it("calcLaboral: netoMensual < salario bruto", () => {
    const result = calcLaboral(5_000_000, false, UVT);
    assert.ok(result.netoMensual < result.salario + result.auxilio);
  });

  it("calcLaboral: pensionado no paga pensión employer ni worker", () => {
    const result = calcLaboral(5_000_000, true, UVT);
    assert.equal(result.pensionEmp, 0);
    assert.equal(result.pensionWorker, 0);
  });

  // ── calcIntegral ──

  it("calcIntegral: requiere ≥ 13 SMLMV, retorna na=true si menor", () => {
    const presupuesto = SMLMV_2026 * 10; // Below minimum
    const result = calcIntegral(presupuesto, false, UVT);
    assert.equal(result.na, true);
  });

  it("calcIntegral: na=false para presupuesto alto", () => {
    const presupuesto = SMLMV_2026 * 20;
    const result = calcIntegral(presupuesto, false, UVT);
    assert.equal(result.na, false);
  });

  it("calcIntegral: base70 = 70% del salario integral", () => {
    const presupuesto = SMLMV_2026 * 20;
    const result = calcIntegral(presupuesto, false, UVT);
    const expected = result.salario * 0.70;
    assert.ok(Math.abs(result.base70 - expected) < 1);
  });

  it("calcIntegral: pensionado no paga pensión", () => {
    const result = calcIntegral(SMLMV_2026 * 20, true, UVT);
    assert.equal(result.pensionEmp, 0);
    assert.equal(result.pensionWorker, 0);
  });

  // ── calcIndependiente ──

  it("calcIndependiente: baseSS = 40% del honorario", () => {
    const honorario = 10_000_000;
    const result = calcIndependiente(honorario, false, UVT);
    assert.equal(result.baseSS, honorario * 0.40);
  });

  it("calcIndependiente: pensionado no paga pensión", () => {
    const result = calcIndependiente(5_000_000, true, UVT);
    assert.equal(result.pension, 0);
  });

  it("calcIndependiente: netoMensual = honorario - totalSS", () => {
    const result = calcIndependiente(10_000_000, false, UVT);
    assert.ok(Math.abs(result.netoMensual - (result.honorario - result.totalSS)) < 1);
  });

  // ── calculateComparison ──

  it("calculateComparison: retorna null para presupuesto 0", () => {
    const result = calculateComparison(0, false, 0, UVT);
    assert.equal(result, null);
  });

  it("calculateComparison: retorna null para presupuesto negativo", () => {
    const result = calculateComparison(-1_000_000, false, 0, UVT);
    assert.equal(result, null);
  });

  it("calculateComparison: contiene lab, int, ind y simple", () => {
    const result = calculateComparison(10_000_000, false, 0, UVT);
    assert.ok(result !== null);
    assert.ok("lab" in result);
    assert.ok("int" in result);
    assert.ok("ind" in result);
    assert.ok("simple" in result);
    assert.ok("bestIndex" in result);
  });

  it("calculateComparison: bestIndex es 0, 1, o 2", () => {
    const result = calculateComparison(10_000_000, false, 0, UVT);
    assert.ok(result !== null);
    assert.ok([0, 1, 2].includes(result.bestIndex));
  });
});
