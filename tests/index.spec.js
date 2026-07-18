import { test, expect } from "@playwright/test";

test("Page loads successfully", async ({ page }) => {
  await page.goto("http://localhost:3000"); // Update the URL as needed
  const title = await page.title();
  expect(title).toBe("Joshua Blewitt"); // Update with your actual site title
});

test("Check for important content", async ({ page }) => {
  await page.goto("http://localhost:3000"); // Update the URL as needed

  // Check if the heading is present
  const heading = await page.textContent('[data-testid="main-heading"]');
  expect(heading).toBe("Hey, I'm Joshua.");

  // Check if paragraph is present
  const paragraph = await page.textContent('[data-testid="paragraph"]');
  expect(paragraph).toBe(
    "A hobbyist developer, technologist, traveller, amateur photographer, small-time YouTuber, and writer. I have ten years of experience in the software industry — from testing software to working with stakeholders at companies like Domino's Pizza Group and IQVIA.",
  );
});

test("Image is displayed", async ({ page }) => {
  await page.goto("http://localhost:3000"); // Update the URL as needed

  // Wait for the image to load
  await page.waitForSelector('[data-testid="image"]');

  // Check if the image is visible
  const isImageVisible = await page.isVisible('[data-testid="image"]');
  expect(isImageVisible).toBe(true);
});

test("Hero call-to-action buttons link to blog and contact", async ({
  page,
}) => {
  await page.goto("http://localhost:3000");

  await expect(
    page.getByRole("link", { name: "Read the blog" }),
  ).toHaveAttribute("href", "/blog");
  await expect(
    page.getByRole("link", { name: "Get in touch" }),
  ).toHaveAttribute("href", "/contact");
});

test("Recent posts section shows the four newest posts", async ({ page }) => {
  await page.goto("http://localhost:3000");

  const cards = page.locator('[data-testid="post-card"]');
  await expect(cards).toHaveCount(4);

  // Every card links to a real post and shows a non-empty title.
  for (let i = 0; i < 4; i++) {
    const card = cards.nth(i);
    await expect(card).toHaveAttribute("href", /^\/posts\/.+/);
    await expect(card.locator("h3")).not.toBeEmpty();
  }

  await expect(page.getByRole("link", { name: "View all →" })).toHaveAttribute(
    "href",
    "/blog",
  );
});
