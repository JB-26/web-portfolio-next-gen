import { useTheme } from "../hooks/useTheme";

// Shared so the placeholder and the real control occupy an identical box.
// min-h-11 keeps the mobile touch target at 44px; lg: restores the design's
// compact pill on pointer viewports.
//
// min-w is sized to the wider label ("☀ Light") and no more. The header has
// almost no slack at 390px — the whole row needs ~380px of the 390 available —
// so an over-generous reservation here pushes the nav onto a second line.
const PILL =
  "inline-flex min-h-11 min-w-[4.5rem] items-center justify-center gap-1.5 rounded-full border border-line px-3 text-[13px] lg:min-h-8";

export default function ThemeToggle() {
  const { theme, toggleTheme, mounted } = useTheme();

  // The server can't know the visitor's theme, so the real control only renders
  // after hydration. Returning null would leave a gap that fills in a frame
  // later, reflowing the nav — this reserves the exact same box instead, so
  // nothing moves.
  if (!mounted) {
    return <span aria-hidden="true" className={PILL} />;
  }

  const isDark = theme === "dark";
  const label = isDark ? "Switch to light mode" : "Switch to dark mode";

  return (
    <button
      type="button"
      data-testid="theme-toggle"
      aria-label={label}
      aria-pressed={isDark}
      title={label}
      onClick={toggleTheme}
      className={`${PILL} text-muted hover:border-accent hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent`}
    >
      <span aria-hidden="true">{isDark ? "☀" : "☾"}</span>
      {isDark ? "Light" : "Dark"}
    </button>
  );
}
