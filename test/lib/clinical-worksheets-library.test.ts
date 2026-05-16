import { describe, it, expect } from "vitest";
import {
  WORKSHEET_LIBRARY,
  findWorksheet,
  searchWorksheets,
  worksheetFieldCount,
  worksheetsForCategory,
} from "@/lib/clinical/worksheets-library";

describe("worksheet library", () => {
  it("ships the 10 worksheets requested in the spec", () => {
    const titles = WORKSHEET_LIBRARY.map((w) => w.title);
    for (const expected of [
      "CBT Thought Record",
      "Behavioral Activation Planner",
      "Sleep Diary",
      "Panic Episode Log",
      "Dissociation and Depersonalization Episode Log",
      "Exposure Hierarchy",
      "Emotion Regulation Log",
      "Sensory Profile Worksheet",
      "Session Preparation Sheet (client-facing)",
      "Between-Session Reflection",
    ]) {
      expect(titles).toContain(expected);
    }
    expect(WORKSHEET_LIBRARY.length).toBeGreaterThanOrEqual(10);
  });

  it("every worksheet has at least one section + non-empty evidence note", () => {
    for (const w of WORKSHEET_LIBRARY) {
      expect(w.sections.length).toBeGreaterThan(0);
      expect(w.evidence.length).toBeGreaterThan(20);
    }
  });

  it("every field has an id, label, and valid kind", () => {
    const valid = new Set([
      "text",
      "long",
      "slider",
      "scale",
      "date",
      "time",
      "duration",
      "select",
      "tags",
    ]);
    for (const w of WORKSHEET_LIBRARY) {
      for (const s of w.sections) {
        for (const f of s.fields) {
          expect(f.id).toBeTruthy();
          expect(f.label).toBeTruthy();
          expect(valid.has(f.kind)).toBe(true);
        }
      }
    }
  });

  it("CBT thought record records belief-before and belief-after on a 0–10 slider", () => {
    const wb = findWorksheet("ws-cbt-thought-record")!;
    const thought = wb.sections.find((s) => s.id === "thought")!;
    const before = thought.fields.find((f) => f.id === "belief-before");
    expect(before?.kind).toBe("slider");
    const reappraisal = wb.sections.find((s) => s.id === "reappraisal")!;
    const after = reappraisal.fields.find((f) => f.id === "belief-after");
    expect(after?.kind).toBe("slider");
  });

  it("DPDR log captures the thesis-relevant five dimensions", () => {
    const wb = findWorksheet("ws-dpdr-log")!;
    const fieldIds = wb.sections
      .flatMap((s) => s.fields)
      .map((f) => f.id);
    for (const expected of [
      "depersonalization-intensity",
      "derealization-intensity",
      "emotional-numbness",
      "body-detachment",
      "time-distortion",
    ]) {
      expect(fieldIds).toContain(expected);
    }
  });

  it("exposure hierarchy uses the SUDS 0–100 scale field kind", () => {
    const wb = findWorksheet("ws-exposure-hierarchy")!;
    const fields = wb.sections.flatMap((s) => s.fields);
    expect(fields.some((f) => f.kind === "scale")).toBe(true);
  });

  it("therapist-only fields are flagged with the right audience", () => {
    const cbt = findWorksheet("ws-cbt-thought-record")!;
    const clinicianSection = cbt.sections.find((s) => s.id === "clinician")!;
    expect(clinicianSection.fields[0].audience).toBe("therapist-only");
  });

  it("worksheetsForCategory narrows correctly", () => {
    expect(
      worksheetsForCategory("session").map((w) => w.id)
    ).toEqual(["ws-session-prep", "ws-between-session-reflection"]);
    expect(worksheetsForCategory("dissociation")).toHaveLength(1);
  });

  it("searchWorksheets matches title and tags", () => {
    expect(searchWorksheets("dpdr").length).toBeGreaterThan(0);
    expect(searchWorksheets("cbt").length).toBeGreaterThan(0);
    expect(searchWorksheets("").length).toBe(WORKSHEET_LIBRARY.length);
  });

  it("worksheetFieldCount returns the total fields", () => {
    for (const w of WORKSHEET_LIBRARY) {
      expect(worksheetFieldCount(w)).toBeGreaterThan(0);
    }
  });
});
