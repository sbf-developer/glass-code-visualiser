/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "system-ui",
          "sans-serif",
        ],
        mono: [
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "monospace",
        ],
      },
      colors: {
        canvas: "var(--bg)",
        surface: "var(--surface)",
        elevated: "var(--elevated)",
        line: "var(--border)",
        muted: "var(--muted)",
        subtle: "var(--subtle)",
        ink: "var(--fg)",
        "ink-muted": "var(--fg-secondary)",
        accent: "var(--accent)",
        "on-accent": "var(--accent-fg)",
        highlight: "var(--highlight)",
        "highlight-bg": "var(--highlight-bg)",
        success: "var(--success)",
        danger: "var(--danger)",
        "danger-bg": "var(--danger-bg)",
        "danger-border": "var(--danger-border)",
        "type-int": "var(--type-int)",
        "type-str": "var(--type-str)",
        "type-bool": "var(--type-bool)",
        "type-list": "var(--type-list)",
        "type-dict": "var(--type-dict)",
      },
      letterSpacing: {
        brand: "-0.03em",
      },
    },
  },
  plugins: [],
};
