import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";

import {
  getCalculatorUsageCount,
  getPopularCalculatorIds,
  trackCalculatorUsage,
} from "../../src/lib/calculators/popularity";
import { installBrowserMock } from "../helpers/browser-mocks";

const STORAGE_KEY = "calculators-usage-v1";
const DAY_MS = 24 * 60 * 60 * 1000;

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

let restoreBrowser: (() => void) | undefined;
let restoreNow: (() => void) | undefined;

afterEach(() => {
  restoreBrowser?.();
  restoreBrowser = undefined;
  restoreNow?.();
  restoreNow = undefined;
});

function mockNow(value: number): void {
  const originalNow = Date.now;
  Date.now = () => value;
  restoreNow = () => {
    Date.now = originalNow;
  };
}

describe("calculators/popularity", () => {
  it("en entorno sin window no falla y retorna valores vacíos", () => {
    withNoWindow(() => {
      trackCalculatorUsage("ica");
      assert.deepEqual(getPopularCalculatorIds(), []);
      assert.equal(getCalculatorUsageCount("ica"), 0);
    });
  });

  it("registra uso de calculadora en localStorage", () => {
    const now = 1_700_000_000_000;
    mockNow(now);

    const mock = installBrowserMock();
    restoreBrowser = mock.restore;

    trackCalculatorUsage("ica");

    const raw = mock.localStorage.getItem(STORAGE_KEY);
    assert.ok(raw);
    const parsed = JSON.parse(raw!) as Record<string, number[]>;
    assert.equal(parsed.ica.length, 1);
    assert.equal(parsed.ica[0], now);
  });

  it("ignora registro cuando el id está vacío", () => {
    const mock = installBrowserMock();
    restoreBrowser = mock.restore;

    trackCalculatorUsage("");

    assert.equal(mock.localStorage.getItem(STORAGE_KEY), null);
  });

  it("retorna calculadoras populares ordenadas por frecuencia y limitadas", () => {
    const now = 1_700_000_000_000;
    mockNow(now);

    const mock = installBrowserMock({
      storage: {
        [STORAGE_KEY]: JSON.stringify({
          renta: [now - DAY_MS, now - 2 * DAY_MS, now - 3 * DAY_MS],
          ica: [now - DAY_MS],
          iva: [now - DAY_MS, now - DAY_MS],
        }),
      },
    });
    restoreBrowser = mock.restore;

    const popular = getPopularCalculatorIds({ days: 7, limit: 2 });
    assert.deepEqual(popular, ["renta", "iva"]);
  });

  it("calcula conteo dentro de ventana de días", () => {
    const now = 1_700_000_000_000;
    mockNow(now);

    const mock = installBrowserMock({
      storage: {
        [STORAGE_KEY]: JSON.stringify({
          ica: [now - DAY_MS, now - 2 * DAY_MS, now - 10 * DAY_MS],
        }),
      },
    });
    restoreBrowser = mock.restore;

    assert.equal(getCalculatorUsageCount("ica", 7), 2);
  });

  it("prunea timestamps antiguos al registrar uso", () => {
    const now = 1_700_000_000_000;
    mockNow(now);

    const mock = installBrowserMock({
      storage: {
        [STORAGE_KEY]: JSON.stringify({
          ica: [now - 31 * DAY_MS, now - DAY_MS],
        }),
      },
    });
    restoreBrowser = mock.restore;

    trackCalculatorUsage("ica");

    assert.equal(getCalculatorUsageCount("ica", 30), 2);
  });

  it("tolera JSON inválido en storage", () => {
    const mock = installBrowserMock({
      storage: {
        [STORAGE_KEY]: "{ json roto",
      },
    });
    restoreBrowser = mock.restore;

    assert.deepEqual(getPopularCalculatorIds(), []);
  });
});
