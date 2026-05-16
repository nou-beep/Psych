import { describe, it, expect } from "vitest";
import {
  PSYCHOEDUCATION_TOPICS,
  findTopic,
  getHandout,
  searchTopics,
} from "@/lib/clinical/psychoeducation";

describe("psychoeducation catalogue", () => {
  it("each topic has 4 style variants with all required fields", () => {
    for (const t of PSYCHOEDUCATION_TOPICS) {
      for (const style of ["clinician", "adolescent", "parent", "academic"] as const) {
        const v = t.variants[style];
        expect(v).toBeDefined();
        expect(v.intro.length).toBeGreaterThan(0);
        expect(v.whatItIs.length).toBeGreaterThan(0);
        expect(v.whatItFeelsLike.length).toBeGreaterThan(0);
        expect(v.whatHelps.length).toBeGreaterThan(0);
        expect(v.whenToSeekSupport.length).toBeGreaterThan(0);
      }
    }
  });

  it("findTopic returns by id", () => {
    expect(findTopic("pe-anxiety")?.title).toBe("Understanding anxiety");
    expect(findTopic("nope")).toBeUndefined();
  });

  it("getHandout returns the right style", () => {
    expect(getHandout("pe-anxiety", "adolescent")?.style).toBe("adolescent");
    expect(getHandout("nope")).toBeNull();
  });

  it("searchTopics matches title, category, and tags", () => {
    expect(searchTopics("depression").length).toBeGreaterThan(0);
    expect(searchTopics("anxiety").length).toBeGreaterThan(0);
    expect(searchTopics("").length).toBe(PSYCHOEDUCATION_TOPICS.length);
  });
});
