// Psych localStorage persistence layer.
// All reads/writes go through these utilities.
// To migrate to Supabase: replace loadFromStorage/saveToStorage
// with async fetch calls and update AppContext accordingly.

export function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const stored = window.localStorage.getItem(key);
    return stored ? (JSON.parse(stored) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function saveToStorage<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage quota exceeded or private mode
  }
}

export function removeFromStorage(key: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key);
  } catch {}
}

export function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

export function nowISO(): string {
  return new Date().toISOString();
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-CA");
}

export const STORE_KEYS = {
  CASES: "psych-cases-v2",
  CHECKINS: "psych-checkins-v2",
  WEEKLY: "psych-weekly-v2",
  MONTHLY: "psych-monthly-v2",
  ASSESSMENTS: "psych-assessments-v2",
  SUPERVISION: "psych-supervision-v2",
  GOALS: "psych-goals-v2",
  TRANSCRIPTS: "psych-transcripts-v2",
  FILES: "psych-files-v2",
  SESSIONS: "psych-sessions-v2",
  PINNED: "psych-pinned-v2",
} as const;
