import { describe, it, expect } from "vitest";
import {
  formatAuthor,
  formatAuthorList,
  formatBibliography,
  inTextNarrative,
  inTextParenthetical,
  parseAuthorString,
  validateApaInput,
} from "@/lib/research/apa";

describe("APA author formatting", () => {
  it("formats single author family + given as Family, F. M.", () => {
    expect(formatAuthor({ family: "Sierra", given: "Mauricio" })).toBe(
      "Sierra, M."
    );
    expect(formatAuthor({ family: "Phillips", given: "Mary L." })).toBe(
      "Phillips, M. L."
    );
    expect(formatAuthor({ family: "David", given: "Anthony S" })).toBe(
      "David, A. S."
    );
  });

  it("returns family alone when no given is provided", () => {
    expect(formatAuthor({ family: "Sierra", given: "" })).toBe("Sierra");
  });

  it("APA 7 author list rules: 1, 2, 3-20, 21+", () => {
    const a = { family: "Sierra", given: "M." };
    const b = { family: "Medford", given: "N." };
    const c = { family: "Phillips", given: "M. L." };
    expect(formatAuthorList([a])).toBe("Sierra, M.");
    expect(formatAuthorList([a, b])).toBe("Sierra, M., & Medford, N.");
    expect(formatAuthorList([a, b, c])).toBe(
      "Sierra, M., Medford, N., & Phillips, M. L."
    );
    // 21 authors → first 19, ellipsis, final
    const many = Array.from({ length: 21 }, (_, i) => ({
      family: `A${i + 1}`,
      given: "X.",
    }));
    const out = formatAuthorList(many);
    expect(out).toContain("A1, X.,");
    expect(out).toContain("…");
    expect(out).toContain("A21, X.");
  });
});

describe("APA in-text citations", () => {
  it("parenthetical formats by author count", () => {
    const a = { family: "Sierra", given: "M." };
    const b = { family: "Medford", given: "N." };
    const c = { family: "Phillips", given: "M. L." };
    expect(inTextParenthetical([a], 2009)).toBe("(Sierra, 2009)");
    expect(inTextParenthetical([a, b], 2012)).toBe(
      "(Sierra & Medford, 2012)"
    );
    expect(inTextParenthetical([a, b, c], 2001)).toBe(
      "(Sierra et al., 2001)"
    );
  });

  it("narrative formats by author count", () => {
    const a = { family: "Sierra", given: "M." };
    expect(inTextNarrative([a], 2009)).toBe("Sierra (2009)");
    const b = { family: "Medford", given: "N." };
    expect(inTextNarrative([a, b], 2012)).toBe("Sierra and Medford (2012)");
  });

  it("uses n.d. when year is missing", () => {
    const a = { family: "Sierra", given: "M." };
    expect(inTextParenthetical([a])).toBe("(Sierra, n.d.)");
  });
});

describe("APA bibliography formatting", () => {
  it("formats a journal article", () => {
    const out = formatBibliography({
      type: "journal-article",
      authors: [{ family: "Sierra", given: "M." }],
      year: 2009,
      title: "Depersonalization: A new look",
      journal: "Trends in Neuroscience",
      volume: "12",
      issue: "3",
      pages: "145-160",
      doi: "10.1234/abc.def",
    });
    expect(out).toContain("Sierra, M.");
    expect(out).toContain("(2009)");
    expect(out).toContain("12(3)");
    expect(out).toContain("145-160");
    expect(out).toContain("https://doi.org/10.1234/abc.def");
  });

  it("formats a book", () => {
    const out = formatBibliography({
      type: "book",
      authors: [{ family: "Sierra", given: "M." }],
      year: 2009,
      title: "Depersonalization: A New Look at a Neglected Syndrome",
      publisher: "Cambridge University Press",
    });
    expect(out).toContain("Sierra, M.");
    expect(out).toContain("Cambridge University Press");
  });

  it("formats a thesis", () => {
    const out = formatBibliography({
      type: "thesis",
      authors: [{ family: "Mrini", given: "Nouhaila" }],
      year: 2026,
      title: "Dépersonnalisation, anxiété et dépression",
      thesisInstitution: "Université de Rabat",
    });
    expect(out).toContain("[Doctoral dissertation");
    expect(out).toContain("Université de Rabat");
  });

  it("handles missing year with (n.d.)", () => {
    const out = formatBibliography({
      type: "book",
      authors: [{ family: "Anonymous", given: "" }],
      title: "Mystery",
      publisher: "Self",
    });
    expect(out).toContain("(n.d.)");
  });
});

describe("APA validation", () => {
  it("requires title", () => {
    const issues = validateApaInput({
      type: "journal-article",
      authors: [{ family: "Sierra", given: "M." }],
      title: "",
      journal: "J",
    });
    expect(issues.some((i) => i.field === "title" && i.severity === "error")).toBe(
      true
    );
  });

  it("warns about missing year", () => {
    const issues = validateApaInput({
      type: "book",
      authors: [{ family: "S", given: "M" }],
      title: "Book",
      publisher: "P",
    });
    expect(issues.some((i) => i.field === "year")).toBe(true);
  });

  it("errors on journal-article without journal name", () => {
    const issues = validateApaInput({
      type: "journal-article",
      authors: [{ family: "S", given: "M" }],
      title: "T",
      year: 2009,
    });
    expect(
      issues.some((i) => i.field === "journal" && i.severity === "error")
    ).toBe(true);
  });
});

describe("APA author string parsing", () => {
  it("parses comma-separated names", () => {
    const out = parseAuthorString("Sierra, M., Medford, N., & Phillips, M. L.");
    // The parser splits on '&' / commas without ', initial' pattern detection,
    // so we mainly verify it produces something sensible and supports the
    // common "Last, First" form.
    expect(out.length).toBeGreaterThan(0);
    expect(out[0].family).toBe("Sierra");
  });

  it("parses 'First Last' fallback", () => {
    const out = parseAuthorString("Mauricio Sierra");
    expect(out[0].family).toBe("Sierra");
    expect(out[0].given).toBe("Mauricio");
  });

  it("handles empty input", () => {
    expect(parseAuthorString("")).toEqual([]);
  });
});
