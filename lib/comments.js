/**
 * API client for the comments feature.
 *
 * Pure fetch wrappers — no React, no side effects.
 * All functions throw a `CommentApiError` on non-2xx responses so callers
 * can branch on `error.code` (matches the ApiErrorCode union in types.ts).
 */

/** Error codes that match the `ApiErrorCode` union in lib/comments/types.ts. */

export class CommentApiError extends Error {
  /**
   * @param {string} code - Machine-readable error code (e.g. "RATE_LIMIT").
   * @param {string} message - Human-readable message.
   * @param {number} [retryAfter] - Seconds until retry allowed (from Retry-After header on 429).
   * @param {Record<string, string[]>} [fieldErrors] - Per-field validation errors.
   */
  constructor(code, message, retryAfter, fieldErrors) {
    super(message);
    this.name = "CommentApiError";
    /** @type {string} */
    this.code = code;
    /** @type {number | undefined} */
    this.retryAfter = retryAfter;
    /** @type {Record<string, string[]> | undefined} */
    this.fieldErrors = fieldErrors;
  }
}

/**
 * Parse a response body and throw a typed CommentApiError on non-2xx.
 * @param {Response} res
 * @returns {Promise<unknown>}
 */
async function handleResponse(res) {
  if (res.ok) {
    return res.json();
  }

  // Try to parse structured error envelope
  let payload;
  try {
    payload = await res.json();
  } catch {
    throw new CommentApiError(
      "INTERNAL",
      `Unexpected server error (HTTP ${res.status}).`,
    );
  }

  const code = payload?.error?.code ?? "INTERNAL";
  const message =
    payload?.error?.message ?? `Server error (HTTP ${res.status}).`;
  const fieldErrors = payload?.error?.fields;

  // Read Retry-After header for rate-limit responses
  let retryAfter;
  if (res.status === 429) {
    const raw = res.headers.get("Retry-After");
    if (raw !== null) {
      const parsed = parseInt(raw, 10);
      if (Number.isFinite(parsed)) retryAfter = parsed;
    }
  }

  throw new CommentApiError(code, message, retryAfter, fieldErrors);
}

/**
 * Fetch approved comments for a post.
 *
 * @param {string} postId - The post slug (matches the URL id).
 * @param {{ limit?: number, offset?: number }} [options]
 * @returns {Promise<{ comments: import('./comments/types').Comment[], total: number }>}
 */
export async function fetchComments(postId, { limit = 5, offset = 0 } = {}) {
  const params = new URLSearchParams({
    postId,
    limit: String(limit),
    offset: String(offset),
  });
  const res = await fetch(`/api/comments?${params.toString()}`);
  return handleResponse(res);
}

/**
 * Submit a new comment.
 *
 * Always includes `url: ""` so the honeypot field is present — a bot that
 * fills it in will be silently discarded by the server.
 *
 * @param {{ postId: string, author: string, body: string, url?: string }} payload
 * @returns {Promise<import('./comments/types').Comment>}
 */
export async function submitComment(payload) {
  const body = {
    url: "", // honeypot default; override only if the form's hidden input has been filled by a bot
    ...payload,
  };
  const res = await fetch("/api/comments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify(body),
  });
  const data = await handleResponse(res);
  return data.comment;
}

/**
 * Delete a comment by ID. Reads the CSRF token from the `csrf_token` cookie
 * and sends it as `X-CSRF-Token` (double-submit cookie pattern).
 *
 * @param {string} id - UUID of the comment to delete.
 * @returns {Promise<{ ok: true, id: string }>}
 */
export async function deleteComment(id) {
  // Read csrf_token from document.cookie — it is non-httpOnly by design.
  const csrfToken = document.cookie
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith("csrf_token="))
    ?.split("=")[1] ?? "";

  const res = await fetch(`/api/comments/${encodeURIComponent(id)}`, {
    method: "DELETE",
    credentials: "same-origin",
    headers: {
      "X-CSRF-Token": csrfToken,
    },
  });
  return handleResponse(res);
}
