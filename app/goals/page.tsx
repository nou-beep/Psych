"use client";
import { useState, useMemo } from "react";
import {
  Target,
  Plus,
  Search,
  CheckCircle,
  Clock,
  Pause,
  MoreHorizontal,
  Trash2,
  Archive,
  Edit3,
  ChevronDown,
  ChevronUp,
  Flag,
} from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { SectionCard } from "@/components/shared/SectionCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Modal, ModalBody, ModalFooter } from "@/components/ui/Modal";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { useApp } from "@/contexts/AppContext";
import { useToast } from "@/components/ui/Toast";
import { type Goal } from "@/lib/mock-data";

const CATEGORIES = ["therapeutic", "behavioral", "research", "observation", "intervention"] as const;
const STATUSES = ["not-started", "in-progress", "achieved", "paused"] as const;
const PRIORITIES = ["low", "medium", "high"] as const;

const STATUS_LABELS: Record<string, string> = {
  "not-started": "Not started",
  "in-progress": "In progress",
  achieved: "Achieved",
  paused: "Paused",
};

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  "not-started": { bg: "#F1F5F9", text: "#64748B" },
  "in-progress": { bg: "#DBEAFE", text: "#1E40AF" },
  achieved: { bg: "#D1FAE5", text: "#065F46" },
  paused: { bg: "#FEF3C7", text: "#92400E" },
};

const PRIORITY_COLORS: Record<string, string> = {
  low: "#10B981",
  medium: "#F59E0B",
  high: "#EF4444",
};

function emptyGoal(): Partial<Goal> {
  return {
    title: "",
    category: "therapeutic",
    description: "",
    status: "not-started",
    priority: "medium",
    progress: 0,
    tags: [],
    milestones: [],
  };
}

export default function GoalsPage() {
  const { goals, createGoal, updateGoal, deleteGoal, archiveGoal, cases } = useApp();
  const { toast } = useToast();

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [showArchived, setShowArchived] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [form, setForm] = useState<Partial<Goal>>(emptyGoal());
  const [deleteTarget, setDeleteTarget] = useState<Goal | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [newMilestone, setNewMilestone] = useState("");

  const filtered = useMemo(() => {
    return goals.filter((g) => {
      if (!showArchived && g.isArchived) return false;
      if (showArchived && !g.isArchived) return false;
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        g.title.toLowerCase().includes(q) ||
        g.description.toLowerCase().includes(q) ||
        g.tags.some((t) => t.toLowerCase().includes(q));
      const matchStatus = filterStatus === "all" || g.status === filterStatus;
      const matchCategory = filterCategory === "all" || g.category === filterCategory;
      return matchSearch && matchStatus && matchCategory;
    });
  }, [goals, search, filterStatus, filterCategory, showArchived]);

  const stats = useMemo(() => {
    const active = goals.filter((g) => !g.isArchived);
    return {
      total: active.length,
      inProgress: active.filter((g) => g.status === "in-progress").length,
      achieved: active.filter((g) => g.status === "achieved").length,
      avgProgress:
        active.length > 0
          ? Math.round(active.reduce((sum, g) => sum + g.progress, 0) / active.length)
          : 0,
    };
  }, [goals]);

  function openCreate() {
    setEditingGoal(null);
    setForm(emptyGoal());
    setNewMilestone("");
    setModalOpen(true);
  }

  function openEdit(goal: Goal) {
    setEditingGoal(goal);
    setForm({ ...goal });
    setNewMilestone("");
    setModalOpen(true);
    setMenuOpen(null);
  }

  function handleSave() {
    if (!form.title?.trim()) {
      toast("Please enter a title", "warning");
      return;
    }
    if (editingGoal) {
      updateGoal(editingGoal.id, form);
      toast("Goal updated", "success");
    } else {
      createGoal(form);
      toast("Goal created ✦", "success");
    }
    setModalOpen(false);
  }

  function handleDelete() {
    if (!deleteTarget) return;
    deleteGoal(deleteTarget.id);
    toast("Goal deleted", "info");
    setDeleteTarget(null);
  }

  function addMilestone() {
    if (!newMilestone.trim()) return;
    const ms = {
      id: Math.random().toString(36).slice(2),
      title: newMilestone.trim(),
      completed: false,
    };
    setForm((f) => ({ ...f, milestones: [...(f.milestones || []), ms] }));
    setNewMilestone("");
  }

  function toggleMilestone(msId: string) {
    setForm((f) => ({
      ...f,
      milestones: (f.milestones || []).map((m) =>
        m.id === msId ? { ...m, completed: !m.completed } : m
      ),
    }));
  }

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      <PageHeader
        title="Goals & Objectives"
        subtitle={`${stats.total} goals · ${stats.inProgress} in progress · ${stats.achieved} achieved`}
        action={
          <Button size="sm" onClick={openCreate}>
            <Plus size={14} />
            New Goal
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total Goals", value: stats.total, icon: <Target size={14} />, color: "var(--psych-primary)" },
          { label: "In Progress", value: stats.inProgress, icon: <Clock size={14} />, color: "#3B82F6" },
          { label: "Achieved", value: stats.achieved, icon: <CheckCircle size={14} />, color: "#10B981" },
          { label: "Avg. Progress", value: `${stats.avgProgress}%`, icon: <Flag size={14} />, color: "#F59E0B" },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border p-4 card-hover animate-fade-up"
            style={{ backgroundColor: "var(--psych-card)", borderColor: "var(--psych-border)" }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span style={{ color: s.color }}>{s.icon}</span>
              <span className="text-xs" style={{ color: "var(--psych-muted)" }}>
                {s.label}
              </span>
            </div>
            <p className="text-2xl font-bold" style={{ color: "var(--psych-text)" }}>
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <SectionCard className="mb-6">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[180px]">
            <Search
              size={13}
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: "var(--psych-muted)" }}
            />
            <Input
              placeholder="Search goals…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-40">
            <option value="all">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{STATUS_LABELS[s]}</option>
            ))}
          </Select>
          <Select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="w-44">
            <option value="all">All categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c} className="capitalize">{c}</option>
            ))}
          </Select>
          <Button
            variant={showArchived ? "primary" : "ghost"}
            size="sm"
            onClick={() => setShowArchived((v) => !v)}
          >
            <Archive size={13} />
            {showArchived ? "Active" : "Archived"}
          </Button>
        </div>
      </SectionCard>

      {/* Goals list */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: "var(--psych-primary-light)" }}
          >
            <Target size={28} style={{ color: "var(--psych-primary)" }} />
          </div>
          <p className="text-sm font-medium mb-1" style={{ color: "var(--psych-text)" }}>
            {showArchived ? "No archived goals" : "No goals yet"}
          </p>
          <p className="text-xs mb-4" style={{ color: "var(--psych-muted)" }}>
            {showArchived ? "Archived goals will appear here" : "Start tracking therapeutic goals"}
          </p>
          {!showArchived && (
            <Button size="sm" onClick={openCreate}>
              <Plus size={14} /> Create First Goal
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((goal, idx) => {
            const sc = STATUS_COLORS[goal.status];
            const isExpanded = expandedId === goal.id;
            const completedMs = goal.milestones.filter((m) => m.completed).length;
            const linkedCase = cases.find((c) => c.id === goal.caseId);

            return (
              <div
                key={goal.id}
                className="rounded-2xl border overflow-hidden card-hover animate-fade-up"
                style={{
                  backgroundColor: "var(--psych-card)",
                  borderColor: "var(--psych-border)",
                  animationDelay: `${idx * 40}ms`,
                }}
              >
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    {/* Priority dot */}
                    <div
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1.5"
                      style={{ backgroundColor: PRIORITY_COLORS[goal.priority] }}
                      title={`${goal.priority} priority`}
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2 flex-wrap">
                        <h3
                          className="text-sm font-semibold leading-snug"
                          style={{ color: "var(--psych-text)" }}
                        >
                          {goal.title}
                        </h3>
                        <span
                          className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                          style={{ backgroundColor: sc.bg, color: sc.text }}
                        >
                          {STATUS_LABELS[goal.status]}
                        </span>
                        <Badge variant="secondary" className="text-[10px]">
                          {goal.category}
                        </Badge>
                        {linkedCase && (
                          <span
                            className="text-[10px] px-2 py-0.5 rounded-full border font-mono"
                            style={{ borderColor: "var(--psych-border)", color: "var(--psych-muted)" }}
                          >
                            {linkedCase.code}
                          </span>
                        )}
                      </div>

                      {/* Progress */}
                      <div className="mt-2.5 flex items-center gap-3">
                        <ProgressBar value={goal.progress} size="sm" className="flex-1" />
                        <span className="text-xs font-medium w-9 text-right" style={{ color: "var(--psych-primary)" }}>
                          {goal.progress}%
                        </span>
                      </div>

                      {goal.milestones.length > 0 && (
                        <p className="text-[10px] mt-1" style={{ color: "var(--psych-muted)" }}>
                          {completedMs}/{goal.milestones.length} milestones
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 flex-shrink-0 relative">
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : goal.id)}
                        className="p-1.5 rounded-lg transition-all hover:scale-110"
                        style={{ color: "var(--psych-muted)" }}
                      >
                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>
                      <button
                        onClick={() => setMenuOpen(menuOpen === goal.id ? null : goal.id)}
                        className="p-1.5 rounded-lg transition-all hover:scale-110"
                        style={{ color: "var(--psych-muted)" }}
                      >
                        <MoreHorizontal size={14} />
                      </button>
                      {menuOpen === goal.id && (
                        <div
                          className="absolute right-0 top-8 z-20 rounded-2xl border shadow-xl overflow-hidden"
                          style={{ backgroundColor: "var(--psych-card)", borderColor: "var(--psych-border)", minWidth: 140 }}
                        >
                          {[
                            { label: "Edit", icon: <Edit3 size={12} />, action: () => openEdit(goal) },
                            { label: "Archive", icon: <Archive size={12} />, action: () => { archiveGoal(goal.id); toast("Goal archived", "info"); setMenuOpen(null); } },
                            { label: "Delete", icon: <Trash2 size={12} />, action: () => { setDeleteTarget(goal); setMenuOpen(null); }, danger: true },
                          ].map((item) => (
                            <button
                              key={item.label}
                              onClick={item.action}
                              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-left transition-colors hover:opacity-80"
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
                </div>

                {/* Expanded content */}
                {isExpanded && (
                  <div
                    className="px-4 pb-4 border-t pt-3 space-y-3 animate-fade-in"
                    style={{ borderColor: "var(--psych-border)" }}
                  >
                    {goal.description && (
                      <p className="text-xs leading-relaxed" style={{ color: "var(--psych-muted)" }}>
                        {goal.description}
                      </p>
                    )}

                    {/* Milestones */}
                    {goal.milestones.length > 0 && (
                      <div className="space-y-1.5">
                        <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: "var(--psych-muted)" }}>
                          Milestones
                        </p>
                        {goal.milestones.map((ms) => (
                          <div key={ms.id} className="flex items-center gap-2">
                            <div
                              className="w-3.5 h-3.5 rounded-full border flex items-center justify-center flex-shrink-0"
                              style={{
                                borderColor: ms.completed ? "var(--psych-primary)" : "var(--psych-border)",
                                backgroundColor: ms.completed ? "var(--psych-primary)" : "transparent",
                              }}
                            >
                              {ms.completed && <CheckCircle size={8} style={{ color: "white" }} />}
                            </div>
                            <span
                              className="text-xs"
                              style={{
                                color: ms.completed ? "var(--psych-muted)" : "var(--psych-text)",
                                textDecoration: ms.completed ? "line-through" : "none",
                              }}
                            >
                              {ms.title}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Tags */}
                    {goal.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {goal.tags.map((tag) => (
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

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => openEdit(goal)}>
                        <Edit3 size={12} /> Edit goal
                      </Button>
                    </div>
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
        title={editingGoal ? "Edit Goal" : "New Goal"}
        subtitle={editingGoal ? "Update goal details" : "Create a therapeutic or behavioral goal"}
        size="lg"
      >
        <ModalBody className="space-y-4">
          <div>
            <label className="text-xs font-medium mb-1 block" style={{ color: "var(--psych-muted)" }}>
              Title *
            </label>
            <Input
              value={form.title || ""}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="Goal title…"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: "var(--psych-muted)" }}>
                Category
              </label>
              <Select
                value={form.category || "therapeutic"}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as Goal["category"] }))}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c} className="capitalize">{c}</option>
                ))}
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: "var(--psych-muted)" }}>
                Priority
              </label>
              <Select
                value={form.priority || "medium"}
                onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value as Goal["priority"] }))}
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p} className="capitalize">{p}</option>
                ))}
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: "var(--psych-muted)" }}>
                Status
              </label>
              <Select
                value={form.status || "not-started"}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as Goal["status"] }))}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                ))}
              </Select>
            </div>
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
          </div>

          <div>
            <label className="text-xs font-medium mb-1 block" style={{ color: "var(--psych-muted)" }}>
              Progress — {form.progress ?? 0}%
            </label>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={form.progress ?? 0}
              onChange={(e) => setForm((f) => ({ ...f, progress: Number(e.target.value) }))}
              className="w-full"
              style={{ accentColor: "var(--psych-primary)" }}
            />
          </div>

          <div>
            <label className="text-xs font-medium mb-1 block" style={{ color: "var(--psych-muted)" }}>
              Description
            </label>
            <textarea
              rows={3}
              value={form.description || ""}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Describe the goal and its clinical rationale…"
              className="w-full px-3.5 py-2 rounded-xl text-sm border resize-none outline-none"
              style={{
                backgroundColor: "var(--psych-bg)",
                borderColor: "var(--psych-border)",
                color: "var(--psych-text)",
              }}
            />
          </div>

          <div>
            <label className="text-xs font-medium mb-2 block" style={{ color: "var(--psych-muted)" }}>
              Milestones
            </label>
            <div className="space-y-1.5 mb-2">
              {(form.milestones || []).map((ms) => (
                <div key={ms.id} className="flex items-center gap-2">
                  <button
                    onClick={() => toggleMilestone(ms.id)}
                    className="w-4 h-4 rounded-full border flex-shrink-0 flex items-center justify-center transition-colors"
                    style={{
                      borderColor: ms.completed ? "var(--psych-primary)" : "var(--psych-border)",
                      backgroundColor: ms.completed ? "var(--psych-primary)" : "transparent",
                    }}
                  >
                    {ms.completed && <CheckCircle size={8} style={{ color: "white" }} />}
                  </button>
                  <span
                    className="text-xs flex-1"
                    style={{
                      color: ms.completed ? "var(--psych-muted)" : "var(--psych-text)",
                      textDecoration: ms.completed ? "line-through" : "none",
                    }}
                  >
                    {ms.title}
                  </span>
                  <button
                    onClick={() =>
                      setForm((f) => ({
                        ...f,
                        milestones: (f.milestones || []).filter((m) => m.id !== ms.id),
                      }))
                    }
                    className="text-[10px] hover:opacity-60"
                    style={{ color: "var(--psych-muted)" }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newMilestone}
                onChange={(e) => setNewMilestone(e.target.value)}
                placeholder="Add milestone…"
                onKeyDown={(e) => e.key === "Enter" && addMilestone()}
                className="text-xs"
              />
              <Button variant="outline" size="sm" onClick={addMilestone}>Add</Button>
            </div>
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
              placeholder="anxiety, CBT, regulation…"
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" size="sm" onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button size="sm" onClick={handleSave}>
            {editingGoal ? "Save Changes" : "Create Goal"}
          </Button>
        </ModalFooter>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete goal?"
        message="This goal and all its milestones will be permanently deleted."
        confirmLabel="Delete"
        confirmVariant="danger"
      />
    </div>
  );
}
