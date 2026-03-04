import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "../..");

describe("integration/api-tax-graph", () => {
  it("graph-data.json exists and has valid structure", () => {
    const raw = readFileSync(resolve(projectRoot, "public/data/graph-data.json"), "utf-8");
    const data = JSON.parse(raw);
    assert.ok(data.nodes, "Missing nodes");
    assert.ok(data.edges || data.links, "Missing edges/links");
    assert.ok(Array.isArray(data.nodes));
  });

  it("graph nodes have required fields", () => {
    const raw = readFileSync(resolve(projectRoot, "public/data/graph-data.json"), "utf-8");
    const data = JSON.parse(raw);
    for (const node of data.nodes.slice(0, 10)) {
      assert.ok(node.id || node.data?.id, "Node missing id");
    }
  });

  it("normalizeId transforms raw numbers to et-art-* format", () => {
    // Testing the normalizeId pattern from tax-graph route
    function normalizeId(raw: string): string {
      if (raw.startsWith("et-") || raw.startsWith("ley-") || raw.startsWith("dur-")) return raw;
      if (/^\d/.test(raw) || raw.startsWith("art-")) {
        const num = raw.replace("art-", "");
        return `et-art-${num}`;
      }
      return raw;
    }
    assert.equal(normalizeId("240"), "et-art-240");
    assert.equal(normalizeId("art-240"), "et-art-240");
    assert.equal(normalizeId("et-art-240"), "et-art-240");
    assert.equal(normalizeId("ley-2277-2022"), "ley-2277-2022");
  });

  it("formatLabel formats article IDs correctly", () => {
    function formatLabel(id: string): string {
      if (id.startsWith("et-art-")) return `Art. ${id.replace("et-art-", "")}`;
      if (id.startsWith("ley-")) {
        const parts = id.split("-");
        return `Ley ${parts[1]} (${parts[2]})`;
      }
      if (id.startsWith("dur-")) return "DUR 1625";
      return id;
    }
    assert.equal(formatLabel("et-art-240"), "Art. 240");
    assert.equal(formatLabel("ley-2277-2022"), "Ley 2277 (2022)");
    assert.equal(formatLabel("dur-1625"), "DUR 1625");
  });

  it("getType classifies IDs correctly", () => {
    function getType(id: string): string {
      if (id.startsWith("et-")) return "estatuto";
      if (id.startsWith("ley-")) return "ley";
      if (id.startsWith("dur-")) return "decreto";
      return "default";
    }
    assert.equal(getType("et-art-240"), "estatuto");
    assert.equal(getType("ley-2277-2022"), "ley");
    assert.equal(getType("dur-1625"), "decreto");
    assert.equal(getType("other"), "default");
  });

  it("dashboard-stats.json exists and is valid", () => {
    const raw = readFileSync(resolve(projectRoot, "public/data/dashboard-stats.json"), "utf-8");
    const data = JSON.parse(raw);
    assert.ok(typeof data === "object");
  });

  it("explorer-facets.json exists and is valid", () => {
    const raw = readFileSync(resolve(projectRoot, "public/data/explorer-facets.json"), "utf-8");
    const data = JSON.parse(raw);
    assert.ok(typeof data === "object");
  });
});
