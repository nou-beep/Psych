"use client";
// Dossier collaborateur — the per-person case detail. Tabs are
// client-side (no route change); sub-tools open in SideSheets.
// Séances reuse the Séance model with context 'therapist' and
// dossierId = collaborateur.id. Working memory reuses the
// MemoryRail scoped the same way.

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  CalendarClock,
  ClipboardCheck,
  ExternalLink,
  Eye,
  Plus,
  Trash2,
} from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/shared/SectionCard";
import { SideSheet } from "@/components/workspace/SideSheet";
import { MemoryRail } from "@/components/workspace/MemoryRail";
import LongitudinalChart from "@/components/clinical/LongitudinalChart";
import { SchemaButtonGroup } from "@/components/internship/SchemaButtons";
import { DemoBanner } from "@/components/therapist/DemoBanner";
import { useCollaborateurs } from "@/contexts/CollaborateurContext";
import { useSeances } from "@/contexts/SeanceContext";
import { useLocale, useT } from "@/contexts/LocaleContext";
import {
  currentRiskLevel,
  CONTACT_CHANNELS,
  COLLABORATEUR_STATUSES,
  type Collaborateur,
  type ContactChannel,
  type RiskLevel,
} from "@/lib/therapist/collaborateurs";
import {
  assembleSeanceText,
  seancesForDossier,
} from "@/lib/internship/seance";
import { WORKSHEET_LIBRARY } from "@/lib/clinical/worksheets-library";
import type { NamedSeries } from "@/lib/clinical/longitudinal";
import type { ScoreSchemaValue } from "@/lib/internship/score-set";

interface PageProps {
  params: { id: string };
}

const RISK_VALUES: ReadonlyArray<ScoreSchemaValue<string>> = [
  { value: "ok", label: "Stable", tone: "calm" },
  { value: "watch", label: "À surveiller", tone: "warning" },
  { value: "high", label: "Élevé", tone: "alarm" },
];

const RISK_TINT: Record<RiskLevel | "none", { bg: string; fg: string }> = {
  high: { bg: "#FEE2E2", fg: "#991B1B" },
  watch: { bg: "#FEF3C7", fg: "#92400E" },
  ok: { bg: "#D1FAE5", fg: "#065F46" },
  none: { bg: "var(--psych-bg)", fg: "var(--psych-muted)" },
};

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function CollaborateurDetailPage({ params }: PageProps) {
  const t = useT();
  const { formatDate } = useLocale();
  const store = useCollaborateurs();
  const seanceStore = useSeances();

  const collab = store.collaborateurs.find((c) => c.id === params.id);
  const [riskSheetOpen, setRiskSheetOpen] = useState(false);

  const seances = useMemo(
    () => seancesForDossier(seanceStore.seances, params.id),
    [seanceStore.seances, params.id]
  );

  if (!collab) {
    return (
      <div className="max-w-3xl mx-auto py-16 text-center">
        <p className="text-sm mb-4" style={{ color: "var(--psych-muted)" }}>
          {t("collab.empty")}
        </p>
        <Link href="/therapist/collaborateurs">
          <Button size="sm" variant="outline">
            <ArrowLeft size={12} /> {t("collab.rosterTitle")}
          </Button>
        </Link>
      </div>
    );
  }

  const level = currentRiskLevel(collab) ?? "none";
  const tint = RISK_TINT[level];

  const moodSeries: NamedSeries[] = [
    {
      id: "functioning",
      label: t("collab.suivi.functioning"),
      color: "#8E72CC",
      points: [...collab.moodEntries]
        .sort((a, b) => a.date.localeCompare(b.date))
        .map((m) => ({ date: m.date, value: m.functioning })),
    },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-4 animate-fade-in">
      <header className="flex items-start gap-3 flex-wrap">
        <div style={{ flex: 1, minWidth: 240 }}>
          <Link
            href="/therapist/collaborateurs"
            className="inline-flex items-center gap-1 text-xs"
            style={{ color: "var(--psych-muted)" }}
          >
            <ArrowLeft size={12} /> {t("collab.rosterTitle")}
          </Link>
          <h1
            className="text-xl font-bold mt-1"
            style={{ color: "var(--psych-text)" }}
          >
            {collab.displayName}
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--psych-muted)" }}>
            {collab.team} · {collab.role}
            {collab.manager ? ` · ${collab.manager}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-md"
            style={{ backgroundColor: tint.bg, color: tint.fg }}
          >
            {t(`collab.risk.${level}`)}
          </span>
          <Button size="sm" onClick={() => setRiskSheetOpen(true)}>
            {t("collab.risk.logNew")}
          </Button>
        </div>
      </header>

      {collab.isSample && <DemoBanner onClear={store.clearDemo} />}

      <Tabs defaultValue="apercu">
        <TabsList className="mb-4 flex-wrap">
          <TabsTrigger value="apercu">{t("collab.caseTabs.apercu")}</TabsTrigger>
          <TabsTrigger value="suivi">{t("collab.caseTabs.suivi")}</TabsTrigger>
          <TabsTrigger value="seances">{t("collab.caseTabs.seances")}</TabsTrigger>
          <TabsTrigger value="evaluations">
            {t("collab.caseTabs.evaluations")}
          </TabsTrigger>
          <TabsTrigger value="devoirs">
            {t("collab.caseTabs.devoirs")}
            {collab.assignments.filter((a) => !a.done).length > 0 &&
              ` (${collab.assignments.filter((a) => !a.done).length})`}
          </TabsTrigger>
          <TabsTrigger value="ressources">
            {t("collab.caseTabs.ressources")}
          </TabsTrigger>
          <TabsTrigger value="journal">{t("collab.caseTabs.journal")}</TabsTrigger>
        </TabsList>

        <TabsContent value="apercu">
          <ApercuTab collab={collab} t={t} />
        </TabsContent>

        <TabsContent value="suivi">
          <SuiviTab collab={collab} moodSeries={moodSeries} t={t} />
        </TabsContent>

        <TabsContent value="seances">
          <SectionCard
            title={t("seance.tabLabel")}
            action={
              <Button
                size="sm"
                onClick={() =>
                  seanceStore.create({
                    dossierId: collab.id,
                    context: "therapist",
                  })
                }
              >
                <Plus size={13} /> {t("seance.newSeance")}
              </Button>
            }
          >
            {seances.length === 0 ? (
              <p
                className="text-xs text-center py-6"
                style={{ color: "var(--psych-muted)" }}
              >
                {t("seance.emptyList")}
              </p>
            ) : (
              <div className="space-y-2">
                {seances.map((s) => (
                  <SeanceRow key={s.id} seanceId={s.id} t={t} />
                ))}
              </div>
            )}
          </SectionCard>
        </TabsContent>

        <TabsContent value="evaluations">
          <SectionCard title={t("collab.evaluations.title")}>
            <p className="text-xs mb-3" style={{ color: "var(--psych-muted)" }}>
              {t("collab.evaluations.desc")}
            </p>
            <ul className="text-xs space-y-2" style={{ color: "var(--psych-text)" }}>
              <li>· {t("collab.evaluations.phq9")}</li>
              <li>· {t("collab.evaluations.gad7")}</li>
              <li>· {t("collab.evaluations.burnoutShell")}</li>
            </ul>
            <div className="mt-3">
              <Link href="/formation/memoire/analyse">
                <Button size="sm" variant="outline">
                  <ExternalLink size={12} /> {t("collab.evaluations.openAnalyse")}
                </Button>
              </Link>
            </div>
          </SectionCard>
        </TabsContent>

        <TabsContent value="devoirs">
          <DevoirsTab collab={collab} t={t} />
        </TabsContent>

        <TabsContent value="ressources">
          <RessourcesTab collab={collab} t={t} />
        </TabsContent>

        <TabsContent value="journal">
          <JournalTab collab={collab} t={t} formatDate={formatDate} />
        </TabsContent>
      </Tabs>

      {/* Working memory scoped to this dossier */}
      <div style={{ height: 260 }}>
        <MemoryRail sessionId={collab.id} density="compact" />
      </div>

      {/* Risk logging SideSheet */}
      <RiskSheet
        open={riskSheetOpen}
        onClose={() => setRiskSheetOpen(false)}
        collab={collab}
        t={t}
      />
    </div>
  );
}

// ─── Tabs ────────────────────────────────────────────────────

type TFn = ReturnType<typeof useT>;

function ApercuTab({ collab, t }: { collab: Collaborateur; t: TFn }) {
  const store = useCollaborateurs();
  return (
    <SectionCard title={t("collab.caseTabs.apercu")}>
      <dl className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        <InfoField label={t("collab.fields.team")} value={collab.team} />
        <InfoField label={t("collab.fields.role")} value={collab.role} />
        <InfoField
          label={t("collab.fields.manager")}
          value={collab.manager ?? "—"}
        />
        <div>
          <dt
            className="text-[10px] uppercase tracking-wider mb-1"
            style={{ color: "var(--psych-muted)" }}
          >
            {t("collab.fields.status")}
          </dt>
          <dd>
            <select
              value={collab.status}
              onChange={(e) =>
                store.patch(collab.id, {
                  status: e.target.value as Collaborateur["status"],
                })
              }
              className="text-xs px-2 py-1.5 rounded-lg border"
              style={{
                borderColor: "var(--psych-border)",
                background: "var(--psych-bg)",
                color: "var(--psych-text)",
              }}
            >
              {COLLABORATEUR_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {t(`collab.status.${s}`)}
                </option>
              ))}
            </select>
          </dd>
        </div>
      </dl>

      {/* Risk history */}
      {collab.riskEntries.length > 0 && (
        <div className="mt-4">
          <h3
            className="text-[10px] uppercase tracking-wider mb-2"
            style={{ color: "var(--psych-muted)" }}
          >
            {t("collab.risk.label")}
          </h3>
          <div className="space-y-1">
            {[...collab.riskEntries]
              .sort((a, b) => b.date.localeCompare(a.date))
              .slice(0, 5)
              .map((r) => (
                <div
                  key={r.id}
                  className="flex items-center gap-2 text-xs px-2 py-1.5 rounded-lg border"
                  style={{
                    borderColor: "var(--psych-border)",
                    color: "var(--psych-text)",
                  }}
                >
                  <span style={{ color: "var(--psych-muted)" }}>{r.date}</span>
                  <span className="flex-1" />
                  <RiskPill label={t("collab.risk.flight")} level={r.flightRisk} t={t} />
                  <RiskPill label={t("collab.risk.burnout")} level={r.burnoutRisk} t={t} />
                </div>
              ))}
          </div>
        </div>
      )}
    </SectionCard>
  );
}

function RiskPill({
  label,
  level,
  t,
}: {
  label: string;
  level: RiskLevel;
  t: TFn;
}) {
  const tint = RISK_TINT[level];
  return (
    <span
      className="text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-md"
      style={{ backgroundColor: tint.bg, color: tint.fg }}
      title={label}
    >
      {t(`collab.risk.${level}`)}
    </span>
  );
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt
        className="text-[10px] uppercase tracking-wider mb-1"
        style={{ color: "var(--psych-muted)" }}
      >
        {label}
      </dt>
      <dd style={{ color: "var(--psych-text)" }}>{value}</dd>
    </div>
  );
}

function SuiviTab({
  collab,
  moodSeries,
  t,
}: {
  collab: Collaborateur;
  moodSeries: NamedSeries[];
  t: TFn;
}) {
  const store = useCollaborateurs();
  const [functioning, setFunctioning] = useState("");
  const [date, setDate] = useState(todayISO());
  const [note, setNote] = useState("");
  const [absDate, setAbsDate] = useState(todayISO());
  const [absDays, setAbsDays] = useState("");
  const [absReason, setAbsReason] = useState("");
  const [depDate, setDepDate] = useState(todayISO());
  const [depReason, setDepReason] = useState("");

  function addMood() {
    const f = parseFloat(functioning);
    if (!Number.isFinite(f) || f < 0 || f > 10) return;
    store.logMood(collab.id, {
      date,
      functioning: f,
      note: note.trim() || undefined,
    });
    setFunctioning("");
    setNote("");
  }

  function addAbsence() {
    const d = parseFloat(absDays);
    if (!Number.isFinite(d) || d <= 0) return;
    store.logAbsence(collab.id, {
      date: absDate,
      days: d,
      reason: absReason.trim() || undefined,
    });
    setAbsDays("");
    setAbsReason("");
  }

  const inputStyle: React.CSSProperties = {
    padding: "0.4rem 0.6rem",
    borderRadius: 8,
    border: "1px solid var(--psych-border)",
    background: "var(--psych-bg)",
    color: "var(--psych-text)",
    fontSize: 12,
  };

  return (
    <div className="space-y-4">
      <SectionCard title={t("collab.suivi.title")}>
        <p className="text-xs mb-3" style={{ color: "var(--psych-muted)" }}>
          {t("collab.suivi.desc")}
        </p>
        {collab.moodEntries.length === 0 ? (
          <p className="text-xs py-4 text-center" style={{ color: "var(--psych-muted)" }}>
            {t("collab.suivi.noEntries")}
          </p>
        ) : (
          <LongitudinalChart series={moodSeries} />
        )}
        <div className="flex items-end gap-2 flex-wrap mt-3">
          <label className="text-[10px]" style={{ color: "var(--psych-muted)" }}>
            {t("collab.suivi.date")}
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={inputStyle}
              className="block mt-1"
            />
          </label>
          <label className="text-[10px]" style={{ color: "var(--psych-muted)" }}>
            {t("collab.suivi.functioning")}
            <input
              type="number"
              min={0}
              max={10}
              step={1}
              value={functioning}
              onChange={(e) => setFunctioning(e.target.value)}
              style={{ ...inputStyle, width: 90 }}
              className="block mt-1"
            />
          </label>
          <label
            className="text-[10px] flex-1 min-w-[160px]"
            style={{ color: "var(--psych-muted)" }}
          >
            {t("collab.suivi.note")}
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              style={{ ...inputStyle, width: "100%" }}
              className="block mt-1"
            />
          </label>
          <Button size="sm" onClick={addMood} disabled={functioning === ""}>
            <Plus size={12} /> {t("collab.suivi.addEntry")}
          </Button>
        </div>
      </SectionCard>

      <SectionCard title={t("collab.suivi.absenceTitle")}>
        {collab.absenceEntries.length === 0 ? (
          <p className="text-xs mb-3" style={{ color: "var(--psych-muted)" }}>
            {t("collab.suivi.noAbsences")}
          </p>
        ) : (
          <ul className="text-xs space-y-1 mb-3" style={{ color: "var(--psych-text)" }}>
            {[...collab.absenceEntries]
              .sort((a, b) => b.date.localeCompare(a.date))
              .map((a) => (
                <li key={a.id}>
                  · {a.date} — {a.days} j{a.reason ? ` (${a.reason})` : ""}
                </li>
              ))}
          </ul>
        )}
        <div className="flex items-end gap-2 flex-wrap">
          <label className="text-[10px]" style={{ color: "var(--psych-muted)" }}>
            {t("collab.suivi.date")}
            <input
              type="date"
              value={absDate}
              onChange={(e) => setAbsDate(e.target.value)}
              style={inputStyle}
              className="block mt-1"
            />
          </label>
          <label className="text-[10px]" style={{ color: "var(--psych-muted)" }}>
            {t("collab.suivi.absenceDays")}
            <input
              type="number"
              min={0.5}
              step={0.5}
              value={absDays}
              onChange={(e) => setAbsDays(e.target.value)}
              style={{ ...inputStyle, width: 80 }}
              className="block mt-1"
            />
          </label>
          <label
            className="text-[10px] flex-1 min-w-[140px]"
            style={{ color: "var(--psych-muted)" }}
          >
            {t("collab.suivi.absenceReason")}
            <input
              value={absReason}
              onChange={(e) => setAbsReason(e.target.value)}
              style={{ ...inputStyle, width: "100%" }}
              className="block mt-1"
            />
          </label>
          <Button size="sm" variant="outline" onClick={addAbsence} disabled={absDays === ""}>
            <Plus size={12} /> {t("collab.suivi.addAbsence")}
          </Button>
        </div>
      </SectionCard>

      <SectionCard title={t("collab.suivi.departureTitle")}>
        {collab.departure ? (
          <div className="flex items-center gap-3 flex-wrap">
            <p className="text-xs m-0" style={{ color: "var(--psych-text)" }}>
              {t("collab.suivi.departureRecorded", {
                date: collab.departure.date,
              })}
              {collab.departure.reason ? ` (${collab.departure.reason})` : ""}
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => store.recordDeparture(collab.id, null)}
            >
              {t("collab.suivi.cancelDeparture")}
            </Button>
          </div>
        ) : (
          <div className="flex items-end gap-2 flex-wrap">
            <label className="text-[10px]" style={{ color: "var(--psych-muted)" }}>
              {t("collab.suivi.date")}
              <input
                type="date"
                value={depDate}
                onChange={(e) => setDepDate(e.target.value)}
                style={inputStyle}
                className="block mt-1"
              />
            </label>
            <label
              className="text-[10px] flex-1 min-w-[140px]"
              style={{ color: "var(--psych-muted)" }}
            >
              {t("collab.suivi.departureReason")}
              <input
                value={depReason}
                onChange={(e) => setDepReason(e.target.value)}
                style={{ ...inputStyle, width: "100%" }}
                className="block mt-1"
              />
            </label>
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                store.recordDeparture(collab.id, {
                  date: depDate,
                  reason: depReason.trim() || undefined,
                })
              }
            >
              {t("collab.suivi.recordDeparture")}
            </Button>
          </div>
        )}
      </SectionCard>
    </div>
  );
}

function SeanceRow({ seanceId, t }: { seanceId: string; t: TFn }) {
  const seanceStore = useSeances();
  const { formatDate } = useLocale();
  const [open, setOpen] = useState(false);
  const s = seanceStore.seances.find((x) => x.id === seanceId);
  if (!s) return null;
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all hover:scale-[1.01]"
        style={{
          backgroundColor: "var(--psych-bg)",
          borderColor: "var(--psych-border)",
          color: "var(--psych-text)",
        }}
      >
        <CalendarClock size={14} style={{ color: "var(--psych-primary)", flexShrink: 0 }} />
        <span className="flex-1 text-sm">{formatDate(s.date)}</span>
        <span className="text-[10px]" style={{ color: "var(--psych-muted)" }}>
          {t(`seance.status.${s.status}`)}
        </span>
        <Eye size={13} style={{ color: "var(--psych-muted)" }} />
      </button>
      <SideSheet
        open={open}
        onClose={() => setOpen(false)}
        title={`${t("seance.title")} · ${formatDate(s.date)}`}
        description={t("seance.assembled.desc")}
      >
        <pre
          className="text-xs whitespace-pre-wrap p-3 rounded-lg border"
          style={{
            borderColor: "var(--psych-border)",
            background: "var(--psych-bg)",
            color: "var(--psych-text)",
            fontFamily:
              "var(--font-mono, ui-monospace, SFMono-Regular, Menlo, monospace)",
          }}
        >
          {assembleSeanceText(s)}
        </pre>
      </SideSheet>
    </>
  );
}

function DevoirsTab({ collab, t }: { collab: Collaborateur; t: TFn }) {
  const store = useCollaborateurs();
  const [worksheetId, setWorksheetId] = useState("");
  const [freeText, setFreeText] = useState("");
  const [dueDate, setDueDate] = useState("");

  function submit() {
    if (!worksheetId && !freeText.trim()) return;
    store.assign(collab.id, {
      worksheetId: worksheetId || undefined,
      text: freeText.trim() || undefined,
      dueDate: dueDate || undefined,
    });
    setWorksheetId("");
    setFreeText("");
    setDueDate("");
  }

  function labelFor(a: Collaborateur["assignments"][number]): string {
    if (a.worksheetId) {
      const w = WORKSHEET_LIBRARY.find((x) => x.id === a.worksheetId);
      return w?.title ?? a.worksheetId;
    }
    return a.text ?? "—";
  }

  const inputStyle: React.CSSProperties = {
    padding: "0.4rem 0.6rem",
    borderRadius: 8,
    border: "1px solid var(--psych-border)",
    background: "var(--psych-bg)",
    color: "var(--psych-text)",
    fontSize: 12,
  };

  return (
    <SectionCard title={t("collab.devoirs.title")}>
      {collab.assignments.length === 0 ? (
        <p className="text-xs mb-3" style={{ color: "var(--psych-muted)" }}>
          {t("collab.devoirs.none")}
        </p>
      ) : (
        <ul className="space-y-1 mb-3">
          {collab.assignments.map((a) => (
            <li key={a.id} className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={a.done}
                onChange={() => store.toggleAssign(collab.id, a.id)}
              />
              <span
                className="flex-1 min-w-0"
                style={{
                  color: "var(--psych-text)",
                  textDecoration: a.done ? "line-through" : "none",
                  opacity: a.done ? 0.6 : 1,
                }}
              >
                {labelFor(a)}
                {a.dueDate && (
                  <span style={{ color: "var(--psych-muted)" }}>
                    {" "}
                    · {a.dueDate}
                  </span>
                )}
              </span>
              <button
                onClick={() => store.removeAssign(collab.id, a.id)}
                className="p-0.5 rounded"
                style={{ color: "#9F1239" }}
                aria-label={t("common.delete")}
              >
                <Trash2 size={10} />
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="flex items-end gap-2 flex-wrap">
        <label className="text-[10px]" style={{ color: "var(--psych-muted)" }}>
          {t("collab.devoirs.fromLibrary")}
          <select
            value={worksheetId}
            onChange={(e) => setWorksheetId(e.target.value)}
            style={{ ...inputStyle, maxWidth: 220 }}
            className="block mt-1"
          >
            <option value="">—</option>
            {WORKSHEET_LIBRARY.map((w) => (
              <option key={w.id} value={w.id}>
                {w.title}
              </option>
            ))}
          </select>
        </label>
        <label
          className="text-[10px] flex-1 min-w-[160px]"
          style={{ color: "var(--psych-muted)" }}
        >
          {t("collab.devoirs.freeText")}
          <input
            value={freeText}
            onChange={(e) => setFreeText(e.target.value)}
            style={{ ...inputStyle, width: "100%" }}
            className="block mt-1"
          />
        </label>
        <label className="text-[10px]" style={{ color: "var(--psych-muted)" }}>
          {t("collab.devoirs.dueDate")}
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            style={inputStyle}
            className="block mt-1"
          />
        </label>
        <Button
          size="sm"
          onClick={submit}
          disabled={!worksheetId && !freeText.trim()}
        >
          <ClipboardCheck size={12} /> {t("collab.devoirs.add")}
        </Button>
      </div>
    </SectionCard>
  );
}

function RessourcesTab({ collab, t }: { collab: Collaborateur; t: TFn }) {
  const store = useCollaborateurs();
  const [label, setLabel] = useState("");
  const [note, setNote] = useState("");

  const inputStyle: React.CSSProperties = {
    padding: "0.4rem 0.6rem",
    borderRadius: 8,
    border: "1px solid var(--psych-border)",
    background: "var(--psych-bg)",
    color: "var(--psych-text)",
    fontSize: 12,
  };

  return (
    <SectionCard title={t("collab.ressources.title")}>
      {collab.resources.length === 0 ? (
        <p className="text-xs mb-3" style={{ color: "var(--psych-muted)" }}>
          {t("collab.ressources.none")}
        </p>
      ) : (
        <ul className="space-y-1 mb-3">
          {collab.resources.map((r) => (
            <li key={r.id} className="flex items-center gap-2 text-xs">
              <span className="flex-1 min-w-0" style={{ color: "var(--psych-text)" }}>
                {r.label}
                {r.note && (
                  <span style={{ color: "var(--psych-muted)" }}> — {r.note}</span>
                )}
              </span>
              <button
                onClick={() => store.removeCaseResource(collab.id, r.id)}
                className="p-0.5 rounded"
                style={{ color: "#9F1239" }}
                aria-label={t("common.delete")}
              >
                <Trash2 size={10} />
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="flex items-end gap-2 flex-wrap">
        <label
          className="text-[10px] flex-1 min-w-[140px]"
          style={{ color: "var(--psych-muted)" }}
        >
          {t("collab.ressources.label")}
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            style={{ ...inputStyle, width: "100%" }}
            className="block mt-1"
          />
        </label>
        <label
          className="text-[10px] flex-1 min-w-[140px]"
          style={{ color: "var(--psych-muted)" }}
        >
          {t("collab.ressources.note")}
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            style={{ ...inputStyle, width: "100%" }}
            className="block mt-1"
          />
        </label>
        <Button
          size="sm"
          onClick={() => {
            if (!label.trim()) return;
            store.addCaseResource(collab.id, {
              label: label.trim(),
              note: note.trim() || undefined,
            });
            setLabel("");
            setNote("");
          }}
          disabled={!label.trim()}
        >
          <Plus size={12} /> {t("collab.ressources.add")}
        </Button>
      </div>
    </SectionCard>
  );
}

function JournalTab({
  collab,
  t,
  formatDate,
}: {
  collab: Collaborateur;
  t: TFn;
  formatDate: (d: Date | string, o?: Intl.DateTimeFormatOptions) => string;
}) {
  const store = useCollaborateurs();
  const [date, setDate] = useState(todayISO());
  const [channel, setChannel] = useState<ContactChannel>("whatsapp");
  const [summary, setSummary] = useState("");
  const [seemed, setSeemed] = useState("");

  const inputStyle: React.CSSProperties = {
    padding: "0.4rem 0.6rem",
    borderRadius: 8,
    border: "1px solid var(--psych-border)",
    background: "var(--psych-bg)",
    color: "var(--psych-text)",
    fontSize: 12,
  };

  return (
    <SectionCard title={t("collab.journal.title")}>
      <p className="text-xs mb-3" style={{ color: "var(--psych-muted)" }}>
        {t("collab.journal.desc")}
      </p>
      {collab.checkIns.length === 0 ? (
        <p className="text-xs mb-3" style={{ color: "var(--psych-muted)" }}>
          {t("collab.journal.none")}
        </p>
      ) : (
        <div className="space-y-1 mb-3">
          {[...collab.checkIns]
            .sort((a, b) => b.date.localeCompare(a.date))
            .map((k) => (
              <div
                key={k.id}
                className="text-xs px-3 py-2 rounded-lg border"
                style={{
                  borderColor: "var(--psych-border)",
                  color: "var(--psych-text)",
                }}
              >
                <div className="flex items-center gap-2">
                  <span style={{ color: "var(--psych-muted)" }}>
                    {formatDate(k.date)}
                  </span>
                  <span
                    className="text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-md"
                    style={{
                      backgroundColor: "var(--psych-primary-light)",
                      color: "var(--psych-primary)",
                    }}
                  >
                    {t(`collab.journal.channels.${k.channel}`)}
                  </span>
                </div>
                <p className="m-0 mt-1">{k.summary}</p>
                {k.seemed && (
                  <p className="m-0 mt-0.5 italic" style={{ color: "var(--psych-muted)" }}>
                    {k.seemed}
                  </p>
                )}
              </div>
            ))}
        </div>
      )}
      <div className="flex items-end gap-2 flex-wrap">
        <label className="text-[10px]" style={{ color: "var(--psych-muted)" }}>
          {t("collab.suivi.date")}
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={inputStyle}
            className="block mt-1"
          />
        </label>
        <label className="text-[10px]" style={{ color: "var(--psych-muted)" }}>
          {t("collab.journal.channel")}
          <select
            value={channel}
            onChange={(e) => setChannel(e.target.value as ContactChannel)}
            style={inputStyle}
            className="block mt-1"
          >
            {CONTACT_CHANNELS.map((c) => (
              <option key={c} value={c}>
                {t(`collab.journal.channels.${c}`)}
              </option>
            ))}
          </select>
        </label>
        <label
          className="text-[10px] flex-1 min-w-[160px]"
          style={{ color: "var(--psych-muted)" }}
        >
          {t("collab.journal.summary")}
          <input
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            style={{ ...inputStyle, width: "100%" }}
            className="block mt-1"
          />
        </label>
        <label
          className="text-[10px] flex-1 min-w-[140px]"
          style={{ color: "var(--psych-muted)" }}
        >
          {t("collab.journal.seemed")}
          <input
            value={seemed}
            onChange={(e) => setSeemed(e.target.value)}
            placeholder={t("collab.journal.seemedPlaceholder")}
            style={{ ...inputStyle, width: "100%" }}
            className="block mt-1"
          />
        </label>
        <Button
          size="sm"
          onClick={() => {
            if (!summary.trim()) return;
            store.logCheckIn(collab.id, {
              date,
              channel,
              summary: summary.trim(),
              seemed: seemed.trim() || undefined,
            });
            setSummary("");
            setSeemed("");
          }}
          disabled={!summary.trim()}
        >
          <Plus size={12} /> {t("collab.journal.add")}
        </Button>
      </div>
    </SectionCard>
  );
}

function RiskSheet({
  open,
  onClose,
  collab,
  t,
}: {
  open: boolean;
  onClose: () => void;
  collab: Collaborateur;
  t: TFn;
}) {
  const store = useCollaborateurs();
  const [flight, setFlight] = useState<string | undefined>();
  const [burnout, setBurnout] = useState<string | undefined>();
  const [note, setNote] = useState("");
  const [date, setDate] = useState(todayISO());

  function submit() {
    if (!flight || !burnout) return;
    store.logRisk(collab.id, {
      date,
      flightRisk: flight as RiskLevel,
      burnoutRisk: burnout as RiskLevel,
      note: note.trim() || undefined,
    });
    setFlight(undefined);
    setBurnout(undefined);
    setNote("");
    onClose();
  }

  return (
    <SideSheet
      open={open}
      onClose={onClose}
      title={t("collab.risk.logNew")}
      footer={
        <>
          <Button size="sm" variant="outline" onClick={onClose}>
            {t("common.cancel")}
          </Button>
          <Button size="sm" onClick={submit} disabled={!flight || !burnout}>
            {t("common.save")}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <label className="block text-xs" style={{ color: "var(--psych-muted)" }}>
          {t("collab.suivi.date")}
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="block mt-1 text-xs px-2 py-1.5 rounded-lg border"
            style={{
              borderColor: "var(--psych-border)",
              background: "var(--psych-bg)",
              color: "var(--psych-text)",
            }}
          />
        </label>
        <div>
          <p className="text-xs mb-1" style={{ color: "var(--psych-muted)" }}>
            {t("collab.risk.flight")}
          </p>
          <SchemaButtonGroup
            values={RISK_VALUES}
            current={flight}
            onPick={setFlight}
            onClear={() => setFlight(undefined)}
          />
        </div>
        <div>
          <p className="text-xs mb-1" style={{ color: "var(--psych-muted)" }}>
            {t("collab.risk.burnout")}
          </p>
          <SchemaButtonGroup
            values={RISK_VALUES}
            current={burnout}
            onPick={setBurnout}
            onClear={() => setBurnout(undefined)}
          />
        </div>
        <label className="block text-xs" style={{ color: "var(--psych-muted)" }}>
          {t("collab.suivi.note")}
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            className="block mt-1 w-full text-xs px-2 py-1.5 rounded-lg border resize-y"
            style={{
              borderColor: "var(--psych-border)",
              background: "var(--psych-bg)",
              color: "var(--psych-text)",
            }}
          />
        </label>
      </div>
    </SideSheet>
  );
}
