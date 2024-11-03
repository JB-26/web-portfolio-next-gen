import { test, expect } from "@playwright/test";

test("Page loads successfully", async ({ page }) => {
  await page.goto("http://localhost:3000/links"); // Update the URL as needed
  const title = await page.title();
  expect(title).toBe("Joshua Blewitt"); // Update with your actual site title
});

test("Check for important content", async ({ page }) => {
  await page.goto("http://localhost:3000/links"); // Update the URL as needed

  // Check if the heading is present
  const heading = await page.textContent('[data-testid="heading1"]');
  expect(heading).toBe("Links");

  // Check if paragraph is present
  const paragraph = await page.textContent('[data-testid="content"]');
  expect(paragraph).toBe(
    "Social MediaI’m quite active on Threads, and the account is federated so you can follow me on Mastodon if you prefer. I can also be found on Bluesky. These are the places where I am active the most.ProfessionalI am on LinkedIn. I don’t post there very much but feel free to add me (and send a message that you found this link from my site).I am also a certified Scrum Master and have a foundation level ISTQB certificate. I also have a certificate in web design from freeCodeCamp.Work and ProjectsI have a GitHub where you can see the code for this website and a few other active (and inactive) projects. Why not take a look at Super Blog Starter? That’s based on this blog so you can have a nice looking blog of your very own!",
  );
});
