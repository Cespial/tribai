import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { searchCalculators } from "../../src/lib/calculators/search";

const CATALOG = [
  {
    id: "retencion",
    title: "Retención en la Fuente",
    description: "Calcula retención para honorarios y servicios",
    tags: ["retefuente", "honorarios"],
    intents: ["calcular retencion", "tabla art 383"],
    category: "retencion",
    isTop5: true,
  },
  {
    id: "renta",
    title: "Renta Personas Naturales",
    description: "Cálculo anual de renta con Art. 241",
    tags: ["renta", "declaracion"],
    intents: ["declarar renta"],
    category: "renta",
    isTop5: false,
  },
  {
    id: "iva",
    title: "IVA",
    description: "Impuesto sobre las ventas",
    tags: ["ventas"],
    intents: ["calcular iva"],
    category: "iva",
    isTop5: false,
  },
] as const;

describe("calculators/search", () => {
  it("retorna todo el catálogo con score 0 cuando query está vacía", () => {
    const result = searchCalculators("   ", CATALOG as never);
    assert.equal(result.length, CATALOG.length);
    assert.ok(result.every((r) => r.score === 0));
  });

  it("prioriza coincidencia exacta en título", () => {
    const result = searchCalculators("retención en la fuente", CATALOG as never);
    assert.equal(result[0]?.item.id, "retencion");
    assert.ok(result[0]?.matches.includes("titulo"));
  });

  it("registra coincidencia por descripción", () => {
    const result = searchCalculators("ventas", CATALOG as never);
    const iva = result.find((r) => r.item.id === "iva");
    assert.ok(iva);
    assert.ok(iva.matches.includes("descripcion"));
  });

  it("registra coincidencia por intención", () => {
    const result = searchCalculators("declarar renta", CATALOG as never);
    const renta = result.find((r) => r.item.id === "renta");
    assert.ok(renta);
    assert.ok(renta.matches.includes("intencion"));
  });

  it("expande sinónimos y encuentra resultados por token relacionado", () => {
    const result = searchCalculators("rete", CATALOG as never);
    assert.equal(result[0]?.item.id, "retencion");
  });

  it("aplica bono de popularidad para top5", () => {
    const base = [
      {
        id: "a",
        title: "Alpha",
        description: "foo",
        tags: ["bar"],
        intents: ["baz"],
        category: "x",
        isTop5: true,
      },
      {
        id: "b",
        title: "Beta",
        description: "foo",
        tags: ["bar"],
        intents: ["baz"],
        category: "x",
        isTop5: false,
      },
    ] as const;

    const result = searchCalculators("foo", base as never);
    assert.equal(result[0]?.item.id, "a");
  });

  it("desempata por título en orden alfabético", () => {
    const sameScore = [
      {
        id: "b",
        title: "Beta",
        description: "token",
        tags: [],
        intents: [],
        category: "x",
        isTop5: false,
      },
      {
        id: "a",
        title: "Alpha",
        description: "token",
        tags: [],
        intents: [],
        category: "x",
        isTop5: false,
      },
    ] as const;

    const result = searchCalculators("token", sameScore as never);
    assert.deepEqual(result.map((r) => r.item.id), ["a", "b"]);
  });
});
