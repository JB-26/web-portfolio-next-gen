# Comments Feature — Phase 6 Implementation Plan (Polish & Launch)

> **Status:** Planning. Phases 1–5 merged to `main` via PR #87.  
> **Goal:** Harden, instrument, and verify the comments feature before actively promoting it.

---

## Out of Scope for Phase 6

The following items will not be implemented in Phase 6 and should not be reopened without a new planning session:

- Threaded replies / nested comments
- Comment editing by the author
- Upvotes / reactions
- Markdown or rich-text formatting in comments
- Commenter email notifications
- Moderation queue / approval workflow
- CAPTCHA (honeypot + rate limiting is sufficient at this traffic level)
- Automated GDPR data-retention pipeline (manual retention is acceptable)
- Multi-user admin authentication
- Comment search or filtering

---

## Dependency Graph

The six sub-tasks have the following ordering constraints. Tasks on the same level can be dispatched to implementation agents in parallel.

```
Wave 1 (parallel, no dependencies on each other)
  ├── 6A — Privacy notice copy audit
  ├── 6B — IP hashing verification
  └── 6F — Final security review (read-only audit — no code changes)

Wave 2 (depends on 6B completing, parallel otherwise)
  ├── 6C — Error boundary (depends on nothing, but schedule after 6A so
  │         the boundary wraps the final privacy copy)
  └── 6D — Analytics events (instruments existing code, no dependencies)

Wave 3 (depends on 6A, 6C, 6D being done so E2E tests the finished state)
  └── 6E — Playwright E2E expansion
```

**Critical path:** 6A → (6C, 6D) → 6E.  
**6B** and **6F** are independently parallelisable and should land before 6E to be covered by tests and the final checklist respectively.

---

## 6A — Privacy Notice Copy Audit

### What Was Shipped

`CommentForm.js` line 229 currently renders:

```
Comments are public. Your name will be shown; don't include
personal info you wouldn't put online.
```

This appears above the form, styled `font-bold text-sm text-gray-600 dark:text-slate-400`.

### Acceptance Criteria

- [ ] The privacy notice is present and visible above the form in the rendered page.
- [ ] The copy accurately states what is collected (name, comment text) and what is **not** stored (IP address, email).
- [ ] The notice does not over-promise on retention (no "your comment will be deleted after X days" unless a retention policy exists).
- [ ] The copy is truthful: IPs are never written to the `comments` table (confirmed in 6B); no email column exists in the schema.
- [ ] Passes WCAG AA contrast in both light and dark mode (the existing Tailwind classes are already verified; no change needed unless copy wrapping is affected).

### Findings from Code Review

The current schema (`lib/comments/db.ts`) inserts only `post_id`, `author`, and `body`. No email column, no IP column. The rate limiter in `lib/rateLimit.ts` hashes the IP before it touches Upstash Redis and never writes it to Postgres. This means:

- The copy can truthfully state that IP addresses are not stored.
- The copy should note that comments are permanently public until manually removed.

### Recommended Revised Copy

```
Comments are public and permanent. Your display name will be visible to
all readers. No email address or IP address is stored.
```

This is tighter and removes the somewhat paternalistic "don't include personal info" framing while being factually more precise.

### Files to Change

**`components/comments/CommentForm.js`** — update the `<p>` at line 229:

```diff
-        <p className="font-bold text-sm text-gray-600 dark:text-slate-400 mb-3">
-          Comments are public. Your name will be shown; don&apos;t include
-          personal info you wouldn&apos;t put online.
-        </p>
+        <p className="text-sm text-gray-600 dark:text-slate-400 mb-3">
+          Comments are public and permanent. Your display name will be visible
+          to all readers. No email address or IP address is stored.
+        </p>
```

Note: also drop `font-bold` — bold weight on a disclaimer reads as a warning label, which is heavier than needed.

### Risk / Trade-offs

- **Why change at all?** The original copy implies the site collects personal info and asks users to self-censor. The revised copy is simply more accurate.
- **Why not a full privacy policy page?** This is a personal blog with minimal PII. A linked policy page would be overkill and introduce maintenance burden. The inline sentence is proportionate. Revisit only if the site receives significant international traffic or if the privacy posture changes.

### Dependencies

None. Can land independently.

### Rollout Notes

No env vars needed. No Vercel config changes. Update the privacy copy in `CommentForm.js` and redeploy.

---

## 6B — IP Hashing Verification

### What Was Shipped

Phase 5 introduced `lib/ipHash.ts` (HMAC-SHA256, keyed on `IP_HASH_SALT`) and wired it into `lib/rateLimit.ts`. The rate limiter keys Redis entries on `hashIp(extractClientIp(req))`. The `comments` table schema has no IP column. The `db.insert()` function takes a `NewCommentInput` (`postId`, `author`, `body`) and writes nothing else.

### Finding: Raw IPs Never Reach the `comments` Table

The `comments` table (defined in `lib/comments/db.ts`) contains:

```
id, post_id, author, body, created_at, status
```

No `ip` or `ip_hash` column exists. The `db.insert()` call only receives `postId`, `author`, and `body`. Raw IPs are not stored in Postgres at all — this is the better outcome.

The IP is used only transiently: extracted from the request in `lib/rateLimit.ts`, hashed immediately, and used as a Redis key. It is not written to any durable store.

### Acceptance Criteria

- [ ] Grep confirms no raw IP write path exists in the codebase.
- [ ] The decision not to store IPs (even hashed) in the DB is explicitly documented.
- [ ] `lib/ipHash.ts` doc comment updated to reflect the current reality: IPs touch only Redis (as a hash), never Postgres.

### Verification Commands

Run these before closing 6B:

```bash
# Must return zero results — confirms no raw IP touches any insert call
grep -rn "remoteAddress\|x-forwarded-for\|extractClientIp" pages/api/comments/ lib/comments/

# Must return zero results — confirms no ip column in insert query
grep -n "ip" lib/comments/db.ts
```

### Files to Change

**`lib/ipHash.ts`** — update the module header comment to clarify the current flow:

```diff
- * The caller MUST pass the returned value through `hashIp`
- * before writing it anywhere durable — this module cannot enforce that.
+ * The current implementation does NOT write IP data (raw or hashed) to
+ * Postgres. IPs are used only transiently as Upstash Redis keys (always
+ * hashed). This is a deliberate privacy decision documented in the Phase 6
+ * plan. If a future phase adds IP data to the DB for abuse investigation,
+ * it must use `hashIp` and must update this comment.
```

No schema change, no migration, no new env vars. This is a documentation-only task.

### Risk / Trade-offs

- **Not storing hashed IPs in DB** means we cannot retrospectively investigate abuse patterns. For a personal blog at low traffic this is an acceptable trade-off; the rate limiter handles live abuse.
- **If abuse volume increases**, adding an `ip_hash` column to `comments` would be a small migration. The `hashIp` function is already in place to do so safely.

### Dependencies

None. Can land independently.

### Rollout Notes

Documentation update only. No deployment impact.

---

## 6C — Error Boundary

### What Was Shipped

`CommentsSection.js` already contains a fully functional React error boundary class (`CommentErrorBoundary`) that wraps `CommentsSectionInner`. It catches render-phase errors, logs them via `console.error`, and renders a fallback `role="alert"` paragraph.

```js
class CommentErrorBoundary extends Component {
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(err, info) { console.error("[CommentsSection] render error", err, info); }
  render() { /* fallback or children */ }
}
```

`CommentsSection` exports the boundary-wrapped component. The call site in `pages/posts/[id].js` uses `dynamic(import, { ssr: false })`, so the boundary is already in the lazy-loaded bundle.

### Finding: This Sub-task Is Already Complete

The error boundary from the implementation plan is implemented. The code matches the specified behaviour (class-based, fallback alert, `componentDidCatch` logging).

### Acceptance Criteria (Verification Only)

- [ ] `CommentsSection.js` exports a component whose root is `<CommentErrorBoundary>`.
- [ ] `CommentErrorBoundary` renders `role="alert"` on error (not a blank section).
- [ ] No `react-error-boundary` package was introduced (class-based boundary was used as specified — no new dependency).
- [ ] A thrown error inside `CommentsSection` does not surface a Next.js error overlay in production (boundary catches it).

### Files to Change

None required. The boundary is already implemented.

**Optional hardening:** Add a `data-testid="comments-error"` attribute to the fallback paragraph so Playwright can assert on it in a future error-injection test:

```diff
- <p role="alert" className="text-red-600 dark:text-red-400 text-base py-4">
+ <p role="alert" data-testid="comments-error" className="text-red-600 dark:text-red-400 text-base py-4">
```

### Risk / Trade-offs

- **Class component vs react-error-boundary:** We used a class component. This is the correct choice — it avoids an extra dependency, is fully supported, and this component has no other reason to be a hooks component.
- **Boundary granularity:** The boundary wraps the entire section. An alternative is a finer-grained boundary around only the list vs. the form. For a personal blog this granularity is sufficient; recovering the whole section on error is fine.

### Dependencies

None.

### Rollout Notes

No env vars. If the optional `data-testid` is added, ensure the 6E Playwright tests reference it.

---

## 6D — Analytics Events

### What Was Shipped

All three planned analytics events are already wired:

| Event | Call site | Status |
|---|---|---|
| `comment_submitted` | `CommentForm.js` line 163: `track("comment_submitted")` | Shipped |
| `comment_load_more` | `CommentList.js` line 54: `track("comment_load_more")` | Shipped |
| `comment_deleted` | `CommentsSection.js` line 127: `track("comment_deleted")` | Shipped |

`@vercel/analytics` is imported via `{ track }` in each component. `Analytics` is mounted in `pages/_app.js`.

### Finding: Analytics Implementation Is Already Complete

All three events specified in the implementation plan are live. No PII is included in any event property (no author name, no comment body, no IP, no email address in any `track()` call).

### Acceptance Criteria (Verification Only)

- [ ] `grep -rn "track(" components/comments/` returns all three call sites.
- [ ] No event call passes PII as a property (grep for `.author`, `.body`, `.email` inside `track()` calls).
- [ ] `@vercel/analytics` is listed in `package.json` dependencies (not devDependencies).
- [ ] The Vercel Analytics dashboard (post-deploy) shows events arriving for each type after manual smoke test.

### Proposed Event Property Schema (Confirmed No PII)

For future reference, these are the exact shapes emitted:

```js
track("comment_submitted")    // no properties — count is the signal
track("comment_load_more")    // no properties — count is the signal
track("comment_deleted")      // no properties — count is the signal
```

Adding a `postId` property would be non-PII and could be useful for identifying which posts generate the most engagement. This is **optional** and deferred — adding it would require passing `postId` into `CommentList` and surfacing it in the `CommentsSection.handleDelete` closure. Log this as a future enhancement, not a Phase 6 blocker.

### Files to Change

None required.

**Optional enhancement (not a blocker):** Add `postId` as a non-PII event property. If desired:

```diff
// CommentsSection.js — pass postId into track calls
- track("comment_deleted");
+ track("comment_deleted", { postId });

// CommentForm.js — postId is already a prop
- track("comment_submitted");
+ track("comment_submitted", { postId });

// CommentList.js — requires postId prop to be threaded down from CommentsSection
- track("comment_load_more");
+ track("comment_load_more", { postId });
```

If you add `postId`, verify it is the post slug (not a database UUID) — slugs are public and non-PII.

### Risk / Trade-offs

- **No properties vs. postId:** Zero-property events are safe but produce only aggregate counts in the Vercel dashboard. Adding `postId` gives per-post funnel data. At current traffic levels, aggregate counts are sufficient.
- **Analytics blocking:** `@vercel/analytics` uses a non-blocking pattern; `track()` is fire-and-forget and does not delay the UI interaction.

### Dependencies

None.

### Rollout Notes

No env vars. Analytics events only activate on Vercel deployments (the `Analytics` component in `_app.js` no-ops locally).

---

## 6E — Playwright E2E Expansion

### What Was Shipped

`tests/comments.spec.js` contains 12 scenarios (CMT-E2E-01 through CMT-E2E-12) covering:
- Valid comment submit, link rejection, profanity rejection, empty-form validation
- Pagination (show more), non-owner view, owner delete flow
- Dark mode smoke, iPad Mini viewport, loading skeleton, server 500

### Gap Analysis

Cross-referencing the shipped spec against the Phase 6 requirements:

| Scenario | Shipped? | Notes |
|---|---|---|
| Happy path submit | Yes (CMT-E2E-01) | |
| Rate-limit UI (429 + countdown) | No | Missing |
| Owner auth login flow | No | Missing |
| Delete-by-token flow | No | Missing |
| Owner sentinel cookie cleared on logout | No | Missing |
| Error boundary fallback render | No | Optional, needs `data-testid` from 6C |

### New Test Cases to Add

Add to `tests/comments.spec.js` (or a new `tests/comments-advanced.spec.js` if the existing file becomes unwieldy):

---

#### CMT-E2E-13: Rate limiting — 429 response triggers countdown UI

```js
test("CMT-E2E-13: 429 response → rate-limit alert with countdown shown", async ({ page }) => {
  // Stub GET
  await page.route(`**/api/comments?**`, (route) => {
    route.fulfill({ status: 200, contentType: "application/json",
      body: JSON.stringify({ comments: [], total: 0 }) });
  });
  // Stub POST to return 429 with Retry-After
  await page.route(`**/api/comments`, (route) => {
    if (route.request().method() === "POST") {
      return route.fulfill({
        status: 429,
        headers: { "Retry-After": "30" },
        contentType: "application/json",
        body: JSON.stringify({
          error: { code: "RATE_LIMIT", message: "Too many comments submitted." }
        }),
      });
    }
    route.continue();
  });

  await page.goto(POST_URL);
  await expect(page.locator('[data-testid="comment-form"]')).toBeVisible();

  await page.fill('[data-testid="comment-form"] input[name="author"]', "Alice");
  await page.fill('[data-testid="comment-form"] textarea[name="body"]', "Valid comment");
  await page.click('[data-testid="submit-comment"]');

  // Rate-limit alert should be visible with countdown text
  const alert = page.locator('[role="alert"]', { hasText: "Too many" });
  await expect(alert).toBeVisible();

  // Submit button should be disabled during rate-limit window
  await expect(page.locator('[data-testid="submit-comment"]')).toBeDisabled();
});
```

---

#### CMT-E2E-14: Owner auth login → sentinel cookie set → delete buttons appear

```js
test("CMT-E2E-14: owner login sets sentinel cookie → delete buttons visible", async ({ page }) => {
  const comment = makeComment({ id: "auth-test" });
  await stubComments(page, { comments: [comment] });

  // Stub the login endpoint to set the sentinel cookie
  await page.route(`**/api/auth/login`, (route) => {
    return route.fulfill({
      status: 200,
      headers: {
        // Simulate the sentinel cookie being set by the server
        "Set-Cookie": "owner_ui=1; Path=/; SameSite=Lax",
      },
      contentType: "application/json",
      body: JSON.stringify({ ok: true }),
    });
  });

  await page.goto(POST_URL);
  await expect(page.locator('[data-testid="comment-form"]')).toBeVisible();

  // Before login: no delete buttons
  await expect(page.locator('[data-testid="delete-comment"]')).toHaveCount(0);

  // Simulate login by setting the cookie directly (equivalent to the login flow)
  await page.addInitScript(() => {
    document.cookie = "owner_ui=1; path=/";
  });
  // Reload so useEffect picks up the new cookie
  await page.reload();

  await expect(page.locator('[data-testid="comment-form"]')).toBeVisible();
  await expect(page.locator('[data-testid="delete-comment"]')).toHaveCount(1);
});
```

---

#### CMT-E2E-15: Delete-by-token page — valid token shows comment preview, confirm deletes

The delete-by-token flow uses `/owner/comments/delete?token=...` (a page added in Phase 5). This test exercises that page directly.

```js
test("CMT-E2E-15: delete-by-token page — valid token shows preview and confirms deletion", async ({
  page,
}) => {
  const TOKEN = "valid.token.stub";
  const COMMENT_ID = "deadbeef-0000-0000-0000-000000000001";

  // Stub the token verification API (or the page's getServerSideProps equivalent)
  // The exact route depends on the Phase 5 implementation — check
  // pages/owner/comments/delete.js to confirm the fetch URL.
  await page.route(`**/api/owner/delete-by-token**`, (route) => {
    if (route.request().method() === "POST") {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ ok: true }),
      });
    }
    if (route.request().method() === "GET") {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          comment: makeComment({ id: COMMENT_ID, author: "Bob", body: "Test body" }),
        }),
      });
    }
    route.continue();
  });

  await page.goto(`${BASE_URL}/owner/comments/delete?token=${TOKEN}`);

  // Should show the comment preview
  await expect(page.locator('[data-testid="delete-preview"]')).toBeVisible();
  await expect(page.locator('[data-testid="delete-preview"]')).toContainText("Bob");

  // Click confirm
  await page.click('[data-testid="confirm-token-delete"]');

  // Should navigate to or show a success state
  await expect(page.locator('[data-testid="delete-success"]')).toBeVisible();
});
```

**Note:** The exact `data-testid` attributes for the delete-by-token page need to be verified against the Phase 5 implementation in `pages/owner/`. If those `data-testid` attributes are missing from the page, add them as part of this task (not a separate phase).

---

#### CMT-E2E-16: Cancel delete — focus returns to delete button

```js
test("CMT-E2E-16: cancel inline delete — focus returns to delete button", async ({ page }) => {
  const comment = makeComment({ id: "focus-test" });
  await stubComments(page, { comments: [comment] });

  await page.addInitScript(() => {
    document.cookie = "owner_ui=1; path=/";
  });

  await page.goto(POST_URL);
  await expect(page.locator('[data-testid="delete-comment"]')).toBeVisible();

  // Open confirm
  await page.click('[data-testid="delete-comment"]');
  const cancelBtn = page.locator('button', { hasText: "Cancel" }).first();
  await expect(cancelBtn).toBeVisible();

  // Cancel
  await cancelBtn.click();

  // Confirm row should disappear
  await expect(cancelBtn).not.toBeVisible();

  // Focus should be back on the delete button
  const deleteBtn = page.locator('[data-testid="delete-comment"]').first();
  await expect(deleteBtn).toBeFocused();
});
```

### Acceptance Criteria

- [ ] All 12 existing CMT-E2E-01 through -12 pass against `localhost:3000`.
- [ ] CMT-E2E-13 (rate limit countdown) passes.
- [ ] CMT-E2E-14 (owner sentinel cookie) passes.
- [ ] CMT-E2E-15 (delete-by-token) passes — requires `data-testid` attributes on the `/owner/comments/delete` page to be confirmed or added.
- [ ] CMT-E2E-16 (cancel focus management) passes.
- [ ] No test hits the real database (all API calls stubbed via `page.route()`).
- [ ] All tests run against `http://localhost:3000` with dev server running (existing convention).

### Files to Change

- **`tests/comments.spec.js`** — append CMT-E2E-13, -14, -16.
- **`tests/comments-advanced.spec.js`** (new, optional) — CMT-E2E-15 (delete-by-token) if the file grows large.
- **`pages/owner/comments/delete.js`** (or `.tsx`) — add `data-testid="delete-preview"`, `data-testid="confirm-token-delete"`, `data-testid="delete-success"` if they are missing.

### Risk / Trade-offs

- **Stubbing vs. real flows:** CMT-E2E-14 simulates the login by directly setting the cookie rather than driving through the login UI. This is intentional — the login form is an admin-only page and its own test scope. What we care about here is that the sentinel cookie correctly gates the delete button UI.
- **CMT-E2E-15 dependency on Phase 5 page structure:** The delete-by-token page was built in Phase 5. If `data-testid` attributes are missing, this test requires a minor code change to that page. Treat it as part of this task.

### Dependencies

- 6C (error boundary `data-testid`) for any error-boundary test.
- 6D analytics events are already shipped, so no dependency there.
- Phase 5's `/owner/comments/delete` page must exist (it does — it was part of Phase 5).

### Rollout Notes

No env vars. No deployment changes. Tests run locally before merge. Add to the CI job per the existing convention in `.github/workflows/`.

---

## 6F — Final Security Review

### Scope

This is a read-only audit pass — no code changes unless a blocker is found. The Phase 5 audit closed all Critical and High findings. Phase 6's audit verifies that the complete assembled system (all phases together, including the Phase 5 additions of Upstash, Resend, and HMAC delete tokens) has no regressions and confirms the overall posture before active promotion.

### Checklist

Run each check in order. Mark pass/fail.

#### Group 1 — Data Handling

| # | Check | Command | Pass condition |
|---|---|---|---|
| D-1 | No raw IP in DB | `grep -rn "remoteAddress\|x-forwarded-for\|extractClientIp" lib/comments/ pages/api/comments/` | Zero results |
| D-2 | No raw IP in Redis key | Read `lib/rateLimit.ts` — `checkLimit()` must call `hashIp()` before `ratelimiter.limit()` | `hashIp` call precedes `limit()` call |
| D-3 | No IP column in insert query | `grep -n "ip" lib/comments/db.ts` | Zero results matching a column name |
| D-4 | Comment body stored post-sanitisation | Read `pages/api/comments/index.ts` — `db.insert()` receives `parsed.data.body` (Zod-parsed) | Zod parse precedes `db.insert()` |
| D-5 | No email stored | `grep -n "email" lib/comments/db.ts lib/comments/types.ts` | Zero results in `db.ts`; `types.ts` may reference it only in comments |

#### Group 2 — Input Handling

| # | Check | Command | Pass condition |
|---|---|---|---|
| I-1 | No `dangerouslySetInnerHTML` in comment components | `grep -rn "dangerouslySetInnerHTML" components/comments/` | Zero results |
| I-2 | Link rejection is server-authoritative | Read `pages/api/comments/index.ts` — Zod schema with `URL_RE` refine runs server-side | Present |
| I-3 | Profanity check before insert | Read `pages/api/comments/index.ts` — `containsProfanity()` called before `db.insert()` | Correct order |
| I-4 | Body length cap enforced server-side | `grep -n "max(1000)" lib/comments/schema.ts` | Present |
| I-5 | Honeypot checked before Zod parse | Read `pages/api/comments/index.ts` — `body.url` check in step 2, Zod in step 3 | Correct order |
| I-6 | Parameterised queries only | `grep -n "sql\`" lib/comments/db.ts` — all DB calls use tagged template literals | Present; no string concatenation |

#### Group 3 — Auth & Session

| # | Check | Command | Pass condition |
|---|---|---|---|
| A-1 | DELETE requires owner session | Read `pages/api/comments/[id].ts` — `session.isOwner !== true` check before UUID parse | Present |
| A-2 | Origin check on DELETE | `grep -n "verifyOrigin" pages/api/comments/[id].ts` | Present |
| A-3 | CSRF check on DELETE | `grep -n "verifyCsrf" pages/api/comments/[id].ts` | Present |
| A-4 | No localStorage auth | `grep -rn "localStorage" lib/ pages/api/` | Zero results |
| A-5 | Iron Session cookie flags | Read `lib/auth.ts` — `httpOnly: true, secure: true, sameSite: "lax"` | All three present |
| A-6 | `IRON_SESSION_PASSWORD` ≥ 32 chars | Check `.env.example` comment and Vercel prod env | Min length enforced |
| A-7 | Delete-by-token uses `timingSafeEqual` | Read `lib/deleteToken.ts` | `crypto.timingSafeEqual` present |
| A-8 | Delete token expiry AND signature both checked | Read `lib/deleteToken.ts` `verifyDeleteToken` | Both checks unconditional (no early return before sig compare) |

#### Group 4 — Rate Limiting & Spam

| # | Check | Command | Pass condition |
|---|---|---|---|
| R-1 | Rate limit checked FIRST in POST handler | Read `pages/api/comments/index.ts` — `checkLimit()` is step 1 | Present |
| R-2 | Rate limit fail-open (not fail-closed) | Read `lib/rateLimit.ts` — catch blocks return `{ allowed: true }` | Present (intentional for personal blog) |
| R-3 | `Retry-After` header set on 429 | Read `pages/api/comments/index.ts` — `res.setHeader("Retry-After", ...)` | Present |
| R-4 | `IP_HASH_SALT` minimum length enforced | Read `lib/ipHash.ts` — `MIN_IP_HASH_SALT_LENGTH = 16` | Present |

#### Group 5 — Email

| # | Check | Command | Pass condition |
|---|---|---|---|
| E-1 | Email failure does not fail comment POST | Read `pages/api/comments/index.ts` — `notifyOwnerOfComment` in try/catch, 201 still returned | Present |
| E-2 | No commenter email stored | `grep -rn "email" lib/comments/` | Zero results for a stored field |
| E-3 | Email uses Resend SDK (not raw SMTP construction) | Read `lib/mail.ts` — Resend client used | Present |
| E-4 | Rate limit runs before email call | Read `pages/api/comments/index.ts` — `checkLimit()` in step 1, email in step 6 | Correct order |

#### Group 6 — Secrets & Config

| # | Check | Command | Pass condition |
|---|---|---|---|
| S-1 | All secrets in `.env.example` with placeholder values | `cat .env.example` — all vars listed | Present |
| S-2 | No secrets in git history | `git log -p --follow -- .env*` | No real key values |
| S-3 | Vercel env var scoping | Vercel dashboard — `DATABASE_URL`, `RESEND_API_KEY`, `OWNER_PASSWORD`, `IRON_SESSION_PASSWORD` scoped to Production only | Confirmed in dashboard |
| S-4 | `DELETE_TOKEN_SECRET` ≥ 32 chars | Read `lib/deleteToken.ts` `MIN_SECRET_LENGTH` | 32 |

#### Group 7 — Analytics PII

| # | Check | Command | Pass condition |
|---|---|---|---|
| P-1 | No PII in track() calls | `grep -n "track(" components/comments/` — review each call site | No `.author`, `.body`, `.email`, IP in properties |

### Findings Format

For any item that does not pass, record:

```
[CHECK ID] — FAIL
Location: <file>:<line>
Issue: <one sentence>
Remediation: <one sentence>
Blocking? Yes/No
```

Phase 6 ships only after all items marked "Blocking" are resolved. Items marked "No" can be tracked as follow-up issues.

### Acceptance Criteria

- [ ] All "Blocking" checks pass.
- [ ] Findings documented in a comment on the Phase 6 PR.
- [ ] No new Critical or High findings versus the Phase 5 audit baseline (0C/0H).

### Files to Change

None unless a blocker is found. If a blocker is found, the remediation is scoped to the specific file identified.

### Dependencies

- 6B must complete first (IP hashing verification is an input to checks D-1 through D-3).
- Should be run after 6A, 6C, and 6D land so the audit covers the final state of all files.

### Rollout Notes

No env vars. No deployment changes. This is a pre-merge gate.

---

## Summary: What Each Wave Delivers

| Wave | Tasks | Deliverable |
|---|---|---|
| 1 | 6A, 6B, 6F (start) | Accurate privacy copy; IP handling formally verified and documented; security audit in progress |
| 2 | 6C (verify + optional testid), 6D (verify) | Error boundary confirmed with testable attribute; analytics confirmed clean |
| 3 | 6E, 6F (complete) | Full E2E suite covering rate limiting, auth flow, token delete, focus management; security audit signed off |

After Wave 3: merge to `main`, deploy to Vercel production, run manual smoke tests (submit a real comment, receive the Resend notification, click the one-click delete token link, verify the Vercel Analytics dashboard shows events), then promote the feature.

---

## Environment Variables — Final Inventory

All of these must be set in Vercel (Production scope) before promotion:

| Variable | Purpose | Phase introduced |
|---|---|---|
| `DATABASE_URL` | Neon Postgres connection string | 1 |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis endpoint | 5 |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis auth token | 5 |
| `RESEND_API_KEY` | Resend transactional email | 5 |
| `OWNER_NOTIFY_EMAIL` | Address to receive notifications | 5 |
| `OWNER_FROM_EMAIL` | Verified Resend sender address | 5 |
| `OWNER_PASSWORD` | Iron Session login password (≥ 32 chars) | 3 |
| `IRON_SESSION_PASSWORD` | Iron Session cookie encryption key (≥ 32 chars) | 3 |
| `IP_HASH_SALT` | HMAC salt for IP anonymisation (≥ 16 chars) | 5 |
| `DELETE_TOKEN_SECRET` | HMAC key for one-click delete tokens (≥ 32 chars) | 5 |
| `NEXT_PUBLIC_SITE_URL` | Canonical origin for CSRF origin check | 3 |

No new env vars are introduced in Phase 6.
