/**
 * Owner notification email (Phase 5).
 *
 * Sends a plain-text email to the owner whenever a new comment is posted,
 * with a signed one-click delete URL. Plain text (not HTML) because:
 *   - Cheaper to render, less surface for phishing-style injections.
 *   - Easier for email scanners to classify, less likely to hit spam.
 *   - Eliminates accidental link prefetch rendering concerns.
 *
 * Security invariants:
 *   - `notifyOwnerOfComment` NEVER throws and NEVER rejects. Mail-provider
 *     failure cannot be allowed to fail a successful `POST /api/comments`
 *     (QA case POST-10). All errors are swallowed after logging.
 *   - We do NOT log the comment body or the author name — those are PII.
 *     Logs may be captured by Vercel's log aggregator and retained beyond
 *     the commenter's reasonable expectation. Only the post id and the
 *     internal comment id are logged on failure.
 *   - Env vars are read at call time (lazy init) so tests can set them in
 *     `beforeEach` and so missing creds don't wedge Vitest or the Next
 *     build. A misconfigured send logs a one-line warning (no PII) and
 *     returns silently.
 *   - The delete URL wraps the token in `lib/deleteToken.ts` — if the
 *     signing secret is missing we log and send no email rather than send
 *     a broken link.
 */
import { Resend } from "resend";

import type { Comment } from "./comments/types";
import { DeleteTokenConfigError, signDeleteToken } from "./deleteToken";

let resendClient: Resend | null = null;

/**
 * Lazily construct the Resend client. Throws if `RESEND_API_KEY` is absent
 * so the caller can log + bail. Resend's constructor itself doesn't hit the
 * network, but requiring the key means we fail fast rather than later on
 * `emails.send`.
 */
function getResendClient(): Resend {
  if (resendClient !== null) return resendClient;
  const key = process.env.RESEND_API_KEY;
  if (!key || key.length === 0) {
    throw new Error("RESEND_API_KEY is not set.");
  }
  resendClient = new Resend(key);
  return resendClient;
}

interface MailConfig {
  to: string;
  from: string;
  siteUrl: string;
}

/**
 * Pull + validate the non-secret mail config. Returns `null` if anything is
 * missing (the caller logs and bails). No PII reaches this function so we
 * can be chatty in logs.
 */
function readConfig(): MailConfig | null {
  const to = process.env.OWNER_NOTIFY_EMAIL;
  const from = process.env.OWNER_FROM_EMAIL;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!to || !from || !siteUrl) {
    return null;
  }
  return { to, from, siteUrl };
}

/** Build the plain-text email body. No HTML — see module header. */
function buildBody(c: Comment, deleteUrl: string, siteUrl: string): string {
  // Strip trailing slash from siteUrl so the post URL doesn't get `//posts/`.
  const base = siteUrl.replace(/\/+$/, "");
  return [
    `New comment on post: ${c.postId}`,
    `From: ${c.author}`,
    `Posted: ${c.createdAt}`,
    "",
    "---",
    c.body,
    "---",
    "",
    "Delete this comment (link expires in 7 days):",
    deleteUrl,
    "",
    "View on site:",
    `${base}/posts/${c.postId}`,
  ].join("\n");
}

/**
 * Notify the owner of a new comment. Fire-and-forget from the API route.
 * All failure modes are logged (without PII) and swallowed.
 */
export async function notifyOwnerOfComment(c: Comment): Promise<void> {
  try {
    const config = readConfig();
    if (config === null) {
      // One-line misconfig warning — no PII. The POST handler has already
      // persisted the comment by this point, so this is purely operator info.
      console.error("[lib/mail] notification skipped — mail env vars missing", {
        route: "lib/mail",
        errorCode: "MAIL_MISCONFIGURED",
      });
      return;
    }

    let token: string;
    try {
      token = signDeleteToken(c.id);
    } catch (err) {
      // DELETE_TOKEN_SECRET missing or too short. Log and send no email —
      // better than mailing a URL that will always return 403.
      console.error("[lib/mail] notification skipped — delete token signing failed", {
        route: "lib/mail",
        errorCode: "DELETE_TOKEN_MISCONFIGURED",
        // Include the concrete config-error class name but never the secret.
        err: err instanceof DeleteTokenConfigError ? err.message : String(err),
      });
      return;
    }

    const base = config.siteUrl.replace(/\/+$/, "");
    const deleteUrl = `${base}/owner/comments/delete?token=${encodeURIComponent(token)}`;
    const text = buildBody(c, deleteUrl, config.siteUrl);

    let client: Resend;
    try {
      client = getResendClient();
    } catch (err) {
      console.error("[lib/mail] notification skipped — Resend client init failed", {
        route: "lib/mail",
        errorCode: "MAIL_CLIENT_INIT_FAILED",
        err,
      });
      return;
    }

    const { error } = await client.emails.send({
      from: config.from,
      to: config.to,
      subject: `New comment on ${c.postId}`,
      text,
    });

    if (error) {
      // Resend's soft-error channel. Log only the safe, stable sub-fields —
      // NEVER the raw error object. The Resend SDK contract does not
      // currently echo the request payload back in errors, but this code
      // must stay resilient to SDK contract drift: the request payload
      // includes `text`, which contains the comment author and body (PII),
      // and Vercel's log aggregator persists any field we write here.
      console.error("[lib/mail] Resend returned an error", {
        route: "lib/mail",
        errorCode: "MAIL_SEND_FAILED",
        statusCode: error.statusCode,
        errorName: error.name,
      });
    }
  } catch (err) {
    // Network error, thrown promise, anything else. This catch is the
    // load-bearing guarantee that `notifyOwnerOfComment` never rejects.
    // Restrict to `err.message` only — a raw thrown value may carry a
    // stack trace that interpolated strings from the email build step
    // (including author / body) into its frames. Same PII concern as above.
    console.error("[lib/mail] notification threw unexpectedly", {
      route: "lib/mail",
      errorCode: "MAIL_SEND_FAILED",
      err: err instanceof Error ? err.message : "unknown error",
    });
  }
}
