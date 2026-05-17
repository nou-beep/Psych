// Material System — a unified lens over the workspace's fragment stores.
//
// "Material" is anything you wrote down, lifted out, captured, or
// flagged: quotes, inbox captures, tracked loops, thinking-mode
// thoughts, literature excerpts. Each store keeps its own canonical
// shape; this module normalises them into a single MaterialFragment
// the /material page can browse and filter.
//
// We don't mutate any underlying store from here — that stays each
// system's job. The Material lens is read-only and additive.

import type { Quote } from "@/lib/research/quote-bank";
import type { CaptureNote } from "@/lib/workspace/quick-capture";
import type { TrackedLoop } from "@/lib/workspace/tracked-loops";
import type { Thought } from "@/lib/workspace/thinking-mode";
import type { LiteratureItem } from "@/lib/research/literature";

export type MaterialKind =
  | "quote"
  | "capture"
  | "loop"
  | "thought"
  | "excerpt";

export const MATERIAL_KIND_LABELS: Record<MaterialKind, string> = {
  quote: "Quote",
  capture: "Capture",
  loop: "Loop",
  thought: "Thought",
  excerpt: "Excerpt",
};

// A single piece of material in the unified shape.
export interface MaterialFragment {
  // Composite id — kind:storeId — so two stores can't collide.
  id: string;
  kind: MaterialKind;
  // Short label (e.g. capture kind, loop title, "Quote · 4 themes").
  label: string;
  body: string;
  tags: string[];
  themes: string[];
  // ISO timestamp.
  createdAt: string;
  updatedAt: string;
  // Optional links into the rest of the workspace.
  caseId?: string;
  transcriptId?: string;
  participantId?: string;
  // Where to navigate when the user clicks the row.
  href: string;
  // Optional colour hint (free-text — palettes vary per store).
  color?: string;
  // Optional one-line attribution / origin (e.g. "Session 3 · 12:14").
  origin?: string;
  // Pinned / favourite flag.
  pinned: boolean;
  // Free-text status useful for filtering (e.g. "inbox", "open").
  status?: string;
}

// ─── Adapters ────────────────────────────────────────────────

export function fragmentFromQuote(q: Quote): MaterialFragment {
  const themeCount = q.themes.length;
  return {
    id: `quote:${q.id}`,
    kind: "quote",
    label: `Quote${themeCount ? ` · ${themeCount} theme${themeCount === 1 ? "" : "s"}` : ""}`,
    body: q.body,
    tags: q.emotionalTags,
    themes: q.themes,
    createdAt: q.createdAt,
    updatedAt: q.updatedAt,
    caseId: q.caseId,
    transcriptId: q.transcriptId,
    participantId: q.participantId,
    href: "/research/quotes",
    color: q.color,
    origin: q.reference ?? q.speaker,
    pinned: q.favourite,
    status: q.reportSafe ? undefined : "sensitive",
  };
}

export function fragmentFromCapture(c: CaptureNote): MaterialFragment {
  return {
    id: `capture:${c.id}`,
    kind: "capture",
    label: c.kind.charAt(0).toUpperCase() + c.kind.slice(1).replace("-", " "),
    body: c.body,
    tags: c.tags,
    themes: [],
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
    href: "/inbox",
    color: c.color === "default" ? undefined : c.color,
    origin: c.source,
    pinned: c.pinned,
    status: c.status,
  };
}

export function fragmentFromLoop(l: TrackedLoop): MaterialFragment {
  return {
    id: `loop:${l.id}`,
    kind: "loop",
    label: `Loop · ${l.priority}`,
    body: `${l.title}${l.body ? `\n${l.body}` : ""}`,
    tags: l.tags,
    themes: [],
    createdAt: l.createdAt,
    updatedAt: l.updatedAt,
    caseId: l.related.find((r) => r.kind === "case")?.id,
    href: "/loops",
    origin: l.revisitBy ? `revisit by ${l.revisitBy}` : undefined,
    pinned: false,
    status: l.status,
  };
}

export function fragmentFromThought(t: Thought): MaterialFragment {
  return {
    id: `thought:${t.id}`,
    kind: "thought",
    label: t.kind.charAt(0).toUpperCase() + t.kind.slice(1),
    body: t.body,
    tags: t.cluster ? [t.cluster] : [],
    themes: [],
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
    caseId: undefined,
    href: "/thinking",
    color: t.color === "default" ? undefined : t.color,
    pinned: t.pinned,
  };
}

export function fragmentsFromLiterature(
  item: LiteratureItem
): MaterialFragment[] {
  return item.excerpts.map((e) => ({
    id: `excerpt:${item.id}:${e.id}`,
    kind: "excerpt" as const,
    label: `Excerpt · ${item.title.slice(0, 40)}`,
    body: e.body,
    tags: [],
    themes: item.themes,
    createdAt: item.updatedAt,
    updatedAt: item.updatedAt,
    href: "/research/literature",
    origin: [item.authors, e.page ? `p. ${e.page}` : null]
      .filter(Boolean)
      .join(" · ") || undefined,
    pinned: item.pinnedReading,
  }));
}

// ─── Aggregation ─────────────────────────────────────────────

export interface MaterialSources {
  quotes?: Quote[];
  captures?: CaptureNote[];
  loops?: TrackedLoop[];
  thoughts?: Thought[];
  literature?: LiteratureItem[];
}

export function collectMaterial(sources: MaterialSources): MaterialFragment[] {
  const out: MaterialFragment[] = [];
  for (const q of sources.quotes ?? []) out.push(fragmentFromQuote(q));
  for (const c of sources.captures ?? []) out.push(fragmentFromCapture(c));
  for (const l of sources.loops ?? []) out.push(fragmentFromLoop(l));
  for (const t of sources.thoughts ?? []) out.push(fragmentFromThought(t));
  for (const item of sources.literature ?? []) {
    out.push(...fragmentsFromLiterature(item));
  }
  return out;
}

// ─── Filter / search / sort ──────────────────────────────────

export interface MaterialFilter {
  kinds?: MaterialKind[];
  tag?: string;
  theme?: string;
  caseId?: string;
  pinnedOnly?: boolean;
  query?: string;
  status?: string;
}

export function filterMaterial(
  fragments: MaterialFragment[],
  filter: MaterialFilter
): MaterialFragment[] {
  const q = filter.query?.trim().toLowerCase();
  return fragments.filter((f) => {
    if (filter.kinds && filter.kinds.length && !filter.kinds.includes(f.kind))
      return false;
    if (filter.tag && !f.tags.some((t) => t.toLowerCase() === filter.tag!.toLowerCase()))
      return false;
    if (filter.theme && !f.themes.some((t) => t.toLowerCase() === filter.theme!.toLowerCase()))
      return false;
    if (filter.caseId && f.caseId !== filter.caseId) return false;
    if (filter.pinnedOnly && !f.pinned) return false;
    if (filter.status && f.status !== filter.status) return false;
    if (q) {
      const hay = [f.body, f.label, f.origin ?? "", f.tags.join(" "), f.themes.join(" ")]
        .join(" ")
        .toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

export type MaterialSort = "recent" | "oldest" | "kind" | "pinned-first";

export function sortMaterial(
  fragments: MaterialFragment[],
  sort: MaterialSort
): MaterialFragment[] {
  const arr = fragments.slice();
  switch (sort) {
    case "recent":
      return arr.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    case "oldest":
      return arr.sort((a, b) => a.updatedAt.localeCompare(b.updatedAt));
    case "kind":
      return arr.sort((a, b) => {
        if (a.kind === b.kind) return b.updatedAt.localeCompare(a.updatedAt);
        return a.kind.localeCompare(b.kind);
      });
    case "pinned-first":
      return arr.sort((a, b) => {
        if (a.pinned === b.pinned)
          return b.updatedAt.localeCompare(a.updatedAt);
        return a.pinned ? -1 : 1;
      });
  }
}

// ─── Tag / theme indexes ─────────────────────────────────────

export function tagsAcross(fragments: MaterialFragment[]): string[] {
  const set = new Set<string>();
  for (const f of fragments) for (const t of f.tags) set.add(t);
  return Array.from(set).sort();
}

export function themesAcross(fragments: MaterialFragment[]): string[] {
  const set = new Set<string>();
  for (const f of fragments) for (const t of f.themes) set.add(t);
  return Array.from(set).sort();
}

// ─── Stats ───────────────────────────────────────────────────

export interface MaterialStats {
  total: number;
  byKind: Record<MaterialKind, number>;
  pinned: number;
  tagged: number;
}

export function materialStats(
  fragments: MaterialFragment[]
): MaterialStats {
  const byKind = {
    quote: 0,
    capture: 0,
    loop: 0,
    thought: 0,
    excerpt: 0,
  } as Record<MaterialKind, number>;
  let pinned = 0;
  let tagged = 0;
  for (const f of fragments) {
    byKind[f.kind]++;
    if (f.pinned) pinned++;
    if (f.tags.length > 0 || f.themes.length > 0) tagged++;
  }
  return { total: fragments.length, byKind, pinned, tagged };
}
