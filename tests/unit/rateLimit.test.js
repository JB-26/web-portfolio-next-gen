/**
 * RL — rate limit unit tests (Phase 5).
 *
 * Covers:
 *   - RL-01: under-budget → { allowed: true }
 *   - RL-02: over-budget  → { allowed: false, retryAfter: <positive integer> }
 *   - RL-03: missing Upstash env vars → fail open, error logged
 *   - RL-04: Upstash `.limit()` throws → fail open, error logged
 *   - RL-05: hashIp is used as the key (not the raw IP)
 *
 * We mock `@upstash/ratelimit` + `@upstash/redis` so no network happens.
 * Mocks are declared before the dynamic import so Vitest's hoisting applies.
 */

import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import httpMocks from "node-mocks-http";

// ---------------------------------------------------------------------------
// Mock the Upstash modules. `vi.hoisted()` ensures `mockLimit` exists before
// the `vi.mock()` factory runs (Vitest hoists mocks above normal imports).
// ---------------------------------------------------------------------------

const { mockLimit } = vi.hoisted(() => ({ mockLimit: vi.fn() }));

vi.mock("@upstash/ratelimit", () => {
  // Use a `function` expression (not an arrow / vi.fn-only) so the class is
  // `new`-able. vi.fn().mockImplementation(() => ...) is NOT constructible.
  function Ratelimit() {
    return { limit: mockLimit };
  }
  Ratelimit.slidingWindow = vi.fn((max, window) => ({ kind: "sliding", max, window }));
  return { Ratelimit };
});

vi.mock("@upstash/redis", () => {
  function Redis() {
    return {};
  }
  return { Redis };
});

// ---------------------------------------------------------------------------
// Import AFTER the mocks are registered. Also reset the cached limiter in
// the module under test between tests — it caches on first call, so env-var
// changes between tests would otherwise have no effect.
// ---------------------------------------------------------------------------

let rateLimitMod;

const ORIGINAL_URL = process.env.UPSTASH_REDIS_REST_URL;
const ORIGINAL_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
const ORIGINAL_SALT = process.env.IP_HASH_SALT;

beforeEach(async () => {
  vi.clearAllMocks();
  mockLimit.mockReset();

  process.env.UPSTASH_REDIS_REST_URL = "https://upstash.example";
  process.env.UPSTASH_REDIS_REST_TOKEN = "test-token";
  process.env.IP_HASH_SALT = "test-salt-ABCDEFGHIJKLMNOPQRSTUV";

  // Fresh copy of the module every test so the cached `limiter` instance
  // resets with the env vars. Vitest's `vi.resetModules()` handles this.
  vi.resetModules();
  rateLimitMod = await import("../../lib/rateLimit.ts");
});

afterEach(() => {
  process.env.UPSTASH_REDIS_REST_URL = ORIGINAL_URL;
  process.env.UPSTASH_REDIS_REST_TOKEN = ORIGINAL_TOKEN;
  process.env.IP_HASH_SALT = ORIGINAL_SALT;
});

function makeReq(xff = "203.0.113.7") {
  return httpMocks.createRequest({
    method: "POST",
    headers: { "x-forwarded-for": xff },
  });
}

describe("checkLimit()", () => {
  test("RL-01: returns allowed:true when Upstash reports success", async () => {
    mockLimit.mockResolvedValue({
      success: true,
      limit: 5,
      remaining: 4,
      reset: Date.now() + 60000,
    });

    const res = await rateLimitMod.checkLimit(makeReq());
    expect(res.allowed).toBe(true);
    expect(res.retryAfter).toBeUndefined();
  });

  test("RL-02: returns allowed:false with positive retryAfter when over budget", async () => {
    const now = Date.now();
    mockLimit.mockResolvedValue({
      success: false,
      limit: 5,
      remaining: 0,
      reset: now + 45_000, // 45 seconds in the future
    });

    const res = await rateLimitMod.checkLimit(makeReq());
    expect(res.allowed).toBe(false);
    expect(typeof res.retryAfter).toBe("number");
    // Whole seconds, within ±1 of 45 to allow for timer drift during the test.
    expect(res.retryAfter).toBeGreaterThanOrEqual(44);
    expect(res.retryAfter).toBeLessThanOrEqual(46);
  });

  test("RL-02b: retryAfter is at least 1 even when reset has already passed", async () => {
    mockLimit.mockResolvedValue({
      success: false,
      limit: 5,
      remaining: 0,
      reset: Date.now() - 5_000, // already in the past
    });

    const res = await rateLimitMod.checkLimit(makeReq());
    expect(res.allowed).toBe(false);
    expect(res.retryAfter).toBe(1);
  });

  test("RL-03: missing Upstash env vars → fail open, log emitted", async () => {
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;

    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    // Reimport so the cached limiter forgets the env-var state from beforeEach.
    vi.resetModules();
    const mod = await import("../../lib/rateLimit.ts");

    const res = await mod.checkLimit(makeReq());
    expect(res.allowed).toBe(true);
    expect(res.retryAfter).toBeUndefined();

    expect(errorSpy).toHaveBeenCalled();
    const logMessages = errorSpy.mock.calls.map((args) => String(args[0]));
    expect(logMessages.some((m) => m.includes("misconfigured") || m.includes("fail"))).toBe(true);

    errorSpy.mockRestore();
  });

  test("RL-04: Upstash limit() rejects → fail open, log emitted", async () => {
    mockLimit.mockRejectedValue(new Error("ECONNREFUSED"));
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const res = await rateLimitMod.checkLimit(makeReq());
    expect(res.allowed).toBe(true);
    expect(res.retryAfter).toBeUndefined();

    expect(errorSpy).toHaveBeenCalled();

    errorSpy.mockRestore();
  });

  test("RL-05: the key passed to Upstash is a HEX HASH, not the raw IP", async () => {
    mockLimit.mockResolvedValue({
      success: true,
      limit: 5,
      remaining: 4,
      reset: Date.now() + 60000,
    });

    await rateLimitMod.checkLimit(makeReq("203.0.113.7"));

    expect(mockLimit).toHaveBeenCalledTimes(1);
    const key = mockLimit.mock.calls[0][0];
    // Must be a 64-char lowercase hex string (HMAC-SHA256).
    expect(key).toMatch(/^[0-9a-f]{64}$/);
    // Must NOT be the raw IP.
    expect(key).not.toBe("203.0.113.7");
  });

  test("RL-06: missing IP_HASH_SALT → fail open (not a 500) with log", async () => {
    delete process.env.IP_HASH_SALT;
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const res = await rateLimitMod.checkLimit(makeReq());
    expect(res.allowed).toBe(true);

    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });
});
