import { describe, it, expect } from "vitest";
import {
  ACQUISITION_OPTIONS,
  CLINICAL_CONFIDENCE_OPTIONS,
  CONTEXT_OPTIONS,
  FREQUENCY_OPTIONS,
  INTENSITY_OPTIONS,
  RESPONSE_QUALITY_OPTIONS,
  SUPPORT_LEVEL_OPTIONS,
  labelOf,
  type Frequency,
  type Intensity,
  type ResponseQuality,
  type SupportLevel,
} from "@/components/ui/structured/options";
import {
  INTERVENTION_CHIPS,
  chipPhrase,
  findChip,
  generateInterventionParagraph,
  generateResponseParagraph,
  type InterventionChip,
} from "@/lib/internship/intervention-chips";

// ─────────────────────────────────────────────────────────────
// Standard option dictionaries
// ─────────────────────────────────────────────────────────────

describe("standard option dictionaries", () => {
  it("FREQUENCY_OPTIONS ships the five values in French ordered low→high", () => {
    const labels = FREQUENCY_OPTIONS.map((o) => o.label);
    expect(labels).toEqual([
      "Jamais",
      "Rarement",
      "Parfois",
      "Souvent",
      "Très souvent",
    ]);
  });

  it("INTENSITY_OPTIONS ships four ordered values", () => {
    const labels = INTENSITY_OPTIONS.map((o) => o.label);
    expect(labels).toEqual(["Faible", "Modérée", "Élevée", "Très élevée"]);
  });

  it("SUPPORT_LEVEL_OPTIONS covers the five-step support gradient", () => {
    expect(SUPPORT_LEVEL_OPTIONS.map((o) => o.value)).toEqual([
      "sans-aide",
      "aide-gestuelle",
      "aide-verbale",
      "guidance-physique-partielle",
      "guidance-physique-totale",
    ]);
  });

  it("ACQUISITION_OPTIONS matches the A/EC/NA/N-O scale", () => {
    expect(ACQUISITION_OPTIONS.map((o) => o.value)).toEqual([
      "acquis",
      "en-cours",
      "non-acquis",
      "non-observe",
    ]);
  });

  it("CLINICAL_CONFIDENCE_OPTIONS exposes 4 levels including 'à explorer'", () => {
    expect(CLINICAL_CONFIDENCE_OPTIONS.map((o) => o.label)).toContain(
      "À explorer"
    );
    expect(CLINICAL_CONFIDENCE_OPTIONS.length).toBe(4);
  });

  it("CONTEXT_OPTIONS includes the internship-specific contexts", () => {
    const labels = CONTEXT_OPTIONS.map((o) => o.label);
    expect(labels).toContain("Atelier individuel");
    expect(labels).toContain("Activité structurée");
    expect(labels).toContain("Récréation");
    expect(labels).toContain("Association");
  });

  it("RESPONSE_QUALITY_OPTIONS covers absente → généralisée", () => {
    expect(RESPONSE_QUALITY_OPTIONS.map((o) => o.value)).toEqual([
      "absente",
      "instable",
      "partielle",
      "adaptee",
      "generalisee",
    ]);
  });

  it("labelOf returns the matching label or empty string", () => {
    const v: Frequency = "souvent";
    expect(labelOf(FREQUENCY_OPTIONS, v)).toBe("Souvent");
    expect(labelOf(FREQUENCY_OPTIONS, undefined)).toBe("");
    // Unknown value falls back to the raw value (defensive).
    expect(
      labelOf(FREQUENCY_OPTIONS, "missing" as Frequency)
    ).toBe("missing");
  });

  it("labelOf typings cover every standard dictionary", () => {
    const i: Intensity = "elevee";
    const s: SupportLevel = "aide-verbale";
    const r: ResponseQuality = "adaptee";
    expect(labelOf(INTENSITY_OPTIONS, i)).toBe("Élevée");
    expect(labelOf(SUPPORT_LEVEL_OPTIONS, s)).toBe("Aide verbale");
    expect(labelOf(RESPONSE_QUALITY_OPTIONS, r)).toBe("Adaptée");
  });
});

// ─────────────────────────────────────────────────────────────
// Intervention chips
// ─────────────────────────────────────────────────────────────

describe("intervention chip library", () => {
  it("ships 22 chips across four groups", () => {
    expect(INTERVENTION_CHIPS.length).toBe(22);
    const groups = new Set(INTERVENTION_CHIPS.map((c) => c.group));
    expect(groups).toEqual(
      new Set(["communication", "soutien", "sensoriel-moteur", "social"])
    );
  });

  it("every chip carries a French label + a phrase fragment", () => {
    for (const c of INTERVENTION_CHIPS) {
      expect(c.label.length).toBeGreaterThan(0);
      expect(c.phrase.length).toBeGreaterThan(0);
    }
  });

  it("findChip + chipPhrase roundtrip", () => {
    expect(findChip("communication-fonctionnelle")?.group).toBe(
      "communication"
    );
    expect(chipPhrase("renforcement-positif")).toMatch(
      /renforcement positif/
    );
    expect(findChip("missing" as InterventionChip)).toBeUndefined();
  });

  it("chip values are unique across the library", () => {
    const values = INTERVENTION_CHIPS.map((c) => c.value);
    expect(new Set(values).size).toBe(values.length);
  });
});

// ─────────────────────────────────────────────────────────────
// Auto-generated text from chip selections
// ─────────────────────────────────────────────────────────────

describe("generateInterventionParagraph", () => {
  it("returns empty string when no chips are selected", () => {
    expect(generateInterventionParagraph([])).toBe("");
  });

  it("renders a singular phrase for one chip", () => {
    const text = generateInterventionParagraph([
      "communication-fonctionnelle",
    ]);
    expect(text).toMatch(/Intervention mobilisée/);
    expect(text).toMatch(/communication fonctionnelle/);
    expect(text).not.toMatch(/Interventions mobilisées/);
  });

  it("joins multiple chips with French connectors", () => {
    const text = generateInterventionParagraph([
      "communication-fonctionnelle",
      "supports-visuels",
      "renforcement-positif",
    ]);
    expect(text).toMatch(/Interventions mobilisées/);
    expect(text).toMatch(/communication fonctionnelle/);
    expect(text).toMatch(/supports visuels/);
    expect(text).toMatch(/et renforcement positif/);
  });
});

describe("generateResponseParagraph", () => {
  it("returns empty when no quality + no chips", () => {
    expect(generateResponseParagraph(undefined, [])).toBe("");
  });

  it("renders distinct French paragraphs per quality level", () => {
    expect(generateResponseParagraph("absente", [])).toMatch(
      /absente sur cette séance/
    );
    expect(generateResponseParagraph("instable", [])).toMatch(/instable/);
    expect(generateResponseParagraph("partielle", [])).toMatch(/partielle/);
    expect(generateResponseParagraph("adaptee", [])).toMatch(
      /adaptée, avec une bonne mobilisation/
    );
    expect(generateResponseParagraph("generalisee", [])).toMatch(
      /généralisé/
    );
  });

  it("adds a sensory-regulation note when the relevant chip is selected", () => {
    const text = generateResponseParagraph("partielle", [
      "regulation-sensorielle",
    ]);
    expect(text).toMatch(/stratégies de régulation sensorielle/);
  });

  it("adds a visual-support note for visual / sequencing chips", () => {
    const text = generateResponseParagraph("adaptee", ["supports-visuels"]);
    expect(text).toMatch(/supports visuels/);
  });

  it("adds the reinforcement note only when response is adaptee/generalisee", () => {
    const adapted = generateResponseParagraph("adaptee", [
      "renforcement-positif",
    ]);
    expect(adapted).toMatch(/renforcement positif/);
    const partial = generateResponseParagraph("partielle", [
      "renforcement-positif",
    ]);
    // No reinforcement closing note when response is only partial.
    expect(partial).not.toMatch(/renforcement positif/);
  });

  it("handles the chip-without-quality case gracefully", () => {
    const text = generateResponseParagraph(undefined, [
      "regulation-sensorielle",
    ]);
    // No opening line but the chip note may still appear; either way
    // the function must not throw.
    expect(typeof text).toBe("string");
  });
});
