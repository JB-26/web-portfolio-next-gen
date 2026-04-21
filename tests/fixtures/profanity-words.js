/**
 * Profanity test fixtures — single source of truth for profanity inputs.
 *
 * Rules:
 * - Never hardcode slurs in individual test files; import from here.
 * - Keep this list minimal: one clearly-recognized word is enough to prove
 *   the bad-words library fires. The word chosen is in the bad-words default
 *   list and is mild enough to be unambiguous in a code-review context.
 * - Add l33t-speak / casing variants here if/when the library is extended to
 *   detect them, so tests stay in sync.
 */

/** A word that the bad-words library recognizes in its default list. */
export const KNOWN_PROFANE_WORD = "crap";

/**
 * The same word with mixed casing.
 * Used to verify case-insensitive detection.
 */
export const KNOWN_PROFANE_WORD_MIXED_CASE = "CrAp";

/**
 * A simple l33t-speak substitution that the bad-words library does NOT
 * currently detect by default.  Used as a documented gap (test.skip).
 * e.g. 'a' → '@'
 */
export const LEET_SPEAK_VARIANT = "cr@p";
