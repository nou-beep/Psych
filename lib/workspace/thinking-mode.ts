// Thinking Mode — freeform intellectual workspace.
//
// A non-linear writing surface: drag-positioned thought fragments,
// connections between them, optional clusters/colors. Not a chapter
// editor. Not a graph DB. Just a place to lay out half-formed ideas
// the way a researcher does on a wall of sticky notes.

import { generateId, nowISO } from "@/lib/store";

export type ThoughtKind =
  | "fragment" // a loose half-formed idea
  | "quote" // an extracted citation
  | "question" // an unresolved interpretation
  | "finding" // something the data suggested
  | "tension" // a contradiction noticed
  | "method" // methodological concern
  | "reference"; // a pinned article/source

export const THOUGHT_KIND_LABELS: Record<ThoughtKind, string> = {
  fragment: "Fragment",
  quote: "Quote",
  question: "Question",
  finding: "Finding",
  tension: "Tension",
  method: "Methodological",
  reference: "Reference",
};

export type ThoughtColor =
  | "default"
  | "amber"
  | "rose"
  | "violet"
  | "teal"
  | "slate"
  | "sage";

export interface Thought {
  id: string;
  kind: ThoughtKind;
  body: string;
  // Position on the canvas (px from top-left).
  x: number;
  y: number;
  // Width hint — height grows with content.
  width: number;
  color: ThoughtColor;
  // Optional pinning for "don't let me lose this" thoughts.
  pinned: boolean;
  // Cluster id (free-text — clusters are derived, not first-class).
  cluster?: string;
  // Loose links into the rest of the workspace.
  linkedChapterId?: string;
  linkedArticleId?: string;
  linkedQuoteId?: string;
  linkedThemeId?: string;
  // Audit.
  createdAt: string;
  updatedAt: string;
}

export interface ThoughtLink {
  id: string;
  from: string; // thought id
  to: string;
  // Optional label describing the relationship.
  label?: string;
  // dotted for "speculative", solid for "claimed".
  style: "solid" | "dotted";
  createdAt: string;
}

export interface ThinkingBoard {
  id: string;
  title: string;
  thoughts: Thought[];
  links: ThoughtLink[];
  // Optional pan/zoom hint — UI may persist this.
  viewportX: number;
  viewportY: number;
  zoom: number;
  createdAt: string;
  updatedAt: string;
}

export const THINKING_BOARD_STORAGE_KEY = "psych-thinking-board-v1";

export function emptyBoard(title = "Pensées libres"): ThinkingBoard {
  const now = nowISO();
  return {
    id: generateId(),
    title,
    thoughts: [],
    links: [],
    viewportX: 0,
    viewportY: 0,
    zoom: 1,
    createdAt: now,
    updatedAt: now,
  };
}

// ─── Thought mutations ────────────────────────────────────────

export function addThought(
  board: ThinkingBoard,
  input: {
    body: string;
    kind?: ThoughtKind;
    x?: number;
    y?: number;
    width?: number;
    color?: ThoughtColor;
    cluster?: string;
    linkedChapterId?: string;
    linkedArticleId?: string;
    linkedQuoteId?: string;
    linkedThemeId?: string;
  }
): ThinkingBoard {
  const now = nowISO();
  const thought: Thought = {
    id: generateId(),
    kind: input.kind ?? "fragment",
    body: input.body.trim(),
    x: input.x ?? 80,
    y: input.y ?? 80,
    width: input.width ?? 220,
    color: input.color ?? "default",
    pinned: false,
    cluster: input.cluster,
    linkedChapterId: input.linkedChapterId,
    linkedArticleId: input.linkedArticleId,
    linkedQuoteId: input.linkedQuoteId,
    linkedThemeId: input.linkedThemeId,
    createdAt: now,
    updatedAt: now,
  };
  return { ...board, thoughts: [...board.thoughts, thought], updatedAt: now };
}

export function patchThought(
  board: ThinkingBoard,
  id: string,
  patch: Partial<Omit<Thought, "id" | "createdAt">>
): ThinkingBoard {
  const now = nowISO();
  return {
    ...board,
    updatedAt: now,
    thoughts: board.thoughts.map((t) =>
      t.id === id ? { ...t, ...patch, updatedAt: now } : t
    ),
  };
}

export function moveThought(
  board: ThinkingBoard,
  id: string,
  x: number,
  y: number
): ThinkingBoard {
  return patchThought(board, id, { x, y });
}

export function removeThought(
  board: ThinkingBoard,
  id: string
): ThinkingBoard {
  return {
    ...board,
    thoughts: board.thoughts.filter((t) => t.id !== id),
    links: board.links.filter((l) => l.from !== id && l.to !== id),
    updatedAt: nowISO(),
  };
}

// ─── Link mutations ───────────────────────────────────────────

export function linkThoughts(
  board: ThinkingBoard,
  from: string,
  to: string,
  options: { label?: string; style?: ThoughtLink["style"] } = {}
): ThinkingBoard {
  if (from === to) return board;
  // Don't double-link the same direction.
  if (board.links.some((l) => l.from === from && l.to === to)) return board;
  if (!board.thoughts.some((t) => t.id === from)) return board;
  if (!board.thoughts.some((t) => t.id === to)) return board;
  const link: ThoughtLink = {
    id: generateId(),
    from,
    to,
    label: options.label,
    style: options.style ?? "solid",
    createdAt: nowISO(),
  };
  return { ...board, links: [...board.links, link], updatedAt: nowISO() };
}

export function unlinkThoughts(
  board: ThinkingBoard,
  linkId: string
): ThinkingBoard {
  return {
    ...board,
    links: board.links.filter((l) => l.id !== linkId),
    updatedAt: nowISO(),
  };
}

// ─── Cluster derivation ───────────────────────────────────────

export function clustersOf(
  board: ThinkingBoard
): Record<string, Thought[]> {
  const out: Record<string, Thought[]> = {};
  for (const t of board.thoughts) {
    const key = t.cluster?.trim() || "(unclustered)";
    if (!out[key]) out[key] = [];
    out[key].push(t);
  }
  return out;
}

export function thoughtsInCluster(
  board: ThinkingBoard,
  cluster: string
): Thought[] {
  return board.thoughts.filter(
    (t) => (t.cluster ?? "").trim() === cluster.trim()
  );
}

// ─── Connectivity ─────────────────────────────────────────────

export function neighborsOf(
  board: ThinkingBoard,
  thoughtId: string
): Thought[] {
  const neighborIds = new Set<string>();
  for (const l of board.links) {
    if (l.from === thoughtId) neighborIds.add(l.to);
    if (l.to === thoughtId) neighborIds.add(l.from);
  }
  return board.thoughts.filter((t) => neighborIds.has(t.id));
}

export function isolatedThoughts(board: ThinkingBoard): Thought[] {
  const connected = new Set<string>();
  for (const l of board.links) {
    connected.add(l.from);
    connected.add(l.to);
  }
  return board.thoughts.filter((t) => !connected.has(t.id));
}

// ─── Stats ────────────────────────────────────────────────────

export interface BoardStats {
  total: number;
  byKind: Record<ThoughtKind, number>;
  pinned: number;
  clusters: number;
  isolated: number;
  linkCount: number;
}

export function boardStats(board: ThinkingBoard): BoardStats {
  const byKind = {} as Record<ThoughtKind, number>;
  for (const k of Object.keys(THOUGHT_KIND_LABELS) as ThoughtKind[]) {
    byKind[k] = 0;
  }
  let pinned = 0;
  for (const t of board.thoughts) {
    byKind[t.kind]++;
    if (t.pinned) pinned++;
  }
  return {
    total: board.thoughts.length,
    byKind,
    pinned,
    clusters: Object.keys(clustersOf(board)).filter(
      (k) => k !== "(unclustered)"
    ).length,
    isolated: isolatedThoughts(board).length,
    linkCount: board.links.length,
  };
}
