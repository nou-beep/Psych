import { describe, it, expect } from "vitest";
import {
  DESK_OBJECT_LABELS,
  bringToFront,
  emptyDeskObject,
  forCase,
  patch,
  unscoped,
  visibleOrder,
} from "@/lib/desk/objects";

describe("desk objects", () => {
  it("every kind has a label", () => {
    for (const k of [
      "pinned-quote",
      "sticky-reminder",
      "open-notebook",
      "active-report",
      "transcript-fragment",
      "read-later",
      "supervision-reminder",
      "unfinished-formulation",
      "highlighted-excerpt",
    ] as const) {
      expect(DESK_OBJECT_LABELS[k]).toBeTruthy();
    }
  });

  it("emptyDeskObject places objects roughly in the middle and unpinned", () => {
    const o = emptyDeskObject("sticky-reminder");
    expect(o.pinned).toBe(false);
    expect(o.x).toBeGreaterThanOrEqual(0.3);
    expect(o.x).toBeLessThanOrEqual(0.7);
    expect(o.color).toBe("rose");
  });

  it("patch merges and refreshes updatedAt", async () => {
    const o = emptyDeskObject("sticky-reminder");
    await new Promise((r) => setTimeout(r, 3));
    const next = patch(o, { body: "remind me later", color: "amber" });
    expect(next.body).toBe("remind me later");
    expect(next.color).toBe("amber");
    expect(next.updatedAt).not.toBe(o.updatedAt);
  });

  it("bringToFront sets the picked object's z above all others", () => {
    const a = emptyDeskObject("sticky-reminder", { z: 1 });
    const b = emptyDeskObject("pinned-quote", { z: 5 });
    const c = emptyDeskObject("read-later", { z: 3 });
    const next = bringToFront([a, b, c], a.id);
    expect(next.find((o) => o.id === a.id)!.z).toBe(6);
  });

  it("forCase / unscoped split correctly", () => {
    const scoped = emptyDeskObject("sticky-reminder", { caseId: "c1" });
    const free = emptyDeskObject("read-later");
    expect(forCase([scoped, free], "c1")).toEqual([scoped]);
    expect(unscoped([scoped, free])).toEqual([free]);
  });

  it("visibleOrder puts pinned first then z ascending", () => {
    const a = emptyDeskObject("sticky-reminder", { z: 1 });
    const b = emptyDeskObject("read-later", { z: 5, pinned: true });
    const c = emptyDeskObject("active-report", { z: 3 });
    const ordered = visibleOrder([a, b, c]).map((o) => o.id);
    expect(ordered).toEqual([b.id, a.id, c.id]);
  });
});
