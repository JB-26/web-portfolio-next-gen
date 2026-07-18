import { useTheme } from "../hooks/useTheme";

export default function ThemeToggle() {
  const { theme, toggleTheme, mounted } = useTheme();

  if (!mounted) return null;

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
      // min-h-11 keeps the mobile touch target at 44px; lg: restores the
      // design's compact pill on pointer viewports.
      className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-full border border-line px-3 text-[13px] text-muted hover:border-accent hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent lg:min-h-8"
    >
      <span aria-hidden="true">{isDark ? "☀" : "☾"}</span>
      {isDark ? "Light" : "Dark"}
    </button>
  );
}
