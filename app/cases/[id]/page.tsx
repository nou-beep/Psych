"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, AlertCircle, Tag, Target, Plus, Trash2 } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/shared/SectionCard";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useApp } from "@/contexts/AppContext";
import { useRecordVisit } from "@/components/shared/useRecordVisit";
import { useToast } from "@/components/ui/Toast";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { CaseTimeline } from "@/components/shared/CaseTimeline";
import { CaseClientAssign } from "@/components/shared/CaseClientAssign";
import { CaseClinicalSnapshot } from "@/components/clinical/CaseClinicalSnapshot";
import { CaseDesktop } from "@/components/clinical/CaseDesktop";
import { mockAssessments } from "@/lib/mock-data";
import {
  PaperStack,
  PinnedNote,
  AnnotationLabel,
} from "@/components/desk";

interface PageProps {
  params: { id: string };
}

const priorityColor: Record<string, string> = {
  high: "#EF4444",
  medium: "#F59E0B",
  low: "#6B7280",
};

export default function CaseDetailPage({ params }: PageProps) {
  const { getCase, getCaseCheckIns, getCaseWeekly, getCaseMonthly, getCaseSessions, getCaseSupervision, getCaseGoals, getCaseFiles, cases, updateGoal, deleteGoal, removeFile } = useApp();
  const { toast } = useToast();
  const [deleteGoalId, setDeleteGoalId] = useState<string | null>(null);
  const [deleteFileId, setDeleteFileId] = useState<string | null>(null);

  const caseData = getCase(params.id) ?? cases.find((c) => c.id === params.id);

  useRecordVisit({
    id: params.id,
    kind: "case",
    label: caseData?.code ?? "Case",
    href: `/cases/${params.id}`,
    disabled: !caseData,
  });

  if (!caseData) {
    return (
      <div className="max-w-xl mx-auto pt-16 text-center">
        <p className="text-lg font-semibold mb-2" style={{ color: "var(--psych-text)" }}>Case not found</p>
        <p className="text-sm mb-6" style={{ color: "var(--psych-muted)" }}>The case &ldquo;{params.id}&rdquo; does not exist.</p>
        <Link href="/cases">
          <Button variant="secondary" size="sm">← Back to Cases</Button>
        </Link>
      </div>
    );
  }

  const checkIns = getCaseCheckIns(caseData.id);
  const weeklyReviews = getCaseWeekly(caseData.id);
  const monthlyReviews = getCaseMonthly(caseData.id);
  const sessions = getCaseSessions(caseData.id);
  const supervisionNotes = getCaseSupervision(caseData.id);
  const goals = getCaseGoals(caseData.id);
  const files = getCaseFiles(caseData.id);

  function toggleMilestone(goalId: string, milestoneId: string, completed: boolean) {
    const goal = goals.find((g) => g.id === goalId);
    if (!goal) return;
    updateGoal(goalId, {
      milestones: goal.milestones.map((m) => m.id === milestoneId ? { ...m, completed } : m),
    });
  }

  return (
    <PaperStack>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
      <Link href="/cases" style={{ textDecoration: "none" }}>
        <span
          className="desk-mono"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: 10,
            color: "var(--ink-faded)",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            marginBottom: 14,
          }}
        >
          <ArrowLeft size={11} /> back to cases
        </span>
      </Link>

      {/* Case header — editorial style */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          padding: "4px 0 14px",
          borderBottom: "1px solid var(--border-mid)",
          marginBottom: 16,
          gap: 24,
          flexWrap: "wrap",
        }}
      >
        <div style={{ flex: 1, minWidth: 280 }}>
          <div className="section-mark" style={{ marginBottom: 4 }}>
            case · {caseData.code} · {caseData.type} · {caseData.status.toLowerCase()}
          </div>
          <h1
            style={{
              fontFamily: "var(--serif)",
              fontSize: 32,
              color: "var(--plum)",
              fontWeight: 700,
              letterSpacing: "-0.01em",
              lineHeight: 1.05,
              margin: 0,
            }}
          >
            {caseData.code}
            <span
              style={{
                fontStyle: "italic",
                fontWeight: 400,
                color: "var(--ink-faded)",
                fontSize: 18,
                marginLeft: 12,
              }}
            >
              {caseData.age} · {caseData.gender}
            </span>
          </h1>
          {caseData.presentingConcerns && (
            <p
              className="desk-serif"
              style={{
                fontStyle: "italic",
                fontSize: 14.5,
                color: "var(--plum-mid)",
                marginTop: 8,
                maxWidth: 760,
                lineHeight: 1.5,
              }}
            >
              presenting ·{" "}
              <span className="hl">{caseData.presentingConcerns}</span>
            </p>
          )}
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: 8,
          }}
        >
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end" }}>
            <span
              className={`desk-badge ${
                caseData.status === "Active"
                  ? "active"
                  : caseData.status === "Needs Review"
                  ? "review"
                  : "hold"
              }`}
            >
              {caseData.status.toLowerCase()}
            </span>
            <span className="desk-chip berry">{caseData.type}</span>
            {caseData.isArchived && (
              <span className="desk-chip">archived</span>
            )}
          </div>
          <div className="desk-mono" style={{ fontSize: 9.5, color: "var(--ink-faded)", letterSpacing: "0.1em" }}>
            LAST CHECK-IN · {caseData.lastCheckIn.toUpperCase()}
          </div>
          <AnnotationLabel tone="plum">
            ↳ next report due {caseData.nextReportDue}
          </AnnotationLabel>
          <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
            <Link href="/reports/daily">
              <Button variant="secondary" size="sm">Generate report</Button>
            </Link>
            <Link href="/grids">
              <Button variant="outline" size="sm">Print grid</Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Tag + meta strip */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 16,
          marginBottom: 18,
          padding: "10px 14px",
          background: "var(--paper-warm)",
          border: "1px solid var(--border-light)",
          flexWrap: "wrap",
        }}
      >
        <div style={{ flex: 1, minWidth: 240 }}>
          <div className="section-mark" style={{ marginBottom: 6 }}>
            context · supervisor · institution
          </div>
          <p style={{ fontSize: 12.5, color: "var(--ink-soft)", lineHeight: 1.5 }}>
            <span style={{ fontStyle: "italic" }}>{caseData.context}</span>
            {caseData.supervisor && (
              <>
                {" "}— supervised by <span className="desk-serif" style={{ fontStyle: "italic", color: "var(--plum-mid)" }}>{caseData.supervisor}</span>
              </>
            )}
            {caseData.institution && (
              <>
                {" "}· {caseData.institution}
              </>
            )}
          </p>
        </div>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", alignItems: "flex-start" }}>
          {caseData.tags.map((tag) => (
            <span key={tag} className="desk-chip">
              <Tag size={8} /> {tag}
            </span>
          ))}
        </div>
      </div>

      {caseData.alerts && caseData.alerts.length > 0 && (
        <div
          style={{
            marginBottom: 16,
            padding: "10px 14px",
            background: "rgba(212,144,158,0.10)",
            borderLeft: "2px solid var(--berry)",
            display: "flex",
            alignItems: "flex-start",
            gap: 10,
          }}
        >
          <AlertCircle
            size={13}
            style={{ color: "var(--berry)", flexShrink: 0, marginTop: 2 }}
          />
          <div style={{ flex: 1 }}>
            {caseData.alerts.map((alert, i) => (
              <p
                key={i}
                className="desk-serif"
                style={{
                  fontStyle: "italic",
                  fontSize: 13,
                  color: "var(--plum)",
                  lineHeight: 1.4,
                  marginBottom: i < caseData.alerts!.length - 1 ? 4 : 0,
                }}
              >
                {alert}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList className="mb-2 flex-wrap">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="desktop">Desktop ✦</TabsTrigger>
          <TabsTrigger value="snapshot">Clinical snapshot ✦</TabsTrigger>
          <TabsTrigger value="timeline">Timeline ✦</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="checkins">Daily Check-ins</TabsTrigger>
          <TabsTrigger value="weekly">Weekly Reviews</TabsTrigger>
          <TabsTrigger value="monthly">Monthly Reviews</TabsTrigger>
          <TabsTrigger value="goals">Goals {goals.length > 0 && `(${goals.length})`}</TabsTrigger>
          <TabsTrigger value="assessments">Assessments</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="supervision">Supervision</TabsTrigger>
          <TabsTrigger value="client">Client portal ✦</TabsTrigger>
          <TabsTrigger value="attachments">Files {files.length > 0 && `(${files.length})`}</TabsTrigger>
        </TabsList>

        {/* OVERVIEW */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SectionCard title="Context">
              <p className="text-sm leading-relaxed" style={{ color: "var(--psych-text)" }}>{caseData.context}</p>
            </SectionCard>
            <SectionCard title="Presenting Concerns">
              <p className="text-sm leading-relaxed" style={{ color: "var(--psych-text)" }}>{caseData.presentingConcerns}</p>
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
              <p className="text-sm leading-relaxed" style={{ color: "var(--psych-text)" }}>{caseData.keyObservations}</p>
            </SectionCard>
            {goals.length > 0 && (
              <SectionCard title="Goal Progress" className="md:col-span-2">
                <div className="space-y-3">
                  {goals.slice(0, 3).map((goal) => (
                    <div key={goal.id}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium" style={{ color: "var(--psych-text)" }}>{goal.title}</span>
                        <span className="text-xs" style={{ color: "var(--psych-muted)" }}>{goal.progress}%</span>
                      </div>
                      <ProgressBar value={goal.progress} size="sm" />
                    </div>
                  ))}
                </div>
              </SectionCard>
            )}
            <SectionCard title="Latest Summary" className="md:col-span-2">
              <p className="text-sm leading-relaxed" style={{ color: "var(--psych-text)" }}>{caseData.latestSummary}</p>
            </SectionCard>
          </div>
        </TabsContent>

        {/* CASE DESKTOP */}
        <TabsContent value="desktop">
          <CaseDesktop caseId={caseData.id} />
        </TabsContent>

        {/* CLINICAL SNAPSHOT */}
        <TabsContent value="snapshot">
          <CaseClinicalSnapshot caseId={caseData.id} />
        </TabsContent>

        {/* TIMELINE */}
        <TabsContent value="timeline">
          <CaseTimeline caseId={caseData.id} />
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
                      <div className="md:col-span-2 px-3 py-2 rounded-lg text-xs" style={{ backgroundColor: "#FEF9C3", color: "#92400E" }}>
                        ⚠ Follow-up needed: {chk.followUpNote}
                      </div>
                    )}
                  </div>
                </SectionCard>
              ))}
            </div>
          ) : (
            <SectionCard title="Daily Check-ins">
              <div className="py-8 text-center">
                <p className="text-sm mb-3" style={{ color: "var(--psych-muted)" }}>No check-ins logged for this case yet.</p>
                <Link href="/checkins">
                  <Button variant="secondary" size="sm">
                    <Plus size={14} />
                    New Check-in
                  </Button>
                </Link>
              </div>
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

        {/* GOALS */}
        <TabsContent value="goals">
          {goals.length > 0 ? (
            <div className="space-y-4">
              {goals.filter((g) => !g.isArchived).map((goal) => (
                <SectionCard
                  key={goal.id}
                  title={goal.title}
                  description={`${goal.category} · ${goal.status}`}
                  action={
                    <button
                      onClick={() => setDeleteGoalId(goal.id)}
                      className="p-1.5 rounded-lg transition-colors"
                      style={{ color: "var(--psych-muted)" }}
                    >
                      <Trash2 size={13} />
                    </button>
                  }
                >
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs" style={{ color: "var(--psych-muted)" }}>Progress</span>
                        <span className="text-xs font-semibold" style={{ color: priorityColor[goal.priority] ?? "var(--psych-primary)" }}>
                          {goal.priority} priority · {goal.progress}%
                        </span>
                      </div>
                      <ProgressBar value={goal.progress} size="sm" />
                    </div>
                    {goal.description && (
                      <p className="text-sm" style={{ color: "var(--psych-muted)" }}>{goal.description}</p>
                    )}
                    {goal.milestones.length > 0 && (
                      <div className="space-y-1.5">
                        <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: "var(--psych-muted)" }}>Milestones</p>
                        {goal.milestones.map((m) => (
                          <label key={m.id} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={m.completed}
                              onChange={(e) => toggleMilestone(goal.id, m.id, e.target.checked)}
                              className="rounded"
                            />
                            <span
                              className="text-sm"
                              style={{
                                color: m.completed ? "var(--psych-muted)" : "var(--psych-text)",
                                textDecoration: m.completed ? "line-through" : "none",
                              }}
                            >
                              {m.title}
                            </span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                </SectionCard>
              ))}
            </div>
          ) : (
            <SectionCard title="Goals">
              <div className="py-8 text-center">
                <Target size={28} className="mx-auto mb-3 opacity-30" style={{ color: "var(--psych-primary)" }} />
                <p className="text-sm mb-3" style={{ color: "var(--psych-muted)" }}>No goals linked to this case.</p>
                <Link href="/goals">
                  <Button variant="secondary" size="sm">
                    <Plus size={14} />
                    Create a Goal
                  </Button>
                </Link>
              </div>
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
              <div className="py-8 text-center">
                <p className="text-sm mb-3" style={{ color: "var(--psych-muted)" }}>No supervision notes linked to this case.</p>
                <Link href="/supervision">
                  <Button variant="secondary" size="sm">
                    <Plus size={14} />
                    Add Supervision Note
                  </Button>
                </Link>
              </div>
            </SectionCard>
          )}
        </TabsContent>

        {/* CLIENT PORTAL — assign workbooks / cards / notes */}
        <TabsContent value="client">
          <CaseClientAssign caseId={caseData.id} caseCode={caseData.code} />
        </TabsContent>

        {/* FILES */}
        <TabsContent value="attachments">
          <SectionCard title="Files & Attachments" description="Documents linked to this case">
            {files.length > 0 ? (
              <div className="space-y-2">
                {files.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-3 rounded-xl"
                    style={{ backgroundColor: "var(--psych-bg)" }}
                  >
                    <div>
                      <p className="text-xs font-medium" style={{ color: "var(--psych-text)" }}>{file.name}</p>
                      <p className="text-[10px]" style={{ color: "var(--psych-muted)" }}>
                        {file.category} · {new Date(file.uploadedAt).toLocaleDateString()} · {(file.size / 1024).toFixed(0)} KB
                      </p>
                    </div>
                    <button
                      onClick={() => setDeleteFileId(file.id)}
                      className="p-1.5 rounded-lg transition-colors"
                      style={{ color: "var(--psych-muted)" }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center">
                <p className="text-sm" style={{ color: "var(--psych-muted)" }}>No files attached yet.</p>
                <p className="text-[10px] mt-1" style={{ color: "var(--psych-muted)" }}>
                  File upload available in a future update.
                </p>
              </div>
            )}
          </SectionCard>
        </TabsContent>
      </Tabs>

      {/* Confirm delete goal */}
      <ConfirmDialog
        open={!!deleteGoalId}
        title="Delete Goal"
        description="This goal and all its milestones will be permanently removed."
        confirmLabel="Delete"
        onConfirm={() => {
          if (deleteGoalId) {
            deleteGoal(deleteGoalId);
            toast("Goal deleted", "success");
          }
          setDeleteGoalId(null);
        }}
        onCancel={() => setDeleteGoalId(null)}
      />

      {/* Confirm delete file */}
      <ConfirmDialog
        open={!!deleteFileId}
        title="Remove File"
        description="This will remove the file from the case. This cannot be undone."
        confirmLabel="Remove"
        onConfirm={() => {
          if (deleteFileId) {
            removeFile(deleteFileId);
            toast("File removed", "success");
          }
          setDeleteFileId(null);
        }}
        onCancel={() => setDeleteFileId(null)}
      />

      {/* Floating stickies — pre-session prep / supervisor reminder */}
      {!caseData.isArchived && (
        <>
          <PinnedNote
            tone="y"
            rot={-2.5}
            pin
            author="prep"
            style={{ top: 140, right: 24, width: 170, zIndex: 60 }}
          >
            before {caseData.code} arrives —<br />
            <span className="squiggle">re-read</span> the last summary,
            then close it.
          </PinnedNote>

          {caseData.alerts && caseData.alerts.length > 0 && (
            <PinnedNote
              tone="p"
              rot={1.4}
              author="flagged"
              style={{ bottom: 80, left: 24, width: 160, zIndex: 60 }}
            >
              alert is open. read it before you start.
            </PinnedNote>
          )}
        </>
      )}
      </div>
    </PaperStack>
  );
}
