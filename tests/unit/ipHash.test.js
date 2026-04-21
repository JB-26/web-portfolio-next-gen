/**
 * IPH — hashIp() / extractClientIp() unit tests (Phase 5).
 *
 * Covers:
 *   - IPH-01: hashIp is deterministic (same IP + salt → same output)
 *   - IPH-02: salt-dependence (different salt → different output)
 *   - IPH-03: missing salt throws IpHashConfigError
 *   - IPH-04: empty salt throws IpHashConfigError
 *   - IPH-05: extractClientIp reads x-forwarded-for single-value header
 *   - IPH-06: extractClientIp takes first entry of comma-separated XFF list
 *   - IPH-07: extractClientIp falls back to req.socket.remoteAddress
 *   - IPH-08: extractClientIp falls back to "unknown" when nothing is available
 */

import { describe, test, expect, beforeEach, afterEach } from "vitest";
import httpMocks from "node-mocks-http";

import { hashIp, extractClientIp, IpHashConfigError } from "../../lib/ipHash.ts";

const ORIGINAL_SALT = process.env.IP_HASH_SALT;

beforeEach(() => {
  process.env.IP_HASH_SALT = "test-salt-ABCDEFGHIJKLMNOPQRSTUV";
});

afterEach(() => {
  if (ORIGINAL_SALT === undefined) {
    delete process.env.IP_HASH_SALT;
  } else {
    process.env.IP_HASH_SALT = ORIGINAL_SALT;
  }
});

describe("hashIp()", () => {
  test("IPH-01: same IP with the same salt yields the same hash", () => {
    const a = hashIp("203.0.113.7");
    const b = hashIp("203.0.113.7");
    expect(a).toBe(b);
    // Hex SHA-256 is 64 chars.
    expect(a).toMatch(/^[0-9a-f]{64}$/);
  });

  test("IPH-02: changing the salt changes the hash for the same IP", () => {
    const withSaltA = hashIp("203.0.113.7");

    process.env.IP_HASH_SALT = "different-salt-xxxxxxxxxxxxxxxxxxx";
    const withSaltB = hashIp("203.0.113.7");

    expect(withSaltA).not.toBe(withSaltB);
  });

  test("IPH-03: missing IP_HASH_SALT throws IpHashConfigError", () => {
    delete process.env.IP_HASH_SALT;
    expect(() => hashIp("203.0.113.7")).toThrowError(IpHashConfigError);
    expect(() => hashIp("203.0.113.7")).toThrow(/IP_HASH_SALT/);
  });

  test("IPH-04: empty IP_HASH_SALT throws IpHashConfigError", () => {
    process.env.IP_HASH_SALT = "";
    expect(() => hashIp("203.0.113.7")).toThrowError(IpHashConfigError);
  });

  test("IPH-04b: IP_HASH_SALT shorter than the minimum length throws IpHashConfigError", () => {
    // 15 chars — one below the enforced 16-char floor. Pins the
    // defence-in-depth guard against placeholder values like "dev".
    process.env.IP_HASH_SALT = "aaaaaaaaaaaaaaa";
    expect(() => hashIp("203.0.113.7")).toThrowError(IpHashConfigError);
    expect(() => hashIp("203.0.113.7")).toThrow(/at least/);
  });
});

describe("extractClientIp()", () => {
  test("IPH-05: reads a single-IP x-forwarded-for header", () => {
    const req = httpMocks.createRequest({
      method: "POST",
      headers: { "x-forwarded-for": "203.0.113.7" },
    });
    expect(extractClientIp(req)).toBe("203.0.113.7");
  });

  test("IPH-06: takes the first entry of a comma-separated XFF list", () => {
    const req = httpMocks.createRequest({
      method: "POST",
      headers: { "x-forwarded-for": "203.0.113.7, 10.0.0.1, 10.0.0.2" },
    });
    expect(extractClientIp(req)).toBe("203.0.113.7");
  });

  test("IPH-06b: trims whitespace around the first XFF entry", () => {
    const req = httpMocks.createRequest({
      method: "POST",
      headers: { "x-forwarded-for": "   198.51.100.4  , 10.0.0.1" },
    });
    expect(extractClientIp(req)).toBe("198.51.100.4");
  });

  test("IPH-07: falls back to req.socket.remoteAddress when XFF is absent", () => {
    const req = httpMocks.createRequest({
      method: "POST",
    });
    // node-mocks-http doesn't populate `socket` by default — attach one.
    req.socket = { remoteAddress: "127.0.0.1" };
    expect(extractClientIp(req)).toBe("127.0.0.1");
  });

  test("IPH-08: returns 'unknown' when neither header nor socket IP is available", () => {
    const req = httpMocks.createRequest({
      method: "POST",
    });
    // No socket attached, no XFF header.
    req.socket = {};
    expect(extractClientIp(req)).toBe("unknown");
  });
});
