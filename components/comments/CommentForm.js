/**
 * CommentForm — controlled comment submission form.
 *
 * Props:
 *   postId    {string}   — the post slug sent with the API request
 *   onSuccess {function} — called with the new Comment object on 2xx
 *
 * State machine (see implementation plan §Form State Machine):
 *   idle | submitting | success | validation_error |
 *   server_error | profanity_rejected | links_rejected | rate_limited
 *
 * Accessibility:
 *   - All fields have explicit <label htmlFor>.
 *   - Honeypot field uses sr-only wrapper + tabIndex={-1} + autoComplete="off".
 *     Never type="hidden" — visible to assistive tech, confirming it's cosmetic.
 *   - Server / profanity / links / rate_limit errors: role="alert" at form top.
 *   - Validation errors: role="alert" inline per-field + aria-describedby.
 *   - Character counter: aria-live="polite" but only announces at thresholds
 *     (100 / 50 / 20 / 0 remaining) to avoid per-keystroke spam.
 *   - On success: role="status" polite announcement.
 *   - Submit disabled while formState === "submitting".
 *
 * Security:
 *   - Honeypot `url` field is CSS-hidden; any bot that fills it causes the
 *     server to silently discard the submission (honeypot handled server-side).
 *   - URL check is cosmetic client-side guard; server is authoritative.
 *   - No dangerouslySetInnerHTML anywhere.
 *
 * Analytics:
 *   - Fires track("comment_submitted") from @vercel/analytics on success.
 */
import { useEffect, useRef, useState } from "react";
import { track } from "@vercel/analytics";
import { submitComment, CommentApiError } from "../../lib/comments";

const MAX_BODY = 1000;
const MAX_AUTHOR = 60;
// Char-count thresholds at which we update the live region
const ANNOUNCE_THRESHOLDS = new Set([100, 50, 20, 0]);

// Simple client-side URL guard (cosmetic — server is authoritative)
const URL_RE = /https?:\/\/|www\./i;

const INITIAL_FIELDS = { author: "", body: "", url: "" };

export default function CommentForm({ postId, onSuccess }) {
  const [formState, setFormState] = useState("idle");
  const [fields, setFields] = useState(INITIAL_FIELDS);
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState("");
  // The char-count value announced to the live region (only at thresholds)
  const [announcedRemaining, setAnnouncedRemaining] = useState(null);

  // For rate-limit countdown
  const [retryCountdown, setRetryCountdown] = useState(0);
  const countdownRef = useRef(null);

  // Focus the first errored field after validation_error
  const authorRef = useRef(null);
  const bodyRef = useRef(null);

  function clearCountdown() {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
  }

  useEffect(() => {
    return () => clearCountdown();
  }, []);

  function startCountdown(seconds) {
    setRetryCountdown(seconds);
    clearCountdown();
    countdownRef.current = setInterval(() => {
      setRetryCountdown((prev) => {
        if (prev <= 1) {
          clearCountdown();
          setFormState("idle");
          setServerError("");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  function handleFieldChange(e) {
    const { name, value } = e.target;
    setFields((prev) => ({ ...prev, [name]: value }));

    // Clear per-field error when the user edits the field
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }

    // Reset server-level states when user edits body after a rejection
    if (
      name === "body" &&
      (formState === "profanity_rejected" ||
        formState === "links_rejected" ||
        formState === "server_error")
    ) {
      setFormState("idle");
      setServerError("");
    }

    // Character counter — only announce at thresholds
    if (name === "body") {
      const remaining = MAX_BODY - value.length;
      if (ANNOUNCE_THRESHOLDS.has(remaining)) {
        setAnnouncedRemaining(remaining);
      }
    }
  }

  function validate() {
    const errors = {};
    if (!fields.author.trim()) {
      errors.author = "Name is required.";
    }
    if (!fields.body.trim()) {
      errors.body = "Comment body is required.";
    } else if (fields.body.length > MAX_BODY) {
      errors.body = `Comment must be ${MAX_BODY} characters or fewer.`;
    } else if (URL_RE.test(fields.body)) {
      // Client-side cosmetic check: links rejected
      errors.body = "Links are not allowed in comments.";
    }
    return errors;
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setFormState("validation_error");
      // Move focus to the first errored field
      if (errors.author && authorRef.current) {
        authorRef.current.focus();
      } else if (errors.body && bodyRef.current) {
        bodyRef.current.focus();
      }
      return;
    }

    setFormState("submitting");
    setServerError("");
    setFieldErrors({});

    try {
      const newComment = await submitComment({
        postId,
        author: fields.author.trim(),
        body: fields.body.trim(),
        url: fields.url, // honeypot value; empty string by default
      });

      setFormState("success");
      track("comment_submitted");
      onSuccess(newComment);

      // Reset form after 3 s
      setTimeout(() => {
        setFormState("idle");
        setFields(INITIAL_FIELDS);
        setAnnouncedRemaining(null);
      }, 3000);
    } catch (err) {
      if (err instanceof CommentApiError) {
        if (err.code === "PROFANITY") {
          setFormState("profanity_rejected");
          setServerError(
            "Your comment was flagged by the profanity filter. Please revise and try again.",
          );
        } else if (err.code === "LINKS") {
          setFormState("links_rejected");
          setServerError("Links are not allowed in comments.");
        } else if (err.code === "RATE_LIMIT") {
          setFormState("rate_limited");
          const seconds = err.retryAfter ?? 60;
          setServerError(
            `Too many submissions — please wait before trying again.`,
          );
          startCountdown(seconds);
        } else if (err.code === "VALIDATION" && err.fieldErrors) {
          // Map server field errors back to local state
          const mapped = {};
          for (const [field, messages] of Object.entries(err.fieldErrors)) {
            mapped[field] = Array.isArray(messages) ? messages[0] : messages;
          }
          setFieldErrors(mapped);
          setFormState("validation_error");
          if (mapped.author && authorRef.current) {
            authorRef.current.focus();
          } else if (mapped.body && bodyRef.current) {
            bodyRef.current.focus();
          }
        } else {
          setFormState("server_error");
          setServerError("Something went wrong. Please try again in a moment.");
        }
      } else {
        setFormState("server_error");
        setServerError("Something went wrong. Please try again in a moment.");
      }
    }
  }

  const isSubmitting = formState === "submitting";
  const isRateLimited = formState === "rate_limited";
  const remaining = MAX_BODY - fields.body.length;

  // Top-of-form server error states
  const topAlertStates = new Set([
    "server_error",
    "profanity_rejected",
    "links_rejected",
    "rate_limited",
  ]);
  const showTopAlert = topAlertStates.has(formState) && serverError;

  return (
    <div data-testid="comment-form">
      {/* Privacy notice — one sentence, above the form */}
      <p className="font-bold text-sm text-gray-600 dark:text-slate-400 mb-3">
        Comments are public. Your name will be shown; don&apos;t include
        personal info you wouldn&apos;t put online.
      </p>

      {/* Top-of-form server / profanity / links / rate-limit error */}
      {showTopAlert && (
        <div
          role="alert"
          className="mb-4 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700 p-3 text-red-700 dark:text-red-300 text-sm"
        >
          {serverError}
          {isRateLimited && retryCountdown > 0 && (
            <span className="ml-1">({retryCountdown}s)</span>
          )}
        </div>
      )}

      {/* Success announcement — visually hidden; polite so it doesn't interrupt */}
      {formState === "success" && (
        <p className="sr-only" role="status">
          Comment posted.
        </p>
      )}

      <form onSubmit={handleSubmit} noValidate>
        {/* Author field */}
        <div className="mb-4">
          <label
            htmlFor="comment-author"
            className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1"
          >
            Name <span aria-hidden="true">*</span>
          </label>
          <input
            ref={authorRef}
            id="comment-author"
            name="author"
            type="text"
            autoComplete="name"
            maxLength={MAX_AUTHOR}
            value={fields.author}
            onChange={handleFieldChange}
            disabled={isSubmitting || isRateLimited}
            aria-describedby={fieldErrors.author ? "author-error" : undefined}
            aria-required="true"
            className={[
              "w-full rounded-md border px-3 py-2 text-base",
              "bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100",
              "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
              "focus-visible:outline-blue-600 dark:focus-visible:outline-blue-400",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              fieldErrors.author
                ? "border-red-500 dark:border-red-400"
                : "border-gray-300 dark:border-slate-600",
            ].join(" ")}
          />
          {fieldErrors.author && (
            <p
              id="author-error"
              role="alert"
              className="text-red-600 dark:text-red-400 text-sm mt-1"
            >
              {fieldErrors.author}
            </p>
          )}
        </div>

        {/* Body field */}
        <div className="mb-4">
          <label
            htmlFor="comment-body"
            className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1"
          >
            Comment <span aria-hidden="true">*</span>
          </label>
          <textarea
            ref={bodyRef}
            id="comment-body"
            name="body"
            rows={3}
            maxLength={MAX_BODY}
            value={fields.body}
            onChange={handleFieldChange}
            disabled={isSubmitting || isRateLimited}
            aria-describedby={[
              "body-char-count",
              fieldErrors.body ? "body-error" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            aria-required="true"
            className={[
              "w-full rounded-md border px-3 py-2 text-base",
              "bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100",
              "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
              "focus-visible:outline-blue-600 dark:focus-visible:outline-blue-400",
              "disabled:opacity-50 disabled:cursor-not-allowed resize-y",
              fieldErrors.body
                ? "border-red-500 dark:border-red-400"
                : "border-gray-300 dark:border-slate-600",
            ].join(" ")}
          />

          {/* Character counter — visible at all times, but aria-live only triggers at thresholds */}
          <div className="flex justify-between mt-1">
            {fieldErrors.body ? (
              <p
                id="body-error"
                role="alert"
                className="text-red-600 dark:text-red-400 text-sm"
              >
                {fieldErrors.body}
              </p>
            ) : (
              <span />
            )}
            <span
              id="body-char-count"
              className={[
                "text-xs",
                remaining < 20
                  ? "text-red-600 dark:text-red-400"
                  : "text-gray-500 dark:text-slate-400",
              ].join(" ")}
              aria-hidden="true"
            >
              {remaining} remaining
            </span>
          </div>

          {/* Polite live region — only announces at threshold values to avoid per-keystroke noise */}
          <p aria-live="polite" className="sr-only" aria-atomic="true">
            {announcedRemaining !== null
              ? `${announcedRemaining} characters remaining`
              : ""}
          </p>
        </div>

        {/*
         * Honeypot field — CSS-hidden so real users never see or interact with it.
         * tabIndex={-1} removes it from the tab order.
         * autoComplete="off" so browser autofill doesn't fill it in.
         * Never type="hidden" — that would make it invisible to AT too, which
         * is unnecessary and deviates from the plan.
         */}
        <div className="sr-only" aria-hidden="true">
          <label htmlFor="comment-url">Leave this field empty</label>
          <input
            id="comment-url"
            name="url"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={fields.url}
            onChange={handleFieldChange}
          />
        </div>

        {/* Submit button */}
        <button
          type="submit"
          data-testid="submit-comment"
          disabled={isSubmitting || isRateLimited}
          className="bg-blue-600 dark:bg-blue-500 text-white font-medium px-5 py-2.5 rounded-md hover:bg-blue-700 dark:hover:bg-blue-400 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          {isSubmitting ? "Posting…" : "Post comment"}
        </button>
      </form>
    </div>
  );
}
