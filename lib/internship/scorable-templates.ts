// Scorable internship grid templates.
//
// Ships the first real template — "Grille clinique d'évaluation des
// capacités" — with 14 items across 3 domains. Each item carries
// the optional summary phrases the text generator uses when the
// item lands on EC / NA / A. The 12 follow-up templates the
// suggestion logic references are intentionally not yet built —
// the suggestion surface tells the user "next: <key>" and they can
// add the template later. That keeps this PR honest about what's
// shipped vs scaffolded.

import type { ScorableGridTemplate } from "./scorable-grids";

const LICENSING_NOTE =
  "Structured shell only. Use official materials and the published manual when administering copyrighted instruments.";

export const GRILLE_CAPACITES: ScorableGridTemplate = {
  id: "grille-capacites-v1",
  name: "Grille clinique d'évaluation des capacités",
  description:
    "Évaluation clinique structurée des capacités attentionnelles, mnésiques et perceptives. Cotation par item : A (acquis) · EC (en cours) · NA (non acquis) · N/O (non observé).",
  observationsHeading: "Observations cliniques générales",
  licensingNote: LICENSING_NOTE,
  advancedFollowUpKeys: [
    "grille-taches-structurees-avancees",
    "grille-generalisation",
    "grille-autonomie-tache",
  ],
  domains: [
    {
      id: "attention-disponibilite",
      label: "Attention et disponibilité",
      followUpGridKeys: [
        "grille-attention-soutenue",
        "grille-engagement-tache",
        "grille-tolerance-attente",
        "grille-distractibilite",
      ],
      items: [
        {
          id: "attention-position-assise",
          label: "Maintient la position assise pendant l'activité",
          ecOrNaPhrase:
            "Le maintien de la position assise reste difficile à soutenir et doit être progressivement renforcé.",
        },
        {
          id: "attention-prenom",
          label: "S'oriente à l'appel de son prénom",
          ecOrNaPhrase:
            "L'orientation à l'appel du prénom reste fragile et doit être travaillée dans différents contextes.",
          aPhrase:
            "L'orientation à l'appel du prénom est mobilisable de manière fiable.",
        },
        {
          id: "attention-conjointe",
          label: "Maintient une attention conjointe avec l'adulte",
          ecOrNaPhrase:
            "L'attention conjointe avec l'adulte demeure fluctuante, ce qui peut limiter les opportunités d'apprentissage relationnel.",
          aPhrase:
            "L'attention conjointe avec l'adulte est disponible et soutient les échanges.",
        },
        {
          id: "attention-engagement",
          label: "Reste engagé sur une tâche structurée pendant quelques minutes",
          ecOrNaPhrase:
            "L'engagement sur une tâche structurée reste court et nécessite un étayage soutenu.",
          aPhrase:
            "L'engagement sur une tâche structurée est mobilisé sur des durées exploitables.",
        },
        {
          id: "attention-tolerance",
          label: "Tolère l'attente de courte durée",
          ecOrNaPhrase:
            "La tolérance à l'attente est encore limitée et constitue un objectif de travail.",
        },
        {
          id: "attention-distracteurs",
          label: "Résiste aux distracteurs de l'environnement",
          ecOrNaPhrase:
            "La résistance aux distracteurs environnementaux demeure limitée, ce qui peut impacter la disponibilité attentionnelle.",
          aPhrase:
            "La résistance aux distracteurs est suffisante pour soutenir le travail en séance.",
        },
      ],
    },
    {
      id: "memoire-evocation",
      label: "Mémoire et évocation",
      followUpGridKeys: [
        "grille-memoire-visuelle-courte",
        "grille-reconnaissance-rappel",
      ],
      items: [
        {
          id: "memoire-objet-cache",
          label: "Retient l'emplacement d'un objet caché",
          ecOrNaPhrase:
            "Le maintien en mémoire de l'emplacement d'un objet caché est inconstant.",
          aPhrase:
            "Le maintien en mémoire de l'emplacement d'un objet caché est mobilisable.",
        },
        {
          id: "memoire-rappel-delai",
          label: "Rappelle une image ou un item après un délai bref",
          ecOrNaPhrase:
            "Le rappel d'image ou d'item après un délai bref reste fragile.",
          aPhrase:
            "Le rappel d'image ou d'item après un délai bref est mobilisable.",
        },
        {
          id: "memoire-reconnaissance",
          label: "Reconnaît un matériel déjà présenté",
          ecOrNaPhrase:
            "La reconnaissance d'un matériel déjà présenté n'est pas systématique et gagnera à être consolidée par des reprises régulières.",
          aPhrase:
            "La reconnaissance d'un matériel déjà présenté est fiable.",
        },
      ],
    },
    {
      id: "perception-discrimination",
      label: "Perception visuelle et discrimination",
      followUpGridKeys: [
        "grille-discrimination-visuelle",
        "grille-appariement-image-objet",
        "grille-tri-couleur-forme-taille",
      ],
      items: [
        {
          id: "perception-sequence-visuelle",
          label: "Restitue une petite séquence visuelle",
          ecOrNaPhrase:
            "La restitution d'une petite séquence visuelle n'est pas encore stabilisée.",
        },
        {
          id: "perception-assoc-objet-objet",
          label: "Associe objet / objet",
          ecOrNaPhrase:
            "L'association objet / objet reste à consolider.",
          aPhrase:
            "L'association objet / objet est maîtrisée.",
        },
        {
          id: "perception-assoc-image-image",
          label: "Associe image / image",
          ecOrNaPhrase:
            "L'association image / image reste à consolider.",
          aPhrase:
            "L'association image / image est maîtrisée.",
        },
        {
          id: "perception-assoc-objet-image",
          label: "Associe objet / image",
          ecOrNaPhrase:
            "L'association objet / image (compétence symbolique) reste à étayer.",
          aPhrase:
            "L'association objet / image est mobilisable, signe d'une compétence symbolique disponible.",
        },
        {
          id: "perception-tri",
          label: "Trie par couleur, forme ou taille",
          ecOrNaPhrase:
            "Les capacités de tri selon des critères simples sont encore en construction.",
          aPhrase:
            "Les capacités de discrimination visuelle sont mobilisables, notamment dans les tâches de tri selon des critères simples.",
        },
      ],
    },
  ],
};

export const SCORABLE_TEMPLATES: ScorableGridTemplate[] = [GRILLE_CAPACITES];

export function findScorableTemplate(
  id: string
): ScorableGridTemplate | undefined {
  return SCORABLE_TEMPLATES.find((t) => t.id === id);
}

// Friendly labels for follow-up grid keys the suggestion engine
// may surface — so the UI can show "Attention soutenue grid" even
// when no template exists yet.
export const FOLLOW_UP_GRID_LABELS: Record<string, string> = {
  "grille-attention-soutenue": "Attention soutenue",
  "grille-engagement-tache": "Engagement dans la tâche",
  "grille-tolerance-attente": "Tolérance à l'attente",
  "grille-distractibilite": "Distractibilité (observation)",
  "grille-memoire-visuelle-courte": "Mémoire visuelle courte durée",
  "grille-reconnaissance-rappel": "Reconnaissance et rappel",
  "grille-discrimination-visuelle": "Discrimination visuelle",
  "grille-appariement-image-objet": "Appariement image / objet",
  "grille-tri-couleur-forme-taille": "Tri couleur / forme / taille",
  "grille-taches-structurees-avancees": "Tâches structurées avancées",
  "grille-generalisation": "Généralisation",
  "grille-autonomie-tache": "Autonomie dans la tâche",
};

export function followUpGridLabel(key: string): string {
  return FOLLOW_UP_GRID_LABELS[key] ?? key;
}
