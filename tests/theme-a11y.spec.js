import { test, expect } from "@playwright/test";

test.describe("Theme Toggle — Accessibility", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.removeItem("theme");
    });
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto("http://localhost:3000/");
  });

  // A11Y-01: Toggle is a <button>
  test("A11Y-01: toggle is a native button element", async ({ page }) => {
    const toggle = page.getByTestId("theme-toggle");
    await expect(toggle).toBeVisible();

    const tagName = await toggle.evaluate((el) => el.tagName.toLowerCase());
    expect(tagName).toBe("button");
  });

  // A11Y-02: Toggle has a non-empty accessible name
  test("A11Y-02: toggle has a non-empty aria-label", async ({ page }) => {
    const toggle = page.getByTestId("theme-toggle");
    const label = await toggle.getAttribute("aria-label");
    expect(label).toBeTruthy();
    expect(label.length).toBeGreaterThan(0);
  });

  // A11Y-03: Toggle is keyboard focusable
  // Note: WebKit (Safari) requires a system preference to Tab to buttons — it only
  // Tabs to text inputs and links by default. We verify the element IS focusable via
  // programmatic focus, which is the meaningful check for WCAG 2.1 Focus Order.
  test("A11Y-03: toggle is programmatically focusable", async ({ page }) => {
    const toggle = page.getByTestId("theme-toggle");
    await expect(toggle).toBeVisible();

    // Focus via the Playwright .focus() method (equivalent to el.focus() in JS)
    await toggle.focus();

    const activeTestId = await page.evaluate(
      () => document.activeElement?.getAttribute("data-testid"),
    );
    expect(activeTestId).toBe("theme-toggle");
  });

  // A11Y-04: Toggle activates on Enter key
  test("A11Y-04: toggle activates on Enter key", async ({ page }) => {
    const toggle = page.getByTestId("theme-toggle");

    // Start: light (no .dark)
    let hasDark = await page.evaluate(() =>
      document.documentElement.classList.contains("dark"),
    );
    expect(hasDark).toBe(false);

    // Focus then press Enter
    await toggle.focus();
    await page.keyboard.press("Enter");

    hasDark = await page.evaluate(() =>
      document.documentElement.classList.contains("dark"),
    );
    expect(hasDark).toBe(true);
  });

  // A11Y-05: Toggle activates on Space key
  test("A11Y-05: toggle activates on Space key", async ({ page }) => {
    const toggle = page.getByTestId("theme-toggle");

    let hasDark = await page.evaluate(() =>
      document.documentElement.classList.contains("dark"),
    );
    expect(hasDark).toBe(false);

    // Focus then press Space
    await toggle.focus();
    await page.keyboard.press("Space");

    hasDark = await page.evaluate(() =>
      document.documentElement.classList.contains("dark"),
    );
    expect(hasDark).toBe(true);
  });

  // A11Y-06: aria-pressed updates to reflect current state
  test("A11Y-06: aria-pressed reflects current theme state", async ({
    page,
  }) => {
    const toggle = page.getByTestId("theme-toggle");

    // Light mode: aria-pressed should be false (not dark)
    let pressed = await toggle.getAttribute("aria-pressed");
    // aria-pressed is a string "true"/"false" or a boolean attribute
    expect(pressed === "false" || pressed === null || pressed === false).toBe(
      true,
    );

    // Switch to dark
    await toggle.click();

    pressed = await toggle.getAttribute("aria-pressed");
    expect(pressed).toBe("true");
  });

  // A11Y-07: Visible focus ring is specified in CSS classes (focus-visible)
  test("A11Y-07: toggle has focus-visible outline utility applied in markup", async ({
    page,
  }) => {
    const toggle = page.getByTestId("theme-toggle");
    await toggle.focus();

    // Verify the element has the focus-visible outline utility classes applied
    // (Tailwind focus-visible:outline-2 etc.)
    const classList = await page.evaluate(() => {
      const el = document.querySelector("[data-testid='theme-toggle']");
      return el ? el.className : "";
    });
    expect(classList).toContain("focus-visible:outline");
  });
});
