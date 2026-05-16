// "Currently working on" — pure aggregator that surfaces the drafts /
// work-in-progress the therapist has in flight across modules. UI feeds
// it the relevant raw arrays and gets a ranked, typed list back.

export type WorkItemKind =
  | "report-draft"
  | "formulation-draft"
  | "supervision-note"
  | "transcript-coding"
  | "assessment-incomplete"
  | "session-note-draft"
  | "interview-draft";

export interface WorkItem {
  id: string;
  kind: WorkItemKind;
  title: string;
  subtitle?: string;
  caseId?: string;
  href?: string;
  // ISO date — used to rank "most recently touched".
  updatedAt: string;
}

export const KIND_LABELS: Record<WorkItemKind, string> = {
  "report-draft": "Unfinished report",
  "formulation-draft": "Active formulation",
  "supervision-note": "Pending supervision note",
  "transcript-coding": "Transcript coding draft",
  "assessment-incomplete": "Incomplete assessment",
  "session-note-draft": "Session note draft",
  "interview-draft": "Interview draft",
};

export interface WorkspaceInput {
  reportDrafts?: Array<{
    id: string;
    title: string;
    caseId?: string;
    updatedAt: string;
  }>;
  formulations?: Array<{
    id: string;
    caseId: string;
    title?: string;
    sections: Record<string, string>;
    updatedAt: string;
  }>;
  supervisionNotes?: Array<{
    id: string;
    caseId: string;
    date: string;
    actionPlan?: string;
    mainTopics?: string;
  }>;
  // Thematic project — if there are any uncoded excerpts, that's active
  // qualitative work.
  thematicExcerpts?: Array<{ id: string; codeIds: string[]; transcriptId: string }>;
  // Assessment administrations with missing items
  incompleteAssessments?: Array<{
    id: string;
    assessmentId: string;
    caseId?: string;
    date: string;
    missing: number;
    updatedAt: string;
  }>;
  sessionNoteDrafts?: Array<{
    id: string;
    caseId: string;
    date: string;
    plannedGoals: string[];
    completedGoals: string[];
    updatedAt: string;
  }>;
  // Saved interviews where any answer block is still empty.
  interviews?: Array<{
    id: string;
    caseId?: string;
    date: string;
    answers: Record<string, string>;
    templateId: string;
    updatedAt: string;
  }>;
}

function isFormulationDraft(f: {
  sections: Record<string, string>;
}): boolean {
  const entries = Object.values(f.sections);
  if (entries.length === 0) return true;
  // If at least one section is non-empty but others are still empty, it's a draft.
  const filled = entries.filter((v) => v && v.trim()).length;
  return filled > 0 && filled < entries.length;
}

function isSessionNoteIncomplete(s: {
  plannedGoals: string[];
  completedGoals: string[];
}): boolean {
  if (s.plannedGoals.length === 0) return false;
  return s.completedGoals.length < s.plannedGoals.length;
}

export function buildWorkspace(input: WorkspaceInput): WorkItem[] {
  const out: WorkItem[] = [];

  for (const r of input.reportDrafts ?? []) {
    out.push({
      id: `rd-${r.id}`,
      kind: "report-draft",
      title: r.title,
      caseId: r.caseId,
      href: "/reports/builder",
      updatedAt: r.updatedAt,
    });
  }

  for (const f of input.formulations ?? []) {
    if (!isFormulationDraft(f)) continue;
    out.push({
      id: `fr-${f.id}`,
      kind: "formulation-draft",
      title: f.title || "Untitled formulation",
      caseId: f.caseId,
      href: "/formulation",
      updatedAt: f.updatedAt,
    });
  }

  for (const s of input.supervisionNotes ?? []) {
    // Pending = an action plan exists but the topics field is empty (the
    // clinician started one and stepped away). Heuristic only.
    if (s.actionPlan && !s.mainTopics) {
      out.push({
        id: `sup-${s.id}`,
        kind: "supervision-note",
        title: `Supervision · ${s.date}`,
        caseId: s.caseId,
        href: "/supervision",
        updatedAt: s.date,
      });
    }
  }

  if ((input.thematicExcerpts ?? []).some((e) => e.codeIds.length === 0)) {
    out.push({
      id: "tc-pending",
      kind: "transcript-coding",
      title: "Uncoded excerpts in transcripts",
      href: "/transcripts",
      updatedAt: new Date().toISOString(),
    });
  }

  for (const a of input.incompleteAssessments ?? []) {
    if (a.missing <= 0) continue;
    out.push({
      id: `as-${a.id}`,
      kind: "assessment-incomplete",
      title: `${a.assessmentId.toUpperCase()} · ${a.date}`,
      subtitle: `${a.missing} item(s) missing`,
      caseId: a.caseId,
      href: "/assessments/library",
      updatedAt: a.updatedAt,
    });
  }

  for (const n of input.sessionNoteDrafts ?? []) {
    if (!isSessionNoteIncomplete(n)) continue;
    out.push({
      id: `sn-${n.id}`,
      kind: "session-note-draft",
      title: `Session note · ${n.date}`,
      subtitle: `${n.completedGoals.length}/${n.plannedGoals.length} goals checked`,
      caseId: n.caseId,
      href: `/planner/notes/${n.id}`,
      updatedAt: n.updatedAt,
    });
  }

  for (const i of input.interviews ?? []) {
    const answeredCount = Object.values(i.answers).filter(
      (v) => v && v.trim()
    ).length;
    if (answeredCount === 0) continue;
    out.push({
      id: `iv-${i.id}`,
      kind: "interview-draft",
      title: `Interview · ${i.date}`,
      subtitle: `${answeredCount} section(s) drafted`,
      caseId: i.caseId,
      href: "/clinical/interview",
      updatedAt: i.updatedAt,
    });
  }

  // Most recently touched first.
  return out.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}
