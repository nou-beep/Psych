// Scorable internship grids — click-based capability evaluation.
//
// A scorable grid is a *template-driven* evaluation sheet. Each
// administration produces one CapabilityScore per item (A / EC /
// NA / N/O) plus optional evidence. Domain-level breakdown and
// summary text generation live in scorable-text.ts; the templates
// themselves live in scorable-templates.ts. This file owns the
// data shapes + storage helpers + the pure-logic mutations the
// context exposes to the UI.

import { generateId, nowISO } from "@/lib/store";

// ─── Score values ────────────────────────────────────────────────

// French abbreviations preserved as the canonical labels; "NO" is
// the storage key for "N/O" (non observé) so the data is JSON-safe.
export type CapabilityScore = "A" | "EC" | "NA" | "NO";

export const CAPABILITY_SCORE_LABELS: Record<CapabilityScore, string> = {
  A: "A",
  EC: "EC",
  NA: "NA",
  NO: "N/O",
};

export const CAPABILITY_SCORE_LONG_LABELS: Record<CapabilityScore, string> = {
  A: "Acquis",
  EC: "En cours",
  NA: "Non acquis",
  NO: "Non observé",
};

// ─── Templates ──────────────────────────────────────────────────

export interface ScorableGridItem {
  id: string;
  label: string;
  // Optional follow-up phrase fired into the summary when the item
  // is scored EC / NA / A. Phrases live here so domain summaries
  // can pick them up without a separate switch in the UI.
  ecOrNaPhrase?: string;
  aPhrase?: string;
}

export interface ScorableGridDomain {
  id: string;
  label: string;
  // Suggestion keys consulted by suggestNextGridIds() when the
  // domain reads "À renforcer" or "En cours d'acquisition".
  followUpGridKeys?: string[];
  items: ScorableGridItem[];
}

export interface ScorableGridTemplate {
  id: string;
  name: string;
  description?: string;
  // Free-form section appended below the score table in print views.
  observationsHeading?: string;
  domains: ScorableGridDomain[];
  // Suggestions to fire when the *overall* grid is mostly acquis.
  advancedFollowUpKeys?: string[];
  // Standard licensing reminder (the user is expected to use
  // published materials for any copyrighted instrument).
  licensingNote?: string;
}

// ─── Administration record ──────────────────────────────────────

export interface ItemScoreEntry {
  score: CapabilityScore;
  // Quick note the evaluator can leave next to the click. Optional.
  note?: string;
  // Concrete observation / example backing the score. Optional.
  evidence?: string;
}

export interface ScorableGridAdministration {
  id: string;
  caseId: string;
  templateId: string;
  // Display-time overrides — the template name is fine by default
  // but a re-administration on a different date can carry an
  // explicit session label.
  name?: string;
  date: string;
  evaluator?: string;
  context?: string;
  sessionLabel?: string;
  // Per-item score; only items the evaluator has touched are
  // present. Missing items render as "N/O" by default.
  scores: Record<string, ItemScoreEntry>;
  // Free-text general observations block (printed below the table).
  observations?: string;
  signaturePsychologue?: string;
  visaResponsable?: string;
  // Cross-links the report assembler uses.
  linkedTestId?: string;
  // Audit.
  createdAt: string;
  updatedAt: string;
}

export const SCORABLE_ADMIN_STORAGE_KEY =
  "psych-internship-scorable-grids-v1";

// ─── Pure mutations ─────────────────────────────────────────────

export function newAdministration(input: {
  caseId: string;
  templateId: string;
  date?: string;
  evaluator?: string;
  context?: string;
  sessionLabel?: string;
  name?: string;
  linkedTestId?: string;
}): ScorableGridAdministration {
  const now = nowISO();
  return {
    id: generateId(),
    caseId: input.caseId,
    templateId: input.templateId,
    name: input.name,
    date: input.date ?? now.slice(0, 10),
    evaluator: input.evaluator,
    context: input.context,
    sessionLabel: input.sessionLabel,
    scores: {},
    linkedTestId: input.linkedTestId,
    createdAt: now,
    updatedAt: now,
  };
}

export function scoreItem(
  list: ScorableGridAdministration[],
  adminId: string,
  itemId: string,
  score: CapabilityScore,
  extra: { note?: string; evidence?: string } = {}
): ScorableGridAdministration[] {
  const now = nowISO();
  return list.map((a) => {
    if (a.id !== adminId) return a;
    return {
      ...a,
      scores: {
        ...a.scores,
        [itemId]: {
          score,
          note: extra.note ?? a.scores[itemId]?.note,
          evidence: extra.evidence ?? a.scores[itemId]?.evidence,
        },
      },
      updatedAt: now,
    };
  });
}

export function clearItemScore(
  list: ScorableGridAdministration[],
  adminId: string,
  itemId: string
): ScorableGridAdministration[] {
  const now = nowISO();
  return list.map((a) => {
    if (a.id !== adminId) return a;
    const next = { ...a.scores };
    delete next[itemId];
    return { ...a, scores: next, updatedAt: now };
  });
}

export function patchAdministration(
  list: ScorableGridAdministration[],
  id: string,
  patch: Partial<
    Omit<ScorableGridAdministration, "id" | "createdAt" | "caseId" | "scores">
  >
): ScorableGridAdministration[] {
  const now = nowISO();
  return list.map((a) =>
    a.id === id ? { ...a, ...patch, updatedAt: now } : a
  );
}

export function removeAdministration(
  list: ScorableGridAdministration[],
  id: string
): ScorableGridAdministration[] {
  return list.filter((a) => a.id !== id);
}

export function administrationsForCase(
  list: ScorableGridAdministration[],
  caseId: string
): ScorableGridAdministration[] {
  return list
    .filter((a) => a.caseId === caseId)
    .sort((a, b) => b.date.localeCompare(a.date));
}

// ─── Domain breakdown ───────────────────────────────────────────

export type DomainStatus =
  | "majoritairement-acquis"
  | "en-cours-acquisition"
  | "a-renforcer"
  | "non-suffisamment-observable";

export const DOMAIN_STATUS_LABELS: Record<DomainStatus, string> = {
  "majoritairement-acquis": "Majoritairement acquis",
  "en-cours-acquisition": "En cours d'acquisition",
  "a-renforcer": "À renforcer",
  "non-suffisamment-observable": "Non suffisamment observable",
};

export interface DomainBreakdown {
  domainId: string;
  domainLabel: string;
  total: number;
  counts: Record<CapabilityScore, number>;
  // Acquisition percentage. A counts 1.0, EC counts 0.5, NA counts
  // 0, NO is excluded from the denominator (it's "not observed").
  acquisitionPct: number;
  // Observability rate — what fraction of items were actually
  // scored (not N/O). Drives the "non suffisamment observable"
  // status.
  observabilityPct: number;
  status: DomainStatus;
}

const EMPTY_COUNTS: Record<CapabilityScore, number> = {
  A: 0,
  EC: 0,
  NA: 0,
  NO: 0,
};

export function domainBreakdown(
  admin: ScorableGridAdministration,
  template: ScorableGridTemplate,
  domainId: string
): DomainBreakdown | null {
  const domain = template.domains.find((d) => d.id === domainId);
  if (!domain) return null;
  const counts = { ...EMPTY_COUNTS };
  for (const item of domain.items) {
    const score = admin.scores[item.id]?.score ?? "NO";
    counts[score]++;
  }
  const observed = counts.A + counts.EC + counts.NA;
  const acquisitionPct =
    observed > 0
      ? Math.round(((counts.A + counts.EC * 0.5) / observed) * 100)
      : 0;
  const observabilityPct =
    domain.items.length > 0
      ? Math.round((observed / domain.items.length) * 100)
      : 0;
  let status: DomainStatus;
  if (observabilityPct < 50) {
    status = "non-suffisamment-observable";
  } else if (acquisitionPct >= 75) {
    status = "majoritairement-acquis";
  } else if (acquisitionPct >= 40) {
    status = "en-cours-acquisition";
  } else {
    status = "a-renforcer";
  }
  return {
    domainId,
    domainLabel: domain.label,
    total: domain.items.length,
    counts,
    acquisitionPct,
    observabilityPct,
    status,
  };
}

export function allDomainBreakdowns(
  admin: ScorableGridAdministration,
  template: ScorableGridTemplate
): DomainBreakdown[] {
  return template.domains
    .map((d) => domainBreakdown(admin, template, d.id))
    .filter((d): d is DomainBreakdown => Boolean(d));
}

export interface GridBreakdown {
  total: number;
  counts: Record<CapabilityScore, number>;
  acquisitionPct: number;
  observabilityPct: number;
}

export function gridBreakdown(
  admin: ScorableGridAdministration,
  template: ScorableGridTemplate
): GridBreakdown {
  const counts = { ...EMPTY_COUNTS };
  let total = 0;
  for (const domain of template.domains) {
    for (const item of domain.items) {
      total++;
      const score = admin.scores[item.id]?.score ?? "NO";
      counts[score]++;
    }
  }
  const observed = counts.A + counts.EC + counts.NA;
  return {
    total,
    counts,
    acquisitionPct:
      observed > 0
        ? Math.round(((counts.A + counts.EC * 0.5) / observed) * 100)
        : 0,
    observabilityPct:
      total > 0 ? Math.round((observed / total) * 100) : 0,
  };
}

// ─── Suggested next grids ───────────────────────────────────────

// Returns a flat de-duplicated list of grid keys the user should
// administer next. Keys reference templates that may live in
// scorable-templates.ts; the UI surfaces the keys even if no
// template exists yet (the user is told "Follow-up grid: XYZ").

export function suggestNextGridKeys(
  admin: ScorableGridAdministration,
  template: ScorableGridTemplate
): string[] {
  const out = new Set<string>();
  const breakdowns = allDomainBreakdowns(admin, template);
  for (const b of breakdowns) {
    const domain = template.domains.find((d) => d.id === b.domainId);
    if (!domain?.followUpGridKeys) continue;
    if (
      b.status === "a-renforcer" ||
      b.status === "en-cours-acquisition"
    ) {
      for (const k of domain.followUpGridKeys) out.add(k);
    }
  }
  // If the whole grid is mostly acquis, surface the advanced set.
  const grid = gridBreakdown(admin, template);
  if (
    grid.observabilityPct >= 60 &&
    grid.acquisitionPct >= 75 &&
    template.advancedFollowUpKeys
  ) {
    for (const k of template.advancedFollowUpKeys) out.add(k);
  }
  return Array.from(out);
}
