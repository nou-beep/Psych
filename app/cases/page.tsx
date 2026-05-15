"use client";
import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Search, Plus, Pin, Archive, Trash2, Copy, Edit3, MoreHorizontal } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { CaseCard } from "@/components/shared/CaseCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal, ModalBody, ModalFooter } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { useApp, type CaseWithMeta } from "@/contexts/AppContext";
import { useToast } from "@/components/ui/Toast";
import { type CaseType, type CaseStatus } from "@/lib/mock-data";
import Link from "next/link";

const ALL_TYPES: CaseType[] = [
  "Clinical Case",
  "Child Follow-Up",
  "Autism Internship Case",
  "Adult Case",
  "Research Participant",
  "Supervision Case",
  "Assessment Only",
];

const ALL_STATUSES: CaseStatus[] = ["Active", "Paused", "Archived", "Needs Review"];

function emptyCase(): Partial<CaseWithMeta> {
  return {
    code: "",
    type: "Clinical Case",
    status: "Active",
    age: "",
    gender: "",
    context: "",
    presentingConcerns: "",
    currentGoals: [],
    keyObservations: "",
    latestSummary: "",
    lastCheckIn: new Date().toISOString().split("T")[0],
    nextReportDue: "",
    tags: [],
    shortNote: "",
    startDate: new Date().toISOString().split("T")[0],
    supervisor: "",
    institution: "",
  };
}

export default function CasesPage() {
  const { cases, createCase, updateCase, deleteCase, archiveCase, duplicateCase, togglePinCase, pinnedCaseIds } =
    useApp();
  const { toast } = useToast();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [showArchived, setShowArchived] = useState(false);

  const [modalOpen, setModalOpen] = useState(
    searchParams?.get("action") === "new"
  );
  const [editingCase, setEditingCase] = useState<CaseWithMeta | null>(null);
  const [form, setForm] = useState<Partial<CaseWithMeta>>(emptyCase());
  const [deleteTarget, setDeleteTarget] = useState<CaseWithMeta | null>(null);
  const [archiveTarget, setArchiveTarget] = useState<CaseWithMeta | null>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [goalsInput, setGoalsInput] = useState("");

  const filtered = useMemo(() => {
    return cases.filter((c) => {
      if (!showArchived && c.isArchived) return false;
      if (showArchived && !c.isArchived) return false;
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        c.code.toLowerCase().includes(q) ||
        c.shortNote.toLowerCase().includes(q) ||
        c.tags.some((t) => t.toLowerCase().includes(q));
      const matchType = filterType === "all" || c.type === filterType;
      const matchStatus = filterStatus === "all" || c.status === filterStatus;
      return matchSearch && matchType && matchStatus;
    });
  }, [cases, search, filterType, filterStatus, showArchived]);

  // Sort: pinned first
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const aPinned = pinnedCaseIds.includes(a.id) ? 0 : 1;
      const bPinned = pinnedCaseIds.includes(b.id) ? 0 : 1;
      return aPinned - bPinned;
    });
  }, [filtered, pinnedCaseIds]);

  function resetFilters() {
    setSearch("");
    setFilterType("all");
    setFilterStatus("all");
  }

  const hasFilters = search || filterType !== "all" || filterStatus !== "all";

  function openCreate() {
    setEditingCase(null);
    setForm(emptyCase());
    setGoalsInput("");
    setModalOpen(true);
  }

  function openEdit(c: CaseWithMeta) {
    setEditingCase(c);
    setForm({ ...c });
    setGoalsInput(c.currentGoals.join("\n"));
    setModalOpen(true);
    setMenuOpen(null);
  }

  function handleSave() {
    if (!form.code?.trim()) {
      toast("Case code is required", "warning");
      return;
    }
    const goals = goalsInput
      .split("\n")
      .map((g) => g.trim())
      .filter(Boolean);
    const data = { ...form, currentGoals: goals };

    if (editingCase) {
      updateCase(editingCase.id, data);
      toast("Case updated", "success");
    } else {
      createCase(data);
      toast("Case created ✦", "success");
    }
    setModalOpen(false);
  }

  function handleDelete() {
    if (!deleteTarget) return;
    deleteCase(deleteTarget.id);
    toast("Case deleted", "info");
    setDeleteTarget(null);
  }

  function handleArchive() {
    if (!archiveTarget) return;
    archiveCase(archiveTarget.id);
    toast("Case archived", "info");
    setArchiveTarget(null);
  }

  function handleDuplicate(c: CaseWithMeta) {
    duplicateCase(c.id);
    toast(`Duplicated ${c.code}`, "success");
    setMenuOpen(null);
  }

  const activeCases = cases.filter((c) => !c.isArchived);

  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
      <PageHeader
        title="Cases"
        subtitle={`${activeCases.length} total · ${activeCases.filter((c) => c.status === "Active").length} active`}
        action={
          <Button size="sm" onClick={openCreate}>
            <Plus size={14} />
            New Case
          </Button>
        }
      />

      {/* Filters */}
      <div
        className="rounded-2xl border p-4 mb-6 flex flex-wrap gap-3 items-center"
        style={{
          backgroundColor: "var(--psych-card)",
          borderColor: "var(--psych-border)",
        }}
      >
        <div className="relative flex-1 min-w-[180px]">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: "var(--psych-muted)" }}
          />
          <Input
            placeholder="Search cases, codes, tags…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="w-48">
          <option value="all">All types</option>
          {ALL_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </Select>
        <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-40">
          <option value="all">All statuses</option>
          {ALL_STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
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
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={resetFilters}>
            Clear
          </Button>
        )}
      </div>

      {/* Results count */}
      <div className="flex items-center gap-2 mb-4">
        <p className="text-xs" style={{ color: "var(--psych-muted)" }}>
          Showing {sorted.length} {sorted.length === 1 ? "case" : "cases"}
        </p>
        {hasFilters && (
          <Badge variant="secondary">
            {sorted.length} result{sorted.length !== 1 ? "s" : ""}
          </Badge>
        )}
      </div>

      {/* Cases grid */}
      {sorted.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {sorted.map((c, idx) => {
            const isPinned = pinnedCaseIds.includes(c.id);
            return (
              <div key={c.id} className="relative group animate-fade-up" style={{ animationDelay: `${idx * 40}ms` }}>
                {/* Pinned indicator */}
                {isPinned && (
                  <div
                    className="absolute -top-1.5 -right-1.5 z-10 w-5 h-5 rounded-full flex items-center justify-center shadow"
                    style={{ backgroundColor: "var(--psych-primary)", color: "white" }}
                  >
                    <Pin size={9} />
                  </div>
                )}

                <Link href={`/cases/${c.id}`}>
                  <CaseCard caseData={c} />
                </Link>

                {/* Hover action menu */}
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setMenuOpen(menuOpen === c.id ? null : c.id);
                      }}
                      className="p-1.5 rounded-xl shadow-sm border transition-all hover:scale-110"
                      style={{
                        backgroundColor: "var(--psych-card)",
                        borderColor: "var(--psych-border)",
                        color: "var(--psych-muted)",
                      }}
                    >
                      <MoreHorizontal size={13} />
                    </button>
                    {menuOpen === c.id && (
                      <div
                        className="absolute right-0 top-8 z-30 rounded-2xl border shadow-xl overflow-hidden"
                        style={{
                          backgroundColor: "var(--psych-card)",
                          borderColor: "var(--psych-border)",
                          minWidth: 150,
                        }}
                      >
                        {[
                          {
                            label: isPinned ? "Unpin" : "Pin",
                            icon: <Pin size={12} />,
                            action: () => { togglePinCase(c.id); setMenuOpen(null); },
                          },
                          {
                            label: "Edit",
                            icon: <Edit3 size={12} />,
                            action: () => openEdit(c),
                          },
                          {
                            label: "Duplicate",
                            icon: <Copy size={12} />,
                            action: () => handleDuplicate(c),
                          },
                          {
                            label: "Archive",
                            icon: <Archive size={12} />,
                            action: () => { setArchiveTarget(c); setMenuOpen(null); },
                          },
                          {
                            label: "Delete",
                            icon: <Trash2 size={12} />,
                            action: () => { setDeleteTarget(c); setMenuOpen(null); },
                            danger: true,
                          },
                        ].map((item) => (
                          <button
                            key={item.label}
                            onClick={(e) => {
                              e.preventDefault();
                              item.action();
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-left transition-colors hover:opacity-70"
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
            );
          })}
        </div>
      ) : (
        <EmptyState
          title={showArchived ? "No archived cases" : "No cases found"}
          description={
            showArchived
              ? "Archived cases will appear here."
              : hasFilters
              ? "Try adjusting your filters or search terms."
              : "Create your first clinical case to get started."
          }
          icon={showArchived ? "📦" : "🔍"}
          actionLabel={showArchived ? undefined : hasFilters ? "Clear filters" : "New Case"}
          onAction={showArchived ? undefined : hasFilters ? resetFilters : openCreate}
        />
      )}

      {/* Create / Edit modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingCase ? `Edit ${editingCase.code}` : "New Case"}
        subtitle={editingCase ? "Update case information" : "Create a new clinical case"}
        size="lg"
      >
        <ModalBody className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: "var(--psych-muted)" }}>
                Case Code *
              </label>
              <Input
                value={form.code || ""}
                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                placeholder="CASE-001"
                className="font-mono"
              />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: "var(--psych-muted)" }}>
                Type
              </label>
              <Select
                value={form.type || "Clinical Case"}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as CaseType }))}
              >
                {ALL_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: "var(--psych-muted)" }}>
                Status
              </label>
              <Select
                value={form.status || "Active"}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as CaseStatus }))}
              >
                {ALL_STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: "var(--psych-muted)" }}>
                Age
              </label>
              <Input
                value={form.age || ""}
                onChange={(e) => setForm((f) => ({ ...f, age: e.target.value }))}
                placeholder="e.g. 28"
              />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: "var(--psych-muted)" }}>
                Gender
              </label>
              <Input
                value={form.gender || ""}
                onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value }))}
                placeholder="e.g. Female"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium mb-1 block" style={{ color: "var(--psych-muted)" }}>
              Short Note
            </label>
            <Input
              value={form.shortNote || ""}
              onChange={(e) => setForm((f) => ({ ...f, shortNote: e.target.value }))}
              placeholder="Brief summary shown on card…"
            />
          </div>

          <div>
            <label className="text-xs font-medium mb-1 block" style={{ color: "var(--psych-muted)" }}>
              Context
            </label>
            <textarea
              rows={2}
              value={form.context || ""}
              onChange={(e) => setForm((f) => ({ ...f, context: e.target.value }))}
              placeholder="Clinical context and setting…"
              className="w-full px-3.5 py-2 rounded-xl text-sm border resize-none outline-none"
              style={{
                backgroundColor: "var(--psych-bg)",
                borderColor: "var(--psych-border)",
                color: "var(--psych-text)",
              }}
            />
          </div>

          <div>
            <label className="text-xs font-medium mb-1 block" style={{ color: "var(--psych-muted)" }}>
              Presenting Concerns
            </label>
            <textarea
              rows={2}
              value={form.presentingConcerns || ""}
              onChange={(e) => setForm((f) => ({ ...f, presentingConcerns: e.target.value }))}
              placeholder="Main presenting concerns…"
              className="w-full px-3.5 py-2 rounded-xl text-sm border resize-none outline-none"
              style={{
                backgroundColor: "var(--psych-bg)",
                borderColor: "var(--psych-border)",
                color: "var(--psych-text)",
              }}
            />
          </div>

          <div>
            <label className="text-xs font-medium mb-1 block" style={{ color: "var(--psych-muted)" }}>
              Current Goals (one per line)
            </label>
            <textarea
              rows={3}
              value={goalsInput}
              onChange={(e) => setGoalsInput(e.target.value)}
              placeholder="One goal per line…"
              className="w-full px-3.5 py-2 rounded-xl text-sm border resize-none outline-none"
              style={{
                backgroundColor: "var(--psych-bg)",
                borderColor: "var(--psych-border)",
                color: "var(--psych-text)",
              }}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: "var(--psych-muted)" }}>
                Supervisor
              </label>
              <Input
                value={form.supervisor || ""}
                onChange={(e) => setForm((f) => ({ ...f, supervisor: e.target.value }))}
                placeholder="Dr. Name"
              />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: "var(--psych-muted)" }}>
                Institution
              </label>
              <Input
                value={form.institution || ""}
                onChange={(e) => setForm((f) => ({ ...f, institution: e.target.value }))}
                placeholder="Clinic / University"
              />
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
              placeholder="anxiety, CBT, adult…"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: "var(--psych-muted)" }}>
                Start Date
              </label>
              <Input
                type="date"
                value={form.startDate || ""}
                onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: "var(--psych-muted)" }}>
                Next Report Due
              </label>
              <Input
                type="date"
                value={form.nextReportDue || ""}
                onChange={(e) => setForm((f) => ({ ...f, nextReportDue: e.target.value }))}
              />
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" size="sm" onClick={() => setModalOpen(false)}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSave}>
            {editingCase ? "Save Changes" : "Create Case"}
          </Button>
        </ModalFooter>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete case?"
        message={`This will permanently delete ${deleteTarget?.code} and cannot be undone.`}
        confirmLabel="Delete"
        confirmVariant="danger"
      />

      <ConfirmDialog
        open={!!archiveTarget}
        onClose={() => setArchiveTarget(null)}
        onConfirm={handleArchive}
        title="Archive case?"
        message={`${archiveTarget?.code} will be moved to the archive. You can restore it later.`}
        confirmLabel="Archive"
        confirmVariant="primary"
      />
    </div>
  );
}
