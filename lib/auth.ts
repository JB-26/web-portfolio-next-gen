/**
 * Owner auth — STUB for Phase 2.
 *
 * Checks the `x-owner-secret` request header against `process.env.OWNER_PASSWORD`.
 * This exists only so the DELETE endpoint can be exercised via `curl` while
 * the real auth stack (Iron Session + CSRF) is being built in Phase 3.
 *
 * !!! DO NOT SHIP THIS TO PRODUCTION !!!
 *
 * TODO(phase-3): Replace with Iron Session. The real `isOwner(req)` reads
 * an encrypted httpOnly session cookie set by `POST /api/auth/login` and
 * MUST be paired with a CSRF token check on state-changing routes.
 */
import type { NextApiRequest } from "next";

let warnedAboutMissingPassword = false;

export function isOwner(req: NextApiRequest): boolean {
  const expected = process.env.OWNER_PASSWORD;
  if (!expected || expected.length === 0) {
    if (!warnedAboutMissingPassword) {
      console.warn(
        "[auth stub] OWNER_PASSWORD is not set — DELETE /api/comments/[id] will reject every request. Set it in .env.local for Phase 2 testing.",
      );
      warnedAboutMissingPassword = true;
    }
    return false;
  }
  const provided = req.headers["x-owner-secret"];
  if (typeof provided !== "string" || provided.length === 0) return false;
  return provided === expected;
}
