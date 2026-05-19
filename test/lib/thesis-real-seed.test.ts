import { describe, it, expect } from "vitest";
import {
  ANALYSIS_PLAN,
  METHODOLOGY_SECTIONS,
  PFE_TABLES,
  REAL_CHAPTER_OUTLINE,
  REAL_CHAPTER_PROGRESS,
  REAL_CORRELATIONS,
  REAL_DESCRIPTIVES,
  REAL_THESIS_DESIGN,
  REGRESSION_FINDING,
  THESIS_ABSTRACT_EN,
  THESIS_ABSTRACT_FR,
  THESIS_CONCEPTS,
  THESIS_FR_TITLE,
  THESIS_KEYWORDS,
  THESIS_OBJECTIVES,
  THESIS_OWNER,
} from "@/lib/thesis/real-seed";

describe("thesis owner + title", () => {
  it("uses the author's real identity from the PFE", () => {
    expect(THESIS_OWNER.author).toBe("Nouhaila Mrini");
    expect(THESIS_OWNER.supervisor).toBe("Dr Nabil Abdessamad");
    expect(THESIS_OWNER.academicYear).toBe("2025-2026");
    expect(THESIS_OWNER.defenceDate).toBe("Juin 2026");
    expect(THESIS_OWNER.programme).toContain(
      "Master en Psychologie Clinique"
    );
  });

  it("French title is the verbatim PFE cover-page title", () => {
    expect(THESIS_FR_TITLE).toContain("Dépersonnalisation, anxiété et dépression");
    expect(THESIS_FR_TITLE).toContain(
      "analyse psychopathologique des mécanismes de dysrégulation émotionnelle"
    );
    expect(THESIS_FR_TITLE).toContain("altération du sentiment de soi");
  });
});

describe("abstract + keywords", () => {
  it("French abstract reproduces the PFE résumé verbatim", () => {
    expect(THESIS_ABSTRACT_FR).toContain(
      "La dépersonnalisation constitue un phénomène clinique singulier"
    );
    expect(THESIS_ABSTRACT_FR).toContain("Cambridge Depersonalization Scale");
    expect(THESIS_ABSTRACT_FR).toContain("50 participants");
  });

  it("English abstract reproduces the PFE abstract verbatim", () => {
    expect(THESIS_ABSTRACT_EN).toContain(
      "Depersonalization is a distinctive clinical phenomenon"
    );
    expect(THESIS_ABSTRACT_EN).toContain("50 participants");
  });

  it("keywords match the PFE keyword list", () => {
    expect(THESIS_KEYWORDS).toContain("dépersonnalisation");
    expect(THESIS_KEYWORDS).toContain("dissociation");
    expect(THESIS_KEYWORDS).toContain("anxiété");
    expect(THESIS_KEYWORDS).toContain("dépression");
    expect(THESIS_KEYWORDS).toContain("dysrégulation émotionnelle");
    expect(THESIS_KEYWORDS).toContain("sentiment de soi");
    expect(THESIS_KEYWORDS).toContain("psychopathologie transdiagnostique");
  });
});

describe("objectives", () => {
  it("ships the 4 PFE objectives in order", () => {
    expect(THESIS_OBJECTIVES).toHaveLength(4);
    expect(THESIS_OBJECTIVES[0]).toContain("Délimiter précisément");
    expect(THESIS_OBJECTIVES[1]).toContain("Comparer les modèles théoriques");
    expect(THESIS_OBJECTIVES[2]).toContain("Analyser les mécanismes");
    expect(THESIS_OBJECTIVES[3]).toContain("modèle intégratif transdiagnostique");
  });
});

describe("descriptive statistics — protocol stage", () => {
  it("ships CDS / STAI-Y2 / PHQ-9 with the planned n = 50", () => {
    const cds = REAL_DESCRIPTIVES.find((d) => d.acronym === "CDS (29 items)");
    expect(cds?.plannedN).toBe(50);
    expect(cds?.scoreRange).toContain("0 – 1044");

    const stai = REAL_DESCRIPTIVES.find((d) => d.acronym === "STAI-Y2");
    expect(stai?.plannedN).toBe(50);
    expect(stai?.scoreRange).toBe("20 – 80");

    const phq = REAL_DESCRIPTIVES.find((d) => d.acronym === "PHQ-9");
    expect(phq?.plannedN).toBe(50);
    expect(phq?.scoreRange).toContain("0 – 27");
  });

  it("does not fabricate means / SDs (data not yet collected)", () => {
    for (const d of REAL_DESCRIPTIVES) {
      expect(d).not.toHaveProperty("mean");
      expect(d).not.toHaveProperty("sd");
      expect(d.status.toLowerCase()).toContain("collecte");
    }
  });
});

describe("planned correlations — H1 & H2", () => {
  it("H1 links CDS to STAI-Y2", () => {
    const c = REAL_CORRELATIONS.find((x) => x.hypothesis === "H1");
    expect(c?.variableB).toContain("STAI-Y2");
    expect(c?.test).toMatch(/Pearson|Spearman/);
    expect(c?.expected).toContain("r > 0");
  });

  it("H2 links CDS to PHQ-9", () => {
    const c = REAL_CORRELATIONS.find((x) => x.hypothesis === "H2");
    expect(c?.variableB).toContain("PHQ-9");
    expect(c?.test).toMatch(/Pearson|Spearman/);
    expect(c?.expected).toContain("r > 0");
  });

  it("does not invent r values", () => {
    for (const c of REAL_CORRELATIONS) {
      expect(c).not.toHaveProperty("r");
      expect(c).not.toHaveProperty("p");
    }
  });
});

describe("regression specification — H3", () => {
  it("declares the regression model from §5.5.3", () => {
    expect(REGRESSION_FINDING.hypothesis).toBe("H3");
    expect(REGRESSION_FINDING.outcome).toMatch(/CDS/);
    expect(REGRESSION_FINDING.predictors).toContain(
      "Anxiété-trait (STAI-Y2)"
    );
    expect(REGRESSION_FINDING.predictors).toContain(
      "Symptomatologie dépressive (PHQ-9)"
    );
    expect(REGRESSION_FINDING.method).toMatch(/méthode simultanée|forcée/);
  });

  it("lists the postulate checks", () => {
    expect(REGRESSION_FINDING.postulatesChecks.length).toBeGreaterThan(2);
    const joined = REGRESSION_FINDING.postulatesChecks.join(" ");
    expect(joined).toMatch(/normalité/i);
    expect(joined).toMatch(/multicolinéarité/i);
  });
});

describe("chapter outline + methodology sections", () => {
  it("REAL_CHAPTER_OUTLINE matches the PFE table of contents", () => {
    const ids = REAL_CHAPTER_OUTLINE.map((c) => c.id);
    expect(ids).toContain("intro-generale");
    expect(ids).toContain("ch1-depersonnalisation");
    expect(ids).toContain("ch2-anxiete");
    expect(ids).toContain("ch3-depression");
    expect(ids).toContain("ch4-liens");
    expect(ids).toContain("ch5-methodo");
    expect(ids).toContain("ch6-resultats");
    expect(ids).toContain("ch7-discussion");
    expect(ids).toContain("conclusion-generale");
    expect(ids).toContain("bibliographie");
  });

  it("METHODOLOGY_SECTIONS lists the 7 main §5.x sub-sections", () => {
    expect(METHODOLOGY_SECTIONS.length).toBe(7);
    const joined = METHODOLOGY_SECTIONS.join(" ");
    expect(joined).toMatch(/§5\.1/);
    expect(joined).toMatch(/§5\.3/);
    expect(joined).toMatch(/§5\.7/);
  });
});

describe("design + hypotheses", () => {
  it("hypotheses match the PFE §5.1.2 wording", () => {
    const hyps = REAL_THESIS_DESIGN.hypotheses;
    expect(hyps).toHaveLength(3);
    expect(hyps[0]).toContain("H1");
    expect(hyps[0]).toContain("CDS");
    expect(hyps[0]).toContain("STAI-Y2");
    expect(hyps[1]).toContain("H2");
    expect(hyps[1]).toContain("PHQ-9");
    expect(hyps[2]).toContain("H3");
    expect(hyps[2]).toContain("régression linéaire multiple");
  });

  it("variables reflect CDS / STAI-Y2 / PHQ-9", () => {
    expect(REAL_THESIS_DESIGN.dependentVariables[0]).toContain("CDS");
    expect(
      REAL_THESIS_DESIGN.independentVariables.some((v) =>
        v.includes("STAI-Y2")
      )
    ).toBe(true);
    expect(
      REAL_THESIS_DESIGN.independentVariables.some((v) =>
        v.includes("PHQ-9")
      )
    ).toBe(true);
  });

  it("sample description states the planned 50 jeunes adultes", () => {
    expect(REAL_THESIS_DESIGN.sampleDescription).toContain("50 jeunes adultes");
  });
});

describe("analysis plan + concepts", () => {
  it("analysis plan covers descriptives, correlations, regression", () => {
    const ids = ANALYSIS_PLAN.map((p) => p.id);
    expect(ids).toContain("desc");
    expect(ids).toContain("corr");
    expect(ids).toContain("reg");
  });

  it("THESIS_CONCEPTS describes the PFE's core constructs", () => {
    const ids = THESIS_CONCEPTS.map((c) => c.id);
    expect(ids).toContain("transdiag");
    expect(ids).toContain("dysreg");
    expect(ids).toContain("ipseite");
    expect(ids).toContain("double-voie");
    expect(ids).toContain("interoception");
  });
});

describe("PFE tables", () => {
  it("ships the 3 numbered tables from the methodology chapter", () => {
    expect(PFE_TABLES).toHaveLength(3);
    const captions = PFE_TABLES.map((t) => t.caption);
    expect(captions[0]).toContain("Variables mesurées");
    expect(captions[1]).toContain("Plan d'analyse statistique");
    expect(captions[2]).toContain("Correspondance entre hypothèses");
  });

  it("each table has matching columns/rows widths", () => {
    for (const t of PFE_TABLES) {
      for (const row of t.rows) {
        expect(row.length).toBe(t.columns.length);
      }
    }
  });
});

describe("chapter progress tracker", () => {
  it("flags chapter 6 (Résultats) as not yet started", () => {
    const ch6 = REAL_CHAPTER_PROGRESS.find(
      (c) => c.chapterId === "ch6-resultats"
    );
    expect(ch6?.status).toBe("not-started");
    expect(ch6?.percent).toBe(0);
  });

  it("flags chapters 1–4 as drafted", () => {
    for (const id of [
      "ch1-depersonnalisation",
      "ch2-anxiete",
      "ch3-depression",
      "ch4-liens",
    ]) {
      const ch = REAL_CHAPTER_PROGRESS.find((c) => c.chapterId === id);
      expect(ch?.status).toBe("drafted");
      expect(ch?.percent).toBeGreaterThan(80);
    }
  });
});
