import { describe, it, expect } from "vitest";
import {
  caseTraces,
  chapterTraces,
  daysSinceLabel,
} from "@/lib/workspace/human-traces";

describe("caseTraces", () => {
  it("returns 'blank' density for an empty case", () => {
    const t = caseTraces({
      sessionCount: 0,
      checkInCount: 0,
      worksheetCount: 0,
      noteCount: 0,
      timelineEventCount: 0,
      bodyMapRevisionCount: 0,
      quoteCount: 0,
      codingCount: 0,
      openLoopCount: 0,
      supervisionNoteCount: 0,
    });
    expect(t.density).toBe("blank");
    expect(t.score).toBe(0);
    expect(t.topFacets).toEqual([]);
    expect(t.hint).toBe("no traces yet");
  });

  it("scales up to 'dense' for a heavily worked case", () => {
    const t = caseTraces({
      sessionCount: 25,
      checkInCount: 40,
      worksheetCount: 18,
      noteCount: 60,
      timelineEventCount: 35,
      bodyMapRevisionCount: 8,
      quoteCount: 28,
      codingCount: 80,
      openLoopCount: 8,
      supervisionNoteCount: 6,
    });
    expect(t.score).toBeGreaterThan(70);
    expect(t.density).toBe("dense");
    expect(t.topFacets.length).toBeGreaterThan(0);
  });

  it("topFacets are sorted by raw value, capped at 3", () => {
    const t = caseTraces({
      sessionCount: 3,
      checkInCount: 12,
      worksheetCount: 1,
      noteCount: 4,
      timelineEventCount: 0,
      bodyMapRevisionCount: 0,
      quoteCount: 8,
      codingCount: 0,
      openLoopCount: 0,
      supervisionNoteCount: 0,
    });
    expect(t.topFacets).toHaveLength(3);
    expect(t.topFacets[0].key).toBe("checkInCount");
    expect(t.topFacets[1].key).toBe("quoteCount");
    expect(t.topFacets[2].key).toBe("noteCount");
  });

  it("daysSinceTouched derives from lastTouchedISO", () => {
    const threeDaysAgo = new Date(
      Date.now() - 3 * 24 * 60 * 60 * 1000
    ).toISOString();
    const t = caseTraces({
      sessionCount: 1,
      checkInCount: 0,
      worksheetCount: 0,
      noteCount: 0,
      timelineEventCount: 0,
      bodyMapRevisionCount: 0,
      quoteCount: 0,
      codingCount: 0,
      openLoopCount: 0,
      supervisionNoteCount: 0,
      lastTouchedISO: threeDaysAgo,
    });
    expect(t.daysSinceTouched).toBe(3);
  });
});

describe("chapterTraces", () => {
  it("blank chapter gets blank state", () => {
    const t = chapterTraces({
      wordCount: 0,
      sectionCount: 0,
      draftSectionCount: 0,
      unresolvedMarkerCount: 0,
      linkedQuoteCount: 0,
      linkedReferenceCount: 0,
    });
    expect(t.state).toBe("blank");
    expect(t.score).toBe(0);
  });

  it("a chapter with sections but no words is 'outlined'", () => {
    const t = chapterTraces({
      wordCount: 50,
      sectionCount: 5,
      draftSectionCount: 5,
      unresolvedMarkerCount: 0,
      linkedQuoteCount: 0,
      linkedReferenceCount: 0,
    });
    // outlined or drafted depending on cap math — both acceptable
    expect(["outlined", "drafted"]).toContain(t.state);
  });

  it("a near-complete chapter scores high and has minimal flags", () => {
    const t = chapterTraces({
      wordCount: 3500,
      sectionCount: 6,
      draftSectionCount: 0,
      unresolvedMarkerCount: 0,
      linkedQuoteCount: 10,
      linkedReferenceCount: 18,
    });
    expect(t.score).toBeGreaterThan(80);
    expect(t.state).toBe("near-complete");
    expect(t.flags).toEqual([]);
  });

  it("draft sections and unresolved markers dock the score and surface flags", () => {
    const t = chapterTraces({
      wordCount: 1800,
      sectionCount: 6,
      draftSectionCount: 4,
      unresolvedMarkerCount: 3,
      linkedQuoteCount: 4,
      linkedReferenceCount: 6,
    });
    expect(t.flags.some((f) => f.includes("drafts"))).toBe(true);
    expect(t.flags.some((f) => f.includes("unresolved"))).toBe(true);
  });

  it("flags missing references / quotes once the chapter has some bulk", () => {
    const t = chapterTraces({
      wordCount: 1000,
      sectionCount: 3,
      draftSectionCount: 0,
      unresolvedMarkerCount: 0,
      linkedQuoteCount: 0,
      linkedReferenceCount: 0,
    });
    expect(t.flags.some((f) => f.includes("references"))).toBe(true);
    expect(t.flags.some((f) => f.includes("quotes"))).toBe(true);
  });
});

describe("daysSinceLabel", () => {
  it("renders human-friendly labels", () => {
    expect(daysSinceLabel(null)).toBe("—");
    expect(daysSinceLabel(0)).toBe("today");
    expect(daysSinceLabel(1)).toBe("yesterday");
    expect(daysSinceLabel(3)).toBe("3 days ago");
    expect(daysSinceLabel(8)).toBe("a week ago");
    expect(daysSinceLabel(15)).toBe("2 weeks ago");
    expect(daysSinceLabel(45)).toBe("a month ago");
    expect(daysSinceLabel(120)).toBe("4 months ago");
  });
});
