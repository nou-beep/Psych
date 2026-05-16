import { describe, it, expect } from "vitest";
import {
  describe as desc,
  round,
  frequencies,
  pearson,
  correlationMatrix,
  scorePHQ9,
  scoreGAD7,
  scoreSum,
  findDuplicateIds,
  findMissing,
  findImpossibleValues,
  parseCSV,
  toCSV,
} from "@/lib/scoring";

describe("describe (descriptives)", () => {
  it("returns zeros for an empty array", () => {
    expect(desc([])).toEqual({
      n: 0,
      mean: 0,
      median: 0,
      sd: 0,
      min: 0,
      max: 0,
      range: 0,
    });
  });

  it("ignores null and NaN values", () => {
    const d = desc([1, 2, null, NaN, 3, undefined]);
    expect(d.n).toBe(3);
    expect(d.mean).toBe(2);
    expect(d.median).toBe(2);
    expect(d.min).toBe(1);
    expect(d.max).toBe(3);
    expect(d.range).toBe(2);
  });

  it("computes sample standard deviation (n-1)", () => {
    const d = desc([2, 4, 4, 4, 5, 5, 7, 9]);
    expect(d.mean).toBe(5);
    expect(d.sd).toBeCloseTo(2.14, 1);
  });
});

describe("round", () => {
  it("rounds to 2 digits by default", () => {
    expect(round(1.2345)).toBe(1.23);
    expect(round(1.235)).toBe(1.24);
  });
  it("returns 0 for NaN", () => {
    expect(round(NaN)).toBe(0);
  });
});

describe("frequencies", () => {
  it("returns counts and percentages sorted descending", () => {
    const f = frequencies(["a", "a", "b", "c", "a", "b"]);
    expect(f[0]).toEqual({ value: "a", count: 3, percent: 50 });
    expect(f[1]).toEqual({ value: "b", count: 2, percent: 33.3 });
    expect(f[2]).toEqual({ value: "c", count: 1, percent: 16.7 });
  });

  it("ignores null, undefined, and empty strings", () => {
    const f = frequencies([null, undefined, "", "a", "a"]);
    expect(f).toEqual([{ value: "a", count: 2, percent: 100 }]);
  });
});

describe("pearson", () => {
  it("returns 1 for perfectly correlated data", () => {
    expect(pearson([1, 2, 3], [2, 4, 6])).toBe(1);
  });
  it("returns -1 for perfectly anti-correlated data", () => {
    expect(pearson([1, 2, 3], [6, 4, 2])).toBe(-1);
  });
  it("returns 0 when there is no variance", () => {
    expect(pearson([1, 1, 1], [1, 2, 3])).toBe(0);
  });
  it("returns 0 with fewer than 2 pairs", () => {
    expect(pearson([1], [2])).toBe(0);
  });
});

describe("correlationMatrix", () => {
  it("produces pairwise rows skipping nulls", () => {
    const rows = [
      { a: 1, b: 2, c: null },
      { a: 2, b: 4, c: 1 },
      { a: 3, b: 6, c: 2 },
    ];
    const m = correlationMatrix(rows, ["a", "b", "c"]);
    const ab = m.find((x) => x.a === "a" && x.b === "b")!;
    expect(ab.r).toBe(1);
    expect(ab.n).toBe(3);
    const ac = m.find((x) => x.a === "a" && x.b === "c")!;
    expect(ac.n).toBe(2);
  });
});

describe("scorePHQ9", () => {
  it("rejects arrays of the wrong length", () => {
    expect(() => scorePHQ9([0, 0, 0])).toThrow();
  });

  it("scores minimal severity at total 0", () => {
    const r = scorePHQ9([0, 0, 0, 0, 0, 0, 0, 0, 0]);
    expect(r.total).toBe(0);
    expect(r.severity).toBe("Minimal");
    expect(r.flags.item9SuicideRisk).toBe(false);
  });

  it("uses standard severity bands", () => {
    expect(scorePHQ9([1, 0, 0, 0, 0, 0, 0, 0, 0]).severity).toBe("Minimal");
    expect(scorePHQ9([1, 1, 1, 1, 1, 0, 0, 0, 0]).severity).toBe("Mild"); // 5
    expect(scorePHQ9([2, 2, 1, 1, 1, 1, 1, 1, 0]).severity).toBe("Moderate"); // 10
    expect(scorePHQ9([2, 2, 2, 2, 2, 2, 2, 1, 0]).severity).toBe(
      "Moderately severe"
    ); // 15
    expect(scorePHQ9([3, 3, 3, 3, 3, 3, 1, 0, 1]).severity).toBe("Severe"); // 20
  });

  it("flags item-9 risk when last item is > 0", () => {
    const r = scorePHQ9([0, 0, 0, 0, 0, 0, 0, 0, 2]);
    expect(r.flags.item9SuicideRisk).toBe(true);
  });

  it("returns Incomplete when any item is invalid", () => {
    const r = scorePHQ9([0, 0, 0, null, 0, 0, 0, 0, 0]);
    expect(r.severity).toBe("Incomplete");
    expect(r.itemCount).toBe(8);
  });

  it("treats out-of-range values as missing", () => {
    const r = scorePHQ9([5, 0, 0, 0, 0, 0, 0, 0, 0]);
    expect(r.severity).toBe("Incomplete");
  });
});

describe("scoreGAD7", () => {
  it("rejects arrays of the wrong length", () => {
    expect(() => scoreGAD7([0, 0])).toThrow();
  });

  it("uses standard severity bands", () => {
    expect(scoreGAD7([0, 0, 0, 0, 0, 0, 0]).severity).toBe("Minimal");
    expect(scoreGAD7([1, 1, 1, 1, 1, 0, 0]).severity).toBe("Mild"); // 5
    expect(scoreGAD7([2, 2, 1, 1, 1, 2, 1]).severity).toBe("Moderate"); // 10
    // 15+ is severe under the standard GAD-7 thresholds.
    expect(scoreGAD7([3, 3, 3, 3, 3, 0, 0]).severity).toBe("Severe"); // 15
    expect(scoreGAD7([3, 3, 3, 3, 3, 3, 3]).severity).toBe("Severe"); // 21
  });

  it("returns Incomplete when items missing", () => {
    expect(scoreGAD7([0, 0, null, 0, 0, 0, 0]).severity).toBe("Incomplete");
  });
});

describe("scoreSum", () => {
  it("sums when all items present", () => {
    expect(scoreSum([1, 2, 3]).total).toBe(6);
  });
  it("flags incomplete when missing items unless allowMissing", () => {
    expect(scoreSum([1, null, 2]).incomplete).toBe(true);
    expect(scoreSum([1, null, 2]).total).toBe(0);
    expect(scoreSum([1, null, 2], { allowMissing: true }).total).toBe(3);
  });
});

describe("quality checks", () => {
  it("findDuplicateIds returns codes that appear more than once", () => {
    const dupes = findDuplicateIds([
      { code: "A" },
      { code: "B" },
      { code: "A" },
      { code: "A" },
      { code: "C" },
    ]);
    expect(dupes).toEqual(["A"]);
  });

  it("findMissing reports each missing field per participant", () => {
    const issues = findMissing(
      [
        { code: "A", x: 1, y: null },
        { code: "B", x: null, y: 2 },
      ],
      ["x", "y"]
    );
    expect(issues).toHaveLength(2);
    expect(issues[0]).toMatchObject({ participantCode: "A", field: "y" });
    expect(issues[1]).toMatchObject({ participantCode: "B", field: "x" });
  });

  it("findImpossibleValues flags out-of-range numbers", () => {
    const issues = findImpossibleValues(
      [
        { code: "A", phq9: 30 },
        { code: "B", phq9: -1 },
        { code: "C", phq9: 12 },
        { code: "D", phq9: null },
      ],
      { fields: { phq9: { min: 0, max: 27 } } }
    );
    expect(issues).toHaveLength(2);
    expect(issues[0].participantCode).toBe("A");
    expect(issues[1].participantCode).toBe("B");
  });
});

describe("CSV helpers", () => {
  it("parseCSV splits rows and cells, handling quoted commas", () => {
    const rows = parseCSV(`code,note\nP-001,"hello, world"\nP-002,plain`);
    expect(rows).toEqual([
      ["code", "note"],
      ["P-001", "hello, world"],
      ["P-002", "plain"],
    ]);
  });

  it("parseCSV handles escaped quotes", () => {
    const rows = parseCSV(`a,b\n"she said ""hi""",x`);
    expect(rows[1]).toEqual([`she said "hi"`, "x"]);
  });

  it("toCSV quotes cells containing commas or quotes", () => {
    const csv = toCSV(
      ["code", "note"],
      [
        ["P-001", "hello, world"],
        ["P-002", 'has "quotes"'],
      ]
    );
    expect(csv).toBe(
      `code,note\nP-001,"hello, world"\nP-002,"has ""quotes"""`
    );
  });

  it("round-trips a simple table", () => {
    const csv = toCSV(["x", "y"], [["a", 1], ["b", 2]]);
    const rows = parseCSV(csv);
    expect(rows).toEqual([
      ["x", "y"],
      ["a", "1"],
      ["b", "2"],
    ]);
  });
});
