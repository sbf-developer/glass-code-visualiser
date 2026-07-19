export type Theme = "light" | "dark";

const STORAGE_KEY = "glass-theme";
const LEGACY_KEY = "algo-viz-theme";

function getSystemTheme(): Theme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
}

export function getInitialTheme(): Theme {
  const stored =
    (localStorage.getItem(STORAGE_KEY) as Theme | null) ??
    (localStorage.getItem(LEGACY_KEY) as Theme | null);
  if (stored === "light" || stored === "dark") return stored;
  return getSystemTheme();
}

export function setTheme(theme: Theme) {
  localStorage.setItem(STORAGE_KEY, theme);
  applyTheme(theme);
}

export function initTheme() {
  applyTheme(getInitialTheme());
}
