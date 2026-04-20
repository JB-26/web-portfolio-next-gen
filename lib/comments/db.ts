/**
 * Database access for comments (Phase 2 — real implementation).
 *
 * Uses the Neon serverless HTTP driver with tagged `sql` template literals so
 * every user-supplied value is a bound parameter, never string-interpolated.
 *
 * Responsibilities of every function here:
 *   - Convert `snake_case` columns (`post_id`, `created_at`) to the
 *     `camelCase` `Comment` shape consumed by the API / UI.
 *   - Serialise `TIMESTAMPTZ` as an ISO-8601 string (not a `Date`). Neon's
 *     HTTP driver returns `created_at` as a string already, but we normalise
 *     defensively in case a `Date` slips through.
 *   - Filter by `status = 'approved'` in every read path. Hidden / pending
 *     rows must never leak to the public read endpoints.
 *
 * If `DATABASE_URL` is missing we throw a typed error on first use — we do
 * not construct the client at module load time because Next.js imports
 * server modules during build and tests often `vi.mock` this file.
 */
import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

import type { Comment, NewCommentInput } from "./types";

/** Thrown when the Neon client cannot be constructed (missing env var). */
export class DatabaseConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DatabaseConfigError";
  }
}

export interface ListByPostOptions {
  /** Page size. Must be a positive integer. */
  limit: number;
  /** Zero-based offset into the result set. */
  offset: number;
}

/** Raw row shape as returned from Postgres (before camelCase mapping). */
interface CommentRow {
  id: string;
  post_id: string;
  author: string;
  body: string;
  created_at: string | Date;
  status: string;
}

let sqlClient: NeonQueryFunction<false, false> | null = null;

function getSql(): NeonQueryFunction<false, false> {
  if (sqlClient !== null) return sqlClient;
  const url = process.env.DATABASE_URL;
  if (!url || url.length === 0) {
    throw new DatabaseConfigError(
      "DATABASE_URL is not set. Run `vercel env pull .env.local` or export it manually.",
    );
  }
  sqlClient = neon(url);
  return sqlClient;
}

function toComment(row: CommentRow): Comment {
  const createdAt =
    row.created_at instanceof Date
      ? row.created_at.toISOString()
      : new Date(row.created_at).toISOString();
  const status: Comment["status"] =
    row.status === "approved" || row.status === "hidden" || row.status === "pending"
      ? row.status
      : "approved";
  return {
    id: row.id,
    postId: row.post_id,
    author: row.author,
    body: row.body,
    createdAt,
    status,
  };
}

/** Return a page of approved comments for a post, newest first. */
export async function listByPost(
  postId: string,
  options: ListByPostOptions,
): Promise<Comment[]> {
  const sql = getSql();
  const rows = (await sql`
    SELECT id, post_id, author, body, created_at, status
    FROM comments
    WHERE post_id = ${postId} AND status = 'approved'
    ORDER BY created_at DESC
    LIMIT ${options.limit} OFFSET ${options.offset}
  `) as CommentRow[];
  return rows.map(toComment);
}

/** Insert a new comment and return the persisted row. */
export async function insert(input: NewCommentInput): Promise<Comment> {
  const sql = getSql();
  const rows = (await sql`
    INSERT INTO comments (post_id, author, body)
    VALUES (${input.postId}, ${input.author}, ${input.body})
    RETURNING id, post_id, author, body, created_at, status
  `) as CommentRow[];
  if (rows.length === 0) {
    throw new Error("insert returned no rows");
  }
  return toComment(rows[0]);
}

/** Hard-delete a comment by UUID. Returns `true` if a row was removed. */
export async function remove(id: string): Promise<boolean> {
  const sql = getSql();
  const rows = (await sql`
    DELETE FROM comments WHERE id = ${id}
    RETURNING id
  `) as Array<{ id: string }>;
  return rows.length > 0;
}

/** Count approved comments for a post. Used for pagination totals. */
export async function countByPost(postId: string): Promise<number> {
  const sql = getSql();
  const rows = (await sql`
    SELECT COUNT(*)::int AS total
    FROM comments
    WHERE post_id = ${postId} AND status = 'approved'
  `) as Array<{ total: number }>;
  return rows.length === 0 ? 0 : Number(rows[0].total);
}
