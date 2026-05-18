// Intervention chips for the Internship Studio daily / weekly
// reports. Replaces the free-text "Intervention used" field with a
// multi-select chip group. Each chip carries an optional report
// phrase used by the rule-based generator to compose the
// "Intervention used" + "Response" report sections.

export type InterventionChip =
  | "communication-fonctionnelle"
  | "consignes-simples"
  | "guidance-verbale"
  | "guidance-gestuelle"
  | "renforcement-positif"
  | "modelisation"
  | "imitation"
  | "activite-structuree"
  | "reduction-distracteurs"
  | "supports-visuels"
  | "regulation-sensorielle"
  | "environnement-structure"
  | "activite-motrice"
  | "guidance-routines"
  | "sequencage"
  | "graphomotricite"
  | "reperage-spatial"
  | "motricite-fine"
  | "attention-conjointe"
  | "tour-de-role"
  | "interaction-guidee"
  | "regulation-emotionnelle";

export interface InterventionChipDef {
  value: InterventionChip;
  label: string;
  // Phrase fragment inserted into the auto-generated paragraph.
  phrase: string;
  // Optional grouping label so the form UI can render groups.
  group: "communication" | "soutien" | "sensoriel-moteur" | "social";
}

export const INTERVENTION_CHIPS: InterventionChipDef[] = [
  // Communication / instruction
  {
    value: "communication-fonctionnelle",
    label: "Communication fonctionnelle",
    phrase: "communication fonctionnelle (geste / mot / pictogramme)",
    group: "communication",
  },
  {
    value: "consignes-simples",
    label: "Consignes simples",
    phrase: "consignes simples reformulées",
    group: "communication",
  },
  {
    value: "supports-visuels",
    label: "Supports visuels",
    phrase: "supports visuels (planning, pictogrammes, séquences)",
    group: "communication",
  },
  {
    value: "sequencage",
    label: "Séquençage",
    phrase: "séquençage des étapes de l'activité",
    group: "communication",
  },

  // Soutien direct
  {
    value: "guidance-verbale",
    label: "Guidance verbale",
    phrase: "guidance verbale",
    group: "soutien",
  },
  {
    value: "guidance-gestuelle",
    label: "Guidance gestuelle",
    phrase: "guidance gestuelle",
    group: "soutien",
  },
  {
    value: "renforcement-positif",
    label: "Renforcement positif",
    phrase: "renforcement positif des comportements ciblés",
    group: "soutien",
  },
  {
    value: "modelisation",
    label: "Modélisation",
    phrase: "modélisation par l'adulte",
    group: "soutien",
  },
  {
    value: "imitation",
    label: "Imitation",
    phrase: "travail par imitation",
    group: "soutien",
  },
  {
    value: "activite-structuree",
    label: "Activité structurée",
    phrase: "activité structurée à objectif court",
    group: "soutien",
  },
  {
    value: "environnement-structure",
    label: "Environnement structuré",
    phrase: "environnement structuré et prévisible",
    group: "soutien",
  },
  {
    value: "guidance-routines",
    label: "Guidance routines",
    phrase: "guidance des routines (arrivée, transitions, départ)",
    group: "soutien",
  },

  // Sensoriel / moteur
  {
    value: "reduction-distracteurs",
    label: "Réduction des distracteurs",
    phrase: "réduction des distracteurs environnementaux",
    group: "sensoriel-moteur",
  },
  {
    value: "regulation-sensorielle",
    label: "Régulation sensorielle",
    phrase: "stratégies de régulation sensorielle (casque, cocon, pression profonde)",
    group: "sensoriel-moteur",
  },
  {
    value: "regulation-emotionnelle",
    label: "Régulation émotionnelle",
    phrase: "stratégies de régulation émotionnelle (co-régulation, respiration)",
    group: "sensoriel-moteur",
  },
  {
    value: "activite-motrice",
    label: "Activité motrice",
    phrase: "activité motrice ciblée",
    group: "sensoriel-moteur",
  },
  {
    value: "graphomotricite",
    label: "Graphomotricité",
    phrase: "travail graphomoteur",
    group: "sensoriel-moteur",
  },
  {
    value: "reperage-spatial",
    label: "Repérage spatial",
    phrase: "travail de repérage spatial",
    group: "sensoriel-moteur",
  },
  {
    value: "motricite-fine",
    label: "Motricité fine",
    phrase: "exercices de motricité fine",
    group: "sensoriel-moteur",
  },

  // Social
  {
    value: "attention-conjointe",
    label: "Attention conjointe",
    phrase: "travail d'attention conjointe",
    group: "social",
  },
  {
    value: "tour-de-role",
    label: "Tour de rôle",
    phrase: "exercice de tour de rôle",
    group: "social",
  },
  {
    value: "interaction-guidee",
    label: "Interaction guidée",
    phrase: "interaction guidée par l'adulte",
    group: "social",
  },
];

// Quick lookup by value.
export function findChip(
  value: InterventionChip
): InterventionChipDef | undefined {
  return INTERVENTION_CHIPS.find((c) => c.value === value);
}

export function chipPhrase(value: InterventionChip): string {
  return findChip(value)?.phrase ?? value;
}

// ─── Rule-based text generator from chip selections ──────────

import {
  RESPONSE_QUALITY_OPTIONS,
  labelOf,
  type ResponseQuality,
} from "@/components/ui/structured/options";

// Build the "Intervention used" paragraph from selected chips.
export function generateInterventionParagraph(
  chips: InterventionChip[]
): string {
  if (chips.length === 0) return "";
  const phrases = chips
    .map(chipPhrase)
    .filter(Boolean);
  if (phrases.length === 1) {
    return `Intervention mobilisée durant la séance : ${phrases[0]}.`;
  }
  const head = phrases.slice(0, -1).join(", ");
  const tail = phrases[phrases.length - 1];
  return `Interventions mobilisées durant la séance : ${head} et ${tail}.`;
}

// Build the "Response" paragraph from a response-quality selection
// plus optional notes about specific intervention chips.
export function generateResponseParagraph(
  responseQuality: ResponseQuality | undefined,
  selectedChips: InterventionChip[]
): string {
  if (!responseQuality && selectedChips.length === 0) return "";
  const qualityLabel = labelOf(RESPONSE_QUALITY_OPTIONS, responseQuality);

  const opening =
    responseQuality === "absente"
      ? "La réponse aux interventions proposées a été absente sur cette séance."
      : responseQuality === "instable"
      ? "La réponse aux interventions a été instable selon le moment de la séance."
      : responseQuality === "partielle"
      ? "La réponse a été partielle : engagement présent mais soutien systématique nécessaire."
      : responseQuality === "adaptee"
      ? "La réponse a été adaptée, avec une bonne mobilisation des étayages proposés."
      : responseQuality === "generalisee"
      ? "La réponse a été adaptée et a généralisé à différents temps de la séance."
      : qualityLabel
      ? `Qualité de réponse observée : ${qualityLabel.toLowerCase()}.`
      : "";

  // Optional follow-up sentence based on chip themes.
  const noteParts: string[] = [];
  if (selectedChips.includes("regulation-sensorielle")) {
    noteParts.push(
      "Les stratégies de régulation sensorielle ont été tolérées et ont soutenu la disponibilité."
    );
  }
  if (
    selectedChips.includes("supports-visuels") ||
    selectedChips.includes("sequencage")
  ) {
    noteParts.push(
      "Les supports visuels / le séquençage ont structuré le passage entre activités."
    );
  }
  if (
    selectedChips.includes("renforcement-positif") &&
    (responseQuality === "adaptee" || responseQuality === "generalisee")
  ) {
    noteParts.push(
      "Le renforcement positif a contribué au maintien de l'engagement."
    );
  }
  return [opening, ...noteParts].filter(Boolean).join(" ");
}
