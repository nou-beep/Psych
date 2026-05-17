"use client";
// Session Preparation Mode — assembles everything the therapist needs
// to walk into the next session for a given case.

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Pin,
  Plus,
  Trash2,
} from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { SectionCard } from "@/components/shared/SectionCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useApp } from "@/contexts/AppContext";
import { loadFromStorage, saveToStorage } from "@/lib/store";
import {
  SESSION_PREP_STORAGE_KEY,
  addAgendaItem,
  addFocusPoint,
  buildPrepBundle,
  emptyPrep,
  patchPrep,
  removeAgendaItem,
  removeFocusPoint,
  toggleAgendaItem,
  type AssessmentLike,
  type OpenLoopLike,
  type SessionPrepNote,
  type ThreadLike,
} from "@/lib/workspace/session-prep";

export default function PrepPage() {
  return (
    <Suspense fallback={null}>
      <PrepInner />
    </Suspense>
  );
}

function PrepInner() {
  const params = useSearchParams();
  const caseIdParam = params.get("case");
  const { cases, sessions, checkIns, assessments } = useApp();
  const activeCases = cases.filter((c) => !c.isArchived);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(
    caseIdParam ?? activeCases[0]?.id ?? null
  );

  const [preps, setPreps] = useState<SessionPrepNote[]>([]);
  const [openLoops, setOpenLoops] = useState<OpenLoopLike[]>([]);
  const [threads, setThreads] = useState<ThreadLike[]>([]);

  useEffect(() => {
    try {
      setPreps(
        loadFromStorage<SessionPrepNote[]>(SESSION_PREP_STORAGE_KEY, [])
      );
    } catch {
      setPreps([]);
    }
    try {
      const ol = loadFromStorage<unknown[]>("psych-open-loops-v1", []);
      setOpenLoops(
        Array.isArray(ol)
          ? (ol
              .map((x: unknown) => {
                const v = x as Record<string, unknown>;
                if (!v || typeof v !== "object") return null;
                return {
                  id: String(v.id ?? ""),
                  caseId: v.caseId ? String(v.caseId) : undefined,
                  title: String(v.title ?? v.label ?? "Open loop"),
                  status: String(v.status ?? "open"),
                  updatedAt: String(v.updatedAt ?? new Date().toISOString()),
                };
              })
              .filter(Boolean) as OpenLoopLike[])
          : []
      );
    } catch {
      setOpenLoops([]);
    }
    try {
      const th = loadFromStorage<unknown[]>("psych-threads-v1", []);
      setThreads(
        Array.isArray(th)
          ? (th
              .map((x: unknown) => {
                const v = x as Record<string, unknown>;
                if (!v || typeof v !== "object") return null;
                return {
                  id: String(v.id ?? ""),
                  caseId: v.caseId ? String(v.caseId) : undefined,
                  label: String(v.label ?? v.title ?? "Thread"),
                  intensity: typeof v.intensity === "number" ? v.intensity : undefined,
                  updatedAt: String(v.updatedAt ?? new Date().toISOString()),
                };
              })
              .filter(Boolean) as ThreadLike[])
          : []
      );
    } catch {
      setThreads([]);
    }
  }, []);

  function persistPreps(next: SessionPrepNote[]) {
    setPreps(next);
    saveToStorage(SESSION_PREP_STORAGE_KEY, next);
  }

  const selectedCase = activeCases.find((c) => c.id === selectedCaseId) ?? null;
  const bundle = useMemo(() => {
    if (!selectedCase) return null;
    const prep =
      preps.find((p) => p.caseId === selectedCase.id) ??
      emptyPrep(selectedCase.id);
    return buildPrepBundle({
      case: selectedCase,
      sessions,
      checkIns,
      assessments: assessments as AssessmentLike[],
      openLoops,
      threads,
      prep,
    });
  }, [selectedCase, preps, sessions, checkIns, assessments, openLoops, threads]);

  function updatePrep(patch: Partial<SessionPrepNote>) {
    if (!selectedCase) return;
    persistPreps(patchPrep(preps, selectedCase.id, patch));
  }

  function applyPrep(next: SessionPrepNote) {
    if (!selectedCase) return;
    persistPreps(
      preps.some((p) => p.caseId === selectedCase.id)
        ? preps.map((p) => (p.caseId === selectedCase.id ? next : p))
        : [...preps, next]
    );
  }

  if (activeCases.length === 0) {
    return (
      <div className="max-w-3xl mx-auto py-12 text-sm text-center" style={{ color: "var(--psych-muted)" }}>
        Aucun cas actif. Créer un cas dans <Link href="/cases" className="underline">/cases</Link> pour préparer une séance.
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto animate-fade-in">
      <PageHeader
        title="Session preparation"
        subtitle="Tout ce dont vous avez besoin pour la prochaine séance — notes, check-ins, loops ouverts, hypothèses actives."
      />

      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <span
          className="text-[10px] uppercase tracking-wider"
          style={{ color: "var(--psych-muted)" }}
        >
          Case
        </span>
        <select
          value={selectedCase?.id ?? ""}
          onChange={(e) => setSelectedCaseId(e.target.value)}
          className="text-xs px-2 py-1 rounded-md border"
          style={{
            borderColor: "var(--psych-border)",
            backgroundColor: "var(--psych-card)",
            color: "var(--psych-text)",
          }}
        >
          {activeCases.map((c) => (
            <option key={c.id} value={c.id}>
              {c.code} — {c.shortNote.slice(0, 40)}
            </option>
          ))}
        </select>
        {selectedCase && (
          <Link
            href={`/cases/${selectedCase.id}`}
            className="text-xs underline"
            style={{ color: "var(--psych-primary)" }}
          >
            Open case desktop →
          </Link>
        )}
      </div>

      {bundle && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left: prep workspace */}
          <div className="space-y-3 lg:col-span-2">
            <SectionCard title="Prep notes" description="Notes libres pour cette séance.">
              <Textarea
                value={bundle.prep.prepNotes}
                onChange={(e) => updatePrep({ prepNotes: e.target.value })}
                placeholder="Notes de préparation : ce que je veux explorer, vérifier, soulever…"
                className="min-h-[140px] text-sm"
              />
            </SectionCard>

            <SectionCard
              title="Focus points"
              description="Points épinglés à garder devant les yeux."
            >
              <ul className="space-y-1.5 mb-2">
                {bundle.prep.focusPoints.map((f) => (
                  <li
                    key={f.id}
                    className="flex items-center gap-2 text-sm rounded-md px-2 py-1.5"
                    style={{
                      backgroundColor: "var(--psych-primary-light)",
                      color: "var(--psych-text)",
                    }}
                  >
                    <Pin size={11} style={{ color: "var(--psych-primary)" }} />
                    <span className="flex-1">{f.body}</span>
                    <button
                      onClick={() =>
                        applyPrep(removeFocusPoint(bundle.prep, f.id))
                      }
                      aria-label="Retirer"
                      style={{ color: "var(--psych-muted)" }}
                    >
                      <Trash2 size={11} />
                    </button>
                  </li>
                ))}
              </ul>
              <FocusInput
                onAdd={(body) => applyPrep(addFocusPoint(bundle.prep, body))}
              />
            </SectionCard>

            <SectionCard
              title="Agenda"
              description="Ordre + durée estimée."
            >
              <ul className="space-y-1 mb-2">
                {bundle.prep.agenda.map((a, idx) => (
                  <li
                    key={a.id}
                    className="flex items-center gap-2 text-sm border rounded-md px-2 py-1.5"
                    style={{ borderColor: "var(--psych-border)" }}
                  >
                    <span
                      className="text-[10px] font-mono"
                      style={{ color: "var(--psych-muted)" }}
                    >
                      {idx + 1}.
                    </span>
                    <input
                      type="checkbox"
                      checked={a.completed}
                      onChange={() =>
                        applyPrep(toggleAgendaItem(bundle.prep, a.id))
                      }
                    />
                    <span
                      className="flex-1"
                      style={{
                        textDecoration: a.completed
                          ? "line-through"
                          : undefined,
                        color: a.completed
                          ? "var(--psych-muted)"
                          : "var(--psych-text)",
                      }}
                    >
                      {a.body}
                    </span>
                    {a.durationMinutes && (
                      <span
                        className="text-[10px]"
                        style={{ color: "var(--psych-muted)" }}
                      >
                        {a.durationMinutes}min
                      </span>
                    )}
                    <button
                      onClick={() =>
                        applyPrep(removeAgendaItem(bundle.prep, a.id))
                      }
                      aria-label="Retirer"
                      style={{ color: "var(--psych-muted)" }}
                    >
                      <Trash2 size={11} />
                    </button>
                  </li>
                ))}
              </ul>
              <AgendaInput
                onAdd={(body, dur) =>
                  applyPrep(addAgendaItem(bundle.prep, body, dur))
                }
              />
            </SectionCard>

            <SectionCard
              title="Supervision questions"
              description="Points à amener à la prochaine supervision."
            >
              <Textarea
                value={bundle.prep.supervisionQuestions}
                onChange={(e) =>
                  updatePrep({ supervisionQuestions: e.target.value })
                }
                placeholder="Une question, une hésitation, un dilemme…"
                className="min-h-[80px] text-sm"
              />
            </SectionCard>
          </div>

          {/* Right: aggregated context */}
          <div className="space-y-3">
            {bundle.staleFlags.length > 0 && (
              <SectionCard title="Flags">
                <ul className="space-y-1 text-xs">
                  {bundle.staleFlags.map((f) => (
                    <li
                      key={f}
                      className="flex items-center gap-2"
                      style={{ color: "#9F1239" }}
                    >
                      <AlertCircle size={11} /> {f}
                    </li>
                  ))}
                </ul>
              </SectionCard>
            )}

            {bundle.trends.length > 0 && (
              <SectionCard title="Trends" description="Évolution depuis les check-ins.">
                <ul className="space-y-1 text-xs">
                  {bundle.trends.map((t) => (
                    <li key={t.label} className="flex items-center gap-2">
                      <span
                        className="font-medium"
                        style={{ color: "var(--psych-text)" }}
                      >
                        {t.label}
                      </span>
                      <span
                        className="text-[10px] px-1.5 py-0.5 rounded-full"
                        style={{
                          backgroundColor:
                            t.direction === "up"
                              ? "#FEE2E2"
                              : t.direction === "down"
                              ? "#DCFCE7"
                              : "var(--psych-primary-light)",
                          color:
                            t.direction === "up"
                              ? "#9F1239"
                              : t.direction === "down"
                              ? "#065F46"
                              : "var(--psych-primary)",
                        }}
                      >
                        {t.direction === "up"
                          ? "↑"
                          : t.direction === "down"
                          ? "↓"
                          : "→"}{" "}
                        {t.direction}
                      </span>
                    </li>
                  ))}
                </ul>
              </SectionCard>
            )}

            <SectionCard
              title="Recent sessions"
              description={`${bundle.recentSessions.length} session(s).`}
            >
              <ul className="space-y-1 text-xs">
                {bundle.recentSessions.map((s) => (
                  <li
                    key={s.id}
                    className="flex items-center gap-2"
                  >
                    <Clock size={10} style={{ color: "var(--psych-muted)" }} />
                    <span style={{ color: "var(--psych-text)" }}>
                      {s.date}
                    </span>
                    <span style={{ color: "var(--psych-muted)" }}>
                      {s.mainTopics}
                    </span>
                  </li>
                ))}
                {bundle.recentSessions.length === 0 && (
                  <li style={{ color: "var(--psych-muted)" }}>—</li>
                )}
              </ul>
            </SectionCard>

            <SectionCard
              title="Open loops"
              description={`${bundle.openLoops.length} loop(s) en cours.`}
            >
              <ul className="space-y-1 text-xs">
                {bundle.openLoops.slice(0, 5).map((l) => (
                  <li
                    key={l.id}
                    className="flex items-center gap-2"
                  >
                    <CheckCircle2
                      size={10}
                      style={{ color: "var(--psych-accent)" }}
                    />
                    <span style={{ color: "var(--psych-text)" }}>
                      {l.title}
                    </span>
                    <span
                      className="text-[10px] ml-auto"
                      style={{ color: "var(--psych-muted)" }}
                    >
                      {l.status}
                    </span>
                  </li>
                ))}
                {bundle.openLoops.length === 0 && (
                  <li style={{ color: "var(--psych-muted)" }}>—</li>
                )}
              </ul>
            </SectionCard>

            <SectionCard title="Active threads">
              <ul className="space-y-1 text-xs">
                {bundle.activeThreads.slice(0, 5).map((t) => (
                  <li
                    key={t.id}
                    className="flex items-center gap-2"
                  >
                    <span style={{ color: "var(--psych-text)" }}>
                      {t.label}
                    </span>
                    {typeof t.intensity === "number" && (
                      <span
                        className="text-[10px] ml-auto"
                        style={{ color: "var(--psych-muted)" }}
                      >
                        intensity {t.intensity}
                      </span>
                    )}
                  </li>
                ))}
                {bundle.activeThreads.length === 0 && (
                  <li style={{ color: "var(--psych-muted)" }}>—</li>
                )}
              </ul>
            </SectionCard>

            <SectionCard title="Recent check-ins">
              <ul className="space-y-1 text-xs">
                {bundle.recentCheckIns.slice(0, 4).map((c) => (
                  <li key={c.id} className="flex items-center gap-2">
                    <span style={{ color: "var(--psych-muted)" }}>
                      {c.date}
                    </span>
                    <span style={{ color: "var(--psych-text)" }}>
                      {c.moodAffect.slice(0, 30) || c.freeNotes.slice(0, 30)}
                    </span>
                  </li>
                ))}
                {bundle.recentCheckIns.length === 0 && (
                  <li style={{ color: "var(--psych-muted)" }}>—</li>
                )}
              </ul>
            </SectionCard>
          </div>
        </div>
      )}
    </div>
  );
}

function FocusInput({ onAdd }: { onAdd: (body: string) => void }) {
  const [body, setBody] = useState("");
  return (
    <div className="flex items-center gap-2">
      <Input
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Ajouter un focus point…"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            onAdd(body);
            setBody("");
          }
        }}
      />
      <Button
        size="sm"
        onClick={() => {
          onAdd(body);
          setBody("");
        }}
      >
        <Plus size={11} />
      </Button>
    </div>
  );
}

function AgendaInput({
  onAdd,
}: {
  onAdd: (body: string, durationMinutes?: number) => void;
}) {
  const [body, setBody] = useState("");
  const [dur, setDur] = useState("");
  return (
    <div className="flex items-center gap-2">
      <Input
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Élément d'agenda…"
        className="flex-1"
      />
      <Input
        value={dur}
        onChange={(e) => setDur(e.target.value)}
        placeholder="Min"
        className="w-16"
      />
      <Button
        size="sm"
        onClick={() => {
          onAdd(body, dur ? Number(dur) : undefined);
          setBody("");
          setDur("");
        }}
      >
        <Plus size={11} />
      </Button>
    </div>
  );
}
