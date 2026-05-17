import { describe, it, expect } from "vitest";
import {
  addThought,
  boardStats,
  clustersOf,
  emptyBoard,
  isolatedThoughts,
  linkThoughts,
  moveThought,
  neighborsOf,
  patchThought,
  removeThought,
  thoughtsInCluster,
  unlinkThoughts,
} from "@/lib/workspace/thinking-mode";

describe("thinking mode board", () => {
  it("creates an empty board", () => {
    const b = emptyBoard();
    expect(b.thoughts).toEqual([]);
    expect(b.links).toEqual([]);
    expect(b.title).toBe("Pensées libres");
    expect(b.zoom).toBe(1);
  });

  it("adds a thought with defaults", () => {
    let b = emptyBoard();
    b = addThought(b, { body: "first idea" });
    expect(b.thoughts).toHaveLength(1);
    expect(b.thoughts[0].body).toBe("first idea");
    expect(b.thoughts[0].kind).toBe("fragment");
    expect(b.thoughts[0].color).toBe("default");
    expect(b.thoughts[0].pinned).toBe(false);
  });

  it("patches a thought (move + pin + cluster)", () => {
    let b = emptyBoard();
    b = addThought(b, { body: "x" });
    const id = b.thoughts[0].id;
    b = moveThought(b, id, 250, 400);
    expect(b.thoughts[0].x).toBe(250);
    expect(b.thoughts[0].y).toBe(400);
    b = patchThought(b, id, { pinned: true, cluster: "anxiety" });
    expect(b.thoughts[0].pinned).toBe(true);
    expect(b.thoughts[0].cluster).toBe("anxiety");
  });

  it("removes a thought and its associated links", () => {
    let b = emptyBoard();
    b = addThought(b, { body: "a" });
    b = addThought(b, { body: "b" });
    const [a, c] = b.thoughts;
    b = linkThoughts(b, a.id, c.id);
    expect(b.links).toHaveLength(1);
    b = removeThought(b, a.id);
    expect(b.thoughts).toHaveLength(1);
    expect(b.links).toHaveLength(0);
  });

  it("link / unlink behaviour", () => {
    let b = emptyBoard();
    b = addThought(b, { body: "a" });
    b = addThought(b, { body: "b" });
    const [a, c] = b.thoughts;
    b = linkThoughts(b, a.id, c.id, { label: "supports", style: "dotted" });
    expect(b.links).toHaveLength(1);
    expect(b.links[0].label).toBe("supports");
    expect(b.links[0].style).toBe("dotted");
    // Refuses duplicates
    b = linkThoughts(b, a.id, c.id);
    expect(b.links).toHaveLength(1);
    // Refuses self-links
    b = linkThoughts(b, a.id, a.id);
    expect(b.links).toHaveLength(1);
    // Refuses links to unknown thoughts
    b = linkThoughts(b, a.id, "missing");
    expect(b.links).toHaveLength(1);
    const linkId = b.links[0].id;
    b = unlinkThoughts(b, linkId);
    expect(b.links).toHaveLength(0);
  });

  it("clusters group thoughts by cluster string", () => {
    let b = emptyBoard();
    b = addThought(b, { body: "a", cluster: "anxiety" });
    b = addThought(b, { body: "b", cluster: "anxiety" });
    b = addThought(b, { body: "c", cluster: "depression" });
    b = addThought(b, { body: "d" }); // unclustered
    const groups = clustersOf(b);
    expect(groups.anxiety).toHaveLength(2);
    expect(groups.depression).toHaveLength(1);
    expect(groups["(unclustered)"]).toHaveLength(1);
    expect(thoughtsInCluster(b, "anxiety")).toHaveLength(2);
  });

  it("neighborsOf walks links in both directions", () => {
    let b = emptyBoard();
    b = addThought(b, { body: "a" });
    b = addThought(b, { body: "b" });
    b = addThought(b, { body: "c" });
    const [a, c, d] = b.thoughts;
    b = linkThoughts(b, a.id, c.id);
    b = linkThoughts(b, d.id, a.id);
    const ns = neighborsOf(b, a.id).map((t) => t.body);
    expect(ns.sort()).toEqual(["b", "c"]);
  });

  it("isolatedThoughts returns thoughts with no links", () => {
    let b = emptyBoard();
    b = addThought(b, { body: "a" });
    b = addThought(b, { body: "b" });
    b = addThought(b, { body: "lonely" });
    const [a, c] = b.thoughts;
    b = linkThoughts(b, a.id, c.id);
    const lonely = isolatedThoughts(b);
    expect(lonely).toHaveLength(1);
    expect(lonely[0].body).toBe("lonely");
  });

  it("boardStats reports counts per kind, clusters, pinned, isolated, links", () => {
    let b = emptyBoard();
    b = addThought(b, { body: "x", kind: "quote", cluster: "g1" });
    b = addThought(b, { body: "y", kind: "tension" });
    b = addThought(b, { body: "z", kind: "fragment" });
    const [first] = b.thoughts;
    b = patchThought(b, first.id, { pinned: true });
    const stats = boardStats(b);
    expect(stats.total).toBe(3);
    expect(stats.byKind.quote).toBe(1);
    expect(stats.byKind.tension).toBe(1);
    expect(stats.byKind.fragment).toBe(1);
    expect(stats.pinned).toBe(1);
    expect(stats.clusters).toBe(1); // only "g1"
    expect(stats.isolated).toBe(3);
    expect(stats.linkCount).toBe(0);
  });
});
