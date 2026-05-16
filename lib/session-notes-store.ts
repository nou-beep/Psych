// Persistence helpers for SessionNoteDraft. Pure key access — kept thin
// so the planner page and the dedicated notes page share one source of
// truth without needing a context provider.

import { loadFromStorage, saveToStorage } from "@/lib/store";
import type { SessionNoteDraft } from "@/lib/session-convert";

export const SESSION_NOTES_STORAGE_KEY = "psych-session-notes-v1";

export function loadSessionNotes(): SessionNoteDraft[] {
  return loadFromStorage<SessionNoteDraft[]>(SESSION_NOTES_STORAGE_KEY, []);
}

export function saveSessionNotes(notes: SessionNoteDraft[]): void {
  saveToStorage(SESSION_NOTES_STORAGE_KEY, notes);
}

export function upsertSessionNote(
  notes: SessionNoteDraft[],
  next: SessionNoteDraft
): SessionNoteDraft[] {
  const idx = notes.findIndex((n) => n.id === next.id);
  if (idx === -1) return [next, ...notes];
  const copy = [...notes];
  copy[idx] = next;
  return copy;
}

export function removeSessionNote(
  notes: SessionNoteDraft[],
  id: string
): SessionNoteDraft[] {
  return notes.filter((n) => n.id !== id);
}
