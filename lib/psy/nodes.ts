// Psychological node model — every "thing" the platform tracks (a body
// sensation, a thought, an emotion, a memory, a person, a recurring
// theme, a defense pattern, a distortion, a relational role, a
// session) is a PsyNode. Nodes link to each other via PsyLink.
//
// This file owns ONLY the data shape + helpers. Persistence is the
// caller's responsibility; storage helpers are exposed below.

import { generateId, nowISO } from "@/lib/store";

export type NodeKind =
  // Client-side first-class kinds
  | "body-sensation"
  | "thought"
  | "emotion"
  | "situation"
  | "memory"
  | "behavior"
  | "person"
  // Therapist-side first-class kinds (recurring observations)
  | "defense"
  | "distortion"
  | "role"
  | "thread"
  | "conflict"
  // Cross-cutting
  | "session"
  | "intervention-ref"
  | "assessment-ref";

export const KIND_LABELS: Record<NodeKind, string> = {
  "body-sensation": "Body sensation",
  thought: "Thought",
  emotion: "Emotion",
  situation: "Situation / event",
  memory: "Memory",
  behavior: "Behavior",
  person: "Person",
  defense: "Defense pattern",
  distortion: "Cognitive distortion",
  role: "Relational role",
  thread: "Recurring thread",
  conflict: "Internal conflict",
  session: "Session",
  "intervention-ref": "Intervention",
  "assessment-ref": "Assessment",
};

// Subset that clients can author (others are therapist-side observations).
export const CLIENT_AUTHORABLE_KINDS: NodeKind[] = [
  "body-sensation",
  "thought",
  "emotion",
  "situation",
  "memory",
  "behavior",
  "person",
];

export const THERAPIST_ONLY_KINDS: NodeKind[] = [
  "defense",
  "distortion",
  "role",
  "thread",
  "conflict",
];

export interface PsyNode {
  id: string;
  caseId: string;
  kind: NodeKind;
  label: string;
  // Free-text description.
  notes: string;
  // Intensity 0–10 (e.g. body-sensation strength). Optional.
  intensity?: number;
  // ISO date YYYY-MM-DD. The "when this was current".
  date: string;
  // Tags reused across nodes (e.g. "shame", "abandonment"). These are
  // also what the threads engine uses to find recurring themes.
  tags: string[];
  // Optional kind-specific payload — kept open so the UI can extend
  // safely without schema migrations.
  meta?: {
    // Body-sensation: anatomical region id (see lib/psy/body-regions.ts)
    bodyRegion?: string;
    // Thought-web: free position on the canvas (0–1 normalised).
    x?: number;
    y?: number;
    // Defense / distortion / role: canonical category id.
    category?: string;
    // Therapist-side ownership.
    authoredBy?: "therapist" | "client";
    // Visibility.
    sharedWithTherapist?: boolean;
    sharedWithClient?: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export const NODES_STORAGE_KEY = "psych-psy-nodes-v1";

export function emptyNode(
  caseId: string,
  kind: NodeKind,
  overrides: Partial<PsyNode> = {}
): PsyNode {
  const now = nowISO();
  return {
    id: generateId(),
    caseId,
    kind,
    label: "",
    notes: "",
    date: new Date().toISOString().split("T")[0],
    tags: [],
    meta: {
      authoredBy: "therapist",
      sharedWithTherapist: true,
      sharedWithClient: false,
    },
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

export function update(node: PsyNode, patch: Partial<PsyNode>): PsyNode {
  return { ...node, ...patch, updatedAt: nowISO() };
}

// ─── Filters ────────────────────────────────────────────────────

export function nodesForCase(nodes: PsyNode[], caseId: string): PsyNode[] {
  return nodes.filter((n) => n.caseId === caseId);
}

export function nodesOfKind(
  nodes: PsyNode[],
  kind: NodeKind,
  caseId?: string
): PsyNode[] {
  return nodes.filter(
    (n) => n.kind === kind && (!caseId || n.caseId === caseId)
  );
}

export function visibleToClient(nodes: PsyNode[]): PsyNode[] {
  // The client only ever sees their own authored nodes plus anything
  // the therapist explicitly shared with them.
  return nodes.filter(
    (n) =>
      n.meta?.authoredBy === "client" || n.meta?.sharedWithClient === true
  );
}

export function visibleToTherapist(nodes: PsyNode[]): PsyNode[] {
  // The therapist sees their own authored nodes plus anything the
  // client has shared.
  return nodes.filter(
    (n) =>
      n.meta?.authoredBy === "therapist" || n.meta?.sharedWithTherapist === true
  );
}

// ─── Tag helpers ────────────────────────────────────────────────

// Returns a frequency map { tag → count } across the supplied nodes.
// Used by threads, body-map heat maps, and the recurring-distortion view.
export function tagFrequency(nodes: PsyNode[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const n of nodes) {
    for (const t of n.tags) {
      out[t] = (out[t] ?? 0) + 1;
    }
  }
  return out;
}

export function topTags(
  nodes: PsyNode[],
  limit: number = 10
): Array<{ tag: string; count: number }> {
  return Object.entries(tagFrequency(nodes))
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}
