// Default evaluator profile for the Internship Studio.
//
// Hard-coded default per the user brief; can be overridden at
// runtime via localStorage. The UI reads `loadEvaluator()` and the
// scoring surfaces pre-fill from it. Supervision notes keep their
// own "supervisor" field separate — that's the senior clinician,
// not the evaluator.

import { loadFromStorage, saveToStorage } from "@/lib/store";

export interface EvaluatorProfile {
  name: string;
  role: string;
}

export const DEFAULT_EVALUATOR: EvaluatorProfile = {
  name: "Nouhaila Mrini",
  role: "Psychologue / Thérapeute stagiaire",
};

export const INTERNSHIP_EVALUATOR_STORAGE_KEY =
  "psych-internship-evaluator-v1";

export function loadEvaluator(): EvaluatorProfile {
  const stored = loadFromStorage<EvaluatorProfile | null>(
    INTERNSHIP_EVALUATOR_STORAGE_KEY,
    null
  );
  if (stored && typeof stored.name === "string" && stored.name.trim()) {
    return {
      name: stored.name,
      role: stored.role || DEFAULT_EVALUATOR.role,
    };
  }
  return DEFAULT_EVALUATOR;
}

export function saveEvaluator(profile: EvaluatorProfile): void {
  saveToStorage(INTERNSHIP_EVALUATOR_STORAGE_KEY, profile);
}

// Convenient short signature for printables ("Nouhaila Mrini ·
// Psychologue / Thérapeute stagiaire").
export function evaluatorSignature(profile: EvaluatorProfile): string {
  return profile.role
    ? `${profile.name} · ${profile.role}`
    : profile.name;
}
