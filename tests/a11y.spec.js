import { test, expect } from "@playwright/test";

/**
 * Accessibility sweep across every redesigned view, in both themes.
 *
 * The redesign changed every colour on the site, so contrast is the thing most
 * likely to regress silently. docs/redesign-design-tokens.md corrected --faint
 * (which failed AA in both themes) and pinned --accent to the hex form rather
 * than the oklch in the handoff, which renders a different, failing colour.
 * These scans are what stop either drifting back.
 */

const BASE = "http://localhost:3000";

const VIEWS = [
  { name: "home", path: "/" },
  { name: "blog index", path: "/blog" },
  { name: "pagination page", path: "/page/2" },
  { name: "blog post", path: "/posts/2026-03-26-ai-future" },
  { name: "resume", path: "/resume" },
  { name: "contact", path: "/contact" },
  { name: "blogroll", path: "/blogroll" },
  { name: "tag page", path: "/tags/Professional" },
  { name: "404", path: "/definitely-not-a-page" },
];

async function scan(page, path, theme) {
  // Set the stored preference before first paint so the FOUC-safe init script
  // in _document picks it up — toggling after load would scan the wrong theme.
  await page.addInitScript((t) => {
    try {
      window.localStorage.setItem("theme", t);
    } catch {}
  }, theme);

  await page.goto(`${BASE}${path}`);
  await expect(page.locator("[data-testid='header-component']")).toBeVisible();

  const isDark = await page.evaluate(() =>
    document.documentElement.classList.contains("dark"),
  );
  expect(isDark).toBe(theme === "dark");

  const { default: AxeBuilder } = await import("@axe-core/playwright");
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();

  return results.violations.filter(
    (v) => v.impact === "critical" || v.impact === "serious",
  );
}

for (const theme of ["light", "dark"]) {
  test.describe(`Accessibility — ${theme} theme`, () => {
    for (const { name, path } of VIEWS) {
      test(`${name} has no serious or critical violations`, async ({ page }) => {
        const blockers = await scan(page, path, theme);
        expect(blockers, JSON.stringify(blockers, null, 2)).toEqual([]);
      });
    }
  });
}

test.describe("Accessibility — colour contrast specifically", () => {
  // A dedicated colour-contrast run, separate from the sweep above, so a
  // contrast regression is legible in the test name rather than buried in a
  // generic violation dump.
  for (const theme of ["light", "dark"]) {
    test(`text meets AA contrast on the blog post page (${theme})`, async ({
      page,
    }) => {
      await page.addInitScript((t) => {
        try {
          window.localStorage.setItem("theme", t);
        } catch {}
      }, theme);
      await page.goto(`${BASE}/posts/2026-03-26-ai-future`);

      const { default: AxeBuilder } = await import("@axe-core/playwright");
      const results = await new AxeBuilder({ page })
        .withRules(["color-contrast"])
        .analyze();

      expect(
        results.violations,
        JSON.stringify(results.violations, null, 2),
      ).toEqual([]);
    });
  }
});

test("mobile viewport has no serious violations on the blog index", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const blockers = await scan(page, "/blog", "light");
  expect(blockers, JSON.stringify(blockers, null, 2)).toEqual([]);
});
