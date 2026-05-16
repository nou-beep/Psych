// Open loops — a global tracker of unfinished work surfaced across the
// whole workspace. Pure aggregator: the caller supplies the relevant
// inputs (drafts, formulations, coded vs uncoded excerpts, hypotheses,
// supervision notes…), and the helper returns a ranked, typed list.

export type OpenLoopKind =
  | "unfinished-thought"
  | "unresolved-pattern"
  | "pending-coding"
  | "incomplete-interpretation"
  | "follow-up"
  | "unresolved-finding"
  | "revisit-later"
  | "unfinished-report"
  | "pending-supervision-note"
  | "unresolved-hypothesis"
  | "open-thread";

export interface OpenLoop {
  id: string;
  kind: OpenLoopKind;
  title: string;
  subtitle?: string;
  href?: string;
  caseId?: string;
  // ISO date — used to rank "longest open".
  openedAt: string;
  // Free tags reused across the workspace.
  tags?: string[];
  // 1 = casually open, 3 = needs attention soon, 5 = critical / risk-related.
  weight: 1 | 2 | 3 | 4 | 5;
}

export const OPEN_LOOP_LABELS: Record<OpenLoopKind, string> = {
  "unfinished-thought": "Unfinished thought",
  "unresolved-pattern": "Unresolved pattern",
  "pending-coding": "Pending coding",
  "incomplete-interpretation": "Incomplete interpretation",
  "follow-up": "Follow-up needed",
  "unresolved-finding": "Unresolved finding",
  "revisit-later": "Revisit later",
  "unfinished-report": "Unfinished report",
  "pending-supervision-note": "Pending supervision note",
  "unresolved-hypothesis": "Unresolved hypothesis",
  "open-thread": "Open thread",
};

export interface OpenLoopInput {
  // Saved report drafts (incomplete = no client-shared step yet).
  reportDrafts?: Array<{
    id: string;
    title: string;
    caseId?: string;
    updatedAt: string;
  }>;
  // Formulations with at least one empty section.
  formulations?: Array<{
    id: string;
    caseId: string;
    title?: string;
    sections: Record<string, string>;
    updatedAt: string;
  }>;
  // Supervision notes with an action plan but no main topics.
  supervisionNotes?: Array<{
    id: string;
    caseId: string;
    date: string;
    actionPlan?: string;
    mainTopics?: string;
  }>;
  // Transcripts with excerpts that have no codes.
  uncodedExcerpts?: Array<{
    transcriptId: string;
    transcriptTitle: string;
    excerptCount: number;
    caseId?: string;
    updatedAt: string;
  }>;
  // Hypotheses with status "exploring" or "needs-further-assessment".
  hypotheses?: Array<{
    id: string;
    caseId: string;
    title: string;
    status: string;
    updatedAt: string;
  }>;
  // Threads (recurring tags) marked as needing attention by the
  // therapist (we pass them straight through with weight 2-3).
  openThreads?: Array<{
    caseId: string;
    tag: string;
    lastSeen: string;
  }>;
  // Free-text revisit-later notes the user dropped from a quick-note.
  revisitLater?: Array<{
    id: string;
    caseId?: string;
    body: string;
    updatedAt: string;
  }>;
}

function isFormulationDraft(f: {
  sections?: Record<string, string>;
}): boolean {
  const sections = f.sections ?? {};
  const entries = Object.values(sections);
  if (entries.length === 0) return true;
  const filled = entries.filter((v) => v && v.trim()).length;
  return filled > 0 && filled < entries.length;
}

export function buildOpenLoops(input: OpenLoopInput): OpenLoop[] {
  const out: OpenLoop[] = [];

  for (const r of input.reportDrafts ?? []) {
    if (!r || !r.id) continue;
    out.push({
      id: `rd-${r.id}`,
      kind: "unfinished-report",
      title: r.title,
      caseId: r.caseId,
      href: "/reports/builder",
      openedAt: r.updatedAt,
      weight: 2,
    });
  }

  for (const f of input.formulations ?? []) {
    if (!f || !f.id) continue;
    if (!isFormulationDraft(f)) continue;
    out.push({
      id: `fr-${f.id}`,
      kind: "incomplete-interpretation",
      title: f.title || "Untitled formulation",
      subtitle: "Formulation draft",
      caseId: f.caseId,
      href: "/formulation",
      openedAt: f.updatedAt,
      weight: 2,
    });
  }

  for (const s of input.supervisionNotes ?? []) {
    if (!s || !s.id) continue;
    if (s.actionPlan && !s.mainTopics) {
      out.push({
        id: `sup-${s.id}`,
        kind: "pending-supervision-note",
        title: `Supervision · ${s.date}`,
        caseId: s.caseId,
        href: "/supervision",
        openedAt: s.date,
        weight: 3,
      });
    }
  }

  for (const u of input.uncodedExcerpts ?? []) {
    if (!u || u.excerptCount <= 0) continue;
    out.push({
      id: `pc-${u.transcriptId}`,
      kind: "pending-coding",
      title: `${u.transcriptTitle}`,
      subtitle: `${u.excerptCount} excerpt(s) without codes`,
      caseId: u.caseId,
      href: "/transcripts",
      openedAt: u.updatedAt,
      weight: 1,
    });
  }

  for (const h of input.hypotheses ?? []) {
    if (!h || !h.id) continue;
    if (h.status === "exploring" || h.status === "needs-further-assessment") {
      out.push({
        id: `hy-${h.id}`,
        kind: "unresolved-hypothesis",
        title: h.title,
        subtitle: h.status,
        caseId: h.caseId,
        href: "/clinical/hypothesis",
        openedAt: h.updatedAt,
        weight: 3,
      });
    }
  }

  for (const t of input.openThreads ?? []) {
    if (!t || !t.tag) continue;
    out.push({
      id: `th-${t.caseId}-${t.tag}`,
      kind: "open-thread",
      title: t.tag,
      subtitle: "Recurring thread",
      caseId: t.caseId,
      openedAt: t.lastSeen,
      tags: [t.tag],
      weight: 2,
    });
  }

  for (const r of input.revisitLater ?? []) {
    if (!r || !r.id) continue;
    out.push({
      id: `rl-${r.id}`,
      kind: "revisit-later",
      title: r.body.length > 80 ? r.body.slice(0, 79) + "…" : r.body,
      caseId: r.caseId,
      openedAt: r.updatedAt,
      weight: 1,
    });
  }

  // Heaviest first; tie-break: longest open first.
  return out.sort((a, b) => {
    if (a.weight !== b.weight) return b.weight - a.weight;
    return a.openedAt.localeCompare(b.openedAt);
  });
}

export function loopsForCase(loops: OpenLoop[], caseId: string): OpenLoop[] {
  return loops.filter((l) => l.caseId === caseId);
}

// Returns a small summary suitable for a header chip / dashboard pill.
export function summarise(loops: OpenLoop[]): {
  total: number;
  byKind: Record<OpenLoopKind, number>;
  topKind: OpenLoopKind | null;
} {
  const byKind = {} as Record<OpenLoopKind, number>;
  for (const l of loops) {
    byKind[l.kind] = (byKind[l.kind] ?? 0) + 1;
  }
  let topKind: OpenLoopKind | null = null;
  let topCount = 0;
  for (const k of Object.keys(byKind) as OpenLoopKind[]) {
    if (byKind[k] > topCount) {
      topCount = byKind[k];
      topKind = k;
    }
  }
  return { total: loops.length, byKind, topKind };
}
