import { test, expect } from "@playwright/test";

const BASE = "http://localhost:3000";
const FEED = `${BASE}/rss.xml`;

// Mirrors RSS_ITEM_LIMIT in pages/api/rss.js. The feed used to be unbounded.
const ITEM_LIMIT = 20;

async function feedText(request) {
  const response = await request.get(FEED);
  expect(response.status()).toBe(200);
  return response.text();
}

test("serves the feed at /rss.xml as XML", async ({ request }) => {
  const response = await request.get(FEED);

  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain("xml");
});

test("is well-formed XML", async ({ page, request }) => {
  const xml = await feedText(request);

  // DOMParser reports malformed input as a <parsererror> element rather than
  // throwing, so a truncated or unescaped feed is caught here.
  const parserError = await page.evaluate((source) => {
    const doc = new DOMParser().parseFromString(source, "application/xml");
    return doc.querySelector("parsererror")?.textContent ?? null;
  }, xml);

  expect(parserError).toBeNull();
});

test("caps the number of items", async ({ request }) => {
  const xml = await feedText(request);
  const items = xml.match(/<item>/g) ?? [];

  expect(items.length).toBeGreaterThan(0);
  expect(items.length).toBeLessThanOrEqual(ITEM_LIMIT);
});

test("every item has a title, description and body", async ({ page, request }) => {
  const xml = await feedText(request);

  const items = await page.evaluate((source) => {
    const doc = new DOMParser().parseFromString(source, "application/xml");
    return [...doc.querySelectorAll("item")].map((item) => ({
      title: item.querySelector("title")?.textContent ?? "",
      description: item.querySelector("description")?.textContent ?? "",
      // content:encoded — querySelector cannot use the prefix directly.
      content:
        [...item.children].find((c) => c.nodeName === "content:encoded")
          ?.textContent ?? "",
    }));
  }, xml);

  expect(items.length).toBeGreaterThan(0);
  for (const item of items) {
    expect(item.title.trim()).not.toBe("");
    expect(item.description.trim()).not.toBe("");
    // 71 posts have no frontmatter description; the handler falls back to the
    // title rather than emitting the string "undefined".
    expect(item.description).not.toContain("undefined");
    expect(item.content.trim()).not.toBe("");
  }
});

test("item links and guids are absolute permalinks", async ({ page, request }) => {
  const xml = await feedText(request);

  const items = await page.evaluate((source) => {
    const doc = new DOMParser().parseFromString(source, "application/xml");
    return [...doc.querySelectorAll("item")].map((item) => ({
      link: item.querySelector("link")?.textContent ?? "",
      guid: item.querySelector("guid")?.textContent ?? "",
    }));
  }, xml);

  for (const item of items) {
    expect(item.link).toMatch(/^https:\/\/[^/]+\/posts\/.+/);
    // guid was the bare slug, which is neither unique nor resolvable.
    expect(item.guid).toBe(item.link);
  }
});

test("items are ordered newest first", async ({ page, request }) => {
  const xml = await feedText(request);

  const dates = await page.evaluate((source) => {
    const doc = new DOMParser().parseFromString(source, "application/xml");
    return [...doc.querySelectorAll("item pubDate")].map((d) =>
      Date.parse(d.textContent ?? ""),
    );
  }, xml);

  expect(dates.length).toBeGreaterThan(1);
  expect(dates.every(Number.isFinite)).toBe(true);
  // Previously items were pushed from inside Promise.all, so their order
  // depended on which markdown file finished parsing first.
  expect([...dates].sort((a, b) => b - a)).toEqual(dates);
});

test("channel metadata points at the live site", async ({ page, request }) => {
  const xml = await feedText(request);

  const channel = await page.evaluate((source) => {
    const doc = new DOMParser().parseFromString(source, "application/xml");
    const el = (sel) => doc.querySelector(`channel > ${sel}`)?.textContent ?? "";
    return {
      title: el("title"),
      link: el("link"),
      image: doc.querySelector("channel > image > url")?.textContent ?? "",
    };
  }, xml);

  expect(channel.title.trim()).not.toBe("");
  expect(channel.link).toMatch(/^https:\/\//);
  // Was favicon.ico, which is not a usable channel image.
  expect(channel.image).toMatch(/\.(png|jpe?g)$/);
});

test("preserves raw HTML embedded in a post", async ({ page, request }) => {
  const xml = await feedText(request);

  // The old pipeline omitted allowDangerousHtml, so author-embedded raw HTML
  // (iframes, <img> tags) was stripped out of the feed body entirely.
  const hasRawHtml = await page.evaluate((source) => {
    const doc = new DOMParser().parseFromString(source, "application/xml");
    return [...doc.querySelectorAll("item")].some((item) => {
      const encoded = [...item.children].find(
        (c) => c.nodeName === "content:encoded",
      );
      return /<(iframe|img|div)\b/i.test(encoded?.textContent ?? "");
    });
  }, xml);

  expect(hasRawHtml).toBe(true);
});
