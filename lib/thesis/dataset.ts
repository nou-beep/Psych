// Thesis dataset — the actual respondent records collected for the
// empirical study. One record per respondent. All respondents carry
// PHQ-9 + GAD-7; the specialized scale (DES or CDS) depends on the
// group they belong to.
//
// Persistence: localStorage under `eyla-thesis-dataset-v1`.

import { generateId, loadFromStorage, nowISO, saveToStorage } from "@/lib/store";

export const THESIS_DATASET_STORAGE_KEY = "eyla-thesis-dataset-v1";

export type Sex = "f" | "m" | "other" | "undisclosed";
export const SEX_VALUES: ReadonlyArray<Sex> = [
  "f",
  "m",
  "other",
  "undisclosed",
] as const;

export type Group = "dissociation" | "depersonalisation";
export const GROUP_VALUES: ReadonlyArray<Group> = [
  "dissociation",
  "depersonalisation",
] as const;

/**
 * One respondent. Fields are constrained at write-time via
 * `validateRespondent` — never trust an arbitrary input.
 *
 * Specialized scales:
 * - DES (Dissociative Experiences Scale, mean 0–100) — dissociation group
 * - CDS (Cambridge Depersonalisation Scale total 0–290) — depersonalisation group
 *
 * The other specialized field is undefined for that respondent. We
 * never pool DES and CDS — the analysis splits the sample by group.
 */
export interface Respondent {
  id: string;
  createdAt: string;
  age: number; // integer
  sex: Sex;
  group: Group;
  phq9: number; // 0–27
  gad7: number; // 0–21
  des?: number; // 0–100, present iff group === "dissociation"
  cds?: number; // 0–290, present iff group === "depersonalisation"
}

// ─── Ranges ───────────────────────────────────────────────────

export const FIELD_RANGES = {
  age: { min: 0, max: 120 },
  phq9: { min: 0, max: 27 },
  gad7: { min: 0, max: 21 },
  des: { min: 0, max: 100 },
  cds: { min: 0, max: 290 },
} as const;

export interface FieldError {
  field: string;
  message: string;
}

/**
 * Validates a draft. Returns a list of field errors (empty when OK).
 * Pure — no side effects, suitable for live form feedback.
 */
export function validateRespondent(
  draft: Partial<Respondent>
): FieldError[] {
  const errs: FieldError[] = [];

  if (!Number.isInteger(draft.age) || (draft.age as number) < 0) {
    errs.push({ field: "age", message: "AGE_REQUIRED_INTEGER" });
  } else if (
    (draft.age as number) < FIELD_RANGES.age.min ||
    (draft.age as number) > FIELD_RANGES.age.max
  ) {
    errs.push({ field: "age", message: "AGE_OUT_OF_RANGE" });
  }

  if (!draft.sex || !SEX_VALUES.includes(draft.sex as Sex)) {
    errs.push({ field: "sex", message: "SEX_REQUIRED" });
  }

  if (!draft.group || !GROUP_VALUES.includes(draft.group as Group)) {
    errs.push({ field: "group", message: "GROUP_REQUIRED" });
  }

  if (
    typeof draft.phq9 !== "number" ||
    !Number.isFinite(draft.phq9) ||
    draft.phq9 < FIELD_RANGES.phq9.min ||
    draft.phq9 > FIELD_RANGES.phq9.max
  ) {
    errs.push({ field: "phq9", message: "PHQ9_OUT_OF_RANGE" });
  }

  if (
    typeof draft.gad7 !== "number" ||
    !Number.isFinite(draft.gad7) ||
    draft.gad7 < FIELD_RANGES.gad7.min ||
    draft.gad7 > FIELD_RANGES.gad7.max
  ) {
    errs.push({ field: "gad7", message: "GAD7_OUT_OF_RANGE" });
  }

  // Specialized scale by group.
  if (draft.group === "dissociation") {
    if (
      typeof draft.des !== "number" ||
      !Number.isFinite(draft.des) ||
      draft.des < FIELD_RANGES.des.min ||
      draft.des > FIELD_RANGES.des.max
    ) {
      errs.push({ field: "des", message: "DES_OUT_OF_RANGE" });
    }
    if (typeof draft.cds === "number") {
      errs.push({ field: "cds", message: "CDS_NOT_FOR_THIS_GROUP" });
    }
  } else if (draft.group === "depersonalisation") {
    if (
      typeof draft.cds !== "number" ||
      !Number.isFinite(draft.cds) ||
      draft.cds < FIELD_RANGES.cds.min ||
      draft.cds > FIELD_RANGES.cds.max
    ) {
      errs.push({ field: "cds", message: "CDS_OUT_OF_RANGE" });
    }
    if (typeof draft.des === "number") {
      errs.push({ field: "des", message: "DES_NOT_FOR_THIS_GROUP" });
    }
  }

  return errs;
}

// ─── Pure mutations ───────────────────────────────────────────

export function newRespondent(input: {
  age: number;
  sex: Sex;
  group: Group;
  phq9: number;
  gad7: number;
  des?: number;
  cds?: number;
}): Respondent {
  // Normalize: strip the off-group specialized field defensively.
  const base: Respondent = {
    id: generateId(),
    createdAt: nowISO(),
    age: input.age,
    sex: input.sex,
    group: input.group,
    phq9: input.phq9,
    gad7: input.gad7,
  };
  if (input.group === "dissociation" && typeof input.des === "number") {
    base.des = input.des;
  }
  if (
    input.group === "depersonalisation" &&
    typeof input.cds === "number"
  ) {
    base.cds = input.cds;
  }
  return base;
}

export function addRespondent(
  list: Respondent[],
  r: Respondent
): Respondent[] {
  return [r, ...list];
}

export function patchRespondent(
  list: Respondent[],
  id: string,
  patch: Partial<Omit<Respondent, "id" | "createdAt">>
): Respondent[] {
  return list.map((r) => {
    if (r.id !== id) return r;
    const merged: Respondent = { ...r, ...patch };
    // If group flipped, drop the off-group specialized field.
    if (merged.group === "dissociation") delete merged.cds;
    if (merged.group === "depersonalisation") delete merged.des;
    return merged;
  });
}

export function removeRespondent(
  list: Respondent[],
  id: string
): Respondent[] {
  return list.filter((r) => r.id !== id);
}

// ─── Subsamples ───────────────────────────────────────────────

export function dissociationGroup(list: Respondent[]): Respondent[] {
  return list.filter((r) => r.group === "dissociation");
}

export function depersonalisationGroup(list: Respondent[]): Respondent[] {
  return list.filter((r) => r.group === "depersonalisation");
}

// ─── Persistence ──────────────────────────────────────────────

export function loadDataset(): Respondent[] {
  return loadFromStorage<Respondent[]>(THESIS_DATASET_STORAGE_KEY, []);
}

export function saveDataset(list: Respondent[]): void {
  saveToStorage(THESIS_DATASET_STORAGE_KEY, list);
}

// ─── CSV ──────────────────────────────────────────────────────

/**
 * One row per respondent, all fields. Empty cell when the
 * specialized scale doesn't apply to that group.
 * Header columns are stable for downstream tools (Jamovi / JASP).
 */
export function respondentsToCSV(list: Respondent[]): string {
  const header = [
    "id",
    "created_at",
    "age",
    "sex",
    "group",
    "phq9",
    "gad7",
    "des",
    "cds",
  ];
  const rows: string[][] = [header];
  for (const r of list) {
    rows.push([
      r.id,
      r.createdAt,
      String(r.age),
      r.sex,
      r.group,
      String(r.phq9),
      String(r.gad7),
      typeof r.des === "number" ? String(r.des) : "",
      typeof r.cds === "number" ? String(r.cds) : "",
    ]);
  }
  return rows.map((row) => row.map(csvCell).join(",")).join("\n");
}

function csvCell(value: string): string {
  if (/[",\n]/.test(value)) {
    return '"' + value.replace(/"/g, '""') + '"';
  }
  return value;
}
