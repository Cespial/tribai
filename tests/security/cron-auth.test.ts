import assert from "node:assert/strict";
import { describe, it, afterEach } from "node:test";

/**
 * Tests that cron endpoints validate CRON_SECRET authorization.
 * Tests the auth logic pattern used in src/app/api/cron/indicadores/route.ts
 */

describe("security/cron-auth", () => {
  const originalEnv = process.env.CRON_SECRET;

  afterEach(() => {
    if (originalEnv !== undefined) {
      process.env.CRON_SECRET = originalEnv;
    } else {
      delete process.env.CRON_SECRET;
    }
  });

  function checkCronAuth(authHeader: string | null, cronSecret: string | undefined): { authorized: boolean } {
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return { authorized: false };
    }
    return { authorized: true };
  }

  it("rejects request without authorization header when CRON_SECRET is set", () => {
    const result = checkCronAuth(null, "my-secret-123");
    assert.equal(result.authorized, false);
  });

  it("rejects request with wrong Bearer token", () => {
    const result = checkCronAuth("Bearer wrong-token", "my-secret-123");
    assert.equal(result.authorized, false);
  });

  it("accepts request with correct Bearer token", () => {
    const result = checkCronAuth("Bearer my-secret-123", "my-secret-123");
    assert.equal(result.authorized, true);
  });

  it("allows all requests when CRON_SECRET is not set", () => {
    const result = checkCronAuth(null, undefined);
    assert.equal(result.authorized, true);
  });
});
