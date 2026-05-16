import { describe, it, expect } from "vitest";
import {
  CLINICAL_NOTE_TEMPLATES,
  FORMAL_PHRASES_FR,
  findTemplate,
} from "@/lib/clinical/note-templates";

describe("clinical note templates", () => {
  it("ships the 5 French templates requested in the spec", () => {
    const ids = CLINICAL_NOTE_TEMPLATES.map((t) => t.id);
    for (const id of [
      "obs-clinique",
      "compte-rendu",
      "synthese-psychopatho",
      "bilan-psy",
      "note-supervision",
    ]) {
      expect(ids).toContain(id);
    }
  });

  it("every template is French and has at least 4 sections", () => {
    for (const t of CLINICAL_NOTE_TEMPLATES) {
      expect(t.language).toBe("fr");
      expect(t.sections.length).toBeGreaterThanOrEqual(4);
    }
  });

  it("observation clinique includes the standard MSE-aligned sections", () => {
    const t = findTemplate("obs-clinique")!;
    const headings = t.sections.map((s) => s.heading);
    expect(headings).toContain("Présentation générale");
    expect(headings).toContain("Humeur et affect");
    expect(headings).toContain("Pensée");
    expect(headings).toContain("Hypothèses cliniques");
  });

  it("formal-phrase suggestions are referenced on at least one template section", () => {
    const found = CLINICAL_NOTE_TEMPLATES.some((t) =>
      t.sections.some((s) =>
        (s.suggestedPhrases ?? []).some((p) =>
          FORMAL_PHRASES_FR.includes(p as never)
        )
      )
    );
    expect(found).toBe(true);
  });

  it("findTemplate returns by id or undefined", () => {
    expect(findTemplate("note-supervision")?.title).toBe("Note de supervision");
    expect(findTemplate("nope")).toBeUndefined();
  });
});
