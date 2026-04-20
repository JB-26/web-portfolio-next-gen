/**
 * Owner auth — Phase 3 (Iron Session).
 *
 * Phase 2 shipped a stub that read `x-owner-secret`; it has been removed.
 * Authentication is now an encrypted httpOnly cookie (Iron Session v8) set by
 * `POST /api/auth/login`. State-changing routes must additionally verify a
 * CSRF token (double-submit cookie pattern) and the request `Origin`/`Referer`.
 *
 * Security properties provided by this module:
 *   - Session cookie is `httpOnly`, `sameSite=lax`, `secure` in production.
 *   - CSRF token is random (32 bytes, hex-encoded) and compared in constant
 *     time against the `x-csrf-token` header.
 *   - Origin validation parses `origin` or `referer` with `URL` — never
 *     substring matching.
 *
 * The module deliberately does not export a `requireOwner` helper. Callers
 * compose `getSession`, `verifyOrigin`, and `verifyCsrf` themselves so the
 * ordering (and which checks run on which routes) is explicit at the call
 * site. See the implementation plan Pre-Merge Security Review Checklist #7.
 */
import crypto from "node:crypto";

import { getIronSession, type IronSession, type SessionOptions } from "iron-session";
import type { NextApiRequest, NextApiResponse } from "next";

/** Thrown when `IRON_SESSION_PASSWORD` is absent / empty. Mirrors DatabaseConfigError. */
export class AuthConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthConfigError";
  }
}

/** Shape of the encrypted session cookie payload. */
export interface SessionData {
  /** True once the owner has authenticated via `/api/auth/login`. */
  isOwner?: boolean;
  /** Random per-session CSRF token, minted at login. Hex-encoded, 64 chars. */
  csrfToken?: string;
}

const COOKIE_NAME = "portfolio_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

/**
 * Options passed to `getIronSession`. Read as a getter so env var resolution
 * happens lazily at request time — this matches `lib/comments/db.ts` and means
 * tests can set `process.env.IRON_SESSION_PASSWORD` in `beforeEach` without
 * having to re-import the module.
 */
export const sessionOptions: SessionOptions = {
  cookieName: COOKIE_NAME,
  // `password` is read lazily via getter so a missing env var throws at
  // request time (where we can return a clean 500), not at module load
  // time (which would crash Next on boot and make tests fragile).
  get password(): string {
    const pw = process.env.IRON_SESSION_PASSWORD;
    if (!pw || pw.length === 0) {
      throw new AuthConfigError(
        "IRON_SESSION_PASSWORD is not set. Generate one with `openssl rand -hex 32` and add it to .env.local.",
      );
    }
    return pw;
  },
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  },
};

/** Load (and decrypt) the owner session from the request cookie. */
export async function getSession(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<IronSession<SessionData>> {
  return getIronSession<SessionData>(req, res, sessionOptions);
}

/**
 * Convenience wrapper for routes that only need to know whether the caller
 * is the owner. Returns false rather than throwing on an absent / invalid
 * cookie — iron-session treats those the same as "no session".
 */
export async function isOwner(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<boolean> {
  const session = await getSession(req, res);
  return session.isOwner === true;
}

/** Generate a cryptographically random CSRF token (64 hex chars). */
export function generateCsrfToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Constant-time comparison of the request's `x-csrf-token` header against the
 * token stored in the session. Returns false for any missing / malformed /
 * length-mismatched input — `crypto.timingSafeEqual` requires equal-length
 * buffers, so we guard before calling it.
 */
export function verifyCsrf(
  req: NextApiRequest,
  session: IronSession<SessionData>,
): boolean {
  const sessionToken = session.csrfToken;
  if (typeof sessionToken !== "string" || sessionToken.length === 0) {
    return false;
  }
  const rawHeader = req.headers["x-csrf-token"];
  const headerToken = Array.isArray(rawHeader) ? rawHeader[0] : rawHeader;
  if (typeof headerToken !== "string" || headerToken.length === 0) {
    return false;
  }
  // Length mismatch → reject WITHOUT calling timingSafeEqual (which throws on
  // unequal-length buffers). This is still constant-time w.r.t. the token
  // contents because length is already a leak from the cookie-bound value.
  if (headerToken.length !== sessionToken.length) {
    return false;
  }
  const a = Buffer.from(sessionToken, "utf8");
  const b = Buffer.from(headerToken, "utf8");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

/**
 * Validate that the request originated from our own site. Accepts either the
 * `Origin` header (preferred — sent by browsers on cross-origin requests) or
 * falls back to `Referer`. Both are URL-parsed and compared by `origin` only;
 * string-`includes` would let `evil.com?fake=site.com` slip through.
 *
 * Returns false if neither header is present OR if `NEXT_PUBLIC_SITE_URL` is
 * unset. In development you typically set it to `http://localhost:3000`.
 */
export function verifyOrigin(req: NextApiRequest): boolean {
  const expectedRaw = process.env.NEXT_PUBLIC_SITE_URL;
  if (!expectedRaw || expectedRaw.length === 0) {
    return false;
  }
  let expectedOrigin: string;
  try {
    expectedOrigin = new URL(expectedRaw).origin;
  } catch {
    return false;
  }

  const originHeader = req.headers.origin;
  if (typeof originHeader === "string" && originHeader.length > 0) {
    try {
      // Some browsers send "null" as the Origin for privacy-sensitive contexts;
      // `new URL("null")` throws, which correctly falls through to a reject.
      return new URL(originHeader).origin === expectedOrigin;
    } catch {
      return false;
    }
  }

  const refererHeader = req.headers.referer;
  if (typeof refererHeader === "string" && refererHeader.length > 0) {
    try {
      return new URL(refererHeader).origin === expectedOrigin;
    } catch {
      return false;
    }
  }

  // Neither header present → reject. SameSite=Lax plus explicit origin
  // check is our defence-in-depth against CSRF.
  return false;
}
