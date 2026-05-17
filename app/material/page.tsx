"use client";
// Material — unified lens across the workspace fragment stores.
// Read-only browser; mutations still happen in each source page
// (Quotes, Inbox, Loops, Thinking, Literature). The point is to
// stop treating fragments as five separate things.

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Filter,
  Layers,
  Pin,
  Quote as QuoteIcon,
  Search,
  Sparkles,
  StickyNote,
  X,
} from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { SectionCard } from "@/components/shared/SectionCard";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { loadFromStorage } from "@/lib/store";
import {
  QUOTE_BANK_STORAGE_KEY,
  type Quote,
} from "@/lib/research/quote-bank";
import {
  QUICK_CAPTURE_STORAGE_KEY,
  type CaptureNote,
} from "@/lib/workspace/quick-capture";
import {
  TRACKED_LOOPS_STORAGE_KEY,
  type TrackedLoop,
} from "@/lib/workspace/tracked-loops";
import {
  THINKING_BOARD_STORAGE_KEY,
  type ThinkingBoard,
} from "@/lib/workspace/thinking-mode";
import {
  LITERATURE_STORAGE_KEY,
  type LiteratureItem,
} from "@/lib/research/literature";
import {
  MATERIAL_KIND_LABELS,
  collectMaterial,
  filterMaterial,
  materialStats,
  sortMaterial,
  tagsAcross,
  themesAcross,
  type MaterialFragment,
  type MaterialKind,
  type MaterialSort,
} from "@/lib/workspace/material";

const KIND_ICONS: Record<MaterialKind, typeof QuoteIcon> = {
  quote: QuoteIcon,
  capture: StickyNote,
  loop: Layers,
  thought: Sparkles,
  excerpt: QuoteIcon,
};

const KIND_BG: Record<MaterialKind, string> = {
  quote: "#FFE4E6",
  capture: "#FEF3C7",
  loop: "var(--psych-primary-light)",
  thought: "#EDE9FE",
  excerpt: "#D1FAE5",
};

const KIND_FG: Record<MaterialKind, string> = {
  quote: "#881337",
  capture: "#78350F",
  loop: "var(--psych-primary)",
  thought: "#4C1D95",
  excerpt: "#065F46",
};

export default function MaterialPage() {
  const [fragments, setFragments] = useState<MaterialFragment[] | null>(null);
  const [query, setQuery] = useState("");
  const [kindFilter, setKindFilter] = useState<MaterialKind | "all">("all");
  const [tagFilter, setTagFilter] = useState<string>("");
  const [themeFilter, setThemeFilter] = useState<string>("");
  const [pinnedOnly, setPinnedOnly] = useState(false);
  const [sort, setSort] = useState<MaterialSort>("recent");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const quotes = loadFromStorage<Quote[]>(QUOTE_BANK_STORAGE_KEY, []);
      const captures = loadFromStorage<CaptureNote[]>(
        QUICK_CAPTURE_STORAGE_KEY,
        []
      );
      const loops = loadFromStorage<TrackedLoop[]>(
        TRACKED_LOOPS_STORAGE_KEY,
        []
      );
      const board = loadFromStorage<ThinkingBoard | null>(
        THINKING_BOARD_STORAGE_KEY,
        null
      );
      const literature = loadFromStorage<LiteratureItem[]>(
        LITERATURE_STORAGE_KEY,
        []
      );
      setFragments(
        collectMaterial({
          quotes: Array.isArray(quotes) ? quotes : [],
          captures: Array.isArray(captures) ? captures : [],
          loops: Array.isArray(loops) ? loops : [],
          thoughts: board?.thoughts ?? [],
          literature: Array.isArray(literature) ? literature : [],
        })
      );
    } catch {
      setFragments([]);
    }
  }, []);

  const stats = useMemo(
    () => (fragments ? materialStats(fragments) : null),
    [fragments]
  );
  const tags = useMemo(
    () => (fragments ? tagsAcross(fragments) : []),
    [fragments]
  );
  const themes = useMemo(
    () => (fragments ? themesAcross(fragments) : []),
    [fragments]
  );

  const visible = useMemo(() => {
    if (!fragments) return [];
    const filtered = filterMaterial(fragments, {
      kinds: kindFilter === "all" ? undefined : [kindFilter],
      tag: tagFilter || undefined,
      theme: themeFilter || undefined,
      pinnedOnly,
      query: query.trim() || undefined,
    });
    return sortMaterial(filtered, sort);
  }, [fragments, kindFilter, tagFilter, themeFilter, pinnedOnly, query, sort]);

  if (!fragments) return null;

  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
      <PageHeader
        title="Material"
        subtitle="Tout ce que tu as relevé, écrit, ou gardé : citations, captures, boucles, pensées, extraits. Un seul endroit pour fouiller."
      />

      {/* Stats strip */}
      {stats && stats.total > 0 && (
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-4">
          <StatBlock label="Total" value={stats.total} />
          <StatBlock label="Quotes" value={stats.byKind.quote} kind="quote" />
          <StatBlock
            label="Captures"
            value={stats.byKind.capture}
            kind="capture"
          />
          <StatBlock label="Loops" value={stats.byKind.loop} kind="loop" />
          <StatBlock
            label="Thoughts"
            value={stats.byKind.thought}
            kind="thought"
          />
          <StatBlock
            label="Excerpts"
            value={stats.byKind.excerpt}
            kind="excerpt"
          />
        </div>
      )}

      {/* Filters */}
      <SectionCard className="mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search
              size={11}
              className="absolute left-2 top-1/2 -translate-y-1/2"
              style={{ color: "var(--psych-muted)" }}
            />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search bodies, tags, themes…"
              className="pl-7 text-xs"
            />
          </div>
          <Select
            value={kindFilter}
            onChange={(e) =>
              setKindFilter(e.target.value as MaterialKind | "all")
            }
            className="text-xs"
          >
            <option value="all">All kinds</option>
            {Object.entries(MATERIAL_KIND_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </Select>
          <Select
            value={sort}
            onChange={(e) => setSort(e.target.value as MaterialSort)}
            className="text-xs"
          >
            <option value="recent">Most recent</option>
            <option value="oldest">Oldest first</option>
            <option value="kind">By kind</option>
            <option value="pinned-first">Pinned first</option>
          </Select>
          <label
            className="flex items-center gap-1 text-xs cursor-pointer"
            style={{ color: "var(--psych-text)" }}
          >
            <input
              type="checkbox"
              checked={pinnedOnly}
              onChange={(e) => setPinnedOnly(e.target.checked)}
            />
            <Pin size={10} /> Pinned only
          </label>
        </div>
        {(tags.length > 0 || themes.length > 0) && (
          <div className="mt-3 space-y-1">
            {tags.length > 0 && (
              <div className="flex items-center gap-1 flex-wrap">
                <span
                  className="text-[10px] uppercase tracking-wider mr-1"
                  style={{ color: "var(--psych-muted)" }}
                >
                  Tags
                </span>
                {tags.slice(0, 20).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTagFilter(tagFilter === t ? "" : t)}
                    className="text-[10px] px-1.5 py-0.5 rounded-full border transition-colors"
                    style={{
                      backgroundColor:
                        tagFilter === t
                          ? "var(--psych-primary-light)"
                          : "transparent",
                      borderColor:
                        tagFilter === t
                          ? "var(--psych-primary)"
                          : "var(--psych-border)",
                      color:
                        tagFilter === t
                          ? "var(--psych-primary)"
                          : "var(--psych-muted)",
                    }}
                  >
                    #{t}
                  </button>
                ))}
              </div>
            )}
            {themes.length > 0 && (
              <div className="flex items-center gap-1 flex-wrap">
                <span
                  className="text-[10px] uppercase tracking-wider mr-1"
                  style={{ color: "var(--psych-muted)" }}
                >
                  Themes
                </span>
                {themes.slice(0, 20).map((t) => (
                  <button
                    key={t}
                    onClick={() => setThemeFilter(themeFilter === t ? "" : t)}
                    className="text-[10px] px-1.5 py-0.5 rounded-full border transition-colors italic"
                    style={{
                      backgroundColor:
                        themeFilter === t
                          ? "var(--psych-primary-light)"
                          : "transparent",
                      borderColor:
                        themeFilter === t
                          ? "var(--psych-primary)"
                          : "var(--psych-border)",
                      color:
                        themeFilter === t
                          ? "var(--psych-primary)"
                          : "var(--psych-muted)",
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}
            {(tagFilter || themeFilter) && (
              <button
                onClick={() => {
                  setTagFilter("");
                  setThemeFilter("");
                }}
                className="text-[10px] inline-flex items-center gap-1"
                style={{ color: "var(--psych-muted)" }}
              >
                <X size={9} /> Clear tag / theme filters
              </button>
            )}
          </div>
        )}
      </SectionCard>

      {/* Result rows */}
      {visible.length === 0 ? (
        <div
          className="text-center py-12 rounded-xl border text-sm"
          style={{
            borderColor: "var(--psych-border)",
            color: "var(--psych-muted)",
            backgroundColor: "var(--psych-card)",
          }}
        >
          <Filter size={20} className="mx-auto mb-2 opacity-50" />
          {fragments.length === 0
            ? "No material captured yet. Capture, quote, or set aside a thought to populate this view."
            : "Nothing matches the current filters."}
        </div>
      ) : (
        <ul className="space-y-2">
          {visible.map((f) => {
            const Icon = KIND_ICONS[f.kind];
            const isExpanded = expanded.has(f.id);
            const preview =
              f.body.length > 240 ? f.body.slice(0, 240) + "…" : f.body;
            return (
              <li key={f.id}>
                <article
                  className="rounded-xl border p-3"
                  style={{
                    backgroundColor: "var(--psych-card)",
                    borderColor: "var(--psych-border)",
                  }}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className="inline-flex items-center justify-center rounded-md w-7 h-7 flex-shrink-0"
                      style={{
                        backgroundColor: KIND_BG[f.kind],
                        color: KIND_FG[f.kind],
                      }}
                    >
                      <Icon size={12} />
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span
                          className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                          style={{
                            backgroundColor: KIND_BG[f.kind],
                            color: KIND_FG[f.kind],
                          }}
                        >
                          {f.label}
                        </span>
                        {f.pinned && (
                          <span
                            className="text-[10px] inline-flex items-center gap-0.5"
                            style={{ color: "var(--psych-primary)" }}
                          >
                            <Pin size={9} /> pinned
                          </span>
                        )}
                        {f.status && f.status !== "inbox" && (
                          <span
                            className="text-[10px] italic"
                            style={{ color: "var(--psych-muted)" }}
                          >
                            {f.status}
                          </span>
                        )}
                        {f.origin && (
                          <span
                            className="text-[10px] italic ml-auto"
                            style={{ color: "var(--psych-muted)" }}
                          >
                            {f.origin}
                          </span>
                        )}
                      </div>
                      <p
                        className="text-sm whitespace-pre-wrap"
                        style={{
                          color: "var(--psych-text)",
                          fontFamily: f.kind === "quote" || f.kind === "excerpt" ? "Georgia, serif" : undefined,
                          lineHeight: 1.5,
                        }}
                        onClick={() => {
                          if (f.body.length > 240) {
                            const next = new Set(expanded);
                            if (isExpanded) next.delete(f.id);
                            else next.add(f.id);
                            setExpanded(next);
                          }
                        }}
                      >
                        {isExpanded ? f.body : preview}
                      </p>
                      {(f.tags.length > 0 || f.themes.length > 0) && (
                        <div className="flex items-center gap-1 mt-2 flex-wrap">
                          {f.tags.map((t) => (
                            <span
                              key={`tag-${t}`}
                              className="text-[10px] px-1.5 py-0.5 rounded-full border"
                              style={{
                                borderColor: "var(--psych-border)",
                                color: "var(--psych-muted)",
                              }}
                            >
                              #{t}
                            </span>
                          ))}
                          {f.themes.map((t) => (
                            <span
                              key={`theme-${t}`}
                              className="text-[10px] px-1.5 py-0.5 rounded-full border italic"
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
                    </div>
                    <Link
                      href={f.href}
                      className="text-[10px] inline-flex items-center gap-0.5 flex-shrink-0"
                      style={{ color: "var(--psych-primary)" }}
                      title={`Open in ${MATERIAL_KIND_LABELS[f.kind]}`}
                    >
                      <ArrowUpRight size={10} />
                    </Link>
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function StatBlock({
  label,
  value,
  kind,
}: {
  label: string;
  value: number;
  kind?: MaterialKind;
}) {
  return (
    <div
      className="rounded-xl border p-2.5"
      style={{
        backgroundColor: "var(--psych-card)",
        borderColor: "var(--psych-border)",
      }}
    >
      <div
        className="text-[9px] uppercase tracking-wider"
        style={{ color: kind ? KIND_FG[kind] : "var(--psych-muted)" }}
      >
        {label}
      </div>
      <div
        className="text-lg font-semibold"
        style={{ color: "var(--psych-text)" }}
      >
        {value}
      </div>
    </div>
  );
}
