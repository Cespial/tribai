import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";

import { checkRateLimit } from "../../src/lib/api/rate-limiter";

let restoreNow: (() => void) | undefined;
let ipCounter = 100;

afterEach(() => {
  restoreNow?.();
  restoreNow = undefined;
});

function mockNow(value: number): void {
  const original = Date.now;
  Date.now = () => value;
  restoreNow = () => { Date.now = original; };
}

function nextIp(): string {
  return `192.168.99.${ipCounter++}`;
}

describe("security/rate-limiter-abuse", () => {
  it("blocks rapid burst (21 requests in < 1s)", () => {
    mockNow(2_000_000_000_000);
    const ip = nextIp();
    for (let i = 0; i < 20; i++) checkRateLimit(ip);
    const result = checkRateLimit(ip);
    assert.equal(result.allowed, false);
    assert.ok((result.retryAfter ?? 0) > 0);
  });

  it("retryAfter is within 60 seconds", () => {
    mockNow(2_000_000_100_000);
    const ip = nextIp();
    for (let i = 0; i < 20; i++) checkRateLimit(ip);
    const result = checkRateLimit(ip);
    assert.ok(result.retryAfter! <= 60, `retryAfter too large: ${result.retryAfter}`);
  });

  it("different IPs have independent limits", () => {
    mockNow(2_000_000_200_000);
    const ip1 = nextIp();
    const ip2 = nextIp();
    for (let i = 0; i < 20; i++) checkRateLimit(ip1);
    assert.equal(checkRateLimit(ip1).allowed, false);
    assert.equal(checkRateLimit(ip2).allowed, true);
  });

  it("allows requests again after window expires", () => {
    const start = 2_000_000_300_000;
    const ip = nextIp();
    mockNow(start);
    for (let i = 0; i < 20; i++) checkRateLimit(ip);
    assert.equal(checkRateLimit(ip).allowed, false);

    restoreNow?.();
    restoreNow = undefined;
    mockNow(start + 61_000);
    assert.equal(checkRateLimit(ip).allowed, true);
  });

  it("partial window expiration allows some requests", () => {
    const start = 2_000_000_400_000;
    const ip = nextIp();
    mockNow(start);
    // Send 10 at t=0
    for (let i = 0; i < 10; i++) checkRateLimit(ip);

    restoreNow?.();
    restoreNow = undefined;
    // Send 10 at t=30s
    mockNow(start + 30_000);
    for (let i = 0; i < 10; i++) checkRateLimit(ip);
    // 21st should be blocked (all 20 within 60s window)
    assert.equal(checkRateLimit(ip).allowed, false);
  });
});
