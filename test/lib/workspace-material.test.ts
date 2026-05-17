import { describe, it, expect } from "vitest";
import {
  collectMaterial,
  filterMaterial,
  fragmentFromCapture,
  fragmentFromLoop,
  fragmentFromQuote,
  fragmentFromThought,
  fragmentsFromLiterature,
  materialStats,
  sortMaterial,
  tagsAcross,
  themesAcross,
} from "@/lib/workspace/material";
import { emptyQuote } from "@/lib/research/quote-bank";
import { newCapture } from "@/lib/workspace/quick-capture";
import { newLoop } from "@/lib/workspace/tracked-loops";
import { addThought, emptyBoard } from "@/lib/workspace/thinking-mode";
import { emptyItem, addExcerpt } from "@/lib/research/literature";

describe("material adapters", () => {
  it("adapts a quote", () => {
    const q = emptyQuote({
      body: "I felt nothing in the third week.",
      themes: ["dissociation", "withdrawal"],
      emotionalTags: ["numbness"],
      favourite: true,
      reportSafe: false,
      reference: "Session 4 · 18:22",
    });
    const f = fragmentFromQuote(q);
    expect(f.kind).toBe("quote");
    expect(f.id).toBe(`quote:${q.id}`);
    expect(f.themes).toEqual(["dissociation", "withdrawal"]);
    expect(f.tags).toEqual(["numbness"]);
    expect(f.pinned).toBe(true);
    expect(f.status).toBe("sensitive");
    expect(f.origin).toBe("Session 4 · 18:22");
    expect(f.label).toMatch(/Quote · 2 themes/);
  });

  it("adapts a capture", () => {
    const c = newCapture({
      kind: "observation",
      body: "Patient avoided eye contact during the body scan.",
      tags: ["session-4", "avoidance"],
      pinned: true,
      source: "/cases/abc",
    });
    const f = fragmentFromCapture(c);
    expect(f.kind).toBe("capture");
    expect(f.id).toBe(`capture:${c.id}`);
    expect(f.label).toBe("Observation");
    expect(f.tags).toEqual(["session-4", "avoidance"]);
    expect(f.pinned).toBe(true);
    expect(f.status).toBe("inbox");
    expect(f.origin).toBe("/cases/abc");
  });

  it("adapts a loop", () => {
    const l = newLoop({
      title: "Revisit Sierra paper",
      body: "Their attachment-distress section maps onto ch.4.",
      priority: "high",
      surface: "thesis",
      tags: ["attachment", "ch4"],
      revisitBy: "2026-06-01",
    });
    const f = fragmentFromLoop(l);
    expect(f.kind).toBe("loop");
    expect(f.id).toBe(`loop:${l.id}`);
    expect(f.label).toBe("Loop · high");
    expect(f.tags).toEqual(["attachment", "ch4"]);
    expect(f.body).toMatch(/Revisit Sierra paper/);
    expect(f.body).toMatch(/attachment-distress section/);
    expect(f.origin).toBe("revisit by 2026-06-01");
    expect(f.status).toBe("open");
  });

  it("adapts a thinking thought", () => {
    let b = emptyBoard();
    b = addThought(b, {
      body: "The DPDR symptoms peak at week 3 — recurring",
      kind: "tension",
      cluster: "dpdr",
      color: "violet",
    });
    const t = b.thoughts[0];
    const f = fragmentFromThought(t);
    expect(f.kind).toBe("thought");
    expect(f.id).toBe(`thought:${t.id}`);
    expect(f.label).toBe("Tension");
    expect(f.tags).toEqual(["dpdr"]);
    expect(f.color).toBe("violet");
  });

  it("adapts literature excerpts", () => {
    let item = emptyItem({
      title: "Sierra & Berrios (2001) — Depersonalization Scale",
      authors: "Sierra M, Berrios GE",
      themes: ["dpdr", "scale-development"],
      pinnedReading: true,
    });
    item = addExcerpt(item, "Depersonalization can be measured along a continuum.", "12");
    item = addExcerpt(item, "Anhedonia and numbing co-occur in 60% of cases.");
    const fragments = fragmentsFromLiterature(item);
    expect(fragments).toHaveLength(2);
    expect(fragments[0].kind).toBe("excerpt");
    expect(fragments[0].themes).toEqual(["dpdr", "scale-development"]);
    expect(fragments[0].origin).toMatch(/Sierra M, Berrios GE/);
    expect(fragments[0].origin).toMatch(/p\. 12/);
    expect(fragments[1].origin).toMatch(/Sierra M, Berrios GE/);
    expect(fragments[1].origin).not.toMatch(/p\./);
    expect(fragments[0].pinned).toBe(true);
  });
});

describe("collectMaterial", () => {
  it("combines all sources into one flat array", () => {
    const q = emptyQuote({ body: "q" });
    const c = newCapture({ body: "c" });
    const l = newLoop({ title: "l" });
    let b = emptyBoard();
    b = addThought(b, { body: "t" });
    const item = addExcerpt(emptyItem({ title: "Paper" }), "ex");
    const fragments = collectMaterial({
      quotes: [q],
      captures: [c],
      loops: [l],
      thoughts: b.thoughts,
      literature: [item],
    });
    expect(fragments).toHaveLength(5);
    expect(fragments.map((f) => f.kind).sort()).toEqual([
      "capture",
      "excerpt",
      "loop",
      "quote",
      "thought",
    ]);
  });

  it("handles missing source slots", () => {
    expect(collectMaterial({})).toEqual([]);
    expect(collectMaterial({ quotes: [] })).toEqual([]);
  });
});

describe("filterMaterial", () => {
  const q = fragmentFromQuote(
    emptyQuote({
      body: "I felt numb",
      themes: ["dissociation"],
      emotionalTags: ["numbness"],
    })
  );
  const c = fragmentFromCapture(
    newCapture({
      body: "Avoided eye contact",
      tags: ["session-4"],
      kind: "observation",
    })
  );
  const l = fragmentFromLoop(
    newLoop({
      title: "Re-read Sierra",
      tags: ["dpdr"],
      priority: "high",
    })
  );
  const fragments = [q, c, l];

  it("filters by kind", () => {
    expect(filterMaterial(fragments, { kinds: ["quote"] })).toHaveLength(1);
    expect(
      filterMaterial(fragments, { kinds: ["quote", "capture"] })
    ).toHaveLength(2);
  });

  it("filters by tag (case-insensitive)", () => {
    expect(filterMaterial(fragments, { tag: "DPDR" })).toHaveLength(1);
    expect(filterMaterial(fragments, { tag: "session-4" })).toHaveLength(1);
    expect(filterMaterial(fragments, { tag: "missing" })).toHaveLength(0);
  });

  it("filters by theme", () => {
    expect(filterMaterial(fragments, { theme: "dissociation" })).toHaveLength(
      1
    );
  });

  it("searches across body, tags and themes", () => {
    expect(filterMaterial(fragments, { query: "numb" })).toHaveLength(1);
    expect(filterMaterial(fragments, { query: "dpdr" })).toHaveLength(1);
    expect(filterMaterial(fragments, { query: "sierra" })).toHaveLength(1);
    expect(filterMaterial(fragments, { query: "completelyabsent" })).toHaveLength(0);
  });

  it("filters by status", () => {
    expect(filterMaterial(fragments, { status: "inbox" })).toHaveLength(1);
    expect(filterMaterial(fragments, { status: "open" })).toHaveLength(1);
  });
});

describe("sortMaterial", () => {
  it("recent sort puts most recently-updated first", () => {
    const older = fragmentFromQuote({
      ...emptyQuote(),
      updatedAt: "2026-01-01T00:00:00Z",
    });
    const newer = fragmentFromQuote({
      ...emptyQuote(),
      updatedAt: "2026-05-01T00:00:00Z",
    });
    const sorted = sortMaterial([older, newer], "recent");
    expect(sorted[0]).toBe(newer);
  });

  it("pinned-first sort puts pinned ahead", () => {
    const pinned = fragmentFromQuote(emptyQuote({ favourite: true }));
    const plain = fragmentFromQuote(emptyQuote({ favourite: false }));
    expect(sortMaterial([plain, pinned], "pinned-first")[0]).toBe(pinned);
  });

  it("kind sort groups by kind", () => {
    const q = fragmentFromQuote(emptyQuote());
    const c = fragmentFromCapture(newCapture({ body: "x" }));
    const sorted = sortMaterial([q, c], "kind");
    expect(sorted[0].kind).toBe("capture");
    expect(sorted[1].kind).toBe("quote");
  });
});

describe("tag / theme indexes + stats", () => {
  it("returns sorted unique tag list", () => {
    const a = fragmentFromCapture(
      newCapture({ body: "a", tags: ["b", "a"] })
    );
    const b = fragmentFromCapture(
      newCapture({ body: "b", tags: ["c"] })
    );
    expect(tagsAcross([a, b])).toEqual(["a", "b", "c"]);
  });

  it("returns sorted unique theme list", () => {
    const a = fragmentFromQuote(emptyQuote({ themes: ["x", "y"] }));
    const b = fragmentFromQuote(emptyQuote({ themes: ["x", "z"] }));
    expect(themesAcross([a, b])).toEqual(["x", "y", "z"]);
  });

  it("aggregates counts in materialStats", () => {
    const q = fragmentFromQuote(emptyQuote({ favourite: true }));
    const c = fragmentFromCapture(newCapture({ body: "x", tags: ["t"] }));
    const stats = materialStats([q, c]);
    expect(stats.total).toBe(2);
    expect(stats.byKind.quote).toBe(1);
    expect(stats.byKind.capture).toBe(1);
    expect(stats.pinned).toBe(1);
    expect(stats.tagged).toBe(1);
  });
});
