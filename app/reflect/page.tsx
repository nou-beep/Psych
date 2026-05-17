"use client";
import { useState, useMemo } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { useClinical } from "@/contexts/ClinicalContext";
import { useApp } from "@/contexts/AppContext";
import { useToast } from "@/components/ui/Toast";
import { ATMOSPHERE_TAGS, type ClinicalReflection } from "@/lib/clinical-data";
import {
  BookOpen, Plus, Trash2, Lock, Unlock, ChevronDown, ChevronUp,
  Printer, Search, Filter, Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const REFLECTION_PROMPTS = [
  "What surprised you about this session?",
  "Where did you feel most uncertain, and why?",
  "What would you do differently next time?",
  "What did the client teach you today?",
  "How did this session affect you emotionally?",
  "What countertransference did you notice?",
  "What ethical tensions arose, if any?",
  "What would you bring to supervision from today?",
];

const EMPTY: Partial<ClinicalReflection> = {
  linkedCaseId: "", whatLearned: "", whatDifficult: "", countertransference: "",
  emotionalImpact: "", ethicalQuestions: "", supervisionTopics: "",
  skillsToImprove: "", nextAction: "", tags: [], atmosphereTags: [], isPrivate: false,
};

export default function ReflectPage() {
  const { reflections, addReflection, updateReflection, deleteReflection } = useClinical();
  const { cases } = useApp();
  const { toast } = useToast();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Partial<ClinicalReflection>>({ ...EMPTY });
  const [editId, setEditId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterTag, setFilterTag] = useState("");
  const [promptIdx, setPromptIdx] = useState(0);

  const filtered = useMemo(() => {
    return reflections.filter((r) => {
      const q = search.toLowerCase();
      const matchSearch = !q || r.whatLearned.toLowerCase().includes(q) ||
        r.whatDifficult.toLowerCase().includes(q) || r.emotionalImpact.toLowerCase().includes(q);
      const matchTag = !filterTag || r.atmosphereTags?.includes(filterTag);
      return matchSearch && matchTag;
    });
  }, [reflections, search, filterTag]);

  function set(field: keyof ClinicalReflection, val: unknown) {
    setForm((f) => ({ ...f, [field]: val }));
  }

  function toggleAtmo(tag: string) {
    setForm((f) => {
      const cur = f.atmosphereTags || [];
      return { ...f, atmosphereTags: cur.includes(tag) ? cur.filter((t) => t !== tag) : [...cur, tag] };
    });
  }

  function handleSubmit() {
    if (!form.whatLearned?.trim() && !form.whatDifficult?.trim()) {
      toast("Add at least one reflection note", "error"); return;
    }
    if (editId) {
      updateReflection(editId, form);
      toast("Reflection updated", "success");
    } else {
      addReflection({ ...form, date: new Date().toISOString().split("T")[0] });
      toast("Reflection saved", "success");
    }
    setForm({ ...EMPTY });
    setEditId(null);
    setShowForm(false);
  }

  function startEdit(r: ClinicalReflection) {
    setForm({ ...r });
    setEditId(r.id);
    setShowForm(true);
    setExpandedId(null);
  }

  function handleDelete(id: string) {
    deleteReflection(id);
    toast("Reflection deleted", "success");
  }

  function handlePrint() { window.print(); }

  const activeCases = cases.filter((c) => !c.isArchived);
  const prompt = REFLECTION_PROMPTS[promptIdx % REFLECTION_PROMPTS.length];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        title="Clinical Reflection Journal"
        subtitle={`${reflections.length} reflection${reflections.length !== 1 ? "s" : ""} · private & supervision-ready`}
        actions={
          <div className="flex gap-2">
            <button onClick={handlePrint} className="no-print btn-ghost flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-xl border"
              style={{ borderColor: "var(--psych-border)", color: "var(--psych-muted)" }}>
              <Printer size={14} /> Print
            </button>
            <button onClick={() => { setForm({ ...EMPTY }); setEditId(null); setShowForm(true); }}
              className="flex items-center gap-1.5 text-sm px-4 py-1.5 rounded-xl text-white font-medium"
              style={{ background: "linear-gradient(135deg, var(--psych-primary), var(--psych-accent))" }}>
              <Plus size={14} /> New Reflection
            </button>
          </div>
        }
      />

      {/* Prompt of the day */}
      <div className="no-print rounded-2xl p-4 border flex items-start gap-3"
        style={{ backgroundColor: "var(--psych-primary-light)", borderColor: "var(--psych-border)" }}>
        <Sparkles size={16} className="mt-0.5 flex-shrink-0" style={{ color: "var(--psych-primary)" }} />
        <div className="flex-1">
          <p className="text-xs font-semibold mb-0.5" style={{ color: "var(--psych-primary)" }}>Reflection prompt</p>
          <p className="text-sm" style={{ color: "var(--psych-text)" }}>{prompt}</p>
        </div>
        <button onClick={() => setPromptIdx((i) => i + 1)} className="text-xs px-2 py-1 rounded-lg"
          style={{ color: "var(--psych-muted)" }}>Next</button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="rounded-2xl border p-5 space-y-4" style={{ backgroundColor: "var(--psych-card)", borderColor: "var(--psych-border)" }}>
          <div className="flex items-center justify-between">
            <h3 className="font-semibold" style={{ color: "var(--psych-text)" }}>
              {editId ? "Edit Reflection" : "New Clinical Reflection"}
            </h3>
            <label className="flex items-center gap-1.5 text-sm cursor-pointer" style={{ color: "var(--psych-muted)" }}>
              {form.isPrivate ? <Lock size={14} /> : <Unlock size={14} />}
              <span>{form.isPrivate ? "Private" : "Shareable"}</span>
              <input type="checkbox" className="ml-1" checked={!!form.isPrivate}
                onChange={(e) => set("isPrivate", e.target.checked)} />
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "var(--psych-muted)" }}>Linked Case</label>
              <select className="w-full rounded-xl px-3 py-2 text-sm border"
                style={{ backgroundColor: "var(--psych-bg)", borderColor: "var(--psych-border)", color: "var(--psych-text)" }}
                value={form.linkedCaseId || ""} onChange={(e) => set("linkedCaseId", e.target.value)}>
                <option value="">— No case —</option>
                {activeCases.map((c) => <option key={c.id} value={c.id}>{c.code} — {c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "var(--psych-muted)" }}>Date</label>
              <input type="date" className="w-full rounded-xl px-3 py-2 text-sm border"
                style={{ backgroundColor: "var(--psych-bg)", borderColor: "var(--psych-border)", color: "var(--psych-text)" }}
                value={form.date || new Date().toISOString().split("T")[0]}
                onChange={(e) => set("date", e.target.value)} />
            </div>
          </div>

          {[
            { field: "whatLearned", label: "What I learned / observed" },
            { field: "whatDifficult", label: "What was difficult" },
            { field: "countertransference", label: "Countertransference noticed" },
            { field: "emotionalImpact", label: "Emotional impact on me" },
            { field: "ethicalQuestions", label: "Ethical questions / tensions" },
            { field: "supervisionTopics", label: "Topics to bring to supervision" },
            { field: "skillsToImprove", label: "Skills I want to develop" },
            { field: "nextAction", label: "Next action / intention" },
          ].map(({ field, label }) => (
            <div key={field}>
              <label className="block text-xs font-medium mb-1" style={{ color: "var(--psych-muted)" }}>{label}</label>
              <textarea rows={2} placeholder={`${label}…`}
                className="w-full rounded-xl px-3 py-2 text-sm border resize-none"
                style={{ backgroundColor: "var(--psych-bg)", borderColor: "var(--psych-border)", color: "var(--psych-text)" }}
                value={(form as Record<string, string>)[field] || ""}
                onChange={(e) => set(field as keyof ClinicalReflection, e.target.value)} />
            </div>
          ))}

          <div>
            <p className="text-xs font-medium mb-2" style={{ color: "var(--psych-muted)" }}>Session atmosphere</p>
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

          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => { setShowForm(false); setEditId(null); setForm({ ...EMPTY }); }}
              className="px-4 py-1.5 rounded-xl text-sm border"
              style={{ borderColor: "var(--psych-border)", color: "var(--psych-muted)" }}>Cancel</button>
            <button onClick={handleSubmit}
              className="px-4 py-1.5 rounded-xl text-sm text-white font-medium"
              style={{ background: "linear-gradient(135deg, var(--psych-primary), var(--psych-accent))" }}>
              {editId ? "Update" : "Save Reflection"}
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="no-print flex flex-wrap gap-2 items-center">
        <div className="flex items-center gap-2 flex-1 min-w-[200px] rounded-xl px-3 py-2 border text-sm"
          style={{ backgroundColor: "var(--psych-card)", borderColor: "var(--psych-border)" }}>
          <Search size={14} style={{ color: "var(--psych-muted)" }} />
          <input placeholder="Search reflections…" className="bg-transparent flex-1 outline-none"
            style={{ color: "var(--psych-text)" }} value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex items-center gap-2 rounded-xl px-3 py-2 border text-sm"
          style={{ backgroundColor: "var(--psych-card)", borderColor: "var(--psych-border)" }}>
          <Filter size={14} style={{ color: "var(--psych-muted)" }} />
          <select className="bg-transparent outline-none text-sm" style={{ color: "var(--psych-text)" }}
            value={filterTag} onChange={(e) => setFilterTag(e.target.value)}>
            <option value="">All atmosphere tags</option>
            {ATMOSPHERE_TAGS.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16" style={{ color: "var(--psych-muted)" }}>
          <BookOpen size={32} className="mx-auto mb-3 opacity-40" />
          <p className="font-medium">No reflections yet</p>
          <p className="text-sm mt-1 opacity-70">Start your clinical reflection practice</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => {
            const linkedCase = cases.find((c) => c.id === r.linkedCaseId);
            const isExpanded = expandedId === r.id;
            return (
              <div key={r.id} className="rounded-2xl border overflow-hidden"
                style={{ backgroundColor: "var(--psych-card)", borderColor: "var(--psych-border)" }}>
                <div className="flex items-start gap-3 p-4 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : r.id)}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-xs font-mono" style={{ color: "var(--psych-muted)" }}>{r.date}</span>
                      {linkedCase && (
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{ backgroundColor: "var(--psych-primary-light)", color: "var(--psych-primary)" }}>
                          {linkedCase.code}
                        </span>
                      )}
                      {r.isPrivate && <Lock size={11} style={{ color: "var(--psych-muted)" }} />}
                    </div>
                    <p className="text-sm line-clamp-2" style={{ color: "var(--psych-text)" }}>
                      {r.whatLearned || r.whatDifficult || r.emotionalImpact || "No summary"}
                    </p>
                    {r.atmosphereTags && r.atmosphereTags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {r.atmosphereTags.map((tag) => (
                          <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full border"
                            style={{ borderColor: "var(--psych-border)", color: "var(--psych-muted)" }}>{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button onClick={(e) => { e.stopPropagation(); startEdit(r); }}
                      className="p-1.5 rounded-lg hover:opacity-80 text-xs"
                      style={{ color: "var(--psych-muted)" }}>Edit</button>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(r.id); }}
                      className="p-1.5 rounded-lg hover:opacity-80"
                      style={{ color: "var(--psych-muted)" }}><Trash2 size={13} /></button>
                    {isExpanded ? <ChevronUp size={14} style={{ color: "var(--psych-muted)" }} /> : <ChevronDown size={14} style={{ color: "var(--psych-muted)" }} />}
                  </div>
                </div>
                {isExpanded && (
                  <div className="border-t px-4 pb-4 pt-3 space-y-3"
                    style={{ borderColor: "var(--psych-border)" }}>
                    {[
                      { label: "What I learned", val: r.whatLearned },
                      { label: "What was difficult", val: r.whatDifficult },
                      { label: "Countertransference", val: r.countertransference },
                      { label: "Emotional impact", val: r.emotionalImpact },
                      { label: "Ethical questions", val: r.ethicalQuestions },
                      { label: "Supervision topics", val: r.supervisionTopics },
                      { label: "Skills to improve", val: r.skillsToImprove },
                      { label: "Next action", val: r.nextAction },
                    ].filter((x) => x.val).map(({ label, val }) => (
                      <div key={label}>
                        <p className="text-[10px] font-semibold uppercase tracking-wider mb-0.5" style={{ color: "var(--psych-muted)" }}>{label}</p>
                        <p className="text-sm" style={{ color: "var(--psych-text)" }}>{val}</p>
                      </div>
                    ))}
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
