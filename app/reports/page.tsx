// Reports hub — lists all available report types.
import Link from "next/link";
import { PageHeader } from "@/components/shared/PageHeader";
import { FileText, Printer, Sparkles } from "lucide-react";

const reports = [
  {
    href: "/reports/daily",
    title: "Daily Report",
    description: "Single-session clinical observation report with all key domains.",
    pages: "1 page",
    icon: "📋",
  },
  {
    href: "/reports/weekly",
    title: "Weekly Report",
    description: "End-of-week summary covering progress, difficulties, and next objectives.",
    pages: "1–2 pages",
    icon: "📅",
  },
  {
    href: "/reports/monthly",
    title: "Monthly Report",
    description: "Monthly clinical evolution summary with supervision integration.",
    pages: "2 pages",
    icon: "📆",
  },
  {
    href: "/reports/one-page",
    title: "One-Page Summary",
    description: "Compact case overview — ideal for referrals and quick updates.",
    pages: "1 page",
    icon: "📄",
  },
  {
    href: "/reports/two-page",
    title: "Two-Page Summary",
    description: "Extended summary with clinical analysis across two pages.",
    pages: "2 pages",
    icon: "📑",
  },
  {
    href: "/reports/assessment-grid",
    title: "Assessment Grid Report",
    description: "Printable assessment scores and observations in table format.",
    pages: "1 page",
    icon: "📊",
  },
  {
    href: "/reports/final-long",
    title: "Final Long Report",
    description: "Full internship or university long report — 15+ page structure.",
    pages: "15+ pages",
    icon: "📚",
    badge: "Structure ready",
  },
];

export default function ReportsPage() {
  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <PageHeader
        title="Reports"
        subtitle="Generate and print clinical reports for cases, supervision, and university submission"
      />

      {/* Smart Report Builder — pulls real data from check-ins, reviews,
          formulations, supervision, and more. */}
      <Link href="/reports/builder" className="block group mb-4">
        <div
          className="rounded-2xl border p-5 transition-all hover:shadow-md hover:scale-[1.01] cursor-pointer"
          style={{
            background:
              "linear-gradient(135deg, var(--psych-gradient-from), var(--psych-gradient-to))",
            borderColor: "var(--psych-border)",
          }}
        >
          <div className="flex items-start gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: "white" }}
            >
              <Sparkles size={18} style={{ color: "var(--psych-primary)" }} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3
                  className="text-sm font-semibold"
                  style={{ color: "var(--psych-text)" }}
                >
                  Smart Report Builder ✦
                </h3>
                <span
                  className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                  style={{
                    backgroundColor: "white",
                    color: "var(--psych-accent)",
                  }}
                >
                  V2
                </span>
              </div>
              <p
                className="text-xs leading-relaxed"
                style={{ color: "var(--psych-text)" }}
              >
                Pick a case, a date range, and the sections you want. Psych
                pulls real data from check-ins, reviews, formulations, and
                supervision into an editable draft with source indicators.
              </p>
            </div>
          </div>
        </div>
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reports.map((report) => (
          <Link key={report.href} href={report.href} className="block group">
            <div
              className="rounded-2xl border p-5 h-full transition-all hover:shadow-md hover:scale-[1.01] cursor-pointer"
              style={{
                backgroundColor: "var(--psych-card)",
                borderColor: "var(--psych-border)",
                boxShadow: "var(--psych-shadow)",
              }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                  style={{ backgroundColor: "var(--psych-primary-light)" }}
                >
                  {report.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-semibold" style={{ color: "var(--psych-text)" }}>
                      {report.title}
                    </h3>
                    {report.badge && (
                      <span
                        className="text-[10px] px-1.5 py-0.5 rounded-full"
                        style={{ backgroundColor: "var(--psych-primary-light)", color: "var(--psych-accent)" }}
                      >
                        {report.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs leading-relaxed mb-2" style={{ color: "var(--psych-muted)" }}>
                    {report.description}
                  </p>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] flex items-center gap-1" style={{ color: "var(--psych-muted)" }}>
                      <FileText size={10} />
                      {report.pages}
                    </span>
                    <span
                      className="text-[10px] flex items-center gap-1 font-medium"
                      style={{ color: "var(--psych-primary)" }}
                    >
                      <Printer size={10} />
                      A4 print-ready
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
