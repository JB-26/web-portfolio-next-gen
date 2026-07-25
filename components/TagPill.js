import Link from "next/link";

/**
 * Monochrome pill. Replaces both the post page's ad-hoc tag links and the
 * resume's multicoloured badges — the handoff deliberately drops the colour.
 *
 * `href` present  -> post tags, link through to /tags/[tag]
 * `href` absent   -> resume certifications/projects, decorative only
 */
export default function TagPill({ label, href, size = "sm" }) {
  const sizing =
    size === "xs"
      ? "px-2.5 py-[3px] text-[11.5px]"
      : "px-3 py-[3px] text-[12px]";

  const base = `inline-flex items-center justify-center rounded-full border border-line font-mono text-muted ${sizing}`;

  if (!href) {
    return <span className={base}>{label}</span>;
  }

  return (
    <Link
      href={href}
      // min-h-11 keeps the mobile touch target at 44px per the design's
      // responsive rules; lg: restores the compact pill.
      className={`${base} min-h-11 no-underline hover:border-accent hover:text-ink lg:min-h-0`}
    >
      {label}
    </Link>
  );
}
