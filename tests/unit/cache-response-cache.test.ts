import assert from "node:assert/strict";
import { describe, it, beforeEach } from "node:test";

import {
  getCachedResult,
  setCachedResult,
  recordFeedback,
  getCacheStats,
  invalidateCache,
} from "../../src/lib/cache/response-cache";

// Minimal mock PipelineResult
const mockResult = {
  systemMessage: "test",
  contextXml: "<context/>",
  sources: [],
  suggestedCalculators: [],
  ragMetadata: { confidenceLevel: "high" },
} as never;

describe("cache/response-cache", () => {
  beforeEach(() => {
    invalidateCache();
  });

  it("returns null for uncached query", () => {
    const result = getCachedResult("nueva query inexistente");
    assert.equal(result, null);
  });

  it("stores and retrieves cached result", () => {
    setCachedResult("test query", mockResult);
    const result = getCachedResult("test query");
    assert.deepEqual(result, mockResult);
  });

  it("normalizes queries (case, spaces, accents)", () => {
    setCachedResult("Qué es el UVT", mockResult);
    // Should match with different case/accents
    const result = getCachedResult("que es el uvt");
    assert.deepEqual(result, mockResult);
  });

  it("invalidateCache clears all entries", () => {
    setCachedResult("q1", mockResult);
    setCachedResult("q2", mockResult);
    invalidateCache();
    assert.equal(getCachedResult("q1"), null);
    assert.equal(getCachedResult("q2"), null);
  });

  it("getCacheStats returns correct size", () => {
    setCachedResult("q1", mockResult);
    setCachedResult("q2", mockResult);
    const stats = getCacheStats();
    assert.equal(stats.size, 2);
    assert.equal(stats.maxSize, 500);
  });

  it("recordFeedback returns false for uncached query", () => {
    const result = recordFeedback("no existe", "positive");
    assert.equal(result, false);
  });

  it("recordFeedback returns true for cached query", () => {
    setCachedResult("feedback query", mockResult);
    const result = recordFeedback("feedback query", "positive");
    assert.equal(result, true);
  });

  it("auto-invalidates after 2+ negative feedbacks", () => {
    setCachedResult("bad query", mockResult);
    recordFeedback("bad query", "negative");
    recordFeedback("bad query", "negative");
    // After 2 negative feedbacks, should be invalidated
    const result = getCachedResult("bad query");
    assert.equal(result, null);
  });
});
