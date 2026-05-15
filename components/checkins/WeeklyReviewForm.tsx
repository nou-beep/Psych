"use client";

// Weekly Review form — end-of-week summary for a case.
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/shared/SectionCard";
import { CheckCircle } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { useToast } from "@/components/ui/Toast";

interface FormData {
  caseId: string;
  weekStart: string;
  weekEnd: string;
  mainProgress: string;
  mainDifficulties: string;
  repeatedPatterns: string;
  effectiveInterventions: string;
  concerns: string;
  goalsNextWeek: string;
  questionsForSupervision: string;
}

const empty: FormData = {
  caseId: "",
  weekStart: "",
  weekEnd: "",
  mainProgress: "",
  mainDifficulties: "",
  repeatedPatterns: "",
  effectiveInterventions: "",
  concerns: "",
  goalsNextWeek: "",
  questionsForSupervision: "",
};

const fields: { id: keyof FormData; label: string; placeholder: string }[] = [
  { id: "mainProgress", label: "Main Progress This Week", placeholder: "What improved or moved forward?…" },
  { id: "mainDifficulties", label: "Main Difficulties", placeholder: "What challenges were observed?…" },
  { id: "repeatedPatterns", label: "Repeated Patterns", placeholder: "Any recurring behaviors, themes, or reactions?…" },
  { id: "effectiveInterventions", label: "Effective Interventions", placeholder: "What worked well this week?…" },
  { id: "concerns", label: "Concerns", placeholder: "Clinical concerns, safety, or flag items…" },
  { id: "goalsNextWeek", label: "Goals for Next Week", placeholder: "Objectives for the coming sessions…" },
  { id: "questionsForSupervision", label: "Questions for Supervision", placeholder: "What do you need guidance on?…" },
];

export function WeeklyReviewForm() {
  const [form, setForm] = useState<FormData>(empty);
  const [submitted, setSubmitted] = useState(false);
  const { createWeekly, cases } = useApp();
  const { toast } = useToast();

  function update(field: keyof FormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    createWeekly(form);
    toast("Weekly review saved", "success");
    setSubmitted(true);
  }

  function reset() {
    setForm(empty);
    setSubmitted(false);
  }

  if (submitted) {
    const relatedCase = cases.find((c) => c.id === form.caseId);
    return (
      <div className="animate-fade-in space-y-4">
        <div className="flex items-center gap-3 px-5 py-4 rounded-2xl border" style={{ backgroundColor: "#F0FDF4", borderColor: "#BBF7D0" }}>
          <CheckCircle size={20} style={{ color: "#15803D" }} />
          <p className="text-sm font-semibold" style={{ color: "#15803D" }}>Weekly review saved (preview mode)</p>
        </div>
        <SectionCard title={`Weekly Review — ${form.weekStart} to ${form.weekEnd}`} description={relatedCase?.code}>
          <dl className="space-y-3 text-sm">
            {fields.filter(f => form[f.id]).map(({ id, label }) => (
              <div key={id}>
                <dt className="text-[10px] font-semibold uppercase tracking-wide mb-0.5" style={{ color: "var(--psych-muted)" }}>{label}</dt>
                <dd style={{ color: "var(--psych-text)" }}>{form[id]}</dd>
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label>Case</Label>
          <Select value={form.caseId} onChange={(e) => update("caseId", e.target.value)} required>
            <option value="">Select a case…</option>
            {cases.map((c) => <option key={c.id} value={c.id}>{c.code} — {c.type}</option>)}
          </Select>
        </div>
        <div>
          <Label>Week Start</Label>
          <Input type="date" value={form.weekStart} onChange={(e) => update("weekStart", e.target.value)} required />
        </div>
        <div>
          <Label>Week End</Label>
          <Input type="date" value={form.weekEnd} onChange={(e) => update("weekEnd", e.target.value)} required />
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
              className="min-h-[90px]"
            />
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <Button type="submit" size="md">Save Weekly Review</Button>
        <Button type="button" variant="ghost" size="md" onClick={reset}>Reset</Button>
      </div>
    </form>
  );
}
