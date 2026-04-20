/**
 * Zod schema for validating `POST /api/comments` request bodies.
 *
 * Enforces:
 *   - `postId`: 1–200 chars (matches post slug length budget).
 *   - `author`: trimmed, 1–60 chars.
 *   - `body`: trimmed, 1–1000 chars, no links (see `./sanitize`).
 *
 * The profanity check is run *after* `safeParse` in the handler so it can
 * return a distinct `422 PROFANITY` error code. Unknown fields are stripped
 * by default (Zod objects are non-strict), which intentionally hides the
 * honeypot field from the parsed payload — the handler inspects the raw
 * body for `req.body.url` before calling `safeParse`.
 */
import { z } from "zod";
import { hasLinks } from "./sanitize";

export const NewCommentSchema = z.object({
  postId: z.string().min(1).max(200),
  author: z.string().trim().min(1).max(60),
  body: z
    .string()
    .trim()
    .min(1)
    .max(1000)
    .refine((value) => !hasLinks(value), {
      message: "Links are not allowed in comments.",
    }),
});

export type NewCommentPayload = z.infer<typeof NewCommentSchema>;
