// Dictionnaire français — niveau universitaire, ton clinique et
// académique. Doit conserver exactement la même structure que EN_DICT
// pour que les vérifications de complétude au moment des tests
// fonctionnent.

import type { AppDictionary } from "./en";

export const FR_DICT: AppDictionary = {
  common: {
    cancel: "Annuler",
    save: "Enregistrer",
    delete: "Supprimer",
    edit: "Modifier",
    add: "Ajouter",
    create: "Créer",
    open: "Ouvrir",
    close: "Fermer",
    next: "Suivant",
    previous: "Précédent",
    back: "Retour",
    continue: "Continuer",
    submit: "Valider",
    confirm: "Confirmer",
    loading: "Chargement…",
    saving: "Enregistrement…",
    saved: "Enregistré",
    yes: "Oui",
    no: "Non",
    ok: "OK",
    today: "Aujourd'hui",
    yesterday: "Hier",
    tomorrow: "Demain",
    overview: "Vue d'ensemble",
    settings: "Paramètres",
    search: "Rechercher",
    quickSearch: "Recherche rapide…",
    signOut: "Se déconnecter",
    switchPortal: "Changer de portail",
    signedInAs: "Connecté(e) en tant que {email}",
    signedInPortal: "portail {portal}",
    portalLabel: {
      formation: "Formation",
      therapist: "Thérapeute",
      client: "Patient",
    },
    optional: "Facultatif",
    required: "Obligatoire",
    seeAll: "Tout voir",
    viewAll: "Tout afficher",
    addToCalendar: "Ajouter au calendrier",
    deadline: "Échéance",
    status: "Statut",
    error: "Une erreur est survenue",
    notFound: "Introuvable",
    empty: "Rien à afficher pour le moment",
    languageEN: "English",
    languageFR: "Français",
  },

  auth: {
    gateway: {
      brand: "Eyla · Espace de travail à trois portails",
      heading: "Choisissez votre portail.",
      lede:
        "Trois espaces de travail, une seule plateforme. Le portail Formation est l'espace universitaire et de pratique supervisée. Le portail Thérapeute est l'espace clinique professionnel. Le portail Patient accompagne le travail thérapeutique entre les séances.",
      footer:
        "Vous pouvez changer de portail à tout moment depuis le pied de la barre latérale.",
      formation: {
        title: "Portail Formation",
        blurb:
          "Mémoire, stage, pratique supervisée, recherche, comptes rendus, tests et grilles. L'espace universitaire et de formation clinique.",
        bullets: {
          a: "Mémoire — Studio & Rédacteur",
          b: "Studio Stage + grilles",
          c: "Tests & grilles d'évaluation",
          d: "Préparation supervision + exports",
        },
        cta: "Continuer en tant qu'étudiant(e)",
      },
      therapist: {
        title: "Portail Thérapeute",
        blurb:
          "Dossiers, entretiens structurés, EEM, formulations, suivi longitudinal, comptes rendus, supervision — conçu pour la documentation et le raisonnement clinique.",
        bullets: {
          a: "Dossiers + outils cliniques",
          b: "Évaluations + comptes rendus",
          c: "Séances + agenda",
          d: "Fiches de travail + ressources",
        },
        cta: "Continuer en tant que thérapeute",
      },
      client: {
        title: "Portail Patient",
        blurb:
          "Un compagnon clinique ancré pour le travail thérapeutique — fiches assignées, évaluations, rendez-vous, retours réflexifs. Plus calme, structuré, charge cognitive réduite.",
        bullets: {
          a: "Travail assigné + fiches",
          b: "Évaluations + réflexions",
          c: "Agenda + rappels",
          d: "Ressources + progression",
        },
        cta: "Continuer en tant que patient(e)",
      },
    },
    login: {
      titleFormation: "Connexion · Formation",
      titleTherapist: "Connexion · Thérapeute",
      titleClient: "Connexion · Patient",
      subtitleFormation:
        "Accès à l'espace universitaire et de formation — mémoire, stage, supervision.",
      subtitleTherapist: "Accès à l'espace clinique.",
      subtitleClient:
        "Un compagnon plus calme pour votre travail thérapeutique.",
      email: "Adresse e-mail",
      password: "Mot de passe",
      emailPlaceholder: "vous@exemple.com",
      passwordPlaceholder: "•••••••",
      submit: "Continuer",
      submitting: "Connexion…",
      missingFields:
        "Saisissez une adresse e-mail et un mot de passe pour continuer.",
      demoNote:
        "Mode démonstration — n'importe quels identifiants vous connectent.",
      backToGateway: "← Retour au choix du portail",
      otherFormation: "Connexion Formation",
      otherTherapist: "Connexion Thérapeute",
      otherClient: "Connexion Patient",
    },
  },

  sidebar: {
    quickSearch: "Recherche rapide…",
    groups: {
      home: "Accueil",
      thesis: "Mémoire",
      internship: "Stage",
      printMaterials: "Impression & matériel",
      system: "Système",
      clinical: "Clinique",
      materials: "Matériel",
      admin: "Administration",
    },
    items: {
      // Formation
      dashboard: "Tableau de bord",
      calendar: "Agenda",
      openWork: "Travail en cours",
      thesisOverview: "Vue d'ensemble",
      thesisWriter: "Rédacteur",
      thesisStats: "Données & statistiques",
      thesisLiterature: "Bibliographie",
      thesisExports: "Exports",
      internshipOverview: "Vue d'ensemble",
      internshipCases: "Dossiers",
      testsGrids: "Tests & grilles",
      reports: "Comptes rendus",
      supervision: "Supervision",
      worksheets: "Fiches de travail",
      transcripts: "Transcriptions",
      resources: "Ressources",
      settings: "Paramètres",
      // Therapist
      cases: "Dossiers",
      assessments: "Évaluations",
      sessions: "Séances",
      clinicalTools: "Outils cliniques",
      inbox: "Boîte de réception",
      ethics: "Éthique",
      backup: "Sauvegarde",
      // Client
      home: "Accueil",
      assigned: "Travail assigné",
      notes: "Notes",
      progress: "Progression",
    },
  },

  formation: {
    dashboard: {
      hero: {
        greetingMorning: "Bonjour",
        greetingAfternoon: "Bon après-midi",
        greetingEvening: "Bonsoir",
        subtitle:
          "Portail Formation · mémoire + stage + supervision dans un seul espace",
      },
      stats: {
        internshipCases: "Dossiers de stage",
        internshipCasesActive: "actifs en studio",
        internshipCasesNone: "aucun pour l'instant",
        gridsPending: "Grilles en attente",
        gridsPendingSub: "{count} tests à coter",
        reportsToFinalize: "Comptes rendus à finaliser",
        reportsToFinalizeSub: "journalier · hebdomadaire · final",
        thesisParticipants: "Participants au mémoire",
        thesisParticipantsSub: "{count} données manquantes",
      },
      quickActions: {
        title: "Actions rapides",
        thesisOverview: "Mémoire — Vue d'ensemble",
        thesisWriter: "Mémoire — Rédacteur",
        internshipOverview: "Stage — Vue d'ensemble",
        testsGrids: "Tests & grilles",
        supervision: "Supervision",
        literature: "Bibliographie",
      },
      thesis: {
        title: "Mémoire",
        completeParticipants: "Participants complets",
        completeParticipantsHint: "{missing} avec données manquantes",
        reportSections: "Sections rédigées",
        reportSectionsHint: "rédacteur de mémoire",
        notes: "Notes",
        notesHint: "banque de citations · littérature",
        variables: "Variables du protocole",
        variablesHint: "méthodologie",
        openDashboard: "Tableau de bord",
        openWriter: "Rédacteur",
      },
      internship: {
        title: "Stage",
        none: "Aucun dossier de stage pour le moment",
        openStudio: "Ouvrir le Studio Stage",
        ageMissing: "Âge non précisé",
        testsGrids: "Tests & grilles",
        supervision: "Supervision",
      },
      supervision: {
        title: "Notes de supervision récentes",
        allNotes: "Toutes les notes",
        none: "Aucune note de supervision pour le moment",
        fallbackLabel: "Note de supervision",
      },
      upcoming: {
        title: "À venir",
        viewCalendar: "Agenda",
        nextSupervisor: "Prochaine rencontre avec l'encadrant",
        nextSupervisorHint: "ajouter à l'agenda",
        weeklySynthesis: "Synthèse hebdomadaire à rendre",
        weeklySynthesisHint: "chaque dimanche",
        finalReport: "Rapport final de stage",
        finalReportHint: "fin de la période de stage",
      },
    },
  },

  therapist: {
    dashboard: {
      greetingMorning: "Bonjour",
      greetingAfternoon: "Bon après-midi",
      greetingEvening: "Bonsoir",
      subtitle: "{active} dossiers actifs · {goals} objectifs en cours",
      subtitleWithReview:
        "{active} dossiers actifs · {goals} objectifs en cours · {review} à revoir",
      stats: {
        activeCases: "Dossiers actifs",
        activeCasesSub: "{count} à revoir",
        todayCheckIns: "Check-ins du jour",
        todayCheckInsSub: "consignés aujourd'hui",
        goalsInProgress: "Objectifs en cours",
        goalsInProgressSub: "{count} atteints",
        assessmentsPending: "Évaluations en attente",
        assessmentsPendingSub: "non commencées",
      },
      quickActions: {
        title: "Actions rapides",
        newCase: "Nouveau dossier",
        newCheckIn: "Check-in",
        newGoal: "Nouvel objectif",
        transcript: "Transcription",
        printGrid: "Imprimer une grille",
        report: "Compte rendu",
      },
      sections: {
        recentCases: "Dossiers récents",
        goals: "Objectifs",
        alerts: "Alertes",
        recentActivity: "Activité récente",
        noActivity:
          "Aucune activité pour le moment — commencez par créer un dossier ✦",
      },
    },
  },

  client: {
    home: {
      title: "Accueil",
    },
    calendar: {
      title: "Agenda",
      microcopy:
        "Vos prochaines séances, le travail assigné et vos rappels — les 30 prochains jours.",
      summary: {
        upcoming: "Événements à venir",
        newFromTherapist: "Nouveau de votre thérapeute",
        completed: "Devoirs terminés",
      },
      empty: "Rien à l'agenda pour les 30 prochains jours.",
      emptyHint:
        "Votre thérapeute vous assignera du travail et fixera des séances au fur et à mesure.",
      today: "AUJOURD'HUI",
      assigned: "Travail assigné par votre thérapeute",
      acknowledged: "Pris en compte",
      awaiting: "En attente de votre attention",
    },
    assigned: {
      title: "Travail assigné",
      microcopy:
        "Le matériel que votre thérapeute vous a demandé de travailler entre les séances.",
      pending: "En attente",
      done: "Terminé",
      completed: "Terminés",
      emptyPending:
        "Rien en attente. Votre thérapeute vous assignera du matériel au fur et à mesure.",
      markDone: "Marquer comme terminé",
      kinds: {
        workbook: "Fiche de travail",
        assessment: "Évaluation",
        card: "Carte thérapeutique",
        journey: "Parcours thérapeutique",
        note: "Note du thérapeute",
      },
      labels: {
        assessment: "Évaluation à compléter",
        card: "Carte thérapeutique",
        note: "Note de votre thérapeute",
      },
    },
  },

  thesis: {
    overview: {
      title: "Tableau de bord du mémoire",
      programme: "Programme",
      aim: "Objectif",
      problem: "Problématique",
      abstract: "Résumé / Abstract",
      abstractFR: "Résumé · FR",
      abstractEN: "Abstract · EN",
      abstractDesc:
        "Versions française et anglaise extraites du mémoire.",
      objectivesTitle: "Objectifs de recherche",
      objectivesDesc:
        "Quatre objectifs articulant les dimensions théorique, analytique, intégrative et empirique.",
      progressTitle: "Avancement par chapitre",
      progressDesc:
        "État du brouillon — pourcentages estimés à partir du draft actuel du mémoire.",
      keywords: "Mots-clés",
      importData: "Importer les données participants",
      openWriter: "Ouvrir le rédacteur",
    },
    chapters: {
      foreword: "Avant-propos",
      introduction: "Introduction générale",
      literatureReview: "Revue de littérature",
      methodology: "Méthodologie",
      results: "Résultats",
      discussion: "Discussion",
      conclusion: "Conclusion générale",
      bibliography: "Références bibliographiques",
      appendices: "Annexes",
    },
    statistics: {
      title: "Statistiques descriptives — protocole (n planifié = 50)",
      desc:
        "Collecte de données non commencée. Les valeurs seront calculées après la passation.",
      plannedN: "n planifié",
      range: "Étendue",
      correlationsTitle: "Corrélations prévues (H1 & H2)",
      correlationsDesc:
        "Tests à conduire après la collecte. Cadre statistique défini au §5.5.2.",
      threshold: "Seuil",
      expected: "Attendu",
      regressionTitle: "Régression linéaire multiple — H3",
      regressionDesc:
        "Spécification du modèle. Estimation à conduire après la collecte (§5.5.3).",
      dependentVariable: "Variable dépendante",
      predictors: "Prédicteurs",
      covariates: "Covariables",
      method: "Méthode",
      postulates: "Postulats vérifiés",
      indicators: "Indicateurs rapportés",
    },
    tables: {
      title: "Tableaux du mémoire",
      desc:
        "Variables, plan d'analyse et correspondance hypothèses ↔ tests (chapitre 5).",
      tableLabel: "Tableau {n} — {caption}",
      noteLabel: "Note. {note}",
    },
    methodology: {
      title: "Méthodologie",
      sectionsDesc:
        "Sections modifiables — à compléter dans le rédacteur de mémoire.",
    },
    progress: {
      chapter6Note: "Collecte de données à effectuer.",
      chapter7Note: "Conditionnée à l'analyse des résultats.",
      conclusionNote: "À rédiger après la discussion.",
    },
  },

  internship: {
    studio: {
      title: "Studio Stage",
    },
    cases: {
      title: "Dossiers de stage",
      pageDesc:
        "Chaque dossier ouvert dans votre stage supervisé — codes anonymisés, profils structurés, grilles d'observation, tests et comptes rendus.",
      active: "Dossiers actifs ({count})",
      archived: "Archivés ({count})",
      none: "Aucun dossier de stage actif pour le moment.",
      openStudio: "Ouvrir le Studio Stage",
      archivedLabel: "Archivé",
      ageMissing: "Âge non précisé",
    },
    reports: {
      title: "Comptes rendus de stage",
      pageDesc:
        "Observations quotidiennes, synthèse hebdomadaire, résumés de supervision et rapport final de stage — assemblés à partir de vos données de dossier structurées.",
      drafts: "Brouillons ({count})",
      finalized: "Finalisés ({count})",
      emptyDrafts:
        "Aucun brouillon de compte rendu. Générez-en un depuis un dossier du Studio Stage.",
      generateInStudio: "Générer des comptes rendus en Studio",
      statusDraft: "Brouillon",
      statusFinalized: "Finalisé",
    },
  },

  errors: {
    requiredField: "Ce champ est obligatoire.",
    invalidEmail: "Saisissez une adresse e-mail valide.",
    unknown: "Une erreur est survenue. Veuillez réessayer.",
    networkOffline: "Vous semblez hors ligne.",
  },

  empty: {
    cases: "Aucun dossier pour le moment",
    notes: "Aucune note pour le moment",
    reports: "Aucun compte rendu pour le moment",
    assessments: "Aucune évaluation pour le moment",
    supervision: "Aucune note de supervision pour le moment",
  },

  today: {
    title: "Aujourd'hui",
    empty: "Rien d'urgent pour l'instant — eaux calmes.",
    count: "{n} élément(s)",
  },

  memory: {
    rail: {
      title: "Mémoire de travail",
      empty: "Aucun élément épinglé",
      count: "{n} épinglé(s)",
    },
    empty: {
      title: "La barre est silencieuse.",
      hint:
        "Épinglez ici observations, extraits, hypothèses et citations au fil du travail — ils restent avec vous tout au long de la séance.",
    },
    kinds: {
      observation: "Observations",
      excerpt: "Extraits",
      hypothesis: "Hypothèses",
      quote: "Citations",
      fragment: "Fragments",
      supervision: "Supervision",
      reference: "Références",
      paragraph: "Paragraphes",
      sensory: "Notes sensorielles",
      pattern: "Schémas",
    },
    actions: {
      copy: "Copier dans le presse-papiers",
      recolor: "Changer la couleur",
      archive: "Archiver",
      remove: "Supprimer",
      pin: "Épingler à la mémoire",
    },
  },
};
