"use client";
import { useState, useMemo, useCallback } from "react";
import dynamic from "next/dynamic";
import {
  GraduationCap, BarChart2, Users, ClipboardList, FlaskConical,
  PieChart, FileText, Table, BookOpen, BookMarked, Plus, Trash2,
  Edit3, ChevronDown, ChevronUp, Download, Printer, Copy, Check,
  AlertTriangle, TrendingUp, Target, Search, X, RefreshCw,
} from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { SectionCard } from "@/components/shared/SectionCard";
import { StatCard } from "@/components/shared/StatCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Modal, ModalBody, ModalFooter } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useThesis } from "@/contexts/ThesisContext";
import { useToast } from "@/components/ui/Toast";
import {
  statMean, statMedian, statStdDev, statMode,
  pearsonR, interpretR, interpretRClinical,
  type ThesisParticipant, type ThesisNote,
} from "@/lib/thesis-data";

// Dynamic chart import — avoids SSR issues with recharts
const Charts = dynamic(() => import("@/components/thesis/ChartsInner").then((m) => ({
  default: function ChartsBundle({ participants }: { participants: ThesisParticipant[] }) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SectionCard title="Depression Score Distribution" description="PHQ-9 style, N participants per range">
            <m.DepressionDistributionChart participants={participants} />
          </SectionCard>
          <SectionCard title="Anxiety Score Distribution" description="GAD-7 style, N participants per range">
            <m.AnxietyDistributionChart participants={participants} />
          </SectionCard>
          <SectionCard title="Depersonalization Score Distribution" description="DPDR-16 style, complete cases only">
            <m.DPDRDistributionChart participants={participants} />
          </SectionCard>
          <SectionCard title="Group Mean Comparison" description="Depression, Anxiety, DPDR means by group">
            <m.GroupComparisonChart participants={participants} />
            <m.ColorLegend />
          </SectionCard>
        </div>
        <SectionCard title="Depression × Anxiety Scatterplot" description="Each point = one participant, colour = group">
          <m.ScatterDepAnx participants={participants} />
          <m.ColorLegend />
        </SectionCard>
        <SectionCard title="Anxiety × Depersonalization Scatterplot" description="Complete cases only">
          <m.ScatterAnxDPDR participants={participants} />
          <m.ColorLegend />
        </SectionCard>
      </div>
    );
  },
})), { ssr: false, loading: () => <div className="py-12 text-center text-sm" style={{ color: "var(--psych-muted)" }}>Loading charts…</div> });

// ── Helpers ───────────────────────────────────────────────────

function fmt(n: number): string { return isNaN(n) ? "—" : n.toFixed(2); }

function nums(participants: ThesisParticipant[], key: keyof ThesisParticipant): number[] {
  return participants.map((p) => p[key]).filter((v): v is number => typeof v === "number");
}

function descStats(arr: number[]) {
  if (!arr.length) return null;
  return {
    n: arr.length,
    mean: statMean(arr),
    median: statMedian(arr),
    sd: statStdDev(arr),
    mode: statMode(arr),
    min: Math.min(...arr),
    max: Math.max(...arr),
    range: Math.max(...arr) - Math.min(...arr),
  };
}

const SEVERITY_DEP = [
  { label: "Minimal", min: 0, max: 4, color: "#6EE7B7" },
  { label: "Mild", min: 5, max: 9, color: "#FDE68A" },
  { label: "Moderate", min: 10, max: 14, color: "#FCA5A5" },
  { label: "Moderately Severe", min: 15, max: 19, color: "#F87171" },
  { label: "Severe", min: 20, max: 27, color: "#DC2626" },
];

const SEVERITY_ANX = [
  { label: "Minimal", min: 0, max: 4, color: "#6EE7B7" },
  { label: "Mild", min: 5, max: 9, color: "#FDE68A" },
  { label: "Moderate", min: 10, max: 14, color: "#FCA5A5" },
  { label: "Severe", min: 15, max: 21, color: "#DC2626" },
];

function getSeverityLabel(score: number | null, bands: typeof SEVERITY_DEP): string {
  if (score === null) return "—";
  return bands.find((b) => score >= b.min && score <= b.max)?.label ?? "—";
}

// ── Participant form default ───────────────────────────────────

function emptyP(): Partial<ThesisParticipant> {
  return {
    age: undefined,
    gender: "Female",
    group: "Control",
    depressionScore: null,
    anxietyScore: null,
    depersonalizationScore: null,
    derealizationScore: null,
    stressScore: null,
    emotionalRegulationScore: null,
    notes: "",
    hasMissingData: false,
  };
}

// ── APA number formatting ─────────────────────────────────────

function apa(n: number, dec = 2): string {
  return n.toFixed(dec).replace(/^0\./, ".");
}

// ── Main Page ─────────────────────────────────────────────────

export default function ThesisPage() {
  const {
    participants, design, notes, reportSections,
    addParticipant, updateParticipant, deleteParticipant,
    updateDesign, updateDesignArray,
    addNote, updateNote, deleteNote,
    updateReportSection,
    completeParticipants, missingDataCount, groupCounts,
  } = useThesis();
  const { toast } = useToast();

  // Participant modal
  const [pModalOpen, setPModalOpen] = useState(false);
  const [pEditing, setPEditing] = useState<ThesisParticipant | null>(null);
  const [pForm, setPForm] = useState<Partial<ThesisParticipant>>(emptyP());
  const [pDeleteId, setPDeleteId] = useState<string | null>(null);
  const [pSearch, setPSearch] = useState("");

  // Note modal
  const [nModalOpen, setNModalOpen] = useState(false);
  const [nEditing, setNEditing] = useState<ThesisNote | null>(null);
  const [nForm, setNForm] = useState<Partial<ThesisNote>>({ title: "", content: "", category: "other", tags: [], linkedVariables: [] });

  // Results generator
  const [resultStyle, setResultStyle] = useState("academic-en");
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  // Design array editing
  const [arrayEdit, setArrayEdit] = useState<Record<string, string>>({});

  // ── Stats computations ──────────────────────────────────────
  const stats = useMemo(() => {
    const cp = completeParticipants;
    return {
      dep: descStats(nums(cp, "depressionScore")),
      anx: descStats(nums(cp, "anxietyScore")),
      dpdr: descStats(nums(cp, "depersonalizationScore")),
      dr: descStats(nums(cp, "derealizationScore")),
      stress: descStats(nums(cp, "stressScore")),
    };
  }, [completeParticipants]);

  const correlations = useMemo(() => {
    const cp = completeParticipants;
    const dep = nums(cp, "depressionScore");
    const anx = nums(cp, "anxietyScore");
    const dpdr = nums(cp, "depersonalizationScore");
    const dr = nums(cp, "derealizationScore");
    const pairs = [
      ["Depression × Anxiety", dep, anx],
      ["Depression × Depersonalization", dep, dpdr],
      ["Anxiety × Depersonalization", anx, dpdr],
      ["Anxiety × Derealization", anx, dr],
      ["Depersonalization × Derealization", dpdr, dr],
    ] as [string, number[], number[]][];
    return pairs.map(([label, x, y]) => {
      const r = pearsonR(x, y);
      return { label, r, n: Math.min(x.length, y.length), interp: interpretR(r) };
    });
  }, [completeParticipants]);

  // ── Participant handlers ────────────────────────────────────

  function openAddP() {
    setPEditing(null);
    setPForm(emptyP());
    setPModalOpen(true);
  }

  function openEditP(p: ThesisParticipant) {
    setPEditing(p);
    setPForm({ ...p });
    setPModalOpen(true);
  }

  function saveP() {
    if (!pForm.age || !pForm.group) {
      toast("Please fill in age and group", "error");
      return;
    }
    const missing = pForm.depressionScore === null || pForm.anxietyScore === null || pForm.depersonalizationScore === null;
    const data = { ...pForm, hasMissingData: missing };
    if (pEditing) {
      updateParticipant(pEditing.id, data);
      toast("Participant updated", "success");
    } else {
      addParticipant(data);
      toast("Participant added", "success");
    }
    setPModalOpen(false);
  }

  // ── Note handlers ───────────────────────────────────────────

  function openAddN() {
    setNEditing(null);
    setNForm({ title: "", content: "", category: "other", tags: [], linkedVariables: [] });
    setNModalOpen(true);
  }

  function openEditN(n: ThesisNote) {
    setNEditing(n);
    setNForm({ ...n });
    setNModalOpen(true);
  }

  function saveN() {
    if (!nForm.title) { toast("Title required", "error"); return; }
    if (nEditing) {
      updateNote(nEditing.id, nForm);
      toast("Note updated", "success");
    } else {
      addNote(nForm);
      toast("Note added", "success");
    }
    setNModalOpen(false);
  }

  // ── Copy to clipboard ───────────────────────────────────────

  function copyText(text: string, key: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedSection(key);
      setTimeout(() => setCopiedSection(null), 2000);
      toast("Copied to clipboard", "success");
    });
  }

  // ── Results text generator ──────────────────────────────────

  const generatedResults = useMemo(() => {
    const n = completeParticipants.length;
    const gClinical = groupCounts["Clinical"] ?? 0;
    const gSubclinical = groupCounts["Subclinical"] ?? 0;
    const gControl = groupCounts["Control"] ?? 0;
    const dep = stats.dep;
    const anx = stats.anx;
    const dpdr = stats.dpdr;
    const corDepAnx = correlations.find((c) => c.label === "Depression × Anxiety");
    const corDepDp = correlations.find((c) => c.label === "Depression × Depersonalization");
    const corAnxDp = correlations.find((c) => c.label === "Anxiety × Depersonalization");

    const sampleText = `The final sample consisted of ${n} participants (complete cases), comprising ${gClinical} in the Clinical group, ${gSubclinical} in the Subclinical group, and ${gControl} in the Control group. One participant was excluded from DPDR analyses due to incomplete questionnaire data.`;

    const descText = dep && anx && dpdr ? `Descriptive statistics indicated the following: depression scores ranged from ${dep.min} to ${dep.max} (M = ${apa(dep.mean)}, SD = ${apa(dep.sd)}); anxiety scores ranged from ${anx.min} to ${anx.max} (M = ${apa(anx.mean)}, SD = ${apa(anx.sd)}); depersonalization scores ranged from ${dpdr.min} to ${dpdr.max} (M = ${apa(dpdr.mean)}, SD = ${apa(dpdr.sd)}).` : "Descriptive statistics could not be computed (insufficient data).";

    const corrText = corDepAnx && corDepDp && corAnxDp ? `Pearson correlation analyses revealed a ${corDepAnx.interp} association between depression and anxiety scores (r = ${apa(corDepAnx.r)}, n = ${corDepAnx.n}). ${interpretRClinical(corDepAnx.r)} A ${corDepDp.interp} association was observed between depression and depersonalization scores (r = ${apa(corDepDp.r)}, n = ${corDepDp.n}). ${interpretRClinical(corDepDp.r)} The association between anxiety and depersonalization scores was ${corAnxDp.interp} (r = ${apa(corAnxDp.r)}, n = ${corAnxDp.n}). ${interpretRClinical(corAnxDp.r)} These results should be interpreted with caution given the small sample size.` : "Correlation analyses could not be completed.";

    const interpText = `The observed correlations suggest that depersonalization symptoms may be meaningfully associated with both depressive and anxious symptomatology, which is consistent with prior theoretical accounts of the role of emotional dysregulation in dissociative experiences. However, the cross-sectional and correlational nature of this study precludes causal inference. Future longitudinal studies with larger samples are needed to further elucidate these relationships.`;

    return { sampleText, descText, corrText, interpText };
  }, [completeParticipants, groupCounts, stats, correlations]);

  // ── Filtered participants ───────────────────────────────────

  const filteredPs = useMemo(() =>
    participants.filter((p) =>
      !pSearch || p.code.toLowerCase().includes(pSearch.toLowerCase()) ||
      p.group.toLowerCase().includes(pSearch.toLowerCase()) ||
      p.gender.toLowerCase().includes(pSearch.toLowerCase())
    ),
    [participants, pSearch]
  );

  // ── Design helper ───────────────────────────────────────────

  function designArrayField(key: keyof typeof design, label: string) {
    const items = design[key] as string[];
    const editKey = String(key);
    return (
      <div>
        <Label>{label}</Label>
        <div className="space-y-1.5 mt-1">
          {items.map((item, i) => (
            <div key={i} className="flex gap-2">
              <Input
                value={item}
                onChange={(e) => {
                  const next = [...items];
                  next[i] = e.target.value;
                  updateDesignArray(key, next);
                }}
                className="text-sm"
              />
              <button
                onClick={() => updateDesignArray(key, items.filter((_, j) => j !== i))}
                className="p-1.5 rounded"
                style={{ color: "var(--psych-muted)" }}
              >
                <X size={13} />
              </button>
            </div>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => updateDesignArray(key, [...items, ""])}
          >
            <Plus size={12} />
            Add
          </Button>
        </div>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────

  const progressPct = Math.round(
    (completeParticipants.length / Math.max(participants.length, 1)) * 100
  );

  return (
    <div className="max-w-7xl mx-auto animate-fade-in">
      {/* Hero */}
      <div
        className="relative overflow-hidden rounded-3xl p-6 mb-6 border"
        style={{
          background: "linear-gradient(135deg, var(--psych-primary-light) 0%, #EDE9FE 50%, #FDF2F8 100%)",
          borderColor: "var(--psych-border)",
        }}
      >
        <div className="orb orb-primary opacity-20" style={{ top: -40, right: -40, width: 180, height: 180 }} />
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <GraduationCap size={20} style={{ color: "var(--psych-primary)" }} />
              <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--psych-primary)" }}>
                Thesis Studio
              </span>
            </div>
            <h1 className="text-xl font-bold leading-tight mb-1" style={{ color: "var(--psych-text)" }}>
              {design.title || "Your Thesis Title"}
            </h1>
            <p className="text-sm" style={{ color: "var(--psych-muted)" }}>
              {participants.length} participants · {completeParticipants.length} complete · {missingDataCount > 0 && `${missingDataCount} with missing data`}
            </p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={openAddP}>
              <Plus size={14} /> Add Participant
            </Button>
          </div>
        </div>
        <div className="mt-4">
          <div className="flex justify-between text-xs mb-1" style={{ color: "var(--psych-muted)" }}>
            <span>Data completeness</span>
            <span>{progressPct}%</span>
          </div>
          <ProgressBar value={progressPct} size="sm" />
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="dashboard">
        <TabsList className="mb-6 flex-wrap">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="design">Research Design</TabsTrigger>
          <TabsTrigger value="participants">Participants ({participants.length})</TabsTrigger>
          <TabsTrigger value="scoring">Questionnaires</TabsTrigger>
          <TabsTrigger value="statistics">Statistics</TabsTrigger>
          <TabsTrigger value="charts">Charts</TabsTrigger>
          <TabsTrigger value="results">Results Generator</TabsTrigger>
          <TabsTrigger value="apa">APA Tables</TabsTrigger>
          <TabsTrigger value="report">Report Builder</TabsTrigger>
          <TabsTrigger value="knowledge">Knowledge Base</TabsTrigger>
        </TabsList>

        {/* ══ DASHBOARD ══════════════════════════════════════════ */}
        <TabsContent value="dashboard">
          <div className="space-y-6">
            {/* Stat cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard label="Total Participants" value={participants.length} icon={<Users size={16} />} delay={0} />
              <StatCard label="Complete Cases" value={completeParticipants.length} icon={<Check size={16} />} color="#10B981" delay={50} />
              <StatCard label="Missing Data" value={missingDataCount} icon={<AlertTriangle size={16} />} color={missingDataCount > 0 ? "#EF4444" : undefined} delay={100} />
              <StatCard label="Knowledge Notes" value={notes.length} icon={<BookMarked size={16} />} color="#8B5CF6" delay={150} />
            </div>

            {/* Group breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(["Clinical", "Subclinical", "Control"] as const).map((g, i) => {
                const count = groupCounts[g] ?? 0;
                const pct = participants.length ? Math.round((count / participants.length) * 100) : 0;
                const colors = ["#F43F5E", "#A78BFA", "#34D399"];
                return (
                  <div key={g} className="rounded-2xl border p-4" style={{ backgroundColor: "var(--psych-card)", borderColor: "var(--psych-border)" }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold" style={{ color: "var(--psych-text)" }}>{g} Group</span>
                      <span className="text-lg font-bold" style={{ color: colors[i] }}>{count}</span>
                    </div>
                    <ProgressBar value={pct} size="xs" color={colors[i]} showLabel />
                  </div>
                );
              })}
            </div>

            {/* Research summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SectionCard title="Research Questions">
                <ul className="space-y-2">
                  {design.researchQuestions.slice(0, 3).map((q, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm" style={{ color: "var(--psych-text)" }}>
                      <span className="font-bold shrink-0" style={{ color: "var(--psych-primary)" }}>RQ{i + 1}</span>
                      {q}
                    </li>
                  ))}
                </ul>
              </SectionCard>
              <SectionCard title="Hypotheses">
                <ul className="space-y-2">
                  {design.hypotheses.slice(0, 3).map((h, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm" style={{ color: "var(--psych-text)" }}>
                      <span className="font-bold shrink-0" style={{ color: "var(--psych-primary)" }}>H{i + 1}</span>
                      {h}
                    </li>
                  ))}
                </ul>
              </SectionCard>
            </div>

            {/* Quick actions */}
            <SectionCard title="Quick Actions">
              <div className="flex flex-wrap gap-2">
                {[
                  { label: "Add Participant", icon: <Plus size={13} />, action: openAddP },
                  { label: "Add Knowledge Note", icon: <BookMarked size={13} />, action: openAddN },
                ].map(({ label, icon, action }) => (
                  <Button key={label} variant="secondary" size="sm" onClick={action}>
                    {icon}
                    {label}
                  </Button>
                ))}
                <Button variant="outline" size="sm" onClick={() => window.print()}>
                  <Printer size={13} />
                  Print Summary
                </Button>
              </div>
            </SectionCard>

            {/* Alerts */}
            {missingDataCount > 0 && (
              <div className="rounded-xl px-4 py-3 flex items-start gap-3 text-sm" style={{ backgroundColor: "#FEF9C3" }}>
                <AlertTriangle size={14} style={{ color: "#92400E", marginTop: 2, flexShrink: 0 }} />
                <p style={{ color: "#92400E" }}>
                  {missingDataCount} participant(s) have incomplete data and will be excluded from DPDR analyses.
                  Review their entries in the Participants tab.
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* ══ RESEARCH DESIGN ════════════════════════════════════ */}
        <TabsContent value="design">
          <div className="space-y-4 max-w-3xl">
            <SectionCard title="Thesis Title">
              <Input
                value={design.title}
                onChange={(e) => updateDesign({ title: e.target.value })}
                placeholder="Enter your thesis title…"
                className="text-sm"
              />
            </SectionCard>

            <SectionCard title="Research Problem">
              <Textarea
                value={design.researchProblem}
                onChange={(e) => updateDesign({ researchProblem: e.target.value })}
                className="min-h-[100px] text-sm"
                placeholder="Describe the research problem and its significance…"
              />
            </SectionCard>

            <SectionCard title="Research Questions">
              {designArrayField("researchQuestions", "Questions")}
            </SectionCard>

            <SectionCard title="Hypotheses">
              {designArrayField("hypotheses", "Hypotheses")}
            </SectionCard>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <SectionCard title="Independent Variables">
                {designArrayField("independentVariables", "Variables")}
              </SectionCard>
              <SectionCard title="Dependent Variables">
                {designArrayField("dependentVariables", "Variables")}
              </SectionCard>
              <SectionCard title="Control Variables">
                {designArrayField("controlVariables", "Variables")}
              </SectionCard>
            </div>

            <SectionCard title="Sample Description">
              <Textarea
                value={design.sampleDescription}
                onChange={(e) => updateDesign({ sampleDescription: e.target.value })}
                className="min-h-[80px] text-sm"
              />
            </SectionCard>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SectionCard title="Inclusion Criteria">
                <Textarea
                  value={design.inclusionCriteria}
                  onChange={(e) => updateDesign({ inclusionCriteria: e.target.value })}
                  className="min-h-[80px] text-sm"
                />
              </SectionCard>
              <SectionCard title="Exclusion Criteria">
                <Textarea
                  value={design.exclusionCriteria}
                  onChange={(e) => updateDesign({ exclusionCriteria: e.target.value })}
                  className="min-h-[80px] text-sm"
                />
              </SectionCard>
            </div>

            <SectionCard title="Methodology Notes">
              <Textarea
                value={design.methodology}
                onChange={(e) => updateDesign({ methodology: e.target.value })}
                className="min-h-[100px] text-sm"
              />
            </SectionCard>

            <SectionCard title="Ethical Considerations">
              <Textarea
                value={design.ethicalConsiderations}
                onChange={(e) => updateDesign({ ethicalConsiderations: e.target.value })}
                className="min-h-[80px] text-sm"
              />
            </SectionCard>

            <div className="flex justify-end">
              <Button size="sm" onClick={() => toast("Research design saved", "success")}>
                <Check size={13} /> Save Design
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* ══ PARTICIPANTS ═══════════════════════════════════════ */}
        <TabsContent value="participants">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="relative flex-1 max-w-xs">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--psych-muted)" }} />
                <Input placeholder="Search participants…" className="pl-8 text-sm" value={pSearch} onChange={(e) => setPSearch(e.target.value)} />
              </div>
              <Button size="sm" onClick={openAddP}>
                <Plus size={13} /> Add Participant
              </Button>
            </div>

            <div className="rounded-2xl border overflow-x-auto" style={{ borderColor: "var(--psych-border)" }}>
              <table className="w-full text-xs">
                <thead>
                  <tr style={{ backgroundColor: "var(--psych-bg)", borderBottom: "1px solid var(--psych-border)" }}>
                    {["ID", "Age", "Gender", "Group", "Dep", "Anx", "Dep'n", "Dr", "Notes", ""].map((h) => (
                      <th key={h} className="text-left px-3 py-2.5 font-semibold" style={{ color: "var(--psych-muted)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredPs.map((p, i) => (
                    <tr
                      key={p.id}
                      className="border-b transition-colors"
                      style={{
                        borderColor: "var(--psych-border)",
                        backgroundColor: p.hasMissingData ? "#FFFBEB" : (i % 2 === 0 ? "var(--psych-card)" : "var(--psych-bg)"),
                      }}
                    >
                      <td className="px-3 py-2 font-mono font-bold" style={{ color: "var(--psych-primary)" }}>{p.code}</td>
                      <td className="px-3 py-2" style={{ color: "var(--psych-text)" }}>{p.age}</td>
                      <td className="px-3 py-2" style={{ color: "var(--psych-text)" }}>{p.gender}</td>
                      <td className="px-3 py-2">
                        <span
                          className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold"
                          style={{
                            backgroundColor: p.group === "Clinical" ? "#FEE2E2" : p.group === "Subclinical" ? "#EDE9FE" : "#D1FAE5",
                            color: p.group === "Clinical" ? "#DC2626" : p.group === "Subclinical" ? "#7C3AED" : "#059669",
                          }}
                        >
                          {p.group}
                        </span>
                      </td>
                      <td className="px-3 py-2 font-mono" style={{ color: "var(--psych-text)" }}>{p.depressionScore ?? <span style={{ color: "var(--psych-muted)" }}>—</span>}</td>
                      <td className="px-3 py-2 font-mono" style={{ color: "var(--psych-text)" }}>{p.anxietyScore ?? <span style={{ color: "var(--psych-muted)" }}>—</span>}</td>
                      <td className="px-3 py-2 font-mono" style={{ color: "var(--psych-text)" }}>{p.depersonalizationScore ?? <span style={{ color: "var(--psych-muted)" }}>—</span>}</td>
                      <td className="px-3 py-2 font-mono" style={{ color: "var(--psych-text)" }}>{p.derealizationScore ?? <span style={{ color: "var(--psych-muted)" }}>—</span>}</td>
                      <td className="px-3 py-2 max-w-[120px] truncate" style={{ color: "var(--psych-muted)" }}>{p.notes}</td>
                      <td className="px-3 py-2">
                        <div className="flex gap-1">
                          <button onClick={() => openEditP(p)} className="p-1 rounded" style={{ color: "var(--psych-muted)" }}><Edit3 size={12} /></button>
                          <button onClick={() => setPDeleteId(p.id)} className="p-1 rounded" style={{ color: "var(--psych-muted)" }}><Trash2 size={12} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredPs.length === 0 && (
                <p className="text-sm text-center py-8" style={{ color: "var(--psych-muted)" }}>No participants found.</p>
              )}
            </div>

            <p className="text-xs" style={{ color: "var(--psych-muted)" }}>
              ✦ All participants are identified by anonymized codes only. {missingDataCount > 0 && `⚠ ${missingDataCount} participant(s) flagged for missing data (shown in yellow).`}
            </p>
          </div>
        </TabsContent>

        {/* ══ QUESTIONNAIRE SCORING ══════════════════════════════ */}
        <TabsContent value="scoring">
          <div className="space-y-4 max-w-3xl">
            <div
              className="rounded-2xl px-5 py-4 text-sm"
              style={{ backgroundColor: "var(--psych-primary-light)", color: "var(--psych-accent)" }}
            >
              ✦ The scoring module helps you understand the interpretation of each scale. Enter individual item responses to compute total scores.
            </div>

            {[
              {
                name: "PHQ-9 — Patient Health Questionnaire (Depression)",
                abbr: "PHQ-9",
                range: "0–27",
                items: 9,
                scoring: "Each item: 0 (Not at all) → 3 (Nearly every day)",
                bands: SEVERITY_DEP,
                color: "#F43F5E",
              },
              {
                name: "GAD-7 — Generalized Anxiety Disorder Scale",
                abbr: "GAD-7",
                range: "0–21",
                items: 7,
                scoring: "Each item: 0 (Not at all) → 3 (Nearly every day)",
                bands: SEVERITY_ANX,
                color: "#F59E0B",
              },
              {
                name: "DPDR-16 — Depersonalization/Derealization Scale",
                abbr: "DPDR-16",
                range: "0–48",
                items: 16,
                scoring: "Each item: 0–3, total score indicating frequency and intensity of DPDR symptoms",
                bands: [
                  { label: "Minimal", min: 0, max: 8, color: "#6EE7B7" },
                  { label: "Mild", min: 9, max: 16, color: "#FDE68A" },
                  { label: "Moderate", min: 17, max: 28, color: "#FCA5A5" },
                  { label: "Severe", min: 29, max: 48, color: "#DC2626" },
                ],
                color: "#8B5CF6",
              },
              {
                name: "PSS-10 — Perceived Stress Scale",
                abbr: "PSS-10",
                range: "0–40",
                items: 10,
                scoring: "Items 1, 2, 3, 6, 9, 10 direct scored; items 4, 5, 7, 8 reverse scored",
                bands: [
                  { label: "Low", min: 0, max: 13, color: "#6EE7B7" },
                  { label: "Moderate", min: 14, max: 26, color: "#FDE68A" },
                  { label: "High", min: 27, max: 40, color: "#DC2626" },
                ],
                color: "#06B6D4",
              },
            ].map((q) => (
              <SectionCard
                key={q.abbr}
                title={q.name}
                description={`${q.items} items · Range: ${q.range}`}
              >
                <div className="space-y-3">
                  <p className="text-xs" style={{ color: "var(--psych-muted)" }}><strong>Scoring:</strong> {q.scoring}</p>
                  <div className="flex flex-wrap gap-2">
                    {q.bands.map((b) => (
                      <span
                        key={b.label}
                        className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                        style={{ backgroundColor: b.color + "40", color: "var(--psych-text)" }}
                      >
                        {b.label}: {b.min}–{b.max}
                      </span>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <Button variant="outline" size="sm" onClick={() => window.print()}>
                      <Printer size={12} /> Print Scoring Sheet
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Download size={12} /> Export Scores
                    </Button>
                  </div>
                </div>
              </SectionCard>
            ))}

            <SectionCard title="Severity Classification — Current Sample" description="Based on complete cases">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--psych-border)" }}>
                      {["Participant", "Depression", "Severity", "Anxiety", "Severity", "DPDR", "Severity"].map((h) => (
                        <th key={h} className="text-left pb-2 pr-4 font-semibold" style={{ color: "var(--psych-muted)" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {completeParticipants.slice(0, 8).map((p) => (
                      <tr key={p.id} style={{ borderBottom: "1px solid var(--psych-border)" }}>
                        <td className="py-1.5 pr-4 font-mono font-bold" style={{ color: "var(--psych-primary)" }}>{p.code}</td>
                        <td className="py-1.5 pr-4 font-mono">{p.depressionScore}</td>
                        <td className="py-1.5 pr-4">{getSeverityLabel(p.depressionScore, SEVERITY_DEP)}</td>
                        <td className="py-1.5 pr-4 font-mono">{p.anxietyScore}</td>
                        <td className="py-1.5 pr-4">{getSeverityLabel(p.anxietyScore, SEVERITY_ANX)}</td>
                        <td className="py-1.5 pr-4 font-mono">{p.depersonalizationScore}</td>
                        <td className="py-1.5 pr-4" style={{ color: "var(--psych-muted)" }}>—</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </SectionCard>
          </div>
        </TabsContent>

        {/* ══ STATISTICS ═════════════════════════════════════════ */}
        <TabsContent value="statistics">
          <div className="space-y-6">
            {/* Descriptive */}
            <SectionCard title="Descriptive Statistics" description={`N = ${completeParticipants.length} complete cases`}>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--psych-border)" }}>
                      {["Scale", "N", "Mean", "Median", "SD", "Min", "Max", "Range"].map((h) => (
                        <th key={h} className="text-left pb-2 pr-4 font-semibold" style={{ color: "var(--psych-muted)" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ["Depression (PHQ-9)", stats.dep],
                      ["Anxiety (GAD-7)", stats.anx],
                      ["Depersonalization (DPDR)", stats.dpdr],
                      ["Derealization (DPDR)", stats.dr],
                      ["Stress (PSS)", stats.stress],
                    ].map(([label, s]) => (
                      <tr key={String(label)} style={{ borderBottom: "1px solid var(--psych-border)" }}>
                        <td className="py-2 pr-4 font-medium" style={{ color: "var(--psych-text)" }}>{String(label)}</td>
                        {s ? (
                          <>
                            <td className="py-2 pr-4 font-mono">{s.n}</td>
                            <td className="py-2 pr-4 font-mono">{fmt(s.mean)}</td>
                            <td className="py-2 pr-4 font-mono">{fmt(s.median)}</td>
                            <td className="py-2 pr-4 font-mono">{fmt(s.sd)}</td>
                            <td className="py-2 pr-4 font-mono">{s.min}</td>
                            <td className="py-2 pr-4 font-mono">{s.max}</td>
                            <td className="py-2 pr-4 font-mono">{s.range}</td>
                          </>
                        ) : (
                          <td colSpan={7} className="py-2 pr-4" style={{ color: "var(--psych-muted)" }}>No data</td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </SectionCard>

            {/* Correlations */}
            <SectionCard title="Pearson Correlation Matrix" description="Complete cases only · *p < .05 (note: not computed — verify with software)">
              <div className="space-y-3">
                {correlations.map(({ label, r, n, interp }) => (
                  <div key={label} className="rounded-xl border p-3" style={{ borderColor: "var(--psych-border)", backgroundColor: "var(--psych-bg)" }}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium" style={{ color: "var(--psych-text)" }}>{label}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs" style={{ color: "var(--psych-muted)" }}>n = {n}</span>
                        <span
                          className="font-mono text-sm font-bold"
                          style={{ color: Math.abs(r) >= 0.4 ? "var(--psych-primary)" : "var(--psych-muted)" }}
                        >
                          r = {apa(r)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <ProgressBar value={Math.abs(r) * 100} size="xs" color={Math.abs(r) >= 0.4 ? "var(--psych-primary)" : "#94A3B8"} />
                      <span className="text-[10px] shrink-0 capitalize" style={{ color: "var(--psych-muted)" }}>{interp}</span>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>

            {/* Placeholder analyses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { title: "t-Test (Independent Samples)", desc: "Clinical vs. Control group comparison", status: "Placeholder — compute with SPSS or R" },
                { title: "One-Way ANOVA", desc: "Depression across 3 groups", status: "Placeholder — verify assumptions first" },
                { title: "Multiple Regression", desc: "Predict DPDR from Depression + Anxiety", status: "Placeholder — planned for thesis" },
                { title: "Cronbach's Alpha", desc: "Internal consistency of each scale", status: "Requires item-level data — placeholder" },
              ].map((a) => (
                <div key={a.title} className="rounded-2xl border p-4" style={{ backgroundColor: "var(--psych-card)", borderColor: "var(--psych-border)" }}>
                  <p className="text-sm font-semibold mb-1" style={{ color: "var(--psych-text)" }}>{a.title}</p>
                  <p className="text-xs mb-2" style={{ color: "var(--psych-muted)" }}>{a.desc}</p>
                  <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ backgroundColor: "var(--psych-primary-light)", color: "var(--psych-accent)" }}>
                    {a.status}
                  </span>
                </div>
              ))}
            </div>

            <div className="rounded-xl px-4 py-3 text-xs" style={{ backgroundColor: "var(--psych-bg)", color: "var(--psych-muted)" }}>
              ✦ Descriptive statistics and Pearson correlations are calculated from your dataset in real time.
              For inferential tests (t-test, ANOVA, regression), verify results with SPSS, JASP, or R before including them in your thesis.
            </div>
          </div>
        </TabsContent>

        {/* ══ CHARTS ═════════════════════════════════════════════ */}
        <TabsContent value="charts">
          <Charts participants={completeParticipants} />
        </TabsContent>

        {/* ══ RESULTS GENERATOR ══════════════════════════════════ */}
        <TabsContent value="results">
          <div className="space-y-4 max-w-3xl">
            <div className="flex items-center gap-3">
              <Label>Writing Style</Label>
              <Select value={resultStyle} onChange={(e) => setResultStyle(e.target.value)} className="w-auto">
                <option value="academic-en">Academic English</option>
                <option value="academic-fr">Academic French (draft)</option>
                <option value="simple">Simple Explanation</option>
                <option value="apa">APA-Style Results</option>
              </Select>
            </div>

            <div
              className="rounded-2xl px-5 py-3 text-xs"
              style={{ backgroundColor: "var(--psych-primary-light)", color: "var(--psych-accent)" }}
            >
              ✦ All generated text uses cautious academic wording (suggests, may indicate, appears associated with).
              Always review, edit, and verify before including in your thesis.
            </div>

            {[
              {
                key: "sample",
                title: "1. Sample Description",
                text: generatedResults.sampleText,
              },
              {
                key: "descriptive",
                title: "2. Descriptive Statistics",
                text: generatedResults.descText,
              },
              {
                key: "correlations",
                title: "3. Correlation Results",
                text: generatedResults.corrText,
              },
              {
                key: "interpretation",
                title: "4. Interpretation & Discussion Notes",
                text: generatedResults.interpText,
              },
              {
                key: "limitations",
                title: "5. Limitations",
                text: `This study has several limitations that should be considered when interpreting the findings. First, the sample size (N = ${completeParticipants.length}) is relatively small, which may limit statistical power and the generalizability of results. Second, all measures are based on self-report, which may introduce response bias. Third, the cross-sectional design precludes causal inferences about the observed associations. Future studies should employ longitudinal designs with larger, clinically validated samples.`,
              },
            ].map(({ key, title, text }) => (
              <SectionCard
                key={key}
                title={title}
                action={
                  <button
                    onClick={() => copyText(text, key)}
                    className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-lg transition-colors"
                    style={{ backgroundColor: "var(--psych-primary-light)", color: "var(--psych-primary)" }}
                  >
                    {copiedSection === key ? <Check size={10} /> : <Copy size={10} />}
                    {copiedSection === key ? "Copied!" : "Copy"}
                  </button>
                }
              >
                <p className="text-sm leading-relaxed" style={{ color: "var(--psych-text)" }}>{text}</p>
                <Textarea
                  className="mt-3 text-xs min-h-[80px]"
                  defaultValue={text}
                  placeholder="Edit this section…"
                  onChange={(e) => updateReportSection(key, e.target.value)}
                />
              </SectionCard>
            ))}
          </div>
        </TabsContent>

        {/* ══ APA TABLES ═════════════════════════════════════════ */}
        <TabsContent value="apa">
          <div className="space-y-6">
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => window.print()}>
                <Printer size={13} /> Print All Tables
              </Button>
            </div>

            {/* Table 1 — Demographics */}
            <SectionCard title="Table 1" description="Participant Demographics by Group">
              <div className="overflow-x-auto">
                <p className="text-xs font-bold mb-2" style={{ color: "var(--psych-text)" }}>
                  Table 1<br />
                  <em>Participant Demographics by Group</em>
                </p>
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr style={{ borderTop: "2px solid var(--psych-text)", borderBottom: "1px solid var(--psych-text)" }}>
                      <th className="text-left py-1.5 pr-6 font-normal italic" style={{ color: "var(--psych-text)" }}>Variable</th>
                      <th className="text-center py-1.5 px-4 font-normal italic" style={{ color: "var(--psych-text)" }}>Clinical (n={groupCounts["Clinical"] ?? 0})</th>
                      <th className="text-center py-1.5 px-4 font-normal italic" style={{ color: "var(--psych-text)" }}>Subclinical (n={groupCounts["Subclinical"] ?? 0})</th>
                      <th className="text-center py-1.5 px-4 font-normal italic" style={{ color: "var(--psych-text)" }}>Control (n={groupCounts["Control"] ?? 0})</th>
                      <th className="text-center py-1.5 px-4 font-normal italic" style={{ color: "var(--psych-text)" }}>Total (N={participants.length})</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(["Clinical", "Subclinical", "Control"] as const).map((g) => {
                      const gp = participants.filter((p) => p.group === g);
                      const ages = gp.map((p) => p.age).filter(Boolean);
                      return null; // rendered below
                    })}
                    <tr style={{ borderBottom: "1px solid var(--psych-border)" }}>
                      <td className="py-1.5 pr-6" style={{ color: "var(--psych-text)" }}>Age M (SD)</td>
                      {(["Clinical", "Subclinical", "Control"] as const).map((g) => {
                        const ages = participants.filter((p) => p.group === g).map((p) => p.age);
                        return (
                          <td key={g} className="text-center py-1.5 px-4 font-mono" style={{ color: "var(--psych-text)" }}>
                            {ages.length ? `${fmt(statMean(ages))} (${fmt(statStdDev(ages))})` : "—"}
                          </td>
                        );
                      })}
                      <td className="text-center py-1.5 px-4 font-mono" style={{ color: "var(--psych-text)" }}>
                        {fmt(statMean(participants.map((p) => p.age)))} ({fmt(statStdDev(participants.map((p) => p.age)))})
                      </td>
                    </tr>
                    {(["Female", "Male", "Non-binary"] as const).map((gender) => (
                      <tr key={gender} style={{ borderBottom: "1px solid var(--psych-border)" }}>
                        <td className="py-1.5 pr-6" style={{ color: "var(--psych-text)" }}>Gender: {gender} n (%)</td>
                        {(["Clinical", "Subclinical", "Control"] as const).map((g) => {
                          const total = participants.filter((p) => p.group === g).length;
                          const count = participants.filter((p) => p.group === g && p.gender === gender).length;
                          return (
                            <td key={g} className="text-center py-1.5 px-4 font-mono" style={{ color: "var(--psych-text)" }}>
                              {count} ({total ? Math.round((count / total) * 100) : 0}%)
                            </td>
                          );
                        })}
                        <td className="text-center py-1.5 px-4 font-mono" style={{ color: "var(--psych-text)" }}>
                          {participants.filter((p) => p.gender === gender).length} ({Math.round((participants.filter((p) => p.gender === gender).length / Math.max(participants.length, 1)) * 100)}%)
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr style={{ borderTop: "2px solid var(--psych-text)" }}>
                      <td colSpan={5} className="pt-1.5 text-[10px]" style={{ color: "var(--psych-muted)" }}>
                        Note. Values represent means (M) and standard deviations (SD) for continuous variables, and frequencies (n) and percentages (%) for categorical variables.
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </SectionCard>

            {/* Table 2 — Descriptive Stats */}
            <SectionCard title="Table 2" description="Descriptive Statistics for Study Variables">
              <p className="text-xs font-bold mb-2" style={{ color: "var(--psych-text)" }}>
                Table 2<br />
                <em>Descriptive Statistics for Study Variables (Complete Cases, N = {completeParticipants.length})</em>
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr style={{ borderTop: "2px solid var(--psych-text)", borderBottom: "1px solid var(--psych-text)" }}>
                      {["Variable", "N", "M", "Mdn", "SD", "Min", "Max", "Range"].map((h) => (
                        <th key={h} className="text-left py-1.5 pr-4 font-normal italic" style={{ color: "var(--psych-text)" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ["Depression (PHQ-9)", stats.dep],
                      ["Anxiety (GAD-7)", stats.anx],
                      ["Depersonalization (DPDR)", stats.dpdr],
                      ["Derealization (DPDR)", stats.dr],
                      ["Stress (PSS-10)", stats.stress],
                    ].map(([label, s]) => (
                      <tr key={String(label)} style={{ borderBottom: "1px solid var(--psych-border)" }}>
                        <td className="py-1.5 pr-4" style={{ color: "var(--psych-text)" }}>{String(label)}</td>
                        {s ? (
                          <>
                            <td className="py-1.5 pr-4 font-mono">{s.n}</td>
                            <td className="py-1.5 pr-4 font-mono">{fmt(s.mean)}</td>
                            <td className="py-1.5 pr-4 font-mono">{fmt(s.median)}</td>
                            <td className="py-1.5 pr-4 font-mono">{fmt(s.sd)}</td>
                            <td className="py-1.5 pr-4 font-mono">{s.min}</td>
                            <td className="py-1.5 pr-4 font-mono">{s.max}</td>
                            <td className="py-1.5 pr-4 font-mono">{s.range}</td>
                          </>
                        ) : (
                          <td colSpan={7} style={{ color: "var(--psych-muted)" }}>—</td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr style={{ borderTop: "2px solid var(--psych-text)" }}>
                      <td colSpan={8} className="pt-1.5 text-[10px]" style={{ color: "var(--psych-muted)" }}>
                        Note. PHQ-9 = Patient Health Questionnaire; GAD-7 = Generalized Anxiety Disorder Scale; DPDR = Depersonalization/Derealization; PSS-10 = Perceived Stress Scale.
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </SectionCard>

            {/* Table 3 — Correlation Matrix */}
            <SectionCard title="Table 3" description="Pearson Correlation Matrix">
              <p className="text-xs font-bold mb-2" style={{ color: "var(--psych-text)" }}>
                Table 3<br />
                <em>Pearson Correlations Between Study Variables</em>
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr style={{ borderTop: "2px solid var(--psych-text)", borderBottom: "1px solid var(--psych-text)" }}>
                      <th className="text-left py-1.5 pr-4 font-normal italic" style={{ color: "var(--psych-text)" }}>Variable</th>
                      {["1", "2", "3", "4"].map((n) => (
                        <th key={n} className="text-center py-1.5 px-3 font-normal italic" style={{ color: "var(--psych-text)" }}>{n}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { label: "1. Depression", key: "depressionScore" },
                      { label: "2. Anxiety", key: "anxietyScore" },
                      { label: "3. Depersonalization", key: "depersonalizationScore" },
                      { label: "4. Derealization", key: "derealizationScore" },
                    ].map((row, ri) => {
                      const x = nums(completeParticipants, row.key as keyof ThesisParticipant);
                      return (
                        <tr key={row.label} style={{ borderBottom: "1px solid var(--psych-border)" }}>
                          <td className="py-1.5 pr-4" style={{ color: "var(--psych-text)" }}>{row.label}</td>
                          {[
                            { label: "1. Depression", key: "depressionScore" },
                            { label: "2. Anxiety", key: "anxietyScore" },
                            { label: "3. Depersonalization", key: "depersonalizationScore" },
                            { label: "4. Derealization", key: "derealizationScore" },
                          ].map((col, ci) => {
                            if (ci > ri) return <td key={col.key} className="text-center py-1.5 px-3 font-mono">—</td>;
                            if (ci === ri) return <td key={col.key} className="text-center py-1.5 px-3 font-mono">—</td>;
                            const y = nums(completeParticipants, col.key as keyof ThesisParticipant);
                            const r = pearsonR(x, y);
                            return (
                              <td key={col.key} className="text-center py-1.5 px-3 font-mono" style={{ color: "var(--psych-text)" }}>
                                {apa(r)}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr style={{ borderTop: "2px solid var(--psych-text)" }}>
                      <td colSpan={5} className="pt-1.5 text-[10px]" style={{ color: "var(--psych-muted)" }}>
                        Note. N = {completeParticipants.length}. Significance testing not included — verify p-values with statistical software.
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </SectionCard>
          </div>
        </TabsContent>

        {/* ══ REPORT BUILDER ═════════════════════════════════════ */}
        <TabsContent value="report">
          <div className="space-y-4 max-w-3xl">
            <div className="rounded-2xl px-5 py-3 text-xs" style={{ backgroundColor: "var(--psych-primary-light)", color: "var(--psych-accent)" }}>
              ✦ Use this to draft and organize your thesis sections. All content auto-saves to your browser. This complements Word — not replaces it.
            </div>
            {[
              { key: "title_page", title: "Title Page", ph: "Thesis title, author name, institution, date, supervisor name…" },
              { key: "abstract", title: "Abstract", ph: "Brief summary of research question, method, key findings, and conclusions (150–250 words)…" },
              { key: "introduction", title: "Introduction", ph: "Background, significance, and purpose of the study…" },
              { key: "literature_review", title: "Literature Review Notes", ph: "Summary of relevant studies, theoretical frameworks, gaps in literature…" },
              { key: "methodology", title: "Methodology", ph: design.methodology || "Describe your research design, sample, instruments, procedure, and analysis plan…" },
              { key: "participants_section", title: "Participants", ph: design.sampleDescription || "Describe participant characteristics, recruitment, and grouping criteria…" },
              { key: "instruments", title: "Instruments", ph: "Describe each scale: PHQ-9, GAD-7, DPDR-16, PSS-10 — reliability, validity, scoring…" },
              { key: "procedure", title: "Procedure", ph: "Step-by-step description of data collection process…" },
              { key: "results", title: "Results", ph: generatedResults.sampleText + "\n\n" + generatedResults.descText + "\n\n" + generatedResults.corrText },
              { key: "discussion", title: "Discussion", ph: generatedResults.interpText },
              { key: "limitations", title: "Limitations", ph: `This study has several limitations…` },
              { key: "conclusion", title: "Conclusion", ph: "Summarize main findings and their implications for clinical practice and future research…" },
              { key: "references", title: "References (APA 7)", ph: "American Psychiatric Association. (2013). Diagnostic and statistical manual of mental disorders (5th ed.)…" },
            ].map(({ key, title, ph }) => (
              <SectionCard key={key} title={title}>
                <Textarea
                  placeholder={ph}
                  value={reportSections[key] ?? ""}
                  onChange={(e) => updateReportSection(key, e.target.value)}
                  className="min-h-[120px] text-sm"
                />
              </SectionCard>
            ))}
          </div>
        </TabsContent>

        {/* ══ KNOWLEDGE BASE ═════════════════════════════════════ */}
        <TabsContent value="knowledge">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm" style={{ color: "var(--psych-muted)" }}>
                {notes.length} notes
              </p>
              <Button size="sm" onClick={openAddN}>
                <Plus size={13} /> Add Note
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {notes.map((note) => (
                <SectionCard
                  key={note.id}
                  title={note.title || "Untitled Note"}
                  description={note.category}
                  action={
                    <div className="flex gap-1">
                      <button onClick={() => openEditN(note)} className="p-1.5 rounded" style={{ color: "var(--psych-muted)" }}><Edit3 size={12} /></button>
                      <button onClick={() => { deleteNote(note.id); toast("Note deleted", "success"); }} className="p-1.5 rounded" style={{ color: "var(--psych-muted)" }}><Trash2 size={12} /></button>
                    </div>
                  }
                >
                  <p className="text-sm leading-relaxed mb-2" style={{ color: "var(--psych-text)" }}>{note.content}</p>
                  {note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {note.tags.map((tag) => (
                        <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full" style={{ backgroundColor: "var(--psych-primary-light)", color: "var(--psych-accent)" }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <p className="text-[10px] mt-2" style={{ color: "var(--psych-muted)" }}>
                    Updated {new Date(note.updatedAt).toLocaleDateString()}
                  </p>
                </SectionCard>
              ))}
            </div>

            {notes.length === 0 && (
              <div className="text-center py-12">
                <BookMarked size={32} className="mx-auto mb-3 opacity-30" style={{ color: "var(--psych-primary)" }} />
                <p className="text-sm" style={{ color: "var(--psych-muted)" }}>No knowledge notes yet.</p>
                <Button variant="secondary" size="sm" className="mt-3" onClick={openAddN}>Add your first note</Button>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* ── Participant Modal ───────────────────────────────────── */}
      <Modal open={pModalOpen} onClose={() => setPModalOpen(false)} title={pEditing ? `Edit ${pEditing.code}` : "Add Participant"}>
        <ModalBody>
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>Age</Label>
                <Input type="number" min={15} max={80} value={pForm.age ?? ""} onChange={(e) => setPForm((f) => ({ ...f, age: Number(e.target.value) }))} />
              </div>
              <div>
                <Label>Gender</Label>
                <Select value={pForm.gender ?? "Female"} onChange={(e) => setPForm((f) => ({ ...f, gender: e.target.value }))}>
                  <option>Female</option>
                  <option>Male</option>
                  <option>Non-binary</option>
                  <option>Prefer not to say</option>
                </Select>
              </div>
              <div>
                <Label>Group</Label>
                <Select value={pForm.group ?? "Control"} onChange={(e) => setPForm((f) => ({ ...f, group: e.target.value as ThesisParticipant["group"] }))}>
                  <option>Clinical</option>
                  <option>Subclinical</option>
                  <option>Control</option>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Depression Score (PHQ-9, 0–27)", key: "depressionScore" },
                { label: "Anxiety Score (GAD-7, 0–21)", key: "anxietyScore" },
                { label: "Depersonalization (DPDR)", key: "depersonalizationScore" },
                { label: "Derealization (DPDR)", key: "derealizationScore" },
                { label: "Stress Score (PSS)", key: "stressScore" },
                { label: "Emotional Regulation", key: "emotionalRegulationScore" },
              ].map(({ label, key }) => (
                <div key={key}>
                  <Label>{label}</Label>
                  <Input
                    type="number"
                    placeholder="Leave blank if missing"
                    value={pForm[key as keyof ThesisParticipant] as number ?? ""}
                    onChange={(e) => {
                      const v = e.target.value === "" ? null : Number(e.target.value);
                      setPForm((f) => ({ ...f, [key]: v }));
                    }}
                  />
                </div>
              ))}
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea
                placeholder="Any notes about this participant…"
                value={pForm.notes ?? ""}
                onChange={(e) => setPForm((f) => ({ ...f, notes: e.target.value }))}
                className="min-h-[60px]"
              />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={pForm.hasMissingData ?? false}
                onChange={(e) => setPForm((f) => ({ ...f, hasMissingData: e.target.checked }))}
              />
              <span className="text-sm" style={{ color: "var(--psych-text)" }}>Flag as having missing data</span>
            </label>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setPModalOpen(false)}>Cancel</Button>
          <Button onClick={saveP}>{pEditing ? "Update" : "Add Participant"}</Button>
        </ModalFooter>
      </Modal>

      {/* ── Note Modal ─────────────────────────────────────────── */}
      <Modal open={nModalOpen} onClose={() => setNModalOpen(false)} title={nEditing ? "Edit Note" : "New Knowledge Note"}>
        <ModalBody>
          <div className="space-y-3">
            <div>
              <Label>Title</Label>
              <Input value={nForm.title ?? ""} onChange={(e) => setNForm((f) => ({ ...f, title: e.target.value }))} placeholder="e.g. Sierra et al. (2005) — CDS Scale" />
            </div>
            <div>
              <Label>Category</Label>
              <Select value={nForm.category ?? "other"} onChange={(e) => setNForm((f) => ({ ...f, category: e.target.value as ThesisNote["category"] }))}>
                <option value="article">Article / Study</option>
                <option value="concept">Key Concept</option>
                <option value="citation">Citation</option>
                <option value="feedback">Professor Feedback</option>
                <option value="statistics">Statistics Note</option>
                <option value="methodology">Methodology</option>
                <option value="dsm">DSM / ICD Reference</option>
                <option value="other">Other</option>
              </Select>
            </div>
            <div>
              <Label>Content</Label>
              <Textarea
                value={nForm.content ?? ""}
                onChange={(e) => setNForm((f) => ({ ...f, content: e.target.value }))}
                className="min-h-[120px] text-sm"
                placeholder="Write your note here…"
              />
            </div>
            <div>
              <Label>Tags (comma-separated)</Label>
              <Input
                value={(nForm.tags ?? []).join(", ")}
                onChange={(e) => setNForm((f) => ({ ...f, tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean) }))}
                placeholder="depression, correlation, dsm5…"
              />
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setNModalOpen(false)}>Cancel</Button>
          <Button onClick={saveN}>{nEditing ? "Update" : "Save Note"}</Button>
        </ModalFooter>
      </Modal>

      {/* ── Confirm delete participant ──────────────────────────── */}
      <ConfirmDialog
        open={!!pDeleteId}
        title="Delete Participant"
        description="This participant and all their data will be permanently removed."
        confirmLabel="Delete"
        onConfirm={() => {
          if (pDeleteId) { deleteParticipant(pDeleteId); toast("Participant deleted", "success"); }
          setPDeleteId(null);
        }}
        onCancel={() => setPDeleteId(null)}
      />
    </div>
  );
}
