// Quick Capture — floating inbox for thoughts captured anywhere in Eyla.
// Pure data; the UI binds to it.

import { generateId, nowISO } from "@/lib/store";

export type CaptureKind =
  | "quote"
  | "observation"
  | "hypothesis"
  | "reminder"
  | "clinical-note"
  | "transcript-fragment"
  | "body-sensation"
  | "participant-insight"
  | "research-idea"
  | "thesis-thought"
  | "supervision-point"
  | "session-follow-up"
  | "article-insight";

export const CAPTURE_KIND_LABELS: Record<CaptureKind, string> = {
  quote: "Quote",
  observation: "Observation",
  hypothesis: "Hypothesis",
  reminder: "Reminder",
  "clinical-note": "Clinical note",
  "transcript-fragment": "Transcript fragment",
  "body-sensation": "Body sensation",
  "participant-insight": "Participant insight",
  "research-idea": "Research idea",
  "thesis-thought": "Thesis thought",
  "supervision-point": "Supervision point",
  "session-follow-up": "Session follow-up",
  "article-insight": "Article insight",
};

export const CAPTURE_KINDS: CaptureKind[] = Object.keys(
  CAPTURE_KIND_LABELS
) as CaptureKind[];

export type CaptureStatus = "inbox" | "processed" | "archived";

export type CaptureColor =
  | "default"
  | "amber"
  | "rose"
  | "violet"
  | "teal"
  | "slate";

export interface CaptureLink {
  // Anchors a capture to something in the app — these are loose IDs the
  // UI can resolve in context (case id, participant id, etc.).
  kind:
    | "case"
    | "participant"
    | "thesis-chapter"
    | "article"
    | "timeline"
    | "assessment"
    | "session"
    | "transcript";
  id: string;
  label?: string;
}

export interface CaptureNote {
  id: string;
  kind: CaptureKind;
  body: string;
  tags: string[];
  links: CaptureLink[];
  color: CaptureColor;
  pinned: boolean;
  status: CaptureStatus;
  createdAt: string;
  updatedAt: string;
  // Source label — where the capture happened, e.g. a route path.
  source?: string;
}

export const QUICK_CAPTURE_STORAGE_KEY = "psych-quick-capture-v1";

export function newCapture(input: {
  kind?: CaptureKind;
  body: string;
  tags?: string[];
  links?: CaptureLink[];
  color?: CaptureColor;
  pinned?: boolean;
  source?: string;
}): CaptureNote {
  const now = nowISO();
  return {
    id: generateId(),
    kind: input.kind ?? "observation",
    body: input.body.trim(),
    tags: (input.tags ?? []).map((t) => t.trim()).filter(Boolean),
    links: input.links ?? [],
    color: input.color ?? "default",
    pinned: input.pinned ?? false,
    status: "inbox",
    createdAt: now,
    updatedAt: now,
    source: input.source,
  };
}

export function patchCapture(
  list: CaptureNote[],
  id: string,
  patch: Partial<Omit<CaptureNote, "id" | "createdAt">>
): CaptureNote[] {
  return list.map((c) =>
    c.id === id ? { ...c, ...patch, updatedAt: nowISO() } : c
  );
}

export function processCapture(
  list: CaptureNote[],
  id: string
): CaptureNote[] {
  return patchCapture(list, id, { status: "processed" });
}

export function archiveCapture(
  list: CaptureNote[],
  id: string
): CaptureNote[] {
  return patchCapture(list, id, { status: "archived" });
}

export function restoreCapture(
  list: CaptureNote[],
  id: string
): CaptureNote[] {
  return patchCapture(list, id, { status: "inbox" });
}

export function pinCapture(
  list: CaptureNote[],
  id: string,
  pinned: boolean
): CaptureNote[] {
  return patchCapture(list, id, { pinned });
}

export function removeCapture(
  list: CaptureNote[],
  id: string
): CaptureNote[] {
  return list.filter((c) => c.id !== id);
}

// ─── Views ────────────────────────────────────────────────────

export function inboxView(list: CaptureNote[]): CaptureNote[] {
  return list
    .filter((c) => c.status === "inbox")
    .sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return b.createdAt.localeCompare(a.createdAt);
    });
}

export function byKind(list: CaptureNote[]): Record<CaptureKind, CaptureNote[]> {
  const out = {} as Record<CaptureKind, CaptureNote[]>;
  for (const k of CAPTURE_KINDS) out[k] = [];
  for (const c of list) out[c.kind].push(c);
  return out;
}

export function byLinkTarget(
  list: CaptureNote[],
  kind: CaptureLink["kind"],
  id: string
): CaptureNote[] {
  return list.filter((c) =>
    c.links.some((l) => l.kind === kind && l.id === id)
  );
}

export function searchCaptures(
  list: CaptureNote[],
  query: string
): CaptureNote[] {
  const q = query.trim().toLowerCase();
  if (!q) return list;
  return list.filter((c) => {
    const hay = [
      c.body,
      c.tags.join(" "),
      c.kind,
      c.source ?? "",
      c.links.map((l) => `${l.kind}:${l.label ?? l.id}`).join(" "),
    ]
      .join(" ")
      .toLowerCase();
    return hay.includes(q);
  });
}

// ─── Stats ────────────────────────────────────────────────────

export interface CaptureStats {
  total: number;
  inbox: number;
  processed: number;
  archived: number;
  pinned: number;
  byKind: Record<CaptureKind, number>;
}

export function captureStats(list: CaptureNote[]): CaptureStats {
  const byKindCount = {} as Record<CaptureKind, number>;
  for (const k of CAPTURE_KINDS) byKindCount[k] = 0;
  let inbox = 0;
  let processed = 0;
  let archived = 0;
  let pinned = 0;
  for (const c of list) {
    byKindCount[c.kind]++;
    if (c.status === "inbox") inbox++;
    else if (c.status === "processed") processed++;
    else if (c.status === "archived") archived++;
    if (c.pinned) pinned++;
  }
  return {
    total: list.length,
    inbox,
    processed,
    archived,
    pinned,
    byKind: byKindCount,
  };
}
