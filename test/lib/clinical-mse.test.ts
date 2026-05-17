import { describe, it, expect } from "vitest";
import {
  MSE_DOMAINS,
  diffMSE,
  emptyMSE,
  mseAsReportNarrative,
} from "@/lib/clinical/mse";

describe("MSE domains", () => {
  it("covers all the requested clinical sections", () => {
    const ids = MSE_DOMAINS.map((d) => d.id);
    for (const expected of [
      "appearance",
      "behavior",
      "speech",
      "mood",
      "affect",
      "thoughtProcess",
      "thoughtContent",
      "perception",
      "cognition",
      "memory",
      "concentration",
      "orientation",
      "insight",
      "judgment",
      "psychomotor",
      "riskObservations",
    ]) {
      expect(ids).toContain(expected);
    }
  });

  it("each domain has descriptor chips and a report phrasing", () => {
    for (const d of MSE_DOMAINS) {
      expect(d.descriptors.length).toBeGreaterThan(0);
      expect(d.reportPhrasing).toContain("{desc}");
    }
  });
});

describe("mseAsReportNarrative", () => {
  it("renders only domains with content", () => {
    const entry = emptyMSE();
    entry.appearance = "well-groomed";
    entry.mood = "anxious";
    const narrative = mseAsReportNarrative(entry);
    expect(narrative).toContain("well-groomed");
    expect(narrative).toContain("anxious");
    // Empty domains aren't included.
    expect(narrative).not.toContain("{desc}");
  });

  it("returns empty string when nothing is filled", () => {
    expect(mseAsReportNarrative(emptyMSE())).toBe("");
  });
});

describe("diffMSE", () => {
  it("reports changed domains only", () => {
    const a = emptyMSE();
    const b = emptyMSE();
    a.mood = "low";
    b.mood = "neutral";
    b.affect = "restricted";
    const diff = diffMSE(a, b);
    expect(diff.map((d) => d.domain)).toEqual(
      expect.arrayContaining(["Mood (subjective)", "Affect (observed)"])
    );
    expect(diff.length).toBe(2);
  });
});
