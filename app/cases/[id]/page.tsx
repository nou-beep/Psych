"use client";
// Case details page — dynamic route [id] resolves to a case code.
// All tabs have full mock data displayed.

import Link from "next/link";
import { ArrowLeft, AlertCircle, Tag } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge, getStatusVariant } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/shared/SectionCard";
import {
  getCaseById,
  getCheckInsForCase,
  getWeeklyReviewsForCase,
  getMonthlyReviewsForCase,
  getSessionsForCase,
  getSupervisionNotesForCase,
  mockAssessments,
} from "@/lib/mock-data";

interface PageProps {
  params: { id: string };
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: "var(--psych-muted)" }}>
        {label}
      </span>
      <span className="text-sm" style={{ color: "var(--psych-text)" }}>
        {value}
      </span>
    </div>
  );
}

export default function CaseDetailPage({ params }: PageProps) {
  const caseData = getCaseById(params.id);
  if (!caseData) {
    return (
      <div className="max-w-xl mx-auto pt-16 text-center">
        <p className="text-lg font-semibold mb-2" style={{ color: "var(--psych-text)" }}>Case not found</p>
        <p className="text-sm mb-6" style={{ color: "var(--psych-muted)" }}>The case "{params.id}" does not exist in the demo data.</p>
        <Link href="/cases">
          <Button variant="secondary" size="sm">← Back to Cases</Button>
        </Link>
      </div>
    );
  }

  const checkIns = getCheckInsForCase(caseData.id);
  const weeklyReviews = getWeeklyReviewsForCase(caseData.id);
  const monthlyReviews = getMonthlyReviewsForCase(caseData.id);
  const sessions = getSessionsForCase(caseData.id);
  const supervisionNotes = getSupervisionNotesForCase(caseData.id);

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">

      {/* Back button */}
      <Link href="/cases">
        <Button variant="ghost" size="sm" className="mb-4">
          <ArrowLeft size={14} />
          Back to Cases
        </Button>
      </Link>

      {/* Case header */}
      <div
        className="rounded-2xl border p-5 mb-6"
        style={{
          backgroundColor: "var(--psych-card)",
          borderColor: "var(--psych-border)",
          boxShadow: "var(--psych-shadow)",
        }}
      >
        <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="font-mono text-sm font-bold px-3 py-1 rounded-lg"
              style={{ backgroundColor: "var(--psych-primary-light)", color: "var(--psych-primary)" }}
            >
              {caseData.code}
            </span>
            <Badge>{caseData.type}</Badge>
            <Badge variant={getStatusVariant(caseData.status)}>{caseData.status}</Badge>
          </div>
          <div className="flex gap-2">
            <Link href="/reports/daily">
              <Button variant="secondary" size="sm">Generate Report</Button>
            </Link>
            <Link href="/grids">
              <Button variant="outline" size="sm">Print Grid</Button>
            </Link>
          </div>
        </div>

        {/* Case meta grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <InfoRow label="Age" value={`${caseData.age} years`} />
          <InfoRow label="Gender" value={caseData.gender} />
          <InfoRow label="Start Date" value={caseData.startDate} />
          <InfoRow label="Last Check-in" value={caseData.lastCheckIn} />
          <InfoRow label="Next Report" value={caseData.nextReportDue} />
          <InfoRow label="Supervisor" value={caseData.supervisor} />
          <div className="col-span-2">
            <span className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: "var(--psych-muted)" }}>
              Institution
            </span>
            <p className="text-sm mt-0.5" style={{ color: "var(--psych-text)" }}>{caseData.institution}</p>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {caseData.tags.map((tag) => (
            <span
              key={tag}
              className="text-[10px] px-2 py-0.5 rounded-full border flex items-center gap-1"
              style={{ borderColor: "var(--psych-border)", color: "var(--psych-muted)" }}
            >
              <Tag size={8} />
              {tag}
            </span>
          ))}
        </div>

        {/* Alerts */}
        {caseData.alerts && caseData.alerts.length > 0 && (
          <div
            className="mt-4 px-4 py-3 rounded-xl flex items-start gap-2"
            style={{ backgroundColor: "#FEF9C3" }}
          >
            <AlertCircle size={14} style={{ color: "#92400E", flexShrink: 0, marginTop: 2 }} />
            <div className="space-y-1">
              {caseData.alerts.map((alert, i) => (
                <p key={i} className="text-xs" style={{ color: "#92400E" }}>{alert}</p>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList className="mb-2 flex-wrap">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="checkins">Daily Check-ins</TabsTrigger>
          <TabsTrigger value="weekly">Weekly Reviews</TabsTrigger>
          <TabsTrigger value="monthly">Monthly Reviews</TabsTrigger>
          <TabsTrigger value="assessments">Assessments</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="supervision">Supervision</TabsTrigger>
          <TabsTrigger value="attachments">Attachments</TabsTrigger>
        </TabsList>

        {/* OVERVIEW */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SectionCard title="Context">
              <p className="text-sm leading-relaxed" style={{ color: "var(--psych-text)" }}>
                {caseData.context}
              </p>
            </SectionCard>
            <SectionCard title="Presenting Concerns">
              <p className="text-sm leading-relaxed" style={{ color: "var(--psych-text)" }}>
                {caseData.presentingConcerns}
              </p>
            </SectionCard>
            <SectionCard title="Current Goals">
              <ul className="space-y-2">
                {caseData.currentGoals.map((goal, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm" style={{ color: "var(--psych-text)" }}>
                    <span style={{ color: "var(--psych-primary)" }}>✦</span>
                    {goal}
                  </li>
                ))}
              </ul>
            </SectionCard>
            <SectionCard title="Key Observations">
              <p className="text-sm leading-relaxed" style={{ color: "var(--psych-text)" }}>
                {caseData.keyObservations}
              </p>
            </SectionCard>
            <SectionCard title="Latest Summary" className="md:col-span-2">
              <p className="text-sm leading-relaxed" style={{ color: "var(--psych-text)" }}>
                {caseData.latestSummary}
              </p>
            </SectionCard>
          </div>
        </TabsContent>

        {/* SESSIONS */}
        <TabsContent value="sessions">
          {sessions.length > 0 ? (
            <div className="space-y-4">
              {sessions.map((session) => (
                <SectionCard key={session.id} title={`Session ${session.sessionNumber} — ${session.date}`}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "var(--psych-muted)" }}>Type & Duration</p>
                      <p style={{ color: "var(--psych-text)" }}>{session.type} · {session.duration}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "var(--psych-muted)" }}>Main Topics</p>
                      <p style={{ color: "var(--psych-text)" }}>{session.mainTopics}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "var(--psych-muted)" }}>Observations</p>
                      <p style={{ color: "var(--psych-text)" }}>{session.observations}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "var(--psych-muted)" }}>Interventions</p>
                      <p style={{ color: "var(--psych-text)" }}>{session.interventions}</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "var(--psych-muted)" }}>Next Steps</p>
                      <p style={{ color: "var(--psych-text)" }}>{session.nextSteps}</p>
                    </div>
                  </div>
                </SectionCard>
              ))}
            </div>
          ) : (
            <SectionCard title="Sessions">
              <p className="text-sm py-4 text-center" style={{ color: "var(--psych-muted)" }}>No sessions recorded yet for this case.</p>
            </SectionCard>
          )}
        </TabsContent>

        {/* DAILY CHECK-INS */}
        <TabsContent value="checkins">
          {checkIns.length > 0 ? (
            <div className="space-y-4">
              {checkIns.map((chk) => (
                <SectionCard key={chk.id} title={`Check-in — ${chk.date}`} description={chk.contextType}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    {[
                      ["Mood / Affect", chk.moodAffect],
                      ["Behavior", chk.behaviorObservations],
                      ["Communication", chk.communicationObservations],
                      ["Emotional Regulation", chk.emotionalRegulation],
                      ["Social Interaction", chk.socialInteraction],
                      ["Intervention Used", chk.interventionUsed],
                      ["Response to Intervention", chk.responseToIntervention],
                    ].map(([label, val]) => (
                      <div key={label}>
                        <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "var(--psych-muted)" }}>{label}</p>
                        <p style={{ color: "var(--psych-text)" }}>{val}</p>
                      </div>
                    ))}
                    <div className="md:col-span-2">
                      <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "var(--psych-muted)" }}>Free Notes</p>
                      <p style={{ color: "var(--psych-text)" }}>{chk.freeNotes}</p>
                    </div>
                    {chk.followUpNeeded && (
                      <div
                        className="md:col-span-2 px-3 py-2 rounded-lg text-xs"
                        style={{ backgroundColor: "#FEF9C3", color: "#92400E" }}
                      >
                        ⚠ Follow-up needed: {chk.followUpNote}
                      </div>
                    )}
                  </div>
                </SectionCard>
              ))}
            </div>
          ) : (
            <SectionCard title="Daily Check-ins">
              <p className="text-sm py-4 text-center" style={{ color: "var(--psych-muted)" }}>No check-ins logged for this case yet.</p>
            </SectionCard>
          )}
        </TabsContent>

        {/* WEEKLY REVIEWS */}
        <TabsContent value="weekly">
          {weeklyReviews.length > 0 ? (
            <div className="space-y-4">
              {weeklyReviews.map((rev) => (
                <SectionCard key={rev.id} title={`Week of ${rev.weekStart} – ${rev.weekEnd}`}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    {[
                      ["Main Progress", rev.mainProgress],
                      ["Main Difficulties", rev.mainDifficulties],
                      ["Repeated Patterns", rev.repeatedPatterns],
                      ["Effective Interventions", rev.effectiveInterventions],
                      ["Concerns", rev.concerns],
                      ["Goals for Next Week", rev.goalsNextWeek],
                    ].map(([label, val]) => (
                      <div key={label}>
                        <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "var(--psych-muted)" }}>{label}</p>
                        <p style={{ color: "var(--psych-text)" }}>{val}</p>
                      </div>
                    ))}
                    <div className="md:col-span-2">
                      <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "var(--psych-muted)" }}>Questions for Supervision</p>
                      <p style={{ color: "var(--psych-text)" }}>{rev.questionsForSupervision}</p>
                    </div>
                  </div>
                </SectionCard>
              ))}
            </div>
          ) : (
            <SectionCard title="Weekly Reviews">
              <p className="text-sm py-4 text-center" style={{ color: "var(--psych-muted)" }}>No weekly reviews for this case yet.</p>
            </SectionCard>
          )}
        </TabsContent>

        {/* MONTHLY REVIEWS */}
        <TabsContent value="monthly">
          {monthlyReviews.length > 0 ? (
            <div className="space-y-4">
              {monthlyReviews.map((rev) => (
                <SectionCard key={rev.id} title={`Monthly Review — ${rev.month}`}>
                  <div className="space-y-3 text-sm">
                    {[
                      ["Overall Evolution", rev.overallEvolution],
                      ["Assessment Changes", rev.assessmentChanges],
                      ["Clinical Observations", rev.clinicalObservations],
                      ["Supervision Points", rev.supervisionPoints],
                      ["Recommendations", rev.recommendations],
                      ["Next Month Objectives", rev.nextMonthObjectives],
                    ].map(([label, val]) => (
                      <div key={label}>
                        <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "var(--psych-muted)" }}>{label}</p>
                        <p className="leading-relaxed" style={{ color: "var(--psych-text)" }}>{val}</p>
                      </div>
                    ))}
                  </div>
                </SectionCard>
              ))}
            </div>
          ) : (
            <SectionCard title="Monthly Reviews">
              <p className="text-sm py-4 text-center" style={{ color: "var(--psych-muted)" }}>No monthly reviews for this case yet.</p>
            </SectionCard>
          )}
        </TabsContent>

        {/* ASSESSMENTS */}
        <TabsContent value="assessments">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mockAssessments
              .filter((a) => a.caseTypeRelevance.includes(caseData.type))
              .map((assessment) => (
                <SectionCard key={assessment.id} title={assessment.title} description={assessment.category}>
                  <div className="space-y-2 text-sm">
                    <p style={{ color: "var(--psych-muted)" }}>{assessment.description}</p>
                    <div className="flex items-center justify-between pt-2">
                      <span
                        className="text-xs px-2 py-1 rounded-lg"
                        style={{ backgroundColor: "var(--psych-primary-light)", color: "var(--psych-accent)" }}
                      >
                        {assessment.scoreStatus}
                        {assessment.scoreValue && ` — ${assessment.scoreValue}`}
                      </span>
                      <Link href="/assessments">
                        <Button variant="outline" size="sm">Open</Button>
                      </Link>
                    </div>
                  </div>
                </SectionCard>
              ))}
          </div>
        </TabsContent>

        {/* REPORTS */}
        <TabsContent value="reports">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: "Daily Report", desc: "Last session observation", href: "/reports/daily" },
              { label: "Weekly Report", desc: "Week of May 5–11, 2026", href: "/reports/weekly" },
              { label: "Monthly Report", desc: "April 2026", href: "/reports/monthly" },
              { label: "One-Page Summary", desc: "Compact overview", href: "/reports/one-page" },
              { label: "Assessment Grid", desc: "Printable grid report", href: "/reports/assessment-grid" },
            ].map((r) => (
              <SectionCard key={r.href} title={r.label} description={r.desc}>
                <div className="flex gap-2 pt-2">
                  <Link href={r.href}>
                    <Button variant="secondary" size="sm">Preview</Button>
                  </Link>
                  <Link href={r.href}>
                    <Button variant="outline" size="sm">Print</Button>
                  </Link>
                </div>
              </SectionCard>
            ))}
          </div>
        </TabsContent>

        {/* SUPERVISION */}
        <TabsContent value="supervision">
          {supervisionNotes.length > 0 ? (
            <div className="space-y-4">
              {supervisionNotes.map((note) => (
                <SectionCard
                  key={note.id}
                  title={`Supervision — ${note.date}`}
                  description={`Supervisor: ${note.supervisorName}`}
                >
                  <div className="space-y-3 text-sm">
                    {[
                      ["Main Topics", note.mainTopics],
                      ["Ethical Concerns", note.ethicalConcerns],
                      ["Clinical Reflection", note.clinicalReflection],
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
              ))}
            </div>
          ) : (
            <SectionCard title="Supervision Notes">
              <p className="text-sm py-4 text-center" style={{ color: "var(--psych-muted)" }}>No supervision notes linked to this case.</p>
            </SectionCard>
          )}
        </TabsContent>

        {/* ATTACHMENTS */}
        <TabsContent value="attachments">
          <SectionCard title="Attachments" description="Documents and files linked to this case">
            <div className="space-y-2">
              {[
                { name: "Initial_Interview_Checklist.pdf", date: caseData.startDate, size: "180 KB" },
                { name: "Behavioral_Grid_Session3.pdf", date: "2026-03-22", size: "95 KB" },
                { name: "Assessment_Notes_April.docx", date: "2026-04-30", size: "42 KB" },
              ].map((file) => (
                <div
                  key={file.name}
                  className="flex items-center justify-between p-3 rounded-xl"
                  style={{ backgroundColor: "var(--psych-bg)" }}
                >
                  <div>
                    <p className="text-xs font-medium" style={{ color: "var(--psych-text)" }}>{file.name}</p>
                    <p className="text-[10px]" style={{ color: "var(--psych-muted)" }}>{file.date} · {file.size}</p>
                  </div>
                  <Button variant="ghost" size="sm">Download</Button>
                </div>
              ))}
              <p className="text-[10px] text-center mt-2" style={{ color: "var(--psych-muted)" }}>
                File upload will be available when connected to Supabase storage.
              </p>
            </div>
          </SectionCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}
