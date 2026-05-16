import { describe, it, expect } from "vitest";
import {
  CLINICAL_PHRASES,
  phrasesByTopic,
  phrasesInCategory,
  renderPhrase,
  searchPhrases,
} from "@/lib/clinical/phrases";

describe("phrase catalogue", () => {
  it("every phrase has all three languages and tags", () => {
    for (const p of CLINICAL_PHRASES) {
      expect(p.en.length).toBeGreaterThan(0);
      expect(p.fr.length).toBeGreaterThan(0);
      expect(p.ar.length).toBeGreaterThan(0);
      expect(p.tags.length).toBeGreaterThan(0);
    }
  });

  it("covers the requested categories", () => {
    const cats = new Set(CLINICAL_PHRASES.map((p) => p.category));
    expect(cats.has("symptom")).toBe(true);
    expect(cats.has("report")).toBe(true);
    expect(cats.has("psychoeducation")).toBe(true);
    expect(cats.has("intervention")).toBe(true);
    expect(cats.has("documentation")).toBe(true);
  });
});

describe("phrasesInCategory / phrasesByTopic", () => {
  it("filters by category", () => {
    const rpt = phrasesInCategory("report");
    expect(rpt.every((p) => p.category === "report")).toBe(true);
    expect(rpt.length).toBeGreaterThan(0);
  });
  it("filters by topic", () => {
    expect(phrasesByTopic("anxiety").length).toBeGreaterThan(0);
  });
});

describe("searchPhrases", () => {
  it("searches across topic, tags, and English text by default", () => {
    expect(searchPhrases("grounding").length).toBeGreaterThan(0);
  });
  it("supports searching in French", () => {
    expect(searchPhrases("anxiété", "fr").length).toBeGreaterThan(0);
  });
  it("returns the full set for empty queries", () => {
    expect(searchPhrases("").length).toBe(CLINICAL_PHRASES.length);
  });
});

describe("renderPhrase", () => {
  it("returns the requested-language string", () => {
    const p = CLINICAL_PHRASES[0];
    expect(renderPhrase(p, "en")).toBe(p.en);
    expect(renderPhrase(p, "fr")).toBe(p.fr);
    expect(renderPhrase(p, "ar")).toBe(p.ar);
  });
});
