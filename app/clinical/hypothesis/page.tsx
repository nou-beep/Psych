"use client";
// Clinical Hypothesis Workspace — structured reasoning.

import { useEffect, useState } from "react";
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
  HYPOTHESIS_DISCLAIMER,
  HYPOTHESIS_STATUS_LABELS,
  HYPOTHESIS_STORAGE_KEY,
  addEvidence,
  emptyHypothesis,
  evidenceBalance,
  removeEvidence,
  setStatus,
  type ClinicalHypothesis,
  type HypothesisStatus,
} from "@/lib/clinical/hypothesis";
import { Plus, Trash2, X } from "lucide-react";

export default function HypothesisPage() {
  const { cases } = useApp();
  const { toast } = useToast();
  const [items, setItems] = useState<ClinicalHypothesis[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [forText, setForText] = useState("");
  const [againstText, setAgainstText] = useState("");
  const [forSource, setForSource] = useState("");
  const [againstSource, setAgainstSource] = useState("");
  const [filterCase, setFilterCase] = useState("");

  useEffect(() => {
    setItems(loadFromStorage<ClinicalHypothesis[]>(HYPOTHESIS_STORAGE_KEY, []));
  }, []);

  function persist(next: ClinicalHypothesis[]) {
    setItems(next);
    saveToStorage(HYPOTHESIS_STORAGE_KEY, next);
  }

  function createNew() {
    const c = cases.find((x) => !x.isArchived);
    if (!c) {
      toast("Create a case first", "warning");
      return;
    }
    const h = emptyHypothesis(filterCase || c.id);
    persist([h, ...items]);
    setActiveId(h.id);
  }

  function update(h: ClinicalHypothesis, patch: Partial<ClinicalHypothesis>) {
    const next = items.map((x) =>
      x.id === h.id ? { ...x, ...patch, updatedAt: new Date().toISOString() } : x
    );
    persist(next);
  }

  function destroy(id: string) {
    persist(items.filter((h) => h.id !== id));
    if (activeId === id) setActiveId(null);
  }

  function addFor(h: ClinicalHypothesis) {
    if (!forText.trim()) return;
    persist(
      items.map((x) =>
        x.id === h.id ? addEvidence(x, "evidenceFor", forText, forSource) : x
      )
    );
    setForText("");
    setForSource("");
  }

  function addAgainst(h: ClinicalHypothesis) {
    if (!againstText.trim()) return;
    persist(
      items.map((x) =>
        x.id === h.id
          ? addEvidence(x, "evidenceAgainst", againstText, againstSource)
          : x
      )
    );
    setAgainstText("");
    setAgainstSource("");
  }

  function dropEvidence(
    h: ClinicalHypothesis,
    bucket: "evidenceFor" | "evidenceAgainst",
    eid: string
  ) {
    persist(
      items.map((x) => (x.id === h.id ? removeEvidence(x, bucket, eid) : x))
    );
  }

  function changeStatus(h: ClinicalHypothesis, status: HypothesisStatus) {
    persist(items.map((x) => (x.id === h.id ? setStatus(x, status) : x)));
  }

  function updateList(
    h: ClinicalHypothesis,
    key: "missingInformation" | "differentials" | "followUpQuestions",
    text: string
  ) {
    const lines = text
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    update(h, { [key]: lines } as Partial<ClinicalHypothesis>);
  }

  const visible = filterCase ? items.filter((h) => h.caseId === filterCase) : items;
  const active = items.find((h) => h.id === activeId) ?? null;

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      <PageHeader
        title="Hypothesis workspace"
        subtitle="Structured clinical reasoning · evidence balance · supervision tracking"
        action={
          <div className="flex gap-2">
            <Button onClick={createNew} size="sm">
              <Plus size={13} /> New hypothesis
            </Button>
          </div>
        }
      />

      <div
        className="rounded-xl border p-3 mb-4 text-xs"
        style={{
          borderColor: "var(--psych-border)",
          backgroundColor: "var(--psych-primary-light)",
          color: "var(--psych-accent)",
        }}
      >
        ✦ {HYPOTHESIS_DISCLAIMER}
      </div>

      <SectionCard title="Hypotheses">
        <div className="flex items-center gap-3 mb-3">
          <Label className="text-xs">Filter by case</Label>
          <Select
            value={filterCase}
            onChange={(e) => setFilterCase(e.target.value)}
            className="w-64"
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

        {visible.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--psych-muted)" }}>
            No hypotheses yet.
          </p>
        ) : (
          <ul className="space-y-2">
            {visible.map((h) => {
              const caseCode = cases.find((c) => c.id === h.caseId)?.code ?? "—";
              const balance = evidenceBalance(h);
              return (
                <li
                  key={h.id}
                  className="rounded-xl border p-3"
                  style={{ borderColor: "var(--psych-border)" }}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span
                          className="text-xs font-mono"
                          style={{ color: "var(--psych-muted)" }}
                        >
                          {caseCode}
                        </span>
                        <span
                          className="text-[10px] px-1.5 py-0.5 rounded-full"
                          style={{
                            backgroundColor: "var(--psych-primary-light)",
                            color: "var(--psych-accent)",
                          }}
                        >
                          {HYPOTHESIS_STATUS_LABELS[h.status]}
                        </span>
                        <span className="text-[10px]" style={{ color: "var(--psych-muted)" }}>
                          balance {balance >= 0 ? "+" : ""}{balance} ·
                          confidence {h.confidence}/5
                        </span>
                      </div>
                      <Input
                        value={h.title}
                        onChange={(e) => update(h, { title: e.target.value })}
                        placeholder="Hypothesis title (e.g. 'GAD with avoidance maintenance cycle')"
                        className="mb-2"
                      />
                      <Textarea
                        value={h.rationale}
                        onChange={(e) => update(h, { rationale: e.target.value })}
                        placeholder="Rationale — why is this on the table?"
                        className="min-h-[60px]"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setActiveId(activeId === h.id ? null : h.id)}
                      >
                        {activeId === h.id ? "Close" : "Expand"}
                      </Button>
                      <button
                        onClick={() => destroy(h.id)}
                        className="p-1.5 rounded-lg"
                        style={{ color: "var(--psych-muted)" }}
                        aria-label="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {active && active.id === h.id && (
                    <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                      {/* Status / confidence */}
                      <div>
                        <Label>Status</Label>
                        <Select
                          value={h.status}
                          onChange={(e) =>
                            changeStatus(h, e.target.value as HypothesisStatus)
                          }
                        >
                          {(Object.keys(HYPOTHESIS_STATUS_LABELS) as HypothesisStatus[]).map(
                            (s) => (
                              <option key={s} value={s}>
                                {HYPOTHESIS_STATUS_LABELS[s]}
                              </option>
                            )
                          )}
                        </Select>
                      </div>
                      <div>
                        <Label>Confidence (1–5)</Label>
                        <Input
                          type="number"
                          min={1}
                          max={5}
                          value={h.confidence}
                          onChange={(e) =>
                            update(h, {
                              confidence: Math.min(
                                5,
                                Math.max(1, Number(e.target.value) || 1)
                              ) as ClinicalHypothesis["confidence"],
                            })
                          }
                        />
                      </div>

                      {/* Evidence for */}
                      <div className="md:col-span-2 rounded-lg border p-3" style={{ borderColor: "var(--psych-border)" }}>
                        <Label>Evidence FOR</Label>
                        <ul className="space-y-1 mt-1 mb-2">
                          {h.evidenceFor.map((e) => (
                            <li
                              key={e.id}
                              className="flex items-start gap-2 text-sm"
                              style={{ color: "var(--psych-text)" }}
                            >
                              <span style={{ color: "#10B981" }}>+</span>
                              <span className="flex-1">
                                {e.text}
                                {e.source && (
                                  <span
                                    className="ml-2 text-[10px]"
                                    style={{ color: "var(--psych-muted)" }}
                                  >
                                    ({e.source})
                                  </span>
                                )}
                              </span>
                              <button
                                onClick={() => dropEvidence(h, "evidenceFor", e.id)}
                                className="opacity-60 hover:opacity-100"
                                aria-label="Remove"
                              >
                                <X size={12} />
                              </button>
                            </li>
                          ))}
                        </ul>
                        <div className="flex gap-2">
                          <Input
                            value={forText}
                            onChange={(e) => setForText(e.target.value)}
                            placeholder="New supporting evidence…"
                          />
                          <Input
                            value={forSource}
                            onChange={(e) => setForSource(e.target.value)}
                            placeholder="source (optional)"
                            className="w-44"
                          />
                          <Button size="sm" onClick={() => addFor(h)}>
                            Add
                          </Button>
                        </div>
                      </div>

                      {/* Evidence against */}
                      <div className="md:col-span-2 rounded-lg border p-3" style={{ borderColor: "var(--psych-border)" }}>
                        <Label>Evidence AGAINST</Label>
                        <ul className="space-y-1 mt-1 mb-2">
                          {h.evidenceAgainst.map((e) => (
                            <li
                              key={e.id}
                              className="flex items-start gap-2 text-sm"
                              style={{ color: "var(--psych-text)" }}
                            >
                              <span style={{ color: "#DC2626" }}>−</span>
                              <span className="flex-1">
                                {e.text}
                                {e.source && (
                                  <span
                                    className="ml-2 text-[10px]"
                                    style={{ color: "var(--psych-muted)" }}
                                  >
                                    ({e.source})
                                  </span>
                                )}
                              </span>
                              <button
                                onClick={() =>
                                  dropEvidence(h, "evidenceAgainst", e.id)
                                }
                                className="opacity-60 hover:opacity-100"
                                aria-label="Remove"
                              >
                                <X size={12} />
                              </button>
                            </li>
                          ))}
                        </ul>
                        <div className="flex gap-2">
                          <Input
                            value={againstText}
                            onChange={(e) => setAgainstText(e.target.value)}
                            placeholder="New contradicting evidence…"
                          />
                          <Input
                            value={againstSource}
                            onChange={(e) => setAgainstSource(e.target.value)}
                            placeholder="source (optional)"
                            className="w-44"
                          />
                          <Button size="sm" onClick={() => addAgainst(h)}>
                            Add
                          </Button>
                        </div>
                      </div>

                      <div>
                        <Label>Missing information</Label>
                        <Textarea
                          value={h.missingInformation.join("\n")}
                          onChange={(e) =>
                            updateList(h, "missingInformation", e.target.value)
                          }
                          placeholder="One item per line…"
                          className="min-h-[60px]"
                        />
                      </div>
                      <div>
                        <Label>Differential considerations</Label>
                        <Textarea
                          value={h.differentials.join("\n")}
                          onChange={(e) =>
                            updateList(h, "differentials", e.target.value)
                          }
                          placeholder="One per line…"
                          className="min-h-[60px]"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label>Follow-up questions</Label>
                        <Textarea
                          value={h.followUpQuestions.join("\n")}
                          onChange={(e) =>
                            updateList(h, "followUpQuestions", e.target.value)
                          }
                          placeholder="One per line…"
                          className="min-h-[60px]"
                        />
                      </div>
                      <div>
                        <Label>Supervision comments</Label>
                        <Textarea
                          value={h.supervisionComments}
                          onChange={(e) =>
                            update(h, { supervisionComments: e.target.value })
                          }
                          className="min-h-[60px]"
                        />
                      </div>
                      <div>
                        <Label>Rule-out notes</Label>
                        <Textarea
                          value={h.ruleOutNotes}
                          onChange={(e) => update(h, { ruleOutNotes: e.target.value })}
                          className="min-h-[60px]"
                        />
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </SectionCard>
    </div>
  );
}
