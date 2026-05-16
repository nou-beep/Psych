import { describe, it, expect } from "vitest";
import {
  CLIENT_AUTHORABLE_KINDS,
  KIND_LABELS,
  THERAPIST_ONLY_KINDS,
  emptyNode,
  nodesForCase,
  nodesOfKind,
  tagFrequency,
  topTags,
  update,
  visibleToClient,
  visibleToTherapist,
  type PsyNode,
} from "@/lib/psy/nodes";

describe("psy nodes — catalogue", () => {
  it("client-authorable kinds and therapist-only kinds don't overlap", () => {
    for (const k of CLIENT_AUTHORABLE_KINDS) {
      expect(THERAPIST_ONLY_KINDS).not.toContain(k);
    }
  });

  it("every kind has a human label", () => {
    for (const k of [...CLIENT_AUTHORABLE_KINDS, ...THERAPIST_ONLY_KINDS]) {
      expect(KIND_LABELS[k]).toBeTruthy();
    }
  });

  it("KIND_LABELS covers the cross-cutting kinds too", () => {
    expect(KIND_LABELS["session"]).toBeTruthy();
    expect(KIND_LABELS["intervention-ref"]).toBeTruthy();
    expect(KIND_LABELS["assessment-ref"]).toBeTruthy();
  });
});

describe("emptyNode", () => {
  it("defaults to therapist authoring + therapist-only visibility", () => {
    const n = emptyNode("c1", "thought");
    expect(n.caseId).toBe("c1");
    expect(n.kind).toBe("thought");
    expect(n.tags).toEqual([]);
    expect(n.meta?.authoredBy).toBe("therapist");
    expect(n.meta?.sharedWithClient).toBe(false);
  });

  it("accepts overrides", () => {
    const n = emptyNode("c1", "body-sensation", {
      label: "chest tightness",
      tags: ["anxiety", "shame"],
      intensity: 7,
      meta: { bodyRegion: "chest", authoredBy: "client" },
    });
    expect(n.label).toBe("chest tightness");
    expect(n.intensity).toBe(7);
    expect(n.meta?.bodyRegion).toBe("chest");
    expect(n.meta?.authoredBy).toBe("client");
  });
});

describe("update", () => {
  it("patches and refreshes updatedAt", async () => {
    const n = emptyNode("c1", "emotion");
    await new Promise((r) => setTimeout(r, 3));
    const u = update(n, { label: "shame", tags: ["shame"] });
    expect(u.label).toBe("shame");
    expect(u.updatedAt).not.toBe(n.updatedAt);
  });
});

describe("filters", () => {
  const a = emptyNode("c1", "thought");
  const b = emptyNode("c1", "emotion");
  const c = emptyNode("c2", "thought");
  const d = emptyNode("c1", "body-sensation");

  it("nodesForCase filters", () => {
    expect(nodesForCase([a, b, c, d], "c1").length).toBe(3);
  });
  it("nodesOfKind filters by kind, optionally per case", () => {
    expect(nodesOfKind([a, b, c, d], "thought").length).toBe(2);
    expect(nodesOfKind([a, b, c, d], "thought", "c1").length).toBe(1);
  });
});

describe("visibility", () => {
  const therapistOnly = emptyNode("c1", "defense", {
    meta: { authoredBy: "therapist", sharedWithClient: false },
  });
  const therapistShared = emptyNode("c1", "thought", {
    meta: { authoredBy: "therapist", sharedWithClient: true },
  });
  const clientNode = emptyNode("c1", "body-sensation", {
    meta: { authoredBy: "client", sharedWithTherapist: true },
  });
  const clientPrivate = emptyNode("c1", "thought", {
    meta: { authoredBy: "client", sharedWithTherapist: false },
  });

  it("visibleToClient excludes therapist-only", () => {
    const visible = visibleToClient([
      therapistOnly,
      therapistShared,
      clientNode,
    ]);
    expect(visible).toContain(therapistShared);
    expect(visible).toContain(clientNode);
    expect(visible).not.toContain(therapistOnly);
  });

  it("visibleToTherapist excludes client-private", () => {
    const visible = visibleToTherapist([
      therapistOnly,
      clientNode,
      clientPrivate,
    ]);
    expect(visible).toContain(therapistOnly);
    expect(visible).toContain(clientNode);
    expect(visible).not.toContain(clientPrivate);
  });
});

describe("tag analysis", () => {
  const nodes: PsyNode[] = [
    emptyNode("c1", "thought", { tags: ["shame", "self-criticism"] }),
    emptyNode("c1", "body-sensation", { tags: ["shame", "tightness"] }),
    emptyNode("c1", "emotion", { tags: ["shame", "abandonment"] }),
    emptyNode("c1", "situation", { tags: ["abandonment"] }),
  ];

  it("tagFrequency counts occurrences", () => {
    const freq = tagFrequency(nodes);
    expect(freq.shame).toBe(3);
    expect(freq.abandonment).toBe(2);
    expect(freq["self-criticism"]).toBe(1);
  });

  it("topTags ranks descending and respects limit", () => {
    expect(topTags(nodes, 2)).toEqual([
      { tag: "shame", count: 3 },
      { tag: "abandonment", count: 2 },
    ]);
  });
});
