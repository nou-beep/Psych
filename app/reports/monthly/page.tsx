// Monthly Report
import { PrintableLayout } from "@/components/reports/PrintableLayout";
import { ReportHeader } from "@/components/reports/ReportHeader";
import { ReportSection } from "@/components/reports/ReportSection";
import { reportPreviewData } from "@/lib/mock-data";

const { reportingCase, monthlyReview } = reportPreviewData;

export default function MonthlyReportPage() {
  return (
    <PrintableLayout title="Monthly Report">
      <ReportHeader
        title="Monthly Clinical Report"
        subtitle="Monthly Evolution Summary"
        caseCode={reportingCase.code}
        dateRange={monthlyReview.month}
        studentName={`Student: ${reportPreviewData.studentName}`}
        institution={`Institution: ${reportPreviewData.institution}`}
        supervisorName={`Supervisor: ${reportPreviewData.supervisorName}`}
      />

      <ReportSection title="1. General Clinical Evolution">
        <p>{monthlyReview.overallEvolution}</p>
      </ReportSection>

      <ReportSection title="2. Assessment Summary & Score Changes">
        <p>{monthlyReview.assessmentChanges}</p>
      </ReportSection>

      <ReportSection title="3. Behavioral & Emotional Evolution">
        <p>{monthlyReview.clinicalObservations}</p>
      </ReportSection>

      <ReportSection title="4. Communication & Social Evolution">
        <p>
          Reviewed within overall clinical observations. Communication and social dimensions
          are addressed through weekly observations and documented in daily check-ins.
          See annexed check-in records for detailed session data.
        </p>
      </ReportSection>

      <ReportSection title="5. Intervention Review">
        <p>
          Interventions used this month included CBT-based cognitive restructuring, behavioral
          activation, and sleep hygiene work. Response to intervention has been generally
          positive with moderate improvement in targeted behavioral domains.
        </p>
      </ReportSection>

      <ReportSection title="6. Supervision Points & Clinical Reflections">
        <p>{monthlyReview.supervisionPoints}</p>
      </ReportSection>

      <ReportSection title="7. Recommendations">
        <p>{monthlyReview.recommendations}</p>
      </ReportSection>

      <ReportSection title="8. Objectives for Next Month">
        <p>{monthlyReview.nextMonthObjectives}</p>
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
