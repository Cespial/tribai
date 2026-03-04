class MockLocalStorage {
  private store = new Map<string, string>();

  constructor(initialValues?: Record<string, string>) {
    for (const [key, value] of Object.entries(initialValues ?? {})) {
      this.store.set(key, value);
    }
  }

  get length(): number {
    return this.store.size;
  }

  clear(): void {
    this.store.clear();
  }

  getItem(key: string): string | null {
    return this.store.has(key) ? this.store.get(key)! : null;
  }

  key(index: number): string | null {
    return Array.from(this.store.keys())[index] ?? null;
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  setItem(key: string, value: string): void {
    this.store.set(key, String(value));
  }
}

export interface BrowserMockController {
  window: {
    localStorage: MockLocalStorage;
    location: URL;
    history: { replaceState: (state: unknown, title: string, url?: string | URL | null) => void };
    dispatchEvent: (event: Event) => boolean;
  };
  localStorage: MockLocalStorage;
  replaceStateCalls: string[];
  dispatchedEvents: string[];
  restore: () => void;
}

export function installBrowserMock(options?: {
  href?: string;
  storage?: Record<string, string>;
}): BrowserMockController {
  const originalWindow = (globalThis as { window?: unknown }).window;
  const originalLocalStorage = (globalThis as { localStorage?: unknown }).localStorage;

  const replaceStateCalls: string[] = [];
  const dispatchedEvents: string[] = [];
  const localStorage = new MockLocalStorage(options?.storage);

  const windowMock = {
    localStorage,
    location: new URL(options?.href ?? "https://superapp.test/calculadoras"),
    history: {
      replaceState: (_state: unknown, _title: string, url?: string | URL | null) => {
        if (typeof url !== "undefined" && url !== null) {
          replaceStateCalls.push(String(url));
        }
      },
    },
    dispatchEvent: (event: Event) => {
      dispatchedEvents.push(event.type);
      return true;
    },
  };

  Object.defineProperty(globalThis, "window", {
    value: windowMock,
    configurable: true,
    writable: true,
  });
  Object.defineProperty(globalThis, "localStorage", {
    value: localStorage,
    configurable: true,
    writable: true,
  });

  return {
    window: windowMock,
    localStorage,
    replaceStateCalls,
    dispatchedEvents,
    restore: () => {
      if (typeof originalWindow === "undefined") {
        Reflect.deleteProperty(globalThis, "window");
      } else {
        Object.defineProperty(globalThis, "window", {
          value: originalWindow,
          configurable: true,
          writable: true,
        });
      }

      if (typeof originalLocalStorage === "undefined") {
        Reflect.deleteProperty(globalThis, "localStorage");
      } else {
        Object.defineProperty(globalThis, "localStorage", {
          value: originalLocalStorage,
          configurable: true,
          writable: true,
        });
      }
    },
  };
}
