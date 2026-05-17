import { describe, it, expect } from "vitest";
import {
  NOTE_COLOURS,
  emptyNote,
  forCase,
  orderForBoard,
  search,
  togglePin,
} from "@/lib/clinical/quick-notes";

describe("quick notes", () => {
  it("every colour has a tint and accent", () => {
    for (const meta of Object.values(NOTE_COLOURS)) {
      expect(meta.tint.length).toBeGreaterThan(0);
      expect(meta.accent.length).toBeGreaterThan(0);
    }
  });

  it("emptyNote defaults are rose and unpinned", () => {
    const n = emptyNote();
    expect(n.colour).toBe("rose");
    expect(n.pinned).toBe(false);
  });

  it("togglePin flips the flag", () => {
    const n = emptyNote();
    const flipped = togglePin(n);
    expect(flipped.pinned).toBe(true);
    expect(togglePin(flipped).pinned).toBe(false);
  });

  it("orderForBoard puts pinned first then newest", () => {
    // Set updatedAt directly — update() refreshes it to nowISO().
    const a = { ...emptyNote({ body: "a" }), updatedAt: "2026-05-01T00:00:00Z" };
    const b = {
      ...emptyNote({ body: "b", pinned: true }),
      updatedAt: "2026-04-01T00:00:00Z",
    };
    const c = { ...emptyNote({ body: "c" }), updatedAt: "2026-05-10T00:00:00Z" };
    const ordered = orderForBoard([a, b, c]).map((n) => n.body);
    expect(ordered).toEqual(["b", "c", "a"]);
  });

  it("search matches body and tags", () => {
    const a = emptyNote({ body: "follow up on grounding next week" });
    const b = emptyNote({ body: "supervision question", tags: ["supervision"] });
    expect(search([a, b], "grounding").map((n) => n.body)).toEqual([a.body]);
    expect(search([a, b], "supervision").map((n) => n.body)).toEqual([b.body]);
    expect(search([a, b], "")).toHaveLength(2);
  });

  it("forCase filters by caseId", () => {
    const a = emptyNote({ caseId: "c1" });
    const b = emptyNote({ caseId: "c2" });
    expect(forCase([a, b], "c1")).toEqual([a]);
  });
});
