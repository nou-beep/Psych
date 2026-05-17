import { describe, it, expect } from "vitest";
import {
  emptyQuote,
  filterQuotes,
  favourites,
  fromTranscriptSnippet,
  patch,
  quotesByAnyTheme,
  themeFrequency,
  topThemes,
  type Quote,
} from "@/lib/research/quote-bank";

function q(overrides: Partial<Quote> = {}) {
  return emptyQuote({
    body: "the world feels far away",
    themes: ["dpdr", "dissociation"],
    ...overrides,
  });
}

describe("emptyQuote defaults", () => {
  it("returns a report-safe, non-favourite manual quote", () => {
    const o = emptyQuote();
    expect(o.source).toBe("manual");
    expect(o.favourite).toBe(false);
    expect(o.reportSafe).toBe(true);
  });
});

describe("patch", () => {
  it("merges and updates updatedAt", async () => {
    const o = emptyQuote({ body: "x" });
    await new Promise((r) => setTimeout(r, 3));
    const next = patch(o, { body: "y", favourite: true });
    expect(next.body).toBe("y");
    expect(next.favourite).toBe(true);
    expect(next.updatedAt).not.toBe(o.updatedAt);
  });
});

describe("filterQuotes", () => {
  const corpus: Quote[] = [
    q({ caseId: "c1", themes: ["shame"], emotionalTags: ["heavy"] }),
    q({ caseId: "c1", themes: ["dpdr"], favourite: true, source: "transcript" }),
    q({ caseId: "c2", themes: ["dpdr"], reportSafe: false }),
    q({ body: "specific search phrase", themes: ["other"] }),
  ];

  it("filters by case", () => {
    expect(filterQuotes(corpus, { caseId: "c1" })).toHaveLength(2);
  });
  it("filters by theme", () => {
    expect(filterQuotes(corpus, { theme: "dpdr" })).toHaveLength(2);
  });
  it("filters by emotional tag", () => {
    expect(filterQuotes(corpus, { emotionalTag: "heavy" })).toHaveLength(1);
  });
  it("favouriteOnly + reportSafeOnly compose", () => {
    expect(filterQuotes(corpus, { favouriteOnly: true })).toHaveLength(1);
    expect(filterQuotes(corpus, { reportSafeOnly: true })).toHaveLength(3);
  });
  it("source filter narrows by quote origin", () => {
    expect(filterQuotes(corpus, { source: "transcript" })).toHaveLength(1);
  });
  it("search hits body and theme list", () => {
    expect(filterQuotes(corpus, { search: "specific" })).toHaveLength(1);
    expect(filterQuotes(corpus, { search: "shame" })).toHaveLength(1);
  });
});

describe("theme analysis", () => {
  it("themeFrequency counts per theme", () => {
    const freq = themeFrequency([
      q({ themes: ["dpdr", "shame"] }),
      q({ themes: ["dpdr"] }),
      q({ themes: ["other"] }),
    ]);
    expect(freq.dpdr).toBe(2);
    expect(freq.shame).toBe(1);
  });
  it("topThemes ranks descending and respects the limit", () => {
    const result = topThemes(
      [
        q({ themes: ["a", "b"] }),
        q({ themes: ["a"] }),
        q({ themes: ["c"] }),
      ],
      2
    );
    expect(result.map((r) => r.theme)).toEqual(["a", "b"]);
  });
});

describe("favourites + quotesByAnyTheme", () => {
  it("favourites picks favourited only", () => {
    expect(favourites([q({ favourite: true }), q()])).toHaveLength(1);
  });
  it("quotesByAnyTheme matches any theme intersection", () => {
    const result = quotesByAnyTheme(
      [q({ themes: ["a"] }), q({ themes: ["b"] }), q({ themes: ["c"] })],
      ["a", "c"]
    );
    expect(result).toHaveLength(2);
  });
});

describe("fromTranscriptSnippet", () => {
  it("creates a transcript-source quote with the right back-pointers", () => {
    const quote = fromTranscriptSnippet({
      transcriptId: "t1",
      body: "I feel far from myself",
      caseId: "c1",
      participantId: "p1",
      speaker: "Client",
      reference: "12:14",
    });
    expect(quote.source).toBe("transcript");
    expect(quote.transcriptId).toBe("t1");
    expect(quote.caseId).toBe("c1");
    expect(quote.participantId).toBe("p1");
    expect(quote.speaker).toBe("Client");
  });
});
