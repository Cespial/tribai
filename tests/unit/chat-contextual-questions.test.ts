import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  getContextualQuestions,
  getPageModule,
} from "../../src/lib/chat/contextual-questions";

describe("chat/contextual-questions", () => {
  it("retorna preguntas del home para ruta raíz", () => {
    const questions = getContextualQuestions("/");
    assert.ok(questions.length >= 3);
    assert.ok(questions[0].includes("tarifa de renta"));
  });

  it("retorna set específico para subrutas de renta", () => {
    const questions = getContextualQuestions("/calculadoras/renta/simulador");
    assert.ok(questions.some((q) => q.includes("Art. 241")));
  });

  it("retorna set específico para subrutas de retención", () => {
    const questions = getContextualQuestions("/calculadoras/retencion/servicios");
    assert.ok(questions.some((q) => q.toLowerCase().includes("retención")));
  });

  it("retorna fallback genérico para otras calculadoras", () => {
    const questions = getContextualQuestions("/calculadoras/iva");
    assert.equal(questions.length, 3);
    assert.ok(questions[0].includes("resultado"));
  });

  it("retorna fallback para artículos", () => {
    const questions = getContextualQuestions("/articulo/241");
    assert.equal(questions.length, 3);
    assert.ok(questions[0].toLowerCase().includes("artículo"));
  });

  it("rutas desconocidas vuelven a preguntas del home", () => {
    const questions = getContextualQuestions("/ruta-no-mapeada");
    assert.ok(questions.some((q) => q.includes("IVA")));
  });
});

describe("chat/contextual-questions:getPageModule", () => {
  it("clasifica módulos conocidos", () => {
    assert.equal(getPageModule("/"), "home");
    assert.equal(getPageModule("/comparar/abc"), "comparar");
    assert.equal(getPageModule("/favoritos"), "favoritos");
    assert.equal(getPageModule("/tablas/retencion"), "tablas-retencion");
    assert.equal(getPageModule("/calculadoras/renta"), "calculadora");
    assert.equal(getPageModule("/articulo/241"), "articulo");
  });

  it("clasifica como other lo no reconocido", () => {
    assert.equal(getPageModule("/otra/cosa"), "other");
  });
});
