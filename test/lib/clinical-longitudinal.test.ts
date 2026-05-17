import { describe, it, expect } from "vitest";
import {
  PHQ9,
  DASS21,
  buildAdministration,
} from "@/lib/clinical/assessments";
import {
  buildOverlayMarkers,
  comparePeriods,
  subscaleSeries,
  summarizePeriod,
  totalScoreSeries,
  symptomSeriesByDomain,
} from "@/lib/clinical/longitudinal";

function admin(date: string, total: number) {
  // Build a PHQ-9 admin with a specific total by setting one item.
  // Use integer < 4 entries to stay in range.
  const items = Array(9).fill(0);
  let left = total;
  for (let i = 0; i < items.length && left > 0; i++) {
    const v = Math.min(3, left);
    items[i] = v;
    left -= v;
  }
  return buildAdministration(PHQ9, { caseId: "c1", date, items });
}

describe("totalScoreSeries", () => {
  it("returns oldest→newest values for the requested assessment only", () => {
    const a = admin("2026-01-01", 5);
    const b = admin("2026-03-01", 12);
    const c = admin("2026-02-01", 8);
    const series = totalScoreSeries([a, b, c], PHQ9);
    expect(series.label).toBe("PHQ-9");
    expect(series.points.map((p) => p.date)).toEqual([
      "2026-01-01",
      "2026-02-01",
      "2026-03-01",
    ]);
    expect(series.points.map((p) => p.value)).toEqual([5, 8, 12]);
  });
});

describe("subscaleSeries", () => {
  it("returns one series per subscale for DASS-21", () => {
    const items = Array(21).fill(0);
    const a = buildAdministration(DASS21, { caseId: "c1", date: "2026-01-01", items });
    const b = buildAdministration(DASS21, { caseId: "c1", date: "2026-02-01", items });
    const series = subscaleSeries([a, b], DASS21);
    expect(series).toHaveLength(3);
    for (const s of series) {
      expect(s.points).toHaveLength(2);
    }
  });
});

describe("summarizePeriod", () => {
  it("computes mean / min / max over a date window", () => {
    const series = totalScoreSeries(
      [admin("2026-01-01", 4), admin("2026-02-01", 12), admin("2026-03-01", 8)],
      PHQ9
    );
    const s = summarizePeriod(series, "2026-01-01", "2026-02-15");
    expect(s.count).toBe(2);
    expect(s.mean).toBe(8);
    expect(s.min).toBe(4);
    expect(s.max).toBe(12);
  });

  it("returns nulls for an empty window", () => {
    const series = totalScoreSeries([admin("2026-01-01", 4)], PHQ9);
    const s = summarizePeriod(series, "2030-01-01", "2030-02-01");
    expect(s.count).toBe(0);
    expect(s.mean).toBeNull();
  });
});

describe("comparePeriods", () => {
  it("calls improvement vs worsening based on higherIsWorse", () => {
    const series = totalScoreSeries(
      [admin("2026-01-15", 18), admin("2026-04-15", 6)],
      PHQ9
    );
    const cmp = comparePeriods(
      series,
      { start: "2026-01-01", end: "2026-01-31" },
      { start: "2026-04-01", end: "2026-04-30" },
      { higherIsWorse: true, stableThreshold: 1 }
    );
    expect(cmp.direction).toBe("improved");
    expect(cmp.delta).toBeLessThan(0);
  });

  it("reports stable when delta is within threshold", () => {
    const series = totalScoreSeries(
      [admin("2026-01-15", 10), admin("2026-04-15", 11)],
      PHQ9
    );
    const cmp = comparePeriods(
      series,
      { start: "2026-01-01", end: "2026-01-31" },
      { start: "2026-04-01", end: "2026-04-30" },
      { higherIsWorse: true, stableThreshold: 2 }
    );
    expect(cmp.direction).toBe("stable");
  });

  it("reports unknown when one side has no data", () => {
    const series = totalScoreSeries([admin("2026-01-15", 10)], PHQ9);
    const cmp = comparePeriods(
      series,
      { start: "2026-01-01", end: "2026-01-31" },
      { start: "2026-12-01", end: "2026-12-31" }
    );
    expect(cmp.direction).toBe("unknown");
  });
});

describe("buildOverlayMarkers", () => {
  it("merges and sorts overlay events", () => {
    const markers = buildOverlayMarkers({
      interventions: [{ id: "i1", date: "2026-03-01", name: "Grounding" }],
      sessions: [{ id: "s1", date: "2026-01-10", topic: "Intake" }],
      milestones: [{ id: "m1", date: "2026-02-01", label: "First report" }],
    });
    expect(markers.map((m) => m.date)).toEqual([
      "2026-01-10",
      "2026-02-01",
      "2026-03-01",
    ]);
    expect(markers[0].kind).toBe("session");
  });
});

describe("symptomSeriesByDomain", () => {
  it("groups records into per-domain series", () => {
    const series = symptomSeriesByDomain(
      [
        { date: "2026-01-01", domain: "anxiety", value: 5 },
        { date: "2026-02-01", domain: "anxiety", value: 8 },
        { date: "2026-01-15", domain: "sleep", value: 6 },
      ],
      ["anxiety", "sleep"]
    );
    expect(series).toHaveLength(2);
    expect(series[0].points).toHaveLength(2);
    expect(series[1].points).toHaveLength(1);
  });
});
