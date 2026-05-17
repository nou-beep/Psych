// Tracked loops — explicitly created open loops the user wants to
// remember across the workspace. Complements lib/research/open-loops
// which *derives* loops from other state.
//
// A tracked loop carries a surface (where it lives — thesis, case,
// transcript, etc), priority, emotional weight, optional revisit
// date, and a list of related materials so it shows the full mental
// thread it belongs to.

import { generateId, nowISO } from "@/lib/store";

export type LoopSurface =
  | "thesis"
  | "case"
  | "transcript"
  | "coding"
  | "report"
  | "assessment"
  | "supervision"
  | "article"
  | "session"
  | "global";

export const SURFACE_LABELS: Record<LoopSurface, string> = {
  thesis: "Thesis",
  case: "Case",
  transcript: "Transcript",
  coding: "Coding",
  report: "Report",
  assessment: "Assessment",
  supervision: "Supervision",
  article: "Article",
  session: "Session",
  global: "Workspace",
};

export type LoopPriority = "low" | "medium" | "high";

export const PRIORITY_LABELS: Record<LoopPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

// Emotional weight — how heavy this loop *feels* (separate from
// priority, which is about urgency). A high-weight, low-priority loop
// is a slow burn; a low-weight high-priority loop is a quick to-do.
export type EmotionalWeight = "light" | "moderate" | "heavy";

export const WEIGHT_LABELS: Record<EmotionalWeight, string> = {
  light: "Light",
  moderate: "Moderate",
  heavy: "Heavy",
};

export type LoopStatus = "open" | "in-progress" | "parked" | "resolved";

export const STATUS_LABELS: Record<LoopStatus, string> = {
  open: "Open",
  "in-progress": "In progress",
  parked: "Parked",
  resolved: "Resolved",
};

export interface RelatedMaterial {
  kind:
    | "case"
    | "transcript"
    | "article"
    | "quote"
    | "chapter"
    | "session"
    | "worksheet"
    | "assessment"
    | "thought";
  id: string;
  label: string;
  href?: string;
}

export interface TrackedLoop {
  id: string;
  title: string;
  body?: string;
  surface: LoopSurface;
  priority: LoopPriority;
  weight: EmotionalWeight;
  status: LoopStatus;
  // Optional ISO date the user wants to revisit by.
  revisitBy?: string;
  // Free tags.
  tags: string[];
  // Things linked to this loop.
  related: RelatedMaterial[];
  // Where the loop was opened — used to navigate back.
  sourcePath?: string;
  // Audit.
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  // Optional reflection captured when resolved.
  resolutionNote?: string;
}

export const TRACKED_LOOPS_STORAGE_KEY = "psych-tracked-loops-v1";

export function newLoop(input: {
  title: string;
  body?: string;
  surface?: LoopSurface;
  priority?: LoopPriority;
  weight?: EmotionalWeight;
  revisitBy?: string;
  tags?: string[];
  related?: RelatedMaterial[];
  sourcePath?: string;
}): TrackedLoop {
  const now = nowISO();
  return {
    id: generateId(),
    title: input.title.trim(),
    body: input.body?.trim(),
    surface: input.surface ?? "global",
    priority: input.priority ?? "medium",
    weight: input.weight ?? "moderate",
    status: "open",
    revisitBy: input.revisitBy,
    tags: (input.tags ?? []).map((t) => t.trim()).filter(Boolean),
    related: input.related ?? [],
    sourcePath: input.sourcePath,
    createdAt: now,
    updatedAt: now,
  };
}

export function patchLoop(
  list: TrackedLoop[],
  id: string,
  patch: Partial<Omit<TrackedLoop, "id" | "createdAt">>
): TrackedLoop[] {
  const now = nowISO();
  return list.map((l) =>
    l.id === id ? { ...l, ...patch, updatedAt: now } : l
  );
}

export function setStatus(
  list: TrackedLoop[],
  id: string,
  status: LoopStatus,
  resolutionNote?: string
): TrackedLoop[] {
  const now = nowISO();
  return list.map((l) => {
    if (l.id !== id) return l;
    const patch: Partial<TrackedLoop> = { status, updatedAt: now };
    if (status === "resolved") {
      patch.resolvedAt = now;
      if (resolutionNote) patch.resolutionNote = resolutionNote;
    }
    return { ...l, ...patch };
  });
}

export function addRelated(
  list: TrackedLoop[],
  id: string,
  material: RelatedMaterial
): TrackedLoop[] {
  return list.map((l) => {
    if (l.id !== id) return l;
    if (
      l.related.some(
        (r) => r.kind === material.kind && r.id === material.id
      )
    )
      return l;
    return {
      ...l,
      related: [...l.related, material],
      updatedAt: nowISO(),
    };
  });
}

export function removeLoop(
  list: TrackedLoop[],
  id: string
): TrackedLoop[] {
  return list.filter((l) => l.id !== id);
}

// ─── Views ────────────────────────────────────────────────────

export interface LoopFilter {
  surface?: LoopSurface;
  priority?: LoopPriority;
  weight?: EmotionalWeight;
  status?: LoopStatus;
  caseId?: string;
  tag?: string;
}

export function filterLoops(
  list: TrackedLoop[],
  filter: LoopFilter
): TrackedLoop[] {
  return list.filter((l) => {
    if (filter.surface && l.surface !== filter.surface) return false;
    if (filter.priority && l.priority !== filter.priority) return false;
    if (filter.weight && l.weight !== filter.weight) return false;
    if (filter.status && l.status !== filter.status) return false;
    if (filter.tag && !l.tags.includes(filter.tag)) return false;
    if (filter.caseId) {
      // A loop "belongs" to a case if any related material points to it.
      if (
        !l.related.some(
          (r) => r.kind === "case" && r.id === filter.caseId
        )
      )
        return false;
    }
    return true;
  });
}

export function loopsBySurface(
  list: TrackedLoop[]
): Record<LoopSurface, TrackedLoop[]> {
  const out = {} as Record<LoopSurface, TrackedLoop[]>;
  for (const s of Object.keys(SURFACE_LABELS) as LoopSurface[]) {
    out[s] = [];
  }
  for (const l of list) out[l.surface].push(l);
  return out;
}

// Rank by priority desc → revisitBy (earlier first) → updatedAt desc.
const PRIORITY_RANK: Record<LoopPriority, number> = {
  high: 3,
  medium: 2,
  low: 1,
};
const STATUS_RANK: Record<LoopStatus, number> = {
  "in-progress": 4,
  open: 3,
  parked: 2,
  resolved: 1,
};

export function rankLoops(list: TrackedLoop[]): TrackedLoop[] {
  return list.slice().sort((a, b) => {
    if (a.status !== b.status) {
      return STATUS_RANK[b.status] - STATUS_RANK[a.status];
    }
    if (a.priority !== b.priority) {
      return PRIORITY_RANK[b.priority] - PRIORITY_RANK[a.priority];
    }
    const aDate = a.revisitBy ?? "9999";
    const bDate = b.revisitBy ?? "9999";
    if (aDate !== bDate) return aDate.localeCompare(bDate);
    return b.updatedAt.localeCompare(a.updatedAt);
  });
}

// Loops that are stale: still open or in-progress and untouched for
// 14+ days, or whose revisitBy date has passed.
export function staleLoops(
  list: TrackedLoop[],
  nowMs: number = Date.now()
): TrackedLoop[] {
  const fourteenDaysMs = 14 * 24 * 60 * 60 * 1000;
  return list.filter((l) => {
    if (l.status === "resolved") return false;
    if (l.revisitBy) {
      const due = Date.parse(l.revisitBy);
      if (!Number.isNaN(due) && due < nowMs) return true;
    }
    const updated = Date.parse(l.updatedAt);
    if (!Number.isNaN(updated) && nowMs - updated > fourteenDaysMs) return true;
    return false;
  });
}

// ─── Stats ────────────────────────────────────────────────────

export interface LoopStats {
  total: number;
  open: number;
  inProgress: number;
  parked: number;
  resolved: number;
  highPriority: number;
  heavy: number;
  stale: number;
  bySurface: Record<LoopSurface, number>;
}

export function loopStats(list: TrackedLoop[]): LoopStats {
  const bySurface = {} as Record<LoopSurface, number>;
  for (const s of Object.keys(SURFACE_LABELS) as LoopSurface[]) {
    bySurface[s] = 0;
  }
  let open = 0,
    inProgress = 0,
    parked = 0,
    resolved = 0,
    highPriority = 0,
    heavy = 0;
  for (const l of list) {
    bySurface[l.surface]++;
    if (l.status === "open") open++;
    else if (l.status === "in-progress") inProgress++;
    else if (l.status === "parked") parked++;
    else if (l.status === "resolved") resolved++;
    if (l.priority === "high") highPriority++;
    if (l.weight === "heavy") heavy++;
  }
  return {
    total: list.length,
    open,
    inProgress,
    parked,
    resolved,
    highPriority,
    heavy,
    stale: staleLoops(list).length,
    bySurface,
  };
}
