import { useEffect, useState } from "react";
import { getInitialTheme, setTheme, type Theme } from "../lib/theme";

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => getInitialTheme());

  useEffect(() => {
    setTheme(theme);
  }, [theme]);

  const toggle = () => {
    setThemeState((t) => (t === "dark" ? "light" : "dark"));
  };

  return { theme, toggle, isDark: theme === "dark" };
}
