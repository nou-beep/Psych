// Clinical Search Engine — pure cross-domain search over loaded data.
// The caller passes a Corpus; the helper returns ranked, categorised
// results. The UI handles persistence of recent searches and jump-to-source.

export type SearchKind =
  | "case"
  | "session"
  | "checkin"
  | "weekly-review"
  | "monthly-review"
  | "assessment"
  | "intervention"
  | "workbook"
  | "term"
  | "report"
  | "transcript"
  | "reflection"
  | "supervision"
  | "hypothesis"
  | "mse"
  | "thesis-note"
  | "disorder";

export interface SearchResult {
  id: string;
  kind: SearchKind;
  title: string;
  snippet: string;
  href?: string;
  date?: string;
  score: number;
  tags?: string[];
}

export interface Corpus {
  cases?: Array<{ id: string; code: string; shortNote?: string; context?: string; presentingConcerns?: string; tags?: string[] }>;
  sessions?: Array<{ id: string; caseId: string; date: string; topic?: string; observations?: string }>;
  checkIns?: Array<{ id: string; caseId: string; date: string; moodAffect?: string; freeNotes?: string }>;
  weeklyReviews?: Array<{ id: string; caseId: string; weekStart: string; mainProgress?: string }>;
  monthlyReviews?: Array<{ id: string; caseId: string; month: string; overallEvolution?: string }>;
  assessments?: Array<{ id: string; title: string; description?: string; tags?: string[] }>;
  interventions?: Array<{ id: string; name: string; description?: string; tags?: string[] }>;
  workbooks?: Array<{ id: string; title: string; microcopy?: string; tags?: string[] }>;
  terms?: Array<{ id: string; english: string; french?: string; arabic?: string; definition?: string; tags?: string[] }>;
  reports?: Array<{ id: string; title: string; createdAt: string }>;
  transcripts?: Array<{ id: string; title: string; content?: string; createdAt: string }>;
  reflections?: Array<{ id: string; date: string; whatLearned?: string; tags?: string[] }>;
  supervision?: Array<{ id: string; caseId: string; date: string; mainTopics?: string }>;
  hypotheses?: Array<{ id: string; caseId: string; title: string; rationale?: string }>;
  mse?: Array<{ id: string; caseId?: string; date: string; mood?: string; clinicianNotes?: string }>;
  thesisNotes?: Array<{ id: string; title: string; content: string; tags?: string[] }>;
  disorders?: Array<{ id: string; name: string; shortSummary: string; tags?: string[] }>;
}

const KIND_HREFS: Partial<Record<SearchKind, (id: string, extra: Record<string, string>) => string>> = {
  case: (id) => `/cases/${id}`,
  session: (id, e) => `/cases/${e.caseId}`,
  checkin: (id, e) => `/cases/${e.caseId}`,
  "weekly-review": (id, e) => `/cases/${e.caseId}`,
  "monthly-review": (id, e) => `/cases/${e.caseId}`,
  assessment: () => `/assessments`,
  intervention: () => `/clinical/interventions`,
  workbook: () => `/workbook`,
  term: () => `/dictionary`,
  report: () => `/reports/builder`,
  transcript: () => `/transcripts`,
  reflection: () => `/reflect`,
  supervision: () => `/supervision`,
  hypothesis: (id, e) => `/cases/${e.caseId}`,
  mse: (id, e) => (e.caseId ? `/cases/${e.caseId}` : `/clinical/mse`),
  "thesis-note": () => `/thesis`,
  disorder: () => `/clinical/disorders`,
};

function makeResult(
  kind: SearchKind,
  id: string,
  title: string,
  text: string | undefined,
  query: string,
  extra: Record<string, string> = {},
  date?: string,
  tags?: string[]
): SearchResult | null {
  const haystack = `${title} ${text ?? ""} ${(tags ?? []).join(" ")}`.toLowerCase();
  if (!haystack.includes(query)) return null;
  // Score: title matches weighted more.
  let score = 0;
  if (title.toLowerCase().includes(query)) score += 5;
  const occurrences = (haystack.match(new RegExp(escapeRegex(query), "g")) ?? []).length;
  score += Math.min(occurrences, 8);

  // Build a snippet around the first occurrence.
  let snippet = text ?? title;
  if (text) {
    const idx = text.toLowerCase().indexOf(query);
    if (idx >= 0) {
      const start = Math.max(0, idx - 30);
      const end = Math.min(text.length, idx + query.length + 60);
      snippet = (start > 0 ? "…" : "") + text.slice(start, end) + (end < text.length ? "…" : "");
    } else {
      snippet = text.slice(0, 120);
    }
  }

  const hrefBuilder = KIND_HREFS[kind];
  return {
    id,
    kind,
    title,
    snippet,
    score,
    date,
    href: hrefBuilder ? hrefBuilder(id, extra) : undefined,
    tags,
  };
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export interface SearchOptions {
  kinds?: SearchKind[]; // restrict to these kinds
  limit?: number;
}

export function searchCorpus(
  query: string,
  corpus: Corpus,
  opts: SearchOptions = {}
): SearchResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const enable = (k: SearchKind) =>
    !opts.kinds || opts.kinds.length === 0 || opts.kinds.includes(k);

  const out: SearchResult[] = [];

  if (enable("case")) {
    for (const c of corpus.cases ?? []) {
      const text = [c.shortNote, c.context, c.presentingConcerns].filter(Boolean).join(" — ");
      const r = makeResult("case", c.id, c.code, text, q, {}, undefined, c.tags);
      if (r) out.push(r);
    }
  }
  if (enable("session")) {
    for (const s of corpus.sessions ?? []) {
      const text = [s.topic, s.observations].filter(Boolean).join(" — ");
      const r = makeResult(
        "session",
        s.id,
        s.topic ? `Session: ${s.topic}` : `Session ${s.date}`,
        text,
        q,
        { caseId: s.caseId },
        s.date
      );
      if (r) out.push(r);
    }
  }
  if (enable("checkin")) {
    for (const c of corpus.checkIns ?? []) {
      const text = [c.moodAffect, c.freeNotes].filter(Boolean).join(" — ");
      const r = makeResult("checkin", c.id, `Check-in ${c.date}`, text, q, { caseId: c.caseId }, c.date);
      if (r) out.push(r);
    }
  }
  if (enable("weekly-review")) {
    for (const w of corpus.weeklyReviews ?? []) {
      const r = makeResult(
        "weekly-review",
        w.id,
        `Weekly review`,
        w.mainProgress,
        q,
        { caseId: w.caseId },
        w.weekStart
      );
      if (r) out.push(r);
    }
  }
  if (enable("monthly-review")) {
    for (const m of corpus.monthlyReviews ?? []) {
      const r = makeResult(
        "monthly-review",
        m.id,
        `Monthly review`,
        m.overallEvolution,
        q,
        { caseId: m.caseId },
        m.month
      );
      if (r) out.push(r);
    }
  }
  if (enable("assessment")) {
    for (const a of corpus.assessments ?? []) {
      const r = makeResult("assessment", a.id, a.title, a.description, q, {}, undefined, a.tags);
      if (r) out.push(r);
    }
  }
  if (enable("intervention")) {
    for (const i of corpus.interventions ?? []) {
      const r = makeResult("intervention", i.id, i.name, i.description, q, {}, undefined, i.tags);
      if (r) out.push(r);
    }
  }
  if (enable("workbook")) {
    for (const wb of corpus.workbooks ?? []) {
      const r = makeResult("workbook", wb.id, wb.title, wb.microcopy, q, {}, undefined, wb.tags);
      if (r) out.push(r);
    }
  }
  if (enable("term")) {
    for (const t of corpus.terms ?? []) {
      const text = [t.french, t.arabic, t.definition].filter(Boolean).join(" — ");
      const r = makeResult("term", t.id, t.english, text, q, {}, undefined, t.tags);
      if (r) out.push(r);
    }
  }
  if (enable("report")) {
    for (const r of corpus.reports ?? []) {
      const res = makeResult("report", r.id, r.title, undefined, q, {}, r.createdAt);
      if (res) out.push(res);
    }
  }
  if (enable("transcript")) {
    for (const t of corpus.transcripts ?? []) {
      const r = makeResult("transcript", t.id, t.title, t.content, q, {}, t.createdAt);
      if (r) out.push(r);
    }
  }
  if (enable("reflection")) {
    for (const r of corpus.reflections ?? []) {
      const res = makeResult(
        "reflection",
        r.id,
        `Reflection ${r.date}`,
        r.whatLearned,
        q,
        {},
        r.date,
        r.tags
      );
      if (res) out.push(res);
    }
  }
  if (enable("supervision")) {
    for (const s of corpus.supervision ?? []) {
      const r = makeResult(
        "supervision",
        s.id,
        `Supervision ${s.date}`,
        s.mainTopics,
        q,
        { caseId: s.caseId },
        s.date
      );
      if (r) out.push(r);
    }
  }
  if (enable("hypothesis")) {
    for (const h of corpus.hypotheses ?? []) {
      const r = makeResult("hypothesis", h.id, h.title, h.rationale, q, { caseId: h.caseId });
      if (r) out.push(r);
    }
  }
  if (enable("mse")) {
    for (const m of corpus.mse ?? []) {
      const r = makeResult(
        "mse",
        m.id,
        `MSE ${m.date}`,
        [m.mood, m.clinicianNotes].filter(Boolean).join(" — "),
        q,
        { caseId: m.caseId ?? "" },
        m.date
      );
      if (r) out.push(r);
    }
  }
  if (enable("thesis-note")) {
    for (const n of corpus.thesisNotes ?? []) {
      const r = makeResult("thesis-note", n.id, n.title, n.content, q, {}, undefined, n.tags);
      if (r) out.push(r);
    }
  }
  if (enable("disorder")) {
    for (const d of corpus.disorders ?? []) {
      const r = makeResult("disorder", d.id, d.name, d.shortSummary, q, {}, undefined, d.tags);
      if (r) out.push(r);
    }
  }

  out.sort((a, b) => b.score - a.score);
  return opts.limit ? out.slice(0, opts.limit) : out;
}

export function groupByKind(results: SearchResult[]): Record<SearchKind, SearchResult[]> {
  const out = {} as Record<SearchKind, SearchResult[]>;
  for (const r of results) {
    if (!out[r.kind]) out[r.kind] = [];
    out[r.kind].push(r);
  }
  return out;
}

export const KIND_LABELS: Record<SearchKind, string> = {
  case: "Cases",
  session: "Sessions",
  checkin: "Check-ins",
  "weekly-review": "Weekly reviews",
  "monthly-review": "Monthly reviews",
  assessment: "Assessments",
  intervention: "Interventions",
  workbook: "Workbooks",
  term: "Terminology",
  report: "Reports",
  transcript: "Transcripts",
  reflection: "Reflections",
  supervision: "Supervision",
  hypothesis: "Hypotheses",
  mse: "MSE entries",
  "thesis-note": "Thesis notes",
  disorder: "Disorders",
};
