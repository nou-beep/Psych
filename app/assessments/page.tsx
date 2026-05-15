// Assessments page — grid of all assessments with their cards.
import { PageHeader } from "@/components/shared/PageHeader";
import { AssessmentCard } from "@/components/assessments/AssessmentCard";
import { SectionCard } from "@/components/shared/SectionCard";
import { mockAssessments } from "@/lib/mock-data";

export default function AssessmentsPage() {
  const completed = mockAssessments.filter(
    (a) => a.scoreStatus === "Completed" || a.scoreStatus === "Ongoing" || a.scoreStatus === "In Progress"
  );
  const notStarted = mockAssessments.filter(
    (a) => a.scoreStatus === "Not started" || a.scoreStatus === "Template"
  );

  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
      <PageHeader
        title="Assessments"
        subtitle="Clinical observation tools, checklists, and scoring grids"
      />

      {/* Note */}
      <div
        className="rounded-2xl px-5 py-4 mb-6 text-sm"
        style={{
          backgroundColor: "var(--psych-primary-light)",
          color: "var(--psych-accent)",
        }}
      >
        ✦ These tools support clinical hypothesis formation and observation. They do not replace
        standardized psychometric testing or clinical diagnosis.
      </div>

      {/* Active assessments */}
      {completed.length > 0 && (
        <div className="mb-8">
          <h2
            className="text-xs font-semibold uppercase tracking-widest mb-4"
            style={{ color: "var(--psych-muted)" }}
          >
            Active / In Progress
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {completed.map((a) => (
              <AssessmentCard key={a.id} assessment={a} />
            ))}
          </div>
        </div>
      )}

      {/* Not started */}
      {notStarted.length > 0 && (
        <div>
          <h2
            className="text-xs font-semibold uppercase tracking-widest mb-4"
            style={{ color: "var(--psych-muted)" }}
          >
            Not Yet Started
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {notStarted.map((a) => (
              <AssessmentCard key={a.id} assessment={a} />
            ))}
          </div>
        </div>
      )}

      {/* Info section */}
      <SectionCard
        title="About Assessments in Psych"
        description="Clinical and ethical context"
        className="mt-8"
      >
        <div className="space-y-2 text-sm" style={{ color: "var(--psych-muted)" }}>
          <p>All assessment tools in Psych are for <strong style={{ color: "var(--psych-text)" }}>clinical observation and hypothesis formation</strong> only.</p>
          <p>They are not standardized psychometric instruments. Do not use them to make diagnostic decisions without proper clinical supervision.</p>
          <p>When using these tools, always ensure informed consent and maintain appropriate confidentiality.</p>
        </div>
      </SectionCard>
    </div>
  );
}
