// ReportHeader — clean header for printed reports.
// Shows institution, student name, report title, case code, and date.

interface ReportHeaderProps {
  title: string;
  subtitle?: string;
  caseCode?: string;
  dateRange?: string;
  studentName?: string;
  institution?: string;
  supervisorName?: string;
}

export function ReportHeader({
  title,
  subtitle,
  caseCode,
  dateRange,
  studentName = "Student: ________________________",
  institution = "Institution: ________________________",
  supervisorName = "Supervisor: ________________________",
}: ReportHeaderProps) {
  return (
    <div
      className="print-header border-b-2 pb-6 mb-6"
      style={{ borderColor: "var(--psych-border)" }}
    >
      {/* Institution + student info */}
      <div
        className="flex flex-wrap gap-6 text-xs mb-4"
        style={{ color: "var(--psych-muted)" }}
      >
        <span>{institution}</span>
        <span>{studentName}</span>
        <span>{supervisorName}</span>
      </div>

      {/* Report title */}
      <h1
        className="text-2xl font-bold tracking-tight mb-1"
        style={{ color: "var(--psych-text)" }}
      >
        {title}
      </h1>
      {subtitle && (
        <p className="text-sm" style={{ color: "var(--psych-muted)" }}>
          {subtitle}
        </p>
      )}

      {/* Case + date row */}
      <div
        className="flex flex-wrap gap-6 text-sm mt-3 pt-3 border-t"
        style={{ borderColor: "var(--psych-border)", color: "var(--psych-muted)" }}
      >
        {caseCode && (
          <span>
            <strong style={{ color: "var(--psych-text)" }}>Case: </strong>
            <span
              className="font-mono text-xs font-bold px-1.5 py-0.5 rounded"
              style={{
                backgroundColor: "var(--psych-primary-light)",
                color: "var(--psych-primary)",
              }}
            >
              {caseCode}
            </span>
          </span>
        )}
        {dateRange && (
          <span>
            <strong style={{ color: "var(--psych-text)" }}>Period: </strong>
            {dateRange}
          </span>
        )}
      </div>
    </div>
  );
}
