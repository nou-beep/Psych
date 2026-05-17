import { describe, it, expect } from "vitest";
import {
  COMMON_THREADS,
  analyzeThreads,
  dominantThread,
  recurringThreads,
} from "@/lib/psy/threads";
import { emptyNode } from "@/lib/psy/nodes";

describe("common threads", () => {
  it("includes the spec's recurring themes", () => {
    expect(COMMON_THREADS).toContain("shame");
    expect(COMMON_THREADS).toContain("abandonment");
    expect(COMMON_THREADS).toContain("emotional avoidance");
    expect(COMMON_THREADS).toContain("perfectionism");
  });
});

describe("analyzeThreads", () => {
  const nodes = [
    emptyNode("c1", "thought", { tags: ["shame", "self-criticism"] }),
    emptyNode("c1", "body-sensation", { tags: ["shame"] }),
    emptyNode("c1", "emotion", { tags: ["shame", "abandonment"] }),
    emptyNode("c1", "situation", { tags: ["abandonment"] }),
    emptyNode("c1", "thought", { tags: ["incidental-tag"] }),
  ];

  it("returns observations sorted by count descending", () => {
    const out = analyzeThreads(nodes);
    expect(out[0].tag).toBe("shame");
    expect(out[0].count).toBe(3);
  });

  it("marks a tag recurring when it clears the thresholds", () => {
    const out = analyzeThreads(nodes, { minOccurrences: 2, minDistinctKinds: 2 });
    const shame = out.find((t) => t.tag === "shame");
    expect(shame?.recurring).toBe(true);
    // self-criticism: 1 occurrence — not recurring
    expect(out.find((t) => t.tag === "self-criticism")?.recurring).toBe(false);
  });

  it("kindBreakdown counts node-kinds per tag", () => {
    const shame = analyzeThreads(nodes).find((t) => t.tag === "shame")!;
    expect(shame.kindBreakdown).toMatchObject({
      thought: 1,
      "body-sensation": 1,
      emotion: 1,
    });
  });
});

describe("recurringThreads / dominantThread", () => {
  it("recurringThreads returns only the threads above threshold", () => {
    const nodes = [
      emptyNode("c1", "thought", { tags: ["shame"] }),
      emptyNode("c1", "emotion", { tags: ["shame"] }),
      emptyNode("c1", "memory", { tags: ["transient"] }),
    ];
    const filtered = recurringThreads(nodes, { minOccurrences: 2 });
    expect(filtered.map((t) => t.tag)).toEqual(["shame"]);
  });

  it("dominantThread returns the highest-recurring thread or null", () => {
    expect(dominantThread([])).toBeNull();
    const nodes = [
      emptyNode("c1", "thought", { tags: ["shame"] }),
      emptyNode("c1", "emotion", { tags: ["shame"] }),
      emptyNode("c1", "memory", { tags: ["abandonment"] }),
    ];
    expect(dominantThread(nodes)?.tag).toBe("shame");
  });
});
