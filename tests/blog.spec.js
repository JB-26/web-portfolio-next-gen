import { test, expect } from "@playwright/test";

const BASE = "http://localhost:3000";

test("Page loads successfully", async ({ page }) => {
  await page.goto(`${BASE}/blog`); // Update the URL as needed
  const title = await page.title();
  expect(title).toBe("Joshua Blewitt"); // Update with your actual site title
});

test("Check for important content", async ({ page }) => {
  await page.goto(`${BASE}/blog`); // Update the URL as needed

  const pinned = await page.textContent('[data-testid="pinned"]');
  expect(pinned).toBe("📌 Pinned");

  await expect(page.locator('[data-testid="blog-posts"]')).toContainText(
    "Blog",
  );
});

test("Pinned post shows a reading time estimate", async ({ page }) => {
  await page.goto(`${BASE}/blog`);

  const pinnedReadingTime = page.locator('[data-testid="pinned-reading-time"]');
  await expect(pinnedReadingTime).toBeVisible();
  await expect(pinnedReadingTime).toContainText("min read");
});

test("Every post in the blog listing shows a reading time estimate", async ({ page }) => {
  await page.goto(`${BASE}/blog`);

  const readingTimes = page.locator('[data-testid="post-reading-time"]');
  const count = await readingTimes.count();
  expect(count).toBeGreaterThan(0);

  for (let i = 0; i < count; i++) {
    await expect(readingTimes.nth(i)).toContainText("min read");
  }
});

test("Pinned post is excluded from the paginated list", async ({ page }) => {
  await page.goto(`${BASE}/blog`);

  const pinnedHref = await page
    .locator('[data-testid="pinned"]')
    .locator("xpath=ancestor::a[1]")
    .getAttribute("href");
  expect(pinnedHref).toBeTruthy();

  const rowHrefs = await page
    .locator('[data-testid="post-list-item"]')
    .evaluateAll((rows) => rows.map((r) => r.getAttribute("href")));

  expect(rowHrefs).not.toContain(pinnedHref);
});

test("Blog index shows exactly one page of posts and a counter", async ({
  page,
}) => {
  await page.goto(`${BASE}/blog`);

  await expect(page.locator('[data-testid="post-list-item"]')).toHaveCount(5);
  await expect(page.locator('[data-testid="post-counter"]')).toContainText(
    "page 1 of",
  );
});

test("Pagination disables Newer on the first page and links Older", async ({
  page,
}) => {
  await page.goto(`${BASE}/blog`);

  const nav = page.locator('[data-testid="pagination"]');
  await expect(nav).toBeVisible();

  // Current page is marked, and page 1 has no "Newer" link.
  await expect(nav.locator('[aria-current="page"]')).toHaveText("1");
  await expect(nav.getByRole("link", { name: "Newer" })).toHaveCount(0);
  await expect(nav.getByRole("link", { name: "Older" })).toHaveCount(1);
});

test("Older advances to page 2 and keeps the pinned card", async ({ page }) => {
  await page.goto(`${BASE}/blog`);
  await page.getByRole("link", { name: "Older" }).click();

  await expect(page).toHaveURL(`${BASE}/page/2`);
  await expect(
    page.locator('[data-testid="pagination"] [aria-current="page"]'),
  ).toHaveText("2");
  await expect(page.locator('[data-testid="pinned"]')).toBeVisible();
  await expect(page.locator('[data-testid="post-list-item"]')).toHaveCount(5);
});

test("Last page disables Older", async ({ page }) => {
  await page.goto(`${BASE}/blog`);

  const lastPage = await page
    .locator('[data-testid="pagination"] ol li a')
    .last()
    .getAttribute("href");
  await page.goto(`${BASE}${lastPage}`);

  const nav = page.locator('[data-testid="pagination"]');
  await expect(nav.getByRole("link", { name: "Older" })).toHaveCount(0);
  await expect(nav.getByRole("link", { name: "Newer" })).toHaveCount(1);
});

// --- Mobile: these rows must stay on a single line -------------------------

const rowCount = (page, selector) =>
  page.locator(selector).evaluateAll(
    (els) => new Set(els.map((el) => Math.round(el.getBoundingClientRect().top))).size,
  );

for (const width of [375, 390]) {
  test(`Pagination, header and footer each stay on one line at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto(`${BASE}/page/3`);

    // Each of these wrapped at some point during the redesign: the pagination
    // orphaned "Older" onto its own line, the footer orphaned "RSS", and
    // widening the theme pill pushed the nav onto two rows.
    await expect.poll(() => rowCount(page, '[data-testid="pagination"] > *')).toBe(1);
    await expect.poll(() => rowCount(page, "header nav > *")).toBe(1);
    await expect.poll(() => rowCount(page, "footer ul li")).toBe(1);

    await expect
      .poll(() =>
        page.evaluate(
          () =>
            document.documentElement.scrollWidth >
            document.documentElement.clientWidth,
        ),
      )
      .toBe(false);
  });
}

test("Header stays on one line in dark mode, where the toggle label is widest", async ({
  page,
}) => {
  // "☀ Light" is wider than "☾ Dark", so dark mode is the worst case for the
  // header's width budget.
  await page.addInitScript(() => {
    try {
      window.localStorage.setItem("theme", "dark");
    } catch {}
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${BASE}/blog`);

  await expect(page.locator('[data-testid="theme-toggle"]')).toContainText("Light");
  await expect.poll(() => rowCount(page, "header nav > *")).toBe(1);
});
