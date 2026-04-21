/**
 * `GET /api/comments?postId=...&limit=&offset=` — list approved comments.
 * `POST /api/comments`                          — submit a new comment.
 *
 * Phase 2 behaviour. Ordering within the POST handler is **load-bearing** —
 * see the implementation plan "Security Verification" section. Do not reorder
 * the steps below without updating the tests.
 */
import type { NextApiRequest, NextApiResponse } from "next";
import type { ZodIssue } from "zod";

import * as db from "../../../lib/comments/db";
import { containsProfanity } from "../../../lib/comments/profanity";
import { NewCommentSchema } from "../../../lib/comments/schema";
import type {
  ApiError,
  ApiErrorCode,
  CreateCommentResponse,
  ListCommentsResponse,
} from "../../../lib/comments/types";
import { notifyOwnerOfComment } from "../../../lib/mail";
import { checkLimit } from "../../../lib/rateLimit";

const DEFAULT_LIMIT = 5;
const MAX_LIMIT = 50;
const DEFAULT_OFFSET = 0;

function sendError(
  res: NextApiResponse<ApiError>,
  status: number,
  code: ApiErrorCode,
  message: string,
  fields?: Record<string, string[]>,
): void {
  res.status(status).json({ error: { code, message, ...(fields ? { fields } : {}) } });
}

function parsePositiveInt(raw: string | string[] | undefined, fallback: number): number {
  if (raw === undefined) return fallback;
  const str = Array.isArray(raw) ? raw[0] : raw;
  const parsed = Number.parseInt(str, 10);
  if (!Number.isFinite(parsed) || parsed < 0) return fallback;
  return parsed;
}

/** Classify a Zod refinement failure on `body` as a `LINKS` rejection. */
function classifyIssues(issues: ZodIssue[]): ApiErrorCode {
  for (const issue of issues) {
    if (
      issue.code === "custom" &&
      issue.path.length === 1 &&
      issue.path[0] === "body"
    ) {
      return "LINKS";
    }
  }
  return "VALIDATION";
}

function flattenIssues(issues: ZodIssue[]): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const issue of issues) {
    const key = issue.path.length === 0 ? "_root" : String(issue.path[0]);
    if (!out[key]) out[key] = [];
    out[key].push(issue.message);
  }
  return out;
}

async function handleGet(
  req: NextApiRequest,
  res: NextApiResponse<ListCommentsResponse | ApiError>,
): Promise<void> {
  const rawPostId = req.query.postId;
  const postId = Array.isArray(rawPostId) ? rawPostId[0] : rawPostId;
  if (!postId || postId.length === 0) {
    sendError(res, 400, "VALIDATION", "postId query parameter is required.");
    return;
  }
  const rawLimit = parsePositiveInt(req.query.limit, DEFAULT_LIMIT);
  const limit = Math.min(Math.max(rawLimit, 1), MAX_LIMIT);
  const offset = parsePositiveInt(req.query.offset, DEFAULT_OFFSET);

  try {
    const [comments, total] = await Promise.all([
      db.listByPost(postId, { limit, offset }),
      db.countByPost(postId),
    ]);
    res.status(200).json({ comments, total });
  } catch (err) {
    console.error("[api/comments GET] db error", {
      route: "/api/comments",
      method: "GET",
      errorCode: "INTERNAL",
      err,
    });
    sendError(res, 500, "INTERNAL", "Unable to load comments.");
  }
}

async function handlePost(
  req: NextApiRequest,
  res: NextApiResponse<CreateCommentResponse | ApiError>,
): Promise<void> {
  // 1. Rate-limit check BEFORE any parsing / DB work / email.
  const limit = await checkLimit(req);
  if (!limit.allowed) {
    if (typeof limit.retryAfter === "number") {
      res.setHeader("Retry-After", String(limit.retryAfter));
    }
    sendError(
      res,
      429,
      "RATE_LIMIT",
      "Too many comments submitted. Please wait a moment before trying again.",
    );
    return;
  }

  const body = (req.body ?? {}) as Record<string, unknown>;

  // 2. Honeypot: silently 200 if the bait field is populated. Bots must not
  //    learn that the honeypot exists, so we return a shape that looks like
  //    a successful submission without touching the DB.
  if (typeof body.url === "string" && body.url.length > 0) {
    const fake: CreateCommentResponse = {
      comment: {
        id: "00000000-0000-0000-0000-000000000000",
        postId: typeof body.postId === "string" ? body.postId : "",
        author: typeof body.author === "string" ? body.author : "",
        body: typeof body.body === "string" ? body.body : "",
        createdAt: new Date().toISOString(),
        status: "approved",
      },
    };
    res.status(200).json(fake);
    return;
  }

  // 3. Zod validation.
  const parsed = NewCommentSchema.safeParse(body);
  if (!parsed.success) {
    const code = classifyIssues(parsed.error.issues);
    const message =
      code === "LINKS"
        ? "Links are not allowed in comments."
        : "Invalid comment payload.";
    sendError(res, code === "LINKS" ? 422 : 400, code, message, flattenIssues(parsed.error.issues));
    return;
  }

  // 4. Profanity — distinct code so the UI can show a specific message.
  if (containsProfanity(parsed.data.body)) {
    sendError(
      res,
      422,
      "PROFANITY",
      "Your comment was blocked by the profanity filter. Please rephrase and try again.",
    );
    return;
  }

  // 5. Persist.
  let inserted;
  try {
    inserted = await db.insert({
      postId: parsed.data.postId,
      author: parsed.data.author,
      body: parsed.data.body,
    });
  } catch (err) {
    console.error("[api/comments POST] db.insert failed", {
      route: "/api/comments",
      method: "POST",
      errorCode: "INTERNAL",
      err,
    });
    sendError(res, 500, "INTERNAL", "Could not save your comment. Please try again.");
    return;
  }

  // 6. Fire-and-forget notification. Email failure MUST NOT fail the request
  //    (QA test POST-10). `notifyOwnerOfComment` already swallows its own
  //    errors, but we wrap defensively in case the stub is later replaced
  //    with a version that can throw synchronously before its try/catch.
  try {
    await notifyOwnerOfComment(inserted);
  } catch (err) {
    console.error("[api/comments POST] notifyOwnerOfComment threw", err);
  }

  // 7. Success.
  res.status(201).json({ comment: inserted });
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> {
  if (req.method === "GET") {
    await handleGet(req, res);
    return;
  }
  if (req.method === "POST") {
    await handlePost(req, res);
    return;
  }
  res.setHeader("Allow", "GET, POST");
  sendError(res, 405, "METHOD_NOT_ALLOWED", `Method ${req.method ?? "unknown"} not allowed.`);
}
