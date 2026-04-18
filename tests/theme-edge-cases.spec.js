import { test, expect } from "@playwright/test";

test.describe("Theme Toggle — Edge Cases", () => {
  // EC-01: Page loads gracefully when localStorage throws
  test("EC-01: page loads without error when localStorage is unavailable", async ({
    page,
  }) => {
    const errors = [];
    page.on("pageerror", (err) => errors.push(err.message));

    // Block localStorage access to simulate incognito/storage-denied
    await page.addInitScript(() => {
      Object.defineProperty(window, "localStorage", {
        get() {
          throw new Error("localStorage blocked");
        },
      });
    });

    // Should not throw; the init script in _document.js wraps in try/catch
    await page.goto("http://localhost:3000/");
    await page.waitForLoadState("domcontentloaded");

    // No unhandled page errors from the theme init script
    const themeErrors = errors.filter((e) => /localStorage/i.test(e));
    expect(themeErrors).toHaveLength(0);

    // Page should be visible regardless
    await expect(page.locator("body")).toBeVisible();
  });

  // EC-02: Page renders basic content with JavaScript disabled
  test("EC-02: page renders readable content with JavaScript disabled", async ({
    browser,
  }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();

    await page.goto("http://localhost:3000/");
    // With no JS, the toggle (which renders null until mounted) should not appear,
    // but the page content should still be present
    await expect(page.locator("body")).toBeVisible();

    // Check that body is not empty (some content rendered via SSR)
    const bodyText = await page.locator("body").textContent();
    expect(bodyText.trim().length).toBeGreaterThan(0);

    await context.close();
  });

  // EC-03: OS preference change while page is open updates theme (system-follow behaviour)
  // Note: the hook reads system preference only on mount and stores a concrete value
  // (light or dark). After mounting, the toggle is manual-only and does NOT listen
  // for matchMedia changes. This test verifies current behaviour.
  test("EC-03: emulating system dark preference after load does not auto-toggle (expected for two-state hook)", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      localStorage.removeItem("theme");
    });
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto("http://localhost:3000/");

    // Confirm light
    let hasDark = await page.evaluate(() =>
      document.documentElement.classList.contains("dark"),
    );
    expect(hasDark).toBe(false);

    // Change OS pref to dark after page has loaded
    await page.emulateMedia({ colorScheme: "dark" });
    // Give React a moment to react (it shouldn't)
    await page.waitForTimeout(300);

    // The hook does NOT subscribe to matchMedia changes, so .dark should NOT appear
    hasDark = await page.evaluate(() =>
      document.documentElement.classList.contains("dark"),
    );
    // This documents current behaviour: no live OS-preference tracking
    expect(hasDark).toBe(false);
  });

  // EC-04: Corrupt localStorage value falls back gracefully
  test("EC-04: corrupt localStorage value falls back to system/light without error", async ({
    page,
  }) => {
    const errors = [];
    page.on("pageerror", (err) => errors.push(err.message));

    await page.addInitScript(() => {
      localStorage.setItem("theme", "banana");
    });

    await page.goto("http://localhost:3000/");
    await page.waitForLoadState("networkidle");

    // No unhandled JS errors
    expect(errors).toHaveLength(0);

    // The init script in _document.js only sets .dark for 'dark' value;
    // 'banana' is a truthy non-'dark' stored value — treated as truthy in
    // `s==='dark'` check so .dark should NOT be added.
    const hasDark = await page.evaluate(() =>
      document.documentElement.classList.contains("dark"),
    );
    expect(hasDark).toBe(false);
  });

  // EC-05: Rapid repeated clicking leaves toggle in consistent state
  test("EC-05: rapid repeated clicking leaves theme in consistent final state", async ({
    page,
  }) => {
    const errors = [];
    page.on("pageerror", (err) => errors.push(err.message));

    await page.addInitScript(() => {
      localStorage.removeItem("theme");
    });
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto("http://localhost:3000/");

    const toggle = page.getByTestId("theme-toggle");

    // Click 10 times rapidly (even = back to light, odd = dark)
    for (let i = 0; i < 10; i++) {
      await toggle.click();
    }

    // 10 clicks from light → should end on light (even number)
    const hasDark = await page.evaluate(() =>
      document.documentElement.classList.contains("dark"),
    );
    const storedTheme = await page.evaluate(() =>
      localStorage.getItem("theme"),
    );

    // State should be consistent: classList matches stored value
    expect(hasDark).toBe(storedTheme === "dark");
    // No JS errors during rapid clicking
    expect(errors).toHaveLength(0);
  });
});
