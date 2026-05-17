import { describe, it, expect } from "vitest";
import {
  addExcerpt,
  byTheme,
  currentlyReading,
  emptyItem,
  patch,
  removeExcerpt,
  searchLiterature,
  toRead,
  type LiteratureItem,
} from "@/lib/research/literature";

function item(overrides: Partial<LiteratureItem> = {}) {
  return emptyItem({
    title: "Depersonalization in adolescents",
    authors: "Smith & Jones",
    themes: ["dpdr"],
    ...overrides,
  });
}

describe("emptyItem", () => {
  it("starts as to-read with no excerpts", () => {
    const o = emptyItem();
    expect(o.status).toBe("to-read");
    expect(o.excerpts).toEqual([]);
    expect(o.pinnedReading).toBe(false);
  });
});

describe("patch", () => {
  it("merges and refreshes updatedAt", async () => {
    const o = emptyItem();
    await new Promise((r) => setTimeout(r, 3));
    const next = patch(o, { status: "reading", themes: ["dpdr"] });
    expect(next.status).toBe("reading");
    expect(next.themes).toEqual(["dpdr"]);
    expect(next.updatedAt).not.toBe(o.updatedAt);
  });
});

describe("excerpts", () => {
  it("addExcerpt ignores empty bodies", () => {
    const o = addExcerpt(emptyItem(), "  ");
    expect(o.excerpts).toEqual([]);
  });
  it("addExcerpt appends a new excerpt", () => {
    const o = addExcerpt(emptyItem(), "Lived experience of unreality", "p.43");
    expect(o.excerpts).toHaveLength(1);
    expect(o.excerpts[0].body).toBe("Lived experience of unreality");
    expect(o.excerpts[0].page).toBe("p.43");
  });
  it("removeExcerpt drops by id", () => {
    let o = addExcerpt(emptyItem(), "A");
    o = addExcerpt(o, "B");
    o = removeExcerpt(o, o.excerpts[0].id);
    expect(o.excerpts).toHaveLength(1);
  });
});

describe("reading list views", () => {
  const items: LiteratureItem[] = [
    item({ status: "reading" }),
    item({ status: "to-read" }),
    item({ status: "read" }),
    item({ pinnedReading: true, status: "skimmed" }),
  ];

  it("currentlyReading includes status=reading and pinnedReading", () => {
    expect(currentlyReading(items)).toHaveLength(2);
  });

  it("toRead picks the to-read pile only", () => {
    expect(toRead(items)).toHaveLength(1);
  });
});

describe("byTheme + search", () => {
  it("byTheme groups items by every theme they carry", () => {
    const grouped = byTheme([
      item({ themes: ["dpdr", "trauma"] }),
      item({ themes: ["dpdr"] }),
      item({ themes: ["other"] }),
    ]);
    expect(grouped.dpdr).toHaveLength(2);
    expect(grouped.trauma).toHaveLength(1);
  });
  it("searchLiterature matches title / authors / summary / themes", () => {
    const corpus = [
      item({ title: "Adolescents and DPDR", authors: "X" }),
      item({ title: "Trauma in adulthood", authors: "Y", themes: ["ptsd"] }),
    ];
    expect(searchLiterature(corpus, "ptsd")).toHaveLength(1);
    expect(searchLiterature(corpus, "adolescents")).toHaveLength(1);
    expect(searchLiterature(corpus, "")).toHaveLength(2);
  });
});
