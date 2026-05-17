// Article library — uploaded academic PDFs with manual metadata,
// reading status, highlights and excerpts. The UI handles file
// upload; this module owns the *records*.
//
// IMPORTANT: we do NOT fabricate metadata. If the user only supplies
// a file, the record is created with metadataIncomplete = true and
// the UI prompts manual entry. APA rendering is delegated to
// `lib/research/apa.ts`.

import { generateId, nowISO } from "@/lib/store";
import type { AuthorName, ArticleType } from "@/lib/research/apa";

export type ReadingStatus =
  | "to-read"
  | "currently-reading"
  | "needs-reread"
  | "important-theory"
  | "skimmed"
  | "read";

export const READING_STATUS_LABELS: Record<ReadingStatus, string> = {
  "to-read": "À lire",
  "currently-reading": "Currently reading",
  "needs-reread": "Needs reread",
  "important-theory": "Important theory",
  skimmed: "Skimmed",
  read: "Read",
};

export interface ArticleHighlight {
  id: string;
  // Page can be a number, range, or label like "abstract".
  page?: string;
  text: string;
  color: "yellow" | "blue" | "green" | "pink" | "violet";
  note?: string;
  // Links to other Eyla objects (thesis chapters, quotes, themes).
  linkedChapters: string[];
  linkedQuoteIds: string[];
  linkedThemes: string[];
  createdAt: string;
}

export interface ArticleStickyNote {
  id: string;
  page?: string;
  body: string;
  createdAt: string;
}

export interface ArticleRecord {
  id: string;
  // File metadata. The Blob/File itself isn't stored here — the UI
  // hands the file to the user or stores it via FileSystem; here we
  // just carry display info.
  fileName?: string;
  fileSize?: number;
  // Citation fields (manually entered or future-extracted).
  type: ArticleType;
  authors: AuthorName[];
  year?: number;
  title: string;
  journal?: string;
  volume?: string;
  issue?: string;
  pages?: string;
  doi?: string;
  url?: string;
  publisher?: string;
  abstract?: string;
  // Reading state.
  status: ReadingStatus;
  favorite: boolean;
  tags: string[];
  // Links.
  linkedChapters: string[];
  linkedThemes: string[];
  // Annotations.
  highlights: ArticleHighlight[];
  stickyNotes: ArticleStickyNote[];
  excerptCount: number;
  // Verification.
  metadataIncomplete: boolean;
  metadataNotes?: string;
  // Audit.
  createdAt: string;
  updatedAt: string;
}

export const ARTICLE_LIBRARY_STORAGE_KEY = "psych-article-library-v1";

export function newArticleRecord(input: {
  fileName?: string;
  fileSize?: number;
  title?: string;
  authors?: AuthorName[];
  year?: number;
  type?: ArticleType;
}): ArticleRecord {
  const now = nowISO();
  const title = (input.title ?? "").trim();
  const authors = input.authors ?? [];
  const validAuthors = authors.filter((a) => a.family.trim()).length;
  const incomplete = !title || validAuthors === 0 || !input.year;
  return {
    id: generateId(),
    fileName: input.fileName,
    fileSize: input.fileSize,
    type: input.type ?? "journal-article",
    authors,
    year: input.year,
    title: title || (input.fileName ? stripExt(input.fileName) : "Untitled"),
    status: "to-read",
    favorite: false,
    tags: [],
    linkedChapters: [],
    linkedThemes: [],
    highlights: [],
    stickyNotes: [],
    excerptCount: 0,
    metadataIncomplete: incomplete,
    metadataNotes: incomplete
      ? "Manual verification required — confirm title, authors, year, journal, and DOI."
      : undefined,
    createdAt: now,
    updatedAt: now,
  };
}

function stripExt(name: string): string {
  return name.replace(/\.[a-zA-Z0-9]{1,4}$/, "");
}

export function patchArticle(
  list: ArticleRecord[],
  id: string,
  patch: Partial<Omit<ArticleRecord, "id" | "createdAt">>
): ArticleRecord[] {
  return list.map((a) => {
    if (a.id !== id) return a;
    const next: ArticleRecord = { ...a, ...patch, updatedAt: nowISO() };
    // Recompute metadataIncomplete if title/authors/year changed.
    if ("title" in patch || "authors" in patch || "year" in patch) {
      next.metadataIncomplete =
        !next.title.trim() ||
        next.authors.filter((au) => au.family.trim()).length === 0 ||
        !next.year;
      if (!next.metadataIncomplete) next.metadataNotes = undefined;
    }
    return next;
  });
}

export function addHighlight(
  list: ArticleRecord[],
  articleId: string,
  highlight: Omit<ArticleHighlight, "id" | "createdAt">
): ArticleRecord[] {
  return list.map((a) => {
    if (a.id !== articleId) return a;
    return {
      ...a,
      highlights: [
        ...a.highlights,
        { ...highlight, id: generateId(), createdAt: nowISO() },
      ],
      updatedAt: nowISO(),
    };
  });
}

export function removeHighlight(
  list: ArticleRecord[],
  articleId: string,
  highlightId: string
): ArticleRecord[] {
  return list.map((a) => {
    if (a.id !== articleId) return a;
    return {
      ...a,
      highlights: a.highlights.filter((h) => h.id !== highlightId),
      updatedAt: nowISO(),
    };
  });
}

export function addStickyNote(
  list: ArticleRecord[],
  articleId: string,
  body: string,
  page?: string
): ArticleRecord[] {
  if (!body.trim()) return list;
  return list.map((a) => {
    if (a.id !== articleId) return a;
    return {
      ...a,
      stickyNotes: [
        ...a.stickyNotes,
        {
          id: generateId(),
          page,
          body: body.trim(),
          createdAt: nowISO(),
        },
      ],
      updatedAt: nowISO(),
    };
  });
}

// ─── Views ────────────────────────────────────────────────────

export function currentlyReading(list: ArticleRecord[]): ArticleRecord[] {
  return list.filter((a) => a.status === "currently-reading");
}

export function favoriteArticles(list: ArticleRecord[]): ArticleRecord[] {
  return list.filter((a) => a.favorite);
}

export function articlesByChapter(
  list: ArticleRecord[]
): Record<string, ArticleRecord[]> {
  const out: Record<string, ArticleRecord[]> = {};
  for (const a of list) {
    for (const c of a.linkedChapters) {
      if (!out[c]) out[c] = [];
      out[c].push(a);
    }
  }
  return out;
}

export function searchArticles(
  list: ArticleRecord[],
  query: string
): ArticleRecord[] {
  const q = query.trim().toLowerCase();
  if (!q) return list;
  return list.filter((a) => {
    const hay = [
      a.title,
      a.authors.map((au) => `${au.family} ${au.given}`).join(" "),
      a.journal ?? "",
      a.tags.join(" "),
      a.abstract ?? "",
      a.doi ?? "",
    ]
      .join(" ")
      .toLowerCase();
    return hay.includes(q);
  });
}

// ─── Best-effort filename parsing ─────────────────────────────
// Many academic PDFs are saved with conventions like
// "Sierra-2009-Depersonalization.pdf" or "10.1016 s0006...pdf".
// We attempt a soft parse and ALWAYS flag the record incomplete.

export interface FilenameGuess {
  title?: string;
  year?: number;
  authorGuess?: string;
}

export function guessFromFilename(name: string): FilenameGuess {
  const base = stripExt(name).replace(/[_]+/g, " ");
  const out: FilenameGuess = {};
  const yearMatch = base.match(/\b(1[5-9]\d{2}|20\d{2}|21\d{2})\b/);
  if (yearMatch) out.year = Number(yearMatch[1]);
  // A common pattern: "LastName Year Title…"
  const dashed = base.split(/\s*[-–—]\s*/);
  if (dashed.length >= 2) {
    out.authorGuess = dashed[0].trim();
    out.title = dashed.slice(yearMatch ? 2 : 1).join(" - ").trim() || undefined;
  } else {
    out.title = base.trim();
  }
  return out;
}
