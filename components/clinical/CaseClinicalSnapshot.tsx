"use client";
// Clinical Snapshot for a case — therapy phase, needs profile, latest
// session objectives, and a "last session at a glance" card. Pulls
// from app + clinical contexts; persistence happens in localStorage.

import { useEffect, useMemo, useState } from "react";
import { Plus, X, ArrowRight } from "lucide-react";
import { SectionCard } from "@/components/shared/SectionCard";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { useApp } from "@/contexts/AppContext";
import { useClinical } from "@/contexts/ClinicalContext";
import { useToast } from "@/components/ui/Toast";
import { loadFromStorage, saveToStorage } from "@/lib/store";
import {
  PHASE_LABELS,
  PHASE_ORDER,
  PHASE_STORAGE_KEY,
  currentPhase,
  daysInCurrentPhase,
  emptyHistory,
  transitionTo,
  updateCurrentPhaseNotes,
  type CasePhaseHistory,
  type TherapyPhase,
} from "@/lib/clinical/case-phase";
import {
  ALL_NEEDS,
  NEEDS_STORAGE_KEY,
  NEED_LABELS,
  NEED_SUGGESTIONS,
  addNeed,
  emptyProfile,
  removeNeed,
  updateNeed,
  type CaseNeedsProfile,
  type NeedCategory,
  type NeedPriority,
} from "@/lib/clinical/therapy-needs";
import {
  SESSION_OBJECTIVES_STORAGE_KEY,
  carryForward,
  emptyObjectiveSet,
  latestForCase,
  linesToList,
  update as updateObjectiveSet,
  type SessionObjectiveSet,
} from "@/lib/clinical/session-objectives";
import { buildLastSessionSummary } from "@/lib/clinical/last-session";
import { SessionRecapVisual } from "@/components/psy/SessionRecapVisual";

interface Props {
  caseId: string;
}

type PhaseMap = Record<string, CasePhaseHistory>;
type NeedsMap = Record<string, CaseNeedsProfile>;

export function CaseClinicalSnapshot({ caseId }: Props) {
  const { sessions, checkIns } = useApp();
  const { plans } = useClinical();
  const { toast } = useToast();

  const [phases, setPhases] = useState<PhaseMap>({});
  const [needs, setNeeds] = useState<NeedsMap>({});
  const [objectives, setObjectives] = useState<SessionObjectiveSet[]>([]);

  useEffect(() => {
    setPhases(loadFromStorage<PhaseMap>(PHASE_STORAGE_KEY, {}));
    setNeeds(loadFromStorage<NeedsMap>(NEEDS_STORAGE_KEY, {}));
    setObjectives(
      loadFromStorage<SessionObjectiveSet[]>(SESSION_OBJECTIVES_STORAGE_KEY, [])
    );
  }, []);

  function persistPhases(next: PhaseMap) {
    setPhases(next);
    saveToStorage(PHASE_STORAGE_KEY, next);
  }
  function persistNeeds(next: NeedsMap) {
    setNeeds(next);
    saveToStorage(NEEDS_STORAGE_KEY, next);
  }
  function persistObjectives(next: SessionObjectiveSet[]) {
    setObjectives(next);
    saveToStorage(SESSION_OBJECTIVES_STORAGE_KEY, next);
  }

  // ── Phase ──
  const phaseHistory = phases[caseId] ?? emptyHistory(caseId);
  const current = currentPhase(phaseHistory);
  function changePhase(p: TherapyPhase) {
    persistPhases({ ...phases, [caseId]: transitionTo(phaseHistory, p) });
    toast(`Phase → ${PHASE_LABELS[p]}`, "success");
  }
  function updatePhaseNotes(text: string) {
    persistPhases({
      ...phases,
      [caseId]: updateCurrentPhaseNotes(phaseHistory, text),
    });
  }

  // ── Needs ──
  const profile = needs[caseId] ?? emptyProfile(caseId);
  function addCategory(cat: NeedCategory) {
    persistNeeds({ ...needs, [caseId]: addNeed(profile, cat, "secondary") });
  }
  function setNeedPatch(id: string, p: { priority?: NeedPriority; notes?: string; progress?: number; isCurrentFocus?: boolean }) {
    persistNeeds({ ...needs, [caseId]: updateNeed(profile, id, p) });
  }
  function dropNeed(id: string) {
    persistNeeds({ ...needs, [caseId]: removeNeed(profile, id) });
  }

  // ── Session objectives ──
  const latest = latestForCase(objectives, caseId);
  function newObjectiveSet(date?: string) {
    const fresh = latest
      ? carryForward(latest, date ?? new Date().toISOString().split("T")[0])
      : emptyObjectiveSet(caseId, date);
    persistObjectives([fresh, ...objectives]);
  }
  function patchObjective(patch: Partial<SessionObjectiveSet>) {
    if (!latest) return;
    persistObjectives(
      objectives.map((o) => (o.id === latest.id ? updateObjectiveSet(o, patch) : o))
    );
  }

  // ── Last session summary ──
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

  return (
    <div className="space-y-4">
      {/* Visual session recap — themes + tone + interventions */}
      <SessionRecapVisual caseId={caseId} view="therapist" />

      {/* Last session at a glance */}
      <SectionCard
        title="Last session at a glance"
        description={lastSession.date ? `Most recent activity · ${lastSession.date}` : "No prior session recorded"}
      >
        {lastSession.date ? (
          <div
            className="paper-card"
            data-state="draft"
            style={{ marginTop: 4 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <Field label="Topic" body={lastSession.topic} />
              <Field label="Interventions used" body={lastSession.interventionsUsed} />
              <Field label="Emotional themes" body={lastSession.emotionalThemes} />
              <Field label="Unresolved" body={lastSession.unresolvedTopics} />
              <Field label="Next session focus" body={lastSession.nextSessionFocus} />
              <Field
                label="Risk update"
                body={lastSession.riskUpdate}
                accent={lastSession.riskUpdate ? "#9B4D3A" : undefined}
              />
              {lastSession.assignedWork.length > 0 && (
                <div className="md:col-span-2">
                  <Label className="text-[10px] uppercase tracking-wider">
                    Work assigned
                  </Label>
                  <ul className="text-sm mt-1 space-y-0.5">
                    {lastSession.assignedWork.map((w) => (
                      <li key={w}>
                        <span className="annot-pin">{w}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {lastSession.symptomChanges && (
                <div className="md:col-span-2">
                  <Label className="text-[10px] uppercase tracking-wider">
                    Recent check-in mood
                  </Label>
                  <pre
                    className="text-sm mt-1 whitespace-pre-wrap font-sans"
                    style={{ color: "var(--psych-text)" }}
                  >
                    {lastSession.symptomChanges}
                  </pre>
                </div>
              )}
            </div>
          </div>
        ) : (
          <p className="text-sm" style={{ color: "var(--psych-muted)" }}>
            Once you log a session, plan, or check-in, the last-session card
            populates here.
          </p>
        )}
      </SectionCard>

      {/* Therapy phase */}
      <SectionCard
        title="Therapy phase"
        description="Active treatment arc"
      >
        <div className="flex items-center gap-3 mb-3 flex-wrap">
          {current && (
            <>
              <span className="phase-pill">
                {PHASE_LABELS[current.phase]}
              </span>
              <span className="text-xs" style={{ color: "var(--psych-muted)" }}>
                {daysInCurrentPhase(phaseHistory)} day(s) in this phase
              </span>
            </>
          )}
          <Select
            value={current?.phase ?? ""}
            onChange={(e) => changePhase(e.target.value as TherapyPhase)}
            className="w-56 ml-auto"
          >
            {PHASE_ORDER.map((p) => (
              <option key={p} value={p}>
                Transition → {PHASE_LABELS[p]}
              </option>
            ))}
          </Select>
        </div>
        <Textarea
          value={current?.notes ?? ""}
          onChange={(e) => updatePhaseNotes(e.target.value)}
          placeholder="Phase notes — clinical reasoning for staying / moving."
          className="min-h-[80px]"
        />
        {phaseHistory.entries.length > 1 && (
          <div className="mt-3 pt-3 border-t" style={{ borderColor: "var(--psych-border)" }}>
            <Label className="text-[10px] uppercase tracking-wider mb-1">
              Phase history
            </Label>
            <ul className="space-y-1 mt-1">
              {phaseHistory.entries.map((e) => (
                <li
                  key={e.id}
                  className="text-xs flex items-center gap-2"
                  style={{ color: "var(--psych-muted)" }}
                >
                  <span className="font-mono">{e.startedAt.split("T")[0]}</span>
                  <ArrowRight size={10} />
                  <span style={{ color: "var(--psych-text)" }}>
                    {PHASE_LABELS[e.phase]}
                  </span>
                  {e.closedAt && (
                    <span>
                      · closed {e.closedAt.split("T")[0]}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </SectionCard>

      {/* Therapy needs */}
      <SectionCard
        title="What they need from therapy"
        description="Underlying therapeutic needs — distinct from session goals"
      >
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <Select
            onChange={(e) => {
              if (e.target.value) {
                addCategory(e.target.value as NeedCategory);
                e.target.value = "";
              }
            }}
            value=""
            className="w-64"
          >
            <option value="">+ Add a need…</option>
            {ALL_NEEDS.filter(
              (n) => !profile.entries.some((p) => p.category === n)
            ).map((n) => (
              <option key={n} value={n}>
                {NEED_LABELS[n]}
              </option>
            ))}
          </Select>
        </div>

        {profile.entries.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--psych-muted)" }}>
            No needs profiled yet. Adding a couple of primary needs helps
            organise the treatment plan and surface relevant interventions.
          </p>
        ) : (
          <ul className="space-y-2">
            {profile.entries.map((entry) => {
              const meta = NEED_SUGGESTIONS[entry.category];
              return (
                <li
                  key={entry.id}
                  className="rounded-xl border p-3"
                  style={{ borderColor: "var(--psych-border)" }}
                >
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span
                      className="text-sm font-semibold"
                      style={{ color: "var(--psych-text)" }}
                    >
                      {NEED_LABELS[entry.category]}
                    </span>
                    <Select
                      value={entry.priority}
                      onChange={(e) =>
                        setNeedPatch(entry.id, {
                          priority: e.target.value as NeedPriority,
                        })
                      }
                      className="w-32"
                    >
                      <option value="primary">Primary</option>
                      <option value="secondary">Secondary</option>
                      <option value="watching">Watching</option>
                    </Select>
                    <label
                      className="text-xs inline-flex items-center gap-1"
                      style={{ color: "var(--psych-muted)" }}
                    >
                      <input
                        type="checkbox"
                        checked={entry.isCurrentFocus}
                        onChange={(e) =>
                          setNeedPatch(entry.id, {
                            isCurrentFocus: e.target.checked,
                          })
                        }
                      />
                      Current focus
                    </label>
                    <div className="flex items-center gap-2 ml-auto">
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={entry.progress}
                        onChange={(e) =>
                          setNeedPatch(entry.id, {
                            progress: Number(e.target.value),
                          })
                        }
                        aria-label="Progress"
                      />
                      <span
                        className="text-xs"
                        style={{ color: "var(--psych-muted)" }}
                      >
                        {entry.progress}%
                      </span>
                      <button
                        onClick={() => dropNeed(entry.id)}
                        aria-label="Remove"
                        style={{ color: "var(--psych-muted)" }}
                      >
                        <X size={13} />
                      </button>
                    </div>
                  </div>
                  <Textarea
                    value={entry.notes}
                    onChange={(e) =>
                      setNeedPatch(entry.id, { notes: e.target.value })
                    }
                    placeholder="What does this need look like for this client?"
                    className="min-h-[60px] text-sm"
                  />
                  {(meta.interventions.length > 0 || meta.workbooks.length > 0) && (
                    <div
                      className="annot-margin-note mt-2 text-xs"
                      style={{ padding: "4px 8px" }}
                    >
                      Linked interventions:{" "}
                      {meta.interventions.length > 0
                        ? meta.interventions.join(", ")
                        : "—"}
                      {meta.workbooks.length > 0 && (
                        <> · workbooks: {meta.workbooks.join(", ")}</>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </SectionCard>

      {/* Session objectives */}
      <SectionCard
        title="Session objectives"
        description="Prep for the next session"
        action={
          <Button size="sm" variant="secondary" onClick={() => newObjectiveSet()}>
            <Plus size={13} /> New prep
          </Button>
        }
      >
        {latest ? (
          <div className="space-y-3">
            <div className="text-xs" style={{ color: "var(--psych-muted)" }}>
              For session · <span className="font-mono">{latest.date}</span>
            </div>
            <ListField
              label="Objectives"
              value={latest.objectives}
              onChange={(v) => patchObjective({ objectives: linesToList(v) })}
            />
            <ListField
              label="Unresolved themes"
              value={latest.unresolvedThemes}
              onChange={(v) => patchObjective({ unresolvedThemes: linesToList(v) })}
            />
            <ListField
              label="Follow-up points"
              value={latest.followUpPoints}
              onChange={(v) => patchObjective({ followUpPoints: linesToList(v) })}
            />
            <ListField
              label="Intervention ideas"
              value={latest.interventionIdeas}
              onChange={(v) => patchObjective({ interventionIdeas: linesToList(v) })}
            />
            <ListField
              label="Assessments to review"
              value={latest.assessmentsToReview}
              onChange={(v) => patchObjective({ assessmentsToReview: linesToList(v) })}
            />
            <ListField
              label="Workbook discussion"
              value={latest.workbookDiscussion}
              onChange={(v) => patchObjective({ workbookDiscussion: linesToList(v) })}
            />
            <ListField
              label="Supervision reminders"
              value={latest.supervisionReminders}
              onChange={(v) => patchObjective({ supervisionReminders: linesToList(v) })}
            />
            <ListField
              label="Emotional themes"
              value={latest.emotionalThemes}
              onChange={(v) => patchObjective({ emotionalThemes: linesToList(v) })}
            />
            <div>
              <Label className="text-[10px] uppercase tracking-wider">
                Observations
              </Label>
              <Textarea
                value={latest.observations}
                onChange={(e) => patchObjective({ observations: e.target.value })}
                className="min-h-[60px] text-sm"
              />
            </div>
            <label
              className="text-xs inline-flex items-center gap-2"
              style={{ color: "var(--psych-muted)" }}
            >
              <input
                type="checkbox"
                checked={latest.used}
                onChange={(e) => patchObjective({ used: e.target.checked })}
              />
              Marked as used after the session
            </label>
          </div>
        ) : (
          <p className="text-sm" style={{ color: "var(--psych-muted)" }}>
            No session prep yet. Start one above; it carries forward unresolved
            themes from session to session.
          </p>
        )}
      </SectionCard>
    </div>
  );
}

function Field({
  label,
  body,
  accent,
}: {
  label: string;
  body: string | null | undefined;
  accent?: string;
}) {
  return (
    <div>
      <div
        className="text-[10px] uppercase tracking-wider mb-1"
        style={{ color: "var(--psych-muted)" }}
      >
        {label}
      </div>
      <div
        className="text-sm"
        style={{ color: accent ?? "var(--psych-text)" }}
      >
        {body && body.trim() ? body : "—"}
      </div>
    </div>
  );
}

function ListField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string[];
  onChange: (text: string) => void;
}) {
  return (
    <div>
      <Label className="text-[10px] uppercase tracking-wider">{label}</Label>
      <Textarea
        value={value.join("\n")}
        onChange={(e) => onChange(e.target.value)}
        placeholder="One per line"
        className="min-h-[60px] text-sm"
      />
    </div>
  );
}
