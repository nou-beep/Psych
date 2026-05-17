// Session Preparation Mode — aggregates everything a therapist needs
// to walk into the next session: previous notes, open loops, recent
// worksheets, assessments, symptom changes, timeline updates, recent
// quotes, body-map changes, assigned work.
//
// Pure aggregation. The page just feeds in the data sources.

import { generateId, nowISO } from "@/lib/store";
import type {
  PsychCase,
  DailyCheckIn,
  Session,
  Assessment,
} from "@/lib/mock-data";

export interface OpenLoopLike {
  id: string;
  caseId?: string;
  title: string;
  status: string;
  updatedAt: string;
}

export interface ThreadLike {
  id: string;
  caseId?: string;
  label: string;
  intensity?: number;
  updatedAt: string;
}

export interface AssessmentLike extends Assessment {
  caseId?: string;
}

export interface PrepFocusPoint {
  id: string;
  body: string;
  pinned: boolean;
  createdAt: string;
}

export interface PrepAgendaItem {
  id: string;
  body: string;
  durationMinutes?: number;
  completed: boolean;
  createdAt: string;
}

export interface SessionPrepNote {
  caseId: string;
  // Pre-session free notes the therapist writes.
  prepNotes: string;
  // Pinned focus points for the session.
  focusPoints: PrepFocusPoint[];
  // Ordered agenda.
  agenda: PrepAgendaItem[];
  // Free-text supervision questions to bring up.
  supervisionQuestions: string;
  // Worksheets attached to the session (ids from worksheet library).
  attachedWorksheetIds: string[];
  // Audit.
  updatedAt: string;
  createdAt: string;
}

export const SESSION_PREP_STORAGE_KEY = "psych-session-prep-v1";

export function emptyPrep(caseId: string): SessionPrepNote {
  const now = nowISO();
  return {
    caseId,
    prepNotes: "",
    focusPoints: [],
    agenda: [],
    supervisionQuestions: "",
    attachedWorksheetIds: [],
    updatedAt: now,
    createdAt: now,
  };
}

export function addFocusPoint(
  prep: SessionPrepNote,
  body: string
): SessionPrepNote {
  if (!body.trim()) return prep;
  const now = nowISO();
  return {
    ...prep,
    focusPoints: [
      ...prep.focusPoints,
      { id: generateId(), body: body.trim(), pinned: true, createdAt: now },
    ],
    updatedAt: now,
  };
}

export function removeFocusPoint(
  prep: SessionPrepNote,
  id: string
): SessionPrepNote {
  return {
    ...prep,
    focusPoints: prep.focusPoints.filter((f) => f.id !== id),
    updatedAt: nowISO(),
  };
}

export function addAgendaItem(
  prep: SessionPrepNote,
  body: string,
  durationMinutes?: number
): SessionPrepNote {
  if (!body.trim()) return prep;
  return {
    ...prep,
    agenda: [
      ...prep.agenda,
      {
        id: generateId(),
        body: body.trim(),
        durationMinutes,
        completed: false,
        createdAt: nowISO(),
      },
    ],
    updatedAt: nowISO(),
  };
}

export function toggleAgendaItem(
  prep: SessionPrepNote,
  id: string
): SessionPrepNote {
  return {
    ...prep,
    agenda: prep.agenda.map((a) =>
      a.id === id ? { ...a, completed: !a.completed } : a
    ),
    updatedAt: nowISO(),
  };
}

export function removeAgendaItem(
  prep: SessionPrepNote,
  id: string
): SessionPrepNote {
  return {
    ...prep,
    agenda: prep.agenda.filter((a) => a.id !== id),
    updatedAt: nowISO(),
  };
}

// ─── Aggregation ──────────────────────────────────────────────

export interface SymptomTrend {
  label: string;
  direction: "up" | "down" | "stable";
  detail?: string;
}

export interface PrepBundle {
  caseId: string;
  caseCode: string;
  caseStatus: string;
  // Most recent sessions for this case (newest first).
  recentSessions: Session[];
  // Most recent check-ins for this case (newest first).
  recentCheckIns: DailyCheckIn[];
  // Most recent assessments touching this case.
  recentAssessments: AssessmentLike[];
  // Open loops keyed to this case.
  openLoops: OpenLoopLike[];
  // Active threads ranked by intensity.
  activeThreads: ThreadLike[];
  // Quick symptom trend hints derived from check-ins.
  trends: SymptomTrend[];
  // Stale flags — anything not touched in N days.
  staleFlags: string[];
  // The therapist's prep note for this case.
  prep: SessionPrepNote;
}

export function buildPrepBundle(input: {
  case: PsychCase;
  sessions: Session[];
  checkIns: DailyCheckIn[];
  assessments: AssessmentLike[];
  openLoops: OpenLoopLike[];
  threads: ThreadLike[];
  prep?: SessionPrepNote;
  limit?: number;
}): PrepBundle {
  const limit = input.limit ?? 5;
  const caseId = input.case.id;

  const recentSessions = (input.sessions ?? [])
    .filter((s) => s.caseId === caseId)
    .sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""))
    .slice(0, limit);

  const recentCheckIns = (input.checkIns ?? [])
    .filter((c) => c.caseId === caseId)
    .sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""))
    .slice(0, limit);

  const recentAssessments = (input.assessments ?? [])
    .filter((a) => a.caseId === caseId)
    .sort((a, b) =>
      (b.lastCompleted ?? "").localeCompare(a.lastCompleted ?? "")
    )
    .slice(0, limit);

  const openLoops = (input.openLoops ?? [])
    .filter((l) => !l.caseId || l.caseId === caseId)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  const activeThreads = (input.threads ?? [])
    .filter((t) => !t.caseId || t.caseId === caseId)
    .sort((a, b) => (b.intensity ?? 0) - (a.intensity ?? 0));

  const trends = deriveTrends(recentCheckIns);
  const staleFlags = deriveStaleFlags({
    recentSessions,
    recentCheckIns,
    recentAssessments,
  });

  return {
    caseId,
    caseCode: input.case.code,
    caseStatus: input.case.status,
    recentSessions,
    recentCheckIns,
    recentAssessments,
    openLoops,
    activeThreads,
    trends,
    staleFlags,
    prep: input.prep ?? emptyPrep(caseId),
  };
}

function deriveTrends(checkIns: DailyCheckIn[]): SymptomTrend[] {
  if (checkIns.length < 2) return [];
  const latest = checkIns[0];
  const previous = checkIns[checkIns.length - 1];
  const trends: SymptomTrend[] = [];

  function compareText(
    field: keyof DailyCheckIn,
    label: string
  ): SymptomTrend | null {
    const a = String(latest[field] ?? "").toLowerCase();
    const b = String(previous[field] ?? "").toLowerCase();
    if (!a && !b) return null;
    if (a === b) return { label, direction: "stable" };
    // Heuristic: increase/decrease language.
    const intensifiers = ["plus", "more", "increased", "worse", "amplifié"];
    const dampeners = ["moins", "less", "reduced", "better", "amélioré"];
    if (intensifiers.some((w) => a.includes(w)))
      return { label, direction: "up", detail: a.slice(0, 80) };
    if (dampeners.some((w) => a.includes(w)))
      return { label, direction: "down", detail: a.slice(0, 80) };
    return { label, direction: "stable" };
  }

  const candidates: Array<[keyof DailyCheckIn, string]> = [
    ["moodAffect", "Mood / affect"],
    ["emotionalRegulation", "Emotional regulation"],
    ["sensoryObservations", "Sensory"],
    ["cognitiveObservations", "Cognitive"],
  ];
  for (const [f, label] of candidates) {
    const t = compareText(f, label);
    if (t) trends.push(t);
  }
  return trends;
}

function deriveStaleFlags(input: {
  recentSessions: Session[];
  recentCheckIns: DailyCheckIn[];
  recentAssessments: AssessmentLike[];
}): string[] {
  const flags: string[] = [];
  const now = Date.now();
  const fourteenDaysMs = 14 * 24 * 60 * 60 * 1000;
  if (input.recentSessions.length > 0) {
    const last = Date.parse(input.recentSessions[0].date ?? "");
    if (!Number.isNaN(last) && now - last > fourteenDaysMs) {
      flags.push("No session in over 2 weeks");
    }
  } else {
    flags.push("No sessions on record for this case");
  }
  if (input.recentCheckIns.length === 0) {
    flags.push("No check-ins yet");
  }
  if (input.recentAssessments.length === 0) {
    flags.push("No assessments linked");
  }
  return flags;
}

export function patchPrep(
  list: SessionPrepNote[],
  caseId: string,
  patch: Partial<Omit<SessionPrepNote, "caseId" | "createdAt">>
): SessionPrepNote[] {
  const existingIdx = list.findIndex((p) => p.caseId === caseId);
  const now = nowISO();
  if (existingIdx === -1) {
    return [...list, { ...emptyPrep(caseId), ...patch, updatedAt: now }];
  }
  return list.map((p) =>
    p.caseId === caseId ? { ...p, ...patch, updatedAt: now } : p
  );
}
