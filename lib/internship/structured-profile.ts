// Structured case profile — typed enums per clinical domain so the
// case page can be driven by clicks (chips / segmented controls /
// multi-select) instead of textareas. Each domain has a tight set
// of options drawn from the user's brief.
//
// Stored on InternshipClinicalContext as the optional
// `structuredProfile` field (declared in types.ts). The existing
// free-text fields remain for backward compatibility and capture
// what the structured form can't.

// ─── Communication ─────────────────────────────────────────────

export type VerbalLevel =
  | "non-verbal"
  | "isolated-words"
  | "simple-phrases"
  | "functional-phrases";

export type Comprehension =
  | "absent"
  | "simple-instructions"
  | "double-instructions"
  | "contextual"
  | "adapted";

export type ExpressionModality =
  | "gestures"
  | "pointing"
  | "words"
  | "phrases"
  | "echolalia"
  | "functional";

export type RequestsLevel =
  | "absent"
  | "with-help"
  | "spontaneous"
  | "generalized";

export type ResponseToName =
  | "absent"
  | "inconsistent"
  | "partial"
  | "consistent";

export type EyeContact =
  | "absent"
  | "brief"
  | "functional"
  | "excessive"
  | "variable";

export interface CommunicationProfile {
  verbalLevel?: VerbalLevel;
  comprehension?: Comprehension;
  expression?: ExpressionModality[];
  requests?: RequestsLevel;
  responseToName?: ResponseToName;
  eyeContact?: EyeContact;
}

// ─── Social interaction ────────────────────────────────────────

export type Initiation = "absent" | "rare" | "prompted" | "spontaneous";
export type ResponseToAdult = "absent" | "partial" | "adapted" | "variable";
export type PeerInteraction = "absent" | "parallel" | "brief" | "interactive";
export type JointAttention = "absent" | "emerging" | "partial" | "acquired";
export type TurnTaking = "absent" | "with-help" | "partial" | "acquired";

export interface SocialInteractionProfile {
  initiation?: Initiation;
  responseToAdult?: ResponseToAdult;
  peerInteraction?: PeerInteraction;
  jointAttention?: JointAttention;
  turnTaking?: TurnTaking;
}

// ─── Sensory ──────────────────────────────────────────────────

export type SensoryPattern =
  | "hypo"
  | "hyper"
  | "seeking"
  | "avoiding"
  | "no-concern";

export type SensoryModality =
  | "auditory"
  | "visual"
  | "tactile"
  | "vestibular"
  | "proprioceptive"
  | "oral";

// Each modality records ONE primary pattern. Mixed patterns can be
// noted in the optional notes field.
export type SensoryProfile = Partial<Record<SensoryModality, SensoryPattern>>;

// ─── Behavior ─────────────────────────────────────────────────

export type BehaviorPattern =
  | "avoidance"
  | "crying"
  | "screaming"
  | "withdrawal"
  | "agitation"
  | "opposition"
  | "stereotypies"
  | "self-stimulation"
  | "aggression"
  | "self-injury-placeholder"
  | "none-observed";

export type BehaviorTrigger =
  | "demand"
  | "transition"
  | "waiting"
  | "noise"
  | "frustration"
  | "denied-access"
  | "social-interaction"
  | "sensory-overload"
  | "unknown";

export type Intensity = "low" | "moderate" | "high";
export type Frequency = "rare" | "occasional" | "frequent" | "very-frequent";
export type BehaviorFunction =
  | "escape"
  | "attention"
  | "tangible"
  | "sensory"
  | "unclear";

export interface BehaviorProfile {
  mainBehaviors?: BehaviorPattern[];
  triggers?: BehaviorTrigger[];
  intensity?: Intensity;
  frequency?: Frequency;
  functionHypothesis?: BehaviorFunction;
}

// ─── Attention / engagement ───────────────────────────────────

export type SittingTolerance = "absent" | "brief" | "partial" | "stable";
export type TaskEngagement =
  | "absent"
  | "prompted"
  | "short-duration"
  | "sustained";
export type Distractibility = "low" | "moderate" | "high";
export type WaitingTolerance = "absent" | "brief" | "partial" | "acquired";
export type ResponseToInstructions =
  | "absent"
  | "inconsistent"
  | "partial"
  | "adapted";

export interface AttentionProfile {
  sittingTolerance?: SittingTolerance;
  taskEngagement?: TaskEngagement;
  distractibility?: Distractibility;
  waitingTolerance?: WaitingTolerance;
  responseToInstructions?: ResponseToInstructions;
}

// ─── Autonomy / adaptive ──────────────────────────────────────

export type AdaptiveLevel =
  | "independent"
  | "partial-help"
  | "full-help"
  | "not-assessed";
export type RoutinesLevel =
  | "resistant"
  | "needs-visual-support"
  | "follows-with-help"
  | "follows-independently";
export type SafetyAwareness =
  | "absent"
  | "emerging"
  | "partial"
  | "adapted";

export interface AutonomyProfile {
  toileting?: AdaptiveLevel;
  feeding?: AdaptiveLevel;
  dressing?: AdaptiveLevel;
  routines?: RoutinesLevel;
  safetyAwareness?: SafetyAwareness;
}

// ─── Domain identifier (used by notes + UI) ───────────────────

export type ProfileDomain =
  | "communication"
  | "social"
  | "sensory"
  | "behavior"
  | "attention"
  | "autonomy";

export const PROFILE_DOMAIN_LABELS: Record<ProfileDomain, string> = {
  communication: "Communication",
  social: "Interaction sociale",
  sensory: "Profil sensoriel",
  behavior: "Comportement",
  attention: "Attention / engagement",
  autonomy: "Autonomie / adaptation",
};

// ─── Top-level structured profile ─────────────────────────────

export interface StructuredProfile {
  communication?: CommunicationProfile;
  social?: SocialInteractionProfile;
  sensory?: SensoryProfile;
  behavior?: BehaviorProfile;
  attention?: AttentionProfile;
  autonomy?: AutonomyProfile;
  // Optional collapsed notes per domain — written only when the
  // clinician actually wants to add nuance.
  notes?: Partial<Record<ProfileDomain, string>>;
}

// ─── French labels for every enum value ───────────────────────
// Centralised so the form, the summary generator, and the report
// block all read the same display text.

export const VERBAL_LEVEL_LABELS: Record<VerbalLevel, string> = {
  "non-verbal": "Non verbal",
  "isolated-words": "Mots isolés",
  "simple-phrases": "Phrases simples",
  "functional-phrases": "Phrases fonctionnelles",
};
export const COMPREHENSION_LABELS: Record<Comprehension, string> = {
  absent: "Absente",
  "simple-instructions": "Consignes simples",
  "double-instructions": "Doubles consignes",
  contextual: "Contextuelle",
  adapted: "Adaptée",
};
export const EXPRESSION_MODALITY_LABELS: Record<ExpressionModality, string> = {
  gestures: "Gestes",
  pointing: "Pointage",
  words: "Mots",
  phrases: "Phrases",
  echolalia: "Écholalie",
  functional: "Communication fonctionnelle",
};
export const REQUESTS_LEVEL_LABELS: Record<RequestsLevel, string> = {
  absent: "Absente",
  "with-help": "Avec aide",
  spontaneous: "Spontanée",
  generalized: "Généralisée",
};
export const RESPONSE_TO_NAME_LABELS: Record<ResponseToName, string> = {
  absent: "Absente",
  inconsistent: "Inconstante",
  partial: "Partielle",
  consistent: "Constante",
};
export const EYE_CONTACT_LABELS: Record<EyeContact, string> = {
  absent: "Absent",
  brief: "Bref",
  functional: "Fonctionnel",
  excessive: "Excessif",
  variable: "Variable",
};

export const INITIATION_LABELS: Record<Initiation, string> = {
  absent: "Absente",
  rare: "Rare",
  prompted: "Sur incitation",
  spontaneous: "Spontanée",
};
export const RESPONSE_TO_ADULT_LABELS: Record<ResponseToAdult, string> = {
  absent: "Absente",
  partial: "Partielle",
  adapted: "Adaptée",
  variable: "Variable",
};
export const PEER_INTERACTION_LABELS: Record<PeerInteraction, string> = {
  absent: "Absente",
  parallel: "Parallèle",
  brief: "Brève",
  interactive: "Interactive",
};
export const JOINT_ATTENTION_LABELS: Record<JointAttention, string> = {
  absent: "Absente",
  emerging: "Émergente",
  partial: "Partielle",
  acquired: "Acquise",
};
export const TURN_TAKING_LABELS: Record<TurnTaking, string> = {
  absent: "Absent",
  "with-help": "Avec aide",
  partial: "Partiel",
  acquired: "Acquis",
};

export const SENSORY_PATTERN_LABELS: Record<SensoryPattern, string> = {
  hypo: "Hyporéactivité",
  hyper: "Hyperréactivité",
  seeking: "Recherche sensorielle",
  avoiding: "Évitement",
  "no-concern": "Pas de difficulté",
};
export const SENSORY_MODALITY_LABELS: Record<SensoryModality, string> = {
  auditory: "Auditif",
  visual: "Visuel",
  tactile: "Tactile",
  vestibular: "Vestibulaire",
  proprioceptive: "Proprioceptif",
  oral: "Oral",
};

export const BEHAVIOR_PATTERN_LABELS: Record<BehaviorPattern, string> = {
  avoidance: "Évitement",
  crying: "Pleurs",
  screaming: "Cris",
  withdrawal: "Retrait",
  agitation: "Agitation",
  opposition: "Opposition",
  stereotypies: "Stéréotypies",
  "self-stimulation": "Auto-stimulation",
  aggression: "Comportement hétéro-agressif",
  "self-injury-placeholder": "Comportements auto-dirigés (à préciser)",
  "none-observed": "Aucun observé",
};
export const BEHAVIOR_TRIGGER_LABELS: Record<BehaviorTrigger, string> = {
  demand: "Demande",
  transition: "Transition",
  waiting: "Attente",
  noise: "Bruit",
  frustration: "Frustration",
  "denied-access": "Retrait d'objet",
  "social-interaction": "Interaction sociale",
  "sensory-overload": "Surcharge sensorielle",
  unknown: "Inconnu",
};
export const INTENSITY_LABELS: Record<Intensity, string> = {
  low: "Légère",
  moderate: "Modérée",
  high: "Élevée",
};
export const FREQUENCY_LABELS: Record<Frequency, string> = {
  rare: "Rare",
  occasional: "Occasionnelle",
  frequent: "Fréquente",
  "very-frequent": "Très fréquente",
};
export const BEHAVIOR_FUNCTION_LABELS: Record<BehaviorFunction, string> = {
  escape: "Échappement",
  attention: "Attention",
  tangible: "Accès tangible",
  sensory: "Automatique / sensorielle",
  unclear: "À explorer",
};

export const SITTING_TOLERANCE_LABELS: Record<SittingTolerance, string> = {
  absent: "Absente",
  brief: "Brève",
  partial: "Partielle",
  stable: "Stable",
};
export const TASK_ENGAGEMENT_LABELS: Record<TaskEngagement, string> = {
  absent: "Absent",
  prompted: "Sur incitation",
  "short-duration": "Courte durée",
  sustained: "Soutenu",
};
export const DISTRACTIBILITY_LABELS: Record<Distractibility, string> = {
  low: "Faible",
  moderate: "Modérée",
  high: "Élevée",
};
export const WAITING_TOLERANCE_LABELS: Record<WaitingTolerance, string> = {
  absent: "Absente",
  brief: "Brève",
  partial: "Partielle",
  acquired: "Acquise",
};
export const RESPONSE_TO_INSTRUCTIONS_LABELS: Record<
  ResponseToInstructions,
  string
> = {
  absent: "Absente",
  inconsistent: "Inconstante",
  partial: "Partielle",
  adapted: "Adaptée",
};

export const ADAPTIVE_LEVEL_LABELS: Record<AdaptiveLevel, string> = {
  independent: "Autonome",
  "partial-help": "Aide partielle",
  "full-help": "Aide importante",
  "not-assessed": "Non évalué",
};
export const ROUTINES_LEVEL_LABELS: Record<RoutinesLevel, string> = {
  resistant: "Résistance aux routines",
  "needs-visual-support": "Nécessite un support visuel",
  "follows-with-help": "Suivi avec aide",
  "follows-independently": "Suivi autonome",
};
export const SAFETY_AWARENESS_LABELS: Record<SafetyAwareness, string> = {
  absent: "Absente",
  emerging: "Émergente",
  partial: "Partielle",
  adapted: "Adaptée",
};

// ─── Mutations ────────────────────────────────────────────────

export function patchStructuredProfile(
  current: StructuredProfile | undefined,
  domain: ProfileDomain,
  patch: object
): StructuredProfile {
  const base = current ?? {};
  switch (domain) {
    case "communication":
      return { ...base, communication: { ...(base.communication ?? {}), ...patch } };
    case "social":
      return { ...base, social: { ...(base.social ?? {}), ...patch } };
    case "sensory":
      return { ...base, sensory: { ...(base.sensory ?? {}), ...patch } };
    case "behavior":
      return { ...base, behavior: { ...(base.behavior ?? {}), ...patch } };
    case "attention":
      return { ...base, attention: { ...(base.attention ?? {}), ...patch } };
    case "autonomy":
      return { ...base, autonomy: { ...(base.autonomy ?? {}), ...patch } };
  }
}

export function setProfileNote(
  current: StructuredProfile | undefined,
  domain: ProfileDomain,
  note: string
): StructuredProfile {
  const base = current ?? {};
  return {
    ...base,
    notes: { ...(base.notes ?? {}), [domain]: note },
  };
}

// ─── Convenience: structured-profile "coverage" ───────────────
// How many fields are filled — drives the UI's progress indicator.

export function profileCoverage(profile: StructuredProfile | undefined): {
  filled: number;
  total: number;
  pct: number;
} {
  const slots: Array<unknown> = profile
    ? [
        profile.communication?.verbalLevel,
        profile.communication?.comprehension,
        (profile.communication?.expression?.length ?? 0) > 0 ? "x" : undefined,
        profile.communication?.requests,
        profile.communication?.responseToName,
        profile.communication?.eyeContact,
        profile.social?.initiation,
        profile.social?.responseToAdult,
        profile.social?.peerInteraction,
        profile.social?.jointAttention,
        profile.social?.turnTaking,
        profile.sensory?.auditory,
        profile.sensory?.visual,
        profile.sensory?.tactile,
        profile.sensory?.vestibular,
        profile.sensory?.proprioceptive,
        profile.sensory?.oral,
        (profile.behavior?.mainBehaviors?.length ?? 0) > 0 ? "x" : undefined,
        (profile.behavior?.triggers?.length ?? 0) > 0 ? "x" : undefined,
        profile.behavior?.intensity,
        profile.behavior?.frequency,
        profile.behavior?.functionHypothesis,
        profile.attention?.sittingTolerance,
        profile.attention?.taskEngagement,
        profile.attention?.distractibility,
        profile.attention?.waitingTolerance,
        profile.attention?.responseToInstructions,
        profile.autonomy?.toileting,
        profile.autonomy?.feeding,
        profile.autonomy?.dressing,
        profile.autonomy?.routines,
        profile.autonomy?.safetyAwareness,
      ]
    : [];
  const total = 32;
  const filled = slots.filter((s) => s !== undefined && s !== null).length;
  return {
    filled,
    total,
    pct: total > 0 ? Math.round((filled / total) * 100) : 0,
  };
}
