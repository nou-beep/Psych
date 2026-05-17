import { describe, it, expect } from "vitest";
import {
  ALL_WORKBOOKS,
  getWorkbook,
  emptyProgress,
  setAnswer,
  markCompleted,
  percentCompleted,
} from "@/lib/client/workbooks";

describe("workbook catalogue", () => {
  it("each workbook has at least one step", () => {
    for (const w of ALL_WORKBOOKS) {
      expect(w.steps.length).toBeGreaterThan(0);
    }
  });

  it("step kinds are restricted to the known set", () => {
    const valid = new Set([
      "before-after",
      "thought-cards",
      "emotion-slider",
      "body-map",
      "free-write",
    ]);
    for (const w of ALL_WORKBOOKS) {
      for (const s of w.steps) {
        expect(valid.has(s.kind)).toBe(true);
      }
    }
  });

  it("getWorkbook returns by id or undefined", () => {
    expect(getWorkbook("wb-anxiety-grounding")).toBeTruthy();
    expect(getWorkbook("nope")).toBeUndefined();
  });
});

describe("workbook progress", () => {
  const wb = ALL_WORKBOOKS[0];

  it("emptyProgress starts blank", () => {
    const p = emptyProgress(wb.id);
    expect(p.answers).toEqual({});
    expect(p.completed).toBe(false);
  });

  it("setAnswer merges patches by step", () => {
    let p = emptyProgress(wb.id);
    p = setAnswer(p, wb.steps[0].id, { sliderBefore: 7 });
    p = setAnswer(p, wb.steps[0].id, { sliderAfter: 3 });
    expect(p.answers[wb.steps[0].id]).toEqual({ sliderBefore: 7, sliderAfter: 3 });
  });

  it("percentCompleted reflects how many steps have any answer", () => {
    let p = emptyProgress(wb.id);
    expect(percentCompleted(wb, p)).toBe(0);
    p = setAnswer(p, wb.steps[0].id, { text: "ok" });
    expect(percentCompleted(wb, p)).toBeGreaterThan(0);
    for (const s of wb.steps) p = setAnswer(p, s.id, { text: "ok" });
    expect(percentCompleted(wb, p)).toBe(100);
  });

  it("markCompleted flags the workbook", () => {
    const p = markCompleted(emptyProgress(wb.id));
    expect(p.completed).toBe(true);
  });
});
