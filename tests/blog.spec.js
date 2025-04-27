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
