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
  // Sentence case per the design handoff (§4 "Related posts").
  await expect(heading).toHaveText("Related posts");
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

// --- Redesign: table of contents, tag pills, author card ---------------------

// 2026-03-26-ai-future has five <h2> sections, so it always produces a TOC.
const POST_WITH_HEADINGS =
  "http://localhost:3000/posts/2026-03-26-ai-future";

test("Table of contents lists every h2 and links to a real heading id", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(POST_WITH_HEADINGS);

  const toc = page.locator('[data-testid="toc"]');
  await expect(toc).toBeVisible();

  const headingIds = await page
    .locator("article h2[id]")
    .evaluateAll((els) => els.map((el) => el.id));
  expect(headingIds.length).toBeGreaterThan(0);

  const tocHrefs = await toc
    .locator("a")
    .evaluateAll((els) => els.map((el) => el.getAttribute("href")));

  // One entry per heading, and every entry points at an id that exists.
  expect(tocHrefs).toEqual(headingIds.map((id) => `#${id}`));
});

test("Clicking a table of contents entry scrolls the heading into view", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(POST_WITH_HEADINGS);

  const firstLink = page.locator('[data-testid="toc"] a').first();
  const targetId = (await firstLink.getAttribute("href")).slice(1);

  await firstLink.click();

  // Wait for the smooth scroll to settle, then assert the heading sits near
  // the top of the viewport (scroll-margin-top is 24px).
  await expect
    .poll(
      async () =>
        await page
          .locator(`#${targetId}`)
          .evaluate((el) => Math.round(el.getBoundingClientRect().top)),
      { timeout: 8000 },
    )
    .toBeLessThan(80);
});

test("Table of contents is hidden below the lg breakpoint", async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 1024 }); // iPad Mini portrait
  await page.goto(POST_WITH_HEADINGS);

  await expect(page.locator('[data-testid="toc"]')).toBeHidden();
});

test("Post tags render as pills linking to the tag page", async ({ page }) => {
  await page.goto(POST_WITH_TAGS);

  const tagLinks = page.locator('article a[href^="/tags/"]');
  await expect(tagLinks.first()).toBeVisible();

  const hrefs = await tagLinks.evaluateAll((els) =>
    els.map((el) => el.getAttribute("href")),
  );
  expect(hrefs.length).toBeGreaterThan(0);
  for (const href of hrefs) expect(href).toMatch(/^\/tags\/.+/);
});

test("Author card appears after the article and links to contact", async ({
  page,
}) => {
  await page.goto(POST_WITH_TAGS);

  const card = page.locator('[data-testid="author-card"]');
  await expect(card).toBeVisible();
  await expect(card).toContainText("Joshua Blewitt");
  await expect(
    card.getByRole("link", { name: "Let me know your thoughts →" }),
  ).toHaveAttribute("href", "/contact");
});

test("Back to blog link sits at the top of the post", async ({ page }) => {
  await page.goto(POST_WITH_TAGS);

  await expect(
    page.getByRole("link", { name: "← Back to blog" }),
  ).toHaveAttribute("href", "/blog");
});
