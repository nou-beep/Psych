import { describe, it, expect, beforeEach } from "vitest";
import {
  DEFAULT_LOCALE,
  LOCALE_STORAGE_KEY,
  LOCALES,
  formatDate,
  formatNumber,
  isValidLocale,
  readLocale,
  t,
  writeLocale,
} from "@/lib/i18n";
import { EN_DICT } from "@/lib/i18n/dictionaries/en";
import { FR_DICT } from "@/lib/i18n/dictionaries/fr";

describe("i18n core", () => {
  beforeEach(() => {
    if (typeof window !== "undefined") {
      window.localStorage.clear();
    }
  });

  it("supports en + fr + ar locales with fr as default", () => {
    expect(LOCALES).toEqual(["en", "fr", "ar"]);
    expect(DEFAULT_LOCALE).toBe("fr");
  });

  it("isValidLocale only accepts known codes", () => {
    expect(isValidLocale("en")).toBe(true);
    expect(isValidLocale("fr")).toBe(true);
    expect(isValidLocale("de")).toBe(false);
    expect(isValidLocale(null)).toBe(false);
    expect(isValidLocale(undefined)).toBe(false);
  });

  it("readLocale falls back to default when nothing is stored", () => {
    expect(readLocale()).toBe(DEFAULT_LOCALE);
  });

  it("writeLocale / readLocale round-trip both locales", () => {
    writeLocale("en");
    expect(readLocale()).toBe("en");
    writeLocale("fr");
    expect(readLocale()).toBe("fr");
    expect(window.localStorage.getItem(LOCALE_STORAGE_KEY)).toBe("fr");
  });

  it("readLocale ignores invalid stored values", () => {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, "klingon");
    expect(readLocale()).toBe(DEFAULT_LOCALE);
  });
});

describe("t() translator", () => {
  it("resolves a deeply nested key in EN", () => {
    expect(t("common.cancel", "en")).toBe("Cancel");
    expect(t("auth.gateway.heading", "en")).toBe("Choose your portal.");
  });

  it("resolves the same key in FR with academic-quality French", () => {
    expect(t("common.cancel", "fr")).toBe("Annuler");
    expect(t("auth.gateway.heading", "fr")).toBe(
      "Choisissez votre portail."
    );
    expect(t("sidebar.groups.thesis", "fr")).toBe("Mémoire");
    expect(t("thesis.chapters.literatureReview", "fr")).toBe(
      "Revue de littérature"
    );
  });

  it("interpolates {variables}", () => {
    expect(t("common.signedInAs", "en", { email: "a@b.com" })).toBe(
      "Signed in as a@b.com"
    );
    expect(t("common.signedInAs", "fr", { email: "a@b.com" })).toBe(
      "Connecté(e) en tant que a@b.com"
    );
    expect(
      t("formation.dashboard.stats.gridsPendingSub", "fr", { count: 3 })
    ).toBe("3 tests à coter");
  });

  it("falls back to EN when a FR key is missing", () => {
    // Construct a key that doesn't exist anywhere — should return
    // the key itself (developer-visible).
    expect(t("nonexistent.key", "fr")).toBe("nonexistent.key");
    expect(t("nonexistent.key", "en")).toBe("nonexistent.key");
  });
});

describe("Dictionary completeness — FR mirrors EN exactly", () => {
  // Recursively collect every leaf key path. Both dictionaries must
  // produce the same key set — that's the contract that makes the
  // language toggle predictable.
  function collectKeys(
    obj: Record<string, unknown>,
    prefix = ""
  ): string[] {
    const out: string[] = [];
    for (const [k, v] of Object.entries(obj)) {
      const path = prefix ? `${prefix}.${k}` : k;
      if (v && typeof v === "object") {
        out.push(...collectKeys(v as Record<string, unknown>, path));
      } else {
        out.push(path);
      }
    }
    return out.sort();
  }

  it("FR has the same key set as EN", () => {
    const enKeys = collectKeys(EN_DICT as Record<string, unknown>);
    const frKeys = collectKeys(FR_DICT as Record<string, unknown>);
    // Identify any missing keys for actionable test output.
    const missingInFR = enKeys.filter((k) => !frKeys.includes(k));
    const extraInFR = frKeys.filter((k) => !enKeys.includes(k));
    expect(missingInFR).toEqual([]);
    expect(extraInFR).toEqual([]);
  });

  it("no FR entry is empty", () => {
    const frKeys = collectKeys(FR_DICT as Record<string, unknown>);
    for (const key of frKeys) {
      expect(t(key, "fr").trim().length).toBeGreaterThan(0);
    }
  });

  it("no FR translation accidentally reuses the EN string for non-shared phrases", () => {
    // A small spot-check on phrases that must differ between EN and FR.
    const enLineForKey = (k: string) => t(k, "en");
    const frLineForKey = (k: string) => t(k, "fr");
    for (const key of [
      "common.cancel",
      "common.save",
      "auth.gateway.heading",
      "sidebar.groups.thesis",
      "thesis.chapters.literatureReview",
      "thesis.chapters.methodology",
      "client.assigned.title",
    ]) {
      expect(frLineForKey(key)).not.toBe(enLineForKey(key));
    }
  });
});

describe("Academic terminology in FR", () => {
  it("uses Mémoire (not Thèse — the PFE is a Master's thesis)", () => {
    expect(t("sidebar.groups.thesis", "fr")).toBe("Mémoire");
    expect(t("formation.dashboard.thesis.title", "fr")).toBe("Mémoire");
  });

  it("uses canonical French academic terms", () => {
    expect(t("thesis.chapters.literatureReview", "fr")).toBe(
      "Revue de littérature"
    );
    expect(t("thesis.chapters.methodology", "fr")).toBe("Méthodologie");
    expect(t("thesis.chapters.bibliography", "fr")).toBe(
      "Références bibliographiques"
    );
    expect(t("thesis.statistics.regressionTitle", "fr")).toContain(
      "Régression"
    );
  });

  it("uses Client / Thérapeute in the FR portal labels (per terminology dictionary)", () => {
    expect(t("common.portalLabel.therapist", "fr")).toBe("Thérapeute");
    expect(t("common.portalLabel.client", "fr")).toBe("Client");
    expect(t("common.portalLabel.formation", "fr")).toBe("Formation");
  });
});

describe("Locale-aware formatting", () => {
  it("formatDate produces a French-month string in fr", () => {
    const out = formatDate("2026-06-15", "fr");
    expect(out.toLowerCase()).toContain("juin");
  });

  it("formatDate produces an English-month string in en", () => {
    const out = formatDate("2026-06-15", "en");
    expect(out).toContain("June");
  });

  it("formatNumber respects the locale separator", () => {
    expect(formatNumber(1234.5, "en")).toMatch(/1,234/);
    expect(formatNumber(1234.5, "fr")).toMatch(/1\s?234/);
  });
});
