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

  // Check if paragraph is present
  const paragraph = await page.textContent('[data-testid="paragraph"]');
  expect(paragraph).toBe(
    "A hobbyist developer, technologist, traveller, amateur photographer, small-time YouTuber, and writer. I have ten years of experience in the software industry. From testing software to working with stakeholders, my work allows me to analyse business problems, design and deliver technical solutions that deliver value. Described as a technology advocate, problem solver and curious mind. I've worked at major companies such as Domino's Pizza Group and IQVIA. If I'm not working on my street photography skills, I'm either writing my next blog post, YouTube video, or practicing programming. ",
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
