import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { heuristicRerank } from "../../src/lib/rag/reranker";
import { makeScoredChunk, makeEnhancedQuery } from "../helpers/rag-fixtures";

describe("rag/reranker — heuristicRerank", () => {
  it("exactArticleNumber boost: query 'Art. 240' → chunk Art. 240 sube", () => {
    const query = makeEnhancedQuery({ original: "¿Qué dice el Art. 240?" });
    const target = makeScoredChunk({
      id: "chunk_target",
      score: 0.50,
      metadata: { id_articulo: "Art. 240", titulo: "Tarifa general", chunk_type: "contenido", estado: "vigente", text: "La tarifa general..." },
    });
    const other = makeScoredChunk({
      id: "chunk_other",
      score: 0.55,
      metadata: { id_articulo: "Art. 100", titulo: "Otro artículo", chunk_type: "contenido", estado: "vigente", text: "Otro texto..." },
    });

    const result = heuristicRerank([other, target], query, 10);
    assert.equal(result[0].id, "chunk_target", "Art. 240 chunk debería estar primero");
  });

  it("penaliza texto_anterior para queries no históricas", () => {
    const query = makeEnhancedQuery({ original: "tarifa general de renta" });
    const vigente = makeScoredChunk({
      id: "chunk_vigente",
      score: 0.60,
      metadata: { id_articulo: "Art. 240", titulo: "Tarifa", chunk_type: "contenido", estado: "vigente", text: "..." },
    });
    const anterior = makeScoredChunk({
      id: "chunk_anterior",
      score: 0.62,
      metadata: { id_articulo: "Art. 240", titulo: "Tarifa", chunk_type: "texto_anterior", estado: "vigente", text: "..." },
    });

    const result = heuristicRerank([anterior, vigente], query, 10);
    assert.equal(result[0].id, "chunk_vigente");
  });

  it("boost texto_anterior para queries históricas", () => {
    const query = makeEnhancedQuery({ original: "evolución histórica del artículo 240" });
    const anterior = makeScoredChunk({
      id: "chunk_anterior",
      score: 0.50,
      metadata: { id_articulo: "Art. 240", titulo: "Tarifa", chunk_type: "texto_anterior", estado: "vigente", text: "..." },
    });
    const contenido = makeScoredChunk({
      id: "chunk_contenido",
      score: 0.50,
      metadata: { id_articulo: "Art. 240", titulo: "Tarifa", chunk_type: "contenido", estado: "vigente", text: "..." },
    });

    const result = heuristicRerank([contenido, anterior], query, 10);
    const anteriorResult = result.find((r) => r.id === "chunk_anterior");
    const contenidoResult = result.find((r) => r.id === "chunk_contenido");
    assert.ok(anteriorResult!.rerankedScore > contenidoResult!.rerankedScore * 0.95,
      "texto_anterior debería estar boosted para queries históricas");
  });

  it("diversityPenalty: repeated articles get penalized scores", () => {
    const query = makeEnhancedQuery({ original: "tarifa general" });
    const chunk1 = makeScoredChunk({
      id: "chunk_1",
      score: 0.80,
      metadata: { id_articulo: "Art. 240", titulo: "Tarifa", chunk_type: "contenido", estado: "vigente", text: "..." },
    });
    const chunk2 = makeScoredChunk({
      id: "chunk_2",
      score: 0.80,
      metadata: { id_articulo: "Art. 240", titulo: "Tarifa", chunk_type: "modificaciones", estado: "vigente", text: "..." },
    });

    const result = heuristicRerank([chunk1, chunk2], query, 10);
    const r1 = result.find((r) => r.id === "chunk_1")!;
    const r2 = result.find((r) => r.id === "chunk_2")!;
    assert.ok(r1.rerankedScore > r2.rerankedScore, "Second chunk of same article should have lower score");
  });

  it("leyMatchBoost: query 'Ley 2277' → chunk con Ley 2277 sube", () => {
    const query = makeEnhancedQuery({ original: "cambios de la Ley 2277 de 2022" });
    const withLey = makeScoredChunk({
      id: "chunk_ley",
      score: 0.55,
      metadata: {
        id_articulo: "Art. 240", titulo: "Tarifa", chunk_type: "contenido",
        estado: "vigente", text: "...",
        leyes_modificatorias: ["Ley 2277 de 2022"],
      },
    });
    const withoutLey = makeScoredChunk({
      id: "chunk_no_ley",
      score: 0.58,
      metadata: {
        id_articulo: "Art. 100", titulo: "Otro", chunk_type: "contenido",
        estado: "vigente", text: "...",
        leyes_modificatorias: ["Ley 1819 de 2016"],
      },
    });

    const result = heuristicRerank([withoutLey, withLey], query, 10);
    assert.equal(result[0].id, "chunk_ley", "Chunk con Ley 2277 debería estar primero");
  });

  it("directArticleMention boost via detectedArticles", () => {
    const query = makeEnhancedQuery({
      original: "artículo 240",
      detectedArticles: ["Art. 240"],
    });
    const detected = makeScoredChunk({
      id: "chunk_detected",
      score: 0.50,
      metadata: { id_articulo: "Art. 240", titulo: "Tarifa", chunk_type: "contenido", estado: "vigente", text: "..." },
    });
    const notDetected = makeScoredChunk({
      id: "chunk_other",
      score: 0.60,
      metadata: { id_articulo: "Art. 100", titulo: "Otro", chunk_type: "contenido", estado: "vigente", text: "..." },
    });

    const result = heuristicRerank([notDetected, detected], query, 10);
    assert.equal(result[0].id, "chunk_detected");
  });

  it("respeta maxResults", () => {
    const query = makeEnhancedQuery({ original: "tarifa" });
    const chunks = Array.from({ length: 20 }, (_, i) =>
      makeScoredChunk({
        id: `chunk_${i}`,
        score: 0.80 - i * 0.02,
        metadata: { id_articulo: `Art. ${i}`, titulo: `Art ${i}`, chunk_type: "contenido", estado: "vigente", text: "..." },
      })
    );

    const result = heuristicRerank(chunks, query, 5);
    assert.ok(result.length <= 5);
  });

  it("vigenteBoost: vigente > no vigente para queries no históricas", () => {
    const query = makeEnhancedQuery({ original: "tarifa actual" });
    const vigente = makeScoredChunk({
      id: "chunk_vigente",
      score: 0.55,
      metadata: { id_articulo: "Art. 240", titulo: "Tarifa", chunk_type: "contenido", estado: "vigente", text: "..." },
    });
    const noVigente = makeScoredChunk({
      id: "chunk_no_vigente",
      score: 0.55,
      metadata: { id_articulo: "Art. 241", titulo: "Tabla", chunk_type: "contenido", estado: "modificado", text: "..." },
    });

    const result = heuristicRerank([noVigente, vigente], query, 10);
    assert.equal(result[0].id, "chunk_vigente");
  });
});
