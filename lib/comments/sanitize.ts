/**
 * Link detection for comment bodies.
 *
 * Matches (case-insensitive):
 *   - Explicit URLs starting with `http://` or `https://`
 *   - Explicit URLs starting with `www.`
 *   - Bare domains ending in `.com`, `.net`, `.org`, `.io`, `.co`, or `.dev`
 *
 * Intentional trade-offs (documented in QA plan):
 *   - `home.com` in prose is flagged on purpose (noise > false-negative risk).
 *   - Obfuscated schemes like `hxxps://` are NOT detected (documented gap).
 */
export const URL_RE =
  /\b(?:https?:\/\/|www\.)\S+|\S+\.(?:com|net|org|io|co|dev)\b/i;

/**
 * Returns `true` if the given text contains anything that looks like a link.
 * Used by the Zod refinement in `lib/comments/schema.ts` so submissions with
 * links are rejected with a `422 LINKS` response.
 */
export function hasLinks(text: string): boolean {
  return URL_RE.test(text);
}
