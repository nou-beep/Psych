// CaseCard — shows a summary of a clinical case with type, status, and metadata.
import Link from "next/link";
import { Calendar, Clock, Tag, ArrowRight } from "lucide-react";
import { Badge, getStatusVariant } from "@/components/ui/badge";
import { type PsychCase } from "@/lib/mock-data";

interface CaseCardProps {
  caseData: PsychCase;
}

// Map case types to a soft accent color
function getCaseTypeColor(type: string) {
  const colors: Record<string, { bg: string; text: string }> = {
    "Clinical Case": { bg: "#FEE2E2", text: "#991B1B" },
    "Child Follow-Up": { bg: "#FEF3C7", text: "#92400E" },
    "Autism Internship Case": { bg: "#E0E7FF", text: "#3730A3" },
    "Adult Case": { bg: "#FCE7F3", text: "#9D174D" },
    "Research Participant": { bg: "#D1FAE5", text: "#065F46" },
    "Supervision Case": { bg: "#F3E8FF", text: "#6B21A8" },
    "Assessment Only": { bg: "#DBEAFE", text: "#1E40AF" },
  };
  return colors[type] ?? { bg: "#F1F5F9", text: "#475569" };
}

export function CaseCard({ caseData }: CaseCardProps) {
  const typeColor = getCaseTypeColor(caseData.type);

  return (
    <Link href={`/cases/${caseData.id}`} className="block group">
      <div
        className="rounded-2xl border p-5 transition-all hover:shadow-md hover:scale-[1.01] cursor-pointer"
        style={{
          backgroundColor: "var(--psych-card)",
          borderColor: "var(--psych-border)",
          boxShadow: "var(--psych-shadow)",
        }}
      >
        {/* Top row: code + status */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span
              className="font-mono text-xs font-bold px-2 py-0.5 rounded-md"
              style={{ backgroundColor: "var(--psych-primary-light)", color: "var(--psych-primary)" }}
            >
              {caseData.code}
            </span>
            <Badge
              style={{ backgroundColor: typeColor.bg, color: typeColor.text }}
            >
              {caseData.type}
            </Badge>
          </div>
          <Badge variant={getStatusVariant(caseData.status)}>
            {caseData.status}
          </Badge>
        </div>

        {/* Short note */}
        <p
          className="text-sm mb-3 leading-relaxed line-clamp-2"
          style={{ color: "var(--psych-text)" }}
        >
          {caseData.shortNote}
        </p>

        {/* Meta row */}
        <div
          className="flex flex-wrap items-center gap-3 text-xs mb-3"
          style={{ color: "var(--psych-muted)" }}
        >
          <span className="flex items-center gap-1">
            <Clock size={12} />
            Last: {caseData.lastCheckIn}
          </span>
          <span className="flex items-center gap-1">
            <Calendar size={12} />
            Due: {caseData.nextReportDue}
          </span>
        </div>

        {/* Tags */}
        {caseData.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {caseData.tags.map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border"
                style={{
                  borderColor: "var(--psych-border)",
                  color: "var(--psych-muted)",
                  backgroundColor: "var(--psych-bg)",
                }}
              >
                <Tag size={8} />
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Alerts */}
        {caseData.alerts && caseData.alerts.length > 0 && (
          <div
            className="text-xs px-3 py-2 rounded-lg mb-3"
            style={{ backgroundColor: "#FEF3C7", color: "#92400E" }}
          >
            ⚠ {caseData.alerts[0]}
          </div>
        )}

        {/* View link */}
        <div
          className="flex items-center gap-1 text-xs font-medium transition-all group-hover:gap-2"
          style={{ color: "var(--psych-primary)" }}
        >
          View case details
          <ArrowRight size={12} />
        </div>
      </div>
    </Link>
  );
}
