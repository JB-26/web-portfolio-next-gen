import { test, expect } from "@playwright/test";

/**
 * The blogroll is a plain list of outbound links, so the things worth guarding
 * are structural rather than behavioural:
 *
 *   - Tailwind v4's preflight zeroes list-style and padding on every <ul>, and
 *     global.css adds no base rules back. Both lists therefore depend entirely
 *     on utility classes for their bullets and indentation — drop them and the
 *     page silently flattens.
 *   - The sub-list belongs inside the "Jim Grey" <li>. It was previously a
 *     sibling of it, which is invalid HTML and renders unnested.
 */

const LIST = '[data-testid="blogroll-list"]';

// Every entry is an outbound absolute URL; `nested` marks the two that sit
// under Jim Grey.
const BLOGS = [
  { name: "Phil Gyford", href: "https://www.gyford.com/", nested: false },
  { name: "Software management", href: "https://dev.jimgrey.net/", nested: true },
  { name: "Photography", href: "https://blog.jimgrey.net/", nested: true },
  { name: "Robin Rendle", href: "https://robinrendle.com/", nested: false },
  { name: "Josh Crain", href: "https://joshcrain.io/", nested: false },
  { name: "Matt Shumer", href: "https://shumer.dev/", nested: false },
  { name: "Craig Mod", href: "https://craigmod.com/", nested: false },
  { name: "Ryan Barrett", href: "https://snarfed.org/about", nested: false },
  { name: "Matt Blewitt", href: "https://matt.blwt.io/", nested: false },
  { name: "Jeff Atwood", href: "https://blog.codinghorror.com/", nested: false },
];

// Scoped to the list so the footer's own links can't satisfy a match.
const entry = (page, name) =>
  page.locator(LIST).getByRole("link", { name, exact: true });

test.describe("Blogroll Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3000/blogroll");
  });

  test("should display the blogroll page title", async ({ page }) => {
    await expect(page).toHaveTitle(/Blogroll · Joshua Blewitt/i);
  });

  test("should display the main Blogroll heading", async ({ page }) => {
    const heading = page.getByTestId("blogroll");
    await expect(heading).toBeVisible();
    await expect(heading).toHaveText("Blogroll");
  });

  test("should display the introductory text", async ({ page }) => {
    await expect(
      page.getByText(/Some blogs that I follow, in no particular order/i),
    ).toBeVisible();
  });

  test.describe("Entries", () => {
    test("should list every blog exactly once", async ({ page }) => {
      await expect(page.locator(`${LIST} a`)).toHaveCount(BLOGS.length);
      for (const { name } of BLOGS) {
        await expect(entry(page, name)).toHaveCount(1);
      }
    });

    for (const { name, href } of BLOGS) {
      test(`${name} points at the right URL and opens in a new tab`, async ({
        page,
      }) => {
        const link = entry(page, name);
        await expect(link).toHaveAttribute("href", href);
        await expect(link).toHaveAttribute("target", "_blank");
        await expect(link).toHaveAttribute("rel", "noopener noreferrer");
      });
    }

    test("every entry carries a description", async ({ page }) => {
      // The names alone were the whole page once; the descriptions are what
      // make it worth reading, so an entry added without one should fail here.
      const described = await page
        .locator(`${LIST} > li`)
        .evaluateAll((items) =>
          items.every((li) => /\s–\s\S/.test(li.textContent)),
        );
      expect(described).toBe(true);
    });
  });

  test.describe("Nesting", () => {
    test("Jim Grey's two blogs sit in a sub-list inside his entry", async ({
      page,
    }) => {
      const jimGrey = page
        .locator(`${LIST} > li`)
        .filter({ hasText: "Jim Grey" });
      await expect(jimGrey).toHaveCount(1);

      // A sibling <ul> — the previous, invalid markup — would leave this at 0.
      const sublist = jimGrey.locator("ul");
      await expect(sublist).toHaveCount(1);
      await expect(sublist.locator("a")).toHaveCount(2);
    });

    test("both lists render bullets", async ({ page }) => {
      // Preflight sets list-style:none; these come from list-disc / list-[circle].
      await expect(page.locator(LIST)).toHaveCSS("list-style-type", "disc");
      await expect(page.locator(`${LIST} ul`)).toHaveCSS(
        "list-style-type",
        "circle",
      );
    });

    test("the sub-list is indented past its parent entry", async ({ page }) => {
      const left = (selector) =>
        page
          .locator(selector)
          .first()
          .evaluate((el) => Math.round(el.getBoundingClientRect().left));

      const parent = await left(`${LIST} > li`);
      const child = await left(`${LIST} ul > li`);
      expect(child).toBeGreaterThan(parent);
    });
  });

  test.describe("Layout", () => {
    test("the list is held to the same measure as the header", async ({
      page,
    }) => {
      // main is max-w-[1040px]; without its own cap the list would run the full
      // width and the descriptions would read at ~990px.
      const width = await page
        .locator(LIST)
        .evaluate((el) => el.getBoundingClientRect().width);
      expect(width).toBeLessThanOrEqual(720);
    });

    test("should not overflow horizontally on mobile", async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      const overflows = await page.evaluate(
        () =>
          document.documentElement.scrollWidth >
          document.documentElement.clientWidth,
      );
      expect(overflows).toBe(false);
    });
  });

  test.describe("Accessibility", () => {
    test("should have proper heading hierarchy", async ({ page }) => {
      await expect(
        page.getByRole("heading", { level: 1, name: "Blogroll" }),
      ).toBeVisible();
    });

    test("the entries form a real list", async ({ page }) => {
      // Screen readers announce item counts from list semantics; a stack of
      // <div>s would read as undifferentiated text.
      await expect(page.locator(LIST)).toHaveRole("list");
      await expect(page.locator(`${LIST} > li`).first()).toHaveRole("listitem");
    });
  });
});
