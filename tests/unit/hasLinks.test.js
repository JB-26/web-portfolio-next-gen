/**
 * HL — hasLinks() unit tests
 *
 * Covers cases HL-01 through HL-13 from the QA Test Plan.
 * Import source: lib/comments/sanitize (TS Architect owns the implementation).
 *
 * hasLinks(text: string): boolean
 *   Returns true when the text contains any URL-like pattern that should be
 *   rejected in a comment body.
 */

import { describe, expect, test } from "vitest";
import { hasLinks } from "../../lib/comments/sanitize.js";

describe("hasLinks()", () => {
  // HL-01: full https URL
  test("HL-01: detects https:// URL", () => {
    expect(hasLinks("Visit https://example.com for more.")).toBe(true);
  });

  // HL-02: full http URL
  test("HL-02: detects http:// URL", () => {
    expect(hasLinks("See http://example.com")).toBe(true);
  });

  // HL-03: www. prefix without scheme
  test("HL-03: detects www. prefix without scheme", () => {
    expect(hasLinks("Check out www.example.com")).toBe(true);
  });

  // HL-04: bare .com TLD (e.g. "evil.com")
  test("HL-04: detects bare .com domain", () => {
    expect(hasLinks("Visit evil.com today")).toBe(true);
  });

  // HL-05: bare .io TLD
  test("HL-05: detects bare .io domain", () => {
    expect(hasLinks("Built with startup.io tools")).toBe(true);
  });

  // HL-06: bare .co TLD
  test("HL-06: detects bare .co domain", () => {
    expect(hasLinks("See shop.co for deals")).toBe(true);
  });

  // HL-07: bare .dev TLD
  test("HL-07: detects bare .dev domain", () => {
    expect(hasLinks("My blog at blog.dev is great")).toBe(true);
  });

  // HL-08: false positive guard — file extension ".csv" should NOT trigger
  test("HL-08: does not flag a .csv file reference as a link", () => {
    expect(hasLinks("Download the data.csv file from the repo")).toBe(false);
  });

  // HL-09: empty string
  test("HL-09: returns false for empty string", () => {
    expect(hasLinks("")).toBe(false);
  });

  // HL-10: max-length plain text with no URL patterns (1000 chars)
  test("HL-10: returns false for 1000-char text with no link patterns", () => {
    const longText = "a".repeat(997) + "bcd"; // 1000 chars, no dots or slashes forming URLs
    expect(hasLinks(longText)).toBe(false);
  });

  // HL-11: intentional flag — "home.com" is a real TLD pattern, must be caught
  test("HL-11: detects home.com as a link (intentional flag)", () => {
    expect(hasLinks("I love my home.com setup")).toBe(true);
  });

  // HL-12: URL embedded mid-sentence without trailing space
  test("HL-12: detects URL embedded at end of sentence with punctuation", () => {
    expect(hasLinks("See https://example.com.")).toBe(true);
  });

  // HL-13: obfuscated URL using hxxps:// — documented gap, library does not catch
  test.skip("HL-13: detects obfuscated hxxps:// URL [KNOWN GAP — bad-words/regex does not decode hxxps]", () => {
    expect(hasLinks("Visit hxxps://evil.com")).toBe(true);
  });
});
