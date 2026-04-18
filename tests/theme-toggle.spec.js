import { test, expect } from "@playwright/test";

// Implementation note: the toggle is two-state (light ↔ dark).
// "system" is not a toggle state — the hook reads system preference on mount
// and defaults to it, but the stored value is always "light" or "dark".

test.describe("Theme Toggle — Functional", () => {
  test.beforeEach(async ({ page }) => {
    // Start each test with a clean slate so OS preference doesn't bleed in.
    await page.addInitScript(() => {
      localStorage.removeItem("theme");
    });
  });

  // FN-01: Default state respects OS preference (no stored pref)
  test("FN-01: no stored preference — dark class matches OS preference", async ({
    page,
  }) => {
    // Force a known OS preference so the assertion is deterministic.
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto("http://localhost:3000/");

    const hasDark = await page.evaluate(() =>
      document.documentElement.classList.contains("dark"),
    );
    expect(hasDark).toBe(false);
  });

  // FN-02: Clicking the toggle flips between dark and light
  test("FN-02: clicking toggle cycles light → dark → light", async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto("http://localhost:3000/");

    const toggle = page.getByTestId("theme-toggle");
    await expect(toggle).toBeVisible();

    // Start: light (no .dark)
    let hasDark = await page.evaluate(() =>
      document.documentElement.classList.contains("dark"),
    );
    expect(hasDark).toBe(false);

    // Click once → dark
    await toggle.click();
    hasDark = await page.evaluate(() =>
      document.documentElement.classList.contains("dark"),
    );
    expect(hasDark).toBe(true);

    // Click again → light
    await toggle.click();
    hasDark = await page.evaluate(() =>
      document.documentElement.classList.contains("dark"),
    );
    expect(hasDark).toBe(false);
  });

  // FN-03: Selecting dark adds .dark to <html>
  test("FN-03: clicking toggle once adds .dark to <html>", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto("http://localhost:3000/");

    const toggle = page.getByTestId("theme-toggle");
    await toggle.click();

    const hasDark = await page.evaluate(() =>
      document.documentElement.classList.contains("dark"),
    );
    expect(hasDark).toBe(true);
  });

  // FN-04: Selecting light removes .dark from <html>
  test("FN-04: switching to light removes .dark from <html>", async ({
    page,
  }) => {
    // Start in dark via addInitScript
    await page.addInitScript(() => {
      localStorage.setItem("theme", "dark");
    });
    await page.goto("http://localhost:3000/");

    // Confirm dark is active
    let hasDark = await page.evaluate(() =>
      document.documentElement.classList.contains("dark"),
    );
    expect(hasDark).toBe(true);

    // Click toggle → light
    const toggle = page.getByTestId("theme-toggle");
    await toggle.click();

    hasDark = await page.evaluate(() =>
      document.documentElement.classList.contains("dark"),
    );
    expect(hasDark).toBe(false);
  });

  // FN-05: System dark preference is respected on initial load
  test("FN-05: system dark preference sets .dark on <html> when no stored pref", async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("http://localhost:3000/");

    const hasDark = await page.evaluate(() =>
      document.documentElement.classList.contains("dark"),
    );
    expect(hasDark).toBe(true);
  });

  // FN-06: Toggle is visible on all primary routes
  test("FN-06: theme toggle is visible on every primary route", async ({
    page,
  }) => {
    const routes = [
      "http://localhost:3000/",
      "http://localhost:3000/blog",
      "http://localhost:3000/resume",
      "http://localhost:3000/contact",
    ];

    for (const url of routes) {
      await page.goto(url);
      const toggle = page.getByTestId("theme-toggle");
      await expect(toggle).toBeVisible({ timeout: 5000 });
    }
  });
});
