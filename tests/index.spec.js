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
  expect(heading).toBe("Hey, I'm Joshua Blewitt   👋");

  // Check if subtitle is present
  const subtitle = await page.textContent('[data-testid="subtitle"]');
  expect(subtitle).toBe("But call me JB.");

  // Check if the email button is present
  const emailButton = await page.textContent('[data-testid="button"]');
  expect(emailButton).toBe("Email me ");

  // Check if paragraph is present
  const paragraph = await page.textContent('[data-testid="paragraph"]');
  expect(paragraph).toBe(
    "I'm passionate about product, a technology advocate, customer champion, and curious mind. My work allows me to analyse business problems, design and deliver technical solutions that deliver value to stakeholders.",
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
