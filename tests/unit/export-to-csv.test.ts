import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { toCsv } from "../../src/lib/export/toCsv";

describe("export/toCsv", () => {
  it("genera CSV básico con encabezados", () => {
    const csv = toCsv(
      [
        { id: 1, nombre: "IVA" },
        { id: 2, nombre: "Renta" },
      ],
      [
        { key: "id", header: "ID" },
        { key: "nombre", header: "Nombre" },
      ]
    );

    assert.equal(csv, "ID,Nombre\n1,IVA\n2,Renta");
  });

  it("escapa comas y comillas en celdas", () => {
    const csv = toCsv(
      [{ texto: 'A, "B"' }],
      [{ key: "texto", header: "Texto" }]
    );

    assert.equal(csv, 'Texto\n"A, ""B"""');
  });

  it("escapa saltos de línea", () => {
    const csv = toCsv(
      [{ texto: "L1\nL2" }],
      [{ key: "texto", header: "Texto" }]
    );

    assert.equal(csv, 'Texto\n"L1\nL2"');
  });

  it("usa resolver custom por columna", () => {
    const csv = toCsv(
      [{ valor: 10 }],
      [{ key: "impuesto", header: "Impuesto", resolve: (row) => row.valor * 0.19 }]
    );

    assert.equal(csv, "Impuesto\n1.9");
  });
});
