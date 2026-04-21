/**
 * API Integration Tests — Auth feature (Phase 3)
 *
 * Covers AUTH-01..AUTH-06 from the implementation plan Phase 3 test matrix.
 *
 * Runner : Vitest
 * HTTP   : node-mocks-http
 * Session: iron-session is mocked so session mutation is observable without
 *          needing a working IRON_SESSION_PASSWORD-derived encryption key.
 *
 * Every test runs with `NODE_ENV=test` (Vitest default), so Secure flags are
 * NOT asserted — production enables `secure: true` via `process.env.NODE_ENV`.
 */

import { describe, test, expect, vi, beforeEach } from "vitest";
import httpMocks from "node-mocks-http";

// ---------------------------------------------------------------------------
// Mock iron-session. The mock session is a fresh object per test whose
// `save` and `destroy` methods are spy functions; mutations to `isOwner` and
// `csrfToken` are observed by reading the object back after the handler runs.
// ---------------------------------------------------------------------------
let currentSession;

vi.mock("iron-session", () => ({
  getIronSession: vi.fn(async () => currentSession),
}));

// ---------------------------------------------------------------------------
// Deferred imports so vi.mock takes effect. Login/logout handlers live at
// pages/api/auth/login.ts and pages/api/auth/logout.ts.
// ---------------------------------------------------------------------------
let loginHandler;
let logoutHandler;

try {
  const mod = await import("@/pages/api/auth/login.ts");
  loginHandler = mod.default;
} catch {
  loginHandler = null;
}

try {
  const mod = await import("@/pages/api/auth/logout.ts");
  logoutHandler = mod.default;
} catch {
  logoutHandler = null;
}

function requireHandler(handler, name) {
  if (!handler) {
    throw new Error(
      `Route handler "${name}" not found — Phase 3 implementation missing.`,
    );
  }
}

const SITE_ORIGIN = "http://localhost:3000";
const CORRECT_PASSWORD = "test-password-sufficiently-long-to-be-valid";
const WRONG_PASSWORD = "wrong-password-totally-different-length-too";

/** Build a fresh session object with spy methods. */
function freshSession() {
  return {
    isOwner: undefined,
    csrfToken: undefined,
    save: vi.fn(async () => {}),
    destroy: vi.fn(() => {}),
  };
}

/** Build a POST request with JSON body, defaulting origin to same-site. */
function makePostReq({ body = {}, origin = SITE_ORIGIN, headers = {} } = {}) {
  return httpMocks.createRequest({
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(origin === null ? {} : { origin }),
      ...headers,
    },
    body,
  });
}

/** Return the Set-Cookie header as a string[] regardless of shape. */
function getSetCookies(res) {
  const raw = res.getHeader("Set-Cookie");
  if (raw === undefined) return [];
  return Array.isArray(raw) ? raw.map(String) : [String(raw)];
}

beforeEach(() => {
  vi.clearAllMocks();
  currentSession = freshSession();
  process.env.NEXT_PUBLIC_SITE_URL = SITE_ORIGIN;
  process.env.OWNER_PASSWORD = CORRECT_PASSWORD;
  // iron-session itself is mocked, but the login handler still reads
  // sessionOptions.password indirectly via getSession(). Our mock bypasses
  // that path, but set a dummy so any internal reference doesn't throw.
  process.env.IRON_SESSION_PASSWORD = "x".repeat(64);
});

// ===========================================================================
// POST /api/auth/login
// ===========================================================================

describe("POST /api/auth/login", () => {
  // AUTH-01: correct password + same-origin → 200, session mutated, sentinels set
  test("AUTH-01: correct password returns 200 and mutates session with isOwner=true and a 64-char hex csrfToken", async () => {
    requireHandler(loginHandler, "pages/api/auth/login.ts");

    const req = makePostReq({ body: { password: CORRECT_PASSWORD } });
    const res = httpMocks.createResponse();

    await loginHandler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res._getJSONData()).toEqual({ ok: true });

    // Session must have been flipped to owner + token minted.
    expect(currentSession.isOwner).toBe(true);
    expect(typeof currentSession.csrfToken).toBe("string");
    expect(currentSession.csrfToken).toMatch(/^[0-9a-f]{64}$/);
    expect(currentSession.save).toHaveBeenCalledTimes(1);

    // Set-Cookie must include both sentinel cookies.
    const cookies = getSetCookies(res);
    const joined = cookies.join("\n");
    expect(joined).toMatch(new RegExp(`csrf_token=${currentSession.csrfToken}`));
    expect(joined).toMatch(/owner_ui=1/);
    // And must NOT be returned in the JSON body — client reads from cookie.
    expect(res._getJSONData()).not.toHaveProperty("csrfToken");
  });

  // AUTH-02: wrong password → 401 UNAUTHORIZED, session NOT mutated
  test("AUTH-02: wrong password returns 401 UNAUTHORIZED without mutating session", async () => {
    requireHandler(loginHandler, "pages/api/auth/login.ts");

    const req = makePostReq({ body: { password: WRONG_PASSWORD } });
    const res = httpMocks.createResponse();

    await loginHandler(req, res);

    expect(res.statusCode).toBe(401);
    const body = res._getJSONData();
    expect(body.error.code).toBe("UNAUTHORIZED");
    // Session must be untouched.
    expect(currentSession.isOwner).toBeUndefined();
    expect(currentSession.csrfToken).toBeUndefined();
    expect(currentSession.save).not.toHaveBeenCalled();
  });

  // AUTH-03: missing body → 400 VALIDATION
  test("AUTH-03: missing body returns 400 VALIDATION", async () => {
    requireHandler(loginHandler, "pages/api/auth/login.ts");

    const req = makePostReq({ body: {} });
    const res = httpMocks.createResponse();

    await loginHandler(req, res);

    expect(res.statusCode).toBe(400);
    const body = res._getJSONData();
    expect(body.error.code).toBe("VALIDATION");
    expect(currentSession.save).not.toHaveBeenCalled();
  });

  // AUTH-04: missing / wrong Origin header → 403 FORBIDDEN, session NOT mutated
  test("AUTH-04: cross-origin request returns 403 FORBIDDEN without mutating session", async () => {
    requireHandler(loginHandler, "pages/api/auth/login.ts");

    const req = makePostReq({
      body: { password: CORRECT_PASSWORD },
      origin: "https://evil.example.com",
    });
    const res = httpMocks.createResponse();

    await loginHandler(req, res);

    expect(res.statusCode).toBe(403);
    const body = res._getJSONData();
    expect(body.error.code).toBe("FORBIDDEN");
    expect(currentSession.isOwner).toBeUndefined();
    expect(currentSession.save).not.toHaveBeenCalled();
  });

  // AUTH-05: wrong method (GET) → 405 METHOD_NOT_ALLOWED
  test("AUTH-05: GET request returns 405 METHOD_NOT_ALLOWED", async () => {
    requireHandler(loginHandler, "pages/api/auth/login.ts");

    const req = httpMocks.createRequest({
      method: "GET",
      headers: { origin: SITE_ORIGIN },
    });
    const res = httpMocks.createResponse();

    await loginHandler(req, res);

    expect(res.statusCode).toBe(405);
    const body = res._getJSONData();
    expect(body.error.code).toBe("METHOD_NOT_ALLOWED");
    expect(currentSession.save).not.toHaveBeenCalled();
  });
});

// ===========================================================================
// POST /api/auth/logout
// ===========================================================================

describe("POST /api/auth/logout", () => {
  // AUTH-06: logout destroys session and clears sentinel cookies
  test("AUTH-06: POST returns 200, session destroyed, Set-Cookie clears csrf_token and owner_ui", async () => {
    requireHandler(logoutHandler, "pages/api/auth/logout.ts");

    // Pre-populate the session so destroy() has something to clear.
    currentSession.isOwner = true;
    currentSession.csrfToken = "a".repeat(64);

    const req = makePostReq({ body: {} });
    const res = httpMocks.createResponse();

    await logoutHandler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res._getJSONData()).toEqual({ ok: true });
    expect(currentSession.destroy).toHaveBeenCalledTimes(1);

    // Sentinel cookies must be expired. A cleared cookie has Max-Age=0
    // (or an Expires value in the past). We only assert Max-Age=0 since
    // that's what our handler writes.
    const cookies = getSetCookies(res);
    const joined = cookies.join("\n");
    expect(joined).toMatch(/csrf_token=;[^\n]*Max-Age=0/);
    expect(joined).toMatch(/owner_ui=;[^\n]*Max-Age=0/);
  });
});
