import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";

import {
  buildPathWithQuery,
  buildShareUrl,
  readBooleanParam,
  readNumberParam,
  readStringParam,
  replaceUrlQuery,
} from "../../src/lib/calculators/url-state";
import { installBrowserMock } from "../helpers/browser-mocks";

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
afterEach(() => {
  restoreBrowser?.();
  restoreBrowser = undefined;
});

describe("calculators/url-state", () => {
  it("readNumberParam usa fallback cuando falta el parámetro", () => {
    const params = new URLSearchParams();
    assert.equal(readNumberParam(params, "monto", 123), 123);
  });

  it("readNumberParam usa fallback cuando es inválido", () => {
    const params = new URLSearchParams("monto=abc");
    assert.equal(readNumberParam(params, "monto", 123), 123);
  });

  it("readNumberParam aplica mínimo", () => {
    const params = new URLSearchParams("monto=5");
    assert.equal(readNumberParam(params, "monto", 0, { min: 10 }), 10);
  });

  it("readNumberParam aplica máximo", () => {
    const params = new URLSearchParams("monto=500");
    assert.equal(readNumberParam(params, "monto", 0, { max: 100 }), 100);
  });

  it("readBooleanParam interpreta true en formatos soportados", () => {
    assert.equal(readBooleanParam(new URLSearchParams("v=1"), "v", false), true);
    assert.equal(readBooleanParam(new URLSearchParams("v=true"), "v", false), true);
    assert.equal(readBooleanParam(new URLSearchParams("v=si"), "v", false), true);
  });

  it("readBooleanParam interpreta false en formatos soportados", () => {
    assert.equal(readBooleanParam(new URLSearchParams("v=0"), "v", true), false);
    assert.equal(readBooleanParam(new URLSearchParams("v=false"), "v", true), false);
    assert.equal(readBooleanParam(new URLSearchParams("v=no"), "v", true), false);
  });

  it("readBooleanParam retorna fallback para valores desconocidos", () => {
    assert.equal(readBooleanParam(new URLSearchParams("v=talvez"), "v", true), true);
  });

  it("readStringParam retorna fallback si valor vacío", () => {
    assert.equal(readStringParam(new URLSearchParams("q=   "), "q", "default"), "default");
  });

  it("readStringParam retorna valor cuando existe contenido", () => {
    assert.equal(readStringParam(new URLSearchParams("q=ica"), "q", "default"), "ica");
  });

  it("buildPathWithQuery omite null/undefined/vacío e incluye false y 0", () => {
    const path = buildPathWithQuery("/calculadoras", {
      a: 1,
      b: "",
      c: false,
      d: 0,
      e: "hola",
      f: null,
      g: undefined,
    });
    assert.equal(path, "/calculadoras?a=1&c=false&d=0&e=hola");
  });

  it("buildPathWithQuery retorna pathname cuando no hay query", () => {
    assert.equal(buildPathWithQuery("/x", { a: "" }), "/x");
  });

  it("buildShareUrl sin window retorna ruta relativa", () => {
    const result = withNoWindow(() => buildShareUrl("/comparar", { q: "abc" }));
    assert.equal(result, "/comparar?q=abc");
  });

  it("buildShareUrl con window retorna URL absoluta", () => {
    const mock = installBrowserMock({ href: "https://tributaria.test/ruta" });
    restoreBrowser = mock.restore;

    const result = buildShareUrl("/comparar", { q: "abc" });
    assert.equal(result, "https://tributaria.test/comparar?q=abc");
  });

  it("replaceUrlQuery actualiza history.replaceState", () => {
    const mock = installBrowserMock({ href: "https://tributaria.test/calculadoras?old=1" });
    restoreBrowser = mock.restore;

    replaceUrlQuery({ ingreso: 1000, simple: true, vacio: "" });

    assert.deepEqual(mock.replaceStateCalls, ["/calculadoras?ingreso=1000&simple=true"]);
  });
});
