/**
 * Thin wrapper around Vercel Analytics `track()` that ALSO records the
 * last fired event on `window.__lastTrackedEvent` so Playwright tests can
 * assert which event fired without depending on the analytics beacon
 * actually leaving the browser (which it doesn't in dev mode).
 *
 * Production behaviour is identical to calling `track()` directly — the
 * window assignment is a no-op nobody reads in production. Phase 6 QA plan
 * documents this seam under "Implementation Notes for the Solution
 * Architect" → "Analytics intercept pattern".
 *
 * @param {string} name — Custom event name (e.g. "comment_submitted").
 * @param {Record<string, unknown>} [properties] — Optional event properties.
 */
import { track } from "@vercel/analytics";

export function trackEvent(name, properties) {
  track(name, properties);
  if (typeof window !== "undefined") {
    window.__lastTrackedEvent = {
      name,
      properties: properties ?? null,
      at: Date.now(),
    };
  }
}
