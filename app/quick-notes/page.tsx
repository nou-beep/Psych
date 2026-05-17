"use client";
// Quick Notes — clinician thinking space. Sticky-note style.

import { useEffect, useMemo, useState } from "react";
import { Pin, PinOff, Plus, Trash2, Search } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useApp } from "@/contexts/AppContext";
import { loadFromStorage, saveToStorage } from "@/lib/store";
import {
  NOTE_COLOURS,
  QUICK_NOTES_STORAGE_KEY,
  emptyNote,
  forCase,
  orderForBoard,
  search,
  togglePin,
  update,
  type NoteColour,
  type QuickNote,
} from "@/lib/clinical/quick-notes";

export default function QuickNotesPage() {
  const { cases } = useApp();
  const [notes, setNotes] = useState<QuickNote[]>([]);
  const [drafting, setDrafting] = useState(false);
  const [draft, setDraft] = useState<QuickNote>(emptyNote());
  const [query, setQuery] = useState("");
  const [caseFilter, setCaseFilter] = useState("");

  useEffect(() => {
    setNotes(loadFromStorage<QuickNote[]>(QUICK_NOTES_STORAGE_KEY, []));
  }, []);

  function persist(next: QuickNote[]) {
    setNotes(next);
    saveToStorage(QUICK_NOTES_STORAGE_KEY, next);
  }

  function startDraft() {
    setDraft(emptyNote({ caseId: caseFilter || undefined }));
    setDrafting(true);
  }

  function saveDraft() {
    if (!draft.body.trim()) {
      setDrafting(false);
      return;
    }
    persist([draft, ...notes]);
    setDrafting(false);
  }

  function pin(id: string) {
    persist(notes.map((n) => (n.id === id ? togglePin(n) : n)));
  }

  function remove(id: string) {
    persist(notes.filter((n) => n.id !== id));
  }

  function patch(id: string, p: Partial<QuickNote>) {
    persist(notes.map((n) => (n.id === id ? update(n, p) : n)));
  }

  const filtered = useMemo(() => {
    let pool = notes;
    if (caseFilter) pool = forCase(pool, caseFilter);
    return orderForBoard(search(pool, query));
  }, [notes, query, caseFilter]);

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      <PageHeader
        title="Quick notes"
        subtitle="Informal thinking space. Hypotheses, fragments, supervision reminders. Not formal notes."
        action={
          <Button onClick={startDraft} size="sm">
            <Plus size={13} /> New note
          </Button>
        }
      />

      <div className="flex flex-col md:flex-row gap-3 mb-4">
        <div
          className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl border"
          style={{ borderColor: "var(--psych-border)" }}
        >
          <Search size={14} style={{ color: "var(--psych-muted)" }} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search note body or tag…"
            className="flex-1 bg-transparent outline-none text-sm"
            style={{ color: "var(--psych-text)" }}
          />
        </div>
        <Select
          value={caseFilter}
          onChange={(e) => setCaseFilter(e.target.value)}
          className="md:w-64"
        >
          <option value="">All cases</option>
          {cases
            .filter((c) => !c.isArchived)
            .map((c) => (
              <option key={c.id} value={c.id}>
                {c.code} — {c.type}
              </option>
            ))}
        </Select>
      </div>

      {/* Draft */}
      {drafting && (
        <div
          className="sticky-note mb-5"
          data-section="supervision"
          data-rotate="2"
          style={{ maxWidth: 460 }}
        >
          <span className="sticky-pin" />
          <Label htmlFor="qn-body" className="text-xs">
            Quick thought
          </Label>
          <Textarea
            id="qn-body"
            value={draft.body}
            onChange={(e) => setDraft({ ...draft, body: e.target.value })}
            className="min-h-[80px] text-sm bg-transparent"
            placeholder="Hypothesis, observation, fragment…"
            autoFocus
          />
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <div className="flex gap-1">
              {(Object.keys(NOTE_COLOURS) as NoteColour[]).map((c) => (
                <button
                  key={c}
                  onClick={() => setDraft({ ...draft, colour: c })}
                  aria-label={`${c} colour`}
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: 999,
                    background: NOTE_COLOURS[c].accent,
                    outline:
                      draft.colour === c
                        ? `2px solid var(--psych-text)`
                        : "1px solid rgba(0,0,0,0.1)",
                    outlineOffset: 2,
                  }}
                />
              ))}
            </div>
            <Input
              value={draft.tags.join(", ")}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  tags: e.target.value
                    .split(",")
                    .map((t) => t.trim())
                    .filter(Boolean),
                })
              }
              placeholder="tags (comma-sep)"
              className="flex-1 min-w-[120px]"
            />
            <Select
              value={draft.caseId ?? ""}
              onChange={(e) =>
                setDraft({ ...draft, caseId: e.target.value || undefined })
              }
              className="w-44"
            >
              <option value="">No case link</option>
              {cases
                .filter((c) => !c.isArchived)
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code}
                  </option>
                ))}
            </Select>
            <div className="flex gap-1 ml-auto">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setDrafting(false)}
              >
                Cancel
              </Button>
              <Button size="sm" onClick={saveDraft}>
                Save
              </Button>
            </div>
          </div>
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="text-sm" style={{ color: "var(--psych-muted)" }}>
          {query || caseFilter ? "No notes match." : "No quick notes yet. Drop a thought."}
        </p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
            gap: "0.85rem",
            alignItems: "start",
          }}
        >
          {filtered.map((n, i) => {
            const meta = NOTE_COLOURS[n.colour];
            const caseCode = cases.find((c) => c.id === n.caseId)?.code;
            return (
              <div
                key={n.id}
                className="sticky-note"
                data-rotate={(i % 4) + 1}
                style={{
                  // @ts-expect-error css var
                  "--section-tint": meta.tint,
                  "--section-accent": meta.accent,
                  "--section-line": meta.tint,
                } as React.CSSProperties}
              >
                {n.pinned && <span className="sticky-pin" />}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 text-[10px]" style={{ color: meta.accent }}>
                    {caseCode && <span className="font-mono">{caseCode}</span>}
                    <span>{n.updatedAt.split("T")[0]}</span>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => pin(n.id)}
                      aria-label={n.pinned ? "Unpin" : "Pin"}
                      className="opacity-60 hover:opacity-100"
                      style={{ color: meta.accent }}
                    >
                      {n.pinned ? <PinOff size={11} /> : <Pin size={11} />}
                    </button>
                    <button
                      onClick={() => remove(n.id)}
                      aria-label="Delete"
                      className="opacity-60 hover:opacity-100"
                      style={{ color: "var(--psych-muted)" }}
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                </div>
                <textarea
                  value={n.body}
                  onChange={(e) => patch(n.id, { body: e.target.value })}
                  className="bg-transparent outline-none w-full resize-none"
                  rows={Math.max(3, Math.min(8, n.body.split("\n").length + 1))}
                  style={{
                    color: "var(--psych-text)",
                    fontSize: "0.9rem",
                    fontFamily: "inherit",
                    lineHeight: 1.5,
                  }}
                />
                {n.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {n.tags.map((t) => (
                      <span
                        key={t}
                        className="annot-tag"
                        style={{
                          // @ts-expect-error css var
                          "--section-tint": meta.tint,
                          "--section-accent": meta.accent,
                          "--section-line": meta.tint,
                        } as React.CSSProperties}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
