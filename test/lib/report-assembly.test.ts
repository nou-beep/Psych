import { describe, it, expect } from "vitest";
import {
  assembleReport,
  inDateRange,
  isValidDateRange,
  reorderSections,
  updateSectionContent,
  removeSection,
  duplicateDraft,
  DEFAULT_SECTIONS,
  SECTION_LABELS,
  type AssemblyData,
  type AssemblyInput,
} from "@/lib/report-assembly";

function emptyData(): AssemblyData {
  return {
    cases: [],
    checkIns: [],
    weeklyReviews: [],
    monthlyReviews: [],
    assessments: [],
    sessions: [],
    sessionPlans: [],
    supervisionNotes: [],
    reflections: [],
    interventions: [],
    goals: [],
    transcripts: [],
    audioNotes: [],
    formulations: [],
  };
}

function baseCase() {
  return {
    id: "c1",
    code: "CASE-T",
    context: "Outpatient",
    presentingConcerns: "Anxiety",
    currentGoals: ["g1", "g2"],
    latestSummary: "Progressing",
  };
}

describe("inDateRange", () => {
  it("returns false for missing dates", () => {
    expect(
      inDateRange(undefined, { start: "2026-01-01", end: "2026-12-31" })
    ).toBe(false);
  });
  it("returns true for dates inside the inclusive range", () => {
    expect(
      inDateRange("2026-05-15", { start: "2026-01-01", end: "2026-12-31" })
    ).toBe(true);
    expect(
      inDateRange("2026-01-01", { start: "2026-01-01", end: "2026-12-31" })
    ).toBe(true);
    expect(
      inDateRange("2026-12-31", { start: "2026-01-01", end: "2026-12-31" })
    ).toBe(true);
  });
  it("returns false for dates outside the range", () => {
    expect(
      inDateRange("2025-12-31", { start: "2026-01-01", end: "2026-12-31" })
    ).toBe(false);
    expect(
      inDateRange("2027-01-01", { start: "2026-01-01", end: "2026-12-31" })
    ).toBe(false);
  });
});

describe("isValidDateRange", () => {
  it("rejects empty start/end", () => {
    expect(isValidDateRange({ start: "", end: "2026-01-01" })).toBe(false);
    expect(isValidDateRange({ start: "2026-01-01", end: "" })).toBe(false);
  });
  it("rejects inverted ranges", () => {
    expect(
      isValidDateRange({ start: "2026-12-31", end: "2026-01-01" })
    ).toBe(false);
  });
  it("accepts equal start and end", () => {
    expect(
      isValidDateRange({ start: "2026-05-01", end: "2026-05-01" })
    ).toBe(true);
  });
});

describe("assembleReport", () => {
  const range = { start: "2026-01-01", end: "2026-12-31" };

  it("throws on an invalid date range", () => {
    expect(() =>
      assembleReport({
        caseId: "c1",
        reportType: "weekly",
        dateRange: { start: "2026-12-31", end: "2026-01-01" },
        sectionTypes: ["case-summary"],
        data: emptyData(),
      })
    ).toThrow(/invalid date range/i);
  });

  it("returns the requested section types in order", () => {
    const input: AssemblyInput = {
      caseId: "c1",
      reportType: "weekly",
      dateRange: range,
      sectionTypes: ["case-summary", "current-goals", "presenting-concerns"],
      data: { ...emptyData(), cases: [baseCase()] },
    };
    const draft = assembleReport(input);
    expect(draft.sections.map((s) => s.type)).toEqual([
      "case-summary",
      "current-goals",
      "presenting-concerns",
    ]);
    expect(draft.sections.map((s) => s.order)).toEqual([0, 1, 2]);
  });

  it("includes provenance for each section", () => {
    const input: AssemblyInput = {
      caseId: "c1",
      reportType: "weekly",
      dateRange: range,
      sectionTypes: ["case-summary"],
      data: { ...emptyData(), cases: [baseCase()] },
    };
    const draft = assembleReport(input);
    expect(draft.sections[0].sources).toEqual([
      { kind: "case", id: "c1", label: "CASE-T" },
    ]);
  });

  it("filters check-ins to the case and date range", () => {
    const input: AssemblyInput = {
      caseId: "c1",
      reportType: "weekly",
      dateRange: { start: "2026-05-01", end: "2026-05-31" },
      sectionTypes: ["daily-checkins"],
      data: {
        ...emptyData(),
        cases: [baseCase()],
        checkIns: [
          { id: "in1", caseId: "c1", date: "2026-04-30", moodAffect: "out" },
          { id: "in2", caseId: "c1", date: "2026-05-10", moodAffect: "calm" },
          { id: "in3", caseId: "c1", date: "2026-05-20", moodAffect: "anx" },
          {
            id: "in4",
            caseId: "OTHER",
            date: "2026-05-15",
            moodAffect: "wrong",
          },
        ],
      },
    };
    const draft = assembleReport(input);
    const section = draft.sections[0];
    expect(section.content).toContain("2026-05-10");
    expect(section.content).toContain("2026-05-20");
    expect(section.content).not.toContain("2026-04-30");
    expect(section.content).not.toContain("wrong");
    expect(section.sources.map((s) => s.id)).toEqual(["in2", "in3"]);
  });

  it("emits a placeholder content for empty sections", () => {
    const input: AssemblyInput = {
      caseId: "c1",
      reportType: "weekly",
      dateRange: range,
      sectionTypes: ["daily-checkins"],
      data: { ...emptyData(), cases: [baseCase()] },
    };
    const draft = assembleReport(input);
    expect(draft.sections[0].content).toMatch(/no daily check-ins/i);
    expect(draft.sections[0].sources).toEqual([]);
  });

  it("picks the latest formulation by updatedAt", () => {
    const input: AssemblyInput = {
      caseId: "c1",
      reportType: "weekly",
      dateRange: range,
      sectionTypes: ["formulation"],
      data: {
        ...emptyData(),
        cases: [baseCase()],
        formulations: [
          {
            id: "f1",
            caseId: "c1",
            model: "5ps",
            title: "Old",
            sections: { Presenting: "old" },
            updatedAt: "2026-01-01T00:00:00Z",
          },
          {
            id: "f2",
            caseId: "c1",
            model: "cbt",
            title: "New",
            sections: { Situation: "new" },
            updatedAt: "2026-06-01T00:00:00Z",
          },
        ],
      },
    };
    const draft = assembleReport(input);
    expect(draft.sections[0].title).toContain("CBT");
    expect(draft.sections[0].sources[0].id).toBe("f2");
  });

  it("sets a default title that includes the case code", () => {
    const draft = assembleReport({
      caseId: "c1",
      reportType: "weekly",
      dateRange: range,
      sectionTypes: ["case-summary"],
      data: { ...emptyData(), cases: [baseCase()] },
    });
    expect(draft.title).toContain("CASE-T");
  });

  it("honors a custom title when provided", () => {
    const draft = assembleReport({
      caseId: "c1",
      reportType: "weekly",
      title: "My report",
      dateRange: range,
      sectionTypes: ["case-summary"],
      data: { ...emptyData(), cases: [baseCase()] },
    });
    expect(draft.title).toBe("My report");
  });
});

describe("draft mutations", () => {
  function makeDraft() {
    return assembleReport({
      caseId: "c1",
      reportType: "weekly",
      dateRange: { start: "2026-01-01", end: "2026-12-31" },
      sectionTypes: ["case-summary", "current-goals", "presenting-concerns"],
      data: { ...emptyData(), cases: [baseCase()] },
    });
  }

  it("reorderSections moves a section and reindexes order", () => {
    const draft = makeDraft();
    const result = reorderSections(draft.sections, 0, 2);
    expect(result.map((s) => s.type)).toEqual([
      "current-goals",
      "presenting-concerns",
      "case-summary",
    ]);
    expect(result.map((s) => s.order)).toEqual([0, 1, 2]);
  });

  it("reorderSections is a no-op when indices are equal or out of range", () => {
    const draft = makeDraft();
    expect(reorderSections(draft.sections, 1, 1)).toBe(draft.sections);
    expect(reorderSections(draft.sections, -1, 0)).toBe(draft.sections);
    expect(reorderSections(draft.sections, 0, 99)).toBe(draft.sections);
  });

  it("updateSectionContent marks the section as edited", () => {
    const draft = makeDraft();
    const target = draft.sections[0];
    const result = updateSectionContent(draft.sections, target.id, "rewrite");
    expect(result[0].content).toBe("rewrite");
    expect(result[0].edited).toBe(true);
    expect(result[1].edited).toBe(false);
  });

  it("removeSection drops the section and reindexes", () => {
    const draft = makeDraft();
    const target = draft.sections[1];
    const result = removeSection(draft.sections, target.id);
    expect(result).toHaveLength(2);
    expect(result.map((s) => s.order)).toEqual([0, 1]);
    expect(result.find((s) => s.id === target.id)).toBeUndefined();
  });

  it("duplicateDraft returns a new draft with new section ids", () => {
    const draft = makeDraft();
    const copy = duplicateDraft(draft);
    expect(copy.id).not.toBe(draft.id);
    expect(copy.title).toMatch(/copy/i);
    const originalIds = new Set(draft.sections.map((s) => s.id));
    for (const s of copy.sections) {
      expect(originalIds.has(s.id)).toBe(false);
    }
    expect(copy.sections.map((s) => s.type)).toEqual(
      draft.sections.map((s) => s.type)
    );
  });
});

describe("presets", () => {
  it("DEFAULT_SECTIONS covers every report-type label used in the app", () => {
    expect(DEFAULT_SECTIONS.daily.length).toBeGreaterThan(0);
    expect(DEFAULT_SECTIONS.weekly.length).toBeGreaterThan(0);
    expect(DEFAULT_SECTIONS.monthly.length).toBeGreaterThan(0);
    expect(DEFAULT_SECTIONS["final-long"].length).toBeGreaterThan(5);
  });

  it("every default section type has a human label", () => {
    for (const preset of Object.values(DEFAULT_SECTIONS)) {
      for (const type of preset) {
        expect(SECTION_LABELS[type]).toBeTruthy();
      }
    }
  });
});
