// Therapy phase tracking — pure model of phase + transitions per case.
// History is preserved so the case profile can show the journey.

import { generateId, nowISO } from "@/lib/store";

export type TherapyPhase =
  | "intake"
  | "assessment"
  | "stabilization"
  | "active-treatment"
  | "maintenance"
  | "discharge-prep"
  | "follow-up";

export const PHASE_LABELS: Record<TherapyPhase, string> = {
  intake: "Intake",
  assessment: "Assessment",
  stabilization: "Stabilization",
  "active-treatment": "Active treatment",
  maintenance: "Maintenance",
  "discharge-prep": "Discharge preparation",
  "follow-up": "Follow-up",
};

export const PHASE_ORDER: TherapyPhase[] = [
  "intake",
  "assessment",
  "stabilization",
  "active-treatment",
  "maintenance",
  "discharge-prep",
  "follow-up",
];

export interface PhaseEntry {
  id: string;
  phase: TherapyPhase;
  startedAt: string;
  notes: string;
  // When closed (i.e. case moved to a new phase) this is set.
  closedAt?: string;
}

export interface CasePhaseHistory {
  caseId: string;
  entries: PhaseEntry[];
  updatedAt: string;
}

export const PHASE_STORAGE_KEY = "psych-case-phase-v1";

export function emptyHistory(
  caseId: string,
  startingPhase: TherapyPhase = "intake"
): CasePhaseHistory {
  const now = nowISO();
  return {
    caseId,
    entries: [
      { id: generateId(), phase: startingPhase, startedAt: now, notes: "" },
    ],
    updatedAt: now,
  };
}

export function currentPhase(history: CasePhaseHistory): PhaseEntry | null {
  // Latest entry with no closedAt is the current phase.
  const open = history.entries.filter((e) => !e.closedAt);
  if (open.length === 0) return null;
  return open[open.length - 1];
}

export function transitionTo(
  history: CasePhaseHistory,
  phase: TherapyPhase,
  notes: string = ""
): CasePhaseHistory {
  const now = nowISO();
  const closedEntries = history.entries.map((e) =>
    e.closedAt ? e : { ...e, closedAt: now }
  );
  return {
    ...history,
    entries: [
      ...closedEntries,
      { id: generateId(), phase, startedAt: now, notes },
    ],
    updatedAt: now,
  };
}

export function updateCurrentPhaseNotes(
  history: CasePhaseHistory,
  notes: string
): CasePhaseHistory {
  const current = currentPhase(history);
  if (!current) return history;
  return {
    ...history,
    entries: history.entries.map((e) =>
      e.id === current.id ? { ...e, notes } : e
    ),
    updatedAt: nowISO(),
  };
}

// How long the case has been in the current phase (in days). Used by the
// UI for the "X days in stabilization" indicator.
export function daysInCurrentPhase(
  history: CasePhaseHistory,
  today: string = new Date().toISOString().split("T")[0]
): number {
  const current = currentPhase(history);
  if (!current) return 0;
  const start = new Date(current.startedAt);
  const todayDate = new Date(today + "T00:00:00Z");
  return Math.max(
    0,
    Math.floor((todayDate.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  );
}
