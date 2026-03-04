import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import {
  UVT_VALUES,
  CURRENT_UVT_YEAR,
  RENTA_BRACKETS,
  RETENCION_SALARIOS_BRACKETS,
  SMLMV_2026,
  AUXILIO_TRANSPORTE_2026,
} from "../../src/config/tax-data";
import { PATRIMONIO_BRACKETS } from "../../src/config/tax-data-ganancias";
import { CALCULATORS_CATALOG } from "../../src/config/calculators-catalog";
import { OBLIGACIONES } from "../../src/config/calendario-data";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "../..");

describe("data-integrity", () => {
  // ── Constantes tributarias 2026 ──

  it("UVT 2026 = $52,374", () => {
    assert.equal(UVT_VALUES[2026], 52_374);
  });

  it("SMLMV 2026 = $1,750,905", () => {
    assert.equal(SMLMV_2026, 1_750_905);
  });

  it("Auxilio de transporte 2026 = $249,095", () => {
    assert.equal(AUXILIO_TRANSPORTE_2026, 249_095);
  });

  it("CURRENT_UVT_YEAR es 2026", () => {
    assert.equal(CURRENT_UVT_YEAR, 2026);
  });

  // ── Bracket continuity ──

  it("RENTA_BRACKETS son consecutivos (from[i] === to[i-1])", () => {
    for (let i = 1; i < RENTA_BRACKETS.length; i++) {
      assert.equal(
        RENTA_BRACKETS[i].from,
        RENTA_BRACKETS[i - 1].to,
        `Renta bracket ${i}: from ${RENTA_BRACKETS[i].from} !== prev to ${RENTA_BRACKETS[i - 1].to}`
      );
    }
  });

  it("RENTA_BRACKETS último tramo → Infinity", () => {
    const last = RENTA_BRACKETS[RENTA_BRACKETS.length - 1];
    assert.equal(last.to, Infinity);
  });

  it("RETENCION_SALARIOS_BRACKETS son consecutivos", () => {
    for (let i = 1; i < RETENCION_SALARIOS_BRACKETS.length; i++) {
      assert.equal(
        RETENCION_SALARIOS_BRACKETS[i].from,
        RETENCION_SALARIOS_BRACKETS[i - 1].to,
        `Retencion bracket ${i}: from !== prev to`
      );
    }
  });

  it("RETENCION_SALARIOS_BRACKETS último tramo → Infinity", () => {
    const last = RETENCION_SALARIOS_BRACKETS[RETENCION_SALARIOS_BRACKETS.length - 1];
    assert.equal(last.to, Infinity);
  });

  it("PATRIMONIO_BRACKETS son consecutivos", () => {
    for (let i = 1; i < PATRIMONIO_BRACKETS.length; i++) {
      assert.equal(
        PATRIMONIO_BRACKETS[i].from,
        PATRIMONIO_BRACKETS[i - 1].to,
        `Patrimonio bracket ${i}: from !== prev to`
      );
    }
  });

  it("PATRIMONIO_BRACKETS último tramo → Infinity", () => {
    const last = PATRIMONIO_BRACKETS[PATRIMONIO_BRACKETS.length - 1];
    assert.equal(last.to, Infinity);
  });

  // ── articles-index.json ──

  it("articles-index.json contiene 1,294 artículos", () => {
    const raw = readFileSync(resolve(projectRoot, "public/data/articles-index.json"), "utf-8");
    const articles = JSON.parse(raw);
    assert.equal(articles.length, 1_294);
  });

  // ── Calculators catalog ──

  it("CALCULATORS_CATALOG tiene 35+ entradas", () => {
    assert.ok(CALCULATORS_CATALOG.length >= 35, `Solo ${CALCULATORS_CATALOG.length} calculadoras`);
  });

  it("CALCULATORS_CATALOG hrefs son únicos", () => {
    const hrefs = CALCULATORS_CATALOG.map((c) => c.href);
    const unique = new Set(hrefs);
    assert.equal(unique.size, hrefs.length, "Hay hrefs duplicados en CALCULATORS_CATALOG");
  });

  it("CALCULATORS_CATALOG ids son únicos", () => {
    const ids = CALCULATORS_CATALOG.map((c) => c.id);
    const unique = new Set(ids);
    assert.equal(unique.size, ids.length, "Hay ids duplicados en CALCULATORS_CATALOG");
  });

  // ── Calendario fiscal ──

  it("Fechas del calendario son ISO válidas y año 2026 o 2027", () => {
    for (const obligacion of OBLIGACIONES) {
      for (const v of obligacion.vencimientos) {
        const d = new Date(v.fecha);
        assert.ok(!isNaN(d.getTime()), `Fecha inválida: ${v.fecha} en ${obligacion.obligacion}`);
        assert.ok(
          d.getFullYear() === 2026 || d.getFullYear() === 2027,
          `Fecha fuera de rango: ${v.fecha} (año ${d.getFullYear()})`
        );
      }
    }
  });
});
