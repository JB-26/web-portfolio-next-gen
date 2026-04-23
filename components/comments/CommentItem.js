/**
 * CommentItem — renders a single approved comment card.
 *
 * Props:
 *   comment  {object}   — the comment object from the API
 *   isOwner  {boolean}  — when true, renders a delete affordance
 *   onDelete {function} — called with the comment id after owner confirms
 *
 * Accessibility:
 *   - Delete button: aria-label includes the author name so each button is
 *     uniquely identified in the accessibility tree.
 *   - Inline confirm row: focus moves to Cancel on open; Cancel returns focus
 *     to the original delete button. useRef tracks both targets.
 *   - Touch target: delete button wrapped in p-2 padding to achieve 44×44px.
 *   - The delete button is NOT rendered at all when isOwner === false.
 *     Using CSS `hidden` would leave DOM nodes that could be targeted by
 *     automated attacks; conditional rendering eliminates the surface.
 */
import { useCallback, useRef, useState, useEffect } from "react";
import Date from "../date";

export default function CommentItem({ comment, isOwner, onDelete }) {
  const [confirming, setConfirming] = useState(false);

  // Refs for focus management during inline confirm flow
  const deleteButtonRef = useRef(null);
  const cancelButtonRef = useRef(null);
  // Only restore focus to the delete button after the user cancels — NOT
  // after `setConfirming(false)` caused by a successful delete (that path
  // unmounts this item entirely).
  const shouldFocusDelete = useRef(false);

  // Ref callback for the delete button: fires synchronously when React
  // attaches / detaches the DOM node. This is more reliable than a post-
  // commit `useEffect` because it guarantees we focus the button at the
  // exact moment it remounts — no race with the browser moving focus to
  // <body> after the Cancel button unmounts.
  const setDeleteButtonRef = useCallback((node) => {
    deleteButtonRef.current = node;
    if (node && shouldFocusDelete.current) {
      node.focus();
      shouldFocusDelete.current = false;
    }
  }, []);

  // Move focus to Cancel button when the confirm row opens. (The opposite
  // direction — Cancel → delete — is handled by setDeleteButtonRef above
  // because the delete button is conditionally rendered.)
  useEffect(() => {
    if (confirming && cancelButtonRef.current) {
      cancelButtonRef.current.focus();
    }
  }, [confirming]);

  function handleDeleteClick() {
    setConfirming(true);
  }

  function handleCancel() {
    // The ref callback on the re-mounting delete button will focus it.
    shouldFocusDelete.current = true;
    setConfirming(false);
  }

  function handleConfirm() {
    onDelete(comment.id);
    setConfirming(false);
  }

  return (
    <article
      className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-4 mb-3"
      data-testid="comment-item"
    >
      {/* Header row: author, date, and (owner-only) delete affordance */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0">
          {/* Author */}
          <span className="text-sm font-semibold text-gray-900 dark:text-slate-100 block truncate">
            {comment.author}
          </span>
          {/* Date — uses the existing Date component for formatting */}
          <span className="text-xs text-gray-500 dark:text-slate-400">
            <Date dateString={comment.createdAt} />
          </span>
        </div>

        {/* Delete affordance — ONLY rendered when isOwner === true */}
        {isOwner && !confirming && (
          <button
            ref={setDeleteButtonRef}
            type="button"
            onClick={handleDeleteClick}
            aria-label={`Delete comment by ${comment.author}`}
            data-testid="delete-comment"
            /* p-2 gives a ~44×44 touch target around the 20px icon */
            className="text-gray-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 p-2 rounded flex-shrink-0"
          >
            {/* Trash icon — inline SVG to keep bundle lean, no extra dep */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              focusable="false"
            >
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6" />
              <path d="M14 11v6" />
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
            </svg>
          </button>
        )}
      </div>

      {/* Inline confirm row — shown after the delete icon is clicked */}
      {isOwner && confirming && (
        <div className="flex flex-col gap-2 mb-2" role="group" aria-label="Confirm deletion">
          <p className="text-sm text-gray-700 dark:text-slate-300">
            Delete this comment?
          </p>
          <div className="flex gap-2">
            <button
              ref={cancelButtonRef}
              type="button"
              onClick={handleCancel}
              className="border border-gray-300 dark:border-slate-600 text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded px-3 py-1.5 text-sm"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              data-testid="confirm-delete"
              className="bg-red-600 hover:bg-red-700 text-white rounded px-3 py-1.5 text-sm"
            >
              Confirm
            </button>
          </div>
        </div>
      )}

      {/* Comment body — plain text only, never dangerouslySetInnerHTML */}
      <p className="text-gray-800 dark:text-slate-200 text-base leading-relaxed m-0">
        {comment.body}
      </p>
    </article>
  );
}
