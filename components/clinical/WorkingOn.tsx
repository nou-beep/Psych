"use client";
// "Currently working on" — surfaces work-in-progress across modules.
// Reads from the same localStorage keys the rest of the app writes to.

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";
import { SectionCard } from "@/components/shared/SectionCard";
import { useClinical } from "@/contexts/ClinicalContext";
import { useApp } from "@/contexts/AppContext";
import { loadFromStorage } from "@/lib/store";
import {
  KIND_LABELS,
  buildWorkspace,
  type WorkItem,
} from "@/lib/clinical/workspace";
import {
  ASSESSMENT_ADMINISTRATIONS_STORAGE_KEY,
  type AssessmentAdministration,
} from "@/lib/clinical/assessments";

interface ReportDraft {
  id: string;
  title: string;
  caseId?: string;
  updatedAt: string;
}
interface SessionNoteDraft {
  id: string;
  caseId: string;
  date: string;
  plannedGoals: string[];
  completedGoals: string[];
  updatedAt: string;
}
interface SavedInterview {
  id: string;
  caseId?: string;
  date: string;
  answers: Record<string, string>;
  templateId: string;
  updatedAt: string;
}
interface ThematicExcerpt {
  id: string;
  codeIds: string[];
  transcriptId: string;
}

const KIND_COLOURS: Record<string, string> = {
  "report-draft": "#8A6E5D",
  "formulation-draft": "#6B7AA0",
  "supervision-note": "#8B4A66",
  "transcript-coding": "#7E7A6E",
  "assessment-incomplete": "#9B4D3A",
  "session-note-draft": "#9882C0",
  "interview-draft": "#B07A4F",
};

export function WorkingOn() {
  const { formulations, supervisionNotes } = useClinical();
  const { cases } = useApp();
  const [items, setItems] = useState<WorkItem[]>([]);

  useEffect(() => {
    const reportDrafts = loadFromStorage<ReportDraft[]>(
      "psych-report-drafts-v1",
      []
    );
    const sessionNoteDrafts = loadFromStorage<SessionNoteDraft[]>(
      "psych-session-notes-v1",
      []
    );
    const interviews = loadFromStorage<SavedInterview[]>(
      "psych-clinical-interviews-v1",
      []
    );
    const thematicProject = loadFromStorage<{ excerpts: ThematicExcerpt[] }>(
      "psych-thematic-v1",
      { excerpts: [] }
    );
    const administrations = loadFromStorage<AssessmentAdministration[]>(
      ASSESSMENT_ADMINISTRATIONS_STORAGE_KEY,
      []
    );

    const incompleteAssessments = administrations
      .filter((a) => a.score.incomplete)
      .map((a) => ({
        id: a.id,
        assessmentId: a.assessmentId,
        caseId: a.caseId,
        date: a.date,
        missing: a.score.missing,
        updatedAt: a.updatedAt,
      }));

    const work = buildWorkspace({
      reportDrafts: reportDrafts.map((r) => ({
        id: r.id,
        title: r.title,
        caseId: r.caseId,
        updatedAt: r.updatedAt,
      })),
      formulations: formulations.map((f) => ({
        id: f.id,
        caseId: f.caseId,
        title: f.title,
        sections: f.sections,
        updatedAt: f.updatedAt,
      })),
      supervisionNotes: supervisionNotes.map((s) => ({
        id: s.id,
        caseId: s.caseId,
        date: s.date,
        actionPlan: s.actionPlan,
        mainTopics: s.mainTopics,
      })),
      thematicExcerpts: thematicProject.excerpts,
      incompleteAssessments,
      sessionNoteDrafts: sessionNoteDrafts.map((s) => ({
        id: s.id,
        caseId: s.caseId,
        date: s.date,
        plannedGoals: s.plannedGoals,
        completedGoals: s.completedGoals,
        updatedAt: s.updatedAt,
      })),
      interviews: interviews.map((i) => ({
        id: i.id,
        caseId: i.caseId,
        date: i.date,
        answers: i.answers,
        templateId: i.templateId,
        updatedAt: i.updatedAt,
      })),
    });
    setItems(work);
  }, [formulations, supervisionNotes]);

  const caseCodeOf = useMemo(() => {
    const map: Record<string, string> = {};
    for (const c of cases) map[c.id] = c.code;
    return map;
  }, [cases]);

  if (items.length === 0) return null;

  return (
    <SectionCard
      title="Currently working on"
      description="Drafts and pending items across the workspace"
      className="animate-fade-up delay-2 mt-6"
    >
      <ul className="space-y-2">
        {items.slice(0, 8).map((item) => {
          const colour = KIND_COLOURS[item.kind] ?? "var(--psych-muted)";
          return (
            <li key={item.id}>
              <Link
                href={item.href ?? "#"}
                className="flex items-center gap-3 p-3 rounded-xl border alive-hover"
                style={{
                  borderColor: "var(--psych-border)",
                  background: "var(--psych-card)",
                  borderLeft: `4px solid ${colour}`,
                  textDecoration: "none",
                  color: "var(--psych-text)",
                }}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span
                      className="text-[10px] font-semibold uppercase tracking-wider"
                      style={{ color: colour }}
                    >
                      {KIND_LABELS[item.kind]}
                    </span>
                    {item.caseId && (
                      <span
                        className="text-[10px] font-mono"
                        style={{ color: "var(--psych-muted)" }}
                      >
                        {caseCodeOf[item.caseId] ?? item.caseId}
                      </span>
                    )}
                  </div>
                  <div
                    className="text-sm truncate"
                    style={{ color: "var(--psych-text)" }}
                  >
                    {item.title}
                  </div>
                  {item.subtitle && (
                    <div
                      className="text-xs"
                      style={{ color: "var(--psych-muted)" }}
                    >
                      {item.subtitle}
                    </div>
                  )}
                </div>
                <ArrowRight size={14} style={{ color: "var(--psych-muted)" }} />
              </Link>
            </li>
          );
        })}
      </ul>
      {items.length > 8 && (
        <p
          className="text-xs mt-2 text-center"
          style={{ color: "var(--psych-muted)" }}
        >
          +{items.length - 8} more in flight
        </p>
      )}
    </SectionCard>
  );
}
