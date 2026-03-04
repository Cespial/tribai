import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { buildIcs } from "../../src/lib/calendar/ics";

describe("calendar/ics", () => {
  it("construye encabezado básico de VCALENDAR", () => {
    const ics = buildIcs([]);
    assert.ok(ics.includes("BEGIN:VCALENDAR"));
    assert.ok(ics.includes("VERSION:2.0"));
    assert.ok(ics.includes("END:VCALENDAR"));
  });

  it("incluye bloque VEVENT con UID y fechas all-day", () => {
    const ics = buildIcs([
      {
        id: "ev-1",
        title: "Vencimiento IVA",
        date: "2026-03-20",
      },
    ]);

    assert.ok(ics.includes("BEGIN:VEVENT"));
    assert.ok(ics.includes("UID:ev-1@superapp-tributaria-colombia"));
    assert.ok(ics.includes("DTSTART;VALUE=DATE:20260320"));
    assert.ok(ics.includes("DTEND;VALUE=DATE:20260321"));
  });

  it("calcula correctamente DTEND al cambiar de mes", () => {
    const ics = buildIcs([
      {
        id: "ev-2",
        title: "Cierre mes",
        date: "2026-01-31",
      },
    ]);

    assert.ok(ics.includes("DTSTART;VALUE=DATE:20260131"));
    assert.ok(ics.includes("DTEND;VALUE=DATE:20260201"));
  });

  it("escapa caracteres especiales en summary/description/location", () => {
    const ics = buildIcs([
      {
        id: "ev-3",
        title: "A,B;C\\D",
        date: "2026-03-20",
        description: "Linea 1\nLinea 2",
        location: "Bogotá, CO; Sede A",
      },
    ]);

    assert.ok(ics.includes("SUMMARY:A\\,B\\;C\\\\D"));
    assert.ok(ics.includes("DESCRIPTION:Linea 1\\nLinea 2"));
    assert.ok(ics.includes("LOCATION:Bogotá\\, CO\\; Sede A"));
  });

  it("usa nombre de calendario personalizado", () => {
    const ics = buildIcs([], "Calendario, Fiscal; 2026");
    assert.ok(ics.includes("X-WR-CALNAME:Calendario\\, Fiscal\\; 2026"));
  });
});
