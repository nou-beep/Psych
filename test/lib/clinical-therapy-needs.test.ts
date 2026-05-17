import { describe, it, expect } from "vitest";
import {
  ALL_NEEDS,
  NEED_LABELS,
  NEED_SUGGESTIONS,
  addNeed,
  currentFocus,
  emptyProfile,
  primaryNeeds,
  removeNeed,
  updateNeed,
} from "@/lib/clinical/therapy-needs";

describe("needs catalogue", () => {
  it("contains the 12 categories the spec asked for", () => {
    const expected = [
      "emotional-validation",
      "structure",
      "grounding",
      "psychoeducation",
      "emotional-regulation",
      "behavioral-activation",
      "relational-safety",
      "cognitive-restructuring",
      "executive-functioning",
      "sensory-accommodations",
      "routine-support",
      "distress-tolerance",
    ];
    for (const e of expected) expect(ALL_NEEDS).toContain(e);
  });

  it("every need has a label and suggestions block", () => {
    for (const n of ALL_NEEDS) {
      expect(NEED_LABELS[n].length).toBeGreaterThan(0);
      expect(NEED_SUGGESTIONS[n]).toBeDefined();
    }
  });
});

describe("profile operations", () => {
  it("addNeed dedupes by category", () => {
    let p = emptyProfile("c1");
    p = addNeed(p, "grounding", "primary");
    p = addNeed(p, "grounding", "secondary");
    expect(p.entries).toHaveLength(1);
    expect(p.entries[0].priority).toBe("primary");
  });

  it("updateNeed patches one entry only", () => {
    let p = emptyProfile("c1");
    p = addNeed(p, "grounding", "primary");
    p = addNeed(p, "structure", "secondary");
    const id = p.entries[0].id;
    p = updateNeed(p, id, { progress: 40, isCurrentFocus: true });
    expect(p.entries.find((e) => e.id === id)?.progress).toBe(40);
    expect(p.entries.find((e) => e.id === id)?.isCurrentFocus).toBe(true);
    expect(p.entries.find((e) => e.category === "structure")?.progress).toBe(0);
  });

  it("removeNeed drops by id", () => {
    let p = emptyProfile("c1");
    p = addNeed(p, "grounding", "primary");
    const id = p.entries[0].id;
    p = removeNeed(p, id);
    expect(p.entries).toHaveLength(0);
  });

  it("primaryNeeds + currentFocus filter correctly", () => {
    let p = emptyProfile("c1");
    p = addNeed(p, "grounding", "primary");
    p = addNeed(p, "structure", "secondary");
    p = updateNeed(p, p.entries[0].id, { isCurrentFocus: true });
    expect(primaryNeeds(p)).toHaveLength(1);
    expect(currentFocus(p)).toHaveLength(1);
  });
});
