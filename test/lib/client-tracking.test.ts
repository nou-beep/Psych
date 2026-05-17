import { describe, it, expect } from "vitest";
import {
  TRACKING_DOMAINS,
  buildSeries,
  domainAverages,
  emptyEntry,
  homeworkCompletionRate,
  setHomework,
  setScore,
} from "@/lib/client/client-tracking";

describe("tracking domains", () => {
  it("covers the requested clinical domains", () => {
    const ids = TRACKING_DOMAINS.map((d) => d.id);
    for (const expected of [
      "anxiety",
      "mood",
      "sleep",
      "regulation",
      "dissociation",
      "stress",
    ]) {
      expect(ids).toContain(expected);
    }
  });

  it("each domain has a label and hint", () => {
    for (const d of TRACKING_DOMAINS) {
      expect(d.label.length).toBeGreaterThan(0);
      expect(d.hint.length).toBeGreaterThan(0);
    }
  });
});

describe("entry helpers", () => {
  it("setScore clamps to [0, 10]", () => {
    let e = emptyEntry("2026-01-01");
    e = setScore(e, "anxiety", 12);
    expect(e.scores.anxiety).toBe(10);
    e = setScore(e, "anxiety", -3);
    expect(e.scores.anxiety).toBe(0);
  });

  it("setScore with null removes the domain", () => {
    let e = emptyEntry();
    e = setScore(e, "mood", 7);
    expect(e.scores.mood).toBe(7);
    e = setScore(e, "mood", null);
    expect(e.scores.mood).toBeUndefined();
  });

  it("setHomework records null / true / false", () => {
    let e = emptyEntry();
    e = setHomework(e, true);
    expect(e.homeworkCompleted).toBe(true);
    e = setHomework(e, null);
    expect(e.homeworkCompleted).toBeNull();
  });
});

describe("buildSeries", () => {
  it("returns oldest→newest points only for the requested domain", () => {
    const entries = [
      setScore(emptyEntry("2026-03-01"), "anxiety", 5),
      setScore(emptyEntry("2026-01-01"), "anxiety", 8),
      setScore(emptyEntry("2026-02-01"), "anxiety", 6),
      setScore(emptyEntry("2026-02-01"), "mood", 4),
    ];
    const s = buildSeries(entries, "anxiety");
    expect(s.points.map((p) => p.date)).toEqual([
      "2026-01-01",
      "2026-02-01",
      "2026-03-01",
    ]);
    expect(s.points.map((p) => p.value)).toEqual([8, 6, 5]);
  });

  it("skips entries that don't have the domain set", () => {
    const entries = [emptyEntry("2026-01-01"), emptyEntry("2026-02-01")];
    expect(buildSeries(entries, "anxiety").points).toEqual([]);
  });
});

describe("homeworkCompletionRate", () => {
  it("returns null when no entries have homework tracked", () => {
    const r = homeworkCompletionRate([emptyEntry()]);
    expect(r.rate).toBeNull();
    expect(r.denominator).toBe(0);
  });

  it("computes the ratio over the window", () => {
    const today = new Date().toISOString().split("T")[0];
    const entries = [
      setHomework(emptyEntry(today), true),
      setHomework(emptyEntry(today), true),
      setHomework(emptyEntry(today), false),
    ];
    const r = homeworkCompletionRate(entries);
    expect(r.numerator).toBe(2);
    expect(r.denominator).toBe(3);
    expect(r.rate).toBeCloseTo(2 / 3);
  });
});

describe("domainAverages", () => {
  it("returns null for domains with no data", () => {
    const today = new Date().toISOString().split("T")[0];
    const avgs = domainAverages([setScore(emptyEntry(today), "mood", 6)]);
    expect(avgs.mood).toBe(6);
    expect(avgs.anxiety).toBeNull();
  });

  it("rounds to one decimal place", () => {
    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yString = yesterday.toISOString().split("T")[0];
    const entries = [
      setScore(emptyEntry(today), "anxiety", 6),
      setScore(emptyEntry(yString), "anxiety", 5),
    ];
    const avgs = domainAverages(entries);
    expect(avgs.anxiety).toBeCloseTo(5.5, 1);
  });
});
