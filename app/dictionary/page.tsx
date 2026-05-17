"use client";
import { useState, useMemo } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { useClinical } from "@/contexts/ClinicalContext";
import { useToast } from "@/components/ui/Toast";
import { type ClinicalTerm } from "@/lib/clinical-data";
import {
  Languages, Plus, Trash2, Star, Search, Copy, ChevronDown, ChevronUp, Printer,
} from "lucide-react";
import { cn } from "@/lib/utils";

const LANG_LABELS = { english: "EN", french: "FR", arabic: "AR" };

const EMPTY: Partial<ClinicalTerm> = {
  english: "", french: "", arabic: "", definition: "",
  synonyms: [], relatedConcepts: [], clinicalNoteExample: "",
  reportExample: "", reportPhrasing: "", tags: [], dsmReference: "", isFavorite: false,
};

export default function DictionaryPage() {
  const { terminology, addTerm, updateTerm, deleteTerm, toggleFavoriteTerm } = useClinical();
  const { toast } = useToast();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Partial<ClinicalTerm>>({ ...EMPTY });
  const [editId, setEditId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterFav, setFilterFav] = useState(false);
  const [lang, setLang] = useState<"english" | "french" | "arabic">("english");

  const filtered = useMemo(() => {
    return terminology.filter((t) => {
      const q = search.toLowerCase();
      const matchSearch = !q ||
        t.english.toLowerCase().includes(q) || t.french.toLowerCase().includes(q) ||
        t.arabic.toLowerCase().includes(q) || t.definition.toLowerCase().includes(q) ||
        t.tags.some((tag) => tag.toLowerCase().includes(q));
      const matchFav = !filterFav || t.isFavorite;
      return matchSearch && matchFav;
    });
  }, [terminology, search, filterFav]);

  function set(field: keyof ClinicalTerm, val: unknown) {
    setForm((f) => ({ ...f, [field]: val }));
  }

  function handleSubmit() {
    if (!form.english?.trim()) { toast("Enter the English term", "error"); return; }
    if (editId) {
      updateTerm(editId, form);
      toast("Term updated", "success");
    } else {
      addTerm(form);
      toast("Term added to dictionary", "success");
    }
    setForm({ ...EMPTY });
    setEditId(null);
    setShowForm(false);
  }

  function startEdit(t: ClinicalTerm) {
    setForm({ ...t });
    setEditId(t.id);
    setShowForm(true);
    setExpandedId(null);
  }

  function copyText(text: string, label: string) {
    navigator.clipboard.writeText(text).then(() => toast(`${label} copied`, "success"));
  }

  const displayTerm = (t: ClinicalTerm) => {
    if (lang === "french" && t.french) return t.french;
    if (lang === "arabic" && t.arabic) return t.arabic;
    return t.english;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        title="Clinical Terminology Dictionary"
        subtitle={`${terminology.length} term${terminology.length !== 1 ? "s" : ""} · EN / FR / AR · clinical phrases`}
        actions={
          <div className="flex gap-2">
            <button onClick={() => window.print()} className="no-print flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-xl border"
              style={{ borderColor: "var(--psych-border)", color: "var(--psych-muted)" }}>
              <Printer size={14} /> Print
            </button>
            <button onClick={() => { setForm({ ...EMPTY }); setEditId(null); setShowForm(true); }}
              className="flex items-center gap-1.5 text-sm px-4 py-1.5 rounded-xl text-white font-medium"
              style={{ background: "linear-gradient(135deg, var(--psych-primary), var(--psych-accent))" }}>
              <Plus size={14} /> Add Term
            </button>
          </div>
        }
      />

      {/* Form */}
      {showForm && (
        <div className="rounded-2xl border p-5 space-y-4" style={{ backgroundColor: "var(--psych-card)", borderColor: "var(--psych-border)" }}>
          <h3 className="font-semibold" style={{ color: "var(--psych-text)" }}>{editId ? "Edit Term" : "New Term"}</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {(["english", "french", "arabic"] as const).map((l) => (
              <div key={l}>
                <label className="block text-xs font-medium mb-1 capitalize" style={{ color: "var(--psych-muted)" }}>{l}{l === "english" ? " *" : ""}</label>
                <input className="w-full rounded-xl px-3 py-2 text-sm border"
                  style={{ backgroundColor: "var(--psych-bg)", borderColor: "var(--psych-border)", color: "var(--psych-text)" }}
                  placeholder={l === "arabic" ? "اكتب هنا" : `Term in ${l}…`}
                  dir={l === "arabic" ? "rtl" : "ltr"}
                  value={(form as Record<string, string>)[l] || ""}
                  onChange={(e) => set(l, e.target.value)} />
              </div>
            ))}
          </div>

          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "var(--psych-muted)" }}>Definition</label>
            <textarea rows={3} className="w-full rounded-xl px-3 py-2 text-sm border resize-none"
              style={{ backgroundColor: "var(--psych-bg)", borderColor: "var(--psych-border)", color: "var(--psych-text)" }}
              value={form.definition || ""} onChange={(e) => set("definition", e.target.value)} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "var(--psych-muted)" }}>Clinical note example</label>
              <textarea rows={2} placeholder="How to use in session notes…"
                className="w-full rounded-xl px-3 py-2 text-sm border resize-none"
                style={{ backgroundColor: "var(--psych-bg)", borderColor: "var(--psych-border)", color: "var(--psych-text)" }}
                value={form.clinicalNoteExample || ""} onChange={(e) => set("clinicalNoteExample", e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "var(--psych-muted)" }}>Report phrasing</label>
              <textarea rows={2} placeholder="How to phrase in formal reports…"
                className="w-full rounded-xl px-3 py-2 text-sm border resize-none"
                style={{ backgroundColor: "var(--psych-bg)", borderColor: "var(--psych-border)", color: "var(--psych-text)" }}
                value={form.reportPhrasing || ""} onChange={(e) => set("reportPhrasing", e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "var(--psych-muted)" }}>DSM-5 / ICD-11 reference</label>
              <input className="w-full rounded-xl px-3 py-2 text-sm border"
                style={{ backgroundColor: "var(--psych-bg)", borderColor: "var(--psych-border)", color: "var(--psych-text)" }}
                placeholder="e.g. DSM-5 300.02"
                value={form.dsmReference || ""} onChange={(e) => set("dsmReference", e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "var(--psych-muted)" }}>Tags (comma separated)</label>
              <input className="w-full rounded-xl px-3 py-2 text-sm border"
                style={{ backgroundColor: "var(--psych-bg)", borderColor: "var(--psych-border)", color: "var(--psych-text)" }}
                placeholder="e.g. anxiety, CBT, assessment"
                value={(form.tags || []).join(", ")}
                onChange={(e) => set("tags", e.target.value.split(",").map((t) => t.trim()).filter(Boolean))} />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button onClick={() => { setShowForm(false); setEditId(null); setForm({ ...EMPTY }); }}
              className="px-4 py-1.5 rounded-xl text-sm border"
              style={{ borderColor: "var(--psych-border)", color: "var(--psych-muted)" }}>Cancel</button>
            <button onClick={handleSubmit}
              className="px-4 py-1.5 rounded-xl text-sm text-white font-medium"
              style={{ background: "linear-gradient(135deg, var(--psych-primary), var(--psych-accent))" }}>
              {editId ? "Update" : "Add Term"}
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="no-print flex flex-wrap gap-2 items-center">
        <div className="flex items-center gap-2 flex-1 min-w-[200px] rounded-xl px-3 py-2 border"
          style={{ backgroundColor: "var(--psych-card)", borderColor: "var(--psych-border)" }}>
          <Search size={14} style={{ color: "var(--psych-muted)" }} />
          <input placeholder="Search terms…" className="bg-transparent flex-1 outline-none text-sm"
            style={{ color: "var(--psych-text)" }} value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex rounded-xl border overflow-hidden" style={{ borderColor: "var(--psych-border)" }}>
          {(["english", "french", "arabic"] as const).map((l) => (
            <button key={l} onClick={() => setLang(l)}
              className="px-3 py-2 text-xs font-medium transition-all"
              style={lang === l
                ? { backgroundColor: "var(--psych-primary)", color: "white" }
                : { backgroundColor: "var(--psych-card)", color: "var(--psych-muted)" }}>
              {LANG_LABELS[l]}
            </button>
          ))}
        </div>
        <button onClick={() => setFilterFav(!filterFav)}
          className={cn("flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl border")}
          style={filterFav
            ? { backgroundColor: "#fef3c7", borderColor: "#fbbf24", color: "#92400e" }
            : { backgroundColor: "var(--psych-card)", borderColor: "var(--psych-border)", color: "var(--psych-muted)" }}>
          <Star size={12} fill={filterFav ? "#f59e0b" : "none"} stroke={filterFav ? "#f59e0b" : "currentColor"} />
          Favorites
        </button>
      </div>

      {/* Terms */}
      {filtered.length === 0 ? (
        <div className="text-center py-16" style={{ color: "var(--psych-muted)" }}>
          <Languages size={32} className="mx-auto mb-3 opacity-40" />
          <p className="font-medium">No terms found</p>
          <p className="text-sm mt-1 opacity-70">Build your personal clinical vocabulary</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((t) => {
            const isExpanded = expandedId === t.id;
            const primaryTerm = displayTerm(t);
            return (
              <div key={t.id} className="rounded-2xl border overflow-hidden"
                style={{ backgroundColor: "var(--psych-card)", borderColor: "var(--psych-border)" }}>
                <div className="flex items-start gap-3 p-4 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : t.id)}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-semibold text-sm" style={{ color: "var(--psych-text)" }}
                        dir={lang === "arabic" ? "rtl" : "ltr"}>{primaryTerm}</span>
                      {lang !== "english" && t.english && (
                        <span className="text-xs" style={{ color: "var(--psych-muted)" }}>({t.english})</span>
                      )}
                      {t.dsmReference && (
                        <span className="text-xs px-2 py-0.5 rounded-full font-mono border"
                          style={{ borderColor: "var(--psych-border)", color: "var(--psych-muted)" }}>{t.dsmReference}</span>
                      )}
                      {t.isFavorite && <Star size={12} fill="#f59e0b" stroke="#f59e0b" />}
                    </div>
                    {t.definition && <p className="text-sm line-clamp-2" style={{ color: "var(--psych-muted)" }}>{t.definition}</p>}
                    {t.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {t.tags.map((tag) => (
                          <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded-full border"
                            style={{ borderColor: "var(--psych-border)", color: "var(--psych-muted)" }}>{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button onClick={(e) => { e.stopPropagation(); toggleFavoriteTerm(t.id); }}
                      className="p-1.5 rounded-lg"
                      style={{ color: t.isFavorite ? "#f59e0b" : "var(--psych-muted)" }}>
                      <Star size={13} fill={t.isFavorite ? "#f59e0b" : "none"} />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); startEdit(t); }}
                      className="text-xs p-1.5 rounded-lg" style={{ color: "var(--psych-muted)" }}>Edit</button>
                    <button onClick={(e) => { e.stopPropagation(); deleteTerm(t.id); toast("Term deleted", "success"); }}
                      className="p-1.5 rounded-lg" style={{ color: "var(--psych-muted)" }}><Trash2 size={13} /></button>
                    {isExpanded ? <ChevronUp size={14} style={{ color: "var(--psych-muted)" }} /> : <ChevronDown size={14} style={{ color: "var(--psych-muted)" }} />}
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t px-4 pb-4 pt-3 space-y-3" style={{ borderColor: "var(--psych-border)" }}>
                    {/* All 3 languages */}
                    <div className="grid grid-cols-3 gap-3">
                      {([["english", "English"], ["french", "French"], ["arabic", "Arabic (AR)"]] as const).map(([l, label]) => {
                        const val = (t as Record<string, string>)[l];
                        return val ? (
                          <div key={l}>
                            <p className="text-[10px] font-semibold uppercase tracking-wider mb-0.5" style={{ color: "var(--psych-muted)" }}>{label}</p>
                            <div className="flex items-center gap-1">
                              <p className="text-sm font-medium" style={{ color: "var(--psych-text)" }} dir={l === "arabic" ? "rtl" : "ltr"}>{val}</p>
                              <button onClick={() => copyText(val, label)} className="p-0.5 opacity-60 hover:opacity-100">
                                <Copy size={11} style={{ color: "var(--psych-muted)" }} />
                              </button>
                            </div>
                          </div>
                        ) : null;
                      })}
                    </div>

                    {t.definition && (
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wider mb-0.5" style={{ color: "var(--psych-muted)" }}>Definition</p>
                        <p className="text-sm" style={{ color: "var(--psych-text)" }}>{t.definition}</p>
                      </div>
                    )}

                    {t.clinicalNoteExample && (
                      <div>
                        <div className="flex items-center justify-between mb-0.5">
                          <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--psych-muted)" }}>Clinical note example</p>
                          <button onClick={() => copyText(t.clinicalNoteExample!, "Clinical note example")}
                            className="flex items-center gap-0.5 text-[10px]" style={{ color: "var(--psych-muted)" }}>
                            <Copy size={10} /> Copy
                          </button>
                        </div>
                        <p className="text-sm italic rounded-xl px-3 py-2"
                          style={{ backgroundColor: "var(--psych-bg)", color: "var(--psych-text)" }}>
                          &ldquo;{t.clinicalNoteExample}&rdquo;
                        </p>
                      </div>
                    )}

                    {t.reportPhrasing && (
                      <div>
                        <div className="flex items-center justify-between mb-0.5">
                          <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--psych-muted)" }}>Report phrasing</p>
                          <button onClick={() => copyText(t.reportPhrasing!, "Report phrasing")}
                            className="flex items-center gap-0.5 text-[10px]" style={{ color: "var(--psych-muted)" }}>
                            <Copy size={10} /> Copy
                          </button>
                        </div>
                        <p className="text-sm italic rounded-xl px-3 py-2"
                          style={{ backgroundColor: "var(--psych-bg)", color: "var(--psych-text)" }}>
                          &ldquo;{t.reportPhrasing}&rdquo;
                        </p>
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
