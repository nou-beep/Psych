import { describe, it, expect, beforeEach } from "vitest";
import {
  addRespondent,
  depersonalisationGroup,
  dissociationGroup,
  loadDataset,
  newRespondent,
  patchRespondent,
  removeRespondent,
  respondentsToCSV,
  saveDataset,
  validateRespondent,
  THESIS_DATASET_STORAGE_KEY,
} from "@/lib/thesis/dataset";
import {
  countGad7Bands,
  countPhq9Bands,
  gad7Band,
  phq9Band,
} from "@/lib/thesis/clinical-bands";

describe("validateRespondent — range checks", () => {
  it("accepts a complete dissociation respondent", () => {
    expect(
      validateRespondent({
        age: 24,
        sex: "f",
        group: "dissociation",
        phq9: 12,
        gad7: 8,
        des: 33.4,
      })
    ).toEqual([]);
  });

  it("accepts a complete depersonalisation respondent", () => {
    expect(
      validateRespondent({
        age: 31,
        sex: "m",
        group: "depersonalisation",
        phq9: 9,
        gad7: 11,
        cds: 152,
      })
    ).toEqual([]);
  });

  it("rejects out-of-range PHQ-9 / GAD-7 / DES / CDS", () => {
    const errs = validateRespondent({
      age: 25,
      sex: "other",
      group: "dissociation",
      phq9: 30, // over
      gad7: -1, // under
      des: 200, // over
    });
    const fields = errs.map((e) => e.field);
    expect(fields).toContain("phq9");
    expect(fields).toContain("gad7");
    expect(fields).toContain("des");
  });

  it("rejects non-integer age", () => {
    const errs = validateRespondent({
      age: 24.5 as unknown as number,
      sex: "f",
      group: "dissociation",
      phq9: 5,
      gad7: 5,
      des: 20,
    });
    expect(errs.map((e) => e.field)).toContain("age");
  });

  it("rejects missing sex / group", () => {
    const errs = validateRespondent({
      age: 24,
      phq9: 5,
      gad7: 5,
    });
    const fields = errs.map((e) => e.field);
    expect(fields).toContain("sex");
    expect(fields).toContain("group");
  });

  it("rejects DES on a depersonalisation respondent", () => {
    const errs = validateRespondent({
      age: 24,
      sex: "f",
      group: "depersonalisation",
      phq9: 5,
      gad7: 5,
      cds: 100,
      des: 33,
    });
    expect(errs.map((e) => e.field)).toContain("des");
  });

  it("rejects CDS on a dissociation respondent", () => {
    const errs = validateRespondent({
      age: 24,
      sex: "f",
      group: "dissociation",
      phq9: 5,
      gad7: 5,
      des: 20,
      cds: 100,
    });
    expect(errs.map((e) => e.field)).toContain("cds");
  });

  it("flags missing specialized scale for the group", () => {
    const errsA = validateRespondent({
      age: 24,
      sex: "f",
      group: "dissociation",
      phq9: 5,
      gad7: 5,
      // no des
    });
    expect(errsA.map((e) => e.field)).toContain("des");

    const errsB = validateRespondent({
      age: 24,
      sex: "f",
      group: "depersonalisation",
      phq9: 5,
      gad7: 5,
      // no cds
    });
    expect(errsB.map((e) => e.field)).toContain("cds");
  });
});

describe("newRespondent — defensive normalization", () => {
  it("strips DES from a depersonalisation record", () => {
    const r = newRespondent({
      age: 24,
      sex: "f",
      group: "depersonalisation",
      phq9: 5,
      gad7: 5,
      cds: 100,
      // @ts-expect-error — intentionally pass an off-group field
      des: 50,
    });
    expect(r.des).toBeUndefined();
    expect(r.cds).toBe(100);
  });

  it("strips CDS from a dissociation record", () => {
    const r = newRespondent({
      age: 24,
      sex: "f",
      group: "dissociation",
      phq9: 5,
      gad7: 5,
      des: 50,
      // @ts-expect-error
      cds: 200,
    });
    expect(r.cds).toBeUndefined();
    expect(r.des).toBe(50);
  });
});

describe("CRUD helpers", () => {
  it("addRespondent prepends to the list", () => {
    const a = newRespondent({
      age: 24,
      sex: "f",
      group: "dissociation",
      phq9: 5,
      gad7: 5,
      des: 20,
    });
    const b = newRespondent({
      age: 30,
      sex: "m",
      group: "depersonalisation",
      phq9: 10,
      gad7: 10,
      cds: 150,
    });
    expect(addRespondent(addRespondent([], a), b).map((r) => r.id)).toEqual([
      b.id,
      a.id,
    ]);
  });

  it("patchRespondent flips group and drops the wrong specialized field", () => {
    const a = newRespondent({
      age: 24,
      sex: "f",
      group: "dissociation",
      phq9: 5,
      gad7: 5,
      des: 20,
    });
    const list = [a];
    const next = patchRespondent(list, a.id, {
      group: "depersonalisation",
      cds: 99,
    });
    expect(next[0].group).toBe("depersonalisation");
    expect(next[0].cds).toBe(99);
    expect(next[0].des).toBeUndefined();
  });

  it("removeRespondent drops by id", () => {
    const a = newRespondent({
      age: 24,
      sex: "f",
      group: "dissociation",
      phq9: 5,
      gad7: 5,
      des: 20,
    });
    expect(removeRespondent([a], a.id)).toEqual([]);
  });
});

describe("subsample filters", () => {
  const records = [
    newRespondent({
      age: 22,
      sex: "f",
      group: "dissociation",
      phq9: 4,
      gad7: 5,
      des: 18,
    }),
    newRespondent({
      age: 27,
      sex: "m",
      group: "depersonalisation",
      phq9: 14,
      gad7: 12,
      cds: 180,
    }),
    newRespondent({
      age: 30,
      sex: "other",
      group: "dissociation",
      phq9: 8,
      gad7: 6,
      des: 35,
    }),
  ];
  it("dissociationGroup", () => {
    expect(dissociationGroup(records).map((r) => r.age)).toEqual([22, 30]);
  });
  it("depersonalisationGroup", () => {
    expect(depersonalisationGroup(records).map((r) => r.age)).toEqual([27]);
  });
});

describe("persistence", () => {
  beforeEach(() => {
    if (typeof window !== "undefined") window.localStorage.clear();
  });

  it("save / load round-trip preserves records", () => {
    const a = newRespondent({
      age: 24,
      sex: "f",
      group: "dissociation",
      phq9: 5,
      gad7: 5,
      des: 20,
    });
    saveDataset([a]);
    expect(loadDataset()).toEqual([a]);
    expect(
      window.localStorage.getItem(THESIS_DATASET_STORAGE_KEY)
    ).toBeTruthy();
  });

  it("loads [] when no data is stored", () => {
    expect(loadDataset()).toEqual([]);
  });
});

describe("respondentsToCSV", () => {
  it("emits the canonical 9-column header + one row per respondent", () => {
    const records = [
      newRespondent({
        age: 24,
        sex: "f",
        group: "dissociation",
        phq9: 5,
        gad7: 6,
        des: 33.4,
      }),
      newRespondent({
        age: 30,
        sex: "m",
        group: "depersonalisation",
        phq9: 12,
        gad7: 9,
        cds: 152,
      }),
    ];
    const csv = respondentsToCSV(records);
    const lines = csv.split("\n");
    expect(lines[0]).toBe(
      "id,created_at,age,sex,group,phq9,gad7,des,cds"
    );
    expect(lines).toHaveLength(3);
    // Dissociation row: cds cell must be empty
    expect(lines[1].endsWith(",33.4,")).toBe(true);
    // Depersonalisation row: des cell must be empty
    expect(lines[2].includes(",,152")).toBe(true);
  });

  it("CSV-escapes embedded commas/quotes/newlines in id (defensive)", () => {
    // Synthetic edge case — generateId() won't produce these, but
    // we want to be safe if id format ever changes.
    const r = {
      ...newRespondent({
        age: 24,
        sex: "f",
        group: "dissociation",
        phq9: 5,
        gad7: 5,
        des: 10,
      }),
      id: 'weird,"id"',
    };
    const csv = respondentsToCSV([r]);
    expect(csv).toContain('"weird,""id"""');
  });
});

describe("PHQ-9 / GAD-7 bands", () => {
  it("PHQ-9 band thresholds", () => {
    expect(phq9Band(0)).toBe("minimal");
    expect(phq9Band(4)).toBe("minimal");
    expect(phq9Band(5)).toBe("mild");
    expect(phq9Band(9)).toBe("mild");
    expect(phq9Band(10)).toBe("moderate");
    expect(phq9Band(14)).toBe("moderate");
    expect(phq9Band(15)).toBe("mod-severe");
    expect(phq9Band(19)).toBe("mod-severe");
    expect(phq9Band(20)).toBe("severe");
    expect(phq9Band(27)).toBe("severe");
  });

  it("PHQ-9 rejects out-of-range scores", () => {
    expect(phq9Band(-1)).toBeNull();
    expect(phq9Band(28)).toBeNull();
  });

  it("GAD-7 band thresholds", () => {
    expect(gad7Band(0)).toBe("minimal");
    expect(gad7Band(4)).toBe("minimal");
    expect(gad7Band(5)).toBe("mild");
    expect(gad7Band(9)).toBe("mild");
    expect(gad7Band(10)).toBe("moderate");
    expect(gad7Band(14)).toBe("moderate");
    expect(gad7Band(15)).toBe("severe");
    expect(gad7Band(21)).toBe("severe");
  });

  it("countPhq9Bands tallies correctly", () => {
    const counts = countPhq9Bands([3, 7, 7, 12, 18, 22]);
    expect(counts.minimal).toBe(1);
    expect(counts.mild).toBe(2);
    expect(counts.moderate).toBe(1);
    expect(counts["mod-severe"]).toBe(1);
    expect(counts.severe).toBe(1);
  });

  it("countGad7Bands tallies correctly", () => {
    const counts = countGad7Bands([2, 6, 11, 16, 20]);
    expect(counts.minimal).toBe(1);
    expect(counts.mild).toBe(1);
    expect(counts.moderate).toBe(1);
    expect(counts.severe).toBe(2);
  });
});
