// Desk objects — pinned quotes, sticky reminders, "read later" articles,
// transcript fragments, unfinished formulations. NOT decorative — they
// link to real artefacts in the workspace (case ids, quote bank entries,
// transcript ids, report draft ids).

import { generateId, nowISO } from "@/lib/store";

export type DeskObjectKind =
  | "pinned-quote"
  | "sticky-reminder"
  | "open-notebook"
  | "active-report"
  | "transcript-fragment"
  | "read-later"
  | "supervision-reminder"
  | "unfinished-formulation"
  | "highlighted-excerpt";

export const DESK_OBJECT_LABELS: Record<DeskObjectKind, string> = {
  "pinned-quote": "Pinned quote",
  "sticky-reminder": "Sticky reminder",
  "open-notebook": "Open notebook",
  "active-report": "Active report",
  "transcript-fragment": "Transcript fragment",
  "read-later": "Read later",
  "supervision-reminder": "Supervision reminder",
  "unfinished-formulation": "Unfinished formulation",
  "highlighted-excerpt": "Highlighted excerpt",
};

export type DeskObjectColor =
  | "rose"
  | "sage"
  | "violet"
  | "amber"
  | "neutral";

export interface DeskObject {
  id: string;
  kind: DeskObjectKind;
  body: string;
  color: DeskObjectColor;
  // The artefact this object points to (case id, transcript id, quote
  // id, report draft id, formulation id, …). Open-ended on purpose.
  linkRef?: {
    kind:
      | "case"
      | "transcript"
      | "report"
      | "quote"
      | "formulation"
      | "supervision"
      | "literature";
    id: string;
  };
  // Optional case scoping — surface this object on a case desktop only.
  caseId?: string;
  // Tags reused across the app.
  tags: string[];
  pinned: boolean;
  // 2D coordinates 0..1 — the desktop UI lets the user drag objects
  // freely; persisting normalised coords keeps the layout resolution-
  // independent.
  x: number;
  y: number;
  // Stacking order — desktop renderer uses this to layer objects.
  z: number;
  createdAt: string;
  updatedAt: string;
}

export const DESK_OBJECTS_STORAGE_KEY = "psych-desk-objects-v1";

export function emptyDeskObject(
  kind: DeskObjectKind,
  overrides: Partial<DeskObject> = {}
): DeskObject {
  const now = nowISO();
  return {
    id: generateId(),
    kind,
    body: "",
    color: "rose",
    tags: [],
    pinned: false,
    x: 0.35 + Math.random() * 0.3,
    y: 0.35 + Math.random() * 0.3,
    z: 0,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

export function patch(obj: DeskObject, p: Partial<DeskObject>): DeskObject {
  return { ...obj, ...p, updatedAt: nowISO() };
}

export function bringToFront(objs: DeskObject[], id: string): DeskObject[] {
  const max = objs.reduce((m, o) => Math.max(m, o.z), 0);
  return objs.map((o) => (o.id === id ? { ...o, z: max + 1 } : o));
}

export function forCase(objs: DeskObject[], caseId: string): DeskObject[] {
  return objs.filter((o) => o.caseId === caseId);
}

export function unscoped(objs: DeskObject[]): DeskObject[] {
  return objs.filter((o) => !o.caseId);
}

// Sort by pinned-first, then by z-index (newer interactions on top).
export function visibleOrder(objs: DeskObject[]): DeskObject[] {
  return [...objs].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return a.z - b.z;
  });
}
