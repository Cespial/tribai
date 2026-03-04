import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { checkEvidence } from "../../src/lib/rag/evidence-checker";
import { AssembledContext, ArticleGroup, ExternalSourceGroup } from "../../src/types/rag";

function makeArticle(overrides: Partial<ArticleGroup> = {}): ArticleGroup {
  return {
    idArticulo: "Art. 240",
    titulo: "Tarifa general",
    categoriaLibro: "Libro I",
    categoriaTitulo: "Renta",
    urlOrigen: "https://estatuto.co/art-240",
    contenido: ["La tarifa general..."],
    modificaciones: [],
    textoAnterior: [],
    maxScore: 0.80,
    estado: "vigente",
    ...overrides,
  };
}

function makeExternalSource(overrides: Partial<ExternalSourceGroup> = {}): ExternalSourceGroup {
  return {
    docId: "doc_001",
    docType: "doctrina",
    numero: "001234",
    tema: "Tarifa",
    texto: ["Concepto sobre tarifas..."],
    articulosET: ["240"],
    maxScore: 0.65,
    vigente: true,
    fuenteUrl: "https://dian.gov.co",
    namespace: "doctrina",
    ...overrides,
  };
}

function makeContext(overrides: Partial<AssembledContext> = {}): AssembledContext {
  return {
    articles: [],
    externalSources: [],
    sources: [],
    totalTokensEstimate: 1000,
    ...overrides,
  };
}

describe("rag/evidence-checker", () => {
  it("high confidence: topScore ≥ 0.75 AND sources ≥ 3", () => {
    const context = makeContext({
      articles: [
        makeArticle({ idArticulo: "Art. 240" }),
        makeArticle({ idArticulo: "Art. 241" }),
        makeArticle({ idArticulo: "Art. 242" }),
      ],
    });
    const result = checkEvidence(context, 0.85, 0.60);
    assert.equal(result.confidenceLevel, "high");
  });

  it("medium confidence: topScore ≥ 0.55 AND sources ≥ 1", () => {
    const context = makeContext({
      articles: [makeArticle()],
    });
    const result = checkEvidence(context, 0.60, 0.40);
    assert.equal(result.confidenceLevel, "medium");
  });

  it("low confidence: topScore < 0.55", () => {
    const context = makeContext();
    const result = checkEvidence(context, 0.30, 0.20);
    assert.equal(result.confidenceLevel, "low");
  });

  it("evidenceQuality is between 0 and 1", () => {
    const context = makeContext({
      articles: [makeArticle()],
    });
    const result = checkEvidence(context, 0.70, 0.50);
    assert.ok(result.evidenceQuality >= 0);
    assert.ok(result.evidenceQuality <= 1);
  });

  it("evidenceQuality grows with more sources", () => {
    const context1 = makeContext({ articles: [makeArticle()] });
    const context5 = makeContext({
      articles: Array.from({ length: 5 }, (_, i) =>
        makeArticle({ idArticulo: `Art. ${240 + i}` })
      ),
    });

    const result1 = checkEvidence(context1, 0.70, 0.50);
    const result5 = checkEvidence(context5, 0.70, 0.50);
    assert.ok(result5.evidenceQuality > result1.evidenceQuality);
  });

  it("namespace contribution tracks ET articles", () => {
    const context = makeContext({
      articles: [makeArticle(), makeArticle({ idArticulo: "Art. 241" })],
    });
    const result = checkEvidence(context, 0.70, 0.50);
    assert.equal(result.namespaceContribution["estatuto_tributario"], 2);
  });

  it("namespace contribution tracks external sources", () => {
    const context = makeContext({
      externalSources: [
        makeExternalSource({ namespace: "doctrina" }),
        makeExternalSource({ namespace: "jurisprudencia", docType: "sentencia" }),
      ],
    });
    const result = checkEvidence(context, 0.70, 0.50);
    assert.equal(result.namespaceContribution["doctrina"], 1);
    assert.equal(result.namespaceContribution["jurisprudencia"], 1);
  });

  it("no contradictions when all vigente", () => {
    const context = makeContext({
      articles: [makeArticle({ contenido: ["tarifa 35%"] })],
    });
    const result = checkEvidence(context, 0.70, 0.50);
    assert.equal(result.contradictionFlags, false);
  });

  it("flags contradiction: derogated article + vigente external source", () => {
    const context = makeContext({
      articles: [makeArticle({ idArticulo: "Art. 240", estado: "derogado" })],
      externalSources: [
        makeExternalSource({
          vigente: true,
          articulosET: ["240"],
          texto: ["El Art. 240 aplica..."],
        }),
      ],
    });
    const result = checkEvidence(context, 0.70, 0.50);
    assert.equal(result.contradictionFlags, true);
    assert.ok(result.contradictionDetails.length > 0);
  });
});
