"use client";
// PrintableLayout — wraps every report page.
// On screen: shows report content with Back and Print buttons.
// On print: only the report content is printed (buttons/nav hidden via CSS).

import Link from "next/link";
import { type ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PrintButton } from "@/components/shared/PrintButton";

interface PrintableLayoutProps {
  children: ReactNode;
  title: string;
  backHref?: string;
  backLabel?: string;
}

export function PrintableLayout({
  children,
  title,
  backHref = "/reports",
  backLabel = "Back to Reports",
}: PrintableLayoutProps) {
  return (
    <div className="max-w-4xl mx-auto">
      {/* Screen-only controls */}
      <div className="no-print flex items-center justify-between gap-4 mb-6">
        <Link href={backHref}>
          <Button variant="ghost" size="sm">
            <ArrowLeft size={14} />
            {backLabel}
          </Button>
        </Link>
        <PrintButton label="Print Report" variant="primary" />
      </div>

      {/* Print tip */}
      <div
        className="no-print mb-6 px-4 py-3 rounded-xl text-sm"
        style={{ backgroundColor: "var(--psych-primary-light)", color: "var(--psych-accent)" }}
      >
        ✦ This report is formatted for A4 printing. Navigation and buttons are hidden when printed.
      </div>

      {/* Report content */}
      <div
        className="rounded-2xl border p-6 md:p-10 print-card animate-fade-in"
        style={{
          backgroundColor: "var(--psych-card)",
          borderColor: "var(--psych-border)",
          boxShadow: "var(--psych-shadow)",
        }}
      >
        {children}
      </div>
    </div>
  );
}
