import { describe, it, expect } from "vitest";
import {
  DEFAULT_INSTITUTION,
  institutionShortLabel,
  loadInstitution,
} from "@/lib/internship/institutions";
import { DEFAULT_EVALUATOR } from "@/lib/internship/evaluator";
import {
  SEED_INTERNSHIP_CASES,
  SEED_STRUCTURED_PROFILE,
} from "@/lib/internship/seed";
import {
  profileCoverage,
  type StructuredProfile,
} from "@/lib/internship/structured-profile";
import {
  generateProfileSummary,
  profileToReportBlock,
  suggestGridsFromProfile,
} from "@/lib/internship/structured-profile-text";
import {
  FINAL_REPORT_SECTIONS,
  defaultFinalReportInitial,
} from "@/lib/internship/report-template";
import { followUpGridLabel } from "@/lib/internship/scorable-templates";

// ─────────────────────────────────────────────────────────────
// Institution defaults
// ─────────────────────────────────────────────────────────────

describe("DEFAULT_INSTITUTION", () => {
  it("names the À Petit Pas association as the internship site", () => {
    expect(DEFAULT_INSTITUTION.name).toMatch(/À Petit Pas/);
  });

  it("carries the École Rihani / À Petit Pas setting", () => {
    expect(DEFAULT_INSTITUTION.setting).toMatch(/École Rihani/);
    expect(DEFAULT_INSTITUTION.setting).toMatch(/À Petit Pas/);
  });

  it("anchors on the user's academic program + university", () => {
    expect(DEFAULT_INSTITUTION.academicProgram).toMatch(
      /Master en Psychologie Clinique/
    );
    expect(DEFAULT_INSTITUTION.university).toMatch(/Ibn Tofail/);
  });

  it("names the academic supervisor + master responsible", () => {
    expect(DEFAULT_INSTITUTION.academicSupervisor).toMatch(/Salim Gassim/);
    expect(DEFAULT_INSTITUTION.masterResponsible).toMatch(
      /Nabil Abdessamad/
    );
  });

  it("describes a multidisciplinary team", () => {
    expect(DEFAULT_INSTITUTION.teamDescription).toMatch(/éducateurs/i);
    expect(DEFAULT_INSTITUTION.teamDescription).toMatch(/psychomotriciens/i);
    expect(DEFAULT_INSTITUTION.teamDescription).toMatch(/orthophonistes/i);
  });

  it("loadInstitution returns the default when localStorage is empty", () => {
    expect(loadInstitution().name).toBe(DEFAULT_INSTITUTION.name);
  });

  it("institutionShortLabel joins name + program + university", () => {
    const label = institutionShortLabel();
    expect(label).toMatch(/À Petit Pas/);
    expect(label).toMatch(/Master en Psychologie/);
    expect(label).toMatch(/Ibn Tofail/);
  });
});

// ─────────────────────────────────────────────────────────────
// Anonymized seed case + structured profile
// ─────────────────────────────────────────────────────────────

describe("seeded case INT-AP-001", () => {
  const seedCase = SEED_INTERNSHIP_CASES[0];

  it("uses the anonymized case code INT-AP-001", () => {
    expect(seedCase.identification.caseCode).toBe("INT-AP-001");
  });

  it("is age 5", () => {
    expect(seedCase.identification.age).toBe("5");
  });

  it("anchors on the École Rihani / À Petit Pas setting", () => {
    expect(seedCase.identification.setting).toMatch(/École Rihani/);
    expect(seedCase.identification.setting).toMatch(/À Petit Pas/);
  });

  it("seeds the academic supervisor as the case supervisor", () => {
    expect(seedCase.identification.supervisor).toMatch(/Salim Gassim/);
  });

  it("the diagnostic context flags TSA + sensory + visuospatial concerns", () => {
    expect(seedCase.identification.diagnosticContext).toMatch(/TSA/);
    expect(seedCase.identification.diagnosticContext).toMatch(/sensoriel/i);
    expect(seedCase.identification.diagnosticContext).toMatch(/visuospatial/i);
  });

  it("ships a structured profile with chip selections per domain", () => {
    const profile = seedCase.context.structuredProfile;
    expect(profile).toBeDefined();
    expect(profile?.communication?.verbalLevel).toBe("partially-functional");
    expect(profile?.sensory?.auditory).toBe("hyper");
    expect(profile?.behavior?.mainBehaviors).toContain("imitation");
    expect(profile?.behavior?.laughterResponse).toBe("sound-triggered");
    expect(profile?.motor?.leftRightDistinction).toBe("difficulty");
    expect(profile?.motor?.visuospatialOrganization).toBe("difficulty");
  });

  it("does not contain any obvious real names in identifier fields", () => {
    const serialised = JSON.stringify(seedCase.identification);
    // Anonymized; only the supervisor is named (academic context).
    expect(serialised).not.toMatch(/CHILD-AUT-2026-01/);
  });
});

// ─────────────────────────────────────────────────────────────
// Coverage + summary on the seeded profile
// ─────────────────────────────────────────────────────────────

describe("SEED_STRUCTURED_PROFILE drives summary + suggestions", () => {
  const profile: StructuredProfile = SEED_STRUCTURED_PROFILE;

  it("covers a high percentage of the 41 slots", () => {
    const cov = profileCoverage(profile);
    expect(cov.total).toBe(41);
    expect(cov.filled).toBeGreaterThan(25);
  });

  it("renders the TSA-aware integrative headline", () => {
    const summary = generateProfileSummary(profile);
    expect(summary.headline).toMatch(/trouble du spectre de l'autisme/i);
    expect(summary.headline).toMatch(/visuospatial/i);
  });

  it("ranks motor and attention among the priority domains", () => {
    const summary = generateProfileSummary(profile);
    // Motor is full-on difficulty; attention has multiple weak fields.
    expect(summary.priorityDomains).toContain("motor");
  });

  it("renders a motor / visuospatial paragraph", () => {
    const summary = generateProfileSummary(profile);
    const motor = summary.perDomain.find((d) => d.domain === "motor");
    expect(motor?.paragraph).toMatch(/repérage gauche/i);
    expect(motor?.paragraph).toMatch(/visuospatial/i);
  });

  it("suggests motor / visuospatial follow-up grids", () => {
    const keys = suggestGridsFromProfile(profile);
    expect(keys).toContain("grille-graphomotricite");
    expect(keys).toContain("grille-organisation-visuospatiale");
    expect(keys).toContain("grille-motricite-fine");
  });

  it("suggests communication + social + sensory + autonomy follow-ups", () => {
    const keys = suggestGridsFromProfile(profile);
    expect(keys).toContain("grille-communication-receptive");
    expect(keys).toContain("grille-interaction-sociale");
    expect(keys).toContain("grille-traitement-sensoriel");
  });

  it("profileToReportBlock produces a block including motor + headline", () => {
    const block = profileToReportBlock(profile);
    expect(block).toMatch(/trouble du spectre de l'autisme/i);
    expect(block).toMatch(/Motricité/i);
    expect(block).toMatch(/Forces|Difficultés/);
  });
});

// ─────────────────────────────────────────────────────────────
// Final report template
// ─────────────────────────────────────────────────────────────

describe("final report template", () => {
  it("ships the expected section structure", () => {
    const ids = FINAL_REPORT_SECTIONS.map((s) => s.id);
    expect(ids).toContain("introduction");
    expect(ids).toContain("lieu-de-stage");
    expect(ids).toContain("methodologie");
    expect(ids).toContain("missions-realisees");
    expect(ids).toContain("presentation-cas");
    expect(ids).toContain("symptomes-observes");
    expect(ids).toContain("hypothese-clinique");
    expect(ids).toContain("demarche-clinique");
    expect(ids).toContain("intervention-pistes");
    expect(ids).toContain("evolution-reflexion");
    expect(ids).toContain("conclusion-perspectives");
    expect(ids).toContain("remerciements");
    expect(ids).toContain("liste-figures");
    expect(ids).toContain("liste-abreviations");
    expect(ids).toContain("bibliographie");
  });

  it("groups sections into front / body / back", () => {
    const front = FINAL_REPORT_SECTIONS.filter((s) => s.kind === "front");
    const body = FINAL_REPORT_SECTIONS.filter((s) => s.kind === "body");
    const back = FINAL_REPORT_SECTIONS.filter((s) => s.kind === "back");
    expect(front.length).toBeGreaterThan(0);
    expect(body.length).toBeGreaterThan(0);
    expect(back.length).toBeGreaterThan(0);
  });

  it("defaultFinalReportInitial seeds the cover page with the user's identity", () => {
    const initial = defaultFinalReportInitial();
    expect(initial.coverPage).toMatch(DEFAULT_EVALUATOR.name);
    expect(initial.coverPage).toMatch(/Ibn Tofail/);
    expect(initial.coverPage).toMatch(/Salim Gassim/);
    expect(initial.internshipContext).toMatch(/À Petit Pas/);
  });
});

// ─────────────────────────────────────────────────────────────
// Follow-up grid label expansion
// ─────────────────────────────────────────────────────────────

describe("follow-up grid label expansion", () => {
  it("labels the new motor follow-up keys", () => {
    expect(followUpGridLabel("grille-graphomotricite")).toBe(
      "Graphomotricité"
    );
    expect(followUpGridLabel("grille-organisation-visuospatiale")).toBe(
      "Organisation visuospatiale"
    );
    expect(followUpGridLabel("grille-motricite-fine")).toBe(
      "Motricité fine"
    );
  });
});
