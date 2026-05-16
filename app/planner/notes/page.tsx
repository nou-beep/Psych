"use client";
// Session notes — list of draft notes converted from session plans.

import { useEffect, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/shared/PageHeader";
import { SectionCard } from "@/components/shared/SectionCard";
import { Button } from "@/components/ui/button";
import { FileEdit, Trash2 } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { useToast } from "@/components/ui/Toast";
import type { SessionNoteDraft } from "@/lib/session-convert";
import {
  loadSessionNotes,
  saveSessionNotes,
  removeSessionNote,
} from "@/lib/session-notes-store";

export default function SessionNotesListPage() {
  const { cases } = useApp();
  const { toast } = useToast();
  const [notes, setNotes] = useState<SessionNoteDraft[]>([]);

  useEffect(() => {
    setNotes(loadSessionNotes());
  }, []);

  function destroy(id: string) {
    const next = removeSessionNote(notes, id);
    setNotes(next);
    saveSessionNotes(next);
    toast("Note draft deleted", "info");
  }

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <PageHeader
        title="Session Notes"
        subtitle="Drafts converted from session plans — edit, print, or save to a case"
      />

      {notes.length === 0 ? (
        <SectionCard title="No drafts yet">
          <p className="text-sm" style={{ color: "var(--psych-muted)" }}>
            Convert a session plan into a note from the{" "}
            <Link href="/planner" style={{ color: "var(--psych-primary)" }}>
              Session Planner
            </Link>
            . Each draft inherits the plan&rsquo;s goals, questions, and
            interventions so you only need to record what actually happened.
          </p>
        </SectionCard>
      ) : (
        <div className="space-y-2">
          {notes
            .slice()
            .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
            .map((n) => {
              const linkedCase = cases.find((c) => c.id === n.caseId);
              return (
                <div
                  key={n.id}
                  className="flex items-center gap-3 rounded-2xl border p-3"
                  style={{
                    backgroundColor: "var(--psych-card)",
                    borderColor: "var(--psych-border)",
                  }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className="text-xs font-mono"
                        style={{ color: "var(--psych-muted)" }}
                      >
                        {n.date}
                      </span>
                      {linkedCase && (
                        <span
                          className="text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{
                            backgroundColor: "var(--psych-primary-light)",
                            color: "var(--psych-primary)",
                          }}
                        >
                          {linkedCase.code}
                        </span>
                      )}
                    </div>
                    <p className="text-sm" style={{ color: "var(--psych-text)" }}>
                      {n.plannedGoals.length} goal(s) · {n.completedGoals.length}{" "}
                      completed · {n.interventionsUsed.length} intervention(s)
                    </p>
                  </div>
                  <Link href={`/planner/notes/${n.id}`}>
                    <Button size="sm" variant="secondary">
                      <FileEdit size={13} /> Edit
                    </Button>
                  </Link>
                  <button
                    onClick={() => destroy(n.id)}
                    className="p-1.5 rounded-lg"
                    style={{ color: "var(--psych-muted)" }}
                    aria-label="Delete draft"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}
