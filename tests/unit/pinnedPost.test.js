import { describe, it, expect, vi, afterEach } from "vitest";
import { selectPinnedPost, selectUnpinnedPosts } from "../../lib/posts";

// Posts arrive newest-first, matching getSortedPostsData().
const post = (id, date, extra = {}) => ({ id, date, title: id, ...extra });

const corpus = [
  post("2026-06-28-newest", "2026-06-28"),
  post("2026-05-31-second", "2026-05-31"),
  post("2026-03-26-third", "2026-03-26"),
  post("2025-12-13-oldest", "2025-12-13"),
];

afterEach(() => {
  vi.restoreAllMocks();
});

describe("selectPinnedPost", () => {
  it("returns null when no post is pinned", () => {
    expect(selectPinnedPost(corpus)).toBeNull();
  });

  it("returns null for an empty corpus", () => {
    expect(selectPinnedPost([])).toBeNull();
  });

  it("returns the single pinned post", () => {
    const posts = [
      corpus[0],
      { ...corpus[1], pinned: true },
      corpus[2],
      corpus[3],
    ];
    expect(selectPinnedPost(posts).id).toBe("2026-05-31-second");
  });

  it("ignores a falsy or non-boolean pinned value", () => {
    const posts = [
      { ...corpus[0], pinned: false },
      { ...corpus[1], pinned: "yes" },
      { ...corpus[2], pinned: 0 },
    ];
    expect(selectPinnedPost(posts)).toBeNull();
  });

  it("picks the most recent when several posts are pinned, and warns", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const posts = [
      corpus[0],
      { ...corpus[1], pinned: true },
      { ...corpus[2], pinned: true },
      { ...corpus[3], pinned: true },
    ];

    expect(selectPinnedPost(posts).id).toBe("2026-05-31-second");
    expect(warn).toHaveBeenCalledOnce();
    expect(warn.mock.calls[0][0]).toContain("2026-03-26-third");
  });

  it("does not warn when exactly one post is pinned", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    selectPinnedPost([{ ...corpus[0], pinned: true }, corpus[1]]);
    expect(warn).not.toHaveBeenCalled();
  });

  it("handles the pinned post also being the newest", () => {
    const posts = [{ ...corpus[0], pinned: true }, ...corpus.slice(1)];
    expect(selectPinnedPost(posts).id).toBe("2026-06-28-newest");
  });
});

describe("selectUnpinnedPosts", () => {
  it("returns every post when none is pinned", () => {
    expect(selectUnpinnedPosts(corpus)).toHaveLength(4);
  });

  it("excludes the pinned post", () => {
    const posts = [corpus[0], { ...corpus[1], pinned: true }, corpus[2]];
    const unpinned = selectUnpinnedPosts(posts);

    expect(unpinned).toHaveLength(2);
    expect(unpinned.map((p) => p.id)).not.toContain("2026-05-31-second");
  });

  it("preserves newest-first ordering", () => {
    const posts = [corpus[0], { ...corpus[1], pinned: true }, corpus[2], corpus[3]];
    expect(selectUnpinnedPosts(posts).map((p) => p.id)).toEqual([
      "2026-06-28-newest",
      "2026-03-26-third",
      "2025-12-13-oldest",
    ]);
  });

  it("excludes every pinned post when several are flagged", () => {
    const posts = corpus.map((p) => ({ ...p, pinned: true }));
    expect(selectUnpinnedPosts(posts)).toHaveLength(0);
  });

  it("pinned and unpinned partition the corpus exactly", () => {
    const posts = [corpus[0], { ...corpus[1], pinned: true }, corpus[2], corpus[3]];
    const pinned = selectPinnedPost(posts);
    const unpinned = selectUnpinnedPosts(posts);

    expect(unpinned).toHaveLength(posts.length - 1);
    expect(unpinned).not.toContainEqual(pinned);
  });
});
