import { describe, it, expect } from "vitest";
import {
  EXAMPLE_CSV,
  toThesisParticipants,
  validateImport,
} from "@/lib/thesis/csv-import";

describe("validateImport", () => {
  it("flags an empty file", () => {
    const result = validateImport("");
    expect(result.issues.some((i) => i.severity === "error")).toBe(true);
  });

  it("requires participant_id", () => {
    const result = validateImport("age,gender\n22,F");
    expect(
      result.issues.some(
        (i) => i.severity === "error" && i.message.toLowerCase().includes("participant_id")
      )
    ).toBe(true);
  });

  it("accepts the example CSV without errors", () => {
    const result = validateImport(EXAMPLE_CSV);
    expect(result.rows).toHaveLength(3);
    expect(result.issues.some((i) => i.severity === "error")).toBe(false);
    expect(result.summary.withCds).toBe(3);
    expect(result.summary.withStai).toBe(3);
    expect(result.summary.withPhq9).toBe(3);
  });

  it("recognises common column aliases", () => {
    const csv =
      "id,age,sex,cds_score,trait_anxiety,phq9_score,cluster\n" +
      "P-001,22,F,80,55,12,Clinical";
    const result = validateImport(csv);
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0].participantId).toBe("P-001");
    expect(result.rows[0].cdsTotal).toBe(80);
    expect(result.rows[0].staiTrait).toBe(55);
    expect(result.rows[0].phq9Total).toBe(12);
    expect(result.rows[0].group).toBe("Clinical");
  });

  it("flags out-of-range PHQ-9 values", () => {
    const csv = "participant_id,PHQ9_total\nP-001,40";
    const result = validateImport(csv);
    expect(
      result.issues.some(
        (i) => i.severity === "error" && i.message.toLowerCase().includes("phq9total")
      )
    ).toBe(true);
  });

  it("flags duplicate participant IDs", () => {
    const csv =
      "participant_id,CDS_total\nP-001,40\nP-001,55";
    const result = validateImport(csv);
    expect(result.duplicateIds).toEqual(["P-001"]);
    expect(
      result.issues.some((i) => i.message.toLowerCase().includes("duplicate"))
    ).toBe(true);
  });

  it("warns about missing core measures", () => {
    const csv = "participant_id,age\nP-001,22";
    const result = validateImport(csv);
    expect(
      result.issues.filter((i) => i.severity === "warning").length
    ).toBeGreaterThanOrEqual(3);
  });

  it("warns about unrecognised columns", () => {
    const csv = "participant_id,unknown_col\nP-001,x";
    const result = validateImport(csv);
    expect(
      result.issues.some(
        (i) =>
          i.severity === "warning" &&
          i.message.toLowerCase().includes("unknown_col")
      )
    ).toBe(true);
  });
});

describe("toThesisParticipants", () => {
  it("maps imported rows onto the existing thesis schema", () => {
    const preview = validateImport(EXAMPLE_CSV);
    const participants = toThesisParticipants(preview);
    expect(participants).toHaveLength(3);
    expect(participants[0].code).toBe("P-001");
    expect(participants[0].depersonalizationScore).toBe(82);
    expect(participants[0].anxietyScore).toBe(58);
    expect(participants[0].depressionScore).toBe(14);
    expect(participants[0].group).toBe("Clinical");
  });

  it("derives the group from cutoffs when missing", () => {
    const csv =
      "participant_id,age,CDS_total,STAI_trait,PHQ9_total\n" +
      "P-100,22,80,58,16\n" +
      "P-200,22,40,46,11\n" +
      "P-300,22,10,30,4";
    const preview = validateImport(csv);
    const out = toThesisParticipants(preview);
    expect(out[0].group).toBe("Clinical");
    expect(out[1].group).toBe("Subclinical");
    expect(out[2].group).toBe("Control");
  });

  it("flags missing-data when any of CDS/STAI/PHQ9 is null", () => {
    const csv = "participant_id,age,CDS_total\nP-001,22,40";
    const preview = validateImport(csv);
    const out = toThesisParticipants(preview);
    expect(out[0].hasMissingData).toBe(true);
  });
});
