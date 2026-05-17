// Links between PsyNodes. Typed because a thought "causes" an
// emotion, a behavior "follows" a situation, a body sensation
// "recurs-with" a person, a conflict "contradicts" itself, etc.

import { generateId, nowISO } from "@/lib/store";

export type LinkType =
  | "causes" // A causes / triggers B
  | "follows" // B follows after A
  | "related-to" // generic association
  | "contradicts" // for internal conflicts
  | "recurs-with" // recurring co-occurrence
  | "defends-against" // defense pattern shielding emotion
  | "expresses"; // memory expresses theme, etc.

export const LINK_TYPE_LABELS: Record<LinkType, string> = {
  causes: "causes",
  follows: "follows",
  "related-to": "related to",
  contradicts: "contradicts",
  "recurs-with": "recurs with",
  "defends-against": "defends against",
  expresses: "expresses",
};

export interface PsyLink {
  id: string;
  caseId: string;
  fromNodeId: string;
  toNodeId: string;
  linkType: LinkType;
  // 1–5 strength (UI uses for line thickness / opacity).
  strength: 1 | 2 | 3 | 4 | 5;
  notes?: string;
  // Authoring metadata for the same dual-portal model as nodes.
  authoredBy?: "therapist" | "client";
  createdAt: string;
  updatedAt: string;
}

export const LINKS_STORAGE_KEY = "psych-psy-links-v1";

export function emptyLink(
  caseId: string,
  fromNodeId: string,
  toNodeId: string,
  overrides: Partial<PsyLink> = {}
): PsyLink {
  const now = nowISO();
  return {
    id: generateId(),
    caseId,
    fromNodeId,
    toNodeId,
    linkType: "related-to",
    strength: 3,
    authoredBy: "therapist",
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

export function linksForCase(links: PsyLink[], caseId: string): PsyLink[] {
  return links.filter((l) => l.caseId === caseId);
}

export function linksTouching(
  links: PsyLink[],
  nodeId: string
): PsyLink[] {
  return links.filter(
    (l) => l.fromNodeId === nodeId || l.toNodeId === nodeId
  );
}

export function neighbors(
  links: PsyLink[],
  nodeId: string
): Array<{ nodeId: string; via: PsyLink }> {
  const out: Array<{ nodeId: string; via: PsyLink }> = [];
  for (const l of links) {
    if (l.fromNodeId === nodeId) out.push({ nodeId: l.toNodeId, via: l });
    if (l.toNodeId === nodeId) out.push({ nodeId: l.fromNodeId, via: l });
  }
  return out;
}

// Removes links that reference a node id that no longer exists in the
// supplied node-id set. Used when the UI deletes a node.
export function pruneOrphans(
  links: PsyLink[],
  validNodeIds: Set<string>
): PsyLink[] {
  return links.filter(
    (l) => validNodeIds.has(l.fromNodeId) && validNodeIds.has(l.toNodeId)
  );
}

// Returns the count of links of each type for a case. Used by the
// therapist's pattern overview.
export function linkTypeFrequency(
  links: PsyLink[],
  caseId?: string
): Record<LinkType, number> {
  const out = {
    causes: 0,
    follows: 0,
    "related-to": 0,
    contradicts: 0,
    "recurs-with": 0,
    "defends-against": 0,
    expresses: 0,
  } as Record<LinkType, number>;
  for (const l of links) {
    if (caseId && l.caseId !== caseId) continue;
    out[l.linkType] = (out[l.linkType] ?? 0) + 1;
  }
  return out;
}
