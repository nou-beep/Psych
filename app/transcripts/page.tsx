"use client";
import { useState, useMemo } from "react";
import {
  ScrollText,
  Plus,
  Search,
  Tag,
  Trash2,
  Edit3,
  Star,
  Archive,
  FileText,
  ChevronLeft,
  MoreHorizontal,
} from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Modal, ModalBody, ModalFooter } from "@/components/ui/Modal";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { useApp } from "@/contexts/AppContext";
import { useToast } from "@/components/ui/Toast";
import { type Transcript } from "@/lib/mock-data";

const ANNOTATION_COLORS = {
  pink: { bg: "#FFE4E6", text: "#9F1239", border: "#FECDD3", label: "Pink" },
  yellow: { bg: "#FEF9C3", text: "#92400E", border: "#FDE68A", label: "Yellow" },
  green: { bg: "#D1FAE5", text: "#065F46", border: "#A7F3D0", label: "Green" },
  blue: { bg: "#DBEAFE", text: "#1E40AF", border: "#BFDBFE", label: "Blue" },
  purple: { bg: "#F3E8FF", text: "#7E22CE", border: "#E9D5FF", label: "Purple" },
};

type AnnotationColor = keyof typeof ANNOTATION_COLORS;

function emptyTranscript(): Partial<Transcript> {
  return { title: "", content: "", tags: [], annotations: [], importantMoments: [] };
}

export default function TranscriptsPage() {
  const { transcripts, cases, createTranscript, updateTranscript, deleteTranscript, archiveTranscript } =
    useApp();
  const { toast } = useToast();

  const [search, setSearch] = useState("");
  const [filterCase, setFilterCase] = useState("all");
  const [viewId, setViewId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Transcript>>(emptyTranscript());
  const [deleteTarget, setDeleteTarget] = useState<Transcript | null>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  // Annotation state
  const [annotationText, setAnnotationText] = useState("");
  const [annotationNote, setAnnotationNote] = useState("");
  const [annotationColor, setAnnotationColor] = useState<AnnotationColor>("yellow");
  const [annotationPanelOpen, setAnnotationPanelOpen] = useState(false);
  const [newMoment, setNewMoment] = useState("");

  const active = useMemo(
    () =>
      transcripts
        .filter((t) => !t.isArchived)
        .filter((t) => {
          const q = search.toLowerCase();
          const matchSearch =
            !q || t.title.toLowerCase().includes(q) || t.tags.some((tag) => tag.toLowerCase().includes(q));
          const matchCase = filterCase === "all" || t.caseId === filterCase;
          return matchSearch && matchCase;
        }),
    [transcripts, search, filterCase]
  );

  const viewingTranscript = viewId ? transcripts.find((t) => t.id === viewId) : null;

  function openCreate() {
    setEditingId(null);
    setForm(emptyTranscript());
    setModalOpen(true);
  }

  function openEdit(t: Transcript) {
    setEditingId(t.id);
    setForm({ ...t });
    setModalOpen(true);
    setMenuOpen(null);
  }

  function handleSave() {
    if (!form.title?.trim()) {
      toast("Please enter a title", "warning");
      return;
    }
    if (editingId) {
      updateTranscript(editingId, form);
      toast("Transcript saved", "success");
      if (viewId === editingId) setViewId(editingId);
    } else {
      const created = createTranscript(form);
      toast("Transcript created ✦", "success");
      setViewId(created.id);
    }
    setModalOpen(false);
  }

  function handleDelete() {
    if (!deleteTarget) return;
    if (viewId === deleteTarget.id) setViewId(null);
    deleteTranscript(deleteTarget.id);
    toast("Transcript deleted", "info");
    setDeleteTarget(null);
  }

  function addAnnotation() {
    if (!annotationText.trim() || !viewingTranscript) return;
    const ann = {
      id: Math.random().toString(36).slice(2),
      selectedText: annotationText.trim(),
      note: annotationNote.trim(),
      color: annotationColor,
    };
    updateTranscript(viewingTranscript.id, {
      annotations: [...viewingTranscript.annotations, ann],
    });
    setAnnotationText("");
    setAnnotationNote("");
    toast("Annotation added", "success");
  }

  function removeAnnotation(annId: string) {
    if (!viewingTranscript) return;
    updateTranscript(viewingTranscript.id, {
      annotations: viewingTranscript.annotations.filter((a) => a.id !== annId),
    });
  }

  function addMoment() {
    if (!newMoment.trim() || !viewingTranscript) return;
    updateTranscript(viewingTranscript.id, {
      importantMoments: [...viewingTranscript.importantMoments, newMoment.trim()],
    });
    setNewMoment("");
    toast("Moment marked", "success");
  }

  function removeMoment(idx: number) {
    if (!viewingTranscript) return;
    const updated = [...viewingTranscript.importantMoments];
    updated.splice(idx, 1);
    updateTranscript(viewingTranscript.id, { importantMoments: updated });
  }

  // ── Viewer ──
  if (viewingTranscript) {
    const linkedCase = cases.find((c) => c.id === viewingTranscript.caseId);
    return (
      <div className="max-w-6xl mx-auto animate-fade-in">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="sm" onClick={() => setViewId(null)}>
            <ChevronLeft size={14} /> Back
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-semibold" style={{ color: "var(--psych-text)" }}>
              {viewingTranscript.title}
            </h1>
            {linkedCase && (
              <p className="text-xs" style={{ color: "var(--psych-muted)" }}>
                {linkedCase.code} · {new Date(viewingTranscript.createdAt).toLocaleDateString()}
              </p>
            )}
          </div>
          <Button variant="outline" size="sm" onClick={() => openEdit(viewingTranscript)}>
            <Edit3 size={13} /> Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setAnnotationPanelOpen((v) => !v)}
            style={{ color: "var(--psych-primary)" }}
          >
            <Tag size={13} /> Annotate
          </Button>
        </div>

        <div className="grid gap-6" style={{ gridTemplateColumns: annotationPanelOpen ? "1fr 320px" : "1fr" }}>
          {/* Transcript content */}
          <div
            className="rounded-3xl border p-8 min-h-[60vh]"
            style={{ backgroundColor: "var(--psych-card)", borderColor: "var(--psych-border)" }}
          >
            {/* Tags */}
            {viewingTranscript.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-6">
                {viewingTranscript.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] px-2.5 py-1 rounded-full border"
                    style={{
                      backgroundColor: "var(--psych-primary-light)",
                      borderColor: "var(--psych-border)",
                      color: "var(--psych-primary)",
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Content */}
            <div
              className="prose rich-text text-sm leading-relaxed"
              style={{ color: "var(--psych-text)", maxWidth: "none" }}
              dangerouslySetInnerHTML={{ __html: viewingTranscript.content || "<p style='color: var(--psych-muted)'>No content yet. Edit to add transcript text.</p>" }}
            />

            {/* Inline annotations preview */}
            {viewingTranscript.annotations.length > 0 && (
              <div
                className="mt-8 pt-6 border-t space-y-3"
                style={{ borderColor: "var(--psych-border)" }}
              >
                <p
                  className="text-[10px] font-semibold uppercase tracking-wide"
                  style={{ color: "var(--psych-muted)" }}
                >
                  Annotations ({viewingTranscript.annotations.length})
                </p>
                {viewingTranscript.annotations.map((ann) => {
                  const col = ANNOTATION_COLORS[ann.color as AnnotationColor];
                  return (
                    <div
                      key={ann.id}
                      className="rounded-xl p-3 border flex gap-3 items-start"
                      style={{ backgroundColor: col.bg, borderColor: col.border }}
                    >
                      <div className="flex-1">
                        <p className="text-xs font-medium italic mb-1" style={{ color: col.text }}>
                          &ldquo;{ann.selectedText}&rdquo;
                        </p>
                        {ann.note && (
                          <p className="text-xs" style={{ color: col.text, opacity: 0.8 }}>
                            → {ann.note}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => removeAnnotation(ann.id)}
                        className="text-xs hover:opacity-50 flex-shrink-0"
                        style={{ color: col.text }}
                      >
                        ×
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Annotation panel */}
          {annotationPanelOpen && (
            <div className="space-y-4 animate-fade-in">
              {/* Add annotation */}
              <div
                className="rounded-3xl border p-4"
                style={{ backgroundColor: "var(--psych-card)", borderColor: "var(--psych-border)" }}
              >
                <p className="text-xs font-semibold mb-3" style={{ color: "var(--psych-text)" }}>
                  Add Annotation
                </p>
                <div className="space-y-2.5">
                  <div>
                    <label className="text-[10px] mb-1 block" style={{ color: "var(--psych-muted)" }}>
                      Selected text / quote
                    </label>
                    <textarea
                      rows={2}
                      value={annotationText}
                      onChange={(e) => setAnnotationText(e.target.value)}
                      placeholder="Paste or type the excerpt…"
                      className="w-full px-3 py-2 rounded-xl text-xs border resize-none outline-none"
                      style={{
                        backgroundColor: "var(--psych-bg)",
                        borderColor: "var(--psych-border)",
                        color: "var(--psych-text)",
                      }}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] mb-1 block" style={{ color: "var(--psych-muted)" }}>
                      Note / interpretation
                    </label>
                    <textarea
                      rows={2}
                      value={annotationNote}
                      onChange={(e) => setAnnotationNote(e.target.value)}
                      placeholder="Your clinical note…"
                      className="w-full px-3 py-2 rounded-xl text-xs border resize-none outline-none"
                      style={{
                        backgroundColor: "var(--psych-bg)",
                        borderColor: "var(--psych-border)",
                        color: "var(--psych-text)",
                      }}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] mb-1.5 block" style={{ color: "var(--psych-muted)" }}>
                      Highlight color
                    </label>
                    <div className="flex gap-1.5">
                      {(Object.keys(ANNOTATION_COLORS) as AnnotationColor[]).map((c) => (
                        <button
                          key={c}
                          onClick={() => setAnnotationColor(c)}
                          className="w-6 h-6 rounded-full border-2 transition-transform hover:scale-110"
                          style={{
                            backgroundColor: ANNOTATION_COLORS[c].bg,
                            borderColor:
                              annotationColor === c
                                ? ANNOTATION_COLORS[c].text
                                : ANNOTATION_COLORS[c].border,
                            transform: annotationColor === c ? "scale(1.2)" : undefined,
                          }}
                          title={ANNOTATION_COLORS[c].label}
                        />
                      ))}
                    </div>
                  </div>
                  <Button size="sm" className="w-full" onClick={addAnnotation}>
                    Add Annotation
                  </Button>
                </div>
              </div>

              {/* Important moments */}
              <div
                className="rounded-3xl border p-4"
                style={{ backgroundColor: "var(--psych-card)", borderColor: "var(--psych-border)" }}
              >
                <p className="text-xs font-semibold mb-3 flex items-center gap-1.5" style={{ color: "var(--psych-text)" }}>
                  <Star size={12} style={{ color: "#F59E0B" }} />
                  Important Moments
                </p>
                <div className="space-y-1.5 mb-3">
                  {viewingTranscript.importantMoments.map((m, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <Star size={10} style={{ color: "#F59E0B", flexShrink: 0, marginTop: 2 }} />
                      <span className="text-xs flex-1" style={{ color: "var(--psych-text)" }}>{m}</span>
                      <button
                        onClick={() => removeMoment(i)}
                        className="text-[10px] hover:opacity-50"
                        style={{ color: "var(--psych-muted)" }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  {viewingTranscript.importantMoments.length === 0 && (
                    <p className="text-xs" style={{ color: "var(--psych-muted)" }}>
                      No moments marked yet
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newMoment}
                    onChange={(e) => setNewMoment(e.target.value)}
                    placeholder="Mark a moment…"
                    onKeyDown={(e) => e.key === "Enter" && addMoment()}
                    className="text-xs"
                  />
                  <Button variant="outline" size="sm" onClick={addMoment}>+</Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── List view ──
  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      <PageHeader
        title="Transcripts"
        subtitle={`${active.length} transcript${active.length !== 1 ? "s" : ""}`}
        action={
          <Button size="sm" onClick={openCreate}>
            <Plus size={14} />
            New Transcript
          </Button>
        }
      />

      {/* Filters */}
      <div
        className="rounded-2xl border p-4 mb-6 flex flex-wrap gap-3 items-center"
        style={{ backgroundColor: "var(--psych-card)", borderColor: "var(--psych-border)" }}
      >
        <div className="relative flex-1 min-w-[180px]">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--psych-muted)" }} />
          <Input
            placeholder="Search transcripts…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={filterCase} onChange={(e) => setFilterCase(e.target.value)} className="w-44">
          <option value="all">All cases</option>
          {cases.filter((c) => !c.isArchived).map((c) => (
            <option key={c.id} value={c.id}>{c.code}</option>
          ))}
        </Select>
      </div>

      {/* Grid */}
      {active.length === 0 ? (
        <div className="text-center py-16">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: "var(--psych-primary-light)" }}
          >
            <ScrollText size={28} style={{ color: "var(--psych-primary)" }} />
          </div>
          <p className="text-sm font-medium mb-1" style={{ color: "var(--psych-text)" }}>No transcripts yet</p>
          <p className="text-xs mb-4" style={{ color: "var(--psych-muted)" }}>
            Upload or paste interview/session transcripts
          </p>
          <Button size="sm" onClick={openCreate}>
            <Plus size={14} /> Create Transcript
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {active.map((tr, idx) => {
            const linkedCase = cases.find((c) => c.id === tr.caseId);
            return (
              <div
                key={tr.id}
                className="rounded-2xl border p-5 cursor-pointer card-hover animate-fade-up relative"
                style={{
                  backgroundColor: "var(--psych-card)",
                  borderColor: "var(--psych-border)",
                  animationDelay: `${idx * 40}ms`,
                }}
                onClick={() => setViewId(tr.id)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center mb-3"
                      style={{ backgroundColor: "var(--psych-primary-light)" }}
                    >
                      <FileText size={14} style={{ color: "var(--psych-primary)" }} />
                    </div>
                    <h3 className="text-sm font-semibold leading-snug mb-1" style={{ color: "var(--psych-text)" }}>
                      {tr.title}
                    </h3>
                    {linkedCase && (
                      <span className="text-[10px] font-mono" style={{ color: "var(--psych-muted)" }}>
                        {linkedCase.code}
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpen(menuOpen === tr.id ? null : tr.id);
                      }}
                      className="p-1.5 rounded-lg transition-all hover:scale-110"
                      style={{ color: "var(--psych-muted)" }}
                    >
                      <MoreHorizontal size={14} />
                    </button>
                    {menuOpen === tr.id && (
                      <div
                        className="absolute right-0 top-8 z-20 rounded-2xl border shadow-xl overflow-hidden"
                        style={{ backgroundColor: "var(--psych-card)", borderColor: "var(--psych-border)", minWidth: 140 }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {[
                          { label: "Edit", icon: <Edit3 size={12} />, action: () => openEdit(tr) },
                          { label: "Archive", icon: <Archive size={12} />, action: () => { archiveTranscript(tr.id); toast("Archived", "info"); setMenuOpen(null); } },
                          { label: "Delete", icon: <Trash2 size={12} />, action: () => { setDeleteTarget(tr); setMenuOpen(null); }, danger: true },
                        ].map((item) => (
                          <button
                            key={item.label}
                            onClick={item.action}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-left hover:opacity-70"
                            style={{ color: item.danger ? "#DC2626" : "var(--psych-text)" }}
                          >
                            {item.icon}
                            {item.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-3 text-[10px]" style={{ color: "var(--psych-muted)" }}>
                  <span>{tr.annotations.length} annotations</span>
                  <span>·</span>
                  <span>{tr.importantMoments.length} moments</span>
                  <span>·</span>
                  <span>{new Date(tr.createdAt).toLocaleDateString()}</span>
                </div>

                {tr.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2.5">
                    {tr.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="text-[9px] px-2 py-0.5 rounded-full border"
                        style={{ borderColor: "var(--psych-border)", color: "var(--psych-muted)" }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? "Edit Transcript" : "New Transcript"}
        size="xl"
      >
        <ModalBody className="space-y-4">
          <div>
            <label className="text-xs font-medium mb-1 block" style={{ color: "var(--psych-muted)" }}>
              Title *
            </label>
            <Input
              value={form.title || ""}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="e.g. Interview 1 — CASE-001"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: "var(--psych-muted)" }}>
                Linked Case
              </label>
              <Select
                value={form.caseId || ""}
                onChange={(e) => setForm((f) => ({ ...f, caseId: e.target.value || undefined }))}
              >
                <option value="">No case</option>
                {cases.filter((c) => !c.isArchived).map((c) => (
                  <option key={c.id} value={c.id}>{c.code}</option>
                ))}
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: "var(--psych-muted)" }}>
                Tags (comma-separated)
              </label>
              <Input
                value={(form.tags || []).join(", ")}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean),
                  }))
                }
                placeholder="interview, research, session…"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block" style={{ color: "var(--psych-muted)" }}>
              Transcript Content
            </label>
            <RichTextEditor
              value={form.content || ""}
              onChange={(html) => setForm((f) => ({ ...f, content: html }))}
              placeholder="Paste or type the transcript here. Use formatting for speakers, questions, etc."
              minHeight={280}
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" size="sm" onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button size="sm" onClick={handleSave}>
            {editingId ? "Save Changes" : "Create Transcript"}
          </Button>
        </ModalFooter>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete transcript?"
        message="This transcript and all annotations will be permanently deleted."
        confirmLabel="Delete"
        confirmVariant="danger"
      />
    </div>
  );
}
