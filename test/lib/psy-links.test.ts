import { describe, it, expect } from "vitest";
import {
  LINK_TYPE_LABELS,
  emptyLink,
  linksForCase,
  linksTouching,
  linkTypeFrequency,
  neighbors,
  pruneOrphans,
} from "@/lib/psy/links";

describe("link types", () => {
  it("every link type has a human label", () => {
    for (const t of [
      "causes",
      "follows",
      "related-to",
      "contradicts",
      "recurs-with",
      "defends-against",
      "expresses",
    ] as const) {
      expect(LINK_TYPE_LABELS[t]).toBeTruthy();
    }
  });
});

describe("emptyLink", () => {
  it("defaults to therapist authoring and related-to / strength 3", () => {
    const l = emptyLink("c1", "n1", "n2");
    expect(l.caseId).toBe("c1");
    expect(l.fromNodeId).toBe("n1");
    expect(l.toNodeId).toBe("n2");
    expect(l.linkType).toBe("related-to");
    expect(l.strength).toBe(3);
    expect(l.authoredBy).toBe("therapist");
  });
});

describe("filters", () => {
  const a = emptyLink("c1", "n1", "n2");
  const b = emptyLink("c1", "n2", "n3", { linkType: "causes" });
  const c = emptyLink("c2", "n4", "n5");

  it("linksForCase filters by case", () => {
    expect(linksForCase([a, b, c], "c1").length).toBe(2);
  });

  it("linksTouching returns all links incident to a node", () => {
    expect(linksTouching([a, b, c], "n2").length).toBe(2);
  });

  it("neighbors returns the other end of each adjacent link", () => {
    const result = neighbors([a, b], "n2");
    const ids = result.map((r) => r.nodeId).sort();
    expect(ids).toEqual(["n1", "n3"]);
  });
});

describe("pruneOrphans", () => {
  it("drops links whose endpoints no longer exist", () => {
    const a = emptyLink("c1", "n1", "n2");
    const b = emptyLink("c1", "n2", "n3");
    const cleaned = pruneOrphans([a, b], new Set(["n1", "n2"]));
    expect(cleaned).toEqual([a]);
  });
});

describe("linkTypeFrequency", () => {
  it("counts link types, optionally per case", () => {
    const links = [
      emptyLink("c1", "n1", "n2", { linkType: "causes" }),
      emptyLink("c1", "n3", "n4", { linkType: "causes" }),
      emptyLink("c1", "n5", "n6", { linkType: "contradicts" }),
      emptyLink("c2", "n7", "n8", { linkType: "causes" }),
    ];
    const c1 = linkTypeFrequency(links, "c1");
    expect(c1.causes).toBe(2);
    expect(c1.contradicts).toBe(1);
    const all = linkTypeFrequency(links);
    expect(all.causes).toBe(3);
  });
});
