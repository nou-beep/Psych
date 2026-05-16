import { describe, it, expect } from "vitest";
import {
  HYPOTHESIS_DISCLAIMER,
  addEvidence,
  emptyHypothesis,
  evidenceBalance,
  removeEvidence,
  setStatus,
} from "@/lib/clinical/hypothesis";

describe("hypothesis workspace", () => {
  it("exposes the diagnosis-not-automated disclaimer", () => {
    expect(HYPOTHESIS_DISCLAIMER.toLowerCase()).toContain("does not provide diagnoses");
  });

  it("emptyHypothesis is exploring with zero confidence floor", () => {
    const h = emptyHypothesis("c1");
    expect(h.status).toBe("exploring");
    expect(h.evidenceFor).toEqual([]);
    expect(h.evidenceAgainst).toEqual([]);
    expect(h.confidence).toBeGreaterThanOrEqual(1);
    expect(h.confidence).toBeLessThanOrEqual(5);
  });

  it("addEvidence appends and ignores empty text", () => {
    let h = emptyHypothesis("c1");
    h = addEvidence(h, "evidenceFor", "Improved sleep after BA");
    h = addEvidence(h, "evidenceFor", "  ");
    h = addEvidence(h, "evidenceAgainst", "Score did not move");
    expect(h.evidenceFor).toHaveLength(1);
    expect(h.evidenceAgainst).toHaveLength(1);
  });

  it("removeEvidence by id", () => {
    let h = emptyHypothesis("c1");
    h = addEvidence(h, "evidenceFor", "A");
    h = addEvidence(h, "evidenceFor", "B");
    const target = h.evidenceFor[0].id;
    h = removeEvidence(h, "evidenceFor", target);
    expect(h.evidenceFor).toHaveLength(1);
    expect(h.evidenceFor[0].id).not.toBe(target);
  });

  it("setStatus replaces status", () => {
    const h = setStatus(emptyHypothesis("c1"), "discussed-in-supervision");
    expect(h.status).toBe("discussed-in-supervision");
  });

  it("evidenceBalance is descriptive only", () => {
    let h = emptyHypothesis("c1");
    h = addEvidence(h, "evidenceFor", "a");
    h = addEvidence(h, "evidenceFor", "b");
    h = addEvidence(h, "evidenceAgainst", "c");
    expect(evidenceBalance(h)).toBe(1);
  });
});
