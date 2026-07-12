"use client";
// Espace séance — the per-session work surface for one séance inside
// a dossier de stage. Four-slot shell:
//   LEFT   contexte du dossier (read-only) + séances précédentes
//   CENTER observations structurées (ScoreSet frequencySchema via
//          SchemaButtonGroup) + notes discrètes, as FocusBlock cards
//   RIGHT  MemoryRail + SideSheets (évaluations liées, fiches liées)
//   BOTTOM chronologie + devoirs + actions de suivi + prochain RDV
//          + vue assemblée (deterministic formatting, no inference)
//
// Everything autosaves through SeanceContext — no Save button.
// Slots never route away: SideSheet + FocusBlock only.

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Archive,
  ArchiveRestore,
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  ClipboardCheck,
  Eye,
  FileText,
  ListChecks,
  Lock,
  MessageSquare,
  Plus,
  Trash2,
  Unlock,
} from "lucide-react";

import { FocusBlock } from "@/components/workspace/FocusBlock";
import { SideSheet } from "@/components/workspace/SideSheet";
import { MemoryRail } from "@/components/workspace/MemoryRail";
import { SchemaButtonGroup } from "@/components/internship/SchemaButtons";
import { Button } from "@/components/ui/button";
import { useInternship } from "@/contexts/InternshipContext";
import { useSeances } from "@/contexts/SeanceContext";
import { useLocale, useT } from "@/contexts/LocaleContext";
import { frequencySchema } from "@/lib/internship/score-set-schemas";
import {
  assembleSeanceText,
  seancesForDossier,
  sessionPermissions,
  SEANCE_NOTE_TYPES,
  SEANCE_OBSERVATION_CATEGORIES,
  type Seance,
  type SeanceNoteType,
  type SeanceObservationCategory,
} from "@/lib/internship/seance";
import { WORKSHEET_LIBRARY } from "@/lib/clinical/worksheets-library";

interface PageProps {
  params: { id: string; seanceId: string };
}

export default function SeanceWorkspacePage({ params }: PageProps) {
  const t = useT();
  const { formatDate } = useLocale();
  const { cases, scorableAdmins, scoreSetAdmins } = useInternship();
  const seanceStore = useSeances();

  const dossier = cases.find((c) => c.id === params.id);
  const seance = seanceStore.seances.find((s) => s.id === params.seanceId);

  const siblings = useMemo(
    () => seancesForDossier(seanceStore.seances, params.id),
    [seanceStore.seances, params.id]
  );

  const caseAssessments = useMemo(() => {
    const scorable = scorableAdmins
      .filter((a) => a.caseId === params.id)
      .map((a) => ({ id: a.id, name: a.name, date: a.date }));
    const scoreSet = scoreSetAdmins
      .filter((a) => a.caseId === params.id)
      .map((a) => ({ id: a.id, name: a.name, date: a.date }));
    return [...scorable, ...scoreSet];
  }, [scorableAdmins, scoreSetAdmins, params.id]);

  const [assessmentSheetOpen, setAssessmentSheetOpen] = useState(false);
  const [worksheetSheetOpen, setWorksheetSheetOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!dossier) {
    return (
      <EmptyShell message={t("seance.dossierNotFound")} backHref="/formation/internship/cases" t={t} />
    );
  }
  if (!seance) {
    return (
      <EmptyShell
        message={t("seance.notFound")}
        backHref={`/formation/internship/cases/${params.id}`}
        t={t}
      />
    );
  }

  const perms = sessionPermissions(seance.context, seance.status);
  const isEmpty =
    seance.notes.length === 0 &&
    seance.observations.length === 0 &&
    seance.homework.length === 0 &&
    seance.followUps.length === 0 &&
    !seance.nextAppointment;

  async function copyAssembled() {
    if (typeof navigator === "undefined" || !navigator.clipboard || !seance)
      return;
    await navigator.clipboard.writeText(assembleSeanceText(seance));
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="max-w-7xl mx-auto animate-fade-in" data-seance-workspace>
      {/* Header */}
      <header
        className="flex items-start gap-3 flex-wrap"
        style={{ marginBottom: "1rem" }}
      >
        <div style={{ flex: 1, minWidth: 240 }}>
          <Link
            href={`/formation/internship/cases/${params.id}`}
            className="inline-flex items-center gap-1 text-xs"
            style={{ color: "var(--psych-muted)" }}
          >
            <ArrowLeft size={12} /> {t("seance.actions.backToDossier")}
          </Link>
          <h1
            className="text-xl font-bold mt-1"
            style={{ color: "var(--psych-text)" }}
          >
            {t("seance.workspaceTitle")} ·{" "}
            <span className="font-mono">{dossier.identification.caseCode}</span>
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--psych-muted)" }}>
            {formatDate(seance.date)} ·{" "}
            <span
              className="text-[11px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-md"
              style={{
                backgroundColor:
                  seance.status === "draft"
                    ? "rgba(59,130,246,0.12)"
                    : "rgba(16,185,129,0.12)",
                color: seance.status === "draft" ? "#1D4ED8" : "#0E7B5C",
              }}
            >
              {t(`seance.status.${seance.status}`)}
            </span>
            {seance.archived && (
              <span
                className="ml-2 text-[11px] uppercase tracking-wider"
                style={{ color: "var(--psych-muted)" }}
              >
                · {t("seance.actions.archive")}
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {perms.canFinalise && (
            <Button size="sm" onClick={() => seanceStore.finalise(seance.id)}>
              <Lock size={12} /> {t("seance.actions.finalise")}
            </Button>
          )}
          {perms.canReopen && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => seanceStore.reopen(seance.id)}
            >
              <Unlock size={12} /> {t("seance.actions.reopen")}
            </Button>
          )}
          {!seance.archived && perms.canArchive && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => seanceStore.archive(seance.id)}
            >
              <Archive size={12} /> {t("seance.actions.archive")}
            </Button>
          )}
          {seance.archived && perms.canRestore && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => seanceStore.restore(seance.id)}
            >
              <ArchiveRestore size={12} /> {t("seance.actions.restore")}
            </Button>
          )}
        </div>
      </header>

      {/* Three-column shell */}
      <div className="seance-shell">
        {/* LEFT — contexte du dossier */}
        <aside className="space-y-3">
          <FocusBlock
            id={`seance-left-${params.id}`}
            title={t("seance.left.title")}
            icon={FileText}
            tint="#8E72CC"
            emphasis="low"
          >
            <dl className="text-xs space-y-2" style={{ color: "var(--psych-text)" }}>
              <ContextRow
                label={t("seance.left.followUpReason")}
                value={dossier.identification.reasonForFollowUp}
              />
              <ContextRow
                label={t("seance.left.concerns")}
                value={dossier.identification.presentingConcerns}
              />
            </dl>
          </FocusBlock>

          <FocusBlock
            id={`seance-prev-${params.id}`}
            title={t("seance.left.previousSeances")}
            icon={CalendarClock}
            tint="#5B36A8"
            emphasis="low"
          >
            {siblings.filter((s) => s.id !== seance.id).length === 0 ? (
              <p className="text-xs" style={{ color: "var(--psych-muted)" }}>
                {t("seance.left.noPrevious")}
              </p>
            ) : (
              <ul className="space-y-1">
                {siblings
                  .filter((s) => s.id !== seance.id)
                  .map((s) => (
                    <li key={s.id}>
                      <Link
                        href={`/formation/internship/cases/${params.id}/seance/${s.id}`}
                        className="flex items-center justify-between text-xs px-2 py-1.5 rounded-lg border transition-all hover:scale-[1.01]"
                        style={{
                          borderColor: "var(--psych-border)",
                          color: "var(--psych-text)",
                        }}
                      >
                        <span>{formatDate(s.date)}</span>
                        <span
                          className="text-[10px]"
                          style={{ color: "var(--psych-muted)" }}
                        >
                          {t(`seance.status.${s.status}`)}
                        </span>
                      </Link>
                    </li>
                  ))}
              </ul>
            )}
          </FocusBlock>
        </aside>

        {/* CENTER — the live work */}
        <main className="space-y-3 min-w-0">
          {isEmpty && (
            <p
              className="text-xs text-center py-2"
              style={{ color: "var(--psych-muted)" }}
            >
              {t("seance.emptySeance")}
            </p>
          )}

          <FocusBlock
            id={`seance-obs-${seance.id}`}
            title={t("seance.center.observationsTitle")}
            summary={t("seance.center.observationsSummary", {
              n: seance.observations.length,
              total: SEANCE_OBSERVATION_CATEGORIES.length,
            })}
            icon={ClipboardCheck}
            tint="#10B981"
            emphasis="high"
          >
            <div className="space-y-3">
              {SEANCE_OBSERVATION_CATEGORIES.map((cat) => (
                <ObservationRow
                  key={cat}
                  seance={seance}
                  category={cat}
                  canEdit={perms.canEdit}
                  onPick={(value) =>
                    seanceStore.setObservation(seance.id, {
                      category: cat,
                      value,
                    })
                  }
                  onClear={() =>
                    seanceStore.clearObservation(seance.id, cat)
                  }
                  onNote={(note) => {
                    const existing = seance.observations.find(
                      (o) => o.category === cat
                    );
                    if (existing) {
                      seanceStore.setObservation(seance.id, {
                        category: cat,
                        value: existing.value,
                        note,
                      });
                    }
                  }}
                  t={t}
                />
              ))}
            </div>
          </FocusBlock>

          <FocusBlock
            id={`seance-notes-${seance.id}`}
            title={t("seance.center.notesTitle")}
            summary={t("seance.center.notesSummary", {
              n: seance.notes.length,
            })}
            icon={MessageSquare}
            tint="#3B82F6"
            emphasis="high"
          >
            <NotesEditor
              seance={seance}
              canEdit={perms.canEdit}
              onAdd={(type, text) =>
                seanceStore.addNote(seance.id, { type, text })
              }
              onRemove={(noteId) =>
                seanceStore.removeNote(seance.id, noteId)
              }
              t={t}
            />
          </FocusBlock>

          <FocusBlock
            id={`seance-assembled-${seance.id}`}
            title={t("seance.assembled.title")}
            summary={t("seance.assembled.desc")}
            icon={Eye}
            tint="#7C4FB3"
            defaultOpen={false}
            emphasis="low"
            action={
              <Button size="sm" variant="ghost" onClick={copyAssembled}>
                {copied
                  ? t("seance.assembled.copied")
                  : t("seance.assembled.copy")}
              </Button>
            }
          >
            <p
              className="text-[11px] mb-2"
              style={{ color: "var(--psych-muted)" }}
            >
              {t("seance.assembled.desc")}
            </p>
            <pre
              className="text-xs whitespace-pre-wrap p-3 rounded-lg border overflow-x-auto"
              style={{
                borderColor: "var(--psych-border)",
                background: "var(--psych-bg)",
                color: "var(--psych-text)",
                fontFamily:
                  "var(--font-mono, ui-monospace, SFMono-Regular, Menlo, monospace)",
              }}
            >
              {assembleSeanceText(seance)}
            </pre>
          </FocusBlock>
        </main>

        {/* RIGHT — outils & mémoire */}
        <aside className="space-y-3">
          <div style={{ height: 340 }}>
            <MemoryRail sessionId={seance.id} density="compact" />
          </div>

          <button
            onClick={() => setAssessmentSheetOpen(true)}
            className="w-full flex items-center justify-between text-xs px-3 py-2.5 rounded-xl border transition-all hover:scale-[1.01]"
            style={{
              borderColor: "var(--psych-border)",
              background: "var(--psych-card)",
              color: "var(--psych-text)",
            }}
          >
            <span className="inline-flex items-center gap-2">
              <ClipboardCheck size={13} />
              {t("seance.right.linkedAssessments")}
            </span>
            <span style={{ color: "var(--psych-muted)" }}>
              {t("seance.right.linkedCount", {
                n: seance.linkedAssessmentIds.length,
              })}
            </span>
          </button>

          <button
            onClick={() => setWorksheetSheetOpen(true)}
            className="w-full flex items-center justify-between text-xs px-3 py-2.5 rounded-xl border transition-all hover:scale-[1.01]"
            style={{
              borderColor: "var(--psych-border)",
              background: "var(--psych-card)",
              color: "var(--psych-text)",
            }}
          >
            <span className="inline-flex items-center gap-2">
              <ListChecks size={13} />
              {t("seance.right.linkedWorksheets")}
            </span>
            <span style={{ color: "var(--psych-muted)" }}>
              {t("seance.right.linkedCount", {
                n: seance.linkedWorksheetIds.length,
              })}
            </span>
          </button>
        </aside>
      </div>

      {/* BOTTOM — chronologie & suites */}
      <section className="mt-4 space-y-3">
        <FocusBlock
          id={`seance-timeline-${params.id}`}
          title={t("seance.bottom.timelineTitle")}
          icon={CalendarClock}
          tint="#8E72CC"
          emphasis="low"
        >
          <div className="flex gap-2 flex-wrap">
            {siblings.map((s) => {
              const current = s.id === seance.id;
              return (
                <Link
                  key={s.id}
                  href={`/formation/internship/cases/${params.id}/seance/${s.id}`}
                  className="text-[11px] px-2.5 py-1.5 rounded-full border"
                  style={{
                    borderColor: current
                      ? "var(--psych-primary)"
                      : "var(--psych-border)",
                    background: current
                      ? "var(--psych-primary-light)"
                      : "var(--psych-bg)",
                    color: current
                      ? "var(--psych-primary)"
                      : "var(--psych-muted)",
                    fontWeight: current ? 600 : 400,
                  }}
                >
                  {formatDate(s.date, { day: "numeric", month: "short" })}
                  {current && ` · ${t("seance.bottom.currentMarker")}`}
                </Link>
              );
            })}
          </div>
        </FocusBlock>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <TodoCard
            title={t("seance.bottom.homeworkTitle")}
            placeholder={t("seance.bottom.addHomework")}
            items={seance.homework}
            canEdit={perms.canEdit}
            onAdd={(text) => seanceStore.addHomeworkItem(seance.id, text)}
            onToggle={(id) => seanceStore.toggleHomeworkItem(seance.id, id)}
            onRemove={(id) => seanceStore.removeHomeworkItem(seance.id, id)}
          />
          <TodoCard
            title={t("seance.bottom.followUpsTitle")}
            placeholder={t("seance.bottom.addFollowUp")}
            items={seance.followUps}
            canEdit={perms.canEdit}
            onAdd={(text) => seanceStore.addFollowUpItem(seance.id, text)}
            onToggle={(id) => seanceStore.toggleFollowUpItem(seance.id, id)}
            onRemove={(id) => seanceStore.removeFollowUpItem(seance.id, id)}
          />
          <AppointmentCard
            seance={seance}
            canEdit={perms.canEdit}
            onChange={(next) =>
              seanceStore.patch(seance.id, { nextAppointment: next })
            }
            t={t}
          />
        </div>
      </section>

      {/* SideSheets — no route change */}
      <SideSheet
        open={assessmentSheetOpen}
        onClose={() => setAssessmentSheetOpen(false)}
        title={t("seance.right.linkedAssessments")}
      >
        {caseAssessments.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--psych-muted)" }}>
            {t("seance.right.noAssessments")}
          </p>
        ) : (
          <ul className="space-y-2">
            {caseAssessments.map((a) => {
              const linked = seance.linkedAssessmentIds.includes(a.id);
              return (
                <li key={a.id}>
                  <button
                    onClick={() =>
                      perms.canEdit &&
                      seanceStore.toggleAssessmentLink(seance.id, a.id)
                    }
                    disabled={!perms.canEdit}
                    className="w-full flex items-center gap-3 text-left text-sm px-3 py-2.5 rounded-xl border"
                    style={{
                      borderColor: linked
                        ? "var(--psych-primary)"
                        : "var(--psych-border)",
                      background: linked
                        ? "var(--psych-primary-light)"
                        : "var(--psych-bg)",
                      color: "var(--psych-text)",
                      opacity: perms.canEdit ? 1 : 0.6,
                    }}
                  >
                    <CheckCircle2
                      size={15}
                      style={{
                        color: linked
                          ? "var(--psych-primary)"
                          : "var(--psych-border)",
                        flexShrink: 0,
                      }}
                    />
                    <span className="flex-1 min-w-0 truncate">{a.name}</span>
                    <span
                      className="text-[10px]"
                      style={{ color: "var(--psych-muted)" }}
                    >
                      {a.date}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </SideSheet>

      <SideSheet
        open={worksheetSheetOpen}
        onClose={() => setWorksheetSheetOpen(false)}
        title={t("seance.right.linkedWorksheets")}
      >
        {WORKSHEET_LIBRARY.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--psych-muted)" }}>
            {t("seance.right.noWorksheets")}
          </p>
        ) : (
          <ul className="space-y-2">
            {WORKSHEET_LIBRARY.map((w) => {
              const linked = seance.linkedWorksheetIds.includes(w.id);
              return (
                <li key={w.id}>
                  <button
                    onClick={() =>
                      perms.canEdit &&
                      seanceStore.toggleWorksheetLink(seance.id, w.id)
                    }
                    disabled={!perms.canEdit}
                    className="w-full flex items-center gap-3 text-left text-sm px-3 py-2.5 rounded-xl border"
                    style={{
                      borderColor: linked
                        ? "var(--psych-primary)"
                        : "var(--psych-border)",
                      background: linked
                        ? "var(--psych-primary-light)"
                        : "var(--psych-bg)",
                      color: "var(--psych-text)",
                      opacity: perms.canEdit ? 1 : 0.6,
                    }}
                  >
                    <CheckCircle2
                      size={15}
                      style={{
                        color: linked
                          ? "var(--psych-primary)"
                          : "var(--psych-border)",
                        flexShrink: 0,
                      }}
                    />
                    <span className="flex-1 min-w-0 truncate">{w.title}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </SideSheet>

      <style jsx>{`
        .seance-shell {
          display: grid;
          grid-template-columns: 240px minmax(0, 1fr) 300px;
          gap: 0.9rem;
          align-items: start;
        }
        @media (max-width: 1100px) {
          .seance-shell {
            grid-template-columns: minmax(0, 1fr);
          }
        }
      `}</style>
    </div>
  );
}

// ─── Subcomponents ───────────────────────────────────────────

type TFn = ReturnType<typeof useT>;

function EmptyShell({
  message,
  backHref,
  t,
}: {
  message: string;
  backHref: string;
  t: TFn;
}) {
  return (
    <div className="max-w-3xl mx-auto py-16 text-center">
      <p className="text-sm mb-4" style={{ color: "var(--psych-muted)" }}>
        {message}
      </p>
      <Link href={backHref}>
        <Button size="sm" variant="outline">
          <ArrowLeft size={12} /> {t("seance.actions.backToDossier")}
        </Button>
      </Link>
    </div>
  );
}

function ContextRow({
  label,
  value,
}: {
  label: string;
  value?: string;
}) {
  if (!value) return null;
  return (
    <div>
      <dt
        className="text-[10px] uppercase tracking-wider"
        style={{ color: "var(--psych-muted)" }}
      >
        {label}
      </dt>
      <dd className="mt-0.5 leading-relaxed">{value}</dd>
    </div>
  );
}

function ObservationRow({
  seance,
  category,
  canEdit,
  onPick,
  onClear,
  onNote,
  t,
}: {
  seance: Seance;
  category: SeanceObservationCategory;
  canEdit: boolean;
  onPick: (value: string) => void;
  onClear: () => void;
  onNote: (note: string) => void;
  t: TFn;
}) {
  const obs = seance.observations.find((o) => o.category === category);
  const [noteDraft, setNoteDraft] = useState(obs?.note ?? "");

  return (
    <div
      className="rounded-xl border p-3"
      style={{
        borderColor: "var(--psych-border)",
        background: "var(--psych-bg)",
        opacity: canEdit ? 1 : 0.7,
        pointerEvents: canEdit ? "auto" : "none",
      }}
      data-observation-category={category}
    >
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <span
          className="text-xs font-medium"
          style={{ color: "var(--psych-text)" }}
        >
          {t(`seance.center.categories.${category}`)}
        </span>
        <SchemaButtonGroup
          values={frequencySchema.values}
          current={obs?.value}
          onPick={onPick}
          onClear={onClear}
        />
      </div>
      {obs && (
        <input
          type="text"
          value={noteDraft}
          placeholder={t("seance.center.obsNotePlaceholder")}
          onChange={(e) => setNoteDraft(e.target.value)}
          onBlur={() => {
            if (noteDraft !== (obs.note ?? "")) onNote(noteDraft);
          }}
          className="mt-2 w-full text-xs px-2 py-1.5 rounded-lg border"
          style={{
            borderColor: "var(--psych-border)",
            background: "var(--psych-card)",
            color: "var(--psych-text)",
          }}
        />
      )}
    </div>
  );
}

function NotesEditor({
  seance,
  canEdit,
  onAdd,
  onRemove,
  t,
}: {
  seance: Seance;
  canEdit: boolean;
  onAdd: (type: SeanceNoteType, text: string) => void;
  onRemove: (noteId: string) => void;
  t: TFn;
}) {
  const [type, setType] = useState<SeanceNoteType>("general");
  const [text, setText] = useState("");

  function submit() {
    const trimmed = text.trim();
    if (!trimmed) return;
    onAdd(type, trimmed);
    setText("");
  }

  return (
    <div className="space-y-2">
      {seance.notes.map((n) => (
        <div
          key={n.id}
          className="flex items-start gap-2 text-xs rounded-lg border px-3 py-2"
          style={{
            borderColor: "var(--psych-border)",
            background: "var(--psych-bg)",
            color: "var(--psych-text)",
          }}
        >
          <span
            className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-md flex-shrink-0"
            style={{
              backgroundColor: "var(--psych-primary-light)",
              color: "var(--psych-primary)",
            }}
          >
            {t(`seance.center.noteTypes.${n.type}`)}
          </span>
          <p className="flex-1 min-w-0 leading-relaxed m-0 whitespace-pre-wrap">
            {n.text}
          </p>
          {canEdit && (
            <button
              onClick={() => onRemove(n.id)}
              aria-label={t("common.delete")}
              className="p-1 rounded-md flex-shrink-0"
              style={{ color: "#9F1239" }}
            >
              <Trash2 size={11} />
            </button>
          )}
        </div>
      ))}

      {canEdit && (
        <div
          className="rounded-lg border p-2 space-y-2"
          style={{ borderColor: "var(--psych-border)" }}
        >
          <div className="flex items-center gap-2">
            <select
              value={type}
              onChange={(e) => setType(e.target.value as SeanceNoteType)}
              className="text-xs px-2 py-1.5 rounded-lg border"
              style={{
                borderColor: "var(--psych-border)",
                background: "var(--psych-bg)",
                color: "var(--psych-text)",
              }}
            >
              {SEANCE_NOTE_TYPES.map((nt) => (
                <option key={nt} value={nt}>
                  {t(`seance.center.noteTypes.${nt}`)}
                </option>
              ))}
            </select>
            <Button size="sm" onClick={submit} disabled={!text.trim()}>
              <Plus size={12} /> {t("seance.center.addNote")}
            </Button>
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t("seance.center.notePlaceholder")}
            rows={2}
            className="w-full text-xs px-2 py-1.5 rounded-lg border resize-y"
            style={{
              borderColor: "var(--psych-border)",
              background: "var(--psych-bg)",
              color: "var(--psych-text)",
            }}
          />
        </div>
      )}
    </div>
  );
}

function TodoCard({
  title,
  placeholder,
  items,
  canEdit,
  onAdd,
  onToggle,
  onRemove,
}: {
  title: string;
  placeholder: string;
  items: Array<{ id: string; text: string; done: boolean }>;
  canEdit: boolean;
  onAdd: (text: string) => void;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  const [draft, setDraft] = useState("");

  function submit() {
    const trimmed = draft.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setDraft("");
  }

  return (
    <div
      className="rounded-xl border p-3"
      style={{
        borderColor: "var(--psych-border)",
        background: "var(--psych-card)",
      }}
    >
      <h3
        className="text-xs font-semibold mb-2"
        style={{ color: "var(--psych-text)" }}
      >
        {title}
      </h3>
      <ul className="space-y-1 mb-2">
        {items.map((item) => (
          <li key={item.id} className="flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              checked={item.done}
              disabled={!canEdit}
              onChange={() => onToggle(item.id)}
            />
            <span
              className="flex-1 min-w-0"
              style={{
                color: "var(--psych-text)",
                textDecoration: item.done ? "line-through" : "none",
                opacity: item.done ? 0.6 : 1,
              }}
            >
              {item.text}
            </span>
            {canEdit && (
              <button
                onClick={() => onRemove(item.id)}
                className="p-0.5 rounded"
                style={{ color: "#9F1239" }}
                aria-label="remove"
              >
                <Trash2 size={10} />
              </button>
            )}
          </li>
        ))}
      </ul>
      {canEdit && (
        <input
          type="text"
          value={draft}
          placeholder={placeholder}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
          }}
          className="w-full text-xs px-2 py-1.5 rounded-lg border"
          style={{
            borderColor: "var(--psych-border)",
            background: "var(--psych-bg)",
            color: "var(--psych-text)",
          }}
        />
      )}
    </div>
  );
}

function AppointmentCard({
  seance,
  canEdit,
  onChange,
  t,
}: {
  seance: Seance;
  canEdit: boolean;
  onChange: (next: { date: string; note?: string } | null) => void;
  t: TFn;
}) {
  const appt = seance.nextAppointment;
  return (
    <div
      className="rounded-xl border p-3"
      style={{
        borderColor: "var(--psych-border)",
        background: "var(--psych-card)",
      }}
    >
      <h3
        className="text-xs font-semibold mb-2"
        style={{ color: "var(--psych-text)" }}
      >
        {t("seance.bottom.nextAppointmentTitle")}
      </h3>
      {canEdit ? (
        <div className="space-y-2">
          <label className="block text-[10px]" style={{ color: "var(--psych-muted)" }}>
            {t("seance.bottom.appointmentDate")}
            <input
              type="date"
              value={appt?.date ?? ""}
              onChange={(e) =>
                onChange(
                  e.target.value
                    ? { date: e.target.value, note: appt?.note }
                    : null
                )
              }
              className="mt-1 w-full text-xs px-2 py-1.5 rounded-lg border"
              style={{
                borderColor: "var(--psych-border)",
                background: "var(--psych-bg)",
                color: "var(--psych-text)",
              }}
            />
          </label>
          {appt && (
            <label
              className="block text-[10px]"
              style={{ color: "var(--psych-muted)" }}
            >
              {t("seance.bottom.appointmentNote")}
              <input
                type="text"
                value={appt.note ?? ""}
                onChange={(e) =>
                  onChange({ date: appt.date, note: e.target.value })
                }
                className="mt-1 w-full text-xs px-2 py-1.5 rounded-lg border"
                style={{
                  borderColor: "var(--psych-border)",
                  background: "var(--psych-bg)",
                  color: "var(--psych-text)",
                }}
              />
            </label>
          )}
        </div>
      ) : appt ? (
        <p className="text-xs" style={{ color: "var(--psych-text)" }}>
          {appt.date}
          {appt.note ? ` — ${appt.note}` : ""}
        </p>
      ) : (
        <p className="text-xs" style={{ color: "var(--psych-muted)" }}>
          {t("seance.bottom.noAppointment")}
        </p>
      )}
    </div>
  );
}
