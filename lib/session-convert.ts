// Convert a SessionPlan (pre-session intent) into a SessionNote draft
// (post-session record). Pure function — no I/O, no React.

import { generateId, nowISO } from "@/lib/store";

export interface ConvertablePlan {
  id: string;
  caseId: string;
  date: string;
  time?: string;
  goals?: string[];
  questionsToAsk?: string[];
  toolsToUse?: string[];
  interventionToTry?: string[];
  followUpFromLast?: string;
  supervisorInstructions?: string;
  riskReminders?: string;
  materialsNeeded?: string[];
  worksheetsToGive?: string[];
  postSessionNotes?: string;
}

export interface SessionNoteDraft {
  id: string;
  sourcePlanId: string;
  caseId: string;
  date: string;
  time: string;

  // Mirrors the planner sections so the user can confirm what happened.
  plannedGoals: string[];
  completedGoals: string[];

  questionsAsked: string[];
  interventionsUsed: string[];

  observations: string;
  clientResponse: string;
  followUpItems: string[];

  reflection: string;
  supervisionFlags: string[];

  carriedOverNotes: string;
  createdAt: string;
  updatedAt: string;
}

// Returns true if the plan represents enough state for a useful
// conversion. We don't *require* completion — drafts can be created
// from any plan — but we do require an id, a caseId, and a date.
export function canConvertPlan(plan: Partial<ConvertablePlan>): boolean {
  if (!plan) return false;
  if (!plan.id) return false;
  if (!plan.caseId) return false;
  if (!plan.date) return false;
  return true;
}

export function convertPlanToNote(plan: ConvertablePlan): SessionNoteDraft {
  if (!canConvertPlan(plan)) {
    throw new Error(
      "Cannot convert plan: missing id, caseId, or date."
    );
  }
  const now = nowISO();
  const interventions = [
    ...(plan.interventionToTry ?? []),
    ...(plan.toolsToUse ?? []),
  ];
  // De-duplicate while preserving order.
  const seen = new Set<string>();
  const dedupedInterventions = interventions.filter((x) => {
    const key = x.trim().toLowerCase();
    if (!key) return false;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const carryOver = [
    plan.followUpFromLast && `Carried over from last session: ${plan.followUpFromLast}`,
    plan.supervisorInstructions && `Supervisor instructions: ${plan.supervisorInstructions}`,
    plan.riskReminders && `Risk / safety: ${plan.riskReminders}`,
  ]
    .filter(Boolean)
    .join("\n");

  const supervisionFlags: string[] = [];
  if (plan.supervisorInstructions?.trim()) {
    supervisionFlags.push("supervisor instructions to confirm");
  }
  if (plan.riskReminders?.trim()) {
    supervisionFlags.push("risk reminders reviewed");
  }

  return {
    id: generateId(),
    sourcePlanId: plan.id,
    caseId: plan.caseId,
    date: plan.date,
    time: plan.time ?? "",
    plannedGoals: [...(plan.goals ?? [])],
    completedGoals: [], // user fills in
    questionsAsked: [...(plan.questionsToAsk ?? [])],
    interventionsUsed: dedupedInterventions,
    observations: plan.postSessionNotes?.trim() ?? "",
    clientResponse: "",
    followUpItems: [],
    reflection: "",
    supervisionFlags,
    carriedOverNotes: carryOver,
    createdAt: now,
    updatedAt: now,
  };
}

// Marks each completed goal in the draft. Returns a new draft.
export function markGoalCompleted(
  draft: SessionNoteDraft,
  goal: string,
  completed: boolean
): SessionNoteDraft {
  const set = new Set(draft.completedGoals);
  if (completed) set.add(goal);
  else set.delete(goal);
  return {
    ...draft,
    completedGoals: draft.plannedGoals.filter((g) => set.has(g)),
    updatedAt: nowISO(),
  };
}

// Convenience: did the user complete all planned goals?
export function isFullyCompleted(draft: SessionNoteDraft): boolean {
  if (draft.plannedGoals.length === 0) return false;
  return draft.completedGoals.length === draft.plannedGoals.length;
}
