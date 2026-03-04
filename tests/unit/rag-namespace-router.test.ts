import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  classifyQueryType,
  getQueryRoutingConfig,
  prioritizeNamespaces,
} from "../../src/lib/rag/namespace-router";

describe("rag/namespace-router — classifyQueryType", () => {
  it("clasifica query calculativa", () => {
    assert.equal(classifyQueryType("¿Cuánto debo pagar de renta?"), "calculative");
    assert.equal(classifyQueryType("calcular retención en la fuente salario"), "calculative");
  });

  it("clasifica query comparativa", () => {
    assert.equal(classifyQueryType("diferencia entre Art. 240 y Art. 241"), "comparative");
    assert.equal(classifyQueryType("comparar renta vs SIMPLE"), "comparative");
  });

  it("clasifica query temporal", () => {
    assert.equal(classifyQueryType("evolución del artículo 240"), "temporal");
    assert.equal(classifyQueryType("historial de modificaciones"), "temporal");
  });

  it("clasifica query procedimental", () => {
    assert.equal(classifyQueryType("¿Cuáles son los plazos para declarar?"), "procedural");
    assert.equal(classifyQueryType("requisitos para declarar IVA"), "procedural");
  });

  it("clasifica query doctrinal", () => {
    assert.equal(classifyQueryType("concepto DIAN sobre dividendos"), "doctrinal");
    assert.equal(classifyQueryType("sentencia Corte Constitucional"), "doctrinal");
  });

  it("clasifica query factual", () => {
    assert.equal(classifyQueryType("¿Qué dice el artículo 240?"), "factual");
    assert.equal(classifyQueryType("¿Cuál es la tarifa de renta?"), "factual");
  });

  it("clasifica query general (fallback)", () => {
    assert.equal(classifyQueryType("hola"), "general");
    assert.equal(classifyQueryType("tributos en Colombia"), "general");
  });
});

describe("rag/namespace-router — getQueryRoutingConfig", () => {
  it("factual retorna topK=10, maxRerankedResults=5", () => {
    const config = getQueryRoutingConfig("factual");
    assert.equal(config.topK, 10);
    assert.equal(config.maxRerankedResults, 5);
  });

  it("comparative retorna topK=30 para comparar más artículos", () => {
    const config = getQueryRoutingConfig("comparative");
    assert.equal(config.topK, 30);
    assert.equal(config.maxRerankedResults, 15);
  });

  it("doctrinal prioriza namespace doctrina", () => {
    const config = getQueryRoutingConfig("doctrinal");
    assert.equal(config.priorityNamespaces[0], "doctrina");
  });

  it("procedural incluye resoluciones y decretos", () => {
    const config = getQueryRoutingConfig("procedural");
    assert.ok(config.priorityNamespaces.includes("resoluciones"));
    assert.ok(config.priorityNamespaces.includes("decretos"));
  });

  it("general usa configuración por defecto con todos los namespaces", () => {
    const config = getQueryRoutingConfig("general");
    assert.ok(config.topK >= 10);
    assert.ok(config.priorityNamespaces.length >= 5);
  });
});

describe("rag/namespace-router — prioritizeNamespaces", () => {
  it("query con 'concepto DIAN' prioriza doctrina", () => {
    const ns = prioritizeNamespaces("concepto DIAN sobre renta");
    assert.equal(ns[0], "doctrina");
  });

  it("query con 'sentencia' prioriza jurisprudencia", () => {
    const ns = prioritizeNamespaces("sentencia Corte Constitucional");
    assert.equal(ns[0], "jurisprudencia");
  });

  it("query con 'decreto' prioriza decretos", () => {
    const ns = prioritizeNamespaces("decreto reglamentario 1625");
    assert.equal(ns[0], "decretos");
  });

  it("query con 'resolución' prioriza resoluciones", () => {
    const ns = prioritizeNamespaces("resolución sobre plazos de declaración");
    assert.equal(ns[0], "resoluciones");
  });

  it("query con 'ley 2277' prioriza leyes", () => {
    const ns = prioritizeNamespaces("ley 2277 de 2022 reforma");
    assert.equal(ns[0], "leyes");
  });

  it("query genérica devuelve ET primero + todos los namespaces", () => {
    const ns = prioritizeNamespaces("impuesto de renta");
    assert.equal(ns[0], "");
    assert.ok(ns.length >= 5);
  });
});
