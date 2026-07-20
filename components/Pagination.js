import Link from "next/link";
import { buildPageList } from "../lib/pagination";

// "Newer" moves toward page 1 (newest posts); "Older" moves toward the last.
// Next.js resets scroll position on a route change, which satisfies the
// design's "page change scrolls to top" without an explicit window.scrollTo.

const numberBase =
  "inline-flex min-h-11 items-center justify-center rounded-lg border px-3 py-1.5 font-mono text-[13.5px] no-underline lg:min-h-0";

// The full "← Newer" / "Older →" labels don't fit beside the page numbers on a
// phone: at 390px the row needs 389px against 342px of content width, which
// orphaned "Older →" onto its own line. Below sm the word is visually hidden
// and only the arrow shows, which brings the row to ~295px. The word stays in
// the accessibility tree at every size, so the link is still announced as
// "Newer"/"Older" rather than a bare arrow.
function Arrow({ word, arrow, before, href, disabled }) {
  const content = (
    <>
      {before ? <span aria-hidden="true">{arrow}</span> : null}
      <span className="sr-only sm:not-sr-only">{word}</span>
      {before ? null : <span aria-hidden="true">{arrow}</span>}
    </>
  );

  if (disabled) {
    // The handoff renders disabled arrows in --line. That's a border colour:
    // as text it lands at 1.21:1 against the page, which axe flags as a
    // serious violation and which is genuinely unreadable. WCAG exempts
    // inactive controls from contrast, but "technically exempt" and "nobody
    // can read it" are different things, so this uses --faint (4.55:1 light,
    // 5.00:1 dark) — still clearly recessive next to the accent-coloured
    // active arrow, but legible.
    //
    // Not aria-hidden either: a sighted user sees "← Newer" greyed out, so
    // hiding it from assistive tech would describe a different page. It's
    // plain text, not a control, which is what it now looks like.
    return (
      <span className="inline-flex min-h-11 items-center gap-1.5 text-[15px] text-faint lg:min-h-0">
        {content}
      </span>
    );
  }
  return (
    <Link
      href={href}
      className="inline-flex min-h-11 items-center gap-1.5 text-[15px] font-semibold text-accent no-underline hover:text-ink lg:min-h-0"
    >
      {content}
    </Link>
  );
}

export default function Pagination({ currentPage, numPages, hrefFor }) {
  if (numPages <= 1) return null;

  const pages = buildPageList(currentPage, numPages);

  return (
    <nav
      aria-label="Blog pagination"
      data-testid="pagination"
      className="flex items-center justify-between gap-3 border-t border-line py-6 lg:gap-4"
    >
      <Arrow
        word="Newer"
        arrow="←"
        before
        href={hrefFor(currentPage - 1)}
        disabled={currentPage <= 1}
      />

      <ol className="m-0 flex list-none flex-wrap items-center justify-center gap-2 p-0">
        {pages.map((page, i) =>
          page === null ? (
            <li
              key={`gap-${i}`}
              aria-hidden="true"
              className="px-1 font-mono text-[13.5px] text-faint"
            >
              …
            </li>
          ) : (
            <li key={page}>
              <Link
                href={hrefFor(page)}
                aria-label={`Page ${page}`}
                aria-current={page === currentPage ? "page" : undefined}
                className={
                  page === currentPage
                    ? `${numberBase} border-accent bg-accent text-accent-contrast hover:text-accent-contrast`
                    : `${numberBase} border-line text-muted hover:border-accent hover:text-ink`
                }
              >
                {page}
              </Link>
            </li>
          ),
        )}
      </ol>

      <Arrow
        word="Older"
        arrow="→"
        href={hrefFor(currentPage + 1)}
        disabled={currentPage >= numPages}
      />
    </nav>
  );
}
