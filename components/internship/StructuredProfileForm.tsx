"use client";

// Click-driven case profile form. Chips and segmented controls for
// every clinical field; free-text notes only as a collapsed "Add
// note" affordance per domain. Generates a clinical summary +
// suggested grids on demand.
//
// All options are non-copyrighted, generic clinical observation
// categories. Copyrighted test items live behind file upload or
// manual entry in the Tests tab, not here.

import { useMemo, useState } from "react";
import {
  ChevronRight,
  Eraser,
  FileText,
  Layers,
  PenLine,
  Sparkles,
} from "lucide-react";

import { SectionCard } from "@/components/shared/SectionCard";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  ADAPTIVE_LEVEL_LABELS,
  BEHAVIOR_FUNCTION_LABELS,
  BEHAVIOR_PATTERN_LABELS,
  BEHAVIOR_TRIGGER_LABELS,
  COMPREHENSION_LABELS,
  DISTRACTIBILITY_LABELS,
  EXPRESSION_MODALITY_LABELS,
  EYE_CONTACT_LABELS,
  FREQUENCY_LABELS,
  INITIATION_LABELS,
  INTENSITY_LABELS,
  JOINT_ATTENTION_LABELS,
  PEER_INTERACTION_LABELS,
  PROFILE_DOMAIN_LABELS,
  REQUESTS_LEVEL_LABELS,
  RESPONSE_TO_ADULT_LABELS,
  RESPONSE_TO_INSTRUCTIONS_LABELS,
  RESPONSE_TO_NAME_LABELS,
  ROUTINES_LEVEL_LABELS,
  SAFETY_AWARENESS_LABELS,
  SENSORY_MODALITY_LABELS,
  SENSORY_PATTERN_LABELS,
  SITTING_TOLERANCE_LABELS,
  TASK_ENGAGEMENT_LABELS,
  TURN_TAKING_LABELS,
  VERBAL_LEVEL_LABELS,
  WAITING_TOLERANCE_LABELS,
  patchStructuredProfile,
  profileCoverage,
  setProfileNote,
  type AdaptiveLevel,
  type BehaviorFunction,
  type BehaviorPattern,
  type BehaviorTrigger,
  type Comprehension,
  type Distractibility,
  type ExpressionModality,
  type EyeContact,
  type Frequency,
  type Initiation,
  type Intensity,
  type JointAttention,
  type PeerInteraction,
  type ProfileDomain,
  type RequestsLevel,
  type ResponseToAdult,
  type ResponseToInstructions,
  type ResponseToName,
  type RoutinesLevel,
  type SafetyAwareness,
  type SensoryModality,
  type SensoryPattern,
  type SittingTolerance,
  type StructuredProfile,
  type TaskEngagement,
  type TurnTaking,
  type VerbalLevel,
  type WaitingTolerance,
} from "@/lib/internship/structured-profile";
import { generateProfileSummary } from "@/lib/internship/structured-profile-text";
import { followUpGridLabel } from "@/lib/internship/scorable-templates";

// ─── Public component ─────────────────────────────────────────

interface Props {
  value: StructuredProfile | undefined;
  onChange: (next: StructuredProfile) => void;
  onAdministerGrid?: (templateKey: string) => void;
}

export function StructuredProfileForm({
  value,
  onChange,
  onAdministerGrid,
}: Props) {
  // Stable reference for the empty-profile case so useMemo doesn't
  // thrash when the caller passes `undefined` repeatedly.
  const profile = useMemo<StructuredProfile>(() => value ?? {}, [value]);
  const [openSummary, setOpenSummary] = useState(false);
  const coverage = useMemo(() => profileCoverage(profile), [profile]);
  const summary = useMemo(() => generateProfileSummary(profile), [profile]);

  function patch(domain: ProfileDomain, p: object) {
    onChange(patchStructuredProfile(profile, domain, p));
  }
  function note(domain: ProfileDomain, value: string) {
    onChange(setProfileNote(profile, domain, value));
  }

  return (
    <div className="space-y-3">
      {/* Coverage / actions strip */}
      <SectionCard
        title="Profil clinique structuré"
        description="Sélectionner les options par domaine. Eyla écrit la synthèse clinique automatiquement."
        action={
          <div className="flex items-center gap-2">
            <span
              className="text-[10px] uppercase tracking-wide"
              style={{ color: "var(--psych-muted)" }}
            >
              {coverage.filled}/{coverage.total} champs · {coverage.pct}%
            </span>
            <Button
              size="sm"
              onClick={() => setOpenSummary((v) => !v)}
              variant={openSummary ? "secondary" : "primary"}
            >
              <Sparkles size={12} />{" "}
              {openSummary ? "Masquer" : "Générer"} synthèse
            </Button>
          </div>
        }
      >
        <div
          className="w-full h-1.5 rounded-full overflow-hidden"
          style={{ backgroundColor: "var(--psych-bg)" }}
          aria-label={`Couverture du profil ${coverage.pct}%`}
        >
          <div
            className="h-full transition-all"
            style={{
              width: `${coverage.pct}%`,
              backgroundColor: "var(--psych-primary)",
            }}
          />
        </div>
      </SectionCard>

      {/* Summary panel */}
      {openSummary && (
        <SummaryPanel
          summary={summary}
          onAdministerGrid={onAdministerGrid}
        />
      )}

      {/* Communication */}
      <DomainCard
        domain="communication"
        notes={profile.notes?.communication ?? ""}
        onNoteChange={(v) => note("communication", v)}
      >
        <ChipRow
          label="Niveau verbal"
          options={ENUMS.verbalLevel}
          value={profile.communication?.verbalLevel}
          onPick={(v) => patch("communication", { verbalLevel: v })}
        />
        <ChipRow
          label="Compréhension"
          options={ENUMS.comprehension}
          value={profile.communication?.comprehension}
          onPick={(v) => patch("communication", { comprehension: v })}
        />
        <MultiChipRow
          label="Expression (modalités observées)"
          options={ENUMS.expressionModality}
          value={profile.communication?.expression ?? []}
          onPick={(values) => patch("communication", { expression: values })}
        />
        <ChipRow
          label="Demandes"
          options={ENUMS.requestsLevel}
          value={profile.communication?.requests}
          onPick={(v) => patch("communication", { requests: v })}
        />
        <ChipRow
          label="Réponse au prénom"
          options={ENUMS.responseToName}
          value={profile.communication?.responseToName}
          onPick={(v) => patch("communication", { responseToName: v })}
        />
        <ChipRow
          label="Contact visuel"
          options={ENUMS.eyeContact}
          value={profile.communication?.eyeContact}
          onPick={(v) => patch("communication", { eyeContact: v })}
        />
      </DomainCard>

      {/* Social interaction */}
      <DomainCard
        domain="social"
        notes={profile.notes?.social ?? ""}
        onNoteChange={(v) => note("social", v)}
      >
        <ChipRow
          label="Initiation"
          options={ENUMS.initiation}
          value={profile.social?.initiation}
          onPick={(v) => patch("social", { initiation: v })}
        />
        <ChipRow
          label="Réponse à l'adulte"
          options={ENUMS.responseToAdult}
          value={profile.social?.responseToAdult}
          onPick={(v) => patch("social", { responseToAdult: v })}
        />
        <ChipRow
          label="Interaction avec les pairs"
          options={ENUMS.peerInteraction}
          value={profile.social?.peerInteraction}
          onPick={(v) => patch("social", { peerInteraction: v })}
        />
        <ChipRow
          label="Attention conjointe"
          options={ENUMS.jointAttention}
          value={profile.social?.jointAttention}
          onPick={(v) => patch("social", { jointAttention: v })}
        />
        <ChipRow
          label="Tour de rôle"
          options={ENUMS.turnTaking}
          value={profile.social?.turnTaking}
          onPick={(v) => patch("social", { turnTaking: v })}
        />
      </DomainCard>

      {/* Sensory */}
      <DomainCard
        domain="sensory"
        notes={profile.notes?.sensory ?? ""}
        onNoteChange={(v) => note("sensory", v)}
      >
        {(Object.keys(SENSORY_MODALITY_LABELS) as SensoryModality[]).map(
          (modality) => (
            <ChipRow
              key={modality}
              label={SENSORY_MODALITY_LABELS[modality]}
              options={ENUMS.sensoryPattern}
              value={profile.sensory?.[modality]}
              onPick={(v) => patch("sensory", { [modality]: v })}
            />
          )
        )}
      </DomainCard>

      {/* Behavior */}
      <DomainCard
        domain="behavior"
        notes={profile.notes?.behavior ?? ""}
        onNoteChange={(v) => note("behavior", v)}
      >
        <MultiChipRow
          label="Comportements principaux"
          options={ENUMS.behaviorPattern}
          value={profile.behavior?.mainBehaviors ?? []}
          onPick={(values) =>
            patch("behavior", { mainBehaviors: values })
          }
        />
        <MultiChipRow
          label="Déclencheurs"
          options={ENUMS.behaviorTrigger}
          value={profile.behavior?.triggers ?? []}
          onPick={(values) => patch("behavior", { triggers: values })}
        />
        <ChipRow
          label="Intensité"
          options={ENUMS.intensity}
          value={profile.behavior?.intensity}
          onPick={(v) => patch("behavior", { intensity: v })}
        />
        <ChipRow
          label="Fréquence"
          options={ENUMS.frequency}
          value={profile.behavior?.frequency}
          onPick={(v) => patch("behavior", { frequency: v })}
        />
        <ChipRow
          label="Hypothèse de fonction"
          options={ENUMS.behaviorFunction}
          value={profile.behavior?.functionHypothesis}
          onPick={(v) =>
            patch("behavior", { functionHypothesis: v })
          }
        />
      </DomainCard>

      {/* Attention */}
      <DomainCard
        domain="attention"
        notes={profile.notes?.attention ?? ""}
        onNoteChange={(v) => note("attention", v)}
      >
        <ChipRow
          label="Tolérance position assise"
          options={ENUMS.sittingTolerance}
          value={profile.attention?.sittingTolerance}
          onPick={(v) => patch("attention", { sittingTolerance: v })}
        />
        <ChipRow
          label="Engagement dans la tâche"
          options={ENUMS.taskEngagement}
          value={profile.attention?.taskEngagement}
          onPick={(v) => patch("attention", { taskEngagement: v })}
        />
        <ChipRow
          label="Distractibilité"
          options={ENUMS.distractibility}
          value={profile.attention?.distractibility}
          onPick={(v) => patch("attention", { distractibility: v })}
        />
        <ChipRow
          label="Tolérance à l'attente"
          options={ENUMS.waitingTolerance}
          value={profile.attention?.waitingTolerance}
          onPick={(v) =>
            patch("attention", { waitingTolerance: v })
          }
        />
        <ChipRow
          label="Réponse aux consignes"
          options={ENUMS.responseToInstructions}
          value={profile.attention?.responseToInstructions}
          onPick={(v) =>
            patch("attention", { responseToInstructions: v })
          }
        />
      </DomainCard>

      {/* Autonomy */}
      <DomainCard
        domain="autonomy"
        notes={profile.notes?.autonomy ?? ""}
        onNoteChange={(v) => note("autonomy", v)}
      >
        <ChipRow
          label="Toilettes"
          options={ENUMS.adaptiveLevel}
          value={profile.autonomy?.toileting}
          onPick={(v) => patch("autonomy", { toileting: v })}
        />
        <ChipRow
          label="Repas"
          options={ENUMS.adaptiveLevel}
          value={profile.autonomy?.feeding}
          onPick={(v) => patch("autonomy", { feeding: v })}
        />
        <ChipRow
          label="Habillage"
          options={ENUMS.adaptiveLevel}
          value={profile.autonomy?.dressing}
          onPick={(v) => patch("autonomy", { dressing: v })}
        />
        <ChipRow
          label="Routines"
          options={ENUMS.routinesLevel}
          value={profile.autonomy?.routines}
          onPick={(v) => patch("autonomy", { routines: v })}
        />
        <ChipRow
          label="Conscience des dangers"
          options={ENUMS.safetyAwareness}
          value={profile.autonomy?.safetyAwareness}
          onPick={(v) => patch("autonomy", { safetyAwareness: v })}
        />
      </DomainCard>
    </div>
  );
}

// ─── Summary panel ────────────────────────────────────────────

function SummaryPanel({
  summary,
  onAdministerGrid,
}: {
  summary: ReturnType<typeof generateProfileSummary>;
  onAdministerGrid?: (templateKey: string) => void;
}) {
  return (
    <SectionCard
      title="Synthèse clinique générée"
      description="Texte rédigé à partir des sélections. Modifiable avant insertion dans un rapport."
    >
      <p
        className="text-sm italic mb-3"
        style={{ color: "var(--psych-text)" }}
      >
        {summary.headline}
      </p>

      <ul className="space-y-2 mb-3">
        {summary.perDomain
          .filter((d) => d.paragraph.length > 0)
          .map((d) => (
            <li key={d.domain} className="text-xs">
              <span
                className="font-semibold"
                style={{ color: "var(--psych-text)" }}
              >
                {d.label}
              </span>
              <span
                className="ml-2 text-[10px]"
                style={{ color: "var(--psych-muted)" }}
              >
                {d.weakness >= 0.5
                  ? "Priorité"
                  : d.weakness >= 0.3
                  ? "Vigilance"
                  : "Préservé"}
              </span>
              <p
                className="mt-1"
                style={{ color: "var(--psych-text)" }}
              >
                {d.paragraph}
              </p>
            </li>
          ))}
      </ul>

      <div
        className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs mb-3"
        style={{ color: "var(--psych-text)" }}
      >
        <SummaryBlock title="Forces" body={summary.strengths} />
        <SummaryBlock title="Difficultés" body={summary.difficulties} />
      </div>

      {summary.suggestedGridKeys.length > 0 && (
        <div
          className="rounded-md p-3"
          style={{
            backgroundColor: "var(--psych-bg)",
            border: "1px solid var(--psych-border)",
          }}
        >
          <p
            className="text-[10px] uppercase tracking-wider mb-1.5"
            style={{ color: "var(--psych-muted)" }}
          >
            Grilles suggérées d&rsquo;après le profil
          </p>
          <div className="flex flex-wrap gap-1.5">
            {summary.suggestedGridKeys.map((k) => {
              const label = followUpGridLabel(k);
              if (onAdministerGrid) {
                return (
                  <Button
                    key={k}
                    size="sm"
                    variant="outline"
                    onClick={() => onAdministerGrid(k)}
                  >
                    <Layers size={11} /> {label}
                  </Button>
                );
              }
              return (
                <span
                  key={k}
                  className="text-[10px] px-2 py-0.5 rounded-full inline-flex items-center gap-1"
                  style={{
                    backgroundColor: "var(--psych-primary-light)",
                    color: "var(--psych-primary)",
                  }}
                >
                  <Layers size={9} /> {label}
                </span>
              );
            })}
          </div>
        </div>
      )}
    </SectionCard>
  );
}

function SummaryBlock({ title, body }: { title: string; body: string }) {
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

// ─── Domain card with collapsed "Add note" affordance ─────────

function DomainCard({
  domain,
  notes,
  onNoteChange,
  children,
}: {
  domain: ProfileDomain;
  notes: string;
  onNoteChange: (v: string) => void;
  children: React.ReactNode;
}) {
  const [noteOpen, setNoteOpen] = useState(Boolean(notes));
  return (
    <SectionCard title={PROFILE_DOMAIN_LABELS[domain]}>
      <div className="space-y-2.5">{children}</div>
      <div
        className="mt-3 pt-3 border-t"
        style={{ borderColor: "var(--psych-border)" }}
      >
        {noteOpen ? (
          <div>
            <label
              className="text-[10px] uppercase tracking-wider mb-1 block"
              style={{ color: "var(--psych-muted)" }}
            >
              Note (optionnelle)
            </label>
            <Textarea
              rows={2}
              value={notes}
              onChange={(e) => onNoteChange(e.target.value)}
              placeholder="Détail clinique que les chips ne capturent pas…"
            />
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setNoteOpen(true)}
            className="text-[11px] inline-flex items-center gap-1"
            style={{ color: "var(--psych-muted)" }}
          >
            <PenLine size={10} /> Ajouter une note si besoin
            <ChevronRight size={10} />
          </button>
        )}
      </div>
    </SectionCard>
  );
}

// ─── Single-select chip row ───────────────────────────────────

function ChipRow<T extends string>({
  label,
  options,
  value,
  onPick,
}: {
  label: string;
  options: Array<{ value: T; label: string }>;
  value: T | undefined;
  onPick: (v: T | undefined) => void;
}) {
  return (
    <div>
      <p
        className="text-[10px] uppercase tracking-wider mb-1"
        style={{ color: "var(--psych-muted)" }}
      >
        {label}
      </p>
      <div className="flex flex-wrap items-center gap-1.5">
        {options.map((o) => {
          const active = value === o.value;
          return (
            <button
              key={o.value}
              type="button"
              onClick={() => onPick(active ? undefined : o.value)}
              className="text-[11px] rounded-md transition-colors"
              style={{
                backgroundColor: active
                  ? "var(--psych-primary-light)"
                  : "var(--psych-bg)",
                color: active
                  ? "var(--psych-primary)"
                  : "var(--psych-text)",
                border: active
                  ? "1px solid var(--psych-primary)"
                  : "1px solid var(--psych-border)",
                padding: "4px 9px",
              }}
            >
              {o.label}
            </button>
          );
        })}
        {value !== undefined && (
          <button
            type="button"
            onClick={() => onPick(undefined)}
            aria-label="Effacer"
            className="text-[10px] rounded-md p-1"
            style={{ color: "var(--psych-muted)" }}
          >
            <Eraser size={10} />
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Multi-select chip row ────────────────────────────────────

function MultiChipRow<T extends string>({
  label,
  options,
  value,
  onPick,
}: {
  label: string;
  options: Array<{ value: T; label: string }>;
  value: T[];
  onPick: (v: T[]) => void;
}) {
  function toggle(v: T) {
    if (value.includes(v)) {
      onPick(value.filter((x) => x !== v));
    } else {
      onPick([...value, v]);
    }
  }
  return (
    <div>
      <p
        className="text-[10px] uppercase tracking-wider mb-1"
        style={{ color: "var(--psych-muted)" }}
      >
        {label}
      </p>
      <div className="flex flex-wrap items-center gap-1.5">
        {options.map((o) => {
          const active = value.includes(o.value);
          return (
            <button
              key={o.value}
              type="button"
              onClick={() => toggle(o.value)}
              className="text-[11px] rounded-md transition-colors"
              style={{
                backgroundColor: active
                  ? "var(--psych-primary-light)"
                  : "var(--psych-bg)",
                color: active
                  ? "var(--psych-primary)"
                  : "var(--psych-text)",
                border: active
                  ? "1px solid var(--psych-primary)"
                  : "1px solid var(--psych-border)",
                padding: "4px 9px",
              }}
            >
              {o.label}
            </button>
          );
        })}
        {value.length > 0 && (
          <button
            type="button"
            onClick={() => onPick([])}
            aria-label="Effacer la sélection"
            className="text-[10px] rounded-md p-1"
            style={{ color: "var(--psych-muted)" }}
          >
            <Eraser size={10} />
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Enum → option-list bundles (drives the chip rows) ────────

function optionsFromLabels<K extends string>(
  labels: Record<K, string>
): Array<{ value: K; label: string }> {
  return (Object.keys(labels) as K[]).map((k) => ({
    value: k,
    label: labels[k],
  }));
}

const ENUMS = {
  verbalLevel: optionsFromLabels<VerbalLevel>(VERBAL_LEVEL_LABELS),
  comprehension: optionsFromLabels<Comprehension>(COMPREHENSION_LABELS),
  expressionModality: optionsFromLabels<ExpressionModality>(
    EXPRESSION_MODALITY_LABELS
  ),
  requestsLevel: optionsFromLabels<RequestsLevel>(REQUESTS_LEVEL_LABELS),
  responseToName: optionsFromLabels<ResponseToName>(RESPONSE_TO_NAME_LABELS),
  eyeContact: optionsFromLabels<EyeContact>(EYE_CONTACT_LABELS),
  initiation: optionsFromLabels<Initiation>(INITIATION_LABELS),
  responseToAdult: optionsFromLabels<ResponseToAdult>(RESPONSE_TO_ADULT_LABELS),
  peerInteraction: optionsFromLabels<PeerInteraction>(PEER_INTERACTION_LABELS),
  jointAttention: optionsFromLabels<JointAttention>(JOINT_ATTENTION_LABELS),
  turnTaking: optionsFromLabels<TurnTaking>(TURN_TAKING_LABELS),
  sensoryPattern: optionsFromLabels<SensoryPattern>(SENSORY_PATTERN_LABELS),
  behaviorPattern: optionsFromLabels<BehaviorPattern>(BEHAVIOR_PATTERN_LABELS),
  behaviorTrigger: optionsFromLabels<BehaviorTrigger>(BEHAVIOR_TRIGGER_LABELS),
  intensity: optionsFromLabels<Intensity>(INTENSITY_LABELS),
  frequency: optionsFromLabels<Frequency>(FREQUENCY_LABELS),
  behaviorFunction: optionsFromLabels<BehaviorFunction>(
    BEHAVIOR_FUNCTION_LABELS
  ),
  sittingTolerance: optionsFromLabels<SittingTolerance>(
    SITTING_TOLERANCE_LABELS
  ),
  taskEngagement: optionsFromLabels<TaskEngagement>(TASK_ENGAGEMENT_LABELS),
  distractibility: optionsFromLabels<Distractibility>(DISTRACTIBILITY_LABELS),
  waitingTolerance: optionsFromLabels<WaitingTolerance>(
    WAITING_TOLERANCE_LABELS
  ),
  responseToInstructions: optionsFromLabels<ResponseToInstructions>(
    RESPONSE_TO_INSTRUCTIONS_LABELS
  ),
  adaptiveLevel: optionsFromLabels<AdaptiveLevel>(ADAPTIVE_LEVEL_LABELS),
  routinesLevel: optionsFromLabels<RoutinesLevel>(ROUTINES_LEVEL_LABELS),
  safetyAwareness: optionsFromLabels<SafetyAwareness>(SAFETY_AWARENESS_LABELS),
};

// Silence FileText lint warning — referenced in the report-block
// follow-up that ships alongside this PR.
void FileText;
