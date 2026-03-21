import { test, expect } from "@playwright/test";

test("Page loads successfully", async ({ page }) => {
  await page.goto("http://localhost:3000/blog"); // Update the URL as needed
  const title = await page.title();
  expect(title).toBe("Joshua Blewitt"); // Update with your actual site title
});

test("Check for important content", async ({ page }) => {
  await page.goto("http://localhost:3000/blog"); // Update the URL as needed

  const pinned = await page.textContent('[data-testid="pinned"]');
  expect(pinned).toBe("Pinned Post");

  await expect(page.locator('[data-testid="blog-posts"]')).toContainText(
    "Blog",
  );
});

test("Pinned post shows a reading time estimate", async ({ page }) => {
  await page.goto("http://localhost:3000/blog");

  const pinnedReadingTime = page.locator('[data-testid="pinned-reading-time"]');
  await expect(pinnedReadingTime).toBeVisible();
  await expect(pinnedReadingTime).toContainText("min read");
});

test("Every post in the blog listing shows a reading time estimate", async ({ page }) => {
  await page.goto("http://localhost:3000/blog");

  const readingTimes = page.locator('[data-testid="post-reading-time"]');
  const count = await readingTimes.count();
  expect(count).toBeGreaterThan(0);

  for (let i = 0; i < count; i++) {
    await expect(readingTimes.nth(i)).toContainText("min read");
  }
});

