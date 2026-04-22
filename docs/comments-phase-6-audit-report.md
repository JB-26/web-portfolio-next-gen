# Phase 6 Final Security Audit Report

**Date:** 2026-04-22
**Auditor:** security-auditor (Claude Agent)
**Scope:** Comments feature — `lib/comments/`, `lib/ipHash.ts`, `lib/rateLimit.ts`, `lib/auth.ts`, `lib/deleteToken.ts`, `lib/mail.ts`, `pages/api/comments/`, `pages/api/owner/`, `pages/api/auth/`, `pages/owner/comments/`, `components/comments/`
**Baseline:** Phase 5 audit (0 Critical / 0 High, 2 Medium / 4 Low — all fixed in PR #87)

---

## Summary

- **Total checks run:** 30
- **Pass:** 30
- **Fail (blocking):** 0
- **Fail (non-blocking):** 0
- **New findings vs Phase 5 baseline:** None. No new Critical, High, Medium, or Low findings.

---

## Findings by Group

### Group 1 — Data Handling

| Check | Result | Notes |
|---|---|---|
| D-1 | PASS | `grep remoteAddress\|x-forwarded-for\|extractClientIp lib/comments/ pages/api/comments/` — zero results. Raw IP handling is confined to `lib/ipHash.ts` and `lib/rateLimit.ts` only. |
| D-2 | PASS | `lib/rateLimit.ts` line 97: `key = hashIp(rawIp)`. `hashIp` call precedes `ratelimiter.limit(key)` at line 123. |
| D-3 | PASS | `grep -in "ip" lib/comments/db.ts` returns one match on line 12 — the word "slips" in a code comment. Zero column name matches. INSERT at line 101 names only `post_id`, `author`, `body`. |
| D-4 | PASS | `pages/api/comments/index.ts`: Zod `NewCommentSchema.safeParse(body)` runs at step 3 (line 141). `db.insert({ postId: parsed.data.postId, author: parsed.data.author, body: parsed.data.body })` runs at step 5 (line 166). Zod-validated data only reaches the DB. |
| D-5 | PASS | `grep -in "email" lib/comments/` returns one match: `db.ts` line 117, a comment about the "email link" (delete notification). No email column exists in the `CommentRow` interface or any INSERT/SELECT. `types.ts` has no email field in `Comment` or `NewCommentInput`. |

### Group 2 — Input Handling

| Check | Result | Notes |
|---|---|---|
| I-1 | PASS | `grep -rn "dangerouslySetInnerHTML" components/comments/` returns three results, all in JSDoc comments warning against its use. Zero runtime uses. |
| I-2 | PASS | `lib/comments/schema.ts` line 26: `.refine((value) => !hasLinks(value), …)` — Zod refinement runs server-side in `pages/api/comments/index.ts` step 3. Link rejection is server-authoritative. |
| I-3 | PASS | `containsProfanity(parsed.data.body)` called at step 4 (line 153), after `db.insert` at step 5 (line 166). Correct order. |
| I-4 | PASS | `lib/comments/schema.ts` line 25: `.max(1000)` present. Body length cap is enforced by Zod server-side. |
| I-5 | PASS | Honeypot check `body.url` is step 2 (line 125); Zod parse is step 3 (line 141). Correct order. |
| I-6 | PASS | All five DB calls in `lib/comments/db.ts` use the Neon `sql` tagged template literal. Zero string concatenation found. |

### Group 3 — Auth & Session

| Check | Result | Notes |
|---|---|---|
| A-1 | PASS | `pages/api/comments/[id].ts` line 60: `if (session.isOwner !== true)` — checked at step 3, before UUID validation. |
| A-2 | PASS | `verifyOrigin(req)` called at step 4 (line 66) using URL-parsed origin comparison in `lib/auth.ts`. |
| A-3 | PASS | `verifyCsrf(req, session)` called at step 5 (line 73) using `crypto.timingSafeEqual` in `lib/auth.ts`. |
| A-4 | PASS | `grep -rn "localStorage" lib/ pages/api/` — zero results. |
| A-5 | PASS | `lib/auth.ts` `sessionOptions.cookieOptions` (line 87–92): `httpOnly: true`, `secure: isSecureCookieContext()`, `sameSite: "lax"`. All three flags present. |
| A-6 | PASS | `lib/auth.ts` line 79: `pw.length < MIN_SESSION_PASSWORD_LENGTH` (32) enforced at request time; `pages/api/auth/login.ts` line 128 enforces `MIN_OWNER_PASSWORD_LENGTH = 32` for `OWNER_PASSWORD`. Both enforced in code. |
| A-7 | PASS | `lib/deleteToken.ts` line 167: `crypto.timingSafeEqual(providedSig, expectedSig)`. Present with correct buffer-length guard at line 166. |
| A-8 | PASS | `lib/deleteToken.ts` `verifyDeleteToken`: `expectedSig` is computed unconditionally at line 162, before the expiry check at line 175. Bad signature returns before expiry check (line 170), but the signature computation always runs — an expired token with a bad signature correctly returns `BAD_SIGNATURE` not `EXPIRED`. Both checks are performed on every path. |

### Group 4 — Rate Limiting & Spam

| Check | Result | Notes |
|---|---|---|
| R-1 | PASS | `checkLimit(req)` is step 1 (line 106) in `handlePost`. First operation before any parsing or DB work. |
| R-2 | PASS | `lib/rateLimit.ts`: three catch blocks (lines 98–108, 113–119, 133–141) all return `{ allowed: true }`. Intentional fail-open documented in module header. |
| R-3 | PASS | `pages/api/comments/index.ts` lines 108–110: `res.setHeader("Retry-After", String(limit.retryAfter))` set before the 429 response. |
| R-4 | PASS | `lib/ipHash.ts` line 48: `const MIN_IP_HASH_SALT_LENGTH = 16`. Enforced at line 61. |

### Group 5 — Email

| Check | Result | Notes |
|---|---|---|
| E-1 | PASS | `notifyOwnerOfComment` called at step 6 (line 187) inside a try/catch. The 201 response is sent at step 7 (line 193) unconditionally after email. Email failure cannot fail the POST. |
| E-2 | PASS | `grep -rn "email" lib/comments/` — one match (a comment in `db.ts`). No stored email field anywhere in the comments data layer. |
| E-3 | PASS | `lib/mail.ts` line 26: `import { Resend } from "resend"`. Resend SDK used exclusively; no raw SMTP construction. |
| E-4 | PASS | `checkLimit` is step 1; `notifyOwnerOfComment` is step 6. Rate limit runs before email call. |

### Group 6 — Secrets & Config

| Check | Result | Notes |
|---|---|---|
| S-1 | PASS | `.env.example` documents all 11 environment variables from the Phase 6 inventory with placeholder values and sensitivity/scoping guidance. No secrets present. |
| S-2 | PASS | `git log -p --follow -- .env*` — `.env.local` has never been committed (zero history). `.env.example` contains only placeholder values. No real credentials in git history. |
| S-3 | PASS | Confirmed by owner via Vercel dashboard (`vercel env ls production`): `DATABASE_URL`, `RESEND_API_KEY`, `OWNER_PASSWORD`, `IRON_SESSION_PASSWORD`, `IP_HASH_SALT`, `DELETE_TOKEN_SECRET`, `UPSTASH_REDIS_REST_TOKEN` all Production-scoped only. |
| S-4 | PASS | `lib/deleteToken.ts` line 37: `const MIN_SECRET_LENGTH = 32`. Enforced at line 58–62 in `getSecret()`. |

### Group 7 — Analytics PII

| Check | Result | Notes |
|---|---|---|
| P-1 | PASS | Three `track()` calls confirmed zero-property: `track("comment_submitted")` (`CommentForm.js:163`), `track("comment_load_more")` (`CommentList.js:54`), `track("comment_deleted")` (`CommentsSection.js:128`). No author, body, email, or IP passed as event properties. `@vercel/analytics` is in `package.json` `dependencies` (not devDependencies). |

---

## Findings Detail

No FAIL items. No findings detail section required.

---

## Regression Check vs Phase 5 Baseline

| Finding | Location | Status |
|---|---|---|
| M-02 — Resend error logging PII | `lib/mail.ts` line 153 | STILL CLOSED. Only `statusCode` and `errorName` logged; full error object never written. The outer catch at line 166 restricts to `err.message` only. |
| L-01 — commentPreview.id leak | `pages/owner/comments/delete.js` line 71 | STILL CLOSED. `commentPreview` object contains only `postId`, `author`, `body`, `createdAt`. The `id` field is explicitly excluded with an inline comment noting the omission. |
| L-03 — raw DB error logged | `pages/owner/comments/delete.js` line 84 | STILL CLOSED. `err: err instanceof Error ? err.message : "unknown error"` — only `err.message` is serialised. |
| L-04 — oversized Zod cap | `pages/api/owner/delete-by-token.ts` line 43 | STILL CLOSED. Cap is `max(512)`. Comment documents the realistic token length (~130 chars) and the 4x headroom rationale. |
| I-04 — IP_HASH_SALT minimum length | `lib/ipHash.ts` line 48 | STILL CLOSED. `MIN_IP_HASH_SALT_LENGTH = 16` declared and enforced. |

All five Phase 5 regressions confirmed closed. No regressions detected.

---

## Additional Observations

These are non-blocking observations that were noticed during evidence gathering. They are not checklist items and require no action before merge.

1. **XFF first-vs-last entry (`lib/ipHash.ts` line 104):** The code reads the left-most (first) `x-forwarded-for` entry, with an explicit deployment-assumption comment noting this is only safe on Vercel, where the platform edge controls XFF. The comment also warns that a topology change (self-hosted Nginx, CDN-in-front-of-Vercel, etc.) would require switching to the right-most entry. The decision is correctly documented and intentional for this deployment context.

2. **`delete.js` `data-testid` attributes are already in place** — `pages/owner/comments/delete.js` lines 182 and 227 carry `data-testid="delete-success"` and `data-testid="confirm-token-delete"` respectively, plus `data-testid="delete-preview"` at line 193. The Phase 6E Playwright test stubs (CMT-E2E-15) are fully supported without any additional markup changes.

3. **`csrf_token` cookie set in `login.ts` is not `HttpOnly`** — this is by design (the double-submit pattern requires JS to read it). The implementation comment correctly explains this. Worth keeping the non-`HttpOnly` status documented explicitly so future readers don't treat it as an oversight.

---

## Overall Verdict

**READY TO SHIP** — all 30 blocking checks passed. No new findings versus the Phase 5 baseline. All five Phase 5 regressions confirmed closed.
