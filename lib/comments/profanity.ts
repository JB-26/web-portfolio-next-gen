/**
 * Profanity check wrapper around the `bad-words` library.
 *
 * We construct the filter lazily and reuse a singleton — the word list is
 * non-trivial in size and the filter is stateless between calls. This module
 * is imported only by server-side code (API routes + Zod refinement on the
 * server). Do not import it from client components.
 */
import { Filter } from "bad-words";

let filter: Filter | null = null;

function getFilter(): Filter {
  if (filter === null) {
    filter = new Filter();
  }
  return filter;
}

/**
 * Returns `true` if the text matches the default `bad-words` dictionary.
 * Known limitations (documented in QA plan):
 *   - Scunthorpe-style false positives are possible with the default list.
 *   - l33t-speak ("sh1t") is not reliably caught.
 * The profanity check is a best-effort filter, not a security boundary.
 */
export function containsProfanity(text: string): boolean {
  if (text.length === 0) return false;
  return getFilter().isProfane(text);
}
