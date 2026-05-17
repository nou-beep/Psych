"use client";
// Clinical Interview — pick a template, fill structured sections,
// compare against past interviews.

import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { SectionCard } from "@/components/shared/SectionCard";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useApp } from "@/contexts/AppContext";
import { loadFromStorage, saveToStorage } from "@/lib/store";
import {
  INTERVIEW_STORAGE_KEY,
  INTERVIEW_TEMPLATES,
  diffInterviews,
  emptyInterview,
  findTemplate,
  setAnswer,
  type SavedInterview,
} from "@/lib/clinical/interview";
import { Plus, Printer, Trash2 } from "lucide-react";

export default function InterviewPage() {
  const { cases } = useApp();
  const [saved, setSaved] = useState<SavedInterview[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [compareId, setCompareId] = useState<string>("");

  useEffect(() => {
    setSaved(loadFromStorage<SavedInterview[]>(INTERVIEW_STORAGE_KEY, []));
  }, []);

  function persist(next: SavedInterview[]) {
    setSaved(next);
    saveToStorage(INTERVIEW_STORAGE_KEY, next);
  }

  function startNew(templateId: string) {
    const i = emptyInterview(templateId);
    persist([i, ...saved]);
    setActiveId(i.id);
  }

  const active = useMemo(
    () => saved.find((s) => s.id === activeId) ?? null,
    [saved, activeId]
  );
  const template = active ? findTemplate(active.templateId) : null;
  const compareWith = saved.find((s) => s.id === compareId) ?? null;
  const compareTemplate = compareWith ? findTemplate(compareWith.templateId) : null;

  function updateSection(sectionId: string, text: string) {
    if (!active) return;
    const next = setAnswer(active, sectionId, text);
    persist(saved.map((s) => (s.id === active.id ? next : s)));
  }

  function update(patch: Partial<SavedInterview>) {
    if (!active) return;
    persist(
      saved.map((s) =>
        s.id === active.id
          ? { ...s, ...patch, updatedAt: new Date().toISOString() }
          : s
      )
    );
  }

  function destroy(id: string) {
    persist(saved.filter((s) => s.id !== id));
    if (activeId === id) setActiveId(null);
  }

  // Diff against a prior interview, if compatible template.
  const diff =
    active && compareWith && template && compareTemplate?.id === template.id
      ? diffInterviews(compareWith, active, template)
      : null;

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      <PageHeader
        title="Clinical interview"
        subtitle={`${INTERVIEW_TEMPLATES.length} templates · intake, follow-up, focused variants`}
        action={
          <div className="flex flex-wrap gap-2">
            {INTERVIEW_TEMPLATES.map((t) => (
              <Button
                key={t.id}
                onClick={() => startNew(t.id)}
                size="sm"
                variant={t.id === "intake-general" ? "primary" : "secondary"}
              >
                <Plus size={13} /> {t.title}
              </Button>
            ))}
          </div>
        }
      />

      {active && template && (
        <SectionCard
          title={template.title}
          description={`${template.audience} · ${template.sections.length} sections`}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
            <div>
              <Label htmlFor="iv-case">Linked case</Label>
              <Select
                id="iv-case"
                value={active.caseId ?? ""}
                onChange={(e) => update({ caseId: e.target.value || undefined })}
              >
                <option value="">(none)</option>
                {cases
                  .filter((c) => !c.isArchived)
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code} — {c.type}
                    </option>
                  ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="iv-date">Date</Label>
              <Input
                id="iv-date"
                type="date"
                value={active.date}
                onChange={(e) => update({ date: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="iv-compare">Compare with</Label>
              <Select
                id="iv-compare"
                value={compareId}
                onChange={(e) => setCompareId(e.target.value)}
              >
                <option value="">(none)</option>
                {saved
                  .filter((s) => s.id !== active.id && s.templateId === active.templateId)
                  .filter((s) => !active.caseId || s.caseId === active.caseId)
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.date} · {findTemplate(s.templateId)?.title}
                    </option>
                  ))}
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            {template.sections.map((s) => (
              <div
                key={s.id}
                className="rounded-xl border p-3"
                style={{ borderColor: "var(--psych-border)" }}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3
                    className="text-sm font-semibold"
                    style={{ color: "var(--psych-text)" }}
                  >
                    {s.title}
                  </h3>
                  {s.emphasis && (
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded-full"
                      style={{
                        backgroundColor: "var(--psych-primary-light)",
                        color: "var(--psych-accent)",
                      }}
                    >
                      {s.emphasis}
                    </span>
                  )}
                </div>
                {s.prompts.length > 0 && (
                  <ul
                    className="text-xs space-y-0.5 mb-2"
                    style={{ color: "var(--psych-muted)" }}
                  >
                    {s.prompts.map((p, i) => (
                      <li key={i}>· {p}</li>
                    ))}
                  </ul>
                )}
                <Textarea
                  value={active.answers[s.id] ?? ""}
                  onChange={(e) => updateSection(s.id, e.target.value)}
                  placeholder="Clinician notes…"
                  className="min-h-[80px]"
                />
              </div>
            ))}
          </div>

          <div className="mt-3">
            <Label htmlFor="iv-notes">Overall clinician notes</Label>
            <Textarea
              id="iv-notes"
              value={active.clinicianNotes}
              onChange={(e) => update({ clinicianNotes: e.target.value })}
              className="min-h-[80px]"
            />
          </div>

          <div className="flex gap-2 mt-3 print:hidden">
            <Button onClick={() => window.print()} variant="secondary" size="sm">
              <Printer size={13} /> Print
            </Button>
            <Button onClick={() => setActiveId(null)} variant="ghost" size="sm">
              Close
            </Button>
          </div>

          {diff && diff.length > 0 && (
            <div
              className="mt-4 rounded-xl border p-3"
              style={{
                borderColor: "var(--psych-border)",
                backgroundColor: "var(--psych-bg)",
              }}
            >
              <h3 className="text-sm font-semibold mb-2" style={{ color: "var(--psych-text)" }}>
                Changes since {compareWith?.date}
              </h3>
              <ul className="space-y-2">
                {diff.map((row) => (
                  <li
                    key={row.sectionId}
                    className="text-sm"
                    style={{ color: "var(--psych-text)" }}
                  >
                    <div
                      className="text-[10px] font-semibold uppercase tracking-wide"
                      style={{ color: "var(--psych-muted)" }}
                    >
                      {row.sectionTitle}
                    </div>
                    <div style={{ color: "var(--psych-muted)" }}>
                      Before: {row.before || "(empty)"}
                    </div>
                    <div>Now: {row.after || "(empty)"}</div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </SectionCard>
      )}

      <SectionCard
        title={`Saved interviews (${saved.length})`}
        className="mt-6"
      >
        {saved.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--psych-muted)" }}>
            No interviews yet. Pick a template above.
          </p>
        ) : (
          <ul className="space-y-2">
            {saved
              .slice()
              .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
              .map((s) => {
                const t = findTemplate(s.templateId);
                const caseCode = cases.find((c) => c.id === s.caseId)?.code;
                return (
                  <li
                    key={s.id}
                    className="flex items-center gap-3 p-3 rounded-xl border"
                    style={{ borderColor: "var(--psych-border)" }}
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium" style={{ color: "var(--psych-text)" }}>
                        {t?.title ?? s.templateId} — {s.date}
                      </p>
                      {caseCode && (
                        <p
                          className="text-xs font-mono"
                          style={{ color: "var(--psych-muted)" }}
                        >
                          {caseCode}
                        </p>
                      )}
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setActiveId(s.id)}>
                      Open
                    </Button>
                    <button
                      onClick={() => destroy(s.id)}
                      className="p-1.5 rounded-lg"
                      style={{ color: "var(--psych-muted)" }}
                      aria-label="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </li>
                );
              })}
          </ul>
        )}
      </SectionCard>
    </div>
  );
}
