// "Last session at a glance" — pure helper that builds a one-card
// summary from the most recent session-related artefacts on a case.
// Pulls from session plans, post-session notes, check-ins, and
// supervision/reflection data the caller already has in memory.

export interface LastSessionInput {
  sessions?: Array<{
    id: string;
    caseId: string;
    date: string;
    mainTopics?: string;
    observations?: string;
    interventions?: string;
    nextSteps?: string;
  }>;
  sessionPlans?: Array<{
    id: string;
    caseId: string;
    date: string;
    status?: string;
    postSessionNotes?: string;
    goals?: string[];
    worksheetsToGive?: string[];
    riskReminders?: string;
  }>;
  checkIns?: Array<{
    id: string;
    caseId: string;
    date: string;
    moodAffect?: string;
    followUpNeeded?: boolean;
    followUpNote?: string;
  }>;
}

export interface LastSessionSummary {
  date: string | null;
  topic: string;
  emotionalThemes: string;
  interventionsUsed: string;
  assignedWork: string[];
  unresolvedTopics: string;
  symptomChanges: string;
  riskUpdate: string;
  nextSessionFocus: string;
}

function pickLatest<T extends { caseId: string; date: string }>(
  arr: T[] | undefined,
  caseId: string
): T | null {
  if (!arr) return null;
  const filtered = arr
    .filter((x) => x.caseId === caseId)
    .sort((a, b) => b.date.localeCompare(a.date));
  return filtered[0] ?? null;
}

export function buildLastSessionSummary(
  caseId: string,
  input: LastSessionInput
): LastSessionSummary {
  const lastSession = pickLatest(input.sessions, caseId);
  const lastPlan = pickLatest(input.sessionPlans, caseId);
  const recentCheckIns = (input.checkIns ?? [])
    .filter((c) => c.caseId === caseId)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 3);

  // Choose the most recent date from session or plan.
  const date =
    lastSession && lastPlan
      ? lastSession.date >= lastPlan.date
        ? lastSession.date
        : lastPlan.date
      : lastSession?.date ?? lastPlan?.date ?? null;

  const topic = lastSession?.mainTopics ?? "—";
  const interventionsUsed = lastSession?.interventions ?? "";
  const assignedWork = lastPlan?.worksheetsToGive ?? [];
  const nextSessionFocus = lastSession?.nextSteps ?? "";
  const emotionalThemes =
    lastPlan?.postSessionNotes ?? lastSession?.observations ?? "";
  const unresolvedTopics =
    lastPlan?.goals && lastPlan.goals.length > 0
      ? lastPlan.goals.join(" · ")
      : "";
  const riskUpdate = lastPlan?.riskReminders ?? "";

  const symptomChanges =
    recentCheckIns.length > 0
      ? recentCheckIns
          .map((c) => `${c.date}: ${c.moodAffect ?? "(no mood note)"}`)
          .join("\n")
      : "";

  return {
    date,
    topic,
    emotionalThemes,
    interventionsUsed,
    assignedWork,
    unresolvedTopics,
    symptomChanges,
    riskUpdate,
    nextSessionFocus,
  };
}
