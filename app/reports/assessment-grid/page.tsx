// Assessment Grid Report — printable table of all assessments.
import { PrintableLayout } from "@/components/reports/PrintableLayout";
import { ReportHeader } from "@/components/reports/ReportHeader";
import { mockAssessments, reportPreviewData } from "@/lib/mock-data";

const today = new Date().toLocaleDateString("en-CA");

export default function AssessmentGridReportPage() {
  return (
    <PrintableLayout title="Assessment Grid Report">
      <ReportHeader
        title="Assessment Grid Report"
        subtitle="Clinical Assessment Overview — All Tools"
        caseCode={reportPreviewData.reportingCase.code}
        dateRange={today}
        studentName={`Student: ${reportPreviewData.studentName}`}
        institution={`Institution: ${reportPreviewData.institution}`}
        supervisorName={`Supervisor: ${reportPreviewData.supervisorName}`}
      />

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr>
              {["Assessment", "Category", "Status / Score", "Score Value", "Last Completed", "Relevant To", "Notes"].map((h) => (
                <th
                  key={h}
                  className="border px-3 py-2 text-left font-semibold"
                  style={{
                    backgroundColor: "var(--psych-primary-light)",
                    borderColor: "var(--psych-border)",
                    color: "var(--psych-text)",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mockAssessments.map((a, i) => (
              <tr
                key={a.id}
                style={{ backgroundColor: i % 2 === 0 ? "transparent" : "var(--psych-bg)" }}
              >
                <td className="border px-3 py-2 font-medium" style={{ borderColor: "var(--psych-border)", color: "var(--psych-text)" }}>
                  {a.title}
                </td>
                <td className="border px-3 py-2" style={{ borderColor: "var(--psych-border)", color: "var(--psych-muted)" }}>
                  {a.category}
                </td>
                <td className="border px-3 py-2" style={{ borderColor: "var(--psych-border)", color: "var(--psych-text)" }}>
                  {a.scoreStatus}
                </td>
                <td className="border px-3 py-2" style={{ borderColor: "var(--psych-border)", color: "var(--psych-muted)" }}>
                  {a.scoreValue ?? "—"}
                </td>
                <td className="border px-3 py-2" style={{ borderColor: "var(--psych-border)", color: "var(--psych-muted)" }}>
                  {a.lastCompleted ?? "Not completed"}
                </td>
                <td className="border px-3 py-2 text-[10px]" style={{ borderColor: "var(--psych-border)", color: "var(--psych-muted)" }}>
                  {a.caseTypeRelevance.join(", ")}
                </td>
                <td className="border px-3 py-2" style={{ borderColor: "var(--psych-border)", minWidth: "120px", height: "32px" }}>
                  &nbsp;
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div
        className="mt-4 text-xs"
        style={{ color: "var(--psych-muted)" }}
      >
        ✦ These assessments support clinical hypothesis formation and are not standardized diagnostic instruments.
      </div>

      <div className="print-signature mt-8 pt-6 border-t grid grid-cols-2 gap-12"
        style={{ borderColor: "var(--psych-border)" }}>
        <div>
          <div className="border-b w-48 mt-6 mb-1" style={{ borderColor: "var(--psych-border)" }} />
          <p className="text-xs" style={{ color: "var(--psych-muted)" }}>Student — Signature</p>
        </div>
        <div>
          <div className="border-b w-48 mt-6 mb-1" style={{ borderColor: "var(--psych-border)" }} />
          <p className="text-xs" style={{ color: "var(--psych-muted)" }}>Supervisor — Signature &amp; Date</p>
        </div>
      </div>
    </PrintableLayout>
  );
}
