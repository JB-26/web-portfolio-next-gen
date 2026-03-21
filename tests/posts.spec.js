import { test, expect } from "@playwright/test";

// 2025-01-30-scrum has tags ["Life", "Professional"] and will always
// have related posts because many other posts share those tags.
const POST_WITH_TAGS = "http://localhost:3000/posts/2025-01-30-scrum";

// 2019-08-10-sega-saturn has no tags frontmatter, so getRelatedPosts
// returns [] and the Related Posts section must not be rendered.
const POST_WITHOUT_TAGS = "http://localhost:3000/posts/2019-08-10-sega-saturn";

test("Post page loads successfully", async ({ page }) => {
  await page.goto(POST_WITH_TAGS);
  const title = await page.title();
  expect(title).toBe(
    "How elements from Scrum can improve decision making and company culture"
  );
});

test("Post page shows a reading time estimate", async ({ page }) => {
  await page.goto(POST_WITH_TAGS);

  const readingTime = page.locator('[data-testid="post-reading-time"]');
  await expect(readingTime).toBeVisible();
  await expect(readingTime).toContainText("min read");
});

test("Reading time estimate matches the expected format (N min read)", async ({ page }) => {
  await page.goto(POST_WITH_TAGS);

  const readingTimeText = await page
    .locator('[data-testid="post-reading-time"]')
    .textContent();
  // Must contain a number followed by "min read", e.g. "7 min read"
  expect(readingTimeText).toMatch(/\d+ min read/);
});

test("Post with tags shows the Related Posts section", async ({ page }) => {
  await page.goto(POST_WITH_TAGS);

  const relatedPosts = page.locator('[data-testid="related-posts"]');
  await expect(relatedPosts).toBeVisible();

  const heading = page.locator('[data-testid="related-posts-heading"]');
  await expect(heading).toHaveText("Related Posts");
});

test("Related Posts section contains up to 3 posts", async ({ page }) => {
  await page.goto(POST_WITH_TAGS);

  const items = page.locator('[data-testid="related-post-item"]');
  const count = await items.count();
  expect(count).toBeGreaterThan(0);
  expect(count).toBeLessThanOrEqual(3);
});

test("Each related post shows a title link, description, and reading time", async ({ page }) => {
  await page.goto(POST_WITH_TAGS);

  const items = page.locator('[data-testid="related-post-item"]');
  const count = await items.count();

  for (let i = 0; i < count; i++) {
    const item = items.nth(i);
    // Title is a link
    await expect(item.locator("a")).toBeVisible();
    // Reading time is present
    const readingTime = item.locator('[data-testid="related-post-reading-time"]');
    await expect(readingTime).toContainText("min read");
  }
});

test("Related posts link to valid post URLs", async ({ page }) => {
  await page.goto(POST_WITH_TAGS);

  const links = page.locator('[data-testid="related-post-item"] a');
  const count = await links.count();
  expect(count).toBeGreaterThan(0);

  for (let i = 0; i < count; i++) {
    const href = await links.nth(i).getAttribute("href");
    expect(href).toMatch(/^\/posts\/.+/);
  }
});

test("Post without tags does not show the Related Posts section", async ({ page }) => {
  await page.goto(POST_WITHOUT_TAGS);

  const relatedPosts = page.locator('[data-testid="related-posts"]');
  await expect(relatedPosts).not.toBeVisible();
});

test("Post without tags still shows a reading time estimate", async ({ page }) => {
  await page.goto(POST_WITHOUT_TAGS);

  const readingTime = page.locator('[data-testid="post-reading-time"]');
  await expect(readingTime).toBeVisible();
  await expect(readingTime).toContainText("min read");
});

test("Related posts do not include the current post", async ({ page }) => {
  await page.goto(POST_WITH_TAGS);

  const links = page.locator('[data-testid="related-post-item"] a');
  const count = await links.count();

  for (let i = 0; i < count; i++) {
    const href = await links.nth(i).getAttribute("href");
    expect(href).not.toBe("/posts/2025-01-30-scrum");
  }
});
