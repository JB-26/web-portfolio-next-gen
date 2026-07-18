import Link from "next/link";
import DateFormatter from "./date";

/**
 * A single row in the blog index list. Reused unchanged by /tags/[tag].
 * Posts written before `description` became standard render no description
 * line rather than a placeholder.
 */
export default function PostListRow({ id, title, description, date, readingTime }) {
  return (
    <Link
      href={`/posts/${id}`}
      data-testid="post-list-item"
      className="group flex flex-wrap items-baseline justify-between gap-x-8 gap-y-1.5 border-t border-line py-6 no-underline"
    >
      <span className="flex max-w-[640px] flex-col gap-1.5">
        <span className="text-[21px] font-semibold leading-[1.3] tracking-[-0.015em] text-ink group-hover:text-accent">
          {title}
        </span>
        {description ? (
          <span className="text-[15.5px] leading-[1.55] text-muted">
            {description}
          </span>
        ) : null}
      </span>
      <span
        data-testid="post-reading-time"
        className="font-mono text-[13px] whitespace-nowrap text-faint"
      >
        <DateFormatter dateString={date} short />
        {readingTime ? ` · ${readingTime}` : null}
      </span>
    </Link>
  );
}
