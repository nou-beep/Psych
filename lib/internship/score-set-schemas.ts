// Built-in scoring schemas for the ScoreSet engine.
//
// Each schema is a complete configuration: values + display labels +
// per-value weights + an optional "not observed" sentinel. Add new
// schemas here as needs arise — domainBreakdown / scoreSetBreakdown
// pick them up automatically without code changes.

import type { ScoreSchema } from "./score-set";

// ─── A · Acquisition (the legacy default) ─────────────────────
// Mirrors the existing CapabilityScore from scorable-grids.ts.
// A = 1.0, EC = 0.5, NA = 0, NO = excluded from denominator.

export type AcquisitionValue = "A" | "EC" | "NA" | "NO";

export const acquisitionSchema: ScoreSchema<AcquisitionValue> = {
  id: "acquisition",
  name: "Acquisition",
  description: "A · EC · NA · N/O — la cotation classique des grilles cliniciennes.",
  values: [
    { value: "A", label: "A", longLabel: "Acquis", tone: "calm" },
    { value: "EC", label: "EC", longLabel: "En cours", tone: "warm" },
    { value: "NA", label: "NA", longLabel: "Non acquis", tone: "alarm" },
    { value: "NO", label: "N/O", longLabel: "Non observé", tone: "neutral" },
  ],
  weightOf(v) {
    if (v === "A") return 1;
    if (v === "EC") return 0.5;
    if (v === "NA") return 0;
    return null;
  },
  unobservedValue: "NO",
};

// ─── B · Binary Yes / No ──────────────────────────────────────

export type BinaryYNValue = "oui" | "non" | "non-observe";

export const binaryYNSchema: ScoreSchema<BinaryYNValue> = {
  id: "binary-yn",
  name: "Oui / Non",
  description: "Oui · Non · Non observé — cotation binaire avec sentinelle d'observabilité.",
  values: [
    { value: "oui", label: "Oui", tone: "calm" },
    { value: "non", label: "Non", tone: "alarm" },
    { value: "non-observe", label: "N/O", longLabel: "Non observé", tone: "neutral" },
  ],
  weightOf(v) {
    if (v === "oui") return 1;
    if (v === "non") return 0;
    return null;
  },
  unobservedValue: "non-observe",
};

// ─── C · Likert 1–4 (CARS-2-style clinical rating direction) ──
// 1 = comportement adapté, 4 = sévèrement atypique. Lower is
// clinically better. The acquisition-equivalent percentage maps
// 1 → 1.0, 2 → 0.67, 3 → 0.33, 4 → 0.

export type Likert4Value = "1" | "2" | "3" | "4";

export const likert1to4Schema: ScoreSchema<Likert4Value> = {
  id: "likert-1-4",
  name: "Likert 1–4 (atypicité)",
  description:
    "1 = comportement adapté, 4 = sévèrement atypique. Plus le score est bas, plus le profil est adapté.",
  values: [
    { value: "1", label: "1", longLabel: "Adapté", tone: "calm" },
    { value: "2", label: "2", longLabel: "Légèrement atypique", tone: "warm" },
    { value: "3", label: "3", longLabel: "Modérément atypique", tone: "warning" },
    { value: "4", label: "4", longLabel: "Sévèrement atypique", tone: "alarm" },
  ],
  weightOf(v) {
    if (v === "1") return 1;
    if (v === "2") return 2 / 3;
    if (v === "3") return 1 / 3;
    if (v === "4") return 0;
    return null;
  },
  higherIsWorse: true,
};

// ─── D · Likert 1–5 (clinical rating, higher = better) ────────
// 1 = absent, 5 = généralisé. Higher is clinically better.

export type Likert5Value = "1" | "2" | "3" | "4" | "5";

export const likert1to5Schema: ScoreSchema<Likert5Value> = {
  id: "likert-1-5",
  name: "Likert 1–5 (qualité)",
  description:
    "1 = absent, 5 = généralisé. Plus le score est élevé, plus la compétence est mobilisable.",
  values: [
    { value: "1", label: "1", longLabel: "Absent", tone: "alarm" },
    { value: "2", label: "2", longLabel: "Instable", tone: "warning" },
    { value: "3", label: "3", longLabel: "Partiel", tone: "warm" },
    { value: "4", label: "4", longLabel: "Adapté", tone: "neutral" },
    { value: "5", label: "5", longLabel: "Généralisé", tone: "calm" },
  ],
  weightOf(v) {
    if (v === "1") return 0;
    if (v === "2") return 0.25;
    if (v === "3") return 0.5;
    if (v === "4") return 0.75;
    if (v === "5") return 1;
    return null;
  },
};

// ─── E · Frequency (jamais → très souvent) ────────────────────
// Lower frequency of a target behaviour can be either good or bad
// depending on intent — by default treat "very frequent" as the
// "top" outcome (e.g. behaviour we *want* to see). For
// problematic-behaviour tracking, callers should use the inverse
// schema below.

export type FrequencyValue =
  | "jamais"
  | "rarement"
  | "parfois"
  | "souvent"
  | "tres-souvent"
  | "non-observe";

export const frequencySchema: ScoreSchema<FrequencyValue> = {
  id: "frequency",
  name: "Fréquence",
  description:
    "Jamais → très souvent. Adapté au suivi des comportements ciblés (présence de la compétence).",
  values: [
    { value: "jamais", label: "Jamais", tone: "alarm" },
    { value: "rarement", label: "Rarement", tone: "warning" },
    { value: "parfois", label: "Parfois", tone: "warm" },
    { value: "souvent", label: "Souvent", tone: "neutral" },
    { value: "tres-souvent", label: "Très souvent", tone: "calm" },
    { value: "non-observe", label: "N/O", longLabel: "Non observé", tone: "neutral" },
  ],
  weightOf(v) {
    if (v === "jamais") return 0;
    if (v === "rarement") return 0.25;
    if (v === "parfois") return 0.5;
    if (v === "souvent") return 0.75;
    if (v === "tres-souvent") return 1;
    return null;
  },
  unobservedValue: "non-observe",
};

// ─── F · Support level (sans aide → guidance totale) ──────────
// "Sans aide" is the top outcome (independent); "guidance totale"
// is the bottom (full physical guidance required).

export type SupportLevelValue =
  | "sans-aide"
  | "aide-gestuelle"
  | "aide-verbale"
  | "guidance-physique-partielle"
  | "guidance-physique-totale"
  | "non-observe";

export const supportLevelSchema: ScoreSchema<SupportLevelValue> = {
  id: "support-level",
  name: "Niveau d'aide",
  description:
    "Sans aide → guidance physique totale. Pour les évaluations d'autonomie où l'on mesure le niveau d'étayage nécessaire.",
  values: [
    { value: "sans-aide", label: "Sans aide", tone: "calm" },
    { value: "aide-gestuelle", label: "Aide gestuelle", tone: "neutral" },
    { value: "aide-verbale", label: "Aide verbale", tone: "warm" },
    {
      value: "guidance-physique-partielle",
      label: "Guidance physique partielle",
      tone: "warning",
    },
    {
      value: "guidance-physique-totale",
      label: "Guidance physique totale",
      tone: "alarm",
    },
    { value: "non-observe", label: "N/O", longLabel: "Non observé", tone: "neutral" },
  ],
  weightOf(v) {
    if (v === "sans-aide") return 1;
    if (v === "aide-gestuelle") return 0.75;
    if (v === "aide-verbale") return 0.5;
    if (v === "guidance-physique-partielle") return 0.25;
    if (v === "guidance-physique-totale") return 0;
    return null;
  },
  unobservedValue: "non-observe",
};

// ─── G · Severity (faible → très élevée) ──────────────────────
// Used for symptom severity / distress scales — "faible" is the
// "top" (best) outcome. higherIsWorse so the UI can colour
// accordingly.

export type SeverityValue =
  | "faible"
  | "moderee"
  | "elevee"
  | "tres-elevee"
  | "non-observe";

export const severitySchema: ScoreSchema<SeverityValue> = {
  id: "severity",
  name: "Sévérité",
  description:
    "Faible → très élevée. Adapté aux échelles de sévérité symptomatique : faible = profil le plus adapté.",
  values: [
    { value: "faible", label: "Faible", tone: "calm" },
    { value: "moderee", label: "Modérée", tone: "warm" },
    { value: "elevee", label: "Élevée", tone: "warning" },
    { value: "tres-elevee", label: "Très élevée", tone: "alarm" },
    { value: "non-observe", label: "N/O", longLabel: "Non observé", tone: "neutral" },
  ],
  weightOf(v) {
    if (v === "faible") return 1;
    if (v === "moderee") return 2 / 3;
    if (v === "elevee") return 1 / 3;
    if (v === "tres-elevee") return 0;
    return null;
  },
  unobservedValue: "non-observe",
  higherIsWorse: true,
};

// ─── Registry ─────────────────────────────────────────────────

export const ALL_SCHEMAS = [
  acquisitionSchema,
  binaryYNSchema,
  likert1to4Schema,
  likert1to5Schema,
  frequencySchema,
  supportLevelSchema,
  severitySchema,
] as const;

export function findSchema(id: string): ScoreSchema<string> | undefined {
  // Each schema in ALL_SCHEMAS is typed over its own value union;
  // widening to ScoreSchema<string> at the lookup boundary is safe
  // — the schema's own values + weightOf invariants still hold.
  return ALL_SCHEMAS.find((s) => s.id === id) as
    | ScoreSchema<string>
    | undefined;
}
