import { describe, it, expect } from "vitest";
import {
  CAPTURE_KINDS,
  archiveCapture,
  byKind,
  byLinkTarget,
  captureStats,
  inboxView,
  newCapture,
  patchCapture,
  pinCapture,
  processCapture,
  removeCapture,
  restoreCapture,
  searchCaptures,
} from "@/lib/workspace/quick-capture";

describe("quick-capture", () => {
  it("creates a capture with sensible defaults", () => {
    const c = newCapture({ body: "  Trying a hypothesis  " });
    expect(c.body).toBe("Trying a hypothesis");
    expect(c.kind).toBe("observation");
    expect(c.status).toBe("inbox");
    expect(c.pinned).toBe(false);
    expect(c.color).toBe("default");
    expect(c.tags).toEqual([]);
    expect(c.links).toEqual([]);
  });

  it("filters empty tags and trims", () => {
    const c = newCapture({
      body: "x",
      tags: ["", "  thesis  ", "session"],
    });
    expect(c.tags).toEqual(["thesis", "session"]);
  });

  it("kinds list matches the labels map", () => {
    expect(CAPTURE_KINDS.length).toBeGreaterThan(10);
    expect(CAPTURE_KINDS).toContain("thesis-thought");
    expect(CAPTURE_KINDS).toContain("supervision-point");
    expect(CAPTURE_KINDS).toContain("body-sensation");
  });

  it("processes / archives / restores by id", () => {
    const c = newCapture({ body: "x" });
    let list = [c];
    list = processCapture(list, c.id);
    expect(list[0].status).toBe("processed");
    list = archiveCapture(list, c.id);
    expect(list[0].status).toBe("archived");
    list = restoreCapture(list, c.id);
    expect(list[0].status).toBe("inbox");
  });

  it("inboxView sorts pinned first then newest", () => {
    const a = { ...newCapture({ body: "a" }), createdAt: "2025-01-01T00:00:00Z" };
    const b = { ...newCapture({ body: "b" }), createdAt: "2025-02-01T00:00:00Z" };
    const c = {
      ...newCapture({ body: "c", pinned: true }),
      createdAt: "2025-01-15T00:00:00Z",
    };
    const view = inboxView([a, b, c]);
    expect(view[0].id).toBe(c.id); // pinned first
    expect(view[1].id).toBe(b.id); // then newest
    expect(view[2].id).toBe(a.id);
  });

  it("byLinkTarget filters captures linked to a specific case", () => {
    const c1 = newCapture({
      body: "x",
      links: [{ kind: "case", id: "case-1" }],
    });
    const c2 = newCapture({
      body: "y",
      links: [{ kind: "case", id: "case-2" }],
    });
    expect(byLinkTarget([c1, c2], "case", "case-1")).toHaveLength(1);
    expect(byLinkTarget([c1, c2], "case", "case-1")[0].id).toBe(c1.id);
  });

  it("search matches body, tags, kind, source, link labels", () => {
    const c1 = newCapture({ body: "Sierra paper insight", kind: "article-insight" });
    const c2 = newCapture({
      body: "another note",
      links: [{ kind: "case", id: "case-1", label: "C-101" }],
    });
    expect(searchCaptures([c1, c2], "sierra")).toHaveLength(1);
    expect(searchCaptures([c1, c2], "article")).toHaveLength(1);
    expect(searchCaptures([c1, c2], "C-101")).toHaveLength(1);
  });

  it("pin and patch flow", () => {
    const c = newCapture({ body: "x" });
    let list = pinCapture([c], c.id, true);
    expect(list[0].pinned).toBe(true);
    list = patchCapture(list, c.id, { color: "amber" });
    expect(list[0].color).toBe("amber");
    list = removeCapture(list, c.id);
    expect(list).toHaveLength(0);
  });

  it("byKind groups captures into all known kinds", () => {
    const list = [
      newCapture({ body: "q", kind: "quote" }),
      newCapture({ body: "t", kind: "thesis-thought" }),
    ];
    const grouped = byKind(list);
    expect(grouped.quote).toHaveLength(1);
    expect(grouped["thesis-thought"]).toHaveLength(1);
    expect(grouped["body-sensation"]).toHaveLength(0);
  });

  it("captureStats reports totals and per-kind counts", () => {
    const list = [
      newCapture({ body: "a", kind: "quote", pinned: true }),
      newCapture({ body: "b", kind: "quote" }),
      newCapture({ body: "c", kind: "hypothesis" }),
    ];
    const stats = captureStats(list);
    expect(stats.total).toBe(3);
    expect(stats.inbox).toBe(3);
    expect(stats.pinned).toBe(1);
    expect(stats.byKind.quote).toBe(2);
    expect(stats.byKind.hypothesis).toBe(1);
  });
});
