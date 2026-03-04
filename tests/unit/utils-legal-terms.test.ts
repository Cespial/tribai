import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { detectLibro, expandQuery } from "../../src/lib/utils/legal-terms";

describe("utils/legal-terms", () => {
  it("expandQuery agrega sinónimos relevantes", () => {
    const expanded = expandQuery("¿Cómo aplica el 4x1000?");
    assert.ok(expanded.startsWith("¿Cómo aplica el 4x1000? ("));
    assert.ok(expanded.includes("gmf"));
  });

  it("expandQuery no modifica query sin coincidencias", () => {
    assert.equal(expandQuery("consulta tributaria general"), "consulta tributaria general");
  });

  it("expandQuery evita duplicar sinónimos ya presentes", () => {
    const expanded = expandQuery("Necesito revisar gmf y cuatro por mil");
    assert.ok(!expanded.includes("(gmf"));
  });

  it("detectLibro identifica libro de renta", () => {
    assert.equal(
      detectLibro("¿Cómo declarar renta?"),
      "I - Impuesto sobre la Renta y Complementarios"
    );
  });

  it("detectLibro identifica libro de GMF", () => {
    assert.equal(
      detectLibro("Liquidación del gmf"),
      "VI - Gravamen a los Movimientos Financieros"
    );
  });

  it("detectLibro retorna undefined si no hay keyword", () => {
    assert.equal(detectLibro("tema sin clasificación"), undefined);
  });
});
