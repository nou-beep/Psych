// Backup & Export system — pure logic for exporting/importing Psych data
// to/from JSON. Handles single-case export, full-app export, validation
// for imports, and a safe-merge strategy. No I/O; the caller is responsible
// for actually reading/writing localStorage or files.

import { STORE_KEYS } from "@/lib/store";

export const BACKUP_FORMAT_VERSION = 1;

export interface PsychBackup {
  format: "psych-backup";
  version: number;
  exportedAt: string;
  data: Record<string, unknown>;
  meta?: {
    appVersion?: string;
    caseCount?: number;
    note?: string;
  };
}

export interface SingleCaseBackup {
  format: "psych-case-backup";
  version: number;
  exportedAt: string;
  caseId: string;
  caseCode?: string;
  data: {
    case: unknown;
    checkIns: unknown[];
    weeklyReviews: unknown[];
    monthlyReviews: unknown[];
    assessments: unknown[];
    sessions: unknown[];
    sessionPlans: unknown[];
    supervisionNotes: unknown[];
    reflections: unknown[];
    interventions: unknown[];
    transcripts: unknown[];
    audioNotes: unknown[];
    formulations: unknown[];
    goals: unknown[];
    files: unknown[];
    consent: unknown[];
  };
}

// All known top-level keys exported by buildFullBackup.
export const FULL_BACKUP_KEYS = [
  STORE_KEYS.CASES,
  STORE_KEYS.CHECKINS,
  STORE_KEYS.WEEKLY,
  STORE_KEYS.MONTHLY,
  STORE_KEYS.ASSESSMENTS,
  STORE_KEYS.SUPERVISION,
  STORE_KEYS.GOALS,
  STORE_KEYS.TRANSCRIPTS,
  STORE_KEYS.FILES,
  STORE_KEYS.SESSIONS,
  STORE_KEYS.PINNED,
  "psych-participants-v2",
  // Clinical store keys
  "clinical_reflections",
  "clinical_plans",
  "clinical_interventions",
  "clinical_consent",
  "clinical_audio_notes",
  "clinical_formulations",
  "clinical_terminology",
  "clinical_workbooks",
  // Thesis store keys
  "thesis_participants",
  "thesis_design",
  "thesis_notes",
  "thesis_report",
  // Settings + accessibility
  "psych-settings",
  "psych-accessibility-v1",
  "psych-report-drafts-v1",
  "psych-formulation-snapshots-v1",
] as const;

// ── Build / parse ──

export function buildFullBackup(
  source: Record<string, unknown>,
  meta?: PsychBackup["meta"]
): PsychBackup {
  return {
    format: "psych-backup",
    version: BACKUP_FORMAT_VERSION,
    exportedAt: new Date().toISOString(),
    data: { ...source },
    meta,
  };
}

export function buildSingleCaseBackup(input: {
  caseId: string;
  caseCode?: string;
  case: unknown;
  checkIns: unknown[];
  weeklyReviews: unknown[];
  monthlyReviews: unknown[];
  assessments?: unknown[];
  sessions?: unknown[];
  sessionPlans?: unknown[];
  supervisionNotes?: unknown[];
  reflections?: unknown[];
  interventions?: unknown[];
  transcripts?: unknown[];
  audioNotes?: unknown[];
  formulations?: unknown[];
  goals?: unknown[];
  files?: unknown[];
  consent?: unknown[];
}): SingleCaseBackup {
  return {
    format: "psych-case-backup",
    version: BACKUP_FORMAT_VERSION,
    exportedAt: new Date().toISOString(),
    caseId: input.caseId,
    caseCode: input.caseCode,
    data: {
      case: input.case,
      checkIns: input.checkIns,
      weeklyReviews: input.weeklyReviews,
      monthlyReviews: input.monthlyReviews,
      assessments: input.assessments ?? [],
      sessions: input.sessions ?? [],
      sessionPlans: input.sessionPlans ?? [],
      supervisionNotes: input.supervisionNotes ?? [],
      reflections: input.reflections ?? [],
      interventions: input.interventions ?? [],
      transcripts: input.transcripts ?? [],
      audioNotes: input.audioNotes ?? [],
      formulations: input.formulations ?? [],
      goals: input.goals ?? [],
      files: input.files ?? [],
      consent: input.consent ?? [],
    },
  };
}

// ── Validation ──

export type ValidationResult =
  | { ok: true; kind: "full"; backup: PsychBackup }
  | { ok: true; kind: "single"; backup: SingleCaseBackup }
  | { ok: false; error: string };

export function validateBackup(raw: unknown): ValidationResult {
  if (raw === null || typeof raw !== "object") {
    return { ok: false, error: "Backup must be a JSON object." };
  }
  const obj = raw as Record<string, unknown>;

  if (obj.format === "psych-backup") {
    if (typeof obj.version !== "number") {
      return { ok: false, error: "Missing or invalid version." };
    }
    if (obj.version > BACKUP_FORMAT_VERSION) {
      return {
        ok: false,
        error: `Backup version ${obj.version} is newer than this app supports (${BACKUP_FORMAT_VERSION}).`,
      };
    }
    if (!obj.data || typeof obj.data !== "object") {
      return { ok: false, error: "Missing data block." };
    }
    return { ok: true, kind: "full", backup: obj as unknown as PsychBackup };
  }

  if (obj.format === "psych-case-backup") {
    if (typeof obj.version !== "number") {
      return { ok: false, error: "Missing or invalid version." };
    }
    if (obj.version > BACKUP_FORMAT_VERSION) {
      return {
        ok: false,
        error: `Case backup version ${obj.version} is newer than this app supports.`,
      };
    }
    if (typeof obj.caseId !== "string" || !obj.caseId) {
      return { ok: false, error: "Single-case backup missing caseId." };
    }
    if (!obj.data || typeof obj.data !== "object") {
      return { ok: false, error: "Missing data block." };
    }
    return {
      ok: true,
      kind: "single",
      backup: obj as unknown as SingleCaseBackup,
    };
  }

  return {
    ok: false,
    error:
      "Unrecognised format — expected 'psych-backup' or 'psych-case-backup'.",
  };
}

export function parseBackupJSON(text: string): ValidationResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { ok: false, error: "File is not valid JSON." };
  }
  return validateBackup(parsed);
}

// ── Preview ──

export interface BackupPreview {
  exportedAt: string;
  format: string;
  version: number;
  itemCounts: Record<string, number>;
}

export function previewBackup(
  result: ValidationResult
): BackupPreview | null {
  if (!result.ok) return null;
  if (result.kind === "full") {
    const counts: Record<string, number> = {};
    for (const [k, v] of Object.entries(result.backup.data)) {
      if (Array.isArray(v)) counts[k] = v.length;
      else if (v && typeof v === "object") counts[k] = 1;
    }
    return {
      exportedAt: result.backup.exportedAt,
      format: result.backup.format,
      version: result.backup.version,
      itemCounts: counts,
    };
  }
  const data = result.backup.data;
  return {
    exportedAt: result.backup.exportedAt,
    format: result.backup.format,
    version: result.backup.version,
    itemCounts: {
      case: data.case ? 1 : 0,
      checkIns: data.checkIns.length,
      weeklyReviews: data.weeklyReviews.length,
      monthlyReviews: data.monthlyReviews.length,
      assessments: data.assessments.length,
      sessions: data.sessions.length,
      sessionPlans: data.sessionPlans.length,
      supervisionNotes: data.supervisionNotes.length,
      reflections: data.reflections.length,
      interventions: data.interventions.length,
      transcripts: data.transcripts.length,
      audioNotes: data.audioNotes.length,
      formulations: data.formulations.length,
      goals: data.goals.length,
      files: data.files.length,
      consent: data.consent.length,
    },
  };
}

// ── Reset confirmation ──

// The reset flow is deliberately a two-step confirmation. The UI must
// pass a literal phrase that matches RESET_CONFIRM_PHRASE before any
// destructive op runs.
export const RESET_CONFIRM_PHRASE = "DELETE MY DATA";

export function isResetConfirmed(text: string): boolean {
  return text.trim() === RESET_CONFIRM_PHRASE;
}
