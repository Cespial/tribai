import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  buildSideBySideRows,
  computeWordDiff,
  countChanges,
  summarizeDiff,
  type DiffSegment,
} from "../../src/components/comparison/diff-utils";

describe("comparison/diff-utils", () => {
  it("detecta textos idénticos como segmento same", () => {
    const segments = computeWordDiff("hola mundo", "hola mundo");
    assert.equal(segments.length, 1);
    assert.equal(segments[0].type, "same");
    assert.equal(segments[0].wordCount, 2);
  });

  it("detecta adiciones", () => {
    const segments = computeWordDiff("hola", "hola mundo");
    assert.ok(segments.some((s) => s.type === "added" && s.text === "mundo"));
  });

  it("detecta remociones", () => {
    const segments = computeWordDiff("hola mundo", "hola");
    assert.ok(segments.some((s) => s.type === "removed" && s.text === "mundo"));
  });

  it("convierte remove+add consecutivos en modified", () => {
    const segments = computeWordDiff("tarifa 19", "tarifa 15");
    const modified = segments.find((s) => s.type === "modified");
    assert.ok(modified);
    assert.equal(modified?.oldText, "19");
    assert.equal(modified?.newText, "15");
  });

  it("mapea segmentos a filas side-by-side", () => {
    const rows = buildSideBySideRows([
      { id: "1", type: "same", text: "a", wordCount: 1 },
      { id: "2", type: "added", text: "b", wordCount: 1 },
      { id: "3", type: "removed", text: "c", wordCount: 1 },
      { id: "4", type: "modified", text: "nuevo", oldText: "viejo", newText: "nuevo", wordCount: 1 },
    ]);

    assert.deepEqual(rows[0], {
      id: "1",
      changeType: "same",
      leftText: "a",
      rightText: "a",
    });
    assert.deepEqual(rows[1], {
      id: "2",
      changeType: "added",
      leftText: "",
      rightText: "b",
    });
    assert.deepEqual(rows[2], {
      id: "3",
      changeType: "removed",
      leftText: "c",
      rightText: "",
    });
    assert.deepEqual(rows[3], {
      id: "4",
      changeType: "modified",
      leftText: "viejo",
      rightText: "nuevo",
    });
  });

  it("countChanges usa text para calcular palabras cuando wordCount no existe", () => {
    const segments = [
      { id: "1", type: "added", text: "uno dos" },
      { id: "2", type: "same", text: "tres" },
    ] as DiffSegment[];

    const stats = countChanges(segments);
    assert.deepEqual(stats, {
      added: 2,
      removed: 0,
      modified: 0,
      same: 1,
    });
  });

  it("summarizeDiff calcula ratio de cambios", () => {
    const segments = computeWordDiff("a b c", "a x c y");
    const summary = summarizeDiff(segments);

    assert.equal(summary.totalWords, summary.stats.added + summary.stats.removed + summary.stats.modified + summary.stats.same);
    assert.equal(summary.totalChanges, summary.stats.added + summary.stats.removed + summary.stats.modified);
    assert.ok(summary.changeRatio > 0);
  });
});
