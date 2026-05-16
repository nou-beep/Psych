import { describe, it, expect } from "vitest";
import {
  addCode,
  addExcerpt,
  addTheme,
  assignCodeToTheme,
  codeFrequency,
  emptyProject,
  quotesByTag,
  removeCode,
  thematicTable,
  toggleCodeOnExcerpt,
  toggleSupervisionFlag,
} from "@/lib/clinical/thematic";

function seeded() {
  let p = emptyProject();
  p = addTheme(p, "Self-criticism");
  p = addCode(p, "harsh inner voice");
  p = addCode(p, "perfectionism");
  // Assign codes to theme.
  const themeId = p.themes[0].id;
  p = assignCodeToTheme(p, p.codes[0].id, themeId);
  p = assignCodeToTheme(p, p.codes[1].id, themeId);

  // Two excerpts referencing those codes.
  p = addExcerpt(p, {
    transcriptId: "t1",
    start: 0,
    end: 20,
    text: "Quote one",
    codeIds: [p.codes[0].id],
    emotionalTags: ["shame"],
    symptomTags: [],
    supervisionFlagged: false,
  });
  p = addExcerpt(p, {
    transcriptId: "t1",
    start: 30,
    end: 50,
    text: "Quote two",
    codeIds: [p.codes[0].id, p.codes[1].id],
    emotionalTags: [],
    symptomTags: ["depression"],
    supervisionFlagged: false,
  });
  return p;
}

describe("thematic project", () => {
  it("addCode and addTheme grow the project", () => {
    const p = seeded();
    expect(p.codes).toHaveLength(2);
    expect(p.themes).toHaveLength(1);
  });

  it("assignCodeToTheme moves a code's parent theme", () => {
    let p = seeded();
    p = addTheme(p, "Other theme");
    const otherId = p.themes[1].id;
    p = assignCodeToTheme(p, p.codes[0].id, otherId);
    expect(p.codes[0].parentThemeId).toBe(otherId);
    expect(p.themes[0].codeIds).not.toContain(p.codes[0].id);
    expect(p.themes[1].codeIds).toContain(p.codes[0].id);
  });

  it("removeCode strips it from themes and excerpts", () => {
    let p = seeded();
    const targetId = p.codes[0].id;
    p = removeCode(p, targetId);
    expect(p.codes.find((c) => c.id === targetId)).toBeUndefined();
    for (const t of p.themes) expect(t.codeIds).not.toContain(targetId);
    for (const e of p.excerpts) expect(e.codeIds).not.toContain(targetId);
  });

  it("toggleCodeOnExcerpt flips inclusion", () => {
    let p = seeded();
    const codeId = p.codes[1].id;
    // addExcerpt prepends; excerpts[0] is the second added ("Quote two")
    // which has both codes assigned in the seed helper.
    const exId = p.excerpts[0].id;
    expect(p.excerpts.find((e) => e.id === exId)?.codeIds).toContain(codeId);
    p = toggleCodeOnExcerpt(p, exId, codeId);
    expect(p.excerpts.find((e) => e.id === exId)?.codeIds).not.toContain(codeId);
  });

  it("toggleSupervisionFlag flips the supervision flag", () => {
    let p = seeded();
    const exId = p.excerpts[0].id;
    p = toggleSupervisionFlag(p, exId);
    expect(p.excerpts.find((e) => e.id === exId)?.supervisionFlagged).toBe(true);
  });
});

describe("codeFrequency", () => {
  it("counts and ranks by occurrence", () => {
    const rows = codeFrequency(seeded());
    expect(rows[0].label).toBe("harsh inner voice");
    expect(rows[0].count).toBe(2);
    expect(rows[1].count).toBe(1);
  });

  it("returns empty list when no excerpts are coded", () => {
    let p = emptyProject();
    p = addCode(p, "x");
    expect(codeFrequency(p)).toEqual([]);
  });
});

describe("thematicTable", () => {
  it("rolls up code counts per theme with a representative quote", () => {
    const table = thematicTable(seeded());
    expect(table).toHaveLength(1);
    const row = table[0];
    expect(row.themeLabel).toBe("Self-criticism");
    expect(row.excerptCount).toBe(2);
    expect(row.codes.map((c) => c.label)).toEqual(
      expect.arrayContaining(["harsh inner voice", "perfectionism"])
    );
    expect(row.representativeQuote).toBeTruthy();
  });
});

describe("quotesByTag", () => {
  it("filters by emotional tag", () => {
    expect(quotesByTag(seeded(), { emotional: "shame" })).toHaveLength(1);
  });
  it("filters by symptom tag", () => {
    expect(quotesByTag(seeded(), { symptom: "depression" })).toHaveLength(1);
  });
});
