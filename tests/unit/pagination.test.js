import { describe, it, expect } from "vitest";
import { buildPageList } from "../../lib/pagination";

describe("buildPageList", () => {
  it("returns an empty list when there are no pages", () => {
    expect(buildPageList(1, 0)).toEqual([]);
    expect(buildPageList(1, -3)).toEqual([]);
    expect(buildPageList(1, NaN)).toEqual([]);
  });

  it("returns a single page without gaps", () => {
    expect(buildPageList(1, 1)).toEqual([1]);
  });

  it("lists every page when they all fit", () => {
    expect(buildPageList(1, 2)).toEqual([1, 2]);
    expect(buildPageList(2, 3)).toEqual([1, 2, 3]);
    expect(buildPageList(3, 4)).toEqual([1, 2, 3, 4]);
    expect(buildPageList(2, 4)).toEqual([1, 2, 3, 4]);
  });

  it("windows around the current page in a long list", () => {
    expect(buildPageList(1, 29)).toEqual([1, 2, null, 29]);
    expect(buildPageList(2, 29)).toEqual([1, 2, 3, null, 29]);
    expect(buildPageList(15, 29)).toEqual([1, null, 14, 15, 16, null, 29]);
    expect(buildPageList(29, 29)).toEqual([1, null, 28, 29]);
  });

  it("renders a single skipped page rather than an ellipsis", () => {
    // Current page 4 leaves only page 2 between 1 and 3 — render it, since an
    // ellipsis would occupy the same space while being less useful. The 6-page
    // gap on the other side still collapses.
    expect(buildPageList(4, 10)).toEqual([1, 2, 3, 4, 5, null, 10]);
    expect(buildPageList(3, 10)).toEqual([1, 2, 3, 4, null, 10]);
    // Two or more skipped pages do collapse.
    expect(buildPageList(1, 5)).toEqual([1, 2, null, 5]);
  });

  it("always includes the first and last page", () => {
    for (const current of [1, 7, 14, 22, 29]) {
      const list = buildPageList(current, 29);
      expect(list[0]).toBe(1);
      expect(list[list.length - 1]).toBe(29);
    }
  });

  it("always includes the current page", () => {
    for (let current = 1; current <= 29; current++) {
      expect(buildPageList(current, 29)).toContain(current);
    }
  });

  it("never emits duplicate or out-of-range page numbers", () => {
    for (let current = 1; current <= 29; current++) {
      const numbers = buildPageList(current, 29).filter((p) => p !== null);
      expect(new Set(numbers).size).toBe(numbers.length);
      expect(Math.min(...numbers)).toBeGreaterThanOrEqual(1);
      expect(Math.max(...numbers)).toBeLessThanOrEqual(29);
      expect([...numbers].sort((a, b) => a - b)).toEqual(numbers);
    }
  });

  it("honours a wider span", () => {
    expect(buildPageList(10, 29, 2)).toEqual([1, null, 8, 9, 10, 11, 12, null, 29]);
  });
});
