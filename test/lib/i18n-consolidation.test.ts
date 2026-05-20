// Consolidation-pass assertions on top of test/lib/i18n.test.ts.
// Covers terminology consistency (Espace / Dossier / Rapport),
// Arabic locale scaffold, AR → FR fallback chain, and the
// EXPOSED_LOCALES contract.

import { describe, it, expect } from "vitest";
import {
  DEFAULT_LOCALE,
  EXPOSED_LOCALES,
  LOCALES,
  isValidLocale,
  t,
} from "@/lib/i18n";
import { AR_DICT } from "@/lib/i18n/dictionaries/ar";
import { FR_DICT } from "@/lib/i18n/dictionaries/fr";

describe("Locale registry", () => {
  it("declares en, fr and the ar scaffold", () => {
    expect(LOCALES).toEqual(["en", "fr", "ar"]);
    expect(isValidLocale("ar")).toBe(true);
    expect(isValidLocale("de")).toBe(false);
  });

  it("default locale stays French", () => {
    expect(DEFAULT_LOCALE).toBe("fr");
  });

  it("Arabic is NOT exposed in the toggle yet", () => {
    expect(EXPOSED_LOCALES).toEqual(["en", "fr"]);
    expect(EXPOSED_LOCALES).not.toContain("ar");
  });
});

describe("Arabic fallback chain", () => {
  it("AR falls back to FR before EN (Maghreb context)", () => {
    // Since AR_DICT mirrors FR_DICT, the AR translation is the FR string.
    expect(t("sidebar.groups.thesis", "ar")).toBe("Mémoire");
    expect(t("common.cancel", "ar")).toBe("Annuler");
  });

  it("AR uses the FR portal label scaffolding", () => {
    expect(t("common.portalLabel.therapist", "ar")).toBe("Thérapeute");
  });

  it("AR dictionary is structurally non-empty", () => {
    expect(Object.keys(AR_DICT).length).toBeGreaterThan(0);
  });

  it("AR_DICT === FR_DICT until proper translations land", () => {
    // The scaffold contract: re-export FR_DICT as-is.
    expect(AR_DICT).toBe(FR_DICT);
  });
});

describe("Terminology consistency in FR", () => {
  it("uses Espace, not Portail, for portal cards", () => {
    expect(t("auth.gateway.formation.title", "fr")).toBe("Espace Formation");
    expect(t("auth.gateway.therapist.title", "fr")).toBe(
      "Espace Thérapeute"
    );
    expect(t("auth.gateway.client.title", "fr")).toBe("Espace Client");
  });

  it("uses Rapport(s), not Compte rendu, throughout", () => {
    expect(t("sidebar.items.reports", "fr")).toBe("Rapports");
    expect(t("therapist.dashboard.quickActions.report", "fr")).toBe(
      "Rapport"
    );
    expect(t("internship.reports.title", "fr")).toBe("Rapports de stage");
    expect(t("formation.dashboard.stats.reportsToFinalize", "fr")).toBe(
      "Rapports à finaliser"
    );
  });

  it("keeps Mémoire (not Thèse) for Master's-level work", () => {
    expect(t("sidebar.groups.thesis", "fr")).toBe("Mémoire");
  });

  it("uses Dossier(s) for cases", () => {
    expect(t("sidebar.items.cases", "fr")).toBe("Dossiers");
    expect(t("sidebar.items.internshipCases", "fr")).toBe("Dossiers");
  });

  it("uses Grille for grids and Évaluation for assessments", () => {
    expect(t("sidebar.items.testsGrids", "fr")).toBe("Tests & grilles");
    expect(t("sidebar.items.assessments", "fr")).toBe("Évaluations");
  });

  it("uses Fiche de travail for worksheets", () => {
    expect(t("sidebar.items.worksheets", "fr")).toBe("Fiches de travail");
  });

  it("uses Transcriptions for transcripts", () => {
    expect(t("sidebar.items.transcripts", "fr")).toBe("Transcriptions");
  });

  it("uses Paramètres for settings, Imprimer/Exporter implied via existing actions", () => {
    expect(t("sidebar.items.settings", "fr")).toBe("Paramètres");
    expect(t("common.settings", "fr")).toBe("Paramètres");
  });
});

describe("Portal label terminology — Espace Client (not Patient)", () => {
  it("FR uses Client for the portal label", () => {
    expect(t("common.portalLabel.client", "fr")).toBe("Client");
  });

  it("FR signin label uses 'en tant que client(e)'", () => {
    expect(t("auth.gateway.client.cta", "fr")).toContain("client");
  });
});
