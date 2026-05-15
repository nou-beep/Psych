// Weekly Report
import { PrintableLayout } from "@/components/reports/PrintableLayout";
import { ReportHeader } from "@/components/reports/ReportHeader";
import { ReportSection } from "@/components/reports/ReportSection";
import { reportPreviewData } from "@/lib/mock-data";

const { reportingCase, weeklyReview } = reportPreviewData;

export default function WeeklyReportPage() {
  return (
    <PrintableLayout title="Weekly Report">
      <ReportHeader
        title="Weekly Clinical Review Report"
        subtitle="End-of-Week Summary"
        caseCode={reportingCase.code}
        dateRange={`${weeklyReview.weekStart} – ${weeklyReview.weekEnd}`}
        studentName={`Student: ${reportPreviewData.studentName}`}
        institution={`Institution: ${reportPreviewData.institution}`}
        supervisorName={`Supervisor: ${reportPreviewData.supervisorName}`}
      />

      <ReportSection title="1. Week Overview">
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div><strong>Case:</strong> {reportingCase.code} — {reportingCase.type}</div>
          <div><strong>Status:</strong> {reportingCase.status}</div>
          <div><strong>Week:</strong> {weeklyReview.weekStart} to {weeklyReview.weekEnd}</div>
        </div>
      </ReportSection>

      <ReportSection title="2. Summary of Progress">
        <p>{weeklyReview.mainProgress}</p>
      </ReportSection>

      <ReportSection title="3. Difficulties Observed">
        <p>{weeklyReview.mainDifficulties}</p>
      </ReportSection>

      <ReportSection title="4. Repeated Patterns">
        <p>{weeklyReview.repeatedPatterns}</p>
      </ReportSection>

      <ReportSection title="5. Effective Interventions">
        <p>{weeklyReview.effectiveInterventions}</p>
      </ReportSection>

      <ReportSection title="6. Concerns">
        <p>{weeklyReview.concerns}</p>
      </ReportSection>

      <ReportSection title="7. Objectives for Next Week">
        <p>{weeklyReview.goalsNextWeek}</p>
      </ReportSection>

      <ReportSection title="8. Questions for Supervision">
        <p>{weeklyReview.questionsForSupervision}</p>
      </ReportSection>

      <div className="print-signature mt-8 pt-6 border-t grid grid-cols-2 gap-12"
        style={{ borderColor: "var(--psych-border)" }}>
        <div>
          <p className="text-xs font-semibold mb-6" style={{ color: "var(--psych-text)" }}>Student / Clinician Signature</p>
          <div className="border-b w-48 mb-1" style={{ borderColor: "var(--psych-border)" }} />
          <p className="text-xs" style={{ color: "var(--psych-muted)" }}>Name &amp; Signature</p>
        </div>
        <div>
          <p className="text-xs font-semibold mb-6" style={{ color: "var(--psych-text)" }}>Supervisor Signature</p>
          <div className="border-b w-48 mb-1" style={{ borderColor: "var(--psych-border)" }} />
          <p className="text-xs" style={{ color: "var(--psych-muted)" }}>Signature &amp; Date</p>
        </div>
      </div>
    </PrintableLayout>
  );
}
