/**
 * `DELETE /api/comments/[id]` — hard-delete a comment by UUID.
 *
 * Phase 3: owner auth is an encrypted Iron Session cookie set at
 * `/api/auth/login`. Every state-changing call must also pass the origin
 * check and the double-submit CSRF check. Ordering preserves the Phase 2
 * "auth before shape oracle" property — we do not reveal whether the UUID is
 * well-formed to unauthenticated callers.
 */
import type { NextApiRequest, NextApiResponse } from "next";

import { getSession, verifyCsrf, verifyOrigin } from "../../../lib/auth";
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
  // 1. Method check.
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

  // 2. Load session once, reuse for auth + CSRF checks. If session loading
  //    itself throws (misconfigured env) we fall through to a 500.
  let session;
  try {
    session = await getSession(req, res);
  } catch (err) {
    console.error("[api/comments DELETE] session load failed", err);
    sendError(res, 500, "INTERNAL", "Auth is not configured.");
    return;
  }

  // 3. Owner check FIRST so we do not leak UUID-shape info to unauth'd callers.
  if (session.isOwner !== true) {
    sendError(res, 401, "UNAUTHORIZED", "Owner authentication required.");
    return;
  }

  // 4. Same-origin check (defence in depth over SameSite=Lax).
  if (!verifyOrigin(req)) {
    sendError(res, 403, "FORBIDDEN", "Cross-origin request rejected.");
    return;
  }

  // 5. CSRF token (double-submit cookie pattern). The client must echo the
  //    `csrf_token` cookie back in the `x-csrf-token` header.
  if (!verifyCsrf(req, session)) {
    sendError(res, 403, "FORBIDDEN", "Invalid CSRF token.");
    return;
  }

  // 6. Now that we trust the caller, validate the path parameter.
  const rawId = req.query.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;
  if (!id || !UUID_RE.test(id)) {
    sendError(res, 400, "VALIDATION", "id must be a UUID.");
    return;
  }

  // 7. Perform the delete.
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
