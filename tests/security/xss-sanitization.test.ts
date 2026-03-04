import assert from "node:assert/strict";
import { describe, it } from "node:test";

/**
 * XSS Sanitization Tests
 *
 * Tests that DOMPurify (isomorphic-dompurify) properly sanitizes
 * user-generated content throughout the app.
 */

// Import DOMPurify — used by the chat and article rendering
import DOMPurify from "isomorphic-dompurify";

describe("security/xss-sanitization", () => {
  it("removes <script> tags", () => {
    const dirty = '<p>Hello</p><script>alert("xss")</script>';
    const clean = DOMPurify.sanitize(dirty);
    assert.ok(!clean.includes("<script>"));
    assert.ok(!clean.includes("alert"));
    assert.ok(clean.includes("<p>Hello</p>"));
  });

  it("removes event handler attributes", () => {
    const dirty = '<p onmouseover="alert(1)">Text</p>';
    const clean = DOMPurify.sanitize(dirty);
    assert.ok(!clean.includes("onmouseover"));
    assert.ok(clean.includes("Text"));
  });

  it("removes javascript: URLs", () => {
    const dirty = '<a href="javascript:alert(1)">Click</a>';
    const clean = DOMPurify.sanitize(dirty);
    assert.ok(!clean.includes("javascript:"));
  });

  it("removes data:text/html with scripts", () => {
    const dirty = '<a href="data:text/html,<script>alert(1)</script>">Click</a>';
    const clean = DOMPurify.sanitize(dirty);
    assert.ok(!clean.includes("data:text/html"));
  });

  it("preserves safe HTML (links, tables, bold)", () => {
    const safe = '<p>Texto <strong>importante</strong></p><table><tr><td>Dato</td></tr></table>';
    const clean = DOMPurify.sanitize(safe);
    assert.ok(clean.includes("<strong>importante</strong>"));
    assert.ok(clean.includes("<table>"));
  });

  it("removes iframe injection", () => {
    const dirty = '<iframe src="https://evil.com"></iframe><p>Safe</p>';
    const clean = DOMPurify.sanitize(dirty);
    assert.ok(!clean.includes("<iframe"));
    assert.ok(clean.includes("Safe"));
  });
});
