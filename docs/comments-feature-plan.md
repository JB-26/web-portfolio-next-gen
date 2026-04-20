# Comments Feature — Planning Notes

Multi-agent planning output for the comments-section feature on this Next.js Pages Router blog (hosted on Vercel). Decision taken: **self-build** (rejected Giscus to keep control over UX, data, and anonymous commenting).

Branch: `feature/comments`

---

## Product Owner Plan

### 1. MVP Scope vs. Defer

**In MVP:**
- Anonymous text-only comments on `/posts/[id]` (name + optional email, no account)
- Server-side link stripping/rejection + profanity filter (use `bad-words` or `obscenity`)
- Owner-only delete via authenticated admin route (magic link or simple secret header)
- Email notification to owner on every new comment (Resend/SendGrid)
- Paginated display (show N, "Show more")

**Defer:** threading/replies, edit, upvotes, markdown formatting, avatars, commenter notifications, auto-moderation queue, captcha UI (start with honeypot + rate-limit).

### 2. User Stories

**Commenter**
- As a reader, I want to post a comment on a post so I can share a thought without creating an account.
- As a reader, I want clear feedback if my comment is rejected (link detected, profanity) so I can revise it.

**Owner/Moderator**
- As the owner, I want an email on every new comment so I can react quickly without checking the site.
- As the owner, I want to delete any comment from a one-click link in that email (signed token) so moderation is frictionless.

### 3. Acceptance Criteria — "Show more"

- Initial load shows **5 most recent** comments (newest first).
- "Show X more" button visible only when >5 exist; label shows remaining count.
- Clicking loads next 10; button hides when all shown.
- No full page reload; state preserved on client.

### 4. Identity Recommendation

**Name + optional email, no auth.** Lowest friction for a personal blog; email (if provided) enables reply-by-email later. Full auth is overkill at this traffic; pure anonymous invites spam and impersonation.

### 5. Risks / Tradeoffs

- **Spam** — biggest risk. Mitigate with honeypot field + IP rate-limit + link rejection before captcha.
- **Moderation burden** — every-comment emails will fatigue at scale; revisit threshold if >10/day.
- **GDPR** — store only name, optional email, IP (for abuse), comment body. Publish retention policy; offer deletion on request. Hash IPs after 30 days.
- **Hosting state** — Vercel is stateless; need Postgres/Neon or similar.

---

## Solutions Architect Plan

### 1. Storage Options

- **Vercel KV (Redis)** — Key-value only; awkward for relational queries. Cheap but wrong shape.
- **Vercel Postgres** — Managed Postgres via Neon. Fits the data model perfectly, free tier is generous (0.5 GB storage, 60 compute hours/month). Native SQL, no extra service account. **Best fit.**
- **Supabase** — Also Postgres, excellent free tier, built-in auth and row-level security. Slightly more operational surface area than needed.

**Recommendation: Vercel Postgres.** Zero extra accounts, stays within Vercel's free tier, aligns with the existing deployment surface.

### 2. API Surface

| Route | Method | Responsibility |
|---|---|---|
| `/api/comments/[postId]` | GET | Return approved comments for a post; accepts `?page=` for pagination |
| `/api/comments` | POST | Validate input, strip links, run profanity filter, persist with `status: pending`, trigger email |
| `/api/comments/[id]` | DELETE | Verify owner session/secret header, hard-delete the row |

### 3. Page Integration

Keep `/posts/[id]` fully SSG. On mount, the post page fires a client-side `fetch` to `GET /api/comments/[postId]`. This keeps build times unchanged and comment data always fresh. Initially fetch the first N (e.g. 5) via `?page=1`. "Show more" increments the page param.

### 4. Email Delivery

**Resend** — clean API, generous free tier (3,000 emails/month), first-class Next.js support. Send synchronously inside the POST handler — no queue needed at this traffic level. A failed send should log but not fail the comment submission (fire-and-forget with a try/catch).

### 5. Data Model

```sql
comments
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid()
  post_id     TEXT NOT NULL          -- matches the post filename slug
  author      TEXT NOT NULL
  body        TEXT NOT NULL          -- stored post-sanitisation
  created_at  TIMESTAMPTZ DEFAULT now()
  status      TEXT DEFAULT 'approved' -- 'approved' | 'deleted'
```

No email column — no reason to store commenter emails if not building auth. Status column lets you soft-filter without hard-deletes.

---

## Security Auditor Plan

### 1. Input Handling (OWASP A03 Injection, A05 Misconfiguration)

- **XSS — LAUNCH BLOCKER**: Never render comment text as raw HTML. Use React's default text rendering (JSX `{comment.text}`) which escapes by default. No `dangerouslySetInnerHTML`.
- **Link rejection — enforce server-side only**: Client-side filtering is cosmetic. On the API route, reject any comment body matching a URL pattern. Return HTTP 422.
- **Storage injection**: Use parameterised queries / typed inserts. Never interpolate comment text into a query string.
- **Body length cap**: Enforce a hard server-side character limit (e.g., 1000 chars). Reject over-length payloads with 413.

### 2. Spam and Abuse (OWASP A04)

- **Rate limiting — LAUNCH BLOCKER**: Vercel Edge Middleware or Upstash Redis rate limiter (sliding window, keyed on IP).
- **Honeypot field**: Hidden `<input name="url">` (CSS-hidden, not `type="hidden"`). Reject server-side if populated.
- **CAPTCHA**: Acceptable to skip IF honeypot and rate limiting are in place. Turnstile is a low-friction option.
- **Profanity filter**: Run server-side (`bad-words` npm package).

### 3. Authentication and Authorisation — Delete (OWASP A01, A07)

- **Do not use localStorage JWTs** — vulnerable to XSS theft.
- **Recommended**: NextAuth.js with the GitHub provider (allowlist your GitHub ID). Session cookie is `httpOnly`, `Secure`, `SameSite=Lax`.
- **Alternative**: Iron Session (encrypted, signed cookie, no DB needed) with a single hardcoded password in `process.env.OWNER_PASSWORD`.
- **Delete endpoint**: Must validate the comment ID server-side. Never trust a client-supplied `ownerId` flag.

### 4. Email Notifications (OWASP A03, A09)

- **Header injection**: Use a transactional email SDK (Resend, Postmark, SendGrid) — never construct raw SMTP headers from user input.
- **PII leakage**: Truncate or omit the commenter's email from the notification body unless needed.
- **Abuse vector**: Rate limit BEFORE the email call, not after.

### 5. Data Protection and GDPR (OWASP A02)

- **PII inventory**: Comment text + timestamp are minimally necessary. Display name borderline. IP address and commenter email are PII.
- **IP storage**: Store hashed IP (SHA-256 + salt) for rate limiting and abuse investigation. Don't store raw IPs in the comment record.
- **Retention**: Define a retention policy. For a personal blog this can be manual.
- **GDPR**: Need a privacy notice if any PII is collected. Minimum: a sentence on the post page.

### 6. Secrets and Config (OWASP A02, A05)

- All secrets (mail API key, DB connection string, `OWNER_PASSWORD`/`NEXTAUTH_SECRET`) in Vercel environment variables.
- Scope secrets per environment (production-only for mail/DB; previews use sandboxed credentials).
- `NEXTAUTH_SECRET`: cryptographically random 32+ byte value (`openssl rand -hex 32`).

### 7. CSRF (OWASP A05)

- **Comment submit**: Add `edge-csrf` or validate that `Origin`/`Referer` matches your domain on POST/DELETE. SameSite=Lax mitigates most CSRF, but explicit token is best practice for delete.
- **Delete action**: Require a CSRF token in addition to the authenticated session. Double-submit cookie pattern is straightforward.

### Launch Blockers vs Acceptable Risks

| Finding | Launch Blocker? |
|---|---|
| No server-side rate limiting | Yes |
| XSS via raw HTML rendering | Yes |
| Link rejection client-side only | Yes |
| localStorage JWT for owner auth | Yes |
| No CSRF token on delete | Yes |
| No CAPTCHA | Acceptable (honeypot + rate limit sufficient) |
| Raw IP stored in DB | Acceptable risk; hash it if you can |
| No privacy notice | Acceptable for soft launch; add before promotion |
| No automated retention policy | Acceptable; manual is fine at this scale |

---

## Frontend Craft Plan

### 1. Component Structure

- `components/comments/CommentsSection.js` — top-level orchestrator; lazy-loaded via `dynamic(() => import(...), { ssr: false })` so it never blocks post LCP
- `components/comments/CommentForm.js` — controlled form; owns submit state machine
- `components/comments/CommentList.js` — renders paginated slice; owns "show more" state
- `components/comments/CommentItem.js` — single comment card; conditionally renders delete button
- `components/comments/CommentSkeleton.js` — loading placeholder (3 shimmer cards)
- API calls live in `lib/comments.js` (fetch wrappers), not inside components

### 2. Accessibility

- `<label htmlFor>` on every form field; no placeholder-only labels
- Validation errors injected into a `role="alert"` element adjacent to the offending field; server errors into a separate `role="alert"` at form top
- After successful submit, move focus to the newly inserted comment via `useRef` + `useEffect`; announce with a visually-hidden `role="status"` polite message
- "Show more" is a `<button>` (not a link); `aria-label="Load more comments"` and visible `focus-visible:outline`
- Dark mode: comment card bg (`dark:bg-gray-800`) must maintain 4.5:1 contrast; error red must pass in both modes (`text-red-400` in dark, `text-red-600` light)

### 3. States

- `loading` — CommentSkeleton shown while fetch resolves
- `empty` — "Be the first to comment" text
- `success` — form resets; new comment optimistically prepended; focus moves to it
- `validation-error` — inline per-field; no submit attempted
- `server-error` — generic "Something went wrong, try again" in `role="alert"`
- `rejected-profanity` — "Your comment was flagged — please revise" in `role="alert"`
- `rate-limited` — "Too many submissions, please wait" with retry countdown if header available
- `deleted` — item fades out; `role="status"` announces "Comment deleted"; focus returns to list

### 4. Form Validation

- Client-side: empty check; max 1000 chars with live character counter (`aria-live="polite"`); URL rejection via `/https?:\/\/|www\./i` — simple and low false-positive rate
- Tradeoff: bare domains like `evil.com` slip through, so server must re-validate with a stricter pattern and the profanity filter regardless
- Inline errors replace field border with `border-red-500`; error text is `id`-linked via `aria-describedby`
- Submit button disabled only while request is in-flight

### 5. Show More UX

- Initial count: **5 comments**
- **Button-triggered pagination**, not infinite scroll — infinite scroll hijacks keyboard users and breaks browser back-navigation
- On click: append next slice to DOM; scroll position preserved naturally; focus stays on button until all comments loaded, then button unmounts and focus moves to first newly visible comment

### 6. Owner Delete Affordance

- Delete button rendered only when `isOwner` prop is `true`; `isOwner` derived from session/cookie check in `getServerSideProps` on the post page and passed down as a prop — never trust client-only auth
- Button: icon-only trash SVG with `aria-label="Delete comment by [author]"` + `title` tooltip; `text-gray-400 hover:text-red-500` to be subtle until hovered
- On click: inline confirmation replaces button row ("Delete this comment? Confirm / Cancel"); focus moves to Confirm; Cancel restores previous state

### 7. Performance

- `dynamic(import, { ssr: false })` in `pages/posts/[id].js` — comments JS not in initial bundle; post LCP unaffected
- No `priority` on any comment-area images (avatars etc.) — below the fold
- Use `lg:` breakpoints if any responsive comment layout is needed (per project convention)
- Comment avatars (if added later): `<Image>` with explicit `width`/`height` to prevent CLS; lazy by default

---

## TypeScript Architect Plan

### 1. Type Definitions

```ts
// lib/comments/types.ts
export interface Comment {
  id: string;              // uuid
  postId: string;          // post slug
  author: string;          // display name, <= 60
  body: string;            // <= 1000
  createdAt: string;       // ISO 8601
}

export type NewCommentInput = Pick<Comment, "postId" | "author" | "body">;

export interface ApiError {
  error: {
    code: "VALIDATION" | "RATE_LIMIT" | "PROFANITY" | "LINKS" | "UNAUTHORIZED" | "NOT_FOUND" | "INTERNAL";
    message: string;
    fields?: Record<string, string>;
  };
}

export type ListCommentsResponse = { comments: Comment[] };
export type CreateCommentResponse = { comment: Comment };
export type DeleteCommentResponse = { ok: true };
```

### 2. Validation — Zod

```ts
// lib/comments/schema.ts
import { z } from "zod";
const URL_RE = /\b(?:https?:\/\/|www\.)\S+|\S+\.(?:com|net|org|io|co|dev)\b/i;

export const NewCommentSchema = z.object({
  postId: z.string().min(1).max(200),
  author: z.string().trim().min(1).max(60),
  body: z.string().trim().min(1).max(1000)
    .refine((s) => !URL_RE.test(s), { message: "Links are not allowed" }),
});
export type NewCommentPayload = z.infer<typeof NewCommentSchema>;
```

### 3. API Route Structure

```ts
// pages/api/comments/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { NewCommentSchema } from "@/lib/comments/schema";
import type { ApiError, CreateCommentResponse, ListCommentsResponse } from "@/lib/comments/types";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CreateCommentResponse | ListCommentsResponse | ApiError>,
) {
  if (req.method === "GET") { /* list by postId */ }
  if (req.method === "POST") {
    const parsed = NewCommentSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: { code: "VALIDATION", message: "Invalid payload" } });
    // profanity check -> insert -> mail
  }
  return res.status(405).json({ error: { code: "VALIDATION", message: "Method not allowed" } });
}
```

`pages/api/comments/[id].ts` handles `DELETE` with owner auth.

### 4. Server-Side Helpers

- `lib/comments/db.ts` — `listByPost(postId): Promise<Comment[]>`, `insert(input: NewCommentInput): Promise<Comment>`, `remove(id: string): Promise<boolean>`. Backed by Neon via `@neondatabase/serverless` (the Neon Vercel integration replaced the deprecated `@vercel/postgres`).
- `lib/comments/profanity.ts` — `containsProfanity(text: string): boolean` using `bad-words` or a local list.
- `lib/comments/sanitize.ts` — `hasLinks(text: string): boolean` (exported for reuse + tests).
- `lib/mail.ts` — `notifyOwnerOfComment(c: Comment): Promise<void>` via Resend.
- `lib/auth.ts` — `isOwner(req: NextApiRequest): boolean`.

### 5. TS Config — Incremental Adoption

Run `npx next typescript` to generate `tsconfig.json`. Set `"allowJs": true`, `"strict": true`, `"noEmit": true`, `"isolatedModules": true`. Add path alias `"@/*": ["./*"]`. Use `import type` for type-only imports. Leave existing `.js` files alone; new files land as `.ts`/`.tsx`.

### 6. Testing

- **Unit (Vitest or Jest)**: `hasLinks`, `containsProfanity`, `NewCommentSchema.safeParse` (boundary lengths, link variants, unicode profanity), `isOwner`.
- **Playwright**: post/list/delete round-trip against a comment form on `/posts/[id]`, 400 on link submission, 401 on unauthorized delete. Don't e2e the mail send — stub `notifyOwnerOfComment` behind an env flag.

---

## Cross-Cutting Decisions & Open Questions

**Decided:**
- Self-build (not Giscus) — keep control over UX and anonymous commenting
- Storage: Vercel Postgres
- Email: Resend, fire-and-forget inside POST handler
- Initial pagination: 5 comments, button-driven
- Validation: server-authoritative; Zod schema; `bad-words` for profanity
- Identity: anonymous name + optional email, no commenter auth

**Open / to decide before implementation:**
- Owner auth: NextAuth (GitHub provider) vs. Iron Session with `OWNER_PASSWORD`
- Rate limiter: Upstash Redis vs. Vercel Edge Middleware (Upstash recommended)
- Whether to introduce TypeScript now or stay in JS for MVP
- Privacy notice copy and placement on post pages

**Launch blockers (must be in MVP):**
1. Server-side rate limiting
2. Server-side link rejection
3. CSRF token on delete endpoint
4. Owner auth via httpOnly cookie (no localStorage JWT)
5. Plain-text rendering only (no `dangerouslySetInnerHTML`)
