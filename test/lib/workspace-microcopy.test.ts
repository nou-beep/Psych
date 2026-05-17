import { describe, it, expect } from "vitest";
import {
  PHRASES,
  STATUS_VERBS,
  replaceProductivityJargon,
  tone,
} from "@/lib/workspace/microcopy";

describe("microcopy", () => {
  it("PHRASES covers the core psych-aware verbs", () => {
    expect(PHRASES.saved).toBe("Material archived");
    expect(PHRASES.resolved).toBe("Marked as resolved");
    expect(PHRASES.reviewPatterns).toBe("Review patterns");
    expect(PHRASES.parked).toBe("Parked for now");
  });

  it("tone() is a typed lookup", () => {
    expect(tone("saved")).toBe(PHRASES.saved);
    expect(tone("thinkingMode")).toBe("Thinking");
  });

  it("thoughtsCount handles 0 / 1 / many", () => {
    expect(PHRASES.thoughtsCount(0)).toBe("no thoughts yet");
    expect(PHRASES.thoughtsCount(1)).toBe("1 thought on the wall");
    expect(PHRASES.thoughtsCount(5)).toBe("5 thoughts on the wall");
  });

  it("STATUS_VERBS is a clean verb dictionary", () => {
    expect(STATUS_VERBS.archive).toBe("Set aside");
    expect(STATUS_VERBS.unarchive).toBe("Bring back");
    expect(STATUS_VERBS.resolve).toBe("Mark resolved");
    expect(STATUS_VERBS.pin).toBe("Pin");
  });
});

describe("replaceProductivityJargon", () => {
  it("swaps generic productivity strings", () => {
    expect(replaceProductivityJargon("Task complete")).toBe("Marked as resolved");
    expect(replaceProductivityJargon("Generate insights")).toBe("Review patterns");
    expect(replaceProductivityJargon("Content saved")).toBe("Material archived");
  });

  it("substitutes wellness phrasing", () => {
    expect(replaceProductivityJargon("Wellness journey")).toBe("Clinical work");
    expect(replaceProductivityJargon("Healing space")).toBe("Workspace");
    expect(replaceProductivityJargon("AI companion")).toMatch(/[Ww]orkspace/);
  });

  it("preserves case of the first letter", () => {
    expect(replaceProductivityJargon("Insights")).toBe("Patterns");
    expect(replaceProductivityJargon("insights")).toBe("patterns");
  });

  it("is idempotent on neutral strings", () => {
    expect(replaceProductivityJargon("Marked as resolved")).toBe(
      "Marked as resolved"
    );
    expect(replaceProductivityJargon("")).toBe("");
  });
});
