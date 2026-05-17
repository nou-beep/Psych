"use client";
// Visual session recap — therapist + client views side by side. Pure
// derivation from buildSessionRecap; the surrounding context decides
// which view to render.

import { useMemo } from "react";
import { useApp } from "@/contexts/AppContext";
import { useClinical } from "@/contexts/ClinicalContext";
import { usePsyGraph } from "@/contexts/PsyGraphContext";
import { buildLastSessionSummary } from "@/lib/clinical/last-session";
import {
  buildSessionRecap,
  emotionalToneColour,
  emotionalToneCopy,
} from "@/lib/psy/session-recap";

interface Props {
  caseId: string;
  // The therapist view shows everything. The "client" preview shows
  // only the simplified subset.
  view?: "therapist" | "client";
}

export function SessionRecapVisual({ caseId, view = "therapist" }: Props) {
  const { sessions, checkIns } = useApp();
  const { plans } = useClinical();
  const { nodes } = usePsyGraph();

  const lastSession = useMemo(
    () =>
      buildLastSessionSummary(caseId, {
        sessions: sessions.map((s) => ({
          id: s.id,
          caseId: s.caseId,
          date: s.date,
          mainTopics: s.mainTopics,
          observations: s.observations,
          interventions: s.interventions,
          nextSteps: s.nextSteps,
        })),
        sessionPlans: plans.map((p) => ({
          id: p.id,
          caseId: p.caseId,
          date: p.date,
          status: p.status,
          postSessionNotes: p.postSessionNotes,
          goals: p.goals,
          worksheetsToGive: p.worksheetsToGive,
          riskReminders: p.riskReminders,
        })),
        checkIns: checkIns.map((c) => ({
          id: c.id,
          caseId: c.caseId,
          date: c.date,
          moodAffect: c.moodAffect,
          followUpNeeded: c.followUpNeeded,
          followUpNote: c.followUpNote,
        })),
      }),
    [caseId, sessions, plans, checkIns]
  );

  const recap = useMemo(() => {
    // Nodes dated on the session day feed theme + tone detection.
    const dayNodes = lastSession.date
      ? nodes.filter(
          (n) => n.caseId === caseId && n.date === lastSession.date
        )
      : [];
    return buildSessionRecap({
      caseId,
      lastSession,
      sessionDayNodes: dayNodes,
    });
  }, [caseId, lastSession, nodes]);

  if (!lastSession.date) {
    return (
      <div
        className="rounded-2xl border p-4 text-sm"
        style={{
          background: "var(--psych-card)",
          borderColor: "var(--psych-border)",
          color: "var(--psych-muted)",
        }}
      >
        No prior session recorded. The visual recap fills in as soon as
        you log a session, plan, or check-in.
      </div>
    );
  }

  if (view === "client") {
    return <ClientView recap={recap} />;
  }

  return <TherapistView recap={recap} />;
}

function ClientView({ recap }: { recap: ReturnType<typeof buildSessionRecap> }) {
  const tone = recap.emotionalTone;
  return (
    <div
      className="rounded-2xl border p-4 space-y-3"
      style={{
        background: "var(--psych-card)",
        borderColor: "var(--psych-border)",
      }}
    >
      <div className="flex items-center gap-2 flex-wrap">
        <span
          className="annot-tag"
          style={{
            ["--section-accent" as never]: emotionalToneColour(tone),
            ["--section-tint" as never]: `${emotionalToneColour(tone)}22`,
          }}
        >
          {emotionalToneCopy(tone)}
        </span>
        <span
          className="text-[10px] font-mono"
          style={{ color: "var(--psych-muted)" }}
        >
          {recap.date}
        </span>
      </div>
      <div className="text-sm" style={{ color: "var(--psych-text)" }}>
        {recap.client.headline}
      </div>
      {recap.client.keyFocusAreas.length > 0 && (
        <div>
          <div
            className="text-[10px] uppercase tracking-wider mb-1"
            style={{ color: "var(--psych-muted)" }}
          >
            What we focused on
          </div>
          <div className="flex flex-wrap gap-1">
            {recap.client.keyFocusAreas.map((a) => (
              <span
                key={a}
                className="text-[11px] px-2 py-0.5 rounded-full"
                style={{
                  background: "var(--psych-primary-light)",
                  color: "var(--psych-accent)",
                }}
              >
                {a}
              </span>
            ))}
          </div>
        </div>
      )}
      {recap.client.nextSteps.length > 0 && (
        <div>
          <div
            className="text-[10px] uppercase tracking-wider mb-1"
            style={{ color: "var(--psych-muted)" }}
          >
            Between sessions
          </div>
          <ul className="text-sm space-y-1" style={{ color: "var(--psych-text)" }}>
            {recap.client.nextSteps.map((s) => (
              <li key={s} className="annot-pin">{s}</li>
            ))}
          </ul>
        </div>
      )}
      {recap.client.reflectionPrompts.length > 0 && (
        <div>
          <div
            className="text-[10px] uppercase tracking-wider mb-1"
            style={{ color: "var(--psych-muted)" }}
          >
            A gentle question
          </div>
          <p
            className="text-sm italic"
            style={{ color: "var(--psych-text)" }}
          >
            {recap.client.reflectionPrompts[0]}
          </p>
        </div>
      )}
    </div>
  );
}

function TherapistView({
  recap,
}: {
  recap: ReturnType<typeof buildSessionRecap>;
}) {
  const tone = recap.emotionalTone;
  return (
    <div
      className="rounded-2xl border p-4 space-y-3"
      style={{
        background: "var(--psych-card)",
        borderColor: "var(--psych-border)",
      }}
    >
      <div className="flex items-center gap-2 flex-wrap">
        <span
          className="annot-tag"
          style={{
            ["--section-accent" as never]: emotionalToneColour(tone),
            ["--section-tint" as never]: `${emotionalToneColour(tone)}22`,
          }}
        >
          {tone}
        </span>
        <span
          className="text-sm font-semibold"
          style={{ color: "var(--psych-text)" }}
        >
          {recap.topic}
        </span>
        <span
          className="text-[10px] font-mono"
          style={{ color: "var(--psych-muted)" }}
        >
          {recap.date}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
        <Field label="Major themes" body={recap.themes.join(" · ") || "—"} />
        <Field
          label="Interventions used"
          body={recap.interventionsUsed.join(", ") || "—"}
        />
        <Field
          label="Goals discussed"
          body={recap.goalsDiscussed.join(" · ") || "—"}
        />
        <Field
          label="Unresolved threads"
          body={recap.unresolvedThreads.join(" · ") || "—"}
        />
        <Field
          label="Assigned work"
          body={recap.assignedWork.join(", ") || "—"}
        />
        <Field
          label="Therapist notes"
          body={recap.therapistNotes || "—"}
        />
      </div>
    </div>
  );
}

function Field({ label, body }: { label: string; body: string }) {
  return (
    <div>
      <div
        className="text-[10px] uppercase tracking-wider mb-1"
        style={{ color: "var(--psych-muted)" }}
      >
        {label}
      </div>
      <div style={{ color: "var(--psych-text)" }}>{body}</div>
    </div>
  );
}
