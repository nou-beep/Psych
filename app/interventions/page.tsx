"use client";
import { useState, useMemo } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { useClinical } from "@/contexts/ClinicalContext";
import { useApp } from "@/contexts/AppContext";
import { useToast } from "@/components/ui/Toast";
import { INTERVENTION_CATEGORIES, ATMOSPHERE_TAGS, type Intervention } from "@/lib/clinical-data";
import { Zap, Plus, Trash2, Star, Search, Filter, Printer } from "lucide-react";
import { cn } from "@/lib/utils";

const EFFECTIVENESS_LABELS = ["", "Not helpful", "Slightly helpful", "Moderately helpful", "Very helpful", "Transformative"];

const EMPTY: Partial<Intervention> = {
  name: "", category: "Custom", caseId: "", goalTargeted: "",
  response: "", effectiveness: 3, followUpNeeded: false, atmosphereTags: [], notes: "",
};

export default function InterventionsPage() {
  const { interventions, addIntervention, updateIntervention, deleteIntervention } = useClinical();
  const { cases } = useApp();
  const { toast } = useToast();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Partial<Intervention>>({ ...EMPTY });
  const [editId, setEditId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");

  const filtered = useMemo(() => {
    return interventions.filter((i) => {
      const q = search.toLowerCase();
      const matchSearch = !q || i.name.toLowerCase().includes(q) ||
        i.goalTargeted.toLowerCase().includes(q) || i.response.toLowerCase().includes(q);
      const matchCat = !filterCategory || i.category === filterCategory;
      return matchSearch && matchCat;
    });
  }, [interventions, search, filterCategory]);

  function set(field: keyof Intervention, val: unknown) {
    setForm((f) => ({ ...f, [field]: val }));
  }

  function toggleAtmo(tag: string) {
    setForm((f) => {
      const cur = f.atmosphereTags || [];
      return { ...f, atmosphereTags: cur.includes(tag) ? cur.filter((t) => t !== tag) : [...cur, tag] };
    });
  }

  function handleSubmit() {
    if (!form.name?.trim()) { toast("Enter an intervention name", "error"); return; }
    if (editId) {
      updateIntervention(editId, form);
      toast("Intervention updated", "success");
    } else {
      addIntervention({ ...form, date: new Date().toISOString().split("T")[0] });
      toast("Intervention logged", "success");
    }
    setForm({ ...EMPTY });
    setEditId(null);
    setShowForm(false);
  }

  function startEdit(i: Intervention) {
    setForm({ ...i });
    setEditId(i.id);
    setShowForm(true);
  }

  const activeCases = cases.filter((c) => !c.isArchived);

  const effectivenessColor = (n: number) => {
    if (n >= 4) return "#10b981";
    if (n === 3) return "var(--psych-primary)";
    if (n === 2) return "#f59e0b";
    return "#ef4444";
  };

  // Group by category for summary
  const byCategory = useMemo(() => {
    const map: Record<string, number> = {};
    interventions.forEach((i) => { map[i.category] = (map[i.category] || 0) + 1; });
    return map;
  }, [interventions]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        title="Intervention Tracker"
        subtitle={`${interventions.length} intervention${interventions.length !== 1 ? "s" : ""} logged`}
        actions={
          <div className="flex gap-2">
            <button onClick={() => window.print()} className="no-print btn-ghost flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-xl border"
              style={{ borderColor: "var(--psych-border)", color: "var(--psych-muted)" }}>
              <Printer size={14} /> Print
            </button>
            <button onClick={() => { setForm({ ...EMPTY }); setEditId(null); setShowForm(true); }}
              className="flex items-center gap-1.5 text-sm px-4 py-1.5 rounded-xl text-white font-medium"
              style={{ background: "linear-gradient(135deg, var(--psych-primary), var(--psych-accent))" }}>
              <Plus size={14} /> Log Intervention
            </button>
          </div>
        }
      />

      {/* Category summary pills */}
      {Object.keys(byCategory).length > 0 && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(byCategory).sort((a, b) => b[1] - a[1]).map(([cat, count]) => (
            <button key={cat}
              onClick={() => setFilterCategory(filterCategory === cat ? "" : cat)}
              className="text-xs px-3 py-1 rounded-full border transition-all"
              style={filterCategory === cat
                ? { backgroundColor: "var(--psych-primary)", color: "white", borderColor: "var(--psych-primary)" }
                : { backgroundColor: "var(--psych-card)", color: "var(--psych-muted)", borderColor: "var(--psych-border)" }}>
              {cat} ({count})
            </button>
          ))}
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="rounded-2xl border p-5 space-y-4" style={{ backgroundColor: "var(--psych-card)", borderColor: "var(--psych-border)" }}>
          <h3 className="font-semibold" style={{ color: "var(--psych-text)" }}>
            {editId ? "Edit Intervention" : "Log Intervention"}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "var(--psych-muted)" }}>Intervention name *</label>
              <input className="w-full rounded-xl px-3 py-2 text-sm border"
                style={{ backgroundColor: "var(--psych-bg)", borderColor: "var(--psych-border)", color: "var(--psych-text)" }}
                placeholder="e.g. Grounding 5-4-3-2-1"
                value={form.name || ""} onChange={(e) => set("name", e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "var(--psych-muted)" }}>Category</label>
              <select className="w-full rounded-xl px-3 py-2 text-sm border"
                style={{ backgroundColor: "var(--psych-bg)", borderColor: "var(--psych-border)", color: "var(--psych-text)" }}
                value={form.category || "Custom"} onChange={(e) => set("category", e.target.value)}>
                {INTERVENTION_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "var(--psych-muted)" }}>Case</label>
              <select className="w-full rounded-xl px-3 py-2 text-sm border"
                style={{ backgroundColor: "var(--psych-bg)", borderColor: "var(--psych-border)", color: "var(--psych-text)" }}
                value={form.caseId || ""} onChange={(e) => set("caseId", e.target.value)}>
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

          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "var(--psych-muted)" }}>Goal targeted</label>
            <input className="w-full rounded-xl px-3 py-2 text-sm border"
              style={{ backgroundColor: "var(--psych-bg)", borderColor: "var(--psych-border)", color: "var(--psych-text)" }}
              placeholder="e.g. Reduce anxiety, build tolerance for distress…"
              value={form.goalTargeted || ""} onChange={(e) => set("goalTargeted", e.target.value)} />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "var(--psych-muted)" }}>Client response</label>
            <textarea rows={2} className="w-full rounded-xl px-3 py-2 text-sm border resize-none"
              style={{ backgroundColor: "var(--psych-bg)", borderColor: "var(--psych-border)", color: "var(--psych-text)" }}
              placeholder="How did the client respond?"
              value={form.response || ""} onChange={(e) => set("response", e.target.value)} />
          </div>

          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: "var(--psych-muted)" }}>
              Effectiveness: {EFFECTIVENESS_LABELS[form.effectiveness || 3]}
            </label>
            <div className="flex gap-2 items-center">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} onClick={() => set("effectiveness", n)}
                  className={cn("w-8 h-8 rounded-full border-2 transition-all flex items-center justify-center text-sm font-bold")}
                  style={n <= (form.effectiveness || 3)
                    ? { backgroundColor: effectivenessColor(form.effectiveness || 3), borderColor: effectivenessColor(form.effectiveness || 3), color: "white" }
                    : { borderColor: "var(--psych-border)", color: "var(--psych-muted)" }}>
                  {n}
                </button>
              ))}
              <span className="text-xs ml-1" style={{ color: "var(--psych-muted)" }}>{EFFECTIVENESS_LABELS[form.effectiveness || 3]}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "var(--psych-muted)" }}>Notes</label>
            <textarea rows={2} className="w-full rounded-xl px-3 py-2 text-sm border resize-none"
              style={{ backgroundColor: "var(--psych-bg)", borderColor: "var(--psych-border)", color: "var(--psych-text)" }}
              placeholder="Additional notes, adaptations, or follow-up plan…"
              value={form.notes || ""} onChange={(e) => set("notes", e.target.value)} />
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" id="followUp" checked={!!form.followUpNeeded}
              onChange={(e) => set("followUpNeeded", e.target.checked)} />
            <label htmlFor="followUp" className="text-sm cursor-pointer" style={{ color: "var(--psych-text)" }}>
              Follow-up needed next session
            </label>
          </div>

          <div>
            <p className="text-xs font-medium mb-2" style={{ color: "var(--psych-muted)" }}>Session atmosphere</p>
            <div className="flex flex-wrap gap-1.5">
              {ATMOSPHERE_TAGS.map((tag) => {
                const active = form.atmosphereTags?.includes(tag);
                return (
                  <button key={tag} onClick={() => toggleAtmo(tag)}
                    className={cn("text-xs px-2.5 py-1 rounded-full border")}
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
              {editId ? "Update" : "Log Intervention"}
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="no-print flex flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-[200px] rounded-xl px-3 py-2 border text-sm"
          style={{ backgroundColor: "var(--psych-card)", borderColor: "var(--psych-border)" }}>
          <Search size={14} style={{ color: "var(--psych-muted)" }} />
          <input placeholder="Search interventions…" className="bg-transparent flex-1 outline-none"
            style={{ color: "var(--psych-text)" }} value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="rounded-xl px-3 py-2 border text-sm"
          style={{ backgroundColor: "var(--psych-card)", borderColor: "var(--psych-border)", color: "var(--psych-text)" }}
          value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
          <option value="">All categories</option>
          {INTERVENTION_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16" style={{ color: "var(--psych-muted)" }}>
          <Zap size={32} className="mx-auto mb-3 opacity-40" />
          <p className="font-medium">No interventions logged yet</p>
          <p className="text-sm mt-1 opacity-70">Track what you try and how clients respond</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((i) => {
            const linkedCase = cases.find((c) => c.id === i.caseId);
            return (
              <div key={i.id} className="rounded-2xl border p-4"
                style={{ backgroundColor: "var(--psych-card)", borderColor: "var(--psych-border)" }}>
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-medium text-sm" style={{ color: "var(--psych-text)" }}>{i.name}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full border"
                        style={{ borderColor: "var(--psych-border)", color: "var(--psych-muted)" }}>{i.category}</span>
                      {linkedCase && (
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{ backgroundColor: "var(--psych-primary-light)", color: "var(--psych-primary)" }}>
                          {linkedCase.code}
                        </span>
                      )}
                      {i.followUpNeeded && (
                        <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: "#fef3c7", color: "#92400e" }}>
                          Follow-up needed
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs mb-2" style={{ color: "var(--psych-muted)" }}>
                      <span>{i.date}</span>
                      <span className="flex items-center gap-0.5">
                        Effectiveness:
                        {[1, 2, 3, 4, 5].map((n) => (
                          <Star key={n} size={11} fill={n <= i.effectiveness ? effectivenessColor(i.effectiveness) : "none"}
                            stroke={effectivenessColor(i.effectiveness)} />
                        ))}
                      </span>
                    </div>
                    {i.goalTargeted && <p className="text-sm mb-1" style={{ color: "var(--psych-text)" }}><span style={{ color: "var(--psych-muted)" }}>Goal:</span> {i.goalTargeted}</p>}
                    {i.response && <p className="text-sm" style={{ color: "var(--psych-text)" }}><span style={{ color: "var(--psych-muted)" }}>Response:</span> {i.response}</p>}
                    {i.notes && <p className="text-sm mt-1 opacity-80" style={{ color: "var(--psych-text)" }}>{i.notes}</p>}
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button onClick={() => startEdit(i)} className="text-xs p-1.5 rounded-lg" style={{ color: "var(--psych-muted)" }}>Edit</button>
                    <button onClick={() => { deleteIntervention(i.id); toast("Deleted", "success"); }}
                      className="p-1.5 rounded-lg" style={{ color: "var(--psych-muted)" }}><Trash2 size={13} /></button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
