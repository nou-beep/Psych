"use client";
// Roster — the caseload list. One dossier per collaborateur.
// Search + team/risk filters, new-collaborateur SideSheet, demo
// seed/clear, and the data-safety export/import block.

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  Download,
  FlaskConical,
  Plus,
  Search,
  Upload,
  Users,
} from "lucide-react";

import { SideSheet } from "@/components/workspace/SideSheet";
import { SectionCard } from "@/components/shared/SectionCard";
import { Button } from "@/components/ui/button";
import { DemoBanner } from "@/components/therapist/DemoBanner";
import { useToast } from "@/components/ui/Toast";
import { useCollaborateurs } from "@/contexts/CollaborateurContext";
import { useT } from "@/contexts/LocaleContext";
import {
  currentRiskLevel,
  type Collaborateur,
  type RiskLevel,
} from "@/lib/therapist/collaborateurs";

const RISK_TINT: Record<RiskLevel | "none", { bg: string; fg: string }> = {
  high: { bg: "#FEE2E2", fg: "#991B1B" },
  watch: { bg: "#FEF3C7", fg: "#92400E" },
  ok: { bg: "#D1FAE5", fg: "#065F46" },
  none: { bg: "var(--psych-bg)", fg: "var(--psych-muted)" },
};

export default function CollaborateursRosterPage() {
  const t = useT();
  const { toast } = useToast();
  const store = useCollaborateurs();
  const [query, setQuery] = useState("");
  const [teamFilter, setTeamFilter] = useState("");
  const [riskFilter, setRiskFilter] = useState("");
  const [newOpen, setNewOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const teams = useMemo(
    () =>
      Array.from(new Set(store.collaborateurs.map((c) => c.team))).sort(
        (a, b) => a.localeCompare(b)
      ),
    [store.collaborateurs]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return store.collaborateurs.filter((c) => {
      if (teamFilter && c.team !== teamFilter) return false;
      const level = currentRiskLevel(c) ?? "none";
      if (riskFilter && level !== riskFilter) return false;
      if (!q) return true;
      return (
        c.displayName.toLowerCase().includes(q) ||
        c.team.toLowerCase().includes(q) ||
        c.role.toLowerCase().includes(q)
      );
    });
  }, [store.collaborateurs, query, teamFilter, riskFilter]);

  function exportData() {
    const json = store.exportJSON();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `eyla-collaborateurs-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function onImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const ok = store.importJSON(String(reader.result));
      toast(
        ok ? t("collab.safety.importSuccess") : t("collab.safety.importError"),
        ok ? "success" : "error"
      );
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  return (
    <div className="max-w-5xl mx-auto space-y-4 animate-fade-in">
      <header className="flex items-start gap-3 flex-wrap">
        <div style={{ flex: 1, minWidth: 240 }}>
          <h1 className="text-2xl font-bold" style={{ color: "var(--psych-text)" }}>
            {t("collab.rosterTitle")}
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--psych-muted)" }}>
            {t("collab.rosterDesc")}
          </p>
        </div>
        <Button size="sm" onClick={() => setNewOpen(true)}>
          <Plus size={13} /> {t("collab.newCollaborateur")}
        </Button>
      </header>

      {store.hasDemo && <DemoBanner onClear={store.clearDemo} />}

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-xl border flex-1 min-w-[200px]"
          style={{
            borderColor: "var(--psych-border)",
            background: "var(--psych-card)",
          }}
        >
          <Search size={13} style={{ color: "var(--psych-muted)" }} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("collab.searchPlaceholder")}
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: "var(--psych-text)" }}
          />
        </div>
        <select
          value={teamFilter}
          onChange={(e) => setTeamFilter(e.target.value)}
          className="text-sm px-3 py-2 rounded-xl border"
          style={{
            borderColor: "var(--psych-border)",
            background: "var(--psych-card)",
            color: "var(--psych-text)",
          }}
        >
          <option value="">{t("collab.allTeams")}</option>
          {teams.map((team) => (
            <option key={team} value={team}>
              {team}
            </option>
          ))}
        </select>
        <select
          value={riskFilter}
          onChange={(e) => setRiskFilter(e.target.value)}
          className="text-sm px-3 py-2 rounded-xl border"
          style={{
            borderColor: "var(--psych-border)",
            background: "var(--psych-card)",
            color: "var(--psych-text)",
          }}
        >
          <option value="">{t("collab.allRisks")}</option>
          {(["high", "watch", "ok", "none"] as const).map((r) => (
            <option key={r} value={r}>
              {t(`collab.risk.${r}`)}
            </option>
          ))}
        </select>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <SectionCard>
          <div className="text-center py-10">
            <Users
              size={28}
              className="mx-auto mb-3"
              style={{ color: "var(--psych-muted)" }}
            />
            <p className="text-sm mb-4" style={{ color: "var(--psych-muted)" }}>
              {t("collab.empty")}
            </p>
            {!store.hasDemo && store.collaborateurs.length === 0 && (
              <Button size="sm" variant="outline" onClick={store.seedDemo}>
                <FlaskConical size={13} /> {t("collab.seedDemo")}
              </Button>
            )}
          </div>
        </SectionCard>
      ) : (
        <div className="space-y-2">
          {filtered.map((c) => (
            <RosterRow key={c.id} c={c} t={t} />
          ))}
        </div>
      )}

      {/* Data safety */}
      <SectionCard title={t("collab.safety.title")}>
        <p className="text-xs mb-3" style={{ color: "var(--psych-muted)" }}>
          {t("collab.safety.desc")}
        </p>
        <div className="flex items-center gap-2 flex-wrap">
          <Button size="sm" variant="outline" onClick={exportData}>
            <Download size={13} /> {t("collab.safety.export")}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => fileRef.current?.click()}
          >
            <Upload size={13} /> {t("collab.safety.import")}
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            onChange={onImportFile}
            className="hidden"
          />
        </div>
      </SectionCard>

      <NewCollaborateurSheet
        open={newOpen}
        onClose={() => setNewOpen(false)}
        t={t}
      />
    </div>
  );
}

// ─── Subcomponents ───────────────────────────────────────────

type TFn = ReturnType<typeof useT>;

function RosterRow({ c, t }: { c: Collaborateur; t: TFn }) {
  const level = currentRiskLevel(c) ?? "none";
  const tint = RISK_TINT[level];
  return (
    <Link
      href={`/therapist/collaborateurs/${c.id}`}
      className="flex items-center gap-3 p-3 rounded-xl border transition-all hover:scale-[1.01]"
      style={{
        backgroundColor: "var(--psych-card)",
        borderColor: "var(--psych-border)",
        color: "var(--psych-text)",
        opacity: c.status === "clos" ? 0.6 : 1,
      }}
    >
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
        style={{
          background: "linear-gradient(135deg, var(--psych-primary), var(--psych-accent))",
        }}
      >
        {c.displayName.slice(0, 2).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium m-0 truncate">
          {c.displayName}
          {c.isSample && (
            <span
              className="ml-2 text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-md"
              style={{ background: "rgba(245,158,11,0.15)", color: "#92400E" }}
            >
              {t("collab.demoBadge")}
            </span>
          )}
        </p>
        <p className="text-xs m-0 truncate" style={{ color: "var(--psych-muted)" }}>
          {c.team} · {c.role}
          {c.manager ? ` · ${c.manager}` : ""}
        </p>
      </div>
      <span
        className="text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-md flex-shrink-0"
        style={{ backgroundColor: tint.bg, color: tint.fg }}
      >
        {t(`collab.risk.${level}`)}
      </span>
      <span
        className="text-[10px] px-2 py-1 rounded-md flex-shrink-0"
        style={{ background: "var(--psych-bg)", color: "var(--psych-muted)" }}
      >
        {t(`collab.status.${c.status}`)}
      </span>
      <ArrowRight size={14} style={{ color: "var(--psych-muted)", flexShrink: 0 }} />
    </Link>
  );
}

function NewCollaborateurSheet({
  open,
  onClose,
  t,
}: {
  open: boolean;
  onClose: () => void;
  t: TFn;
}) {
  const store = useCollaborateurs();
  const [displayName, setDisplayName] = useState("");
  const [team, setTeam] = useState("");
  const [role, setRole] = useState("");
  const [manager, setManager] = useState("");

  function submit() {
    if (!displayName.trim() || !team.trim() || !role.trim()) return;
    store.create({
      displayName: displayName.trim(),
      team: team.trim(),
      role: role.trim(),
      manager: manager.trim() || undefined,
    });
    setDisplayName("");
    setTeam("");
    setRole("");
    setManager("");
    onClose();
  }

  const fieldStyle: React.CSSProperties = {
    width: "100%",
    padding: "0.5rem 0.7rem",
    borderRadius: 10,
    border: "1px solid var(--psych-border)",
    background: "var(--psych-bg)",
    color: "var(--psych-text)",
    fontSize: 13,
  };

  return (
    <SideSheet
      open={open}
      onClose={onClose}
      title={t("collab.newCollaborateur")}
      footer={
        <>
          <Button size="sm" variant="outline" onClick={onClose}>
            {t("common.cancel")}
          </Button>
          <Button
            size="sm"
            onClick={submit}
            disabled={!displayName.trim() || !team.trim() || !role.trim()}
          >
            {t("common.create")}
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        <label className="block text-xs" style={{ color: "var(--psych-muted)" }}>
          {t("collab.fields.displayName")}
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            style={fieldStyle}
            className="mt-1"
          />
          <span className="block mt-1 text-[10px]">
            {t("collab.fields.displayNameHint")}
          </span>
        </label>
        <label className="block text-xs" style={{ color: "var(--psych-muted)" }}>
          {t("collab.fields.team")}
          <input
            value={team}
            onChange={(e) => setTeam(e.target.value)}
            style={fieldStyle}
            className="mt-1"
          />
        </label>
        <label className="block text-xs" style={{ color: "var(--psych-muted)" }}>
          {t("collab.fields.role")}
          <input
            value={role}
            onChange={(e) => setRole(e.target.value)}
            style={fieldStyle}
            className="mt-1"
          />
        </label>
        <label className="block text-xs" style={{ color: "var(--psych-muted)" }}>
          {t("collab.fields.manager")}
          <input
            value={manager}
            onChange={(e) => setManager(e.target.value)}
            style={fieldStyle}
            className="mt-1"
          />
        </label>
      </div>
    </SideSheet>
  );
}
