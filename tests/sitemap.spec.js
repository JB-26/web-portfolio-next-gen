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

test("robots.txt blocks AI training crawlers but allows search and user agents", async ({
  request,
}) => {
  const text = await (await request.get(`${BASE}/robots.txt`)).text();

  // Parse into groups so the assertions are about real precedence, not about
  // a substring appearing somewhere in the file.
  const groups = {};
  let current = null;
  for (const raw of text.split("\n")) {
    const line = raw.replace(/#.*$/, "").trim();
    if (!line) continue;
    const [field, ...rest] = line.split(":");
    const value = rest.join(":").trim();
    if (field.toLowerCase() === "user-agent") {
      current = value;
      groups[current] ??= [];
    } else if (current) {
      groups[current].push(`${field.trim()}: ${value}`);
    }
  }

  // GPTBot is not OAI-SearchBot; ClaudeBot is not Claude-SearchBot. The whole
  // point of this file is that those pairs are treated differently.
  for (const agent of [
    "GPTBot",
    "ClaudeBot",
    "Google-Extended",
    "Applebot-Extended",
    "CCBot",
  ]) {
    expect(groups[agent]).toContain("Disallow: /");
  }

  for (const agent of [
    "OAI-SearchBot",
    "Claude-SearchBot",
    "PerplexityBot",
    "ChatGPT-User",
    "Claude-User",
    "Perplexity-User",
  ]) {
    expect(groups[agent]).toContain("Allow: /");
    expect(groups[agent]).not.toContain("Disallow: /");
    // A named group does not inherit from "*", so the private paths must be
    // repeated in each one or they become crawlable for that agent.
    expect(groups[agent]).toContain("Disallow: /admin");
    expect(groups[agent]).toContain("Disallow: /owner/");
    expect(groups[agent]).toContain("Disallow: /api/");
  }

  expect(groups["*"]).toContain("Allow: /");
  expect(groups["*"]).not.toContain("Disallow: /");
});
