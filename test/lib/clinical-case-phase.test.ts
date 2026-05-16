import { describe, it, expect } from "vitest";
import {
  PHASE_LABELS,
  PHASE_ORDER,
  currentPhase,
  daysInCurrentPhase,
  emptyHistory,
  transitionTo,
  updateCurrentPhaseNotes,
} from "@/lib/clinical/case-phase";

describe("phase catalogue", () => {
  it("PHASE_ORDER matches the user-requested sequence", () => {
    expect(PHASE_ORDER).toEqual([
      "intake",
      "assessment",
      "stabilization",
      "active-treatment",
      "maintenance",
      "discharge-prep",
      "follow-up",
    ]);
    for (const p of PHASE_ORDER) expect(PHASE_LABELS[p]).toBeTruthy();
  });
});

describe("history operations", () => {
  it("emptyHistory starts at intake by default", () => {
    const h = emptyHistory("c1");
    expect(h.entries).toHaveLength(1);
    expect(h.entries[0].phase).toBe("intake");
    expect(h.entries[0].closedAt).toBeUndefined();
    expect(currentPhase(h)?.phase).toBe("intake");
  });

  it("transitionTo closes the prior entry and appends the new one", () => {
    const h = transitionTo(emptyHistory("c1"), "stabilization", "started grounding work");
    expect(h.entries).toHaveLength(2);
    expect(h.entries[0].closedAt).toBeTruthy();
    expect(h.entries[1].closedAt).toBeUndefined();
    expect(h.entries[1].notes).toBe("started grounding work");
    expect(currentPhase(h)?.phase).toBe("stabilization");
  });

  it("updateCurrentPhaseNotes patches only the open entry", () => {
    const h = updateCurrentPhaseNotes(emptyHistory("c1"), "agreed on intake plan");
    expect(currentPhase(h)?.notes).toBe("agreed on intake plan");
  });

  it("daysInCurrentPhase is non-negative", () => {
    const h = emptyHistory("c1");
    // Today should be 0 days in (or close to).
    expect(daysInCurrentPhase(h)).toBeGreaterThanOrEqual(0);
  });
});
