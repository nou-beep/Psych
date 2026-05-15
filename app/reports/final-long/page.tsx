// Final Long Report — structure placeholder.
// The 15+ page report structure is defined here. Full generation is a future feature.
import Link from "next/link";
import { ArrowLeft, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/shared/SectionCard";
import { PageHeader } from "@/components/shared/PageHeader";

const sections = [
  { num: "01", title: "Cover Page", desc: "Institution, student name, case code, academic year, supervisor" },
  { num: "02", title: "Table of Contents", desc: "Auto-generated from all sections" },
  { num: "03", title: "Introduction", desc: "Context, objectives, and methodology overview" },
  { num: "04", title: "Case Presentation", desc: "Anonymized case background, referral context, presenting concerns" },
  { num: "05", title: "Methodology", desc: "Approach, theoretical framework, tools used" },
  { num: "06", title: "Assessment Tools", desc: "Description and justification of all assessment instruments used" },
  { num: "07", title: "Daily Observation Synthesis", desc: "Thematic summary of all daily check-ins" },
  { num: "08", title: "Weekly Observation Synthesis", desc: "Progression narrative from weekly reviews" },
  { num: "09", title: "Monthly Observation Synthesis", desc: "Evolution overview by month" },
  { num: "10", title: "Clinical Analysis", desc: "In-depth clinical interpretation of observations" },
  { num: "11", title: "Intervention Plan", desc: "Summary of all interventions used and rationale" },
  { num: "12", title: "Evolution & Progress", desc: "Measurable changes and clinical progress markers" },
  { num: "13", title: "Supervision Reflections", desc: "Key learnings from supervision process" },
  { num: "14", title: "Recommendations", desc: "Clinical recommendations for next clinician / institution" },
  { num: "15", title: "Conclusion", desc: "Summary of case, limitations, and reflections" },
  { num: "16", title: "Appendices", desc: "Grids, check-ins, assessment scores, supervision notes" },
];

export default function FinalLongReportPage() {
  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <Link href="/reports">
        <Button variant="ghost" size="sm" className="mb-4 no-print">
          <ArrowLeft size={14} />
          Back to Reports
        </Button>
      </Link>

      <PageHeader
        title="Final Long Report"
        subtitle="15+ page university / internship report structure"
      />

      {/* Coming soon banner */}
      <div
        className="rounded-2xl p-6 mb-6 text-center"
        style={{
          background: "linear-gradient(135deg, var(--psych-gradient-from), var(--psych-gradient-to))",
          border: "1px solid var(--psych-border)",
        }}
      >
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3"
          style={{ backgroundColor: "var(--psych-primary-light)" }}
        >
          <Lock size={20} style={{ color: "var(--psych-primary)" }} />
        </div>
        <h3 className="text-base font-bold mb-1" style={{ color: "var(--psych-text)" }}>
          Full generation coming soon ✦
        </h3>
        <p className="text-sm max-w-md mx-auto" style={{ color: "var(--psych-muted)" }}>
          The complete 15-page report generator will auto-compile all your check-ins, weekly
          reviews, monthly summaries, supervision notes, and assessments into a single
          formatted report. This requires Supabase connection.
        </p>
      </div>

      {/* Section structure preview */}
      <h3
        className="text-xs font-semibold uppercase tracking-widest mb-4"
        style={{ color: "var(--psych-muted)" }}
      >
        Report structure — {sections.length} sections
      </h3>

      <div className="space-y-2">
        {sections.map((section) => (
          <div
            key={section.num}
            className="flex items-start gap-4 p-4 rounded-xl border"
            style={{
              backgroundColor: "var(--psych-card)",
              borderColor: "var(--psych-border)",
            }}
          >
            <span
              className="font-mono text-xs font-bold w-8 flex-shrink-0 mt-0.5"
              style={{ color: "var(--psych-primary)" }}
            >
              {section.num}
            </span>
            <div>
              <p className="text-sm font-semibold" style={{ color: "var(--psych-text)" }}>
                {section.title}
              </p>
              <p className="text-xs" style={{ color: "var(--psych-muted)" }}>
                {section.desc}
              </p>
            </div>
            <div
              className="ml-auto text-[10px] px-2 py-0.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: "var(--psych-primary-light)", color: "var(--psych-muted)" }}
            >
              Planned
            </div>
          </div>
        ))}
      </div>

      <SectionCard title="Future Feature" className="mt-6" description="What will be auto-generated">
        <div className="space-y-2 text-sm" style={{ color: "var(--psych-muted)" }}>
          <p>Once Supabase is connected, this page will compile all your data into a formatted long report:</p>
          <ul className="space-y-1 ml-4">
            <li>• Auto-populate all sections from saved check-ins and reviews</li>
            <li>• Support French, English, and Arabic</li>
            <li>• Export as PDF</li>
            <li>• Support Academic, Clinical, and Minimal report styles</li>
          </ul>
        </div>
      </SectionCard>
    </div>
  );
}
