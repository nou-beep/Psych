import { describe, it, expect } from "vitest";
import {
  KIND_LABELS,
  groupByKind,
  searchCorpus,
  type Corpus,
} from "@/lib/clinical/clinical-search";

function buildCorpus(): Corpus {
  return {
    cases: [
      {
        id: "c1",
        code: "CASE-001",
        shortNote: "Adult anxiety, university stress",
        tags: ["anxiety"],
      },
      {
        id: "c2",
        code: "CASE-002",
        shortNote: "Child behavioural follow-up",
        tags: ["behavioural"],
      },
    ],
    interventions: [
      { id: "i1", name: "Cognitive Thought Record", description: "Reframe automatic thoughts", tags: ["cbt"] },
      { id: "i2", name: "Grounding 5-4-3-2-1", description: "Sensory grounding for anxiety", tags: ["grounding"] },
    ],
    terms: [
      {
        id: "t1",
        english: "Anxiety",
        french: "Anxiété",
        arabic: "قلق",
        definition: "Apprehension and physiological tension.",
      },
    ],
    disorders: [
      {
        id: "gad",
        name: "Generalized Anxiety Disorder",
        shortSummary: "Excessive worry across domains",
      },
    ],
  };
}

describe("searchCorpus", () => {
  it("returns nothing for an empty query", () => {
    expect(searchCorpus("", buildCorpus())).toEqual([]);
  });

  it("matches across cases, terms, interventions, and disorders", () => {
    const results = searchCorpus("anxiety", buildCorpus());
    const kinds = new Set(results.map((r) => r.kind));
    expect(kinds.has("case")).toBe(true);
    expect(kinds.has("intervention")).toBe(true);
    expect(kinds.has("term")).toBe(true);
    expect(kinds.has("disorder")).toBe(true);
  });

  it("ranks title matches above body matches", () => {
    const results = searchCorpus("grounding", buildCorpus());
    expect(results[0].kind).toBe("intervention");
    expect(results[0].title.toLowerCase()).toContain("grounding");
  });

  it("respects the kinds filter", () => {
    const results = searchCorpus("anxiety", buildCorpus(), { kinds: ["case"] });
    expect(results.every((r) => r.kind === "case")).toBe(true);
  });

  it("includes a useful snippet surrounding the match", () => {
    const results = searchCorpus("worry", buildCorpus());
    expect(results.find((r) => r.kind === "disorder")?.snippet).toMatch(/worry/i);
  });

  it("limits results when limit is set", () => {
    const corpus: Corpus = {
      cases: Array.from({ length: 20 }, (_, i) => ({
        id: `c${i}`,
        code: `C-${i}`,
        shortNote: "anxiety",
      })),
    };
    expect(searchCorpus("anxiety", corpus, { limit: 5 }).length).toBe(5);
  });
});

describe("groupByKind", () => {
  it("groups results by kind", () => {
    const results = searchCorpus("anxiety", buildCorpus());
    const grouped = groupByKind(results);
    expect(Object.keys(grouped).length).toBeGreaterThan(0);
    for (const [kind, items] of Object.entries(grouped)) {
      expect(items.every((r) => r.kind === kind)).toBe(true);
      expect(KIND_LABELS[kind as keyof typeof KIND_LABELS]).toBeTruthy();
    }
  });
});
