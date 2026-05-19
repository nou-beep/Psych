// Real thesis seed — Nouhaila Mrini, Juin 2026.
// Source: Mrini, N. (2026). "Dépersonnalisation, anxiété et dépression :
// analyse psychopathologique des mécanismes de dysrégulation
// émotionnelle et d'altération du sentiment de soi." Master en
// Psychologie Clinique et Psychothérapie, Module PT, Laboratoire de
// recherche « Homme, Sociétés et valeurs ».
//
// All metadata in this file is extracted verbatim from the author's
// PFE draft. The empirical study described in chapter 5 is a
// research PROTOCOL — participant data has not yet been collected, so
// all descriptive / inferential statistics are marked as awaiting
// collection rather than fabricated.

import type { ThesisDesign } from "@/lib/thesis-data";

export const THESIS_OWNER = {
  author: "Nouhaila Mrini",
  supervisor: "Dr Nabil Abdessamad",
  supervisorTitle: "Professeur de psychologie (PES)",
  supervisorSpecialty: "Psychopathologie clinique",
  supervisorRole:
    "Directeur du Laboratoire de recherche « Homme, Sociétés et valeurs »",
  programme: "Master en Psychologie Clinique et Psychothérapie",
  module: "Module PT",
  laboratory: "Laboratoire de recherche « Homme, Sociétés et valeurs »",
  defenceDate: "Juin 2026",
  academicYear: "2025-2026",
} as const;

// Verbatim title from the PFE draft cover page.
export const THESIS_FR_TITLE =
  "Dépersonnalisation, anxiété et dépression : analyse psychopathologique des mécanismes de dysrégulation émotionnelle et d'altération du sentiment de soi";

// Verbatim keywords (lower-cased) from the French abstract.
export const THESIS_KEYWORDS = [
  "dépersonnalisation",
  "dissociation",
  "anxiété",
  "dépression",
  "dysrégulation émotionnelle",
  "sentiment de soi",
  "psychopathologie transdiagnostique",
];

// Companion English keywords from the abstract.
export const THESIS_KEYWORDS_EN = [
  "depersonalization",
  "dissociation",
  "anxiety",
  "depression",
  "emotional dysregulation",
  "sense of self",
  "transdiagnostic psychopathology",
];

// Abstract — French (verbatim from the PFE).
export const THESIS_ABSTRACT_FR = `La dépersonnalisation constitue un phénomène clinique singulier, caractérisé par un sentiment d'étrangeté à l'égard de sa propre expérience subjective, que les classifications internationales rattachent tant aux troubles dissociatifs qu'à diverses entités nosographiques de l'axe anxio-dépressif. Le présent mémoire examine, dans une perspective psychopathologique intégrative, dans quelle mesure la dépersonnalisation peut être conceptualisée comme un mécanisme transdiagnostique articulant l'anxiété et la dépression à travers des processus de dysrégulation émotionnelle et d'altération du sentiment de soi.

La première partie propose une analyse approfondie des définitions, des modèles théoriques — cognitifs, neurobiologiques, phénoménologiques et psychodynamiques — ainsi que des mécanismes sous-jacents à la dépersonnalisation. Les deuxième et troisième parties examinent respectivement les liens empiriques et conceptuels entre la dépersonnalisation et l'anxiété d'une part, la dépression d'autre part. La quatrième partie développe un modèle intégratif rendant compte des voies communes et différentielles entre ces trois dimensions cliniques. Enfin, le chapitre méthodologique présente le protocole d'une étude quantitative portant sur 50 participants, recourant à la Cambridge Depersonalization Scale, au STAI-Y et au PHQ-9.`;

// Abstract — English (verbatim from the PFE).
export const THESIS_ABSTRACT_EN = `Depersonalization is a distinctive clinical phenomenon characterized by a sense of strangeness towards one's own subjective experience, which international classifications link to both dissociative disorders and various anxiety-depressive nosographic entities. This thesis examines, from an integrative psychopathological perspective, the extent to which depersonalization can be conceptualized as a transdiagnostic mechanism linking anxiety and depression through processes of emotional dysregulation and alteration of the sense of self.

The first part offers an in-depth analysis of definitions, theoretical models — cognitive, neurobiological, phenomenological and psychodynamic — and the mechanisms underlying depersonalization. The second and third parts examine the empirical and conceptual links between depersonalization and anxiety on the one hand, depression on the other. The fourth part develops an integrative model accounting for the common and differential pathways between these three clinical dimensions. Finally, the methodological chapter presents a quantitative study protocol involving 50 participants, using the Cambridge Depersonalization Scale, the STAI-Y, and the PHQ-9.`;

export const THESIS_TOPIC_SUMMARY =
  "Examen, dans une perspective psychopathologique intégrative, du rôle de la dépersonnalisation comme mécanisme transdiagnostique articulant l'anxiété et la dépression à travers des processus de dysrégulation émotionnelle et d'altération du sentiment de soi.";

export const THESIS_AIM =
  "Tester empiriquement, auprès d'un échantillon de 50 jeunes adultes, les relations entre la sévérité de la dépersonnalisation (CDS), l'anxiété-trait (STAI-Y2) et la symptomatologie dépressive (PHQ-9), et soumettre à vérification le modèle transdiagnostique intégratif en double voie (hyperactivation / hypoactivation) proposé au chapitre 4.";

// Problématique — verbatim formulation from the introduction.
export const THESIS_PROBLEM =
  "Dans quelle mesure la dépersonnalisation peut-elle être conceptualisée comme un mécanisme transdiagnostique reliant l'anxiété et la dépression à travers des processus de dysrégulation émotionnelle et d'altération du sentiment de soi ?";

// Four-objective structure (verbatim from "Objectifs du travail").
export const THESIS_OBJECTIVES = [
  "Délimiter précisément les construits de dépersonnalisation, de dissociation, d'anxiété et de dépression, en examinant leurs définitions cliniques et leurs opérationnalisations dans les classifications internationales.",
  "Comparer les modèles théoriques explicatifs de la dépersonnalisation — cognitif, neurobiologique, phénoménologique et psychodynamique — afin d'en identifier les apports respectifs et les limites.",
  "Analyser les mécanismes spécifiques par lesquels l'anxiété et la dépression peuvent, par des voies distinctes, engendrer ou entretenir des expériences de dépersonnalisation.",
  "Formuler un modèle intégratif transdiagnostique rendant compte de ces liens, puis soumettre à une vérification empirique les hypothèses qui en découlent dans le cadre d'un protocole de recherche quantitative.",
];

// Real thesis design (replaces seedDesign in lib/thesis-data.ts).
export const REAL_THESIS_DESIGN: ThesisDesign = {
  title: THESIS_FR_TITLE,
  researchProblem: THESIS_PROBLEM,
  researchQuestions: [
    "Existe-t-il une corrélation positive et significative entre la sévérité de la dépersonnalisation (CDS) et l'anxiété-trait (STAI-Y2) chez des jeunes adultes ?",
    "Existe-t-il une corrélation positive et significative entre la sévérité de la dépersonnalisation (CDS) et la symptomatologie dépressive (PHQ-9) ?",
    "Les scores d'anxiété-trait et de symptomatologie dépressive constituent-ils des prédicteurs significatifs et indépendants des scores de dépersonnalisation dans un modèle de régression linéaire multiple ?",
  ],
  // Verbatim from §5.1.2 Hypothèses opérationnelles.
  hypotheses: [
    "H1 : Il existe une corrélation positive et statistiquement significative (r > 0, p < 0,05) entre les scores totaux à la Cambridge Depersonalization Scale (CDS) et les scores d'anxiété-trait mesurés par la sous-échelle STAI-Y2, dans l'échantillon de 50 participants.",
    "H2 : Il existe une corrélation positive et statistiquement significative (r > 0, p < 0,05) entre les scores totaux à la CDS et les scores de symptomatologie dépressive mesurés par le PHQ-9, dans le même échantillon.",
    "H3 : Dans un modèle de régression linéaire multiple, les scores au STAI-Y2 et au PHQ-9 constituent des prédicteurs significatifs (β ≠ 0, p < 0,05) des scores à la CDS, après contrôle réciproque de leurs contributions respectives.",
  ],
  independentVariables: [
    "Anxiété-trait, mesurée par la sous-échelle STAI-Y2 (Spielberger, 1983 ; version française : Bruchon-Schweitzer & Paulhan, 1993)",
    "Symptomatologie dépressive, mesurée par le PHQ-9 (Kroenke, Spitzer & Williams, 2001)",
  ],
  dependentVariables: [
    "Sévérité de la dépersonnalisation, mesurée par la Cambridge Depersonalization Scale, 29 items (CDS ; Sierra & Berrios, 2000)",
  ],
  controlVariables: [
    "Âge",
    "Genre",
    "Variables sociodémographiques recueillies via un questionnaire ad hoc en 8 items",
  ],
  sampleDescription:
    "50 jeunes adultes recrutés dans un contexte universitaire. Population non clinique. Le choix de cet échantillon est motivé par l'âge de première apparition typique de la dépersonnalisation et des troubles anxio-dépressifs (16–25 ans).",
  inclusionCriteria:
    "Âge correspondant à la fenêtre développementale ciblée (jeunes adultes), maîtrise du français écrit, capacité à fournir un consentement éclairé. Critères détaillés à finaliser au §5.2.2 du draft.",
  exclusionCriteria:
    "Critères à finaliser au §5.2.2 du draft. Exclusion attendue : trouble psychotique actif, trouble neurologique majeur affectant la cognition, hospitalisation psychiatrique en cours.",
  methodology:
    "Étude quantitative transversale corrélationnelle. Auto-questionnaires standardisés : Cambridge Depersonalization Scale (CDS, 29 items, fréquence × durée, score total 0–1044), State-Trait Anxiety Inventory version Y sous-échelle trait (STAI-Y2, 20 items, score 20–80), Patient Health Questionnaire 9 items (PHQ-9, score 0–27). Analyses prévues : statistiques descriptives, tests de normalité (Shapiro-Wilk), corrélations de Pearson (ou Spearman si non-normalité), régression linéaire multiple avec STAI-Y2 et PHQ-9 comme prédicteurs et CDS comme variable dépendante.",
  ethicalConsiderations:
    "Approbation éthique en cours d'obtention. Consentement éclairé écrit avant participation. Information explicite sur le caractère non-rémunéré et non-obligatoire de la participation. Anonymisation par code participant aléatoire dissocié des données nominatives. Stockage sécurisé. Droit de retrait sans justification. Rappel des ressources d'aide psychologique en fin de passation, conformément aux recommandations éthiques standard.",
};

// ─── Real chapter structure (matches the PFE table of contents) ─────

export const REAL_CHAPTER_OUTLINE = [
  { id: "avant-propos", label: "Avant-propos" },
  { id: "intro-generale", label: "Introduction générale" },
  {
    id: "ch1-depersonnalisation",
    label:
      "Chapitre 1 : Dépersonnalisation — définitions, modèles théoriques et mécanismes",
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
      "Chapitre 4 : Analyse comparative et modèle intégratif transdiagnostique",
  },
  { id: "ch5-methodo", label: "Chapitre 5 : Méthodologie" },
  { id: "ch6-resultats", label: "Chapitre 6 : Résultats (à venir)" },
  { id: "ch7-discussion", label: "Chapitre 7 : Discussion (à venir)" },
  { id: "conclusion-generale", label: "Conclusion générale (à venir)" },
  { id: "bibliographie", label: "Références bibliographiques" },
] as const;

// ─── Methodology sub-sections (matches §5.1 — §5.7 of the PFE) ───────

export const METHODOLOGY_SECTIONS = [
  "Objectifs et hypothèses (§5.1)",
  "Population et échantillonnage (§5.2)",
  "Instruments de mesure — CDS, STAI-Y2, PHQ-9 (§5.3)",
  "Procédure (§5.4)",
  "Plan d'analyse statistique (§5.5)",
  "Biais méthodologiques (§5.6)",
  "Considérations éthiques (§5.7)",
] as const;

// ─── Descriptive statistics — protocol stage, awaiting data ─────────
// The PFE describes a planned study with 50 participants; data has not
// yet been collected. These placeholders make that explicit rather than
// fabricating values the author has not produced.

export interface DescriptiveStat {
  instrument: string;
  acronym: string;
  /** Planned sample size from the PFE protocol. */
  plannedN: number;
  /** Score range from the instrument's manual. */
  scoreRange: string;
  /** Status string the dashboard renders verbatim. */
  status: string;
  /** Optional reference to the section in the PFE. */
  pfeSection: string;
}

export const REAL_DESCRIPTIVES: DescriptiveStat[] = [
  {
    instrument: "Cambridge Depersonalization Scale",
    acronym: "CDS (29 items)",
    plannedN: 50,
    scoreRange: "0 – 1044 (fréquence × durée)",
    status:
      "Collecte de données non commencée — moyennes, écarts-types et indices d'asymétrie à compléter une fois la passation effectuée.",
    pfeSection: "§5.3.1 + §5.5.1",
  },
  {
    instrument: "State-Trait Anxiety Inventory (sous-échelle trait)",
    acronym: "STAI-Y2",
    plannedN: 50,
    scoreRange: "20 – 80",
    status:
      "Version française Bruchon-Schweitzer & Paulhan (1993). Données descriptives à produire après la collecte.",
    pfeSection: "§5.3.2 + §5.5.1",
  },
  {
    instrument: "Patient Health Questionnaire",
    acronym: "PHQ-9",
    plannedN: 50,
    scoreRange:
      "0 – 27 (0–4 minimal · 5–9 léger · 10–14 modéré · 15–19 modérément sévère · 20–27 sévère)",
    status:
      "Validation française Cohidon et al. (2012). Données descriptives à produire après la collecte.",
    pfeSection: "§5.3.3 + §5.5.1",
  },
];

// ─── Planned analyses, hypotheses & their statistical tests ─────────

export interface PlannedCorrelation {
  hypothesis: "H1" | "H2";
  variableA: string;
  variableB: string;
  test: string;
  alphaThreshold: string;
  expected: string;
  status: string;
}

export const REAL_CORRELATIONS: PlannedCorrelation[] = [
  {
    hypothesis: "H1",
    variableA: "Dépersonnalisation (CDS)",
    variableB: "Anxiété-trait (STAI-Y2)",
    test:
      "Corrélation de Pearson (Spearman si non-normalité au test de Shapiro-Wilk)",
    alphaThreshold: "α = 0,05 avec correction de Bonferroni",
    expected: "r > 0 ; p < 0,05",
    status:
      "Test à conduire après la collecte. Cadre théorique : voie hyperactivation (anxieuse) — chapitre 4.",
  },
  {
    hypothesis: "H2",
    variableA: "Dépersonnalisation (CDS)",
    variableB: "Symptomatologie dépressive (PHQ-9)",
    test:
      "Corrélation de Pearson (Spearman si non-normalité au test de Shapiro-Wilk)",
    alphaThreshold: "α = 0,05 avec correction de Bonferroni",
    expected: "r > 0 ; p < 0,05",
    status:
      "Test à conduire après la collecte. Cadre théorique : voie hypoactivation (dépressive) — chapitre 4.",
  },
];

// ─── Real regression specification (H3) ─────────────────────────────

export const REGRESSION_FINDING = {
  hypothesis: "H3",
  outcome: "Sévérité de la dépersonnalisation (CDS, score total)",
  predictors: [
    "Anxiété-trait (STAI-Y2)",
    "Symptomatologie dépressive (PHQ-9)",
  ],
  covariates: ["Âge", "Genre"],
  method: "Régression linéaire multiple, méthode simultanée (forcée)",
  postulatesChecks: [
    "Normalité des résidus (Kolmogorov-Smirnov)",
    "Homoscédasticité (Breusch-Pagan)",
    "Absence de multicolinéarité excessive (VIF < 10 ; tolérance > 0,10)",
    "Indépendance des résidus (Durbin-Watson)",
  ],
  expected:
    "STAI-Y2 et PHQ-9 contribuent indépendamment à la variance des scores CDS (β ≠ 0, p < 0,05) après contrôle réciproque.",
  reportedIndicators:
    "R², R² ajusté, β standardisés, valeurs t et p, intervalles de confiance à 95 %.",
  status:
    "Modèle spécifié dans le protocole (§5.5.3). Estimation à conduire après la collecte de données.",
} as const;

// ─── Analysis plan — from §5.5 of the PFE ───────────────────────────

export const ANALYSIS_PLAN = [
  {
    id: "desc",
    label: "Statistiques descriptives (§5.5.1)",
    description:
      "Moyennes, écarts-types, médianes, min/max, indices d'asymétrie (skewness) et d'aplatissement (kurtosis) pour CDS, STAI-Y2, PHQ-9. Tests formels de normalité (Shapiro-Wilk).",
  },
  {
    id: "corr",
    label: "Analyses corrélationnelles (§5.5.2)",
    description:
      "Corrélations de Pearson (ou Spearman si non-normalité) entre CDS, STAI-Y2 et PHQ-9. Seuil α = 0,05 avec correction de Bonferroni. Intervalles de confiance à 95 %. Interprétation selon les conventions de Cohen (1988) : r = 0,10 petit · 0,30 modéré · 0,50 grand.",
  },
  {
    id: "reg",
    label: "Régression linéaire multiple (§5.5.3)",
    description:
      "Variable dépendante : CDS. Prédicteurs : STAI-Y2 et PHQ-9 (méthode simultanée). Covariables : âge, genre. Vérification des postulats : normalité des résidus, homoscédasticité, absence de multicolinéarité, indépendance des résidus.",
  },
] as const;

// ─── Three tables that appear in the methodology chapter ────────────

export interface PfeTable {
  id: string;
  number: number;
  caption: string;
  note: string;
  columns: string[];
  rows: string[][];
}

export const PFE_TABLES: PfeTable[] = [
  {
    id: "tbl-1-variables",
    number: 1,
    caption: "Variables mesurées et instruments de mesure correspondants",
    note:
      "CDS = Cambridge Depersonalization Scale ; STAI-Y2 = State-Trait Anxiety Inventory, sous-échelle trait ; PHQ-9 = Patient Health Questionnaire, version 9 items.",
    columns: [
      "Variable",
      "Instrument",
      "Items",
      "Étendue des scores",
      "Rôle dans le modèle",
    ],
    rows: [
      [
        "Dépersonnalisation",
        "CDS (Sierra & Berrios, 2000)",
        "29",
        "0 – 1044",
        "Variable dépendante",
      ],
      [
        "Anxiété-trait",
        "STAI-Y2 (Spielberger, 1983)",
        "20",
        "20 – 80",
        "Variable prédictrice (H1, H3)",
      ],
      [
        "Symptomatologie dépressive",
        "PHQ-9 (Kroenke et al., 2001)",
        "9",
        "0 – 27",
        "Variable prédictrice (H2, H3)",
      ],
      [
        "Variables sociodémographiques",
        "Questionnaire ad hoc",
        "8",
        "—",
        "Variables de contrôle",
      ],
    ],
  },
  {
    id: "tbl-2-analysis-plan",
    number: 2,
    caption: "Plan d'analyse statistique en fonction des hypothèses",
    note:
      "CDS = Cambridge Depersonalization Scale ; STAI-Y2 = State-Trait Anxiety Inventory sous-échelle trait ; PHQ-9 = Patient Health Questionnaire-9 ; α = seuil de signification statistique.",
    columns: ["Hypothèse", "Variables", "Test statistique", "Seuil α"],
    rows: [
      [
        "H1 : CDS ~ STAI-Y2",
        "CDS (VD), STAI-Y2 (VI)",
        "Corrélation de Pearson (ou Spearman)",
        "0,05 (Bonferroni)",
      ],
      [
        "H2 : CDS ~ PHQ-9",
        "CDS (VD), PHQ-9 (VI)",
        "Corrélation de Pearson (ou Spearman)",
        "0,05 (Bonferroni)",
      ],
      [
        "H3 : régression multiple",
        "CDS (VD), STAI-Y2 + PHQ-9 (VI)",
        "Régression linéaire multiple (méthode simultanée)",
        "0,05",
      ],
      [
        "Normalité",
        "CDS, STAI-Y2, PHQ-9",
        "Test de Shapiro-Wilk",
        "0,05",
      ],
    ],
  },
  {
    id: "tbl-3-hypothesis-mapping",
    number: 3,
    caption: "Correspondance entre hypothèses, variables et tests statistiques",
    note:
      "VD = variable dépendante ; VI = variable indépendante / prédictrice ; β = coefficient de régression standardisé ; r = coefficient de corrélation ; R² = coefficient de détermination.",
    columns: [
      "Hypothèse",
      "Prédiction",
      "Test",
      "Indicateur principal",
      "Résultat attendu",
    ],
    rows: [
      [
        "H1",
        "CDS corrèle avec STAI-Y2",
        "Corrélation de Pearson / Spearman",
        "r (CDS, STAI-Y2)",
        "r > 0, p < 0,05",
      ],
      [
        "H2",
        "CDS corrèle avec PHQ-9",
        "Corrélation de Pearson / Spearman",
        "r (CDS, PHQ-9)",
        "r > 0, p < 0,05",
      ],
      [
        "H3a",
        "STAI-Y2 prédit CDS",
        "Régression linéaire multiple",
        "β (STAI-Y2)",
        "β > 0, p < 0,05",
      ],
      [
        "H3b",
        "PHQ-9 prédit CDS",
        "Régression linéaire multiple",
        "β (PHQ-9)",
        "β > 0, p < 0,05",
      ],
    ],
  },
];

// ─── Thesis-specific clinical concepts (used by the dashboard) ──────

export const THESIS_CONCEPTS = [
  {
    id: "transdiag",
    label: "Mécanisme transdiagnostique",
    body:
      "Cadre, développé notamment par Harvey et al. (2004) et Mansell et al. (2008), permettant d'identifier des mécanismes psychologiques transversaux à plusieurs entités cliniques, dépassant les frontières nosographiques classiques.",
  },
  {
    id: "dysreg",
    label: "Dysrégulation émotionnelle",
    body:
      "Incapacité à moduler l'intensité, la durée ou la nature de réponses affectives en fonction des exigences contextuelles (Gross & Thompson, 2007 ; Aldao, Nolen-Hoeksema & Schweizer, 2010). Mécanisme transdiagnostique central du modèle proposé.",
  },
  {
    id: "ipseite",
    label: "Ipséité / sentiment de soi",
    body:
      "Conscience immédiate et pré-réflexive d'exister en tant que sujet de ses propres expériences. Distinction de Zahavi (2005) entre soi minimal (pré-réflexif) et soi narratif (biographique). La dépersonnalisation affecte primairement le soi minimal.",
  },
  {
    id: "double-voie",
    label: "Modèle en double voie",
    body:
      "Voie hyperactivation (anxieuse) : inhibition préfrontale descendante sur l'amygdale → anesthésie affective. Voie hypoactivation (dépressive) : sous-activation dopaminergique méso-striatale + hyperactivité du cingulaire sous-génual → émoussement primaire. Convergence vers un phénotype symptomatique commun.",
  },
  {
    id: "interoception",
    label: "Traitement intéroceptif",
    body:
      "Perception des états internes du corps. Hyperintéroception biaisée dans l'anxiété ; hypo-intéroception dans la dépression et la dépersonnalisation (Ciaunica et al., 2021 ; Critchley et al., 2004). Marqueur différentiel potentiel entre les deux voies.",
  },
  {
    id: "detachment-vs-compart",
    label: "Détachement vs compartimentalisation",
    body:
      "Distinction proposée par Holmes et al. (2005) entre dissociation-détachement (à laquelle relève la dépersonnalisation) et dissociation-compartimentalisation. Le détachement émotionnel fonctionne comme une stratégie de régulation de dernier recours, adaptative à court terme.",
  },
] as const;

// ─── Progress tracker — sourced from the PFE draft state ────────────

export interface ChapterProgress {
  chapterId: string;
  label: string;
  status: "complete" | "drafted" | "in-progress" | "outline" | "not-started";
  percent: number;
  note: string;
}

export const REAL_CHAPTER_PROGRESS: ChapterProgress[] = [
  {
    chapterId: "avant-propos",
    label: "Avant-propos",
    status: "in-progress",
    percent: 40,
    note: "Dédicaces + remerciements rédigés. Résumé / abstract finalisés.",
  },
  {
    chapterId: "intro-generale",
    label: "Introduction générale",
    status: "drafted",
    percent: 90,
    note: "Problématique, objectifs, hypothèses et plan de mémoire rédigés.",
  },
  {
    chapterId: "ch1-depersonnalisation",
    label: "Chapitre 1 — Dépersonnalisation",
    status: "drafted",
    percent: 95,
    note: "Définitions, 4 modèles théoriques et 3 mécanismes psychopathologiques rédigés.",
  },
  {
    chapterId: "ch2-anxiete",
    label: "Chapitre 2 — Anxiété et dépersonnalisation",
    status: "drafted",
    percent: 95,
    note: "Modèles cognitif et neurobiologique, comorbidités, voie hyperactivation rédigés.",
  },
  {
    chapterId: "ch3-depression",
    label: "Chapitre 3 — Dépression et dépersonnalisation",
    status: "drafted",
    percent: 95,
    note: "Modèles, anhédonie, idéation suicidaire, voie hypoactivation rédigés.",
  },
  {
    chapterId: "ch4-liens",
    label: "Chapitre 4 — Modèle intégratif transdiagnostique",
    status: "drafted",
    percent: 95,
    note: "Convergences, divergences, modèle en double voie et implications thérapeutiques rédigés.",
  },
  {
    chapterId: "ch5-methodo",
    label: "Chapitre 5 — Méthodologie",
    status: "in-progress",
    percent: 75,
    note:
      "§5.1, §5.3, §5.5 rédigés. §5.2 (population), §5.4 (procédure), §5.6.4 (puissance) et §5.7 (éthique) contiennent des placeholders à compléter.",
  },
  {
    chapterId: "ch6-resultats",
    label: "Chapitre 6 — Résultats",
    status: "not-started",
    percent: 0,
    note: "Collecte de données à effectuer.",
  },
  {
    chapterId: "ch7-discussion",
    label: "Chapitre 7 — Discussion",
    status: "not-started",
    percent: 0,
    note: "Conditionnée à l'analyse des résultats.",
  },
  {
    chapterId: "conclusion-generale",
    label: "Conclusion générale",
    status: "not-started",
    percent: 0,
    note: "À rédiger après la discussion.",
  },
  {
    chapterId: "bibliographie",
    label: "Références bibliographiques",
    status: "drafted",
    percent: 90,
    note: "78 références listées en style APA-like ; vérification finale des DOIs et de la mise en forme à effectuer.",
  },
];

// Storage key for whether the user has accepted the real seed.
// The thesis page checks this — if not set, it offers to seed the
// design / chapter outline with the real material.
export const REAL_SEED_ACCEPTED_KEY = "psych-thesis-real-seed-accepted-v1";
