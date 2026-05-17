import { describe, it, expect } from "vitest";
import {
  forgetItem,
  getPosition,
  getUiFlag,
  recentItems,
  recordPosition,
  recordVisit,
  resumeHintsFor,
  setUiFlag,
} from "@/lib/workspace/memory";

describe("workspace recents", () => {
  it("records a new visit", () => {
    const list = recordVisit([], {
      id: "case-1",
      kind: "case",
      label: "C-101",
      href: "/cases/case-1",
    });
    expect(list).toHaveLength(1);
    expect(list[0].visitCount).toBe(1);
  });

  it("bumps an existing item rather than duplicating", () => {
    let list = recordVisit([], {
      id: "case-1",
      kind: "case",
      label: "C-101",
      href: "/cases/case-1",
    });
    list = recordVisit(list, {
      id: "case-1",
      kind: "case",
      label: "C-101",
      href: "/cases/case-1",
    });
    expect(list).toHaveLength(1);
    expect(list[0].visitCount).toBe(2);
  });

  it("merges resume hints — keeps existing when not provided", () => {
    let list = recordVisit([], {
      id: "tx-1",
      kind: "transcript",
      label: "Session 3",
      href: "/transcripts/tx-1",
      resumeHint: "12:34",
    });
    list = recordVisit(list, {
      id: "tx-1",
      kind: "transcript",
      label: "Session 3",
      href: "/transcripts/tx-1",
    });
    expect(list[0].resumeHint).toBe("12:34");
  });

  it("caps the list to 30 entries (sliding window)", () => {
    let list: ReturnType<typeof recordVisit> = [];
    for (let i = 0; i < 35; i++) {
      list = recordVisit(list, {
        id: `id-${i}`,
        kind: "case",
        label: String(i),
        href: "/x",
      });
    }
    expect(list.length).toBe(30);
    expect(list[0].id).toBe("id-34");
  });

  it("recentItems sorts by lastVisitedAt desc with optional kind filter", () => {
    let list = recordVisit([], {
      id: "a",
      kind: "case",
      label: "A",
      href: "/x",
    });
    list = recordVisit(list, {
      id: "b",
      kind: "article",
      label: "B",
      href: "/x",
    });
    list = recordVisit(list, {
      id: "c",
      kind: "case",
      label: "C",
      href: "/x",
    });
    const top = recentItems(list, 10);
    expect(top[0].id).toBe("c");
    const onlyCases = recentItems(list, 10, "case");
    expect(onlyCases.every((r) => r.kind === "case")).toBe(true);
    expect(onlyCases).toHaveLength(2);
  });

  it("forgetItem removes a single matching entry", () => {
    let list = recordVisit([], {
      id: "x",
      kind: "case",
      label: "X",
      href: "/x",
    });
    list = recordVisit(list, {
      id: "x",
      kind: "article",
      label: "X",
      href: "/x",
    });
    list = forgetItem(list, "x", "case");
    expect(list).toHaveLength(1);
    expect(list[0].kind).toBe("article");
  });
});

describe("resume positions", () => {
  it("records and looks up a position by scope", () => {
    let list = recordPosition([], "transcript:tx-1", 47);
    expect(getPosition(list, "transcript:tx-1")?.position).toBe(47);
    list = recordPosition(list, "transcript:tx-1", 88);
    expect(getPosition(list, "transcript:tx-1")?.position).toBe(88);
    expect(list).toHaveLength(1);
  });
});

describe("UI flags", () => {
  it("set / get with fallback typing", () => {
    let flags = setUiFlag({}, "sidebar-collapsed", true);
    expect(getUiFlag(flags, "sidebar-collapsed", false)).toBe(true);
    expect(getUiFlag(flags, "missing", "default")).toBe("default");
    flags = setUiFlag(flags, "limit", 25);
    expect(getUiFlag(flags, "limit", 0)).toBe(25);
  });
});

describe("resume hints", () => {
  it("only returns entries that have a resumeHint", () => {
    let list = recordVisit([], {
      id: "a",
      kind: "transcript",
      label: "A",
      href: "/x",
      resumeHint: "01:23",
    });
    list = recordVisit(list, {
      id: "b",
      kind: "case",
      label: "B",
      href: "/x",
    });
    const hints = resumeHintsFor(list);
    expect(hints).toHaveLength(1);
    expect(hints[0].hint).toBe("01:23");
  });
});
