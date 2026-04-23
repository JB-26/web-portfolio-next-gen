/**
 * Owner delete confirmation page — `/owner/comments/delete?token=...`.
 *
 * Lands the owner after they click the delete link in the notification
 * email. Shows a preview of the comment and requires a second user action
 * (clicking the Delete button) before POSTing to /api/owner/delete-by-token.
 *
 * Why a confirmation page instead of the email linking directly to an
 * auto-deleting GET endpoint:
 *   - Outlook Safe Links and Gmail's image proxy prefetch URLs embedded in
 *     emails — a GET-to-delete would self-destruct the comment before the
 *     owner even reads the email.
 *   - GET is not supposed to have side effects (RFC 9110 §9.2.1).
 *   - A preview lets the owner sanity-check that this is the right comment.
 *
 * Auth model: the signed token in the query string is the authentication.
 * We do NOT run `getSession`, CSRF, or origin checks — see the API handler
 * at `pages/api/owner/delete-by-token.ts` for the rationale.
 *
 * `noindex, nofollow` meta prevents search engines from crawling tokenised
 * URLs (they shouldn't end up there anyway, but defence in depth is cheap).
 */
import Head from "next/head";
import { useState } from "react";

import Layout, { siteTitle } from "../../../components/layout";
import { verifyDeleteToken } from "../../../lib/deleteToken";
import { getById } from "../../../lib/comments/db";

/**
 * Server-side: decode the token, load the comment, pass a minimal preview
 * to the client. We do NOT trust client-side verification — the API route
 * re-verifies on the delete POST as the authoritative check.
 */
export async function getServerSideProps(context) {
  const rawToken = context.query?.token;
  const token = Array.isArray(rawToken) ? rawToken[0] : rawToken;

  // Test seam: when running under Playwright, skip the real Neon call and
  // return a deterministic preview. Honours verifyDeleteToken so the four
  // token states (VALID / EXPIRED / BAD_SIGNATURE / MALFORMED) still render
  // the right messages. Gated on a non-public env var so this can never be
  // enabled in production builds. Documented in comments-phase-6-qa-plan.md §3.
  if (process.env.PLAYWRIGHT_TEST_COMMENT_PREVIEW === "1") {
    if (typeof token !== "string" || token.length === 0) {
      return {
        props: { tokenStatus: "MALFORMED", token: "", commentPreview: null },
      };
    }
    const r = verifyDeleteToken(token);
    if (!r.ok) {
      return {
        props: { tokenStatus: r.reason, token, commentPreview: null },
      };
    }
    return {
      props: {
        tokenStatus: "VALID",
        token,
        commentPreview: {
          postId: "2025-01-30-scrum",
          author: "Test Commenter",
          body: "Test body for Playwright assertion.",
          createdAt: new Date("2026-04-22T12:00:00Z").toISOString(),
        },
      },
    };
  }

  if (typeof token !== "string" || token.length === 0) {
    return {
      props: {
        tokenStatus: "MALFORMED",
        token: "",
        commentPreview: null,
      },
    };
  }

  const result = verifyDeleteToken(token);
  if (!result.ok) {
    return {
      props: {
        tokenStatus: result.reason,
        token,
        commentPreview: null,
      },
    };
  }

  // Token is valid — load the comment so we can show a preview. If the row
  // has already been deleted (or never existed), we still render the page
  // but in a "nothing to delete" state.
  let commentPreview = null;
  try {
    const c = await getById(result.commentId);
    if (c !== null) {
      // Data minimisation: only fields actually read by the client UI are
      // copied into props. Notably `id` is OMITTED — the client uses `token`
      // for the POST, and emitting `id` into `__NEXT_DATA__` would leak the
      // comment UUID into the page source for no benefit.
      commentPreview = {
        postId: c.postId,
        author: c.author,
        body: c.body,
        createdAt: c.createdAt,
      };
    }
  } catch (err) {
    // Log but don't fail the render — we can still show the token-valid UI
    // and let the user click Delete, which will 500 with a clear message.
    // Restrict to `err.message` only. Neon driver errors can include the
    // parameterised query or partial result data in the full exception
    // object, which Vercel's log aggregator would persist.
    console.error("[pages/owner/comments/delete] getById failed", {
      route: "pages/owner/comments/delete",
      errorCode: "GET_BY_ID_FAILED",
      err: err instanceof Error ? err.message : "unknown error",
    });
  }

  return {
    props: {
      tokenStatus: "VALID",
      token,
      commentPreview,
    },
  };
}

const TOKEN_STATUS_MESSAGES = {
  MALFORMED: "This delete link is malformed. It may have been copied incorrectly.",
  EXPIRED: "This delete link has expired. Tokens are valid for 7 days.",
  BAD_SIGNATURE: "This delete link is not valid.",
  MISCONFIGURED: "Delete-by-token is not configured on the server.",
};

export default function OwnerDeletePage({ tokenStatus, token, commentPreview }) {
  // uiState: idle | submitting | success | error
  const [uiState, setUiState] = useState("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleDelete() {
    setUiState("submitting");
    setErrorMessage("");

    try {
      const res = await fetch("/api/owner/delete-by-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ token }),
      });

      if (res.ok) {
        setUiState("success");
        return;
      }

      // Try to extract the server-supplied message — fall back to a generic.
      let message = "Could not delete the comment. Please try again.";
      try {
        const body = await res.json();
        if (body?.error?.message) {
          message = String(body.error.message);
        }
      } catch {
        // response wasn't JSON; keep the default
      }
      setErrorMessage(message);
      setUiState("error");
    } catch {
      setErrorMessage("Network error. Please check your connection and try again.");
      setUiState("error");
    }
  }

  const invalidMessage = tokenStatus !== "VALID" ? TOKEN_STATUS_MESSAGES[tokenStatus] : null;

  return (
    <Layout>
      <Head>
        <title>Delete comment · {siteTitle}</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <h1 className="text-2xl font-extrabold tracking-tighter leading-tight mb-6">
        Delete comment
      </h1>

      {/* Invalid / expired token */}
      {invalidMessage !== null && (
        <p
          role="alert"
          className="text-red-600 dark:text-red-400 text-base py-4"
        >
          {invalidMessage}
        </p>
      )}

      {/* Valid token but comment no longer exists */}
      {tokenStatus === "VALID" && commentPreview === null && uiState !== "success" && (
        <p className="text-gray-700 dark:text-slate-300 text-base py-4">
          This comment could not be found — it may already have been deleted.
        </p>
      )}

      {/* Success confirmation (no redirect — the user came from email) */}
      {uiState === "success" && (
        <p
          role="status"
          data-testid="delete-success"
          className="text-green-700 dark:text-green-400 text-base py-4"
        >
          Comment deleted. You can close this tab.
        </p>
      )}

      {/* Valid token, comment present, pre-delete UI */}
      {tokenStatus === "VALID" && commentPreview !== null && uiState !== "success" && (
        <section aria-label="Delete comment confirmation">
          <div
            data-testid="delete-preview"
            className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-4 mb-4"
          >
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-1">
              On post: <span className="font-mono">{commentPreview.postId}</span>
            </p>
            <p className="text-sm font-semibold text-gray-900 dark:text-slate-100">
              {commentPreview.author}
            </p>
            <p className="text-xs text-gray-500 dark:text-slate-400 mb-2">
              {commentPreview.createdAt}
            </p>
            <p className="text-gray-800 dark:text-slate-200 text-base leading-relaxed whitespace-pre-wrap">
              {commentPreview.body}
            </p>
          </div>

          <p className="text-gray-700 dark:text-slate-300 text-sm mb-4">
            This action cannot be undone. The comment will be permanently removed.
          </p>

          {errorMessage && (
            <p
              role="alert"
              className="text-red-600 dark:text-red-400 text-sm mb-4"
            >
              {errorMessage}
            </p>
          )}

          <button
            type="button"
            data-testid="confirm-token-delete"
            onClick={handleDelete}
            disabled={uiState === "submitting"}
            className="bg-red-600 dark:bg-red-500 text-white font-medium px-5 py-2.5 rounded-md hover:bg-red-700 dark:hover:bg-red-400 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 dark:focus-visible:outline-red-400"
          >
            {uiState === "submitting" ? "Deleting…" : "Delete comment"}
          </button>
        </section>
      )}
    </Layout>
  );
}
