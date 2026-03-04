import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";

import {
  STORAGE_EVENTS,
  STORAGE_KEYS,
  dispatchStorageEvent,
  readJsonStorage,
  writeJsonStorage,
} from "../../src/lib/storage/productivity-storage";
import { installBrowserMock } from "../helpers/browser-mocks";

let restoreBrowser: (() => void) | undefined;

afterEach(() => {
  restoreBrowser?.();
  restoreBrowser = undefined;
});

function withNoWindow<T>(fn: () => T): T {
  const originalWindow = (globalThis as { window?: unknown }).window;
  const originalLocalStorage = (globalThis as { localStorage?: unknown }).localStorage;
  Reflect.deleteProperty(globalThis, "window");
  Reflect.deleteProperty(globalThis, "localStorage");
  try {
    return fn();
  } finally {
    if (typeof originalWindow !== "undefined") {
      Object.defineProperty(globalThis, "window", {
        value: originalWindow,
        configurable: true,
        writable: true,
      });
    }
    if (typeof originalLocalStorage !== "undefined") {
      Object.defineProperty(globalThis, "localStorage", {
        value: originalLocalStorage,
        configurable: true,
        writable: true,
      });
    }
  }
}

describe("storage/productivity-storage", () => {
  it("readJsonStorage sin window retorna fallback", () => {
    const value = withNoWindow(() => readJsonStorage("k", { ok: true }));
    assert.deepEqual(value, { ok: true });
  });

  it("readJsonStorage retorna fallback cuando no existe key", () => {
    const mock = installBrowserMock();
    restoreBrowser = mock.restore;

    assert.deepEqual(readJsonStorage("missing", [1, 2]), [1, 2]);
  });

  it("readJsonStorage retorna fallback con JSON inválido", () => {
    const mock = installBrowserMock({ storage: { broken: "{not-json" } });
    restoreBrowser = mock.restore;

    assert.deepEqual(readJsonStorage("broken", { ok: false }), { ok: false });
  });

  it("writeJsonStorage persiste valor serializado", () => {
    const mock = installBrowserMock();
    restoreBrowser = mock.restore;

    writeJsonStorage("obj", { a: 1, b: "x" });
    assert.equal(mock.localStorage.getItem("obj"), JSON.stringify({ a: 1, b: "x" }));
  });

  it("dispatchStorageEvent dispara evento en window", () => {
    const mock = installBrowserMock();
    restoreBrowser = mock.restore;

    dispatchStorageEvent(STORAGE_EVENTS.bookmarks);
    assert.deepEqual(mock.dispatchedEvents, [STORAGE_EVENTS.bookmarks]);
  });

  it("expone llaves y eventos esperados", () => {
    assert.equal(STORAGE_KEYS.workspaces, "superapp-workspaces-v1");
    assert.equal(STORAGE_KEYS.legacyBookmarks, "superapp-bookmarks");
    assert.equal(STORAGE_EVENTS.chatConversations, "chat-conversations-changed");
  });
});
