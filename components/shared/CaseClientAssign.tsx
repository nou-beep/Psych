"use client";
// Therapist-side panel for the Client portal tab on a case.
// Assigns workbooks / journeys / cards / supportive notes to the client.

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Trash2, ExternalLink } from "lucide-react";
import { SectionCard } from "@/components/shared/SectionCard";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/Toast";
import {
  createAssignment,
  loadAssignments,
  removeAssignment,
  saveAssignments,
  type ClientAssignment,
  type AssignmentKind,
} from "@/lib/client/assignments";
import { ALL_WORKBOOKS } from "@/lib/client/workbooks";
import { ALL_JOURNEYS } from "@/lib/client/journeys";
import { ALL_CARDS, DECK_LABELS } from "@/lib/client/therapy-cards";

export function CaseClientAssign({
  caseId,
  caseCode,
}: {
  caseId: string;
  caseCode: string;
}) {
  const { toast } = useToast();
  const [items, setItems] = useState<ClientAssignment[]>([]);
  const [kind, setKind] = useState<AssignmentKind>("workbook");
  const [targetId, setTargetId] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    setItems(loadAssignments().filter((a) => a.caseId === caseId));
  }, [caseId]);

  function persist(next: ClientAssignment[]) {
    // Persist the FULL list (not just this case's) — load others, replace ours.
    const others = loadAssignments().filter((a) => a.caseId !== caseId);
    saveAssignments([...others, ...next]);
    setItems(next);
  }

  function add() {
    if (kind !== "note" && !targetId) {
      toast("Pick something to assign", "warning");
      return;
    }
    const a = createAssignment({
      kind,
      targetId: kind === "note" ? undefined : targetId,
      note: note.trim() || undefined,
      caseId,
    });
    persist([a, ...items]);
    setTargetId("");
    setNote("");
    toast("Assigned softly", "success");
  }

  function remove(id: string) {
    persist(removeAssignment(items, id));
  }

  return (
    <div className="space-y-4">
      <SectionCard
        title="Send something to the client portal"
        description={`Anything you assign appears on the client's home screen as "From your therapist". Case ${caseCode}`}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <Label htmlFor="ca-kind">Kind</Label>
            <Select
              id="ca-kind"
              value={kind}
              onChange={(e) => {
                setKind(e.target.value as AssignmentKind);
                setTargetId("");
              }}
            >
              <option value="workbook">Workbook</option>
              <option value="journey">Journey</option>
              <option value="card">Therapeutic card</option>
              <option value="note">Supportive note</option>
            </Select>
          </div>

          {kind !== "note" && (
            <div>
              <Label htmlFor="ca-target">Pick one</Label>
              <Select
                id="ca-target"
                value={targetId}
                onChange={(e) => setTargetId(e.target.value)}
              >
                <option value="">Choose…</option>
                {kind === "workbook" &&
                  ALL_WORKBOOKS.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.title}
                    </option>
                  ))}
                {kind === "journey" &&
                  ALL_JOURNEYS.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.title}
                    </option>
                  ))}
                {kind === "card" &&
                  ALL_CARDS.map((c) => (
                    <option key={c.id} value={c.id}>
                      [{DECK_LABELS[c.deck]}] {c.prompt.slice(0, 60)}
                    </option>
                  ))}
              </Select>
            </div>
          )}

          <div className="md:col-span-2">
            <Label htmlFor="ca-note">Supportive note (optional)</Label>
            <Textarea
              id="ca-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="A gentle line you'd like the client to see."
              className="min-h-[80px]"
            />
          </div>

          <div className="md:col-span-2">
            <Button onClick={add} size="sm">
              <Plus size={14} /> Assign
            </Button>
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title={`Assigned to client (${items.length})`}
        action={
          <Link href="/client">
            <Button variant="ghost" size="sm">
              <ExternalLink size={13} /> Preview client portal
            </Button>
          </Link>
        }
      >
        {items.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--psych-muted)" }}>
            Nothing assigned yet for this case.
          </p>
        ) : (
          <ul className="space-y-2">
            {items.map((a) => (
              <li
                key={a.id}
                className="flex items-start gap-3 px-3 py-2 rounded-xl border"
                style={{ borderColor: "var(--psych-border)" }}
              >
                <div className="flex-1">
                  <div
                    className="text-[10px] font-semibold uppercase tracking-wide"
                    style={{ color: "var(--psych-muted)" }}
                  >
                    {a.kind}
                    {a.acknowledged ? " · seen" : " · unread"}
                  </div>
                  <div className="text-sm" style={{ color: "var(--psych-text)" }}>
                    {a.kind === "workbook" &&
                      (ALL_WORKBOOKS.find((w) => w.id === a.targetId)?.title ??
                        "Workbook")}
                    {a.kind === "journey" &&
                      (ALL_JOURNEYS.find((j) => j.id === a.targetId)?.title ??
                        "Journey")}
                    {a.kind === "card" &&
                      (ALL_CARDS.find((c) => c.id === a.targetId)?.prompt ??
                        "Card")}
                    {a.kind === "note" && (a.note ?? "Supportive note")}
                  </div>
                  {a.note && a.kind !== "note" && (
                    <p className="text-xs mt-1" style={{ color: "var(--psych-muted)" }}>
                      “{a.note}”
                    </p>
                  )}
                </div>
                <button
                  onClick={() => remove(a.id)}
                  className="p-1.5 rounded-lg"
                  style={{ color: "var(--psych-muted)" }}
                  aria-label="Remove"
                >
                  <Trash2 size={13} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>
    </div>
  );
}
