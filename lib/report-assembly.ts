// Smart Report Assembly V2 — pure, rule-based assembly of report sections
// from saved local data. No AI, no network calls. Every produced section
// includes provenance so the UI can show where the content came from.

import { generateId, nowISO } from "@/lib/store";

export type ReportSectionType =
  | "case-summary"
  | "presenting-concerns"
  | "current-goals"
  | "daily-checkins"
  | "weekly-reviews"
  | "monthly-reviews"
  | "assessments"
  | "session-summaries"
  | "session-plans"
  | "supervision-notes"
  | "clinical-reflections"
  | "interventions-used"
  | "workbook-sheets"
  | "transcripts"
  | "audio-notes"
  | "formulation"
  | "goals"
  | "thesis-notes"
  | "custom";

export interface ReportSourceRef {
  kind: string;
  id: string;
  date?: string;
  label?: string;
}

export interface AssembledSection {
  id: string;
  type: ReportSectionType;
  title: string;
  content: string;
  sources: ReportSourceRef[];
  order: number;
  edited: boolean;
}

export interface ReportDraft {
  id: string;
  caseId: string;
  reportType: string;
  title: string;
  dateRange: { start: string; end: string };
  sections: AssembledSection[];
  createdAt: string;
  updatedAt: string;
}

// Minimal, duck-typed shapes — keep assembly decoupled from app types so
// the function is easy to test and resilient to schema drift.

export interface AssemblyCase {
  id: string;
  code: string;
  type?: string;
  status?: string;
  age?: string;
  gender?: string;
  context?: string;
  presentingConcerns?: string;
  currentGoals?: string[];
  keyObservations?: string;
  latestSummary?: string;
  shortNote?: string;
  startDate?: string;
}

export interface AssemblyCheckIn {
  id: string;
  caseId: string;
  date: string;
  moodAffect?: string;
  behaviorObservations?: string;
  emotionalRegulation?: string;
  interventionUsed?: string;
  responseToIntervention?: string;
  freeNotes?: string;
}

export interface AssemblyWeekly {
  id: string;
  caseId: string;
  weekStart: string;
  weekEnd?: string;
  mainProgress?: string;
  mainDifficulties?: string;
  effectiveInterventions?: string;
  goalsNextWeek?: string;
}

export interface AssemblyMonthly {
  id: string;
  caseId: string;
  month: string;
  overallEvolution?: string;
  recommendations?: string;
  nextMonthObjectives?: string;
}

export interface AssemblyAssessment {
  id: string;
  caseId?: string;
  title: string;
  scoreStatus?: string;
  scoreValue?: string;
  lastCompleted?: string | null;
}

export interface AssemblySession {
  id: string;
  caseId: string;
  date: string;
  topic?: string;
  observations?: string;
  interventions?: string;
  nextSteps?: string;
}

export interface AssemblySessionPlan {
  id: string;
  caseId: string;
  date: string;
  goals?: string[];
  postSessionNotes?: string;
  status?: string;
}

export interface AssemblySupervision {
  id: string;
  caseId: string;
  date: string;
  mainTopics?: string;
  feedbackReceived?: string;
  actionPlan?: string;
}

export interface AssemblyReflection {
  id: string;
  linkedCaseId: string;
  date: string;
  whatLearned?: string;
  emotionalImpact?: string;
}

export interface AssemblyIntervention {
  id: string;
  caseId: string;
  date: string;
  name: string;
  effectiveness?: number;
  response?: string;
}

export interface AssemblyGoal {
  id: string;
  caseId?: string;
  title: string;
  status?: string;
  progress?: number;
}

export interface AssemblyTranscript {
  id: string;
  caseId?: string;
  title: string;
  createdAt: string;
  content?: string;
}

export interface AssemblyAudioNote {
  id: string;
  linkedType?: string;
  linkedId?: string;
  name: string;
  createdAt: string;
  transcript?: string;
}

export interface AssemblyFormulation {
  id: string;
  caseId: string;
  model: string;
  title?: string;
  sections: Record<string, string>;
  updatedAt: string;
}

export interface AssemblyData {
  cases: AssemblyCase[];
  checkIns: AssemblyCheckIn[];
  weeklyReviews: AssemblyWeekly[];
  monthlyReviews: AssemblyMonthly[];
  assessments: AssemblyAssessment[];
  sessions: AssemblySession[];
  sessionPlans: AssemblySessionPlan[];
  supervisionNotes: AssemblySupervision[];
  reflections: AssemblyReflection[];
  interventions: AssemblyIntervention[];
  goals: AssemblyGoal[];
  transcripts: AssemblyTranscript[];
  audioNotes: AssemblyAudioNote[];
  formulations: AssemblyFormulation[];
}

export interface AssemblyInput {
  caseId: string;
  reportType: string;
  title?: string;
  dateRange: { start: string; end: string };
  sectionTypes: ReportSectionType[];
  data: AssemblyData;
}

// ── Date helpers ──────────────────────────────────────────────

export function inDateRange(
  date: string | undefined | null,
  range: { start: string; end: string }
): boolean {
  if (!date) return false;
  if (range.start && date < range.start) return false;
  if (range.end && date > range.end) return false;
  return true;
}

export function isValidDateRange(range: {
  start: string;
  end: string;
}): boolean {
  if (!range.start || !range.end) return false;
  return range.start <= range.end;
}

// ── Section builders ──────────────────────────────────────────

function buildCaseSummary(
  caseData: AssemblyCase | undefined
): AssembledSection | null {
  if (!caseData) return null;
  const lines = [
    caseData.context && `Context: ${caseData.context}`,
    caseData.age && `Age: ${caseData.age}`,
    caseData.gender && `Gender: ${caseData.gender}`,
    caseData.latestSummary && `Latest summary: ${caseData.latestSummary}`,
    caseData.shortNote && `Note: ${caseData.shortNote}`,
  ].filter(Boolean);
  return {
    id: generateId(),
    type: "case-summary",
    title: "Case Summary",
    content: lines.join("\n\n") || "No case summary available.",
    sources: [
      { kind: "case", id: caseData.id, label: caseData.code },
    ],
    order: 0,
    edited: false,
  };
}

function buildPresentingConcerns(
  caseData: AssemblyCase | undefined
): AssembledSection | null {
  if (!caseData) return null;
  return {
    id: generateId(),
    type: "presenting-concerns",
    title: "Presenting Concerns",
    content: caseData.presentingConcerns || "No presenting concerns recorded.",
    sources: [{ kind: "case", id: caseData.id, label: caseData.code }],
    order: 0,
    edited: false,
  };
}

function buildCurrentGoals(
  caseData: AssemblyCase | undefined
): AssembledSection | null {
  if (!caseData) return null;
  const goals = caseData.currentGoals ?? [];
  const content = goals.length
    ? goals.map((g, i) => `${i + 1}. ${g}`).join("\n")
    : "No current goals recorded on the case.";
  return {
    id: generateId(),
    type: "current-goals",
    title: "Current Goals",
    content,
    sources: [{ kind: "case", id: caseData.id, label: caseData.code }],
    order: 0,
    edited: false,
  };
}

function buildDailyCheckIns(
  caseId: string,
  input: AssemblyInput
): AssembledSection {
  const items = input.data.checkIns
    .filter((c) => c.caseId === caseId)
    .filter((c) => inDateRange(c.date, input.dateRange))
    .sort((a, b) => a.date.localeCompare(b.date));
  const blocks = items.map((c) => {
    const parts = [
      `• ${c.date}`,
      c.moodAffect && `  Mood/Affect: ${c.moodAffect}`,
      c.behaviorObservations && `  Behavior: ${c.behaviorObservations}`,
      c.emotionalRegulation &&
        `  Emotional Regulation: ${c.emotionalRegulation}`,
      c.interventionUsed && `  Intervention: ${c.interventionUsed}`,
      c.responseToIntervention &&
        `  Response: ${c.responseToIntervention}`,
      c.freeNotes && `  Notes: ${c.freeNotes}`,
    ].filter(Boolean);
    return parts.join("\n");
  });
  return {
    id: generateId(),
    type: "daily-checkins",
    title: "Daily Check-ins",
    content: blocks.length
      ? blocks.join("\n\n")
      : "No daily check-ins in the selected date range.",
    sources: items.map((c) => ({
      kind: "daily-checkin",
      id: c.id,
      date: c.date,
    })),
    order: 0,
    edited: false,
  };
}

function buildWeeklyReviews(
  caseId: string,
  input: AssemblyInput
): AssembledSection {
  const items = input.data.weeklyReviews
    .filter((w) => w.caseId === caseId)
    .filter((w) => inDateRange(w.weekStart, input.dateRange))
    .sort((a, b) => a.weekStart.localeCompare(b.weekStart));
  const blocks = items.map((w) => {
    const period = w.weekEnd ? `${w.weekStart} → ${w.weekEnd}` : w.weekStart;
    const parts = [
      `Week of ${period}`,
      w.mainProgress && `Progress: ${w.mainProgress}`,
      w.mainDifficulties && `Difficulties: ${w.mainDifficulties}`,
      w.effectiveInterventions &&
        `Effective interventions: ${w.effectiveInterventions}`,
      w.goalsNextWeek && `Next-week goals: ${w.goalsNextWeek}`,
    ].filter(Boolean);
    return parts.join("\n");
  });
  return {
    id: generateId(),
    type: "weekly-reviews",
    title: "Weekly Reviews",
    content: blocks.length
      ? blocks.join("\n\n")
      : "No weekly reviews in the selected date range.",
    sources: items.map((w) => ({
      kind: "weekly-review",
      id: w.id,
      date: w.weekStart,
    })),
    order: 0,
    edited: false,
  };
}

function buildMonthlyReviews(
  caseId: string,
  input: AssemblyInput
): AssembledSection {
  const items = input.data.monthlyReviews
    .filter((m) => m.caseId === caseId)
    .filter((m) => inDateRange(m.month, input.dateRange))
    .sort((a, b) => a.month.localeCompare(b.month));
  const blocks = items.map((m) => {
    const parts = [
      `Month of ${m.month}`,
      m.overallEvolution && `Evolution: ${m.overallEvolution}`,
      m.recommendations && `Recommendations: ${m.recommendations}`,
      m.nextMonthObjectives &&
        `Next-month objectives: ${m.nextMonthObjectives}`,
    ].filter(Boolean);
    return parts.join("\n");
  });
  return {
    id: generateId(),
    type: "monthly-reviews",
    title: "Monthly Reviews",
    content: blocks.length
      ? blocks.join("\n\n")
      : "No monthly reviews in the selected date range.",
    sources: items.map((m) => ({
      kind: "monthly-review",
      id: m.id,
      date: m.month,
    })),
    order: 0,
    edited: false,
  };
}

function buildAssessments(
  caseId: string,
  caseType: string | undefined,
  input: AssemblyInput
): AssembledSection {
  const items = input.data.assessments.filter((a) => {
    if (a.caseId) return a.caseId === caseId;
    return true; // assessments without explicit caseId are global templates
  });
  const blocks = items.map((a) => {
    const score =
      a.scoreValue !== undefined && a.scoreValue !== null && a.scoreValue !== ""
        ? `Score: ${a.scoreValue}`
        : a.scoreStatus
        ? `Status: ${a.scoreStatus}`
        : "";
    const date = a.lastCompleted ? `Completed: ${a.lastCompleted}` : "";
    return [a.title, score, date].filter(Boolean).join("\n");
  });
  return {
    id: generateId(),
    type: "assessments",
    title: "Assessments",
    content: blocks.length ? blocks.join("\n\n") : "No assessments to report.",
    sources: items.map((a) => ({
      kind: "assessment",
      id: a.id,
      label: a.title,
    })),
    order: 0,
    edited: false,
  };
}

function buildSessionSummaries(
  caseId: string,
  input: AssemblyInput
): AssembledSection {
  const items = input.data.sessions
    .filter((s) => s.caseId === caseId)
    .filter((s) => inDateRange(s.date, input.dateRange))
    .sort((a, b) => a.date.localeCompare(b.date));
  const blocks = items.map((s) => {
    const parts = [
      `Session — ${s.date}${s.topic ? ` (${s.topic})` : ""}`,
      s.observations && `Observations: ${s.observations}`,
      s.interventions && `Interventions: ${s.interventions}`,
      s.nextSteps && `Next steps: ${s.nextSteps}`,
    ].filter(Boolean);
    return parts.join("\n");
  });
  return {
    id: generateId(),
    type: "session-summaries",
    title: "Session Summaries",
    content: blocks.length
      ? blocks.join("\n\n")
      : "No sessions in the selected date range.",
    sources: items.map((s) => ({
      kind: "session",
      id: s.id,
      date: s.date,
    })),
    order: 0,
    edited: false,
  };
}

function buildSessionPlans(
  caseId: string,
  input: AssemblyInput
): AssembledSection {
  const items = input.data.sessionPlans
    .filter((p) => p.caseId === caseId)
    .filter((p) => inDateRange(p.date, input.dateRange))
    .sort((a, b) => a.date.localeCompare(b.date));
  const blocks = items.map((p) => {
    const status = p.status ? ` [${p.status}]` : "";
    const goals = p.goals?.length
      ? `Planned goals: ${p.goals.join("; ")}`
      : "";
    const notes = p.postSessionNotes
      ? `Post-session notes: ${p.postSessionNotes}`
      : "";
    return [
      `Plan — ${p.date}${status}`,
      goals,
      notes,
    ]
      .filter(Boolean)
      .join("\n");
  });
  return {
    id: generateId(),
    type: "session-plans",
    title: "Session Plans",
    content: blocks.length
      ? blocks.join("\n\n")
      : "No session plans in the selected date range.",
    sources: items.map((p) => ({
      kind: "session-plan",
      id: p.id,
      date: p.date,
    })),
    order: 0,
    edited: false,
  };
}

function buildSupervisionNotes(
  caseId: string,
  input: AssemblyInput
): AssembledSection {
  const items = input.data.supervisionNotes
    .filter((s) => s.caseId === caseId)
    .filter((s) => inDateRange(s.date, input.dateRange))
    .sort((a, b) => a.date.localeCompare(b.date));
  const blocks = items.map((s) => {
    return [
      `Supervision — ${s.date}`,
      s.mainTopics && `Topics: ${s.mainTopics}`,
      s.feedbackReceived && `Feedback: ${s.feedbackReceived}`,
      s.actionPlan && `Action plan: ${s.actionPlan}`,
    ]
      .filter(Boolean)
      .join("\n");
  });
  return {
    id: generateId(),
    type: "supervision-notes",
    title: "Supervision Notes",
    content: blocks.length
      ? blocks.join("\n\n")
      : "No supervision notes in the selected date range.",
    sources: items.map((s) => ({
      kind: "supervision",
      id: s.id,
      date: s.date,
    })),
    order: 0,
    edited: false,
  };
}

function buildReflections(
  caseId: string,
  input: AssemblyInput
): AssembledSection {
  const items = input.data.reflections
    .filter((r) => r.linkedCaseId === caseId)
    .filter((r) => inDateRange(r.date, input.dateRange))
    .sort((a, b) => a.date.localeCompare(b.date));
  const blocks = items.map((r) => {
    return [
      `Reflection — ${r.date}`,
      r.whatLearned && `Learned: ${r.whatLearned}`,
      r.emotionalImpact && `Emotional impact: ${r.emotionalImpact}`,
    ]
      .filter(Boolean)
      .join("\n");
  });
  return {
    id: generateId(),
    type: "clinical-reflections",
    title: "Clinical Reflections",
    content: blocks.length
      ? blocks.join("\n\n")
      : "No reflections in the selected date range.",
    sources: items.map((r) => ({
      kind: "reflection",
      id: r.id,
      date: r.date,
    })),
    order: 0,
    edited: false,
  };
}

function buildInterventions(
  caseId: string,
  input: AssemblyInput
): AssembledSection {
  const items = input.data.interventions
    .filter((i) => i.caseId === caseId)
    .filter((i) => inDateRange(i.date, input.dateRange))
    .sort((a, b) => a.date.localeCompare(b.date));
  const blocks = items.map((i) => {
    const eff =
      typeof i.effectiveness === "number"
        ? ` (effectiveness ${i.effectiveness}/5)`
        : "";
    return [
      `${i.date} — ${i.name}${eff}`,
      i.response && `Response: ${i.response}`,
    ]
      .filter(Boolean)
      .join("\n");
  });
  return {
    id: generateId(),
    type: "interventions-used",
    title: "Interventions Used",
    content: blocks.length
      ? blocks.join("\n\n")
      : "No interventions logged in the selected date range.",
    sources: items.map((i) => ({
      kind: "intervention",
      id: i.id,
      date: i.date,
      label: i.name,
    })),
    order: 0,
    edited: false,
  };
}

function buildGoalsSection(
  caseId: string,
  input: AssemblyInput
): AssembledSection {
  const items = input.data.goals.filter((g) => g.caseId === caseId);
  const blocks = items.map((g) => {
    const progress = typeof g.progress === "number" ? ` ${g.progress}%` : "";
    const status = g.status ? ` [${g.status}]` : "";
    return `• ${g.title}${status}${progress}`;
  });
  return {
    id: generateId(),
    type: "goals",
    title: "Goals & Objectives",
    content: blocks.length
      ? blocks.join("\n")
      : "No goals linked to this case.",
    sources: items.map((g) => ({
      kind: "goal",
      id: g.id,
      label: g.title,
    })),
    order: 0,
    edited: false,
  };
}

function buildTranscripts(
  caseId: string,
  input: AssemblyInput
): AssembledSection {
  const items = input.data.transcripts
    .filter((t) => t.caseId === caseId)
    .filter((t) => inDateRange(t.createdAt.split("T")[0], input.dateRange))
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const blocks = items.map((t) => `${t.createdAt.split("T")[0]} — ${t.title}`);
  return {
    id: generateId(),
    type: "transcripts",
    title: "Transcripts",
    content: blocks.length
      ? blocks.join("\n")
      : "No transcripts in the selected date range.",
    sources: items.map((t) => ({
      kind: "transcript",
      id: t.id,
      date: t.createdAt.split("T")[0],
      label: t.title,
    })),
    order: 0,
    edited: false,
  };
}

function buildAudioNotes(
  caseId: string,
  input: AssemblyInput
): AssembledSection {
  const items = input.data.audioNotes
    .filter((a) => a.linkedType === "case" && a.linkedId === caseId)
    .filter((a) => inDateRange(a.createdAt.split("T")[0], input.dateRange))
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const blocks = items.map(
    (a) => `${a.createdAt.split("T")[0]} — ${a.name}`
  );
  return {
    id: generateId(),
    type: "audio-notes",
    title: "Audio Notes",
    content: blocks.length
      ? blocks.join("\n")
      : "No audio notes in the selected date range.",
    sources: items.map((a) => ({
      kind: "audio-note",
      id: a.id,
      date: a.createdAt.split("T")[0],
      label: a.name,
    })),
    order: 0,
    edited: false,
  };
}

function buildFormulation(
  caseId: string,
  input: AssemblyInput
): AssembledSection {
  const items = input.data.formulations
    .filter((f) => f.caseId === caseId)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  const latest = items[0];
  if (!latest) {
    return {
      id: generateId(),
      type: "formulation",
      title: "Clinical Formulation",
      content: "No clinical formulation recorded for this case.",
      sources: [],
      order: 0,
      edited: false,
    };
  }
  const entries = Object.entries(latest.sections).filter(([, v]) => v && v.trim());
  const body = entries
    .map(([k, v]) => `${k}:\n${v}`)
    .join("\n\n");
  return {
    id: generateId(),
    type: "formulation",
    title: `Clinical Formulation (${latest.model.toUpperCase()})`,
    content: body || "Formulation is empty.",
    sources: [
      {
        kind: "formulation",
        id: latest.id,
        date: latest.updatedAt.split("T")[0],
        label: latest.title || latest.model,
      },
    ],
    order: 0,
    edited: false,
  };
}

// ── Main entry point ──────────────────────────────────────────

const BUILDERS: Record<
  ReportSectionType,
  (caseData: AssemblyCase | undefined, input: AssemblyInput) => AssembledSection | null
> = {
  "case-summary": (c) => buildCaseSummary(c),
  "presenting-concerns": (c) => buildPresentingConcerns(c),
  "current-goals": (c) => buildCurrentGoals(c),
  "daily-checkins": (c, i) =>
    c ? buildDailyCheckIns(c.id, i) : null,
  "weekly-reviews": (c, i) =>
    c ? buildWeeklyReviews(c.id, i) : null,
  "monthly-reviews": (c, i) =>
    c ? buildMonthlyReviews(c.id, i) : null,
  assessments: (c, i) =>
    c ? buildAssessments(c.id, c.type, i) : null,
  "session-summaries": (c, i) =>
    c ? buildSessionSummaries(c.id, i) : null,
  "session-plans": (c, i) =>
    c ? buildSessionPlans(c.id, i) : null,
  "supervision-notes": (c, i) =>
    c ? buildSupervisionNotes(c.id, i) : null,
  "clinical-reflections": (c, i) =>
    c ? buildReflections(c.id, i) : null,
  "interventions-used": (c, i) =>
    c ? buildInterventions(c.id, i) : null,
  "workbook-sheets": () => ({
    id: generateId(),
    type: "workbook-sheets",
    title: "Workbook Sheets",
    content:
      "Workbook sheets attached to this case are listed in the workbook module.",
    sources: [],
    order: 0,
    edited: false,
  }),
  transcripts: (c, i) =>
    c ? buildTranscripts(c.id, i) : null,
  "audio-notes": (c, i) =>
    c ? buildAudioNotes(c.id, i) : null,
  formulation: (c, i) =>
    c ? buildFormulation(c.id, i) : null,
  goals: (c, i) => (c ? buildGoalsSection(c.id, i) : null),
  "thesis-notes": () => ({
    id: generateId(),
    type: "thesis-notes",
    title: "Thesis Notes",
    content:
      "Thesis notes are managed in the Thesis Studio and can be linked manually.",
    sources: [],
    order: 0,
    edited: false,
  }),
  custom: () => ({
    id: generateId(),
    type: "custom",
    title: "Custom Section",
    content: "",
    sources: [],
    order: 0,
    edited: false,
  }),
};

export function assembleReport(input: AssemblyInput): ReportDraft {
  if (!isValidDateRange(input.dateRange)) {
    throw new Error("Invalid date range: start must be <= end");
  }
  const caseData = input.data.cases.find((c) => c.id === input.caseId);
  const sections: AssembledSection[] = [];
  input.sectionTypes.forEach((type, index) => {
    const builder = BUILDERS[type];
    if (!builder) return;
    const section = builder(caseData, input);
    if (section) {
      sections.push({ ...section, order: index });
    }
  });
  const now = nowISO();
  return {
    id: generateId(),
    caseId: input.caseId,
    reportType: input.reportType,
    title:
      input.title ||
      `${input.reportType} report — ${caseData?.code ?? "case"}`,
    dateRange: input.dateRange,
    sections,
    createdAt: now,
    updatedAt: now,
  };
}

// ── Draft mutations ───────────────────────────────────────────

export function reorderSections(
  sections: AssembledSection[],
  fromIndex: number,
  toIndex: number
): AssembledSection[] {
  if (fromIndex === toIndex) return sections;
  if (fromIndex < 0 || fromIndex >= sections.length) return sections;
  if (toIndex < 0 || toIndex >= sections.length) return sections;
  const next = [...sections];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next.map((s, i) => ({ ...s, order: i }));
}

export function updateSectionContent(
  sections: AssembledSection[],
  sectionId: string,
  content: string
): AssembledSection[] {
  return sections.map((s) =>
    s.id === sectionId ? { ...s, content, edited: true } : s
  );
}

export function removeSection(
  sections: AssembledSection[],
  sectionId: string
): AssembledSection[] {
  return sections
    .filter((s) => s.id !== sectionId)
    .map((s, i) => ({ ...s, order: i }));
}

export function duplicateDraft(draft: ReportDraft): ReportDraft {
  const now = nowISO();
  return {
    ...draft,
    id: generateId(),
    title: `${draft.title} (copy)`,
    sections: draft.sections.map((s) => ({ ...s, id: generateId() })),
    createdAt: now,
    updatedAt: now,
  };
}

// Default section presets per report type — UI can offer these as a
// starting point. Users can always reorder or toggle.
export const DEFAULT_SECTIONS: Record<string, ReportSectionType[]> = {
  daily: ["case-summary", "daily-checkins", "interventions-used"],
  weekly: [
    "case-summary",
    "current-goals",
    "weekly-reviews",
    "daily-checkins",
    "interventions-used",
    "supervision-notes",
  ],
  monthly: [
    "case-summary",
    "current-goals",
    "monthly-reviews",
    "weekly-reviews",
    "session-summaries",
    "assessments",
    "supervision-notes",
  ],
  "one-page": [
    "case-summary",
    "presenting-concerns",
    "current-goals",
    "weekly-reviews",
  ],
  "two-page": [
    "case-summary",
    "presenting-concerns",
    "current-goals",
    "formulation",
    "weekly-reviews",
    "assessments",
  ],
  "assessment-grid": ["case-summary", "assessments", "formulation"],
  "final-long": [
    "case-summary",
    "presenting-concerns",
    "formulation",
    "current-goals",
    "goals",
    "monthly-reviews",
    "weekly-reviews",
    "session-summaries",
    "interventions-used",
    "assessments",
    "supervision-notes",
    "clinical-reflections",
  ],
};

export const SECTION_LABELS: Record<ReportSectionType, string> = {
  "case-summary": "Case Summary",
  "presenting-concerns": "Presenting Concerns",
  "current-goals": "Current Goals (case)",
  "daily-checkins": "Daily Check-ins",
  "weekly-reviews": "Weekly Reviews",
  "monthly-reviews": "Monthly Reviews",
  assessments: "Assessments",
  "session-summaries": "Session Summaries",
  "session-plans": "Session Plans",
  "supervision-notes": "Supervision Notes",
  "clinical-reflections": "Clinical Reflections",
  "interventions-used": "Interventions Used",
  "workbook-sheets": "Workbook Sheets",
  transcripts: "Transcripts",
  "audio-notes": "Audio Notes",
  formulation: "Clinical Formulation",
  goals: "Goals & Objectives",
  "thesis-notes": "Thesis Notes",
  custom: "Custom Section",
};
