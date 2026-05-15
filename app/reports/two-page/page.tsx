// Two-Page Summary Report — extended case summary with page break.
import { PrintableLayout } from "@/components/reports/PrintableLayout";
import { ReportHeader } from "@/components/reports/ReportHeader";
import { ReportSection } from "@/components/reports/ReportSection";
import { reportPreviewData } from "@/lib/mock-data";

const { reportingCase, weeklyReview, monthlyReview } = reportPreviewData;
const today = new Date().toLocaleDateString("en-CA");

export default function TwoPageReportPage() {
  return (
    <PrintableLayout title="Two-Page Summary">

      {/* PAGE 1 */}
      <ReportHeader
        title="Two-Page Clinical Summary Report"
        subtitle="Extended Case Overview — Page 1 of 2"
        caseCode={reportingCase.code}
        dateRange={today}
        studentName={`Student: ${reportPreviewData.studentName}`}
        institution={`Institution: ${reportPreviewData.institution}`}
        supervisorName={`Supervisor: ${reportPreviewData.supervisorName}`}
      />

      <ReportSection title="1. Case Background">
        <div className="text-sm space-y-1 mb-3">
          <p><strong>Case Code:</strong> {reportingCase.code} &nbsp; <strong>Type:</strong> {reportingCase.type} &nbsp; <strong>Status:</strong> {reportingCase.status}</p>
          <p><strong>Age:</strong> {reportingCase.age} &nbsp; <strong>Start Date:</strong> {reportingCase.startDate}</p>
          <p><strong>Institution:</strong> {reportingCase.institution}</p>
        </div>
        <p>{reportingCase.context}</p>
      </ReportSection>

      <ReportSection title="2. Presenting Concerns">
        <p>{reportingCase.presentingConcerns}</p>
      </ReportSection>

      <ReportSection title="3. Clinical Observations">
        <p>{reportingCase.keyObservations}</p>
      </ReportSection>

      <ReportSection title="4. Assessment Summary">
        <p>{monthlyReview.assessmentChanges}</p>
      </ReportSection>

      {/* Page break before page 2 */}
      <div className="print-page-break" />

      {/* PAGE 2 header */}
      <div
        className="hidden print:block text-xs mb-4 pt-2"
        style={{ color: "var(--psych-muted)" }}
      >
        {reportingCase.code} — Two-Page Summary — Page 2 of 2 — {today}
      </div>
      <div className="no-print mt-8 mb-4">
        <div
          className="text-xs px-3 py-2 rounded-lg"
          style={{ backgroundColor: "var(--psych-primary-light)", color: "var(--psych-accent)" }}
        >
          — Page 2 starts here when printed —
        </div>
      </div>

      <ReportSection title="5. Progress & Evolution">
        <p>{weeklyReview.mainProgress}</p>
        <p className="mt-3">{monthlyReview.overallEvolution}</p>
      </ReportSection>

      <ReportSection title="6. Difficulties & Patterns">
        <p>{weeklyReview.mainDifficulties}</p>
        <p className="mt-2">{weeklyReview.repeatedPatterns}</p>
      </ReportSection>

      <ReportSection title="7. Clinical Reflection">
        <p>{monthlyReview.clinicalObservations}</p>
        <p className="mt-2">{monthlyReview.supervisionPoints}</p>
      </ReportSection>

      <ReportSection title="8. Recommendations & Next Steps">
        <p>{monthlyReview.recommendations}</p>
        <p className="mt-2">{monthlyReview.nextMonthObjectives}</p>
      </ReportSection>

      <div className="print-signature mt-8 pt-6 border-t grid grid-cols-2 gap-12"
        style={{ borderColor: "var(--psych-border)" }}>
        <div>
          <p className="text-xs font-semibold mb-6" style={{ color: "var(--psych-text)" }}>Student / Clinician</p>
          <div className="border-b w-48 mb-1" style={{ borderColor: "var(--psych-border)" }} />
          <p className="text-xs" style={{ color: "var(--psych-muted)" }}>Name &amp; Signature</p>
        </div>
        <div>
          <p className="text-xs font-semibold mb-6" style={{ color: "var(--psych-text)" }}>Supervisor</p>
          <div className="border-b w-48 mb-1" style={{ borderColor: "var(--psych-border)" }} />
          <p className="text-xs" style={{ color: "var(--psych-muted)" }}>Signature &amp; Date</p>
        </div>
      </div>
    </PrintableLayout>
  );
}
