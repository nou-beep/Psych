import { describe, it, expect } from "vitest";
import {
  addHighlight,
  addStickyNote,
  articlesByChapter,
  currentlyReading,
  favoriteArticles,
  guessFromFilename,
  newArticleRecord,
  patchArticle,
  removeHighlight,
  searchArticles,
} from "@/lib/research/article-library";

describe("article library", () => {
  it("creates an article record and flags incomplete metadata", () => {
    const a = newArticleRecord({ fileName: "paper.pdf" });
    expect(a.metadataIncomplete).toBe(true);
    expect(a.title).toBe("paper");
    expect(a.metadataNotes).toMatch(/Manual verification/);
  });

  it("does not fabricate authors", () => {
    const a = newArticleRecord({ fileName: "Sierra-2009-Depersonalization.pdf" });
    expect(a.authors).toEqual([]);
    expect(a.year).toBeUndefined();
  });

  it("clears incomplete flag when title, authors, year are all set", () => {
    const a = newArticleRecord({
      title: "Depersonalization",
      authors: [{ family: "Sierra", given: "M." }],
    });
    expect(a.metadataIncomplete).toBe(true); // year still missing
    const next = patchArticle([a], a.id, { year: 2009 });
    expect(next[0].metadataIncomplete).toBe(false);
    expect(next[0].metadataNotes).toBeUndefined();
  });

  it("adds and removes highlights", () => {
    let list = [newArticleRecord({ title: "Paper" })];
    const id = list[0].id;
    list = addHighlight(list, id, {
      text: "key claim",
      color: "yellow",
      linkedChapters: ["ch1"],
      linkedQuoteIds: [],
      linkedThemes: [],
    });
    expect(list[0].highlights).toHaveLength(1);
    expect(list[0].highlights[0].linkedChapters).toEqual(["ch1"]);
    list = removeHighlight(list, id, list[0].highlights[0].id);
    expect(list[0].highlights).toHaveLength(0);
  });

  it("adds sticky notes", () => {
    let list = [newArticleRecord({ title: "Paper" })];
    const id = list[0].id;
    list = addStickyNote(list, id, "  Look up p. 145  ", "145");
    expect(list[0].stickyNotes).toHaveLength(1);
    expect(list[0].stickyNotes[0].body).toBe("Look up p. 145");
    expect(list[0].stickyNotes[0].page).toBe("145");
    list = addStickyNote(list, id, "   ", undefined); // empty rejected
    expect(list[0].stickyNotes).toHaveLength(1);
  });

  it("views: currently-reading and favorites", () => {
    const a = newArticleRecord({ title: "A" });
    const b = { ...newArticleRecord({ title: "B" }), favorite: true } as const;
    const c = { ...newArticleRecord({ title: "C" }), status: "currently-reading" as const };
    const list = [a, b, c];
    expect(currentlyReading(list)).toHaveLength(1);
    expect(favoriteArticles(list)).toHaveLength(1);
  });

  it("groups by linked chapter", () => {
    const a = {
      ...newArticleRecord({ title: "A" }),
      linkedChapters: ["ch1", "ch2"],
    };
    const b = { ...newArticleRecord({ title: "B" }), linkedChapters: ["ch1"] };
    const map = articlesByChapter([a, b]);
    expect(map.ch1).toHaveLength(2);
    expect(map.ch2).toHaveLength(1);
  });

  it("searches across title, authors, journal, tags, DOI", () => {
    const a = newArticleRecord({
      title: "Depersonalization",
      authors: [{ family: "Sierra", given: "M." }],
    });
    a.journal = "Biological Psychiatry";
    a.tags = ["dpdr"];
    a.doi = "10.1234/x";
    const list = [a];
    expect(searchArticles(list, "sierra")).toHaveLength(1);
    expect(searchArticles(list, "biological")).toHaveLength(1);
    expect(searchArticles(list, "dpdr")).toHaveLength(1);
    expect(searchArticles(list, "10.1234")).toHaveLength(1);
    expect(searchArticles(list, "nope")).toHaveLength(0);
  });

  it("filename guess extracts year and uses dash as separator", () => {
    const g = guessFromFilename("Sierra-2009-Depersonalization.pdf");
    expect(g.year).toBe(2009);
    expect(g.authorGuess).toBe("Sierra");
    expect(g.title).toContain("Depersonalization");
  });

  it("filename guess returns title only when no separators", () => {
    const g = guessFromFilename("notes.pdf");
    expect(g.title).toBe("notes");
    expect(g.year).toBeUndefined();
  });
});
