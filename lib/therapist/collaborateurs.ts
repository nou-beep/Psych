// Collaborateurs — the workplace-psychology caseload model. One
// clinician supporting a company's employees; each employee is one
// dossier. No employee logins — the clinician records everything.
//
// Design rules (same as the rest of Eyla):
// - Every sub-item is its own record with id + date, never a text
//   blob — so later report generation can cite the record it used.
// - Pure functions only; React state lives in
//   contexts/CollaborateurContext.tsx. Storage: eyla-collaborateurs-v1.
// - Every aggregate is DETERMINISTIC arithmetic over entered records.
//   No fabricated numbers, no causal claims — the dashboard shows
//   the data; interpretation stays with the clinician.
// - Séances reuse lib/internship/seance.ts with context 'therapist'
//   and dossierId = collaborateur.id. Working memory reuses
//   session-memory keyed the same way.

import {
  generateId,
  loadFromStorage,
  nowISO,
  saveToStorage,
} from "@/lib/store";

export const COLLABORATEURS_STORAGE_KEY = "eyla-collaborateurs-v1";

// ─── Types ────────────────────────────────────────────────────

export type CollaborateurStatus = "actif" | "surveille" | "clos";
export const COLLABORATEUR_STATUSES: ReadonlyArray<CollaborateurStatus> = [
  "actif",
  "surveille",
  "clos",
] as const;

export type RiskLevel = "ok" | "watch" | "high";
export const RISK_LEVELS: ReadonlyArray<RiskLevel> = [
  "ok",
  "watch",
  "high",
] as const;

export type ContactChannel = "call" | "sms" | "whatsapp" | "inperson";
export const CONTACT_CHANNELS: ReadonlyArray<ContactChannel> = [
  "call",
  "sms",
  "whatsapp",
  "inperson",
] as const;

export interface MoodEntry {
  id: string;
  date: string; // ISO yyyy-mm-dd
  /** Global functioning 0–10 (10 = fully functioning). */
  functioning: number;
  note?: string;
}

export interface RiskEntry {
  id: string;
  date: string;
  flightRisk: RiskLevel;
  burnoutRisk: RiskLevel;
  note?: string;
}

export interface AbsenceEntry {
  id: string;
  date: string;
  days: number;
  reason?: string;
}

export interface Departure {
  date: string;
  reason?: string;
}

export interface Assignment {
  id: string;
  /** Either a WORKSHEET_LIBRARY id or free text — one of the two. */
  worksheetId?: string;
  text?: string;
  dueDate?: string;
  done: boolean;
}

export interface CaseResource {
  id: string;
  label: string;
  note?: string;
}

export interface CheckIn {
  id: string;
  date: string;
  channel: ContactChannel;
  summary: string;
  /** How they seemed — clinician's short impression, optional. */
  seemed?: string;
}

export interface Collaborateur {
  id: string;
  createdAt: string;
  updatedAt: string;
  /** Display name OR an anonymised code — clinician's choice. */
  displayName: string;
  team: string;
  role: string;
  manager?: string;
  status: CollaborateurStatus;
  /** Demo records are unmistakably separate from real ones. */
  isSample: boolean;
  moodEntries: MoodEntry[];
  riskEntries: RiskEntry[];
  absenceEntries: AbsenceEntry[];
  departure: Departure | null;
  assignments: Assignment[];
  resources: CaseResource[];
  checkIns: CheckIn[];
}

// ─── Factory + CRUD (pure, list → list) ───────────────────────

export function newCollaborateur(input: {
  displayName: string;
  team: string;
  role: string;
  manager?: string;
  isSample?: boolean;
}): Collaborateur {
  const now = nowISO();
  return {
    id: generateId(),
    createdAt: now,
    updatedAt: now,
    displayName: input.displayName,
    team: input.team,
    role: input.role,
    manager: input.manager,
    status: "actif",
    isSample: input.isSample ?? false,
    moodEntries: [],
    riskEntries: [],
    absenceEntries: [],
    departure: null,
    assignments: [],
    resources: [],
    checkIns: [],
  };
}

function touch(c: Collaborateur): Collaborateur {
  return { ...c, updatedAt: nowISO() };
}

function mapCollab(
  list: Collaborateur[],
  id: string,
  fn: (c: Collaborateur) => Collaborateur
): Collaborateur[] {
  return list.map((c) => (c.id === id ? touch(fn(c)) : c));
}

export function addCollaborateur(
  list: Collaborateur[],
  c: Collaborateur
): Collaborateur[] {
  return [c, ...list];
}

export function patchCollaborateur(
  list: Collaborateur[],
  id: string,
  patch: Partial<
    Pick<
      Collaborateur,
      "displayName" | "team" | "role" | "manager" | "status"
    >
  >
): Collaborateur[] {
  return mapCollab(list, id, (c) => ({ ...c, ...patch }));
}

export function addMoodEntry(
  list: Collaborateur[],
  id: string,
  input: { date: string; functioning: number; note?: string }
): Collaborateur[] {
  const entry: MoodEntry = { id: generateId(), ...input };
  return mapCollab(list, id, (c) => ({
    ...c,
    moodEntries: [...c.moodEntries, entry],
  }));
}

export function addRiskEntry(
  list: Collaborateur[],
  id: string,
  input: {
    date: string;
    flightRisk: RiskLevel;
    burnoutRisk: RiskLevel;
    note?: string;
  }
): Collaborateur[] {
  const entry: RiskEntry = { id: generateId(), ...input };
  return mapCollab(list, id, (c) => ({
    ...c,
    riskEntries: [...c.riskEntries, entry],
  }));
}

export function addAbsenceEntry(
  list: Collaborateur[],
  id: string,
  input: { date: string; days: number; reason?: string }
): Collaborateur[] {
  const entry: AbsenceEntry = { id: generateId(), ...input };
  return mapCollab(list, id, (c) => ({
    ...c,
    absenceEntries: [...c.absenceEntries, entry],
  }));
}

export function setDeparture(
  list: Collaborateur[],
  id: string,
  departure: Departure | null
): Collaborateur[] {
  return mapCollab(list, id, (c) => ({
    ...c,
    departure,
    // A departure closes the dossier; clearing it reactivates.
    status: departure ? "clos" : c.status === "clos" ? "actif" : c.status,
  }));
}

export function addAssignment(
  list: Collaborateur[],
  id: string,
  input: { worksheetId?: string; text?: string; dueDate?: string }
): Collaborateur[] {
  const a: Assignment = { id: generateId(), done: false, ...input };
  return mapCollab(list, id, (c) => ({
    ...c,
    assignments: [...c.assignments, a],
  }));
}

export function toggleAssignment(
  list: Collaborateur[],
  id: string,
  assignmentId: string
): Collaborateur[] {
  return mapCollab(list, id, (c) => ({
    ...c,
    assignments: c.assignments.map((a) =>
      a.id === assignmentId ? { ...a, done: !a.done } : a
    ),
  }));
}

export function removeAssignment(
  list: Collaborateur[],
  id: string,
  assignmentId: string
): Collaborateur[] {
  return mapCollab(list, id, (c) => ({
    ...c,
    assignments: c.assignments.filter((a) => a.id !== assignmentId),
  }));
}

export function addResource(
  list: Collaborateur[],
  id: string,
  input: { label: string; note?: string }
): Collaborateur[] {
  const r: CaseResource = { id: generateId(), ...input };
  return mapCollab(list, id, (c) => ({
    ...c,
    resources: [...c.resources, r],
  }));
}

export function removeResource(
  list: Collaborateur[],
  id: string,
  resourceId: string
): Collaborateur[] {
  return mapCollab(list, id, (c) => ({
    ...c,
    resources: c.resources.filter((r) => r.id !== resourceId),
  }));
}

export function addCheckIn(
  list: Collaborateur[],
  id: string,
  input: {
    date: string;
    channel: ContactChannel;
    summary: string;
    seemed?: string;
  }
): Collaborateur[] {
  const entry: CheckIn = { id: generateId(), ...input };
  return mapCollab(list, id, (c) => ({
    ...c,
    checkIns: [...c.checkIns, entry],
  }));
}

// ─── Risk helpers ─────────────────────────────────────────────

const RISK_SEVERITY: Record<RiskLevel, number> = {
  ok: 0,
  watch: 1,
  high: 2,
};

/** Latest risk entry by date (array order breaks same-date ties: last wins). */
export function latestRiskEntry(c: Collaborateur): RiskEntry | null {
  if (c.riskEntries.length === 0) return null;
  let best = c.riskEntries[0];
  for (const e of c.riskEntries) {
    if (e.date >= best.date) best = e;
  }
  return best;
}

/**
 * Current overall risk = the worse of flightRisk / burnoutRisk in the
 * latest entry. Null when no entry has been logged.
 */
export function currentRiskLevel(c: Collaborateur): RiskLevel | null {
  const latest = latestRiskEntry(c);
  if (!latest) return null;
  return RISK_SEVERITY[latest.flightRisk] >=
    RISK_SEVERITY[latest.burnoutRisk]
    ? latest.flightRisk
    : latest.burnoutRisk;
}

export interface RiskDistribution {
  high: number;
  watch: number;
  ok: number;
  /** Collaborateurs with no risk entry logged yet. */
  none: number;
  /** The non-clos collaborateurs currently at 'high'. */
  highList: Collaborateur[];
}

/**
 * Aperçu des risques — distribution over non-clos collaborateurs by
 * their current risk level.
 */
export function riskDistribution(
  list: Collaborateur[]
): RiskDistribution {
  const out: RiskDistribution = {
    high: 0,
    watch: 0,
    ok: 0,
    none: 0,
    highList: [],
  };
  for (const c of list) {
    if (c.status === "clos") continue;
    const level = currentRiskLevel(c);
    if (level === null) {
      out.none += 1;
    } else {
      out[level] += 1;
      if (level === "high") out.highList.push(c);
    }
  }
  return out;
}

// ─── Team climate ─────────────────────────────────────────────

function latestMood(c: Collaborateur): MoodEntry | null {
  if (c.moodEntries.length === 0) return null;
  let best = c.moodEntries[0];
  for (const e of c.moodEntries) {
    if (e.date >= best.date) best = e;
  }
  return best;
}

export interface TeamClimate {
  team: string;
  /** Average of each member's LATEST functioning score. Null if no data. */
  average: number | null;
  memberCount: number;
  scoredCount: number;
}

/** Climat par équipe — sorted alphabetically for stable rendering. */
export function teamClimate(list: Collaborateur[]): TeamClimate[] {
  const teams = new Map<string, { sum: number; scored: number; members: number }>();
  for (const c of list) {
    if (c.status === "clos") continue;
    const bucket = teams.get(c.team) ?? { sum: 0, scored: 0, members: 0 };
    bucket.members += 1;
    const mood = latestMood(c);
    if (mood) {
      bucket.sum += mood.functioning;
      bucket.scored += 1;
    }
    teams.set(c.team, bucket);
  }
  return Array.from(teams.entries())
    .map(([team, b]) => ({
      team,
      average: b.scored > 0 ? b.sum / b.scored : null,
      memberCount: b.members,
      scoredCount: b.scored,
    }))
    .sort((a, b) => a.team.localeCompare(b.team));
}

export interface TeamSeriesPoint {
  date: string;
  value: number;
}

export interface TeamSeries {
  team: string;
  points: TeamSeriesPoint[];
}

/**
 * Per-team trend: for each date on which at least one member logged a
 * mood entry, the average functioning across that team's entries on
 * that date. Points sorted ascending by date (chart-ready).
 */
export function teamClimateSeries(list: Collaborateur[]): TeamSeries[] {
  const perTeam = new Map<string, Map<string, { sum: number; n: number }>>();
  for (const c of list) {
    if (c.status === "clos") continue;
    let dates = perTeam.get(c.team);
    if (!dates) {
      dates = new Map();
      perTeam.set(c.team, dates);
    }
    for (const e of c.moodEntries) {
      const cell = dates.get(e.date) ?? { sum: 0, n: 0 };
      cell.sum += e.functioning;
      cell.n += 1;
      dates.set(e.date, cell);
    }
  }
  return Array.from(perTeam.entries())
    .map(([team, dates]) => ({
      team,
      points: Array.from(dates.entries())
        .map(([date, { sum, n }]) => ({ date, value: sum / n }))
        .sort((a, b) => a.date.localeCompare(b.date)),
    }))
    .sort((a, b) => a.team.localeCompare(b.team));
}

// ─── Retention & absence impact (deterministic only) ──────────

function inWindow(date: string, from: string, to: string): boolean {
  return date >= from && date <= to;
}

/** Total absence days across all collaborateurs within [from, to]. */
export function absenceTotal(
  list: Collaborateur[],
  from: string,
  to: string
): number {
  let total = 0;
  for (const c of list) {
    for (const a of c.absenceEntries) {
      if (inWindow(a.date, from, to)) total += a.days;
    }
  }
  return total;
}

/** Departures dated within [from, to]. */
export function departureCount(
  list: Collaborateur[],
  from: string,
  to: string
): number {
  let n = 0;
  for (const c of list) {
    if (c.departure && inWindow(c.departure.date, from, to)) n += 1;
  }
  return n;
}

/**
 * Count of collaborateurs whose overall risk IMPROVED across the
 * window: first in-window entry is strictly worse than the last
 * in-window entry. Needs ≥ 2 in-window entries. Each collaborateur
 * counts at most once.
 */
export function riskImprovedCount(
  list: Collaborateur[],
  from: string,
  to: string
): number {
  let n = 0;
  for (const c of list) {
    const entries = c.riskEntries
      .filter((e) => inWindow(e.date, from, to))
      .sort((a, b) => a.date.localeCompare(b.date));
    if (entries.length < 2) continue;
    const level = (e: RiskEntry): number =>
      Math.max(RISK_SEVERITY[e.flightRisk], RISK_SEVERITY[e.burnoutRisk]);
    if (level(entries[entries.length - 1]) < level(entries[0])) n += 1;
  }
  return n;
}

// ─── Rapport direction (anonymised) ───────────────────────────
// Management-facing aggregates ONLY. No names, no clinical notes,
// no per-individual rows. The builder returns numbers; the text
// renderer formats them deterministically.

export interface RapportDirection {
  generatedAt: string;
  windowFrom: string;
  windowTo: string;
  headcount: number; // non-clos collaborateurs
  risk: { high: number; watch: number; ok: number; none: number };
  climate: Array<{ team: string; average: number | null; memberCount: number }>;
  absenceDays: number;
  departures: number;
  riskImproved: number;
}

export function buildRapportDirection(
  list: Collaborateur[],
  window: { from: string; to: string },
  generatedAt: string = nowISO()
): RapportDirection {
  const dist = riskDistribution(list);
  return {
    generatedAt,
    windowFrom: window.from,
    windowTo: window.to,
    headcount: list.filter((c) => c.status !== "clos").length,
    risk: {
      high: dist.high,
      watch: dist.watch,
      ok: dist.ok,
      none: dist.none,
    },
    climate: teamClimate(list).map(({ team, average, memberCount }) => ({
      team,
      average,
      memberCount,
    })),
    absenceDays: absenceTotal(list, window.from, window.to),
    departures: departureCount(list, window.from, window.to),
    riskImproved: riskImprovedCount(list, window.from, window.to),
  };
}

export interface RapportLabels {
  title: string;
  window: string;
  headcount: string;
  riskHeading: string;
  riskHigh: string;
  riskWatch: string;
  riskOk: string;
  riskNone: string;
  climateHeading: string;
  climateNoData: string;
  membersSuffix: string;
  absenceHeading: string;
  absenceDays: string;
  departures: string;
  riskImproved: string;
  confidentialityNote: string;
}

export const RAPPORT_LABELS_FR: RapportLabels = {
  title: "Rapport direction — synthèse anonymisée",
  window: "Période",
  headcount: "Effectif suivi",
  riskHeading: "Répartition des niveaux de risque",
  riskHigh: "Risque élevé",
  riskWatch: "À surveiller",
  riskOk: "Stable",
  riskNone: "Non coté",
  climateHeading: "Climat d'équipe (fonctionnement moyen /10)",
  climateNoData: "sans données",
  membersSuffix: "membre(s)",
  absenceHeading: "Absence & rétention",
  absenceDays: "Jours d'absence sur la période",
  departures: "Départs sur la période",
  riskImproved: "Collaborateurs dont le risque s'est amélioré",
  confidentialityNote:
    "Document agrégé et anonymisé — aucune donnée individuelle, aucun nom, aucune note clinique.",
};

/**
 * Deterministic text rendering of the rapport. Contains ONLY
 * aggregates — asserting the absence of any displayName is part of
 * the test suite.
 */
export function rapportDirectionText(
  r: RapportDirection,
  labels: RapportLabels = RAPPORT_LABELS_FR
): string {
  const lines: string[] = [];
  lines.push(labels.title);
  lines.push(`${labels.window} : ${r.windowFrom} → ${r.windowTo}`);
  lines.push(`${labels.headcount} : ${r.headcount}`);
  lines.push("");
  lines.push(`## ${labels.riskHeading}`);
  lines.push(`- ${labels.riskHigh} : ${r.risk.high}`);
  lines.push(`- ${labels.riskWatch} : ${r.risk.watch}`);
  lines.push(`- ${labels.riskOk} : ${r.risk.ok}`);
  lines.push(`- ${labels.riskNone} : ${r.risk.none}`);
  lines.push("");
  lines.push(`## ${labels.climateHeading}`);
  for (const t of r.climate) {
    const avg =
      t.average === null
        ? labels.climateNoData
        : (Math.round(t.average * 10) / 10).toFixed(1);
    lines.push(
      `- ${t.team} : ${avg} (${t.memberCount} ${labels.membersSuffix})`
    );
  }
  lines.push("");
  lines.push(`## ${labels.absenceHeading}`);
  lines.push(`- ${labels.absenceDays} : ${r.absenceDays}`);
  lines.push(`- ${labels.departures} : ${r.departures}`);
  lines.push(`- ${labels.riskImproved} : ${r.riskImproved}`);
  lines.push("");
  lines.push(labels.confidentialityNote);
  return lines.join("\n");
}

// ─── Sample data (demo) ───────────────────────────────────────
// Deterministic relative to the `today` the caller passes, so tests
// can pin a date. Every sample record has isSample: true and the
// UI shows a "Données de démonstration" badge + one-tap clear.

function daysAgo(today: string, n: number): string {
  const d = new Date(today + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() - n);
  return d.toISOString().slice(0, 10);
}

interface SampleSpec {
  displayName: string;
  team: string;
  role: string;
  manager: string;
  status: CollaborateurStatus;
  /** functioning values, oldest → newest, one per week. */
  moods: number[];
  /** [flight, burnout] pairs, oldest → newest, one per two weeks. */
  risks: Array<[RiskLevel, RiskLevel]>;
  absences?: Array<{ weeksAgo: number; days: number; reason: string }>;
  departure?: { weeksAgo: number; reason: string };
  assignments?: string[];
  checkIns?: Array<{ weeksAgo: number; channel: ContactChannel; summary: string; seemed: string }>;
}

const SAMPLE_SPECS: SampleSpec[] = [
  {
    displayName: "COL-001", team: "Support client", role: "Conseillère", manager: "K. Alami",
    status: "surveille",
    moods: [6, 5, 4, 3, 3],
    risks: [["ok", "watch"], ["watch", "high"], ["watch", "high"]],
    absences: [{ weeksAgo: 2, days: 2, reason: "Maladie" }],
    assignments: ["Journal de récupération — 1 semaine"],
    checkIns: [
      { weeksAgo: 1, channel: "whatsapp", summary: "Point rapide après une semaine chargée", seemed: "Fatiguée mais preneuse d'aide" },
    ],
  },
  {
    displayName: "COL-002", team: "Support client", role: "Conseiller", manager: "K. Alami",
    status: "actif",
    moods: [5, 6, 6, 7, 7],
    risks: [["watch", "watch"], ["ok", "watch"], ["ok", "ok"]],
  },
  {
    displayName: "COL-003", team: "Support client", role: "Superviseure", manager: "K. Alami",
    status: "actif",
    moods: [7, 7, 8, 7, 8],
    risks: [["ok", "ok"], ["ok", "ok"]],
  },
  {
    displayName: "COL-004", team: "Logistique", role: "Chef d'équipe", manager: "R. Benani",
    status: "surveille",
    moods: [5, 4, 4, 5, 5],
    risks: [["watch", "watch"], ["watch", "watch"], ["watch", "ok"]],
    absences: [{ weeksAgo: 4, days: 3, reason: "Épuisement" }],
    checkIns: [
      { weeksAgo: 2, channel: "call", summary: "Appel de suivi hebdomadaire", seemed: "Plus posé que la semaine dernière" },
    ],
  },
  {
    displayName: "COL-005", team: "Logistique", role: "Opérateur", manager: "R. Benani",
    status: "actif",
    moods: [6, 6, 5, 6, 6],
    risks: [["ok", "ok"], ["ok", "watch"]],
  },
  {
    displayName: "COL-006", team: "Logistique", role: "Opératrice", manager: "R. Benani",
    status: "clos",
    moods: [4, 3, 3, 2],
    risks: [["high", "high"], ["high", "high"]],
    absences: [
      { weeksAgo: 6, days: 4, reason: "Maladie" },
      { weeksAgo: 3, days: 5, reason: "Maladie" },
    ],
    departure: { weeksAgo: 1, reason: "Démission" },
  },
  {
    displayName: "COL-007", team: "Ventes", role: "Commerciale", manager: "S. Idrissi",
    status: "actif",
    moods: [8, 7, 8, 8, 9],
    risks: [["ok", "ok"], ["ok", "ok"]],
  },
  {
    displayName: "COL-008", team: "Ventes", role: "Commercial", manager: "S. Idrissi",
    status: "surveille",
    moods: [6, 5, 5, 4, 4],
    risks: [["ok", "watch"], ["watch", "high"]],
    assignments: ["Fiche gestion de la charge — à relire avant le point vendredi"],
    checkIns: [
      { weeksAgo: 1, channel: "sms", summary: "Relance douce avant l'échéance trimestrielle", seemed: "Sous pression, répond brièvement" },
    ],
  },
  {
    displayName: "COL-009", team: "Administration", role: "Comptable", manager: "H. Tazi",
    status: "actif",
    moods: [7, 7, 6, 7, 7],
    risks: [["ok", "ok"], ["ok", "ok"]],
  },
  {
    displayName: "COL-010", team: "Administration", role: "Assistante RH", manager: "H. Tazi",
    status: "actif",
    moods: [5, 5, 6, 7, 8],
    risks: [["watch", "high"], ["watch", "watch"], ["ok", "ok"]],
    absences: [{ weeksAgo: 8, days: 1, reason: "Rendez-vous médical" }],
  },
];

/**
 * Builds the demo caseload: ~10 collaborateurs across 4 teams with
 * weeks of history each, one departure, assignments and check-ins.
 * Deterministic for a fixed `today`.
 */
export function buildSampleCollaborateurs(today: string): Collaborateur[] {
  return SAMPLE_SPECS.map((spec) => {
    const c = newCollaborateur({
      displayName: spec.displayName,
      team: spec.team,
      role: spec.role,
      manager: spec.manager,
      isSample: true,
    });
    c.status = spec.status;
    c.moodEntries = spec.moods.map((functioning, i) => ({
      id: generateId(),
      date: daysAgo(today, (spec.moods.length - 1 - i) * 7),
      functioning,
    }));
    c.riskEntries = spec.risks.map(([flightRisk, burnoutRisk], i) => ({
      id: generateId(),
      date: daysAgo(today, (spec.risks.length - 1 - i) * 14),
      flightRisk,
      burnoutRisk,
    }));
    c.absenceEntries = (spec.absences ?? []).map((a) => ({
      id: generateId(),
      date: daysAgo(today, a.weeksAgo * 7),
      days: a.days,
      reason: a.reason,
    }));
    c.departure = spec.departure
      ? { date: daysAgo(today, spec.departure.weeksAgo * 7), reason: spec.departure.reason }
      : null;
    c.assignments = (spec.assignments ?? []).map((text) => ({
      id: generateId(),
      text,
      done: false,
    }));
    c.checkIns = (spec.checkIns ?? []).map((k) => ({
      id: generateId(),
      date: daysAgo(today, k.weeksAgo * 7),
      channel: k.channel,
      summary: k.summary,
      seemed: k.seemed,
    }));
    return c;
  });
}

export function hasSampleData(list: Collaborateur[]): boolean {
  return list.some((c) => c.isSample);
}

export function clearSampleData(list: Collaborateur[]): Collaborateur[] {
  return list.filter((c) => !c.isSample);
}

// ─── Export / import (data safety) ────────────────────────────
// localStorage is single-browser; the JSON export is the only
// safeguard against loss. The import validates the envelope shape
// before replacing anything.

export interface DatasetExport {
  format: "eyla-therapist-dataset";
  version: 1;
  exportedAt: string;
  collaborateurs: Collaborateur[];
  /** Séances (from lib/internship/seance.ts) included verbatim. */
  seances: unknown[];
}

export function buildDatasetExport(
  collaborateurs: Collaborateur[],
  seances: unknown[],
  exportedAt: string = nowISO()
): DatasetExport {
  return {
    format: "eyla-therapist-dataset",
    version: 1,
    exportedAt,
    collaborateurs,
    seances,
  };
}

export function parseDatasetImport(json: string): DatasetExport | null {
  try {
    const parsed = JSON.parse(json) as Partial<DatasetExport>;
    if (parsed?.format !== "eyla-therapist-dataset") return null;
    if (parsed.version !== 1) return null;
    if (!Array.isArray(parsed.collaborateurs)) return null;
    if (!Array.isArray(parsed.seances)) return null;
    return parsed as DatasetExport;
  } catch {
    return null;
  }
}

// ─── Persistence ──────────────────────────────────────────────

export function loadCollaborateurs(): Collaborateur[] {
  return loadFromStorage<Collaborateur[]>(COLLABORATEURS_STORAGE_KEY, []);
}

export function saveCollaborateurs(list: Collaborateur[]): void {
  saveToStorage(COLLABORATEURS_STORAGE_KEY, list);
}
