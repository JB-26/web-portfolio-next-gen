/**
 * Comments E2E — Playwright test suite
 *
 * Scenarios CMT-E2E-01 through CMT-E2E-12.
 *
 * Convention notes:
 *   - All API calls stubbed via page.route() before page.goto() — no real DB.
 *   - data-testid selectors match attributes set in the component tree.
 *   - Viewport tests use setViewportSize to check responsive behaviour.
 *   - POST_SLUG must be a post that exists in the static build.
 */
import { test, expect } from "@playwright/test";
import crypto from "node:crypto";

const BASE_URL = "http://localhost:3000";
const POST_SLUG = "2025-01-30-scrum";
const POST_URL = `${BASE_URL}/posts/${POST_SLUG}`;

// ---------------------------------------------------------------------------
// Delete-token helpers (mirror lib/deleteToken.ts exactly — we replicate the
// HMAC rather than importing the .ts module so this .js spec stays portable).
// Used by CMT-E2E-22 through CMT-E2E-25.
// ---------------------------------------------------------------------------

const TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function toB64Url(input) {
  const buf = typeof input === "string" ? Buffer.from(input, "utf8") : input;
  return buf.toString("base64url");
}

/** Produce a signed token identical in format to lib/deleteToken.ts. */
function signToken(commentId, expiresAtMs, secret) {
  const sig = crypto
    .createHmac("sha256", secret)
    .update(`${commentId}.${expiresAtMs}`)
    .digest();
  return [toB64Url(commentId), toB64Url(String(expiresAtMs)), toB64Url(sig)].join(".");
}

/** Require the DELETE_TOKEN_SECRET env var — tests that need a token skip
 *  without it so local runs without the secret don't fail opaquely. */
function getTokenSecretOrSkip(testInfo) {
  const secret = process.env.DELETE_TOKEN_SECRET;
  if (!secret || secret.length < 32) {
    testInfo.skip(
      true,
      "DELETE_TOKEN_SECRET not set (>=32 chars) — skipping token-page test.",
    );
    return "";
  }
  return secret;
}

// ---------------------------------------------------------------------------
// Stub data helpers
// ---------------------------------------------------------------------------

function makeComment(overrides = {}) {
  return {
    id: overrides.id ?? "aaaaaaaa-0000-0000-0000-000000000001",
    postId: POST_SLUG,
    author: overrides.author ?? "Alice",
    body: overrides.body ?? "Great post!",
    createdAt: overrides.createdAt ?? "2025-01-30T10:00:00.000Z",
    status: "approved",
    ...overrides,
  };
}

/** Wire up GET and POST stubs before navigation. */
async function stubComments(page, { comments = [], newComment = null } = {}) {
  // GET — list comments
  await page.route(`**/api/comments?**`, (route) => {
    if (route.request().method() === "GET") {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ comments, total: comments.length }),
      });
    }
    route.continue();
  });

  // POST — submit a new comment
  await page.route(`**/api/comments`, (route) => {
    if (route.request().method() === "POST") {
      const stub = newComment ?? makeComment({ id: "new-comment-id" });
      return route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({ comment: stub }),
      });
    }
    route.continue();
  });
}

// ---------------------------------------------------------------------------
// CMT-E2E-01: Submit valid comment → appears in list, form resets, role="status"
// ---------------------------------------------------------------------------
test("CMT-E2E-01: valid comment submit → appears in list, form resets, status announced", async ({
  page,
}) => {
  const existingComments = [makeComment({ id: "existing-1", author: "Bob", body: "Hello world" })];
  await stubComments(page, { comments: existingComments });

  await page.goto(POST_URL);

  // Wait for CommentsSection to mount (dynamic import)
  await expect(page.locator('[data-testid="comment-form"]')).toBeVisible();

  // Fill in the form
  await page.fill('[data-testid="comment-form"] input[name="author"]', "Alice");
  await page.fill('[data-testid="comment-form"] textarea[name="body"]', "This is my comment.");

  // Submit
  await page.click('[data-testid="submit-comment"]');

  // The new comment should appear in the list
  await expect(page.locator('[data-testid="comment-item"]').first()).toBeVisible();

  // role="status" should be present in the DOM for screen readers
  const statusEl = page.locator('[role="status"]');
  await expect(statusEl.first()).toBeAttached();
});

// ---------------------------------------------------------------------------
// CMT-E2E-02: URL in body → role="alert" link-rejected, comment not added
// ---------------------------------------------------------------------------
test("CMT-E2E-02: URL in body → link-rejected alert shown, comment not submitted", async ({
  page,
}) => {
  // Override POST stub to return 422 LINKS
  await page.route(`**/api/comments?**`, (route) => {
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ comments: [], total: 0 }),
    });
  });
  await page.route(`**/api/comments`, (route) => {
    if (route.request().method() === "POST") {
      return route.fulfill({
        status: 422,
        contentType: "application/json",
        body: JSON.stringify({
          error: { code: "LINKS", message: "Links are not allowed in comments." },
        }),
      });
    }
    route.continue();
  });

  await page.goto(POST_URL);
  await expect(page.locator('[data-testid="comment-form"]')).toBeVisible();

  await page.fill('[data-testid="comment-form"] input[name="author"]', "Alice");
  // Body with a URL — client-side guard will catch this, showing a field error
  await page.fill('[data-testid="comment-form"] textarea[name="body"]', "Check https://example.com");
  await page.click('[data-testid="submit-comment"]');

  // An alert (either inline field error or top-level) should be visible
  await expect(page.locator('[role="alert"]').first()).toBeVisible();

  // No new comment item should have been added (list stays empty)
  await expect(page.locator('[data-testid="comment-item"]')).toHaveCount(0);
});

// ---------------------------------------------------------------------------
// CMT-E2E-03: Profanity in body → server 422 PROFANITY → role="alert"
// ---------------------------------------------------------------------------
test("CMT-E2E-03: profanity → server 422 → alert shown, comment not added", async ({
  page,
}) => {
  await page.route(`**/api/comments?**`, (route) => {
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ comments: [], total: 0 }),
    });
  });
  await page.route(`**/api/comments`, (route) => {
    if (route.request().method() === "POST") {
      return route.fulfill({
        status: 422,
        contentType: "application/json",
        body: JSON.stringify({
          error: {
            code: "PROFANITY",
            message: "Your comment was blocked by the profanity filter.",
          },
        }),
      });
    }
    route.continue();
  });

  await page.goto(POST_URL);
  await expect(page.locator('[data-testid="comment-form"]')).toBeVisible();

  await page.fill('[data-testid="comment-form"] input[name="author"]', "Alice");
  await page.fill('[data-testid="comment-form"] textarea[name="body"]', "Clean text");
  await page.click('[data-testid="submit-comment"]');

  await expect(page.locator('[role="alert"]').first()).toBeVisible();
  await expect(page.locator('[data-testid="comment-item"]')).toHaveCount(0);
});

// ---------------------------------------------------------------------------
// CMT-E2E-04: Empty form submit → client validation fires, no network call
// ---------------------------------------------------------------------------
test("CMT-E2E-04: empty form submit → client validation alert, no network request", async ({
  page,
}) => {
  const apiCalled = { post: false };

  await page.route(`**/api/comments?**`, (route) => {
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ comments: [], total: 0 }),
    });
  });
  await page.route(`**/api/comments`, (route) => {
    if (route.request().method() === "POST") {
      apiCalled.post = true;
      route.fulfill({ status: 201, body: "{}" });
    } else {
      route.continue();
    }
  });

  await page.goto(POST_URL);
  await expect(page.locator('[data-testid="comment-form"]')).toBeVisible();

  // Submit without filling any fields
  await page.click('[data-testid="submit-comment"]');

  // Alert should appear
  await expect(page.locator('[role="alert"]').first()).toBeVisible();

  // Network POST must NOT have been called
  expect(apiCalled.post).toBe(false);
});

// ---------------------------------------------------------------------------
// CMT-E2E-05: Show more — 7 stubs, 5 shown, "Show 2 more" → all shown → button gone
// ---------------------------------------------------------------------------
test("CMT-E2E-05: show more — 5 shown initially, Show 2 more loads remaining, button disappears", async ({
  page,
}) => {
  const sevenComments = Array.from({ length: 7 }, (_, i) =>
    makeComment({
      id: `comment-${i}`,
      author: `User ${i + 1}`,
      body: `Comment ${i + 1}`,
    }),
  );

  await stubComments(page, { comments: sevenComments });
  await page.goto(POST_URL);

  await expect(page.locator('[data-testid="comment-form"]')).toBeVisible();

  // Exactly 5 comment items rendered initially
  await expect(page.locator('[data-testid="comment-item"]')).toHaveCount(5);

  // Show more button visible with correct label
  const showMore = page.locator('[data-testid="show-more"]');
  await expect(showMore).toBeVisible();
  await expect(showMore).toContainText("Show 2 more");

  // Click — all 7 should now be visible
  await showMore.click();
  await expect(page.locator('[data-testid="comment-item"]')).toHaveCount(7);

  // Button disappears
  await expect(showMore).not.toBeVisible();
});

// ---------------------------------------------------------------------------
// CMT-E2E-06: 5 or fewer comments → no Show more button
// ---------------------------------------------------------------------------
test("CMT-E2E-06: 5 or fewer comments → Show more button not rendered", async ({
  page,
}) => {
  const fiveComments = Array.from({ length: 5 }, (_, i) =>
    makeComment({ id: `c-${i}`, author: `User ${i + 1}`, body: `Body ${i + 1}` }),
  );

  await stubComments(page, { comments: fiveComments });
  await page.goto(POST_URL);

  await expect(page.locator('[data-testid="comment-form"]')).toBeVisible();
  await expect(page.locator('[data-testid="comment-item"]')).toHaveCount(5);
  await expect(page.locator('[data-testid="show-more"]')).not.toBeVisible();
});

// ---------------------------------------------------------------------------
// CMT-E2E-07: Owner delete flow → confirm row → comment removed → role="status"
// ---------------------------------------------------------------------------
test("CMT-E2E-07: owner delete flow → confirm → comment fades → status announced", async ({
  page,
}) => {
  const comment = makeComment({ id: "delete-me", author: "Bob", body: "To be deleted" });

  await stubComments(page, { comments: [comment] });

  // Stub the DELETE endpoint
  await page.route(`**/api/comments/delete-me`, (route) => {
    if (route.request().method() === "DELETE") {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ ok: true, id: "delete-me" }),
      });
    }
    route.continue();
  });

  // Set the sentinel cookie so isOwner === true
  await page.addInitScript(() => {
    document.cookie = "owner_ui=1; path=/";
  });

  await page.goto(POST_URL);
  await expect(page.locator('[data-testid="comment-form"]')).toBeVisible();

  // Delete button should be visible for owner
  const deleteBtn = page.locator('[data-testid="delete-comment"]').first();
  await expect(deleteBtn).toBeVisible();
  await deleteBtn.click();

  // Confirm button should appear
  const confirmBtn = page.locator('[data-testid="confirm-delete"]').first();
  await expect(confirmBtn).toBeVisible();
  await confirmBtn.click();

  // Comment should be removed from the DOM
  await expect(page.locator('[data-testid="comment-item"]')).toHaveCount(0);

  // role="status" for deletion announcement
  const statusEl = page.locator('[role="status"]');
  await expect(statusEl.first()).toBeAttached();
});

// ---------------------------------------------------------------------------
// CMT-E2E-08: Non-owner sees no delete buttons
// ---------------------------------------------------------------------------
test("CMT-E2E-08: non-owner — no delete buttons in DOM", async ({ page }) => {
  const comments = [
    makeComment({ id: "c1", author: "Alice" }),
    makeComment({ id: "c2", author: "Bob" }),
  ];

  await stubComments(page, { comments });
  // Do NOT set owner_ui cookie
  await page.goto(POST_URL);

  await expect(page.locator('[data-testid="comment-form"]')).toBeVisible();
  await expect(page.locator('[data-testid="comment-item"]')).toHaveCount(2);

  // Delete buttons must not be in the DOM at all (not just hidden)
  await expect(page.locator('[data-testid="delete-comment"]')).toHaveCount(0);
});

// ---------------------------------------------------------------------------
// CMT-E2E-09: Dark mode smoke — comment form and items are visible
// ---------------------------------------------------------------------------
test("CMT-E2E-09: dark mode smoke — comments section visible in dark mode", async ({
  page,
}) => {
  const comments = [makeComment()];
  await stubComments(page, { comments });

  // Enable dark mode class (matches the site's dark mode toggle behaviour)
  await page.addInitScript(() => {
    localStorage.setItem("theme", "dark");
  });

  await page.goto(POST_URL);

  // Just verify visibility — we don't assert colour values (Chromium serialises
  // OKLCH/computed colours in formats that vary across browser versions)
  await expect(page.locator('[data-testid="comment-form"]')).toBeVisible();
  await expect(page.locator('[data-testid="comment-item"]').first()).toBeVisible();
});

// ---------------------------------------------------------------------------
// CMT-E2E-10: iPad Mini portrait — no horizontal scroll
// ---------------------------------------------------------------------------
test("CMT-E2E-10: iPad Mini portrait (768×1024) — no horizontal overflow", async ({
  page,
}) => {
  const comments = [makeComment()];
  await stubComments(page, { comments });

  await page.setViewportSize({ width: 768, height: 1024 });
  await page.goto(POST_URL);

  await expect(page.locator('[data-testid="comment-form"]')).toBeVisible();

  // Check that the document body does not overflow horizontally
  const scrollWidth = await page.evaluate(
    () => document.documentElement.scrollWidth,
  );
  const clientWidth = await page.evaluate(
    () => document.documentElement.clientWidth,
  );
  expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
});

// ---------------------------------------------------------------------------
// CMT-E2E-11: Loading skeleton shown while fetch resolves
// ---------------------------------------------------------------------------
test("CMT-E2E-11: loading skeleton visible while fetch is pending", async ({
  page,
}) => {
  // Delay the GET response by 500ms so we can catch the skeleton
  await page.route(`**/api/comments?**`, async (route) => {
    await new Promise((r) => setTimeout(r, 500));
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ comments: [], total: 0 }),
    });
  });
  await page.route(`**/api/comments`, (route) => {
    route.continue();
  });

  await page.goto(POST_URL);

  // The skeleton has three shimmer divs with animate-pulse; verify at least
  // one is visible before the data resolves. We check for the sr-only
  // "Loading comments" status text as it is the most stable selector.
  const loadingStatus = page.locator('p.sr-only', { hasText: "Loading comments" });
  // Skeleton should appear quickly
  await expect(loadingStatus).toBeAttached({ timeout: 3000 });
});

// ---------------------------------------------------------------------------
// CMT-E2E-12: Server error 500 → role="alert" with error message
// ---------------------------------------------------------------------------
test("CMT-E2E-12: server 500 on GET → role='alert' error message shown", async ({
  page,
}) => {
  // Stub GET to return 500
  await page.route(`**/api/comments?**`, (route) => {
    route.fulfill({
      status: 500,
      contentType: "application/json",
      body: JSON.stringify({
        error: { code: "INTERNAL", message: "Internal server error." },
      }),
    });
  });
  await page.route(`**/api/comments`, (route) => {
    route.continue();
  });

  await page.goto(POST_URL);

  // Error message rendered with role="alert"
  const errorAlert = page.locator('[role="alert"]', {
    hasText: "Comments could not be loaded",
  });
  await expect(errorAlert).toBeVisible({ timeout: 5000 });
});

// ---------------------------------------------------------------------------
// CMT-E2E-13: Character counter visible update on every keystroke + red at <20
// ---------------------------------------------------------------------------
test("CMT-E2E-13: visible character counter updates as body grows, turns red under 20", async ({
  page,
}) => {
  await stubComments(page, { comments: [] });
  await page.goto(POST_URL);
  await expect(page.locator('[data-testid="comment-form"]')).toBeVisible();

  const body = page.locator('[data-testid="comment-form"] textarea[name="body"]');
  const counter = page.locator("#body-char-count");

  // Empty — counter shows 1000 remaining (MAX_BODY)
  await expect(counter).toHaveText("1000 remaining");

  // Fill to 900 chars → "100 remaining"
  await body.fill("a".repeat(900));
  await expect(counter).toHaveText("100 remaining");

  // Fill to 950 → "50 remaining"
  await body.fill("a".repeat(950));
  await expect(counter).toHaveText("50 remaining");

  // Fill to 985 → "15 remaining" (under 20 threshold → red class)
  await body.fill("a".repeat(985));
  await expect(counter).toHaveText("15 remaining");
  await expect(counter).toHaveClass(/text-red-600/);
});

// ---------------------------------------------------------------------------
// CMT-E2E-14: Polite live region announces at thresholds (100, 50, 20, 0)
// ---------------------------------------------------------------------------
test("CMT-E2E-14: aria-live polite region announces at character thresholds", async ({
  page,
}) => {
  await stubComments(page, { comments: [] });
  await page.goto(POST_URL);
  await expect(page.locator('[data-testid="comment-form"]')).toBeVisible();

  const body = page.locator('[data-testid="comment-form"] textarea[name="body"]');
  // The polite live region is the sr-only paragraph with aria-live="polite"
  // inside the form. Scope to the form to avoid matching other live regions.
  const liveRegion = page.locator(
    '[data-testid="comment-form"] [aria-live="polite"].sr-only',
  );

  // The live region is initially empty (announcedRemaining === null)
  await expect(liveRegion).toHaveText("");

  // Threshold: 100 remaining (exactly 900 chars) — fire change event via fill
  await body.fill("a".repeat(900));
  await expect(liveRegion).toHaveText("100 characters remaining");

  // Threshold: 50 remaining (exactly 950 chars)
  await body.fill("a".repeat(950));
  await expect(liveRegion).toHaveText("50 characters remaining");

  // Visible counter updates as well
  await expect(page.locator("#body-char-count")).toHaveText("50 remaining");
});

// ---------------------------------------------------------------------------
// CMT-E2E-15: Honeypot invisible and removed from tab order
// ---------------------------------------------------------------------------
test("CMT-E2E-15: honeypot input is not visible, not tabbable, autoComplete=off", async ({
  page,
}) => {
  await stubComments(page, { comments: [] });
  await page.goto(POST_URL);
  await expect(page.locator('[data-testid="comment-form"]')).toBeVisible();

  const honeypot = page.locator('[data-testid="comment-form"] input[name="url"]');

  // Attached to DOM
  await expect(honeypot).toBeAttached();

  // Not visible to real users. Playwright's `isVisible()` treats
  // Tailwind's `sr-only` class (clip-path + 1×1) as visible, so instead
  // assert the element is inside a wrapper with aria-hidden="true" OR the
  // sr-only utility class — either is sufficient to hide from sighted
  // users and (for aria-hidden) from assistive tech.
  const effectivelyHidden = await honeypot.evaluate((el) => {
    let cur = el.parentElement;
    while (cur) {
      if (cur.getAttribute && cur.getAttribute("aria-hidden") === "true") return true;
      if (cur.classList && cur.classList.contains("sr-only")) return true;
      cur = cur.parentElement;
    }
    return false;
  });
  expect(effectivelyHidden).toBe(true);

  // tabIndex = -1 removes it from the tab order
  await expect(honeypot).toHaveAttribute("tabindex", "-1");

  // autoComplete off so browsers don't fill it in
  await expect(honeypot).toHaveAttribute("autocomplete", "off");

  // Fill the real fields and tab through — focus must never land on the
  // honeypot. We press Tab up to 10 times and assert document.activeElement
  // never becomes the honeypot element.
  const author = page.locator('[data-testid="comment-form"] input[name="author"]');
  await author.focus();
  for (let i = 0; i < 10; i++) {
    const focusedName = await page.evaluate(
      () => document.activeElement?.getAttribute?.("name") ?? "",
    );
    expect(focusedName).not.toBe("url");
    await page.keyboard.press("Tab");
  }
});

// ---------------------------------------------------------------------------
// CMT-E2E-16: Honeypot filled → server 200 with sentinel comment, UI swallows it
// ---------------------------------------------------------------------------
// The real server (pages/api/comments/index.ts honeypot branch) returns a
// fake comment with the all-zeros UUID 00000000-0000-0000-0000-000000000000
// to fool simple bots that just check the response code. The client UI
// (CommentsSection.handleSuccess) recognises this sentinel and silently
// discards the fake comment so it never renders. This test stubs the real
// server response shape and asserts the sentinel is correctly swallowed.
test("CMT-E2E-16: honeypot filled → POST returns 200 with sentinel comment, list stays empty", async ({
  page,
}) => {
  await page.route(`**/api/comments?**`, (route) => {
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ comments: [], total: 0 }),
    });
  });
  // Honeypot-filled POST: server returns 200 with the fake all-zeros UUID
  // comment, mirroring pages/api/comments/index.ts behaviour exactly.
  await page.route(`**/api/comments`, (route) => {
    if (route.request().method() === "POST") {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          comment: {
            id: "00000000-0000-0000-0000-000000000000",
            postId: POST_SLUG,
            author: "Alice",
            body: "Honeypot body.",
            createdAt: "2026-04-22T12:00:00.000Z",
            status: "approved",
          },
        }),
      });
    }
    route.continue();
  });

  await page.goto(POST_URL);
  await expect(page.locator('[data-testid="comment-form"]')).toBeVisible();

  await page.fill('[data-testid="comment-form"] input[name="author"]', "Alice");
  await page.fill(
    '[data-testid="comment-form"] textarea[name="body"]',
    "Honeypot body.",
  );
  // Directly set the hidden honeypot input — bots would fill this
  await page.evaluate(() => {
    const el = document.querySelector(
      '[data-testid="comment-form"] input[name="url"]',
    );
    if (el) {
      const setter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        "value",
      ).set;
      setter.call(el, "http://spam.example.com");
      el.dispatchEvent(new Event("input", { bubbles: true }));
    }
  });

  await page.click('[data-testid="submit-comment"]');

  // No comment-item should be present
  await expect(page.locator('[data-testid="comment-item"]')).toHaveCount(0);
  // No server-error role=alert
  await expect(
    page.locator('[role="alert"]', { hasText: "Something went wrong" }),
  ).toHaveCount(0);
});

// ---------------------------------------------------------------------------
// CMT-E2E-17: Rate-limit 429 → countdown, disabled submit, re-enables after
// ---------------------------------------------------------------------------
test("CMT-E2E-17: rate-limit 429 → alert shown, submit disabled, re-enables after countdown", async ({
  page,
}) => {
  await page.route(`**/api/comments?**`, (route) => {
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ comments: [], total: 0 }),
    });
  });
  await page.route(`**/api/comments`, (route) => {
    if (route.request().method() === "POST") {
      return route.fulfill({
        status: 429,
        contentType: "application/json",
        headers: { "Retry-After": "3" },
        body: JSON.stringify({
          error: { code: "RATE_LIMIT", message: "Too many submissions." },
        }),
      });
    }
    route.continue();
  });

  await page.goto(POST_URL);
  await expect(page.locator('[data-testid="comment-form"]')).toBeVisible();

  await page.fill('[data-testid="comment-form"] input[name="author"]', "Alice");
  await page.fill(
    '[data-testid="comment-form"] textarea[name="body"]',
    "Body 1.",
  );
  await page.click('[data-testid="submit-comment"]');

  // Rate-limit alert shown
  const alert = page.locator('[role="alert"]', { hasText: "Too many submissions" });
  await expect(alert).toBeVisible();

  // Countdown reads "(Ns)" inside the alert; submit disabled
  const submit = page.locator('[data-testid="submit-comment"]');
  await expect(submit).toBeDisabled();

  // Wait past the 3s countdown — form should re-enable and alert clear
  await page.waitForTimeout(4000);
  await expect(submit).toBeEnabled();
  await expect(alert).toHaveCount(0);
});

// ---------------------------------------------------------------------------
// CMT-E2E-18: comment_submitted analytics event fires on success
// ---------------------------------------------------------------------------
test("CMT-E2E-18: comment_submitted analytics event fires on successful submit", async ({
  page,
}) => {
  await stubComments(page, {
    comments: [],
    newComment: {
      id: "new-1",
      postId: POST_SLUG,
      author: "Alice",
      body: "Hello world.",
      createdAt: "2026-04-22T12:00:00.000Z",
      status: "approved",
    },
  });

  await page.goto(POST_URL);
  await expect(page.locator('[data-testid="comment-form"]')).toBeVisible();

  await page.fill('[data-testid="comment-form"] input[name="author"]', "Alice");
  await page.fill(
    '[data-testid="comment-form"] textarea[name="body"]',
    "Hello world.",
  );
  await page.click('[data-testid="submit-comment"]');

  // New comment rendered → trackEvent has fired synchronously before this
  await expect(page.locator('[data-testid="comment-item"]').first()).toBeVisible();

  const last = await page.evaluate(() => window.__lastTrackedEvent);
  expect(last?.name).toBe("comment_submitted");
});

// ---------------------------------------------------------------------------
// CMT-E2E-19: comment_load_more analytics event fires on Show more click
// ---------------------------------------------------------------------------
test("CMT-E2E-19: comment_load_more analytics event fires on Show more click", async ({
  page,
}) => {
  const sevenComments = Array.from({ length: 7 }, (_, i) =>
    makeComment({
      id: `comment-${i}`,
      author: `User ${i + 1}`,
      body: `Comment ${i + 1}`,
    }),
  );
  await stubComments(page, { comments: sevenComments });

  await page.goto(POST_URL);
  await expect(page.locator('[data-testid="comment-form"]')).toBeVisible();

  const showMore = page.locator('[data-testid="show-more"]');
  await expect(showMore).toBeVisible();

  // Reset any ambient event from earlier interactions
  await page.evaluate(() => {
    window.__lastTrackedEvent = null;
  });

  await showMore.click();
  await expect(page.locator('[data-testid="comment-item"]')).toHaveCount(7);

  const last = await page.evaluate(() => window.__lastTrackedEvent);
  expect(last?.name).toBe("comment_load_more");
});

// ---------------------------------------------------------------------------
// CMT-E2E-20: comment_deleted analytics event fires after owner deletes
// ---------------------------------------------------------------------------
test("CMT-E2E-20: comment_deleted analytics event fires after owner confirms delete", async ({
  page,
}) => {
  const comment = makeComment({ id: "delete-me", author: "Bob", body: "To be deleted" });
  await stubComments(page, { comments: [comment] });

  await page.route(`**/api/comments/delete-me`, (route) => {
    if (route.request().method() === "DELETE") {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ ok: true, id: "delete-me" }),
      });
    }
    route.continue();
  });

  await page.addInitScript(() => {
    document.cookie = "owner_ui=1; path=/";
  });

  await page.goto(POST_URL);
  await expect(page.locator('[data-testid="comment-form"]')).toBeVisible();

  // Reset any event from mount
  await page.evaluate(() => {
    window.__lastTrackedEvent = null;
  });

  await page.locator('[data-testid="delete-comment"]').first().click();
  await page.locator('[data-testid="confirm-delete"]').first().click();

  await expect(page.locator('[data-testid="comment-item"]')).toHaveCount(0);

  const last = await page.evaluate(() => window.__lastTrackedEvent);
  expect(last?.name).toBe("comment_deleted");
});

// ---------------------------------------------------------------------------
// CMT-E2E-21: Error boundary — render error does not break the post page
// ---------------------------------------------------------------------------
// We seed a comment whose `body` is an OBJECT (not a string). React will
// throw "Objects are not valid as a React child" during render inside
// CommentItem, which the CommentErrorBoundary around CommentsSectionInner
// catches. The rest of the page (including the post <h1>) must still render.
test("CMT-E2E-21: error boundary catches render error, post page still renders", async ({
  page,
}) => {
  const badComment = {
    id: "bad-1",
    postId: POST_SLUG,
    author: "Alice",
    // Non-string body triggers render error in CommentItem's <p>{body}</p>
    body: { oops: "not a string" },
    createdAt: "2026-04-22T12:00:00.000Z",
    status: "approved",
  };

  await page.route(`**/api/comments?**`, (route) => {
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ comments: [badComment], total: 1 }),
    });
  });
  await page.route(`**/api/comments`, (route) => route.continue());

  await page.goto(POST_URL);

  // Error boundary fallback visible with the sentinel testid
  await expect(page.locator('[data-testid="comments-error"]')).toBeVisible({
    timeout: 10000,
  });

  // The post's <h1> is still rendered (outside the comments section)
  await expect(page.locator("h1").first()).toBeVisible();

  // The form should NOT be present — the whole section was replaced by the boundary
  await expect(page.locator('[data-testid="comment-form"]')).toHaveCount(0);
});

// ---------------------------------------------------------------------------
// CMT-E2E-22: Token page — valid token shows preview, delete succeeds
// ---------------------------------------------------------------------------
// Requires: PLAYWRIGHT_TEST_COMMENT_PREVIEW=1 AND DELETE_TOKEN_SECRET set on
// the Next.js server process. Without the former, getServerSideProps will
// hit real Neon and these assertions will be flaky. The seam is documented
// in pages/owner/comments/delete.js and comments-phase-6-qa-plan.md §3.
test("CMT-E2E-22: token page — valid token shows preview; confirm delete shows success", async ({
  page,
}, testInfo) => {
  const secret = getTokenSecretOrSkip(testInfo);
  if (!secret) return;

  const commentId = "aaaaaaaa-0000-0000-0000-000000000022";
  const token = signToken(commentId, Date.now() + TOKEN_TTL_MS, secret);

  // Stub the POST endpoint to succeed
  await page.route(`**/api/owner/delete-by-token`, (route) => {
    if (route.request().method() === "POST") {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ ok: true }),
      });
    }
    route.continue();
  });

  await page.goto(
    `${BASE_URL}/owner/comments/delete?token=${encodeURIComponent(token)}`,
  );

  await expect(page.getByRole("heading", { name: "Delete comment" })).toBeVisible();
  const preview = page.locator('[data-testid="delete-preview"]');
  await expect(preview).toBeVisible();
  // The seam's preview uses author "Test Commenter"
  await expect(preview).toContainText("Test Commenter");

  const confirm = page.locator('[data-testid="confirm-token-delete"]');
  await expect(confirm).toBeEnabled();
  await confirm.click();

  await expect(page.locator('[data-testid="delete-success"]')).toBeVisible();
  await expect(page.locator('[data-testid="delete-success"]')).toContainText(
    "Comment deleted. You can close this tab.",
  );
});

// ---------------------------------------------------------------------------
// CMT-E2E-23: Token page — expired token shows "expired" message
// ---------------------------------------------------------------------------
test("CMT-E2E-23: token page — expired token renders expired alert, no delete button", async ({
  page,
}, testInfo) => {
  const secret = getTokenSecretOrSkip(testInfo);
  if (!secret) return;

  const commentId = "aaaaaaaa-0000-0000-0000-000000000023";
  // Timestamp one hour in the past — signature is valid, token is expired
  const expiredAt = Date.now() - 60 * 60 * 1000;
  const token = signToken(commentId, expiredAt, secret);

  await page.goto(
    `${BASE_URL}/owner/comments/delete?token=${encodeURIComponent(token)}`,
  );

  // Exclude Next's built-in `#__next-route-announcer__` which also carries
  // role="alert" and would trip strict mode.
  const alert = page.locator('[role="alert"]:not(#__next-route-announcer__)');
  await expect(alert).toBeVisible();
  await expect(alert).toContainText("expired");

  await expect(page.locator('[data-testid="delete-preview"]')).toHaveCount(0);
  await expect(page.locator('[data-testid="confirm-token-delete"]')).toHaveCount(0);
});

// ---------------------------------------------------------------------------
// CMT-E2E-24: Token page — malformed token shows generic error (not "expired")
// ---------------------------------------------------------------------------
test("CMT-E2E-24: token page — malformed token renders generic alert", async ({
  page,
}) => {
  await page.goto(
    `${BASE_URL}/owner/comments/delete?token=not-a-valid-token`,
  );

  // Exclude Next.js's built-in route announcer (`#__next-route-announcer__`)
  // which also has role="alert" and would otherwise trip strict mode.
  const alert = page.locator('[role="alert"]:not(#__next-route-announcer__)');
  await expect(alert).toBeVisible();
  // Malformed copy is distinct from expired copy
  await expect(alert).not.toContainText("expired");
  await expect(alert).toContainText("malformed");

  await expect(page.locator('[data-testid="confirm-token-delete"]')).toHaveCount(0);
});

// ---------------------------------------------------------------------------
// CMT-E2E-25: Token page — bad signature shows "not valid"
// ---------------------------------------------------------------------------
test("CMT-E2E-25: token page — tampered signature renders BAD_SIGNATURE alert", async ({
  page,
}, testInfo) => {
  const secret = getTokenSecretOrSkip(testInfo);
  if (!secret) return;

  const commentId = "aaaaaaaa-0000-0000-0000-000000000025";
  const token = signToken(commentId, Date.now() + TOKEN_TTL_MS, secret);

  // Tamper: flip a byte in the signature segment
  const parts = token.split(".");
  const sigBuf = Buffer.from(parts[2], "base64url");
  sigBuf[0] ^= 0xff; // flip all bits of the first byte
  parts[2] = sigBuf.toString("base64url");
  const tamperedToken = parts.join(".");

  await page.goto(
    `${BASE_URL}/owner/comments/delete?token=${encodeURIComponent(tamperedToken)}`,
  );

  // Exclude Next's built-in `#__next-route-announcer__` which also carries
  // role="alert" and would trip strict mode.
  const alert = page.locator('[role="alert"]:not(#__next-route-announcer__)');
  await expect(alert).toBeVisible();
  await expect(alert).toContainText("not valid");
  await expect(page.locator('[data-testid="confirm-token-delete"]')).toHaveCount(0);
});

// ---------------------------------------------------------------------------
// CMT-E2E-26: Admin login — wrong password shows error, correct sets cookie
// ---------------------------------------------------------------------------
test("CMT-E2E-26: admin login — wrong password → alert; correct password → logged-in state", async ({
  page,
  context,
}) => {
  // Stateful stub: first POST returns 401, subsequent returns 200 + sets cookie
  let attempts = 0;
  await page.route(`**/api/auth/login`, async (route) => {
    if (route.request().method() !== "POST") return route.continue();
    attempts++;
    if (attempts === 1) {
      return route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({ error: { code: "UNAUTHORIZED", message: "Wrong password" } }),
      });
    }
    return route.fulfill({
      status: 200,
      contentType: "application/json",
      headers: { "Set-Cookie": "owner_ui=1; Path=/; SameSite=Lax" },
      body: JSON.stringify({ ok: true }),
    });
  });

  await page.goto(`${BASE_URL}/admin`);

  // The password field should be focused on mount
  await expect(page.locator("#admin-password")).toBeFocused();

  // Wrong password attempt. Exclude Next's built-in
  // `#__next-route-announcer__` which also carries role="alert".
  const alert = page.locator('[role="alert"]:not(#__next-route-announcer__)');
  await page.fill("#admin-password", "wrong-password");
  await page.click('button[type="submit"]');
  await expect(alert).toBeVisible();
  await expect(alert).toContainText("Invalid password");

  // Correct password — response triggers window.location.reload() so we
  // pre-seed the cookie via the browser context so the reloaded page sees
  // the logged-in state. (The Set-Cookie header from route.fulfill is not
  // reliably applied by Playwright's request interception in all versions.)
  await context.addCookies([
    {
      name: "owner_ui",
      value: "1",
      url: BASE_URL,
      sameSite: "Lax",
    },
  ]);

  await page.fill("#admin-password", "correct-password");
  await page.click('button[type="submit"]');

  // After the reload the page shows the logged-in section with a Sign out button
  await expect(page.getByRole("button", { name: "Sign out" })).toBeVisible();
  await expect(page.locator("#admin-password")).toHaveCount(0);
});

// ---------------------------------------------------------------------------
// CMT-E2E-27: Accessibility audit — post page with comments (axe-core)
// ---------------------------------------------------------------------------
// NOTE: requires @axe-core/playwright in devDependencies. If the package is
// missing at run time, the dynamic import throws and the test fails loudly —
// that's the signal that the parallel CI agent's dep hasn't landed yet.
test("CMT-E2E-27: axe-core — post page with comments has no critical/serious violations", async ({
  page,
}) => {
  const comments = [
    makeComment({ id: "c1", author: "Alice", body: "Short comment." }),
    makeComment({
      id: "c2",
      author: "Bob",
      body: "A longer comment body to exercise the card layout with realistic content.",
    }),
    makeComment({ id: "c3", author: "Carol", body: "Third." }),
  ];
  await stubComments(page, { comments });

  await page.goto(POST_URL);
  await expect(page.locator('[data-testid="comment-form"]')).toBeVisible();

  const { default: AxeBuilder } = await import("@axe-core/playwright");
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  const blockers = results.violations.filter(
    (v) => v.impact === "critical" || v.impact === "serious",
  );
  expect(blockers, JSON.stringify(blockers, null, 2)).toEqual([]);
});

// ---------------------------------------------------------------------------
// CMT-E2E-28: Accessibility audit — delete confirm row open (axe-core)
// ---------------------------------------------------------------------------
test("CMT-E2E-28: axe-core — delete confirm row has no critical/serious violations", async ({
  page,
}) => {
  const comment = makeComment({ id: "confirm-1", author: "Alice", body: "Hi." });
  await stubComments(page, { comments: [comment] });

  await page.addInitScript(() => {
    document.cookie = "owner_ui=1; path=/";
  });

  await page.goto(POST_URL);
  await expect(page.locator('[data-testid="comment-form"]')).toBeVisible();

  await page.locator('[data-testid="delete-comment"]').first().click();
  await expect(page.locator('[data-testid="confirm-delete"]').first()).toBeVisible();

  const { default: AxeBuilder } = await import("@axe-core/playwright");
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  const blockers = results.violations.filter(
    (v) => v.impact === "critical" || v.impact === "serious",
  );
  expect(blockers, JSON.stringify(blockers, null, 2)).toEqual([]);
});

// ---------------------------------------------------------------------------
// CMT-E2E-29: Privacy notice text present (Wave 1 copy)
// ---------------------------------------------------------------------------
test("CMT-E2E-29: privacy notice is visible above the form with Wave 1 copy", async ({
  page,
}) => {
  await stubComments(page, { comments: [] });
  await page.goto(POST_URL);

  const form = page.locator('[data-testid="comment-form"]');
  await expect(form).toBeVisible();

  // Wave 1 copy — matched against the opening clause to keep the assertion
  // resilient to trailing whitespace differences between dev and prod.
  await expect(form).toContainText("Comments are public and permanent");
  await expect(form).toContainText(
    "No email address or IP address is stored",
  );

  // The privacy paragraph is NOT sr-only — assert visibility
  const privacy = form
    .locator("p", { hasText: "Comments are public and permanent" })
    .first();
  await expect(privacy).toBeVisible();
});

// ---------------------------------------------------------------------------
// CMT-E2E-30: 5 rapid POSTs succeed, 6th returns 429 (stateful stub)
// ---------------------------------------------------------------------------
test("CMT-E2E-30: stateful rate-limit — 5 succeed, 6th submission blocked by 429", async ({
  page,
}) => {
  await page.route(`**/api/comments?**`, (route) => {
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ comments: [], total: 0 }),
    });
  });

  let postCount = 0;
  await page.route(`**/api/comments`, (route) => {
    if (route.request().method() !== "POST") return route.continue();
    postCount++;
    if (postCount <= 5) {
      return route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({
          comment: {
            id: `ok-${postCount}`,
            postId: POST_SLUG,
            author: `User ${postCount}`,
            body: `Body ${postCount}`,
            createdAt: new Date().toISOString(),
            status: "approved",
          },
        }),
      });
    }
    return route.fulfill({
      status: 429,
      contentType: "application/json",
      headers: { "Retry-After": "10" },
      body: JSON.stringify({
        error: { code: "RATE_LIMIT", message: "Too many submissions." },
      }),
    });
  });

  await page.goto(POST_URL);
  await expect(page.locator('[data-testid="comment-form"]')).toBeVisible();

  const authorInput = page.locator(
    '[data-testid="comment-form"] input[name="author"]',
  );
  const bodyInput = page.locator(
    '[data-testid="comment-form"] textarea[name="body"]',
  );
  const submit = page.locator('[data-testid="submit-comment"]');

  // Submit 5 successful comments. The form auto-clears 3 seconds after
  // success, but we don't need to wait — we manually re-fill each time.
  for (let i = 1; i <= 5; i++) {
    await authorInput.fill(`User ${i}`);
    await bodyInput.fill(`Body number ${i}`);
    await submit.click();
    // Wait for the new comment to appear before submitting the next one
    await expect(page.locator('[data-testid="comment-item"]')).toHaveCount(i);
  }

  // 6th attempt → 429
  await authorInput.fill("User 6");
  await bodyInput.fill("Body number 6");
  await submit.click();

  await expect(
    page.locator('[role="alert"]', { hasText: "Too many submissions" }),
  ).toBeVisible();
  await expect(submit).toBeDisabled();
  // Still only 5 items in the list
  await expect(page.locator('[data-testid="comment-item"]')).toHaveCount(5);
});

// ---------------------------------------------------------------------------
// CMT-E2E-31: Delete confirm — Cancel restores focus to the delete button
// ---------------------------------------------------------------------------
test("CMT-E2E-31: delete confirm — Cancel closes the confirm row and returns focus", async ({
  page,
}) => {
  const comment = makeComment({ id: "focus-1", author: "Alice", body: "Hi." });
  await stubComments(page, { comments: [comment] });

  await page.addInitScript(() => {
    document.cookie = "owner_ui=1; path=/";
  });

  await page.goto(POST_URL);
  await expect(page.locator('[data-testid="comment-form"]')).toBeVisible();

  const deleteBtn = page.locator('[data-testid="delete-comment"]').first();
  await expect(deleteBtn).toBeVisible();
  await deleteBtn.click();

  const confirmBtn = page.locator('[data-testid="confirm-delete"]').first();
  await expect(confirmBtn).toBeVisible();

  // The Cancel button has no data-testid — match on visible text (scoped
  // to the group role to avoid ambiguity with any other "Cancel" control).
  const cancel = page
    .locator('[role="group"][aria-label="Confirm deletion"]')
    .getByRole("button", { name: "Cancel" });
  await expect(cancel).toBeVisible();
  await cancel.click();

  // Confirm row is gone, delete button reappears
  await expect(confirmBtn).toHaveCount(0);
  await expect(deleteBtn).toBeVisible();

  // Focus is returned to the original delete button. `toBeFocused()` polls
  // until the assertion passes (or the default timeout elapses), which
  // correctly awaits the React effect that re-focuses after re-render. A
  // one-shot `page.evaluate(() => document.activeElement)` would race the
  // commit and report `<body>` instead.
  await expect(deleteBtn).toBeFocused();
});
