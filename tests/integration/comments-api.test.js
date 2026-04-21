/**
 * API Integration Tests — Comments feature
 *
 * Tests cases GET-01..GET-05, POST-01..POST-10, DELETE-01..DELETE-05
 * from the QA Test Plan §3 API Integration Tests.
 *
 * Runner : Vitest
 * HTTP   : node-mocks-http (no real server needed)
 * DB     : vi.mock("@/lib/comments/db") — no Neon connection required
 * Mail   : vi.mock("@/lib/mail")
 * Auth   : vi.mock("@/lib/auth")
 * Rate   : vi.mock("@/lib/rateLimit")
 *
 * Route handlers are imported from pages/api/comments/index.ts (GET+POST)
 * and pages/api/comments/[id].ts (DELETE). Both files are owned by the
 * TS Architect and may not exist yet — tests will report "module not found"
 * until Phase 2 implementation lands. That is expected during parallel work.
 */

import { describe, test, expect, vi, beforeEach } from "vitest";
import httpMocks from "node-mocks-http";

// ---------------------------------------------------------------------------
// Module mocks — declared before any dynamic imports so hoisting takes effect.
// vi.mock() calls are hoisted to the top of the file by Vitest's transformer.
// ---------------------------------------------------------------------------

vi.mock("@/lib/comments/db", () => ({
  listByPost: vi.fn(),
  insert: vi.fn(),
  remove: vi.fn(),
  countByPost: vi.fn(),
}));

vi.mock("@/lib/mail", () => ({
  notifyOwnerOfComment: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  // Phase 3 surface:
  //   - getSession is the load-bearing call in the DELETE handler; tests
  //     override its resolved value to flip isOwner.
  //   - isOwner is kept as an async stub for any callers that still reach
  //     for the wrapper (was sync in Phase 2).
  //   - verifyOrigin / verifyCsrf default to true so happy-path tests only
  //     need to override the check they are exercising.
  //   - generateCsrfToken returns a stable string for snapshotability.
  getSession: vi.fn().mockResolvedValue({}),
  isOwner: vi.fn().mockResolvedValue(false),
  verifyOrigin: vi.fn().mockReturnValue(true),
  verifyCsrf: vi.fn().mockReturnValue(true),
  generateCsrfToken: vi.fn().mockReturnValue("test-token"),
}));

vi.mock("@/lib/rateLimit", () => ({
  // Default: rate limit allows the request. Override per-test.
  checkLimit: vi.fn().mockResolvedValue({ allowed: true }),
}));

// ---------------------------------------------------------------------------
// Deferred imports of route handlers (may not exist until TS Architect lands).
// Using dynamic import inside beforeEach would re-trigger mocks correctly;
// top-level await import is fine here since Vitest supports ESM top-level await.
// ---------------------------------------------------------------------------

let indexHandler; // default export of pages/api/comments/index.ts
let idHandler;    // default export of pages/api/comments/[id].ts
let db;
let mail;
let auth;
let rateLimit;

// Load modules once before all tests in this file.
// If the route files don't exist yet the describe blocks will still register
// but every test inside will throw "Cannot find module …" — that is the
// expected "waiting on TS Architect" failure mode.
try {
  const indexMod = await import("@/pages/api/comments/index.ts");
  indexHandler = indexMod.default;
} catch {
  // Module not yet created — tests will fail with a clear message.
  indexHandler = null;
}

try {
  const idMod = await import("@/pages/api/comments/[id].ts");
  idHandler = idMod.default;
} catch {
  idHandler = null;
}

// Import mock instances so we can drive return values per-test.
db = await import("@/lib/comments/db");
mail = await import("@/lib/mail");
auth = await import("@/lib/auth");
rateLimit = await import("@/lib/rateLimit");

// ---------------------------------------------------------------------------
// Shared fixtures
// ---------------------------------------------------------------------------

const VALID_UUID = "123e4567-e89b-12d3-a456-426614174000";
const INVALID_UUID = "not-a-uuid";

const SAMPLE_COMMENT = {
  id: VALID_UUID,
  postId: "2025-01-30-scrum",
  author: "Alice",
  body: "Great post!",
  createdAt: "2025-01-30T12:00:00.000Z",
  status: "approved",
};

/** Build a GET /api/comments request. */
function makeGetReq(query = {}) {
  return httpMocks.createRequest({ method: "GET", query });
}

/** Build a POST /api/comments request. */
function makePostReq(body = {}) {
  return httpMocks.createRequest({
    method: "POST",
    headers: { "content-type": "application/json" },
    body,
  });
}

/** Build a DELETE /api/comments/[id] request. */
function makeDeleteReq(id = VALID_UUID, headers = {}) {
  return httpMocks.createRequest({
    method: "DELETE",
    query: { id },
    headers,
  });
}

/** Assert the route handler exists, otherwise skip with a clear message. */
function requireHandler(handler, name) {
  if (!handler) {
    throw new Error(
      `Route handler "${name}" not found — TS Architect Phase 2 implementation not yet merged.`
    );
  }
}

// ---------------------------------------------------------------------------
// Reset all mocks to their default state before each test.
// ---------------------------------------------------------------------------
beforeEach(() => {
  vi.clearAllMocks();

  // Restore defaults after per-test overrides.
  rateLimit.checkLimit.mockResolvedValue({ allowed: true });
  auth.getSession.mockResolvedValue({}); // no session → not owner
  auth.isOwner.mockResolvedValue(false);
  auth.verifyOrigin.mockReturnValue(true);
  auth.verifyCsrf.mockReturnValue(true);
  auth.generateCsrfToken.mockReturnValue("test-token");
  mail.notifyOwnerOfComment.mockResolvedValue(undefined);
});

// ===========================================================================
// GET /api/comments
// ===========================================================================

describe("GET /api/comments", () => {
  // GET-01: valid postId with comments → 200 with comment list and total
  test("GET-01: valid postId returns 200 with comment array and total", async () => {
    requireHandler(indexHandler, "pages/api/comments/index.ts");

    db.listByPost.mockResolvedValue([SAMPLE_COMMENT]);
    db.countByPost.mockResolvedValue(1);

    const req = makeGetReq({ postId: "2025-01-30-scrum" });
    const res = httpMocks.createResponse();

    await indexHandler(req, res);

    expect(res.statusCode).toBe(200);
    const body = res._getJSONData();
    expect(Array.isArray(body.comments)).toBe(true);
    expect(body.comments).toHaveLength(1);
    expect(body.comments[0].id).toBe(VALID_UUID);
    expect(typeof body.total).toBe("number");
    expect(body.total).toBe(1);
  });

  // GET-02: valid postId with no comments → 200 with empty array
  test("GET-02: valid postId with no comments returns 200 with empty array", async () => {
    requireHandler(indexHandler, "pages/api/comments/index.ts");

    db.listByPost.mockResolvedValue([]);
    db.countByPost.mockResolvedValue(0);

    const req = makeGetReq({ postId: "post-with-no-comments" });
    const res = httpMocks.createResponse();

    await indexHandler(req, res);

    expect(res.statusCode).toBe(200);
    const body = res._getJSONData();
    expect(body.comments).toEqual([]);
    expect(body.total).toBe(0);
  });

  // GET-03: pagination params forwarded to db.listByPost
  test("GET-03: pagination params (?limit=5&offset=5) are forwarded to db.listByPost", async () => {
    requireHandler(indexHandler, "pages/api/comments/index.ts");

    db.listByPost.mockResolvedValue([]);
    db.countByPost.mockResolvedValue(10);

    const req = makeGetReq({ postId: "post-1", limit: "5", offset: "5" });
    const res = httpMocks.createResponse();

    await indexHandler(req, res);

    expect(res.statusCode).toBe(200);
    // db.listByPost must have been called with the numeric limit/offset values.
    expect(db.listByPost).toHaveBeenCalledWith(
      "post-1",
      expect.objectContaining({ limit: 5, offset: 5 })
    );
  });

  // GET-04: missing postId → 400 VALIDATION
  test("GET-04: missing postId returns 400 VALIDATION", async () => {
    requireHandler(indexHandler, "pages/api/comments/index.ts");

    const req = makeGetReq({}); // no postId
    const res = httpMocks.createResponse();

    await indexHandler(req, res);

    expect(res.statusCode).toBe(400);
    const body = res._getJSONData();
    expect(body.error.code).toBe("VALIDATION");
  });

  // GET-05: wrong method (PUT) → 405 METHOD_NOT_ALLOWED
  test("GET-05: wrong HTTP method (PUT) returns 405 METHOD_NOT_ALLOWED", async () => {
    requireHandler(indexHandler, "pages/api/comments/index.ts");

    const req = httpMocks.createRequest({ method: "PUT", query: { postId: "post-1" } });
    const res = httpMocks.createResponse();

    await indexHandler(req, res);

    expect(res.statusCode).toBe(405);
    const body = res._getJSONData();
    expect(body.error.code).toBe("METHOD_NOT_ALLOWED");
  });
});

// ===========================================================================
// POST /api/comments
// ===========================================================================

describe("POST /api/comments", () => {
  // POST-01: happy path → 201 with comment, notifyOwnerOfComment called once
  test("POST-01: valid payload returns 201 and calls notifyOwnerOfComment once", async () => {
    requireHandler(indexHandler, "pages/api/comments/index.ts");

    db.insert.mockResolvedValue(SAMPLE_COMMENT);

    const req = makePostReq({
      postId: "2025-01-30-scrum",
      author: "Alice",
      body: "Great post!",
    });
    const res = httpMocks.createResponse();

    await indexHandler(req, res);

    expect(res.statusCode).toBe(201);
    const body = res._getJSONData();
    expect(body.comment).toBeDefined();
    expect(body.comment.id).toBe(VALID_UUID);
    expect(mail.notifyOwnerOfComment).toHaveBeenCalledTimes(1);
    expect(mail.notifyOwnerOfComment).toHaveBeenCalledWith(SAMPLE_COMMENT);
  });

  // POST-02: missing body fields → 400 VALIDATION
  test("POST-02: missing required fields returns 400 VALIDATION", async () => {
    requireHandler(indexHandler, "pages/api/comments/index.ts");

    // Completely empty body — no postId, author, or body fields.
    const req = makePostReq({});
    const res = httpMocks.createResponse();

    await indexHandler(req, res);

    expect(res.statusCode).toBe(400);
    const body = res._getJSONData();
    expect(body.error.code).toBe("VALIDATION");
  });

  // POST-03: body containing a link → 400 LINKS (or 422 LINKS per plan)
  test("POST-03: body containing a URL returns 4xx with code LINKS", async () => {
    requireHandler(indexHandler, "pages/api/comments/index.ts");

    const req = makePostReq({
      postId: "post-1",
      author: "Spammer",
      body: "Visit https://spam.example.com for prizes",
    });
    const res = httpMocks.createResponse();

    await indexHandler(req, res);

    // Plan specifies 422 LINKS; accept 400 or 422 — the code is what matters.
    expect([400, 422]).toContain(res.statusCode);
    const body = res._getJSONData();
    expect(body.error.code).toBe("LINKS");
    expect(db.insert).not.toHaveBeenCalled();
  });

  // POST-04: body containing profanity → 422 PROFANITY
  test("POST-04: body containing profanity returns 422 PROFANITY", async () => {
    requireHandler(indexHandler, "pages/api/comments/index.ts");

    // Use a word known to the bad-words library without hardcoding it.
    // Import the same fixture used in unit tests.
    const { KNOWN_PROFANE_WORD } = await import("../fixtures/profanity-words.js");
    const profaneWord = KNOWN_PROFANE_WORD;

    const req = makePostReq({
      postId: "post-1",
      author: "User",
      body: `This is ${profaneWord} content`,
    });
    const res = httpMocks.createResponse();

    await indexHandler(req, res);

    expect(res.statusCode).toBe(422);
    const body = res._getJSONData();
    expect(body.error.code).toBe("PROFANITY");
    expect(db.insert).not.toHaveBeenCalled();
  });

  // POST-05: body over 1000 chars → 400 or 413 with PAYLOAD_TOO_LARGE or VALIDATION
  test("POST-05: body over 1000 characters returns 400 or 413", async () => {
    requireHandler(indexHandler, "pages/api/comments/index.ts");

    const req = makePostReq({
      postId: "post-1",
      author: "User",
      body: "a".repeat(1001),
    });
    const res = httpMocks.createResponse();

    await indexHandler(req, res);

    expect([400, 413]).toContain(res.statusCode);
    const body = res._getJSONData();
    expect(["VALIDATION", "PAYLOAD_TOO_LARGE"]).toContain(body.error.code);
    expect(db.insert).not.toHaveBeenCalled();
  });

  // POST-06: author over 60 chars → 400 VALIDATION
  test("POST-06: author over 60 characters returns 400 VALIDATION", async () => {
    requireHandler(indexHandler, "pages/api/comments/index.ts");

    const req = makePostReq({
      postId: "post-1",
      author: "A".repeat(61),
      body: "Valid body text here",
    });
    const res = httpMocks.createResponse();

    await indexHandler(req, res);

    expect(res.statusCode).toBe(400);
    const body = res._getJSONData();
    expect(body.error.code).toBe("VALIDATION");
    expect(db.insert).not.toHaveBeenCalled();
  });

  // POST-07: honeypot url field populated → 200 silent discard (bot trap)
  test("POST-07: honeypot `url` field populated returns 200 without inserting to DB", async () => {
    requireHandler(indexHandler, "pages/api/comments/index.ts");

    const req = makePostReq({
      postId: "post-1",
      author: "Bot",
      body: "Buy cheap meds",
      url: "http://spambot.example.com", // honeypot field
    });
    const res = httpMocks.createResponse();

    await indexHandler(req, res);

    // Must respond 200 with a generic-looking success body to avoid
    // leaking that a honeypot exists.
    expect(res.statusCode).toBe(200);
    // db.insert MUST NOT be called — silent discard.
    expect(db.insert).not.toHaveBeenCalled();
    expect(mail.notifyOwnerOfComment).not.toHaveBeenCalled();
  });

  // POST-08: rate limit exceeded → 429 with Retry-After header
  test("POST-08: rate limit exceeded returns 429 with Retry-After header", async () => {
    requireHandler(indexHandler, "pages/api/comments/index.ts");

    rateLimit.checkLimit.mockResolvedValue({ allowed: false, retryAfter: 30 });

    const req = makePostReq({
      postId: "post-1",
      author: "User",
      body: "Valid body",
    });
    const res = httpMocks.createResponse();

    await indexHandler(req, res);

    expect(res.statusCode).toBe(429);
    const body = res._getJSONData();
    expect(body.error.code).toBe("RATE_LIMIT");

    // Retry-After header must be present and set to the retryAfter value.
    const retryAfter = res.getHeader("Retry-After");
    expect(String(retryAfter)).toBe("30");

    expect(db.insert).not.toHaveBeenCalled();
  });

  // POST-09: DB insert throws → 500 INTERNAL
  test("POST-09: DB insert throws returns 500 INTERNAL", async () => {
    requireHandler(indexHandler, "pages/api/comments/index.ts");

    db.insert.mockRejectedValue(new Error("DB connection refused"));

    const req = makePostReq({
      postId: "post-1",
      author: "Alice",
      body: "Great post!",
    });
    const res = httpMocks.createResponse();

    await indexHandler(req, res);

    expect(res.statusCode).toBe(500);
    const body = res._getJSONData();
    expect(body.error.code).toBe("INTERNAL");
  });

  // POST-10: mail throws AFTER successful DB insert → still 201
  // Email failure must never fail the submission.
  test("POST-10: email failure after successful insert still returns 201", async () => {
    requireHandler(indexHandler, "pages/api/comments/index.ts");

    db.insert.mockResolvedValue(SAMPLE_COMMENT);
    mail.notifyOwnerOfComment.mockRejectedValue(new Error("Resend API timeout"));

    const req = makePostReq({
      postId: "post-1",
      author: "Alice",
      body: "Great post!",
    });
    const res = httpMocks.createResponse();

    await indexHandler(req, res);

    // Comment was persisted — response must still be 201.
    expect(res.statusCode).toBe(201);
    const body = res._getJSONData();
    expect(body.comment).toBeDefined();
    // Verify insert was called (the mail failure came after).
    expect(db.insert).toHaveBeenCalledTimes(1);
  });
});

// ===========================================================================
// DELETE /api/comments/[id]
// ===========================================================================

describe("DELETE /api/comments/[id]", () => {
  // DELETE-01: authenticated owner → 200 { ok: true, id }
  test("DELETE-01: authenticated owner deletes comment and returns 200 { ok: true, id }", async () => {
    requireHandler(idHandler, "pages/api/comments/[id].ts");

    // Full happy path: session owns, CSRF valid, origin valid.
    auth.getSession.mockResolvedValue({ isOwner: true, csrfToken: "t" });
    auth.verifyCsrf.mockReturnValue(true);
    auth.verifyOrigin.mockReturnValue(true);
    db.remove.mockResolvedValue(true);

    const req = makeDeleteReq(VALID_UUID, { cookie: "portfolio_session=validtoken" });
    const res = httpMocks.createResponse();

    await idHandler(req, res);

    expect(res.statusCode).toBe(200);
    const body = res._getJSONData();
    expect(body.ok).toBe(true);
    expect(body.id).toBe(VALID_UUID);
    expect(db.remove).toHaveBeenCalledWith(VALID_UUID);
  });

  // DELETE-02: no auth → 401 UNAUTHORIZED
  test("DELETE-02: no auth cookie returns 401 UNAUTHORIZED", async () => {
    requireHandler(idHandler, "pages/api/comments/[id].ts");

    // Default mock: getSession resolves {} → isOwner is undefined → 401.
    const req = makeDeleteReq(VALID_UUID);
    const res = httpMocks.createResponse();

    await idHandler(req, res);

    expect(res.statusCode).toBe(401);
    const body = res._getJSONData();
    expect(body.error.code).toBe("UNAUTHORIZED");
    expect(db.remove).not.toHaveBeenCalled();
  });

  // DELETE-03: comment not found → 404 NOT_FOUND
  test("DELETE-03: comment not found returns 404 NOT_FOUND", async () => {
    requireHandler(idHandler, "pages/api/comments/[id].ts");

    auth.getSession.mockResolvedValue({ isOwner: true, csrfToken: "t" });
    auth.verifyCsrf.mockReturnValue(true);
    auth.verifyOrigin.mockReturnValue(true);
    // db.remove returns false → no row was deleted.
    db.remove.mockResolvedValue(false);

    const req = makeDeleteReq(VALID_UUID, { cookie: "portfolio_session=validtoken" });
    const res = httpMocks.createResponse();

    await idHandler(req, res);

    expect(res.statusCode).toBe(404);
    const body = res._getJSONData();
    expect(body.error.code).toBe("NOT_FOUND");
  });

  // DELETE-04: non-UUID id → 400 VALIDATION
  test("DELETE-04: non-UUID id returns 400 VALIDATION", async () => {
    requireHandler(idHandler, "pages/api/comments/[id].ts");

    // Allow auth/CSRF/origin to pass so the validation check is exercised.
    auth.getSession.mockResolvedValue({ isOwner: true, csrfToken: "t" });
    auth.verifyCsrf.mockReturnValue(true);
    auth.verifyOrigin.mockReturnValue(true);

    const req = makeDeleteReq(INVALID_UUID, { cookie: "portfolio_session=validtoken" });
    const res = httpMocks.createResponse();

    await idHandler(req, res);

    expect(res.statusCode).toBe(400);
    const body = res._getJSONData();
    expect(body.error.code).toBe("VALIDATION");
    expect(db.remove).not.toHaveBeenCalled();
  });

  // DELETE-05: wrong method (POST) → 405 METHOD_NOT_ALLOWED
  test("DELETE-05: wrong HTTP method (POST) returns 405 METHOD_NOT_ALLOWED", async () => {
    requireHandler(idHandler, "pages/api/comments/[id].ts");

    const req = httpMocks.createRequest({
      method: "POST",
      query: { id: VALID_UUID },
    });
    const res = httpMocks.createResponse();

    await idHandler(req, res);

    expect(res.statusCode).toBe(405);
    const body = res._getJSONData();
    expect(body.error.code).toBe("METHOD_NOT_ALLOWED");
  });

  // DELETE-06: authed but origin check fails → 403 FORBIDDEN, db.remove NOT called
  test("DELETE-06: authed owner but cross-origin request returns 403 FORBIDDEN", async () => {
    requireHandler(idHandler, "pages/api/comments/[id].ts");

    auth.getSession.mockResolvedValue({ isOwner: true, csrfToken: "t" });
    auth.verifyOrigin.mockReturnValue(false); // the check under test
    auth.verifyCsrf.mockReturnValue(true);

    const req = makeDeleteReq(VALID_UUID, { cookie: "portfolio_session=validtoken" });
    const res = httpMocks.createResponse();

    await idHandler(req, res);

    expect(res.statusCode).toBe(403);
    const body = res._getJSONData();
    expect(body.error.code).toBe("FORBIDDEN");
    expect(db.remove).not.toHaveBeenCalled();
  });

  // DELETE-07: authed + origin ok but CSRF check fails → 403 FORBIDDEN
  test("DELETE-07: authed owner with invalid CSRF token returns 403 FORBIDDEN", async () => {
    requireHandler(idHandler, "pages/api/comments/[id].ts");

    auth.getSession.mockResolvedValue({ isOwner: true, csrfToken: "t" });
    auth.verifyOrigin.mockReturnValue(true);
    auth.verifyCsrf.mockReturnValue(false); // the check under test

    const req = makeDeleteReq(VALID_UUID, { cookie: "portfolio_session=validtoken" });
    const res = httpMocks.createResponse();

    await idHandler(req, res);

    expect(res.statusCode).toBe(403);
    const body = res._getJSONData();
    expect(body.error.code).toBe("FORBIDDEN");
    expect(db.remove).not.toHaveBeenCalled();
  });
});
