import { describe, it, expect } from "vitest";
import {
  REAL_REFERENCES,
  buildLiteratureSeed,
} from "@/lib/research/real-references";

describe("real references catalogue", () => {
  it("ships every author cited in the PFE bibliography", () => {
    const authors = REAL_REFERENCES.map((r) => r.authors).join(" | ");
    for (const expected of [
      "Sierra, M., & Berrios",
      "Medford, N.",
      "Phillips, M. L., Medford",
      "Minkowski, E.",
      "Levis, B., Benedetti",
      "Mansell, W., Harvey",
      "Michal, M.",
      "Hunter, E. C. M., Sierra",
      "Holmes, E. A.",
      "Aldao, A.",
      "Gross, J. J., & Thompson",
      "Zahavi, D.",
      "Kroenke, K.",
      "Spielberger, C. D.",
      "Ciaunica, A.",
      "Lev-Ran, S.",
    ]) {
      expect(authors).toContain(expected);
    }
  });

  it("ships the full 78-entry PFE bibliography", () => {
    expect(REAL_REFERENCES.length).toBe(78);
  });

  it("references with DOIs are not flagged for verification", () => {
    for (const r of REAL_REFERENCES) {
      if (r.doi) {
        expect(r.needsVerification).not.toBe(true);
        expect(r.doi).toMatch(/^10\./);
        expect(r.url).toContain("https://doi.org/");
      }
    }
  });

  it("every reference with a DOI has a matching url", () => {
    for (const r of REAL_REFERENCES) {
      if (r.doi) {
        expect(r.url).toBe(`https://doi.org/${r.doi}`);
      }
    }
  });

  it("every reference has a relevance note and at least one theme", () => {
    for (const r of REAL_REFERENCES) {
      expect(r.relevance.length).toBeGreaterThan(10);
      expect(r.themes.length).toBeGreaterThan(0);
    }
  });

  it("every reference links to at least one real thesis chapter", () => {
    const validChapterIds = new Set([
      "intro-generale",
      "ch1-depersonnalisation",
      "ch2-anxiete",
      "ch3-depression",
      "ch4-liens",
      "ch5-methodo",
      "ch6-resultats",
      "ch7-discussion",
      "conclusion-generale",
      "bibliographie",
    ]);
    for (const r of REAL_REFERENCES) {
      expect(r.linkedChapters.length).toBeGreaterThan(0);
      for (const c of r.linkedChapters) {
        expect(validChapterIds.has(c)).toBe(true);
      }
    }
  });
});

describe("buildLiteratureSeed", () => {
  it("converts real references into LiteratureItem shape", () => {
    const items = buildLiteratureSeed();
    expect(items.length).toBe(REAL_REFERENCES.length);
    for (const item of items) {
      expect(item.id).toBeTruthy();
      expect(item.title).toBeTruthy();
      expect(item.status).toBe("to-read");
      expect(item.summary.length).toBeGreaterThan(10);
      expect(item.linkedChapters.length).toBeGreaterThan(0);
    }
  });
});
