import { describe, it, expect } from "vitest";
import {
  allScoreSetDomainBreakdowns,
  clearScoreSetItem,
  newScoreSetAdministration,
  patchScoreSetAdministration,
  scoreScoreSetItem,
  scoreSetBreakdown,
  scoreSetDomainBreakdown,
  suggestNextScoreSetKeys,
  type ScoreSetAdministration,
  type ScoreSetDefinition,
} from "@/lib/internship/score-set";
import {
  acquisitionSchema,
  binaryYNSchema,
  findSchema,
  frequencySchema,
  likert1to4Schema,
  likert1to5Schema,
  severitySchema,
  supportLevelSchema,
  type AcquisitionValue,
  type Likert5Value,
} from "@/lib/internship/score-set-schemas";
import {
  scorableAdminToScoreSetAdmin,
  scorableGridToScoreSet,
  scoreSetAdminToScorable,
} from "@/lib/internship/score-set-adapters";
import {
  newAdministration as newLegacyAdmin,
  scoreItem as scoreLegacyItem,
} from "@/lib/internship/scorable-grids";
import { GRILLE_CAPACITES } from "@/lib/internship/scorable-templates";
import {
  SCORE_SET_RATING_ENGAGEMENT,
  SCORE_SET_TRIGGER_LOG,
  SCORE_SET_TEMPLATES,
  findScoreSetTemplate,
} from "@/lib/internship/score-set-templates";

// ────────────────────────────────────────────────────────────────
// Schemas — invariants
// ────────────────────────────────────────────────────────────────

describe("built-in schemas", () => {
  it("ships seven distinct schemas", () => {
    const ids = [
      acquisitionSchema.id,
      binaryYNSchema.id,
      likert1to4Schema.id,
      likert1to5Schema.id,
      frequencySchema.id,
      supportLevelSchema.id,
      severitySchema.id,
    ];
    expect(new Set(ids).size).toBe(7);
  });

  it("each schema's values are themselves unique", () => {
    for (const schema of [
      acquisitionSchema,
      binaryYNSchema,
      likert1to4Schema,
      likert1to5Schema,
      frequencySchema,
      supportLevelSchema,
      severitySchema,
    ]) {
      const vs = schema.values.map((v) => v.value);
      expect(new Set(vs).size).toBe(vs.length);
    }
  });

  it("acquisition weights: A=1, EC=0.5, NA=0, NO=null", () => {
    expect(acquisitionSchema.weightOf("A")).toBe(1);
    expect(acquisitionSchema.weightOf("EC")).toBe(0.5);
    expect(acquisitionSchema.weightOf("NA")).toBe(0);
    expect(acquisitionSchema.weightOf("NO")).toBeNull();
  });

  it("binary Y/N: oui=1, non=0, non-observe=null", () => {
    expect(binaryYNSchema.weightOf("oui")).toBe(1);
    expect(binaryYNSchema.weightOf("non")).toBe(0);
    expect(binaryYNSchema.weightOf("non-observe")).toBeNull();
  });

  it("likert 1-4 (atypicité): 1=1.0, 4=0; lower is better", () => {
    expect(likert1to4Schema.weightOf("1")).toBe(1);
    expect(likert1to4Schema.weightOf("4")).toBe(0);
    expect(likert1to4Schema.higherIsWorse).toBe(true);
  });

  it("likert 1-5 (quality): 1=0, 5=1; higher is better", () => {
    expect(likert1to5Schema.weightOf("1")).toBe(0);
    expect(likert1to5Schema.weightOf("3")).toBe(0.5);
    expect(likert1to5Schema.weightOf("5")).toBe(1);
    expect(likert1to5Schema.higherIsWorse).toBeUndefined();
  });

  it("frequency: jamais=0 → très souvent=1", () => {
    expect(frequencySchema.weightOf("jamais")).toBe(0);
    expect(frequencySchema.weightOf("rarement")).toBe(0.25);
    expect(frequencySchema.weightOf("tres-souvent")).toBe(1);
    expect(frequencySchema.weightOf("non-observe")).toBeNull();
  });

  it("support level: independent=1 → full guidance=0", () => {
    expect(supportLevelSchema.weightOf("sans-aide")).toBe(1);
    expect(supportLevelSchema.weightOf("guidance-physique-totale")).toBe(0);
    expect(supportLevelSchema.weightOf("non-observe")).toBeNull();
  });

  it("severity: faible=1 → très élevée=0 (higher is worse)", () => {
    expect(severitySchema.weightOf("faible")).toBe(1);
    expect(severitySchema.weightOf("tres-elevee")).toBe(0);
    expect(severitySchema.higherIsWorse).toBe(true);
  });

  it("findSchema roundtrips by id", () => {
    expect(findSchema("acquisition")?.name).toMatch(/Acquisition/);
    expect(findSchema("likert-1-5")?.name).toMatch(/Likert/);
    expect(findSchema("missing")).toBeUndefined();
  });

  it("schemas with an unobservedValue use a defined sentinel", () => {
    // Cast each schema individually to <string> so weightOf's
    // parameter doesn't narrow to `never` over the union.
    type Wide = import("@/lib/internship/score-set").ScoreSchema<string>;
    const wideSchemas: Wide[] = [
      acquisitionSchema as unknown as Wide,
      binaryYNSchema as unknown as Wide,
      frequencySchema as unknown as Wide,
      supportLevelSchema as unknown as Wide,
      severitySchema as unknown as Wide,
    ];
    for (const schema of wideSchemas) {
      expect(schema.unobservedValue).toBeDefined();
      expect(schema.weightOf(schema.unobservedValue!)).toBeNull();
    }
  });
});

// ────────────────────────────────────────────────────────────────
// Engine — newAdministration + scoreItem
// ────────────────────────────────────────────────────────────────

describe("score-set engine basics", () => {
  it("newScoreSetAdministration starts empty", () => {
    const a = newScoreSetAdministration<Likert5Value>({
      caseId: "c",
      templateId: SCORE_SET_RATING_ENGAGEMENT.id,
    });
    expect(a.results).toEqual({});
    expect(a.date.length).toBeGreaterThan(0);
  });

  it("scoreScoreSetItem records the value", () => {
    let list = [
      newScoreSetAdministration<Likert5Value>({
        caseId: "c",
        templateId: SCORE_SET_RATING_ENGAGEMENT.id,
      }),
    ];
    list = scoreScoreSetItem(list, list[0].id, "eng-r-initiation", "4", {
      note: "arrived focused",
    });
    expect(list[0].results["eng-r-initiation"].value).toBe("4");
    expect(list[0].results["eng-r-initiation"].note).toBe("arrived focused");
  });

  it("scoreScoreSetItem preserves an existing note when re-scoring", () => {
    let list: ScoreSetAdministration<Likert5Value>[] = [
      newScoreSetAdministration({
        caseId: "c",
        templateId: SCORE_SET_RATING_ENGAGEMENT.id,
      }),
    ];
    list = scoreScoreSetItem(list, list[0].id, "eng-r-initiation", "3", {
      note: "first observation",
    });
    list = scoreScoreSetItem(list, list[0].id, "eng-r-initiation", "5");
    expect(list[0].results["eng-r-initiation"].value).toBe("5");
    expect(list[0].results["eng-r-initiation"].note).toBe("first observation");
  });

  it("clearScoreSetItem removes the entry", () => {
    let list = [
      newScoreSetAdministration<Likert5Value>({
        caseId: "c",
        templateId: SCORE_SET_RATING_ENGAGEMENT.id,
      }),
    ];
    list = scoreScoreSetItem(list, list[0].id, "eng-r-initiation", "4");
    list = clearScoreSetItem(list, list[0].id, "eng-r-initiation");
    expect(list[0].results["eng-r-initiation"]).toBeUndefined();
  });

  it("patchScoreSetAdministration updates metadata", () => {
    let list = [
      newScoreSetAdministration<Likert5Value>({
        caseId: "c",
        templateId: SCORE_SET_RATING_ENGAGEMENT.id,
      }),
    ];
    list = patchScoreSetAdministration(list, list[0].id, {
      evaluator: "N. Mrini",
      context: "Atelier individuel",
    });
    expect(list[0].evaluator).toBe("N. Mrini");
    expect(list[0].context).toBe("Atelier individuel");
  });
});

// ────────────────────────────────────────────────────────────────
// Breakdowns — same math across schemas
// ────────────────────────────────────────────────────────────────

describe("scoreSetDomainBreakdown across schemas", () => {
  function scoreAllItems<TValue extends string>(
    tpl: ScoreSetDefinition<TValue>,
    value: TValue
  ): ScoreSetAdministration<TValue> {
    let admins = [
      newScoreSetAdministration<TValue>({
        caseId: "c",
        templateId: tpl.id,
      }),
    ];
    for (const d of tpl.domains) {
      for (const item of d.items) {
        admins = scoreScoreSetItem(admins, admins[0].id, item.id, value);
      }
    }
    return admins[0];
  }

  it("Likert 1-5 → every item at 5 = 100% acquisition / top", () => {
    const admin = scoreAllItems(SCORE_SET_RATING_ENGAGEMENT, "5");
    const breakdown = scoreSetBreakdown(admin, SCORE_SET_RATING_ENGAGEMENT);
    expect(breakdown.acquisitionPct).toBe(100);
    const domains = allScoreSetDomainBreakdowns(
      admin,
      SCORE_SET_RATING_ENGAGEMENT
    );
    for (const d of domains) expect(d.status).toBe("top");
  });

  it("Likert 1-5 → every item at 1 = 0% acquisition / low", () => {
    const admin = scoreAllItems(SCORE_SET_RATING_ENGAGEMENT, "1");
    const domains = allScoreSetDomainBreakdowns(
      admin,
      SCORE_SET_RATING_ENGAGEMENT
    );
    for (const d of domains) {
      expect(d.acquisitionPct).toBe(0);
      expect(d.status).toBe("low");
    }
  });

  it("Likert 1-5 → mid bucket lands in 'mid'", () => {
    const admin = scoreAllItems(SCORE_SET_RATING_ENGAGEMENT, "3");
    const domains = allScoreSetDomainBreakdowns(
      admin,
      SCORE_SET_RATING_ENGAGEMENT
    );
    // 3 = 0.5 → 50% acquisition → between midFloor 40 and topFloor 75.
    for (const d of domains) {
      expect(d.acquisitionPct).toBe(50);
      expect(d.status).toBe("mid");
    }
  });

  it("Severity (trigger log) → every item at 'faible' reads 100% (no triggers)", () => {
    const admin = scoreAllItems(SCORE_SET_TRIGGER_LOG, "faible");
    const breakdown = scoreSetBreakdown(admin, SCORE_SET_TRIGGER_LOG);
    expect(breakdown.acquisitionPct).toBe(100);
    expect(breakdown.observabilityPct).toBe(100);
  });

  it("Severity (trigger log) → unobserved items don't contribute to denominator", () => {
    const admin = scoreAllItems(SCORE_SET_TRIGGER_LOG, "non-observe");
    const breakdown = scoreSetBreakdown(admin, SCORE_SET_TRIGGER_LOG);
    expect(breakdown.observabilityPct).toBe(0);
  });

  it("Unknown domain → null", () => {
    const admin = newScoreSetAdministration<Likert5Value>({
      caseId: "c",
      templateId: SCORE_SET_RATING_ENGAGEMENT.id,
    });
    expect(
      scoreSetDomainBreakdown(admin, SCORE_SET_RATING_ENGAGEMENT, "missing")
    ).toBeNull();
  });
});

// ────────────────────────────────────────────────────────────────
// Suggestion engine on the new templates
// ────────────────────────────────────────────────────────────────

describe("suggestNextScoreSetKeys", () => {
  it("Likert engagement low → suggests engagement + tolérance follow-ups", () => {
    let admins = [
      newScoreSetAdministration<Likert5Value>({
        caseId: "c",
        templateId: SCORE_SET_RATING_ENGAGEMENT.id,
      }),
    ];
    for (const d of SCORE_SET_RATING_ENGAGEMENT.domains) {
      for (const item of d.items) {
        admins = scoreScoreSetItem(admins, admins[0].id, item.id, "1");
      }
    }
    const keys = suggestNextScoreSetKeys(
      admins[0],
      SCORE_SET_RATING_ENGAGEMENT
    );
    expect(keys).toContain("grille-engagement-tache");
    expect(keys).toContain("grille-tolerance-attente");
    expect(keys).toContain("grille-transitions-flexibilite");
  });

  it("Trigger log — sensory items at 'très élevée' fire sensory follow-ups", () => {
    // Severity schema: "tres-elevee" = weight 0 (worst), so the
    // domain drops to "low" and per-domain follow-ups fire.
    let admins: ScoreSetAdministration<import("@/lib/internship/score-set-schemas").SeverityValue>[] = [
      newScoreSetAdministration({
        caseId: "c",
        templateId: SCORE_SET_TRIGGER_LOG.id,
      }),
    ];
    for (const item of SCORE_SET_TRIGGER_LOG.domains[0].items) {
      admins = scoreScoreSetItem(
        admins,
        admins[0].id,
        item.id,
        "tres-elevee"
      );
    }
    const keys = suggestNextScoreSetKeys(admins[0], SCORE_SET_TRIGGER_LOG);
    expect(keys).toContain("grille-traitement-sensoriel");
  });
});

// ────────────────────────────────────────────────────────────────
// Compat: legacy ScorableGrid ⇄ ScoreSet
// ────────────────────────────────────────────────────────────────

describe("legacy compat adapters", () => {
  it("scorableGridToScoreSet preserves id, name, domains, items", () => {
    const ss = scorableGridToScoreSet(GRILLE_CAPACITES);
    expect(ss.id).toBe(GRILLE_CAPACITES.id);
    expect(ss.name).toBe(GRILLE_CAPACITES.name);
    expect(ss.schema.id).toBe("acquisition");
    expect(ss.domains.length).toBe(GRILLE_CAPACITES.domains.length);
    for (let i = 0; i < ss.domains.length; i++) {
      expect(ss.domains[i].items.length).toBe(
        GRILLE_CAPACITES.domains[i].items.length
      );
    }
  });

  it("scorableGridToScoreSet distributes legacy phrases into per-value bag", () => {
    const ss = scorableGridToScoreSet(GRILLE_CAPACITES);
    const item = ss.domains
      .flatMap((d) => d.items)
      .find((i) => i.id === "attention-prenom");
    expect(item?.phrases?.EC).toMatch(/orientation à l'appel du prénom/);
    expect(item?.phrases?.NA).toMatch(/orientation à l'appel du prénom/);
    expect(item?.phrases?.A).toMatch(/orientation à l'appel du prénom/);
  });

  it("scorableAdminToScoreSetAdmin roundtrips through the engine", () => {
    // Score a legacy admin
    let legacy = [
      newLegacyAdmin({
        caseId: "c",
        templateId: GRILLE_CAPACITES.id,
      }),
    ];
    legacy = scoreLegacyItem(legacy, legacy[0].id, "attention-prenom", "A");
    legacy = scoreLegacyItem(legacy, legacy[0].id, "attention-distracteurs", "EC");

    const ssTemplate = scorableGridToScoreSet(GRILLE_CAPACITES);
    const ssAdmin = scorableAdminToScoreSetAdmin(legacy[0]);

    expect(ssAdmin.results["attention-prenom"].value).toBe("A");
    expect(ssAdmin.results["attention-distracteurs"].value).toBe("EC");

    // The engine produces the same domain breakdown.
    const breakdown = scoreSetDomainBreakdown(
      ssAdmin as ScoreSetAdministration<AcquisitionValue>,
      ssTemplate,
      "attention-disponibilite"
    );
    expect(breakdown).not.toBeNull();
    // 1×A + 1×EC + 4×NO → observed=2, weight=1.5 → 75% acquisition
    expect(breakdown!.acquisitionPct).toBe(75);
  });

  it("scoreSetAdminToScorable returns null for non-acquisition schemas", () => {
    const ss = SCORE_SET_RATING_ENGAGEMENT;
    const admin = newScoreSetAdministration<Likert5Value>({
      caseId: "c",
      templateId: ss.id,
    });
    expect(
      scoreSetAdminToScorable(
        admin as ScoreSetAdministration<string>,
        ss as unknown as import("@/lib/internship/score-set").ScoreSetDefinition<string>
      )
    ).toBeNull();
  });

  it("scoreSetAdminToScorable roundtrips for acquisition schema", () => {
    const ssTemplate = scorableGridToScoreSet(GRILLE_CAPACITES);
    let admins = [
      newScoreSetAdministration<AcquisitionValue>({
        caseId: "c",
        templateId: ssTemplate.id,
      }),
    ];
    admins = scoreScoreSetItem(admins, admins[0].id, "attention-prenom", "A");
    const legacy = scoreSetAdminToScorable(
      admins[0] as ScoreSetAdministration<string>,
      ssTemplate as ScoreSetDefinition<string>
    );
    expect(legacy).not.toBeNull();
    expect(legacy!.scores["attention-prenom"].score).toBe("A");
  });
});

// ────────────────────────────────────────────────────────────────
// New templates ship + score end-to-end
// ────────────────────────────────────────────────────────────────

describe("new ScoreSet templates", () => {
  it("ships exactly two non-acquisition templates", () => {
    expect(SCORE_SET_TEMPLATES.length).toBe(2);
    expect(SCORE_SET_TEMPLATES[0].schema.id).toBe("likert-1-5");
    expect(SCORE_SET_TEMPLATES[1].schema.id).toBe("severity");
  });

  it("findScoreSetTemplate roundtrips both", () => {
    expect(findScoreSetTemplate("score-set-rating-engagement")?.name).toMatch(
      /Rating clinique/
    );
    expect(findScoreSetTemplate("score-set-trigger-log")?.name).toMatch(
      /Journal des déclencheurs/
    );
    expect(findScoreSetTemplate("missing")).toBeUndefined();
  });

  it("each new template has unique item ids", () => {
    for (const tpl of SCORE_SET_TEMPLATES) {
      const ids = tpl.domains.flatMap((d) => d.items.map((i) => i.id));
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it("Rating engagement scored on item-level phrases", () => {
    let admins: ScoreSetAdministration<Likert5Value>[] = [
      newScoreSetAdministration({
        caseId: "c",
        templateId: SCORE_SET_RATING_ENGAGEMENT.id,
      }),
    ];
    admins = scoreScoreSetItem(admins, admins[0].id, "eng-r-initiation", "5");
    // The template defines a phrase for value=5; we can read it directly.
    const item = SCORE_SET_RATING_ENGAGEMENT.domains
      .flatMap((d) => d.items)
      .find((i) => i.id === "eng-r-initiation");
    expect(item?.phrases?.["5"]).toMatch(/généralisée/);
  });

  it("Trigger log item phrase fires for 'très élevée'", () => {
    const item = SCORE_SET_TRIGGER_LOG.domains
      .flatMap((d) => d.items)
      .find((i) => i.id === "trig-bruit");
    expect(item?.phrases?.["tres-elevee"]).toMatch(/désorganisation/);
  });
});
