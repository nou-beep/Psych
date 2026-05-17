import { describe, it, expect } from "vitest";
import {
  addRelated,
  filterLoops,
  loopStats,
  loopsBySurface,
  newLoop,
  patchLoop,
  rankLoops,
  removeLoop,
  setStatus,
  staleLoops,
} from "@/lib/workspace/tracked-loops";

describe("tracked loops factory", () => {
  it("creates a loop with sensible defaults", () => {
    const l = newLoop({ title: "  follow up on Sierra paper  " });
    expect(l.title).toBe("follow up on Sierra paper");
    expect(l.surface).toBe("global");
    expect(l.priority).toBe("medium");
    expect(l.weight).toBe("moderate");
    expect(l.status).toBe("open");
    expect(l.tags).toEqual([]);
    expect(l.related).toEqual([]);
  });

  it("trims tags and drops empties", () => {
    const l = newLoop({
      title: "x",
      tags: ["", "  thesis ", "case"],
    });
    expect(l.tags).toEqual(["thesis", "case"]);
  });
});

describe("mutations", () => {
  it("patchLoop updates fields and updatedAt", () => {
    const l = newLoop({ title: "x" });
    const next = patchLoop([l], l.id, { priority: "high" });
    expect(next[0].priority).toBe("high");
  });

  it("setStatus to resolved stamps resolvedAt and resolutionNote", () => {
    const l = newLoop({ title: "x" });
    const next = setStatus([l], l.id, "resolved", "Talked through in supervision.");
    expect(next[0].status).toBe("resolved");
    expect(next[0].resolvedAt).toBeTruthy();
    expect(next[0].resolutionNote).toBe("Talked through in supervision.");
  });

  it("setStatus to non-resolved does not stamp resolvedAt", () => {
    const l = newLoop({ title: "x" });
    const next = setStatus([l], l.id, "parked");
    expect(next[0].resolvedAt).toBeUndefined();
  });

  it("addRelated is idempotent (no duplicates)", () => {
    const l = newLoop({ title: "x" });
    let list = addRelated([l], l.id, {
      kind: "case",
      id: "case-1",
      label: "C-101",
    });
    list = addRelated(list, l.id, {
      kind: "case",
      id: "case-1",
      label: "C-101",
    });
    expect(list[0].related).toHaveLength(1);
  });

  it("removeLoop removes by id", () => {
    const l = newLoop({ title: "x" });
    expect(removeLoop([l], l.id)).toEqual([]);
  });
});

describe("filtering and views", () => {
  const a = newLoop({
    title: "a",
    surface: "thesis",
    priority: "high",
  });
  const b = newLoop({
    title: "b",
    surface: "case",
    priority: "low",
    related: [{ kind: "case", id: "case-1", label: "C-101" }],
  });
  const c = newLoop({
    title: "c",
    surface: "transcript",
    weight: "heavy",
  });

  it("filters by surface, priority, weight", () => {
    expect(filterLoops([a, b, c], { surface: "thesis" })).toHaveLength(1);
    expect(filterLoops([a, b, c], { priority: "high" })).toHaveLength(1);
    expect(filterLoops([a, b, c], { weight: "heavy" })).toHaveLength(1);
  });

  it("filters by caseId via related material", () => {
    expect(filterLoops([a, b, c], { caseId: "case-1" })).toHaveLength(1);
  });

  it("loopsBySurface groups into all surfaces", () => {
    const groups = loopsBySurface([a, b, c]);
    expect(groups.thesis).toHaveLength(1);
    expect(groups.case).toHaveLength(1);
    expect(groups.transcript).toHaveLength(1);
    expect(groups.global).toHaveLength(0);
  });
});

describe("rankLoops", () => {
  it("ranks in-progress > open > parked > resolved", () => {
    const open = newLoop({ title: "o" });
    const inprog = setStatus([open], open.id, "in-progress")[0];
    const parked = newLoop({ title: "p" });
    const parkedSet = setStatus([parked], parked.id, "parked")[0];
    const resolved = newLoop({ title: "r" });
    const resolvedSet = setStatus([resolved], resolved.id, "resolved")[0];
    const ranked = rankLoops([resolvedSet, parkedSet, inprog, open]);
    expect(ranked.map((l) => l.status)).toEqual([
      "in-progress",
      "open",
      "parked",
      "resolved",
    ]);
  });

  it("within same status, high priority first", () => {
    const lo = newLoop({ title: "low", priority: "low" });
    const hi = newLoop({ title: "hi", priority: "high" });
    const ranked = rankLoops([lo, hi]);
    expect(ranked[0].priority).toBe("high");
  });
});

describe("staleness", () => {
  it("flags loops with revisitBy in the past", () => {
    const past = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString();
    const l = newLoop({ title: "x", revisitBy: past });
    expect(staleLoops([l])).toHaveLength(1);
  });

  it("flags loops untouched for 14+ days", () => {
    const old = new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString();
    const l = { ...newLoop({ title: "x" }), updatedAt: old, createdAt: old };
    expect(staleLoops([l])).toHaveLength(1);
  });

  it("does not flag resolved loops", () => {
    const past = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString();
    const open = newLoop({ title: "x", revisitBy: past });
    const list = setStatus([open], open.id, "resolved");
    expect(staleLoops(list)).toHaveLength(0);
  });
});

describe("loopStats", () => {
  it("aggregates totals + by-surface counts", () => {
    const a = newLoop({ title: "a", surface: "thesis", priority: "high" });
    const b = newLoop({ title: "b", surface: "case", weight: "heavy" });
    const stats = loopStats([a, b]);
    expect(stats.total).toBe(2);
    expect(stats.open).toBe(2);
    expect(stats.highPriority).toBe(1);
    expect(stats.heavy).toBe(1);
    expect(stats.bySurface.thesis).toBe(1);
    expect(stats.bySurface.case).toBe(1);
  });
});
