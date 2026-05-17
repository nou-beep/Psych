"use client";
// Clinical Search — cross-domain search over all loaded data.

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Search as SearchIcon } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { SectionCard } from "@/components/shared/SectionCard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useApp } from "@/contexts/AppContext";
import { useClinical } from "@/contexts/ClinicalContext";
import { loadFromStorage } from "@/lib/store";
import { ASSESSMENT_LIBRARY } from "@/lib/clinical/assessments";
import { INTERVENTION_LIBRARY } from "@/lib/clinical/interventions-library";
import { DISORDER_REFERENCE } from "@/lib/clinical/disorders";
import { ALL_WORKBOOKS } from "@/lib/client/workbooks";
import {
  HYPOTHESIS_STORAGE_KEY,
  type ClinicalHypothesis,
} from "@/lib/clinical/hypothesis";
import { MSE_STORAGE_KEY, type MSEEntry } from "@/lib/clinical/mse";
import {
  KIND_LABELS,
  groupByKind,
  searchCorpus,
  type Corpus,
  type SearchKind,
  type SearchResult,
} from "@/lib/clinical/clinical-search";

const SEARCH_HISTORY_KEY = "psych-clinical-search-history-v1";

export default function ClinicalSearchPage() {
  const { cases, sessions, checkIns, weeklyReviews, monthlyReviews, supervisionNotes, transcripts } = useApp();
  const { reflections, terminology } = useClinical();
  const [query, setQuery] = useState("");
  const [enabledKinds, setEnabledKinds] = useState<Set<SearchKind> | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [hypotheses, setHypotheses] = useState<ClinicalHypothesis[]>([]);
  const [mseEntries, setMseEntries] = useState<MSEEntry[]>([]);

  useEffect(() => {
    setHistory(loadFromStorage<string[]>(SEARCH_HISTORY_KEY, []));
    setHypotheses(loadFromStorage<ClinicalHypothesis[]>(HYPOTHESIS_STORAGE_KEY, []));
    setMseEntries(loadFromStorage<MSEEntry[]>(MSE_STORAGE_KEY, []));
  }, []);

  const corpus = useMemo<Corpus>(
    () => ({
      cases: cases.map((c) => ({
        id: c.id,
        code: c.code,
        shortNote: c.shortNote,
        context: c.context,
        presentingConcerns: c.presentingConcerns,
        tags: c.tags,
      })),
      sessions: sessions.map((s) => ({
        id: s.id,
        caseId: s.caseId,
        date: s.date,
        topic: s.mainTopics,
        observations: s.observations,
      })),
      checkIns: checkIns.map((c) => ({
        id: c.id,
        caseId: c.caseId,
        date: c.date,
        moodAffect: c.moodAffect,
        freeNotes: c.freeNotes,
      })),
      weeklyReviews: weeklyReviews.map((w) => ({
        id: w.id,
        caseId: w.caseId,
        weekStart: w.weekStart,
        mainProgress: w.mainProgress,
      })),
      monthlyReviews: monthlyReviews.map((m) => ({
        id: m.id,
        caseId: m.caseId,
        month: m.month,
        overallEvolution: m.overallEvolution,
      })),
      assessments: ASSESSMENT_LIBRARY.map((a) => ({
        id: a.id,
        title: `${a.code} — ${a.title}`,
        description: a.description,
        tags: a.tags,
      })),
      interventions: INTERVENTION_LIBRARY.map((i) => ({
        id: i.id,
        name: i.name,
        description: i.description,
        tags: [...i.tags, ...i.indications],
      })),
      workbooks: ALL_WORKBOOKS.map((w) => ({
        id: w.id,
        title: w.title,
        microcopy: w.microcopy,
        tags: w.tags,
      })),
      terms: terminology.map((t) => ({
        id: t.id,
        english: t.english,
        french: t.french,
        arabic: t.arabic,
        definition: t.definition,
        tags: t.tags,
      })),
      transcripts: transcripts.map((t) => ({
        id: t.id,
        title: t.title,
        content: t.content,
        createdAt: t.createdAt,
      })),
      reflections: reflections.map((r) => ({
        id: r.id,
        date: r.date,
        whatLearned: r.whatLearned,
        tags: r.tags,
      })),
      supervision: supervisionNotes.map((s) => ({
        id: s.id,
        caseId: s.caseId,
        date: s.date,
        mainTopics: s.mainTopics,
      })),
      hypotheses: hypotheses.map((h) => ({
        id: h.id,
        caseId: h.caseId,
        title: h.title,
        rationale: h.rationale,
      })),
      mse: mseEntries.map((m) => ({
        id: m.id,
        caseId: m.caseId,
        date: m.date,
        mood: m.mood,
        clinicianNotes: m.clinicianNotes,
      })),
      disorders: DISORDER_REFERENCE.map((d) => ({
        id: d.id,
        name: d.name,
        shortSummary: d.shortSummary,
        tags: d.tags,
      })),
    }),
    [
      cases,
      sessions,
      checkIns,
      weeklyReviews,
      monthlyReviews,
      supervisionNotes,
      transcripts,
      reflections,
      terminology,
      hypotheses,
      mseEntries,
    ]
  );

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const opts =
      enabledKinds && enabledKinds.size > 0
        ? { kinds: Array.from(enabledKinds) }
        : undefined;
    return searchCorpus(query, corpus, opts);
  }, [query, corpus, enabledKinds]);

  const grouped = useMemo(() => groupByKind(results), [results]);

  function recordHistory(q: string) {
    const trimmed = q.trim();
    if (!trimmed) return;
    const next = [trimmed, ...history.filter((h) => h !== trimmed)].slice(0, 8);
    setHistory(next);
    try {
      window.localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(next));
    } catch {
      /* swallow quota */
    }
  }

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      <PageHeader
        title="Clinical search"
        subtitle="Cross-domain search across cases, sessions, assessments, interventions, terminology, reports, transcripts, and reference materials"
      />

      <SectionCard title="Search">
        <div className="flex items-center gap-2 mb-3">
          <SearchIcon size={16} style={{ color: "var(--psych-muted)" }} />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") recordHistory(query);
            }}
            placeholder="Search anything (e.g. 'anxiety', 'rumination', 'CASE-001')…"
          />
        </div>

        <div className="flex flex-wrap gap-1 mb-3">
          {(Object.keys(KIND_LABELS) as SearchKind[]).map((k) => {
            const active = enabledKinds === null || enabledKinds.has(k);
            return (
              <button
                key={k}
                onClick={() => {
                  setEnabledKinds((prev) => {
                    const current =
                      prev ?? new Set(Object.keys(KIND_LABELS) as SearchKind[]);
                    const next = new Set(current);
                    if (next.has(k)) next.delete(k);
                    else next.add(k);
                    return next;
                  });
                }}
                className="text-[11px] px-2 py-0.5 rounded-full border"
                style={{
                  borderColor: active ? "var(--psych-primary)" : "var(--psych-border)",
                  backgroundColor: active ? "var(--psych-primary-light)" : "transparent",
                  color: active ? "var(--psych-accent)" : "var(--psych-muted)",
                }}
              >
                {KIND_LABELS[k]}
              </button>
            );
          })}
        </div>

        {history.length > 0 && (
          <div className="mb-3">
            <Label className="text-xs">Recent</Label>
            <div className="flex flex-wrap gap-1 mt-1">
              {history.map((h) => (
                <button
                  key={h}
                  onClick={() => setQuery(h)}
                  className="text-xs px-2 py-0.5 rounded-full border"
                  style={{
                    borderColor: "var(--psych-border)",
                    color: "var(--psych-muted)",
                  }}
                >
                  {h}
                </button>
              ))}
            </div>
          </div>
        )}
      </SectionCard>

      {query.trim() && results.length === 0 && (
        <SectionCard title="No matches" className="mt-4">
          <p className="text-sm" style={{ color: "var(--psych-muted)" }}>
            Nothing matched <strong>{query}</strong>. Try adjusting the
            category filters or a shorter query.
          </p>
        </SectionCard>
      )}

      {Object.entries(grouped).map(([kind, items]) => (
        <SectionCard
          key={kind}
          title={KIND_LABELS[kind as SearchKind]}
          description={`${items.length} result(s)`}
          className="mt-4"
        >
          <ul className="space-y-2">
            {items.map((r: SearchResult) => (
              <li
                key={`${r.kind}-${r.id}`}
                className="rounded-xl border p-3"
                style={{ borderColor: "var(--psych-border)" }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p
                      className="text-sm font-medium"
                      style={{ color: "var(--psych-text)" }}
                    >
                      {r.title}
                    </p>
                    <p
                      className="text-xs mt-1"
                      style={{ color: "var(--psych-muted)" }}
                    >
                      {r.snippet}
                    </p>
                    {r.date && (
                      <p
                        className="text-[10px] font-mono mt-1"
                        style={{ color: "var(--psych-muted)" }}
                      >
                        {r.date}
                      </p>
                    )}
                  </div>
                  {r.href && (
                    <Link
                      href={r.href}
                      className="text-[11px]"
                      style={{ color: "var(--psych-primary)" }}
                    >
                      Open →
                    </Link>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </SectionCard>
      ))}
    </div>
  );
}
