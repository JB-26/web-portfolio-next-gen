/**
 * Shared types for the comments feature.
 *
 * These shapes are consumed by the API route handlers (`pages/api/comments/*`),
 * the DB layer (`lib/comments/db.ts`), and the UI components
 * (`components/comments/*`). Keep the wire format stable — the API response
 * types below are the contract between server and client.
 */

/** A comment as it is returned to clients. IDs are UUID strings. */
export interface Comment {
  /** UUID v4 primary key. */
  id: string;
  /** Post slug / id the comment belongs to (e.g. "2025-01-30-scrum"). */
  postId: string;
  /** Display name supplied by the commenter. 1–60 chars, trimmed. */
  author: string;
  /** Body text. 1–1000 chars, trimmed. Rendered as plain text, never HTML. */
  body: string;
  /** ISO-8601 timestamp string (serialised from `TIMESTAMPTZ`). */
  createdAt: string;
  /** Moderation status. `approved` by default. */
  status: "approved" | "hidden" | "pending";
}

/**
 * Input shape accepted by `db.insert`. Excludes server-generated fields
 * (`id`, `createdAt`, `status`).
 */
export interface NewCommentInput {
  postId: string;
  author: string;
  body: string;
}

/** Stable machine-readable error codes returned by the comments API. */
export type ApiErrorCode =
  | "VALIDATION"
  | "LINKS"
  | "PROFANITY"
  | "RATE_LIMIT"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "METHOD_NOT_ALLOWED"
  | "PAYLOAD_TOO_LARGE"
  | "INTERNAL";

/** Uniform error envelope returned by every comments API route on failure. */
export interface ApiError {
  error: {
    code: ApiErrorCode;
    /** Human-readable message, safe to surface in UI. */
    message: string;
    /** Optional per-field validation details (Zod flatten output shape). */
    fields?: Record<string, string[]>;
  };
}

/** Response body for `GET /api/comments?postId=...`. */
export interface ListCommentsResponse {
  comments: Comment[];
  /** Total approved comments for this post (not just this page). */
  total: number;
}

/** Response body for `POST /api/comments` on success. */
export interface CreateCommentResponse {
  comment: Comment;
}

/** Response body for `DELETE /api/comments/[id]` on success. */
export interface DeleteCommentResponse {
  ok: true;
  id: string;
}
