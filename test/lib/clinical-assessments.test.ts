import { describe, it, expect } from "vitest";
import {
  ASSESSMENT_LIBRARY,
  PHQ9,
  GAD7,
  DASS21,
  DES_II,
  buildAdministration,
  caseAdministrations,
  findAssessment,
  scoreAssessment,
} from "@/lib/clinical/assessments";

describe("assessment library", () => {
  it("contains the requested core + placeholder instruments", () => {
    const codes = ASSESSMENT_LIBRARY.map((a) => a.code);
    for (const expected of [
      "PHQ-9",
      "GAD-7",
      "DASS-21",
      "BDI-II",
      "STAI-Y2",
      "CDS-29",
      "DES-II",
      "PCL-5",
      "AQ-50",
      "RAADS-R",
    ]) {
      expect(codes).toContain(expected);
    }
  });

  it("findAssessment returns by id", () => {
    expect(findAssessment("phq9")?.code).toBe("PHQ-9");
    expect(findAssessment("nope")).toBeUndefined();
  });

  it("placeholder instruments still record administrations", () => {
    expect(DES_II.status).toBe("placeholder");
    const admin = buildAdministration(DES_II, {
      items: Array(DES_II.itemCount).fill(0),
    });
    expect(admin.score.total).toBe(0);
  });
});

describe("PHQ-9 scoring through engine", () => {
  it("returns expected severity bands", () => {
    expect(scoreAssessment(PHQ9, [0, 0, 0, 0, 0, 0, 0, 0, 0]).severity).toBe("Minimal");
    expect(scoreAssessment(PHQ9, [1, 1, 1, 1, 1, 0, 0, 0, 0]).severity).toBe("Mild"); // 5
    expect(scoreAssessment(PHQ9, [2, 2, 1, 1, 1, 1, 1, 1, 0]).severity).toBe("Moderate"); // 10
    expect(scoreAssessment(PHQ9, [2, 2, 2, 2, 2, 2, 2, 1, 0]).severity).toBe(
      "Moderately severe"
    ); // 15
    expect(scoreAssessment(PHQ9, [3, 3, 3, 3, 3, 3, 1, 0, 1]).severity).toBe("Severe");
  });

  it("flags item-9 risk", () => {
    expect(scoreAssessment(PHQ9, [0, 0, 0, 0, 0, 0, 0, 0, 2]).flaggedItems).toEqual([9]);
    expect(scoreAssessment(PHQ9, [0, 0, 0, 0, 0, 0, 0, 0, 0]).flaggedItems).toEqual([]);
  });

  it("severity is null when any item is missing/invalid", () => {
    expect(
      scoreAssessment(PHQ9, [0, 0, 0, null, 0, 0, 0, 0, 0]).severity
    ).toBeNull();
    expect(
      scoreAssessment(PHQ9, [5, 0, 0, 0, 0, 0, 0, 0, 0]).severity
    ).toBeNull(); // out of range
  });

  it("throws on wrong item count", () => {
    expect(() => scoreAssessment(PHQ9, [0, 0, 0])).toThrow();
  });
});

describe("GAD-7 scoring through engine", () => {
  it("severity bands match the standard cutoffs", () => {
    expect(scoreAssessment(GAD7, [0, 0, 0, 0, 0, 0, 0]).severity).toBe("Minimal");
    expect(scoreAssessment(GAD7, [1, 1, 1, 1, 1, 0, 0]).severity).toBe("Mild");
    expect(scoreAssessment(GAD7, [2, 2, 1, 1, 1, 2, 1]).severity).toBe("Moderate");
    expect(scoreAssessment(GAD7, [3, 3, 3, 3, 3, 0, 0]).severity).toBe("Severe"); // 15
  });
});

describe("DASS-21 scoring (subscales)", () => {
  it("each subscale sum is multiplied by 2 and given a severity band", () => {
    const items = Array(21).fill(0);
    // Fill depression items (3,5,10,13,16,17,21) with value 2 each → raw=14 → score=28 → Extremely severe (28+)
    [3, 5, 10, 13, 16, 17, 21].forEach((i) => (items[i - 1] = 2));
    const result = scoreAssessment(DASS21, items);
    expect(result.subscales).toBeDefined();
    const dep = result.subscales!.find((s) => s.id === "depression")!;
    expect(dep.rawSum).toBe(14);
    expect(dep.score).toBe(28);
    expect(dep.severity).toBe("Extremely severe");
  });

  it("subscale severity is null if any of its items are missing", () => {
    const items = Array(21).fill(0);
    items[2] = null; // item 3 (depression subscale)
    const result = scoreAssessment(DASS21, items as never);
    const dep = result.subscales!.find((s) => s.id === "depression")!;
    expect(dep.severity).toBeNull();
    expect(dep.missing).toBe(1);
  });

  it("normal range comes out correctly", () => {
    const result = scoreAssessment(DASS21, Array(21).fill(0));
    const dep = result.subscales!.find((s) => s.id === "depression")!;
    const anx = result.subscales!.find((s) => s.id === "anxiety")!;
    const str = result.subscales!.find((s) => s.id === "stress")!;
    expect(dep.severity).toBe("Normal");
    expect(anx.severity).toBe("Normal");
    expect(str.severity).toBe("Normal");
  });
});

describe("buildAdministration + caseAdministrations", () => {
  it("buildAdministration produces a complete record with computed score", () => {
    const admin = buildAdministration(PHQ9, {
      caseId: "c1",
      items: [3, 3, 3, 3, 3, 3, 3, 3, 3],
      clinicianNotes: "baseline",
    });
    expect(admin.score.total).toBe(27);
    expect(admin.score.severity).toBe("Severe");
    expect(admin.caseId).toBe("c1");
    expect(admin.id).toBeTruthy();
  });

  it("caseAdministrations filters + sorts oldest first", () => {
    const a = buildAdministration(PHQ9, {
      caseId: "c1",
      date: "2026-05-01",
      items: Array(9).fill(0),
    });
    const b = buildAdministration(PHQ9, {
      caseId: "c1",
      date: "2026-03-01",
      items: Array(9).fill(0),
    });
    const c = buildAdministration(GAD7, {
      caseId: "c1",
      date: "2026-04-01",
      items: Array(7).fill(0),
    });
    const d = buildAdministration(PHQ9, {
      caseId: "OTHER",
      date: "2026-05-01",
      items: Array(9).fill(0),
    });
    const ordered = caseAdministrations([a, b, c, d], "c1");
    expect(ordered.map((x) => x.date)).toEqual(["2026-03-01", "2026-04-01", "2026-05-01"]);
    expect(ordered.find((x) => x.caseId === "OTHER")).toBeUndefined();
  });

  it("caseAdministrations can filter to a single assessment", () => {
    const a = buildAdministration(PHQ9, {
      caseId: "c1",
      date: "2026-05-01",
      items: Array(9).fill(0),
    });
    const b = buildAdministration(GAD7, {
      caseId: "c1",
      date: "2026-05-01",
      items: Array(7).fill(0),
    });
    expect(caseAdministrations([a, b], "c1", "phq9")).toHaveLength(1);
  });
});
