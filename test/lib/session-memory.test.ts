import { describe, it, expect, beforeEach } from "vitest";
import {
  activeMemory,
  addMemoryItem,
  archiveMemoryItem,
  groupMemoryByKind,
  loadMemoryItems,
  MEMORY_COLORS,
  MEMORY_STORAGE_KEY,
  memoryForSession,
  newMemoryItem,
  patchMemoryItem,
  removeMemoryItem,
  restoreMemoryItem,
  saveMemoryItems,
  toggleMemoryColor,
} from "@/lib/clinical/session-memory";

describe("session-memory store", () => {
  beforeEach(() => {
    if (typeof window !== "undefined") window.localStorage.clear();
  });

  it("newMemoryItem produces a sane default", () => {
    const item = newMemoryItem({
      sessionId: "INT-AP-001",
      kind: "observation",
      body: "M. évite le contact visuel mais répond aux prénoms familiers.",
    });
    expect(item.id).toBeTruthy();
    expect(item.kind).toBe("observation");
    expect(item.pinned).toBe(true);
    expect(item.archived).toBe(false);
    expect(item.color).toBe("neutral");
    expect(item.tags).toEqual([]);
    expect(item.createdAt).toBeTruthy();
  });

  it("addMemoryItem prepends to the list", () => {
    const a = newMemoryItem({ sessionId: "s", kind: "observation", body: "a" });
    const b = newMemoryItem({ sessionId: "s", kind: "hypothesis", body: "b" });
    const out = addMemoryItem(addMemoryItem([], a), b);
    expect(out.map((m) => m.body)).toEqual(["b", "a"]);
  });

  it("patchMemoryItem updates fields and bumps updatedAt", () => {
    const a = newMemoryItem({ sessionId: "s", kind: "observation", body: "a" });
    const list = [a];
    const next = patchMemoryItem(list, a.id, { body: "updated" });
    expect(next[0].body).toBe("updated");
    expect(next[0].updatedAt >= a.updatedAt).toBe(true);
  });

  it("archive then restore round-trips", () => {
    const a = newMemoryItem({ sessionId: "s", kind: "observation", body: "a" });
    let list = [a];
    list = archiveMemoryItem(list, a.id);
    expect(list[0].archived).toBe(true);
    expect(list[0].pinned).toBe(false);
    list = restoreMemoryItem(list, a.id);
    expect(list[0].archived).toBe(false);
    expect(list[0].pinned).toBe(true);
  });

  it("removeMemoryItem drops by id", () => {
    const a = newMemoryItem({ sessionId: "s", kind: "observation", body: "a" });
    const b = newMemoryItem({ sessionId: "s", kind: "observation", body: "b" });
    const list = [a, b];
    expect(removeMemoryItem(list, a.id)).toEqual([b]);
  });

  it("toggleMemoryColor updates the colour swatch", () => {
    const a = newMemoryItem({ sessionId: "s", kind: "observation", body: "a" });
    const list = toggleMemoryColor([a], a.id, "amber");
    expect(list[0].color).toBe("amber");
    expect(MEMORY_COLORS).toContain("amber");
  });

  it("activeMemory excludes archived items", () => {
    const a = newMemoryItem({ sessionId: "s", kind: "observation", body: "a" });
    const b = newMemoryItem({ sessionId: "s", kind: "observation", body: "b" });
    const list = archiveMemoryItem([a, b], a.id);
    expect(activeMemory(list)).toHaveLength(1);
    expect(activeMemory(list)[0].id).toBe(b.id);
  });

  it("memoryForSession filters by sessionId", () => {
    const a = newMemoryItem({ sessionId: "s1", kind: "observation", body: "a" });
    const b = newMemoryItem({ sessionId: "s2", kind: "observation", body: "b" });
    expect(memoryForSession([a, b], "s1")).toEqual([a]);
  });

  it("groupMemoryByKind respects the canonical order", () => {
    const obs = newMemoryItem({
      sessionId: "s",
      kind: "observation",
      body: "o",
    });
    const hyp = newMemoryItem({
      sessionId: "s",
      kind: "hypothesis",
      body: "h",
    });
    const quote = newMemoryItem({
      sessionId: "s",
      kind: "quote",
      body: "q",
    });
    const groups = groupMemoryByKind([quote, hyp, obs]);
    expect(groups.map((g) => g.kind)).toEqual([
      "observation",
      "hypothesis",
      "quote",
    ]);
  });

  it("groupMemoryByKind skips empty kinds", () => {
    const obs = newMemoryItem({
      sessionId: "s",
      kind: "observation",
      body: "o",
    });
    const groups = groupMemoryByKind([obs]);
    expect(groups.map((g) => g.kind)).toEqual(["observation"]);
  });

  it("save / load round-trip persists items", () => {
    const a = newMemoryItem({
      sessionId: "INT-AP-001",
      kind: "observation",
      body: "pinned",
    });
    saveMemoryItems([a]);
    expect(loadMemoryItems()).toEqual([a]);
    expect(window.localStorage.getItem(MEMORY_STORAGE_KEY)).toBeTruthy();
  });
});
