// Session Objectives — pre-session prep panel per upcoming session.
// Pure shape + helpers; persisted in localStorage by the UI.

import { generateId, nowISO } from "@/lib/store";

export interface SessionObjectiveSet {
  id: string;
  caseId: string;
  // ISO date YYYY-MM-DD of the session this prep is for.
  date: string;
  objectives: string[];
  unresolvedThemes: string[];
  followUpPoints: string[];
  interventionIdeas: string[];
  assessmentsToReview: string[];
  workbookDiscussion: string[];
  supervisionReminders: string[];
  emotionalThemes: string[];
  observations: string;
  used: boolean; // marked true after the session
  createdAt: string;
  updatedAt: string;
}

export const SESSION_OBJECTIVES_STORAGE_KEY = "psych-session-objectives-v1";

export function emptyObjectiveSet(
  caseId: string,
  date: string = new Date().toISOString().split("T")[0]
): SessionObjectiveSet {
  const now = nowISO();
  return {
    id: generateId(),
    caseId,
    date,
    objectives: [],
    unresolvedThemes: [],
    followUpPoints: [],
    interventionIdeas: [],
    assessmentsToReview: [],
    workbookDiscussion: [],
    supervisionReminders: [],
    emotionalThemes: [],
    observations: "",
    used: false,
    createdAt: now,
    updatedAt: now,
  };
}

// Bullet-style fields edited as one-per-line strings in the UI. This
// helper turns those strings into the canonical string[] shape.
export function linesToList(text: string): string[] {
  return text
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function update(
  set: SessionObjectiveSet,
  patch: Partial<SessionObjectiveSet>
): SessionObjectiveSet {
  return { ...set, ...patch, updatedAt: nowISO() };
}

// Reuse the most recent set's content as a starting point for the next
// session (e.g. if follow-up points carry over).
export function carryForward(
  previous: SessionObjectiveSet,
  newDate: string
): SessionObjectiveSet {
  const fresh = emptyObjectiveSet(previous.caseId, newDate);
  return {
    ...fresh,
    followUpPoints: [...previous.followUpPoints],
    unresolvedThemes: [...previous.unresolvedThemes],
    supervisionReminders: [...previous.supervisionReminders],
  };
}

// Returns the most recent objective set per case (or all of them) so the
// UI can scroll the prep history.
export function latestForCase(
  sets: SessionObjectiveSet[],
  caseId: string
): SessionObjectiveSet | null {
  const ours = sets
    .filter((s) => s.caseId === caseId)
    .sort((a, b) => b.date.localeCompare(a.date));
  return ours[0] ?? null;
}
