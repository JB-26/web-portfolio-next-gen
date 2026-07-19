/**
 * Admin page — owner login / logout UI.
 *
 * This page is intentionally simple. It is not indexed by search engines
 * (noindex, nofollow) and does not expose any information to unauthenticated
 * visitors beyond a password prompt.
 *
 * Auth check is entirely client-side (reads the sentinel cookie).
 * The actual session is validated server-side on every auth API call.
 * No SSR of auth state to avoid hydration mismatches and cookie-timing issues.
 */
import { useEffect, useRef, useState } from "react";
import Head from "next/head";
import Layout, { siteTitle } from "../components/layout";

export default function AdminPage() {
  // null = unknown (client not yet mounted), false = logged out, true = logged in
  //
  // Deliberately a one-shot read into state rather than useSyncExternalStore.
  // A store without a real subscription re-reads its snapshot on any incidental
  // re-render, so simply typing into the password field below would re-check
  // the cookie and could swap the login form out from under the user
  // mid-interaction. Stability is the point here: the auth view is decided once
  // per page load, and both login and logout reload the page to refresh it.
  // The server re-validates the session on every auth API call regardless.
  const [isOwner, setIsOwner] = useState(null);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginState, setLoginState] = useState("idle"); // idle | submitting | error
  const passwordRef = useRef(null);

  // Detect auth state from the non-httpOnly sentinel cookie. See the note on
  // isOwner above for why this is an effect rather than an external store.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional one-shot snapshot; stability is required here
    setIsOwner(document.cookie.includes("owner_ui=1"));
  }, []);

  // Focus the password input on first render (when logged out)
  useEffect(() => {
    if (isOwner === false && passwordRef.current) {
      passwordRef.current.focus();
    }
  }, [isOwner]);

  async function handleLogin(e) {
    e.preventDefault();
    if (!password.trim()) return;

    setLoginState("submitting");
    setLoginError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        // Reload so the sentinel cookie is re-read and the logged-in view shows
        window.location.reload();
        return;
      }

      if (res.status === 401) {
        setLoginError("Invalid password.");
      } else if (res.status === 429) {
        setLoginError("Too many attempts. Please wait before trying again.");
      } else {
        setLoginError("Something went wrong. Please try again.");
      }
      setLoginState("error");
    } catch {
      setLoginError("Network error. Please check your connection.");
      setLoginState("error");
    }
  }

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "same-origin",
      });
    } catch {
      // Best-effort — reload regardless
    }
    window.location.reload();
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") {
      handleLogin(e);
    }
  }

  return (
    <Layout>
      <Head>
        <title>Admin · {siteTitle}</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <h1 className="text-2xl font-extrabold tracking-tighter leading-tight mb-6">
        Admin
      </h1>

      {/* Unknown state — still reading cookie client-side */}
      {isOwner === null && (
        <p className="text-gray-500 dark:text-slate-400">Loading…</p>
      )}

      {/* Logged-out state */}
      {isOwner === false && (
        <section aria-label="Owner login">
          <form onSubmit={handleLogin} noValidate>
            <div className="mb-4 max-w-sm">
              <label
                htmlFor="admin-password"
                className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1"
              >
                Password
              </label>
              <input
                ref={passwordRef}
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                autoComplete="current-password"
                disabled={loginState === "submitting"}
                aria-describedby={loginError ? "login-error" : undefined}
                className="w-full rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 px-3 py-2 text-base focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:focus-visible:outline-blue-400 disabled:opacity-50"
              />
              {loginError && (
                <p
                  id="login-error"
                  role="alert"
                  className="text-red-600 dark:text-red-400 text-sm mt-1"
                >
                  {loginError}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loginState === "submitting"}
              className="bg-blue-600 dark:bg-blue-500 text-white font-medium px-5 py-2.5 rounded-md hover:bg-blue-700 dark:hover:bg-blue-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loginState === "submitting" ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </section>
      )}

      {/* Logged-in state */}
      {isOwner === true && (
        <section aria-label="Owner account">
          <p className="text-gray-800 dark:text-slate-200 mb-4">
            You are signed in.
          </p>
          <button
            type="button"
            onClick={handleLogout}
            className="border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700 font-medium px-5 py-2.5 rounded-md"
          >
            Sign out
          </button>
        </section>
      )}
    </Layout>
  );
}
