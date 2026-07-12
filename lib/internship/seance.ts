// Séance — the first-class per-session record for the Espace séance
// workspace. Discovery (May 2026) found no existing session model:
// sessions were implicit (a `sessionLabel` string on grid/score-set
// administrations plus session-shaped daily reports). This module
// creates the entity that groups one session's work.
//
// Design constraints:
// - Every sub-item is its own record with id + timestamp, NOT a text
//   blob — this is the future evidence source for contextual
//   generation (each generated sentence must be able to cite the
//   record it came from).
// - Pure functions only; React state + persistence live in
//   contexts/SeanceContext.tsx. localStorage key: eyla-seances-v1.
// - No hard delete from the workspace surface — archive/restore only
//   (same pattern as session-memory).
// - `context` is 'stage' today; 'therapist' is reserved so the same
//   model + permission helper serve the Espace Thérapeute later.

import {
  generateId,
  loadFromStorage,
  nowISO,
  saveToStorage,
} from "@/lib/store";

export const SEANCES_STORAGE_KEY = "eyla-seances-v1";

// ─── Types ────────────────────────────────────────────────────

export type SeanceContext = "stage" | "therapist";
export type SeanceStatus = "draft" | "finalised";

export type SeanceNoteType =
  | "general"
  | "reflection"
  | "incident"
  | "verbatim";

export const SEANCE_NOTE_TYPES: ReadonlyArray<SeanceNoteType> = [
  "general",
  "reflection",
  "incident",
  "verbatim",
] as const;

/**
 * Observation categories for the structured center column. The value
 * comes from the ScoreSet `frequencySchema` (jamais → très souvent,
 * N/O) — reusing the engine, not inventing a new scale.
 */
export type SeanceObservationCategory =
  | "communication"
  | "sensory"
  | "attention"
  | "regulation"
  | "social";

export const SEANCE_OBSERVATION_CATEGORIES: ReadonlyArray<SeanceObservationCategory> =
  ["communication", "sensory", "attention", "regulation", "social"] as const;

export interface SeanceNote {
  id: string;
  createdAt: string;
  type: SeanceNoteType;
  text: string;
}

export interface SeanceObservation {
  id: string;
  createdAt: string;
  category: SeanceObservationCategory;
  /** A FrequencyValue from score-set-schemas (jamais | rarement | parfois | souvent | tres-souvent | non-observe). */
  value: string;
  note?: string;
}

export interface SeanceTodo {
  id: string;
  text: string;
  done: boolean;
}

export interface SeanceAppointment {
  date: string; // ISO date
  note?: string;
}

export interface Seance {
  id: string;
  dossierId: string;
  createdAt: string;
  updatedAt: string;
  /** Session date (ISO yyyy-mm-dd). */
  date: string;
  context: SeanceContext;
  status: SeanceStatus;
  archived: boolean;
  notes: SeanceNote[];
  observations: SeanceObservation[];
  linkedAssessmentIds: string[];
  linkedWorksheetIds: string[];
  homework: SeanceTodo[];
  followUps: SeanceTodo[];
  nextAppointment: SeanceAppointment | null;
}

// ─── Factory ──────────────────────────────────────────────────

export function newSeance(input: {
  dossierId: string;
  date?: string;
  context?: SeanceContext;
}): Seance {
  const now = nowISO();
  return {
    id: generateId(),
    dossierId: input.dossierId,
    createdAt: now,
    updatedAt: now,
    date: input.date ?? now.slice(0, 10),
    context: input.context ?? "stage",
    status: "draft",
    archived: false,
    notes: [],
    observations: [],
    linkedAssessmentIds: [],
    linkedWorksheetIds: [],
    homework: [],
    followUps: [],
    nextAppointment: null,
  };
}

// ─── Pure mutations (list → list) ─────────────────────────────

function touch(s: Seance): Seance {
  return { ...s, updatedAt: nowISO() };
}

function mapSeance(
  list: Seance[],
  id: string,
  fn: (s: Seance) => Seance
): Seance[] {
  return list.map((s) => (s.id === id ? touch(fn(s)) : s));
}

export function addSeance(list: Seance[], s: Seance): Seance[] {
  return [s, ...list];
}

export function patchSeance(
  list: Seance[],
  id: string,
  patch: Partial<
    Pick<Seance, "date" | "status" | "nextAppointment">
  >
): Seance[] {
  return mapSeance(list, id, (s) => ({ ...s, ...patch }));
}

export function finaliseSeance(list: Seance[], id: string): Seance[] {
  return mapSeance(list, id, (s) => ({ ...s, status: "finalised" }));
}

export function reopenSeance(list: Seance[], id: string): Seance[] {
  return mapSeance(list, id, (s) => ({ ...s, status: "draft" }));
}

export function archiveSeance(list: Seance[], id: string): Seance[] {
  return mapSeance(list, id, (s) => ({ ...s, archived: true }));
}

export function restoreSeance(list: Seance[], id: string): Seance[] {
  return mapSeance(list, id, (s) => ({ ...s, archived: false }));
}

// — Notes —

export function addSeanceNote(
  list: Seance[],
  seanceId: string,
  input: { type: SeanceNoteType; text: string }
): Seance[] {
  const note: SeanceNote = {
    id: generateId(),
    createdAt: nowISO(),
    type: input.type,
    text: input.text,
  };
  return mapSeance(list, seanceId, (s) => ({
    ...s,
    notes: [...s.notes, note],
  }));
}

export function removeSeanceNote(
  list: Seance[],
  seanceId: string,
  noteId: string
): Seance[] {
  return mapSeance(list, seanceId, (s) => ({
    ...s,
    notes: s.notes.filter((n) => n.id !== noteId),
  }));
}

// — Observations —

/**
 * Sets the observation for a category (one live observation per
 * category per séance — picking a new value replaces the previous
 * one; the optional note travels with it).
 */
export function setSeanceObservation(
  list: Seance[],
  seanceId: string,
  input: {
    category: SeanceObservationCategory;
    value: string;
    note?: string;
  }
): Seance[] {
  return mapSeance(list, seanceId, (s) => {
    const existing = s.observations.find(
      (o) => o.category === input.category
    );
    if (existing) {
      return {
        ...s,
        observations: s.observations.map((o) =>
          o.category === input.category
            ? { ...o, value: input.value, note: input.note ?? o.note }
            : o
        ),
      };
    }
    const obs: SeanceObservation = {
      id: generateId(),
      createdAt: nowISO(),
      category: input.category,
      value: input.value,
      note: input.note,
    };
    return { ...s, observations: [...s.observations, obs] };
  });
}

export function clearSeanceObservation(
  list: Seance[],
  seanceId: string,
  category: SeanceObservationCategory
): Seance[] {
  return mapSeance(list, seanceId, (s) => ({
    ...s,
    observations: s.observations.filter((o) => o.category !== category),
  }));
}

// — Homework / follow-ups —

function addTodo(items: SeanceTodo[], text: string): SeanceTodo[] {
  return [...items, { id: generateId(), text, done: false }];
}

function toggleTodo(items: SeanceTodo[], todoId: string): SeanceTodo[] {
  return items.map((t) =>
    t.id === todoId ? { ...t, done: !t.done } : t
  );
}

function removeTodo(items: SeanceTodo[], todoId: string): SeanceTodo[] {
  return items.filter((t) => t.id !== todoId);
}

export function addHomework(
  list: Seance[],
  seanceId: string,
  text: string
): Seance[] {
  return mapSeance(list, seanceId, (s) => ({
    ...s,
    homework: addTodo(s.homework, text),
  }));
}

export function toggleHomework(
  list: Seance[],
  seanceId: string,
  todoId: string
): Seance[] {
  return mapSeance(list, seanceId, (s) => ({
    ...s,
    homework: toggleTodo(s.homework, todoId),
  }));
}

export function removeHomework(
  list: Seance[],
  seanceId: string,
  todoId: string
): Seance[] {
  return mapSeance(list, seanceId, (s) => ({
    ...s,
    homework: removeTodo(s.homework, todoId),
  }));
}

export function addFollowUp(
  list: Seance[],
  seanceId: string,
  text: string
): Seance[] {
  return mapSeance(list, seanceId, (s) => ({
    ...s,
    followUps: addTodo(s.followUps, text),
  }));
}

export function toggleFollowUp(
  list: Seance[],
  seanceId: string,
  todoId: string
): Seance[] {
  return mapSeance(list, seanceId, (s) => ({
    ...s,
    followUps: toggleTodo(s.followUps, todoId),
  }));
}

export function removeFollowUp(
  list: Seance[],
  seanceId: string,
  todoId: string
): Seance[] {
  return mapSeance(list, seanceId, (s) => ({
    ...s,
    followUps: removeTodo(s.followUps, todoId),
  }));
}

// — Links —

export function toggleLinkedAssessment(
  list: Seance[],
  seanceId: string,
  assessmentId: string
): Seance[] {
  return mapSeance(list, seanceId, (s) => ({
    ...s,
    linkedAssessmentIds: s.linkedAssessmentIds.includes(assessmentId)
      ? s.linkedAssessmentIds.filter((x) => x !== assessmentId)
      : [...s.linkedAssessmentIds, assessmentId],
  }));
}

export function toggleLinkedWorksheet(
  list: Seance[],
  seanceId: string,
  worksheetId: string
): Seance[] {
  return mapSeance(list, seanceId, (s) => ({
    ...s,
    linkedWorksheetIds: s.linkedWorksheetIds.includes(worksheetId)
      ? s.linkedWorksheetIds.filter((x) => x !== worksheetId)
      : [...s.linkedWorksheetIds, worksheetId],
  }));
}

// ─── Queries ──────────────────────────────────────────────────

/**
 * Séances of one dossier, most recent first (by session date, then
 * createdAt for same-day séances). Archived excluded by default.
 */
export function seancesForDossier(
  list: Seance[],
  dossierId: string,
  opts: { includeArchived?: boolean } = {}
): Seance[] {
  return list
    .filter(
      (s) =>
        s.dossierId === dossierId &&
        (opts.includeArchived ? true : !s.archived)
    )
    .sort((a, b) => {
      if (a.date !== b.date) return b.date.localeCompare(a.date);
      return b.createdAt.localeCompare(a.createdAt);
    });
}

export function findSeance(
  list: Seance[],
  id: string
): Seance | undefined {
  return list.find((s) => s.id === id);
}

// ─── Permissions ──────────────────────────────────────────────

export interface SeancePermissions {
  canEdit: boolean;
  canFinalise: boolean;
  canReopen: boolean;
  canArchive: boolean;
  canRestore: boolean;
  canHardDelete: boolean;
  visibleToSupervisor: boolean;
}

/**
 * Pure permission rules by (context, status). The UI reads ONLY this
 * helper, so the therapist context can later ship different rules
 * without touching any component.
 *
 * Stage defaults: the stagiaire creates and edits drafts, finalises,
 * can archive/restore; séances are visible to the Encadrant
 * (supervision); no hard delete from the workspace surface.
 *
 * Therapist rules are provisional placeholders (same editing shape,
 * not supervisor-visible) until that portal's pass defines them.
 */
export function sessionPermissions(
  context: SeanceContext,
  status: SeanceStatus
): SeancePermissions {
  const draft = status === "draft";
  return {
    canEdit: draft,
    canFinalise: draft,
    canReopen: !draft,
    canArchive: true,
    canRestore: true,
    canHardDelete: false,
    visibleToSupervisor: context === "stage",
  };
}

// ─── Deterministic assembled view ─────────────────────────────
// A plain-text rendering of the séance's own records. This is
// FORMATTING, not inference — every line traces to a record the
// user encoded. It deliberately emits nothing for empty sections.

export interface AssembleLabels {
  date: string;
  status: Record<SeanceStatus, string>;
  observationsHeading: string;
  categories: Record<SeanceObservationCategory, string>;
  values: Record<string, string>;
  notesHeading: string;
  noteTypes: Record<SeanceNoteType, string>;
  homeworkHeading: string;
  followUpsHeading: string;
  doneMark: string;
  pendingMark: string;
  nextAppointmentHeading: string;
}

export const ASSEMBLE_LABELS_FR: AssembleLabels = {
  date: "Séance du",
  status: { draft: "Brouillon", finalised: "Finalisée" },
  observationsHeading: "Observations structurées",
  categories: {
    communication: "Communication",
    sensory: "Sensoriel",
    attention: "Attention",
    regulation: "Régulation",
    social: "Interaction sociale",
  },
  values: {
    jamais: "jamais",
    rarement: "rarement",
    parfois: "parfois",
    souvent: "souvent",
    "tres-souvent": "très souvent",
    "non-observe": "non observé",
  },
  notesHeading: "Notes",
  noteTypes: {
    general: "Note",
    reflection: "Réflexion",
    incident: "Événement",
    verbatim: "Verbatim",
  },
  homeworkHeading: "Devoirs",
  followUpsHeading: "Actions de suivi",
  doneMark: "[x]",
  pendingMark: "[ ]",
  nextAppointmentHeading: "Prochain rendez-vous",
};

/**
 * Deterministic plain-text assembly of one séance. Fixed input →
 * exact output (tested). Sections with no records are omitted
 * entirely — an empty séance assembles to just its header line.
 */
export function assembleSeanceText(
  seance: Seance,
  labels: AssembleLabels = ASSEMBLE_LABELS_FR
): string {
  const lines: string[] = [];
  lines.push(
    `${labels.date} ${seance.date} — ${labels.status[seance.status]}`
  );

  if (seance.observations.length > 0) {
    lines.push("");
    lines.push(`## ${labels.observationsHeading}`);
    // Canonical category order, not insertion order — deterministic.
    for (const cat of SEANCE_OBSERVATION_CATEGORIES) {
      const obs = seance.observations.find((o) => o.category === cat);
      if (!obs) continue;
      const valueLabel = labels.values[obs.value] ?? obs.value;
      const noteSuffix = obs.note ? ` — ${obs.note}` : "";
      lines.push(
        `- ${labels.categories[cat]} : ${valueLabel}${noteSuffix}`
      );
    }
  }

  if (seance.notes.length > 0) {
    lines.push("");
    lines.push(`## ${labels.notesHeading}`);
    for (const note of seance.notes) {
      lines.push(`- [${labels.noteTypes[note.type]}] ${note.text}`);
    }
  }

  if (seance.homework.length > 0) {
    lines.push("");
    lines.push(`## ${labels.homeworkHeading}`);
    for (const h of seance.homework) {
      lines.push(
        `- ${h.done ? labels.doneMark : labels.pendingMark} ${h.text}`
      );
    }
  }

  if (seance.followUps.length > 0) {
    lines.push("");
    lines.push(`## ${labels.followUpsHeading}`);
    for (const f of seance.followUps) {
      lines.push(
        `- ${f.done ? labels.doneMark : labels.pendingMark} ${f.text}`
      );
    }
  }

  if (seance.nextAppointment) {
    lines.push("");
    lines.push(
      `## ${labels.nextAppointmentHeading}`
    );
    lines.push(
      `- ${seance.nextAppointment.date}${
        seance.nextAppointment.note
          ? ` — ${seance.nextAppointment.note}`
          : ""
      }`
    );
  }

  return lines.join("\n");
}

// ─── Persistence ──────────────────────────────────────────────

export function loadSeances(): Seance[] {
  return loadFromStorage<Seance[]>(SEANCES_STORAGE_KEY, []);
}

export function saveSeances(list: Seance[]): void {
  saveToStorage(SEANCES_STORAGE_KEY, list);
}
