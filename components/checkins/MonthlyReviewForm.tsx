"use client";

// Monthly Review form — monthly clinical summary for a case.
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/shared/SectionCard";
import { mockCases } from "@/lib/mock-data";
import { CheckCircle } from "lucide-react";

interface FormData {
  caseId: string;
  month: string;
  overallEvolution: string;
  assessmentChanges: string;
  clinicalObservations: string;
  supervisionPoints: string;
  recommendations: string;
  nextMonthObjectives: string;
}

const empty: FormData = {
  caseId: "",
  month: "",
  overallEvolution: "",
  assessmentChanges: "",
  clinicalObservations: "",
  supervisionPoints: "",
  recommendations: "",
  nextMonthObjectives: "",
};

const fields: { id: keyof FormData; label: string; placeholder: string }[] = [
  { id: "overallEvolution", label: "Overall Evolution", placeholder: "General progress and trajectory over the month…" },
  { id: "assessmentChanges", label: "Assessment / Score Changes", placeholder: "Changes in assessment results or scores…" },
  { id: "clinicalObservations", label: "Clinical Observations", placeholder: "Key behavioral, emotional, and cognitive observations…" },
  { id: "supervisionPoints", label: "Supervision Points", placeholder: "What was discussed or raised in supervision?…" },
  { id: "recommendations", label: "Recommendations", placeholder: "Clinical recommendations for next period…" },
  { id: "nextMonthObjectives", label: "Next Month Objectives", placeholder: "Specific goals and targets for the coming month…" },
];

export function MonthlyReviewForm() {
  const [form, setForm] = useState<FormData>(empty);
  const [submitted, setSubmitted] = useState(false);

  function update(field: keyof FormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  function reset() {
    setForm(empty);
    setSubmitted(false);
  }

  if (submitted) {
    const relatedCase = mockCases.find((c) => c.id === form.caseId);
    return (
      <div className="animate-fade-in space-y-4">
        <div className="flex items-center gap-3 px-5 py-4 rounded-2xl border" style={{ backgroundColor: "#F0FDF4", borderColor: "#BBF7D0" }}>
          <CheckCircle size={20} style={{ color: "#15803D" }} />
          <p className="text-sm font-semibold" style={{ color: "#15803D" }}>Monthly review saved (preview mode)</p>
        </div>
        <SectionCard title={`Monthly Review — ${form.month}`} description={relatedCase?.code}>
          <dl className="space-y-3 text-sm">
            {fields.filter(f => form[f.id]).map(({ id, label }) => (
              <div key={id}>
                <dt className="text-[10px] font-semibold uppercase tracking-wide mb-0.5" style={{ color: "var(--psych-muted)" }}>{label}</dt>
                <dd className="leading-relaxed" style={{ color: "var(--psych-text)" }}>{form[id]}</dd>
              </div>
            ))}
          </dl>
        </SectionCard>
        <Button variant="secondary" onClick={reset}>Start a new review</Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Case</Label>
          <Select value={form.caseId} onChange={(e) => update("caseId", e.target.value)} required>
            <option value="">Select a case…</option>
            {mockCases.map((c) => <option key={c.id} value={c.id}>{c.code} — {c.type}</option>)}
          </Select>
        </div>
        <div>
          <Label>Month</Label>
          <Input
            type="month"
            value={form.month}
            onChange={(e) => update("month", e.target.value)}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fields.map(({ id, label, placeholder }) => (
          <div key={id}>
            <Label>{label}</Label>
            <Textarea
              placeholder={placeholder}
              value={form[id] as string}
              onChange={(e) => update(id, e.target.value)}
              className="min-h-[100px]"
            />
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <Button type="submit">Save Monthly Review</Button>
        <Button type="button" variant="ghost" onClick={reset}>Reset</Button>
      </div>
    </form>
  );
}
