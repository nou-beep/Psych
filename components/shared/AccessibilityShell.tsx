"use client";
// Wraps the app and applies accessibility class names on a containing
// div. The matching CSS lives in app/globals.css.

import type { ReactNode } from "react";
import { useSettings } from "@/contexts/SettingsContext";
import { accessibilityClasses } from "@/lib/accessibility";

export function AccessibilityShell({ children }: { children: ReactNode }) {
  const { accessibility } = useSettings();
  const classes = accessibilityClasses(accessibility).join(" ");
  return (
    <div className={classes} data-a11y-shell>
      {children}
    </div>
  );
}
