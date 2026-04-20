/**
 * Rate-limit check — STUB for Phase 2.
 *
 * Always allows the request through. This lets Phase 2 wire the
 * `checkLimit(req)` call into `POST /api/comments` in the correct position
 * (before honeypot / validation / DB writes) without requiring Upstash
 * credentials or Redis connectivity.
 *
 * TODO(phase-5): Replace with a real sliding-window limiter backed by
 * Upstash Redis (`@upstash/ratelimit` + `@upstash/redis`). Target budget:
 * 5 POST /api/comments per IP-hash per 60 seconds. The returned
 * `retryAfter` (seconds) must be forwarded as the `Retry-After` header
 * when `allowed === false`.
 */
import type { NextApiRequest } from "next";

export interface RateLimitResult {
  /** `true` if the request may proceed. */
  allowed: boolean;
  /** Seconds until the caller may retry. Only set when `allowed === false`. */
  retryAfter?: number;
}

export async function checkLimit(_req: NextApiRequest): Promise<RateLimitResult> {
  return { allowed: true };
}
