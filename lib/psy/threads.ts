// Recurring "threads" — psychologically meaningful themes (shame,
// abandonment, perfectionism, fragmentation, etc.) that show up
// across nodes. A thread is a tag that recurs widely.
//
// The therapist also gets a small curated taxonomy of common threads
// so they can promote tags into "official" recurring threads attached
// to a case.

import type { PsyNode } from "@/lib/psy/nodes";

export const COMMON_THREADS = [
  "abandonment",
  "identity confusion",
  "emotional numbness",
  "perfectionism",
  "rejection sensitivity",
  "emotional flooding",
  "reassurance seeking",
  "shame",
  "fragmentation",
  "emotional avoidance",
  "control",
  "responsibility",
  "invisibility",
  "self-criticism",
] as const;

export type CommonThread = (typeof COMMON_THREADS)[number];

export interface ThreadObservation {
  tag: string;
  count: number;
  // Which node kinds this tag appears across — used to assess how
  // pervasive the thread is in the case.
  kindBreakdown: Record<string, number>;
  // Dates the tag appeared (oldest → newest).
  dates: string[];
  // Set to true if the count or pervasiveness clears the recurrence
  // threshold (i.e. the tag isn't just incidental).
  recurring: boolean;
  // Latest date a node carrying this tag was created/updated.
  lastSeen: string | null;
}

export interface ThreadAnalysisOptions {
  // Minimum total occurrences before a tag is marked "recurring".
  minOccurrences?: number;
  // Minimum distinct node-kinds before a tag is marked "recurring".
  minDistinctKinds?: number;
}

export function analyzeThreads(
  nodes: PsyNode[],
  opts: ThreadAnalysisOptions = {}
): ThreadObservation[] {
  const minOccurrences = opts.minOccurrences ?? 2;
  const minDistinctKinds = opts.minDistinctKinds ?? 1;

  const buckets = new Map<
    string,
    { count: number; kinds: Record<string, number>; dates: string[]; lastSeen: string }
  >();

  for (const node of nodes) {
    for (const tag of node.tags) {
      const existing =
        buckets.get(tag) ?? {
          count: 0,
          kinds: {} as Record<string, number>,
          dates: [],
          lastSeen: "",
        };
      existing.count += 1;
      existing.kinds[node.kind] = (existing.kinds[node.kind] ?? 0) + 1;
      existing.dates.push(node.date);
      if (node.updatedAt > existing.lastSeen) {
        existing.lastSeen = node.updatedAt;
      }
      buckets.set(tag, existing);
    }
  }

  const out: ThreadObservation[] = [];
  for (const [tag, info] of Array.from(buckets.entries())) {
    const distinctKinds = Object.keys(info.kinds).length;
    out.push({
      tag,
      count: info.count,
      kindBreakdown: info.kinds,
      dates: info.dates.slice().sort(),
      recurring:
        info.count >= minOccurrences && distinctKinds >= minDistinctKinds,
      lastSeen: info.lastSeen || null,
    });
  }
  out.sort((a, b) => b.count - a.count);
  return out;
}

// Returns only the threads that cleared the recurrence threshold.
export function recurringThreads(
  nodes: PsyNode[],
  opts?: ThreadAnalysisOptions
): ThreadObservation[] {
  return analyzeThreads(nodes, opts).filter((t) => t.recurring);
}

// Returns the dominant thread per case (the one with the highest
// count). Used by the case-overview "what keeps coming up" line.
export function dominantThread(
  nodes: PsyNode[]
): ThreadObservation | null {
  const sorted = analyzeThreads(nodes).filter((t) => t.recurring);
  return sorted[0] ?? null;
}
