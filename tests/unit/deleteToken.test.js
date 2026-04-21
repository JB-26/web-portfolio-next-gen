/**
 * DT — delete-token sign/verify unit tests (Phase 5).
 *
 * Covers:
 *   - DT-01: sign/verify round-trip for a fresh token
 *   - DT-02: expired token returns EXPIRED (not ok)
 *   - DT-03: tampered commentId (signature re-check fails) returns BAD_SIGNATURE
 *   - DT-04: malformed token string returns MALFORMED (various shapes)
 *   - DT-05: verify returns MISCONFIGURED when the secret is missing
 *   - DT-06: sign throws DeleteTokenConfigError when the secret is missing
 *   - DT-07: sign throws when commentId is empty
 *   - DT-08: signature MUST be checked even on expired tokens — an expired
 *            token with a bad signature must surface as BAD_SIGNATURE, not
 *            EXPIRED (no oracle).
 */

import { describe, test, expect, beforeEach, afterEach, vi } from "vitest";

import {
  signDeleteToken,
  verifyDeleteToken,
  DeleteTokenConfigError,
} from "../../lib/deleteToken.ts";

const ORIGINAL_SECRET = process.env.DELETE_TOKEN_SECRET;

beforeEach(() => {
  // 64 chars — safely above the 32-char minimum.
  process.env.DELETE_TOKEN_SECRET = "a".repeat(32) + "b".repeat(32);
  vi.useRealTimers();
});

afterEach(() => {
  if (ORIGINAL_SECRET === undefined) {
    delete process.env.DELETE_TOKEN_SECRET;
  } else {
    process.env.DELETE_TOKEN_SECRET = ORIGINAL_SECRET;
  }
  vi.useRealTimers();
});

describe("signDeleteToken() / verifyDeleteToken()", () => {
  test("DT-01: sign + verify round-trip returns ok with the original commentId", () => {
    const commentId = "123e4567-e89b-12d3-a456-426614174000";
    const token = signDeleteToken(commentId);

    const result = verifyDeleteToken(token);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.commentId).toBe(commentId);
    }
  });

  test("DT-02: expired token returns EXPIRED", () => {
    const commentId = "123e4567-e89b-12d3-a456-426614174000";

    // Mint at T=0, verify at T=8d.
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
    const token = signDeleteToken(commentId);

    vi.setSystemTime(new Date("2026-01-09T00:00:01Z"));
    const result = verifyDeleteToken(token);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toBe("EXPIRED");
    }
  });

  test("DT-03: tampering with the encoded commentId breaks the signature", () => {
    const commentId = "123e4567-e89b-12d3-a456-426614174000";
    const token = signDeleteToken(commentId);

    // Replace the first segment with base64url of a different id.
    const parts = token.split(".");
    const forgedId = Buffer.from("ffffffff-ffff-ffff-ffff-ffffffffffff", "utf8").toString(
      "base64url",
    );
    parts[0] = forgedId;
    const forged = parts.join(".");

    const result = verifyDeleteToken(forged);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toBe("BAD_SIGNATURE");
    }
  });

  describe("DT-04: malformed tokens return MALFORMED", () => {
    test("empty string", () => {
      const r = verifyDeleteToken("");
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.reason).toBe("MALFORMED");
    });

    test("two segments instead of three", () => {
      const r = verifyDeleteToken("aaa.bbb");
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.reason).toBe("MALFORMED");
    });

    test("non-numeric expiry segment", () => {
      const commentId = "abc";
      const idPart = Buffer.from(commentId, "utf8").toString("base64url");
      const expPart = Buffer.from("not-a-number", "utf8").toString("base64url");
      const sigPart = Buffer.from("dummy", "utf8").toString("base64url");
      const r = verifyDeleteToken(`${idPart}.${expPart}.${sigPart}`);
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.reason).toBe("MALFORMED");
    });

    test("non-string input is rejected as MALFORMED (not a throw)", () => {
      // @ts-expect-error — deliberate misuse to prove the guard.
      const r = verifyDeleteToken(null);
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.reason).toBe("MALFORMED");
    });
  });

  test("DT-05: verify returns MISCONFIGURED when DELETE_TOKEN_SECRET is missing", () => {
    // Mint with a valid secret so the token is well-formed.
    const commentId = "abc";
    const token = signDeleteToken(commentId);

    // Then drop the secret before verifying.
    delete process.env.DELETE_TOKEN_SECRET;
    const r = verifyDeleteToken(token);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe("MISCONFIGURED");
  });

  test("DT-06: sign throws DeleteTokenConfigError when the secret is missing", () => {
    delete process.env.DELETE_TOKEN_SECRET;
    expect(() => signDeleteToken("abc")).toThrowError(DeleteTokenConfigError);
  });

  test("DT-06b: sign throws DeleteTokenConfigError when the secret is too short", () => {
    process.env.DELETE_TOKEN_SECRET = "a".repeat(31); // one under the minimum
    expect(() => signDeleteToken("abc")).toThrowError(DeleteTokenConfigError);
  });

  test("DT-07: sign throws when commentId is empty", () => {
    expect(() => signDeleteToken("")).toThrowError(DeleteTokenConfigError);
  });

  test("DT-08: expired token with a bad signature surfaces as BAD_SIGNATURE, not EXPIRED", () => {
    // Build an expired token by signing, then tampering the id so the
    // signature no longer matches. Verify at T past expiry.
    const commentId = "abc";

    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
    const token = signDeleteToken(commentId);
    const parts = token.split(".");
    parts[0] = Buffer.from("xyz", "utf8").toString("base64url"); // tamper

    vi.setSystemTime(new Date("2026-02-01T00:00:00Z")); // long past 7 days
    const r = verifyDeleteToken(parts.join("."));
    expect(r.ok).toBe(false);
    if (!r.ok) {
      // The signature must be checked before/with expiry so a bad sig
      // always wins — otherwise an attacker learns "this was once signed".
      expect(r.reason).toBe("BAD_SIGNATURE");
    }
  });
});
