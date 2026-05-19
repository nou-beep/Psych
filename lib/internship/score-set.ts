// Universal ScoreSet engine — generic scoring architecture that
// can power any structured assessment (internship grids, observation
// checklists, Likert ratings, frequency logs, support-level scales,
// severity scales, future custom scales).
//
// The existing ScorableGrid system (lib/internship/scorable-grids.ts)
// is the special case where the schema is fixed to A/EC/NA/N-O. An
// adapter in score-set-adapters.ts re-views the existing templates
// as ScoreSetDefinitions so no data migration is needed.
//
// The schema (see ./score-set-schemas.ts) carries the values + their
// display labels + the per-value contribution weight. Breakdown math
// (acquisition %, observability %, domain status) is schema-driven —
// the same domainBreakdown / scoreSetBreakdown helpers work across
// every schema.

import { generateId, nowISO } from "@/lib/store";

// ─── Schema ───────────────────────────────────────────────────

export interface ScoreSchemaValue<TValue extends string> {
  value: TValue;
  // Display label rendered on the button / chip.
  label: string;
  // Optional long label for tooltips.
  longLabel?: string;
  // Optional UI tone hint — the renderer picks a colour from this.
  // "calm" = positive end, "neutral" = mid, "warn"/"alarm" = negative.
  tone?: "calm" | "neutral" | "warm" | "warning" | "alarm";
}

export interface ScoreSchema<TValue extends string = string> {
  id: string;
  // Human-friendly name ("Acquisition", "Likert 1–5", "Fréquence").
  name: string;
  // Description used in template pickers + auto-text headers.
  description?: string;
  // Ordered list of valid values. Order conveys direction — the
  // first entry is the "best" outcome by convention, but the
  // weightOf function is the source of truth.
  values: ReadonlyArray<ScoreSchemaValue<TValue>>;
  // Per-value contribution. Returning `null` means "not observed" —
  // the item is excluded from the breakdown denominator.
  weightOf: (value: TValue) => number | null;
  // Optional "not observed" sentinel — used as default when an item
  // hasn't been touched. If omitted, missing items are excluded from
  // both numerator and denominator.
  unobservedValue?: TValue;
  // Optional ordering reversal hint — for some schemas (severity,
  // distress) higher values are clinically worse. The breakdown
  // helpers don't use this, but UI renderers may.
  higherIsWorse?: boolean;
}

// ─── Template (definition) ────────────────────────────────────

export interface ScoreSetItem {
  id: string;
  label: string;
  // Optional summary phrases the auto-text generator uses.
  // Keys are schema values (e.g. "A", "EC", "NA", or "1", "2"…)
  // and the value is the phrase to append when the item is scored
  // that way. Phrases are entirely optional — items without them
  // are still scoreable.
  phrases?: Record<string, string>;
}

export interface ScoreSetDomain {
  id: string;
  label: string;
  items: ScoreSetItem[];
  // Optional follow-up keys the suggestion engine fires when the
  // domain status is weak (same shape as the legacy system).
  followUpKeys?: string[];
}

export interface ScoreSetDefinition<TValue extends string = string> {
  id: string;
  name: string;
  description?: string;
  // Section heading rendered above the optional observations block
  // in print views.
  observationsHeading?: string;
  // The schema this template scores against. Determines the
  // buttons rendered, the per-value weight, and the breakdown math.
  schema: ScoreSchema<TValue>;
  domains: ScoreSetDomain[];
  // Optional follow-up keys when the whole grid reads
  // majoritairement-acquis (or its schema-equivalent: top-bucket).
  advancedFollowUpKeys?: string[];
  // Standard licensing reminder displayed beside every template.
  licensingNote?: string;
}

// ─── Administration record ────────────────────────────────────

export interface ScoreSetItemResult<TValue extends string = string> {
  // The schema value picked for this item.
  value: TValue;
  // Optional clinician note next to the click.
  note?: string;
  // Optional concrete observation / example backing the score.
  evidence?: string;
}

export interface ScoreSetAdministration<TValue extends string = string> {
  id: string;
  caseId: string;
  // Anchors on a template id from the registry.
  templateId: string;
  // Display name override (defaults to template name).
  name?: string;
  date: string;
  evaluator?: string;
  context?: string;
  sessionLabel?: string;
  // Per-item result; only items the evaluator has touched are
  // present. Missing items default to the schema's unobservedValue.
  results: Record<string, ScoreSetItemResult<TValue>>;
  // Free-text observations block (printed below the table).
  observations?: string;
  signaturePsychologue?: string;
  visaResponsable?: string;
  // Cross-links the report assembler uses.
  linkedTestId?: string;
  // Audit.
  createdAt: string;
  updatedAt: string;
}

// ─── Mutations ────────────────────────────────────────────────

export function newScoreSetAdministration<TValue extends string>(input: {
  caseId: string;
  templateId: string;
  date?: string;
  evaluator?: string;
  context?: string;
  sessionLabel?: string;
  name?: string;
  linkedTestId?: string;
}): ScoreSetAdministration<TValue> {
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
    results: {},
    linkedTestId: input.linkedTestId,
    createdAt: now,
    updatedAt: now,
  };
}

export function scoreScoreSetItem<TValue extends string>(
  list: ScoreSetAdministration<TValue>[],
  adminId: string,
  itemId: string,
  value: TValue,
  extra: { note?: string; evidence?: string } = {}
): ScoreSetAdministration<TValue>[] {
  const now = nowISO();
  return list.map((a) => {
    if (a.id !== adminId) return a;
    return {
      ...a,
      results: {
        ...a.results,
        [itemId]: {
          value,
          note: extra.note ?? a.results[itemId]?.note,
          evidence: extra.evidence ?? a.results[itemId]?.evidence,
        },
      },
      updatedAt: now,
    };
  });
}

export function clearScoreSetItem<TValue extends string>(
  list: ScoreSetAdministration<TValue>[],
  adminId: string,
  itemId: string
): ScoreSetAdministration<TValue>[] {
  const now = nowISO();
  return list.map((a) => {
    if (a.id !== adminId) return a;
    const next = { ...a.results };
    delete next[itemId];
    return { ...a, results: next, updatedAt: now };
  });
}

export function patchScoreSetAdministration<TValue extends string>(
  list: ScoreSetAdministration<TValue>[],
  id: string,
  patch: Partial<
    Omit<
      ScoreSetAdministration<TValue>,
      "id" | "createdAt" | "caseId" | "results"
    >
  >
): ScoreSetAdministration<TValue>[] {
  const now = nowISO();
  return list.map((a) =>
    a.id === id ? { ...a, ...patch, updatedAt: now } : a
  );
}

// ─── Breakdown ────────────────────────────────────────────────

// Reuse the existing DomainStatus enum so consumers don't have to
// learn two vocabularies. "majoritairement-acquis" → top bucket;
// "à renforcer" → bottom; etc. Schema-agnostic: a Likert 1-5 grid
// with most items at 1 is "majoritairement-acquis" just like an
// acquisition grid with most items at A.
export type ScoreSetDomainStatus =
  | "top"
  | "mid"
  | "low"
  | "not-observable";

export const SCORE_SET_DOMAIN_STATUS_LABELS: Record<
  ScoreSetDomainStatus,
  string
> = {
  top: "Majoritairement acquis",
  mid: "En cours d'acquisition",
  low: "À renforcer",
  "not-observable": "Non suffisamment observable",
};

export interface ScoreSetDomainBreakdown<TValue extends string = string> {
  domainId: string;
  domainLabel: string;
  total: number;
  // Per-value counts. Schema-driven, so values vary.
  counts: Record<TValue, number>;
  // Acquisition-equivalent percentage — Σ(weights of observed
  // items) / count(observed items). 0 when no items observed.
  acquisitionPct: number;
  // Observability — fraction of items that were actually scored
  // (non-null weight).
  observabilityPct: number;
  status: ScoreSetDomainStatus;
}

const STATUS_THRESHOLDS = {
  observabilityFloor: 50, // < this % observed → not-observable
  topFloor: 75,            // ≥ this % acquisition → top
  midFloor: 40,            // ≥ this % acquisition → mid
};

function emptyCounts<TValue extends string>(
  schema: ScoreSchema<TValue>
): Record<TValue, number> {
  const counts = {} as Record<TValue, number>;
  for (const v of schema.values) counts[v.value] = 0;
  return counts;
}

export function scoreSetDomainBreakdown<TValue extends string>(
  admin: ScoreSetAdministration<TValue>,
  template: ScoreSetDefinition<TValue>,
  domainId: string
): ScoreSetDomainBreakdown<TValue> | null {
  const domain = template.domains.find((d) => d.id === domainId);
  if (!domain) return null;
  const counts = emptyCounts(template.schema);

  let weightSum = 0;
  let observedCount = 0;
  for (const item of domain.items) {
    const result = admin.results[item.id];
    const value =
      result?.value ??
      (template.schema.unobservedValue as TValue | undefined);
    if (value !== undefined && value in counts) {
      counts[value]++;
      const w = template.schema.weightOf(value);
      if (w !== null) {
        weightSum += w;
        observedCount++;
      }
    }
  }
  const acquisitionPct =
    observedCount > 0
      ? Math.round((weightSum / observedCount) * 100)
      : 0;
  const observabilityPct =
    domain.items.length > 0
      ? Math.round((observedCount / domain.items.length) * 100)
      : 0;

  let status: ScoreSetDomainStatus;
  if (observabilityPct < STATUS_THRESHOLDS.observabilityFloor) {
    status = "not-observable";
  } else if (acquisitionPct >= STATUS_THRESHOLDS.topFloor) {
    status = "top";
  } else if (acquisitionPct >= STATUS_THRESHOLDS.midFloor) {
    status = "mid";
  } else {
    status = "low";
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

export function allScoreSetDomainBreakdowns<TValue extends string>(
  admin: ScoreSetAdministration<TValue>,
  template: ScoreSetDefinition<TValue>
): ScoreSetDomainBreakdown<TValue>[] {
  return template.domains
    .map((d) => scoreSetDomainBreakdown(admin, template, d.id))
    .filter((d): d is ScoreSetDomainBreakdown<TValue> => Boolean(d));
}

export interface ScoreSetBreakdown<TValue extends string = string> {
  total: number;
  counts: Record<TValue, number>;
  acquisitionPct: number;
  observabilityPct: number;
}

export function scoreSetBreakdown<TValue extends string>(
  admin: ScoreSetAdministration<TValue>,
  template: ScoreSetDefinition<TValue>
): ScoreSetBreakdown<TValue> {
  const counts = emptyCounts(template.schema);
  let total = 0;
  let weightSum = 0;
  let observedCount = 0;
  for (const domain of template.domains) {
    for (const item of domain.items) {
      total++;
      const result = admin.results[item.id];
      const value =
        result?.value ??
        (template.schema.unobservedValue as TValue | undefined);
      if (value !== undefined && value in counts) {
        counts[value]++;
        const w = template.schema.weightOf(value);
        if (w !== null) {
          weightSum += w;
          observedCount++;
        }
      }
    }
  }
  return {
    total,
    counts,
    acquisitionPct:
      observedCount > 0
        ? Math.round((weightSum / observedCount) * 100)
        : 0,
    observabilityPct:
      total > 0 ? Math.round((observedCount / total) * 100) : 0,
  };
}

// ─── Suggested next ───────────────────────────────────────────

export function suggestNextScoreSetKeys<TValue extends string>(
  admin: ScoreSetAdministration<TValue>,
  template: ScoreSetDefinition<TValue>
): string[] {
  const out = new Set<string>();
  const breakdowns = allScoreSetDomainBreakdowns(admin, template);
  for (const b of breakdowns) {
    const domain = template.domains.find((d) => d.id === b.domainId);
    if (!domain?.followUpKeys) continue;
    if (b.status === "low" || b.status === "mid") {
      for (const k of domain.followUpKeys) out.add(k);
    }
  }
  const grid = scoreSetBreakdown(admin, template);
  if (
    grid.observabilityPct >= 60 &&
    grid.acquisitionPct >= STATUS_THRESHOLDS.topFloor &&
    template.advancedFollowUpKeys
  ) {
    for (const k of template.advancedFollowUpKeys) out.add(k);
  }
  return Array.from(out);
}
