"use client";

// Header — top bar visible on all pages. Shows the current page title.
// On mobile, it shows the Psych logo since the sidebar is hidden.

import { usePathname } from "next/navigation";
import { Sparkles } from "lucide-react";
import { ThemeSelector } from "@/components/shared/ThemeSelector";

const pageTitles: Record<string, string> = {
  "/": "Dashboard",
  "/cases": "Cases",
  "/checkins": "Check-ins",
  "/assessments": "Assessments",
  "/grids": "Grids",
  "/reports": "Reports",
  "/reports/daily": "Daily Report",
  "/reports/weekly": "Weekly Report",
  "/reports/monthly": "Monthly Report",
  "/reports/one-page": "One-Page Summary",
  "/reports/two-page": "Two-Page Summary",
  "/reports/assessment-grid": "Assessment Grid Report",
  "/reports/final-long": "Final Long Report",
  "/supervision": "Supervision",
  "/research": "Research",
  "/settings": "Settings",
};

export function Header() {
  const pathname = usePathname();

  function getTitle() {
    if (pageTitles[pathname]) return pageTitles[pathname];
    if (pathname.startsWith("/cases/")) return "Case Details";
    return "Psych";
  }

  return (
    <header
      className="no-print sticky top-0 z-20 flex items-center justify-between px-5 py-3.5 border-b backdrop-blur-sm"
      style={{
        backgroundColor: "var(--psych-card)",
        borderColor: "var(--psych-border)",
      }}
    >
      {/* Mobile logo (hidden on desktop) */}
      <div className="flex items-center gap-2 lg:hidden">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold"
          style={{ backgroundColor: "var(--psych-primary)" }}
        >
          P
        </div>
        <span className="font-bold text-base" style={{ color: "var(--psych-text)" }}>
          Psych
        </span>
        <Sparkles size={11} style={{ color: "var(--psych-primary)" }} />
      </div>

      {/* Page title (desktop) */}
      <h1
        className="hidden lg:block text-base font-semibold"
        style={{ color: "var(--psych-text)" }}
      >
        {getTitle()}
      </h1>

      {/* Right side: compact theme selector */}
      <div className="flex items-center gap-3">
        <ThemeSelector compact />
      </div>
    </header>
  );
}
