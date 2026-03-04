import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  normalizeForSearch,
  normalizeSlugLike,
  normalizeWhitespace,
  stripDiacritics,
  stripHtml,
} from "../../src/lib/utils/text-normalize";

describe("utils/text-normalize", () => {
  it("stripDiacritics elimina acentos", () => {
    assert.equal(stripDiacritics("áéíóú ñ"), "aeiou n");
  });

  it("normalizeForSearch normaliza mayúsculas y espacios", () => {
    assert.equal(normalizeForSearch("  RÉGIMEN   SIMPLE  "), "regimen simple");
  });

  it("normalizeSlugLike conserva letras, números, guion y espacio", () => {
    assert.equal(normalizeSlugLike("Ley #2277 / 2022!"), "ley 2277 2022");
  });

  it("normalizeWhitespace colapsa espacios", () => {
    assert.equal(normalizeWhitespace("a\n\t b   c"), "a b c");
  });

  it("stripHtml elimina etiquetas", () => {
    assert.equal(stripHtml("<p>Hola <strong>mundo</strong></p>"), " Hola  mundo  ");
  });
});
