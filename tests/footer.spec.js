import { test, expect } from "@playwright/test";

test("Component loads successfully", async ({ page }) => {
  await page.goto("http://localhost:3000/");
  // Verify that the header component is visible
  const footer = page.locator('[data-testid="header-component"]');
  await expect(footer).toBeVisible();
});
