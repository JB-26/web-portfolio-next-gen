/**
 * PF — containsProfanity() unit tests
 *
 * Covers cases PF-01 through PF-07 from the QA Test Plan.
 * Import source: lib/comments/profanity (TS Architect owns the implementation).
 * Test words imported from tests/fixtures/profanity-words.js — never hardcode
 * slurs directly in test files.
 *
 * containsProfanity(text: string): boolean
 *   Returns true when the text contains a word from the bad-words default list.
 */

import { describe, expect, test } from "vitest";
import { containsProfanity } from "../../lib/comments/profanity.js";
import {
  KNOWN_PROFANE_WORD,
  KNOWN_PROFANE_WORD_MIXED_CASE,
  LEET_SPEAK_VARIANT,
} from "../fixtures/profanity-words.js";

describe("containsProfanity()", () => {
  // PF-01: clean text returns false
  test("PF-01: returns false for clean, unremarkable text", () => {
    expect(containsProfanity("This is a great blog post, thank you!")).toBe(false);
  });

  // PF-02: known word from the bad-words default list
  test("PF-02: returns true for a known profane word", () => {
    expect(containsProfanity(`This is ${KNOWN_PROFANE_WORD}.`)).toBe(true);
  });

  // PF-03: Scunthorpe false-positive check — "classic" is a substring match risk
  // The bad-words library uses word-boundary matching; "classic" must not trigger.
  test("PF-03: Scunthorpe false-positive — 'classic' does not trigger", () => {
    expect(containsProfanity("That was a classic performance by the team.")).toBe(false);
  });

  // PF-04: mixed-case variant of a profane word
  test("PF-04: detects profanity regardless of case", () => {
    expect(containsProfanity(`I said ${KNOWN_PROFANE_WORD_MIXED_CASE}`)).toBe(true);
  });

  // PF-05: empty string
  test("PF-05: returns false for empty string", () => {
    expect(containsProfanity("")).toBe(false);
  });

  // PF-06: profane word buried inside a long sentence
  test("PF-06: detects profanity inside a long, otherwise clean sentence", () => {
    const longSentence = `I really enjoyed reading this article and found it insightful, though I think it is utter ${KNOWN_PROFANE_WORD} that the conclusion was so weak.`;
    expect(containsProfanity(longSentence)).toBe(true);
  });

  // PF-07: l33t-speak variant — documented gap; bad-words default list does not decode l33t
  test.skip("PF-07: detects l33t-speak substitution [KNOWN GAP — bad-words default list does not handle l33t variants]", () => {
    expect(containsProfanity(`This is ${LEET_SPEAK_VARIANT} content`)).toBe(true);
  });
});
