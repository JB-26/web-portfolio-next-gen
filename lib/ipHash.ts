/**
 * IP hashing helper for the comments feature (Phase 5).
 *
 * Raw commenter IPs must never touch persistent storage — they are
 * personally identifiable, regulated under GDPR, and of no engineering value
 * once a rate-limit counter key has been derived. This module exposes:
 *
 *   - `hashIp(ip)` — HMAC-SHA256 over a server-side salt (`IP_HASH_SALT`).
 *     Deterministic for the lifetime of the salt (so rate-limit counters are
 *     stable) but reversible only to someone who also holds the salt. Rotate
 *     the salt to force a global re-key.
 *   - `extractClientIp(req)` — parses the client IP out of the request.
 *     Returns a RAW IP string and is deliberately agnostic to what the caller
 *     does with it. The caller MUST pass the returned value through `hashIp`
 *     before writing it anywhere durable — this module cannot enforce that.
 *
 * Security invariants:
 *   - The salt is read at call time (not at module load) so tests can set
 *     `process.env.IP_HASH_SALT` in `beforeEach`. A missing / empty salt is
 *     a configuration error: we throw `IpHashConfigError` rather than hash
 *     with an empty key, which would produce a well-known HMAC output that
 *     an attacker could pre-image.
 *   - `x-forwarded-for` can be set by anyone when there is no upstream proxy,
 *     but on Vercel it is set by the platform edge and is the canonical
 *     source. The helper picks the FIRST entry of the list — that is the
 *     originating client per the XFF spec. It does not attempt to trim
 *     trusted-proxy chains; the rate-limit budget uses a hash, so a spoofed
 *     XFF just rate-limits the attacker's self-chosen identifier.
 */
import crypto from "node:crypto";

import type { NextApiRequest } from "next";

/** Thrown when `IP_HASH_SALT` is absent / empty. Mirrors `AuthConfigError`. */
export class IpHashConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "IpHashConfigError";
  }
}

/** Minimum accepted length for `IP_HASH_SALT`. Mirrors the 32-char floor on
 * the other secrets in `lib/auth.ts` / `lib/deleteToken.ts`, but relaxed to 16
 * for this one because the salt's role is anonymisation (not authentication)
 * and the blast radius of a weak salt is bounded — an attacker still needs to
 * exfiltrate both the salt and the hashed values to de-anonymise. 16 is
 * enough to reject placeholder / obviously-test values like "dev" or "test". */
const MIN_IP_HASH_SALT_LENGTH = 16;

/**
 * Return an HMAC-SHA256 hex digest of `ip` keyed by `IP_HASH_SALT`.
 *
 * The salt is read at call time so tests can override it in `beforeEach`.
 * Throws `IpHashConfigError` if the salt is missing, empty, or shorter than
 * `MIN_IP_HASH_SALT_LENGTH`. Hashing with an empty / weak key is worse than
 * not hashing — an empty key produces a well-known HMAC output, and a short
 * key is trivial to pre-compute — so we refuse to proceed.
 */
export function hashIp(ip: string): string {
  const salt = process.env.IP_HASH_SALT;
  if (!salt || salt.length < MIN_IP_HASH_SALT_LENGTH) {
    throw new IpHashConfigError(
      `IP_HASH_SALT must be at least ${MIN_IP_HASH_SALT_LENGTH} characters. Generate one with \`openssl rand -hex 32\` and add it to .env.local.`,
    );
  }
  return crypto.createHmac("sha256", salt).update(ip).digest("hex");
}

/**
 * Extract the client IP from an incoming request.
 *
 * Order of preference:
 *   1. First entry of `x-forwarded-for` (Vercel sets this at the edge).
 *   2. `req.socket.remoteAddress` (direct connection, local dev).
 *   3. The literal string `"unknown"` — returned so the downstream limiter
 *      still has a stable key to bucket anonymous traffic together.
 *
 * DEPLOYMENT ASSUMPTION: The first-XFF-entry selection is safe ONLY because
 * Vercel's edge sets `x-forwarded-for` itself, so the left-most entry is the
 * originating client and end-users cannot forge it. If this codebase is ever
 * redeployed behind a different proxy chain (self-hosted Nginx, Cloudflare
 * Workers without XFF-rewriting, a CDN-in-front-of-Vercel setup, etc.), the
 * left-most entry becomes user-controllable and rate limiting can be bypassed
 * by setting `X-Forwarded-For: 1.2.3.4`. Re-evaluate this helper (switch to
 * the right-most entry and count known trusted proxies) if the hosting
 * topology changes.
 *
 * Returns a RAW IP. The caller is responsible for hashing it before it
 * touches Redis, Postgres, or a log line.
 *
 * CURRENT IMPLEMENTATION NOTE: This module does NOT persist IP data (raw
 * or hashed) to Postgres. IPs are used only transiently as Upstash Redis
 * keys (always hashed via `hashIp`). This is a deliberate privacy choice
 * — documented in docs/comments-phase-6-plan.md §6B. If a future phase
 * adds IP data to the DB for abuse investigation, it MUST use `hashIp`
 * and MUST update this comment.
 */
export function extractClientIp(req: NextApiRequest): string {
  const xff = req.headers["x-forwarded-for"];
  const xffStr = Array.isArray(xff) ? xff[0] : xff;
  if (typeof xffStr === "string" && xffStr.length > 0) {
    // XFF is a comma-separated list: `client, proxy1, proxy2`. The left-most
    // entry is the originating client per the specification (RFC 7239).
    const first = xffStr.split(",")[0]?.trim();
    if (first && first.length > 0) {
      return first;
    }
  }

  const socketIp = req.socket?.remoteAddress;
  if (typeof socketIp === "string" && socketIp.length > 0) {
    return socketIp;
  }

  return "unknown";
}
