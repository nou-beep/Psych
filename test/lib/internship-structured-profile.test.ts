import { describe, it, expect } from "vitest";
import {
  patchStructuredProfile,
  profileCoverage,
  setProfileNote,
  type StructuredProfile,
} from "@/lib/internship/structured-profile";
import {
  generateProfileSummary,
  profileToReportBlock,
  suggestGridsFromProfile,
} from "@/lib/internship/structured-profile-text";

// ────────────────────────────────────────────────────────────────
// Mutations
// ────────────────────────────────────────────────────────────────

describe("patchStructuredProfile", () => {
  it("creates the domain entry when the profile starts empty", () => {
    const next = patchStructuredProfile(undefined, "communication", {
      verbalLevel: "non-verbal",
    });
    expect(next.communication?.verbalLevel).toBe("non-verbal");
  });

  it("merges into the existing domain bag without losing other fields", () => {
    const start: StructuredProfile = {
      communication: { verbalLevel: "isolated-words" },
    };
    const next = patchStructuredProfile(start, "communication", {
      comprehension: "simple-instructions",
    });
    expect(next.communication?.verbalLevel).toBe("isolated-words");
    expect(next.communication?.comprehension).toBe("simple-instructions");
  });

  it("handles every domain", () => {
    let p: StructuredProfile = {};
    p = patchStructuredProfile(p, "communication", { responseToName: "absent" });
    p = patchStructuredProfile(p, "social", { initiation: "rare" });
    p = patchStructuredProfile(p, "sensory", { auditory: "hyper" });
    p = patchStructuredProfile(p, "behavior", { intensity: "high" });
    p = patchStructuredProfile(p, "attention", { distractibility: "high" });
    p = patchStructuredProfile(p, "autonomy", { feeding: "partial-help" });
    expect(p.communication?.responseToName).toBe("absent");
    expect(p.social?.initiation).toBe("rare");
    expect(p.sensory?.auditory).toBe("hyper");
    expect(p.behavior?.intensity).toBe("high");
    expect(p.attention?.distractibility).toBe("high");
    expect(p.autonomy?.feeding).toBe("partial-help");
  });
});

describe("setProfileNote", () => {
  it("stores a per-domain note without touching the structured fields", () => {
    const start: StructuredProfile = {
      communication: { verbalLevel: "simple-phrases" },
    };
    const next = setProfileNote(start, "communication", "Notes cliniques.");
    expect(next.notes?.communication).toBe("Notes cliniques.");
    expect(next.communication?.verbalLevel).toBe("simple-phrases");
  });
});

// ────────────────────────────────────────────────────────────────
// Coverage
// ────────────────────────────────────────────────────────────────

describe("profileCoverage", () => {
  it("returns 0% on an empty profile", () => {
    expect(profileCoverage(undefined).pct).toBe(0);
    expect(profileCoverage({}).pct).toBe(0);
  });

  it("counts a filled single-select field", () => {
    expect(
      profileCoverage({
        communication: { verbalLevel: "simple-phrases" },
      }).filled
    ).toBe(1);
  });

  it("counts a non-empty multi-select as one filled slot", () => {
    expect(
      profileCoverage({
        communication: { expression: ["words", "gestures"] },
      }).filled
    ).toBe(1);
  });

  it("treats every fully-filled domain together as part of the same total", () => {
    const profile: StructuredProfile = {
      communication: {
        verbalLevel: "non-verbal",
        comprehension: "absent",
        expression: ["gestures"],
        requests: "absent",
        responseToName: "absent",
        eyeContact: "absent",
      },
      social: {
        initiation: "absent",
        responseToAdult: "absent",
        peerInteraction: "absent",
        jointAttention: "absent",
        turnTaking: "absent",
      },
    };
    const c = profileCoverage(profile);
    expect(c.filled).toBe(11);
    expect(c.total).toBe(32);
    expect(c.pct).toBe(Math.round((11 / 32) * 100));
  });
});

// ────────────────────────────────────────────────────────────────
// Summary generator
// ────────────────────────────────────────────────────────────────

describe("generateProfileSummary", () => {
  it("returns a placeholder when the profile is empty", () => {
    expect(generateProfileSummary(undefined).headline).toMatch(/non encore/);
    expect(generateProfileSummary({}).priorityDomains).toEqual([]);
  });

  it("renders the right French phrasing for non-verbal + absent comprehension", () => {
    const summary = generateProfileSummary({
      communication: {
        verbalLevel: "non-verbal",
        comprehension: "absent",
        responseToName: "absent",
      },
    });
    const communication = summary.perDomain.find(
      (d) => d.domain === "communication"
    );
    expect(communication?.paragraph).toMatch(/non verbal/i);
    expect(communication?.paragraph).toMatch(/compréhension verbale/i);
    expect(communication?.paragraph).toMatch(/réponse à l'appel du prénom/i);
  });

  it("describes hyperreactivity per modality in the sensory paragraph", () => {
    const summary = generateProfileSummary({
      sensory: { auditory: "hyper", tactile: "hyper", visual: "no-concern" },
    });
    const sensory = summary.perDomain.find((d) => d.domain === "sensory");
    expect(sensory?.paragraph).toMatch(/hyperréactivité sensorielle/i);
    expect(sensory?.paragraph).toMatch(/auditif/i);
    expect(sensory?.paragraph).toMatch(/tactile/i);
    // "no concern" modalities should not appear in the paragraph.
    expect(sensory?.paragraph).not.toMatch(/visuel/i);
  });

  it("marks communication and social as priority when both are weak", () => {
    const summary = generateProfileSummary({
      communication: {
        verbalLevel: "non-verbal",
        comprehension: "absent",
        responseToName: "absent",
        requests: "absent",
      },
      social: {
        initiation: "absent",
        responseToAdult: "absent",
        jointAttention: "absent",
        turnTaking: "absent",
      },
    });
    expect(summary.priorityDomains).toContain("communication");
    expect(summary.priorityDomains).toContain("social");
  });

  it("lists adapted / preserved domains under strengths", () => {
    const summary = generateProfileSummary({
      communication: {
        verbalLevel: "functional-phrases",
        comprehension: "adapted",
        responseToName: "consistent",
        requests: "generalized",
      },
    });
    expect(summary.strengths.toLowerCase()).toMatch(/communication/);
  });

  it("renders behaviour patterns + triggers when supplied", () => {
    const summary = generateProfileSummary({
      behavior: {
        mainBehaviors: ["agitation", "stereotypies"],
        triggers: ["transition", "noise"],
        intensity: "high",
        frequency: "frequent",
        functionHypothesis: "escape",
      },
    });
    const beh = summary.perDomain.find((d) => d.domain === "behavior");
    expect(beh?.paragraph).toMatch(/agitation/);
    expect(beh?.paragraph).toMatch(/transition/);
    expect(beh?.paragraph).toMatch(/élevée/i);
    expect(beh?.paragraph).toMatch(/échappement/i);
  });

  it("renders autonomy levels and ignores 'not-assessed'", () => {
    const summary = generateProfileSummary({
      autonomy: {
        feeding: "partial-help",
        toileting: "full-help",
        dressing: "not-assessed",
        routines: "needs-visual-support",
      },
    });
    const a = summary.perDomain.find((d) => d.domain === "autonomy");
    expect(a?.paragraph).toMatch(/autonomie au repas/i);
    expect(a?.paragraph).toMatch(/autonomie aux toilettes/i);
    // dressing was "not-assessed" — should be omitted.
    expect(a?.paragraph).not.toMatch(/autonomie à l'habillage/i);
    expect(a?.paragraph).toMatch(/support visuel/i);
  });
});

// ────────────────────────────────────────────────────────────────
// Suggestions
// ────────────────────────────────────────────────────────────────

describe("suggestGridsFromProfile", () => {
  it("returns nothing for an empty profile", () => {
    expect(suggestGridsFromProfile(undefined)).toEqual([]);
    expect(suggestGridsFromProfile({})).toEqual([]);
  });

  it("suggests communication grids when communication is weak", () => {
    const keys = suggestGridsFromProfile({
      communication: {
        verbalLevel: "non-verbal",
        comprehension: "absent",
        responseToName: "absent",
      },
    });
    expect(keys).toContain("grille-communication-receptive");
    expect(keys).toContain("grille-communication-expressive");
    expect(keys).toContain("grille-attention-conjointe");
  });

  it("suggests social interaction grid when social is weak", () => {
    const keys = suggestGridsFromProfile({
      social: {
        initiation: "absent",
        responseToAdult: "absent",
        jointAttention: "absent",
        turnTaking: "absent",
      },
    });
    expect(keys).toContain("grille-interaction-sociale");
  });

  it("suggests sensory + regulation grids when sensory hyperreactivity is present", () => {
    const keys = suggestGridsFromProfile({
      sensory: { auditory: "hyper", tactile: "hyper" },
    });
    expect(keys).toContain("grille-traitement-sensoriel");
    expect(keys).toContain("grille-regulation-emotionnelle");
  });

  it("suggests transitions/flexibility grid when behavior is high-frequency", () => {
    const keys = suggestGridsFromProfile({
      behavior: {
        mainBehaviors: ["agitation", "opposition"],
        frequency: "very-frequent",
        intensity: "high",
      },
    });
    expect(keys).toContain("grille-transitions-flexibilite");
  });

  it("suggests attention grid when attention is weak", () => {
    const keys = suggestGridsFromProfile({
      attention: {
        sittingTolerance: "absent",
        taskEngagement: "absent",
        distractibility: "high",
      },
    });
    expect(keys).toContain("grille-attention-soutenue");
  });

  it("suggests autonomy grid when autonomy needs help", () => {
    const keys = suggestGridsFromProfile({
      autonomy: {
        feeding: "full-help",
        toileting: "full-help",
        dressing: "partial-help",
        routines: "resistant",
      },
    });
    expect(keys).toContain("grille-autonomie-adaptation");
  });

  it("does not suggest grids for domains with 'no-concern' selections", () => {
    const keys = suggestGridsFromProfile({
      sensory: {
        auditory: "no-concern",
        visual: "no-concern",
        tactile: "no-concern",
      },
    });
    expect(keys).not.toContain("grille-traitement-sensoriel");
  });
});

// ────────────────────────────────────────────────────────────────
// Report block
// ────────────────────────────────────────────────────────────────

describe("profileToReportBlock", () => {
  it("returns the unfilled placeholder when nothing has been selected", () => {
    expect(profileToReportBlock(undefined)).toMatch(/non encore renseigné/);
    expect(profileToReportBlock({})).toMatch(/non encore renseigné/);
  });

  it("concatenates the headline + per-domain paragraphs + strengths/difficulties", () => {
    const block = profileToReportBlock({
      communication: {
        verbalLevel: "non-verbal",
        comprehension: "absent",
        responseToName: "absent",
        requests: "absent",
      },
    });
    expect(block).toMatch(/non verbal/i);
    expect(block).toMatch(/Communication/);
    expect(block).toMatch(/Forces|Difficultés/);
  });
});
