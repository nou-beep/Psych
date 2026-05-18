// Seeded internship state — one anonymized case so the studio
// renders something on first run. Anonymized identifiers,
// fictional context, deterministic ids (so re-seeds are
// idempotent across sessions).

import type {
  InternshipCase,
  InternshipReport,
  InternshipSupervisionNote,
  InternshipTest,
} from "./types";
import type { ScorableGridAdministration } from "./scorable-grids";
import { DEFAULT_EVALUATOR } from "./evaluator";

const CASE_ID = "internship-case-seed-int-ap-001";
const TEST_VINELAND = "internship-test-seed-vineland";
const TEST_SENSORY = "internship-test-seed-sensory";
const TEST_COMMUNICATION = "internship-test-seed-communication";
const TEST_ABC = "internship-test-seed-abc";

const DAILY_1 = "internship-daily-seed-001";
const DAILY_2 = "internship-daily-seed-002";
const WEEKLY = "internship-weekly-seed-001";
const SUPERVISION = "internship-supervision-seed-001";
const SCORABLE_ADMIN_CAPACITES = "internship-scorable-seed-capacites-001";

const NOW = "2026-03-18T00:00:00.000Z";

export const SEED_INTERNSHIP_CASES: InternshipCase[] = [
  {
    id: CASE_ID,
    identification: {
      caseCode: "INT-AP-001",
      age: "âge placeholder",
      setting: "association · medico-social",
      internshipPlace: "Centre d'accompagnement (association)",
      supervisor: "Dr. R. Cohen",
      reasonForFollowUp:
        "Accompagnement individuel dans le cadre d'un suivi autisme / développement. Objectifs : observation clinique, soutien à la régulation, médiation des interactions, évaluation par grilles structurées.",
      presentingConcerns:
        "Communication verbale limitée (quelques mots fonctionnels). Difficultés sensorielles (auditives, tactiles). Recherche de routines stables, réactions marquées aux transitions. Episodes de désorganisation 1–2x/semaine.",
      diagnosticContext:
        "TSA confirmé. Pas de comorbidité épileptique connue. Bilan d'autonomie en cours.",
      consent: "written",
    },
    context: {
      developmentalObservations:
        "Acquisitions motrices dans les normes. Langage tardif, premières combinaisons de 2 mots vers 4 ans. Joue seul majoritairement, parfois en parallèle.",
      communicationProfile:
        "Mode mixte : mots fonctionnels + pointage + PECS-like en cours. Comprend mieux qu'il ne s'exprime. Echolalie différée fréquente le matin.",
      socialInteraction:
        "Initiation rare avec adultes inconnus. Reciprocité émergente avec deux pairs spécifiques. Tolère le contact visuel sur courtes durées si demande explicite.",
      emotionalRegulation:
        "Régulation par stéréotypies douces (balancement, jeu de doigts). Crises essentiellement déclenchées par changements imprévus, bruit fort, transitions sans préavis.",
      sensoryProfile:
        "Hypersensibilité auditive marquée. Hyposensibilité proprioceptive (recherche pressions). Néophobie alimentaire.",
      behaviorObservations:
        "Pas de comportements auto-agressifs ni hétéro-agressifs majeurs. Quelques pincements/pressions sur soi en moments de stress.",
      attentionEngagement:
        "Attention soutenue sur intérêt spécifique. Difficulté à passer à une activité non choisie sans support visuel.",
      autonomyAdaptive:
        "Autonomie partielle pour les repas. Toilette : aide nécessaire. Habillage : aide pour fermetures et orientation.",
      familySchoolContext:
        "Scolarisé en milieu spécialisé sur temps réduit. Famille engagée. AESH présente sur certaines plages.",
    },
    startDate: "2026-01-15",
    createdAt: NOW,
    updatedAt: NOW,
  },
];

export const SEED_INTERNSHIP_TESTS: InternshipTest[] = [
  {
    id: TEST_VINELAND,
    caseId: CASE_ID,
    shellId: "vineland",
    name: "Vineland (shell)",
    domain: "adaptive-functioning",
    purpose: "Baseline pour planifier les objectifs d'autonomie.",
    ageRange: "0–90 years",
    status: "planned",
    plannedDate: "2026-03-22",
    scoringMethod: "Standard score / age-equivalent per domain.",
    fileIds: [],
    gridIds: [],
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: TEST_SENSORY,
    caseId: CASE_ID,
    shellId: "sensory-profile",
    name: "Sensory Profile (shell)",
    domain: "sensory",
    purpose: "Mapping du profil sensoriel pour orienter l'environnement.",
    ageRange: "Birth–adulthood",
    status: "administered",
    plannedDate: "2026-03-08",
    administrationDate: "2026-03-08",
    scoringMethod: "Quadrant scores: Seeking, Avoiding, Sensitivity, Registration.",
    fileIds: [],
    gridIds: [],
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: TEST_COMMUNICATION,
    caseId: CASE_ID,
    shellId: "communication-checklist",
    name: "Communication observation checklist",
    domain: "communication",
    purpose: "Suivi hebdomadaire des modalités de communication.",
    status: "scored",
    plannedDate: "2026-02-15",
    administrationDate: "2026-02-15",
    score: {
      rawScore: "Demandes : 8/séance · Commentaires : 1/séance",
      band: "Niveau émergent — modalité mixte (gestes + mots)",
    },
    interpretationNotes:
      "Bonne fréquence de demandes lorsque la motivation est concrète. Commentaires spontanés rares. PECS-like utile pour structurer.",
    fileIds: [],
    gridIds: [],
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: TEST_ABC,
    caseId: CASE_ID,
    shellId: "behavior-abc",
    name: "ABC behavior observation sheet",
    domain: "behavior",
    purpose: "Analyse fonctionnelle des épisodes de désorganisation.",
    status: "awaiting-scoring",
    plannedDate: "2026-03-15",
    administrationDate: "2026-03-15",
    fileIds: [],
    gridIds: [],
    createdAt: NOW,
    updatedAt: NOW,
  },
];

// Pre-filled scored administration — gives the user a real
// example of what the click-based engine produces.
export const SEED_INTERNSHIP_SCORABLE: ScorableGridAdministration[] = [
  {
    id: SCORABLE_ADMIN_CAPACITES,
    caseId: CASE_ID,
    templateId: "grille-capacites-v1",
    date: "2026-03-14",
    evaluator: DEFAULT_EVALUATOR.name,
    context: "Atelier individuel",
    sessionLabel: "Séance 7",
    observations:
      "L'enfant arrive disponible mais la résistance aux distracteurs reste fragile. Les capacités de discrimination visuelle sont mobilisables sur du matériel structuré. Le rappel après délai bref reste à étayer.",
    signaturePsychologue: DEFAULT_EVALUATOR.name,
    visaResponsable: "",
    scores: {
      // Attention et disponibilité
      "attention-position-assise": { score: "EC" },
      "attention-prenom": { score: "A" },
      "attention-conjointe": { score: "EC" },
      "attention-engagement": { score: "EC" },
      "attention-tolerance": { score: "NA" },
      "attention-distracteurs": { score: "NA" },
      // Mémoire et évocation
      "memoire-objet-cache": { score: "A" },
      "memoire-rappel-delai": { score: "EC" },
      "memoire-reconnaissance": { score: "A" },
      // Perception visuelle et discrimination
      "perception-sequence-visuelle": { score: "EC" },
      "perception-assoc-objet-objet": { score: "A" },
      "perception-assoc-image-image": { score: "A" },
      "perception-assoc-objet-image": { score: "EC" },
      "perception-tri": { score: "A" },
    },
    createdAt: NOW,
    updatedAt: NOW,
  },
];

export const SEED_INTERNSHIP_REPORTS: InternshipReport[] = [
  {
    id: DAILY_1,
    caseId: CASE_ID,
    kind: "daily",
    title: "Daily · 2026-03-11",
    daily: {
      date: "2026-03-11",
      contextSession: "Atelier individuel · 11h00 → 12h00 · salle calme.",
      objectives:
        "Maintenir l'engagement sur 3 activités. Tester un nouveau pictogramme pour la transition repas.",
      observations:
        "Arrivée tendue, refus initial du jeu de tri. Acceptation après 4 min de respiration côte-à-côte. Engagement sur tri de formes, puis sur jeu sensoriel. Refus de la 3e activité (mise en mots).",
      communication:
        "3 demandes verbales (« plus », « non », « aide »). 2 demandes par pictogramme.",
      socialInteraction:
        "Une initiation spontanée vers l'évaluatrice (objet tendu). Pas d'attention conjointe initiée.",
      behavior:
        "Auto-pressions sur les jambes pendant les transitions. Pas de crise.",
      emotionalRegulation:
        "Niveau 5/10 au refus de la 3e activité. Récupération en 6 min avec support proprioceptif.",
      sensoryNotes:
        "Couvre les oreilles 2x quand la porte du couloir claque.",
      interventionUsed:
        "Now/Next visuel pour la transition. Pression profonde avant la 3e activité.",
      response:
        "Now/Next a aidé. La 3e activité reste hors de portée.",
      reflection:
        "Le seuil de tolérance baisse vite après 30 min.",
      nextSteps:
        "Placer la 3e activité en début. Préparer un casque anti-bruit.",
    },
    linkedSupervisionIds: [],
    linkedTestIds: [],
    linkedGridIds: [],
    draft: false,
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: DAILY_2,
    caseId: CASE_ID,
    kind: "daily",
    title: "Daily · 2026-03-14",
    daily: {
      date: "2026-03-14",
      contextSession: "Atelier individuel · 11h00 → 12h00.",
      objectives:
        "Placer la 3e activité en début. Introduire le casque anti-bruit. Administrer la grille clinique d'évaluation des capacités.",
      observations:
        "Inversion réussie. Casque essayé 8 min puis retiré. Grille administrée en fin de séance.",
      communication:
        "5 demandes verbales. Un commentaire spontané (« rond ! »).",
      socialInteraction:
        "Tentative d'attention conjointe vers la fenêtre (oiseau).",
      behavior:
        "Une crise courte (3 min) au retour des autres enfants dans le couloir.",
      emotionalRegulation:
        "Niveau 8/10 au pic, redescente en 3 min.",
      sensoryNotes:
        "Casque toléré 8 min — première fois.",
      interventionUsed:
        "Cocon + pression profonde. Casque proposé en libre service.",
      response:
        "Bonne. À répéter.",
      reflection:
        "La position en début de séance est probablement la bonne pour les tâches difficiles.",
      nextSteps:
        "Continuer schéma : difficile en 1er, sensoriel en milieu, libre en fin.",
    },
    linkedSupervisionIds: [],
    linkedTestIds: [],
    linkedGridIds: [],
    draft: false,
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: WEEKLY,
    caseId: CASE_ID,
    kind: "weekly",
    title: "Weekly · 2026-03-09 → 2026-03-15",
    weekly: {
      weekStart: "2026-03-09",
      weekEnd: "2026-03-15",
      sessionsCompleted: 2,
      progressObserved:
        "Première utilisation spontanée du cocon comme stratégie d'auto-régulation. Premier commentaire spontané (« rond ! »). Premier essai de casque anti-bruit avec tolérance de 8 min. Grille capacités administrée — discrimination visuelle mobilisable, attention à renforcer.",
      difficulties:
        "Les transitions imprévues restent le déclencheur principal. La 3e activité du planning a peu d'engagement en fin de séance.",
      repeatedPatterns:
        "Régulation par pression profonde efficace. La fenêtre attire l'attention conjointe — utiliser comme point d'ancrage.",
      testsAdministered:
        "ABC behavior sheet en cours de cotation. Grille capacités administrée.",
      gridsCompleted:
        "Grille clinique d'évaluation des capacités · 14 items cotés · acquisition globale ~58%.",
      supervisionQuestions:
        "Quel ordre pour la suite des grilles ? Faut-il prioriser Attention soutenue ou Tolérance à l'attente ?",
      nextWeekObjectives:
        "Administrer la grille Attention et disponibilité. Étendre le casque. Reformuler les objectifs hebdo en termes observables.",
      sourceDailyIds: [DAILY_1, DAILY_2],
    },
    linkedSupervisionIds: [],
    linkedTestIds: [TEST_ABC],
    linkedGridIds: [],
    draft: false,
    createdAt: NOW,
    updatedAt: NOW,
  },
];

export const SEED_INTERNSHIP_SUPERVISION: InternshipSupervisionNote[] = [
  {
    id: SUPERVISION,
    caseId: CASE_ID,
    date: "2026-03-16",
    supervisor: "Dr. R. Cohen",
    casesDiscussed: "INT-AP-001",
    testsDiscussed:
      "Vineland prévu 22/03. ABC en cours de cotation. Grille capacités administrée.",
    gridsReviewed:
      "Grille clinique d'évaluation des capacités — synthèse acquisition 58%, attention à renforcer.",
    clinicalQuestions:
      "Quel ordre pour la suite des grilles ? Casque anti-bruit : libre service ou structuré ?",
    feedbackReceived:
      "Continuer le libre service pour le casque. La progression de tolérance suggère que l'usage structuré viendra naturellement. Pour la suite des grilles, prioriser Attention soutenue avant Tolérance à l'attente.",
    correctionsRequested:
      "Préciser dans la grille ABC la fonction hypothétique des deux derniers épisodes. Reformuler les objectifs hebdo en termes observables.",
    actionPlan:
      "1) Coder la grille ABC d'ici la prochaine séance · 2) Administrer la grille Attention et disponibilité la semaine suivante · 3) Reformuler les objectifs.",
    followUp: "Reprise en supervision le 30/03.",
    linkedTestIds: [TEST_ABC],
    linkedGridIds: [],
    linkedReportIds: [WEEKLY],
    createdAt: NOW,
    updatedAt: NOW,
  },
];

export const INTERNSHIP_SEED_ACCEPTED_KEY =
  "psych-internship-seed-accepted-v1";
