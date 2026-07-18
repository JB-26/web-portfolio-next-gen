import Link from "next/link";
import DateFormatter from "./date";

/**
 * Card for the Home page's "Recent posts" grid.
 *
 * Takes the post shape getSortedPostsData() already returns, so call sites
 * need no transformation. Posts written before `description` became standard
 * render no description line at all rather than a placeholder.
 */
export default function PostCard({ id, title, description, date, readingTime }) {
  return (
    <Link
      href={`/posts/${id}`}
      data-testid="post-card"
      className="flex flex-col gap-2.5 rounded-xl border border-line bg-card p-6 no-underline hover:border-accent"
    >
      <div className="font-mono text-[12.5px] text-faint">
        <DateFormatter dateString={date} short />
        {readingTime ? ` · ${readingTime}` : null}
      </div>
      <h3 className="m-0 text-[19px] font-semibold leading-[1.3] tracking-[-0.01em] text-ink">
        {title}
      </h3>
      {description ? (
        <p className="m-0 text-[15px] leading-[1.55] text-muted">{description}</p>
      ) : null}
    </Link>
  );
}
