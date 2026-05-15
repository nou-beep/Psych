// Daily Report — single session clinical observation report.
import { PrintableLayout } from "@/components/reports/PrintableLayout";
import { ReportHeader } from "@/components/reports/ReportHeader";
import { ReportSection } from "@/components/reports/ReportSection";
import { reportPreviewData } from "@/lib/mock-data";

const { reportingCase, dailyCheckIn } = reportPreviewData;

export default function DailyReportPage() {
  return (
    <PrintableLayout title="Daily Report">
      <ReportHeader
        title="Daily Clinical Observation Report"
        subtitle="Individual Session Report"
        caseCode={reportingCase.code}
        dateRange={dailyCheckIn.date}
        studentName={`Student: ${reportPreviewData.studentName}`}
        institution={`Institution: ${reportPreviewData.institution}`}
        supervisorName={`Supervisor: ${reportPreviewData.supervisorName}`}
      />

      <ReportSection title="1. Case Identification & Context">
        <div className="grid grid-cols-2 gap-4 text-xs mb-2">
          <div><strong>Case Code:</strong> {reportingCase.code}</div>
          <div><strong>Case Type:</strong> {reportingCase.type}</div>
          <div><strong>Status:</strong> {reportingCase.status}</div>
          <div><strong>Session Date:</strong> {dailyCheckIn.date}</div>
        </div>
        <p className="mt-2">{dailyCheckIn.contextType}</p>
      </ReportSection>

      <ReportSection title="2. Mood & Affect">
        <p>{dailyCheckIn.moodAffect}</p>
      </ReportSection>

      <ReportSection title="3. Behavioral Observations">
        <p>{dailyCheckIn.behaviorObservations}</p>
      </ReportSection>

      <ReportSection title="4. Communication Observations">
        <p>{dailyCheckIn.communicationObservations}</p>
      </ReportSection>

      <ReportSection title="5. Cognitive Observations">
        <p>{dailyCheckIn.cognitiveObservations}</p>
      </ReportSection>

      <ReportSection title="6. Emotional Regulation">
        <p>{dailyCheckIn.emotionalRegulation}</p>
      </ReportSection>

      <ReportSection title="7. Social Interaction">
        <p>{dailyCheckIn.socialInteraction}</p>
      </ReportSection>

      <ReportSection title="8. Sensory & Cognitive Notes">
        <p>{dailyCheckIn.sensoryObservations}</p>
      </ReportSection>

      <ReportSection title="9. Intervention Used">
        <p>{dailyCheckIn.interventionUsed}</p>
      </ReportSection>

      <ReportSection title="10. Response to Intervention">
        <p>{dailyCheckIn.responseToIntervention}</p>
      </ReportSection>

      {dailyCheckIn.followUpNeeded && (
        <ReportSection title="11. Follow-Up Needed">
          <p>{dailyCheckIn.followUpNote}</p>
        </ReportSection>
      )}

      <ReportSection title="12. Short Clinical Reflection">
        <p>{dailyCheckIn.freeNotes}</p>
      </ReportSection>

      {/* Signature */}
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
          <p className="text-xs" style={{ color: "var(--psych-muted)" }}>Name, Signature &amp; Date</p>
        </div>
      </div>
    </PrintableLayout>
  );
}
