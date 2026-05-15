"use client";
// Grids page — select one of 8 printable clinical grid templates and print it.

import { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { PrintButton } from "@/components/shared/PrintButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { GridTemplate } from "@/components/grids/GridTemplate";
import { GRID_DEFINITIONS } from "@/app/grids/grid-definitions";
import { mockCases } from "@/lib/mock-data";
import { Printer, Eye, ArrowLeft } from "lucide-react";

export default function GridsPage() {
  const [selectedGridId, setSelectedGridId] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [caseId, setCaseId] = useState("");
  const [customDate, setCustomDate] = useState(new Date().toLocaleDateString("en-CA"));
  const [studentName, setStudentName] = useState("Student: _____________");
  const [institution, setInstitution] = useState("Institution: _____________");
  const [supervisorName, setSupervisorName] = useState("Supervisor: _____________");

  const selectedGrid = GRID_DEFINITIONS.find((g) => g.id === selectedGridId);
  const selectedCase = mockCases.find((c) => c.id === caseId);
  const caseName = selectedCase ? selectedCase.code : "Case Code: _____________";

  if (showPreview && selectedGrid) {
    return (
      <div className="max-w-5xl mx-auto animate-fade-in">
        {/* Controls — hidden when printing */}
        <div className="no-print flex items-center justify-between gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={() => setShowPreview(false)}>
            <ArrowLeft size={14} />
            Back to grid selection
          </Button>
          <div className="flex gap-2">
            <PrintButton label="Print Grid" variant="primary" />
          </div>
        </div>

        {/* Print-only tip */}
        <div
          className="no-print mb-6 px-4 py-3 rounded-xl text-sm"
          style={{ backgroundColor: "var(--psych-primary-light)", color: "var(--psych-accent)" }}
        >
          ✦ Empty rows are ready for handwriting after printing. The signature section is at the bottom.
        </div>

        {/* The actual grid */}
        <div
          className="rounded-2xl border p-6 md:p-8 print-card"
          style={{
            backgroundColor: "var(--psych-card)",
            borderColor: "var(--psych-border)",
          }}
        >
          <GridTemplate
            grid={selectedGrid}
            caseName={caseName}
            date={customDate}
            studentName={studentName}
            institution={institution}
            supervisorName={supervisorName}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      <PageHeader
        title="Printable Grids"
        subtitle="8 clinical observation grid templates — select, customize, and print"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Grid selector */}
        <div className="lg:col-span-2">
          <h3
            className="text-xs font-semibold uppercase tracking-widest mb-4"
            style={{ color: "var(--psych-muted)" }}
          >
            Select a grid template
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {GRID_DEFINITIONS.map((grid) => (
              <button
                key={grid.id}
                onClick={() => setSelectedGridId(grid.id)}
                className="text-left rounded-2xl border p-4 transition-all hover:shadow-md hover:scale-[1.01]"
                style={{
                  backgroundColor:
                    selectedGridId === grid.id
                      ? "var(--psych-primary-light)"
                      : "var(--psych-card)",
                  borderColor:
                    selectedGridId === grid.id
                      ? "var(--psych-primary)"
                      : "var(--psych-border)",
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                    style={{ backgroundColor: "var(--psych-primary)" }}
                  >
                    {grid.letter}
                  </span>
                  <span
                    className="text-sm font-semibold"
                    style={{ color: "var(--psych-text)" }}
                  >
                    {grid.name}
                  </span>
                </div>
                <p className="text-xs" style={{ color: "var(--psych-muted)" }}>
                  {grid.description}
                </p>
                <p className="text-[10px] mt-1" style={{ color: "var(--psych-muted)" }}>
                  {grid.type === "checklist" ? "Checklist format" : `${grid.columns?.length} columns · Table format`}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Customization panel */}
        <div>
          <h3
            className="text-xs font-semibold uppercase tracking-widest mb-4"
            style={{ color: "var(--psych-muted)" }}
          >
            Customize
          </h3>
          <div
            className="rounded-2xl border p-4 space-y-4 sticky top-24"
            style={{
              backgroundColor: "var(--psych-card)",
              borderColor: "var(--psych-border)",
            }}
          >
            <div>
              <Label>Case</Label>
              <Select value={caseId} onChange={(e) => setCaseId(e.target.value)}>
                <option value="">Leave blank</option>
                {mockCases.map((c) => (
                  <option key={c.id} value={c.id}>{c.code}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Date</Label>
              <Input type="date" value={customDate} onChange={(e) => setCustomDate(e.target.value)} />
            </div>
            <div>
              <Label>Student / Clinician Name</Label>
              <Input
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="Your name"
              />
            </div>
            <div>
              <Label>Institution</Label>
              <Input
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                placeholder="Institution name"
              />
            </div>
            <div>
              <Label>Supervisor Name</Label>
              <Input
                value={supervisorName}
                onChange={(e) => setSupervisorName(e.target.value)}
                placeholder="Supervisor name"
              />
            </div>

            <Button
              className="w-full"
              disabled={!selectedGridId}
              onClick={() => setShowPreview(true)}
            >
              <Eye size={14} />
              Preview Grid
            </Button>
            {selectedGridId && (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setShowPreview(true);
                  setTimeout(() => window.print(), 200);
                }}
              >
                <Printer size={14} />
                Preview &amp; Print
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
