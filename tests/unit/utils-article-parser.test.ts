import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  articleNumberToId,
  buildArticleUrl,
  estimateTokens,
  extractArticleRefs,
} from "../../src/lib/utils/article-parser";

describe("utils/article-parser", () => {
  it("extrae referencias con patrón 'artículo'", () => {
    const refs = extractArticleRefs("Ver artículo 241 y artículo 242");
    assert.deepEqual(refs.sort(), ["241", "242"]);
  });

  it("extrae referencias con patrón 'art.'", () => {
    const refs = extractArticleRefs("Aplica art. 383 para salarios");
    assert.deepEqual(refs, ["383"]);
  });

  it("extrae múltiples referencias en formato 'arts.'", () => {
    const refs = extractArticleRefs("Consultar arts. 240, 241, 242-1");
    assert.deepEqual(refs.sort(), ["240", "241", "242-1"]);
  });

  it("elimina duplicados y espacios intermedios", () => {
    const refs = extractArticleRefs("art. 241, artículo 241, arts. 241-1, 241 - 1");
    assert.deepEqual(refs.sort(), ["241", "241-1"]);
  });

  it("ignora valores inválidos", () => {
    const refs = extractArticleRefs("artículo X, art. --, arts. aa, bb");
    assert.deepEqual(refs, []);
  });

  it("articleNumberToId formatea identificador estándar", () => {
    assert.equal(articleNumberToId("241"), "Art. 241");
  });

  it("buildArticleUrl convierte id a URL", () => {
    assert.equal(buildArticleUrl("Art. 241"), "https://estatuto.co/241");
  });

  it("estimateTokens retorna 0 para texto vacío", () => {
    assert.equal(estimateTokens(""), 0);
  });

  it("estimateTokens redondea hacia arriba", () => {
    assert.equal(estimateTokens("1234567"), 2);
  });
});
