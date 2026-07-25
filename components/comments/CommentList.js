/**
 * CommentList — renders a paginated slice of comments with a "Show more" button.
 *
 * Props:
 *   comments  {object[]}  — all fetched comments (client-side slicing only)
 *   isOwner   {boolean}   — passed through to CommentItem
 *   onDelete  {function}  — passed through to CommentItem
 *
 * State:
 *   visibleCount {number} — starts at 5, increments by 10 per "Show more" click
 *
 * Accessibility:
 *   - Empty state: informative paragraph.
 *   - "Show more" button: label shows remaining count; focus moves to the first
 *     newly-visible comment when the count changes (useEffect + itemRefs).
 *   - focus-visible outline on the Show more button.
 *   - motion-reduce: transition suppressed per project MEMORY.md.
 *
 * Analytics:
 *   - Fires `track("comment_load_more")` from @vercel/analytics on each click.
 */
import { useRef, useState, useEffect } from "react";
import { trackEvent } from "../../lib/analytics";
import CommentItem from "./CommentItem";

const INITIAL_COUNT = 5;
const INCREMENT = 10;

export default function CommentList({ comments, isOwner, onDelete }) {
  const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT);
  // Track the previous count so we know which item to focus after expansion
  const prevVisibleCount = useRef(visibleCount);
  // Map of index → DOM node for focus management
  const itemRefs = useRef([]);

  const visibleComments = comments.slice(0, visibleCount);
  const remainingCount = comments.length - visibleCount;
  const hasMore = remainingCount > 0;

  // When visibleCount grows, focus the first newly-visible comment
  useEffect(() => {
    const prevCount = prevVisibleCount.current;
    if (visibleCount > prevCount) {
      const firstNewIndex = prevCount;
      const el = itemRefs.current[firstNewIndex];
      if (el) {
        el.focus();
      }
    }
    prevVisibleCount.current = visibleCount;
  }, [visibleCount]);

  function handleShowMore() {
    trackEvent("comment_load_more");
    setVisibleCount((c) => c + INCREMENT);
  }

  // Empty state
  if (comments.length === 0) {
    return (
      <p className="py-4 text-[15.5px] text-faint">
        No comments yet — be the first to share a thought.
      </p>
    );
  }

  return (
    <div>
      {visibleComments.map((comment, index) => (
        /*
         * Wrap each item in a div with tabIndex={-1} so focus management can
         * target it programmatically without making it a tab stop in normal flow.
         */
        <div
          key={comment.id}
          ref={(el) => {
            itemRefs.current[index] = el;
          }}
          tabIndex={-1}
          className="outline-none"
        >
          <CommentItem
            comment={comment}
            isOwner={isOwner}
            onDelete={onDelete}
          />
        </div>
      ))}

      {hasMore && (
        <button
          type="button"
          onClick={handleShowMore}
          data-testid="show-more"
          className="mt-5 inline-flex min-h-11 items-center rounded-lg border border-line px-4 py-2 text-[14.5px] font-semibold text-muted hover:border-accent hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent motion-reduce:transition-none lg:min-h-0"
        >
          Show {remainingCount} more
        </button>
      )}
    </div>
  );
}
