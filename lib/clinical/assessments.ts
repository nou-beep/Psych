// Standardized Test Engine — definitions, scoring, severity bands,
// missing-item detection, and longitudinal aggregation for psychological
// assessments. Pure functions; the UI persists administrations.
//
// IMPORTANT: this file deliberately does NOT reproduce copyrighted
// instrument item text. Only structural metadata (item count, response
// range, subscale mapping, severity bands sourced from clinician
// reference docs and the original validation publications) is included.
// Item labels are short generic placeholders the clinician fills in
// from the official instrument they administer.

import { generateId, nowISO } from "@/lib/store";

// ─── Types ──────────────────────────────────────────────────────

export type ResponseRange = { min: number; max: number };

export interface AssessmentSubscale {
  id: string;
  label: string;
  // 1-indexed item numbers belonging to the subscale.
  items: number[];
  severityBands?: SeverityBand[];
  // Multiplier applied to the raw subscale sum (e.g. DASS-21 multiplies by 2).
  multiplier?: number;
}

export interface SeverityBand {
  label: string;
  min: number;
  max: number;
  description?: string;
}

export interface AssessmentDefinition {
  id: string;
  code: string; // short code: PHQ-9, GAD-7, etc.
  title: string;
  // Whether this is a fully scoreable instrument or a placeholder shell
  // that records administrations until the clinician supplies items.
  status: "scoreable" | "placeholder";
  description: string;
  citation: string;
  itemCount: number;
  response: ResponseRange;
  // Optional total-score band table. If subscales exist, the band table
  // applies to the global score.
  severityBands?: SeverityBand[];
  subscales?: AssessmentSubscale[];
  // Items that flag clinical risk (e.g. suicidality on PHQ-9 #9).
  riskItems?: number[];
  tags: string[];
}

// ─── Definitions ────────────────────────────────────────────────

export const PHQ9: AssessmentDefinition = {
  id: "phq9",
  code: "PHQ-9",
  title: "Patient Health Questionnaire — 9",
  status: "scoreable",
  description:
    "Depression severity self-report. 9 items rated 0 (not at all) to 3 (nearly every day).",
  citation: "Kroenke, K., Spitzer, R. L., & Williams, J. B. W. (2001).",
  itemCount: 9,
  response: { min: 0, max: 3 },
  severityBands: [
    { label: "Minimal", min: 0, max: 4 },
    { label: "Mild", min: 5, max: 9 },
    { label: "Moderate", min: 10, max: 14 },
    { label: "Moderately severe", min: 15, max: 19 },
    { label: "Severe", min: 20, max: 27 },
  ],
  riskItems: [9],
  tags: ["depression", "self-report", "core"],
};

export const GAD7: AssessmentDefinition = {
  id: "gad7",
  code: "GAD-7",
  title: "Generalized Anxiety Disorder — 7",
  status: "scoreable",
  description:
    "Anxiety severity self-report. 7 items rated 0–3 over the last 2 weeks.",
  citation: "Spitzer, R. L., Kroenke, K., Williams, J. B. W., & Löwe, B. (2006).",
  itemCount: 7,
  response: { min: 0, max: 3 },
  severityBands: [
    { label: "Minimal", min: 0, max: 4 },
    { label: "Mild", min: 5, max: 9 },
    { label: "Moderate", min: 10, max: 14 },
    { label: "Severe", min: 15, max: 21 },
  ],
  tags: ["anxiety", "self-report", "core"],
};

// DASS-21: 21 items, 4-point scale (0–3). Subscales of 7 items each;
// each subscale sum is multiplied by 2 to compare with DASS-42 norms.
export const DASS21: AssessmentDefinition = {
  id: "dass21",
  code: "DASS-21",
  title: "Depression Anxiety Stress Scales — 21",
  status: "scoreable",
  description:
    "Tripartite measure of depression, anxiety, and stress symptoms. 21 items rated 0–3 over the past week. Subscale sums are multiplied by 2.",
  citation: "Lovibond, S. H., & Lovibond, P. F. (1995).",
  itemCount: 21,
  response: { min: 0, max: 3 },
  subscales: [
    {
      id: "depression",
      label: "Depression",
      items: [3, 5, 10, 13, 16, 17, 21],
      multiplier: 2,
      severityBands: [
        { label: "Normal", min: 0, max: 9 },
        { label: "Mild", min: 10, max: 13 },
        { label: "Moderate", min: 14, max: 20 },
        { label: "Severe", min: 21, max: 27 },
        { label: "Extremely severe", min: 28, max: 42 },
      ],
    },
    {
      id: "anxiety",
      label: "Anxiety",
      items: [2, 4, 7, 9, 15, 19, 20],
      multiplier: 2,
      severityBands: [
        { label: "Normal", min: 0, max: 7 },
        { label: "Mild", min: 8, max: 9 },
        { label: "Moderate", min: 10, max: 14 },
        { label: "Severe", min: 15, max: 19 },
        { label: "Extremely severe", min: 20, max: 42 },
      ],
    },
    {
      id: "stress",
      label: "Stress",
      items: [1, 6, 8, 11, 12, 14, 18],
      multiplier: 2,
      severityBands: [
        { label: "Normal", min: 0, max: 14 },
        { label: "Mild", min: 15, max: 18 },
        { label: "Moderate", min: 19, max: 25 },
        { label: "Severe", min: 26, max: 33 },
        { label: "Extremely severe", min: 34, max: 42 },
      ],
    },
  ],
  tags: ["depression", "anxiety", "stress", "self-report", "core"],
};

function placeholder(
  id: string,
  code: string,
  title: string,
  itemCount: number,
  response: ResponseRange,
  description: string,
  citation: string,
  tags: string[]
): AssessmentDefinition {
  return {
    id,
    code,
    title,
    status: "placeholder",
    description,
    citation,
    itemCount,
    response,
    tags,
  };
}

// Placeholder instruments — clinicians fill in items from the official
// scale they administer. Scoring engine still records raw totals.
export const BDI_II = placeholder(
  "bdi2",
  "BDI-II",
  "Beck Depression Inventory — II",
  21,
  { min: 0, max: 3 },
  "Self-report depression severity. Items 0–3. Item content omitted (copyrighted).",
  "Beck, A. T., Steer, R. A., & Brown, G. K. (1996).",
  ["depression", "self-report"]
);
export const STAI_Y2 = placeholder(
  "stai-y2",
  "STAI-Y2",
  "State-Trait Anxiety Inventory — Trait",
  20,
  { min: 1, max: 4 },
  "Trait anxiety self-report. Items 1–4. Item content omitted.",
  "Spielberger, C. D. (1983).",
  ["anxiety", "self-report"]
);
export const CDS_29 = placeholder(
  "cds29",
  "CDS-29",
  "Cambridge Depersonalization Scale",
  29,
  { min: 0, max: 10 },
  "Depersonalization severity. Each item rated 0–4 (frequency) and 1–6 (duration); scoring engine handles raw totals only.",
  "Sierra, M., & Berrios, G. E. (2000).",
  ["depersonalization", "dissociation", "self-report"]
);
export const DES_II = placeholder(
  "des2",
  "DES-II",
  "Dissociative Experiences Scale — II",
  28,
  { min: 0, max: 100 },
  "Dissociative experience frequency. Each item rated 0–100 in 10-point increments.",
  "Carlson, E. B., & Putnam, F. W. (1993).",
  ["dissociation", "self-report"]
);
export const PCL_5 = placeholder(
  "pcl5",
  "PCL-5",
  "PTSD Checklist for DSM-5",
  20,
  { min: 0, max: 4 },
  "PTSD symptom severity over the past month. Items 0–4.",
  "Weathers, F. W., et al. (2013).",
  ["trauma", "ptsd", "self-report"]
);
export const AQ_50 = placeholder(
  "aq50",
  "AQ-50",
  "Autism Spectrum Quotient",
  50,
  { min: 0, max: 1 },
  "Adult autistic traits screener. Items scored 0/1 per scoring key.",
  "Baron-Cohen, S., et al. (2001).",
  ["autism", "self-report", "screener"]
);
export const RAADS_R = placeholder(
  "raads-r",
  "RAADS-R",
  "Ritvo Autism Asperger Diagnostic Scale — Revised",
  80,
  { min: 0, max: 3 },
  "Adult autism screener. Items 0–3 with reverse-scored entries handled per official key.",
  "Ritvo, R. A., et al. (2011).",
  ["autism", "self-report", "screener"]
);

export const ASSESSMENT_LIBRARY: AssessmentDefinition[] = [
  PHQ9,
  GAD7,
  DASS21,
  BDI_II,
  STAI_Y2,
  CDS_29,
  DES_II,
  PCL_5,
  AQ_50,
  RAADS_R,
];

export function findAssessment(id: string): AssessmentDefinition | undefined {
  return ASSESSMENT_LIBRARY.find((a) => a.id === id);
}

// ─── Scoring ────────────────────────────────────────────────────

export type Items = Array<number | null | undefined>;

export interface SubscaleScore {
  id: string;
  label: string;
  rawSum: number;
  // Raw sum × multiplier (or just rawSum if no multiplier).
  score: number;
  severity: string | null;
  itemCount: number;
  missing: number;
}

export interface AssessmentScore {
  assessmentId: string;
  total: number;
  itemCount: number;
  expectedItems: number;
  missing: number;
  // For instruments without subscales: severity from total.
  severity: string | null;
  subscales?: SubscaleScore[];
  flaggedItems: number[]; // 1-indexed items that flag clinical risk
  incomplete: boolean;
}

function bandFor(value: number, bands?: SeverityBand[]): string | null {
  if (!bands) return null;
  const found = bands.find((b) => value >= b.min && value <= b.max);
  return found ? found.label : null;
}

function cleanItem(
  raw: number | null | undefined,
  response: ResponseRange
): number | null {
  if (typeof raw !== "number" || Number.isNaN(raw)) return null;
  if (raw < response.min || raw > response.max) return null;
  return raw;
}

export function scoreAssessment(
  def: AssessmentDefinition,
  items: Items
): AssessmentScore {
  if (items.length !== def.itemCount) {
    throw new Error(
      `${def.code} expects exactly ${def.itemCount} items, got ${items.length}`
    );
  }
  const cleaned = items.map((v) => cleanItem(v, def.response));
  const valid = cleaned.filter((v): v is number => v !== null);
  const total = valid.reduce((a, b) => a + b, 0);
  const missing = def.itemCount - valid.length;
  const flagged: number[] = [];
  if (def.riskItems) {
    for (const idx of def.riskItems) {
      const v = cleaned[idx - 1];
      if (typeof v === "number" && v > 0) flagged.push(idx);
    }
  }

  // Subscale handling.
  let subscales: SubscaleScore[] | undefined;
  if (def.subscales && def.subscales.length) {
    subscales = def.subscales.map((s) => {
      const subValues = s.items.map((idx) => cleaned[idx - 1]);
      const subValid = subValues.filter((v): v is number => v !== null);
      const rawSum = subValid.reduce((a, b) => a + b, 0);
      const score = rawSum * (s.multiplier ?? 1);
      return {
        id: s.id,
        label: s.label,
        rawSum,
        score,
        severity:
          subValid.length === s.items.length
            ? bandFor(score, s.severityBands)
            : null,
        itemCount: subValid.length,
        missing: s.items.length - subValid.length,
      };
    });
  }

  return {
    assessmentId: def.id,
    total,
    itemCount: valid.length,
    expectedItems: def.itemCount,
    missing,
    severity:
      missing === 0 && !subscales ? bandFor(total, def.severityBands) : null,
    subscales,
    flaggedItems: flagged,
    incomplete: missing > 0,
  };
}

// ─── Administrations (persistence shape) ────────────────────────

export interface AssessmentAdministration {
  id: string;
  assessmentId: string;
  caseId?: string;
  date: string; // YYYY-MM-DD
  items: Items;
  score: AssessmentScore;
  clinicianNotes: string;
  createdAt: string;
  updatedAt: string;
}

export const ASSESSMENT_ADMINISTRATIONS_STORAGE_KEY =
  "psych-assessment-administrations-v1";

export function buildAdministration(
  def: AssessmentDefinition,
  data: {
    caseId?: string;
    date?: string;
    items: Items;
    clinicianNotes?: string;
  }
): AssessmentAdministration {
  return {
    id: generateId(),
    assessmentId: def.id,
    caseId: data.caseId,
    date: data.date ?? new Date().toISOString().split("T")[0],
    items: data.items,
    score: scoreAssessment(def, data.items),
    clinicianNotes: data.clinicianNotes ?? "",
    createdAt: nowISO(),
    updatedAt: nowISO(),
  };
}

// Returns administrations sorted oldest-first for a case (good for charts).
export function caseAdministrations(
  all: AssessmentAdministration[],
  caseId: string,
  assessmentId?: string
): AssessmentAdministration[] {
  return all
    .filter((a) => a.caseId === caseId)
    .filter((a) => (assessmentId ? a.assessmentId === assessmentId : true))
    .sort((a, b) => a.date.localeCompare(b.date));
}
