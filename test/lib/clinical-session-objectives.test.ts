import { describe, it, expect } from "vitest";
import {
  carryForward,
  emptyObjectiveSet,
  latestForCase,
  linesToList,
  update,
} from "@/lib/clinical/session-objectives";

describe("session objectives", () => {
  it("emptyObjectiveSet creates a blank record for the given case/date", () => {
    const set = emptyObjectiveSet("c1", "2026-05-15");
    expect(set.caseId).toBe("c1");
    expect(set.date).toBe("2026-05-15");
    expect(set.objectives).toEqual([]);
    expect(set.used).toBe(false);
  });

  it("linesToList trims and drops empties", () => {
    expect(linesToList("a\n\n  b  \n\nc")).toEqual(["a", "b", "c"]);
  });

  it("update merges patch and refreshes updatedAt", async () => {
    const set = emptyObjectiveSet("c1");
    await new Promise((r) => setTimeout(r, 3));
    const next = update(set, { objectives: ["explore avoidance"] });
    expect(next.objectives).toEqual(["explore avoidance"]);
    expect(next.updatedAt).not.toBe(set.updatedAt);
  });

  it("carryForward copies follow-up + unresolved themes + supervision reminders", () => {
    const previous = update(emptyObjectiveSet("c1", "2026-05-01"), {
      followUpPoints: ["check homework"],
      unresolvedThemes: ["family conflict"],
      supervisionReminders: ["pacing"],
      observations: "should NOT carry",
    });
    const next = carryForward(previous, "2026-05-08");
    expect(next.date).toBe("2026-05-08");
    expect(next.followUpPoints).toEqual(["check homework"]);
    expect(next.unresolvedThemes).toEqual(["family conflict"]);
    expect(next.supervisionReminders).toEqual(["pacing"]);
    expect(next.observations).toBe("");
  });

  it("latestForCase returns the most recent per case", () => {
    const a = emptyObjectiveSet("c1", "2026-05-01");
    const b = emptyObjectiveSet("c1", "2026-05-08");
    const c = emptyObjectiveSet("OTHER", "2026-05-15");
    expect(latestForCase([a, b, c], "c1")?.date).toBe("2026-05-08");
    expect(latestForCase([], "c1")).toBeNull();
  });
});
