// Save point-in-time snapshots of a FormulationCanvas so users can track
// how their formulation evolves. Pure logic — caller persists the result.

import { generateId, nowISO } from "@/lib/store";
import type { FormulationCanvas, FormulationModel } from "@/lib/clinical-data";

export const FORMULATION_SNAPSHOTS_STORAGE_KEY =
  "psych-formulation-snapshots-v1";

export interface FormulationSnapshot {
  id: string;
  canvasId: string;
  caseId: string;
  model: FormulationModel;
  title: string;
  sections: Record<string, string>;
  createdAt: string;
  note?: string;
}

export function createSnapshot(
  canvas: FormulationCanvas,
  note?: string
): FormulationSnapshot {
  return {
    id: generateId(),
    canvasId: canvas.id,
    caseId: canvas.caseId,
    model: canvas.model,
    title: canvas.title,
    sections: { ...canvas.sections },
    createdAt: nowISO(),
    note,
  };
}

export function snapshotsForCanvas(
  snapshots: FormulationSnapshot[],
  canvasId: string
): FormulationSnapshot[] {
  return snapshots
    .filter((s) => s.canvasId === canvasId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function snapshotsForCase(
  snapshots: FormulationSnapshot[],
  caseId: string
): FormulationSnapshot[] {
  return snapshots
    .filter((s) => s.caseId === caseId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

// Diff between two snapshots: returns sections that were added,
// removed, or changed.
export interface SnapshotDiff {
  added: string[];
  removed: string[];
  changed: string[];
  unchanged: string[];
}

export function diffSnapshots(
  before: FormulationSnapshot,
  after: FormulationSnapshot
): SnapshotDiff {
  const keySet = new Set<string>();
  Object.keys(before.sections).forEach((k) => keySet.add(k));
  Object.keys(after.sections).forEach((k) => keySet.add(k));
  const keys = Array.from(keySet);
  const added: string[] = [];
  const removed: string[] = [];
  const changed: string[] = [];
  const unchanged: string[] = [];
  for (const k of keys) {
    const a = before.sections[k] ?? "";
    const b = after.sections[k] ?? "";
    if (!a && b) added.push(k);
    else if (a && !b) removed.push(k);
    else if (a !== b) changed.push(k);
    else unchanged.push(k);
  }
  return { added, removed, changed, unchanged };
}
