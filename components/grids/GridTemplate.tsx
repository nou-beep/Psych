"use client";
// GridTemplate — renders any of the 8 printable clinical grids.
// On screen: shows a preview with theme colors.
// When printing: clean A4-friendly table with empty rows for handwriting.

import { type GridDefinition } from "@/app/grids/grid-definitions";

interface GridTemplateProps {
  grid: GridDefinition;
  caseName?: string;
  date?: string;
  studentName?: string;
  institution?: string;
  supervisorName?: string;
  emptyRows?: number;
}

export function GridTemplate({
  grid,
  caseName = "Case Code: _____________",
  date = new Date().toLocaleDateString("en-CA"),
  studentName = "Student: _____________",
  institution = "Institution: _____________",
  supervisorName = "Supervisor: _____________",
  emptyRows = 15,
}: GridTemplateProps) {
  // For checklist grids, render differently
  if (grid.type === "checklist") {
    return <ChecklistGrid grid={grid} caseName={caseName} date={date} studentName={studentName} institution={institution} supervisorName={supervisorName} />;
  }

  return (
    <div className="print-keep-together">
      {/* Header — shown on screen and in print */}
      <div className="print-header mb-4">
        <h2 className="text-lg font-bold mb-1" style={{ color: "var(--psych-text)" }}>{grid.name}</h2>
        <div className="flex flex-wrap gap-6 text-sm mt-2" style={{ color: "var(--psych-muted)" }}>
          <span><strong>Case:</strong> {caseName}</span>
          <span><strong>Date:</strong> {date}</span>
          <span>{studentName}</span>
          <span>{institution}</span>
        </div>
      </div>

      {/* Grid table */}
      <div className="overflow-x-auto">
        <table
          className="w-full border-collapse text-xs"
          style={{ borderColor: "#333" }}
        >
          <thead>
            <tr>
              {grid.columns.map((col) => (
                <th
                  key={col}
                  className="border px-2 py-2 text-left font-semibold text-xs"
                  style={{
                    backgroundColor: "var(--psych-primary-light)",
                    borderColor: "var(--psych-border)",
                    color: "var(--psych-text)",
                    minWidth: col === "Notes" || col === "Observations" || col === "Observed behavior" ? "160px" : "80px",
                  }}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Sample data row (first row only — as example) */}
            {grid.sampleRow && (
              <tr style={{ backgroundColor: "var(--psych-bg)" }}>
                {grid.columns.map((col) => (
                  <td
                    key={col}
                    className="border px-2 py-2 text-xs italic"
                    style={{
                      borderColor: "var(--psych-border)",
                      color: "var(--psych-muted)",
                    }}
                  >
                    {grid.sampleRow?.[col] ?? ""}
                  </td>
                ))}
              </tr>
            )}

            {/* Empty rows for handwriting */}
            {Array.from({ length: emptyRows }).map((_, i) => (
              <tr key={i} className="print-empty-row">
                {grid.columns.map((col) => (
                  <td
                    key={col}
                    className="border px-2 py-2"
                    style={{
                      borderColor: "var(--psych-border)",
                      height: "32px",
                      backgroundColor: i % 2 === 0 ? "transparent" : "var(--psych-bg)",
                    }}
                  />
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Signature section */}
      <div
        className="print-signature mt-8 pt-4 border-t grid grid-cols-2 gap-8 text-sm"
        style={{ borderColor: "var(--psych-border)", color: "var(--psych-muted)" }}
      >
        <div>
          <p className="font-semibold mb-1" style={{ color: "var(--psych-text)" }}>Student / Clinician</p>
          <p>{studentName}</p>
          <div className="mt-4 border-b w-48" style={{ borderColor: "var(--psych-border)" }} />
          <p className="text-[10px] mt-1">Signature</p>
        </div>
        <div>
          <p className="font-semibold mb-1" style={{ color: "var(--psych-text)" }}>Supervisor</p>
          <p>{supervisorName}</p>
          <div className="mt-4 border-b w-48" style={{ borderColor: "var(--psych-border)" }} />
          <p className="text-[10px] mt-1">Signature &amp; Date</p>
        </div>
      </div>
    </div>
  );
}

// Checklist-style grid (for Clinical Interview Checklist)
function ChecklistGrid({
  grid,
  caseName,
  date,
  studentName,
  institution,
}: Omit<GridTemplateProps, "grid"> & { grid: GridDefinition }) {
  return (
    <div className="print-keep-together">
      <div className="print-header mb-4">
        <h2 className="text-lg font-bold mb-1" style={{ color: "var(--psych-text)" }}>{grid.name}</h2>
        <div className="flex flex-wrap gap-6 text-sm mt-2" style={{ color: "var(--psych-muted)" }}>
          <span><strong>Case:</strong> {caseName}</span>
          <span><strong>Date:</strong> {date}</span>
          <span>{studentName}</span>
          <span>{institution}</span>
        </div>
      </div>

      <div className="space-y-4">
        {grid.sections?.map((section) => (
          <div key={section.title}>
            <div
              className="print-section-title px-3 py-2 rounded-lg mb-2"
              style={{
                backgroundColor: "var(--psych-primary-light)",
                color: "var(--psych-accent)",
              }}
            >
              <h3 className="text-xs font-bold uppercase tracking-wide">{section.title}</h3>
            </div>
            {section.items.map((item) => (
              <div
                key={item}
                className="flex items-start gap-3 py-2 px-3 border-b"
                style={{ borderColor: "var(--psych-border)" }}
              >
                <div
                  className="w-4 h-4 border rounded flex-shrink-0 mt-0.5"
                  style={{ borderColor: "var(--psych-border)" }}
                />
                <div className="flex-1">
                  <p className="text-xs font-medium" style={{ color: "var(--psych-text)" }}>{item}</p>
                  <div
                    className="mt-1 border-b w-full"
                    style={{ borderColor: "var(--psych-border)", borderStyle: "dashed" }}
                  />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Signature */}
      <div
        className="print-signature mt-8 pt-4 border-t grid grid-cols-2 gap-8 text-sm"
        style={{ borderColor: "var(--psych-border)", color: "var(--psych-muted)" }}
      >
        <div>
          <p className="font-semibold mb-3" style={{ color: "var(--psych-text)" }}>Student / Clinician</p>
          <div className="border-b w-48 mb-1" style={{ borderColor: "var(--psych-border)" }} />
          <p className="text-[10px]">Signature</p>
        </div>
        <div>
          <p className="font-semibold mb-3" style={{ color: "var(--psych-text)" }}>Supervisor</p>
          <div className="border-b w-48 mb-1" style={{ borderColor: "var(--psych-border)" }} />
          <p className="text-[10px]">Signature &amp; Date</p>
        </div>
      </div>
    </div>
  );
}
