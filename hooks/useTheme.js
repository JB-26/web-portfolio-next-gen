import { useCallback, useSyncExternalStore } from "react";

/**
 * The `dark` class on <html> is the source of truth, not a copy held in React
 * state. The FOUC-safe script in pages/_document.js sets it before first paint,
 * so mirroring it into state with a setState-in-effect meant an extra render
 * pass and a second place for the value to live. Reading it through
 * useSyncExternalStore keeps React in step with the DOM, including if the class
 * is changed from anywhere else.
 */
function subscribeToThemeClass(onStoreChange) {
  const observer = new MutationObserver(onStoreChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
  return () => observer.disconnect();
}

const getThemeSnapshot = () =>
  document.documentElement.classList.contains("dark") ? "dark" : "light";

// The server has no DOM to read; the real value arrives at hydration.
const getThemeServerSnapshot = () => "light";

// "Has hydrated", expressed as a store so it needs no effect: false during
// SSR, true on the client. Consumers use it to avoid rendering theme-dependent
// markup that the server couldn't have produced.
const subscribeToNothing = () => () => {};
const getMountedSnapshot = () => true;
const getMountedServerSnapshot = () => false;

export function useTheme() {
  const theme = useSyncExternalStore(
    subscribeToThemeClass,
    getThemeSnapshot,
    getThemeServerSnapshot,
  );

  const mounted = useSyncExternalStore(
    subscribeToNothing,
    getMountedSnapshot,
    getMountedServerSnapshot,
  );

  const toggleTheme = useCallback(() => {
    const next = getThemeSnapshot() === "dark" ? "light" : "dark";
    document.documentElement.classList.toggle("dark", next === "dark");
    try {
      localStorage.setItem("theme", next);
    } catch {
      // Private browsing or a blocked storage partition — the class is still
      // applied, the choice just won't survive a reload.
    }
    // No setState here: the MutationObserver above notifies React.
  }, []);

  return { theme, toggleTheme, mounted };
}
