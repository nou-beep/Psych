"use client";
// Formation → Internship → Reports. Focused list of every internship
// report (daily / weekly / monthly / final) across all cases.

import Link from "next/link";
import { FileText, ClipboardCheck, ArrowRight } from "lucide-react";
import { SectionCard } from "@/components/shared/SectionCard";
import { Button } from "@/components/ui/button";
import { useInternship } from "@/contexts/InternshipContext";
import {
  INTERNSHIP_REPORT_LABELS,
  type InternshipReportKind,
} from "@/lib/internship/types";

const KIND_TINT: Record<InternshipReportKind, string> = {
  daily: "#3B82F6",
  weekly: "#8E72CC",
  monthly: "#7C4FB3",
  "test-admin": "#10B981",
  "grid-summary": "#F59E0B",
  "supervision-summary": "#5B36A8",
  final: "#9F1239",
};

export default function FormationInternshipReportsPage() {
  const { reports, cases } = useInternship();

  const sorted = [...reports].sort((a, b) =>
    b.updatedAt.localeCompare(a.updatedAt)
  );

  const caseByID = new Map(cases.map((c) => [c.id, c]));

  const drafts = sorted.filter((r) => r.draft);
  const finalized = sorted.filter((r) => !r.draft);

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      <header>
        <p
          className="text-xs uppercase tracking-widest font-semibold"
          style={{ color: "#5B36A8" }}
        >
          Formation · Internship
        </p>
        <h1
          className="text-2xl font-bold mt-1"
          style={{ color: "var(--psych-text)" }}
        >
          Internship Reports
        </h1>
        <p
          className="text-sm mt-1"
          style={{ color: "var(--psych-muted)" }}
        >
          Daily observations, weekly synthesis, supervision summaries
          and the final internship report — all assembled from your
          structured case data.
        </p>
      </header>

      <SectionCard title={`Drafts (${drafts.length})`}>
        {drafts.length === 0 ? (
          <EmptyRow text="No draft reports. Generate one from a case in the Internship Studio." />
        ) : (
          <div className="space-y-2">
            {drafts.map((r) => (
              <ReportRow
                key={r.id}
                report={r}
                caseCode={caseByID.get(r.caseId)?.identification.caseCode}
              />
            ))}
          </div>
        )}
      </SectionCard>

      {finalized.length > 0 && (
        <SectionCard title={`Finalized (${finalized.length})`}>
          <div className="space-y-2">
            {finalized.map((r) => (
              <ReportRow
                key={r.id}
                report={r}
                caseCode={caseByID.get(r.caseId)?.identification.caseCode}
                finalized
              />
            ))}
          </div>
        </SectionCard>
      )}

      <div className="text-center pt-2">
        <Link href="/formation/internship">
          <Button variant="outline" size="sm">
            <ClipboardCheck size={13} /> Generate reports in Studio
          </Button>
        </Link>
      </div>
    </div>
  );
}

interface ReportRowProps {
  report: ReturnType<
    typeof useInternship
  >["reports"][number];
  caseCode: string | undefined;
  finalized?: boolean;
}

function ReportRow({ report, caseCode, finalized }: ReportRowProps) {
  const tint = KIND_TINT[report.kind];
  return (
    <Link
      href={`/formation/internship/cases/${report.caseId}`}
    >
      <div
        className="flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all hover:scale-[1.01]"
        style={{
          backgroundColor: "var(--psych-bg)",
          borderColor: "var(--psych-border)",
          opacity: finalized ? 0.85 : 1,
        }}
      >
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: tint + "22", color: tint }}
        >
          <FileText size={15} />
        </div>
        <div className="flex-1 min-w-0">
          <p
            className="text-sm font-medium truncate"
            style={{ color: "var(--psych-text)" }}
          >
            {report.title || INTERNSHIP_REPORT_LABELS[report.kind]}
          </p>
          <p
            className="text-xs truncate"
            style={{ color: "var(--psych-muted)" }}
          >
            {INTERNSHIP_REPORT_LABELS[report.kind]}
            {caseCode ? ` · ${caseCode}` : ""}
            {" · "}
            {report.updatedAt.slice(0, 10)}
          </p>
        </div>
        <span
          className="text-[10px] uppercase tracking-widest"
          style={{ color: finalized ? "#0E7B5C" : tint }}
        >
          {finalized ? "Finalized" : "Draft"}
        </span>
        <ArrowRight
          size={14}
          style={{ color: "var(--psych-muted)" }}
        />
      </div>
    </Link>
  );
}

function EmptyRow({ text }: { text: string }) {
  return (
    <div
      className="text-center py-8 text-sm"
      style={{ color: "var(--psych-muted)" }}
    >
      {text}
    </div>
  );
}
