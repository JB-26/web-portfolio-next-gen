/**
 * Signed delete tokens (Phase 5).
 *
 * Lets the owner delete a comment from the notification email without being
 * logged in — the token IS the authentication. Used by
 * `/owner/comments/delete?token=...` and `POST /api/owner/delete-by-token`.
 *
 * Token format:  `base64url(commentId).base64url(expiresAtMs).base64url(sig)`
 *   where `sig = HMAC-SHA256(DELETE_TOKEN_SECRET, `${commentId}.${expiresAtMs}`)`.
 *
 * Why a signed token and not a random opaque one stored in DB:
 *   - Stateless: no DB round-trip per email open, no extra table.
 *   - Revocable by rotating `DELETE_TOKEN_SECRET` (invalidates all outstanding
 *     tokens at once — acceptable for a rare "I leaked an email archive" event).
 *   - No database reference = no oracle ("does this comment still exist?")
 *     leakable to someone replaying the URL.
 *
 * Security invariants:
 *   - Secret is read at call time (not module load) so tests can set it in
 *     `beforeEach`. A missing secret throws (`sign`) or returns `MISCONFIGURED`
 *     (`verify`). We MUST NOT HMAC with an empty key — that yields a fixed
 *     output attackers can precompute.
 *   - `verifyDeleteToken` NEVER throws. All failure modes are typed results.
 *   - Signature is compared with `crypto.timingSafeEqual` on equal-length
 *     buffers (mirrors `passwordMatches` in `pages/api/auth/login.ts`).
 *   - Expiry and signature are BOTH checked on every verify. We return the
 *     most-specific reason, but we never short-circuit: checking expiry then
 *     returning before the signature compare would leak whether the token
 *     signature was forgeable for a given expiry window (a timing oracle).
 *   - `base64url` so tokens are URL-safe without manual percent-encoding.
 *
 * TTL: 7 days. Long enough that the owner can triage the email at leisure,
 * short enough that a leaked archive doesn't leave a permanent delete capability.
 */
import crypto from "node:crypto";

const MIN_SECRET_LENGTH = 32; // same minimum as IRON_SESSION_PASSWORD
const TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

/** Thrown from `signDeleteToken` when the secret is missing / too short. */
export class DeleteTokenConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DeleteTokenConfigError";
  }
}

/** Typed result returned by `verifyDeleteToken`. Never throws. */
export type VerifyResult =
  | { ok: true; commentId: string }
  | {
      ok: false;
      reason: "MALFORMED" | "EXPIRED" | "BAD_SIGNATURE" | "MISCONFIGURED";
    };

function getSecret(): string {
  const s = process.env.DELETE_TOKEN_SECRET;
  if (!s || s.length < MIN_SECRET_LENGTH) {
    throw new DeleteTokenConfigError(
      `DELETE_TOKEN_SECRET must be at least ${MIN_SECRET_LENGTH} characters. Generate one with \`openssl rand -hex 32\`.`,
    );
  }
  return s;
}

function toBase64Url(input: string | Buffer): string {
  const buf = typeof input === "string" ? Buffer.from(input, "utf8") : input;
  return buf.toString("base64url");
}

function fromBase64UrlToString(input: string): string | null {
  try {
    return Buffer.from(input, "base64url").toString("utf8");
  } catch {
    return null;
  }
}

function fromBase64UrlToBuffer(input: string): Buffer | null {
  try {
    return Buffer.from(input, "base64url");
  } catch {
    return null;
  }
}

function computeSignature(secret: string, commentId: string, expiresAtMs: number): Buffer {
  return crypto
    .createHmac("sha256", secret)
    .update(`${commentId}.${expiresAtMs}`)
    .digest();
}

/**
 * Mint a signed delete token for `commentId`, valid for 7 days.
 *
 * Throws `DeleteTokenConfigError` if `DELETE_TOKEN_SECRET` is missing or
 * shorter than 32 chars. The caller (`lib/mail.ts`) catches this to avoid
 * leaking the misconfiguration state into the mail body.
 */
export function signDeleteToken(commentId: string): string {
  if (typeof commentId !== "string" || commentId.length === 0) {
    throw new DeleteTokenConfigError("commentId is required to sign a delete token.");
  }
  const secret = getSecret();
  const expiresAtMs = Date.now() + TOKEN_TTL_MS;
  const sig = computeSignature(secret, commentId, expiresAtMs);
  return [
    toBase64Url(commentId),
    toBase64Url(String(expiresAtMs)),
    toBase64Url(sig),
  ].join(".");
}

/**
 * Verify a delete token. Never throws — returns a typed result.
 *
 * All checks (parse, expiry, signature) are performed unconditionally where
 * possible. We return the most-specific reason, but we do NOT skip the
 * signature compare just because the token is expired — that would be a
 * subtle oracle if an attacker could discover which expiries pass via
 * error-code differentials.
 */
export function verifyDeleteToken(token: string): VerifyResult {
  if (typeof token !== "string" || token.length === 0) {
    return { ok: false, reason: "MALFORMED" };
  }

  let secret: string;
  try {
    secret = getSecret();
  } catch {
    return { ok: false, reason: "MISCONFIGURED" };
  }

  const parts = token.split(".");
  if (parts.length !== 3) {
    return { ok: false, reason: "MALFORMED" };
  }
  const [idPart, expPart, sigPart] = parts;

  const commentId = fromBase64UrlToString(idPart);
  const expStr = fromBase64UrlToString(expPart);
  const providedSig = fromBase64UrlToBuffer(sigPart);

  if (commentId === null || expStr === null || providedSig === null) {
    return { ok: false, reason: "MALFORMED" };
  }
  if (commentId.length === 0) {
    return { ok: false, reason: "MALFORMED" };
  }

  const expiresAtMs = Number.parseInt(expStr, 10);
  if (!Number.isFinite(expiresAtMs) || expiresAtMs <= 0) {
    return { ok: false, reason: "MALFORMED" };
  }

  // Compute the expected signature unconditionally — we want the signature
  // check to run even on expired tokens so a bad signature on an expired
  // token still surfaces as BAD_SIGNATURE rather than leaking through as
  // EXPIRED.
  const expectedSig = computeSignature(secret, commentId, expiresAtMs);

  // `timingSafeEqual` throws on length mismatch. Guard first.
  let sigOk = false;
  if (providedSig.length === expectedSig.length) {
    sigOk = crypto.timingSafeEqual(providedSig, expectedSig);
  }

  if (!sigOk) {
    return { ok: false, reason: "BAD_SIGNATURE" };
  }

  // Signature valid — now the expiry decides.
  if (Date.now() >= expiresAtMs) {
    return { ok: false, reason: "EXPIRED" };
  }

  return { ok: true, commentId };
}
