/**
 * Rate-limit check (Phase 5) — backed by Upstash Redis.
 *
 * Budget: 5 POST /api/comments per IP-hash per 60 seconds (sliding window).
 * Key namespace prefix: `"comments:post"` so multiple limiters can share
 * one Redis database without colliding.
 *
 * Security invariants:
 *   - The limiter key is the HMAC-SHA256 hash of the client IP, NEVER the
 *     raw IP. Raw IPs must not reach Redis — see `lib/ipHash.ts`.
 *   - Env vars are read at call time (lazy init) so the module can be
 *     imported by tests that never set `UPSTASH_REDIS_REST_*`. Constructing
 *     at module top-level would throw on import and wedge Vitest.
 *
 * Failure semantics — FAIL OPEN:
 *   If the Upstash REST call throws (network outage, DNS failure, revoked
 *   credentials), or the limiter cannot be constructed (missing env vars,
 *   bad `IP_HASH_SALT`), we log the error and return `{ allowed: true }`.
 *   Rationale: a personal blog should degrade to "no rate limiting" rather
 *   than 500 every comment submission. The trade-off is that a concerted
 *   outage of Upstash temporarily removes abuse protection, but in that
 *   case the honeypot and profanity filter still run, and Vercel has its
 *   own platform-level abuse controls. For a higher-stakes surface we
 *   would flip this to fail-closed.
 *
 *   `retryAfter` is returned in whole seconds, derived from the limiter's
 *   `reset` field (Unix ms) minus `Date.now()`. This matches the
 *   `Retry-After` HTTP header contract, which the POST handler forwards.
 */
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import type { NextApiRequest } from "next";

import { extractClientIp, hashIp } from "./ipHash";

export interface RateLimitResult {
  /** `true` if the request may proceed. */
  allowed: boolean;
  /** Seconds until the caller may retry. Only set when `allowed === false`. */
  retryAfter?: number;
}

/** Thrown internally when Upstash env vars are missing. Caught + fail-open. */
class RateLimitConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RateLimitConfigError";
  }
}

// Cached limiter instance. Lazily constructed by `getLimiter()`.
let limiter: Ratelimit | null = null;

/**
 * Lazily construct the Ratelimit instance. We do NOT build at module load
 * time because:
 *   1. Vitest imports this file without setting Upstash env vars in most
 *      tests (they `vi.mock(...)` the whole module).
 *   2. Next.js bundles API routes at build time — if the build machine
 *      lacks the env vars we should not crash the build.
 *
 * Throws `RateLimitConfigError` on missing env vars. The top-level
 * `checkLimit` catches and fails open with a distinct log message.
 */
export function getLimiter(): Ratelimit {
  if (limiter !== null) return limiter;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || url.length === 0 || !token || token.length === 0) {
    throw new RateLimitConfigError(
      "UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN must both be set to enable rate limiting.",
    );
  }

  const redis = new Redis({ url, token });
  limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, "60 s"),
    prefix: "comments:post",
    // `analytics: false` is the default — leave it off so we don't consume
    // extra Upstash writes per request just for a dashboard we don't check.
  });
  return limiter;
}

/**
 * Check whether the incoming POST request is within the rate-limit budget.
 *
 * Always resolves — never throws. Failures are logged and translated into
 * `{ allowed: true }` (see "FAIL OPEN" in the module header).
 */
export async function checkLimit(req: NextApiRequest): Promise<RateLimitResult> {
  let key: string;
  try {
    const rawIp = extractClientIp(req);
    key = hashIp(rawIp);
  } catch (err) {
    // Missing IP_HASH_SALT, primarily. Log once and fail open — the
    // alternative is every POST returning 500, which is worse for UX than
    // temporarily disabled rate limiting.
    console.error("[lib/rateLimit] could not derive IP hash; failing open", {
      route: "lib/rateLimit",
      errorCode: "IP_HASH_FAILED",
      err,
    });
    return { allowed: true };
  }

  let ratelimiter: Ratelimit;
  try {
    ratelimiter = getLimiter();
  } catch (err) {
    console.error("[lib/rateLimit] limiter misconfigured; failing open", {
      route: "lib/rateLimit",
      errorCode: "RATELIMIT_MISCONFIGURED",
      err,
    });
    return { allowed: true };
  }

  try {
    const result = await ratelimiter.limit(key);
    if (result.success) {
      return { allowed: true };
    }
    // `result.reset` is a Unix timestamp in MILLISECONDS. Convert to seconds
    // relative to now for the `Retry-After` header. Minimum of 1 second so
    // clients don't infinite-loop if the clock has already drifted past reset.
    const deltaMs = result.reset - Date.now();
    const retryAfter = Math.max(1, Math.ceil(deltaMs / 1000));
    return { allowed: false, retryAfter };
  } catch (err) {
    // Network error, Redis outage, bad creds that worked at init but failed
    // at call time — log and fail open.
    console.error("[lib/rateLimit] Upstash call failed; failing open", {
      route: "lib/rateLimit",
      errorCode: "RATELIMIT_UPSTREAM_ERROR",
      err,
    });
    return { allowed: true };
  }
}
