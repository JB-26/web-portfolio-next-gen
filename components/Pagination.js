import Link from "next/link";
import { buildPageList } from "../lib/pagination";

// "Newer" moves toward page 1 (newest posts); "Older" moves toward the last.
// Next.js resets scroll position on a route change, which satisfies the
// design's "page change scrolls to top" without an explicit window.scrollTo.

const numberBase =
  "inline-flex min-h-11 items-center justify-center rounded-lg border px-3 py-1.5 font-mono text-[13.5px] no-underline lg:min-h-0";

function Arrow({ label, href, disabled }) {
  if (disabled) {
    return (
      <span aria-hidden="true" className="text-[15px] text-line">
        {label}
      </span>
    );
  }
  return (
    <Link
      href={href}
      className="inline-flex min-h-11 items-center text-[15px] font-semibold text-accent no-underline hover:text-ink lg:min-h-0"
    >
      {label}
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
      className="flex flex-wrap items-center justify-between gap-4 border-t border-line py-6"
    >
      <Arrow
        label="← Newer"
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
        label="Older →"
        href={hrefFor(currentPage + 1)}
        disabled={currentPage >= numPages}
      />
    </nav>
  );
}
