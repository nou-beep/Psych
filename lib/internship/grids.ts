// Grid record helpers — create a grid from a shell, add / remove
// entries, fill the weekly synthesis paragraph.

import { generateId, nowISO } from "@/lib/store";
import { findGridShell } from "./grid-library";
import type { InternshipGrid, InternshipGridEntry } from "./types";

export function newGridFromShell(input: {
  caseId: string;
  shellId: string;
  linkedTestId?: string;
  name?: string;
}): InternshipGrid | null {
  const shell = findGridShell(input.shellId);
  if (!shell) return null;
  const now = nowISO();
  return {
    id: generateId(),
    caseId: input.caseId,
    shellId: shell.id,
    name: input.name ?? shell.name,
    linkedTestIds: input.linkedTestId ? [input.linkedTestId] : [],
    entries: [],
    createdAt: now,
    updatedAt: now,
  };
}

export function addEntry(
  list: InternshipGrid[],
  gridId: string,
  entry: Omit<InternshipGridEntry, "id" | "createdAt">
): InternshipGrid[] {
  const now = nowISO();
  return list.map((g) => {
    if (g.id !== gridId) return g;
    const next: InternshipGridEntry = {
      id: generateId(),
      ...entry,
      createdAt: now,
    };
    return { ...g, entries: [...g.entries, next], updatedAt: now };
  });
}

export function patchEntry(
  list: InternshipGrid[],
  gridId: string,
  entryId: string,
  patch: Partial<Omit<InternshipGridEntry, "id" | "createdAt">>
): InternshipGrid[] {
  const now = nowISO();
  return list.map((g) => {
    if (g.id !== gridId) return g;
    return {
      ...g,
      entries: g.entries.map((e) =>
        e.id === entryId ? { ...e, ...patch } : e
      ),
      updatedAt: now,
    };
  });
}

export function removeEntry(
  list: InternshipGrid[],
  gridId: string,
  entryId: string
): InternshipGrid[] {
  const now = nowISO();
  return list.map((g) => {
    if (g.id !== gridId) return g;
    return {
      ...g,
      entries: g.entries.filter((e) => e.id !== entryId),
      updatedAt: now,
    };
  });
}

export function setWeeklySynthesis(
  list: InternshipGrid[],
  gridId: string,
  synthesis: string
): InternshipGrid[] {
  const now = nowISO();
  return list.map((g) =>
    g.id === gridId
      ? { ...g, weeklySynthesis: synthesis, updatedAt: now }
      : g
  );
}

export function linkTestToGrid(
  list: InternshipGrid[],
  gridId: string,
  testId: string
): InternshipGrid[] {
  const now = nowISO();
  return list.map((g) => {
    if (g.id !== gridId) return g;
    if (g.linkedTestIds.includes(testId)) return g;
    return {
      ...g,
      linkedTestIds: [...g.linkedTestIds, testId],
      updatedAt: now,
    };
  });
}

export function gridsForCase(
  list: InternshipGrid[],
  caseId: string
): InternshipGrid[] {
  return list.filter((g) => g.caseId === caseId);
}
