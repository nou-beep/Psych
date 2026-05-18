import { describe, it, expect } from "vitest";
import {
  DEFAULT_EVALUATOR,
  evaluatorSignature,
} from "@/lib/internship/evaluator";
import {
  SCORABLE_TEMPLATES,
  findScorableTemplate,
  followUpGridLabel,
  GRILLE_CAPACITES,
  GRILLE_COMMUNICATION_EXPRESSIVE,
  GRILLE_INTERACTION_SOCIALE,
  GRILLE_TRAITEMENT_SENSORIEL,
  GRILLE_AUTONOMIE_ADAPTATION,
} from "@/lib/internship/scorable-templates";
import {
  newAdministration,
  scoreItem,
  allDomainBreakdowns,
} from "@/lib/internship/scorable-grids";
import { generateGridSummary } from "@/lib/internship/scorable-text";
import {
  SEED_INTERNSHIP_CASES,
  SEED_INTERNSHIP_SCORABLE,
} from "@/lib/internship/seed";

// ────────────────────────────────────────────────────────────────
// Default evaluator
// ────────────────────────────────────────────────────────────────

describe("default evaluator profile", () => {
  it("defaults the name to Nouhaila Mrini", () => {
    expect(DEFAULT_EVALUATOR.name).toBe("Nouhaila Mrini");
  });

  it("defaults the role to a clinical intern title in French", () => {
    expect(DEFAULT_EVALUATOR.role).toMatch(/Psychologue/);
    expect(DEFAULT_EVALUATOR.role).toMatch(/stagiaire/i);
  });

  it("evaluatorSignature combines name and role for printables", () => {
    expect(evaluatorSignature(DEFAULT_EVALUATOR)).toBe(
      "Nouhaila Mrini · Psychologue / Thérapeute stagiaire"
    );
  });

  it("evaluatorSignature falls back to name only when role is empty", () => {
    expect(evaluatorSignature({ name: "X", role: "" })).toBe("X");
  });
});

// ────────────────────────────────────────────────────────────────
// Template library expansion
// ────────────────────────────────────────────────────────────────

describe("scorable template library expansion", () => {
  it("ships more than one template (multiple grids are now available)", () => {
    expect(SCORABLE_TEMPLATES.length).toBeGreaterThan(1);
  });

  it("ships at least the 12 templates this PR documented", () => {
    expect(SCORABLE_TEMPLATES.length).toBeGreaterThanOrEqual(12);
  });

  it("the original capacités template is still findable by id", () => {
    expect(findScorableTemplate(GRILLE_CAPACITES.id)?.name).toMatch(
      /Grille clinique d'évaluation des capacités/
    );
  });

  it("template ids are unique across the library", () => {
    const ids = SCORABLE_TEMPLATES.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("each template has at least one domain with at least one item", () => {
    for (const t of SCORABLE_TEMPLATES) {
      expect(t.domains.length).toBeGreaterThan(0);
      for (const d of t.domains) {
        expect(d.items.length).toBeGreaterThan(0);
      }
    }
  });

  it("ships specific domain templates the brief named", () => {
    expect(findScorableTemplate(GRILLE_COMMUNICATION_EXPRESSIVE.id)).toBeTruthy();
    expect(findScorableTemplate(GRILLE_INTERACTION_SOCIALE.id)).toBeTruthy();
    expect(findScorableTemplate(GRILLE_TRAITEMENT_SENSORIEL.id)).toBeTruthy();
    expect(findScorableTemplate(GRILLE_AUTONOMIE_ADAPTATION.id)).toBeTruthy();
  });

  it("follow-up labels now cover the templates that exist in this PR", () => {
    expect(followUpGridLabel("grille-communication-expressive")).toBe(
      "Communication expressive"
    );
    expect(followUpGridLabel("grille-attention-conjointe")).toBe(
      "Attention conjointe"
    );
    expect(followUpGridLabel("grille-traitement-sensoriel")).toBe(
      "Traitement sensoriel"
    );
  });
});

// ────────────────────────────────────────────────────────────────
// New templates are real scoring sheets
// ────────────────────────────────────────────────────────────────

describe("new templates produce real scoring + auto-text", () => {
  it("Communication expressive — many NA produces an à-renforcer paragraph", () => {
    let admin = newAdministration({
      caseId: "c",
      templateId: GRILLE_COMMUNICATION_EXPRESSIVE.id,
    });
    for (const d of GRILLE_COMMUNICATION_EXPRESSIVE.domains) {
      for (const item of d.items) {
        admin = scoreItem([admin], admin.id, item.id, "NA")[0];
      }
    }
    const breakdowns = allDomainBreakdowns(
      admin,
      GRILLE_COMMUNICATION_EXPRESSIVE
    );
    expect(breakdowns.every((b) => b.status === "a-renforcer")).toBe(true);
    const summary = generateGridSummary(
      admin,
      GRILLE_COMMUNICATION_EXPRESSIVE
    );
    expect(summary.headline).toMatch(/à renforcer/);
  });

  it("Sensory template fires the hyperreactivity phrase when items are EC", () => {
    let admin = newAdministration({
      caseId: "c",
      templateId: GRILLE_TRAITEMENT_SENSORIEL.id,
    });
    admin = scoreItem([admin], admin.id, "sens-auditif", "EC")[0];
    const summary = generateGridSummary(admin, GRILLE_TRAITEMENT_SENSORIEL);
    const joined = summary.perDomain.map((p) => p.paragraph).join(" ");
    expect(joined).toMatch(/hyperréactivité aux stimulations auditives/i);
  });

  it("Autonomie template fires the adaptive-support phrase when items are NA", () => {
    let admin = newAdministration({
      caseId: "c",
      templateId: GRILLE_AUTONOMIE_ADAPTATION.id,
    });
    admin = scoreItem([admin], admin.id, "auto-repas", "NA")[0];
    const summary = generateGridSummary(admin, GRILLE_AUTONOMIE_ADAPTATION);
    const joined = summary.perDomain.map((p) => p.paragraph).join(" ");
    expect(joined).toMatch(/autonomie au repas reste partielle/i);
  });

  it("Interaction sociale — NA items mention the social-interaction phrase", () => {
    let admin = newAdministration({
      caseId: "c",
      templateId: GRILLE_INTERACTION_SOCIALE.id,
    });
    admin = scoreItem([admin], admin.id, "soc-approche-pair", "NA")[0];
    const summary = generateGridSummary(admin, GRILLE_INTERACTION_SOCIALE);
    const joined = summary.perDomain.map((p) => p.paragraph).join(" ");
    expect(joined).toMatch(/jeu reste majoritairement parallèle/i);
  });
});

// ────────────────────────────────────────────────────────────────
// Anonymized seed
// ────────────────────────────────────────────────────────────────

describe("anonymized seed case", () => {
  it("uses INT-AP-001 as the case code", () => {
    expect(SEED_INTERNSHIP_CASES[0].identification.caseCode).toBe(
      "INT-AP-001"
    );
  });

  it("does not embed the prior CHILD-AUT-2026-01 code", () => {
    for (const c of SEED_INTERNSHIP_CASES) {
      expect(c.identification.caseCode).not.toBe("CHILD-AUT-2026-01");
    }
  });

  it("ships one pre-filled scored administration anchored on the capacités template", () => {
    expect(SEED_INTERNSHIP_SCORABLE.length).toBeGreaterThan(0);
    expect(SEED_INTERNSHIP_SCORABLE[0].templateId).toBe(GRILLE_CAPACITES.id);
    expect(SEED_INTERNSHIP_SCORABLE[0].evaluator).toBe(DEFAULT_EVALUATOR.name);
    // Every item should be scored — this is meant as a complete example.
    const expected = GRILLE_CAPACITES.domains.reduce(
      (n, d) => n + d.items.length,
      0
    );
    expect(
      Object.keys(SEED_INTERNSHIP_SCORABLE[0].scores).length
    ).toBe(expected);
  });

  it("the seeded administration is anchored to the seeded case", () => {
    expect(SEED_INTERNSHIP_SCORABLE[0].caseId).toBe(
      SEED_INTERNSHIP_CASES[0].id
    );
  });

  it("contains no D.T. evaluator references", () => {
    expect(SEED_INTERNSHIP_SCORABLE[0].evaluator).not.toBe("D.T.");
    for (const c of SEED_INTERNSHIP_CASES) {
      const text = JSON.stringify(c);
      expect(text).not.toMatch(/D\.T\./);
    }
  });
});

// ────────────────────────────────────────────────────────────────
// Sidebar nav structure
// ────────────────────────────────────────────────────────────────

describe("sidebar navigation cleanup", () => {
  // We assert against the navGroups export indirectly by reading
  // the module. Importing here keeps the test environment honest
  // about what the user actually sees.

  it("does not include the standalone /audio route", async () => {
    const fs = await import("fs/promises");
    const path = await import("path");
    const src = await fs.readFile(
      path.resolve(process.cwd(), "components/layout/Sidebar.tsx"),
      "utf8"
    );
    expect(/"\/audio"/.test(src)).toBe(false);
  });

  it("has exactly five top-level groups", async () => {
    const fs = await import("fs/promises");
    const path = await import("path");
    const src = await fs.readFile(
      path.resolve(process.cwd(), "components/layout/Sidebar.tsx"),
      "utf8"
    );
    // Count top-level group labels — they live at the start of an
    // object literal, so we match the indentation pattern to avoid
    // confusing a group label with an item label that shares a name.
    const labelMatches = src.match(
      /\n {4}label: "(Home|Clinical Work|Research|Materials|System)"/g
    );
    expect(labelMatches?.length).toBe(5);
  });

  it("Internship Studio is reachable from the sidebar", async () => {
    const fs = await import("fs/promises");
    const path = await import("path");
    const src = await fs.readFile(
      path.resolve(process.cwd(), "components/layout/Sidebar.tsx"),
      "utf8"
    );
    expect(src).toMatch(/"\/internship"/);
  });
});
