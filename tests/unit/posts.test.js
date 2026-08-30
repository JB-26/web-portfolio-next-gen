import { describe, it, expect, vi, beforeEach } from "vitest";

// lib/posts.js reads the real /posts directory at call time. Mocking `fs` lets
// the data layer's own logic — ordering, tag filtering, reading time, related
// post scoring — be tested against a fixed corpus instead of 148 real files
// whose content would change the expected values on every new post.
vi.mock("fs", () => {
  const readdirSync = vi.fn();
  const readFileSync = vi.fn();
  return { default: { readdirSync, readFileSync }, readdirSync, readFileSync };
});

import fs from "fs";
import {
  getSortedPostsData,
  getAllPostIds,
  getPostsByTag,
  getAllTags,
  getRelatedPosts,
  buildExcerpt,
} from "../../lib/posts";

const md = ({ title, date, tags, description, body = "word" }) =>
  [
    "---",
    `title: "${title}"`,
    `date: "${date}"`,
    description ? `description: "${description}"` : null,
    tags ? `tags: [${tags.map((t) => `"${t}"`).join(", ")}]` : null,
    "---",
    "",
    body,
  ]
    .filter((line) => line !== null)
    .join("\n");

// Deliberately out of date order on disk, the way readdirSync returns them.
const CORPUS = {
  "2024-01-01-alpha.md": md({
    title: "Alpha",
    date: "2024-01-01",
    tags: ["Blog", "Python"],
  }),
  "2026-05-05-charlie.md": md({
    title: "Charlie",
    date: "2026-05-05",
    tags: ["Python"],
  }),
  "2025-03-03-bravo.md": md({
    title: "Bravo",
    date: "2025-03-03",
    tags: ["Blog"],
    description: "Bravo's description",
  }),
  "2023-02-02-delta.md": md({ title: "Delta", date: "2023-02-02" }),
};

beforeEach(() => {
  vi.clearAllMocks();
  fs.readdirSync.mockReturnValue(Object.keys(CORPUS));
  fs.readFileSync.mockImplementation((fullPath) => {
    const name = String(fullPath).split("/").pop();
    if (!(name in CORPUS)) throw new Error(`ENOENT: ${name}`);
    return CORPUS[name];
  });
});

describe("getSortedPostsData", () => {
  it("returns every post", () => {
    expect(getSortedPostsData()).toHaveLength(4);
  });

  it("sorts newest first regardless of directory order", () => {
    expect(getSortedPostsData().map((p) => p.id)).toEqual([
      "2026-05-05-charlie",
      "2025-03-03-bravo",
      "2024-01-01-alpha",
      "2023-02-02-delta",
    ]);
  });

  it("strips the .md extension to form the id", () => {
    expect(getSortedPostsData().every((p) => !p.id.endsWith(".md"))).toBe(true);
  });

  it("defaults tags to an empty array when frontmatter omits them", () => {
    const delta = getSortedPostsData().find((p) => p.id === "2023-02-02-delta");
    expect(delta.tags).toEqual([]);
  });

  it("carries frontmatter through onto the post object", () => {
    const bravo = getSortedPostsData().find((p) => p.id === "2025-03-03-bravo");
    expect(bravo.title).toBe("Bravo");
    expect(bravo.description).toBe("Bravo's description");
  });

  it("attaches a reading time to every post", () => {
    expect(
      getSortedPostsData().every((p) => /^\d+ min read$/.test(p.readingTime)),
    ).toBe(true);
  });
});

describe("reading time", () => {
  const withBody = (body) => {
    fs.readdirSync.mockReturnValue(["2024-01-01-alpha.md"]);
    fs.readFileSync.mockReturnValue(
      md({ title: "Alpha", date: "2024-01-01", body }),
    );
    return getSortedPostsData()[0].readingTime;
  };

  it("rounds up, so a very short post is still 1 min", () => {
    expect(withBody("just a few words")).toBe("1 min read");
  });

  it("counts 200 words as 1 minute", () => {
    expect(withBody(Array(200).fill("word").join(" "))).toBe("1 min read");
  });

  it("rounds 201 words up to 2 minutes", () => {
    expect(withBody(Array(201).fill("word").join(" "))).toBe("2 min read");
  });

  it("treats runs of whitespace and newlines as single separators", () => {
    expect(withBody("one\n\ntwo    three\tfour")).toBe("1 min read");
  });
});

describe("getAllPostIds", () => {
  it("returns one params object per post, without the extension", () => {
    expect(getAllPostIds()).toEqual([
      { params: { id: "2024-01-01-alpha" } },
      { params: { id: "2026-05-05-charlie" } },
      { params: { id: "2025-03-03-bravo" } },
      { params: { id: "2023-02-02-delta" } },
    ]);
  });
});

describe("getPostsByTag", () => {
  it("returns only posts carrying the tag, newest first", () => {
    expect(getPostsByTag("Python").map((p) => p.id)).toEqual([
      "2026-05-05-charlie",
      "2024-01-01-alpha",
    ]);
  });

  it("returns an empty array for an unknown tag", () => {
    expect(getPostsByTag("Nonexistent")).toEqual([]);
  });

  it("is case sensitive, matching the tag URLs the site generates", () => {
    expect(getPostsByTag("python")).toEqual([]);
  });

  it("does not throw on posts with no tags", () => {
    expect(() => getPostsByTag("Blog")).not.toThrow();
    expect(getPostsByTag("Blog").map((p) => p.id)).toEqual([
      "2025-03-03-bravo",
      "2024-01-01-alpha",
    ]);
  });
});

describe("getAllTags", () => {
  it("returns each tag once", () => {
    expect(getAllTags().sort()).toEqual(["Blog", "Python"]);
  });

  it("returns an empty array when no post is tagged", () => {
    fs.readdirSync.mockReturnValue(["2023-02-02-delta.md"]);
    expect(getAllTags()).toEqual([]);
  });
});

describe("getRelatedPosts", () => {
  it("returns an empty array when the post has no tags", () => {
    expect(getRelatedPosts("2023-02-02-delta", [])).toEqual([]);
    expect(getRelatedPosts("2023-02-02-delta", undefined)).toEqual([]);
  });

  it("excludes the current post", () => {
    const related = getRelatedPosts("2024-01-01-alpha", ["Blog", "Python"]);
    expect(related.map((p) => p.id)).not.toContain("2024-01-01-alpha");
  });

  it("only returns posts sharing at least one tag", () => {
    const related = getRelatedPosts("2024-01-01-alpha", ["Python"]);
    expect(related.map((p) => p.id)).toEqual(["2026-05-05-charlie"]);
  });

  it("ranks posts sharing more tags first", () => {
    // Echo shares both tags with the query; charlie and bravo share one each.
    fs.readdirSync.mockReturnValue([...Object.keys(CORPUS), "2020-01-01-echo.md"]);
    const withEcho = {
      ...CORPUS,
      "2020-01-01-echo.md": md({
        title: "Echo",
        date: "2020-01-01",
        tags: ["Blog", "Python"],
      }),
    };
    fs.readFileSync.mockImplementation((p) => withEcho[String(p).split("/").pop()]);

    const related = getRelatedPosts("2024-01-01-alpha", ["Blog", "Python"]);
    // Echo is the oldest post in the corpus, so it can only lead on score.
    expect(related[0].id).toBe("2020-01-01-echo");
  });

  it("respects the limit", () => {
    expect(getRelatedPosts("2023-02-02-delta", ["Blog", "Python"], 1)).toHaveLength(1);
  });

  it("defaults to at most 3 related posts", () => {
    expect(
      getRelatedPosts("2023-02-02-delta", ["Blog", "Python"]).length,
    ).toBeLessThanOrEqual(3);
  });

  it("does not leak the internal sharedTags score onto returned posts", () => {
    const related = getRelatedPosts("2024-01-01-alpha", ["Python"]);
    expect(related[0]).not.toHaveProperty("sharedTags");
  });
});

describe("buildExcerpt", () => {
  it("returns an empty string for empty content", () => {
    expect(buildExcerpt("")).toBe("");
  });

  it("strips heading markers but keeps the words", () => {
    expect(buildExcerpt("## A heading\n\nSome prose.")).toBe(
      "A heading Some prose.",
    );
  });

  it("keeps link text and drops the URL", () => {
    expect(buildExcerpt("See [the docs](https://example.com/x) for more.")).toBe(
      "See the docs for more.",
    );
  });

  it("drops images entirely", () => {
    expect(buildExcerpt("Before ![alt text](https://x.com/y.png) after.")).toBe(
      "Before after.",
    );
  });

  it("drops fenced code blocks", () => {
    expect(buildExcerpt("Intro.\n\n```js\nconst x = 1;\n```\n\nOutro.")).toBe(
      "Intro. Outro.",
    );
  });

  it("strips raw HTML tags but keeps their text", () => {
    expect(buildExcerpt('<div class="x">Hello</div> world')).toBe("Hello world");
  });

  it("removes emphasis and inline code markers", () => {
    expect(buildExcerpt("A **bold** and _italic_ and `code` word")).toBe(
      "A bold and italic and code word",
    );
  });

  it("keeps hyphens inside words", () => {
    expect(buildExcerpt("A state-of-the-art build")).toBe(
      "A state-of-the-art build",
    );
  });

  it("strips list bullets and blockquote markers", () => {
    expect(buildExcerpt("- one\n- two\n\n> quoted")).toBe("one two quoted");
  });

  it("truncates on a word boundary and appends an ellipsis", () => {
    const excerpt = buildExcerpt(`${"word ".repeat(80)}`, 30);
    expect(excerpt.length).toBeLessThanOrEqual(31);
    expect(excerpt.endsWith("…")).toBe(true);
    expect(excerpt).not.toMatch(/wor…$/);
  });

  it("does not truncate content already within the limit", () => {
    expect(buildExcerpt("Short enough.", 155)).toBe("Short enough.");
  });
});

describe("non-markdown files in the posts directory", () => {
  it("ignores entries that are not .md", () => {
    // readdirSync returns every directory entry. Before these were filtered,
    // a .DS_Store became a post id and readFileSync(".DS_Store.md") threw,
    // 500ing /rss.xml and /sitemap.xml.
    fs.readdirSync.mockReturnValue([
      ".DS_Store",
      "images",
      "2024-01-01-alpha.md.swp",
      "2024-01-01-alpha.md",
    ]);

    expect(getSortedPostsData().map((p) => p.id)).toEqual(["2024-01-01-alpha"]);
    expect(getAllPostIds()).toEqual([{ params: { id: "2024-01-01-alpha" } }]);
  });

  it("excludes template.md, which is scaffolding rather than a post", () => {
    // Gitignored so it never ships, but present locally, where it would
    // otherwise render as /posts/template with an empty body and appear in
    // the blog listing, the sitemap and the feed.
    fs.readdirSync.mockReturnValue(["template.md", "2024-01-01-alpha.md"]);

    expect(getSortedPostsData().map((p) => p.id)).toEqual(["2024-01-01-alpha"]);
    expect(getAllPostIds()).toEqual([{ params: { id: "2024-01-01-alpha" } }]);
  });

  it("keeps posts that are not date-prefixed", () => {
    // new-website.md and tic-tac-toe-python-07-11-2020.md are real posts, so
    // filtering on a date prefix would silently drop them.
    fs.readdirSync.mockReturnValue(["new-website.md", "2024-01-01-alpha.md"]);
    fs.readFileSync.mockImplementation((path) =>
      String(path).includes("new-website")
        ? md({ title: "New website", date: "2020-06-01" })
        : CORPUS["2024-01-01-alpha.md"],
    );

    expect(getSortedPostsData().map((p) => p.id).sort()).toEqual([
      "2024-01-01-alpha",
      "new-website",
    ]);
  });

  it("keeps a .md.md file, whose id legitimately ends in .md", () => {
    fs.readdirSync.mockReturnValue(["2021-11-21-coding-problems-two.md.md"]);
    fs.readFileSync.mockReturnValue(md({ title: "Two", date: "2021-11-21" }));

    expect(getSortedPostsData()[0].id).toBe("2021-11-21-coding-problems-two.md");
  });
});
