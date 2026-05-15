"use client";

// ThemeSelector shows 7 clickable color swatches. Clicking one applies that
// theme to the whole app and saves it in localStorage.

import { useTheme } from "@/components/shared/ThemeProvider";
import { cn } from "@/lib/utils";

export function ThemeSelector({ compact = false }: { compact?: boolean }) {
  const { currentThemeId, setTheme, themes } = useTheme();

  return (
    <div className={cn("flex flex-wrap gap-3", compact && "gap-2")}>
      {themes.map((theme) => {
        const isActive = currentThemeId === theme.id;
        return (
          <button
            key={theme.id}
            onClick={() => setTheme(theme.id)}
            title={theme.name}
            className={cn(
              "group flex flex-col items-center gap-1.5 rounded-xl p-2 transition-all",
              "hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
              isActive && "ring-2 ring-offset-2",
              compact ? "w-14" : "w-20"
            )}
            style={
              isActive
                ? { ringColor: theme.preview.primary, outlineColor: theme.preview.primary }
                : undefined
            }
            aria-pressed={isActive}
          >
            {/* Color preview: three stacked swatches */}
            <div
              className="w-full rounded-lg overflow-hidden border"
              style={{ borderColor: theme.preview.primary + "40" }}
            >
              <div
                className={cn("w-full", compact ? "h-6" : "h-8")}
                style={{ backgroundColor: theme.preview.bg }}
              />
              <div
                className={cn("w-full", compact ? "h-3" : "h-4")}
                style={{ backgroundColor: theme.preview.sidebar }}
              />
              <div
                className={cn("w-full", compact ? "h-2" : "h-3")}
                style={{ backgroundColor: theme.preview.primary }}
              />
            </div>

            {/* Theme name */}
            {!compact && (
              <span
                className={cn(
                  "text-[10px] font-medium text-center leading-tight",
                  isActive ? "opacity-100" : "opacity-60 group-hover:opacity-80"
                )}
                style={{ color: theme.preview.primary }}
              >
                {theme.name}
              </span>
            )}

            {/* Active indicator dot */}
            {isActive && (
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: theme.preview.primary }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
