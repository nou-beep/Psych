import { describe, it, expect } from "vitest";
import {
  canConvertPlan,
  convertPlanToNote,
  markGoalCompleted,
  isFullyCompleted,
} from "@/lib/session-convert";

function plan() {
  return {
    id: "plan-1",
    caseId: "c1",
    date: "2026-05-16",
    time: "10:00",
    goals: ["explore avoidance", "introduce thought record"],
    questionsToAsk: ["what did you avoid this week?"],
    toolsToUse: ["thought record"],
    interventionToTry: ["cognitive restructuring", "thought record"],
    followUpFromLast: "client tracked triggers",
    supervisorInstructions: "slow down",
    riskReminders: "monitor hopelessness statements",
    postSessionNotes: "client engaged well",
  };
}

describe("canConvertPlan", () => {
  it("rejects plans missing id, caseId, or date", () => {
    expect(canConvertPlan({} as never)).toBe(false);
    expect(canConvertPlan({ id: "x" } as never)).toBe(false);
    expect(canConvertPlan({ id: "x", caseId: "c" } as never)).toBe(false);
  });

  it("accepts plans with id + caseId + date", () => {
    expect(
      canConvertPlan({ id: "x", caseId: "c", date: "2026-01-01" })
    ).toBe(true);
  });
});

describe("convertPlanToNote", () => {
  it("copies planned goals into plannedGoals and leaves completedGoals empty", () => {
    const note = convertPlanToNote(plan());
    expect(note.plannedGoals).toEqual([
      "explore avoidance",
      "introduce thought record",
    ]);
    expect(note.completedGoals).toEqual([]);
  });

  it("merges toolsToUse and interventionToTry, deduplicating", () => {
    const note = convertPlanToNote(plan());
    expect(note.interventionsUsed).toEqual([
      "cognitive restructuring",
      "thought record",
    ]);
  });

  it("carries forward supervisor/risk context into carriedOverNotes", () => {
    const note = convertPlanToNote(plan());
    expect(note.carriedOverNotes).toContain("client tracked triggers");
    expect(note.carriedOverNotes).toContain("slow down");
    expect(note.carriedOverNotes).toContain("monitor hopelessness");
  });

  it("flags supervision and risk so the user can confirm them", () => {
    const note = convertPlanToNote(plan());
    expect(note.supervisionFlags).toEqual(
      expect.arrayContaining([
        "supervisor instructions to confirm",
        "risk reminders reviewed",
      ])
    );
  });

  it("pre-fills observations from postSessionNotes", () => {
    const note = convertPlanToNote(plan());
    expect(note.observations).toBe("client engaged well");
  });

  it("links back to the source plan", () => {
    const note = convertPlanToNote(plan());
    expect(note.sourcePlanId).toBe("plan-1");
    expect(note.caseId).toBe("c1");
    expect(note.date).toBe("2026-05-16");
  });

  it("throws when the plan is not convertible", () => {
    expect(() =>
      convertPlanToNote({ id: "", caseId: "", date: "" } as never)
    ).toThrow();
  });

  it("works on a minimal plan with no optional fields", () => {
    const note = convertPlanToNote({
      id: "p",
      caseId: "c",
      date: "2026-01-01",
    });
    expect(note.plannedGoals).toEqual([]);
    expect(note.interventionsUsed).toEqual([]);
    expect(note.supervisionFlags).toEqual([]);
    expect(note.carriedOverNotes).toBe("");
    expect(note.observations).toBe("");
  });
});

describe("markGoalCompleted / isFullyCompleted", () => {
  it("toggles goals on and off, preserving plannedGoals order", () => {
    const note = convertPlanToNote(plan());
    const a = markGoalCompleted(note, "introduce thought record", true);
    expect(a.completedGoals).toEqual(["introduce thought record"]);
    const b = markGoalCompleted(a, "explore avoidance", true);
    expect(b.completedGoals).toEqual([
      "explore avoidance",
      "introduce thought record",
    ]);
    const c = markGoalCompleted(b, "explore avoidance", false);
    expect(c.completedGoals).toEqual(["introduce thought record"]);
  });

  it("isFullyCompleted is true only when every planned goal is checked", () => {
    const note = convertPlanToNote(plan());
    expect(isFullyCompleted(note)).toBe(false);
    const a = markGoalCompleted(note, "explore avoidance", true);
    expect(isFullyCompleted(a)).toBe(false);
    const b = markGoalCompleted(a, "introduce thought record", true);
    expect(isFullyCompleted(b)).toBe(true);
  });

  it("isFullyCompleted is false when there are no planned goals", () => {
    const empty = convertPlanToNote({
      id: "p",
      caseId: "c",
      date: "2026-01-01",
    });
    expect(isFullyCompleted(empty)).toBe(false);
  });
});
