// One-Page Summary Report — compact overview for referrals and quick updates.
import { PrintableLayout } from "@/components/reports/PrintableLayout";
import { ReportHeader } from "@/components/reports/ReportHeader";
import { ReportSection } from "@/components/reports/ReportSection";
import { reportPreviewData } from "@/lib/mock-data";

const { reportingCase } = reportPreviewData;
const today = new Date().toLocaleDateString("en-CA");

export default function OnePageReportPage() {
  return (
    <PrintableLayout title="One-Page Summary">
      <ReportHeader
        title="One-Page Clinical Summary"
        subtitle="Compact Case Overview"
        caseCode={reportingCase.code}
        dateRange={today}
        studentName={`Student: ${reportPreviewData.studentName}`}
        institution={`Institution: ${reportPreviewData.institution}`}
        supervisorName={`Supervisor: ${reportPreviewData.supervisorName}`}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ReportSection title="Case Background">
          <div className="text-xs space-y-1">
            <p><strong>Code:</strong> {reportingCase.code}</p>
            <p><strong>Type:</strong> {reportingCase.type}</p>
            <p><strong>Age:</strong> {reportingCase.age}</p>
            <p><strong>Start Date:</strong> {reportingCase.startDate}</p>
            <p><strong>Status:</strong> {reportingCase.status}</p>
          </div>
          <p className="text-xs mt-3 leading-relaxed">{reportingCase.context}</p>
        </ReportSection>

        <ReportSection title="Presenting Concerns">
          <p className="text-xs leading-relaxed">{reportingCase.presentingConcerns}</p>
        </ReportSection>

        <ReportSection title="Key Observations">
          <p className="text-xs leading-relaxed">{reportingCase.keyObservations}</p>
        </ReportSection>

        <ReportSection title="Current Goals">
          <ul className="text-xs space-y-1">
            {reportingCase.currentGoals.map((goal, i) => (
              <li key={i}>• {goal}</li>
            ))}
          </ul>
        </ReportSection>

        <ReportSection title="Main Progress">
          <p className="text-xs leading-relaxed">{reportPreviewData.weeklyReview.mainProgress}</p>
        </ReportSection>

        <ReportSection title="Recommendations">
          <p className="text-xs leading-relaxed">{reportPreviewData.monthlyReview.recommendations}</p>
        </ReportSection>
      </div>

      <div className="print-signature mt-6 pt-4 border-t grid grid-cols-2 gap-12"
        style={{ borderColor: "var(--psych-border)" }}>
        <div>
          <div className="border-b w-48 mt-6 mb-1" style={{ borderColor: "var(--psych-border)" }} />
          <p className="text-[10px]" style={{ color: "var(--psych-muted)" }}>Student / Clinician — Name &amp; Signature</p>
        </div>
        <div>
          <div className="border-b w-48 mt-6 mb-1" style={{ borderColor: "var(--psych-border)" }} />
          <p className="text-[10px]" style={{ color: "var(--psych-muted)" }}>Supervisor — Signature &amp; Date</p>
        </div>
      </div>
    </PrintableLayout>
  );
}
