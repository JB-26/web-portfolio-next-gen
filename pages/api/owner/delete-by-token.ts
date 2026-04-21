/**
 * `POST /api/owner/delete-by-token` — delete a comment using a signed token.
 *
 * This endpoint is the companion to the delete URL embedded in the owner
 * notification email (see `lib/mail.ts`). The signed token IS the auth —
 * there is deliberately NO session / CSRF check, because:
 *   - The caller is the owner's email client (or the confirmation page
 *     rendered after clicking the link); they are NOT logged into the site.
 *   - The token is HMAC-SHA256 signed with a server-only secret
 *     (`DELETE_TOKEN_SECRET`) and has a 7-day TTL, so a leaked URL window
 *     is finite.
 *   - Adding a session requirement would defeat the whole point (the email
 *     recipient shouldn't need to sign in first).
 *
 * Ordering (load-bearing):
 *   1. Method check                    → 405
 *   2. Content-Type check              → 415
 *   3. Token parse from JSON body      → 400 VALIDATION
 *   4. `verifyDeleteToken`             → 403 FORBIDDEN (specific reason)
 *   5. `db.remove`                     → 200 / 404
 *
 * Rate-limiting: intentionally NOT applied. If a token leaks, rate-limiting
 * a caller who already has a valid signed token buys nothing — the leak is
 * the problem. The 7-day TTL plus rotate-the-secret escape hatch is the
 * mitigation.
 */
import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";

import * as db from "../../../lib/comments/db";
import type {
  ApiError,
  ApiErrorCode,
  DeleteCommentResponse,
} from "../../../lib/comments/types";
import { verifyDeleteToken } from "../../../lib/deleteToken";

// The real token is ~130 chars (base64url of UUID + timestamp + 32-byte sig,
// joined by two dots). 512 gives ~4x headroom for future format changes (e.g.
// a version prefix) without inviting oversized payloads that would make the
// HMAC compute and base64url decode work meaningfully harder.
const BodySchema = z.object({
  token: z.string().min(1).max(512),
});

function sendError(
  res: NextApiResponse<ApiError>,
  status: number,
  code: ApiErrorCode,
  message: string,
): void {
  res.status(status).json({ error: { code, message } });
}

/** Map a verify-failure reason onto a user-facing message. */
function messageForReason(
  reason: "MALFORMED" | "EXPIRED" | "BAD_SIGNATURE" | "MISCONFIGURED",
): string {
  switch (reason) {
    case "EXPIRED":
      return "This delete link has expired. Tokens are valid for 7 days.";
    case "BAD_SIGNATURE":
      return "This delete link is not valid.";
    case "MALFORMED":
      return "This delete link is not formatted correctly.";
    case "MISCONFIGURED":
      // Don't reveal the specific env var — just log and surface a generic
      // message. The log line gives the operator enough to diagnose.
      return "Delete by token is not configured on the server.";
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<DeleteCommentResponse | ApiError>,
): Promise<void> {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    sendError(
      res,
      405,
      "METHOD_NOT_ALLOWED",
      `Method ${req.method ?? "unknown"} not allowed.`,
    );
    return;
  }

  // Require JSON. Prevents accidental form-POST + phishing-style link
  // submissions that smuggle a token via `application/x-www-form-urlencoded`
  // from an auto-rendered form somewhere else.
  const rawContentType = req.headers["content-type"];
  const contentType = Array.isArray(rawContentType) ? rawContentType[0] : rawContentType;
  if (typeof contentType !== "string" || !contentType.toLowerCase().includes("application/json")) {
    sendError(res, 415, "VALIDATION", "Content-Type must be application/json.");
    return;
  }

  const parsed = BodySchema.safeParse(req.body);
  if (!parsed.success) {
    sendError(res, 400, "VALIDATION", "A token is required.");
    return;
  }

  const result = verifyDeleteToken(parsed.data.token);
  if (!result.ok) {
    // Log the reason for the operator but keep the client response uniform
    // enough that we don't become an oracle.
    console.error("[api/owner/delete-by-token] token rejected", {
      route: "/api/owner/delete-by-token",
      method: "POST",
      errorCode: "FORBIDDEN",
      reason: result.reason,
    });
    sendError(res, 403, "FORBIDDEN", messageForReason(result.reason));
    return;
  }

  try {
    const removed = await db.remove(result.commentId);
    if (!removed) {
      sendError(res, 404, "NOT_FOUND", "Comment not found — it may already have been deleted.");
      return;
    }
    res.status(200).json({ ok: true, id: result.commentId });
  } catch (err) {
    console.error("[api/owner/delete-by-token] db.remove failed", {
      route: "/api/owner/delete-by-token",
      method: "POST",
      errorCode: "INTERNAL",
      err,
    });
    sendError(res, 500, "INTERNAL", "Unable to delete comment.");
  }
}
