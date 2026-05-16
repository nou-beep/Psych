import { describe, it, expect } from "vitest";
import {
  createSnapshot,
  snapshotsForCanvas,
  snapshotsForCase,
  diffSnapshots,
  type FormulationSnapshot,
} from "@/lib/formulation-snapshots";
import type { FormulationCanvas } from "@/lib/clinical-data";

function canvas(overrides: Partial<FormulationCanvas> = {}): FormulationCanvas {
  return {
    id: "f1",
    caseId: "c1",
    model: "5ps",
    title: "5Ps draft",
    sections: {
      "Presenting Problem": "anxiety + avoidance",
      "Predisposing Factors": "perfectionism",
    },
    createdAt: "2026-05-01T00:00:00Z",
    updatedAt: "2026-05-10T00:00:00Z",
    ...overrides,
  };
}

describe("createSnapshot", () => {
  it("captures canvas state at a point in time", () => {
    const snap = createSnapshot(canvas(), "after intake");
    expect(snap.canvasId).toBe("f1");
    expect(snap.caseId).toBe("c1");
    expect(snap.model).toBe("5ps");
    expect(snap.title).toBe("5Ps draft");
    expect(snap.sections).toEqual({
      "Presenting Problem": "anxiety + avoidance",
      "Predisposing Factors": "perfectionism",
    });
    expect(snap.note).toBe("after intake");
  });

  it("snapshots a deep-copied sections object", () => {
    const c = canvas();
    const snap = createSnapshot(c);
    c.sections["Presenting Problem"] = "MUTATED";
    expect(snap.sections["Presenting Problem"]).toBe("anxiety + avoidance");
  });
});

describe("snapshotsForCanvas / snapshotsForCase", () => {
  const a: FormulationSnapshot = {
    id: "s1",
    canvasId: "f1",
    caseId: "c1",
    model: "5ps",
    title: "v1",
    sections: {},
    createdAt: "2026-01-01T00:00:00Z",
  };
  const b: FormulationSnapshot = {
    id: "s2",
    canvasId: "f1",
    caseId: "c1",
    model: "5ps",
    title: "v2",
    sections: {},
    createdAt: "2026-03-01T00:00:00Z",
  };
  const c: FormulationSnapshot = {
    id: "s3",
    canvasId: "f2",
    caseId: "c2",
    model: "cbt",
    title: "cbt-v1",
    sections: {},
    createdAt: "2026-02-01T00:00:00Z",
  };

  it("filters by canvasId and sorts newest-first", () => {
    const list = snapshotsForCanvas([a, b, c], "f1");
    expect(list.map((s) => s.id)).toEqual(["s2", "s1"]);
  });

  it("filters by caseId and sorts newest-first", () => {
    const list = snapshotsForCase([a, b, c], "c1");
    expect(list.map((s) => s.id)).toEqual(["s2", "s1"]);
  });
});

describe("diffSnapshots", () => {
  it("classifies sections as added / removed / changed / unchanged", () => {
    const before = createSnapshot(
      canvas({ sections: { A: "old", B: "same", C: "to-remove" } })
    );
    const after = createSnapshot(
      canvas({ sections: { A: "new", B: "same", D: "fresh" } })
    );
    const diff = diffSnapshots(before, after);
    expect(diff.changed).toContain("A");
    expect(diff.unchanged).toContain("B");
    expect(diff.removed).toContain("C");
    expect(diff.added).toContain("D");
  });
});
