// Real thesis seed — Nouhaila Mrini, 2025-2026.
// Source: user-provided thesis material. Replaces the generic English
// seed previously used as demo content.
//
// IMPORTANT: only the values the author has explicitly shared are
// hard-coded here. Anything not provided is left as an editable
// placeholder with a "requires participant-level data" flag.

import type { ThesisDesign } from "@/lib/thesis-data";

export const THESIS_OWNER = {
  author: "Nouhaila Mrini",
  supervisor: "Dr Nabil Abdassamad",
  academicYear: "2025-2026",
} as const;

export const THESIS_FR_TITLE =
  "Dépersonnalisation, anxiété et dépression : Étude psychopathologique du sentiment de perte de soi";

export const THESIS_KEYWORDS = [
  "dépersonnalisation",
  "déréalisation",
  "anxiété",
  "dépression",
  "sentiment de soi",
  "dysrégulation émotionnelle",
  "psychopathologie transdiagnostique",
  "phénoménologie",
  "identité subjective",
];

export const THESIS_TOPIC_SUMMARY =
  "Étude psychopathologique de la dépersonnalisation comme expérience transdiagnostique, examinant ses liens phénoménologiques et statistiques avec l'anxiété et la dépression chez des jeunes adultes.";

export const THESIS_AIM =
  "Examiner les relations entre la sévérité de la dépersonnalisation et les symptômes anxieux et dépressifs, et identifier quel facteur (anxiété trait ou dépression) constitue le prédicteur le plus important de la sévérité de la dépersonnalisation.";

export const THESIS_PROBLEM =
  "La dépersonnalisation reste un syndrome sous-diagnostiqué malgré sa fréquence dans les troubles anxieux et dépressifs. Le sentiment de perte de soi qu'elle implique est rarement étudié en tant que mécanisme transdiagnostique articulant hyperactivation anxieuse et hypoactivation affective dépressive.";

// Real thesis design (replaces seedDesign in lib/thesis-data.ts).
export const REAL_THESIS_DESIGN: ThesisDesign = {
  title: THESIS_FR_TITLE,
  researchProblem: THESIS_PROBLEM,
  researchQuestions: [
    "Existe-t-il une association significative entre la sévérité de la dépersonnalisation (CDS) et l'anxiété trait (STAI-Y) ?",
    "Existe-t-il une association significative entre la sévérité de la dépersonnalisation (CDS) et les symptômes dépressifs (PHQ-9) ?",
    "L'anxiété trait constitue-t-elle un prédicteur plus important de la sévérité de la dépersonnalisation que la dépression ?",
  ],
  hypotheses: [
    "H1 : Des scores élevés d'anxiété (STAI-Y) sont associés à des scores élevés de dépersonnalisation (CDS).",
    "H2 : Des scores élevés de dépression (PHQ-9) sont associés à des scores élevés de dépersonnalisation (CDS).",
    "H3 : L'anxiété trait constitue un prédicteur plus important de la sévérité de la dépersonnalisation que la dépression.",
  ],
  independentVariables: [
    "Anxiété trait, mesurée par la STAI-Y",
    "Symptômes dépressifs, mesurés par le PHQ-9",
  ],
  dependentVariables: [
    "Sévérité de la dépersonnalisation, mesurée par la Cambridge Depersonalization Scale (CDS)",
  ],
  controlVariables: [
    "Âge",
    "Genre",
    "Statut de traitement (placeholder — variable optionnelle)",
  ],
  sampleDescription:
    "Échantillon de 52 jeunes adultes recrutés via les réseaux universitaires. Étude mixte (quantitative et qualitative).",
  inclusionCriteria:
    "Âge 18–35 ans. Maîtrise du français écrit. Consentement éclairé signé.",
  exclusionCriteria:
    "Trouble psychotique actif. Trouble neurologique affectant la cognition. Hospitalisation en cours. Trouble lié à une substance (primaire).",
  methodology:
    "Étude transversale corrélationnelle à devis mixte. Auto-questionnaires standardisés : Cambridge Depersonalization Scale (CDS), State-Trait Anxiety Inventory forme Y (STAI-Y), Patient Health Questionnaire (PHQ-9). Analyses : statistiques descriptives, corrélations de Pearson, régression linéaire. Volet qualitatif : analyse thématique d'entretiens semi-structurés.",
  ethicalConsiderations:
    "Consentement éclairé obtenu pour chaque participant. Anonymisation complète (codes participants). Stockage sécurisé. Droit de retrait sans justification. Approbation institutionnelle de l'établissement.",
};

// ─── Real chapter structure (French) ───────────────────────────

export const REAL_CHAPTER_OUTLINE = [
  { id: "intro-generale", label: "Introduction générale" },
  {
    id: "ch1-depersonnalisation",
    label: "Chapitre 1 : La dépersonnalisation en psychopathologie",
  },
  {
    id: "ch2-anxiete",
    label: "Chapitre 2 : Anxiété et dépersonnalisation",
  },
  {
    id: "ch3-depression",
    label: "Chapitre 3 : Dépression et dépersonnalisation",
  },
  {
    id: "ch4-liens",
    label:
      "Chapitre 4 : Analyse des liens entre dépersonnalisation, anxiété et dépression",
  },
  { id: "ch5-methodo", label: "Chapitre 5 : Méthodologie" },
  { id: "ch6-resultats", label: "Chapitre 6 : Résultats" },
  { id: "ch7-discussion", label: "Chapitre 7 : Discussion" },
  { id: "conclusion-generale", label: "Conclusion générale" },
  { id: "bibliographie", label: "Bibliographie" },
] as const;

// ─── Methodology sub-sections (Chapter 5) ─────────────────────

export const METHODOLOGY_SECTIONS = [
  "Population",
  "Instruments",
  "Procédure",
  "Hypothèses",
  "Variables",
  "Plan d'analyse statistique",
  "Critères d'inclusion",
  "Critères d'exclusion",
  "Biais méthodologiques",
  "Considérations éthiques",
] as const;

// ─── Real descriptive statistics (n=52) ───────────────────────

export interface DescriptiveStat {
  instrument: string;
  acronym: string;
  n: number;
  mean: number;
  sd: number;
  min: number;
  max: number;
  note?: string;
}

export const REAL_DESCRIPTIVES: DescriptiveStat[] = [
  {
    instrument: "Cambridge Depersonalization Scale",
    acronym: "CDS",
    n: 52,
    mean: 47.3,
    sd: 38.2,
    min: 0,
    max: 168,
  },
  {
    instrument: "State-Trait Anxiety Inventory, trait",
    acronym: "STAI-Y (trait)",
    n: 52,
    mean: 43.7,
    sd: 12.4,
    min: 21,
    max: 72,
  },
  {
    instrument: "Patient Health Questionnaire",
    acronym: "PHQ-9",
    n: 52,
    mean: 9.8,
    sd: 6.7,
    min: 0,
    max: 27,
  },
];

// ─── Real correlations ────────────────────────────────────────

export interface Correlation {
  variableA: string;
  variableB: string;
  r: number;
  p: string; // "< .001", "< .01", etc.
  n: number;
  interpretation: string;
}

export const REAL_CORRELATIONS: Correlation[] = [
  {
    variableA: "Dépersonnalisation (CDS)",
    variableB: "Anxiété trait (STAI-Y)",
    r: 0.64,
    p: "< .001",
    n: 52,
    interpretation:
      "Corrélation positive forte. Les participants présentant une anxiété trait élevée rapportent davantage de symptômes de dépersonnalisation.",
  },
  {
    variableA: "Dépersonnalisation (CDS)",
    variableB: "Symptômes dépressifs (PHQ-9)",
    r: 0.58,
    p: "< .001",
    n: 52,
    interpretation:
      "Corrélation positive modérée à forte. La dépersonnalisation co-varie significativement avec la sévérité dépressive.",
  },
];

// ─── Real regression finding ──────────────────────────────────

export const REGRESSION_FINDING = {
  outcome: "Sévérité de la dépersonnalisation (CDS)",
  predictors: ["Anxiété trait (STAI-Y)", "Symptômes dépressifs (PHQ-9)"],
  keyResult:
    "L'anxiété trait constitue le prédicteur le plus important de la sévérité de la dépersonnalisation, au-dessus de la dépression.",
  detail:
    "Régression linéaire multiple avec CDS comme variable dépendante et STAI-Y + PHQ-9 comme prédicteurs. Coefficients standardisés, intervalles de confiance, et R² ajusté : valeurs à compléter une fois les données brutes participantes importées.",
  note: "Awaiting participant-level data — coefficients standardisés et R² ajusté à compléter après import du jeu de données.",
} as const;

// ─── Real analysis plan ───────────────────────────────────────

export const ANALYSIS_PLAN = [
  {
    id: "desc",
    label: "Statistiques descriptives",
    description:
      "Moyennes, écarts-types, min/max, distributions pour chaque échelle (CDS, STAI-Y, PHQ-9).",
  },
  {
    id: "corr",
    label: "Corrélations de Pearson",
    description:
      "Tests bilatéraux entre CDS, STAI-Y, PHQ-9. Seuil de significativité α = .05.",
  },
  {
    id: "reg",
    label: "Régression linéaire multiple",
    description:
      "Variable dépendante : CDS. Prédicteurs : STAI-Y, PHQ-9. Test de l'hypothèse H3.",
  },
  {
    id: "qual",
    label: "Analyse thématique qualitative",
    description:
      "Codage inductif des entretiens semi-structurés selon la procédure de Braun & Clarke (2006).",
  },
] as const;

// ─── Thesis-specific clinical concepts ────────────────────────

export const THESIS_CONCEPTS = [
  {
    id: "transdiag",
    label: "Mécanisme transdiagnostique",
    body:
      "Cadre selon lequel la dépersonnalisation se manifeste à travers différents troubles (anxiété, dépression, trauma) plutôt qu'au sein d'une seule catégorie diagnostique.",
  },
  {
    id: "dysreg",
    label: "Dysrégulation émotionnelle",
    body:
      "Difficulté à moduler l'intensité émotionnelle. Articulation possible entre hyperactivation anxieuse et hypoactivation affective dépressive.",
  },
  {
    id: "sentiment-soi",
    label: "Sentiment de soi",
    body:
      "Expérience subjective d'être un sujet unifié, continu et incarné. Sa perturbation est centrale dans la phénoménologie de la dépersonnalisation.",
  },
  {
    id: "alteration",
    label: "Altération de l'expérience subjective",
    body:
      "Modification du rapport au corps, aux émotions et à l'environnement, sans perte du test de la réalité.",
  },
  {
    id: "depers-protective",
    label: "Dépersonnalisation comme réponse protectrice",
    body:
      "Hypothèse selon laquelle la dépersonnalisation constitue un mécanisme de désengagement face à une activation émotionnelle perçue comme menaçante.",
  },
  {
    id: "depers-disengagement",
    label: "Désengagement du soi/du monde",
    body:
      "Phénomène par lequel le sujet se sent étranger à lui-même (dépersonnalisation) ou à son environnement (déréalisation).",
  },
] as const;

// Storage key for whether the user has accepted the real seed.
// The thesis page checks this — if not set, it offers to seed the
// design / chapter outline with the real material.
export const REAL_SEED_ACCEPTED_KEY = "psych-thesis-real-seed-accepted-v1";
