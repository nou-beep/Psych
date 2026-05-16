import { describe, it, expect, beforeEach } from "vitest";
import {
  ASSIGNMENTS_STORAGE_KEY,
  acknowledge,
  createAssignment,
  loadAssignments,
  removeAssignment,
  saveAssignments,
} from "@/lib/client/assignments";

describe("client assignments", () => {
  beforeEach(() => window.localStorage.clear());

  it("creates an assignment with sensible defaults", () => {
    const a = createAssignment({ kind: "workbook", targetId: "wb-1" });
    expect(a.id).toBeTruthy();
    expect(a.kind).toBe("workbook");
    expect(a.acknowledged).toBe(false);
    expect(() => new Date(a.createdAt).toISOString()).not.toThrow();
  });

  it("round-trips through localStorage", () => {
    const a = createAssignment({ kind: "card", targetId: "g1" });
    saveAssignments([a]);
    expect(loadAssignments()).toHaveLength(1);
    expect(window.localStorage.getItem(ASSIGNMENTS_STORAGE_KEY)).not.toBeNull();
  });

  it("acknowledge marks one and leaves others alone", () => {
    const a = createAssignment({ kind: "card", targetId: "1" });
    const b = createAssignment({ kind: "card", targetId: "2" });
    const next = acknowledge([a, b], a.id);
    expect(next[0].acknowledged).toBe(true);
    expect(next[1].acknowledged).toBe(false);
  });

  it("removeAssignment filters by id", () => {
    const a = createAssignment({ kind: "card", targetId: "1" });
    const b = createAssignment({ kind: "card", targetId: "2" });
    expect(removeAssignment([a, b], a.id)).toEqual([b]);
  });
});
