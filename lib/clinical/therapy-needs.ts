// "What they need from therapy" — therapeutic needs profile per case.
// Distinct from goals: this captures the underlying clinical *needs*
// (e.g. emotional validation, structure, grounding) that organise the
// treatment plan.

import { generateId, nowISO } from "@/lib/store";

export type NeedCategory =
  | "emotional-validation"
  | "structure"
  | "grounding"
  | "psychoeducation"
  | "emotional-regulation"
  | "behavioral-activation"
  | "relational-safety"
  | "cognitive-restructuring"
  | "executive-functioning"
  | "sensory-accommodations"
  | "routine-support"
  | "distress-tolerance";

export const NEED_LABELS: Record<NeedCategory, string> = {
  "emotional-validation": "Emotional validation",
  structure: "Structure",
  grounding: "Grounding",
  psychoeducation: "Psychoeducation",
  "emotional-regulation": "Emotional regulation",
  "behavioral-activation": "Behavioral activation",
  "relational-safety": "Relational safety",
  "cognitive-restructuring": "Cognitive restructuring",
  "executive-functioning": "Executive functioning support",
  "sensory-accommodations": "Sensory accommodations",
  "routine-support": "Routine support",
  "distress-tolerance": "Distress tolerance",
};

export const ALL_NEEDS: NeedCategory[] = Object.keys(NEED_LABELS) as NeedCategory[];

export type NeedPriority = "primary" | "secondary" | "watching";

// Linked intervention / workbook suggestions per need. These are
// curated hints — the UI surfaces them next to each entry.
export const NEED_SUGGESTIONS: Record<
  NeedCategory,
  { interventions: string[]; workbooks: string[]; psychoeducation: string[] }
> = {
  "emotional-validation": {
    interventions: ["emotion-regulation-check"],
    workbooks: ["wb-self-esteem"],
    psychoeducation: ["pe-anxiety"],
  },
  structure: {
    interventions: ["behavioral-activation"],
    workbooks: ["wb-burnout"],
    psychoeducation: [],
  },
  grounding: {
    interventions: ["grounding-54321", "dpdr-grounding"],
    workbooks: ["wb-anxiety-grounding", "wb-dpdr"],
    psychoeducation: ["pe-dpdr"],
  },
  psychoeducation: {
    interventions: ["psychoed-anxiety"],
    workbooks: [],
    psychoeducation: ["pe-anxiety", "pe-depression", "pe-dpdr"],
  },
  "emotional-regulation": {
    interventions: ["emotion-regulation-check", "mindful-breath"],
    workbooks: ["wb-emotional-reg"],
    psychoeducation: [],
  },
  "behavioral-activation": {
    interventions: ["behavioral-activation"],
    workbooks: ["wb-burnout"],
    psychoeducation: ["pe-depression"],
  },
  "relational-safety": {
    interventions: ["communication-i-statements", "trauma-stabilization"],
    workbooks: [],
    psychoeducation: [],
  },
  "cognitive-restructuring": {
    interventions: ["cbt-thought-record", "act-defusion"],
    workbooks: ["wb-anxiety-grounding"],
    psychoeducation: [],
  },
  "executive-functioning": {
    interventions: [],
    workbooks: [],
    psychoeducation: [],
  },
  "sensory-accommodations": {
    interventions: ["sensory-toolbox"],
    workbooks: ["wb-sensory"],
    psychoeducation: [],
  },
  "routine-support": {
    interventions: ["behavioral-activation"],
    workbooks: [],
    psychoeducation: [],
  },
  "distress-tolerance": {
    interventions: ["dbt-tipp", "grounding-54321"],
    workbooks: ["wb-emotional-reg"],
    psychoeducation: [],
  },
};

export interface CaseNeedEntry {
  id: string;
  category: NeedCategory;
  priority: NeedPriority;
  // Free text — what this need looks like *for this client*.
  notes: string;
  // 0–100 — progress toward addressing the need. UI is non-gamified.
  progress: number;
  isCurrentFocus: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CaseNeedsProfile {
  caseId: string;
  entries: CaseNeedEntry[];
  generalNotes: string;
  updatedAt: string;
}

export const NEEDS_STORAGE_KEY = "psych-case-needs-v1";

export function emptyEntry(category: NeedCategory): CaseNeedEntry {
  const now = nowISO();
  return {
    id: generateId(),
    category,
    priority: "secondary",
    notes: "",
    progress: 0,
    isCurrentFocus: false,
    createdAt: now,
    updatedAt: now,
  };
}

export function emptyProfile(caseId: string): CaseNeedsProfile {
  return {
    caseId,
    entries: [],
    generalNotes: "",
    updatedAt: nowISO(),
  };
}

export function addNeed(
  profile: CaseNeedsProfile,
  category: NeedCategory,
  priority: NeedPriority = "secondary"
): CaseNeedsProfile {
  if (profile.entries.some((e) => e.category === category)) return profile;
  return {
    ...profile,
    entries: [...profile.entries, { ...emptyEntry(category), priority }],
    updatedAt: nowISO(),
  };
}

export function updateNeed(
  profile: CaseNeedsProfile,
  id: string,
  patch: Partial<CaseNeedEntry>
): CaseNeedsProfile {
  return {
    ...profile,
    entries: profile.entries.map((e) =>
      e.id === id ? { ...e, ...patch, updatedAt: nowISO() } : e
    ),
    updatedAt: nowISO(),
  };
}

export function removeNeed(
  profile: CaseNeedsProfile,
  id: string
): CaseNeedsProfile {
  return {
    ...profile,
    entries: profile.entries.filter((e) => e.id !== id),
    updatedAt: nowISO(),
  };
}

export function primaryNeeds(profile: CaseNeedsProfile): CaseNeedEntry[] {
  return profile.entries.filter((e) => e.priority === "primary");
}

export function currentFocus(profile: CaseNeedsProfile): CaseNeedEntry[] {
  return profile.entries.filter((e) => e.isCurrentFocus);
}
