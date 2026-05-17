"use client";
// Mental Status Examination — structured form per domain.

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/shared/PageHeader";
import { SectionCard } from "@/components/shared/SectionCard";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useApp } from "@/contexts/AppContext";
import { useToast } from "@/components/ui/Toast";
import { loadFromStorage, saveToStorage } from "@/lib/store";
import {
  MSE_DOMAINS,
  MSE_STORAGE_KEY,
  diffMSE,
  emptyMSE,
  mseAsReportNarrative,
  type MSEEntry,
} from "@/lib/clinical/mse";
import { Plus, Printer, Trash2, FileText } from "lucide-react";

export default function MSEPage() {
  const { cases } = useApp();
  const { toast } = useToast();
  const [entries, setEntries] = useState<MSEEntry[]>([]);
  const [editing, setEditing] = useState<MSEEntry | null>(null);
  const [compareId, setCompareId] = useState<string>("");

  useEffect(() => {
    setEntries(loadFromStorage<MSEEntry[]>(MSE_STORAGE_KEY, []));
  }, []);

  function persist(next: MSEEntry[]) {
    setEntries(next);
    saveToStorage(MSE_STORAGE_KEY, next);
  }

  function startNew() {
    setEditing(emptyMSE());
  }

  function save() {
    if (!editing) return;
    const next = entries.find((e) => e.id === editing.id)
      ? entries.map((e) => (e.id === editing.id ? editing : e))
      : [editing, ...entries];
    persist(next);
    toast("MSE saved", "success");
    setEditing(null);
  }

  function remove(id: string) {
    persist(entries.filter((e) => e.id !== id));
  }

  const narrative = useMemo(
    () => (editing ? mseAsReportNarrative(editing) : ""),
    [editing]
  );

  function update<K extends keyof MSEEntry>(key: K, value: MSEEntry[K]) {
    if (!editing) return;
    setEditing({ ...editing, [key]: value, updatedAt: new Date().toISOString() });
  }

  function toggleChip(domain: keyof MSEEntry, chip: string) {
    if (!editing) return;
    const existing = editing.chips[domain] ?? [];
    const next = existing.includes(chip)
      ? existing.filter((c) => c !== chip)
      : [...existing, chip];
    setEditing({
      ...editing,
      chips: { ...editing.chips, [domain]: next },
      // Append the chip to the textarea for convenience if it isn't there.
      [domain]: existing.includes(chip)
        ? (editing[domain] as string)
        : ((editing[domain] as string) +
            ((editing[domain] as string).length ? "; " : "") +
            chip) as never,
      updatedAt: new Date().toISOString(),
    });
  }

  const compareEntry = entries.find((e) => e.id === compareId) ?? null;
  const diff =
    editing && compareEntry ? diffMSE(compareEntry, editing) : [];

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      <PageHeader
        title="Mental Status Examination"
        subtitle="Structured MSE with descriptor chips and report-narrative builder"
        action={
          <div className="flex gap-2">
            <Button onClick={startNew} size="sm">
              <Plus size={13} /> New MSE
            </Button>
          </div>
        }
      />

      {editing && (
        <div className="space-y-4 mb-6">
          <SectionCard title={`MSE — ${editing.date}`}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
              <div>
                <Label htmlFor="mse-case">Linked case</Label>
                <Select
                  id="mse-case"
                  value={editing.caseId ?? ""}
                  onChange={(e) => update("caseId", e.target.value || undefined)}
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
                <Label htmlFor="mse-date">Date</Label>
                <Input
                  id="mse-date"
                  type="date"
                  value={editing.date}
                  onChange={(e) => update("date", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="mse-compare">Compare with</Label>
                <Select
                  id="mse-compare"
                  value={compareId}
                  onChange={(e) => setCompareId(e.target.value)}
                >
                  <option value="">(none)</option>
                  {entries
                    .filter((e) => e.id !== editing.id)
                    .filter((e) => !editing.caseId || e.caseId === editing.caseId)
                    .map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.date}
                      </option>
                    ))}
                </Select>
              </div>
            </div>

            {MSE_DOMAINS.map((d) => (
              <div
                key={d.id}
                className="border-t pt-3 pb-3"
                style={{ borderColor: "var(--psych-border)" }}
              >
                <Label htmlFor={`mse-${d.id}`}>{d.label}</Label>
                <div className="flex flex-wrap gap-1 mt-1 mb-2">
                  {d.descriptors.map((chip) => {
                    const active = editing.chips[d.id]?.includes(chip);
                    return (
                      <button
                        key={chip}
                        onClick={() => toggleChip(d.id, chip)}
                        className="text-[11px] px-2 py-0.5 rounded-full border transition-all"
                        style={{
                          borderColor: active
                            ? "var(--psych-primary)"
                            : "var(--psych-border)",
                          backgroundColor: active
                            ? "var(--psych-primary-light)"
                            : "transparent",
                          color: active ? "var(--psych-accent)" : "var(--psych-muted)",
                        }}
                      >
                        {chip}
                      </button>
                    );
                  })}
                </div>
                <Textarea
                  id={`mse-${d.id}`}
                  value={editing[d.id] as string}
                  onChange={(e) =>
                    update(d.id as keyof MSEEntry, e.target.value as never)
                  }
                  placeholder={`${d.label} observations…`}
                  className="min-h-[60px]"
                />
              </div>
            ))}

            <div className="mt-3">
              <Label htmlFor="mse-notes">Clinician notes</Label>
              <Textarea
                id="mse-notes"
                value={editing.clinicianNotes}
                onChange={(e) => update("clinicianNotes", e.target.value)}
                className="min-h-[80px]"
              />
            </div>

            <div className="flex gap-2 mt-3">
              <Button onClick={save} size="sm">
                Save MSE
              </Button>
              <Button
                onClick={() => setEditing(null)}
                variant="ghost"
                size="sm"
              >
                Cancel
              </Button>
              <Button
                onClick={() => window.print()}
                variant="secondary"
                size="sm"
              >
                <Printer size={13} /> Print
              </Button>
            </div>
          </SectionCard>

          {/* Report narrative preview */}
          <SectionCard
            title="Report narrative"
            description="Formal phrasing built from the domains above. Insert into a report draft as needed."
          >
            {narrative ? (
              <pre
                className="text-sm whitespace-pre-wrap leading-relaxed font-sans"
                style={{ color: "var(--psych-text)" }}
              >
                {narrative}
              </pre>
            ) : (
              <p className="text-sm" style={{ color: "var(--psych-muted)" }}>
                Fill in domain fields to see the narrative build.
              </p>
            )}
            <div className="flex gap-2 mt-3 print:hidden">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  if (!narrative) return;
                  navigator.clipboard
                    .writeText(narrative)
                    .then(() => toast("Narrative copied", "success"));
                }}
              >
                Copy narrative
              </Button>
              <Link href="/reports/builder">
                <Button variant="ghost" size="sm">
                  <FileText size={13} /> Open Report Builder
                </Button>
              </Link>
            </div>
          </SectionCard>

          {/* Comparison */}
          {compareEntry && diff.length > 0 && (
            <SectionCard
              title="Changes since selected MSE"
              description={`Comparing the current MSE (${editing.date}) with ${compareEntry.date}.`}
            >
              <ul className="space-y-2">
                {diff.map((row) => (
                  <li
                    key={row.domain}
                    className="rounded-lg border p-2 text-sm"
                    style={{ borderColor: "var(--psych-border)" }}
                  >
                    <div
                      className="text-[10px] font-semibold uppercase tracking-wide mb-1"
                      style={{ color: "var(--psych-muted)" }}
                    >
                      {row.domain}
                    </div>
                    <div style={{ color: "var(--psych-muted)" }}>
                      Before: {row.before || "(empty)"}
                    </div>
                    <div style={{ color: "var(--psych-text)" }}>
                      Now: {row.after || "(empty)"}
                    </div>
                  </li>
                ))}
              </ul>
            </SectionCard>
          )}
        </div>
      )}

      <SectionCard
        title={`Recent MSE entries (${entries.length})`}
        description="Saved entries across cases"
      >
        {entries.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--psych-muted)" }}>
            No MSE entries yet. Start a new one above.
          </p>
        ) : (
          <ul className="space-y-2">
            {entries
              .slice()
              .sort((a, b) => b.date.localeCompare(a.date))
              .map((e) => {
                const caseCode = cases.find((c) => c.id === e.caseId)?.code;
                return (
                  <li
                    key={e.id}
                    className="flex items-center gap-3 p-3 rounded-xl border"
                    style={{ borderColor: "var(--psych-border)" }}
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium" style={{ color: "var(--psych-text)" }}>
                        MSE — {e.date}
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
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditing({ ...e })}
                    >
                      Open
                    </Button>
                    <button
                      onClick={() => remove(e.id)}
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
