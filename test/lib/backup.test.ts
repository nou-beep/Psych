import { describe, it, expect } from "vitest";
import {
  buildFullBackup,
  buildSingleCaseBackup,
  validateBackup,
  parseBackupJSON,
  previewBackup,
  isResetConfirmed,
  RESET_CONFIRM_PHRASE,
  BACKUP_FORMAT_VERSION,
} from "@/lib/backup";

describe("buildFullBackup", () => {
  it("wraps source data with format envelope", () => {
    const backup = buildFullBackup({ a: [1, 2], b: { x: 1 } });
    expect(backup.format).toBe("psych-backup");
    expect(backup.version).toBe(BACKUP_FORMAT_VERSION);
    expect(backup.data).toEqual({ a: [1, 2], b: { x: 1 } });
    expect(() => new Date(backup.exportedAt).toISOString()).not.toThrow();
  });
});

describe("buildSingleCaseBackup", () => {
  it("includes the case + all of its related arrays", () => {
    const backup = buildSingleCaseBackup({
      caseId: "c1",
      caseCode: "CASE-T",
      case: { id: "c1", code: "CASE-T" },
      checkIns: [{ id: "i1", caseId: "c1", date: "2026-01-01" }],
      weeklyReviews: [],
      monthlyReviews: [],
    });
    expect(backup.format).toBe("psych-case-backup");
    expect(backup.caseId).toBe("c1");
    expect(backup.data.checkIns).toHaveLength(1);
    expect(backup.data.weeklyReviews).toEqual([]);
    expect(backup.data.sessions).toEqual([]);
    expect(backup.data.formulations).toEqual([]);
  });
});

describe("validateBackup", () => {
  it("accepts a valid full backup", () => {
    const full = buildFullBackup({});
    const result = validateBackup(full);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.kind).toBe("full");
  });

  it("accepts a valid single-case backup", () => {
    const single = buildSingleCaseBackup({
      caseId: "c1",
      case: {},
      checkIns: [],
      weeklyReviews: [],
      monthlyReviews: [],
    });
    const result = validateBackup(single);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.kind).toBe("single");
  });

  it("rejects non-object inputs", () => {
    expect(validateBackup(null).ok).toBe(false);
    expect(validateBackup("foo").ok).toBe(false);
    expect(validateBackup(42).ok).toBe(false);
  });

  it("rejects unknown formats", () => {
    const res = validateBackup({ format: "unknown", version: 1, data: {} });
    expect(res.ok).toBe(false);
  });

  it("rejects newer-version backups", () => {
    const res = validateBackup({
      format: "psych-backup",
      version: BACKUP_FORMAT_VERSION + 99,
      data: {},
      exportedAt: "now",
    });
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error).toMatch(/newer/i);
  });

  it("rejects single-case backup with missing caseId", () => {
    const res = validateBackup({
      format: "psych-case-backup",
      version: 1,
      exportedAt: "now",
      data: {},
    });
    expect(res.ok).toBe(false);
  });

  it("rejects when data block is missing", () => {
    const res = validateBackup({
      format: "psych-backup",
      version: 1,
      exportedAt: "now",
    });
    expect(res.ok).toBe(false);
  });
});

describe("parseBackupJSON", () => {
  it("rejects invalid JSON", () => {
    const res = parseBackupJSON("{not json");
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error).toMatch(/json/i);
  });

  it("parses a valid backup string", () => {
    const json = JSON.stringify(buildFullBackup({ x: [1] }));
    const res = parseBackupJSON(json);
    expect(res.ok).toBe(true);
  });
});

describe("previewBackup", () => {
  it("returns counts per array key for a full backup", () => {
    const full = buildFullBackup({
      cases: [{ a: 1 }, { a: 2 }],
      settings: { theme: "rose" },
      pinned: [],
    });
    const result = validateBackup(full);
    const preview = previewBackup(result);
    expect(preview).not.toBeNull();
    expect(preview!.itemCounts.cases).toBe(2);
    expect(preview!.itemCounts.settings).toBe(1);
    expect(preview!.itemCounts.pinned).toBe(0);
  });

  it("returns per-section counts for a single-case backup", () => {
    const single = buildSingleCaseBackup({
      caseId: "c1",
      case: {},
      checkIns: [{}, {}, {}],
      weeklyReviews: [{}],
      monthlyReviews: [],
    });
    const preview = previewBackup(validateBackup(single));
    expect(preview!.itemCounts.checkIns).toBe(3);
    expect(preview!.itemCounts.weeklyReviews).toBe(1);
    expect(preview!.itemCounts.case).toBe(1);
  });

  it("returns null when validation failed", () => {
    expect(previewBackup({ ok: false, error: "x" })).toBeNull();
  });
});

describe("reset confirmation", () => {
  it("only accepts the exact confirmation phrase", () => {
    expect(isResetConfirmed(RESET_CONFIRM_PHRASE)).toBe(true);
    expect(isResetConfirmed("  " + RESET_CONFIRM_PHRASE + "  ")).toBe(true);
    expect(isResetConfirmed("delete my data")).toBe(false);
    expect(isResetConfirmed("")).toBe(false);
  });
});
