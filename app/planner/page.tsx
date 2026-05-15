"use client";
import { useState, useMemo } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { useClinical } from "@/contexts/ClinicalContext";
import { useApp } from "@/contexts/AppContext";
import { useToast } from "@/components/ui/Toast";
import { ATMOSPHERE_TAGS, type SessionPlan } from "@/lib/clinical-data";
import {
  CalendarDays, Plus, Trash2, ChevronDown, ChevronUp, CheckSquare,
  Square, ArrowRight, Clock, Search, Printer,
} from "lucide-react";
import { cn } from "@/lib/utils";

const SESSION_STATUSES = ["planned", "completed", "cancelled", "postponed"] as const;

const EMPTY: Partial<SessionPlan> = {
  caseId: "", date: "", time: "", goals: [], questionsToAsk: [], toolsToUse: [],
  interventionToTry: [], followUpFromLast: "", supervisorInstructions: "",
  riskReminders: "", materialsNeeded: [], worksheetsToGive: [], atmosphereTags: [],
  status: "planned", postSessionNotes: "",
};

function TagInput({ value, onChange, placeholder }: { value: string[]; onChange: (v: string[]) => void; placeholder: string }) {
  const [input, setInput] = useState("");
  function add() {
    const v = input.trim();
    if (v && !value.includes(v)) onChange([...value, v]);
    setInput("");
  }
  return (
    <div>
      <div className="flex flex-wrap gap-1 mb-1.5">
        {value.map((item) => (
          <span key={item} className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border"
            style={{ borderColor: "var(--psych-border)", color: "var(--psych-text)", backgroundColor: "var(--psych-primary-light)" }}>
            {item}
            <button onClick={() => onChange(value.filter((v) => v !== item))} className="hover:opacity-70">×</button>
          </span>
        ))}
      </div>
      <div className="flex gap-1">
        <input value={input} onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
          placeholder={placeholder}
          className="flex-1 rounded-lg px-2.5 py-1.5 text-sm border"
          style={{ backgroundColor: "var(--psych-bg)", borderColor: "var(--psych-border)", color: "var(--psych-text)" }} />
        <button onClick={add} className="px-2.5 py-1.5 rounded-lg text-sm border"
          style={{ borderColor: "var(--psych-border)", color: "var(--psych-muted)" }}>Add</button>
      </div>
    </div>
  );
}

export default function PlannerPage() {
  const { plans, addPlan, updatePlan, deletePlan } = useClinical();
  const { cases } = useApp();
  const { toast } = useToast();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Partial<SessionPlan>>({ ...EMPTY });
  const [editId, setEditId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const filtered = useMemo(() => {
    return plans.filter((p) => {
      const q = search.toLowerCase();
      const matchSearch = !q || p.goals.some((g) => g.toLowerCase().includes(q)) ||
        p.followUpFromLast.toLowerCase().includes(q) || p.postSessionNotes.toLowerCase().includes(q);
      const matchStatus = !filterStatus || p.status === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [plans, search, filterStatus]);

  function set(field: keyof SessionPlan, val: unknown) {
    setForm((f) => ({ ...f, [field]: val }));
  }

  function toggleAtmo(tag: string) {
    setForm((f) => {
      const cur = f.atmosphereTags || [];
      return { ...f, atmosphereTags: cur.includes(tag) ? cur.filter((t) => t !== tag) : [...cur, tag] };
    });
  }

  function handleSubmit() {
    if (!form.caseId) { toast("Select a case", "error"); return; }
    if (!form.date) { toast("Select a date", "error"); return; }
    if (editId) {
      updatePlan(editId, form);
      toast("Session plan updated", "success");
    } else {
      addPlan(form);
      toast("Session plan created", "success");
    }
    setForm({ ...EMPTY });
    setEditId(null);
    setShowForm(false);
  }

  function startEdit(p: SessionPlan) {
    setForm({ ...p });
    setEditId(p.id);
    setShowForm(true);
    setExpandedId(null);
  }

  function handleDelete(id: string) {
    deletePlan(id);
    toast("Plan deleted", "success");
  }

  function convertToNote(p: SessionPlan) {
    updatePlan(p.id, { status: "completed" });
    toast("Marked as completed — add post-session notes below", "success");
    setExpandedId(p.id);
  }

  const activeCases = cases.filter((c) => !c.isArchived);

  const statusColors: Record<string, string> = {
    planned: "var(--psych-primary)",
    completed: "#10b981",
    cancelled: "#ef4444",
    postponed: "#f59e0b",
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        title="Session Planner"
        subtitle={`${plans.length} session plan${plans.length !== 1 ? "s" : ""} · prepare, then reflect`}
        actions={
          <div className="flex gap-2">
            <button onClick={() => window.print()} className="no-print btn-ghost flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-xl border"
              style={{ borderColor: "var(--psych-border)", color: "var(--psych-muted)" }}>
              <Printer size={14} /> Print
            </button>
            <button onClick={() => { setForm({ ...EMPTY }); setEditId(null); setShowForm(true); }}
              className="flex items-center gap-1.5 text-sm px-4 py-1.5 rounded-xl text-white font-medium"
              style={{ background: "linear-gradient(135deg, var(--psych-primary), var(--psych-accent))" }}>
              <Plus size={14} /> New Plan
            </button>
          </div>
        }
      />

      {/* Form */}
      {showForm && (
        <div className="rounded-2xl border p-5 space-y-4" style={{ backgroundColor: "var(--psych-card)", borderColor: "var(--psych-border)" }}>
          <h3 className="font-semibold" style={{ color: "var(--psych-text)" }}>
            {editId ? "Edit Session Plan" : "New Session Plan"}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "var(--psych-muted)" }}>Case *</label>
              <select className="w-full rounded-xl px-3 py-2 text-sm border"
                style={{ backgroundColor: "var(--psych-bg)", borderColor: "var(--psych-border)", color: "var(--psych-text)" }}
                value={form.caseId || ""} onChange={(e) => set("caseId", e.target.value)}>
                <option value="">Select case…</option>
                {activeCases.map((c) => <option key={c.id} value={c.id}>{c.code} — {c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "var(--psych-muted)" }}>Date *</label>
              <input type="date" className="w-full rounded-xl px-3 py-2 text-sm border"
                style={{ backgroundColor: "var(--psych-bg)", borderColor: "var(--psych-border)", color: "var(--psych-text)" }}
                value={form.date || ""} onChange={(e) => set("date", e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "var(--psych-muted)" }}>Time</label>
              <input type="time" className="w-full rounded-xl px-3 py-2 text-sm border"
                style={{ backgroundColor: "var(--psych-bg)", borderColor: "var(--psych-border)", color: "var(--psych-text)" }}
                value={form.time || ""} onChange={(e) => set("time", e.target.value)} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "var(--psych-muted)" }}>Session goals</label>
            <TagInput value={form.goals || []} onChange={(v) => set("goals", v)} placeholder="Type a goal and press Enter…" />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "var(--psych-muted)" }}>Questions to ask</label>
            <TagInput value={form.questionsToAsk || []} onChange={(v) => set("questionsToAsk", v)} placeholder="Type a question and press Enter…" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "var(--psych-muted)" }}>Tools / techniques to use</label>
              <TagInput value={form.toolsToUse || []} onChange={(v) => set("toolsToUse", v)} placeholder="e.g. EMDR, breathing…" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "var(--psych-muted)" }}>Interventions to try</label>
              <TagInput value={form.interventionToTry || []} onChange={(v) => set("interventionToTry", v)} placeholder="e.g. exposure, grounding…" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "var(--psych-muted)" }}>Follow-up from last session</label>
              <textarea rows={2} className="w-full rounded-xl px-3 py-2 text-sm border resize-none"
                style={{ backgroundColor: "var(--psych-bg)", borderColor: "var(--psych-border)", color: "var(--psych-text)" }}
                value={form.followUpFromLast || ""} onChange={(e) => set("followUpFromLast", e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "var(--psych-muted)" }}>Supervisor instructions</label>
              <textarea rows={2} className="w-full rounded-xl px-3 py-2 text-sm border resize-none"
                style={{ backgroundColor: "var(--psych-bg)", borderColor: "var(--psych-border)", color: "var(--psych-text)" }}
                value={form.supervisorInstructions || ""} onChange={(e) => set("supervisorInstructions", e.target.value)} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "var(--psych-muted)" }}>Risk reminders</label>
            <textarea rows={2} placeholder="Any risk factors or safety considerations for this session…"
              className="w-full rounded-xl px-3 py-2 text-sm border resize-none"
              style={{ backgroundColor: "var(--psych-bg)", borderColor: "var(--psych-border)", color: "var(--psych-text)" }}
              value={form.riskReminders || ""} onChange={(e) => set("riskReminders", e.target.value)} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "var(--psych-muted)" }}>Materials needed</label>
              <TagInput value={form.materialsNeeded || []} onChange={(v) => set("materialsNeeded", v)} placeholder="e.g. whiteboard, handout…" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "var(--psych-muted)" }}>Worksheets to give</label>
              <TagInput value={form.worksheetsToGive || []} onChange={(v) => set("worksheetsToGive", v)} placeholder="e.g. thought record…" />
            </div>
          </div>

          <div>
            <p className="text-xs font-medium mb-2" style={{ color: "var(--psych-muted)" }}>Session atmosphere (expected)</p>
            <div className="flex flex-wrap gap-1.5">
              {ATMOSPHERE_TAGS.map((tag) => {
                const active = form.atmosphereTags?.includes(tag);
                return (
                  <button key={tag} onClick={() => toggleAtmo(tag)}
                    className={cn("text-xs px-2.5 py-1 rounded-full border transition-all", active && "font-medium")}
                    style={active
                      ? { backgroundColor: "var(--psych-primary)", color: "white", borderColor: "var(--psych-primary)" }
                      : { backgroundColor: "var(--psych-bg)", color: "var(--psych-muted)", borderColor: "var(--psych-border)" }}>
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "var(--psych-muted)" }}>Post-session notes</label>
            <textarea rows={3} placeholder="Fill in after the session…"
              className="w-full rounded-xl px-3 py-2 text-sm border resize-none"
              style={{ backgroundColor: "var(--psych-bg)", borderColor: "var(--psych-border)", color: "var(--psych-text)" }}
              value={form.postSessionNotes || ""} onChange={(e) => set("postSessionNotes", e.target.value)} />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => { setShowForm(false); setEditId(null); setForm({ ...EMPTY }); }}
              className="px-4 py-1.5 rounded-xl text-sm border"
              style={{ borderColor: "var(--psych-border)", color: "var(--psych-muted)" }}>Cancel</button>
            <button onClick={handleSubmit}
              className="px-4 py-1.5 rounded-xl text-sm text-white font-medium"
              style={{ background: "linear-gradient(135deg, var(--psych-primary), var(--psych-accent))" }}>
              {editId ? "Update Plan" : "Save Plan"}
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="no-print flex flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-[200px] rounded-xl px-3 py-2 border text-sm"
          style={{ backgroundColor: "var(--psych-card)", borderColor: "var(--psych-border)" }}>
          <Search size={14} style={{ color: "var(--psych-muted)" }} />
          <input placeholder="Search plans…" className="bg-transparent flex-1 outline-none"
            style={{ color: "var(--psych-text)" }} value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="rounded-xl px-3 py-2 border text-sm"
          style={{ backgroundColor: "var(--psych-card)", borderColor: "var(--psych-border)", color: "var(--psych-text)" }}
          value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="">All statuses</option>
          {SESSION_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16" style={{ color: "var(--psych-muted)" }}>
          <CalendarDays size={32} className="mx-auto mb-3 opacity-40" />
          <p className="font-medium">No session plans yet</p>
          <p className="text-sm mt-1 opacity-70">Plan your sessions before they happen</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((p) => {
            const linkedCase = cases.find((c) => c.id === p.caseId);
            const isExpanded = expandedId === p.id;
            return (
              <div key={p.id} className="rounded-2xl border overflow-hidden"
                style={{ backgroundColor: "var(--psych-card)", borderColor: "var(--psych-border)" }}>
                <div className="flex items-start gap-3 p-4 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : p.id)}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-xs font-mono" style={{ color: "var(--psych-muted)" }}>{p.date}</span>
                      {p.time && <span className="flex items-center gap-0.5 text-xs" style={{ color: "var(--psych-muted)" }}><Clock size={10} />{p.time}</span>}
                      {linkedCase && (
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{ backgroundColor: "var(--psych-primary-light)", color: "var(--psych-primary)" }}>
                          {linkedCase.code}
                        </span>
                      )}
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium capitalize"
                        style={{ backgroundColor: `${statusColors[p.status]}20`, color: statusColors[p.status] }}>
                        {p.status}
                      </span>
                    </div>
                    {p.goals.length > 0 && (
                      <p className="text-sm" style={{ color: "var(--psych-text)" }}>
                        Goals: {p.goals.slice(0, 2).join(" · ")}{p.goals.length > 2 ? ` +${p.goals.length - 2}` : ""}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {p.status === "planned" && (
                      <button onClick={(e) => { e.stopPropagation(); convertToNote(p); }}
                        className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg border"
                        style={{ borderColor: "#10b981", color: "#10b981" }}>
                        <ArrowRight size={11} /> Complete
                      </button>
                    )}
                    <button onClick={(e) => { e.stopPropagation(); startEdit(p); }}
                      className="p-1.5 rounded-lg text-xs" style={{ color: "var(--psych-muted)" }}>Edit</button>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(p.id); }}
                      className="p-1.5 rounded-lg" style={{ color: "var(--psych-muted)" }}><Trash2 size={13} /></button>
                    {isExpanded ? <ChevronUp size={14} style={{ color: "var(--psych-muted)" }} /> : <ChevronDown size={14} style={{ color: "var(--psych-muted)" }} />}
                  </div>
                </div>
                {isExpanded && (
                  <div className="border-t px-4 pb-4 pt-3 space-y-3" style={{ borderColor: "var(--psych-border)" }}>
                    {p.goals.length > 0 && (
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--psych-muted)" }}>Goals</p>
                        <ul className="space-y-0.5">
                          {p.goals.map((g, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm" style={{ color: "var(--psych-text)" }}>
                              <CheckSquare size={13} className="mt-0.5 flex-shrink-0" style={{ color: "var(--psych-primary)" }} /> {g}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {p.questionsToAsk.length > 0 && (
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--psych-muted)" }}>Questions to ask</p>
                        <ul className="space-y-0.5">
                          {p.questionsToAsk.map((q, i) => <li key={i} className="text-sm" style={{ color: "var(--psych-text)" }}>• {q}</li>)}
                        </ul>
                      </div>
                    )}
                    {[
                      { label: "Follow-up from last session", val: p.followUpFromLast },
                      { label: "Supervisor instructions", val: p.supervisorInstructions },
                      { label: "Risk reminders", val: p.riskReminders },
                      { label: "Post-session notes", val: p.postSessionNotes },
                    ].filter((x) => x.val).map(({ label, val }) => (
                      <div key={label}>
                        <p className="text-[10px] font-semibold uppercase tracking-wider mb-0.5" style={{ color: "var(--psych-muted)" }}>{label}</p>
                        <p className="text-sm" style={{ color: "var(--psych-text)" }}>{val}</p>
                      </div>
                    ))}
                    {p.atmosphereTags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {p.atmosphereTags.map((tag) => (
                          <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full border"
                            style={{ borderColor: "var(--psych-border)", color: "var(--psych-muted)" }}>{tag}</span>
                        ))}
                      </div>
                    )}
                    {/* Inline post-session note edit */}
                    {p.status === "completed" && !p.postSessionNotes && (
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--psych-muted)" }}>Add post-session notes</p>
                        <textarea rows={3} placeholder="How did the session go?"
                          className="w-full rounded-xl px-3 py-2 text-sm border resize-none"
                          style={{ backgroundColor: "var(--psych-bg)", borderColor: "var(--psych-border)", color: "var(--psych-text)" }}
                          onBlur={(e) => { if (e.target.value) updatePlan(p.id, { postSessionNotes: e.target.value }); }} />
                      </div>
                    )}
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
