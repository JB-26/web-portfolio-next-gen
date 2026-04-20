/**
 * Owner notification — STUB for Phase 2.
 *
 * In non-production environments, logs a *minimal* marker (id + postId only)
 * so developers can confirm the hook fires. In production the stub is silent:
 * we must never write commenter PII (author, body) to stdout where it could
 * be captured by platform log aggregators. Failures are swallowed so a flaky
 * mail provider can never fail a successful `POST /api/comments` — see test
 * case POST-10 in the QA plan.
 *
 * TODO(phase-5): Replace with a real Resend client. The production
 * implementation must:
 *   - Read `RESEND_API_KEY`, `OWNER_NOTIFY_EMAIL`, and `OWNER_FROM_EMAIL`.
 *   - Send a plain-text notification with the comment body, author, and a
 *     signed one-click delete token linking back to the site.
 *   - Continue to `try`/`catch` internally — never throw, never reject.
 */
import type { Comment } from "./comments/types";

export async function notifyOwnerOfComment(c: Comment): Promise<void> {
  try {
    if (process.env.NODE_ENV !== "production") {
      console.log(
        "[mail stub] new comment",
        JSON.stringify({ id: c.id, postId: c.postId }),
      );
    }
  } catch (err) {
    console.error("[mail stub] failed to log notification", err);
  }
}
