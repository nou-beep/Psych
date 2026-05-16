import { describe, it, expect } from "vitest";
import {
  OPEN_LOOP_LABELS,
  buildOpenLoops,
  loopsForCase,
  summarise,
} from "@/lib/research/open-loops";

describe("buildOpenLoops", () => {
  it("returns nothing for an empty input", () => {
    expect(buildOpenLoops({})).toEqual([]);
  });

  it("emits unfinished reports as report loops", () => {
    const loops = buildOpenLoops({
      reportDrafts: [
        { id: "r1", title: "Weekly draft", updatedAt: "2026-05-01T00:00:00Z" },
      ],
    });
    expect(loops).toHaveLength(1);
    expect(loops[0].kind).toBe("unfinished-report");
  });

  it("flags partially-filled formulations only", () => {
    const loops = buildOpenLoops({
      formulations: [
        {
          id: "f1",
          caseId: "c1",
          sections: { Presenting: "anxiety", Predisposing: "" },
          updatedAt: "2026-05-01T00:00:00Z",
        },
        {
          id: "f2",
          caseId: "c1",
          sections: { a: "x", b: "y" },
          updatedAt: "2026-05-02T00:00:00Z",
        },
      ],
    });
    expect(loops.map((l) => l.id)).toEqual(["fr-f1"]);
  });

  it("flags supervision notes with action plans but missing topics", () => {
    const loops = buildOpenLoops({
      supervisionNotes: [
        {
          id: "s1",
          caseId: "c1",
          date: "2026-05-01",
          actionPlan: "follow up next session",
        },
        {
          id: "s2",
          caseId: "c1",
          date: "2026-05-02",
          actionPlan: "ok",
          mainTopics: "alliance",
        },
      ],
    });
    expect(loops.map((l) => l.id)).toEqual(["sup-s1"]);
  });

  it("flags exploring / needs-further-assessment hypotheses", () => {
    const loops = buildOpenLoops({
      hypotheses: [
        {
          id: "h1",
          caseId: "c1",
          title: "GAD with avoidance",
          status: "exploring",
          updatedAt: "2026-05-01T00:00:00Z",
        },
        {
          id: "h2",
          caseId: "c1",
          title: "Adjustment",
          status: "supported",
          updatedAt: "2026-05-02T00:00:00Z",
        },
      ],
    });
    expect(loops.map((l) => l.kind)).toEqual(["unresolved-hypothesis"]);
  });

  it("flags transcripts with uncoded excerpts", () => {
    const loops = buildOpenLoops({
      uncodedExcerpts: [
        {
          transcriptId: "t1",
          transcriptTitle: "Intake transcript",
          excerptCount: 3,
          updatedAt: "2026-05-02T00:00:00Z",
        },
        {
          transcriptId: "t2",
          transcriptTitle: "Done",
          excerptCount: 0,
          updatedAt: "2026-05-02T00:00:00Z",
        },
      ],
    });
    expect(loops).toHaveLength(1);
    expect(loops[0].kind).toBe("pending-coding");
  });

  it("ranks heaviest first; tie-break by longest open", () => {
    const loops = buildOpenLoops({
      hypotheses: [
        {
          id: "h1",
          caseId: "c1",
          title: "newer hypothesis",
          status: "exploring",
          updatedAt: "2026-06-01T00:00:00Z",
        },
      ],
      reportDrafts: [
        {
          id: "r1",
          title: "old report",
          updatedAt: "2026-01-01T00:00:00Z",
        },
      ],
    });
    // Hypothesis has weight 3, report has weight 2 — hypothesis first.
    expect(loops[0].kind).toBe("unresolved-hypothesis");
    expect(loops[1].kind).toBe("unfinished-report");
  });

  it("does not crash on malformed inputs", () => {
    expect(() =>
      buildOpenLoops({
        formulations: [
          { id: "f", caseId: "c1", sections: undefined as never, updatedAt: "x" },
        ],
      })
    ).not.toThrow();
  });
});

describe("loopsForCase + summarise", () => {
  it("loopsForCase narrows by case id", () => {
    const loops = buildOpenLoops({
      reportDrafts: [
        { id: "r1", title: "A", caseId: "c1", updatedAt: "x" },
        { id: "r2", title: "B", caseId: "c2", updatedAt: "x" },
      ],
    });
    expect(loopsForCase(loops, "c1")).toHaveLength(1);
  });

  it("summarise returns totals, byKind, and the top kind", () => {
    const loops = buildOpenLoops({
      reportDrafts: [
        { id: "r1", title: "A", updatedAt: "x" },
        { id: "r2", title: "B", updatedAt: "y" },
      ],
      hypotheses: [
        {
          id: "h1",
          caseId: "c1",
          title: "x",
          status: "exploring",
          updatedAt: "z",
        },
      ],
    });
    const summary = summarise(loops);
    expect(summary.total).toBe(3);
    expect(summary.byKind["unfinished-report"]).toBe(2);
    expect(summary.topKind).toBe("unfinished-report");
  });
});

describe("labels", () => {
  it("OPEN_LOOP_LABELS covers every kind built", () => {
    const loops = buildOpenLoops({
      reportDrafts: [{ id: "r", title: "x", updatedAt: "x" }],
      uncodedExcerpts: [
        {
          transcriptId: "t",
          transcriptTitle: "x",
          excerptCount: 1,
          updatedAt: "x",
        },
      ],
      hypotheses: [
        {
          id: "h",
          caseId: "c1",
          title: "x",
          status: "exploring",
          updatedAt: "x",
        },
      ],
    });
    for (const l of loops) expect(OPEN_LOOP_LABELS[l.kind]).toBeTruthy();
  });
});
