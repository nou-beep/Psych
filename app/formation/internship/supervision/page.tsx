"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { SectionCard } from "@/components/shared/SectionCard";
import { PrintableLayout } from "@/components/reports/PrintableLayout";
import { ReportHeader } from "@/components/reports/ReportHeader";
import { ReportSection } from "@/components/reports/ReportSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Modal, ModalBody, ModalFooter } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { useApp } from "@/contexts/AppContext";
import { useToast } from "@/components/ui/Toast";
import { Printer, Plus, Trash2 } from "lucide-react";

interface NewNoteForm {
  date: string;
  supervisorName: string;
  caseId: string;
  mainTopics: string;
  questionsRaised: string;
  ethicalConcerns: string;
  clinicalReflection: string;
  feedbackReceived: string;
  actionPlan: string;
}

const emptyForm: NewNoteForm = {
  date: new Date().toISOString().split("T")[0],
  supervisorName: "",
  caseId: "",
  mainTopics: "",
  questionsRaised: "",
  ethicalConcerns: "None identified at this time.",
  clinicalReflection: "",
  feedbackReceived: "",
  actionPlan: "",
};

export default function SupervisionPage() {
  const { supervisionNotes, cases, createSupervision, deleteSupervision } = useApp();
  const { toast } = useToast();
  const [showPrintSummary, setShowPrintSummary] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<NewNoteForm>(emptyForm);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const activeNotes = supervisionNotes.filter((n) => !n.isArchived).sort((a, b) => b.date.localeCompare(a.date));

  function update(field: keyof NewNoteForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSave() {
    if (!form.date || !form.supervisorName || !form.mainTopics) {
      toast("Please fill in date, supervisor, and main topics", "error");
      return;
    }
    createSupervision(form);
    toast("Supervision note saved", "success");
    setForm(emptyForm);
    setModalOpen(false);
  }

  if (showPrintSummary) {
    return (
      <PrintableLayout title="Supervision Summary" backHref="/supervision" backLabel="Back to Supervision">
        <ReportHeader
          title="Supervision Summary"
          subtitle="All supervision notes — compiled"
          dateRange={new Date().toLocaleDateString("en-CA")}
        />
        {activeNotes.map((note, i) => (
          <ReportSection key={note.id} title={`${i + 1}. Supervision — ${note.date} · ${note.supervisorName}`}>
            <div className="space-y-2 text-xs">
              <p><strong>Main Topics:</strong> {note.mainTopics}</p>
              <p><strong>Ethical Concerns:</strong> {note.ethicalConcerns}</p>
              <p><strong>Clinical Reflection:</strong> {note.clinicalReflection}</p>
              <p><strong>Feedback:</strong> {note.feedbackReceived}</p>
              <p><strong>Action Plan:</strong> {note.actionPlan}</p>
            </div>
          </ReportSection>
        ))}
        <div className="print-signature mt-8 pt-6 border-t" style={{ borderColor: "var(--psych-border)" }}>
          <div className="border-b w-48 mb-1" style={{ borderColor: "var(--psych-border)" }} />
          <p className="text-xs" style={{ color: "var(--psych-muted)" }}>Student Signature</p>
        </div>
      </PrintableLayout>
    );
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <PageHeader
        title="Supervision"
        subtitle="Notes, reflections, and feedback from clinical supervision"
        action={
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => setShowPrintSummary(true)}>
              <Printer size={14} />
              Print Summary
            </Button>
            <Button size="sm" onClick={() => setModalOpen(true)}>
              <Plus size={14} />
              New Note
            </Button>
          </div>
        }
      />

      <Tabs defaultValue="notes">
        <TabsList className="mb-6">
          <TabsTrigger value="notes">Supervision Notes {activeNotes.length > 0 && `(${activeNotes.length})`}</TabsTrigger>
          <TabsTrigger value="questions">Questions</TabsTrigger>
          <TabsTrigger value="ethics">Ethical Concerns</TabsTrigger>
          <TabsTrigger value="reflections">Reflections</TabsTrigger>
        </TabsList>

        {/* NOTES */}
        <TabsContent value="notes">
          <div className="space-y-4">
            {activeNotes.length > 0 ? activeNotes.map((note) => {
              const relatedCase = cases.find((c) => c.id === note.caseId);
              return (
                <SectionCard
                  key={note.id}
                  title={`${note.date} — ${note.supervisorName}`}
                  description={relatedCase ? `Case: ${relatedCase.code}` : "General supervision"}
                  action={
                    <button
                      onClick={() => setDeleteId(note.id)}
                      className="p-1.5 rounded-lg transition-colors"
                      style={{ color: "var(--psych-muted)" }}
                    >
                      <Trash2 size={13} />
                    </button>
                  }
                >
                  <div className="space-y-3 text-sm">
                    {[
                      ["Main Topics", note.mainTopics],
                      ["Feedback Received", note.feedbackReceived],
                      ["Action Plan", note.actionPlan],
                    ].map(([label, val]) => val ? (
                      <div key={label}>
                        <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "var(--psych-muted)" }}>{label}</p>
                        <p className="leading-relaxed" style={{ color: "var(--psych-text)" }}>{val}</p>
                      </div>
                    ) : null)}
                  </div>
                </SectionCard>
              );
            }) : (
              <SectionCard title="No supervision notes yet">
                <div className="py-6 text-center">
                  <p className="text-sm mb-3" style={{ color: "var(--psych-muted)" }}>
                    Add your first supervision note to start tracking your clinical development.
                  </p>
                  <Button size="sm" onClick={() => setModalOpen(true)}>
                    <Plus size={14} />
                    New Supervision Note
                  </Button>
                </div>
              </SectionCard>
            )}
          </div>
        </TabsContent>

        {/* QUESTIONS */}
        <TabsContent value="questions">
          <div className="space-y-4">
            {activeNotes.filter((n) => n.questionsRaised).map((note) => (
              <SectionCard key={note.id} title={`Questions — ${note.date}`} description={note.supervisorName}>
                <p className="text-sm leading-relaxed" style={{ color: "var(--psych-text)" }}>
                  {note.questionsRaised}
                </p>
              </SectionCard>
            ))}
            {activeNotes.filter((n) => n.questionsRaised).length === 0 && (
              <p className="text-sm py-4 text-center" style={{ color: "var(--psych-muted)" }}>
                No questions recorded yet.
              </p>
            )}
          </div>
        </TabsContent>

        {/* ETHICAL CONCERNS */}
        <TabsContent value="ethics">
          <div className="space-y-4">
            {activeNotes.map((note) => (
              <SectionCard
                key={note.id}
                title={`Ethical Notes — ${note.date}`}
                description={note.supervisorName}
              >
                <p
                  className="text-sm leading-relaxed"
                  style={{
                    color: note.ethicalConcerns === "None identified at this time."
                      ? "var(--psych-muted)"
                      : "var(--psych-text)",
                  }}
                >
                  {note.ethicalConcerns || "None identified at this time."}
                </p>
              </SectionCard>
            ))}

            <SectionCard title="Ethical Practice Reminders" description="General guidance">
              <ul className="space-y-2 text-sm" style={{ color: "var(--psych-muted)" }}>
                {[
                  "Maintain strict confidentiality — use case codes, not names",
                  "Do not attempt interventions outside your training and competency level",
                  "Always bring complex cases to supervision before proceeding",
                  "Document all referral decisions and their rationale",
                  "If safety concerns arise, follow your institution's protocol immediately",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span style={{ color: "var(--psych-primary)" }}>✦</span>
                    {item}
                  </li>
                ))}
              </ul>
            </SectionCard>
          </div>
        </TabsContent>

        {/* REFLECTIONS */}
        <TabsContent value="reflections">
          <div className="space-y-4">
            {activeNotes.filter((n) => n.clinicalReflection).map((note) => (
              <SectionCard key={note.id} title={`Reflection — ${note.date}`}>
                <p className="text-sm leading-relaxed" style={{ color: "var(--psych-text)" }}>
                  {note.clinicalReflection}
                </p>
              </SectionCard>
            ))}

            <SectionCard title="Reflective Practice" description="Why it matters">
              <p className="text-sm leading-relaxed" style={{ color: "var(--psych-muted)" }}>
                Regular reflection on your clinical work helps identify countertransference,
                biases, and areas for professional growth. Document your reflections honestly —
                this is for your development, not evaluation.
              </p>
            </SectionCard>
          </div>
        </TabsContent>
      </Tabs>

      {/* New Note Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New Supervision Note">
        <ModalBody>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="sup-date">Date</Label>
                <Input id="sup-date" type="date" value={form.date} onChange={(e) => update("date", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="sup-case">Case (optional)</Label>
                <Select id="sup-case" value={form.caseId} onChange={(e) => update("caseId", e.target.value)}>
                  <option value="">General supervision</option>
                  {cases.filter((c) => !c.isArchived).map((c) => (
                    <option key={c.id} value={c.id}>{c.code} — {c.type}</option>
                  ))}
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="sup-supervisor">Supervisor Name</Label>
              <Input
                id="sup-supervisor"
                placeholder="e.g. Dr. A. Bensalem"
                value={form.supervisorName}
                onChange={(e) => update("supervisorName", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="sup-topics">Main Topics Discussed</Label>
              <Textarea
                id="sup-topics"
                placeholder="What were the main clinical topics covered?"
                value={form.mainTopics}
                onChange={(e) => update("mainTopics", e.target.value)}
                className="min-h-[80px]"
              />
            </div>
            <div>
              <Label htmlFor="sup-questions">Questions Raised</Label>
              <Textarea
                id="sup-questions"
                placeholder="What questions did you bring to supervision?"
                value={form.questionsRaised}
                onChange={(e) => update("questionsRaised", e.target.value)}
                className="min-h-[60px]"
              />
            </div>
            <div>
              <Label htmlFor="sup-ethics">Ethical Concerns</Label>
              <Textarea
                id="sup-ethics"
                value={form.ethicalConcerns}
                onChange={(e) => update("ethicalConcerns", e.target.value)}
                className="min-h-[60px]"
              />
            </div>
            <div>
              <Label htmlFor="sup-reflection">Clinical Reflection</Label>
              <Textarea
                id="sup-reflection"
                placeholder="What did you reflect on after this session?"
                value={form.clinicalReflection}
                onChange={(e) => update("clinicalReflection", e.target.value)}
                className="min-h-[70px]"
              />
            </div>
            <div>
              <Label htmlFor="sup-feedback">Feedback Received</Label>
              <Textarea
                id="sup-feedback"
                placeholder="What feedback did your supervisor give?"
                value={form.feedbackReceived}
                onChange={(e) => update("feedbackReceived", e.target.value)}
                className="min-h-[60px]"
              />
            </div>
            <div>
              <Label htmlFor="sup-action">Action Plan</Label>
              <Textarea
                id="sup-action"
                placeholder="What will you do differently or work on next?"
                value={form.actionPlan}
                onChange={(e) => update("actionPlan", e.target.value)}
                className="min-h-[60px]"
              />
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button onClick={handleSave}>Save Note</Button>
        </ModalFooter>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        title="Delete Supervision Note"
        description="This supervision note will be permanently deleted."
        confirmLabel="Delete"
        onConfirm={() => {
          if (deleteId) {
            deleteSupervision(deleteId);
            toast("Supervision note deleted", "success");
          }
          setDeleteId(null);
        }}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
