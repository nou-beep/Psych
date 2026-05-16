import { describe, it, expect } from "vitest";
import { buildLastSessionSummary } from "@/lib/clinical/last-session";

describe("buildLastSessionSummary", () => {
  it("returns nulls / empties when nothing is recorded", () => {
    const summary = buildLastSessionSummary("c1", {});
    expect(summary.date).toBeNull();
    expect(summary.topic).toBe("—");
    expect(summary.assignedWork).toEqual([]);
  });

  it("picks the most recent session for the case", () => {
    const summary = buildLastSessionSummary("c1", {
      sessions: [
        { id: "s1", caseId: "c1", date: "2026-05-01", mainTopics: "early" },
        { id: "s2", caseId: "c1", date: "2026-05-10", mainTopics: "Avoidance" },
        { id: "s3", caseId: "OTHER", date: "2026-05-20", mainTopics: "wrong" },
      ],
    });
    expect(summary.date).toBe("2026-05-10");
    expect(summary.topic).toBe("Avoidance");
  });

  it("merges plan + session, choosing the latest date", () => {
    const summary = buildLastSessionSummary("c1", {
      sessions: [
        {
          id: "s1",
          caseId: "c1",
          date: "2026-05-10",
          mainTopics: "Avoidance",
          interventions: "Thought record",
          nextSteps: "Review next week",
        },
      ],
      sessionPlans: [
        {
          id: "p1",
          caseId: "c1",
          date: "2026-05-12",
          worksheetsToGive: ["Anxiety grounding"],
          riskReminders: "No acute concerns",
          goals: ["test avoidance hypothesis"],
          postSessionNotes: "engaged well",
        },
      ],
    });
    expect(summary.date).toBe("2026-05-12");
    expect(summary.assignedWork).toEqual(["Anxiety grounding"]);
    expect(summary.riskUpdate).toBe("No acute concerns");
    expect(summary.unresolvedTopics).toContain("test avoidance hypothesis");
    expect(summary.emotionalThemes).toBe("engaged well");
    expect(summary.interventionsUsed).toBe("Thought record");
    expect(summary.nextSessionFocus).toBe("Review next week");
  });

  it("includes recent check-ins under symptom changes", () => {
    const summary = buildLastSessionSummary("c1", {
      checkIns: [
        { id: "i1", caseId: "c1", date: "2026-05-13", moodAffect: "anxious" },
        { id: "i2", caseId: "c1", date: "2026-05-12", moodAffect: "calmer" },
      ],
    });
    expect(summary.symptomChanges).toContain("2026-05-13");
    expect(summary.symptomChanges).toContain("anxious");
  });
});
