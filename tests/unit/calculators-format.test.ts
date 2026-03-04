import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  clampNumber,
  formatCOP,
  formatPercent,
  formatUVT,
  parseCurrencyInput,
} from "../../src/lib/calculators/format";

describe("calculators/format", () => {
  it("formatea COP redondeando al entero más cercano", () => {
    assert.equal(formatCOP(1234.56), "$1.235");
  });

  it("formatea COP con valores negativos", () => {
    assert.equal(formatCOP(-1999.6), "$-2.000");
  });

  it("formatea UVT con dos decimales por defecto", () => {
    assert.equal(formatUVT(12.3456), "12.35 UVT");
  });

  it("formatea UVT con precisión personalizada", () => {
    assert.equal(formatUVT(12.3456, 1), "12.3 UVT");
  });

  it("formatea porcentaje con dos decimales por defecto", () => {
    assert.equal(formatPercent(0.12345), "12.35%");
  });

  it("formatea porcentaje con dígitos personalizados", () => {
    assert.equal(formatPercent(0.5, 0), "50%");
  });

  it("parsea entrada de moneda eliminando símbolos", () => {
    assert.equal(parseCurrencyInput("$ 1.234.567"), 1234567);
  });

  it("parsea entrada negativa", () => {
    assert.equal(parseCurrencyInput("-9.876"), -9876);
  });

  it("retorna 0 cuando la entrada no es numérica", () => {
    assert.equal(parseCurrencyInput("abc"), 0);
    assert.equal(parseCurrencyInput("--10"), 0);
  });

  it("clamp respeta valor dentro de rango", () => {
    assert.equal(clampNumber(10, 0, 20), 10);
  });

  it("clamp aplica límite mínimo", () => {
    assert.equal(clampNumber(-1, 0, 20), 0);
  });

  it("clamp aplica límite máximo", () => {
    assert.equal(clampNumber(99, 0, 20), 20);
  });
});
