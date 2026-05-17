// Mock therapist→client assignments. Persisted in localStorage so the
// two portals can read the same data. No backend yet.

import { loadFromStorage, saveToStorage, generateId, nowISO } from "@/lib/store";

export const ASSIGNMENTS_STORAGE_KEY = "psych-client-assignments-v1";

export type AssignmentKind =
  | "workbook"
  | "card"
  | "journey"
  | "note"
  | "assessment";

export interface ClientAssignment {
  id: string;
  kind: AssignmentKind;
  // For workbook / journey, this is the id. For card, it's the card id.
  // For note, this is unused.
  targetId?: string;
  // Free-text supportive note placeholder from the therapist.
  note?: string;
  // Optional case the assignment is linked to (therapist-side context).
  caseId?: string;
  createdAt: string;
  // Read-by-client flag (client portal sets this on view).
  acknowledged?: boolean;
}

export function loadAssignments(): ClientAssignment[] {
  return loadFromStorage<ClientAssignment[]>(ASSIGNMENTS_STORAGE_KEY, []);
}

export function saveAssignments(items: ClientAssignment[]): void {
  saveToStorage(ASSIGNMENTS_STORAGE_KEY, items);
}

export function createAssignment(
  data: Partial<ClientAssignment>
): ClientAssignment {
  return {
    id: generateId(),
    kind: data.kind ?? "note",
    targetId: data.targetId,
    note: data.note,
    caseId: data.caseId,
    createdAt: nowISO(),
    acknowledged: false,
    ...data,
  } as ClientAssignment;
}

export function acknowledge(
  items: ClientAssignment[],
  id: string
): ClientAssignment[] {
  return items.map((a) => (a.id === id ? { ...a, acknowledged: true } : a));
}

export function removeAssignment(
  items: ClientAssignment[],
  id: string
): ClientAssignment[] {
  return items.filter((a) => a.id !== id);
}
