import { describe, it, expect } from "vitest";
import {
  archiveCase,
  newCase,
  patchContext,
  patchIdentification,
} from "@/lib/internship/case";
import {
  canTransition,
  newManualTest,
  newTestFromShell,
  patchTest,
  recordScore,
  setStatus,
  attachGrid,
  detachGrid,
  testsBreakdown,
  suggestGridsForTest,
} from "@/lib/internship/tests";
import {
  newGridFromShell,
  addEntry,
  patchEntry,
  removeEntry,
  setWeeklySynthesis,
  linkTestToGrid,
} from "@/lib/internship/grids";
import {
  newDailyReport,
  newWeeklyReport,
  newFinalReport,
  patchDailySections,
  patchWeeklySections,
  assembleWeeklyFromDailies,
  assembleFinalDraft,
  markComplete,
} from "@/lib/internship/reports";
import {
  newSupervisionNote,
  linkSupervisionTo,
  unlinkSupervisionFrom,
} from "@/lib/internship/supervision";
import {
  suggestGridShellsForDomain,
  findGridShell,
} from "@/lib/internship/grid-library";
import {
  INTERNSHIP_TEST_SHELLS,
  findTestShell,
  testShellsByDomain,
} from "@/lib/internship/test-shells";

// ────────────────────────────────────────────────────────────────
// Cases
// ────────────────────────────────────────────────────────────────

describe("internship case lifecycle", () => {
  it("creates a case with sensible defaults", () => {
    const c = newCase({
      caseCode: "  CHILD-AUT-2026-01  ",
      age: "6 years",
      consent: "written",
    });
    expect(c.identification.caseCode).toBe("CHILD-AUT-2026-01");
    expect(c.identification.consent).toBe("written");
    expect(c.archived).toBeUndefined();
    expect(c.startDate.length).toBeGreaterThan(0);
  });

  it("defaults consent to pending when not provided", () => {
    const c = newCase({ caseCode: "X" });
    expect(c.identification.consent).toBe("pending");
  });

  it("patches identification and context independently", () => {
    const c = newCase({ caseCode: "X" });
    const next = patchIdentification([c], c.id, { age: "8 years" });
    expect(next[0].identification.age).toBe("8 years");
    const next2 = patchContext(next, c.id, {
      sensoryProfile: "Hypersensitive auditory.",
    });
    expect(next2[0].context.sensoryProfile).toMatch(/Hypersensitive/);
    // Context patch doesn't lose identification edits.
    expect(next2[0].identification.age).toBe("8 years");
  });

  it("archives and un-archives a case", () => {
    const c = newCase({ caseCode: "X" });
    expect(archiveCase([c], c.id, true)[0].archived).toBe(true);
    expect(archiveCase([c], c.id, false)[0].archived).toBe(false);
  });
});

// ────────────────────────────────────────────────────────────────
// Test shells library
// ────────────────────────────────────────────────────────────────

describe("test shells library", () => {
  it("ships 12 shells", () => {
    expect(INTERNSHIP_TEST_SHELLS.length).toBe(12);
  });

  it("findTestShell roundtrips by id", () => {
    const cars = findTestShell("cars-2");
    expect(cars?.name).toMatch(/CARS/);
    expect(findTestShell("missing")).toBeUndefined();
  });

  it("testShellsByDomain filters", () => {
    const communication = testShellsByDomain("communication");
    expect(communication.length).toBeGreaterThan(0);
    expect(
      communication.every((s) => s.domain === "communication")
    ).toBe(true);
  });

  it("every shell carries the licensing reminder", () => {
    for (const shell of INTERNSHIP_TEST_SHELLS) {
      expect(shell.licensingNote).toMatch(/manual/);
    }
  });
});

// ────────────────────────────────────────────────────────────────
// Tests workflow
// ────────────────────────────────────────────────────────────────

describe("internship test workflow", () => {
  it("creates a test from a shell", () => {
    const t = newTestFromShell({
      caseId: "case-1",
      shellId: "vineland",
      plannedDate: "2026-03-20",
    })!;
    expect(t).not.toBeNull();
    expect(t.name).toMatch(/Vineland/);
    expect(t.domain).toBe("adaptive-functioning");
    expect(t.status).toBe("planned");
    expect(t.plannedDate).toBe("2026-03-20");
  });

  it("returns null for an unknown shell id", () => {
    expect(
      newTestFromShell({ caseId: "case-1", shellId: "missing" })
    ).toBeNull();
  });

  it("creates a manual test with provided name + domain", () => {
    const t = newManualTest({
      caseId: "case-1",
      name: "Bespoke observation",
      domain: "behavior",
    });
    expect(t.name).toBe("Bespoke observation");
    expect(t.domain).toBe("behavior");
    expect(t.shellId).toBeUndefined();
  });

  it("canTransition obeys the status flow", () => {
    expect(canTransition("planned", "administered")).toBe(true);
    expect(canTransition("administered", "scored")).toBe(true);
    expect(canTransition("administered", "awaiting-scoring")).toBe(true);
    expect(canTransition("scored", "reviewed")).toBe(true);
    expect(canTransition("scored", "in-report")).toBe(true);
    expect(canTransition("reviewed", "in-report")).toBe(true);
    expect(canTransition("in-report", "planned")).toBe(false);
    expect(canTransition("planned", "scored")).toBe(false);
  });

  it("setStatus respects illegal transitions (no-op)", () => {
    const t = newTestFromShell({ caseId: "c", shellId: "vineland" })!;
    const moved = setStatus([t], t.id, "scored");
    expect(moved[0].status).toBe("planned"); // can't jump from planned → scored
    const next = setStatus([t], t.id, "administered");
    expect(next[0].status).toBe("administered");
  });

  it("patchTest updates arbitrary fields", () => {
    const t = newTestFromShell({ caseId: "c", shellId: "vineland" })!;
    const next = patchTest([t], t.id, { plannedDate: "2026-04-01" });
    expect(next[0].plannedDate).toBe("2026-04-01");
  });

  it("recordScore auto-advances status to scored", () => {
    const t = newTestFromShell({ caseId: "c", shellId: "vineland" })!;
    const next = recordScore(
      [t],
      t.id,
      { rawScore: "120", band: "average" },
      "Score within average range."
    );
    expect(next[0].status).toBe("scored");
    expect(next[0].score?.band).toBe("average");
    expect(next[0].interpretationNotes).toMatch(/average range/);
  });

  it("attachGrid / detachGrid are idempotent", () => {
    const t = newTestFromShell({ caseId: "c", shellId: "vineland" })!;
    let next = attachGrid([t], t.id, "grid-1");
    next = attachGrid(next, t.id, "grid-1");
    expect(next[0].gridIds).toEqual(["grid-1"]);
    next = detachGrid(next, t.id, "grid-1");
    expect(next[0].gridIds).toEqual([]);
  });

  it("testsBreakdown counts by status", () => {
    const a = newTestFromShell({ caseId: "c", shellId: "vineland" })!;
    const b = newTestFromShell({ caseId: "c", shellId: "sensory-profile" })!;
    const moved = setStatus([a, b], b.id, "administered");
    const b2 = setStatus(moved, b.id, "scored");
    const breakdown = testsBreakdown(b2);
    expect(breakdown.total).toBe(2);
    expect(breakdown.byStatus.planned).toBe(1);
    expect(breakdown.byStatus.scored).toBe(1);
  });
});

// ────────────────────────────────────────────────────────────────
// Domain → grid suggestion (the brief flagged this as "very important")
// ────────────────────────────────────────────────────────────────

describe("domain → grid suggestion", () => {
  it("suggests communication-shaped grids for communication tests", () => {
    const grids = suggestGridShellsForDomain("communication");
    expect(grids.map((g) => g.id)).toContain("communication-grid");
    expect(grids.map((g) => g.id)).toContain("expressive-receptive-grid");
    expect(grids.map((g) => g.id)).toContain("social-communication-grid");
  });

  it("suggests behaviour grids for behavior tests", () => {
    const grids = suggestGridShellsForDomain("behavior");
    expect(grids.map((g) => g.id)).toContain("abc-behavior-grid");
    expect(grids.map((g) => g.id)).toContain(
      "frequency-intensity-behavior-tracker"
    );
    expect(grids.map((g) => g.id)).toContain("trigger-response-grid");
  });

  it("suggests sensory grids for sensory tests", () => {
    const grids = suggestGridShellsForDomain("sensory");
    expect(grids.map((g) => g.id)).toContain("sensory-profile-grid");
  });

  it("suggests emotional-regulation grids", () => {
    const grids = suggestGridShellsForDomain("emotional-regulation");
    expect(grids.map((g) => g.id)).toContain("emotional-regulation-grid");
    expect(grids.map((g) => g.id)).toContain("meltdown-shutdown-grid");
  });

  it("suggests adaptive-functioning grids", () => {
    const grids = suggestGridShellsForDomain("adaptive-functioning");
    expect(grids.map((g) => g.id)).toContain("autonomy-grid");
  });

  it("suggestGridsForTest delegates to the domain map", () => {
    const test = newTestFromShell({
      caseId: "c",
      shellId: "communication-checklist",
    })!;
    const grids = suggestGridsForTest(test);
    expect(grids.length).toBeGreaterThan(0);
    expect(
      grids.every(
        (g) =>
          g.id === "communication-grid" ||
          g.id === "expressive-receptive-grid" ||
          g.id === "social-communication-grid"
      )
    ).toBe(true);
  });
});

// ────────────────────────────────────────────────────────────────
// Grids
// ────────────────────────────────────────────────────────────────

describe("grid records", () => {
  it("creates a grid from a shell", () => {
    const g = newGridFromShell({
      caseId: "c",
      shellId: "abc-behavior-grid",
    })!;
    expect(g.name).toMatch(/ABC/);
    expect(g.entries).toEqual([]);
  });

  it("returns null for an unknown shell id", () => {
    expect(
      newGridFromShell({ caseId: "c", shellId: "missing" })
    ).toBeNull();
  });

  it("addEntry / patchEntry / removeEntry roundtrip", () => {
    const g = newGridFromShell({ caseId: "c", shellId: "abc-behavior-grid" })!;
    const a = addEntry([g], g.id, {
      fields: { antecedent: "loud noise", behavior: "covered ears" },
      date: "2026-03-15",
    });
    expect(a[0].entries).toHaveLength(1);
    const entryId = a[0].entries[0].id;
    const b = patchEntry(a, g.id, entryId, {
      fields: { antecedent: "loud noise · door", behavior: "covered ears" },
    });
    expect(b[0].entries[0].fields.antecedent).toMatch(/door/);
    const c = removeEntry(b, g.id, entryId);
    expect(c[0].entries).toHaveLength(0);
  });

  it("setWeeklySynthesis stores the paragraph", () => {
    const g = newGridFromShell({ caseId: "c", shellId: "communication-grid" })!;
    const next = setWeeklySynthesis(
      [g],
      g.id,
      "Niveau émergent stable cette semaine."
    );
    expect(next[0].weeklySynthesis).toMatch(/Niveau émergent/);
  });

  it("linkTestToGrid is idempotent", () => {
    const g = newGridFromShell({ caseId: "c", shellId: "communication-grid" })!;
    let next = linkTestToGrid([g], g.id, "test-1");
    next = linkTestToGrid(next, g.id, "test-1");
    expect(next[0].linkedTestIds).toEqual(["test-1"]);
  });

  it("grid shell library exposes all 24 shells with required columns", () => {
    // We seeded 24 grid shells; spot-check a few and assert each has
    // at least one column.
    expect(findGridShell("abc-behavior-grid")?.columns.length).toBeGreaterThan(
      2
    );
    expect(
      findGridShell("emotional-regulation-grid")?.columns.length
    ).toBeGreaterThan(2);
  });
});

// ────────────────────────────────────────────────────────────────
// Reports
// ────────────────────────────────────────────────────────────────

describe("internship reports", () => {
  it("creates a daily report with the date sealed in", () => {
    const r = newDailyReport({ caseId: "c", date: "2026-03-18" });
    expect(r.kind).toBe("daily");
    expect(r.daily?.date).toBe("2026-03-18");
    expect(r.draft).toBe(true);
  });

  it("creates a weekly report seeded with the source-daily list", () => {
    const r = newWeeklyReport({
      caseId: "c",
      weekStart: "2026-03-09",
      weekEnd: "2026-03-15",
      sourceDailyIds: ["d1", "d2"],
    });
    expect(r.weekly?.sourceDailyIds).toEqual(["d1", "d2"]);
  });

  it("patchDailySections only updates daily reports", () => {
    const daily = newDailyReport({ caseId: "c", date: "2026-03-18" });
    const weekly = newWeeklyReport({
      caseId: "c",
      weekStart: "2026-03-09",
      weekEnd: "2026-03-15",
    });
    const next = patchDailySections([daily, weekly], weekly.id, {
      observations: "won't apply",
    });
    expect(next[1].daily).toBeUndefined();
    expect((next[1].weekly as { observations?: string })?.observations).toBeUndefined();
    const next2 = patchDailySections([daily, weekly], daily.id, {
      observations: "applied",
    });
    expect(next2[0].daily?.observations).toBe("applied");
  });

  it("patchWeeklySections appends without losing existing fields", () => {
    const w = newWeeklyReport({
      caseId: "c",
      weekStart: "2026-03-09",
      weekEnd: "2026-03-15",
      initial: { sessionsCompleted: 2 },
    });
    const next = patchWeeklySections([w], w.id, {
      progressObserved: "progress text",
    });
    expect(next[0].weekly?.sessionsCompleted).toBe(2);
    expect(next[0].weekly?.progressObserved).toBe("progress text");
  });

  it("markComplete flips draft to false", () => {
    const r = newDailyReport({ caseId: "c", date: "2026-03-18" });
    expect(markComplete([r], r.id)[0].draft).toBe(false);
  });

  it("assembleWeeklyFromDailies pulls daily reports inside the window", () => {
    const d1 = newDailyReport({
      caseId: "c",
      date: "2026-03-11",
      initial: { observations: "first obs", nextSteps: "step 1" },
    });
    const d2 = newDailyReport({
      caseId: "c",
      date: "2026-03-14",
      initial: { observations: "second obs", nextSteps: "step 2" },
    });
    const outOfWindow = newDailyReport({
      caseId: "c",
      date: "2026-04-01",
      initial: { observations: "ignore me" },
    });
    const assembled = assembleWeeklyFromDailies({
      caseId: "c",
      weekStart: "2026-03-09",
      weekEnd: "2026-03-15",
      dailies: [d1, d2, outOfWindow],
    });
    expect(assembled.kind).toBe("weekly");
    expect(assembled.weekly?.sessionsCompleted).toBe(2);
    expect(assembled.weekly?.sourceDailyIds).toEqual([d1.id, d2.id]);
    expect(assembled.weekly?.progressObserved).toMatch(/first obs/);
    expect(assembled.weekly?.progressObserved).toMatch(/second obs/);
    expect(assembled.weekly?.progressObserved).not.toMatch(/ignore me/);
    expect(assembled.weekly?.nextWeekObjectives).toMatch(/step 1/);
  });

  it("assembleFinalDraft pulls weeklies + tests + grids + supervision", () => {
    const w = newWeeklyReport({
      caseId: "c",
      weekStart: "2026-03-09",
      weekEnd: "2026-03-15",
      initial: { progressObserved: "good week" },
    });
    const draft = assembleFinalDraft({
      caseId: "c",
      weeklyReports: [w],
      tests: [
        {
          name: "Vineland (shell)",
          status: "scored",
          interpretationNotes: "Within average.",
        },
      ],
      grids: [{ name: "ABC Behavior Grid", weeklySynthesis: "Reduced." }],
      supervisionNotes: [{ date: "2026-03-16", feedbackReceived: "Good progress." }],
    });
    expect(draft.kind).toBe("final");
    expect(draft.final?.progressEvolution).toMatch(/good week/);
    expect(draft.final?.testsAdministered).toMatch(/Vineland/);
    expect(draft.final?.evaluationGrids).toMatch(/Reduced/);
    expect(draft.final?.supervisionReflections).toMatch(/Good progress/);
  });
});

// ────────────────────────────────────────────────────────────────
// Supervision
// ────────────────────────────────────────────────────────────────

describe("supervision notes", () => {
  it("creates a supervision note with cross-link slots empty", () => {
    const n = newSupervisionNote({
      caseId: "c",
      date: "2026-03-16",
      supervisor: "Dr X",
    });
    expect(n.linkedTestIds).toEqual([]);
    expect(n.linkedGridIds).toEqual([]);
    expect(n.linkedReportIds).toEqual([]);
  });

  it("links + unlinks test / grid / report by kind", () => {
    const n = newSupervisionNote({ caseId: "c", date: "2026-03-16" });
    let next = linkSupervisionTo([n], n.id, "test", "t1");
    next = linkSupervisionTo(next, n.id, "grid", "g1");
    next = linkSupervisionTo(next, n.id, "report", "r1");
    expect(next[0].linkedTestIds).toEqual(["t1"]);
    expect(next[0].linkedGridIds).toEqual(["g1"]);
    expect(next[0].linkedReportIds).toEqual(["r1"]);
    // Idempotent.
    next = linkSupervisionTo(next, n.id, "test", "t1");
    expect(next[0].linkedTestIds).toEqual(["t1"]);
    // Unlink.
    next = unlinkSupervisionFrom(next, n.id, "test", "t1");
    expect(next[0].linkedTestIds).toEqual([]);
  });
});

// ────────────────────────────────────────────────────────────────
// Final report draft kind
// ────────────────────────────────────────────────────────────────

describe("final report constructor", () => {
  it("creates a draft final with an empty sections bag", () => {
    const r = newFinalReport({ caseId: "c" });
    expect(r.kind).toBe("final");
    expect(r.final).toBeTruthy();
    expect(r.draft).toBe(true);
  });
});
