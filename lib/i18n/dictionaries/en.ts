// English dictionary — canonical shape. The FR dictionary mirrors
// this exactly so missing keys are visible to developers.
//
// Conventions:
// - Namespaces are nested objects: common, auth, gateway, sidebar,
//   formation, therapist, client, thesis, internship, settings, etc.
// - Leaf values are strings (no React nodes — those live in JSX).
// - Variable placeholders use {name} syntax.
// - Use British / American spelling consistently — we go US English.

// Shared shape for any locale dictionary. EN below is the canonical
// instance; FR conforms structurally so missing keys surface at build
// time. Leaves are typed as plain `string` (not literal string) so
// translations of the same key don't trigger structural mismatches.
export interface AppDictionary {
  [key: string]: string | AppDictionary;
}

export const EN_DICT: AppDictionary = {
  common: {
    cancel: "Cancel",
    save: "Save",
    delete: "Delete",
    edit: "Edit",
    add: "Add",
    create: "Create",
    open: "Open",
    close: "Close",
    next: "Next",
    previous: "Previous",
    back: "Back",
    continue: "Continue",
    submit: "Submit",
    confirm: "Confirm",
    loading: "Loading…",
    saving: "Saving…",
    saved: "Saved",
    yes: "Yes",
    no: "No",
    ok: "OK",
    today: "Today",
    yesterday: "Yesterday",
    tomorrow: "Tomorrow",
    overview: "Overview",
    settings: "Settings",
    search: "Search",
    quickSearch: "Quick search…",
    signOut: "Sign out",
    switchPortal: "Switch portal",
    signedInAs: "Signed in as {email}",
    signedInPortal: "portal {portal}",
    portalLabel: {
      formation: "Formation",
      therapist: "Therapist",
      client: "Client",
    },
    optional: "Optional",
    required: "Required",
    seeAll: "See all",
    viewAll: "View all",
    addToCalendar: "Add to calendar",
    deadline: "Deadline",
    status: "Status",
    error: "Something went wrong",
    notFound: "Not found",
    empty: "Nothing here yet",
    languageEN: "English",
    languageFR: "Français",
  },

  auth: {
    gateway: {
      brand: "Eyla · Three-Portal Workspace",
      heading: "Choose your portal.",
      lede:
        "Three workspaces, one platform. Formation is the academic and training workspace. Therapist is the professional clinical workspace. Client is the companion for assigned therapy work between sessions.",
      footer: "You can switch portals any time from the sidebar footer.",
      formation: {
        title: "Formation Portal",
        blurb:
          "Thesis, internship, supervised practice, research, reports, tests and grids. The academic + clinical-training workspace.",
        bullets: {
          a: "Thesis Studio + Writer",
          b: "Internship Studio + grids",
          c: "Tests & assessment shells",
          d: "Supervision prep + exports",
        },
        cta: "Continue as Trainee",
      },
      therapist: {
        title: "Therapist Portal",
        blurb:
          "Cases, structured interviews, MSE, formulations, longitudinal tracking, reports, supervision — built for documentation and clinical reasoning.",
        bullets: {
          a: "Cases + clinical tools",
          b: "Assessments + reports",
          c: "Sessions + calendar",
          d: "Worksheets + resources",
        },
        cta: "Continue as Therapist",
      },
      client: {
        title: "Client Portal",
        blurb:
          "A clinically grounded companion for therapy work — assigned worksheets, assessments, appointments, reflections. Quieter, structured, lower cognitive load.",
        bullets: {
          a: "Assigned work + worksheets",
          b: "Assessments + reflections",
          c: "Calendar + reminders",
          d: "Resources + progress",
        },
        cta: "Continue as Client",
      },
    },
    login: {
      titleFormation: "Formation sign in",
      titleTherapist: "Therapist sign in",
      titleClient: "Client sign in",
      subtitleFormation:
        "Continue to the academic & training workspace — thesis, internship, supervision.",
      subtitleTherapist: "Continue to the clinical workspace.",
      subtitleClient: "A quieter companion for your therapy work.",
      email: "Email",
      password: "Password",
      emailPlaceholder: "you@example.com",
      passwordPlaceholder: "•••••••",
      submit: "Continue",
      submitting: "Signing in…",
      missingFields: "Enter an email and a password to continue.",
      demoNote: "Demo mode — any credentials sign you in.",
      backToGateway: "← Back to gateway",
      otherFormation: "Formation sign-in",
      otherTherapist: "Therapist sign-in",
      otherClient: "Client sign-in",
    },
  },

  sidebar: {
    quickSearch: "Quick search…",
    groups: {
      home: "Home",
      thesis: "Thesis",
      internship: "Internship",
      printMaterials: "Print / Materials",
      system: "System",
      clinical: "Clinical",
      materials: "Materials",
      admin: "Admin",
    },
    items: {
      // Formation
      dashboard: "Dashboard",
      calendar: "Calendar",
      openWork: "Open Work",
      thesisOverview: "Overview",
      thesisWriter: "Writer",
      thesisStats: "Dataset / Stats",
      thesisLiterature: "Literature",
      thesisExports: "Exports",
      internshipOverview: "Overview",
      internshipCases: "Cases",
      testsGrids: "Tests & Grids",
      reports: "Reports",
      supervision: "Supervision",
      worksheets: "Worksheets",
      transcripts: "Transcripts",
      resources: "Resources",
      settings: "Settings",
      // Therapist
      cases: "Cases",
      assessments: "Assessments",
      sessions: "Sessions",
      clinicalTools: "Clinical Tools",
      inbox: "Inbox",
      ethics: "Ethics",
      backup: "Backup",
      // Client
      home: "Home",
      assigned: "Assigned",
      notes: "Notes",
      progress: "Progress",
    },
  },

  formation: {
    dashboard: {
      hero: {
        greetingMorning: "Good morning",
        greetingAfternoon: "Good afternoon",
        greetingEvening: "Good evening",
        subtitle:
          "Formation Portal · thesis + internship + supervision in one workspace",
      },
      stats: {
        internshipCases: "Internship cases",
        internshipCasesActive: "active in studio",
        internshipCasesNone: "none yet",
        gridsPending: "Grids pending",
        gridsPendingSub: "{count} tests to score",
        reportsToFinalize: "Reports to finalize",
        reportsToFinalizeSub: "daily · weekly · final",
        thesisParticipants: "Thesis participants",
        thesisParticipantsSub: "{count} missing data",
      },
      quickActions: {
        title: "Quick actions",
        thesisOverview: "Thesis Overview",
        thesisWriter: "Thesis Writer",
        internshipOverview: "Internship Overview",
        testsGrids: "Tests & Grids",
        supervision: "Supervision",
        literature: "Literature",
      },
      thesis: {
        title: "Thesis",
        completeParticipants: "Complete participants",
        completeParticipantsHint: "{missing} missing data",
        reportSections: "Report sections drafted",
        reportSectionsHint: "thesis writer",
        notes: "Notes",
        notesHint: "quote bank · literature",
        variables: "Variables in design",
        variablesHint: "methodology",
        openDashboard: "Dashboard",
        openWriter: "Writer",
      },
      internship: {
        title: "Internship",
        none: "No internship cases yet",
        openStudio: "Open Internship Studio",
        ageMissing: "Age not specified",
        testsGrids: "Tests & Grids",
        supervision: "Supervision",
      },
      supervision: {
        title: "Recent supervision notes",
        allNotes: "All notes",
        none: "No supervision notes yet",
        fallbackLabel: "Supervision note",
      },
      upcoming: {
        title: "Upcoming",
        viewCalendar: "Calendar",
        nextSupervisor: "Next supervisor meeting",
        nextSupervisorHint: "add to calendar",
        weeklySynthesis: "Weekly synthesis due",
        weeklySynthesisHint: "every Sunday",
        finalReport: "Final internship report",
        finalReportHint: "end of placement",
      },
    },
  },

  therapist: {
    dashboard: {
      greetingMorning: "Good morning",
      greetingAfternoon: "Good afternoon",
      greetingEvening: "Good evening",
      subtitle:
        "{active} active cases · {goals} goals in progress",
      subtitleWithReview:
        "{active} active cases · {goals} goals in progress · {review} need review",
      stats: {
        activeCases: "Active Cases",
        activeCasesSub: "{count} need review",
        todayCheckIns: "Today's Check-ins",
        todayCheckInsSub: "logged today",
        goalsInProgress: "Goals In Progress",
        goalsInProgressSub: "{count} achieved",
        assessmentsPending: "Assessments Pending",
        assessmentsPendingSub: "not started",
      },
      quickActions: {
        title: "Quick Actions",
        newCase: "New Case",
        newCheckIn: "Check-in",
        newGoal: "New Goal",
        transcript: "Transcript",
        printGrid: "Print Grid",
        report: "Report",
      },
      sections: {
        recentCases: "Recent Cases",
        goals: "Goals",
        alerts: "Alerts",
        recentActivity: "Recent Activity",
        noActivity: "No activity yet — start by creating a case ✦",
      },
    },
  },

  client: {
    home: {
      title: "Home",
    },
    calendar: {
      title: "Calendar",
      microcopy:
        "Your upcoming sessions, assigned work, and reminders — the next 30 days.",
      summary: {
        upcoming: "Upcoming events",
        newFromTherapist: "New from therapist",
        completed: "Completed assignments",
      },
      empty: "Nothing on the calendar for the next 30 days.",
      emptyHint:
        "Your therapist will assign work and book sessions as you go.",
      today: "TODAY",
      assigned: "Therapist-assigned work",
      acknowledged: "Acknowledged",
      awaiting: "Awaiting your attention",
    },
    assigned: {
      title: "Assigned work",
      microcopy:
        "Material your therapist asked you to work through, between sessions.",
      pending: "Pending",
      done: "Done",
      completed: "Completed",
      emptyPending:
        "Nothing pending. Your therapist will assign material as you go.",
      markDone: "Mark done",
      kinds: {
        workbook: "Workbook",
        assessment: "Assessment",
        card: "Therapeutic card",
        journey: "Therapeutic path",
        note: "Therapist note",
      },
      labels: {
        assessment: "Assessment to complete",
        card: "Therapeutic card",
        note: "Note from your therapist",
      },
    },
  },

  thesis: {
    overview: {
      title: "Thesis dashboard",
      programme: "Programme",
      aim: "Aim",
      problem: "Problem",
      abstract: "Abstract / Summary",
      abstractFR: "Résumé · FR",
      abstractEN: "Abstract · EN",
      abstractDesc: "French and English versions extracted from the thesis.",
      objectivesTitle: "Research objectives",
      objectivesDesc:
        "Four objectives articulating the theoretical, analytical, integrative and empirical dimensions.",
      progressTitle: "Chapter progress",
      progressDesc:
        "Draft status — percentages estimated from the current PFE draft.",
      keywords: "Keywords",
      importData: "Import participant data",
      openWriter: "Open writer",
    },
    chapters: {
      foreword: "Foreword",
      introduction: "General introduction",
      literatureReview: "Literature review",
      methodology: "Methodology",
      results: "Results",
      discussion: "Discussion",
      conclusion: "General conclusion",
      bibliography: "Bibliographic references",
      appendices: "Appendices",
    },
    statistics: {
      title: "Descriptive statistics — protocol (planned n = 50)",
      desc: "Data collection has not started. Values will be computed after administration.",
      plannedN: "planned n",
      range: "Range",
      correlationsTitle: "Planned correlations (H1 & H2)",
      correlationsDesc:
        "Tests to be run after data collection. Statistical framework defined in §5.5.2.",
      threshold: "Threshold",
      expected: "Expected",
      regressionTitle: "Multiple linear regression — H3",
      regressionDesc:
        "Model specification. Estimation to be conducted after data collection (§5.5.3).",
      dependentVariable: "Dependent variable",
      predictors: "Predictors",
      covariates: "Covariates",
      method: "Method",
      postulates: "Postulate checks",
      indicators: "Indicators reported",
    },
    tables: {
      title: "Thesis tables",
      desc: "Variables, analysis plan, and hypothesis ↔ test mapping (Chapter 5).",
      tableLabel: "Table {n} — {caption}",
      noteLabel: "Note. {note}",
    },
    methodology: {
      title: "Methodology",
      sectionsDesc: "Editable sections — populate in the thesis writer.",
    },
    progress: {
      chapter6Note: "Data collection to be carried out.",
      chapter7Note: "Conditional on the analysis of results.",
      conclusionNote: "To be written after the discussion.",
    },
  },

  internship: {
    studio: {
      title: "Internship Studio",
    },
    cases: {
      title: "Internship Cases",
      pageDesc:
        "Every case opened in your supervised internship — anonymized codes, structured profiles, observation grids, tests and reports.",
      active: "Active cases ({count})",
      archived: "Archived ({count})",
      none: "No active internship cases yet.",
      openStudio: "Open Internship Studio",
      archivedLabel: "Archived",
      ageMissing: "Age not specified",
    },
    reports: {
      title: "Internship Reports",
      pageDesc:
        "Daily observations, weekly synthesis, supervision summaries and the final internship report — assembled from your structured case data.",
      drafts: "Drafts ({count})",
      finalized: "Finalized ({count})",
      emptyDrafts:
        "No draft reports. Generate one from a case in the Internship Studio.",
      generateInStudio: "Generate reports in Studio",
      statusDraft: "Draft",
      statusFinalized: "Finalized",
    },
  },

  errors: {
    requiredField: "This field is required.",
    invalidEmail: "Enter a valid email address.",
    unknown: "Something went wrong. Please try again.",
    networkOffline: "You appear to be offline.",
  },

  empty: {
    cases: "No cases yet",
    notes: "No notes yet",
    reports: "No reports yet",
    assessments: "No assessments yet",
    supervision: "No supervision notes yet",
  },

  today: {
    title: "Today",
    empty: "Nothing on deck right now — calm waters.",
    count: "{n} item(s)",
  },

  analysis: {
    title: "Data Analysis",
    subtitle:
      "A focused workspace for the empirical thesis study. Enter respondents, watch descriptives and correlations recompute live, export CSV for cross-checking in Jamovi / JASP.",
    nav: "Data Analysis",
    pinnedNote:
      "Dissociation and depersonalisation cannot be correlated — they are measured on different respondents.",
    counts: {
      total: "Total respondents",
      dissociation: "Dissociation group (n)",
      depersonalisation: "Depersonalisation group (n)",
    },
    entry: {
      title: "Add respondent",
      summary: "One record at a time. All fields validated on entry.",
      age: "Age",
      agePlaceholder: "e.g. 24",
      sex: "Sex",
      sexOptions: {
        f: "Female",
        m: "Male",
        other: "Other",
        undisclosed: "Prefer not to say",
      },
      group: "Group",
      groupOptions: {
        dissociation: "Dissociation",
        depersonalisation: "Depersonalisation",
      },
      phq9: "PHQ-9 total (0–27)",
      gad7: "GAD-7 total (0–21)",
      des: "DES mean score (0–100)",
      cds: "CDS total (0–290)",
      submit: "Add respondent",
      submitting: "Adding…",
    },
    errors: {
      AGE_REQUIRED_INTEGER: "Age must be a whole number.",
      AGE_OUT_OF_RANGE: "Age must be between 0 and 120.",
      SEX_REQUIRED: "Pick a value for sex.",
      GROUP_REQUIRED: "Pick a group.",
      PHQ9_OUT_OF_RANGE: "PHQ-9 must be between 0 and 27.",
      GAD7_OUT_OF_RANGE: "GAD-7 must be between 0 and 21.",
      DES_OUT_OF_RANGE: "DES mean must be between 0 and 100.",
      CDS_OUT_OF_RANGE: "CDS total must be between 0 and 290.",
      DES_NOT_FOR_THIS_GROUP:
        "DES applies only to the dissociation group.",
      CDS_NOT_FOR_THIS_GROUP:
        "CDS applies only to the depersonalisation group.",
    },
    table: {
      title: "Respondents",
      empty: "Collection in progress — no respondents yet.",
      headers: {
        n: "#",
        age: "Age",
        sex: "Sex",
        group: "Group",
        phq9: "PHQ-9",
        gad7: "GAD-7",
        des: "DES",
        cds: "CDS",
        actions: "Actions",
      },
      edit: "Edit",
      remove: "Remove",
      confirmRemove: "Remove this respondent?",
    },
    descriptives: {
      title: "Descriptive statistics",
      desc: "Per scale, per relevant group. Sample SD (n-1). Skewness as the normality indicator.",
      insufficient: "insufficient data",
      headers: {
        scale: "Scale",
        sample: "Sample",
        n: "n",
        mean: "Mean",
        sd: "SD",
        median: "Median",
        min: "Min",
        max: "Max",
        skew: "Skewness",
      },
      labels: {
        phq9All: "PHQ-9 — whole sample",
        gad7All: "GAD-7 — whole sample",
        phq9Diss: "PHQ-9 — dissociation group",
        gad7Diss: "GAD-7 — dissociation group",
        desDiss: "DES — dissociation group",
        phq9Dep: "PHQ-9 — depersonalisation group",
        gad7Dep: "GAD-7 — depersonalisation group",
        cdsDep: "CDS — depersonalisation group",
      },
    },
    correlations: {
      title: "Correlations (Pearson r + Spearman ρ)",
      desc:
        "Two-tailed p-values from the Student t distribution. Each row shows the sample it was computed on.",
      headers: {
        pair: "Pair",
        sample: "Sample",
        n: "n",
        pearsonR: "Pearson r",
        pearsonP: "p (Pearson)",
        spearmanRho: "Spearman ρ",
        spearmanP: "p (Spearman)",
      },
      samples: {
        whole: "Whole sample",
        dissociation: "Dissociation group",
        depersonalisation: "Depersonalisation group",
      },
      pairs: {
        phq9Gad7: "PHQ-9 × GAD-7",
        gad7Des: "GAD-7 × DES",
        phq9Des: "PHQ-9 × DES",
        gad7Cds: "GAD-7 × CDS",
        phq9Cds: "PHQ-9 × CDS",
      },
      insufficient: "insufficient data",
    },
    bands: {
      title: "Clinical bands (descriptive)",
      desc:
        "Count of respondents in each band. No diagnostic claim — bands are for distribution review only.",
      phq9Title: "PHQ-9",
      gad7Title: "GAD-7",
      headers: {
        band: "Band",
        range: "Range",
        count: "n",
      },
      phq9Bands: {
        minimal: "Minimal",
        mild: "Mild",
        moderate: "Moderate",
        "mod-severe": "Moderately severe",
        severe: "Severe",
      },
      gad7Bands: {
        minimal: "Minimal",
        mild: "Mild",
        moderate: "Moderate",
        severe: "Severe",
      },
    },
    export: {
      title: "Export",
      desc: "Canonical artifact for cross-checking in Jamovi / JASP.",
      csvData: "Export dataset CSV",
      csvResults: "Export results summary (CSV)",
      copyResults: "Copy results to clipboard",
      copied: "Copied.",
    },
  },

  seance: {
    title: "Session",
    workspaceTitle: "Session workspace",
    tabLabel: "Sessions",
    newSeance: "New session",
    emptyList: "No sessions for this dossier yet.",
    emptySeance: "Empty session — nothing recorded yet.",
    status: {
      draft: "Draft",
      finalised: "Finalised",
    },
    actions: {
      finalise: "Finalise",
      reopen: "Reopen",
      archive: "Archive",
      restore: "Restore",
      open: "Open",
      backToDossier: "Back to dossier",
    },
    left: {
      title: "Dossier context",
      previousSeances: "Previous sessions",
      noPrevious: "No previous session.",
      concerns: "Presenting concerns",
      followUpReason: "Reason for follow-up",
    },
    center: {
      observationsTitle: "Structured observations",
      observationsSummary: "{n} of {total} domains recorded",
      notesTitle: "Session notes",
      notesSummary: "{n} note(s)",
      addNote: "Add note",
      notePlaceholder: "One discrete note — an event, a reflection, a verbatim…",
      noteTypes: {
        general: "Note",
        reflection: "Reflection",
        incident: "Incident",
        verbatim: "Verbatim",
      },
      categories: {
        communication: "Communication",
        sensory: "Sensory",
        attention: "Attention",
        regulation: "Regulation",
        social: "Social interaction",
      },
      obsNotePlaceholder: "Optional note for this domain…",
    },
    right: {
      title: "Tools & memory",
      linkedAssessments: "Linked assessments / grids",
      linkedWorksheets: "Linked worksheets",
      resources: "Resources",
      openSheet: "Open",
      noAssessments: "No assessment recorded for this dossier.",
      noWorksheets: "No worksheet available.",
      linkedCount: "{n} linked",
    },
    bottom: {
      timelineTitle: "Session timeline",
      homeworkTitle: "Homework",
      followUpsTitle: "Follow-up actions",
      nextAppointmentTitle: "Next appointment",
      addHomework: "Add homework…",
      addFollowUp: "Add follow-up action…",
      appointmentDate: "Date",
      appointmentNote: "Note (optional)",
      noAppointment: "No appointment scheduled.",
      currentMarker: "current",
    },
    assembled: {
      title: "Assembled view",
      desc: "Deterministic formatting of this session's records — no inference, every line traces to something you encoded.",
      copy: "Copy",
      copied: "Copied.",
    },
    notFound: "Session not found.",
    dossierNotFound: "Dossier not found.",
  },

  memory: {
    rail: {
      title: "Working memory",
      empty: "No pins yet",
      count: "{n} pinned",
    },
    empty: {
      title: "The rail is quiet.",
      hint:
        "Pin observations, excerpts, hypotheses and quotes here as you work — they stay with you across the session.",
    },
    kinds: {
      observation: "Observations",
      excerpt: "Excerpts",
      hypothesis: "Hypotheses",
      quote: "Quotes",
      fragment: "Fragments",
      supervision: "Supervision",
      reference: "References",
      paragraph: "Paragraphs",
      sensory: "Sensory notes",
      pattern: "Patterns",
    },
    actions: {
      copy: "Copy to clipboard",
      recolor: "Change colour",
      archive: "Archive",
      remove: "Remove",
      pin: "Pin to memory",
    },
  },
};
