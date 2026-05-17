"use client";
import { useState, useEffect } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { useClinical } from "@/contexts/ClinicalContext";
import { useApp } from "@/contexts/AppContext";
import { useToast } from "@/components/ui/Toast";
import { FORMULATION_MODELS, type FormulationCanvas, type FormulationModel } from "@/lib/clinical-data";
import {
  Network, Plus, Trash2, Printer, Edit3, ChevronDown, ChevronUp, Camera,
} from "lucide-react";
import { loadFromStorage, saveToStorage } from "@/lib/store";
import {
  FORMULATION_SNAPSHOTS_STORAGE_KEY,
  createSnapshot,
  snapshotsForCanvas,
  type FormulationSnapshot,
} from "@/lib/formulation-snapshots";

const MODEL_KEYS = Object.keys(FORMULATION_MODELS) as FormulationModel[];

export default function FormulationPage() {
  const { formulations, addFormulation, updateFormulation, deleteFormulation } = useClinical();
  const { cases } = useApp();
  const { toast } = useToast();

  const [showNew, setShowNew] = useState(false);
  const [newCaseId, setNewCaseId] = useState("");
  const [newModel, setNewModel] = useState<FormulationModel>("5ps");
  const [newTitle, setNewTitle] = useState("New Formulation");
  const [editId, setEditId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [snapshots, setSnapshots] = useState<FormulationSnapshot[]>([]);

  useEffect(() => {
    setSnapshots(
      loadFromStorage<FormulationSnapshot[]>(
        FORMULATION_SNAPSHOTS_STORAGE_KEY,
        []
      )
    );
  }, []);

  function takeSnapshot(f: FormulationCanvas) {
    const snap = createSnapshot(f);
    const next = [snap, ...snapshots];
    setSnapshots(next);
    saveToStorage(FORMULATION_SNAPSHOTS_STORAGE_KEY, next);
    toast("Snapshot saved ✦", "success");
  }

  const activeCases = cases.filter((c) => !c.isArchived);

  function handleCreate() {
    const f = addFormulation({
      caseId: newCaseId, model: newModel, title: newTitle, sections: {},
    });
    setEditId(f.id);
    setExpandedId(f.id);
    setShowNew(false);
    setNewCaseId("");
    setNewTitle("New Formulation");
    toast("Formulation created", "success");
  }

  function updateSection(id: string, section: string, text: string) {
    const f = formulations.find((x) => x.id === id);
    if (!f) return;
    updateFormulation(id, { sections: { ...f.sections, [section]: text } });
  }

  function handleDelete(id: string) {
    deleteFormulation(id);
    if (editId === id) setEditId(null);
    if (expandedId === id) setExpandedId(null);
    toast("Formulation deleted", "success");
  }

  const modelColors: Record<FormulationModel, string> = {
    "5ps": "var(--psych-primary)",
    cbt: "#8b5cf6",
    biopsychosocial: "#06b6d4",
    custom: "#f59e0b",
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <PageHeader
        title="Clinical Formulation Canvas"
        subtitle={`${formulations.length} formulation${formulations.length !== 1 ? "s" : ""} · 5Ps, CBT, biopsychosocial & custom`}
        actions={
          <div className="flex gap-2">
            <button onClick={() => window.print()} className="no-print flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-xl border"
              style={{ borderColor: "var(--psych-border)", color: "var(--psych-muted)" }}>
              <Printer size={14} /> Print
            </button>
            <button onClick={() => setShowNew(true)}
              className="flex items-center gap-1.5 text-sm px-4 py-1.5 rounded-xl text-white font-medium"
              style={{ background: "linear-gradient(135deg, var(--psych-primary), var(--psych-accent))" }}>
              <Plus size={14} /> New Formulation
            </button>
          </div>
        }
      />

      {/* New formulation dialog */}
      {showNew && (
        <div className="rounded-2xl border p-5 space-y-4" style={{ backgroundColor: "var(--psych-card)", borderColor: "var(--psych-border)" }}>
          <h3 className="font-semibold" style={{ color: "var(--psych-text)" }}>New Formulation</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "var(--psych-muted)" }}>Title</label>
              <input className="w-full rounded-xl px-3 py-2 text-sm border"
                style={{ backgroundColor: "var(--psych-bg)", borderColor: "var(--psych-border)", color: "var(--psych-text)" }}
                value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "var(--psych-muted)" }}>Case</label>
              <select className="w-full rounded-xl px-3 py-2 text-sm border"
                style={{ backgroundColor: "var(--psych-bg)", borderColor: "var(--psych-border)", color: "var(--psych-text)" }}
                value={newCaseId} onChange={(e) => setNewCaseId(e.target.value)}>
                <option value="">— No case —</option>
                {activeCases.map((c) => <option key={c.id} value={c.id}>{c.code} — {c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "var(--psych-muted)" }}>Model</label>
              <select className="w-full rounded-xl px-3 py-2 text-sm border"
                style={{ backgroundColor: "var(--psych-bg)", borderColor: "var(--psych-border)", color: "var(--psych-text)" }}
                value={newModel} onChange={(e) => setNewModel(e.target.value as FormulationModel)}>
                {MODEL_KEYS.map((k) => <option key={k} value={k}>{FORMULATION_MODELS[k].label}</option>)}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowNew(false)} className="px-4 py-1.5 rounded-xl text-sm border"
              style={{ borderColor: "var(--psych-border)", color: "var(--psych-muted)" }}>Cancel</button>
            <button onClick={handleCreate} className="px-4 py-1.5 rounded-xl text-sm text-white font-medium"
              style={{ background: "linear-gradient(135deg, var(--psych-primary), var(--psych-accent))" }}>
              Create & Edit
            </button>
          </div>
        </div>
      )}

      {/* Model legend */}
      <div className="flex flex-wrap gap-2">
        {MODEL_KEYS.map((k) => (
          <span key={k} className="flex items-center gap-1.5 text-xs px-3 py-1 rounded-full border"
            style={{ borderColor: "var(--psych-border)", color: "var(--psych-muted)" }}>
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: modelColors[k] }} />
            {FORMULATION_MODELS[k].label}
          </span>
        ))}
      </div>

      {/* Formulation list */}
      {formulations.length === 0 ? (
        <div className="text-center py-16" style={{ color: "var(--psych-muted)" }}>
          <Network size={32} className="mx-auto mb-3 opacity-40" />
          <p className="font-medium">No formulations yet</p>
          <p className="text-sm mt-1 opacity-70">Create a clinical formulation canvas for any case</p>
        </div>
      ) : (
        <div className="space-y-4">
          {formulations.map((f) => {
            const linkedCase = cases.find((c) => c.id === f.caseId);
            const modelDef = FORMULATION_MODELS[f.model];
            const isExpanded = expandedId === f.id;
            const isEditing = editId === f.id;
            const filledSections = Object.values(f.sections).filter(Boolean).length;

            return (
              <div key={f.id} className="rounded-2xl border overflow-hidden"
                style={{ backgroundColor: "var(--psych-card)", borderColor: "var(--psych-border)" }}>
                {/* Header */}
                <div className="flex items-center gap-3 p-4 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : f.id)}>
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: modelColors[f.model] }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm" style={{ color: "var(--psych-text)" }}>{f.title}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full border"
                        style={{ borderColor: "var(--psych-border)", color: "var(--psych-muted)" }}>{modelDef.label}</span>
                      {linkedCase && (
                        <span className="text-xs px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: "var(--psych-primary-light)", color: "var(--psych-primary)" }}>
                          {linkedCase.code}
                        </span>
                      )}
                      <span className="text-xs" style={{ color: "var(--psych-muted)" }}>
                        {filledSections}/{modelDef.sections.length} sections filled
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button onClick={(e) => { e.stopPropagation(); setEditId(isEditing ? null : f.id); setExpandedId(f.id); }}
                      className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg border"
                      style={isEditing
                        ? { borderColor: "var(--psych-primary)", color: "var(--psych-primary)" }
                        : { borderColor: "var(--psych-border)", color: "var(--psych-muted)" }}>
                      <Edit3 size={11} /> {isEditing ? "Done" : "Edit"}
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); takeSnapshot(f); }}
                      className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg border"
                      style={{ borderColor: "var(--psych-border)", color: "var(--psych-muted)" }}
                      title="Save a point-in-time copy of this formulation">
                      <Camera size={11} /> Snapshot
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(f.id); }}
                      className="p-1.5 rounded-lg" style={{ color: "var(--psych-muted)" }}><Trash2 size={13} /></button>
                    {isExpanded ? <ChevronUp size={14} style={{ color: "var(--psych-muted)" }} /> : <ChevronDown size={14} style={{ color: "var(--psych-muted)" }} />}
                  </div>
                </div>

                {/* Expanded sections */}
                {isExpanded && (
                  <div className="border-t p-4" style={{ borderColor: "var(--psych-border)" }}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {modelDef.sections.map((section) => {
                        const val = f.sections[section] || "";
                        return (
                          <div key={section} className="rounded-xl border p-3"
                            style={{
                              borderColor: val ? "var(--psych-primary)" : "var(--psych-border)",
                              backgroundColor: val ? "var(--psych-primary-light)" : "var(--psych-bg)",
                            }}>
                            <p className="text-[10px] font-semibold uppercase tracking-wider mb-1.5"
                              style={{ color: val ? "var(--psych-primary)" : "var(--psych-muted)" }}>
                              {section}
                            </p>
                            {isEditing ? (
                              <textarea rows={4} placeholder={`${section}…`}
                                className="w-full bg-transparent text-sm outline-none resize-none"
                                style={{ color: "var(--psych-text)" }}
                                defaultValue={val}
                                onBlur={(e) => updateSection(f.id, section, e.target.value)} />
                            ) : (
                              <p className="text-sm min-h-[60px]" style={{ color: val ? "var(--psych-text)" : "var(--psych-muted)", opacity: val ? 1 : 0.5 }}>
                                {val || "Click Edit to fill in…"}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Snapshots */}
                    {(() => {
                      const snaps = snapshotsForCanvas(snapshots, f.id);
                      if (snaps.length === 0) return null;
                      return (
                        <div
                          className="mt-4 pt-3 border-t"
                          style={{ borderColor: "var(--psych-border)" }}
                        >
                          <p
                            className="text-[10px] font-semibold uppercase tracking-wider mb-2"
                            style={{ color: "var(--psych-muted)" }}
                          >
                            Snapshots ({snaps.length})
                          </p>
                          <div className="space-y-1">
                            {snaps.map((s) => (
                              <div
                                key={s.id}
                                className="flex items-center gap-2 text-xs"
                                style={{ color: "var(--psych-muted)" }}
                              >
                                <Camera size={11} />
                                <span className="font-mono">
                                  {s.createdAt.split("T")[0]}
                                </span>
                                <span className="flex-1 truncate">
                                  {s.title}
                                </span>
                                <span>
                                  {Object.values(s.sections).filter(
                                    (v) => v && v.trim()
                                  ).length}{" "}
                                  sections
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })()}
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
