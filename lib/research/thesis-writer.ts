// Thesis Writer — chapter shape, autosave + draft snapshots, outline
// navigation. Pure data; the editor UI binds to the state and persists.

import { generateId, nowISO } from "@/lib/store";

export type ChapterId =
  | "introduction"
  | "literature"
  | "methodology"
  | "results"
  | "discussion"
  | "conclusion"
  | "references"
  | "appendices";

export const CHAPTER_ORDER: ChapterId[] = [
  "introduction",
  "literature",
  "methodology",
  "results",
  "discussion",
  "conclusion",
  "references",
  "appendices",
];

export const CHAPTER_LABELS: Record<ChapterId, string> = {
  introduction: "Introduction",
  literature: "Literature review",
  methodology: "Methodology",
  results: "Results",
  discussion: "Discussion",
  conclusion: "Conclusion",
  references: "References",
  appendices: "Appendices",
};

export interface ChapterSection {
  id: string;
  heading: string;
  body: string;
  // Side-note text that lives in the editor margin.
  sideNote?: string;
  // Whether the section is marked as a draft (border style hint).
  draft: boolean;
  // Quote-bank or excerpt ids dragged into the section.
  linkedQuoteIds: string[];
  // Inline TODO markers count (e.g. "[needs citation]") — derived from
  // body text scanning but stored to keep the outline view cheap.
  unresolvedMarkerCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ChapterDraft {
  id: ChapterId;
  sections: ChapterSection[];
  // Wordcount cache (re-derived on save).
  wordCount: number;
  updatedAt: string;
}

export interface ThesisDocument {
  id: string;
  title: string;
  chapters: Record<ChapterId, ChapterDraft>;
  updatedAt: string;
  createdAt: string;
}

export const THESIS_DOCUMENT_STORAGE_KEY = "psych-thesis-document-v1";
export const THESIS_SNAPSHOTS_STORAGE_KEY = "psych-thesis-snapshots-v1";

function emptyChapter(id: ChapterId): ChapterDraft {
  return {
    id,
    sections: [],
    wordCount: 0,
    updatedAt: nowISO(),
  };
}

export function emptyDocument(title: string = "Untitled thesis"): ThesisDocument {
  const now = nowISO();
  const chapters = {} as Record<ChapterId, ChapterDraft>;
  for (const c of CHAPTER_ORDER) chapters[c] = emptyChapter(c);
  return {
    id: generateId(),
    title,
    chapters,
    createdAt: now,
    updatedAt: now,
  };
}

export function addSection(
  doc: ThesisDocument,
  chapterId: ChapterId,
  heading: string = "New section"
): ThesisDocument {
  const now = nowISO();
  const section: ChapterSection = {
    id: generateId(),
    heading,
    body: "",
    draft: true,
    linkedQuoteIds: [],
    unresolvedMarkerCount: 0,
    createdAt: now,
    updatedAt: now,
  };
  const chapter = doc.chapters[chapterId];
  return {
    ...doc,
    updatedAt: now,
    chapters: {
      ...doc.chapters,
      [chapterId]: {
        ...chapter,
        sections: [...chapter.sections, section],
        updatedAt: now,
      },
    },
  };
}

export function updateSection(
  doc: ThesisDocument,
  chapterId: ChapterId,
  sectionId: string,
  patch: Partial<Omit<ChapterSection, "id">>
): ThesisDocument {
  const now = nowISO();
  const chapter = doc.chapters[chapterId];
  let touched = false;
  const sections = chapter.sections.map((s) => {
    if (s.id !== sectionId) return s;
    touched = true;
    const next: ChapterSection = { ...s, ...patch, updatedAt: now };
    if (typeof patch.body === "string") {
      next.unresolvedMarkerCount = countMarkers(patch.body);
    }
    return next;
  });
  if (!touched) return doc;
  const wordCount = sections.reduce(
    (acc, s) => acc + wordCountOf(s.body),
    0
  );
  return {
    ...doc,
    updatedAt: now,
    chapters: {
      ...doc.chapters,
      [chapterId]: {
        ...chapter,
        sections,
        wordCount,
        updatedAt: now,
      },
    },
  };
}

export function removeSection(
  doc: ThesisDocument,
  chapterId: ChapterId,
  sectionId: string
): ThesisDocument {
  const now = nowISO();
  const chapter = doc.chapters[chapterId];
  const sections = chapter.sections.filter((s) => s.id !== sectionId);
  const wordCount = sections.reduce(
    (acc, s) => acc + wordCountOf(s.body),
    0
  );
  return {
    ...doc,
    updatedAt: now,
    chapters: {
      ...doc.chapters,
      [chapterId]: { ...chapter, sections, wordCount, updatedAt: now },
    },
  };
}

export function reorderSections(
  doc: ThesisDocument,
  chapterId: ChapterId,
  fromIndex: number,
  toIndex: number
): ThesisDocument {
  const chapter = doc.chapters[chapterId];
  if (fromIndex === toIndex) return doc;
  if (fromIndex < 0 || fromIndex >= chapter.sections.length) return doc;
  if (toIndex < 0 || toIndex >= chapter.sections.length) return doc;
  const sections = [...chapter.sections];
  const [moved] = sections.splice(fromIndex, 1);
  sections.splice(toIndex, 0, moved);
  return {
    ...doc,
    updatedAt: nowISO(),
    chapters: {
      ...doc.chapters,
      [chapterId]: { ...chapter, sections, updatedAt: nowISO() },
    },
  };
}

// ─── Wordcount + marker scanning ───────────────────────────────

const MARKER_RE = /\[(?:needs\s+citation|tk|todo|fact-check|unresolved)\]/gi;

export function countMarkers(text: string): number {
  if (!text) return 0;
  const matches = text.match(MARKER_RE);
  return matches ? matches.length : 0;
}

export function wordCountOf(text: string): number {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function totalWordCount(doc: ThesisDocument): number {
  return CHAPTER_ORDER.reduce(
    (acc, id) => acc + (doc.chapters[id]?.wordCount ?? 0),
    0
  );
}

// ─── Outline ──────────────────────────────────────────────────

export interface OutlineEntry {
  chapterId: ChapterId;
  chapterLabel: string;
  wordCount: number;
  sections: Array<{
    id: string;
    heading: string;
    wordCount: number;
    draft: boolean;
    unresolvedMarkerCount: number;
  }>;
}

export function outline(doc: ThesisDocument): OutlineEntry[] {
  return CHAPTER_ORDER.map((id) => {
    const chapter = doc.chapters[id];
    return {
      chapterId: id,
      chapterLabel: CHAPTER_LABELS[id],
      wordCount: chapter.wordCount,
      sections: chapter.sections.map((s) => ({
        id: s.id,
        heading: s.heading,
        wordCount: wordCountOf(s.body),
        draft: s.draft,
        unresolvedMarkerCount: s.unresolvedMarkerCount,
      })),
    };
  });
}

// ─── Snapshots ────────────────────────────────────────────────

export interface ThesisSnapshot {
  id: string;
  documentId: string;
  label: string;
  takenAt: string;
  // A frozen copy of the document at the time of the snapshot.
  document: ThesisDocument;
}

export function takeSnapshot(
  doc: ThesisDocument,
  label: string
): ThesisSnapshot {
  return {
    id: generateId(),
    documentId: doc.id,
    label: label.trim() || `Snapshot · ${doc.updatedAt}`,
    takenAt: nowISO(),
    document: JSON.parse(JSON.stringify(doc)) as ThesisDocument,
  };
}

export function snapshotsFor(
  snapshots: ThesisSnapshot[],
  documentId: string
): ThesisSnapshot[] {
  return snapshots
    .filter((s) => s.documentId === documentId)
    .sort((a, b) => b.takenAt.localeCompare(a.takenAt));
}
