# Comments Feature — Phase 6 QA Plan

**Phase 6 scope:** Privacy notice copy, IP hashing verification, React error boundaries, Vercel Analytics events, full Playwright E2E coverage, pre-launch security review.

**Goal:** "I'm comfortable leaving this running unattended on `main` for months."

---

## 1. Coverage Gap Analysis

### What exists today

**Unit tests** (Vitest, `tests/unit/`) — 7 files, all in good shape:

| File | What it covers |
|---|---|
| `schema.test.js` | `NewCommentSchema` — 15 cases, boundary + link refinement |
| `hasLinks.test.js` | `lib/comments/sanitize.ts` |
| `containsProfanity.test.js` | `lib/comments/profanity.ts` |
| `isOwner.test.js` | `lib/auth.ts` — 6 cases including password-length guard |
| `deleteToken.test.js` | `lib/deleteToken.ts` — 8 cases including oracle-prevention |
| `rateLimit.test.js` | `lib/rateLimit.ts` — 7 cases including fail-open |
| `ipHash.test.js` | `lib/ipHash.ts` — 9 cases |

**Integration tests** (Vitest, `tests/integration/`) — 2 files:

- `comments-api.test.js`: GET-01–05, POST-01–10, DELETE-01–07 — mocks DB, mail, auth, rateLimit
- `comments-api-phase5.test.js`: P5-01–05 — uses real `lib/rateLimit` + `lib/mail`, mocks only external SDKs

**E2E tests** (Playwright, `tests/comments.spec.js`) — 12 scenarios, CMT-E2E-01 through CMT-E2E-12. All API calls are stubbed via `page.route()`.

### Confirmed gaps — what is NOT tested

The following items have zero test coverage and represent launch risk.

**Gap 1 — Analytics events (all three) — CRITICAL**
`track("comment_submitted")` fires in `CommentForm.js` line 163. `track("comment_load_more")` fires in `CommentList.js` line 54. `track("comment_deleted")` fires in `CommentsSection.js` line 127. None are exercised in the E2E suite. A regression here (import removed, call moved into wrong branch) would silently drop analytics without any test catching it. These must be intercepted at the network layer.

**Gap 2 — Character counter live region (aria-live="polite") — HIGH**
`CommentForm.js` lines 362–366 render `<p aria-live="polite">` which only announces at the thresholds 100, 50, 20, and 0. There is no E2E test confirming the threshold logic fires correctly or that the visible counter updates on every keystroke.

**Gap 3 — Honeypot field browser-layer behaviour — HIGH**
POST-07 in the integration suite verifies the server silently discards a filled honeypot. But there is no E2E test verifying the honeypot field is: (a) not visible to real users, (b) not in the tab order, and (c) not filled by the browser's own autofill. A regression in the `sr-only` + `tabIndex={-1}` + `autoComplete="off"` attributes would expose the trap to real users.

**Gap 4 — Rate-limit countdown UI — MEDIUM**
`CommentForm.js` lines 73–87 implement a `retryCountdown` interval that ticks down from `retryAfter` seconds and re-enables the form when it hits zero. No E2E test verifies the countdown renders, decrements, or that the form becomes re-submittable afterwards.

**Gap 5 — Owner login flow (admin page) — HIGH**
`pages/admin.js` has no Playwright tests at all. The owner must log in before the in-page delete UI (CMT-E2E-07) is meaningful in production. There are no tests for wrong password, successful login, cookie set, or the logout path.

**Gap 6 — Token confirmation page (delete-by-token) — HIGH**
`pages/owner/comments/delete.js` has no E2E coverage. The four token states (`VALID`, `EXPIRED`, `BAD_SIGNATURE`, `MALFORMED`) are exercised in unit tests for the library function but the rendered page for each state is never tested. The POST-on-confirm flow (the `handleDelete` function) is completely untested end-to-end.

**Gap 7 — Error boundary — MEDIUM**
`CommentsSection.js` wraps the inner component in `CommentErrorBoundary` (lines 39–67). There is no test confirming that a render error is caught and that the fallback renders without breaking the rest of the post page.

**Gap 8 — Accessibility audit (axe) — HIGH**
No automated accessibility audit runs against the post page with comments visible. The form has `role="alert"`, `aria-describedby`, `aria-live`, `aria-required`, `aria-label` on the delete button, and `role="group"` on the confirm row. Any one of these could be mis-wired without a test catching it.

**Gap 9 — Privacy notice text — LOW**
`CommentForm.js` line 229 renders the privacy notice. No test asserts the text is present. Easy to accidentally delete in a refactor.

**Gap 10 — `api/comments/[id].ts` DELETE route not covered by any E2E — MEDIUM**
CMT-E2E-07 stubs `DELETE /api/comments/delete-me` directly. The real `[id].ts` route handler is exercised by integration tests (with mocked DB) but never by a real HTTP call. There is no test that hits the actual Next.js API route without mocking.

**Gap 11 — `api/owner/delete-by-token.ts` — no integration test using real handler logic**
The route handler in `pages/api/owner/delete-by-token.ts` has no integration test equivalent to the comments-api tests. Token verification and DB calls are only tested in isolation (unit) or end-to-end (page). The middle layer — the route handler receiving a POST with a token — is untested.

**Gap 12 — CI workflow runs Playwright only, not Vitest**
`tests.yml` runs `npx playwright test`. The `npm run test:unit` (Vitest) command is not in the workflow. Unit + integration tests only run locally.

---

## 2. Phase 6 E2E Test Plan

The following 20 tests complete the suite to launch quality. They are authored in `tests/comments.spec.js` as additional scenarios extending CMT-E2E-01 through CMT-E2E-12.

All new tests follow the existing conventions: `page.route()` stubs before `page.goto()`, `data-testid` selectors, `POST_SLUG = "2025-01-30-scrum"`.

---

### Tabular test plan

| ID | Description | Preconditions → Actions → Assertions | Data setup / teardown | Phase feature | Priority |
|---|---|---|---|---|---|
| **CMT-E2E-13** | Character counter updates on every keystroke | Stub GET (empty), navigate to post. Focus body textarea. Type 900 characters one keystroke at a time (use `fill` for speed). | `page.route` GET stub; no DB | Phase 1 form UX | P1 |
| | | Assert visible counter shows "100 remaining". Type 50 more characters. Assert counter shows "50 remaining" with neutral style. Type 30 more. Assert counter shows "20 remaining" with red style. | None | | |
| **CMT-E2E-14** | Character counter polite live region announces at thresholds | Stub GET (empty), navigate to post. Fill body to reach exactly 900 chars (100 remaining). | `page.route` GET stub; no DB | Phase 6 a11y | P1 |
| | | Assert `[aria-live="polite"].sr-only` contains "100 characters remaining". Fill to 950 (50 remaining). Assert the live region now reads "50 characters remaining". Verify visible counter `#body-char-count` also updates. | None | | |
| **CMT-E2E-15** | Honeypot field is invisible and removed from tab order | Stub GET (empty), navigate to post. | `page.route` GET stub; no DB | Phase 1 security | P1 |
| | | Assert `input[name="url"]` is attached to DOM. Assert `input[name="url"]` has `tabIndex` of `-1` (via `getAttribute`). Assert `input[name="url"]` is NOT visible (`.isVisible()` returns false). Assert `autoComplete` attribute is `"off"`. Fill author + body. Tab through the form. Assert focus never lands on the url field. | None | | |
| **CMT-E2E-16** | Honeypot filled → server 200 silent discard, no comment added | Override POST stub to return 200 with no `comment` body (mirroring server behaviour for honeypot). Directly set `input[name="url"]` value via `page.evaluate`. Submit form with author + body. | `page.route` GET + POST stubs | Phase 1 security | P0 |
| | | Assert `[data-testid="comment-item"]` count remains 0. Assert no `role="status"` success announcement. Assert no `role="alert"` error. | None | | |
| **CMT-E2E-17** | Rate-limit 429 → alert with countdown, form disabled, re-enables after countdown | Override POST stub to return 429 with `Retry-After: 3` header and `{ error: { code: "RATE_LIMIT" } }`. Fill author + body. Submit. | `page.route` GET + POST stubs | Phase 5 rate limiting | P0 |
| | | Assert `role="alert"` visible with "Too many submissions" text. Assert countdown element renders (text includes "s"). Assert submit button is disabled. Wait 4 seconds. Assert submit button is no longer disabled. Assert `role="alert"` has disappeared. | No real DB or email | | |
| **CMT-E2E-18** | `comment_submitted` analytics event fires on successful submit | Intercept all outbound requests matching `**/v1/vitals` or `**/api/send-event` with `page.route`. OR use `page.on("request", …)` to capture beacon calls to `va.vercel-insights.com`. Fill author + body. Submit. | `page.route` GET + POST stubs; analytics beacon route intercept | Phase 6 analytics | P1 |
| | | Assert at least one intercepted request body (or URL) contains `"comment_submitted"`. | None | | |
| **CMT-E2E-19** | `comment_load_more` analytics event fires when Show more is clicked | Stub GET with 7 comments. Navigate. Intercept analytics beacons. Click `[data-testid="show-more"]`. | `page.route` GET stub (7 comments); analytics beacon intercept | Phase 6 analytics | P1 |
| | | Assert at least one intercepted request body contains `"comment_load_more"`. Assert all 7 `[data-testid="comment-item"]` are visible. | None | | |
| **CMT-E2E-20** | `comment_deleted` analytics event fires after owner deletes | Stub GET (1 comment), stub DELETE, set `owner_ui=1` cookie, navigate. Intercept analytics beacons. Click delete → confirm. | `page.route` stubs; analytics beacon intercept; cookie | Phase 6 analytics | P1 |
| | | Assert at least one intercepted request body contains `"comment_deleted"`. Assert `[data-testid="comment-item"]` count is 0. | None | | |
| **CMT-E2E-21** | Error boundary: render error in CommentsSection does not break post page | Navigate to post. After mount, use `page.evaluate` to throw an error inside the comments section by removing a required prop or calling a React render helper that throws. | `page.route` GET + POST stubs | Phase 6 error boundary | P0 |
| | | Assert the rest of the post page body content is still visible (e.g. the `<h1>` of the post). Assert `role="alert"` is visible containing "Comments could not be loaded". Assert the comment form is NOT present (the boundary caught the section). | None | | |
| **CMT-E2E-22** | Token confirmation page — valid token shows comment preview and delete button | Stub `GET /api/comments?…` and stub `page.route("**/owner/comments/delete*"…)` — actually this page is server-rendered so navigate to `/owner/comments/delete?token=<valid-token>`. Stub `/api/owner/delete-by-token` to return 200. | Use a freshly-signed token generated server-side OR inject `getServerSideProps` return via route mock for the page itself — see isolation note below. Simpler: navigate to the page with a known-good token and stub only the POST endpoint. | Phase 5 delete-by-token | P0 |
| | | Assert heading "Delete comment" is visible. Assert comment preview card is visible (contains `commentPreview.author` text). Assert "Delete comment" button is enabled. Click it. Assert `role="status"` with "Comment deleted. You can close this tab." is visible. | None | | |
| **CMT-E2E-23** | Token confirmation page — expired token shows error message | Navigate to `/owner/comments/delete?token=<expired-token>`. | Expired token is a token whose timestamp part has been replaced with a past value (or use `signDeleteToken` in a helper script with a backdated system time). | Phase 5 delete-by-token | P0 |
| | | Assert `role="alert"` is visible containing "expired". Assert no comment preview card is rendered. Assert no delete button is rendered. | None | | |
| **CMT-E2E-24** | Token confirmation page — malformed token shows error message | Navigate to `/owner/comments/delete?token=not-a-valid-token`. | No setup needed — the URL itself is the input | Phase 5 delete-by-token | P0 |
| | | Assert `role="alert"` is visible. Assert it does not contain the word "expired" (distinguishable from CMT-E2E-23). Assert no delete button. | None | | |
| **CMT-E2E-25** | Token confirmation page — bad signature shows error message | Navigate to `/owner/comments/delete?token=<tampered-token>` where one segment has been base64url-replaced. | Craft a tampered token in the test itself using `Buffer.from(…).toString("base64url")` | Phase 5 delete-by-token | P1 |
| | | Assert `role="alert"` containing "not valid". Assert no delete button. | None | | |
| **CMT-E2E-26** | Admin login — wrong password shows error, correct password sets cookie | Navigate to `/admin`. Assert password field is focused. Submit with wrong password. | Stub `POST /api/auth/login` to return `401 { error: "Wrong password" }` for the wrong attempt, then `200 { ok: true }` with `Set-Cookie: owner_ui=1` for the correct attempt. | Phase 3 owner auth | P1 |
| | | After wrong password: assert `role="alert"` visible with error text. After correct password (re-fill + submit): assert page shows logged-in state (logout button visible, password form gone). | No real password needed — stubs control the response | | |
| **CMT-E2E-27** | Accessibility audit — post page with comments passes axe-core | Stub GET with 3 comments (including one with a long body). Navigate to post. Wait for `[data-testid="comment-form"]` to be visible. | `page.route` GET stub (3 comments) | Phase 6 a11y | P1 |
| | | Run `@axe-core/playwright` `checkA11y` on the full page. Assert zero violations at impact level `critical` or `serious`. | None — axe scans the live DOM | | |
| **CMT-E2E-28** | Accessibility audit — post page with delete confirm row open | Stub GET (1 comment), set `owner_ui=1` cookie, navigate. Wait for comment. Click `[data-testid="delete-comment"]`. Wait for `[data-testid="confirm-delete"]` to be visible. | `page.route` stub; cookie | Phase 6 a11y | P1 |
| | | Run `checkA11y`. Assert zero critical/serious axe violations. Specifically verify `role="group"` + `aria-label="Confirm deletion"` passes. | None | | |
| **CMT-E2E-29** | Privacy notice text is present above the form | Stub GET (empty), navigate to post. | `page.route` GET stub | Phase 6 privacy notice | P1 |
| | | Assert `[data-testid="comment-form"]` contains text matching "Comments are public". Assert the notice paragraph is visible (not `sr-only`). | None | | |
| **CMT-E2E-30** | Rate-limit e2e — 5 rapid POSTs succeed, 6th returns 429 alert | This test exercises the real API if run against the dev server, which risks sending real emails. **See Section 4 — use `DISABLE_EMAIL=1` env flag.** Stub POST to return 201 for the first 5 calls and 429 (with `Retry-After: 10`) for the 6th call using a stateful counter inside the `page.route` handler. | Stateful `page.route` with a call counter variable in the test closure. No real DB needed. | Phase 5 rate limiting | P0 |
| | | After 5 successful submissions: assert 5 `[data-testid="comment-item"]` visible. Submit 6th. Assert `role="alert"` visible with rate-limit message. Assert submit button disabled. | `page.route` counter resets on test teardown | | |
| **CMT-E2E-31** | Delete confirm — Cancel restores focus to delete button | Stub GET (1 comment), set `owner_ui=1` cookie, navigate. Click `[data-testid="delete-comment"]`. Assert confirm row visible. Click "Cancel". | `page.route` stub; cookie | Phase 3 owner delete | P1 |
| | | Assert confirm row is gone. Assert `[data-testid="delete-comment"]` is visible. Assert `document.activeElement` equals the delete button (check via `page.evaluate(() => document.activeElement?.dataset?.testid)`). | None | | |

---

## 3. Test Isolation Strategy

### The problem
The backend is a real Neon Postgres database. Running E2E tests that hit the live DB risks:
- Leaving test comments in production data
- Tests depending on existing rows that may be modified or deleted by other tests
- Email to the real owner inbox on every successful POST

### Options evaluated

**Option A — Neon branch per test run**
Neon supports branching from the production schema. CI creates a branch, runs tests, drops the branch. Clean isolation. The developer experience for local runs is poor (requires Neon CLI, branch creation is ~3 seconds, and the branch URL must be injected as `DATABASE_URL` at test time). Adds CI complexity.

**Option B — DB cleanup hooks**
After each test that writes data, issue a DELETE to clean up. Fragile: if a test aborts mid-run, cleanup never executes and the DB accumulates state. Not recommended.

**Option C — Seeded fixture posts + `page.route()` stubs for all API calls** (RECOMMENDED)
All current Playwright tests already do this. `page.route("**/api/comments?**", …)` intercepts the GET; `page.route("**/api/comments", …)` intercepts the POST. The test never touches the real DB. This is the right architecture for a personal blog at low traffic — no Neon branching overhead, tests run entirely in-process against the Next.js server, and all assertions are against stubbed data.

For the token confirmation page tests (CMT-E2E-22 through CMT-E2E-25), the page is server-rendered via `getServerSideProps` which calls the real DB. The isolation strategy here is: stub `/api/owner/delete-by-token` (the POST action) via `page.route`, and for the `getServerSideProps` DB call, either:
- Use `page.route` on the page URL itself with a custom response (not practical for SSR)
- **Better**: add a thin seam — accept a `?_mock=1` query param in `getServerSideProps` during `NODE_ENV=test` that returns hardcoded `commentPreview` data without a DB call.

**Option D — CI-only secondary Neon database**
A separate Neon project with a clean schema, pointed to by `TEST_DATABASE_URL` in GitHub Actions secrets. Integration tests that need a real DB (the Vitest integration tests) can target this. E2E tests still use stubs. This is worth adding for the Vitest integration layer but is out of Phase 6 scope for E2E.

### Recommendation
Keep all E2E tests fully stubbed via `page.route()` (Option C, which is already the convention). Add a `NODE_ENV=test` seam to `getServerSideProps` in `pages/owner/comments/delete.js` to avoid the DB call in token page tests. If a future phase adds integration-level E2E that must hit a real DB, adopt Option D at that point.

---

## 4. Rate-Limit Testing Without Email Spam

### The problem
Phase 5 sends a notification email via Resend on every successful `POST /api/comments`. Any E2E test that submits 5+ real comments to the API (to trigger the 429 on the 6th) will send up to 5 emails to the real owner inbox.

### Options evaluated

**Option A — Resend test mode API key** (`re_test_…`)
Resend's test-mode API key accepts sends without delivering email. This is the cleanest real-world option. Requires maintaining a separate key in CI secrets and ensuring `RESEND_API_KEY` is set to the test key in the test environment.

**Option B — `DISABLE_EMAIL=true` env flag**
Add a guard in `lib/mail.ts`: if `process.env.DISABLE_EMAIL === "true"`, return early without calling `resend.emails.send`. Set this flag in the Playwright CI job. No extra Resend account needed. The cost is a small amount of test-only branching in the production module.

**Option C — Mock at the network layer (stub the API)**
CMT-E2E-30 already uses `page.route` to stub the POST endpoint, so the handler never runs and no email is sent. This means the rate-limit E2E test does not exercise the real rate-limit logic at all — it only exercises the UI's response to a 429. That is acceptable for an E2E test; the real rate-limit logic is proven in the Vitest integration tests (P5-01 through P5-04).

**Option D — Honeypot trick (submit with filled honeypot)**
Fill the honeypot field for test submissions. The server silently discards the comment but returns 200, so the rate limiter is never triggered. This does not test the 429 path at all.

### Recommendation
**Option C** for E2E (already the convention — stubs prevent any real emails). **Option A** (Resend test key) for the Vitest integration tests that call the real `lib/mail.ts`. Set `RESEND_API_KEY=re_test_…` in GitHub Actions for the `test:unit` step. This means no code changes to production modules and no divergence between test and production code paths.

If Option A (separate Resend key) is not worth the operational overhead, **Option B** is the fallback: one env-guarded early return in `lib/mail.ts` is a low-risk change and is better than Option D which does not test anything useful.

---

## 5. CI Considerations

### Current state
`tests.yml` runs on every push and every PR. It:
1. Builds the Next.js app (`npm run build`)
2. Starts the production server (`npm run start &`)
3. Waits for port 3000
4. Runs `npx playwright test`

**Vitest unit and integration tests are not run in CI.** `npm run test:unit` is absent from the workflow. This is the most important gap to close in Phase 6.

### What to add for Phase 6

**Step 1 — Add Vitest to CI**

Add a `test-unit` job before the Playwright job:

```yaml
test-unit:
  runs-on: ubuntu-22.04
  steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: 20.9.0
        cache: npm
    - run: npm ci
    - run: npm run test:unit
  env:
    DELETE_TOKEN_SECRET: ${{ secrets.DELETE_TOKEN_SECRET }}
    IRON_SESSION_PASSWORD: ${{ secrets.IRON_SESSION_PASSWORD }}
    IP_HASH_SALT: ${{ secrets.IP_HASH_SALT }}
    UPSTASH_REDIS_REST_URL: ${{ secrets.UPSTASH_REDIS_REST_URL }}
    UPSTASH_REDIS_REST_TOKEN: ${{ secrets.UPSTASH_REDIS_REST_TOKEN }}
    RESEND_API_KEY: ${{ secrets.RESEND_API_KEY_TEST }}
    OWNER_NOTIFY_EMAIL: test@example.com
    OWNER_FROM_EMAIL: test@example.com
    NEXT_PUBLIC_SITE_URL: http://localhost:3000
```

Note: the integration tests already mock the Upstash and Resend SDKs, so the real Upstash/Resend credentials are not used. Only `DELETE_TOKEN_SECRET`, `IRON_SESSION_PASSWORD`, and `IP_HASH_SALT` are load-bearing — the rest can be dummy values. Use GitHub Actions secrets for the real values.

**Step 2 — Upgrade Playwright job to depend on test-unit**

Add `needs: test-unit` to the playwright job so a unit test failure blocks E2E rather than running both in parallel against a broken build.

**Step 3 — Add axe-core/playwright**

Install `@axe-core/playwright` as a devDependency. The accessibility E2E tests (CMT-E2E-27, CMT-E2E-28) import it directly — no extra CI step needed beyond the existing Playwright job. The package is ~200 KB and does not require a running server beyond what is already started.

**Step 4 — Upgrade checkout and setup-node actions**

The current workflow uses `actions/checkout@v2` and `actions/setup-node@v3`. These are several major versions behind. Upgrade to `@v4` for both. This is a correctness issue — `@v2` does not support caching and has open CVEs.

**Step 5 — (Optional) `webServer` in playwright.config.js**

The current config has `webServer` commented out. Enabling it lets Playwright start and manage the server lifecycle automatically, eliminating the manual `npm run start &` + `nc` wait loop in `tests.yml`. This is a reliability improvement, not a correctness requirement.

### Should we gate merges on axe-core failures?

**Yes, gate on critical and serious violations. No, do not gate on moderate or minor.**

Reasoning: critical and serious axe violations (missing `alt`, unlabelled form controls, low colour contrast at the system level) are objectively broken from an accessibility standpoint. They are binary — either the ARIA attribute exists or it doesn't. They are also cheap to fix immediately and expensive to accumulate. Allowing these through on a PR means they ship to production where they may be indexed by search engines and screenshotted by real assistive technology.

Moderate and minor violations are more contextual (reading order, redundant ARIA, landmark region suggestions) and often require design judgement. Gating on these will cause friction and discourages adoption of the axe step entirely.

Implementation: pass `{ runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa"] }, resultTypes: ["violations"] }` to `checkA11y` and filter to `impact === "critical" || impact === "serious"` before asserting. This is the right policy for a personal site that is not under active accessibility litigation but wants to avoid obvious failures.

---

## 6. Pre-Launch Smoke Test Checklist

Run this manually against production after deploying Phase 6. These are things automation cannot verify.

1. **Real email delivery** — Submit a comment on a production post. Confirm the notification email arrives at your inbox within 60 seconds. Verify the delete link in the email is clickable.

2. **Delete-by-token flow — real email** — Click the delete link from the email. Confirm `/owner/comments/delete?token=…` loads with the comment preview. Click Delete. Confirm the success message "Comment deleted. You can close this tab." appears. Reload the post and confirm the comment is gone.

3. **Owner login — real credentials** — Navigate to `/admin`. Log in with the real `OWNER_PASSWORD`. Confirm the `owner_ui=1` cookie is set. Reload a post page. Confirm delete buttons appear on all comments.

4. **Delete via in-page button — logged in** — Use the owner session to delete a comment using the trash icon on a post page. Confirm the comment disappears and the "Comment deleted" screen-reader announcement fires.

5. **Rate limit — real threshold** — Submit 5 comments on the same post in rapid succession (different author names, same IP). On the 6th, confirm the 429 alert renders with the countdown. Do not submit more — this sends 5 real emails.

6. **Profanity filter — real submission** — Submit a comment containing a word from the `bad-words` default list. Confirm the 422 alert renders correctly. Confirm no email was sent (no new email arrives).

7. **Privacy notice visible on mobile** — On a real iPhone (or Chrome DevTools mobile emulation at 390px), navigate to a post and scroll to the comment form. Confirm the privacy notice is fully visible above the form, not clipped.

8. **iPad Mini portrait — no overflow** — On a real iPad Mini or emulated 768×1024 viewport, verify no horizontal scroll bar appears on the post page with comments loaded.

9. **Dark mode — comment form contrast** — Toggle dark mode. Verify the comment form fields, labels, and error states are readable (no white-on-white or black-on-black scenarios).

10. **Analytics dashboard** — After submitting a test comment and loading the page, check the Vercel Analytics dashboard to confirm `comment_submitted` appears as a custom event. Verify `comment_load_more` appears after clicking Show more on a post with more than 5 comments.

11. **`robots` meta on token page** — Navigate to `/owner/comments/delete?token=anything`. View page source. Confirm `<meta name="robots" content="noindex, nofollow" />` is present.

12. **`noindex` on admin page** — Navigate to `/admin`. View page source. Confirm `noindex, nofollow` meta tag is present.

13. **IP hash — no raw IPs in DB** — After receiving a real comment, query the `comments` table directly. Confirm no `ip` column contains a raw IP address (the column should contain a 64-char hex hash or be absent entirely).

14. **Expired token message** — Manually craft a token with a past timestamp (use the `signDeleteToken` utility with `vi.useFakeTimers` or edit the timestamp segment). Navigate to the delete confirmation page. Confirm the "expired" message renders and no delete button is shown.

---

## Implementation Notes for the Solution Architect

These are testing constraints the implementation must accommodate.

**Analytics intercept pattern (CMT-E2E-18 through CMT-E2E-20)**: Vercel Analytics sends beacons to `va.vercel-insights.com`. In local dev (`localhost:3000`), the Analytics package is typically a no-op unless `NEXT_PUBLIC_VERCEL_ENV` is set. Before writing CMT-E2E-18 through CMT-E2E-20, verify whether `track()` calls fire network requests in dev mode. If not, the tests must either: (a) set `NEXT_PUBLIC_VERCEL_ENV=production` in the Playwright environment, or (b) expose a `window.__lastTrackedEvent` test hook that `track()` populates in addition to (not instead of) the real call. Option (b) avoids the dependency on external network access in CI and is the more reliable approach.

**Token page test seam (CMT-E2E-22 through CMT-E2E-25)**: The `getServerSideProps` in `pages/owner/comments/delete.js` calls `verifyDeleteToken` and `getById`. In test environments, `getById` will attempt a real Neon connection. Add a check: `if (process.env.PLAYWRIGHT_TEST_COMMENT_PREVIEW)` then skip the DB call and return the env-var-parsed JSON as `commentPreview`. Set this env var in the Playwright config for the token page tests.

**axe-core installation**: Add `@axe-core/playwright` to `devDependencies`. The import pattern is:
```js
import AxeBuilder from "@axe-core/playwright";
// …
const results = await new AxeBuilder({ page }).analyze();
const violations = results.violations.filter(
  v => v.impact === "critical" || v.impact === "serious"
);
expect(violations).toEqual([]);
```

**`vitest.config.js` path aliases**: Confirm that `@/` resolves to the repo root in the Vitest config. The integration tests import `@/pages/api/…` and `@/lib/…`. If this breaks after a Next.js or Vitest upgrade, the fix is to add `resolve.alias: { "@": new URL(".", import.meta.url).pathname }` to `vitest.config.js`.
