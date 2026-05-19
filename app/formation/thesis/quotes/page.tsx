"use client";
// Quote / excerpt bank — central store transcripts, reports, thesis,
// and case desktops pull from. CRUD + theme/case filters + favourites.

import { useEffect, useMemo, useState } from "react";
import { Heart, Plus, Trash2, Star } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { SectionCard } from "@/components/shared/SectionCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useApp } from "@/contexts/AppContext";
import { useToast } from "@/components/ui/Toast";
import { loadFromStorage, saveToStorage } from "@/lib/store";
import {
  QUOTE_BANK_STORAGE_KEY,
  emptyQuote,
  filterQuotes,
  patch,
  topThemes,
  type Quote,
  type QuoteSource,
} from "@/lib/research/quote-bank";

const COLOR_TINTS: Record<NonNullable<Quote["color"]>, string> = {
  rose: "rgba(199,125,170,0.14)",
  sage: "rgba(110,138,123,0.14)",
  violet: "rgba(152,130,192,0.16)",
  amber: "rgba(198,140,88,0.14)",
  neutral: "rgba(120,120,140,0.12)",
};

export default function QuoteBankPage() {
  const { cases, transcripts } = useApp();
  const { toast } = useToast();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [editing, setEditing] = useState<Quote | null>(null);
  const [search, setSearch] = useState("");
  const [filterCase, setFilterCase] = useState("");
  const [filterTheme, setFilterTheme] = useState("");
  const [favOnly, setFavOnly] = useState(false);

  useEffect(() => {
    try {
      const stored = loadFromStorage<unknown>(QUOTE_BANK_STORAGE_KEY, []);
      setQuotes(Array.isArray(stored) ? (stored as Quote[]) : []);
    } catch {
      setQuotes([]);
    }
  }, []);

  function persist(next: Quote[]) {
    setQuotes(next);
    saveToStorage(QUOTE_BANK_STORAGE_KEY, next);
  }

  function newQuote() {
    const q = emptyQuote();
    setEditing(q);
  }

  function saveEditing() {
    if (!editing || !editing.body.trim()) {
      setEditing(null);
      return;
    }
    const exists = quotes.some((q) => q.id === editing.id);
    persist(exists ? quotes.map((q) => (q.id === editing.id ? editing : q)) : [editing, ...quotes]);
    setEditing(null);
    toast("Quote saved", "success");
  }

  function remove(id: string) {
    persist(quotes.filter((q) => q.id !== id));
  }

  function toggleFav(id: string) {
    persist(
      quotes.map((q) => (q.id === id ? patch(q, { favourite: !q.favourite }) : q))
    );
  }

  const visible = useMemo(
    () =>
      filterQuotes(quotes, {
        search,
        caseId: filterCase || undefined,
        theme: filterTheme || undefined,
        favouriteOnly: favOnly,
      }),
    [quotes, search, filterCase, filterTheme, favOnly]
  );

  const themeCounts = useMemo(() => topThemes(quotes, 12), [quotes]);

  return (
    <div className="max-w-6xl mx-auto animate-fade-in" data-section="thesis">
      <PageHeader
        title="Quote bank"
        subtitle="Participant quotes, transcript excerpts, recurring phrases — the shared pool for transcripts, reports, and the thesis writer."
        action={
          <Button onClick={newQuote} size="sm">
            <Plus size={13} /> New quote
          </Button>
        }
      />

      {/* Filters */}
      <div
        className="rounded-2xl border p-3 mb-4"
        style={{
          background: "var(--psych-card)",
          borderColor: "var(--psych-border)",
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="md:col-span-2">
            <Label className="text-xs">Search</Label>
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Find a quote, theme, or speaker…"
            />
          </div>
          <div>
            <Label className="text-xs">Case</Label>
            <Select
              value={filterCase}
              onChange={(e) => setFilterCase(e.target.value)}
            >
              <option value="">All cases</option>
              {cases
                .filter((c) => !c.isArchived)
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code}
                  </option>
                ))}
            </Select>
          </div>
          <div>
            <Label className="text-xs">Theme</Label>
            <Select
              value={filterTheme}
              onChange={(e) => setFilterTheme(e.target.value)}
            >
              <option value="">Any theme</option>
              {themeCounts.map((t) => (
                <option key={t.theme} value={t.theme}>
                  {t.theme} ({t.count})
                </option>
              ))}
            </Select>
          </div>
        </div>
        <label
          className="text-xs inline-flex items-center gap-2 mt-3"
          style={{ color: "var(--psych-muted)" }}
        >
          <input
            type="checkbox"
            checked={favOnly}
            onChange={(e) => setFavOnly(e.target.checked)}
          />
          Favourites only
        </label>
      </div>

      {/* Editor */}
      {editing && (
        <SectionCard
          title="Quote editor"
          description="Tag liberally — themes feed the thesis writer and the threads explorer."
          className="mb-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="md:col-span-2">
              <Label className="text-xs">Quote body</Label>
              <Textarea
                value={editing.body}
                onChange={(e) =>
                  setEditing(patch(editing, { body: e.target.value }))
                }
                placeholder="“Sometimes I feel like I'm watching myself from far away.”"
                className="min-h-[80px]"
              />
            </div>
            <div>
              <Label className="text-xs">Speaker (optional)</Label>
              <Input
                value={editing.speaker ?? ""}
                onChange={(e) =>
                  setEditing(patch(editing, { speaker: e.target.value }))
                }
                placeholder="Client / Participant / author"
              />
            </div>
            <div>
              <Label className="text-xs">Reference</Label>
              <Input
                value={editing.reference ?? ""}
                onChange={(e) =>
                  setEditing(patch(editing, { reference: e.target.value }))
                }
                placeholder="e.g. Session 3 · 12:14 — or Smith 2019 p.43"
              />
            </div>
            <div>
              <Label className="text-xs">Source</Label>
              <Select
                value={editing.source}
                onChange={(e) =>
                  setEditing(
                    patch(editing, { source: e.target.value as QuoteSource })
                  )
                }
              >
                <option value="transcript">Transcript</option>
                <option value="session">Session</option>
                <option value="literature">Literature</option>
                <option value="manual">Manual entry</option>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Case</Label>
              <Select
                value={editing.caseId ?? ""}
                onChange={(e) =>
                  setEditing(
                    patch(editing, { caseId: e.target.value || undefined })
                  )
                }
              >
                <option value="">(none)</option>
                {cases
                  .filter((c) => !c.isArchived)
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code}
                    </option>
                  ))}
              </Select>
            </div>
            <div>
              <Label className="text-xs">Transcript</Label>
              <Select
                value={editing.transcriptId ?? ""}
                onChange={(e) =>
                  setEditing(
                    patch(editing, { transcriptId: e.target.value || undefined })
                  )
                }
              >
                <option value="">(none)</option>
                {transcripts.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
              </Select>
            </div>
            <div className="md:col-span-2">
              <Label className="text-xs">Themes (comma-separated)</Label>
              <Input
                value={editing.themes.join(", ")}
                onChange={(e) =>
                  setEditing(
                    patch(editing, {
                      themes: e.target.value
                        .split(",")
                        .map((t) => t.trim())
                        .filter(Boolean),
                    })
                  )
                }
                placeholder="dpdr, dissociation, shame, abandonment"
              />
            </div>
            <div className="md:col-span-2">
              <Label className="text-xs">Emotional tags</Label>
              <Input
                value={editing.emotionalTags.join(", ")}
                onChange={(e) =>
                  setEditing(
                    patch(editing, {
                      emotionalTags: e.target.value
                        .split(",")
                        .map((t) => t.trim())
                        .filter(Boolean),
                    })
                  )
                }
                placeholder="shame, fear, longing…"
              />
            </div>
            <label
              className="text-xs inline-flex items-center gap-2 col-span-1"
              style={{ color: "var(--psych-muted)" }}
            >
              <input
                type="checkbox"
                checked={editing.reportSafe}
                onChange={(e) =>
                  setEditing(patch(editing, { reportSafe: e.target.checked }))
                }
              />
              Safe to include verbatim in reports
            </label>
            <label
              className="text-xs inline-flex items-center gap-2 col-span-1"
              style={{ color: "var(--psych-muted)" }}
            >
              <input
                type="checkbox"
                checked={editing.favourite}
                onChange={(e) =>
                  setEditing(patch(editing, { favourite: e.target.checked }))
                }
              />
              Favourite
            </label>
          </div>
          <div className="flex gap-2 mt-3">
            <Button size="sm" onClick={saveEditing}>
              Save
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setEditing(null)}>
              Cancel
            </Button>
          </div>
        </SectionCard>
      )}

      {/* Theme chips */}
      {themeCounts.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {themeCounts.map((t) => (
            <button
              key={t.theme}
              onClick={() =>
                setFilterTheme(filterTheme === t.theme ? "" : t.theme)
              }
              className="text-[11px] px-2 py-0.5 rounded-full border"
              style={{
                borderColor:
                  filterTheme === t.theme
                    ? "var(--psych-primary)"
                    : "var(--psych-border)",
                background:
                  filterTheme === t.theme
                    ? "var(--psych-primary-light)"
                    : "transparent",
                color: filterTheme === t.theme ? "var(--psych-accent)" : "var(--psych-muted)",
              }}
            >
              {t.theme} · {t.count}
            </button>
          ))}
        </div>
      )}

      {/* Grid */}
      {visible.length === 0 ? (
        <p className="text-sm" style={{ color: "var(--psych-muted)" }}>
          No quotes yet. Drop one in — or extract them from a transcript.
        </p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: 12,
          }}
        >
          {visible.map((q) => {
            const tint = q.color ? COLOR_TINTS[q.color] : COLOR_TINTS.rose;
            const caseCode = cases.find((c) => c.id === q.caseId)?.code;
            return (
              <article
                key={q.id}
                className="sticky-note alive-hover"
                style={{
                  background: `linear-gradient(155deg, ${tint}, var(--psych-card))`,
                  borderColor: "var(--psych-border)",
                }}
              >
                {q.favourite && <span className="sticky-pin" />}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span
                    className="annot-tag"
                    style={{
                      ["--section-tint" as never]: tint,
                      ["--section-accent" as never]: "var(--psych-accent)",
                    }}
                  >
                    {q.source}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => toggleFav(q.id)}
                      aria-label="Favourite"
                      style={{
                        color: q.favourite ? "#9F1239" : "var(--psych-muted)",
                      }}
                    >
                      <Heart
                        size={13}
                        fill={q.favourite ? "currentColor" : "none"}
                      />
                    </button>
                    <button
                      onClick={() => remove(q.id)}
                      aria-label="Delete quote"
                      style={{ color: "var(--psych-muted)" }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
                <p
                  className="text-sm italic mb-2"
                  style={{ color: "var(--psych-text)" }}
                >
                  &ldquo;{q.body}&rdquo;
                </p>
                {q.speaker && (
                  <p
                    className="text-[11px]"
                    style={{ color: "var(--psych-muted)" }}
                  >
                    — {q.speaker}
                    {q.reference && (
                      <span className="ml-1">· {q.reference}</span>
                    )}
                  </p>
                )}
                {(q.themes.length > 0 || caseCode) && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {caseCode && (
                      <span
                        className="text-[10px] font-mono"
                        style={{ color: "var(--psych-muted)" }}
                      >
                        {caseCode}
                      </span>
                    )}
                    {q.themes.map((t) => (
                      <span
                        key={t}
                        className="text-[10px] px-1.5 py-0 rounded-full border"
                        style={{
                          borderColor: "var(--psych-border)",
                          color: "var(--psych-muted)",
                        }}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
                <div
                  className="flex items-center gap-2 mt-3 pt-2"
                  style={{ borderTop: "1px dashed var(--psych-border)" }}
                >
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setEditing({ ...q })}
                  >
                    Edit
                  </Button>
                  {!q.reportSafe && (
                    <span
                      className="text-[10px] inline-flex items-center gap-1"
                      style={{ color: "#9B4D3A" }}
                    >
                      <Star size={10} /> Not report-safe
                    </span>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
