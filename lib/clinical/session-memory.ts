// Session Memory — the working-memory layer Eyla holds open during
// any session. A psychologist collects observations, transcript
// excerpts, hypotheses, quotes and supervision ideas while working;
// the memory rail makes that collection a first-class object the UI
// can pin to, surface, and feed into report generation.
//
// Data shape is intentionally small + pure. Persistence lives in
// localStorage so the rail survives reloads. All mutations are pure
// functions returning a new list — the React layer holds state and
// calls saveMemoryItems() through a useEffect.

import { generateId, loadFromStorage, nowISO, saveToStorage } from "@/lib/store";

export const MEMORY_STORAGE_KEY = "eyla-session-memory-v1";

export type MemoryKind =
  | "observation"
  | "excerpt"
  | "hypothesis"
  | "quote"
  | "fragment"
  | "supervision"
  | "reference"
  | "paragraph"
  | "sensory"
  | "pattern";

export type MemoryColor =
  | "neutral"
  | "amber"
  | "violet"
  | "rose"
  | "emerald"
  | "blue";

export const MEMORY_COLORS: ReadonlyArray<MemoryColor> = [
  "neutral",
  "amber",
  "violet",
  "rose",
  "emerald",
  "blue",
] as const;

export interface MemorySource {
  /** Free-text label for "where this came from" (e.g. "Case INT-AP-001 · session 3"). */
  label?: string;
  /** Where the source lives — keeps things linkable later. */
  kind?:
    | "case"
    | "session"
    | "report"
    | "grid"
    | "test"
    | "transcript"
    | "worksheet"
    | "supervision"
    | "thesis-chapter"
    | "literature";
  /** Optional id within that kind (e.g. case id, transcript id). */
  refId?: string;
}

export interface MemoryItem {
  id: string;
  /**
   * Groups items by session — any string the caller controls.
   * Examples: a case id, a thesis-chapter id, a literal "thesis-jul"
   * label. Empty string means "no session" (loose pinned items).
   */
  sessionId: string;
  kind: MemoryKind;
  /** The actual content the user pinned. Short or paragraph-length. */
  body: string;
  source?: MemorySource;
  tags: string[];
  color: MemoryColor;
  /** When false, the rail hides it under "Archive". */
  pinned: boolean;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Pure factories + mutations ──────────────────────────────

export function newMemoryItem(input: {
  sessionId: string;
  kind: MemoryKind;
  body: string;
  source?: MemorySource;
  tags?: string[];
  color?: MemoryColor;
}): MemoryItem {
  const now = nowISO();
  return {
    id: generateId(),
    sessionId: input.sessionId,
    kind: input.kind,
    body: input.body,
    source: input.source,
    tags: input.tags ?? [],
    color: input.color ?? "neutral",
    pinned: true,
    archived: false,
    createdAt: now,
    updatedAt: now,
  };
}

export function addMemoryItem(
  list: MemoryItem[],
  item: MemoryItem
): MemoryItem[] {
  return [item, ...list];
}

export function patchMemoryItem(
  list: MemoryItem[],
  id: string,
  patch: Partial<MemoryItem>
): MemoryItem[] {
  return list.map((m) =>
    m.id === id ? { ...m, ...patch, updatedAt: nowISO() } : m
  );
}

export function removeMemoryItem(
  list: MemoryItem[],
  id: string
): MemoryItem[] {
  return list.filter((m) => m.id !== id);
}

export function archiveMemoryItem(
  list: MemoryItem[],
  id: string
): MemoryItem[] {
  return patchMemoryItem(list, id, { archived: true, pinned: false });
}

export function restoreMemoryItem(
  list: MemoryItem[],
  id: string
): MemoryItem[] {
  return patchMemoryItem(list, id, { archived: false, pinned: true });
}

export function toggleMemoryColor(
  list: MemoryItem[],
  id: string,
  color: MemoryColor
): MemoryItem[] {
  return patchMemoryItem(list, id, { color });
}

// ─── Queries ──────────────────────────────────────────────────

export function activeMemory(list: MemoryItem[]): MemoryItem[] {
  return list.filter((m) => m.pinned && !m.archived);
}

export function memoryForSession(
  list: MemoryItem[],
  sessionId: string
): MemoryItem[] {
  return list.filter((m) => m.sessionId === sessionId);
}

/**
 * Groups active items by kind for the rail UI. Keeps the order
 * deterministic so the rail doesn't shuffle on re-render.
 */
export function groupMemoryByKind(
  list: MemoryItem[]
): Array<{ kind: MemoryKind; items: MemoryItem[] }> {
  const order: MemoryKind[] = [
    "observation",
    "hypothesis",
    "pattern",
    "excerpt",
    "quote",
    "fragment",
    "sensory",
    "paragraph",
    "supervision",
    "reference",
  ];
  const buckets = new Map<MemoryKind, MemoryItem[]>();
  for (const k of order) buckets.set(k, []);
  for (const item of activeMemory(list)) {
    buckets.get(item.kind)?.push(item);
  }
  return order
    .map((kind) => ({ kind, items: buckets.get(kind) ?? [] }))
    .filter((g) => g.items.length > 0);
}

// ─── Persistence helpers ──────────────────────────────────────

export function loadMemoryItems(): MemoryItem[] {
  return loadFromStorage<MemoryItem[]>(MEMORY_STORAGE_KEY, []);
}

export function saveMemoryItems(items: MemoryItem[]): void {
  saveToStorage(MEMORY_STORAGE_KEY, items);
}

// ─── Display metadata ─────────────────────────────────────────

export const MEMORY_KIND_LABELS_EN: Record<MemoryKind, string> = {
  observation: "Observations",
  excerpt: "Excerpts",
  hypothesis: "Hypotheses",
  quote: "Quotes",
  fragment: "Fragments",
  supervision: "Supervision",
  reference: "References",
  paragraph: "Paragraphs",
  sensory: "Sensory notes",
  pattern: "Patterns",
};

export const MEMORY_KIND_LABELS_FR: Record<MemoryKind, string> = {
  observation: "Observations",
  excerpt: "Extraits",
  hypothesis: "Hypothèses",
  quote: "Citations",
  fragment: "Fragments",
  supervision: "Supervision",
  reference: "Références",
  paragraph: "Paragraphes",
  sensory: "Notes sensorielles",
  pattern: "Schémas",
};

/** Returns a short emoji-free glyph for a kind. Used in the rail. */
export const MEMORY_KIND_GLYPH: Record<MemoryKind, string> = {
  observation: "○",
  excerpt: "❝",
  hypothesis: "?",
  quote: "❝",
  fragment: "·",
  supervision: "△",
  reference: "§",
  paragraph: "¶",
  sensory: "≈",
  pattern: "∿",
};
