import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";

import {
  checkRateLimit,
  checkRateLimitWithHeaders,
} from "../../src/lib/api/rate-limiter";

let restoreNow: (() => void) | undefined;
let ipCounter = 1;

afterEach(() => {
  restoreNow?.();
  restoreNow = undefined;
});

function mockNow(value: number): void {
  const original = Date.now;
  Date.now = () => value;
  restoreNow = () => {
    Date.now = original;
  };
}

function nextIp(prefix = "10.0.0"): string {
  const value = ipCounter++;
  return `${prefix}.${value}`;
}

describe("api/rate-limiter", () => {
  it("permite 20 requests y bloquea el 21 dentro de la ventana", async () => {
    mockNow(1_700_000_000_000);
    const ip = nextIp();

    for (let i = 0; i < 20; i++) {
      assert.equal((await checkRateLimit(ip)).allowed, true);
    }

    const blocked = await checkRateLimit(ip);
    assert.equal(blocked.allowed, false);
    assert.ok((blocked.retryAfter ?? 0) > 0);
  });

  it("después de 60s vuelve a permitir requests", async () => {
    const start = 1_700_000_000_000;
    const ip = nextIp();

    mockNow(start);
    for (let i = 0; i < 20; i++) await checkRateLimit(ip);
    assert.equal((await checkRateLimit(ip)).allowed, false);

    restoreNow?.();
    restoreNow = undefined;
    mockNow(start + 61_000);

    assert.equal((await checkRateLimit(ip)).allowed, true);
  });

  it("usa x-real-ip cuando está presente", async () => {
    mockNow(1_700_000_100_000);
    const ip = nextIp("20.0.0");

    const req = new Request("https://api.test/chat", {
      headers: {
        "x-real-ip": ip,
      },
    });

    const first = await checkRateLimitWithHeaders(req);
    assert.equal(first.allowed, true);

    for (let i = 0; i < 19; i++) await checkRateLimit(ip);
    assert.equal((await checkRateLimitWithHeaders(req)).allowed, false);
  });

  it("x-forwarded-for usa la primera IP", async () => {
    mockNow(1_700_000_200_000);
    const ip = nextIp("30.0.0");

    const req = new Request("https://api.test/chat", {
      headers: {
        "x-forwarded-for": `${ip}, 9.9.9.9`,
      },
    });

    for (let i = 0; i < 20; i++) {
      await checkRateLimitWithHeaders(req);
    }

    const blocked = await checkRateLimitWithHeaders(req);
    assert.equal(blocked.allowed, false);
  });
});
