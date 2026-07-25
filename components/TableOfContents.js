import { useEffect, useRef, useState } from "react";

/**
 * Sticky "On this page" sidebar, built from the article's rendered <h2>s.
 *
 * Headings are read from the live DOM after mount rather than derived from the
 * markdown a second time on the server. rehype-slug puts the ids on the real
 * headings, so reading those elements makes an id mismatch structurally
 * impossible — a parallel server-side slugifier could disagree with
 * rehype-slug (duplicate heading text, headings inside raw HTML) and produce
 * TOC links pointing at ids that don't exist, which no test would catch.
 * Cost: the sidebar list appears a frame after hydration. The headings
 * themselves are server-rendered in the article, so nothing is lost for SEO.
 *
 * Hidden below lg. The handoff says 900px, but the design's own geometry
 * doesn't fit there: 720px article + 56px gap + 210px sidebar needs 986px,
 * and a 900px viewport only leaves 852px inside the 1040px container with its
 * 24px gutters. lg (1024px) leaves exactly 992px, which fits — and matches
 * this project's convention of breaking at lg rather than md.
 */

// Gap left between the viewport top and the target heading. Mirrored by
// `scroll-margin-top` on .prose-post headings in styles/global.css, which is
// what scrollIntoView actually honours.
const OFFSET = 24;

export default function TableOfContents({ articleRef }) {
  const [headings, setHeadings] = useState([]);
  // Cancels the pending post-scroll correction, if any.
  const cancelCorrection = useRef(null);

  useEffect(() => {
    const root = articleRef.current;
    if (!root) return;

    setHeadings(
      Array.from(root.querySelectorAll("h2[id]")).map((el) => ({
        id: el.id,
        text: el.textContent.trim(),
      })),
    );
  }, [articleRef]);

  // Don't leave a listener behind if the page unmounts mid-scroll.
  useEffect(() => {
    return () => cancelCorrection.current?.();
  }, []);

  function handleClick(event, id) {
    const target = document.getElementById(id);
    if (!target) return; // let the browser handle the anchor normally

    event.preventDefault();

    // Drop any correction still pending from a previous click. Without this,
    // an earlier handler fires during this scroll and yanks the page back to
    // the previous heading.
    cancelCorrection.current?.();

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const behavior = prefersReducedMotion ? "auto" : "smooth";

    // scrollIntoView rather than a computed window.scrollTo offset, so the
    // browser owns the target and re-tracks the element if the layout shifts
    // mid-scroll. That matters because markdown images are lazy-loaded with
    // no known dimensions: on an image-heavy post, images between the
    // viewport and the target can load during the scroll and move it. The
    // offset comes from the heading's `scroll-margin-top` in global.css, so
    // direct anchor navigation gets the same gap for free.
    //
    // The handoff says to prefer window.scrollTo "if scrollIntoView conflicts
    // with the app shell" — there is no fixed/sticky shell here, so it doesn't.
    target.scrollIntoView({ behavior, block: "start" });

    // Safety net for layout that settles after the scroll ends (e.g. an image
    // finishing decode). Usually a no-op.
    const correct = () => {
      cancelCorrection.current = null;
      const drift = target.getBoundingClientRect().top - OFFSET;
      if (Math.abs(drift) > 2) {
        window.scrollTo({ top: window.scrollY + drift, behavior: "auto" });
      }
    };

    if ("onscrollend" in window) {
      window.addEventListener("scrollend", correct, { once: true });
      cancelCorrection.current = () => {
        window.removeEventListener("scrollend", correct);
        cancelCorrection.current = null;
      };
    } else {
      const timer = window.setTimeout(correct, 600);
      cancelCorrection.current = () => {
        window.clearTimeout(timer);
        cancelCorrection.current = null;
      };
    }

    // Keep the anchor shareable without the browser also jumping to it.
    window.history.replaceState(null, "", `#${id}`);
  }

  if (headings.length === 0) return null;

  return (
    <nav
      aria-labelledby="toc-label"
      data-testid="toc"
      className="sticky top-8 hidden w-[210px] shrink-0 lg:block"
    >
      <p
        id="toc-label"
        className="m-0 mb-3 font-mono text-[11.5px] tracking-[0.1em] text-faint uppercase"
      >
        On this page
      </p>
      <ul className="m-0 flex list-none flex-col gap-2 border-l-2 border-line p-0 pl-3.5">
        {headings.map(({ id, text }) => (
          <li key={id}>
            <a
              href={`#${id}`}
              onClick={(event) => handleClick(event, id)}
              className="block text-[14.5px] leading-[1.4] text-muted no-underline hover:text-accent"
            >
              {text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
