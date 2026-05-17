// Longitudinal Tracking — pure helpers that turn raw events into chart
// data. Built around assessment administrations and any time-stamped
// symptom record. The UI plugs the output into recharts (or any chart).

import type {
  AssessmentAdministration,
  AssessmentDefinition,
} from "@/lib/clinical/assessments";

export interface SeriesPoint {
  date: string;
  value: number;
  label?: string;
  severity?: string | null;
  meta?: Record<string, unknown>;
}

export interface NamedSeries {
  id: string;
  label: string;
  color?: string;
  points: SeriesPoint[];
}

export interface OverlayMarker {
  date: string;
  label: string;
  kind: "intervention" | "milestone" | "assessment" | "session" | "note";
  color?: string;
}

// ─── Assessment-derived series ──────────────────────────────────

export function totalScoreSeries(
  admins: AssessmentAdministration[],
  def: AssessmentDefinition
): NamedSeries {
  const ordered = [...admins]
    .filter((a) => a.assessmentId === def.id)
    .sort((a, b) => a.date.localeCompare(b.date));
  return {
    id: def.id,
    label: def.code,
    points: ordered.map((a) => ({
      date: a.date,
      value: a.score.total,
      severity: a.score.severity,
    })),
  };
}

export function subscaleSeries(
  admins: AssessmentAdministration[],
  def: AssessmentDefinition
): NamedSeries[] {
  if (!def.subscales) return [];
  const ordered = [...admins]
    .filter((a) => a.assessmentId === def.id)
    .sort((a, b) => a.date.localeCompare(b.date));
  return def.subscales.map((s) => ({
    id: `${def.id}:${s.id}`,
    label: `${def.code} · ${s.label}`,
    points: ordered.map((a) => {
      const sub = a.score.subscales?.find((x) => x.id === s.id);
      return {
        date: a.date,
        value: sub?.score ?? 0,
        severity: sub?.severity ?? null,
      };
    }),
  }));
}

// ─── Period comparison ──────────────────────────────────────────

export interface PeriodSummary {
  start: string;
  end: string;
  count: number;
  mean: number | null;
  min: number | null;
  max: number | null;
}

function inRange(date: string, start: string, end: string): boolean {
  return date >= start && date <= end;
}

export function summarizePeriod(
  series: NamedSeries,
  start: string,
  end: string
): PeriodSummary {
  const points = series.points.filter((p) => inRange(p.date, start, end));
  if (points.length === 0) {
    return { start, end, count: 0, mean: null, min: null, max: null };
  }
  const vals = points.map((p) => p.value);
  return {
    start,
    end,
    count: points.length,
    mean: vals.reduce((a, b) => a + b, 0) / vals.length,
    min: Math.min(...vals),
    max: Math.max(...vals),
  };
}

// Compute change between two periods. Returns delta and direction.
export interface PeriodComparison {
  before: PeriodSummary;
  after: PeriodSummary;
  delta: number | null;
  direction: "improved" | "worsened" | "stable" | "unknown";
  // Improvement direction differs by instrument (higher score = worse for PHQ-9).
  // The caller passes higherIsWorse so the helper knows what improvement means.
}

export function comparePeriods(
  series: NamedSeries,
  before: { start: string; end: string },
  after: { start: string; end: string },
  opts: { higherIsWorse?: boolean; stableThreshold?: number } = {}
): PeriodComparison {
  const b = summarizePeriod(series, before.start, before.end);
  const a = summarizePeriod(series, after.start, after.end);
  const higherIsWorse = opts.higherIsWorse ?? true;
  const stableThreshold = opts.stableThreshold ?? 1;
  if (b.mean === null || a.mean === null) {
    return { before: b, after: a, delta: null, direction: "unknown" };
  }
  const delta = a.mean - b.mean;
  let direction: PeriodComparison["direction"];
  if (Math.abs(delta) <= stableThreshold) direction = "stable";
  else if (delta > 0) direction = higherIsWorse ? "worsened" : "improved";
  else direction = higherIsWorse ? "improved" : "worsened";
  return { before: b, after: a, delta, direction };
}

// ─── Overlay markers (interventions / sessions / milestones) ───

export interface OverlaySource {
  interventions?: Array<{ id: string; date: string; name: string }>;
  sessions?: Array<{ id: string; date: string; topic?: string }>;
  milestones?: Array<{ id: string; date: string; label: string }>;
  assessmentAdministrations?: AssessmentAdministration[];
  notes?: Array<{ id: string; date: string; label: string }>;
}

export function buildOverlayMarkers(s: OverlaySource): OverlayMarker[] {
  const out: OverlayMarker[] = [];
  for (const i of s.interventions ?? []) {
    out.push({ date: i.date, label: i.name, kind: "intervention", color: "#14B8A6" });
  }
  for (const ses of s.sessions ?? []) {
    out.push({
      date: ses.date,
      label: ses.topic ? `Session: ${ses.topic}` : "Session",
      kind: "session",
      color: "#10B981",
    });
  }
  for (const m of s.milestones ?? []) {
    out.push({ date: m.date, label: m.label, kind: "milestone", color: "#F59E0B" });
  }
  for (const a of s.assessmentAdministrations ?? []) {
    out.push({
      date: a.date,
      label: `Assessment recorded`,
      kind: "assessment",
      color: "#EC4899",
    });
  }
  for (const n of s.notes ?? []) {
    out.push({ date: n.date, label: n.label, kind: "note", color: "#94A3B8" });
  }
  return out.sort((a, b) => a.date.localeCompare(b.date));
}

// ─── Cross-domain longitudinal aggregate ────────────────────────

// Builds a single set of NamedSeries from heterogeneous symptom records.
// Useful for the "evolution" view that overlays anxiety + depression +
// dissociation + sleep + mood + engagement.
export interface SymptomRecord {
  date: string;
  domain: string;
  value: number;
  caseId?: string;
  source?: string;
}

export function symptomSeriesByDomain(
  records: SymptomRecord[],
  domains: string[]
): NamedSeries[] {
  return domains.map((d) => ({
    id: d,
    label: d,
    points: records
      .filter((r) => r.domain === d)
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((r) => ({ date: r.date, value: r.value })),
  }));
}
