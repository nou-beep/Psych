import { describe, it, expect } from "vitest";
import {
  ANXIETY_INTAKE,
  DEVELOPMENTAL_INTAKE,
  DISSOCIATION_INTAKE,
  FOLLOW_UP_TEMPLATE,
  INTAKE_TEMPLATE,
  INTERVIEW_TEMPLATES,
  diffInterviews,
  emptyInterview,
  findTemplate,
  setAnswer,
} from "@/lib/clinical/interview";

describe("interview templates", () => {
  it("registers all the focus templates", () => {
    const ids = INTERVIEW_TEMPLATES.map((t) => t.id);
    expect(ids).toEqual(
      expect.arrayContaining([
        "intake-general",
        "follow-up",
        "intake-anxiety",
        "intake-dissociation",
        "intake-developmental",
      ])
    );
  });

  it("intake template includes the core clinical sections", () => {
    const ids = INTAKE_TEMPLATE.sections.map((s) => s.id);
    for (const expected of [
      "presenting",
      "history-illness",
      "psychiatric-history",
      "medical-history",
      "developmental",
      "family-history",
      "education",
      "occupation",
      "trauma",
      "substance",
      "sleep",
      "appetite",
      "regulation",
      "cognition",
      "social",
      "relationships",
      "risk",
      "protective",
      "strengths",
      "previous-treatment",
      "medications",
    ]) {
      expect(ids).toContain(expected);
    }
  });

  it("focused intakes inherit core + add their emphasis", () => {
    expect(
      ANXIETY_INTAKE.sections.some((s) => s.emphasis === "anxiety")
    ).toBe(true);
    expect(
      DISSOCIATION_INTAKE.sections.some((s) => s.emphasis === "dissociation")
    ).toBe(true);
    expect(
      DEVELOPMENTAL_INTAKE.sections.some((s) => s.emphasis === "developmental")
    ).toBe(true);
  });

  it("findTemplate returns by id", () => {
    expect(findTemplate("intake-general")?.title).toBe(
      "General intake interview"
    );
    expect(findTemplate("nope")).toBeUndefined();
  });
});

describe("saved interview", () => {
  it("emptyInterview starts blank but typed", () => {
    const i = emptyInterview("intake-general", "c1");
    expect(i.templateId).toBe("intake-general");
    expect(i.caseId).toBe("c1");
    expect(i.answers).toEqual({});
  });

  it("setAnswer adds and updates section text", () => {
    let i = emptyInterview("intake-general", "c1");
    i = setAnswer(i, "presenting", "Anxiety + sleep");
    i = setAnswer(i, "presenting", "Anxiety + sleep (updated)");
    expect(i.answers.presenting).toBe("Anxiety + sleep (updated)");
  });
});

describe("diffInterviews", () => {
  it("returns the changed sections only", () => {
    const intake = setAnswer(
      emptyInterview("intake-general", "c1"),
      "presenting",
      "Anxiety"
    );
    let follow = emptyInterview("follow-up", "c1");
    follow = setAnswer(follow, "presenting", "Reduced anxiety");
    const diff = diffInterviews(intake, follow, INTAKE_TEMPLATE);
    expect(diff.find((d) => d.sectionId === "presenting")).toBeDefined();
  });

  it("returns empty when both interviews are identical (for shared sections)", () => {
    const a = emptyInterview("follow-up", "c1");
    const b = emptyInterview("follow-up", "c1");
    expect(diffInterviews(a, b, FOLLOW_UP_TEMPLATE)).toEqual([]);
  });
});
