/**
 * `DELETE /api/comments/[id]` — hard-delete a comment by UUID.
 *
 * Phase 2: owner auth is the `x-owner-secret` header stub in `lib/auth.ts`.
 * Phase 3 replaces it with an Iron Session cookie check plus CSRF token.
 */
import type { NextApiRequest, NextApiResponse } from "next";

import { isOwner } from "../../../lib/auth";
import * as db from "../../../lib/comments/db";
import type {
  ApiError,
  ApiErrorCode,
  DeleteCommentResponse,
} from "../../../lib/comments/types";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function sendError(
  res: NextApiResponse<ApiError>,
  status: number,
  code: ApiErrorCode,
  message: string,
): void {
  res.status(status).json({ error: { code, message } });
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<DeleteCommentResponse | ApiError>,
): Promise<void> {
  if (req.method !== "DELETE") {
    res.setHeader("Allow", "DELETE");
    sendError(
      res,
      405,
      "METHOD_NOT_ALLOWED",
      `Method ${req.method ?? "unknown"} not allowed.`,
    );
    return;
  }

  // Auth first: we must not leak whether `id` is a well-formed UUID to
  // unauthenticated callers — returning 400 before 401 would let an attacker
  // distinguish "bad shape" from "valid shape" responses, a small but real
  // oracle. Check ownership before doing any input validation.
  if (!isOwner(req)) {
    sendError(res, 401, "UNAUTHORIZED", "Owner authentication required.");
    return;
  }

  const rawId = req.query.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;
  if (!id || !UUID_RE.test(id)) {
    sendError(res, 400, "VALIDATION", "id must be a UUID.");
    return;
  }

  try {
    const removed = await db.remove(id);
    if (!removed) {
      sendError(res, 404, "NOT_FOUND", "Comment not found.");
      return;
    }
    res.status(200).json({ ok: true, id });
  } catch (err) {
    console.error("[api/comments DELETE] db.remove failed", {
      route: "/api/comments/[id]",
      method: "DELETE",
      errorCode: "INTERNAL",
      err,
    });
    sendError(res, 500, "INTERNAL", "Unable to delete comment.");
  }
}
