// Auto-generated clinical text from a StructuredProfile.
//
// Three outputs:
//   - generateProfileSummary() — headline + per-domain paragraphs
//     + strengths + difficulties + priority domains.
//   - suggestGridsFromProfile() — flat list of grid template keys
//     to administer next, based on the selections.
//   - profileToReportBlock() — plain-text block suitable to seed
//     a daily/weekly/final report's "case presentation" section.
//
// Everything is rule-based: structured selections in, French
// clinical prose out. The user can edit the generated text after.

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
  SITTING_TOLERANCE_LABELS,
  TASK_ENGAGEMENT_LABELS,
  TURN_TAKING_LABELS,
  VERBAL_LEVEL_LABELS,
  WAITING_TOLERANCE_LABELS,
  type ProfileDomain,
  type SensoryModality,
  type SensoryPattern,
  type StructuredProfile,
} from "./structured-profile";

// ─── Helpers ─────────────────────────────────────────────────

function joinSentences(parts: Array<string | undefined | null>): string {
  return parts
    .filter((p): p is string => Boolean(p && p.trim()))
    .map((p) => (p.endsWith(".") ? p : p + "."))
    .join(" ");
}

function joinFrench(items: string[]): string {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} et ${items[1]}`;
  return `${items.slice(0, -1).join(", ")} et ${items[items.length - 1]}`;
}

// ─── Domain-level paragraphs ─────────────────────────────────

function communicationParagraph(profile: StructuredProfile): string {
  const c = profile.communication;
  if (!c) return "";
  const parts: string[] = [];

  if (c.verbalLevel) {
    parts.push(
      c.verbalLevel === "non-verbal"
        ? "Sur le plan expressif, le niveau verbal est non verbal."
        : `Sur le plan expressif, le niveau verbal se situe au stade « ${VERBAL_LEVEL_LABELS[c.verbalLevel].toLowerCase()} ».`
    );
  }
  if (c.comprehension) {
    parts.push(
      c.comprehension === "absent"
        ? "La compréhension verbale apparaît absente sur les épreuves observées."
        : `La compréhension verbale est de niveau « ${COMPREHENSION_LABELS[c.comprehension].toLowerCase()} ».`
    );
  }
  if (c.expression && c.expression.length > 0) {
    parts.push(
      `Les modalités expressives observées : ${joinFrench(
        c.expression.map((e) => EXPRESSION_MODALITY_LABELS[e].toLowerCase())
      )}.`
    );
  }
  if (c.requests) {
    parts.push(
      `Les demandes sont ${REQUESTS_LEVEL_LABELS[c.requests].toLowerCase()}.`
    );
  }
  if (c.responseToName) {
    parts.push(
      `La réponse à l'appel du prénom est ${RESPONSE_TO_NAME_LABELS[c.responseToName].toLowerCase()}.`
    );
  }
  if (c.eyeContact) {
    parts.push(
      `Le contact visuel est ${EYE_CONTACT_LABELS[c.eyeContact].toLowerCase()}.`
    );
  }
  return joinSentences(parts);
}

function socialParagraph(profile: StructuredProfile): string {
  const s = profile.social;
  if (!s) return "";
  const parts: string[] = [];

  if (s.initiation) {
    parts.push(
      `L'initiation sociale est ${INITIATION_LABELS[s.initiation].toLowerCase()}.`
    );
  }
  if (s.responseToAdult) {
    parts.push(
      `La réponse aux sollicitations de l'adulte est ${RESPONSE_TO_ADULT_LABELS[s.responseToAdult].toLowerCase()}.`
    );
  }
  if (s.peerInteraction) {
    parts.push(
      s.peerInteraction === "parallel"
        ? "Le jeu avec les pairs reste majoritairement parallèle."
        : `L'interaction avec les pairs est ${PEER_INTERACTION_LABELS[s.peerInteraction].toLowerCase()}.`
    );
  }
  if (s.jointAttention) {
    parts.push(
      `L'attention conjointe est ${JOINT_ATTENTION_LABELS[s.jointAttention].toLowerCase()}.`
    );
  }
  if (s.turnTaking) {
    parts.push(
      `Le tour de rôle est ${TURN_TAKING_LABELS[s.turnTaking].toLowerCase()}.`
    );
  }
  return joinSentences(parts);
}

function sensoryParagraph(profile: StructuredProfile): string {
  const s = profile.sensory;
  if (!s) return "";
  const modalities: SensoryModality[] = [
    "auditory",
    "visual",
    "tactile",
    "vestibular",
    "proprioceptive",
    "oral",
  ];
  const hyper: string[] = [];
  const hypo: string[] = [];
  const seeking: string[] = [];
  const avoiding: string[] = [];
  for (const m of modalities) {
    const pattern = s[m];
    if (!pattern) continue;
    const label = SENSORY_MODALITY_LABELS[m].toLowerCase();
    if (pattern === "hyper") hyper.push(label);
    else if (pattern === "hypo") hypo.push(label);
    else if (pattern === "seeking") seeking.push(label);
    else if (pattern === "avoiding") avoiding.push(label);
  }

  const parts: string[] = [];
  if (hyper.length > 0) {
    parts.push(
      `Une hyperréactivité sensorielle est observée sur les modalités : ${joinFrench(hyper)} — ce qui peut influencer la disponibilité attentionnelle.`
    );
  }
  if (hypo.length > 0) {
    parts.push(
      `Une hyporéactivité est observée sur : ${joinFrench(hypo)}.`
    );
  }
  if (seeking.length > 0) {
    parts.push(
      `Des comportements de recherche sensorielle sont observés sur : ${joinFrench(seeking)}.`
    );
  }
  if (avoiding.length > 0) {
    parts.push(
      `Un évitement actif est observé sur les modalités : ${joinFrench(avoiding)}.`
    );
  }
  return joinSentences(parts);
}

function behaviorParagraph(profile: StructuredProfile): string {
  const b = profile.behavior;
  if (!b) return "";
  const parts: string[] = [];

  if (b.mainBehaviors && b.mainBehaviors.length > 0) {
    const labels = b.mainBehaviors
      .map((x) => BEHAVIOR_PATTERN_LABELS[x].toLowerCase())
      .filter((l) => l !== "aucun observé");
    if (labels.length === 0) {
      parts.push("Aucun comportement-cible majeur n'est observé en séance.");
    } else {
      parts.push(`Les comportements observés incluent : ${joinFrench(labels)}.`);
    }
  }
  if (b.triggers && b.triggers.length > 0) {
    parts.push(
      `Les déclencheurs identifiés : ${joinFrench(
        b.triggers.map((t) => BEHAVIOR_TRIGGER_LABELS[t].toLowerCase())
      )}.`
    );
  }
  if (b.frequency) {
    parts.push(
      `La fréquence observée est ${FREQUENCY_LABELS[b.frequency].toLowerCase()}.`
    );
  }
  if (b.intensity) {
    parts.push(
      `L'intensité est ${INTENSITY_LABELS[b.intensity].toLowerCase()}.`
    );
  }
  if (b.functionHypothesis) {
    parts.push(
      `L'hypothèse de fonction privilégiée est : ${BEHAVIOR_FUNCTION_LABELS[b.functionHypothesis].toLowerCase()}.`
    );
  }
  return joinSentences(parts);
}

function attentionParagraph(profile: StructuredProfile): string {
  const a = profile.attention;
  if (!a) return "";
  const parts: string[] = [];

  if (a.sittingTolerance) {
    parts.push(
      `La tolérance à la position assise est ${SITTING_TOLERANCE_LABELS[a.sittingTolerance].toLowerCase()}.`
    );
  }
  if (a.taskEngagement) {
    parts.push(
      `L'engagement dans la tâche est ${TASK_ENGAGEMENT_LABELS[a.taskEngagement].toLowerCase()}.`
    );
  }
  if (a.distractibility) {
    parts.push(
      `La distractibilité est ${DISTRACTIBILITY_LABELS[a.distractibility].toLowerCase()}.`
    );
  }
  if (a.waitingTolerance) {
    parts.push(
      `La tolérance à l'attente est ${WAITING_TOLERANCE_LABELS[a.waitingTolerance].toLowerCase()}.`
    );
  }
  if (a.responseToInstructions) {
    parts.push(
      `La réponse aux consignes est ${RESPONSE_TO_INSTRUCTIONS_LABELS[a.responseToInstructions].toLowerCase()}.`
    );
  }
  return joinSentences(parts);
}

function autonomyParagraph(profile: StructuredProfile): string {
  const a = profile.autonomy;
  if (!a) return "";
  const parts: string[] = [];

  const adaptive: Array<[string, AdaptiveLevel | undefined]> = [
    ["L'autonomie aux toilettes", a.toileting],
    ["L'autonomie au repas", a.feeding],
    ["L'autonomie à l'habillage", a.dressing],
  ];
  for (const [label, level] of adaptive) {
    if (!level || level === "not-assessed") continue;
    parts.push(
      `${label} se situe au niveau « ${ADAPTIVE_LEVEL_LABELS[level].toLowerCase()} ».`
    );
  }
  if (a.routines) {
    parts.push(
      `La participation aux routines : ${ROUTINES_LEVEL_LABELS[a.routines].toLowerCase()}.`
    );
  }
  if (a.safetyAwareness) {
    parts.push(
      `La conscience des dangers est ${SAFETY_AWARENESS_LABELS[a.safetyAwareness].toLowerCase()}.`
    );
  }
  return joinSentences(parts);
}

// Avoid an unused-import warning for the adaptive type alias above.
type AdaptiveLevel = NonNullable<
  StructuredProfile["autonomy"]
>["toileting"];

// ─── Domain weakness scoring ─────────────────────────────────

// Per-domain "weakness" score (0–1). 0 means "no concerns observed",
// 1 means "domain needs structured intervention". Drives the
// priority + suggestion logic.

function communicationWeakness(profile: StructuredProfile): number {
  const c = profile.communication;
  if (!c) return 0;
  let score = 0;
  let factors = 0;
  if (c.verbalLevel) {
    factors++;
    if (c.verbalLevel === "non-verbal") score += 1;
    else if (c.verbalLevel === "isolated-words") score += 0.7;
    else if (c.verbalLevel === "simple-phrases") score += 0.3;
  }
  if (c.comprehension) {
    factors++;
    if (c.comprehension === "absent") score += 1;
    else if (c.comprehension === "simple-instructions") score += 0.7;
    else if (c.comprehension === "double-instructions") score += 0.3;
  }
  if (c.responseToName) {
    factors++;
    if (c.responseToName === "absent") score += 1;
    else if (c.responseToName === "inconsistent") score += 0.7;
    else if (c.responseToName === "partial") score += 0.4;
  }
  if (c.requests) {
    factors++;
    if (c.requests === "absent") score += 1;
    else if (c.requests === "with-help") score += 0.6;
  }
  return factors > 0 ? score / factors : 0;
}

function socialWeakness(profile: StructuredProfile): number {
  const s = profile.social;
  if (!s) return 0;
  let score = 0;
  let factors = 0;
  if (s.initiation) {
    factors++;
    if (s.initiation === "absent") score += 1;
    else if (s.initiation === "rare") score += 0.7;
    else if (s.initiation === "prompted") score += 0.4;
  }
  if (s.responseToAdult) {
    factors++;
    if (s.responseToAdult === "absent") score += 1;
    else if (s.responseToAdult === "partial") score += 0.5;
  }
  if (s.jointAttention) {
    factors++;
    if (s.jointAttention === "absent") score += 1;
    else if (s.jointAttention === "emerging") score += 0.7;
    else if (s.jointAttention === "partial") score += 0.4;
  }
  if (s.turnTaking) {
    factors++;
    if (s.turnTaking === "absent") score += 1;
    else if (s.turnTaking === "with-help") score += 0.5;
  }
  return factors > 0 ? score / factors : 0;
}

function sensoryWeakness(profile: StructuredProfile): number {
  const s = profile.sensory;
  if (!s) return 0;
  const modalities = Object.values(s).filter(
    (p): p is SensoryPattern => Boolean(p)
  );
  if (modalities.length === 0) return 0;
  const concerns = modalities.filter((p) => p !== "no-concern").length;
  return concerns / modalities.length;
}

function behaviorWeakness(profile: StructuredProfile): number {
  const b = profile.behavior;
  if (!b) return 0;
  let score = 0;
  let factors = 0;
  if (b.mainBehaviors && b.mainBehaviors.length > 0) {
    factors++;
    const nonNone = b.mainBehaviors.filter((x) => x !== "none-observed");
    score += Math.min(1, nonNone.length / 3);
  }
  if (b.frequency) {
    factors++;
    if (b.frequency === "very-frequent") score += 1;
    else if (b.frequency === "frequent") score += 0.7;
    else if (b.frequency === "occasional") score += 0.4;
  }
  if (b.intensity) {
    factors++;
    if (b.intensity === "high") score += 1;
    else if (b.intensity === "moderate") score += 0.5;
  }
  return factors > 0 ? score / factors : 0;
}

function attentionWeakness(profile: StructuredProfile): number {
  const a = profile.attention;
  if (!a) return 0;
  let score = 0;
  let factors = 0;
  if (a.sittingTolerance) {
    factors++;
    if (a.sittingTolerance === "absent") score += 1;
    else if (a.sittingTolerance === "brief") score += 0.7;
    else if (a.sittingTolerance === "partial") score += 0.4;
  }
  if (a.taskEngagement) {
    factors++;
    if (a.taskEngagement === "absent") score += 1;
    else if (a.taskEngagement === "prompted") score += 0.6;
    else if (a.taskEngagement === "short-duration") score += 0.3;
  }
  if (a.distractibility) {
    factors++;
    if (a.distractibility === "high") score += 1;
    else if (a.distractibility === "moderate") score += 0.5;
  }
  if (a.waitingTolerance) {
    factors++;
    if (a.waitingTolerance === "absent") score += 1;
    else if (a.waitingTolerance === "brief") score += 0.6;
  }
  return factors > 0 ? score / factors : 0;
}

function autonomyWeakness(profile: StructuredProfile): number {
  const a = profile.autonomy;
  if (!a) return 0;
  let score = 0;
  let factors = 0;
  const levels = [a.toileting, a.feeding, a.dressing];
  for (const l of levels) {
    if (!l || l === "not-assessed") continue;
    factors++;
    if (l === "full-help") score += 1;
    else if (l === "partial-help") score += 0.5;
  }
  if (a.routines) {
    factors++;
    if (a.routines === "resistant") score += 1;
    else if (a.routines === "needs-visual-support") score += 0.5;
    else if (a.routines === "follows-with-help") score += 0.3;
  }
  return factors > 0 ? score / factors : 0;
}

// ─── Public summary ──────────────────────────────────────────

export interface ProfileSummary {
  headline: string;
  perDomain: Array<{
    domain: ProfileDomain;
    label: string;
    paragraph: string;
    weakness: number;
  }>;
  strengths: string;
  difficulties: string;
  priorityDomains: ProfileDomain[];
  suggestedGridKeys: string[];
}

export function generateProfileSummary(
  profile: StructuredProfile | undefined
): ProfileSummary {
  if (!profile) {
    return {
      headline: "Profil non encore renseigné.",
      perDomain: [],
      strengths: "",
      difficulties: "",
      priorityDomains: [],
      suggestedGridKeys: [],
    };
  }

  const domains: Array<{
    domain: ProfileDomain;
    label: string;
    paragraph: string;
    weakness: number;
  }> = [
    {
      domain: "communication",
      label: PROFILE_DOMAIN_LABELS.communication,
      paragraph: communicationParagraph(profile),
      weakness: communicationWeakness(profile),
    },
    {
      domain: "social",
      label: PROFILE_DOMAIN_LABELS.social,
      paragraph: socialParagraph(profile),
      weakness: socialWeakness(profile),
    },
    {
      domain: "sensory",
      label: PROFILE_DOMAIN_LABELS.sensory,
      paragraph: sensoryParagraph(profile),
      weakness: sensoryWeakness(profile),
    },
    {
      domain: "behavior",
      label: PROFILE_DOMAIN_LABELS.behavior,
      paragraph: behaviorParagraph(profile),
      weakness: behaviorWeakness(profile),
    },
    {
      domain: "attention",
      label: PROFILE_DOMAIN_LABELS.attention,
      paragraph: attentionParagraph(profile),
      weakness: attentionWeakness(profile),
    },
    {
      domain: "autonomy",
      label: PROFILE_DOMAIN_LABELS.autonomy,
      paragraph: autonomyParagraph(profile),
      weakness: autonomyWeakness(profile),
    },
  ];

  // Priority domains = top-3 with weakness >= 0.5.
  const priorityDomains = domains
    .filter((d) => d.weakness >= 0.5 && d.paragraph.length > 0)
    .sort((a, b) => b.weakness - a.weakness)
    .slice(0, 3)
    .map((d) => d.domain);

  // Strengths = filled domains with weakness < 0.3.
  const strengthLabels = domains
    .filter((d) => d.weakness < 0.3 && d.paragraph.length > 0)
    .map((d) => d.label.toLowerCase());
  const difficultyLabels = priorityDomains.map(
    (d) => PROFILE_DOMAIN_LABELS[d].toLowerCase()
  );

  const headline = priorityDomains.length === 0
    ? "Le profil clinique fait apparaître un fonctionnement globalement adapté sur les domaines évalués."
    : `Le profil clinique fait apparaître des besoins prioritaires sur : ${joinFrench(difficultyLabels)}.`;

  const strengths = strengthLabels.length === 0
    ? "Pas de domaine clairement préservé sur les sélections renseignées."
    : `Les domaines préservés sont : ${joinFrench(strengthLabels)}.`;

  const difficulties = difficultyLabels.length === 0
    ? "Aucune difficulté marquée n'a été identifiée sur les sélections renseignées."
    : `Les difficultés observées concernent : ${joinFrench(difficultyLabels)}.`;

  return {
    headline,
    perDomain: domains,
    strengths,
    difficulties,
    priorityDomains,
    suggestedGridKeys: suggestGridsFromProfile(profile),
  };
}

// ─── Suggested next grids ────────────────────────────────────
//
// Rule-based suggestions tied to the structured selections. Same
// pattern as the scorable-grid suggestion engine — we return template
// keys; the UI shows labels via followUpGridLabel().

export function suggestGridsFromProfile(
  profile: StructuredProfile | undefined
): string[] {
  if (!profile) return [];
  const out = new Set<string>();

  // Communication concerns → communication + joint-attention grids.
  if (communicationWeakness(profile) >= 0.4) {
    out.add("grille-communication-receptive");
    out.add("grille-communication-expressive");
    out.add("grille-attention-conjointe");
  }
  // Social concerns → social + joint-attention.
  if (socialWeakness(profile) >= 0.4) {
    out.add("grille-interaction-sociale");
    out.add("grille-attention-conjointe");
  }
  // Sensory concerns → sensory + regulation.
  if (sensoryWeakness(profile) >= 0.3) {
    out.add("grille-traitement-sensoriel");
    out.add("grille-regulation-emotionnelle");
  }
  // Behavior concerns → ABC + transitions.
  if (behaviorWeakness(profile) >= 0.4) {
    out.add("grille-transitions-flexibilite");
  }
  // Attention concerns → attention + engagement.
  if (attentionWeakness(profile) >= 0.4) {
    out.add("grille-attention-soutenue");
  }
  // Autonomy concerns → autonomy.
  if (autonomyWeakness(profile) >= 0.4) {
    out.add("grille-autonomie-adaptation");
  }
  return Array.from(out);
}

// ─── Report-block builder ────────────────────────────────────
//
// Plain-text block suitable to seed the "case presentation" or
// "observation methodology" section of a daily/weekly/final report.

export function profileToReportBlock(
  profile: StructuredProfile | undefined
): string {
  const summary = generateProfileSummary(profile);
  if (summary.perDomain.every((d) => d.paragraph.length === 0)) {
    return "Profil structuré non encore renseigné.";
  }
  const lines: string[] = [summary.headline];
  for (const d of summary.perDomain) {
    if (!d.paragraph) continue;
    lines.push(`${d.label}\n${d.paragraph}`);
  }
  if (summary.strengths) lines.push(`Forces : ${summary.strengths}`);
  if (summary.difficulties) lines.push(`Difficultés : ${summary.difficulties}`);
  return lines.join("\n\n");
}
