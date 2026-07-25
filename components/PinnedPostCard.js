import Link from "next/link";
import DateFormatter from "./date";

/**
 * Renders nothing when no post carries `pinned: true` in its front matter —
 * the design shows this card "only if a post is pinned".
 */
export default function PinnedPostCard({ post }) {
  if (!post) return null;

  return (
    <Link
      href={`/posts/${post.id}`}
      className="mt-6 flex flex-col gap-2 rounded-xl border border-line bg-card px-6 py-[22px] no-underline hover:border-accent"
    >
      <span
        data-testid="pinned"
        className="font-mono text-[11.5px] font-medium tracking-[0.1em] text-accent uppercase"
      >
        {/* Decorative — the word "Pinned" carries the meaning. */}
        <span aria-hidden="true">📌</span> Pinned
      </span>
      <span className="text-[20px] font-semibold leading-[1.3] tracking-[-0.015em] text-ink">
        {post.title}
      </span>
      {post.description ? (
        <span className="text-[15px] leading-[1.55] text-muted">
          {post.description}
        </span>
      ) : null}
      <span
        data-testid="pinned-reading-time"
        className="font-mono text-[12.5px] text-faint"
      >
        <DateFormatter dateString={post.date} short />
        {post.readingTime ? ` · ${post.readingTime}` : null}
      </span>
    </Link>
  );
}
