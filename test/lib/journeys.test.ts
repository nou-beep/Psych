import { describe, it, expect } from "vitest";
import {
  ALL_JOURNEYS,
  getJourney,
  nextStep,
  markStepComplete,
  percentDone,
  resetJourney,
  totalSteps,
  type JourneyProgress,
} from "@/lib/client/journeys";

describe("journey catalogue", () => {
  it("every journey has at least 3 steps", () => {
    for (const j of ALL_JOURNEYS) {
      expect(j.steps.length).toBeGreaterThanOrEqual(3);
    }
  });

  it("every journey ends with an outro step", () => {
    for (const j of ALL_JOURNEYS) {
      const last = j.steps[j.steps.length - 1];
      expect(last.kind).toBe("outro");
    }
  });

  it("getJourney returns by id", () => {
    expect(getJourney("panic-recovery")?.title).toMatch(/panic/i);
    expect(getJourney("unknown" as never)).toBeUndefined();
  });
});

describe("journey progress", () => {
  const j = ALL_JOURNEYS[0];
  const fresh = (): JourneyProgress => ({
    journeyId: j.id,
    completedSteps: [],
    startedAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  });

  it("nextStep returns the first step on a fresh journey", () => {
    expect(nextStep(j, fresh())?.id).toBe(j.steps[0].id);
  });

  it("markStepComplete is idempotent", () => {
    let p = fresh();
    p = markStepComplete(p, j.steps[0].id);
    p = markStepComplete(p, j.steps[0].id);
    expect(p.completedSteps).toEqual([j.steps[0].id]);
  });

  it("nextStep advances after marking complete", () => {
    let p = fresh();
    p = markStepComplete(p, j.steps[0].id);
    expect(nextStep(j, p)?.id).toBe(j.steps[1].id);
  });

  it("nextStep returns null when everything is done", () => {
    let p = fresh();
    for (const s of j.steps) p = markStepComplete(p, s.id);
    expect(nextStep(j, p)).toBeNull();
  });

  it("percentDone reflects completion", () => {
    let p = fresh();
    expect(percentDone(j, p)).toBe(0);
    p = markStepComplete(p, j.steps[0].id);
    expect(percentDone(j, p)).toBeGreaterThan(0);
    expect(percentDone(j, p)).toBeLessThan(100);
    for (const s of j.steps.slice(1)) p = markStepComplete(p, s.id);
    expect(percentDone(j, p)).toBe(100);
  });

  it("resetJourney clears progress but can keep startedAt", () => {
    let p = fresh();
    p = markStepComplete(p, j.steps[0].id);
    const r = resetJourney(p);
    expect(r.completedSteps).toEqual([]);
    expect(r.startedAt).toBe("2026-01-01T00:00:00Z");
    const r2 = resetJourney(p, false);
    expect(r2.startedAt).not.toBe("2026-01-01T00:00:00Z");
  });

  it("totalSteps matches the step list", () => {
    expect(totalSteps(j)).toBe(j.steps.length);
  });
});
