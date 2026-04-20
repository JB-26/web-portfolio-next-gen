/**
 * ISO — isOwner() unit tests (Phase 3)
 *
 * Covers the five cases from the QA Test Plan §Unit Test Inventory
 * `isOwner.test.js`:
 *   1. Valid session with `isOwner: true` → returns true
 *   2. Session with `isOwner: false`      → returns false
 *   3. No cookie at all                   → returns false
 *   4. IRON_SESSION_PASSWORD unset        → throws a typed AuthConfigError
 *                                           (does NOT crash the process)
 *   5. Empty cookie string                → returns false
 *
 * We mock `iron-session` so the test controls what `getIronSession` returns
 * per case. Case 4 is the one test where we do NOT mock iron-session — we
 * let the real `sessionOptions.password` getter throw on a missing env var.
 */

import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import httpMocks from "node-mocks-http";

// ---------------------------------------------------------------------------
// Per-test mock of iron-session. Cases 1, 2, 3, 5 drive `getIronSession`'s
// return value via `mockSessionValue` set in each test's body.
// ---------------------------------------------------------------------------
let mockSessionValue = {};

vi.mock("iron-session", () => ({
  getIronSession: vi.fn(async () => mockSessionValue),
}));

// Import AFTER vi.mock so the mocked binding is used.
const { isOwner, AuthConfigError, sessionOptions } = await import("@/lib/auth.ts");
const ironSessionMod = await import("iron-session");

// ---------------------------------------------------------------------------
// Env scaffolding. IRON_SESSION_PASSWORD must be set for cases 1-3 and 5;
// case 4 explicitly unsets it. Restore after each test.
// ---------------------------------------------------------------------------
const ORIGINAL_ENV = process.env.IRON_SESSION_PASSWORD;

beforeEach(() => {
  vi.clearAllMocks();
  mockSessionValue = {};
  process.env.IRON_SESSION_PASSWORD =
    "a".repeat(32) + "b".repeat(32); // 64 chars, satisfies iron-session's 32-byte minimum
});

afterEach(() => {
  if (ORIGINAL_ENV === undefined) {
    delete process.env.IRON_SESSION_PASSWORD;
  } else {
    process.env.IRON_SESSION_PASSWORD = ORIGINAL_ENV;
  }
});

/** Build a fresh req/res pair for each test. */
function makeReqRes(cookieHeader) {
  const req = httpMocks.createRequest({
    method: "GET",
    headers: cookieHeader !== undefined ? { cookie: cookieHeader } : {},
  });
  const res = httpMocks.createResponse();
  return { req, res };
}

describe("isOwner()", () => {
  // ISO-01: valid session with isOwner: true → true
  test("ISO-01: valid session with isOwner=true returns true", async () => {
    mockSessionValue = { isOwner: true, csrfToken: "deadbeef".repeat(8) };
    const { req, res } = makeReqRes("portfolio_session=validencryptedblob");

    const result = await isOwner(req, res);

    expect(result).toBe(true);
    expect(ironSessionMod.getIronSession).toHaveBeenCalledTimes(1);
  });

  // ISO-02: session exists but isOwner is false → false
  test("ISO-02: session with isOwner=false returns false", async () => {
    mockSessionValue = { isOwner: false };
    const { req, res } = makeReqRes("portfolio_session=somecookie");

    const result = await isOwner(req, res);

    expect(result).toBe(false);
  });

  // ISO-03: no cookie header at all → iron-session returns an empty session
  //          object; isOwner is undefined → false.
  test("ISO-03: no cookie header returns false", async () => {
    mockSessionValue = {}; // iron-session's behaviour when the cookie is absent
    const { req, res } = makeReqRes(undefined);

    const result = await isOwner(req, res);

    expect(result).toBe(false);
  });

  // ISO-04: IRON_SESSION_PASSWORD unset → accessing sessionOptions.password
  //          throws AuthConfigError. We test this via the getter directly,
  //          because that's where the contract is — callers may catch and
  //          convert to a 500, but the module must not crash at import time.
  test("ISO-04: missing IRON_SESSION_PASSWORD throws AuthConfigError (module does not crash)", () => {
    delete process.env.IRON_SESSION_PASSWORD;

    expect(() => sessionOptions.password).toThrowError(AuthConfigError);
    expect(() => sessionOptions.password).toThrow(/IRON_SESSION_PASSWORD/);
  });

  // ISO-05: empty cookie string → iron-session still returns an empty session
  //          object; isOwner is undefined → false.
  test("ISO-05: empty cookie string returns false", async () => {
    mockSessionValue = {};
    const { req, res } = makeReqRes("");

    const result = await isOwner(req, res);

    expect(result).toBe(false);
  });
});
