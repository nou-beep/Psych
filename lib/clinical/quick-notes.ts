// Quick Notes — clinician's informal thinking space. Sticky-note style.
// NOT formal case notes. Pinned, colour-tagged, fast-add, searchable.

import { generateId, nowISO } from "@/lib/store";

export type NoteColour = "rose" | "sage" | "violet" | "amber" | "neutral";

export const NOTE_COLOURS: Record<NoteColour, { tint: string; accent: string }> = {
  rose: { tint: "rgba(199,125,170,0.18)", accent: "#9F1239" },
  sage: { tint: "rgba(110,138,123,0.18)", accent: "#3D5C3D" },
  violet: { tint: "rgba(152,130,192,0.18)", accent: "#7C3AED" },
  amber: { tint: "rgba(198,140,88,0.18)", accent: "#B07A4F" },
  neutral: { tint: "rgba(120,120,140,0.14)", accent: "#475569" },
};

export interface QuickNote {
  id: string;
  body: string;
  colour: NoteColour;
  pinned: boolean;
  tags: string[];
  caseId?: string;
  createdAt: string;
  updatedAt: string;
}

export const QUICK_NOTES_STORAGE_KEY = "psych-quick-notes-v1";

export function emptyNote(overrides: Partial<QuickNote> = {}): QuickNote {
  const now = nowISO();
  return {
    id: generateId(),
    body: "",
    colour: "rose",
    pinned: false,
    tags: [],
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

export function update(n: QuickNote, patch: Partial<QuickNote>): QuickNote {
  return { ...n, ...patch, updatedAt: nowISO() };
}

export function togglePin(n: QuickNote): QuickNote {
  return update(n, { pinned: !n.pinned });
}

// Returns notes with pinned at the top, newest first within each group.
export function orderForBoard(notes: QuickNote[]): QuickNote[] {
  return [...notes].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return b.updatedAt.localeCompare(a.updatedAt);
  });
}

export function search(notes: QuickNote[], query: string): QuickNote[] {
  const q = query.trim().toLowerCase();
  if (!q) return notes;
  return notes.filter((n) => {
    const hay = `${n.body} ${n.tags.join(" ")}`.toLowerCase();
    return hay.includes(q);
  });
}

export function forCase(notes: QuickNote[], caseId: string): QuickNote[] {
  return notes.filter((n) => n.caseId === caseId);
}
