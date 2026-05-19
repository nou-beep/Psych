// New ScoreSet templates that use non-acquisition schemas. Proves
// the engine works end-to-end on every schema, and gives the
// clinician click-based assessments that the legacy A/EC/NA/N-O
// system couldn't model.
//
// Templates here are entirely original observation grids in French
// with clinician-authored items. No copyrighted instrument items
// are reproduced. For official protected tools (CARS-2,
// M-CHAT-R/F, etc.), the clinician uses the published manual and
// records results manually through the Tests tab.

import type { ScoreSetDefinition } from "./score-set";
import {
  likert1to5Schema,
  severitySchema,
  type Likert5Value,
  type SeverityValue,
} from "./score-set-schemas";

const LICENSING_NOTE =
  "Outil d'observation original. Pour les tests propriétaires (CARS-2, M-CHAT-R/F, Vineland, etc.), utiliser les manuels officiels et saisir les résultats manuellement.";

// ─── Rating clinique d'engagement (Likert 1–5) ────────────────
// Clinician-rated quality scale across engagement domains. Higher
// is better. Demonstrates the Likert 1–5 schema.

export const SCORE_SET_RATING_ENGAGEMENT: ScoreSetDefinition<Likert5Value> = {
  id: "score-set-rating-engagement",
  name: "Rating clinique d'engagement (Likert 1–5)",
  description:
    "Cotation clinicienne sur cinq niveaux (1 = absent, 5 = généralisé). Adapté pour suivre la qualité de l'engagement plutôt que sa simple présence.",
  schema: likert1to5Schema,
  licensingNote: LICENSING_NOTE,
  domains: [
    {
      id: "eng-arrivee",
      label: "Arrivée et installation",
      followUpKeys: ["grille-engagement-tache", "grille-tolerance-attente"],
      items: [
        {
          id: "eng-r-arrivee",
          label: "Qualité d'arrivée dans l'espace de séance",
          phrases: {
            "1": "L'arrivée se fait avec une désorganisation marquée.",
            "2": "L'arrivée reste instable et nécessite un étayage soutenu.",
            "3": "L'arrivée est partiellement adaptée, avec un étayage léger.",
            "4": "L'arrivée est adaptée au cadre proposé.",
            "5": "L'arrivée est adaptée et fluide quel que soit le contexte.",
          },
        },
        {
          id: "eng-r-installation",
          label: "Installation au poste de travail",
          phrases: {
            "1": "L'installation au poste reste absente sans guidance physique.",
            "5": "L'installation au poste est autonome et généralisée.",
          },
        },
      ],
    },
    {
      id: "eng-engagement",
      label: "Engagement dans la tâche",
      followUpKeys: ["grille-engagement-tache"],
      items: [
        {
          id: "eng-r-initiation",
          label: "Initiation de la tâche",
          phrases: {
            "1": "L'initiation de la tâche est absente.",
            "3": "L'initiation reste partielle et nécessite un déclencheur.",
            "5": "L'initiation est spontanée et généralisée.",
          },
        },
        {
          id: "eng-r-persistance",
          label: "Persistance face à la difficulté",
          phrases: {
            "1": "La persistance est absente : abandon immédiat à la première difficulté.",
            "3": "La persistance est partielle avec étayage.",
            "5": "La persistance est généralisée à différents types de tâches.",
          },
        },
        {
          id: "eng-r-finalisation",
          label: "Finalisation de la tâche",
          phrases: {
            "1": "La finalisation est absente.",
            "5": "La finalisation est systématique avec signalement de fin.",
          },
        },
      ],
    },
    {
      id: "eng-cloture",
      label: "Clôture et transitions de sortie",
      followUpKeys: ["grille-transitions-flexibilite"],
      items: [
        {
          id: "eng-r-rangement",
          label: "Participation au rangement",
          phrases: {
            "1": "Le rangement n'est pas mobilisé.",
            "5": "Le rangement est autonome et généralisé.",
          },
        },
        {
          id: "eng-r-depart",
          label: "Transition de sortie / handover",
          phrases: {
            "1": "La transition de sortie nécessite une guidance physique.",
            "5": "La transition de sortie est fluide.",
          },
        },
      ],
    },
  ],
};

// ─── Journal des déclencheurs (sévérité) ─────────────────────
// Tracks the severity of each trigger / regulator observed in a
// window. Severity is the right schema here: "faible" means the
// trigger is barely present (good), "très élevée" means it
// dominates (bad). Higher severity drives the suggestion engine
// to fire follow-up grids.

export const SCORE_SET_TRIGGER_LOG: ScoreSetDefinition<SeverityValue> = {
  id: "score-set-trigger-log",
  name: "Journal des déclencheurs (sévérité)",
  description:
    "Suivi en sévérité des déclencheurs et des stratégies de régulation. Faible → très élevée. Une sévérité élevée déclenche les suggestions de grilles de suivi.",
  schema: severitySchema,
  licensingNote: LICENSING_NOTE,
  domains: [
    {
      id: "trig-sensoriels",
      label: "Déclencheurs sensoriels",
      followUpKeys: [
        "grille-traitement-sensoriel",
        "grille-regulation-emotionnelle",
      ],
      items: [
        {
          id: "trig-bruit",
          label: "Réactions aux stimulations sonores",
          phrases: {
            faible: "Aucune réaction marquée aux stimulations sonores observée.",
            elevee:
              "Les réactions aux stimulations sonores influencent la disponibilité de façon récurrente.",
            "tres-elevee":
              "Les stimulations sonores sont un déclencheur central de désorganisation.",
          },
        },
        {
          id: "trig-visuel",
          label: "Réactions aux stimulations visuelles",
          phrases: {
            "tres-elevee":
              "Les stimulations visuelles déclenchent fréquemment des stratégies d'évitement.",
          },
        },
        {
          id: "trig-tactile",
          label: "Réactions aux stimulations tactiles",
          phrases: {
            "tres-elevee":
              "Les stimulations tactiles imprévues sont un déclencheur récurrent.",
          },
        },
      ],
    },
    {
      id: "trig-contextes",
      label: "Déclencheurs contextuels",
      followUpKeys: ["grille-transitions-flexibilite", "grille-tolerance-attente"],
      items: [
        {
          id: "trig-transitions",
          label: "Transitions imprévues",
          phrases: {
            elevee:
              "Les transitions imprévues sont un déclencheur fréquent ; un support visuel structurant est recommandé.",
            "tres-elevee":
              "Les transitions imprévues sont le déclencheur central : structurer systématiquement les changements.",
          },
        },
        {
          id: "trig-attente",
          label: "Situations d'attente",
          phrases: {
            "tres-elevee":
              "L'attente est un déclencheur récurrent ; introduire un timer visuel.",
          },
        },
        {
          id: "trig-demande",
          label: "Demandes inattendues",
          phrases: {
            "tres-elevee":
              "Les demandes inattendues sont mal tolérées ; privilégier l'annonce préalable.",
          },
        },
      ],
    },
    {
      id: "trig-strategies",
      label: "Stratégies de régulation observées",
      items: [
        {
          id: "trig-strat-pression",
          label: "Recours à la pression profonde",
          phrases: {
            elevee:
              "La pression profonde est mobilisée comme stratégie de régulation.",
          },
        },
        {
          id: "trig-strat-casque",
          label: "Recours au casque anti-bruit",
          phrases: {
            elevee:
              "Le casque anti-bruit est utilisé comme stratégie d'autonomisation sensorielle.",
          },
        },
        {
          id: "trig-strat-cocon",
          label: "Recours au cocon / espace refuge",
          phrases: {
            elevee:
              "Le cocon ou espace refuge est mobilisé spontanément comme stratégie.",
          },
        },
      ],
    },
  ],
};

export const SCORE_SET_TEMPLATES = [
  SCORE_SET_RATING_ENGAGEMENT,
  SCORE_SET_TRIGGER_LOG,
] as const;

export function findScoreSetTemplate(
  id: string
): ScoreSetDefinition<string> | undefined {
  return SCORE_SET_TEMPLATES.find((t) => t.id === id) as
    | ScoreSetDefinition<string>
    | undefined;
}
