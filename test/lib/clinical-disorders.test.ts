import { describe, it, expect } from "vitest";
import {
  DISORDER_REFERENCE,
  findDisorder,
  searchDisorders,
} from "@/lib/clinical/disorders";

describe("disorder reference", () => {
  it("contains common disorders", () => {
    const names = DISORDER_REFERENCE.map((d) => d.name);
    expect(names).toEqual(
      expect.arrayContaining([
        "Major Depressive Disorder",
        "Generalized Anxiety Disorder",
        "Depersonalization/Derealization Disorder",
        "Post-Traumatic Stress Disorder",
        "Autism Spectrum Disorder",
      ])
    );
  });

  it("does NOT contain copyrighted criterion text", () => {
    // Spot-check: no obvious clinical criterion phrases that would suggest
    // DSM verbatim copy. This is descriptive, not exhaustive — but it
    // protects against accidental DSM paste-ins during future edits.
    const banned = [
      "DSM-5-TR criteria a:",
      "diagnostic criterion a",
      "criterion a:",
    ];
    const haystack = DISORDER_REFERENCE.map((d) =>
      [d.shortSummary, ...d.associatedFeatures, ...d.specifiers].join(" ")
    )
      .join("\n")
      .toLowerCase();
    for (const term of banned) {
      expect(haystack).not.toContain(term);
    }
  });

  it("findDisorder returns by id", () => {
    expect(findDisorder("dpdr")?.name).toContain("Depersonalization");
    expect(findDisorder("not-a-disorder")).toBeUndefined();
  });

  it("searchDisorders matches name and tags", () => {
    expect(searchDisorders("anxiety").length).toBeGreaterThan(0);
    expect(searchDisorders("dissociation").length).toBeGreaterThan(0);
    expect(searchDisorders("").length).toBe(DISORDER_REFERENCE.length);
  });

  it("links to assessments / interventions / workbooks where they exist", () => {
    const gad = findDisorder("gad");
    expect(gad?.linkedAssessmentIds).toContain("gad7");
    expect(gad?.linkedInterventionIds).toContain("cbt-thought-record");
  });
});
