"use client";
// Session note editor — edit a draft converted from a session plan.

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { PageHeader } from "@/components/shared/PageHeader";
import { SectionCard } from "@/components/shared/SectionCard";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Printer, Save } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { useToast } from "@/components/ui/Toast";
import {
  markGoalCompleted,
  type SessionNoteDraft,
} from "@/lib/session-convert";
import {
  loadSessionNotes,
  saveSessionNotes,
  upsertSessionNote,
} from "@/lib/session-notes-store";
import { nowISO } from "@/lib/store";

export default function SessionNoteEditorPage() {
  const params = useParams();
  const id = (params?.id as string) ?? "";
  const { toast } = useToast();
  const { cases } = useApp();

  const [note, setNote] = useState<SessionNoteDraft | null>(null);

  useEffect(() => {
    const found = loadSessionNotes().find((n) => n.id === id) ?? null;
    setNote(found);
  }, [id]);

  function persist(next: SessionNoteDraft) {
    setNote(next);
    saveSessionNotes(upsertSessionNote(loadSessionNotes(), next));
  }

  function update<K extends keyof SessionNoteDraft>(
    key: K,
    value: SessionNoteDraft[K]
  ) {
    if (!note) return;
    persist({ ...note, [key]: value, updatedAt: nowISO() });
  }

  function toggleCompleted(goal: string, on: boolean) {
    if (!note) return;
    persist(markGoalCompleted(note, goal, on));
  }

  if (!note) {
    return (
      <div className="max-w-3xl mx-auto py-12 text-center">
        <p
          className="text-sm mb-3"
          style={{ color: "var(--psych-muted)" }}
        >
          Session note draft not found.
        </p>
        <Link href="/planner/notes">
          <Button variant="secondary" size="sm">
            <ArrowLeft size={13} /> Back to session notes
          </Button>
        </Link>
      </div>
    );
  }

  const linkedCase = cases.find((c) => c.id === note.caseId);

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <PageHeader
        title={`Session note — ${note.date}`}
        subtitle={linkedCase ? `${linkedCase.code} · ${linkedCase.type}` : ""}
        action={
          <div className="flex gap-2 print:hidden">
            <Link href="/planner/notes">
              <Button variant="ghost" size="sm">
                <ArrowLeft size={13} /> Back
              </Button>
            </Link>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => window.print()}
            >
              <Printer size={13} /> Print
            </Button>
            <Button
              size="sm"
              onClick={() => toast("Auto-saved locally", "info")}
            >
              <Save size={13} /> Saved
            </Button>
          </div>
        }
      />

      <div className="space-y-4">
        <SectionCard title="Plan summary">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div>
              <p
                className="text-[10px] font-semibold uppercase tracking-wide"
                style={{ color: "var(--psych-muted)" }}
              >
                Date / time
              </p>
              <p>
                {note.date} {note.time ? `· ${note.time}` : ""}
              </p>
            </div>
            <div>
              <p
                className="text-[10px] font-semibold uppercase tracking-wide"
                style={{ color: "var(--psych-muted)" }}
              >
                Source plan
              </p>
              <p className="font-mono text-xs">{note.sourcePlanId}</p>
            </div>
          </div>
          {note.carriedOverNotes && (
            <div className="mt-3">
              <p
                className="text-[10px] font-semibold uppercase tracking-wide mb-1"
                style={{ color: "var(--psych-muted)" }}
              >
                Carried over from plan
              </p>
              <p
                className="text-sm whitespace-pre-line"
                style={{ color: "var(--psych-text)" }}
              >
                {note.carriedOverNotes}
              </p>
            </div>
          )}
        </SectionCard>

        <SectionCard title="Goals">
          {note.plannedGoals.length === 0 ? (
            <p
              className="text-sm"
              style={{ color: "var(--psych-muted)" }}
            >
              No goals were planned for this session.
            </p>
          ) : (
            <ul className="space-y-1">
              {note.plannedGoals.map((g) => {
                const done = note.completedGoals.includes(g);
                return (
                  <li
                    key={g}
                    className="flex items-start gap-2 text-sm"
                  >
                    <input
                      type="checkbox"
                      className="mt-1"
                      checked={done}
                      onChange={(e) => toggleCompleted(g, e.target.checked)}
                    />
                    <span
                      style={{
                        color: "var(--psych-text)",
                        textDecoration: done ? "line-through" : "none",
                        opacity: done ? 0.7 : 1,
                      }}
                    >
                      {g}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </SectionCard>

        <SectionCard title="Questions asked">
          <Textarea
            value={note.questionsAsked.join("\n")}
            onChange={(e) =>
              update(
                "questionsAsked",
                e.target.value.split("\n").filter((x) => x.trim())
              )
            }
            className="min-h-[80px] text-sm"
            placeholder="One question per line…"
          />
        </SectionCard>

        <SectionCard title="Interventions used">
          <Textarea
            value={note.interventionsUsed.join("\n")}
            onChange={(e) =>
              update(
                "interventionsUsed",
                e.target.value.split("\n").filter((x) => x.trim())
              )
            }
            className="min-h-[80px] text-sm"
            placeholder="One per line…"
          />
        </SectionCard>

        <SectionCard title="Observations">
          <Textarea
            value={note.observations}
            onChange={(e) => update("observations", e.target.value)}
            className="min-h-[100px] text-sm"
            placeholder="What did you observe in-session?"
          />
        </SectionCard>

        <SectionCard title="Client response">
          <Textarea
            value={note.clientResponse}
            onChange={(e) => update("clientResponse", e.target.value)}
            className="min-h-[80px] text-sm"
            placeholder="How did the client respond to the work?"
          />
        </SectionCard>

        <SectionCard title="Follow-up items">
          <Textarea
            value={note.followUpItems.join("\n")}
            onChange={(e) =>
              update(
                "followUpItems",
                e.target.value.split("\n").filter((x) => x.trim())
              )
            }
            className="min-h-[80px] text-sm"
            placeholder="One follow-up per line — these become next session's plan."
          />
        </SectionCard>

        <SectionCard title="Reflection">
          <Textarea
            value={note.reflection}
            onChange={(e) => update("reflection", e.target.value)}
            className="min-h-[100px] text-sm"
            placeholder="What stood out? Countertransference? Skills to bring to supervision?"
          />
        </SectionCard>

        {note.supervisionFlags.length > 0 && (
          <SectionCard
            title="Supervision flags"
            description="Carried over from the plan — confirm or clear before supervision"
          >
            <ul className="space-y-1">
              {note.supervisionFlags.map((f) => (
                <li
                  key={f}
                  className="text-xs flex items-start gap-2"
                  style={{ color: "var(--psych-text)" }}
                >
                  <span style={{ color: "var(--psych-primary)" }}>✦</span>
                  {f}
                </li>
              ))}
            </ul>
          </SectionCard>
        )}
      </div>
    </div>
  );
}
