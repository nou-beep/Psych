import { describe, it, expect } from "vitest";
import {
  CHAPTER_LABELS,
  CHAPTER_ORDER,
  addSection,
  countMarkers,
  emptyDocument,
  outline,
  removeSection,
  reorderSections,
  snapshotsFor,
  takeSnapshot,
  totalWordCount,
  updateSection,
  wordCountOf,
} from "@/lib/research/thesis-writer";

describe("chapter catalogue", () => {
  it("CHAPTER_ORDER matches the user-requested structure", () => {
    expect(CHAPTER_ORDER).toEqual([
      "introduction",
      "literature",
      "methodology",
      "results",
      "discussion",
      "conclusion",
      "references",
      "appendices",
    ]);
    for (const c of CHAPTER_ORDER) expect(CHAPTER_LABELS[c]).toBeTruthy();
  });
});

describe("emptyDocument", () => {
  it("creates every chapter with no sections", () => {
    const doc = emptyDocument();
    for (const id of CHAPTER_ORDER) {
      expect(doc.chapters[id].sections).toEqual([]);
      expect(doc.chapters[id].wordCount).toBe(0);
    }
  });
});

describe("section CRUD", () => {
  it("addSection appends a new section to the chapter", () => {
    let doc = emptyDocument();
    doc = addSection(doc, "introduction", "Background");
    expect(doc.chapters.introduction.sections).toHaveLength(1);
    expect(doc.chapters.introduction.sections[0].heading).toBe("Background");
  });

  it("updateSection patches and recomputes wordCount + markers", () => {
    let doc = emptyDocument();
    doc = addSection(doc, "results", "Section A");
    const id = doc.chapters.results.sections[0].id;
    doc = updateSection(doc, "results", id, {
      body: "Three findings emerged. [needs citation] More to follow.",
    });
    const section = doc.chapters.results.sections[0];
    expect(section.unresolvedMarkerCount).toBe(1);
    expect(doc.chapters.results.wordCount).toBe(wordCountOf(section.body));
  });

  it("removeSection drops the matching section", () => {
    let doc = emptyDocument();
    doc = addSection(doc, "results", "Section A");
    doc = addSection(doc, "results", "Section B");
    const id = doc.chapters.results.sections[0].id;
    doc = removeSection(doc, "results", id);
    expect(doc.chapters.results.sections).toHaveLength(1);
    expect(doc.chapters.results.sections[0].heading).toBe("Section B");
  });

  it("reorderSections moves sections within a chapter", () => {
    let doc = emptyDocument();
    doc = addSection(doc, "discussion", "A");
    doc = addSection(doc, "discussion", "B");
    doc = addSection(doc, "discussion", "C");
    doc = reorderSections(doc, "discussion", 0, 2);
    expect(doc.chapters.discussion.sections.map((s) => s.heading)).toEqual([
      "B",
      "C",
      "A",
    ]);
  });
});

describe("wordcount helpers", () => {
  it("wordCountOf handles empty + whitespace", () => {
    expect(wordCountOf("")).toBe(0);
    expect(wordCountOf("   ")).toBe(0);
    expect(wordCountOf("one two three")).toBe(3);
  });

  it("countMarkers finds bracketed flags case-insensitively", () => {
    expect(countMarkers("blah [needs citation] more [TK]")).toBe(2);
    expect(countMarkers("ok [unresolved] here")).toBe(1);
    expect(countMarkers("plain text")).toBe(0);
  });

  it("totalWordCount sums across chapters", () => {
    let doc = emptyDocument();
    doc = addSection(doc, "introduction", "h");
    const id = doc.chapters.introduction.sections[0].id;
    doc = updateSection(doc, "introduction", id, { body: "one two three" });
    expect(totalWordCount(doc)).toBe(3);
  });
});

describe("outline", () => {
  it("returns one entry per chapter with section meta", () => {
    let doc = emptyDocument();
    doc = addSection(doc, "results", "A");
    const id = doc.chapters.results.sections[0].id;
    doc = updateSection(doc, "results", id, {
      body: "one two [tk]",
      draft: false,
    });
    const out = outline(doc);
    expect(out).toHaveLength(CHAPTER_ORDER.length);
    const results = out.find((o) => o.chapterId === "results")!;
    expect(results.sections[0].wordCount).toBe(3);
    expect(results.sections[0].unresolvedMarkerCount).toBe(1);
    expect(results.sections[0].draft).toBe(false);
  });
});

describe("snapshots", () => {
  it("takeSnapshot freezes a copy of the document", () => {
    let doc = emptyDocument("Thesis A");
    doc = addSection(doc, "introduction", "Background");
    const snap = takeSnapshot(doc, "Before revisions");
    // Mutate the doc afterwards.
    doc = addSection(doc, "introduction", "Aim");
    expect(snap.document.chapters.introduction.sections).toHaveLength(1);
    expect(doc.chapters.introduction.sections).toHaveLength(2);
  });

  it("snapshotsFor filters by document id and sorts newest first", () => {
    const doc = emptyDocument("Thesis A");
    const a = takeSnapshot(doc, "a");
    const b = takeSnapshot(doc, "b");
    const c = takeSnapshot(emptyDocument("Other"), "c");
    const result = snapshotsFor([a, b, c], doc.id).map((s) => s.label);
    expect(result.sort()).toEqual(["a", "b"]);
  });
});
