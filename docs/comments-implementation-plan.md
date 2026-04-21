# Comments Feature — Implementation Plan

Concrete implementation plan for the comments feature. Builds on the high-level planning in [comments-feature-plan.md](comments-feature-plan.md).

Branch: `feature/comments`

**Resolved open questions:**
- **Owner auth**: Iron Session (single `OWNER_PASSWORD` env var, encrypted httpOnly cookie, no external service)
- **Rate limiter**: Upstash Redis (`@upstash/ratelimit` sliding window, real shared state across regions)
- **TypeScript**: introduce now for new comment files only (`allowJs: true` keeps existing `.js` untouched)
- **Privacy notice**: one inline sentence above the comment form (no separate policy page)

---

## Master Implementation Plan

### Phased Milestones

| # | Phase | Goal | Depends on | Unblocks | Launch blockers landed |
|---|---|---|---|---|---|
| 1 | Foundation / Infra | Vercel Postgres provisioned, schema migrated, env vars set, TS config, shared types and Zod schema | Nothing | All other phases | — |
| 2 | Backend API | `GET /api/comments/[postId]`, `POST /api/comments` (validate, profanity, persist, email), `DELETE /api/comments/[id]` (stub auth) | Phase 1 | Phases 3, 4 | Rate limit, link rejection, raw HTML prevention |
| 3 | Owner Auth | Iron Session login endpoint, `isOwner()` helper, CSRF token on DELETE | Phase 1 | Phase 4 (delete button), Phase 5 (moderation email link) | Owner auth cookie, CSRF |
| 4 | UI Integration | `CommentsSection`, `CommentForm`, `CommentList`, `CommentItem`, lazy-loaded into `/posts/[id]`, all states handled, delete button gated by `isOwner` | Phases 2, 3 | Phase 6 | — |
| 5 | Moderation & Email | Resend notification with signed one-click delete token, Upstash rate limiter wired to POST handler, honeypot field | Phase 2 | Phase 6 | Rate limit (finalised), honeypot |
| 6 | Polish / Launch | Privacy notice copy, IP hashing at insert, error boundaries, analytics events, Playwright E2E suite, final security review | Phases 4, 5 | Ship | — |

### Environment & Infrastructure Setup

Complete before writing any feature code:

**Vercel Postgres** — Provision from the Vercel dashboard (Storage tab) and link to the project. The `@neondatabase/serverless` package reads `DATABASE_URL` automatically when linked.

**Upstash Redis** — Create a free Upstash Redis database. Copy REST URL and token.

**Resend** — Create a Resend account, verify the sending domain, generate an API key.

**Required environment variables:**

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Vercel Postgres connection string (injected automatically when linked) |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis endpoint |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis auth token |
| `RESEND_API_KEY` | Resend transactional email key |
| `OWNER_NOTIFY_EMAIL` | Address Resend sends notifications to |
| `OWNER_FROM_EMAIL` | Verified Resend sender (e.g. `comments@joshblewitt.dev`) |
| `OWNER_PASSWORD` | Iron Session login password (min 32 chars) |
| `IRON_SESSION_PASSWORD` | Iron Session cookie encryption key (32+ bytes, `openssl rand -hex 32`) |
| `IP_HASH_SALT` | Salt for SHA-256 hashing IPs before they touch Redis/DB |
| `NEXT_PUBLIC_SITE_URL` | Canonical origin for CSRF origin check and delete token generation |

Scope `DATABASE_URL`, `RESEND_API_KEY`, `OWNER_NOTIFY_EMAIL`, `OWNER_PASSWORD`, and `IRON_SESSION_PASSWORD` to **production only**. Use sandboxed/test credentials for preview deployments.

### Cross-Cutting Concerns

- **Logging**: All API route errors caught and logged via `console.error` with structured `{ route, method, errorCode }` payload. Vercel Function Logs capture this automatically.
- **Error boundaries**: Wrap `CommentsSection` in a React error boundary at the call site in `pages/posts/[id].js`. A thrown error in comments must never break the post page.
- **Analytics**: Instrument three events via the existing `@vercel/analytics` `track()` call — `comment_submitted`, `comment_load_more`, `comment_deleted`. Fire-and-forget.
- **Database migration**: One-time script (`scripts/migrate-comments.mjs`), not an ORM migration runner.

### Hand-Off Matrix

| Phase | TS Architect | Frontend Craft | Security | QA |
|---|---|---|---|---|
| 1 — Foundation | Owns | — | Reviews env scoping | Validates type exports compile |
| 2 — Backend API | Owns | — | Reviews injection, 422/413 responses, honeypot | Unit tests for schema and sanitize helpers |
| 3 — Owner Auth | Owns | — | Owns (cookie flags, CSRF, no localStorage) | Auth flow integration tests |
| 4 — UI Integration | Reviews prop types | Owns | Reviews `isOwner` prop flow | Playwright: post, paginate, delete |
| 5 — Moderation & Email | Owns (Resend, signed token, Upstash wiring) | Implements rate-limit UI state | Owns (rate limit, token signing, email PII) | Smoke test email; verify rate limit blocks |
| 6 — Polish / Launch | — | Owns (privacy notice, error boundary, analytics) | Owns (final audit) | Full Playwright E2E; accessibility audit |

---

## Backend Implementation Plan

### TS Adoption

Incremental TypeScript — new comment files only. `allowJs: true` keeps existing `.js` files untouched.

`tsconfig.json` (created by `npx next typescript` then edited):

```json
{
  "compilerOptions": {
    "target": "ES2022", "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true, "checkJs": false, "skipLibCheck": true,
    "strict": true, "noEmit": true, "esModuleInterop": true,
    "module": "esnext", "moduleResolution": "bundler",
    "resolveJsonModule": true, "isolatedModules": true, "jsx": "preserve",
    "incremental": true, "baseUrl": ".", "paths": { "@/*": ["./*"] },
    "plugins": [{ "name": "next" }]
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### Files to Create (in order)

1. `tsconfig.json`
2. `lib/comments/types.ts` — exports `Comment`, `NewCommentInput`, `ApiError`, response types
3. `lib/comments/sanitize.ts` — exports `hasLinks(text)`, `URL_RE`
4. `lib/comments/profanity.ts` — exports `containsProfanity(text)` wrapping `bad-words`
5. `lib/comments/schema.ts` — exports `NewCommentSchema` (Zod), `NewCommentPayload`
6. `lib/comments/db.ts` — `listByPost(postId, {limit, offset})`, `insert(input)`, `remove(id)`, `countByPost(postId)`. Uses `@neondatabase/serverless` tagged `sql`. Converts snake_case rows to camelCase `Comment`.
7. `lib/mail.ts` — `notifyOwnerOfComment(c: Comment): Promise<void>` via Resend; try/catch internally, never throws
8. `lib/auth.ts` — `isOwner(req): boolean` (iron-session read); `requireOwner(req, res)` helper
9. `lib/rateLimit.ts` — Upstash `@upstash/ratelimit` + `@upstash/redis`; exports `commentLimiter` (sliding window, 5/min per IP-hash) and `checkLimit(req)`
10. `pages/api/comments/index.ts` — `GET` (query: `postId`, `limit`, `offset`); `POST` runs rate-limit → Zod parse → profanity → `db.insert` → fire-and-forget `notifyOwnerOfComment`
11. `pages/api/comments/[id].ts` — `DELETE` runs `requireOwner` + CSRF check → `db.remove`
12. `scripts/migrate-comments.mjs` — one-shot SQL runner using `@neondatabase/serverless`, idempotent

### Schema Migration

```sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE TABLE IF NOT EXISTS comments (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id    TEXT NOT NULL,
  author     TEXT NOT NULL,
  body       TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status     TEXT NOT NULL DEFAULT 'approved'
);
CREATE INDEX IF NOT EXISTS comments_post_id_created_at_idx
  ON comments (post_id, created_at DESC) WHERE status = 'approved';
```

**How to run:** `vercel env pull .env.local` then `node scripts/migrate-comments.mjs`. For production, run against the prod DB URL or paste into the Neon SQL editor. Add npm script: `"db:migrate": "node scripts/migrate-comments.mjs"`.

### Dependencies

```bash
npm i @neondatabase/serverless zod bad-words resend iron-session @upstash/ratelimit @upstash/redis
npm i -D typescript @types/node @types/react @types/bad-words vitest @vitest/coverage-v8
```

### Wire-up to `pages/posts/[id].js`

Keep SSG. Add only:
- `<CommentsSection postId={postData.id} isOwner={isOwner} />` rendered below the Tags block (lazy-imported)
- `isOwner` resolved client-side via a sentinel cookie (see Frontend plan §5) — **not** from `getStaticProps`
- Initial comments fetched client-side via `GET /api/comments?postId={id}&limit=5&offset=0` on mount

### Testing Scaffolding

**Vitest** for unit tests. Files alongside implementation:
- `vitest.config.ts` — `test.environment: "node"`, `include: ["lib/**/*.test.ts"]`
- `lib/comments/sanitize.test.ts`
- `lib/comments/profanity.test.ts`
- `lib/comments/schema.test.ts`
- `lib/auth.test.ts`

Add npm scripts: `"test:unit": "vitest run"`, `"test:unit:watch": "vitest"`.

---

## Frontend Implementation Plan

### Files to Create

**`lib/comments.js`** — fetch wrappers only. Functions: `fetchComments(postId, page)`, `submitComment(payload)`, `deleteComment(id, csrfToken)`.

**`components/comments/CommentSkeleton.js`** — three shimmer placeholder cards. No props.

**`components/comments/CommentItem.js`** — single comment card. Props: `comment`, `isOwner`, `onDelete(id)`. State: `confirmingDelete`.

**`components/comments/CommentList.js`** — visible slice + "Show more" + empty state. Props: `comments`, `isOwner`, `onDelete(id)`. State: `visibleCount` (starts at 5; +10 per click).

**`components/comments/CommentForm.js`** — controlled form (name, body, honeypot). Props: `postId`, `onSuccess(newComment)`. State: `formState` (state machine — see §4), `fields`, `fieldErrors`, `serverError`, `charCount`.

**`components/comments/CommentsSection.js`** — top-level orchestrator. Props: `postId`, `isOwner`. State: `comments`, `fetchState` (`loading | success | error`).

### Files to Modify — `pages/posts/[id].js`

Add at top:
```js
import dynamic from "next/dynamic";
const CommentsSection = dynamic(
  () => import("../../components/comments/CommentsSection"),
  { ssr: false, loading: () => null }
);
```

Add `isOwner` detection inside `Post`:
```js
const [isOwner, setIsOwner] = useState(false);
useEffect(() => {
  setIsOwner(document.cookie.includes("owner_ui=1"));
}, []);
```

Insert below Related Posts:
```jsx
<section aria-labelledby="comments-heading" className="mt-10">
  <h2 id="comments-heading" className="text-2xl font-extrabold leading-snug mb-5">
    Comments
  </h2>
  <CommentsSection postId={postData.id} isOwner={isOwner} />
</section>
```

`getStaticProps`/`getStaticPaths` unchanged.

### Tailwind Classes (Light + Dark, WCAG AA verified)

**Comment card:** `bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-4 mb-3`

**Author:** `text-sm font-semibold text-gray-900 dark:text-slate-100`

**Date:** `text-xs text-gray-500 dark:text-slate-400`

**Body:** `text-gray-800 dark:text-slate-200 text-base leading-relaxed`

**Form fields:** `w-full rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 px-3 py-2 text-base focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:focus-visible:outline-blue-400`

**Error border:** `border-red-500 dark:border-red-400`

**Inline error text:** `text-red-600 dark:text-red-400 text-sm mt-1`

**"Show more" button:** `mt-4 px-4 py-2 rounded-md text-sm font-medium border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:focus-visible:outline-blue-400 motion-reduce:transition-none`

**Submit (idle):** `bg-blue-600 dark:bg-blue-500 text-white font-medium px-5 py-2.5 rounded-md hover:bg-blue-700 dark:hover:bg-blue-400 disabled:opacity-50 disabled:cursor-not-allowed`

**Delete button:** `text-gray-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 p-1 rounded`

**Skeleton:** `animate-pulse bg-gray-200 dark:bg-slate-700 rounded-lg h-20 mb-3`. Add `@media (prefers-reduced-motion: reduce) { .animate-pulse { animation: none; } }` to global CSS.

### Form State Machine

| State | Trigger in | Trigger out | Side effects |
|---|---|---|---|
| `idle` | mount, cancel, success reset | submit clicked → `submitting` | — |
| `submitting` | submit (client validation passed) | response arrives | button disabled; spinner |
| `success` | 2xx response | 3 s → `idle` | form resets; `onSuccess(comment)` called; focus moves to new comment; `role="status"` "Comment posted" |
| `validation_error` | submit, client check fails | field edit → `idle` | per-field `role="alert"`; focus moves to first errored field |
| `server_error` | 5xx response | retry → `submitting`; edit → `idle` | top-of-form `role="alert"` |
| `profanity_rejected` | 422 `code: PROFANITY` | body edit → `idle` | top-of-form `role="alert"` |
| `links_rejected` | 422 `code: LINKS` | body edit → `idle` | top-of-form `role="alert"` |
| `rate_limited` | 429 | countdown expires → `idle` | top-of-form alert; read `Retry-After` for countdown |

### Owner Detection — Resolved

The post page is SSG. `isOwner` cannot come from props. Pattern:
- Owner auth (Iron Session) sets an `httpOnly` session cookie via `/api/auth/...` after login
- Auth API also sets a non-httpOnly **sentinel cookie** (`owner_ui=1`) readable by JS
- `Post` reads the sentinel on mount via `useEffect` → `useState(false)` initial value (no hydration mismatch because `CommentsSection` is `ssr: false`)
- Pass `isOwner` down: `Post` → `CommentsSection` → `CommentList` → `CommentItem`
- The DELETE API independently re-validates the real httpOnly session — UI flag is decoration only

### Loading & Empty States

```jsx
// Loading
<>
  <CommentSkeleton />
  <p className="sr-only" role="status" aria-live="polite">Loading comments</p>
</>

// Empty
<p className="text-gray-500 dark:text-slate-400 text-base py-4">
  No comments yet — be the first to share a thought.
</p>

// Fetch error
<p role="alert" className="text-red-600 dark:text-red-400 text-base py-4">
  Comments could not be loaded. Refresh the page to try again.
</p>
```

### Manual QA Checklist

**Keyboard:** Tab order through Comments heading → form → Show more → delete buttons; honeypot skipped (`tabIndex="-1"`); confirm/cancel reachable; Cancel returns focus to delete button.

**Screen reader:** `role="status"` for loading/posted/deleted; `role="alert"` immediate for validation/profanity/links/rate-limit; character counter (`aria-live="polite"`) only at 100/50/20/0 chars.

**Dark mode:** All text passes 4.5:1; `red-400` on `slate-800` = 4.61:1 (pass); `blue-500` on white in dark mode confirmed visually.

**iPad Mini portrait (768×1024):** Cards no horizontal overflow; submit button ≥ 44×44px touch target; **use `lg:` not `md:` per project convention**.

**iPhone 12 Pro (390×844):** No horizontal scroll; textarea ≥ 3 rows; delete icon wrapped in `p-2` for 44×44 touch target; inline confirm uses `flex-col gap-2` (not `flex-row`).

### Dependencies

No new npm packages for the UI layer.

---

## Security Verification Plan

### Per-Blocker Acceptance Tests

**Blocker 1 — Server-side rate limiting**

```bash
for i in $(seq 1 6); do
  curl -s -o /dev/null -w "%{http_code}\n" -X POST https://localhost:3000/api/comments \
    -H "Content-Type: application/json" \
    -d '{"postId":"test-post","author":"Test","body":"Hello world"}';
done
```
Pass: 6th response is `429`, body contains `error.code === "RATE_LIMIT"`, includes `Retry-After` header.

**Blocker 2 — XSS via raw HTML**

Submit body: `<script>alert('xss')</script>`. Pass: rendered as literal text, no alert fires.

```bash
grep -rn "dangerouslySetInnerHTML" components/comments/ pages/posts/
```
Pass: zero results.

**Blocker 3 — Link rejection (server-side)**

```bash
curl -s -X POST https://localhost:3000/api/comments \
  -H "Content-Type: application/json" \
  -d '{"postId":"test-post","author":"Test","body":"Visit https://evil.com"}'
```
Pass: `422` with `code: "LINKS"`. Also test bare domain: `Visit evil.com today` — must also return 422.

**Blocker 4 — No localStorage JWT**

```bash
curl -s -o /dev/null -w "%{http_code}\n" -X DELETE https://localhost:3000/api/comments/some-uuid
```
Pass: `401`. DevTools → Local Storage: no auth-related keys. Session only in httpOnly cookie.

```bash
grep -rn "localStorage" lib/auth.ts lib/comments/ pages/api/comments/
```
Pass: zero results.

**Blocker 5 — CSRF on delete**

With valid session cookie but no CSRF token:
```bash
curl -s -o /dev/null -w "%{http_code}\n" -X DELETE https://localhost:3000/api/comments/some-uuid \
  -H "Cookie: iron-session=<value>"
```
Pass: `403`. Mismatched token also `403`.

### Pre-Merge Security Review Checklist

| # | Check | Command / location |
|---|---|---|
| 1 | No `dangerouslySetInnerHTML` in comment components | `grep -rn "dangerouslySetInnerHTML" components/comments/` — zero |
| 2 | No raw IPs to DB | `grep -rn "x-forwarded-for\|req.socket.remoteAddress" pages/api/comments/` — must be hashed |
| 3 | All env vars in `.env.example` | placeholder values for `DATABASE_URL`, `RESEND_API_KEY`, `OWNER_PASSWORD`, `IRON_SESSION_PASSWORD`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `IP_HASH_SALT` |
| 4 | No secrets in commit history | `git log -p --follow -- .env*` — no real key values |
| 5 | Zod used in POST handler | `grep -n "NewCommentSchema.safeParse" pages/api/comments/index.ts` — appears before any DB call |
| 6 | Rate limit before email | Read `pages/api/comments/index.ts` — `checkRateLimit()` above `notifyOwnerOfComment()` |
| 7 | DELETE calls `isOwner()` first | Read `pages/api/comments/[id].ts` |
| 8 | Iron Session cookie flags | `lib/auth.ts` sets `cookieOptions: { httpOnly: true, secure: true, sameSite: "lax" }` |
| 9 | No `innerHTML` in CommentItem | `grep -n "innerHTML" components/comments/CommentItem.js` — zero |
| 10 | Honeypot rejected server-side | POST handler checks `if (req.body.url) return res.status(400)` |
| 11 | `IRON_SESSION_PASSWORD` ≥ 32 bytes | `.env.example` comment + Vercel prod env |
| 12 | No console.log of comment body/author in prod | `grep -rn "console.log" pages/api/comments/ lib/comments/` — review or gate |

### Production Hardening

- Vercel env vars scoped to **Production only** (not Preview/Development). Use sandbox creds for Preview.
- `IRON_SESSION_PASSWORD`: `openssl rand -hex 32`. Don't reuse dev value.
- Rate limit start: 5 POST/IP/60s.
- Verify Resend sending domain (not `onboarding@resend.dev`).
- Confirm migration applied to **production** Postgres.
- Privacy notice sentence below the form.

### Explicitly NOT Blocking

- CAPTCHA (honeypot + rate limit sufficient)
- Comment moderation queue / approval workflow
- Automated retention / GDPR pipeline
- Penetration test or third-party review

### Post-Launch Monitoring

- Vercel log filter: `status:429` on `/api/comments`
- Resend bounce/complaint alerts (dashboard)
- Vercel function duration alert on `/api/comments` (P95)
- Manual log review weekly for first month

Skip: SIEM, automated anomaly detection, dedicated uptime monitoring.

---

## QA Test Plan

### Test Pyramid

| Layer | Runner | Count | Scope |
|---|---|---|---|
| Unit | Vitest (devDep) | ~35 | Pure functions: `hasLinks`, `containsProfanity`, Zod schema, `isOwner`, pagination math |
| API integration | Vitest + `node-mocks-http` | ~20 | Next.js API handlers called in-process; DB stubbed |
| E2E (Playwright) | Existing | ~12 | Full user journeys, API stubbed via `page.route()` |

**Why Vitest:** ~200 ms cold-start, zero config in Next.js/ESM, same `describe`/`expect` API as Jest.
**Why not supertest:** Pages Router API routes are plain Node functions — import directly, use `node-mocks-http`.

### Unit Test Inventory

**`tests/unit/hasLinks.test.js`** (~13 cases) — covers `https://`, `http://`, `www.`, bare TLDs (`.com`/`.io`/`.co`/`.dev`), false positive of `.csv`, empty string, max-length non-link, intentional flags (`home.com`), known gap of obfuscated URLs (`hxxps://`) as `test.skip` with comment.

**`tests/unit/containsProfanity.test.js`** (~7 cases) — clean text, known slur from library's own tests, **Scunthorpe** false-positive check, case variants, empty string, profanity in long sentence, l33t-speak (document gap if uncovered). Import slurs from `tests/fixtures/profanity-words.js`, never hardcode.

**`tests/unit/schema.test.js`** (~15 cases) — boundary lengths (1000, 1001 chars; 60, 61 chars), empty/whitespace-only body, missing fields, link refinement (https + bare TLD), unknown fields stripped.

**`tests/unit/isOwner.test.js`** (5 cases) — valid session, wrong value, absent header, env var unset (must not throw), empty string.

### API Integration Tests — `tests/integration/comments-api.test.js`

Use `vi.mock("../../lib/comments/db.js")` and `vi.mock("../../lib/mail.js")`.

**GET /api/comments/[postId]:** valid postId with N comments (200), empty (200, []), pagination (`?page=2`), missing postId (400), wrong method (405).

**POST /api/comments:** happy path (201, `notifyOwner` called), missing body (400), link in body (422 `LINKS`), profanity (422 `PROFANITY`), over-length (413), oversized author (400), **honeypot populated → 200 with silent discard** (do not 422 — bots must not learn the honeypot exists), rate limit exceeded (429 + `Retry-After`), DB throws (500), mail throws after successful insert (still 201 — email failure must not fail submission).

**DELETE /api/comments/[id]:** authenticated owner (200), no auth (401), comment not found (404), non-UUID (400), wrong method (405).

### Playwright E2E — `tests/comments.spec.js`

Match existing conventions: `http://localhost:3000`, `data-testid` selectors. **Stub `**/api/comments/**` via `page.route()` before `page.goto()` — never hit real DB.**

| ID | Scenario |
|---|---|
| CMT-E2E-01 | Submit valid comment → appears in list, form resets, `role="status"` present |
| CMT-E2E-02 | Submit with URL → `role="alert"` link-rejected, comment not added, fields retained |
| CMT-E2E-03 | Submit with profanity → `role="alert"`, not added |
| CMT-E2E-04 | Submit empty form → client `role="alert"` fires, network not called |
| CMT-E2E-05 | Show more pagination → 7 stub comments, 5 shown, "Show 2 more" → loads remaining → button disappears |
| CMT-E2E-06 | ≤ 5 comments → no Show more button |
| CMT-E2E-07 | Owner delete flow → confirm row → fade-out → `role="status"` |
| CMT-E2E-08 | Non-owner sees no delete buttons (`data-testid="delete-comment"` absent) |
| CMT-E2E-09 | Dark mode contrast smoke — `toBeVisible()` only (don't assert colour values; Chromium serialises OKLCH as `lab()`) |
| CMT-E2E-10 | iPad Mini portrait `setViewportSize({width: 768, height: 1024})` — no horizontal scroll |
| CMT-E2E-11 | Loading skeleton shown while fetch resolves (slowed stub) |
| CMT-E2E-12 | Server error 500 → `role="alert"` "Something went wrong" |

### Test Data Strategy

- Unit: no DB.
- API integration: `vi.mock` the DB layer.
- One optional smoke test (`tests/integration/comments-db-smoke.test.js`) gated on `TEST_DATABASE_URL`. Uses schema `test_comments` separate from `public`. Wrap each test in a transaction rolled back in `afterEach`.
- E2E: always mock via `page.route()`.
- For any real inserts, prefix postId with `test-`. Cleanup: `DELETE FROM comments WHERE post_id LIKE 'test-%'`.

### Deliberately NOT Automated

- Real Resend email delivery (manual once at sign-off)
- Upstash rate limiting under real concurrency (manual `wrk`/`hey` pre-launch)
- Postgres connection pool exhaustion
- Magic-link delete token expiry
- GDPR deletion request workflow
- Cross-browser visual regression (Chromium only; add Firefox/WebKit only if required)

### CI Integration

Existing `.github/workflows/tests.yml` has only Playwright. Add to the same job:

```yaml
- name: Run unit tests
  run: npm run test:unit
```

| Gate | Runs on | Blocks merge? |
|---|---|---|
| Unit tests | Every push, every PR | Yes |
| API integration tests | Every push, every PR | Yes |
| Playwright E2E | Every push, every PR | Yes |
| Real-DB smoke | Nightly only (`.github/workflows/db-smoke.yml`, requires `TEST_DATABASE_URL` secret) | No — advisory |
| Manual smoke (Resend, rate-limit burst) | Pre-launch + after mail/rate-limit config change | Manual checklist in PR |

### Files to Create

- `tests/unit/hasLinks.test.js`
- `tests/unit/containsProfanity.test.js`
- `tests/unit/schema.test.js`
- `tests/unit/isOwner.test.js`
- `tests/integration/comments-api.test.js`
- `tests/integration/comments-db-smoke.test.js` (optional, env-gated)
- `tests/comments.spec.js` (Playwright)
- `.github/workflows/db-smoke.yml`
- `tests/fixtures/profanity-words.js`
