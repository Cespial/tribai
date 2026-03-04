import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  extractNitFilters,
  matchesAnyNitFilter,
  matchesNitFilter,
  prettyNitFilters,
} from "../../src/lib/calendar/nit";

describe("calendar/nit", () => {
  it("extrae filtros sanitizando caracteres no numéricos", () => {
    assert.deepEqual(extractNitFilters(" 1, 2a, 3-5 ; "), ["1", "2", "3-5"]);
  });

  it("retorna arreglo vacío cuando no hay filtros válidos", () => {
    assert.deepEqual(extractNitFilters("abc"), []);
    assert.deepEqual(extractNitFilters("  "), []);
  });

  it("valida coincidencia exacta de dígito", () => {
    assert.equal(matchesNitFilter("4", "4"), true);
    assert.equal(matchesNitFilter("4", "5"), false);
  });

  it("valida coincidencia por rango", () => {
    assert.equal(matchesNitFilter("3-7", "5"), true);
    assert.equal(matchesNitFilter("3-7", "9"), false);
  });

  it("soporta rangos invertidos", () => {
    assert.equal(matchesNitFilter("7-3", "5"), true);
  });

  it("retorna false si el filtro no es numérico", () => {
    assert.equal(matchesNitFilter("1-9", "x"), false);
  });

  it("matchesAnyNitFilter retorna true si no hay filtros", () => {
    assert.equal(matchesAnyNitFilter("1-9", []), true);
  });

  it("matchesAnyNitFilter retorna true si al menos uno coincide", () => {
    assert.equal(matchesAnyNitFilter("1,3,5", ["2", "5", "9"]), true);
    assert.equal(matchesAnyNitFilter("1,3,5", ["2", "4", "9"]), false);
  });

  it("prettyNitFilters retorna 'Todos' sin filtros", () => {
    assert.equal(prettyNitFilters([]), "Todos");
  });

  it("prettyNitFilters une filtros con coma", () => {
    assert.equal(prettyNitFilters(["1", "2-4"]), "1, 2-4");
  });
});
