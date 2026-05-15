// AssessmentCard — shows an assessment with its status, relevance, and action buttons.
import Link from "next/link";
import { type Assessment } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";

interface AssessmentCardProps {
  assessment: Assessment;
}

function getStatusStyle(status: string) {
  if (status === "Completed") return { bg: "#D1FAE5", text: "#065F46" };
  if (status === "In Progress") return { bg: "#FEF9C3", text: "#92400E" };
  if (status === "Ongoing") return { bg: "#DBEAFE", text: "#1E40AF" };
  if (status === "Not started") return { bg: "#FEE2E2", text: "#991B1B" };
  return { bg: "var(--psych-primary-light)", text: "var(--psych-accent)" };
}

export function AssessmentCard({ assessment }: AssessmentCardProps) {
  const statusStyle = getStatusStyle(assessment.scoreStatus);

  return (
    <div
      className="rounded-2xl border p-5 flex flex-col gap-3 transition-all hover:shadow-md"
      style={{
        backgroundColor: "var(--psych-card)",
        borderColor: "var(--psych-border)",
        boxShadow: "var(--psych-shadow)",
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold" style={{ color: "var(--psych-text)" }}>
            {assessment.title}
          </h3>
          <p className="text-xs mt-0.5" style={{ color: "var(--psych-muted)" }}>
            {assessment.category}
          </p>
        </div>
        <span
          className="text-xs px-2 py-0.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: statusStyle.bg, color: statusStyle.text }}
        >
          {assessment.scoreStatus}
        </span>
      </div>

      {/* Description */}
      <p className="text-xs leading-relaxed line-clamp-3" style={{ color: "var(--psych-muted)" }}>
        {assessment.description}
      </p>

      {/* Score */}
      {assessment.scoreValue && (
        <div
          className="text-xs px-3 py-2 rounded-lg font-medium"
          style={{ backgroundColor: "var(--psych-primary-light)", color: "var(--psych-accent)" }}
        >
          Score / Status: {assessment.scoreValue}
        </div>
      )}

      {/* Meta */}
      <div className="flex flex-wrap gap-3 text-xs" style={{ color: "var(--psych-muted)" }}>
        {assessment.lastCompleted && (
          <span className="flex items-center gap-1">
            <Calendar size={11} />
            Last: {assessment.lastCompleted}
          </span>
        )}
        {!assessment.lastCompleted && (
          <span className="flex items-center gap-1" style={{ color: "#DC2626" }}>
            <Calendar size={11} />
            Not yet completed
          </span>
        )}
      </div>

      {/* Relevance tags */}
      <div className="flex flex-wrap gap-1">
        {assessment.caseTypeRelevance.map((type) => (
          <span
            key={type}
            className="text-[9px] px-2 py-0.5 rounded-full border"
            style={{ borderColor: "var(--psych-border)", color: "var(--psych-muted)" }}
          >
            {type}
          </span>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-auto pt-1">
        <Button variant="primary" size="sm" className="flex-1">Open</Button>
        <Link href="/reports/assessment-grid">
          <Button variant="outline" size="sm">Preview Report</Button>
        </Link>
      </div>
    </div>
  );
}
