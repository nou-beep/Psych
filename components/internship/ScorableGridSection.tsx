"use client";

// Click-based capability evaluation surface for an internship case.
//
// Shows the list of administrations for the case, lets the user
// open one or create a new one, and renders the scoring grid plus
// the auto-generated summary + suggested-next-grids panel + one-
// click report assembly buttons.

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ChevronRight,
  Eraser,
  FileText,
  Layers,
  Plus,
  Printer,
  Sparkles,
} from "lucide-react";

import { SectionCard } from "@/components/shared/SectionCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/Toast";
import { useInternship } from "@/contexts/InternshipContext";
import {
  CAPABILITY_SCORE_LABELS,
  CAPABILITY_SCORE_LONG_LABELS,
  DOMAIN_STATUS_LABELS,
  administrationsForCase,
  allDomainBreakdowns,
  domainBreakdown,
  gridBreakdown,
  type CapabilityScore,
  type ScorableGridAdministration,
  type ScorableGridTemplate,
} from "@/lib/internship/scorable-grids";
import {
  SCORABLE_TEMPLATES,
  findScorableTemplate,
  followUpGridLabel,
} from "@/lib/internship/scorable-templates";
import {
  domainOneLiner,
  generateGridSummary,
} from "@/lib/internship/scorable-text";
import { loadEvaluator } from "@/lib/internship/evaluator";

interface Props {
  caseId: string;
}

const SCORE_BUTTON_PALETTE: Record<
  CapabilityScore,
  { bg: string; fg: string; hover: string }
> = {
  A: { bg: "#D1FAE5", fg: "#065F46", hover: "#A7F3D0" },
  EC: { bg: "#FEF3C7", fg: "#92400E", hover: "#FDE68A" },
  NA: { bg: "#FEE2E2", fg: "#991B1B", hover: "#FECACA" },
  NO: { bg: "#E5E7EB", fg: "#374151", hover: "#D1D5DB" },
};

export function ScorableGridSection({ caseId }: Props) {
  const { toast } = useToast();
  const {
    scorableAdmins,
    createScorableAdmin,
    removeScorableAdmin,
    createDailyFromScorableAdmin,
    createGridSummaryReport,
    addScorableAdminToWeekly,
    addScorableAdminToSupervision,
  } = useInternship();

  const caseAdmins = useMemo(
    () => administrationsForCase(scorableAdmins, caseId),
    [scorableAdmins, caseId]
  );

  const [openAdminId, setOpenAdminId] = useState<string | null>(
    caseAdmins[0]?.id ?? null
  );
  const [newOpen, setNewOpen] = useState(false);

  const openAdmin =
    caseAdmins.find((a) => a.id === openAdminId) ?? caseAdmins[0] ?? null;
  const template = openAdmin
    ? findScorableTemplate(openAdmin.templateId)
    : null;

  return (
    <div className="space-y-3">
      <SectionCard
        title="Click-based capability evaluation"
        description="Pick a template, click A / EC / NA / N/O on each item, and Eyla writes the clinical paragraphs for you."
      >
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <p className="text-xs" style={{ color: "var(--psych-muted)" }}>
            {caseAdmins.length === 0
              ? "No administration yet."
              : `${caseAdmins.length} administration${
                  caseAdmins.length === 1 ? "" : "s"
                } on file.`}
          </p>
          <Button size="sm" onClick={() => setNewOpen((v) => !v)}>
            <Plus size={12} /> New administration
          </Button>
        </div>

        {newOpen && (
          <NewAdminPanel
            onClose={() => setNewOpen(false)}
            onCreate={(input) => {
              const a = createScorableAdmin({ caseId, ...input });
              setOpenAdminId(a.id);
              setNewOpen(false);
              toast(`Created ${a.date}`, "success");
            }}
          />
        )}

        {caseAdmins.length > 0 && (
          <ul className="mt-3 space-y-1">
            {caseAdmins.map((a) => {
              const tpl = findScorableTemplate(a.templateId);
              const breakdown = tpl ? gridBreakdown(a, tpl) : null;
              const active = a.id === openAdmin?.id;
              return (
                <li key={a.id}>
                  <button
                    type="button"
                    onClick={() => setOpenAdminId(a.id)}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-colors"
                    style={{
                      backgroundColor: active
                        ? "var(--psych-primary-light)"
                        : "var(--psych-bg)",
                      borderLeft: active
                        ? "3px solid var(--psych-primary)"
                        : "3px solid transparent",
                    }}
                  >
                    <span
                      className="font-mono text-[10px]"
                      style={{ color: "var(--psych-primary)" }}
                    >
                      {a.date}
                    </span>
                    <span
                      className="text-sm flex-1"
                      style={{ color: "var(--psych-text)" }}
                    >
                      {tpl?.name ?? "Template missing"}
                    </span>
                    {breakdown && (
                      <span
                        className="text-[10px]"
                        style={{ color: "var(--psych-muted)" }}
                      >
                        {breakdown.observabilityPct}% coté ·{" "}
                        {breakdown.acquisitionPct}% acquisition
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </SectionCard>

      {openAdmin && template && (
        <AdministrationEditor
          admin={openAdmin}
          template={template}
          onRemove={() => {
            if (!confirm("Supprimer cette administration ?")) return;
            removeScorableAdmin(openAdmin.id);
            setOpenAdminId(null);
            toast("Administration supprimée", "info");
          }}
          onCreateDaily={() => {
            const r = createDailyFromScorableAdmin(openAdmin.id);
            if (r) toast(`Daily report created`, "success");
          }}
          onCreateGridSummary={() => {
            const r = createGridSummaryReport(openAdmin.id);
            if (r) toast(`Grid summary report created`, "success");
          }}
          onAddToWeekly={() => {
            const r = addScorableAdminToWeekly(openAdmin.id);
            if (r) {
              toast(`Ajouté à la synthèse hebdomadaire`, "success");
            } else {
              toast(
                "Aucune synthèse hebdomadaire en cours. Créer-en une depuis l'onglet Reports.",
                "info"
              );
            }
          }}
          onAddToSupervision={() => {
            const r = addScorableAdminToSupervision(openAdmin.id);
            if (r) {
              toast(`Ajouté à la note de supervision`, "success");
            } else {
              toast(
                "Aucune note de supervision en cours. Créer-en une depuis l'onglet Supervision.",
                "info"
              );
            }
          }}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// New administration panel
// ─────────────────────────────────────────────────────────────────

function NewAdminPanel({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (input: {
    templateId: string;
    date?: string;
    evaluator?: string;
    context?: string;
  }) => void;
}) {
  const [templateId, setTemplateId] = useState(SCORABLE_TEMPLATES[0]?.id ?? "");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [evaluator, setEvaluator] = useState(() => loadEvaluator().name);
  const [context, setContext] = useState("Atelier individuel");

  return (
    <div
      className="mt-3 grid grid-cols-1 md:grid-cols-4 gap-2 items-end"
      style={{
        padding: "12px",
        backgroundColor: "var(--psych-bg)",
        borderRadius: 12,
        border: "1px solid var(--psych-border)",
      }}
    >
      <div className="md:col-span-4">
        <label className="text-[10px] uppercase tracking-wide block mb-0.5" style={{ color: "var(--psych-muted)" }}>
          Template ({SCORABLE_TEMPLATES.length} disponibles)
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1.5">
          {SCORABLE_TEMPLATES.map((t) => {
            const active = templateId === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTemplateId(t.id)}
                className="text-left rounded-md border px-3 py-2 transition-colors"
                style={{
                  backgroundColor: active
                    ? "var(--psych-primary-light)"
                    : "var(--psych-card)",
                  borderColor: active
                    ? "var(--psych-primary)"
                    : "var(--psych-border)",
                  color: active
                    ? "var(--psych-primary)"
                    : "var(--psych-text)",
                }}
              >
                <span className="text-xs font-medium block">{t.name}</span>
                {t.description && (
                  <span
                    className="text-[10px] block mt-0.5"
                    style={{
                      color: active
                        ? "var(--psych-primary)"
                        : "var(--psych-muted)",
                    }}
                  >
                    {t.description.length > 90
                      ? t.description.slice(0, 90) + "…"
                      : t.description}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
      <div>
        <label className="text-[10px] uppercase tracking-wide block mb-0.5" style={{ color: "var(--psych-muted)" }}>
          Date
        </label>
        <Input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>
      <div>
        <label className="text-[10px] uppercase tracking-wide block mb-0.5" style={{ color: "var(--psych-muted)" }}>
          Évaluateur
        </label>
        <Input
          value={evaluator}
          onChange={(e) => setEvaluator(e.target.value)}
          placeholder="Nouhaila Mrini"
        />
      </div>
      <div>
        <label className="text-[10px] uppercase tracking-wide block mb-0.5" style={{ color: "var(--psych-muted)" }}>
          Contexte
        </label>
        <Input
          value={context}
          onChange={(e) => setContext(e.target.value)}
          placeholder="Atelier individuel"
        />
      </div>
      <div className="md:col-span-4 flex justify-end gap-2">
        <Button size="sm" variant="ghost" onClick={onClose}>
          Annuler
        </Button>
        <Button
          size="sm"
          onClick={() =>
            onCreate({
              templateId,
              date,
              evaluator: evaluator.trim() || undefined,
              context: context.trim() || undefined,
            })
          }
        >
          <Plus size={12} /> Créer
        </Button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Administration editor — the scoring surface
// ─────────────────────────────────────────────────────────────────

function AdministrationEditor({
  admin,
  template,
  onRemove,
  onCreateDaily,
  onCreateGridSummary,
  onAddToWeekly,
  onAddToSupervision,
}: {
  admin: ScorableGridAdministration;
  template: ScorableGridTemplate;
  onRemove: () => void;
  onCreateDaily: () => void;
  onCreateGridSummary: () => void;
  onAddToWeekly: () => void;
  onAddToSupervision: () => void;
}) {
  const {
    scoreScorableItem,
    clearScorableItem,
    patchScorableAdmin,
  } = useInternship();

  const breakdowns = useMemo(
    () => allDomainBreakdowns(admin, template),
    [admin, template]
  );
  const summary = useMemo(
    () => generateGridSummary(admin, template),
    [admin, template]
  );
  const grid = useMemo(() => gridBreakdown(admin, template), [admin, template]);

  const [showSummary, setShowSummary] = useState(false);
  const [openItemId, setOpenItemId] = useState<string | null>(null);

  return (
    <SectionCard
      title={template.name}
      description={template.description}
      action={
        <div className="flex items-center gap-2">
          <Link
            href={`/internship/grid-print/${admin.id}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button size="sm" variant="outline">
              <Printer size={12} /> Print
            </Button>
          </Link>
          <Button size="sm" variant="ghost" onClick={onRemove}>
            Remove
          </Button>
        </div>
      }
    >
      {/* Administration header */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
        <HeaderField
          label="Date"
          value={admin.date}
          type="date"
          onChange={(v) => patchScorableAdmin(admin.id, { date: v })}
        />
        <HeaderField
          label="Évaluateur"
          value={admin.evaluator ?? ""}
          onChange={(v) => patchScorableAdmin(admin.id, { evaluator: v })}
        />
        <HeaderField
          label="Contexte"
          value={admin.context ?? ""}
          onChange={(v) => patchScorableAdmin(admin.id, { context: v })}
        />
        <HeaderField
          label="Séance"
          value={admin.sessionLabel ?? ""}
          onChange={(v) => patchScorableAdmin(admin.id, { sessionLabel: v })}
        />
      </div>

      {/* Domain cards with scoring rows */}
      <div className="space-y-3">
        {template.domains.map((domain) => {
          const b = domainBreakdown(admin, template, domain.id);
          return (
            <div
              key={domain.id}
              className="rounded-xl border"
              style={{
                backgroundColor: "var(--psych-card)",
                borderColor: "var(--psych-border)",
              }}
            >
              <div
                className="px-3 py-2 flex items-center gap-3 border-b"
                style={{ borderColor: "var(--psych-border)" }}
              >
                <span
                  className="text-sm font-semibold flex-1"
                  style={{ color: "var(--psych-text)" }}
                >
                  {domain.label}
                </span>
                {b && (
                  <>
                    <span
                      className="text-[10px]"
                      style={{ color: "var(--psych-muted)" }}
                    >
                      {DOMAIN_STATUS_LABELS[b.status]}
                    </span>
                    <ProgressBar pct={b.acquisitionPct} />
                  </>
                )}
              </div>
              <ul>
                {domain.items.map((item) => {
                  const entry = admin.scores[item.id];
                  const score: CapabilityScore = entry?.score ?? "NO";
                  const isItemOpen = openItemId === item.id;
                  return (
                    <li
                      key={item.id}
                      className="border-b last:border-b-0"
                      style={{ borderColor: "var(--psych-border)" }}
                    >
                      <div className="flex items-center gap-2 px-3 py-2">
                        <span
                          className="text-xs flex-1"
                          style={{ color: "var(--psych-text)" }}
                        >
                          {item.label}
                        </span>
                        <ScoreButtonGroup
                          current={entry ? score : null}
                          onPick={(s) =>
                            scoreScorableItem(admin.id, item.id, s)
                          }
                          onClear={() => clearScorableItem(admin.id, item.id)}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setOpenItemId(isItemOpen ? null : item.id)
                          }
                          className="text-[10px] inline-flex items-center"
                          style={{ color: "var(--psych-muted)" }}
                          aria-label="evidence"
                        >
                          <ChevronRight
                            size={11}
                            style={{
                              transform: isItemOpen ? "rotate(90deg)" : undefined,
                            }}
                          />
                        </button>
                      </div>
                      {isItemOpen && (
                        <div
                          className="px-3 pb-3 grid grid-cols-1 md:grid-cols-2 gap-2"
                          style={{
                            backgroundColor: "var(--psych-bg)",
                            borderTop: "1px dashed var(--psych-border)",
                          }}
                        >
                          <div>
                            <label
                              className="text-[10px] uppercase tracking-wide block mb-0.5"
                              style={{ color: "var(--psych-muted)" }}
                            >
                              Note rapide
                            </label>
                            <Input
                              value={entry?.note ?? ""}
                              onChange={(e) =>
                                scoreScorableItem(
                                  admin.id,
                                  item.id,
                                  score,
                                  { note: e.target.value }
                                )
                              }
                              placeholder="impression rapide…"
                            />
                          </div>
                          <div>
                            <label
                              className="text-[10px] uppercase tracking-wide block mb-0.5"
                              style={{ color: "var(--psych-muted)" }}
                            >
                              Exemple / preuve
                            </label>
                            <Input
                              value={entry?.evidence ?? ""}
                              onChange={(e) =>
                                scoreScorableItem(
                                  admin.id,
                                  item.id,
                                  score,
                                  { evidence: e.target.value }
                                )
                              }
                              placeholder="observation concrète…"
                            />
                          </div>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>

      {/* Observations + signature */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
        <div>
          <label
            className="text-[10px] uppercase tracking-wide block mb-0.5"
            style={{ color: "var(--psych-muted)" }}
          >
            {template.observationsHeading ?? "Observations cliniques générales"}
          </label>
          <Textarea
            rows={4}
            value={admin.observations ?? ""}
            onChange={(e) =>
              patchScorableAdmin(admin.id, { observations: e.target.value })
            }
          />
        </div>
        <div className="grid grid-cols-1 gap-2">
          <HeaderField
            label="Signature du psychologue"
            value={admin.signaturePsychologue ?? ""}
            onChange={(v) =>
              patchScorableAdmin(admin.id, { signaturePsychologue: v })
            }
          />
          <HeaderField
            label="Visa du responsable"
            value={admin.visaResponsable ?? ""}
            onChange={(v) =>
              patchScorableAdmin(admin.id, { visaResponsable: v })
            }
          />
        </div>
      </div>

      {/* Sticky bottom action bar */}
      <div
        className="mt-4 flex items-center justify-between gap-2 flex-wrap pt-3 border-t"
        style={{ borderColor: "var(--psych-border)" }}
      >
        <div className="flex items-center gap-3 flex-wrap">
          <Tally label="A" count={grid.counts.A} score="A" />
          <Tally label="EC" count={grid.counts.EC} score="EC" />
          <Tally label="NA" count={grid.counts.NA} score="NA" />
          <Tally label="N/O" count={grid.counts.NO} score="NO" />
          <span className="text-[10px]" style={{ color: "var(--psych-muted)" }}>
            {grid.acquisitionPct}% acquisition · {grid.observabilityPct}% coté
          </span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setShowSummary((v) => !v)}
          >
            <Sparkles size={12} /> {showSummary ? "Hide" : "Generate"} summary
          </Button>
          <Button size="sm" onClick={onCreateDaily}>
            <FileText size={12} /> Daily report
          </Button>
          <Button size="sm" onClick={onCreateGridSummary}>
            <FileText size={12} /> Grid summary
          </Button>
          <Button size="sm" variant="outline" onClick={onAddToWeekly}>
            <Layers size={12} /> Add to weekly
          </Button>
          <Button size="sm" variant="outline" onClick={onAddToSupervision}>
            <Layers size={12} /> Add to supervision
          </Button>
        </div>
      </div>

      {/* Auto-generated summary block */}
      {showSummary && (
        <div
          className="mt-3 rounded-xl border p-3"
          style={{
            backgroundColor: "var(--psych-bg)",
            borderColor: "var(--psych-border)",
          }}
        >
          <p
            className="text-xs italic mb-2"
            style={{ color: "var(--psych-text)" }}
          >
            {summary.headline}
          </p>
          <ul className="space-y-2 mb-2">
            {summary.perDomain.map((d) => (
              <li
                key={d.domainId}
                className="text-xs"
                style={{ color: "var(--psych-text)" }}
              >
                <span className="font-semibold">{d.domainLabel}</span> —{" "}
                <span style={{ color: "var(--psych-muted)" }}>
                  {d.statusLabel} ({d.acquisitionPct}%)
                </span>
                <br />
                {d.paragraph}
              </li>
            ))}
          </ul>
          <div
            className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs"
            style={{ color: "var(--psych-text)" }}
          >
            <Block title="Forces" body={summary.strengths} />
            <Block title="Difficultés" body={summary.difficulties} />
            <Block title="Recommandations" body={summary.recommendations} />
          </div>
          {summary.nextGridKeys.length > 0 && (
            <div className="mt-3 pt-3 border-t" style={{ borderColor: "var(--psych-border)" }}>
              <p
                className="text-[10px] uppercase tracking-wider mb-1.5"
                style={{ color: "var(--psych-muted)" }}
              >
                Grilles suggérées ensuite
              </p>
              <div className="flex flex-wrap gap-1.5">
                {summary.nextGridKeys.map((k) => (
                  <span
                    key={k}
                    className="text-[10px] px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: "var(--psych-primary-light)",
                      color: "var(--psych-primary)",
                    }}
                  >
                    <Layers
                      size={9}
                      style={{ display: "inline", marginRight: 4 }}
                    />
                    {followUpGridLabel(k)}
                  </span>
                ))}
              </div>
            </div>
          )}
          {/* Per-domain one-liners — useful when collapsed. */}
          <div className="mt-3 pt-3 border-t" style={{ borderColor: "var(--psych-border)" }}>
            <p
              className="text-[10px] uppercase tracking-wider mb-1.5"
              style={{ color: "var(--psych-muted)" }}
            >
              Snapshot par domaine
            </p>
            <ul className="text-[11px] space-y-0.5" style={{ color: "var(--psych-muted)" }}>
              {breakdowns.map((b) => (
                <li key={b.domainId}>
                  · {b.domainLabel} — {domainOneLiner(admin, template, b.domainId)}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {template.licensingNote && (
        <p
          className="text-[10px] mt-3"
          style={{ color: "var(--psych-muted)", fontStyle: "italic" }}
        >
          ⚠ {template.licensingNote}
        </p>
      )}
    </SectionCard>
  );
}

// ─────────────────────────────────────────────────────────────────
// Small atoms
// ─────────────────────────────────────────────────────────────────

function HeaderField({
  label,
  value,
  onChange,
  type,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label
        className="text-[10px] uppercase tracking-wide block mb-0.5"
        style={{ color: "var(--psych-muted)" }}
      >
        {label}
      </label>
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function ScoreButtonGroup({
  current,
  onPick,
  onClear,
}: {
  current: CapabilityScore | null;
  onPick: (s: CapabilityScore) => void;
  onClear: () => void;
}) {
  return (
    <div className="inline-flex items-center gap-1">
      {(["A", "EC", "NA", "NO"] as CapabilityScore[]).map((s) => {
        const active = current === s;
        const palette = SCORE_BUTTON_PALETTE[s];
        return (
          <button
            key={s}
            type="button"
            onClick={() => onPick(s)}
            title={CAPABILITY_SCORE_LONG_LABELS[s]}
            className="text-[11px] font-semibold rounded-md transition-all"
            style={{
              backgroundColor: active ? palette.bg : "var(--psych-bg)",
              color: active ? palette.fg : "var(--psych-muted)",
              border: active
                ? `1px solid ${palette.fg}`
                : "1px solid var(--psych-border)",
              padding: "4px 8px",
              minWidth: 36,
            }}
          >
            {CAPABILITY_SCORE_LABELS[s]}
          </button>
        );
      })}
      {current && (
        <button
          type="button"
          onClick={onClear}
          title="Effacer"
          aria-label="Effacer la cotation"
          className="text-[10px] rounded-md p-1"
          style={{ color: "var(--psych-muted)" }}
        >
          <Eraser size={11} />
        </button>
      )}
    </div>
  );
}

function ProgressBar({ pct }: { pct: number }) {
  return (
    <div
      className="w-24 h-1.5 rounded-full overflow-hidden"
      style={{ backgroundColor: "var(--psych-bg)" }}
      aria-label={`Acquisition ${pct}%`}
    >
      <div
        className="h-full"
        style={{
          width: `${pct}%`,
          backgroundColor: "var(--psych-primary)",
        }}
      />
    </div>
  );
}

function Tally({
  label,
  count,
  score,
}: {
  label: string;
  count: number;
  score: CapabilityScore;
}) {
  const p = SCORE_BUTTON_PALETTE[score];
  return (
    <span
      className="text-[11px] font-medium px-2 py-0.5 rounded-md"
      style={{
        backgroundColor: count > 0 ? p.bg : "var(--psych-bg)",
        color: count > 0 ? p.fg : "var(--psych-muted)",
      }}
    >
      {label} · {count}
    </span>
  );
}

function Block({ title, body }: { title: string; body: string }) {
  return (
    <div
      className="rounded-md p-2"
      style={{
        backgroundColor: "var(--psych-card)",
        border: "1px solid var(--psych-border)",
      }}
    >
      <p
        className="text-[10px] uppercase tracking-wider mb-0.5"
        style={{ color: "var(--psych-muted)" }}
      >
        {title}
      </p>
      <p className="text-[11px]" style={{ color: "var(--psych-text)" }}>
        {body}
      </p>
    </div>
  );
}
