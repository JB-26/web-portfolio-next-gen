/**
 * Database access for comments — STUB (Phase 1).
 *
 * Signatures are fixed now so the rest of Phase 1 can compile and downstream
 * phases can import the module. Implementations will land in Phase 2 against
 * `@neondatabase/serverless` using a tagged `sql` template literal. Each function must:
 *   - convert `snake_case` columns to the `camelCase` `Comment` shape;
 *   - serialise `TIMESTAMPTZ` as ISO-8601 strings;
 *   - filter by `status = 'approved'` in read paths.
 *
 * Every function currently throws so an accidental call from a route handler
 * during Phase 1 fails loudly rather than returning `undefined`.
 */
import type { Comment, NewCommentInput } from "./types";

export interface ListByPostOptions {
  /** Page size. Must be a positive integer. */
  limit: number;
  /** Zero-based offset into the result set. */
  offset: number;
}

/** Return a page of approved comments for a post, newest first. */
export function listByPost(
  _postId: string,
  _options: ListByPostOptions,
): Promise<Comment[]> {
  throw new Error("not implemented in phase 1");
}

/** Insert a new comment and return the persisted row. */
export function insert(_input: NewCommentInput): Promise<Comment> {
  throw new Error("not implemented in phase 1");
}

/** Hard-delete a comment by UUID. Returns `true` if a row was removed. */
export function remove(_id: string): Promise<boolean> {
  throw new Error("not implemented in phase 1");
}

/** Count approved comments for a post. Used for pagination totals. */
export function countByPost(_postId: string): Promise<number> {
  throw new Error("not implemented in phase 1");
}
