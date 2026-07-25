/**
 * CommentsSection — top-level orchestrator for the comments feature.
 *
 * Props:
 *   postId  {string}  — the post slug
 *   isOwner {boolean} — whether the current visitor has owner privileges
 *
 * State:
 *   comments   {object[]}                         — all fetched approved comments
 *   total      {number}                           — total count from API
 *   fetchState {"loading" | "success" | "error"}  — async fetch status
 *
 * Accessibility:
 *   - Loading state: CommentSkeleton renders a sr-only role="status" announcement.
 *   - Error state: role="alert" for the fetch error paragraph.
 *   - After a successful submission: focus moves to the newly-posted comment.
 *   - After a delete: role="status" announces "Comment deleted".
 *
 * Security:
 *   - No dangerouslySetInnerHTML.
 *   - isOwner is purely decorative for the UI; the server re-validates auth
 *     independently on every DELETE request.
 *
 * Analytics:
 *   - track("comment_deleted") fired on successful delete.
 *   - track("comment_submitted") is fired inside CommentForm.
 */
import { Component, useEffect, useRef, useState } from "react";
import { trackEvent } from "../../lib/analytics";
import { fetchComments, deleteComment } from "../../lib/comments";
import CommentSkeleton from "./CommentSkeleton";
import CommentList from "./CommentList";
import CommentForm from "./CommentForm";

// ---------------------------------------------------------------------------
// Error boundary — wraps the whole section so a render error cannot break the
// post page. A simple class component is sufficient per the plan.
// ---------------------------------------------------------------------------
class CommentErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(err, info) {
    // Log for observability; non-critical so no rethrow
    console.error("[CommentsSection] render error", err, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <p
          role="alert"
          data-testid="comments-error"
          className="py-4 text-[15.5px] text-red-600 dark:text-red-400"
        >
          Comments could not be loaded. Refresh the page to try again.
        </p>
      );
    }
    return this.props.children;
  }
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
function CommentsSectionInner({ postId, isOwner }) {
  const [comments, setComments] = useState([]);
  const [total, setTotal] = useState(0);
  const [fetchState, setFetchState] = useState("loading");
  // "Comment deleted" live region
  const [deletedAnnounce, setDeletedAnnounce] = useState(false);
  // Ref to the newly-posted comment wrapper for focus management
  const newCommentRef = useRef(null);
  // Only focus the new comment after a user-initiated post (not on initial load)
  const shouldFocusNew = useRef(false);

  // Fetch all approved comments on mount (MVP: one shot, client-side pagination)
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await fetchComments(postId, { limit: 1000, offset: 0 });
        if (cancelled) return;
        setComments(data.comments);
        setTotal(data.total);
        setFetchState("success");
      } catch {
        if (!cancelled) setFetchState("error");
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [postId]);

  // Focus the newly-posted comment after it mounts — only after a user post
  useEffect(() => {
    if (shouldFocusNew.current && newCommentRef.current) {
      newCommentRef.current.focus();
      shouldFocusNew.current = false;
    }
  }, [comments]);

  function handleSuccess(newComment) {
    // Honeypot sentinel: the server returns a fake comment with this fixed
    // all-zeros UUID when the bot bait field is populated. We must not render
    // it — otherwise the bot (or a curious dev tools user) sees their fake
    // submission appear in the list, defeating the deceptive design that the
    // server's response shape is meant to support.
    // Server side: see pages/api/comments/index.ts (honeypot branch).
    if (!newComment || newComment.id === "00000000-0000-0000-0000-000000000000") return;
    shouldFocusNew.current = true;
    setComments((prev) => [newComment, ...prev]);
    setTotal((t) => t + 1);
  }

  async function handleDelete(id) {
    try {
      await deleteComment(id);
      // Remove the comment with a short fade-out via inline style trick:
      // We mark it as fading then remove after the transition duration.
      setComments((prev) => prev.filter((c) => c.id !== id));
      setTotal((t) => Math.max(t - 1, 0));
      setDeletedAnnounce(true);
      trackEvent("comment_deleted");
      // Reset the live region after a moment so repeat deletions re-trigger it
      setTimeout(() => setDeletedAnnounce(false), 1500);
    } catch (err) {
      console.error("[CommentsSection] delete failed", err);
    }
  }

  return (
    <div>
      {/* "Comment deleted" polite announcement */}
      {/* role="status" implies aria-live="polite" — do NOT add both */}
      <p className="sr-only" role="status">
        {deletedAnnounce ? "Comment deleted." : ""}
      </p>

      {/* Fetch loading state */}
      {fetchState === "loading" && <CommentSkeleton />}

      {/* Fetch error state */}
      {fetchState === "error" && (
        <p
          role="alert"
          className="py-4 text-[15.5px] text-red-600 dark:text-red-400"
        >
          Comments could not be loaded. Refresh the page to try again.
        </p>
      )}

      {/* Loaded state */}
      {fetchState === "success" && (
        <>
          {/* Newly-posted comment ref wrapper — invisible, but gives a focus target */}
          {comments.length > 0 && (
            <div
              ref={newCommentRef}
              tabIndex={-1}
              className="outline-none"
            >
              <CommentList
                comments={comments}
                isOwner={isOwner}
                onDelete={handleDelete}
              />
            </div>
          )}

          {comments.length === 0 && (
            <p className="py-4 text-[15.5px] text-faint">
              No comments yet — be the first to share a thought.
            </p>
          )}
        </>
      )}

      {/* Comment form — always rendered so users can post even while loading */}
      <div className="mt-8">
        <h3 className="mb-4 text-[17px] font-semibold text-ink">
          Leave a comment
        </h3>
        <CommentForm postId={postId} onSuccess={handleSuccess} />
      </div>
    </div>
  );
}

export default function CommentsSection({ postId, isOwner }) {
  return (
    <CommentErrorBoundary>
      <CommentsSectionInner postId={postId} isOwner={isOwner} />
    </CommentErrorBoundary>
  );
}
