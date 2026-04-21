/**
 * `POST /api/auth/login` — owner authentication.
 *
 * Flow (order is load-bearing — see Pre-Merge Security Review Checklist):
 *   1. Method check          → 405
 *   2. Same-origin check     → 403 FORBIDDEN
 *   3. Zod-parse body        → 400 VALIDATION
 *   4. Constant-time compare → 401 UNAUTHORIZED on mismatch
 *   5. Mutate + save session → sets encrypted httpOnly cookie
 *   6. Append sentinel cookies (`csrf_token`, `owner_ui=1`) alongside iron-session's
 *   7. 200 { ok: true }
 *
 * The CSRF token is intentionally NOT returned in the response body. The
 * client reads it from the `csrf_token` cookie (non-httpOnly, readable by JS)
 * and echoes it back in the `x-csrf-token` header on state-changing requests.
 * This is the standard double-submit cookie pattern.
 *
 * The `owner_ui=1` cookie is a *decorative* sentinel — it lets the post page
 * gate the delete button's visibility client-side. The server NEVER trusts
 * it; the encrypted session cookie is the source of truth.
 */
import crypto from "node:crypto";

import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";

import {
  AuthConfigError,
  generateCsrfToken,
  getSession,
  isSecureCookieContext,
  verifyOrigin,
} from "@/lib/auth";
import type { ApiError, ApiErrorCode } from "@/lib/comments/types";

/**
 * Minimum length for OWNER_PASSWORD. Documented in `.env.example`; also
 * enforced at runtime as defence-in-depth against a typo in Vercel env vars
 * silently weakening authentication.
 */
const MIN_OWNER_PASSWORD_LENGTH = 32;

const LoginSchema = z.object({
  password: z.string().min(1).max(512),
});

interface LoginSuccess {
  ok: true;
}

const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days, matches session

function sendError(
  res: NextApiResponse<ApiError>,
  status: number,
  code: ApiErrorCode,
  message: string,
): void {
  res.status(status).json({ error: { code, message } });
}

/**
 * Constant-time password compare. `crypto.timingSafeEqual` requires equal-
 * length buffers, so we pad (or detect length mismatch) first. Critically,
 * we still do a timing-safe op even on length mismatch — otherwise a short
 * attempt returns in a measurably different time than a long one.
 */
function passwordMatches(provided: string, expected: string): boolean {
  const a = Buffer.from(provided, "utf8");
  const b = Buffer.from(expected, "utf8");
  // Equalise lengths to avoid throwing, then force a boolean AND with the
  // length check so a short-but-matching prefix cannot succeed.
  const len = Math.max(a.length, b.length);
  const aPad = Buffer.alloc(len);
  const bPad = Buffer.alloc(len);
  a.copy(aPad);
  b.copy(bPad);
  const equal = crypto.timingSafeEqual(aPad, bPad);
  return equal && a.length === b.length;
}

/** Coerce an existing Set-Cookie header (string | string[] | undefined) to an array. */
function existingSetCookies(res: NextApiResponse): string[] {
  const current = res.getHeader("Set-Cookie");
  if (current === undefined) return [];
  if (Array.isArray(current)) return current.map(String);
  return [String(current)];
}

/** Build a Set-Cookie string. Secure flag on in any production-like context. */
function buildCookie(
  name: string,
  value: string,
  maxAgeSeconds: number,
): string {
  const parts = [
    `${name}=${value}`,
    "Path=/",
    "SameSite=Lax",
    `Max-Age=${maxAgeSeconds}`,
  ];
  if (isSecureCookieContext()) parts.push("Secure");
  return parts.join("; ");
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<LoginSuccess | ApiError>,
): Promise<void> {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    sendError(res, 405, "METHOD_NOT_ALLOWED", "Method not allowed.");
    return;
  }

  if (!verifyOrigin(req)) {
    sendError(res, 403, "FORBIDDEN", "Cross-origin login rejected.");
    return;
  }

  const parsed = LoginSchema.safeParse(req.body);
  if (!parsed.success) {
    sendError(res, 400, "VALIDATION", "Invalid login payload.");
    return;
  }

  const expected = process.env.OWNER_PASSWORD;
  if (!expected || expected.length < MIN_OWNER_PASSWORD_LENGTH) {
    // Treat a misconfigured server like an invalid password — we still refuse
    // the request, but we log loudly so the operator can tell something is off.
    // We do NOT reveal misconfiguration to the caller (identical response to
    // a wrong-password attempt) so probes can't distinguish the two.
    console.error(
      `[api/auth/login] OWNER_PASSWORD is unset or shorter than ${MIN_OWNER_PASSWORD_LENGTH} chars; refusing all logins.`,
    );
    sendError(res, 401, "UNAUTHORIZED", "Invalid password.");
    return;
  }

  if (!passwordMatches(parsed.data.password, expected)) {
    sendError(res, 401, "UNAUTHORIZED", "Invalid password.");
    return;
  }

  // Authenticated. Mint a fresh session + CSRF token.
  let session;
  try {
    session = await getSession(req, res);
  } catch (err) {
    if (err instanceof AuthConfigError) {
      console.error("[api/auth/login] session misconfigured", err);
      sendError(res, 500, "INTERNAL", "Auth is not configured.");
      return;
    }
    throw err;
  }
  session.isOwner = true;
  session.csrfToken = generateCsrfToken();
  await session.save();

  // `session.save()` has now set a Set-Cookie header for the encrypted
  // session. Read it back, then APPEND our sentinel cookies so we don't
  // clobber iron-session's write.
  const cookies = existingSetCookies(res);
  cookies.push(buildCookie("csrf_token", session.csrfToken, COOKIE_MAX_AGE_SECONDS));
  cookies.push(buildCookie("owner_ui", "1", COOKIE_MAX_AGE_SECONDS));
  res.setHeader("Set-Cookie", cookies);

  res.status(200).json({ ok: true });
}
