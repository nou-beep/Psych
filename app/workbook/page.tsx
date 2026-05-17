"use client";
import { useState, useMemo } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { useClinical } from "@/contexts/ClinicalContext";
import { useApp } from "@/contexts/AppContext";
import { useToast } from "@/components/ui/Toast";
import { generateWorkbookContent, type WorkbookSheet } from "@/lib/clinical-data";
import {
  BookMarked, Plus, Trash2, Star, Printer, Search, Edit3,
} from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  "Anxiety", "Depression", "DPDR Grounding", "Emotional Regulation",
  "Sleep Hygiene", "Cognitive Distortions", "Weekly Mood Tracker", "Custom",
] as const;
type Category = typeof CATEGORIES[number];

const FORMATS = ["Exercise Worksheet", "Psychoeducation Sheet", "Tracking Log", "Thought Record", "Homework Sheet"] as const;
const AGE_GROUPS = ["child", "teen", "adult", "elderly"] as const;
const LANGUAGES = ["en", "fr", "ar"] as const;
const LANG_LABELS: Record<string, string> = { en: "English", fr: "Français", ar: "العربية" };
const DIFFICULTIES = ["beginner", "intermediate", "advanced"] as const;

const EMPTY: Partial<WorkbookSheet> = {
  title: "New Worksheet", category: "Anxiety", format: "Exercise Worksheet",
  language: "en", ageGroup: "adult", difficulty: "intermediate",
  caseId: "", caseCode: "", therapistNote: "", isFavorite: false, isPrinted: false,
  content: { subtitle: "", introduction: "", instructions: "", exerciseBody: "", reflections: [], practiceSection: "", footerNote: "" },
};

export default function WorkbookPage() {
  const { workbooks, addWorkbook, updateWorkbook, deleteWorkbook, toggleFavoriteWorkbook } = useClinical();
  const { cases } = useApp();
  const { toast } = useToast();

  const [step, setStep] = useState<"list" | "configure" | "edit">("list");
  const [form, setForm] = useState<Partial<WorkbookSheet>>({ ...EMPTY });
  const [editId, setEditId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("");
  const [filterFav, setFilterFav] = useState(false);

  const activeCases = cases.filter((c) => !c.isArchived);

  const filtered = useMemo(() => {
    return workbooks.filter((w) => {
      const q = search.toLowerCase();
      const matchSearch = !q || w.title.toLowerCase().includes(q) || w.category.toLowerCase().includes(q);
      const matchCat = !filterCat || w.category === filterCat;
      const matchFav = !filterFav || w.isFavorite;
      return matchSearch && matchCat && matchFav;
    });
  }, [workbooks, search, filterCat, filterFav]);

  function set(field: keyof WorkbookSheet, val: unknown) {
    setForm((f) => ({ ...f, [field]: val }));
  }

  function setContent(field: string, val: string | string[]) {
    setForm((f) => ({ ...f, content: { ...(f.content || {}), [field]: val } as WorkbookSheet["content"] }));
  }

  function handleGenerate() {
    const generated = generateWorkbookContent(
      form.category as Category || "Anxiety",
      form.format || "Exercise Worksheet",
      form.ageGroup || "adult",
    );
    const linkedCase = activeCases.find((c) => c.id === form.caseId);
    setForm((f) => ({
      ...f,
      title: form.title || `${form.category} — ${form.format}`,
      caseCode: linkedCase?.code || "",
      content: generated,
    }));
    setStep("edit");
  }

  function handleSave() {
    if (!form.title?.trim()) { toast("Add a title", "error"); return; }
    if (editId) {
      updateWorkbook(editId, form);
      toast("Worksheet updated", "success");
    } else {
      addWorkbook(form);
      toast("Worksheet saved to library", "success");
    }
    setForm({ ...EMPTY });
    setEditId(null);
    setStep("list");
  }

  function startEdit(w: WorkbookSheet) {
    setForm({ ...w });
    setEditId(w.id);
    setStep("edit");
  }

  function handleDelete(id: string) {
    deleteWorkbook(id);
    if (editId === id) { setEditId(null); setStep("list"); }
    toast("Worksheet deleted", "success");
  }

  function printWorkbook(w: WorkbookSheet) {
    updateWorkbook(w.id, { isPrinted: true });
    window.print();
  }

  const categoryColors: Record<string, string> = {
    "Anxiety": "#8b5cf6", "Depression": "#3b82f6", "DPDR Grounding": "#06b6d4",
    "Emotional Regulation": "#10b981", "Sleep Hygiene": "#f59e0b",
    "Cognitive Distortions": "#ef4444", "Weekly Mood Tracker": "var(--psych-primary)", "Custom": "#6b7280",
  };

  if (step === "configure") {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <PageHeader
          title="Configure Worksheet"
          subtitle="Choose options to generate your worksheet"
          actions={
            <button onClick={() => setStep("list")} className="text-sm px-3 py-1.5 rounded-xl border"
              style={{ borderColor: "var(--psych-border)", color: "var(--psych-muted)" }}>← Back</button>
          }
        />

        <div className="rounded-2xl border p-6 space-y-5" style={{ backgroundColor: "var(--psych-card)", borderColor: "var(--psych-border)" }}>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "var(--psych-text)" }}>Worksheet title</label>
            <input className="w-full rounded-xl px-3 py-2 text-sm border"
              style={{ backgroundColor: "var(--psych-bg)", borderColor: "var(--psych-border)", color: "var(--psych-text)" }}
              value={form.title || ""} onChange={(e) => set("title", e.target.value)} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "var(--psych-text)" }}>Topic / Category</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {CATEGORIES.map((cat) => (
                <button key={cat} onClick={() => set("category", cat)}
                  className={cn("px-3 py-2 rounded-xl text-sm border text-left transition-all")}
                  style={form.category === cat
                    ? { backgroundColor: categoryColors[cat] + "20", borderColor: categoryColors[cat], color: categoryColors[cat] }
                    : { backgroundColor: "var(--psych-bg)", borderColor: "var(--psych-border)", color: "var(--psych-muted)" }}>
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--psych-text)" }}>Format</label>
              <div className="space-y-1">
                {FORMATS.map((f) => (
                  <button key={f} onClick={() => set("format", f)}
                    className={cn("w-full px-3 py-2 rounded-xl text-sm border text-left")}
                    style={form.format === f
                      ? { backgroundColor: "var(--psych-primary-light)", borderColor: "var(--psych-primary)", color: "var(--psych-primary)" }
                      : { backgroundColor: "var(--psych-bg)", borderColor: "var(--psych-border)", color: "var(--psych-muted)" }}>
                    {f}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--psych-text)" }}>Age group</label>
                <div className="flex flex-wrap gap-2">
                  {AGE_GROUPS.map((a) => (
                    <button key={a} onClick={() => set("ageGroup", a)}
                      className={cn("px-3 py-1.5 rounded-xl text-sm border capitalize")}
                      style={form.ageGroup === a
                        ? { backgroundColor: "var(--psych-primary)", color: "white", borderColor: "var(--psych-primary)" }
                        : { backgroundColor: "var(--psych-bg)", borderColor: "var(--psych-border)", color: "var(--psych-muted)" }}>
                      {a}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--psych-text)" }}>Language</label>
                <div className="flex flex-wrap gap-2">
                  {LANGUAGES.map((l) => (
                    <button key={l} onClick={() => set("language", l)}
                      className={cn("px-3 py-1.5 rounded-xl text-sm border")}
                      style={form.language === l
                        ? { backgroundColor: "var(--psych-primary)", color: "white", borderColor: "var(--psych-primary)" }
                        : { backgroundColor: "var(--psych-bg)", borderColor: "var(--psych-border)", color: "var(--psych-muted)" }}>
                      {LANG_LABELS[l]}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--psych-text)" }}>Difficulty</label>
                <div className="flex flex-wrap gap-2">
                  {DIFFICULTIES.map((d) => (
                    <button key={d} onClick={() => set("difficulty", d)}
                      className={cn("px-3 py-1.5 rounded-xl text-sm border capitalize")}
                      style={form.difficulty === d
                        ? { backgroundColor: "var(--psych-primary)", color: "white", borderColor: "var(--psych-primary)" }
                        : { backgroundColor: "var(--psych-bg)", borderColor: "var(--psych-border)", color: "var(--psych-muted)" }}>
                      {d}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--psych-text)" }}>Link to case (optional)</label>
                <select className="w-full rounded-xl px-3 py-2 text-sm border"
                  style={{ backgroundColor: "var(--psych-bg)", borderColor: "var(--psych-border)", color: "var(--psych-text)" }}
                  value={form.caseId || ""} onChange={(e) => set("caseId", e.target.value)}>
                  <option value="">— No case —</option>
                  {activeCases.map((c) => <option key={c.id} value={c.id}>{c.code} — {c.label}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button onClick={() => setStep("list")} className="px-4 py-1.5 rounded-xl text-sm border"
              style={{ borderColor: "var(--psych-border)", color: "var(--psych-muted)" }}>Cancel</button>
            <button onClick={handleGenerate}
              className="px-5 py-2 rounded-xl text-sm text-white font-medium"
              style={{ background: "linear-gradient(135deg, var(--psych-primary), var(--psych-accent))" }}>
              Generate Worksheet →
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === "edit") {
    const content = form.content || { subtitle: "", introduction: "", instructions: "", exerciseBody: "", reflections: [], practiceSection: "", footerNote: "" };
    const linkedCase = activeCases.find((c) => c.id === form.caseId);
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="no-print">
          <PageHeader
            title={form.title || "Edit Worksheet"}
            subtitle={`${form.category} · ${form.format} · ${form.ageGroup}`}
            actions={
              <div className="flex gap-2">
                <button onClick={() => setStep("list")} className="text-sm px-3 py-1.5 rounded-xl border"
                  style={{ borderColor: "var(--psych-border)", color: "var(--psych-muted)" }}>← Back</button>
                <button onClick={() => window.print()} className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-xl border"
                  style={{ borderColor: "var(--psych-border)", color: "var(--psych-muted)" }}>
                  <Printer size={14} /> Print
                </button>
                <button onClick={handleSave}
                  className="flex items-center gap-1.5 text-sm px-4 py-1.5 rounded-xl text-white font-medium"
                  style={{ background: "linear-gradient(135deg, var(--psych-primary), var(--psych-accent))" }}>
                  Save to Library
                </button>
              </div>
            }
          />
        </div>

        {/* Printable worksheet */}
        <div className="rounded-2xl border p-8 space-y-6 print-only-show"
          style={{ backgroundColor: "var(--psych-card)", borderColor: "var(--psych-border)" }}
          dir={form.language === "ar" ? "rtl" : "ltr"}>
          <div className="text-center border-b pb-4" style={{ borderColor: "var(--psych-border)" }}>
            <h1 className="text-2xl font-bold" style={{ color: "var(--psych-text)" }}>{form.title}</h1>
            {content.subtitle && <p className="text-base mt-1" style={{ color: "var(--psych-muted)" }}>{content.subtitle}</p>}
            <div className="flex justify-center gap-4 mt-3 text-xs" style={{ color: "var(--psych-muted)" }}>
              {linkedCase && <span>Case: {linkedCase.code}</span>}
              <span>Date: _______________</span>
            </div>
          </div>

          {content.introduction && (
            <div>
              <h3 className="text-sm font-semibold mb-2" style={{ color: "var(--psych-text)" }}>Introduction</h3>
              <textarea className="w-full text-sm border rounded-xl px-3 py-2 resize-none"
                style={{ backgroundColor: "var(--psych-bg)", borderColor: "var(--psych-border)", color: "var(--psych-text)" }}
                rows={3} value={content.introduction}
                onChange={(e) => setContent("introduction", e.target.value)} />
            </div>
          )}

          {content.instructions && (
            <div>
              <h3 className="text-sm font-semibold mb-2" style={{ color: "var(--psych-text)" }}>Instructions</h3>
              <textarea className="w-full text-sm border rounded-xl px-3 py-2 resize-none"
                style={{ backgroundColor: "var(--psych-bg)", borderColor: "var(--psych-border)", color: "var(--psych-text)" }}
                rows={2} value={content.instructions}
                onChange={(e) => setContent("instructions", e.target.value)} />
            </div>
          )}

          {content.exerciseBody && (
            <div>
              <h3 className="text-sm font-semibold mb-2" style={{ color: "var(--psych-text)" }}>Exercise</h3>
              <textarea className="w-full text-sm border rounded-xl px-3 py-2 resize-none"
                style={{ backgroundColor: "var(--psych-bg)", borderColor: "var(--psych-border)", color: "var(--psych-text)" }}
                rows={6} value={content.exerciseBody}
                onChange={(e) => setContent("exerciseBody", e.target.value)} />
            </div>
          )}

          {content.reflections && content.reflections.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-2" style={{ color: "var(--psych-text)" }}>Reflection questions</h3>
              <div className="space-y-3">
                {content.reflections.map((q, i) => (
                  <div key={i}>
                    <p className="text-sm mb-1" style={{ color: "var(--psych-text)" }}>{i + 1}. {q}</p>
                    <div className="border-b" style={{ borderColor: "var(--psych-border)" }} />
                    <div className="h-8" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {content.practiceSection && (
            <div>
              <h3 className="text-sm font-semibold mb-2" style={{ color: "var(--psych-text)" }}>Practice / Home exercise</h3>
              <textarea className="w-full text-sm border rounded-xl px-3 py-2 resize-none"
                style={{ backgroundColor: "var(--psych-bg)", borderColor: "var(--psych-border)", color: "var(--psych-text)" }}
                rows={3} value={content.practiceSection}
                onChange={(e) => setContent("practiceSection", e.target.value)} />
            </div>
          )}

          {content.footerNote && (
            <div className="border-t pt-4 text-center" style={{ borderColor: "var(--psych-border)" }}>
              <p className="text-xs" style={{ color: "var(--psych-muted)" }}>{content.footerNote}</p>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "var(--psych-muted)" }}>Clinician note (not printed)</label>
            <textarea className="w-full text-sm border rounded-xl px-3 py-2 resize-none no-print"
              style={{ backgroundColor: "var(--psych-bg)", borderColor: "var(--psych-border)", color: "var(--psych-text)" }}
              rows={2} placeholder="Private note for yourself…"
              value={form.therapistNote || ""}
              onChange={(e) => set("therapistNote", e.target.value)} />
          </div>
        </div>
      </div>
    );
  }

  // List view
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        title="Workbook Sheet Generator"
        subtitle={`${workbooks.length} worksheet${workbooks.length !== 1 ? "s" : ""} in library`}
        actions={
          <button onClick={() => { setForm({ ...EMPTY }); setEditId(null); setStep("configure"); }}
            className="flex items-center gap-1.5 text-sm px-4 py-1.5 rounded-xl text-white font-medium"
            style={{ background: "linear-gradient(135deg, var(--psych-primary), var(--psych-accent))" }}>
            <Plus size={14} /> New Worksheet
          </button>
        }
      />

      {/* Category pills */}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => setFilterCat("")}
          className={cn("text-xs px-3 py-1 rounded-full border")}
          style={!filterCat
            ? { backgroundColor: "var(--psych-primary)", color: "white", borderColor: "var(--psych-primary)" }
            : { backgroundColor: "var(--psych-card)", color: "var(--psych-muted)", borderColor: "var(--psych-border)" }}>
          All
        </button>
        {CATEGORIES.filter((c) => c !== "Custom").map((cat) => (
          <button key={cat} onClick={() => setFilterCat(filterCat === cat ? "" : cat)}
            className={cn("text-xs px-3 py-1 rounded-full border")}
            style={filterCat === cat
              ? { backgroundColor: categoryColors[cat], color: "white", borderColor: categoryColors[cat] }
              : { backgroundColor: "var(--psych-card)", color: "var(--psych-muted)", borderColor: "var(--psych-border)" }}>
            {cat}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-[200px] rounded-xl px-3 py-2 border"
          style={{ backgroundColor: "var(--psych-card)", borderColor: "var(--psych-border)" }}>
          <Search size={14} style={{ color: "var(--psych-muted)" }} />
          <input placeholder="Search worksheets…" className="bg-transparent flex-1 outline-none text-sm"
            style={{ color: "var(--psych-text)" }} value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <button onClick={() => setFilterFav(!filterFav)}
          className={cn("flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl border")}
          style={filterFav
            ? { backgroundColor: "#fef3c7", borderColor: "#fbbf24", color: "#92400e" }
            : { backgroundColor: "var(--psych-card)", borderColor: "var(--psych-border)", color: "var(--psych-muted)" }}>
          <Star size={12} fill={filterFav ? "#f59e0b" : "none"} /> Favorites
        </button>
      </div>

      {/* Empty state */}
      {filtered.length === 0 ? (
        <div className="text-center py-16" style={{ color: "var(--psych-muted)" }}>
          <BookMarked size={32} className="mx-auto mb-3 opacity-40" />
          <p className="font-medium">No worksheets yet</p>
          <p className="text-sm mt-1 opacity-70">Generate your first clinical worksheet</p>
          <button onClick={() => { setForm({ ...EMPTY }); setStep("configure"); }}
            className="mt-4 text-sm px-4 py-2 rounded-xl text-white font-medium"
            style={{ background: "linear-gradient(135deg, var(--psych-primary), var(--psych-accent))" }}>
            <Plus size={14} className="inline mr-1" /> Create Worksheet
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((w) => {
            const linkedCase = cases.find((c) => c.id === w.caseId);
            const color = categoryColors[w.category] || "var(--psych-primary)";
            return (
              <div key={w.id} className="rounded-2xl border overflow-hidden"
                style={{ backgroundColor: "var(--psych-card)", borderColor: "var(--psych-border)" }}>
                <div className="h-1.5" style={{ backgroundColor: color }} />
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm" style={{ color: "var(--psych-text)" }}>{w.title}</p>
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        <span className="text-[10px] px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: color + "20", color }}>
                          {w.category}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full border"
                          style={{ borderColor: "var(--psych-border)", color: "var(--psych-muted)" }}>{w.format}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full border capitalize"
                          style={{ borderColor: "var(--psych-border)", color: "var(--psych-muted)" }}>{w.ageGroup}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full border"
                          style={{ borderColor: "var(--psych-border)", color: "var(--psych-muted)" }}>
                          {LANG_LABELS[w.language]}
                        </span>
                        {linkedCase && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-mono"
                            style={{ backgroundColor: "var(--psych-primary-light)", color: "var(--psych-primary)" }}>
                            {linkedCase.code}
                          </span>
                        )}
                        {w.isPrinted && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full"
                            style={{ backgroundColor: "#d1fae5", color: "#065f46" }}>Printed</span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <button onClick={() => toggleFavoriteWorkbook(w.id)}
                        style={{ color: w.isFavorite ? "#f59e0b" : "var(--psych-muted)" }}>
                        <Star size={13} fill={w.isFavorite ? "#f59e0b" : "none"} />
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-3">
                    <button onClick={() => startEdit(w)}
                      className="flex-1 flex items-center justify-center gap-1 text-xs py-1.5 rounded-lg border"
                      style={{ borderColor: "var(--psych-border)", color: "var(--psych-text)" }}>
                      <Edit3 size={11} /> Edit
                    </button>
                    <button onClick={() => printWorkbook(w)}
                      className="flex-1 flex items-center justify-center gap-1 text-xs py-1.5 rounded-lg border"
                      style={{ borderColor: "var(--psych-border)", color: "var(--psych-text)" }}>
                      <Printer size={11} /> Print
                    </button>
                    <button onClick={() => handleDelete(w.id)}
                      className="p-1.5 rounded-lg" style={{ color: "var(--psych-muted)" }}>
                      <Trash2 size={13} />
                    </button>
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
