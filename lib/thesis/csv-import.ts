// Real CSV import for thesis participant data.
// Expected columns:
//   participant_id, age, gender,
//   CDS_total, STAI_trait, STAI_state (optional),
//   PHQ9_total, qualitative_group (optional), notes (optional)
//
// Pure validator + parser. No side effects.

import { parseCSV } from "@/lib/scoring";
import type { ThesisParticipant } from "@/lib/thesis-data";
import { generateId } from "@/lib/store";

export interface ImportedRow {
  participantId: string;
  age: number | null;
  gender: string;
  cdsTotal: number | null;
  staiTrait: number | null;
  staiState: number | null;
  phq9Total: number | null;
  group: string;
  notes: string;
  rowIndex: number; // for surfacing validation errors
}

export interface ImportIssue {
  rowIndex: number;
  participantId?: string;
  severity: "error" | "warning";
  message: string;
}

export interface ImportPreview {
  headers: string[];
  rows: ImportedRow[];
  issues: ImportIssue[];
  duplicateIds: string[];
  // Quick descriptives on what was imported (recomputed from the
  // imported rows, NOT the user's thesis seed).
  summary: {
    total: number;
    withCds: number;
    withStai: number;
    withPhq9: number;
  };
}

// Plausible ranges per instrument. CDS-29 score range is roughly
// 0–290 (frequency 0–4 × duration 1–6 × 29 items, theoretical max);
// the user's data caps at 168, well within the validator's bounds.
const RANGES = {
  age: { min: 14, max: 99 },
  cdsTotal: { min: 0, max: 290 },
  staiTrait: { min: 20, max: 80 },
  staiState: { min: 20, max: 80 },
  phq9Total: { min: 0, max: 27 },
};

const HEADER_ALIASES: Record<string, string> = {
  participant_id: "participantId",
  id: "participantId",
  participant: "participantId",
  age: "age",
  gender: "gender",
  sex: "gender",
  cds: "cdsTotal",
  cds_total: "cdsTotal",
  cds_score: "cdsTotal",
  stai_trait: "staiTrait",
  staiy_trait: "staiTrait",
  trait_anxiety: "staiTrait",
  stai_state: "staiState",
  staiy_state: "staiState",
  state_anxiety: "staiState",
  phq9: "phq9Total",
  phq_9: "phq9Total",
  phq9_total: "phq9Total",
  phq9_score: "phq9Total",
  group: "group",
  qualitative_group: "group",
  cluster: "group",
  notes: "notes",
  note: "notes",
  comment: "notes",
};

function num(value: string | undefined): number | null {
  if (value === undefined || value === null) return null;
  const trimmed = String(value).trim();
  if (trimmed === "") return null;
  const n = Number(trimmed.replace(",", "."));
  if (Number.isNaN(n)) return null;
  return n;
}

function check(
  rowIndex: number,
  participantId: string | undefined,
  field: keyof typeof RANGES,
  value: number | null
): ImportIssue | null {
  if (value === null) return null;
  const range = RANGES[field];
  if (value < range.min || value > range.max) {
    return {
      rowIndex,
      participantId,
      severity: "error",
      message: `${field} = ${value} is outside the plausible range (${range.min}–${range.max}).`,
    };
  }
  return null;
}

export function validateImport(text: string): ImportPreview {
  const rows = parseCSV(text).filter((r) => r.some((cell) => cell.trim()));
  const issues: ImportIssue[] = [];
  if (rows.length === 0) {
    return {
      headers: [],
      rows: [],
      issues: [
        { rowIndex: -1, severity: "error", message: "The file is empty." },
      ],
      duplicateIds: [],
      summary: { total: 0, withCds: 0, withStai: 0, withPhq9: 0 },
    };
  }

  const rawHeaders = rows[0].map((h) => h.trim().toLowerCase());
  const mappedHeaders: Array<string | null> = rawHeaders.map(
    (h) => HEADER_ALIASES[h] ?? null
  );

  // Warn about unmapped columns.
  for (let i = 0; i < rawHeaders.length; i++) {
    if (mappedHeaders[i] === null && rawHeaders[i]) {
      issues.push({
        rowIndex: 0,
        severity: "warning",
        message: `Column "${rawHeaders[i]}" was not recognised and is ignored.`,
      });
    }
  }

  // Require participant_id at minimum.
  if (!mappedHeaders.includes("participantId")) {
    issues.push({
      rowIndex: 0,
      severity: "error",
      message:
        "Missing required column: participant_id (also accepted: id, participant).",
    });
  }

  const importedRows: ImportedRow[] = [];
  const idCounts = new Map<string, number>();

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const data: Record<string, string> = {};
    for (let j = 0; j < mappedHeaders.length; j++) {
      const mapped = mappedHeaders[j];
      if (mapped) data[mapped] = row[j]?.trim() ?? "";
    }
    const participantId = data.participantId?.trim() ?? "";
    if (!participantId) {
      issues.push({
        rowIndex: i,
        severity: "error",
        message: "Missing participant_id.",
      });
      continue;
    }
    idCounts.set(participantId, (idCounts.get(participantId) ?? 0) + 1);

    const imported: ImportedRow = {
      participantId,
      age: num(data.age),
      gender: data.gender ?? "",
      cdsTotal: num(data.cdsTotal),
      staiTrait: num(data.staiTrait),
      staiState: num(data.staiState),
      phq9Total: num(data.phq9Total),
      group: data.group ?? "",
      notes: data.notes ?? "",
      rowIndex: i,
    };
    importedRows.push(imported);

    for (const field of ["age", "cdsTotal", "staiTrait", "staiState", "phq9Total"] as const) {
      const issue = check(i, participantId, field, imported[field]);
      if (issue) issues.push(issue);
    }

    // Warn on missing core measures.
    if (imported.cdsTotal === null) {
      issues.push({
        rowIndex: i,
        participantId,
        severity: "warning",
        message: "CDS total is missing.",
      });
    }
    if (imported.staiTrait === null) {
      issues.push({
        rowIndex: i,
        participantId,
        severity: "warning",
        message: "STAI trait is missing.",
      });
    }
    if (imported.phq9Total === null) {
      issues.push({
        rowIndex: i,
        participantId,
        severity: "warning",
        message: "PHQ-9 total is missing.",
      });
    }
  }

  const duplicateIds = Array.from(idCounts.entries())
    .filter(([, c]) => c > 1)
    .map(([id]) => id);
  for (const id of duplicateIds) {
    issues.push({
      rowIndex: -1,
      participantId: id,
      severity: "error",
      message: `Duplicate participant_id: ${id} appears ${idCounts.get(id)} times.`,
    });
  }

  return {
    headers: rawHeaders,
    rows: importedRows,
    issues,
    duplicateIds,
    summary: {
      total: importedRows.length,
      withCds: importedRows.filter((r) => r.cdsTotal !== null).length,
      withStai: importedRows.filter((r) => r.staiTrait !== null).length,
      withPhq9: importedRows.filter((r) => r.phq9Total !== null).length,
    },
  };
}

// Maps the imported rows onto the existing ThesisParticipant schema.
// The schema uses three group labels — Clinical / Subclinical / Control.
// If the CSV provides its own group label we trust it; otherwise we
// derive it from PHQ-9 and STAI cutoffs (mild conservative defaults).
export function toThesisParticipants(preview: ImportPreview): ThesisParticipant[] {
  const now = new Date().toISOString();
  return preview.rows.map((r) => {
    const group =
      r.group === "Clinical" ||
      r.group === "Subclinical" ||
      r.group === "Control"
        ? r.group
        : deriveGroup(r);
    const hasAllCore =
      r.cdsTotal !== null && r.staiTrait !== null && r.phq9Total !== null;
    return {
      id: generateId(),
      code: r.participantId,
      age: r.age ?? 0,
      gender: r.gender || "Not specified",
      group,
      depressionScore: r.phq9Total,
      anxietyScore: r.staiTrait,
      depersonalizationScore: r.cdsTotal,
      derealizationScore: null,
      stressScore: r.staiState,
      emotionalRegulationScore: null,
      notes: r.notes,
      hasMissingData: !hasAllCore,
      createdAt: now,
    };
  });
}

function deriveGroup(
  r: ImportedRow
): "Clinical" | "Subclinical" | "Control" {
  // PHQ-9 ≥ 15 (moderately severe) OR STAI-Y trait ≥ 55 → Clinical.
  // PHQ-9 ≥ 10 OR STAI ≥ 45 → Subclinical.
  // Else Control.
  const phq = r.phq9Total;
  const stai = r.staiTrait;
  if ((phq !== null && phq >= 15) || (stai !== null && stai >= 55))
    return "Clinical";
  if ((phq !== null && phq >= 10) || (stai !== null && stai >= 45))
    return "Subclinical";
  return "Control";
}

// Example CSV the user can paste / download.
export const EXAMPLE_CSV =
  "participant_id,age,gender,CDS_total,STAI_trait,PHQ9_total,group,notes\n" +
  "P-001,22,F,82,58,14,Clinical,suivi en psychiatrie\n" +
  "P-002,25,M,12,30,4,Control,\n" +
  "P-003,28,F,55,49,11,Subclinical,\n";
