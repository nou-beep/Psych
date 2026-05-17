// Case Timeline V2 — pure aggregation of timeline events from all sources
// the case touches. Returns a sorted, groupable list of TimelineEvent.

export type TimelineEventType =
  | "check-in"
  | "weekly-review"
  | "monthly-review"
  | "session-plan"
  | "session"
  | "assessment"
  | "supervision"
  | "reflection"
  | "intervention"
  | "transcript"
  | "audio-note"
  | "report"
  | "workbook"
  | "goal"
  | "ethics";

export interface TimelineEvent {
  id: string;
  type: TimelineEventType;
  date: string; // ISO date YYYY-MM-DD
  title: string;
  detail?: string;
  sourceId: string;
  caseId: string;
  isMilestone?: boolean;
  tags?: string[];
}

export interface TimelineSources {
  caseId: string;
  checkIns?: Array<{
    id: string;
    caseId: string;
    date: string;
    moodAffect?: string;
    followUpNeeded?: boolean;
  }>;
  weeklyReviews?: Array<{
    id: string;
    caseId: string;
    weekStart: string;
    weekEnd?: string;
    mainProgress?: string;
  }>;
  monthlyReviews?: Array<{
    id: string;
    caseId: string;
    month: string;
    overallEvolution?: string;
  }>;
  sessionPlans?: Array<{
    id: string;
    caseId: string;
    date: string;
    status?: string;
    goals?: string[];
  }>;
  sessions?: Array<{
    id: string;
    caseId: string;
    date: string;
    topic?: string;
  }>;
  assessments?: Array<{
    id: string;
    caseId?: string;
    title: string;
    lastCompleted?: string | null;
    scoreStatus?: string;
  }>;
  supervisionNotes?: Array<{
    id: string;
    caseId: string;
    date: string;
    mainTopics?: string;
  }>;
  reflections?: Array<{
    id: string;
    linkedCaseId: string;
    date: string;
    whatLearned?: string;
  }>;
  interventions?: Array<{
    id: string;
    caseId: string;
    date: string;
    name: string;
    effectiveness?: number;
  }>;
  transcripts?: Array<{
    id: string;
    caseId?: string;
    title: string;
    createdAt: string;
  }>;
  audioNotes?: Array<{
    id: string;
    linkedType?: string;
    linkedId?: string;
    name: string;
    createdAt: string;
  }>;
  goals?: Array<{
    id: string;
    caseId?: string;
    title: string;
    status?: string;
    updatedAt?: string;
    createdAt?: string;
  }>;
  workbooks?: Array<{
    id: string;
    caseId?: string;
    title: string;
    createdAt?: string;
  }>;
  consent?: Array<{
    id: string;
    caseId: string;
    consentDate?: string;
    createdAt: string;
  }>;
  reports?: Array<{
    id: string;
    caseId: string;
    title: string;
    createdAt: string;
  }>;
}

function toDate(value: string | null | undefined): string | null {
  if (!value) return null;
  // Accept "YYYY-MM-DD" or ISO timestamps. Slice off the time portion.
  return value.split("T")[0];
}

export function buildTimeline(sources: TimelineSources): TimelineEvent[] {
  const events: TimelineEvent[] = [];
  const caseId = sources.caseId;

  (sources.checkIns ?? [])
    .filter((c) => c.caseId === caseId)
    .forEach((c) => {
      const date = toDate(c.date);
      if (!date) return;
      events.push({
        id: `chk-${c.id}`,
        type: "check-in",
        date,
        title: "Daily check-in",
        detail: c.moodAffect,
        sourceId: c.id,
        caseId,
        isMilestone: !!c.followUpNeeded,
      });
    });

  (sources.weeklyReviews ?? [])
    .filter((w) => w.caseId === caseId)
    .forEach((w) => {
      const date = toDate(w.weekStart);
      if (!date) return;
      events.push({
        id: `wk-${w.id}`,
        type: "weekly-review",
        date,
        title: `Weekly review (${w.weekStart}${w.weekEnd ? ` → ${w.weekEnd}` : ""})`,
        detail: w.mainProgress,
        sourceId: w.id,
        caseId,
      });
    });

  (sources.monthlyReviews ?? [])
    .filter((m) => m.caseId === caseId)
    .forEach((m) => {
      const date = toDate(m.month);
      if (!date) return;
      events.push({
        id: `mo-${m.id}`,
        type: "monthly-review",
        date,
        title: `Monthly review — ${m.month}`,
        detail: m.overallEvolution,
        sourceId: m.id,
        caseId,
        isMilestone: true,
      });
    });

  (sources.sessionPlans ?? [])
    .filter((p) => p.caseId === caseId)
    .forEach((p) => {
      const date = toDate(p.date);
      if (!date) return;
      events.push({
        id: `pln-${p.id}`,
        type: "session-plan",
        date,
        title: `Session plan${p.status ? ` (${p.status})` : ""}`,
        detail: p.goals?.join(" · "),
        sourceId: p.id,
        caseId,
      });
    });

  (sources.sessions ?? [])
    .filter((s) => s.caseId === caseId)
    .forEach((s) => {
      const date = toDate(s.date);
      if (!date) return;
      events.push({
        id: `ses-${s.id}`,
        type: "session",
        date,
        title: s.topic ? `Session: ${s.topic}` : "Session",
        sourceId: s.id,
        caseId,
      });
    });

  (sources.assessments ?? [])
    .filter((a) => !a.caseId || a.caseId === caseId)
    .forEach((a) => {
      const date = toDate(a.lastCompleted);
      if (!date) return;
      events.push({
        id: `ass-${a.id}`,
        type: "assessment",
        date,
        title: `Assessment: ${a.title}`,
        detail: a.scoreStatus,
        sourceId: a.id,
        caseId,
        isMilestone: a.scoreStatus === "Complete",
      });
    });

  (sources.supervisionNotes ?? [])
    .filter((s) => s.caseId === caseId)
    .forEach((s) => {
      const date = toDate(s.date);
      if (!date) return;
      events.push({
        id: `sup-${s.id}`,
        type: "supervision",
        date,
        title: "Supervision",
        detail: s.mainTopics,
        sourceId: s.id,
        caseId,
      });
    });

  (sources.reflections ?? [])
    .filter((r) => r.linkedCaseId === caseId)
    .forEach((r) => {
      const date = toDate(r.date);
      if (!date) return;
      events.push({
        id: `ref-${r.id}`,
        type: "reflection",
        date,
        title: "Clinical reflection",
        detail: r.whatLearned,
        sourceId: r.id,
        caseId,
      });
    });

  (sources.interventions ?? [])
    .filter((i) => i.caseId === caseId)
    .forEach((i) => {
      const date = toDate(i.date);
      if (!date) return;
      events.push({
        id: `int-${i.id}`,
        type: "intervention",
        date,
        title: `Intervention: ${i.name}`,
        detail:
          typeof i.effectiveness === "number"
            ? `Effectiveness ${i.effectiveness}/5`
            : undefined,
        sourceId: i.id,
        caseId,
        isMilestone:
          typeof i.effectiveness === "number" && i.effectiveness >= 4,
      });
    });

  (sources.transcripts ?? [])
    .filter((t) => t.caseId === caseId)
    .forEach((t) => {
      const date = toDate(t.createdAt);
      if (!date) return;
      events.push({
        id: `tr-${t.id}`,
        type: "transcript",
        date,
        title: `Transcript: ${t.title}`,
        sourceId: t.id,
        caseId,
      });
    });

  (sources.audioNotes ?? [])
    .filter((a) => a.linkedType === "case" && a.linkedId === caseId)
    .forEach((a) => {
      const date = toDate(a.createdAt);
      if (!date) return;
      events.push({
        id: `au-${a.id}`,
        type: "audio-note",
        date,
        title: `Audio note: ${a.name}`,
        sourceId: a.id,
        caseId,
      });
    });

  (sources.goals ?? [])
    .filter((g) => g.caseId === caseId)
    .forEach((g) => {
      const date = toDate(g.updatedAt ?? g.createdAt);
      if (!date) return;
      events.push({
        id: `goal-${g.id}`,
        type: "goal",
        date,
        title: `Goal: ${g.title}`,
        detail: g.status,
        sourceId: g.id,
        caseId,
        isMilestone: g.status === "achieved",
      });
    });

  (sources.workbooks ?? [])
    .filter((w) => w.caseId === caseId)
    .forEach((w) => {
      const date = toDate(w.createdAt);
      if (!date) return;
      events.push({
        id: `wb-${w.id}`,
        type: "workbook",
        date,
        title: `Workbook: ${w.title}`,
        sourceId: w.id,
        caseId,
      });
    });

  (sources.consent ?? [])
    .filter((c) => c.caseId === caseId)
    .forEach((c) => {
      const date = toDate(c.consentDate ?? c.createdAt);
      if (!date) return;
      events.push({
        id: `eth-${c.id}`,
        type: "ethics",
        date,
        title: "Ethics / consent event",
        sourceId: c.id,
        caseId,
      });
    });

  (sources.reports ?? [])
    .filter((r) => r.caseId === caseId)
    .forEach((r) => {
      const date = toDate(r.createdAt);
      if (!date) return;
      events.push({
        id: `rep-${r.id}`,
        type: "report",
        date,
        title: `Report: ${r.title}`,
        sourceId: r.id,
        caseId,
        isMilestone: true,
      });
    });

  // Newest first — narrative reads naturally with most recent at top.
  return events.sort((a, b) => b.date.localeCompare(a.date));
}

export function groupTimelineByMonth(
  events: TimelineEvent[]
): Array<{ month: string; events: TimelineEvent[] }> {
  const groups = new Map<string, TimelineEvent[]>();
  for (const ev of events) {
    const key = ev.date.slice(0, 7); // "YYYY-MM"
    const list = groups.get(key) ?? [];
    list.push(ev);
    groups.set(key, list);
  }
  return Array.from(groups.entries())
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([month, evs]) => ({ month, events: evs }));
}

export function filterTimeline(
  events: TimelineEvent[],
  opts: { types?: TimelineEventType[]; search?: string }
): TimelineEvent[] {
  const types = opts.types && opts.types.length ? new Set(opts.types) : null;
  const q = opts.search?.trim().toLowerCase() ?? "";
  return events.filter((ev) => {
    if (types && !types.has(ev.type)) return false;
    if (q) {
      const hay = `${ev.title} ${ev.detail ?? ""}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}
