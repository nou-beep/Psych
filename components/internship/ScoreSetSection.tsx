"use client";

// Schema-driven scoring surface for ScoreSet templates. Renders any
// schema (acquisition / Likert / frequency / support / severity /
// binary) with the same UI shape: one button per value, tonal
// active state, optional evidence row per item, sticky tally bar
// at the bottom.
//
// Sits next to ScorableGridSection on the Évaluation tab. The
// legacy section keeps handling the 26 A/EC/NA/N-O templates; this
// one handles every other schema.

import { useMemo, useState } from "react";
import {
  ChevronRight,
  Eraser,
  Plus,
  Trash2,
} from "lucide-react";

import { SectionCard } from "@/components/shared/SectionCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/Toast";
import { useInternship } from "@/contexts/InternshipContext";
import {
  SCORE_SET_TEMPLATES,
  findScoreSetTemplate,
} from "@/lib/internship/score-set-templates";
import {
  SCORE_SET_DOMAIN_STATUS_LABELS,
  allScoreSetDomainBreakdowns,
  scoreSetBreakdown,
  type ScoreSchemaValue,
  type ScoreSetAdministration,
  type ScoreSetDefinition,
} from "@/lib/internship/score-set";
import { loadEvaluator } from "@/lib/internship/evaluator";

interface Props {
  caseId: string;
}

const TONE_BG: Record<string, string> = {
  calm: "#D1FAE5",
  neutral: "var(--psych-primary-light)",
  warm: "#FEF3C7",
  warning: "#FED7AA",
  alarm: "#FEE2E2",
};
const TONE_FG: Record<string, string> = {
  calm: "#065F46",
  neutral: "var(--psych-primary)",
  warm: "#92400E",
  warning: "#9A3412",
  alarm: "#991B1B",
};

export function ScoreSetSection({ caseId }: Props) {
  const { toast } = useToast();
  const {
    scoreSetAdmins,
    createScoreSetAdmin,
    scoreScoreSetItem,
    clearScoreSetItem,
    patchScoreSetAdmin,
    removeScoreSetAdmin,
  } = useInternship();

  const caseAdmins = useMemo(
    () =>
      scoreSetAdmins
        .filter((a) => a.caseId === caseId)
        .sort((a, b) => b.date.localeCompare(a.date)),
    [scoreSetAdmins, caseId]
  );

  const [openAdminId, setOpenAdminId] = useState<string | null>(
    caseAdmins[0]?.id ?? null
  );
  const [newOpen, setNewOpen] = useState(false);

  const openAdmin =
    caseAdmins.find((a) => a.id === openAdminId) ?? caseAdmins[0] ?? null;
  const template = openAdmin
    ? findScoreSetTemplate(openAdmin.templateId)
    : null;

  return (
    <div className="space-y-3">
      <SectionCard
        title="ScoreSet — évaluations multi-schémas"
        description="Likert, fréquence, sévérité, niveau d'aide, binaire. Le schéma de chaque template détermine les boutons rendus."
      >
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <p className="text-xs" style={{ color: "var(--psych-muted)" }}>
            {caseAdmins.length === 0
              ? "Aucune administration ScoreSet pour ce cas."
              : `${caseAdmins.length} administration${
                  caseAdmins.length === 1 ? "" : "s"
                } sur fiche.`}
          </p>
          <Button size="sm" onClick={() => setNewOpen((v) => !v)}>
            <Plus size={12} /> Nouvelle administration
          </Button>
        </div>

        {newOpen && (
          <NewScoreSetAdminPanel
            onClose={() => setNewOpen(false)}
            onCreate={(input) => {
              const a = createScoreSetAdmin({ caseId, ...input });
              setOpenAdminId(a.id);
              setNewOpen(false);
              toast(`Created ${a.date}`, "success");
            }}
          />
        )}

        {caseAdmins.length > 0 && (
          <ul className="mt-3 space-y-1">
            {caseAdmins.map((a) => {
              const tpl = findScoreSetTemplate(a.templateId);
              const breakdown = tpl ? scoreSetBreakdown(a, tpl) : null;
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
                    {tpl && (
                      <span
                        className="text-[10px] px-1.5 py-0.5 rounded-full"
                        style={{
                          backgroundColor: "var(--psych-card)",
                          border: "1px solid var(--psych-border)",
                          color: "var(--psych-muted)",
                        }}
                      >
                        {tpl.schema.name}
                      </span>
                    )}
                    {breakdown && (
                      <span
                        className="text-[10px]"
                        style={{ color: "var(--psych-muted)" }}
                      >
                        {breakdown.observabilityPct}% coté ·{" "}
                        {breakdown.acquisitionPct}%
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
        <ScoreSetAdministrationEditor
          admin={openAdmin}
          template={template}
          onScore={(itemId, value, extra) =>
            scoreScoreSetItem(openAdmin.id, itemId, value, extra)
          }
          onClear={(itemId) => clearScoreSetItem(openAdmin.id, itemId)}
          onPatch={(patch) => patchScoreSetAdmin(openAdmin.id, patch)}
          onRemove={() => {
            if (!confirm("Supprimer cette administration ?")) return;
            removeScoreSetAdmin(openAdmin.id);
            setOpenAdminId(null);
            toast("Administration supprimée", "info");
          }}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// New admin panel
// ─────────────────────────────────────────────────────────────────

function NewScoreSetAdminPanel({
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
  const [templateId, setTemplateId] = useState(
    SCORE_SET_TEMPLATES[0]?.id ?? ""
  );
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
        <label
          className="text-[10px] uppercase tracking-wide block mb-1"
          style={{ color: "var(--psych-muted)" }}
        >
          Template ({SCORE_SET_TEMPLATES.length} disponibles)
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
          {SCORE_SET_TEMPLATES.map((t) => {
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
                <span
                  className="text-[10px] block mt-0.5"
                  style={{
                    color: active
                      ? "var(--psych-primary)"
                      : "var(--psych-muted)",
                  }}
                >
                  Schéma : {t.schema.name}
                </span>
                {t.description && (
                  <span
                    className="text-[10px] block mt-1"
                    style={{
                      color: active
                        ? "var(--psych-primary)"
                        : "var(--psych-muted)",
                    }}
                  >
                    {t.description.length > 110
                      ? t.description.slice(0, 110) + "…"
                      : t.description}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
      <FieldText label="Date" type="date" value={date} onChange={setDate} />
      <FieldText
        label="Évaluateur"
        value={evaluator}
        onChange={setEvaluator}
        placeholder="Nouhaila Mrini"
      />
      <FieldText
        label="Contexte"
        value={context}
        onChange={setContext}
        placeholder="Atelier individuel"
      />
      <div className="flex justify-end gap-2">
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
// Administration editor
// ─────────────────────────────────────────────────────────────────

function ScoreSetAdministrationEditor({
  admin,
  template,
  onScore,
  onClear,
  onPatch,
  onRemove,
}: {
  admin: ScoreSetAdministration<string>;
  template: ScoreSetDefinition<string>;
  onScore: (
    itemId: string,
    value: string,
    extra?: { note?: string; evidence?: string }
  ) => void;
  onClear: (itemId: string) => void;
  onPatch: (patch: Partial<ScoreSetAdministration<string>>) => void;
  onRemove: () => void;
}) {
  const breakdowns = useMemo(
    () => allScoreSetDomainBreakdowns(admin, template),
    [admin, template]
  );
  const grid = useMemo(
    () => scoreSetBreakdown(admin, template),
    [admin, template]
  );
  const [openItemId, setOpenItemId] = useState<string | null>(null);

  return (
    <SectionCard
      title={template.name}
      description={template.description}
      action={
        <Button size="sm" variant="ghost" onClick={onRemove}>
          <Trash2 size={11} /> Remove
        </Button>
      }
    >
      {/* Admin meta header */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
        <FieldText
          label="Date"
          type="date"
          value={admin.date}
          onChange={(v) => onPatch({ date: v })}
        />
        <FieldText
          label="Évaluateur"
          value={admin.evaluator ?? ""}
          onChange={(v) => onPatch({ evaluator: v })}
        />
        <FieldText
          label="Contexte"
          value={admin.context ?? ""}
          onChange={(v) => onPatch({ context: v })}
        />
        <FieldText
          label="Séance"
          value={admin.sessionLabel ?? ""}
          onChange={(v) => onPatch({ sessionLabel: v })}
        />
      </div>

      {/* Domain cards */}
      <div className="space-y-3">
        {template.domains.map((domain) => {
          const b = breakdowns.find((x) => x.domainId === domain.id);
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
                      {SCORE_SET_DOMAIN_STATUS_LABELS[b.status]}
                    </span>
                    <ProgressBar pct={b.acquisitionPct} />
                  </>
                )}
              </div>
              <ul>
                {domain.items.map((item) => {
                  const result = admin.results[item.id];
                  const value = result?.value;
                  const isItemOpen = openItemId === item.id;
                  return (
                    <li
                      key={item.id}
                      className="border-b last:border-b-0"
                      style={{ borderColor: "var(--psych-border)" }}
                    >
                      <div className="flex items-center gap-2 px-3 py-2 flex-wrap">
                        <span
                          className="text-xs flex-1 min-w-[200px]"
                          style={{ color: "var(--psych-text)" }}
                        >
                          {item.label}
                        </span>
                        <SchemaButtonGroup
                          values={template.schema.values}
                          current={value}
                          onPick={(v) => onScore(item.id, v)}
                          onClear={() => onClear(item.id)}
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
                              value={result?.note ?? ""}
                              onChange={(e) =>
                                value &&
                                onScore(item.id, value, {
                                  note: e.target.value,
                                })
                              }
                              placeholder="impression rapide…"
                              disabled={!value}
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
                              value={result?.evidence ?? ""}
                              onChange={(e) =>
                                value &&
                                onScore(item.id, value, {
                                  evidence: e.target.value,
                                })
                              }
                              placeholder="observation concrète…"
                              disabled={!value}
                            />
                          </div>
                          {/* If the schema item has a phrase for the
                              current value, show it as a preview. */}
                          {value && item.phrases?.[value] && (
                            <div
                              className="md:col-span-2 rounded-md p-2"
                              style={{
                                backgroundColor: "var(--psych-card)",
                                border: "1px solid var(--psych-border)",
                              }}
                            >
                              <span
                                className="text-[10px] uppercase tracking-wider block mb-1"
                                style={{ color: "var(--psych-muted)" }}
                              >
                                Phrase générée
                              </span>
                              <p
                                className="text-[11px]"
                                style={{ color: "var(--psych-text)" }}
                              >
                                {item.phrases[value]}
                              </p>
                            </div>
                          )}
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
            {template.observationsHeading ?? "Observations générales"}
          </label>
          <Textarea
            rows={3}
            value={admin.observations ?? ""}
            onChange={(e) => onPatch({ observations: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-1 gap-2">
          <FieldText
            label="Signature du psychologue"
            value={admin.signaturePsychologue ?? ""}
            onChange={(v) => onPatch({ signaturePsychologue: v })}
          />
          <FieldText
            label="Visa du responsable"
            value={admin.visaResponsable ?? ""}
            onChange={(v) => onPatch({ visaResponsable: v })}
          />
        </div>
      </div>

      {/* Sticky bottom tally */}
      <div
        className="mt-4 flex items-center justify-between gap-2 flex-wrap pt-3 border-t"
        style={{ borderColor: "var(--psych-border)" }}
      >
        <div className="flex items-center gap-1.5 flex-wrap">
          {template.schema.values.map((v) => (
            <Tally
              key={v.value}
              label={v.label}
              count={grid.counts[v.value] ?? 0}
              tone={v.tone ?? "neutral"}
            />
          ))}
          <span
            className="text-[10px] ml-2"
            style={{ color: "var(--psych-muted)" }}
          >
            {grid.acquisitionPct}% acquisition · {grid.observabilityPct}% coté
          </span>
        </div>
      </div>

      {template.licensingNote && (
        <p
          className="text-[10px] mt-3"
          style={{
            color: "var(--psych-muted)",
            fontStyle: "italic",
          }}
        >
          ⚠ {template.licensingNote}
        </p>
      )}
    </SectionCard>
  );
}

// ─────────────────────────────────────────────────────────────────
// Schema-driven score buttons
// ─────────────────────────────────────────────────────────────────

function SchemaButtonGroup({
  values,
  current,
  onPick,
  onClear,
}: {
  values: ReadonlyArray<ScoreSchemaValue<string>>;
  current: string | undefined;
  onPick: (value: string) => void;
  onClear: () => void;
}) {
  return (
    <div className="inline-flex items-center gap-1 flex-wrap">
      {values.map((v) => {
        const active = current === v.value;
        const tone = v.tone ?? "neutral";
        return (
          <button
            key={v.value}
            type="button"
            onClick={() => onPick(v.value)}
            title={v.longLabel ?? v.label}
            className="text-[11px] font-semibold rounded-md transition-all"
            style={{
              backgroundColor: active ? TONE_BG[tone] : "var(--psych-bg)",
              color: active ? TONE_FG[tone] : "var(--psych-muted)",
              border: active
                ? `1px solid ${TONE_FG[tone]}`
                : "1px solid var(--psych-border)",
              padding: "4px 8px",
              minWidth: 36,
            }}
          >
            {v.label}
          </button>
        );
      })}
      {current !== undefined && (
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
  tone,
}: {
  label: string;
  count: number;
  tone: string;
}) {
  return (
    <span
      className="text-[10px] font-medium px-2 py-0.5 rounded-md"
      style={{
        backgroundColor: count > 0 ? TONE_BG[tone] : "var(--psych-bg)",
        color: count > 0 ? TONE_FG[tone] : "var(--psych-muted)",
      }}
    >
      {label} · {count}
    </span>
  );
}

function FieldText({
  label,
  value,
  onChange,
  type,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
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
        placeholder={placeholder}
      />
    </div>
  );
}
