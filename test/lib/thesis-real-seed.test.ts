import { describe, it, expect } from "vitest";
import {
  ANALYSIS_PLAN,
  METHODOLOGY_SECTIONS,
  REAL_CHAPTER_OUTLINE,
  REAL_CORRELATIONS,
  REAL_DESCRIPTIVES,
  REAL_THESIS_DESIGN,
  REGRESSION_FINDING,
  THESIS_CONCEPTS,
  THESIS_FR_TITLE,
  THESIS_KEYWORDS,
  THESIS_OWNER,
} from "@/lib/thesis/real-seed";

describe("thesis owner + title", () => {
  it("uses the author's real identity", () => {
    expect(THESIS_OWNER.author).toBe("Nouhaila Mrini");
    expect(THESIS_OWNER.supervisor).toBe("Dr Nabil Abdassamad");
    expect(THESIS_OWNER.academicYear).toBe("2025-2026");
  });
  it("French title is the real thesis title", () => {
    expect(THESIS_FR_TITLE).toContain("Dépersonnalisation");
    expect(THESIS_FR_TITLE).toContain("anxiété");
    expect(THESIS_FR_TITLE).toContain("dépression");
  });
});

describe("real descriptive statistics", () => {
  it("ships CDS / STAI-Y / PHQ-9 with the user's actual means", () => {
    const cds = REAL_DESCRIPTIVES.find((d) => d.acronym === "CDS");
    expect(cds?.mean).toBe(47.3);
    expect(cds?.sd).toBe(38.2);
    expect(cds?.min).toBe(0);
    expect(cds?.max).toBe(168);

    const stai = REAL_DESCRIPTIVES.find((d) => d.acronym === "STAI-Y (trait)");
    expect(stai?.mean).toBe(43.7);
    expect(stai?.sd).toBe(12.4);
    expect(stai?.min).toBe(21);
    expect(stai?.max).toBe(72);

    const phq = REAL_DESCRIPTIVES.find((d) => d.acronym === "PHQ-9");
    expect(phq?.mean).toBe(9.8);
    expect(phq?.sd).toBe(6.7);
    expect(phq?.min).toBe(0);
    expect(phq?.max).toBe(27);
  });

  it("uses n=52", () => {
    for (const d of REAL_DESCRIPTIVES) {
      expect(d.n).toBe(52);
    }
  });
});

describe("real correlations", () => {
  it("CDS ↔ anxiety r = .64", () => {
    const c = REAL_CORRELATIONS.find((c) =>
      c.variableB.includes("STAI")
    );
    expect(c?.r).toBe(0.64);
    expect(c?.p).toBe("< .001");
    expect(c?.n).toBe(52);
  });
  it("CDS ↔ depression r = .58", () => {
    const c = REAL_CORRELATIONS.find((c) =>
      c.variableB.includes("PHQ-9")
    );
    expect(c?.r).toBe(0.58);
    expect(c?.p).toBe("< .001");
  });
});

describe("regression finding", () => {
  it("anxiety trait is named the strongest predictor", () => {
    expect(REGRESSION_FINDING.outcome).toMatch(/CDS/);
    expect(REGRESSION_FINDING.keyResult.toLowerCase()).toContain("anxiété");
    expect(REGRESSION_FINDING.note.toLowerCase()).toMatch(/awaiting|données/);
  });
});

describe("structure", () => {
  it("REAL_CHAPTER_OUTLINE matches the spec exactly", () => {
    const labels = REAL_CHAPTER_OUTLINE.map((c) => c.label);
    expect(labels).toContain("Introduction générale");
    expect(labels).toContain(
      "Chapitre 1 : La dépersonnalisation en psychopathologie"
    );
    expect(labels).toContain("Chapitre 2 : Anxiété et dépersonnalisation");
    expect(labels).toContain("Chapitre 3 : Dépression et dépersonnalisation");
    expect(labels).toContain(
      "Chapitre 4 : Analyse des liens entre dépersonnalisation, anxiété et dépression"
    );
    expect(labels).toContain("Chapitre 5 : Méthodologie");
    expect(labels).toContain("Chapitre 6 : Résultats");
    expect(labels).toContain("Chapitre 7 : Discussion");
    expect(labels).toContain("Conclusion générale");
    expect(labels).toContain("Bibliographie");
  });

  it("METHODOLOGY_SECTIONS covers all 10 required sub-sections", () => {
    expect(METHODOLOGY_SECTIONS).toContain("Population");
    expect(METHODOLOGY_SECTIONS).toContain("Instruments");
    expect(METHODOLOGY_SECTIONS).toContain("Procédure");
    expect(METHODOLOGY_SECTIONS).toContain("Hypothèses");
    expect(METHODOLOGY_SECTIONS).toContain("Variables");
    expect(METHODOLOGY_SECTIONS).toContain("Plan d'analyse statistique");
    expect(METHODOLOGY_SECTIONS).toContain("Critères d'inclusion");
    expect(METHODOLOGY_SECTIONS).toContain("Critères d'exclusion");
    expect(METHODOLOGY_SECTIONS).toContain("Biais méthodologiques");
    expect(METHODOLOGY_SECTIONS).toContain("Considérations éthiques");
  });
});

describe("design + hypotheses", () => {
  it("hypotheses are written in French and reference the real instruments", () => {
    const hyps = REAL_THESIS_DESIGN.hypotheses;
    expect(hyps[0]).toContain("STAI-Y");
    expect(hyps[0]).toContain("CDS");
    expect(hyps[1]).toContain("PHQ-9");
    expect(hyps[2]).toContain("anxiété trait");
  });
  it("variables reflect CDS / STAI-Y / PHQ-9 only", () => {
    expect(REAL_THESIS_DESIGN.dependentVariables[0]).toContain("CDS");
    expect(
      REAL_THESIS_DESIGN.independentVariables.some((v) => v.includes("STAI-Y"))
    ).toBe(true);
    expect(
      REAL_THESIS_DESIGN.independentVariables.some((v) => v.includes("PHQ-9"))
    ).toBe(true);
  });
});

describe("analysis plan + concepts", () => {
  it("analysis plan covers descriptives, correlations, regression, qualitative", () => {
    const ids = ANALYSIS_PLAN.map((p) => p.id);
    expect(ids).toEqual(["desc", "corr", "reg", "qual"]);
  });

  it("THESIS_CONCEPTS describes the thesis-specific concepts", () => {
    const ids = THESIS_CONCEPTS.map((c) => c.id);
    expect(ids).toContain("transdiag");
    expect(ids).toContain("dysreg");
    expect(ids).toContain("sentiment-soi");
    expect(ids).toContain("depers-protective");
  });
});

describe("keywords", () => {
  it("includes the user's core concept list", () => {
    expect(THESIS_KEYWORDS).toContain("dépersonnalisation");
    expect(THESIS_KEYWORDS).toContain("anxiété");
    expect(THESIS_KEYWORDS).toContain("dépression");
    expect(THESIS_KEYWORDS).toContain("sentiment de soi");
  });
});
