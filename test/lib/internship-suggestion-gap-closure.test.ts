import { describe, it, expect } from "vitest";
import {
  SCORABLE_TEMPLATES,
  findScorableTemplate,
} from "@/lib/internship/scorable-templates";
import {
  newAdministration,
  scoreItem,
} from "@/lib/internship/scorable-grids";
import { generateGridSummary } from "@/lib/internship/scorable-text";

// ────────────────────────────────────────────────────────────────
// Suggestion-engine gap closure
// ────────────────────────────────────────────────────────────────

const PREVIOUSLY_DANGLING_KEYS = [
  "grille-engagement-tache",
  "grille-tolerance-attente",
  "grille-distractibilite",
  "grille-memoire-visuelle-courte",
  "grille-reconnaissance-rappel",
  "grille-discrimination-visuelle",
  "grille-appariement-image-objet",
  "grille-tri-couleur-forme-taille",
  "grille-taches-structurees-avancees",
  "grille-generalisation",
  "grille-autonomie-tache",
];

describe("suggestion-engine gap closure", () => {
  it("every previously-dangling suggestion key now resolves to a real template", () => {
    for (const key of PREVIOUSLY_DANGLING_KEYS) {
      const tpl = findScorableTemplate(key);
      expect(tpl, `template missing for key ${key}`).toBeDefined();
      expect(tpl!.id).toBe(key);
    }
  });

  it("library now ships 26 templates", () => {
    expect(SCORABLE_TEMPLATES.length).toBe(26);
  });

  it("every template has at least one domain with at least one item", () => {
    for (const tpl of SCORABLE_TEMPLATES) {
      expect(tpl.domains.length).toBeGreaterThan(0);
      for (const d of tpl.domains) {
        expect(d.items.length).toBeGreaterThan(0);
      }
    }
  });

  it("every item carries a non-empty label", () => {
    for (const tpl of SCORABLE_TEMPLATES) {
      for (const d of tpl.domains) {
        for (const item of d.items) {
          expect(item.label.length).toBeGreaterThan(0);
        }
      }
    }
  });

  it("item ids stay unique within each template", () => {
    for (const tpl of SCORABLE_TEMPLATES) {
      const ids = tpl.domains.flatMap((d) => d.items.map((i) => i.id));
      expect(new Set(ids).size).toBe(ids.length);
    }
  });
});

// ────────────────────────────────────────────────────────────────
// Each new template scores end-to-end through the engine
// ────────────────────────────────────────────────────────────────

describe("new templates score end-to-end through the engine", () => {
  it.each(PREVIOUSLY_DANGLING_KEYS)(
    "%s — scoring every item produces a coherent summary",
    (key) => {
      const tpl = findScorableTemplate(key)!;
      let admin = newAdministration({
        caseId: "test-case",
        templateId: tpl.id,
        date: "2026-03-18",
      });
      // Score every item as A.
      for (const d of tpl.domains) {
        for (const item of d.items) {
          admin = scoreItem([admin], admin.id, item.id, "A")[0];
        }
      }
      const summary = generateGridSummary(admin, tpl);
      expect(summary.perDomain.length).toBe(tpl.domains.length);
      // Every domain should report as majoritairement-acquis at 100%.
      for (const d of summary.perDomain) {
        expect(d.acquisitionPct).toBe(100);
        expect(d.status).toBe("majoritairement-acquis");
      }
      // Headline should be present + non-trivial.
      expect(summary.headline.length).toBeGreaterThan(20);
    }
  );

  it("scoring everything as NA puts every new template in à-renforcer", () => {
    for (const key of PREVIOUSLY_DANGLING_KEYS) {
      const tpl = findScorableTemplate(key)!;
      let admin = newAdministration({
        caseId: "test-case",
        templateId: tpl.id,
      });
      for (const d of tpl.domains) {
        for (const item of d.items) {
          admin = scoreItem([admin], admin.id, item.id, "NA")[0];
        }
      }
      const summary = generateGridSummary(admin, tpl);
      for (const d of summary.perDomain) {
        expect(d.status).toBe("a-renforcer");
      }
    }
  });
});

// ────────────────────────────────────────────────────────────────
// Spot-check the per-domain language
// ────────────────────────────────────────────────────────────────

describe("spot-check French clinical language per template", () => {
  it("tolérance à l'attente fires the 'attente courte' phrase on EC", () => {
    const tpl = findScorableTemplate("grille-tolerance-attente")!;
    let admin = newAdministration({
      caseId: "c",
      templateId: tpl.id,
    });
    admin = scoreItem([admin], admin.id, "tol-30s", "EC")[0];
    const summary = generateGridSummary(admin, tpl);
    const text = summary.perDomain
      .map((d) => d.paragraph)
      .join(" ");
    expect(text).toMatch(/attente courte/i);
  });

  it("discrimination visuelle fires the 'couleurs primaires' phrase on A", () => {
    const tpl = findScorableTemplate("grille-discrimination-visuelle")!;
    let admin = newAdministration({
      caseId: "c",
      templateId: tpl.id,
    });
    admin = scoreItem([admin], admin.id, "dv-coul-primaires", "A")[0];
    const summary = generateGridSummary(admin, tpl);
    const text = summary.perDomain
      .map((d) => d.paragraph)
      .join(" ");
    expect(text).toMatch(/couleurs primaires sont discriminées/i);
  });

  it("appariement image/objet flags the symbolic competence on A", () => {
    const tpl = findScorableTemplate("grille-appariement-image-objet")!;
    let admin = newAdministration({
      caseId: "c",
      templateId: tpl.id,
    });
    admin = scoreItem([admin], admin.id, "ap-obj-image", "A")[0];
    const summary = generateGridSummary(admin, tpl);
    const text = summary.perDomain
      .map((d) => d.paragraph)
      .join(" ");
    expect(text).toMatch(/compétence symbolique/i);
  });

  it("généralisation flags context-dependence on EC", () => {
    const tpl = findScorableTemplate("grille-generalisation")!;
    let admin = newAdministration({
      caseId: "c",
      templateId: tpl.id,
    });
    admin = scoreItem([admin], admin.id, "gen-pers-autre-adulte", "EC")[0];
    const summary = generateGridSummary(admin, tpl);
    const text = summary.perDomain
      .map((d) => d.paragraph)
      .join(" ");
    expect(text).toMatch(/adulte de référence/i);
  });
});
