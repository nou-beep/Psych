// ReportSection — a labeled section inside a report.
import { type ReactNode } from "react";

interface ReportSectionProps {
  title: string;
  children: ReactNode;
  className?: string;
}

export function ReportSection({ title, children, className }: ReportSectionProps) {
  return (
    <div className={`print-keep-together mb-5 ${className ?? ""}`}>
      <h2
        className="print-section-title text-sm font-bold uppercase tracking-wide pb-1 mb-3 border-b"
        style={{ color: "var(--psych-text)", borderColor: "var(--psych-border)" }}
      >
        {title}
      </h2>
      <div className="text-sm leading-relaxed" style={{ color: "var(--psych-text)" }}>
        {children}
      </div>
    </div>
  );
}
