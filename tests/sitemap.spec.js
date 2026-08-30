import { test, expect } from "@playwright/test";

const BASE = "http://localhost:3000";

test("serves the sitemap at /sitemap.xml as XML", async ({ request }) => {
  const response = await request.get(`${BASE}/sitemap.xml`);

  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain("xml");
});

test("is well-formed and lists absolute URLs", async ({ page, request }) => {
  const xml = await (await request.get(`${BASE}/sitemap.xml`)).text();

  const result = await page.evaluate((source) => {
    const doc = new DOMParser().parseFromString(source, "application/xml");
    return {
      error: doc.querySelector("parsererror")?.textContent ?? null,
      locs: [...doc.querySelectorAll("url > loc")].map((l) => l.textContent),
    };
  }, xml);

  expect(result.error).toBeNull();
  expect(result.locs.length).toBeGreaterThan(50);
  expect(result.locs.every((loc) => loc.startsWith("https://"))).toBe(true);
});

test("includes the home page, blog and post URLs", async ({ request }) => {
  const xml = await (await request.get(`${BASE}/sitemap.xml`)).text();

  expect(xml).toContain("<loc>https://joshblewitt.dev/</loc>");
  expect(xml).toContain("<loc>https://joshblewitt.dev/blog</loc>");
  expect(xml).toMatch(/<loc>https:\/\/joshblewitt\.dev\/posts\/[^<]+<\/loc>/);
  expect(xml).toMatch(/<loc>https:\/\/joshblewitt\.dev\/tags\/[^<]+<\/loc>/);
});

test("omits paginated and non-indexable routes", async ({ request }) => {
  const xml = await (await request.get(`${BASE}/sitemap.xml`)).text();

  // /page/N duplicates /blog's content; /admin and /owner are private.
  expect(xml).not.toContain("/page/");
  expect(xml).not.toContain("/admin");
  expect(xml).not.toContain("/owner");
});

test("robots.txt points at the sitemap", async ({ request }) => {
  const response = await request.get(`${BASE}/robots.txt`);

  expect(response.status()).toBe(200);
  expect(await response.text()).toContain(
    "Sitemap: https://joshblewitt.dev/sitemap.xml",
  );
});
