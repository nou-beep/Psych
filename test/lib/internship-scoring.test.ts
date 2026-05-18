import { describe, it, expect } from "vitest";
import {
  CAPABILITY_SCORE_LABELS,
  CAPABILITY_SCORE_LONG_LABELS,
  DOMAIN_STATUS_LABELS,
  administrationsForCase,
  allDomainBreakdowns,
  clearItemScore,
  domainBreakdown,
  gridBreakdown,
  newAdministration,
  patchAdministration,
  removeAdministration,
  scoreItem,
  suggestNextGridKeys,
  type CapabilityScore,
  type ScorableGridAdministration,
} from "@/lib/internship/scorable-grids";
import {
  GRILLE_CAPACITES,
  findScorableTemplate,
  followUpGridLabel,
  SCORABLE_TEMPLATES,
} from "@/lib/internship/scorable-templates";
import {
  buildDailyFromGrid,
  buildGridSummaryReportBody,
  domainOneLiner,
  generateDomainSummary,
  generateGridSummary,
  renderSummaryAsText,
} from "@/lib/internship/scorable-text";

// Helper — score every item in a domain identically.
function scoreDomain(
  admin: ScorableGridAdministration,
  domainId: string,
  score: CapabilityScore
): ScorableGridAdministration {
  let next: ScorableGridAdministration[] = [admin];
  const domain = GRILLE_CAPACITES.domains.find((d) => d.id === domainId)!;
  for (const item of domain.items) {
    next = scoreItem(next, admin.id, item.id, score);
  }
  return next[0];
}

// ────────────────────────────────────────────────────────────────
// Template invariants
// ────────────────────────────────────────────────────────────────

describe("scorable template — Grille clinique d'évaluation des capacités", () => {
  it("ships exactly the 14 items the brief specifies across 3 domains", () => {
    expect(GRILLE_CAPACITES.domains).toHaveLength(3);
    const total = GRILLE_CAPACITES.domains.reduce(
      (n, d) => n + d.items.length,
      0
    );
    expect(total).toBe(14);
  });

  it("each item id is unique across the template", () => {
    const ids = GRILLE_CAPACITES.domains.flatMap((d) =>
      d.items.map((i) => i.id)
    );
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("findScorableTemplate roundtrips by id", () => {
    expect(findScorableTemplate(GRILLE_CAPACITES.id)?.name).toMatch(
      /Grille clinique/
    );
    expect(findScorableTemplate("missing")).toBeUndefined();
  });

  it("ships at least one template", () => {
    expect(SCORABLE_TEMPLATES.length).toBeGreaterThan(0);
  });

  it("CAPABILITY_SCORE_LABELS preserves French abbreviations", () => {
    expect(CAPABILITY_SCORE_LABELS.A).toBe("A");
    expect(CAPABILITY_SCORE_LABELS.EC).toBe("EC");
    expect(CAPABILITY_SCORE_LABELS.NA).toBe("NA");
    expect(CAPABILITY_SCORE_LABELS.NO).toBe("N/O");
    expect(CAPABILITY_SCORE_LONG_LABELS.NO).toBe("Non observé");
  });
});

// ────────────────────────────────────────────────────────────────
// Scoring mutations
// ────────────────────────────────────────────────────────────────

describe("scoring item as each of the four values", () => {
  const cases: CapabilityScore[] = ["A", "EC", "NA", "NO"];
  it.each(cases)("records score = %s and preserves the value", (score) => {
    const admin = newAdministration({
      caseId: "case-1",
      templateId: GRILLE_CAPACITES.id,
    });
    const next = scoreItem(
      [admin],
      admin.id,
      "attention-prenom",
      score,
      { note: "during arrival" }
    );
    expect(next[0].scores["attention-prenom"].score).toBe(score);
    expect(next[0].scores["attention-prenom"].note).toBe("during arrival");
  });

  it("preserves an existing note when re-scoring without a new note", () => {
    let admins = [
      newAdministration({
        caseId: "c",
        templateId: GRILLE_CAPACITES.id,
      }),
    ];
    admins = scoreItem(admins, admins[0].id, "attention-prenom", "EC", {
      note: "first try",
    });
    admins = scoreItem(admins, admins[0].id, "attention-prenom", "A");
    expect(admins[0].scores["attention-prenom"].note).toBe("first try");
    expect(admins[0].scores["attention-prenom"].score).toBe("A");
  });

  it("clearItemScore removes the entry entirely", () => {
    let admins = [
      newAdministration({
        caseId: "c",
        templateId: GRILLE_CAPACITES.id,
      }),
    ];
    admins = scoreItem(admins, admins[0].id, "attention-prenom", "EC");
    admins = clearItemScore(admins, admins[0].id, "attention-prenom");
    expect(admins[0].scores["attention-prenom"]).toBeUndefined();
  });
});

describe("administration metadata mutations", () => {
  it("newAdministration defaults date to today and starts empty", () => {
    const admin = newAdministration({
      caseId: "c",
      templateId: GRILLE_CAPACITES.id,
    });
    expect(admin.date.length).toBeGreaterThan(0);
    expect(admin.scores).toEqual({});
  });

  it("patchAdministration updates evaluator + context without touching scores", () => {
    let admins = [
      newAdministration({
        caseId: "c",
        templateId: GRILLE_CAPACITES.id,
      }),
    ];
    admins = scoreItem(admins, admins[0].id, "attention-prenom", "A");
    admins = patchAdministration(admins, admins[0].id, {
      evaluator: "D.T.",
      context: "Atelier individuel",
    });
    expect(admins[0].evaluator).toBe("D.T.");
    expect(admins[0].context).toBe("Atelier individuel");
    expect(admins[0].scores["attention-prenom"].score).toBe("A");
  });

  it("removeAdministration drops the record", () => {
    const a = newAdministration({
      caseId: "c",
      templateId: GRILLE_CAPACITES.id,
    });
    expect(removeAdministration([a], a.id)).toEqual([]);
  });

  it("administrationsForCase sorts by date desc", () => {
    const a = {
      ...newAdministration({ caseId: "c", templateId: GRILLE_CAPACITES.id }),
      date: "2026-02-10",
    };
    const b = {
      ...newAdministration({ caseId: "c", templateId: GRILLE_CAPACITES.id }),
      date: "2026-03-20",
    };
    expect(administrationsForCase([a, b], "c")[0].date).toBe("2026-03-20");
  });
});

// ────────────────────────────────────────────────────────────────
// Domain breakdown
// ────────────────────────────────────────────────────────────────

describe("domain breakdown", () => {
  it("returns null for an unknown domain id", () => {
    const admin = newAdministration({
      caseId: "c",
      templateId: GRILLE_CAPACITES.id,
    });
    expect(domainBreakdown(admin, GRILLE_CAPACITES, "missing")).toBeNull();
  });

  it("flags a fully-unobserved domain as non-suffisamment-observable", () => {
    const admin = newAdministration({
      caseId: "c",
      templateId: GRILLE_CAPACITES.id,
    });
    const b = domainBreakdown(
      admin,
      GRILLE_CAPACITES,
      "attention-disponibilite"
    );
    expect(b?.status).toBe("non-suffisamment-observable");
    expect(b?.observabilityPct).toBe(0);
  });

  it("flags a fully-acquired domain as majoritairement-acquis", () => {
    const admin = newAdministration({
      caseId: "c",
      templateId: GRILLE_CAPACITES.id,
    });
    const next = scoreDomain(admin, "attention-disponibilite", "A");
    const b = domainBreakdown(next, GRILLE_CAPACITES, "attention-disponibilite");
    expect(b?.status).toBe("majoritairement-acquis");
    expect(b?.acquisitionPct).toBe(100);
    expect(b?.observabilityPct).toBe(100);
  });

  it("flags a mostly-EC domain as en-cours-acquisition", () => {
    let admins: ScorableGridAdministration[] = [
      newAdministration({ caseId: "c", templateId: GRILLE_CAPACITES.id }),
    ];
    const items = GRILLE_CAPACITES.domains.find(
      (d) => d.id === "attention-disponibilite"
    )!.items;
    // 1 A + 5 EC across 6 items → (1 + 2.5) / 6 = 58% → en-cours.
    items.forEach((item, i) => {
      admins = scoreItem(
        admins,
        admins[0].id,
        item.id,
        i === 0 ? "A" : "EC"
      );
    });
    const b = domainBreakdown(
      admins[0],
      GRILLE_CAPACITES,
      "attention-disponibilite"
    );
    expect(b?.status).toBe("en-cours-acquisition");
    expect(b?.acquisitionPct).toBeGreaterThan(40);
    expect(b?.acquisitionPct).toBeLessThan(75);
  });

  it("flags a mostly-NA domain as à-renforcer", () => {
    const admin = newAdministration({
      caseId: "c",
      templateId: GRILLE_CAPACITES.id,
    });
    const next = scoreDomain(admin, "memoire-evocation", "NA");
    const b = domainBreakdown(next, GRILLE_CAPACITES, "memoire-evocation");
    expect(b?.status).toBe("a-renforcer");
    expect(b?.acquisitionPct).toBe(0);
  });

  it("allDomainBreakdowns returns one entry per template domain", () => {
    const admin = newAdministration({
      caseId: "c",
      templateId: GRILLE_CAPACITES.id,
    });
    expect(allDomainBreakdowns(admin, GRILLE_CAPACITES)).toHaveLength(3);
  });

  it("status label dictionary covers every status", () => {
    expect(DOMAIN_STATUS_LABELS["majoritairement-acquis"]).toMatch(
      /Majoritairement/
    );
    expect(DOMAIN_STATUS_LABELS["en-cours-acquisition"]).toMatch(
      /En cours/
    );
    expect(DOMAIN_STATUS_LABELS["a-renforcer"]).toMatch(/renforcer/);
    expect(DOMAIN_STATUS_LABELS["non-suffisamment-observable"]).toMatch(
      /observable/
    );
  });
});

describe("gridBreakdown", () => {
  it("totals 14 items across the template", () => {
    const admin = newAdministration({
      caseId: "c",
      templateId: GRILLE_CAPACITES.id,
    });
    expect(gridBreakdown(admin, GRILLE_CAPACITES).total).toBe(14);
  });

  it("acquisition is 100% when every item is A", () => {
    let admin = newAdministration({
      caseId: "c",
      templateId: GRILLE_CAPACITES.id,
    });
    for (const d of GRILLE_CAPACITES.domains) {
      admin = scoreDomain(admin, d.id, "A");
    }
    expect(gridBreakdown(admin, GRILLE_CAPACITES).acquisitionPct).toBe(100);
  });
});

// ────────────────────────────────────────────────────────────────
// Suggested next grids
// ────────────────────────────────────────────────────────────────

describe("suggestNextGridKeys", () => {
  it("suggests the attention follow-ups when attention is à renforcer", () => {
    const admin = newAdministration({
      caseId: "c",
      templateId: GRILLE_CAPACITES.id,
    });
    const next = scoreDomain(admin, "attention-disponibilite", "NA");
    const keys = suggestNextGridKeys(next, GRILLE_CAPACITES);
    expect(keys).toContain("grille-attention-soutenue");
    expect(keys).toContain("grille-engagement-tache");
    expect(keys).toContain("grille-tolerance-attente");
    expect(keys).toContain("grille-distractibilite");
  });

  it("suggests the memory follow-ups when memory is en cours", () => {
    const admin = newAdministration({
      caseId: "c",
      templateId: GRILLE_CAPACITES.id,
    });
    const next = scoreDomain(admin, "memoire-evocation", "EC");
    const keys = suggestNextGridKeys(next, GRILLE_CAPACITES);
    expect(keys).toContain("grille-memoire-visuelle-courte");
    expect(keys).toContain("grille-reconnaissance-rappel");
  });

  it("suggests perception follow-ups when perception is à renforcer", () => {
    const admin = newAdministration({
      caseId: "c",
      templateId: GRILLE_CAPACITES.id,
    });
    const next = scoreDomain(admin, "perception-discrimination", "NA");
    const keys = suggestNextGridKeys(next, GRILLE_CAPACITES);
    expect(keys).toContain("grille-discrimination-visuelle");
    expect(keys).toContain("grille-appariement-image-objet");
    expect(keys).toContain("grille-tri-couleur-forme-taille");
  });

  it("suggests the advanced set when the whole grid is majoritairement acquis", () => {
    let admin = newAdministration({
      caseId: "c",
      templateId: GRILLE_CAPACITES.id,
    });
    for (const d of GRILLE_CAPACITES.domains) {
      admin = scoreDomain(admin, d.id, "A");
    }
    const keys = suggestNextGridKeys(admin, GRILLE_CAPACITES);
    expect(keys).toContain("grille-taches-structurees-avancees");
    expect(keys).toContain("grille-generalisation");
    expect(keys).toContain("grille-autonomie-tache");
  });

  it("does not suggest follow-ups when domains are not yet observed", () => {
    const admin = newAdministration({
      caseId: "c",
      templateId: GRILLE_CAPACITES.id,
    });
    expect(suggestNextGridKeys(admin, GRILLE_CAPACITES)).toEqual([]);
  });

  it("followUpGridLabel returns a friendly label for a known key", () => {
    expect(followUpGridLabel("grille-attention-soutenue")).toBe(
      "Attention soutenue"
    );
    expect(followUpGridLabel("unknown-key")).toBe("unknown-key");
  });
});

// ────────────────────────────────────────────────────────────────
// Text generation
// ────────────────────────────────────────────────────────────────

describe("generateDomainSummary", () => {
  it("fires the EC/NA phrase for the prénom item when scored EC", () => {
    let admins = [
      newAdministration({
        caseId: "c",
        templateId: GRILLE_CAPACITES.id,
      }),
    ];
    admins = scoreItem(admins, admins[0].id, "attention-prenom", "EC");
    const text = generateDomainSummary(
      admins[0],
      GRILLE_CAPACITES,
      "attention-disponibilite"
    );
    expect(text).toMatch(/orientation à l'appel du prénom reste fragile/);
  });

  it("fires the EC/NA phrase for distracteurs when scored NA", () => {
    let admins = [
      newAdministration({
        caseId: "c",
        templateId: GRILLE_CAPACITES.id,
      }),
    ];
    admins = scoreItem(admins, admins[0].id, "attention-distracteurs", "NA");
    const text = generateDomainSummary(
      admins[0],
      GRILLE_CAPACITES,
      "attention-disponibilite"
    );
    expect(text).toMatch(/résistance aux distracteurs/i);
  });

  it("fires the A phrase for tri when scored A", () => {
    let admins = [
      newAdministration({
        caseId: "c",
        templateId: GRILLE_CAPACITES.id,
      }),
    ];
    admins = scoreItem(admins, admins[0].id, "perception-tri", "A");
    const text = generateDomainSummary(
      admins[0],
      GRILLE_CAPACITES,
      "perception-discrimination"
    );
    expect(text).toMatch(/discrimination visuelle sont mobilisables/);
  });

  it("returns an empty string for an unknown domain id", () => {
    const admin = newAdministration({
      caseId: "c",
      templateId: GRILLE_CAPACITES.id,
    });
    expect(generateDomainSummary(admin, GRILLE_CAPACITES, "missing")).toBe("");
  });
});

describe("generateGridSummary", () => {
  it("produces a strengths / difficulties / recommendations triplet", () => {
    let admin = newAdministration({
      caseId: "c",
      templateId: GRILLE_CAPACITES.id,
    });
    admin = scoreDomain(admin, "attention-disponibilite", "A");
    admin = scoreDomain(admin, "memoire-evocation", "NA");
    const summary = generateGridSummary(admin, GRILLE_CAPACITES);
    expect(summary.perDomain).toHaveLength(3);
    expect(summary.strengths.length).toBeGreaterThan(0);
    expect(summary.difficulties.length).toBeGreaterThan(0);
    expect(summary.recommendations.length).toBeGreaterThan(0);
  });

  it("surfaces next-grid keys on weak domains", () => {
    let admin = newAdministration({
      caseId: "c",
      templateId: GRILLE_CAPACITES.id,
    });
    admin = scoreDomain(admin, "attention-disponibilite", "NA");
    const summary = generateGridSummary(admin, GRILLE_CAPACITES);
    expect(summary.nextGridKeys.length).toBeGreaterThan(0);
  });

  it("renderSummaryAsText concatenates the sections", () => {
    let admin = newAdministration({
      caseId: "c",
      templateId: GRILLE_CAPACITES.id,
    });
    admin = scoreDomain(admin, "attention-disponibilite", "A");
    const summary = generateGridSummary(admin, GRILLE_CAPACITES);
    const text = renderSummaryAsText(summary);
    expect(text).toMatch(/Forces/);
    expect(text).toMatch(/Difficultés/);
    expect(text).toMatch(/Recommandations/);
  });
});

describe("buildDailyFromGrid", () => {
  it("returns a DailyReportSections shaped object with the right date", () => {
    let admin = newAdministration({
      caseId: "c",
      templateId: GRILLE_CAPACITES.id,
      date: "2026-03-18",
    });
    admin = scoreDomain(admin, "attention-disponibilite", "A");
    const daily = buildDailyFromGrid(admin, GRILLE_CAPACITES);
    expect(daily.date).toBe("2026-03-18");
    expect(daily.observations).toMatch(/Attention et disponibilité/);
    expect(daily.objectives).toMatch(/Grille clinique/);
  });

  it("respects the administration's evaluator context when present", () => {
    let admin = newAdministration({
      caseId: "c",
      templateId: GRILLE_CAPACITES.id,
      context: "Atelier individuel · matin",
    });
    admin = scoreDomain(admin, "attention-disponibilite", "A");
    const daily = buildDailyFromGrid(admin, GRILLE_CAPACITES);
    expect(daily.contextSession).toBe("Atelier individuel · matin");
  });
});

describe("buildGridSummaryReportBody + domainOneLiner", () => {
  it("buildGridSummaryReportBody includes the template name + date", () => {
    let admin = newAdministration({
      caseId: "c",
      templateId: GRILLE_CAPACITES.id,
      date: "2026-03-18",
    });
    admin = scoreDomain(admin, "attention-disponibilite", "A");
    const body = buildGridSummaryReportBody(admin, GRILLE_CAPACITES);
    expect(body).toMatch(/Grille clinique d'évaluation/);
    expect(body).toMatch(/2026-03-18/);
  });

  it("domainOneLiner reports counts in French", () => {
    let admin = newAdministration({
      caseId: "c",
      templateId: GRILLE_CAPACITES.id,
    });
    admin = scoreDomain(admin, "attention-disponibilite", "A");
    const line = domainOneLiner(
      admin,
      GRILLE_CAPACITES,
      "attention-disponibilite"
    );
    expect(line).toMatch(/100%/);
    expect(line).toMatch(/acquis/);
  });
});
