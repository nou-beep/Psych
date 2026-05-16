// French clinical note templates. Each template is a structured
// document with named sections and formal phrase suggestions.

export interface NoteTemplateSection {
  id: string;
  heading: string;
  hint?: string;
  suggestedPhrases?: string[];
}

export interface NoteTemplate {
  id: string;
  title: string;
  language: "fr" | "en";
  description: string;
  sections: NoteTemplateSection[];
}

// Phrases formelles réutilisables (volontairement neutres et prudentes).
export const FORMAL_PHRASES_FR = [
  "Le sujet rapporte…",
  "Les éléments observés suggèrent…",
  "Une hypothèse clinique à explorer serait…",
  "Ces observations doivent être interprétées avec prudence…",
  "Un approfondissement lors des prochaines séances paraît indiqué…",
  "Le tableau clinique est cohérent avec…",
  "Aucun élément actuellement disponible ne permet de conclure à…",
  "Une réévaluation est recommandée à l'issue de…",
] as const;

export const CLINICAL_NOTE_TEMPLATES: NoteTemplate[] = [
  {
    id: "obs-clinique",
    language: "fr",
    title: "Observation clinique",
    description:
      "Cadre structuré pour décrire l'observation faite en séance (présentation, comportement, fonctionnement psychique).",
    sections: [
      {
        id: "presentation",
        heading: "Présentation générale",
        hint: "Apparence, tenue, soin apporté à soi, contact visuel.",
        suggestedPhrases: ["Le sujet se présente…", "L'apparence est…"],
      },
      {
        id: "attitude",
        heading: "Attitude et comportement",
        hint: "Coopération, ouverture, retrait, agitation, lenteur psychomotrice.",
      },
      {
        id: "humeur-affect",
        heading: "Humeur et affect",
        hint: "Humeur rapportée, affect observé, congruence, modulation.",
      },
      {
        id: "discours",
        heading: "Discours",
        hint: "Débit, articulation, cohérence, élaboration.",
      },
      {
        id: "pensee",
        heading: "Pensée",
        hint: "Processus, contenu, ruminations, préoccupations dominantes.",
      },
      {
        id: "perception",
        heading: "Perception",
        hint: "Phénomènes dépersonnalisants, déréalisants, illusions, hallucinations.",
      },
      {
        id: "cognition",
        heading: "Fonctionnement cognitif",
        hint: "Attention, concentration, orientation, mémoire de travail.",
      },
      {
        id: "alliance",
        heading: "Relation thérapeutique",
        hint: "Qualité de l'alliance, transfert, contre-transfert.",
      },
      {
        id: "hypotheses",
        heading: "Hypothèses cliniques",
        suggestedPhrases: [
          "Une hypothèse clinique à explorer serait…",
          "Ces observations doivent être interprétées avec prudence…",
        ],
      },
      {
        id: "approfondir",
        heading: "Points à approfondir",
      },
    ],
  },
  {
    id: "compte-rendu",
    language: "fr",
    title: "Compte rendu de séance",
    description:
      "Trace clinique structurée d'une séance (objectifs, contenu, interventions, suite).",
    sections: [
      { id: "objectifs", heading: "Objectifs de la séance" },
      { id: "abordes", heading: "Éléments abordés" },
      {
        id: "observations",
        heading: "Observations cliniques",
        suggestedPhrases: [
          "Le sujet rapporte…",
          "Les éléments observés suggèrent…",
        ],
      },
      { id: "interventions", heading: "Interventions utilisées" },
      { id: "reponse", heading: "Réponse du sujet" },
      { id: "travail", heading: "Travail à poursuivre" },
      { id: "supervision", heading: "Points pour supervision" },
    ],
  },
  {
    id: "synthese-psychopatho",
    language: "fr",
    title: "Synthèse psychopathologique",
    description:
      "Synthèse condensée pour réunion clinique, transmission, ou supervision.",
    sections: [
      { id: "motif", heading: "Motif de consultation" },
      { id: "anamnese", heading: "Éléments anamnestiques" },
      {
        id: "semiologie",
        heading: "Sémiologie principale",
        hint: "Symptômes saillants, durée, retentissement fonctionnel.",
      },
      {
        id: "hypotheses",
        heading: "Hypothèses psychopathologiques",
        suggestedPhrases: [
          "Le tableau clinique est cohérent avec…",
          "Une hypothèse clinique à explorer serait…",
        ],
      },
      {
        id: "maintien",
        heading: "Facteurs de maintien",
        hint: "Évitements, croyances, environnement, fonctionnement émotionnel.",
      },
      { id: "ressources", heading: "Ressources" },
      { id: "orientation", heading: "Orientation thérapeutique" },
    ],
  },
  {
    id: "bilan-psy",
    language: "fr",
    title: "Bilan psychologique",
    description:
      "Synthèse formelle d'un bilan psychologique : contexte, instruments, résultats, interprétation, recommandations.",
    sections: [
      { id: "contexte", heading: "Contexte" },
      {
        id: "instruments",
        heading: "Instruments utilisés",
        hint: "Lister les échelles, leurs versions, les conditions de passation.",
      },
      {
        id: "resultats",
        heading: "Résultats",
        hint: "Scores bruts, percentiles, sévérité.",
      },
      {
        id: "interpretation",
        heading: "Interprétation clinique",
        suggestedPhrases: [
          "Ces observations doivent être interprétées avec prudence…",
          "Le tableau clinique est cohérent avec…",
        ],
      },
      {
        id: "limites",
        heading: "Limites",
        hint: "Biais possibles, faible coopération, limites des instruments.",
      },
      { id: "recommandations", heading: "Recommandations" },
    ],
  },
  {
    id: "note-supervision",
    language: "fr",
    title: "Note de supervision",
    description:
      "Préparation d'une question clinique apportée en supervision.",
    sections: [
      { id: "situation", heading: "Situation présentée" },
      { id: "question", heading: "Question clinique" },
      { id: "difficultes", heading: "Difficultés rencontrées" },
      {
        id: "hypotheses",
        heading: "Hypothèses",
        suggestedPhrases: ["Une hypothèse clinique à explorer serait…"],
      },
      { id: "retour", heading: "Retour du superviseur" },
      {
        id: "actions",
        heading: "Actions à mettre en place",
        suggestedPhrases: ["Un approfondissement lors des prochaines séances paraît indiqué…"],
      },
    ],
  },
];

export function findTemplate(id: string): NoteTemplate | undefined {
  return CLINICAL_NOTE_TEMPLATES.find((t) => t.id === id);
}
