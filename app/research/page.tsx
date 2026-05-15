"use client";
// Research page — qualitative research workspace with participant summaries and memos.

import { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { SectionCard } from "@/components/shared/SectionCard";
import { PrintableLayout } from "@/components/reports/PrintableLayout";
import { ReportHeader } from "@/components/reports/ReportHeader";
import { ReportSection } from "@/components/reports/ReportSection";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { mockResearchParticipants } from "@/lib/mock-data";
import { Printer, Tag } from "lucide-react";

export default function ResearchPage() {
  const [showPrint, setShowPrint] = useState(false);

  if (showPrint) {
    return (
      <PrintableLayout title="Research Summary" backHref="/research" backLabel="Back to Research">
        <ReportHeader
          title="Qualitative Research Summary"
          subtitle="Participant overviews and emerging themes"
          dateRange={new Date().toLocaleDateString("en-CA")}
        />
        {mockResearchParticipants.map((p, i) => (
          <ReportSection key={p.id} title={`Participant ${i + 1}: ${p.code}`}>
            <div className="space-y-2 text-xs">
              <p><strong>Study:</strong> {p.studyTitle}</p>
              <p><strong>Interview Date:</strong> {p.interviewDate}</p>
              <p><strong>Key Themes:</strong> {p.keyThemes.join(" · ")}</p>
              <p><strong>Memo:</strong> {p.memos}</p>
              <p><strong>Coding Status:</strong> {p.codingStatus}</p>
            </div>
          </ReportSection>
        ))}
      </PrintableLayout>
    );
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <PageHeader
        title="Research"
        subtitle="Qualitative research workspace — participants, transcripts, and thematic analysis"
        action={
          <Button variant="secondary" size="sm" onClick={() => setShowPrint(true)}>
            <Printer size={14} />
            Print Summary
          </Button>
        }
      />

      <Tabs defaultValue="participants">
        <TabsList className="mb-6">
          <TabsTrigger value="participants">Participants</TabsTrigger>
          <TabsTrigger value="themes">Thematic Analysis</TabsTrigger>
          <TabsTrigger value="transcripts">Transcripts</TabsTrigger>
          <TabsTrigger value="memos">Research Memos</TabsTrigger>
        </TabsList>

        {/* PARTICIPANTS */}
        <TabsContent value="participants">
          <div className="space-y-4">
            {mockResearchParticipants.map((p) => (
              <SectionCard
                key={p.id}
                title={p.code}
                description={p.studyTitle}
                headerAction={
                  <span
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: "#D1FAE5", color: "#065F46" }}
                  >
                    {p.status}
                  </span>
                }
              >
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <p className="font-semibold uppercase tracking-wide mb-0.5" style={{ color: "var(--psych-muted)" }}>Interview Date</p>
                      <p style={{ color: "var(--psych-text)" }}>{p.interviewDate}</p>
                    </div>
                    <div>
                      <p className="font-semibold uppercase tracking-wide mb-0.5" style={{ color: "var(--psych-muted)" }}>Coding Status</p>
                      <p style={{ color: "var(--psych-text)" }}>{p.codingStatus}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "var(--psych-muted)" }}>Key Themes</p>
                    <div className="flex flex-wrap gap-1">
                      {p.keyThemes.map((theme) => (
                        <span
                          key={theme}
                          className="text-xs px-2 py-0.5 rounded-full border flex items-center gap-1"
                          style={{ borderColor: "var(--psych-border)", color: "var(--psych-muted)" }}
                        >
                          <Tag size={9} />
                          {theme}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "var(--psych-muted)" }}>Research Memo</p>
                    <p className="text-sm leading-relaxed" style={{ color: "var(--psych-text)" }}>{p.memos}</p>
                  </div>
                </div>
              </SectionCard>
            ))}
          </div>
        </TabsContent>

        {/* THEMATIC ANALYSIS */}
        <TabsContent value="themes">
          <div className="space-y-4">
            {[
              {
                theme: "Workplace Safety Perceptions",
                code: "SAFETY",
                participants: ["RES-004"],
                description: "Participants discuss how perceived safety (physical and psychological) at work influenced their recovery trajectory and coping choices.",
                frequency: "Mentioned in 4 segments across 2 participants",
              },
              {
                theme: "Peer Support Networks",
                code: "PEER-SUP",
                participants: ["RES-004"],
                description: "The role of colleagues as informal support systems — both positive (validation, solidarity) and negative (silence, avoidance of the topic).",
                frequency: "Mentioned in 3 segments",
              },
              {
                theme: "Isolation & Stigma",
                code: "STIGMA",
                participants: ["RES-007"],
                description: "Perceived stigma around seeking mental health support in occupational contexts — feelings of shame, fear of judgment from peers.",
                frequency: "Mentioned in 5 segments",
              },
              {
                theme: "Coping Agency & Control",
                code: "AGENCY",
                participants: ["RES-004", "RES-007"],
                description: "Participants' sense of control over their recovery process. Strong agency linked to better perceived outcomes.",
                frequency: "Mentioned in 6 segments",
              },
            ].map((item) => (
              <SectionCard key={item.theme} title={item.theme} description={`Code: ${item.code}`}>
                <p className="text-sm leading-relaxed mb-3" style={{ color: "var(--psych-text)" }}>{item.description}</p>
                <div className="flex items-center gap-4 text-xs" style={{ color: "var(--psych-muted)" }}>
                  <span>{item.frequency}</span>
                  <span>Participants: {item.participants.join(", ")}</span>
                </div>
              </SectionCard>
            ))}
          </div>
        </TabsContent>

        {/* TRANSCRIPTS */}
        <TabsContent value="transcripts">
          <SectionCard title="Interview Transcripts" description="Upload and manage transcripts here">
            <div className="space-y-3">
              {mockResearchParticipants.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-3 rounded-xl"
                  style={{ backgroundColor: "var(--psych-bg)" }}
                >
                  <div>
                    <p className="text-xs font-semibold" style={{ color: "var(--psych-text)" }}>
                      {p.code} — Interview Transcript
                    </p>
                    <p className="text-[10px]" style={{ color: "var(--psych-muted)" }}>
                      {p.interviewDate} · {p.codingStatus}
                    </p>
                  </div>
                  <Button variant="secondary" size="sm">View</Button>
                </div>
              ))}
              <p className="text-[10px] text-center mt-2" style={{ color: "var(--psych-muted)" }}>
                Full transcript upload available when connected to Supabase storage.
              </p>
            </div>
          </SectionCard>
        </TabsContent>

        {/* MEMOS */}
        <TabsContent value="memos">
          <div className="space-y-4">
            {mockResearchParticipants.map((p) => (
              <SectionCard key={p.id} title={`Research Memo — ${p.code}`} description={p.interviewDate}>
                <p className="text-sm leading-relaxed" style={{ color: "var(--psych-text)" }}>{p.memos}</p>
              </SectionCard>
            ))}
            <SectionCard title="Researcher Positionality Note" description="Reflexivity memo">
              <p className="text-sm leading-relaxed" style={{ color: "var(--psych-text)" }}>
                As a researcher and student clinician, I bring lived experience with the mental health system
                and an awareness of the power dynamics inherent in research relationships. This proximity
                to the topic may enrich sensitivity but could also introduce bias. I am committed to
                bracketing assumptions and returning to the data throughout analysis.
              </p>
            </SectionCard>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
