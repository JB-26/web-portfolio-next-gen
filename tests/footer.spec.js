import { test, expect } from "@playwright/test";

test("Component loads successfully", async ({ page }) => {
  await page.goto("http://localhost:3000/");
  // Verify that the header component is visible
  const footer = page.locator('[data-testid="header-component"]');
  await expect(footer).toBeVisible();
});

test.describe("Footer links", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3000/");
  });

  const footerLink = (page, label) =>
    page
      .locator('[data-testid="footer-component"]')
      .getByRole("link", { name: label, exact: true });

  test("outbound links open in a new tab with security attributes", async ({
    page,
  }) => {
    for (const label of [
      "LinkedIn",
      "GitHub",
      "Bluesky",
      "YouTube",
      "Instagram",
    ]) {
      await expect(footerLink(page, label)).toHaveAttribute("target", "_blank");
      await expect(footerLink(page, label)).toHaveAttribute(
        "rel",
        "noopener noreferrer",
      );
    }
  });

  test("the blogroll link navigates in place rather than opening a tab", async ({
    page,
  }) => {
    const link = footerLink(page, "Blogroll");
    await expect(link).toHaveAttribute("href", "/blogroll");
    await expect(link).not.toHaveAttribute("target", "_blank");

    await link.click();
    await expect(page).toHaveURL("http://localhost:3000/blogroll");
    await expect(page.getByTestId("blogroll")).toBeVisible();
  });

  test("the feed stays a plain anchor — it is a rewrite, not a Next page", async ({
    page,
  }) => {
    await expect(footerLink(page, "RSS")).toHaveAttribute("href", "/rss.xml");
    await expect(footerLink(page, "RSS")).toHaveAttribute("target", "_blank");
  });
});
