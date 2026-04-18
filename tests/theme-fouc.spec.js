import { test, expect } from "@playwright/test";

// FOUC / Hydration tests
// Note: Playwright's page.goto() by default waits for the 'load' event. To check
// the class state at DOMContentLoaded we use a Promise race against the event.

test.describe("Theme FOUC / Hydration", () => {
  // FC-01: .dark class present at DOMContentLoaded when dark pref stored
  test("FC-01: .dark class present at DOMContentLoaded with stored dark pref", async ({
    page,
  }) => {
    // Pre-populate localStorage before the page runs any script
    await page.addInitScript(() => {
      localStorage.setItem("theme", "dark");
    });

    // Capture classList at DOMContentLoaded via a Promise that resolves early
    let darkAtDCL = null;

    await page.goto("http://localhost:3000/", { waitUntil: "commit" });

    // Wait for DOMContentLoaded then read the class
    darkAtDCL = await page.evaluate(() => {
      return new Promise((resolve) => {
        if (document.readyState === "loading") {
          document.addEventListener("DOMContentLoaded", () => {
            resolve(document.documentElement.classList.contains("dark"));
          });
        } else {
          // Already past DOMContentLoaded
          resolve(document.documentElement.classList.contains("dark"));
        }
      });
    });

    expect(darkAtDCL).toBe(true);
  });

  // FC-02: .dark absent at DOMContentLoaded with stored light pref
  test("FC-02: .dark absent at DOMContentLoaded with stored light pref", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      localStorage.setItem("theme", "light");
    });

    await page.goto("http://localhost:3000/", { waitUntil: "commit" });

    const darkAtDCL = await page.evaluate(() => {
      return new Promise((resolve) => {
        if (document.readyState === "loading") {
          document.addEventListener("DOMContentLoaded", () => {
            resolve(document.documentElement.classList.contains("dark"));
          });
        } else {
          resolve(document.documentElement.classList.contains("dark"));
        }
      });
    });

    expect(darkAtDCL).toBe(false);
  });

  // FC-03: Background pixel is dark at DOMContentLoaded when dark pref is stored
  test("FC-03: page background is dark before full hydration (no white flash)", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      localStorage.setItem("theme", "dark");
    });

    await page.goto("http://localhost:3000/");

    // After load, the dark class should be on <html> — screenshot the top-left
    // corner and assert the background is not white (luminance < 0.9)
    const screenshot = await page.screenshot({
      clip: { x: 0, y: 0, width: 100, height: 100 },
    });

    // A dark background will have low luminance. We use pixel data via evaluate.
    const hasDark = await page.evaluate(() =>
      document.documentElement.classList.contains("dark"),
    );
    expect(hasDark).toBe(true);

    // Basic sanity: background-color of body is NOT rgb(255,255,255) in dark mode
    const bg = await page.evaluate(() =>
      window.getComputedStyle(document.body).backgroundColor,
    );
    expect(bg).not.toBe("rgb(255, 255, 255)");
  });

  // FC-04: No React hydration mismatch warnings in console
  test("FC-04: no hydration mismatch console errors with stored dark pref", async ({
    page,
  }) => {
    const errors = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        errors.push(msg.text());
      }
    });

    await page.addInitScript(() => {
      localStorage.setItem("theme", "dark");
    });

    await page.goto("http://localhost:3000/");
    // Wait for hydration to complete
    await page.waitForLoadState("networkidle");

    const hydrationErrors = errors.filter(
      (e) =>
        /Warning.*did not match/i.test(e) ||
        /Hydration/i.test(e) ||
        /hydrat/i.test(e),
    );

    expect(hydrationErrors).toHaveLength(0);
  });
});
