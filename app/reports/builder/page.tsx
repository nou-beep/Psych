"use client";
// Smart Report Builder V2 — picks a case + date range + sections,
// assembles a draft from saved data, lets the user reorder/edit/save/
// duplicate/print drafts. Source provenance is displayed per section.

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/shared/PageHeader";
import { SectionCard } from "@/components/shared/SectionCard";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useApp } from "@/contexts/AppContext";
import { useClinical } from "@/contexts/ClinicalContext";
import { useToast } from "@/components/ui/Toast";
import { loadFromStorage, saveToStorage } from "@/lib/store";
import {
  ArrowUp,
  ArrowDown,
  Copy,
  Printer,
  Save,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import {
  assembleReport,
  DEFAULT_SECTIONS,
  SECTION_LABELS,
  reorderSections,
  updateSectionContent,
  removeSection,
  duplicateDraft,
  type ReportDraft,
  type ReportSectionType,
  type AssemblyData,
} from "@/lib/report-assembly";

const REPORT_TYPES = [
  "daily",
  "weekly",
  "monthly",
  "one-page",
  "two-page",
  "assessment-grid",
  "final-long",
];

const DRAFT_STORAGE_KEY = "psych-report-drafts-v1";

const ALL_SECTION_TYPES: ReportSectionType[] = Object.keys(
  SECTION_LABELS
) as ReportSectionType[];

export default function ReportBuilderPage() {
  const { toast } = useToast();
  const {
    cases,
    checkIns,
    weeklyReviews,
    monthlyReviews,
    assessments,
    sessions,
    supervisionNotes,
    goals,
    transcripts,
  } = useApp();
  const {
    plans,
    reflections,
    interventions,
    audioNotes,
    formulations,
  } = useClinical();

  const [drafts, setDrafts] = useState<ReportDraft[]>([]);
  const [caseId, setCaseId] = useState("");
  const [reportType, setReportType] = useState("weekly");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [chosenSections, setChosenSections] = useState<ReportSectionType[]>(
    DEFAULT_SECTIONS.weekly
  );
  const [activeDraftId, setActiveDraftId] = useState<string | null>(null);

  // Load drafts and seed sensible date defaults on mount.
  useEffect(() => {
    setDrafts(loadFromStorage<ReportDraft[]>(DRAFT_STORAGE_KEY, []));
    const today = new Date();
    const ago = new Date();
    ago.setDate(today.getDate() - 30);
    setStart(ago.toISOString().split("T")[0]);
    setEnd(today.toISOString().split("T")[0]);
  }, []);

  useEffect(() => {
    setChosenSections(DEFAULT_SECTIONS[reportType] ?? DEFAULT_SECTIONS.weekly);
  }, [reportType]);

  const activeDraft = useMemo(
    () => drafts.find((d) => d.id === activeDraftId) ?? null,
    [drafts, activeDraftId]
  );

  function persist(next: ReportDraft[]) {
    setDrafts(next);
    saveToStorage(DRAFT_STORAGE_KEY, next);
  }

  const data: AssemblyData = useMemo(
    () => ({
      cases: cases.map((c) => ({
        id: c.id,
        code: c.code,
        type: c.type,
        status: c.status,
        age: c.age,
        gender: c.gender,
        context: c.context,
        presentingConcerns: c.presentingConcerns,
        currentGoals: c.currentGoals,
        keyObservations: c.keyObservations,
        latestSummary: c.latestSummary,
        shortNote: c.shortNote,
        startDate: c.startDate,
      })),
      checkIns: checkIns.map((c) => ({
        id: c.id,
        caseId: c.caseId,
        date: c.date,
        moodAffect: c.moodAffect,
        behaviorObservations: c.behaviorObservations,
        emotionalRegulation: c.emotionalRegulation,
        interventionUsed: c.interventionUsed,
        responseToIntervention: c.responseToIntervention,
        freeNotes: c.freeNotes,
      })),
      weeklyReviews: weeklyReviews.map((w) => ({
        id: w.id,
        caseId: w.caseId,
        weekStart: w.weekStart,
        weekEnd: w.weekEnd,
        mainProgress: w.mainProgress,
        mainDifficulties: w.mainDifficulties,
        effectiveInterventions: w.effectiveInterventions,
        goalsNextWeek: w.goalsNextWeek,
      })),
      monthlyReviews: monthlyReviews.map((m) => ({
        id: m.id,
        caseId: m.caseId,
        month: m.month,
        overallEvolution: m.overallEvolution,
        recommendations: m.recommendations,
        nextMonthObjectives: m.nextMonthObjectives,
      })),
      assessments: assessments.map((a) => ({
        id: a.id,
        caseId: a.caseId,
        title: a.title,
        scoreStatus: a.scoreStatus,
        scoreValue: a.scoreValue,
        lastCompleted: a.lastCompleted,
      })),
      sessions: sessions.map((s) => ({
        id: s.id,
        caseId: s.caseId,
        date: s.date,
      })),
      sessionPlans: plans.map((p) => ({
        id: p.id,
        caseId: p.caseId,
        date: p.date,
        goals: p.goals,
        postSessionNotes: p.postSessionNotes,
        status: p.status,
      })),
      supervisionNotes: supervisionNotes.map((s) => ({
        id: s.id,
        caseId: s.caseId,
        date: s.date,
        mainTopics: s.mainTopics,
        feedbackReceived: s.feedbackReceived,
        actionPlan: s.actionPlan,
      })),
      reflections: reflections.map((r) => ({
        id: r.id,
        linkedCaseId: r.linkedCaseId,
        date: r.date,
        whatLearned: r.whatLearned,
        emotionalImpact: r.emotionalImpact,
      })),
      interventions: interventions.map((i) => ({
        id: i.id,
        caseId: i.caseId,
        date: i.date,
        name: i.name,
        effectiveness: i.effectiveness,
        response: i.response,
      })),
      goals: goals.map((g) => ({
        id: g.id,
        caseId: g.caseId,
        title: g.title,
        status: g.status,
        progress: g.progress,
      })),
      transcripts: transcripts.map((t) => ({
        id: t.id,
        caseId: t.caseId,
        title: t.title,
        createdAt: t.createdAt,
      })),
      audioNotes: audioNotes.map((a) => ({
        id: a.id,
        linkedType: a.linkedType,
        linkedId: a.linkedId,
        name: a.name,
        createdAt: a.createdAt,
      })),
      formulations: formulations.map((f) => ({
        id: f.id,
        caseId: f.caseId,
        model: f.model,
        title: f.title,
        sections: f.sections,
        updatedAt: f.updatedAt,
      })),
    }),
    [
      cases,
      checkIns,
      weeklyReviews,
      monthlyReviews,
      assessments,
      sessions,
      supervisionNotes,
      goals,
      transcripts,
      plans,
      reflections,
      interventions,
      audioNotes,
      formulations,
    ]
  );

  function build() {
    if (!caseId) {
      toast("Pick a case first", "warning");
      return;
    }
    if (!start || !end) {
      toast("Set a date range", "warning");
      return;
    }
    if (start > end) {
      toast("Start date must be before end date", "warning");
      return;
    }
    try {
      const draft = assembleReport({
        caseId,
        reportType,
        dateRange: { start, end },
        sectionTypes: chosenSections,
        data,
      });
      const next = [draft, ...drafts];
      persist(next);
      setActiveDraftId(draft.id);
      toast("Draft assembled ✦", "success");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to assemble";
      toast(msg, "warning");
    }
  }

  function updateActive(updater: (d: ReportDraft) => ReportDraft) {
    if (!activeDraft) return;
    const next = drafts.map((d) =>
      d.id === activeDraft.id ? updater(d) : d
    );
    persist(next);
  }

  function moveSection(index: number, dir: -1 | 1) {
    if (!activeDraft) return;
    updateActive((d) => ({
      ...d,
      sections: reorderSections(d.sections, index, index + dir),
      updatedAt: new Date().toISOString(),
    }));
  }

  function editSection(sectionId: string, content: string) {
    updateActive((d) => ({
      ...d,
      sections: updateSectionContent(d.sections, sectionId, content),
      updatedAt: new Date().toISOString(),
    }));
  }

  function dropSection(sectionId: string) {
    updateActive((d) => ({
      ...d,
      sections: removeSection(d.sections, sectionId),
      updatedAt: new Date().toISOString(),
    }));
  }

  function duplicateActive() {
    if (!activeDraft) return;
    const dup = duplicateDraft(activeDraft);
    persist([dup, ...drafts]);
    setActiveDraftId(dup.id);
    toast("Draft duplicated", "success");
  }

  function deleteDraft(id: string) {
    const next = drafts.filter((d) => d.id !== id);
    persist(next);
    if (activeDraftId === id) setActiveDraftId(null);
  }

  function toggleSectionType(type: ReportSectionType) {
    setChosenSections((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  }

  function moveSectionType(index: number, dir: -1 | 1) {
    setChosenSections((prev) => reorderSections(
      prev.map((t, i) => ({
        id: String(i),
        type: t,
        title: SECTION_LABELS[t],
        content: "",
        sources: [],
        order: i,
        edited: false,
      })),
      index,
      index + dir
    ).map((s) => s.type));
  }

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      <PageHeader
        title="Smart Report Builder"
        subtitle="Assemble a draft from your saved data with full source provenance"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Inputs */}
        <div className="lg:col-span-1 space-y-4 print:hidden">
          <SectionCard title="1. Pick">
            <div className="space-y-3">
              <div>
                <Label htmlFor="b-case">Case</Label>
                <Select
                  id="b-case"
                  value={caseId}
                  onChange={(e) => setCaseId(e.target.value)}
                >
                  <option value="">Choose…</option>
                  {cases
                    .filter((c) => !c.isArchived)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.code} — {c.type}
                      </option>
                    ))}
                </Select>
              </div>

              <div>
                <Label htmlFor="b-type">Report type</Label>
                <Select
                  id="b-type"
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                >
                  {REPORT_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="b-start">Start</Label>
                  <Input
                    id="b-start"
                    type="date"
                    value={start}
                    onChange={(e) => setStart(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="b-end">End</Label>
                  <Input
                    id="b-end"
                    type="date"
                    value={end}
                    onChange={(e) => setEnd(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard
            title="2. Sections"
            description="Toggle or reorder. Defaults are tuned per report type."
          >
            <div className="space-y-1 max-h-[420px] overflow-y-auto">
              {chosenSections.map((type, i) => (
                <div
                  key={`${type}-${i}`}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-lg"
                  style={{
                    backgroundColor: "var(--psych-primary-light)",
                    color: "var(--psych-text)",
                  }}
                >
                  <span className="text-sm flex-1">{SECTION_LABELS[type]}</span>
                  <button
                    aria-label="Move up"
                    disabled={i === 0}
                    onClick={() => moveSectionType(i, -1)}
                    className="opacity-60 hover:opacity-100 disabled:opacity-20"
                  >
                    <ArrowUp size={14} />
                  </button>
                  <button
                    aria-label="Move down"
                    disabled={i === chosenSections.length - 1}
                    onClick={() => moveSectionType(i, 1)}
                    className="opacity-60 hover:opacity-100 disabled:opacity-20"
                  >
                    <ArrowDown size={14} />
                  </button>
                  <button
                    aria-label="Remove"
                    onClick={() => toggleSectionType(type)}
                    className="opacity-60 hover:opacity-100"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              <div
                className="text-[11px] font-semibold uppercase tracking-wide pt-3 pb-1"
                style={{ color: "var(--psych-muted)" }}
              >
                Add a section
              </div>
              <div className="flex flex-wrap gap-1">
                {ALL_SECTION_TYPES.filter(
                  (t) => !chosenSections.includes(t)
                ).map((t) => (
                  <button
                    key={t}
                    onClick={() => toggleSectionType(t)}
                    className="text-xs px-2 py-1 rounded-md border"
                    style={{
                      borderColor: "var(--psych-border)",
                      color: "var(--psych-text)",
                    }}
                  >
                    + {SECTION_LABELS[t]}
                  </button>
                ))}
              </div>
            </div>
          </SectionCard>

          <Button onClick={build} className="w-full">
            <Sparkles size={14} /> Assemble draft
          </Button>

          {drafts.length > 0 && (
            <SectionCard title="Saved drafts">
              <div className="space-y-1 max-h-[300px] overflow-y-auto">
                {drafts.map((d) => (
                  <div
                    key={d.id}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm cursor-pointer"
                    style={{
                      backgroundColor:
                        d.id === activeDraftId
                          ? "var(--psych-primary-light)"
                          : "transparent",
                    }}
                    onClick={() => setActiveDraftId(d.id)}
                  >
                    <span className="flex-1 truncate">{d.title}</span>
                    <button
                      aria-label="Delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteDraft(d.id);
                      }}
                      className="opacity-60 hover:opacity-100"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}
        </div>

        {/* Preview / editor */}
        <div className="lg:col-span-2">
          {!activeDraft ? (
            <SectionCard title="Preview" description="Pick a case and assemble">
              <div
                className="text-center py-8 text-sm"
                style={{ color: "var(--psych-muted)" }}
              >
                Your assembled draft will appear here. Each section will show
                the sources it was pulled from.
              </div>
            </SectionCard>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2 print:hidden">
                <div className="flex-1">
                  <Input
                    value={activeDraft.title}
                    onChange={(e) =>
                      updateActive((d) => ({
                        ...d,
                        title: e.target.value,
                        updatedAt: new Date().toISOString(),
                      }))
                    }
                  />
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={duplicateActive}
                  aria-label="Duplicate draft"
                >
                  <Copy size={14} /> Duplicate
                </Button>
                <Button
                  size="sm"
                  onClick={() => window.print()}
                  variant="secondary"
                >
                  <Printer size={14} /> Print
                </Button>
                <Button
                  size="sm"
                  onClick={() => toast("Draft auto-saves locally", "info")}
                >
                  <Save size={14} /> Saved
                </Button>
              </div>

              <div
                className="rounded-2xl border p-6 space-y-5"
                style={{
                  backgroundColor: "var(--psych-card)",
                  borderColor: "var(--psych-border)",
                }}
              >
                <div className="text-center pb-3 border-b" style={{ borderColor: "var(--psych-border)" }}>
                  <h1 className="text-lg font-semibold">
                    {activeDraft.title}
                  </h1>
                  <p className="text-xs" style={{ color: "var(--psych-muted)" }}>
                    {activeDraft.reportType} · {activeDraft.dateRange.start} → {activeDraft.dateRange.end}
                  </p>
                </div>

                {activeDraft.sections.map((s, i) => (
                  <div key={s.id} className="space-y-2">
                    <div className="flex items-center gap-2 print:hidden">
                      <h2 className="text-sm font-semibold flex-1">
                        {s.title}
                        {s.edited && (
                          <span
                            className="ml-2 text-[10px] px-1.5 py-0.5 rounded-full"
                            style={{
                              backgroundColor: "var(--psych-primary-light)",
                              color: "var(--psych-accent)",
                            }}
                          >
                            edited
                          </span>
                        )}
                      </h2>
                      <button
                        aria-label="Move up"
                        disabled={i === 0}
                        onClick={() => moveSection(i, -1)}
                        className="opacity-60 hover:opacity-100 disabled:opacity-20"
                      >
                        <ArrowUp size={14} />
                      </button>
                      <button
                        aria-label="Move down"
                        disabled={i === activeDraft.sections.length - 1}
                        onClick={() => moveSection(i, 1)}
                        className="opacity-60 hover:opacity-100 disabled:opacity-20"
                      >
                        <ArrowDown size={14} />
                      </button>
                      <button
                        aria-label="Remove"
                        onClick={() => dropSection(s.id)}
                        className="opacity-60 hover:opacity-100"
                      >
                        <X size={14} />
                      </button>
                    </div>
                    <h2 className="text-sm font-semibold hidden print:block">
                      {s.title}
                    </h2>
                    <Textarea
                      value={s.content}
                      onChange={(e) => editSection(s.id, e.target.value)}
                      className="min-h-[80px] text-sm"
                    />
                    {s.sources.length > 0 && (
                      <div
                        className="text-[10px] print:hidden"
                        style={{ color: "var(--psych-muted)" }}
                      >
                        Sources: {s.sources
                          .map(
                            (src) =>
                              `${src.kind}${src.date ? ` ${src.date}` : ""}${
                                src.label ? ` (${src.label})` : ""
                              }`
                          )
                          .join(" · ")}
                      </div>
                    )}
                  </div>
                ))}

                <div className="pt-4 border-t text-xs print:hidden" style={{ borderColor: "var(--psych-border)" }}>
                  <p style={{ color: "var(--psych-muted)" }}>
                    PDF export is a planned feature. For now, use{" "}
                    <strong>Print</strong> → Save as PDF from your browser.
                  </p>
                  <Link
                    href="/backup"
                    className="text-xs font-medium"
                    style={{ color: "var(--psych-primary)" }}
                  >
                    Or back up the full draft set as JSON →
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
