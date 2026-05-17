// Quote / excerpt bank — central store the transcript workspace,
// thesis writer, reports, formulations, and case desktops all pull
// from. Each quote can be tagged, themed, linked to a participant or
// case, and favourited.

import { generateId, nowISO } from "@/lib/store";

export type QuoteSource = "transcript" | "session" | "literature" | "manual";

export interface Quote {
  id: string;
  body: string;
  // Optional speaker or attribution.
  speaker?: string;
  source: QuoteSource;
  // Free-text reference (e.g. "Session 3 · 12:14", "Smith 2019 p.43").
  reference?: string;
  // Identifiers — used by drag-to-thesis-section and cross-surface joins.
  caseId?: string;
  transcriptId?: string;
  participantId?: string;
  // Theme + emotional tags reused across the app.
  themes: string[];
  emotionalTags: string[];
  // Free-text colour token (uses the existing quick-note palette ids).
  color?: "rose" | "sage" | "violet" | "amber" | "neutral";
  favourite: boolean;
  // Soft visibility flag — therapist may mark a quote as too sensitive
  // to include verbatim in reports.
  reportSafe: boolean;
  createdAt: string;
  updatedAt: string;
}

export const QUOTE_BANK_STORAGE_KEY = "psych-quote-bank-v1";

export function emptyQuote(overrides: Partial<Quote> = {}): Quote {
  const now = nowISO();
  return {
    id: generateId(),
    body: "",
    source: "manual",
    themes: [],
    emotionalTags: [],
    favourite: false,
    reportSafe: true,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

export function patch(q: Quote, p: Partial<Quote>): Quote {
  return { ...q, ...p, updatedAt: nowISO() };
}

// ─── Filters ───────────────────────────────────────────────────

export interface QuoteFilter {
  caseId?: string;
  transcriptId?: string;
  participantId?: string;
  theme?: string;
  emotionalTag?: string;
  favouriteOnly?: boolean;
  reportSafeOnly?: boolean;
  search?: string;
  source?: QuoteSource;
}

export function filterQuotes(quotes: Quote[], f: QuoteFilter = {}): Quote[] {
  const q = f.search?.trim().toLowerCase() ?? "";
  return quotes.filter((quote) => {
    if (f.caseId && quote.caseId !== f.caseId) return false;
    if (f.transcriptId && quote.transcriptId !== f.transcriptId) return false;
    if (f.participantId && quote.participantId !== f.participantId)
      return false;
    if (f.theme && !quote.themes.includes(f.theme)) return false;
    if (f.emotionalTag && !quote.emotionalTags.includes(f.emotionalTag))
      return false;
    if (f.favouriteOnly && !quote.favourite) return false;
    if (f.reportSafeOnly && !quote.reportSafe) return false;
    if (f.source && quote.source !== f.source) return false;
    if (q) {
      const hay =
        `${quote.body} ${quote.speaker ?? ""} ${quote.reference ?? ""} ` +
        `${quote.themes.join(" ")} ${quote.emotionalTags.join(" ")}`;
      if (!hay.toLowerCase().includes(q)) return false;
    }
    return true;
  });
}

// ─── Analytics ─────────────────────────────────────────────────

export function themeFrequency(quotes: Quote[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const q of quotes) {
    for (const t of q.themes) out[t] = (out[t] ?? 0) + 1;
  }
  return out;
}

export function topThemes(
  quotes: Quote[],
  limit: number = 8
): Array<{ theme: string; count: number }> {
  return Object.entries(themeFrequency(quotes))
    .map(([theme, count]) => ({ theme, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export function favourites(quotes: Quote[]): Quote[] {
  return quotes.filter((q) => q.favourite);
}

// ─── Cross-surface helpers ─────────────────────────────────────

// Returns quotes tagged with any of the requested themes — used when a
// thesis chapter or report section asks "what supporting quotes do we
// have for X / Y / Z?".
export function quotesByAnyTheme(quotes: Quote[], themes: string[]): Quote[] {
  if (themes.length === 0) return [];
  const set = new Set(themes);
  return quotes.filter((q) => q.themes.some((t) => set.has(t)));
}

// Promotes a transcript snippet into a quote (called when the user
// highlights text in the transcript editor).
export function fromTranscriptSnippet(opts: {
  transcriptId: string;
  body: string;
  caseId?: string;
  participantId?: string;
  speaker?: string;
  reference?: string;
}): Quote {
  return emptyQuote({
    body: opts.body.trim(),
    source: "transcript",
    transcriptId: opts.transcriptId,
    caseId: opts.caseId,
    participantId: opts.participantId,
    speaker: opts.speaker,
    reference: opts.reference,
  });
}
