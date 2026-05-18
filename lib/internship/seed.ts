// Seeded internship state — one anonymized autistic-child case so
// the studio has something to render the first time the user opens
// it. Everything here is fictional, anonymized, and replaceable.
//
// Identifiers are deterministic (not generateId) so the seed is
// idempotent across sessions and reseeds.

import type {
  InternshipCase,
  InternshipReport,
  InternshipSupervisionNote,
  InternshipTest,
} from "./types";

const CASE_ID = "internship-case-seed-001";
const TEST_VINELAND = "internship-test-seed-vineland";
const TEST_SENSORY = "internship-test-seed-sensory";
const TEST_COMMUNICATION = "internship-test-seed-communication";
const TEST_ABC = "internship-test-seed-abc";

const DAILY_1 = "internship-daily-seed-001";
const DAILY_2 = "internship-daily-seed-002";
const WEEKLY = "internship-weekly-seed-001";
const SUPERVISION = "internship-supervision-seed-001";

const NOW = "2026-03-18T00:00:00.000Z";

export const SEED_INTERNSHIP_CASES: InternshipCase[] = [
  {
    id: CASE_ID,
    identification: {
      caseCode: "CHILD-AUT-2026-01",
      age: "6 years",
      setting: "association · medico-social",
      internshipPlace: "Centre d'accompagnement (association)",
      supervisor: "Dr. R. Cohen",
      reasonForFollowUp:
        "Accompagnement individuel suite à un diagnostic de TSA confirmé. Objectif : observation clinique, soutien à la régulation, médiation des interactions sociales.",
      presentingConcerns:
        "Communication verbale limitée (2-3 mots fonctionnels). Difficultés sensorielles (auditives, tactiles). Recherche de routines stables, fortes réactions aux transitions. Crises de désorganisation 1–2x/semaine.",
      diagnosticContext:
        "TSA niveau 2 (CIM-11 / DSM-5). Confirmé en CDA en 09/2024. Pas de comorbidité épileptique. Score Vineland antérieur en attente.",
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
        "Hypersensibilité auditive marquée (couvre les oreilles). Hyposensibilité proprioceptive (recherche pressions). Néophobie alimentaire.",
      behaviorObservations:
        "Pas de comportements auto-agressifs ni hétéro-agressifs majeurs. Quelques pincements/pressions sur soi en moment de stress.",
      attentionEngagement:
        "Attention soutenue sur intérêt spécifique (trains, formes géométriques). Difficulté à passer à une activité non-choisie sans support visuel.",
      autonomyAdaptive:
        "Autonomie partielle pour repas. Toilette : aide nécessaire. Habillage : aide pour fermetures et orientation.",
      familySchoolContext:
        "Scolarisé en ULIS sur temps réduit. Famille engagée, communication régulière. AESH présente 3 demi-journées.",
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
      rawScore: "Demandes : 8/session · Commentaires : 1/session",
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
    purpose: "Analyse fonctionnelle des crises de désorganisation.",
    status: "awaiting-scoring",
    plannedDate: "2026-03-15",
    administrationDate: "2026-03-15",
    fileIds: [],
    gridIds: [],
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
        "Arrivée tendue, refus initial du jeu de tri. Acceptation après 4 min de respiration côte-à-côte. Engagement sur tri formes, puis sur jeu sensoriel (sable cinétique). Refus de la 3e activité (mise en mots).",
      communication:
        "3 demandes verbales (\"plus\", \"non\", \"aide\"). 2 demandes par pictogramme. Une echolalie d'instruction de l'AESH (\"on range\").",
      socialInteraction:
        "Une initiation spontanée vers moi (m'a tendu un objet). Pas d'attention conjointe initiée par lui.",
      behavior:
        "Auto-pressions sur les jambes pendant les transitions. Pas de crise.",
      emotionalRegulation:
        "Niveau 5/10 au moment du refus de la 3e activité. Récupération en 6 min avec support proprioceptif (cocon).",
      sensoryNotes:
        "Couvert les oreilles 2x quand la porte du couloir a claqué. Mention au cadre.",
      interventionUsed:
        "Now/Next visuel pour la transition. Pression profonde avant la 3e activité.",
      response:
        "Now/Next a aidé pour passer de tri → sable. La 3e activité reste hors de portée.",
      reflection:
        "Le seuil de tolérance baisse vite après 30 min. Garder la 3e activité plus courte ou la déplacer en début.",
      nextSteps:
        "Tester la 3e activité en premier la semaine prochaine. Préparer un casque anti-bruit.",
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
        "Placer la 3e activité en début. Introduire le casque anti-bruit.",
      observations:
        "Inversion réussie — 3e activité acceptée en début (5 min). Casque essayé 8 min puis retiré. Atelier sensoriel apprécié.",
      communication:
        "5 demandes verbales. Un commentaire spontané (\"rond !\").",
      socialInteraction:
        "Tentative d'attention conjointe vers la fenêtre (oiseau).",
      behavior:
        "Une crise courte (3 min) au moment du retour des autres enfants dans le couloir. Cocon + pression profonde, récupération.",
      emotionalRegulation:
        "Niveau 8/10 au pic, redescente en 3 min. Premier épisode où il accepte spontanément le cocon.",
      sensoryNotes:
        "Casque toléré 8 min — première fois. Belle progression.",
      interventionUsed:
        "Cocon + pression profonde. Casque proposé en libre service.",
      response:
        "Bonne. À répéter.",
      reflection:
        "La position en début de séance est probablement la bonne pour les tâches difficiles. Le casque a aidé même retiré.",
      nextSteps:
        "Continuer schéma : difficile en 1er, sensoriel en milieu, libre en fin. Étendre le casque progressivement.",
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
        "Première utilisation spontanée du cocon comme stratégie d'auto-régulation. Premier commentaire spontané (\"rond !\"). Premier essai de casque anti-bruit avec tolérance de 8 min.",
      difficulties:
        "Les transitions imprévues restent le déclencheur principal. La 3e activité du planning a peu d'engagement en fin de séance.",
      repeatedPatterns:
        "Régulation par pression profonde efficace dans deux contextes différents. La fenêtre attire l'attention conjointe — utiliser comme point d'ancrage.",
      testsAdministered:
        "ABC behavior sheet administrée (en attente de cotation).",
      gridsCompleted:
        "Grille de communication remplie pour les deux séances. Synthèse hebdo : niveau émergent stable, fréquence de demandes augmente.",
      supervisionQuestions:
        "Faut-il introduire le casque sur l'ensemble des activités ou le garder en libre service ? Comment articuler la 3e activité du planning sans surcharge ?",
      nextWeekObjectives:
        "Maintenir le schéma difficile-sensoriel-libre. Étendre le casque. Coder la grille ABC en supervision.",
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
    casesDiscussed: "CHILD-AUT-2026-01",
    testsDiscussed:
      "Vineland (prévu 22/03). ABC en cours de cotation.",
    gridsReviewed:
      "Grille de communication (2 entrées). Grille de régulation à mettre en place.",
    clinicalQuestions:
      "Casque anti-bruit : usage libre ou structuré ? Articulation de la 3e activité du planning ?",
    feedbackReceived:
      "Continuer le libre service pour le casque. La progression de tolérance suggère que l'usage structuré viendra naturellement. Pour la 3e activité, suggestion d'utiliser un timer visuel court (3 min) plutôt que de l'imposer sur la durée.",
    correctionsRequested:
      "Préciser dans la grille ABC la fonction hypothétique des deux derniers épisodes. Reformuler les objectifs hebdo en termes observables.",
    actionPlan:
      "1) Coder la grille ABC d'ici la prochaine séance · 2) Tester le timer visuel à 3 min · 3) Reformuler les objectifs.",
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
