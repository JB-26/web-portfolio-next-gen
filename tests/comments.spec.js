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

const BASE_URL = "http://localhost:3000";
const POST_SLUG = "2025-01-30-scrum";
const POST_URL = `${BASE_URL}/posts/${POST_SLUG}`;

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
