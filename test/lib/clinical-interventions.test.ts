import { describe, it, expect } from "vitest";
import {
  INTERVENTION_LIBRARY,
  MODALITY_ORDER,
  interventionsForModality,
  interventionsForSymptom,
  searchInterventions,
} from "@/lib/clinical/interventions-library";

describe("intervention library", () => {
  it("covers all expected modalities", () => {
    const seen = new Set(INTERVENTION_LIBRARY.map((i) => i.modality));
    for (const m of [
      "CBT",
      "ACT",
      "DBT",
      "Behavioral Activation",
      "Exposure",
      "Grounding",
      "Mindfulness",
      "Emotional Regulation",
      "Psychoeducation",
      "Trauma-Informed Stabilization",
      "Dissociation Grounding",
      "Sensory Regulation",
      "Communication",
    ]) {
      expect(seen.has(m as never)).toBe(true);
    }
  });

  it("every modality in MODALITY_ORDER is a real string", () => {
    for (const m of MODALITY_ORDER) expect(typeof m).toBe("string");
  });

  it("every intervention has a goal, indications, evidence level, tags", () => {
    for (const i of INTERVENTION_LIBRARY) {
      expect(i.therapeuticGoal.length).toBeGreaterThan(0);
      expect(i.indications.length).toBeGreaterThan(0);
      expect(i.evidenceLevel).toBeTruthy();
      expect(Array.isArray(i.tags)).toBe(true);
    }
  });
});

describe("filters", () => {
  it("interventionsForModality narrows", () => {
    const cbt = interventionsForModality("CBT");
    expect(cbt.length).toBeGreaterThan(0);
    expect(cbt.every((i) => i.modality === "CBT")).toBe(true);
  });

  it("interventionsForSymptom is case-insensitive on the symptom", () => {
    expect(interventionsForSymptom("anxiety").length).toBeGreaterThan(0);
    expect(interventionsForSymptom("Anxiety").length).toBeGreaterThan(0);
  });

  it("searchInterventions matches name, description, tags, indications", () => {
    expect(searchInterventions("breathing").length).toBeGreaterThan(0);
    expect(searchInterventions("dissociation").length).toBeGreaterThan(0);
    expect(searchInterventions("").length).toBe(INTERVENTION_LIBRARY.length);
  });
});
