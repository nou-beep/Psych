// Literature desk — reading list + paper notes + extracted excerpts.
// Pure data; the UI binds to it.

import { generateId, nowISO } from "@/lib/store";

export type ReadingStatus =
  | "to-read"
  | "reading"
  | "skimmed"
  | "read"
  | "archived";

export interface LiteratureItem {
  id: string;
  title: string;
  authors: string;
  year?: number;
  citation?: string; // free-text citation
  doi?: string;
  url?: string;
  status: ReadingStatus;
  summary: string;
  themes: string[];
  // Excerpts pulled from this paper.
  excerpts: Array<{
    id: string;
    body: string;
    page?: string;
    note?: string;
  }>;
  // Whether this item is currently on the "currently reading" rail.
  pinnedReading: boolean;
  // Linked thesis chapter ids — used by "drag-in literature".
  linkedChapters: string[];
  createdAt: string;
  updatedAt: string;
}

export const LITERATURE_STORAGE_KEY = "psych-literature-v1";

export function emptyItem(overrides: Partial<LiteratureItem> = {}): LiteratureItem {
  const now = nowISO();
  return {
    id: generateId(),
    title: "",
    authors: "",
    status: "to-read",
    summary: "",
    themes: [],
    excerpts: [],
    pinnedReading: false,
    linkedChapters: [],
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

export function patch(
  item: LiteratureItem,
  p: Partial<LiteratureItem>
): LiteratureItem {
  return { ...item, ...p, updatedAt: nowISO() };
}

export function addExcerpt(
  item: LiteratureItem,
  body: string,
  page?: string,
  note?: string
): LiteratureItem {
  if (!body.trim()) return item;
  return {
    ...item,
    excerpts: [
      ...item.excerpts,
      { id: generateId(), body: body.trim(), page, note },
    ],
    updatedAt: nowISO(),
  };
}

export function removeExcerpt(
  item: LiteratureItem,
  excerptId: string
): LiteratureItem {
  return {
    ...item,
    excerpts: item.excerpts.filter((e) => e.id !== excerptId),
    updatedAt: nowISO(),
  };
}

// ─── Reading list views ────────────────────────────────────────

export function currentlyReading(items: LiteratureItem[]): LiteratureItem[] {
  return items.filter(
    (i) => i.pinnedReading || i.status === "reading"
  );
}

export function toRead(items: LiteratureItem[]): LiteratureItem[] {
  return items.filter((i) => i.status === "to-read");
}

export function byTheme(
  items: LiteratureItem[]
): Record<string, LiteratureItem[]> {
  const out: Record<string, LiteratureItem[]> = {};
  for (const item of items) {
    for (const theme of item.themes) {
      if (!out[theme]) out[theme] = [];
      out[theme].push(item);
    }
  }
  return out;
}

export function searchLiterature(
  items: LiteratureItem[],
  query: string
): LiteratureItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return items;
  return items.filter((item) => {
    const hay = [
      item.title,
      item.authors,
      item.summary,
      item.themes.join(" "),
      item.citation ?? "",
    ]
      .join(" ")
      .toLowerCase();
    return hay.includes(q);
  });
}
