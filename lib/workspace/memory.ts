// Workspace memory — persistent state across sessions so the app
// feels continuous. Tracks recent items, last positions, and
// scope-keyed UI state (sidebar collapse, active filters, etc).
//
// Pure logic. The UI calls `recordVisit` / `recordPosition` /
// `setUiFlag` and reads back via `recentItems` / `getPosition` /
// `getUiFlag`. All persistence is through `lib/store.ts`.

import { loadFromStorage, nowISO, saveToStorage } from "@/lib/store";

export type RecentItemKind =
  | "case"
  | "thesis-chapter"
  | "transcript"
  | "article"
  | "participant"
  | "report"
  | "worksheet"
  | "session"
  | "thought-board"
  | "assessment"
  | "supervision"
  | "quote";

export const RECENT_ITEM_LABELS: Record<RecentItemKind, string> = {
  case: "Case",
  "thesis-chapter": "Chapter",
  transcript: "Transcript",
  article: "Article",
  participant: "Participant",
  report: "Report",
  worksheet: "Worksheet",
  session: "Session",
  "thought-board": "Thought board",
  assessment: "Assessment",
  supervision: "Supervision",
  quote: "Quote",
};

export interface RecentItem {
  id: string;
  kind: RecentItemKind;
  label: string;
  href: string;
  // Visit count over the lifetime of the entry.
  visitCount: number;
  lastVisitedAt: string;
  // Optional resume hint (e.g. transcript timestamp or chapter section).
  resumeHint?: string;
}

export const WORKSPACE_RECENTS_KEY = "psych-workspace-recents-v1";
export const WORKSPACE_POSITIONS_KEY = "psych-workspace-positions-v1";
export const WORKSPACE_UI_FLAGS_KEY = "psych-workspace-ui-flags-v1";

// Maximum number of recent items we keep around — anything older falls off.
const MAX_RECENTS = 30;

// ─── Recents ──────────────────────────────────────────────────

export function recordVisit(
  list: RecentItem[],
  input: {
    id: string;
    kind: RecentItemKind;
    label: string;
    href: string;
    resumeHint?: string;
  }
): RecentItem[] {
  const now = nowISO();
  const existing = list.find((r) => r.id === input.id && r.kind === input.kind);
  const next: RecentItem = existing
    ? {
        ...existing,
        label: input.label,
        href: input.href,
        visitCount: existing.visitCount + 1,
        lastVisitedAt: now,
        resumeHint: input.resumeHint ?? existing.resumeHint,
      }
    : {
        id: input.id,
        kind: input.kind,
        label: input.label,
        href: input.href,
        visitCount: 1,
        lastVisitedAt: now,
        resumeHint: input.resumeHint,
      };
  const others = list.filter(
    (r) => !(r.id === input.id && r.kind === input.kind)
  );
  return [next, ...others].slice(0, MAX_RECENTS);
}

export function recentItems(
  list: RecentItem[],
  limit = 8,
  kindFilter?: RecentItemKind
): RecentItem[] {
  const filtered = kindFilter
    ? list.filter((r) => r.kind === kindFilter)
    : list;
  return filtered
    .slice()
    .sort((a, b) => b.lastVisitedAt.localeCompare(a.lastVisitedAt))
    .slice(0, limit);
}

export function forgetItem(
  list: RecentItem[],
  id: string,
  kind: RecentItemKind
): RecentItem[] {
  return list.filter((r) => !(r.id === id && r.kind === kind));
}

export function loadRecents(): RecentItem[] {
  const raw = loadFromStorage<unknown>(WORKSPACE_RECENTS_KEY, []);
  return Array.isArray(raw) ? (raw as RecentItem[]) : [];
}

export function saveRecents(list: RecentItem[]): void {
  saveToStorage(WORKSPACE_RECENTS_KEY, list);
}

// ─── Resume positions ─────────────────────────────────────────
// For each "scope" (e.g. `transcript:abc123`, `chapter:ch5`) we store a
// position the UI can restore.

export interface PositionRecord {
  scope: string;
  position: number | string;
  updatedAt: string;
}

export function recordPosition(
  list: PositionRecord[],
  scope: string,
  position: number | string
): PositionRecord[] {
  const filtered = list.filter((p) => p.scope !== scope);
  return [
    { scope, position, updatedAt: nowISO() },
    ...filtered,
  ].slice(0, 100);
}

export function getPosition(
  list: PositionRecord[],
  scope: string
): PositionRecord | undefined {
  return list.find((p) => p.scope === scope);
}

export function loadPositions(): PositionRecord[] {
  const raw = loadFromStorage<unknown>(WORKSPACE_POSITIONS_KEY, []);
  return Array.isArray(raw) ? (raw as PositionRecord[]) : [];
}

export function savePositions(list: PositionRecord[]): void {
  saveToStorage(WORKSPACE_POSITIONS_KEY, list);
}

// ─── UI flags ─────────────────────────────────────────────────
// Lightweight key/value bag for things like sidebar-collapsed,
// active-filter, last-tab. Keep this tiny — it's a junk drawer.

export type UiFlag = string | number | boolean | null;
export type UiFlags = Record<string, UiFlag>;

export function loadUiFlags(): UiFlags {
  const raw = loadFromStorage<unknown>(WORKSPACE_UI_FLAGS_KEY, {});
  return raw && typeof raw === "object" ? (raw as UiFlags) : {};
}

export function saveUiFlags(flags: UiFlags): void {
  saveToStorage(WORKSPACE_UI_FLAGS_KEY, flags);
}

export function setUiFlag(flags: UiFlags, key: string, value: UiFlag): UiFlags {
  return { ...flags, [key]: value };
}

export function getUiFlag<T extends UiFlag>(
  flags: UiFlags,
  key: string,
  fallback: T
): T {
  const v = flags[key];
  return v === undefined ? fallback : (v as T);
}

// ─── Resume hints ─────────────────────────────────────────────
// Produces a "continue where you left off" hint for the dashboard.

export interface ResumeHint {
  item: RecentItem;
  hint: string;
}

export function resumeHintsFor(
  list: RecentItem[],
  limit = 3
): ResumeHint[] {
  const out: ResumeHint[] = [];
  for (const r of recentItems(list, limit * 3)) {
    if (!r.resumeHint) continue;
    out.push({ item: r, hint: r.resumeHint });
    if (out.length >= limit) break;
  }
  return out;
}
