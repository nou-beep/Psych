// Internship supervision notes — create, patch, and cross-link a
// supervision note to tests / grids / reports.

import { generateId, nowISO } from "@/lib/store";
import type { InternshipSupervisionNote } from "./types";

export function newSupervisionNote(input: {
  caseId: string;
  date: string;
  supervisor?: string;
  initial?: Partial<
    Omit<
      InternshipSupervisionNote,
      | "id"
      | "caseId"
      | "date"
      | "supervisor"
      | "linkedTestIds"
      | "linkedGridIds"
      | "linkedReportIds"
      | "createdAt"
      | "updatedAt"
    >
  >;
}): InternshipSupervisionNote {
  const now = nowISO();
  return {
    id: generateId(),
    caseId: input.caseId,
    date: input.date,
    supervisor: input.supervisor,
    ...(input.initial ?? {}),
    linkedTestIds: [],
    linkedGridIds: [],
    linkedReportIds: [],
    createdAt: now,
    updatedAt: now,
  };
}

export function patchSupervisionNote(
  list: InternshipSupervisionNote[],
  id: string,
  patch: Partial<
    Omit<InternshipSupervisionNote, "id" | "createdAt" | "caseId">
  >
): InternshipSupervisionNote[] {
  const now = nowISO();
  return list.map((n) =>
    n.id === id ? { ...n, ...patch, updatedAt: now } : n
  );
}

type LinkKind = "test" | "grid" | "report";

export function linkSupervisionTo(
  list: InternshipSupervisionNote[],
  noteId: string,
  kind: LinkKind,
  targetId: string
): InternshipSupervisionNote[] {
  const now = nowISO();
  return list.map((n) => {
    if (n.id !== noteId) return n;
    const key =
      kind === "test"
        ? "linkedTestIds"
        : kind === "grid"
        ? "linkedGridIds"
        : "linkedReportIds";
    if (n[key].includes(targetId)) return n;
    return { ...n, [key]: [...n[key], targetId], updatedAt: now };
  });
}

export function unlinkSupervisionFrom(
  list: InternshipSupervisionNote[],
  noteId: string,
  kind: LinkKind,
  targetId: string
): InternshipSupervisionNote[] {
  const now = nowISO();
  return list.map((n) => {
    if (n.id !== noteId) return n;
    const key =
      kind === "test"
        ? "linkedTestIds"
        : kind === "grid"
        ? "linkedGridIds"
        : "linkedReportIds";
    return {
      ...n,
      [key]: n[key].filter((id) => id !== targetId),
      updatedAt: now,
    };
  });
}

export function supervisionForCase(
  list: InternshipSupervisionNote[],
  caseId: string
): InternshipSupervisionNote[] {
  return list
    .filter((n) => n.caseId === caseId)
    .sort((a, b) => b.date.localeCompare(a.date));
}
