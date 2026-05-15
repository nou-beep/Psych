"use client";
// Supervision page — supervision notes, reflections, and printable summary.

import { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { SectionCard } from "@/components/shared/SectionCard";
import { PrintableLayout } from "@/components/reports/PrintableLayout";
import { ReportHeader } from "@/components/reports/ReportHeader";
import { ReportSection } from "@/components/reports/ReportSection";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { mockSupervisionNotes, mockCases } from "@/lib/mock-data";
import { Printer } from "lucide-react";

export default function SupervisionPage() {
  const [showPrintSummary, setShowPrintSummary] = useState(false);

  if (showPrintSummary) {
    return (
      <PrintableLayout title="Supervision Summary" backHref="/supervision" backLabel="Back to Supervision">
        <ReportHeader
          title="Supervision Summary"
          subtitle="All supervision notes — compiled"
          dateRange={new Date().toLocaleDateString("en-CA")}
        />
        {mockSupervisionNotes.map((note, i) => (
          <ReportSection key={note.id} title={`${i + 1}. Supervision — ${note.date} · ${note.supervisorName}`}>
            <div className="space-y-2 text-xs">
              <p><strong>Main Topics:</strong> {note.mainTopics}</p>
              <p><strong>Ethical Concerns:</strong> {note.ethicalConcerns}</p>
              <p><strong>Clinical Reflection:</strong> {note.clinicalReflection}</p>
              <p><strong>Feedback:</strong> {note.feedbackReceived}</p>
              <p><strong>Action Plan:</strong> {note.actionPlan}</p>
            </div>
          </ReportSection>
        ))}
        <div className="print-signature mt-8 pt-6 border-t" style={{ borderColor: "var(--psych-border)" }}>
          <div className="border-b w-48 mb-1" style={{ borderColor: "var(--psych-border)" }} />
          <p className="text-xs" style={{ color: "var(--psych-muted)" }}>Student Signature</p>
        </div>
      </PrintableLayout>
    );
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <PageHeader
        title="Supervision"
        subtitle="Notes, reflections, and feedback from clinical supervision"
        action={
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => setShowPrintSummary(true)}>
              <Printer size={14} />
              Print Summary
            </Button>
          </div>
        }
      />

      <Tabs defaultValue="notes">
        <TabsList className="mb-6">
          <TabsTrigger value="notes">Supervision Notes</TabsTrigger>
          <TabsTrigger value="questions">Questions</TabsTrigger>
          <TabsTrigger value="ethics">Ethical Concerns</TabsTrigger>
          <TabsTrigger value="reflections">Reflections</TabsTrigger>
        </TabsList>

        {/* NOTES */}
        <TabsContent value="notes">
          <div className="space-y-4">
            {mockSupervisionNotes.map((note) => {
              const relatedCase = mockCases.find((c) => c.id === note.caseId);
              return (
                <SectionCard
                  key={note.id}
                  title={`${note.date} — ${note.supervisorName}`}
                  description={relatedCase ? `Case: ${relatedCase.code}` : "General supervision"}
                >
                  <div className="space-y-3 text-sm">
                    {[
                      ["Main Topics", note.mainTopics],
                      ["Feedback Received", note.feedbackReceived],
                      ["Action Plan", note.actionPlan],
                    ].map(([label, val]) => (
                      <div key={label}>
                        <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "var(--psych-muted)" }}>{label}</p>
                        <p className="leading-relaxed" style={{ color: "var(--psych-text)" }}>{val}</p>
                      </div>
                    ))}
                  </div>
                </SectionCard>
              );
            })}
          </div>
        </TabsContent>

        {/* QUESTIONS */}
        <TabsContent value="questions">
          <div className="space-y-4">
            {mockSupervisionNotes.map((note) => (
              <SectionCard key={note.id} title={`Questions — ${note.date}`} description={note.supervisorName}>
                <p className="text-sm leading-relaxed" style={{ color: "var(--psych-text)" }}>
                  {note.questionsRaised}
                </p>
              </SectionCard>
            ))}
          </div>
        </TabsContent>

        {/* ETHICAL CONCERNS */}
        <TabsContent value="ethics">
          <div className="space-y-4">
            {mockSupervisionNotes.map((note) => (
              <SectionCard
                key={note.id}
                title={`Ethical Notes — ${note.date}`}
                description={note.supervisorName}
              >
                <p
                  className="text-sm leading-relaxed"
                  style={{
                    color: note.ethicalConcerns === "None identified at this time."
                      ? "var(--psych-muted)"
                      : "var(--psych-text)",
                  }}
                >
                  {note.ethicalConcerns}
                </p>
              </SectionCard>
            ))}

            <SectionCard title="Ethical Practice Reminders" description="General guidance">
              <ul className="space-y-2 text-sm" style={{ color: "var(--psych-muted)" }}>
                {[
                  "Maintain strict confidentiality — use case codes, not names",
                  "Do not attempt interventions outside your training and competency level",
                  "Always bring complex cases to supervision before proceeding",
                  "Document all referral decisions and their rationale",
                  "If safety concerns arise, follow your institution's protocol immediately",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span style={{ color: "var(--psych-primary)" }}>✦</span>
                    {item}
                  </li>
                ))}
              </ul>
            </SectionCard>
          </div>
        </TabsContent>

        {/* REFLECTIONS */}
        <TabsContent value="reflections">
          <div className="space-y-4">
            {mockSupervisionNotes.map((note) => (
              <SectionCard key={note.id} title={`Reflection — ${note.date}`}>
                <p className="text-sm leading-relaxed" style={{ color: "var(--psych-text)" }}>
                  {note.clinicalReflection}
                </p>
              </SectionCard>
            ))}

            <SectionCard title="Reflective Practice" description="Why it matters">
              <p className="text-sm leading-relaxed" style={{ color: "var(--psych-muted)" }}>
                Regular reflection on your clinical work helps identify countertransference,
                biases, and areas for professional growth. Document your reflections honestly —
                this is for your development, not evaluation.
              </p>
            </SectionCard>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
