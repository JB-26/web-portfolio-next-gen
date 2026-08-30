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
