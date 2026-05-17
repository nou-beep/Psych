"use client";
// Narrative timeline view for a case. Pulls events from every source
// the case touches via lib/case-timeline.ts.

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { useClinical } from "@/contexts/ClinicalContext";
import {
  buildTimeline,
  filterTimeline,
  groupTimelineByMonth,
  type TimelineEventType,
} from "@/lib/case-timeline";

const TYPE_COLORS: Record<TimelineEventType, string> = {
  "check-in": "#3B82F6",
  "weekly-review": "#0EA5E9",
  "monthly-review": "#8B5CF6",
  "session-plan": "#F59E0B",
  session: "#10B981",
  assessment: "#EF4444",
  supervision: "#EC4899",
  reflection: "#A855F7",
  intervention: "#14B8A6",
  transcript: "#F97316",
  "audio-note": "#06B6D4",
  report: "#BE185D",
  workbook: "#84CC16",
  goal: "#22C55E",
  ethics: "#64748B",
};

const TYPE_LABELS: Record<TimelineEventType, string> = {
  "check-in": "Check-ins",
  "weekly-review": "Weekly",
  "monthly-review": "Monthly",
  "session-plan": "Session plans",
  session: "Sessions",
  assessment: "Assessments",
  supervision: "Supervision",
  reflection: "Reflections",
  intervention: "Interventions",
  transcript: "Transcripts",
  "audio-note": "Audio notes",
  report: "Reports",
  workbook: "Workbooks",
  goal: "Goals",
  ethics: "Ethics",
};

const ALL_TYPES = Object.keys(TYPE_LABELS) as TimelineEventType[];

export function CaseTimeline({ caseId }: { caseId: string }) {
  const {
    checkIns,
    weeklyReviews,
    monthlyReviews,
    sessions,
    assessments,
    supervisionNotes,
    transcripts,
    goals,
  } = useApp();
  const { plans, reflections, interventions, audioNotes, consent } =
    useClinical();

  const [search, setSearch] = useState("");
  const [activeTypes, setActiveTypes] = useState<TimelineEventType[]>([]);

  const events = useMemo(() => {
    return buildTimeline({
      caseId,
      checkIns,
      weeklyReviews,
      monthlyReviews,
      sessions,
      sessionPlans: plans,
      assessments,
      supervisionNotes,
      reflections,
      interventions,
      transcripts,
      audioNotes,
      goals,
      consent,
    });
  }, [
    caseId,
    checkIns,
    weeklyReviews,
    monthlyReviews,
    sessions,
    plans,
    assessments,
    supervisionNotes,
    reflections,
    interventions,
    transcripts,
    audioNotes,
    goals,
    consent,
  ]);

  const filtered = useMemo(
    () =>
      filterTimeline(events, {
        types: activeTypes,
        search,
      }),
    [events, activeTypes, search]
  );

  const grouped = useMemo(
    () => groupTimelineByMonth(filtered),
    [filtered]
  );

  function toggleType(t: TimelineEventType) {
    setActiveTypes((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );
  }

  if (events.length === 0) {
    return (
      <div
        className="text-center py-10 text-sm rounded-2xl border"
        style={{
          color: "var(--psych-muted)",
          borderColor: "var(--psych-border)",
        }}
      >
        No timeline events yet — start by logging a check-in, session plan,
        or supervision note.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 print:hidden">
        <div
          className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl border"
          style={{ borderColor: "var(--psych-border)" }}
        >
          <Search size={14} style={{ color: "var(--psych-muted)" }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search timeline…"
            className="flex-1 bg-transparent outline-none text-sm"
            style={{ color: "var(--psych-text)" }}
          />
        </div>
        <button
          onClick={() => window.print()}
          className="text-xs px-3 py-2 rounded-xl border"
          style={{
            borderColor: "var(--psych-border)",
            color: "var(--psych-muted)",
          }}
        >
          Print
        </button>
      </div>

      <div className="flex flex-wrap gap-1 print:hidden">
        {ALL_TYPES.map((t) => {
          const on = activeTypes.length === 0 || activeTypes.includes(t);
          return (
            <button
              key={t}
              onClick={() => toggleType(t)}
              className="text-[11px] px-2 py-1 rounded-md border transition-all"
              style={{
                borderColor: TYPE_COLORS[t],
                color: on ? TYPE_COLORS[t] : "var(--psych-muted)",
                backgroundColor: on ? `${TYPE_COLORS[t]}10` : "transparent",
                opacity: on ? 1 : 0.55,
              }}
            >
              {TYPE_LABELS[t]}
            </button>
          );
        })}
      </div>

      <div className="space-y-5">
        {grouped.map((g) => (
          <div key={g.month}>
            <div
              className="text-xs font-semibold uppercase tracking-wider mb-2"
              style={{ color: "var(--psych-muted)" }}
            >
              {g.month}
            </div>
            <ol className="relative pl-5 space-y-2">
              <span
                className="absolute left-1.5 top-1 bottom-1 w-px"
                style={{
                  background:
                    "linear-gradient(to bottom, var(--psych-primary), transparent)",
                  opacity: 0.25,
                }}
                aria-hidden
              />
              {g.events.map((ev) => (
                <li
                  key={ev.id}
                  className="relative rounded-xl border p-3 transition-all hover:shadow-sm"
                  style={{
                    backgroundColor: "var(--psych-card)",
                    borderColor: "var(--psych-border)",
                  }}
                >
                  <span
                    className="absolute -left-[14px] top-3.5 w-2.5 h-2.5 rounded-full"
                    style={{
                      backgroundColor: TYPE_COLORS[ev.type],
                      boxShadow: ev.isMilestone
                        ? `0 0 0 4px ${TYPE_COLORS[ev.type]}33`
                        : `0 0 0 2px ${TYPE_COLORS[ev.type]}22`,
                    }}
                    aria-hidden
                  />
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span
                          className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                          style={{
                            backgroundColor: `${TYPE_COLORS[ev.type]}15`,
                            color: TYPE_COLORS[ev.type],
                          }}
                        >
                          {TYPE_LABELS[ev.type]}
                        </span>
                        {ev.isMilestone && (
                          <span
                            className="text-[10px] px-1.5 py-0.5 rounded-full"
                            style={{
                              backgroundColor: "var(--psych-primary-light)",
                              color: "var(--psych-accent)",
                            }}
                          >
                            ✦ milestone
                          </span>
                        )}
                      </div>
                      <p
                        className="text-sm font-medium"
                        style={{ color: "var(--psych-text)" }}
                      >
                        {ev.title}
                      </p>
                      {ev.detail && (
                        <p
                          className="text-xs mt-0.5"
                          style={{ color: "var(--psych-muted)" }}
                        >
                          {ev.detail}
                        </p>
                      )}
                    </div>
                    <span
                      className="text-xs font-mono whitespace-nowrap"
                      style={{ color: "var(--psych-muted)" }}
                    >
                      {ev.date}
                    </span>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        ))}
        {grouped.length === 0 && (
          <div
            className="text-center py-6 text-sm"
            style={{ color: "var(--psych-muted)" }}
          >
            No events match your filters.
          </div>
        )}
      </div>
    </div>
  );
}
