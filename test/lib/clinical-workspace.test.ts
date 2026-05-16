import { describe, it, expect } from "vitest";
import { KIND_LABELS, buildWorkspace } from "@/lib/clinical/workspace";

describe("buildWorkspace", () => {
  it("returns nothing for an empty input", () => {
    expect(buildWorkspace({})).toEqual([]);
  });

  it("flags formulation drafts (partially filled)", () => {
    const items = buildWorkspace({
      formulations: [
        {
          id: "f1",
          caseId: "c1",
          title: "Anxiety 5Ps",
          sections: { presenting: "anxiety", perpetuating: "", precipitating: "" },
          updatedAt: "2026-05-01T00:00:00Z",
        },
        {
          id: "f2",
          caseId: "c1",
          title: "Complete",
          sections: { a: "x", b: "y" },
          updatedAt: "2026-05-02T00:00:00Z",
        },
      ],
    });
    expect(items.map((i) => i.title)).toContain("Anxiety 5Ps");
    expect(items.map((i) => i.title)).not.toContain("Complete");
  });

  it("flags incomplete assessments", () => {
    const items = buildWorkspace({
      incompleteAssessments: [
        {
          id: "a1",
          assessmentId: "phq9",
          date: "2026-05-01",
          missing: 2,
          updatedAt: "2026-05-01T00:00:00Z",
        },
        {
          id: "a2",
          assessmentId: "gad7",
          date: "2026-05-02",
          missing: 0,
          updatedAt: "2026-05-02T00:00:00Z",
        },
      ],
    });
    expect(items).toHaveLength(1);
    expect(items[0].kind).toBe("assessment-incomplete");
    expect(items[0].subtitle).toContain("2 item");
  });

  it("flags session note drafts where goals remain unchecked", () => {
    const items = buildWorkspace({
      sessionNoteDrafts: [
        {
          id: "n1",
          caseId: "c1",
          date: "2026-05-15",
          plannedGoals: ["a", "b"],
          completedGoals: ["a"],
          updatedAt: "2026-05-15T00:00:00Z",
        },
        {
          id: "n2",
          caseId: "c1",
          date: "2026-05-14",
          plannedGoals: ["x"],
          completedGoals: ["x"],
          updatedAt: "2026-05-14T00:00:00Z",
        },
      ],
    });
    expect(items).toHaveLength(1);
    expect(items[0].kind).toBe("session-note-draft");
  });

  it("ranks results most-recently-touched first", () => {
    const items = buildWorkspace({
      reportDrafts: [
        { id: "r1", title: "Old", updatedAt: "2026-01-01T00:00:00Z" },
        { id: "r2", title: "New", updatedAt: "2026-06-01T00:00:00Z" },
      ],
    });
    expect(items.map((i) => i.title)).toEqual(["New", "Old"]);
  });

  it("KIND_LABELS covers every produced kind", () => {
    const items = buildWorkspace({
      reportDrafts: [{ id: "r", title: "x", updatedAt: "2026-01-01T00:00:00Z" }],
      formulations: [
        {
          id: "f",
          caseId: "c1",
          sections: { a: "x", b: "" },
          updatedAt: "2026-01-01T00:00:00Z",
        },
      ],
      thematicExcerpts: [{ id: "e", codeIds: [], transcriptId: "t1" }],
    });
    for (const it of items) expect(KIND_LABELS[it.kind]).toBeTruthy();
  });
});
