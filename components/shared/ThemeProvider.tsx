"use client";

// ThemeProvider reads the saved theme from localStorage and applies it to the
// <html> element as a data-psych-theme attribute. This triggers the CSS
// variable overrides defined in globals.css, changing the entire app's colors.

import { createContext, useContext, useEffect, useState } from "react";
import { THEMES, DEFAULT_THEME_ID, THEME_STORAGE_KEY, type PsychTheme } from "@/lib/themes";

interface ThemeContextValue {
  currentThemeId: string;
  setTheme: (id: string) => void;
  themes: PsychTheme[];
}

const ThemeContext = createContext<ThemeContextValue>({
  currentThemeId: DEFAULT_THEME_ID,
  setTheme: () => {},
  themes: THEMES,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [currentThemeId, setCurrentThemeId] = useState(DEFAULT_THEME_ID);
  const [mounted, setMounted] = useState(false);

  // On first load, read saved theme from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    const validIds = THEMES.map((t) => t.id);
    if (saved && validIds.includes(saved)) {
      setCurrentThemeId(saved);
      applyTheme(saved);
    } else {
      applyTheme(DEFAULT_THEME_ID);
    }
    setMounted(true);
  }, []);

  function applyTheme(id: string) {
    const theme = THEMES.find((t) => t.id === id);
    if (!theme) return;
    const html = document.documentElement;
    // Remove all theme data attributes
    html.removeAttribute("data-psych-theme");
    // Set new theme (default theme = no attribute needed, others need it)
    if (id !== DEFAULT_THEME_ID) {
      html.setAttribute("data-psych-theme", theme.dataAttr);
    }
  }

  function setTheme(id: string) {
    setCurrentThemeId(id);
    localStorage.setItem(THEME_STORAGE_KEY, id);
    applyTheme(id);
  }

  // Prevent hydration mismatch — render children only after mount
  if (!mounted) {
    return <div style={{ visibility: "hidden" }}>{children}</div>;
  }

  return (
    <ThemeContext.Provider value={{ currentThemeId, setTheme, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Hook to use the theme context in any component
export function useTheme() {
  return useContext(ThemeContext);
}
