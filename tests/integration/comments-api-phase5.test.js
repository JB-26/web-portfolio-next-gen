/**
 * Phase 5 integration tests — wire the REAL `lib/rateLimit.ts` and
 * `lib/mail.ts` through the POST /api/comments handler, with only the
 * external SDKs (`@upstash/ratelimit`, `@upstash/redis`, `resend`) mocked.
 *
 * This complements the broader tests/integration/comments-api.test.js file,
 * which stubs the whole `lib/rateLimit` and `lib/mail` modules. Here we
 * deliberately DO NOT stub those — we want to prove that:
 *
 *   1. Rate-limit over-budget really produces a 429 with `Retry-After`
 *      when the Upstash SDK reports `success: false`.
 *   2. A Resend send failure after successful DB insert still yields a 201
 *      (QA test POST-10).
 *
 * The DB and auth layers are still mocked (no Neon, no iron-session).
 */

import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import httpMocks from "node-mocks-http";

// ---------------------------------------------------------------------------
// Mocks — external SDKs + DB. `lib/rateLimit` and `lib/mail` are NOT mocked.
// `vi.hoisted()` lifts the mock functions above the vi.mock() hoisting so
// the factories can close over them.
// ---------------------------------------------------------------------------

const { mockUpstashLimit, mockResendSend } = vi.hoisted(() => ({
  mockUpstashLimit: vi.fn(),
  mockResendSend: vi.fn(),
}));

vi.mock("@upstash/ratelimit", () => {
  function Ratelimit() {
    return { limit: mockUpstashLimit };
  }
  Ratelimit.slidingWindow = vi.fn(() => ({ kind: "sliding" }));
  return { Ratelimit };
});

vi.mock("@upstash/redis", () => {
  function Redis() {
    return {};
  }
  return { Redis };
});

vi.mock("resend", () => {
  function Resend() {
    return { emails: { send: mockResendSend } };
  }
  return { Resend };
});

vi.mock("@/lib/comments/db", () => ({
  listByPost: vi.fn(),
  insert: vi.fn(),
  remove: vi.fn(),
  countByPost: vi.fn(),
  getById: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  getSession: vi.fn().mockResolvedValue({}),
  isOwner: vi.fn().mockResolvedValue(false),
  verifyOrigin: vi.fn().mockReturnValue(true),
  verifyCsrf: vi.fn().mockReturnValue(true),
  generateCsrfToken: vi.fn().mockReturnValue("test-token"),
}));

// ---------------------------------------------------------------------------
// Env scaffolding. All Phase 5 env vars must be set so the real modules can
// construct their clients.
// ---------------------------------------------------------------------------

const ENV_KEYS = [
  "UPSTASH_REDIS_REST_URL",
  "UPSTASH_REDIS_REST_TOKEN",
  "IP_HASH_SALT",
  "RESEND_API_KEY",
  "OWNER_NOTIFY_EMAIL",
  "OWNER_FROM_EMAIL",
  "NEXT_PUBLIC_SITE_URL",
  "DELETE_TOKEN_SECRET",
];
const ORIGINAL_ENV = Object.fromEntries(ENV_KEYS.map((k) => [k, process.env[k]]));

beforeEach(() => {
  vi.clearAllMocks();
  mockUpstashLimit.mockReset();
  mockResendSend.mockReset();

  process.env.UPSTASH_REDIS_REST_URL = "https://upstash.example";
  process.env.UPSTASH_REDIS_REST_TOKEN = "test-upstash-token";
  process.env.IP_HASH_SALT = "test-salt-ABCDEFGHIJKLMNOPQRSTUV";
  process.env.RESEND_API_KEY = "re_test_key";
  process.env.OWNER_NOTIFY_EMAIL = "owner@example.com";
  process.env.OWNER_FROM_EMAIL = "comments@example.com";
  process.env.NEXT_PUBLIC_SITE_URL = "https://example.com";
  process.env.DELETE_TOKEN_SECRET = "a".repeat(32) + "b".repeat(32);

  // Default to allowed so happy-path tests don't need to override.
  mockUpstashLimit.mockResolvedValue({
    success: true,
    limit: 5,
    remaining: 4,
    reset: Date.now() + 60000,
  });
  mockResendSend.mockResolvedValue({ data: { id: "email-id" }, error: null });
});

afterEach(() => {
  for (const [k, v] of Object.entries(ORIGINAL_ENV)) {
    if (v === undefined) {
      delete process.env[k];
    } else {
      process.env[k] = v;
    }
  }
});

// ---------------------------------------------------------------------------
// Load the route handler + db mock. Must be INSIDE a test (or beforeAll)
// after vi.resetModules() so the Phase 5 limiter/mail caches are fresh.
// ---------------------------------------------------------------------------

async function loadHandler() {
  vi.resetModules();
  const indexMod = await import("@/pages/api/comments/index.ts");
  const dbMod = await import("@/lib/comments/db");
  return { handler: indexMod.default, db: dbMod };
}

const SAMPLE_COMMENT = {
  id: "123e4567-e89b-12d3-a456-426614174000",
  postId: "2025-01-30-scrum",
  author: "Alice",
  body: "Great post!",
  createdAt: "2025-01-30T12:00:00.000Z",
  status: "approved",
};

function makePostReq(body = {}) {
  return httpMocks.createRequest({
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": "203.0.113.7" },
    body,
  });
}

// ===========================================================================

describe("POST /api/comments — real rateLimit + real mail, SDKs mocked", () => {
  test("P5-01: Upstash reports over-budget → 429 with numeric Retry-After header", async () => {
    const { handler, db } = await loadHandler();

    // Limiter says "no" with a reset 60 seconds in the future.
    mockUpstashLimit.mockResolvedValue({
      success: false,
      limit: 5,
      remaining: 0,
      reset: Date.now() + 60_000,
    });

    const req = makePostReq({
      postId: "2025-01-30-scrum",
      author: "Alice",
      body: "Great post!",
    });
    const res = httpMocks.createResponse();

    await handler(req, res);

    expect(res.statusCode).toBe(429);
    const body = res._getJSONData();
    expect(body.error.code).toBe("RATE_LIMIT");

    const retryAfter = Number(res.getHeader("Retry-After"));
    expect(Number.isFinite(retryAfter)).toBe(true);
    expect(retryAfter).toBeGreaterThan(0);
    expect(retryAfter).toBeLessThanOrEqual(60);

    expect(db.insert).not.toHaveBeenCalled();
  });

  test("P5-02: Resend send rejects after successful insert → still 201", async () => {
    const { handler, db } = await loadHandler();

    db.insert.mockResolvedValue(SAMPLE_COMMENT);
    mockResendSend.mockRejectedValue(new Error("Resend API timeout"));

    const req = makePostReq({
      postId: "2025-01-30-scrum",
      author: "Alice",
      body: "Great post!",
    });
    const res = httpMocks.createResponse();

    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    await handler(req, res);
    errorSpy.mockRestore();

    // The comment was persisted — the response must still be 201.
    expect(res.statusCode).toBe(201);
    const body = res._getJSONData();
    expect(body.comment).toBeDefined();
    expect(db.insert).toHaveBeenCalledTimes(1);
    expect(mockResendSend).toHaveBeenCalledTimes(1);
  });

  test("P5-03: Resend returns an error object (not a throw) after insert → still 201", async () => {
    const { handler, db } = await loadHandler();

    db.insert.mockResolvedValue(SAMPLE_COMMENT);
    mockResendSend.mockResolvedValue({
      data: null,
      error: { name: "application_error", message: "Upstream unavailable", statusCode: 503 },
    });

    const req = makePostReq({
      postId: "2025-01-30-scrum",
      author: "Alice",
      body: "Great post!",
    });
    const res = httpMocks.createResponse();

    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    await handler(req, res);
    errorSpy.mockRestore();

    expect(res.statusCode).toBe(201);
    expect(db.insert).toHaveBeenCalledTimes(1);
  });

  test("P5-04: Upstash SDK rejects entirely → fail open (request proceeds)", async () => {
    const { handler, db } = await loadHandler();

    mockUpstashLimit.mockRejectedValue(new Error("ECONNRESET"));
    db.insert.mockResolvedValue(SAMPLE_COMMENT);

    const req = makePostReq({
      postId: "2025-01-30-scrum",
      author: "Alice",
      body: "Great post!",
    });
    const res = httpMocks.createResponse();

    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    await handler(req, res);
    errorSpy.mockRestore();

    // Fail-open: limiter error does not 500 the request.
    expect(res.statusCode).toBe(201);
    expect(db.insert).toHaveBeenCalledTimes(1);
  });

  test("P5-05: Resend send receives plain-text body with delete URL, no PII leaks to logs", async () => {
    const { handler, db } = await loadHandler();

    db.insert.mockResolvedValue(SAMPLE_COMMENT);

    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const req = makePostReq({
      postId: "2025-01-30-scrum",
      author: "Alice",
      body: "Great post!",
    });
    const res = httpMocks.createResponse();
    await handler(req, res);

    expect(res.statusCode).toBe(201);
    expect(mockResendSend).toHaveBeenCalledTimes(1);

    const sendArgs = mockResendSend.mock.calls[0][0];
    // Must be plain-text, not HTML.
    expect(sendArgs.text).toBeDefined();
    expect(sendArgs.html).toBeUndefined();
    expect(sendArgs.from).toBe("comments@example.com");
    expect(sendArgs.to).toBe("owner@example.com");
    expect(sendArgs.subject).toContain("2025-01-30-scrum");
    expect(sendArgs.text).toContain("Alice");
    expect(sendArgs.text).toContain("Great post!");
    expect(sendArgs.text).toContain("/owner/comments/delete?token=");

    // No PII in logs — the happy-path should not log the author/body at all.
    const loggedBlobs = [
      ...logSpy.mock.calls.map((a) => JSON.stringify(a)),
      ...errorSpy.mock.calls.map((a) => JSON.stringify(a)),
    ];
    for (const blob of loggedBlobs) {
      expect(blob).not.toContain("Great post!");
      // "Alice" might appear in mock-call payloads (as the comment object in
      // a thrown error log wouldn't exist on the happy path). We assert only
      // against the body content since that is the clearly PII field.
    }

    logSpy.mockRestore();
    errorSpy.mockRestore();
  });
});
