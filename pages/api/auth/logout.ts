/**
 * `POST /api/auth/logout` — end the owner session.
 *
 * No authentication is required — logout is idempotent, and forcing auth
 * would make the button fail for someone whose cookie already expired.
 * Still require a same-origin check so a hostile site cannot log the owner
 * out via a drive-by form submission.
 */
import type { NextApiRequest, NextApiResponse } from "next";

import { AuthConfigError, getSession, verifyOrigin } from "@/lib/auth";
import type { ApiError, ApiErrorCode } from "@/lib/comments/types";

interface LogoutSuccess {
  ok: true;
}

function sendError(
  res: NextApiResponse<ApiError>,
  status: number,
  code: ApiErrorCode,
  message: string,
): void {
  res.status(status).json({ error: { code, message } });
}

/** Coerce the current Set-Cookie header to a string[] so we can append. */
function existingSetCookies(res: NextApiResponse): string[] {
  const current = res.getHeader("Set-Cookie");
  if (current === undefined) return [];
  if (Array.isArray(current)) return current.map(String);
  return [String(current)];
}

/** Build an expired cookie (Max-Age=0) to clear a previously-set sentinel. */
function buildExpiredCookie(name: string): string {
  const parts = [
    `${name}=`,
    "Path=/",
    "SameSite=Lax",
    "Max-Age=0",
  ];
  if (process.env.NODE_ENV === "production") parts.push("Secure");
  return parts.join("; ");
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<LogoutSuccess | ApiError>,
): Promise<void> {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    sendError(res, 405, "METHOD_NOT_ALLOWED", "Method not allowed.");
    return;
  }

  if (!verifyOrigin(req)) {
    sendError(res, 403, "FORBIDDEN", "Cross-origin logout rejected.");
    return;
  }

  try {
    const session = await getSession(req, res);
    session.destroy(); // synchronous; clears the encrypted cookie immediately
  } catch (err) {
    if (err instanceof AuthConfigError) {
      // If sessions can't be decoded we still want logout to "succeed" from
      // the user's POV — clear the sentinel cookies and return ok.
      console.error("[api/auth/logout] session misconfigured", err);
    } else {
      throw err;
    }
  }

  // Overwrite our non-httpOnly sentinels with expired copies. Must match the
  // path/samesite/secure used at login for the browser to treat them as the
  // same cookie.
  const cookies = existingSetCookies(res);
  cookies.push(buildExpiredCookie("csrf_token"));
  cookies.push(buildExpiredCookie("owner_ui"));
  res.setHeader("Set-Cookie", cookies);

  res.status(200).json({ ok: true });
}
