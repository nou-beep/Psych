"use client";
// Cross-app open-loops aggregator. Reads from the same localStorage
// keys other modules write to, runs them through buildOpenLoops, and
// renders a grouped list. Defensive against malformed data.

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AlertCircle, ArrowRight, CheckCircle2 } from "lucide-react";
import { loadFromStorage } from "@/lib/store";
import { useClinical } from "@/contexts/ClinicalContext";
import { useApp } from "@/contexts/AppContext";
import { usePsyGraph } from "@/contexts/PsyGraphContext";
import {
  OPEN_LOOP_LABELS,
  buildOpenLoops,
  loopsForCase,
  summarise,
  type OpenLoop,
} from "@/lib/research/open-loops";
import { recurringThreads } from "@/lib/psy/threads";

interface ReportDraft {
  id: string;
  title: string;
  caseId?: string;
  updatedAt: string;
}

interface QuickNote {
  id: string;
  body: string;
  tags: string[];
  caseId?: string;
  updatedAt: string;
}

interface ClinicalHypothesis {
  id: string;
  caseId: string;
  title: string;
  status: string;
  updatedAt: string;
}

interface ThematicProject {
  excerpts?: Array<{ codeIds?: string[]; transcriptId?: string }>;
}

function arr<T>(key: string): T[] {
  try {
    const v = loadFromStorage<unknown>(key, []);
    return Array.isArray(v) ? (v as T[]) : [];
  } catch {
    return [];
  }
}

interface Props {
  caseId?: string;
}

export function OpenLoopsBoard({ caseId }: Props) {
  const { formulations, supervisionNotes } = useClinical();
  const { cases, transcripts } = useApp();
  const { nodes } = usePsyGraph();
  const [loops, setLoops] = useState<OpenLoop[]>([]);

  useEffect(() => {
    try {
      const reportDrafts = arr<ReportDraft>("psych-report-drafts-v1");
      const hypotheses = arr<ClinicalHypothesis>("psych-clinical-hypotheses-v1");
      const thematic = (() => {
        try {
          const t = loadFromStorage<ThematicProject>("psych-thematic-v1", {
            excerpts: [],
          });
          return t.excerpts ?? [];
        } catch {
          return [];
        }
      })();
      const quickNotes = arr<QuickNote>("psych-quick-notes-v1");

      // Aggregate uncoded excerpts per transcript.
      const uncodedByTranscript = new Map<
        string,
        { transcriptId: string; transcriptTitle: string; excerptCount: number; caseId?: string; updatedAt: string }
      >();
      for (const e of thematic) {
        if (!e || (e.codeIds && e.codeIds.length > 0)) continue;
        const tid = e.transcriptId ?? "unknown";
        const transcript = transcripts.find((t) => t.id === tid);
        const existing = uncodedByTranscript.get(tid) ?? {
          transcriptId: tid,
          transcriptTitle: transcript?.title ?? "Transcript",
          excerptCount: 0,
          caseId: transcript?.caseId,
          updatedAt: transcript?.updatedAt ?? new Date().toISOString(),
        };
        existing.excerptCount += 1;
        uncodedByTranscript.set(tid, existing);
      }

      // Recurring threads marked as "open" — derived from the psy graph.
      const openThreads = recurringThreads(nodes).map((t) => ({
        // Threads live across the workspace, but the spec wires them to
        // cases. We surface them with the case that owns the underlying
        // node; pick the first matching case for now.
        caseId:
          nodes.find((n) => n.tags.includes(t.tag))?.caseId ?? "",
        tag: t.tag,
        lastSeen: t.lastSeen ?? new Date().toISOString(),
      }));

      // Quick notes tagged "revisit" or "follow-up" become open loops.
      const revisit = quickNotes
        .filter((q) =>
          (q.tags ?? []).some((tag) =>
            ["revisit", "follow-up", "open"].includes(tag.toLowerCase())
          )
        )
        .map((q) => ({
          id: q.id,
          body: q.body,
          caseId: q.caseId,
          updatedAt: q.updatedAt,
        }));

      const all = buildOpenLoops({
        reportDrafts,
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
        uncodedExcerpts: Array.from(uncodedByTranscript.values()),
        hypotheses,
        openThreads,
        revisitLater: revisit,
      });
      setLoops(caseId ? loopsForCase(all, caseId) : all);
    } catch {
      setLoops([]);
    }
  }, [formulations, supervisionNotes, transcripts, nodes, caseId]);

  const caseCodeOf = useMemo(() => {
    const map: Record<string, string> = {};
    for (const c of cases) map[c.id] = c.code;
    return map;
  }, [cases]);

  const summary = useMemo(() => summarise(loops), [loops]);

  if (loops.length === 0) {
    return (
      <div
        className="rounded-2xl border p-4 text-sm"
        style={{
          background: "var(--psych-card)",
          borderColor: "var(--psych-border)",
        }}
      >
        <div
          className="flex items-center gap-2"
          style={{ color: "var(--psych-muted)" }}
        >
          <CheckCircle2 size={14} style={{ color: "#10B981" }} />
          No open loops — all drafts and threads are tidy.
        </div>
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl border p-4"
      style={{
        background: "var(--psych-card)",
        borderColor: "var(--psych-border)",
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div
          className="text-sm font-semibold flex items-center gap-2"
          style={{ color: "var(--psych-text)" }}
        >
          <AlertCircle size={14} style={{ color: "#9B4D3A" }} />
          {summary.total} open loop{summary.total === 1 ? "" : "s"}
        </div>
        {summary.topKind && (
          <div
            className="text-[10px] uppercase tracking-wider"
            style={{ color: "var(--psych-muted)" }}
          >
            Top: {OPEN_LOOP_LABELS[summary.topKind]}
          </div>
        )}
      </div>

      <ul className="space-y-2 max-h-[420px] overflow-y-auto">
        {loops.map((loop) => {
          const accent =
            loop.weight >= 4
              ? "#9B4D3A"
              : loop.weight >= 3
              ? "#B07A4F"
              : loop.weight >= 2
              ? "#8B4A66"
              : "#7E7A6E";
          return (
            <li key={loop.id}>
              <Link
                href={loop.href ?? "#"}
                className="flex items-center gap-3 p-3 rounded-xl border alive-hover"
                style={{
                  borderColor: "var(--psych-border)",
                  background: "var(--psych-card)",
                  borderLeft: `4px solid ${accent}`,
                  textDecoration: "none",
                  color: "var(--psych-text)",
                }}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span
                      className="text-[10px] font-semibold uppercase tracking-wider"
                      style={{ color: accent }}
                    >
                      {OPEN_LOOP_LABELS[loop.kind]}
                    </span>
                    {loop.caseId && caseCodeOf[loop.caseId] && (
                      <span
                        className="text-[10px] font-mono"
                        style={{ color: "var(--psych-muted)" }}
                      >
                        {caseCodeOf[loop.caseId]}
                      </span>
                    )}
                    <span
                      className="text-[10px] ml-auto"
                      style={{ color: "var(--psych-muted)" }}
                    >
                      open since {loop.openedAt.split("T")[0]}
                    </span>
                  </div>
                  <div
                    className="text-sm truncate"
                    style={{ color: "var(--psych-text)" }}
                  >
                    {loop.title}
                  </div>
                  {loop.subtitle && (
                    <div
                      className="text-xs"
                      style={{ color: "var(--psych-muted)" }}
                    >
                      {loop.subtitle}
                    </div>
                  )}
                </div>
                {loop.href && (
                  <ArrowRight size={14} style={{ color: "var(--psych-muted)" }} />
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
