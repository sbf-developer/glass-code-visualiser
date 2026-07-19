interface ThemeToggleProps {
  isDark: boolean;
  onToggle: () => void;
}

export function ThemeToggle({ isDark, onToggle }: ThemeToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="theme-toggle"
      title={isDark ? "Light mode" : "Dark mode"}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? (
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.25">
          <circle cx="8" cy="8" r="3" />
          <path strokeLinecap="round" d="M8 1.5v1.5M8 13v1.5M1.5 8H3M13 8h1.5M3.05 3.05l1.06 1.06M11.89 11.89l1.06 1.06M3.05 12.95l1.06-1.06M11.89 4.11l1.06-1.06" />
        </svg>
      ) : (
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.25">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M13.2 10.5a5.5 5.5 0 0 1-7.7-7.7A5.5 5.5 0 1 0 13.2 10.5Z"
          />
        </svg>
      )}
    </button>
  );
}
