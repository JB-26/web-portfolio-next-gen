/**
 * CommentSkeleton — three shimmer placeholder cards shown while comments load.
 *
 * Accessibility:
 *   - A visually-hidden sibling with role="status" aria-live="polite" announces
 *     "Loading comments" to screen readers. role="status" implies polite already
 *     so we omit the redundant aria-live attribute.
 *
 * Performance:
 *   - animate-pulse is a CSS animation; no JS cost.
 *   - prefers-reduced-motion guard lives in styles/global.css.
 */
export default function CommentSkeleton() {
  return (
    <>
      {/* Screen reader announcement — visually hidden */}
      <p className="sr-only" role="status">
        Loading comments
      </p>

      {/* Three shimmer cards */}
      <div aria-hidden="true">
        <div className="animate-pulse bg-gray-200 dark:bg-slate-700 rounded-lg h-20 mb-3" />
        <div className="animate-pulse bg-gray-200 dark:bg-slate-700 rounded-lg h-20 mb-3" />
        <div className="animate-pulse bg-gray-200 dark:bg-slate-700 rounded-lg h-20 mb-3" />
      </div>
    </>
  );
}
