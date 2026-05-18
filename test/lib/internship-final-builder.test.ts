import { describe, it, expect } from "vitest";
import {
  attributionLine,
  buildFinalReport,
} from "@/lib/internship/final-report-builder";
import {
  GRILLE_CAPACITES,
  GRILLE_GRAPHOMOTRICITE,
  GRILLE_MOTRICITE_FINE,
  GRILLE_ORGANISATION_VISUOSPATIALE,
  SCORABLE_TEMPLATES,
  findScorableTemplate,
} from "@/lib/internship/scorable-templates";
import { newAdministration, scoreItem } from "@/lib/internship/scorable-grids";
import {
  newDailyReport,
  newFinalReport,
  newWeeklyReport,
} from "@/lib/internship/reports";
import { newCase } from "@/lib/internship/case";
import { newTestFromShell, recordScore } from "@/lib/internship/tests";
import { newSupervisionNote } from "@/lib/internship/supervision";
import { SEED_STRUCTURED_PROFILE } from "@/lib/internship/seed";
import { DEFAULT_EVALUATOR } from "@/lib/internship/evaluator";

// ────────────────────────────────────────────────────────────────
// New scorable grid templates
// ────────────────────────────────────────────────────────────────

describe("new scorable grid templates", () => {
  it("registers the three new templates in SCORABLE_TEMPLATES", () => {
    expect(SCORABLE_TEMPLATES).toContain(GRILLE_GRAPHOMOTRICITE);
    expect(SCORABLE_TEMPLATES).toContain(GRILLE_ORGANISATION_VISUOSPATIALE);
    expect(SCORABLE_TEMPLATES).toContain(GRILLE_MOTRICITE_FINE);
  });

  it("each new template has a unique id + domains + items", () => {
    for (const tpl of [
      GRILLE_GRAPHOMOTRICITE,
      GRILLE_ORGANISATION_VISUOSPATIALE,
      GRILLE_MOTRICITE_FINE,
    ]) {
      expect(findScorableTemplate(tpl.id)).toBe(tpl);
      expect(tpl.domains.length).toBeGreaterThan(0);
      const total = tpl.domains.reduce((n, d) => n + d.items.length, 0);
      expect(total).toBeGreaterThan(3);
    }
  });

  it("template ids stay unique across the now-26 templates", () => {
    const ids = SCORABLE_TEMPLATES.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(SCORABLE_TEMPLATES.length).toBe(26);
  });

  it("graphomotor template covers prehension + tracés + organisation", () => {
    const ids = GRILLE_GRAPHOMOTRICITE.domains.map((d) => d.id);
    expect(ids).toContain("graphomot-prehension");
    expect(ids).toContain("graphomot-traces");
    expect(ids).toContain("graphomot-organisation");
  });

  it("visuospatial template covers repérage + copie", () => {
    const ids = GRILLE_ORGANISATION_VISUOSPATIALE.domains.map((d) => d.id);
    expect(ids).toContain("vs-reperage");
    expect(ids).toContain("vs-copie");
  });

  it("motricité fine template covers pince + bimanuel + precision", () => {
    const ids = GRILLE_MOTRICITE_FINE.domains.map((d) => d.id);
    expect(ids).toContain("mf-pince");
    expect(ids).toContain("mf-bimanuel");
    expect(ids).toContain("mf-precision");
  });
});

// ────────────────────────────────────────────────────────────────
// Final report builder
// ────────────────────────────────────────────────────────────────

function buildSourcesForCase(opts: {
  withProfile?: boolean;
  withScoredGrid?: boolean;
  withTest?: boolean;
  withSupervision?: boolean;
  withDaily?: boolean;
  withWeekly?: boolean;
}) {
  const caseData = newCase({
    caseCode: "TEST-001",
    age: "5",
    presentingConcerns: "TSA · communication partielle",
    diagnosticContext: "TSA",
  });
  if (opts.withProfile) {
    caseData.context.structuredProfile = SEED_STRUCTURED_PROFILE;
  }

  const scorableAdmins = [];
  if (opts.withScoredGrid) {
    let admin = newAdministration({
      caseId: caseData.id,
      templateId: GRILLE_CAPACITES.id,
      date: "2026-03-14",
      evaluator: DEFAULT_EVALUATOR.name,
      context: "Atelier individuel",
    });
    admin = scoreItem([admin], admin.id, "attention-prenom", "A")[0];
    admin = scoreItem([admin], admin.id, "perception-tri", "A")[0];
    admin = scoreItem([admin], admin.id, "attention-distracteurs", "EC")[0];
    scorableAdmins.push(admin);
  }

  const tests = [];
  if (opts.withTest) {
    let t = newTestFromShell({
      caseId: caseData.id,
      shellId: "vineland",
    })!;
    t = recordScore(
      [t],
      t.id,
      { rawScore: "120", band: "average" },
      "Score average range."
    )[0];
    tests.push(t);
  }

  const supervision = [];
  if (opts.withSupervision) {
    supervision.push(
      newSupervisionNote({
        caseId: caseData.id,
        date: "2026-03-16",
        supervisor: "Dr. R. Cohen",
        initial: {
          feedbackReceived: "Continuer le travail en cours.",
          actionPlan: "Administrer la grille Attention.",
        },
      })
    );
  }

  const dailyReports = [];
  if (opts.withDaily) {
    const d = newDailyReport({
      caseId: caseData.id,
      date: "2026-03-11",
      initial: { observations: "Engagement variable." },
    });
    d.daily!.interventionChips = [
      "communication-fonctionnelle",
      "renforcement-positif",
    ];
    dailyReports.push(d);
  }

  const weeklyReports = [];
  if (opts.withWeekly) {
    weeklyReports.push(
      newWeeklyReport({
        caseId: caseData.id,
        weekStart: "2026-03-09",
        weekEnd: "2026-03-15",
        initial: {
          progressObserved: "Bonne progression sur la communication.",
        },
      })
    );
  }

  return {
    caseData,
    scorableAdmins,
    tests,
    supervision,
    weeklyReports,
    dailyReports,
  };
}

describe("buildFinalReport", () => {
  it("produces every required FinalReportSections field", () => {
    const sources = buildSourcesForCase({});
    const { sections } = buildFinalReport(sources);
    expect(sections.coverPage).toBeTruthy();
    expect(sections.internshipContext).toBeTruthy();
    expect(sections.casePresentation).toBeTruthy();
    expect(sections.observationMethodology).toBeTruthy();
    expect(sections.testsAdministered).toBeTruthy();
    expect(sections.evaluationGrids).toBeTruthy();
    expect(sections.clinicalObservations).toBeTruthy();
    expect(sections.interventionReflection).toBeTruthy();
    expect(sections.progressEvolution).toBeTruthy();
    expect(sections.supervisionReflections).toBeTruthy();
    expect(sections.limits).toBeTruthy();
    expect(sections.recommendations).toBeTruthy();
    expect(sections.conclusion).toBeTruthy();
  });

  it("cover page seeds the intern + supervisor + case code", () => {
    const sources = buildSourcesForCase({});
    const { sections } = buildFinalReport(sources);
    expect(sections.coverPage).toMatch(/Nouhaila Mrini/);
    expect(sections.coverPage).toMatch(/TEST-001/);
    expect(sections.coverPage).toMatch(/Ibn Tofail/);
  });

  it("internship context surfaces the institution + team description", () => {
    const sources = buildSourcesForCase({});
    const { sections } = buildFinalReport(sources);
    expect(sections.internshipContext).toMatch(/À Petit Pas/);
    expect(sections.internshipContext).toMatch(/multidisciplinaire/i);
  });

  it("case presentation surfaces the structured profile when present", () => {
    const sources = buildSourcesForCase({ withProfile: true });
    const { sections } = buildFinalReport(sources);
    expect(sections.clinicalObservations).toMatch(/Communication/);
    expect(sections.clinicalObservations).toMatch(/visuospatial/i);
  });

  it("evaluation grids section lists templates that were administered", () => {
    const sources = buildSourcesForCase({ withScoredGrid: true });
    const { sections } = buildFinalReport(sources);
    expect(sections.evaluationGrids).toMatch(/Grille clinique/);
    expect(sections.evaluationGrids).toMatch(/Attention/);
    expect(sections.evaluationGrids).not.toMatch(/Aucune grille/);
  });

  it("tests administered section lists the test name + score", () => {
    const sources = buildSourcesForCase({ withTest: true });
    const { sections } = buildFinalReport(sources);
    expect(sections.testsAdministered).toMatch(/Vineland/);
    expect(sections.testsAdministered).toMatch(/scoré|average/i);
  });

  it("intervention reflection aggregates daily-report chips", () => {
    const sources = buildSourcesForCase({ withDaily: true });
    const { sections } = buildFinalReport(sources);
    expect(sections.interventionReflection).toMatch(/communication fonctionnelle/i);
    expect(sections.interventionReflection).toMatch(/renforcement positif/i);
  });

  it("supervision section lists the date + supervisor + feedback", () => {
    const sources = buildSourcesForCase({ withSupervision: true });
    const { sections } = buildFinalReport(sources);
    expect(sections.supervisionReflections).toMatch(/2026-03-16/);
    expect(sections.supervisionReflections).toMatch(/Cohen/);
    expect(sections.supervisionReflections).toMatch(/Feedback/);
  });

  it("progress section lists each weekly report's window + progress text", () => {
    const sources = buildSourcesForCase({ withWeekly: true });
    const { sections } = buildFinalReport(sources);
    expect(sections.progressEvolution).toMatch(/2026-03-09/);
    expect(sections.progressEvolution).toMatch(/Bonne progression/);
  });

  it("recommendations list per-domain advice driven by the profile", () => {
    const sources = buildSourcesForCase({ withProfile: true });
    const { sections } = buildFinalReport(sources);
    // The seeded profile flags motor as priority — recommendations
    // should mention graphomotor.
    expect(sections.recommendations).toMatch(/graphomoteur|graphomotricité/i);
  });

  it("conclusion mentions the grid count + multidisciplinary team", () => {
    const sources = buildSourcesForCase({ withScoredGrid: true });
    const { sections } = buildFinalReport(sources);
    expect(sections.conclusion).toMatch(/pluridisciplinaire/i);
    expect(sections.conclusion).toMatch(/\d/); // grid count number
  });

  it("attribution counts every source kind", () => {
    const sources = buildSourcesForCase({
      withProfile: true,
      withScoredGrid: true,
      withTest: true,
      withSupervision: true,
      withDaily: true,
      withWeekly: true,
    });
    const { attribution } = buildFinalReport(sources);
    expect(attribution.profileFilled).toBe(true);
    expect(attribution.gridCount).toBe(1);
    expect(attribution.testCount).toBe(1);
    expect(attribution.supervisionCount).toBe(1);
    expect(attribution.dailyCount).toBe(1);
    expect(attribution.weeklyCount).toBe(1);
  });
});

describe("attributionLine", () => {
  it("renders an empty-source line", () => {
    expect(
      attributionLine({
        profileFilled: false,
        gridCount: 0,
        testCount: 0,
        supervisionCount: 0,
        dailyCount: 0,
        weeklyCount: 0,
      })
    ).toMatch(/Aucune source/);
  });

  it("renders the populated case", () => {
    const line = attributionLine({
      profileFilled: true,
      gridCount: 2,
      testCount: 1,
      supervisionCount: 1,
      dailyCount: 3,
      weeklyCount: 1,
    });
    expect(line).toMatch(/profil structuré/);
    expect(line).toMatch(/2 grilles/);
    expect(line).toMatch(/1 test/);
    expect(line).toMatch(/3 séances/);
  });
});

// ────────────────────────────────────────────────────────────────
// Sanity: newFinalReport accepts the produced sections
// ────────────────────────────────────────────────────────────────

describe("integration with newFinalReport", () => {
  it("the produced sections plug into newFinalReport unchanged", () => {
    const sources = buildSourcesForCase({
      withProfile: true,
      withScoredGrid: true,
    });
    const { sections } = buildFinalReport(sources);
    const report = newFinalReport({
      caseId: sources.caseData.id,
      initial: sections,
    });
    expect(report.kind).toBe("final");
    expect(report.final?.coverPage).toBe(sections.coverPage);
    expect(report.final?.evaluationGrids).toBe(sections.evaluationGrids);
    expect(report.draft).toBe(true);
  });
});
