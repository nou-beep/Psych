"use client";

// Daily Check-in form — all fields for a single session observation.
// Submitting shows a preview card. No backend needed yet.

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
  date: string;
  caseId: string;
  contextType: string;
  moodAffect: string;
  behaviorObservations: string;
  communicationObservations: string;
  cognitiveObservations: string;
  emotionalRegulation: string;
  socialInteraction: string;
  sensoryObservations: string;
  interventionUsed: string;
  responseToIntervention: string;
  freeNotes: string;
  followUpNeeded: boolean;
  followUpNote: string;
}

const empty: FormData = {
  date: new Date().toISOString().split("T")[0],
  caseId: "",
  contextType: "",
  moodAffect: "",
  behaviorObservations: "",
  communicationObservations: "",
  cognitiveObservations: "",
  emotionalRegulation: "",
  socialInteraction: "",
  sensoryObservations: "",
  interventionUsed: "",
  responseToIntervention: "",
  freeNotes: "",
  followUpNeeded: false,
  followUpNote: "",
};

export function DailyCheckInForm() {
  const [form, setForm] = useState<FormData>(empty);
  const [submitted, setSubmitted] = useState(false);
  const { createCheckIn, cases } = useApp();
  const { toast } = useToast();

  function update(field: keyof FormData, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    createCheckIn(form);
    toast("Check-in saved", "success");
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
        <div
          className="flex items-center gap-3 px-5 py-4 rounded-2xl border"
          style={{ backgroundColor: "#F0FDF4", borderColor: "#BBF7D0" }}
        >
          <CheckCircle size={20} style={{ color: "#15803D" }} />
          <div>
            <p className="text-sm font-semibold" style={{ color: "#15803D" }}>
              Check-in saved (preview mode)
            </p>
            <p className="text-xs" style={{ color: "#166534" }}>
              This would be saved to the database once Supabase is connected.
            </p>
          </div>
        </div>

        <SectionCard title={`Daily Check-in Preview — ${form.date}`} description={relatedCase?.code ?? "No case selected"}>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {[
              ["Context Type", form.contextType],
              ["Mood / Affect", form.moodAffect],
              ["Behavior", form.behaviorObservations],
              ["Communication", form.communicationObservations],
              ["Cognitive", form.cognitiveObservations],
              ["Emotional Regulation", form.emotionalRegulation],
              ["Social Interaction", form.socialInteraction],
              ["Sensory Observations", form.sensoryObservations],
              ["Intervention Used", form.interventionUsed],
              ["Response to Intervention", form.responseToIntervention],
            ].filter(([, v]) => v).map(([label, value]) => (
              <div key={label}>
                <dt className="text-[10px] font-semibold uppercase tracking-wide mb-0.5" style={{ color: "var(--psych-muted)" }}>{label}</dt>
                <dd style={{ color: "var(--psych-text)" }}>{value}</dd>
              </div>
            ))}
            {form.freeNotes && (
              <div className="md:col-span-2">
                <dt className="text-[10px] font-semibold uppercase tracking-wide mb-0.5" style={{ color: "var(--psych-muted)" }}>Free Notes</dt>
                <dd style={{ color: "var(--psych-text)" }}>{form.freeNotes}</dd>
              </div>
            )}
            {form.followUpNeeded && (
              <div className="md:col-span-2 px-3 py-2 rounded-lg text-xs" style={{ backgroundColor: "#FEF9C3", color: "#92400E" }}>
                ⚠ Follow-up: {form.followUpNote}
              </div>
            )}
          </dl>
        </SectionCard>

        <Button variant="secondary" onClick={reset}>Start a new check-in</Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Date */}
        <div>
          <Label htmlFor="date">Date</Label>
          <Input id="date" type="date" value={form.date} onChange={(e) => update("date", e.target.value)} required />
        </div>

        {/* Case */}
        <div>
          <Label htmlFor="case">Case</Label>
          <Select id="case" value={form.caseId} onChange={(e) => update("caseId", e.target.value)} required>
            <option value="">Select a case…</option>
            {cases.filter((c) => !c.isArchived).map((c) => (
              <option key={c.id} value={c.id}>{c.code} — {c.type}</option>
            ))}
          </Select>
        </div>

        {/* Context type */}
        <div className="md:col-span-2">
          <Label htmlFor="context">Context / Session Type</Label>
          <Input
            id="context"
            placeholder="e.g. Individual session, group session, observation only…"
            value={form.contextType}
            onChange={(e) => update("contextType", e.target.value)}
          />
        </div>
      </div>

      {/* Observation fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { id: "mood", label: "Mood / Affect", field: "moodAffect", ph: "Describe observed emotional state and affect…" },
          { id: "behavior", label: "Behavior Observations", field: "behaviorObservations", ph: "Describe notable behaviors observed…" },
          { id: "communication", label: "Communication Observations", field: "communicationObservations", ph: "Verbal, non-verbal, AAC, spontaneous…" },
          { id: "cognitive", label: "Cognitive Observations", field: "cognitiveObservations", ph: "Attention, memory, flexibility, problem-solving…" },
          { id: "emotional", label: "Emotional Regulation", field: "emotionalRegulation", ph: "Regulation capacity, strategies used…" },
          { id: "social", label: "Social Interaction", field: "socialInteraction", ph: "Peer interaction, reciprocity, connection…" },
          { id: "sensory", label: "Sensory Observations", field: "sensoryObservations", ph: "Sensory responses, preferences, triggers…" },
          { id: "intervention", label: "Intervention Used", field: "interventionUsed", ph: "Techniques, tools, approaches used…" },
          { id: "response", label: "Response to Intervention", field: "responseToIntervention", ph: "How did the client respond?…" },
        ].map(({ id, label, field, ph }) => (
          <div key={id}>
            <Label htmlFor={id}>{label}</Label>
            <Textarea
              id={id}
              placeholder={ph}
              value={form[field as keyof FormData] as string}
              onChange={(e) => update(field as keyof FormData, e.target.value)}
              className="min-h-[80px]"
            />
          </div>
        ))}

        <div className="md:col-span-2">
          <Label htmlFor="notes">Free Notes</Label>
          <Textarea
            id="notes"
            placeholder="Any additional observations, reflections, or notes…"
            value={form.freeNotes}
            onChange={(e) => update("freeNotes", e.target.value)}
            className="min-h-[100px]"
          />
        </div>
      </div>

      {/* Follow-up */}
      <div
        className="rounded-xl border p-4"
        style={{ borderColor: "var(--psych-border)", backgroundColor: "var(--psych-bg)" }}
      >
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.followUpNeeded}
            onChange={(e) => update("followUpNeeded", e.target.checked)}
            className="rounded"
          />
          <span className="text-sm font-medium" style={{ color: "var(--psych-text)" }}>
            Follow-up needed
          </span>
        </label>
        {form.followUpNeeded && (
          <div className="mt-3">
            <Textarea
              placeholder="Describe what follow-up is needed…"
              value={form.followUpNote}
              onChange={(e) => update("followUpNote", e.target.value)}
              className="min-h-[60px]"
            />
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <Button type="submit" size="md">Save Check-in</Button>
        <Button type="button" variant="ghost" size="md" onClick={reset}>Reset</Button>
      </div>
    </form>
  );
}
