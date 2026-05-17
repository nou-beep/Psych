// Client tracking — scientifically grounded daily entries the client
// fills in. Stored locally; the therapist can later be granted view
// access via assignments. Domains intentionally cover the symptoms the
// platform supports (anxiety, mood, sleep, regulation, dissociation,
// stress) plus homework completion.
//
// Pure data + small helpers. No streaks, no achievements, no gamification.

import { generateId, nowISO } from "@/lib/store";

export type TrackingDomain =
  | "anxiety"
  | "mood"
  | "sleep"
  | "regulation"
  | "dissociation"
  | "stress";

export const TRACKING_DOMAINS: Array<{
  id: TrackingDomain;
  label: string;
  scaleLabel: string;
  hint: string;
  higherIsWorse: boolean;
}> = [
  { id: "anxiety", label: "Anxiety", scaleLabel: "0 calm — 10 intense", hint: "How loud was anxiety today?", higherIsWorse: true },
  { id: "mood", label: "Mood", scaleLabel: "0 very low — 10 very well", hint: "Overall mood today.", higherIsWorse: false },
  { id: "sleep", label: "Sleep quality", scaleLabel: "0 poor — 10 restorative", hint: "How restorative was last night?", higherIsWorse: false },
  { id: "regulation", label: "Emotional regulation", scaleLabel: "0 reactive — 10 grounded", hint: "How able to ride waves today?", higherIsWorse: false },
  { id: "dissociation", label: "Dissociation", scaleLabel: "0 absent — 10 frequent", hint: "How present did you feel today?", higherIsWorse: true },
  { id: "stress", label: "Stress", scaleLabel: "0 quiet — 10 overwhelming", hint: "Overall stress today.", higherIsWorse: true },
];

export interface ClientTrackingEntry {
  id: string;
  date: string; // YYYY-MM-DD
  scores: Partial<Record<TrackingDomain, number>>;
  homeworkCompleted: boolean | null;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export const TRACKING_STORAGE_KEY = "psych-client-tracking-v1";

export function emptyEntry(date?: string): ClientTrackingEntry {
  const d = date ?? new Date().toISOString().split("T")[0];
  const now = nowISO();
  return {
    id: generateId(),
    date: d,
    scores: {},
    homeworkCompleted: null,
    notes: "",
    createdAt: now,
    updatedAt: now,
  };
}

export function setScore(
  entry: ClientTrackingEntry,
  domain: TrackingDomain,
  value: number | null
): ClientTrackingEntry {
  const next = { ...entry.scores };
  if (value === null) {
    delete next[domain];
  } else {
    next[domain] = Math.min(10, Math.max(0, Math.round(value)));
  }
  return { ...entry, scores: next, updatedAt: nowISO() };
}

export function setHomework(
  entry: ClientTrackingEntry,
  completed: boolean | null
): ClientTrackingEntry {
  return { ...entry, homeworkCompleted: completed, updatedAt: nowISO() };
}

export interface TrackingSeries {
  domain: TrackingDomain;
  label: string;
  points: Array<{ date: string; value: number }>;
}

export function buildSeries(
  entries: ClientTrackingEntry[],
  domain: TrackingDomain
): TrackingSeries {
  const points = entries
    .filter((e) => typeof e.scores[domain] === "number")
    .map((e) => ({ date: e.date, value: e.scores[domain] as number }))
    .sort((a, b) => a.date.localeCompare(b.date));
  const meta = TRACKING_DOMAINS.find((d) => d.id === domain)!;
  return { domain, label: meta.label, points };
}

export function homeworkCompletionRate(
  entries: ClientTrackingEntry[],
  windowDays: number = 30
): { rate: number | null; numerator: number; denominator: number } {
  const today = new Date();
  const cutoff = new Date(today);
  cutoff.setDate(today.getDate() - windowDays);
  const cutoffStr = cutoff.toISOString().split("T")[0];
  const inWindow = entries.filter(
    (e) => e.date >= cutoffStr && e.homeworkCompleted !== null
  );
  const numerator = inWindow.filter((e) => e.homeworkCompleted).length;
  const denominator = inWindow.length;
  if (denominator === 0) return { rate: null, numerator, denominator };
  return { rate: numerator / denominator, numerator, denominator };
}

// Domain averages across a window — used by the Progress overview.
export function domainAverages(
  entries: ClientTrackingEntry[],
  windowDays: number = 14
): Record<TrackingDomain, number | null> {
  const today = new Date();
  const cutoff = new Date(today);
  cutoff.setDate(today.getDate() - windowDays);
  const cutoffStr = cutoff.toISOString().split("T")[0];
  const out: Record<string, number | null> = {};
  for (const d of TRACKING_DOMAINS) {
    const values = entries
      .filter((e) => e.date >= cutoffStr)
      .map((e) => e.scores[d.id])
      .filter((v): v is number => typeof v === "number");
    out[d.id] = values.length
      ? Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10
      : null;
  }
  return out as Record<TrackingDomain, number | null>;
}
