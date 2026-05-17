// Real worksheet library — 10 evidence-informed clinician-usable
// worksheets. Each worksheet has structured sections, a clinician
// view, a client view, and a print view.

export type WorksheetFieldKind =
  | "text" // single-line free text
  | "long" // multi-line free text
  | "slider" // 0–10 numeric slider
  | "scale" // 0–100 numeric (SUDS)
  | "date"
  | "time"
  | "duration"
  | "select" // pre-defined options
  | "tags"; // comma-separated tags

export interface WorksheetField {
  id: string;
  label: string;
  kind: WorksheetFieldKind;
  hint?: string;
  options?: string[]; // for select
  // Visibility — client always sees the worksheet, therapist gets
  // additional fields marked "therapist-only".
  audience?: "both" | "therapist-only" | "client-only";
}

export interface WorksheetSection {
  id: string;
  heading: string;
  description?: string;
  fields: WorksheetField[];
}

export type WorksheetCategory =
  | "cbt"
  | "behavioral-activation"
  | "sleep"
  | "panic"
  | "dissociation"
  | "exposure"
  | "emotion-regulation"
  | "sensory"
  | "session";

export interface WorksheetDefinition {
  id: string;
  title: string;
  category: WorksheetCategory;
  shortName: string;
  description: string;
  evidence: string; // brief note on the empirical context
  sections: WorksheetSection[];
  // Tags for cross-linking with assessments, threads, interventions.
  tags: string[];
}

export const WORKSHEET_LIBRARY: WorksheetDefinition[] = [
  // A. CBT Thought Record
  {
    id: "ws-cbt-thought-record",
    shortName: "Thought Record",
    title: "CBT Thought Record",
    category: "cbt",
    description:
      "Identify a situation, automatic thought, the emotion it generated, evidence for and against, and an alternative reappraisal.",
    evidence:
      "Core CBT technique (Beck, 1979; Greenberger & Padesky, 1995). Strong evidence base across anxiety and depressive presentations.",
    tags: ["cbt", "anxiety", "depression", "rumination"],
    sections: [
      {
        id: "situation",
        heading: "Situation",
        fields: [
          {
            id: "date",
            label: "Date",
            kind: "date",
          },
          {
            id: "context",
            label: "Where were you, with whom, doing what?",
            kind: "long",
          },
        ],
      },
      {
        id: "thought",
        heading: "Automatic thought",
        fields: [
          { id: "thought", label: "What went through your mind?", kind: "long" },
          {
            id: "belief-before",
            label: "How much did you believe it (0–10)?",
            kind: "slider",
          },
        ],
      },
      {
        id: "emotion",
        heading: "Emotion",
        fields: [
          { id: "emotion", label: "Name the emotion", kind: "text" },
          {
            id: "intensity-before",
            label: "Intensity (0–10)",
            kind: "slider",
          },
          {
            id: "body",
            label: "Body sensations",
            kind: "text",
          },
        ],
      },
      {
        id: "evidence",
        heading: "Evidence",
        fields: [
          { id: "for", label: "Evidence FOR the thought", kind: "long" },
          { id: "against", label: "Evidence AGAINST the thought", kind: "long" },
        ],
      },
      {
        id: "reappraisal",
        heading: "Alternative thought",
        fields: [
          {
            id: "alternative",
            label: "A more balanced way of thinking",
            kind: "long",
          },
          {
            id: "belief-after",
            label: "How much do you believe the original thought now (0–10)?",
            kind: "slider",
          },
          {
            id: "intensity-after",
            label: "Emotion intensity after (0–10)",
            kind: "slider",
          },
        ],
      },
      {
        id: "clinician",
        heading: "Clinician notes",
        fields: [
          {
            id: "clinician-note",
            label: "Therapist observations",
            kind: "long",
            audience: "therapist-only",
          },
        ],
      },
    ],
  },

  // B. Behavioral Activation Planner
  {
    id: "ws-ba-planner",
    shortName: "BA planner",
    title: "Behavioral Activation Planner",
    category: "behavioral-activation",
    description:
      "Plan, schedule, and review value-aligned activities; track mood before/after.",
    evidence:
      "Behavioral activation is an evidence-based stand-alone treatment for depression (Jacobson et al., 1996; Dimidjian et al., 2006).",
    tags: ["depression", "withdrawal", "anhedonia", "behavioral-activation"],
    sections: [
      {
        id: "activity",
        heading: "Activity",
        fields: [
          { id: "activity", label: "Activity", kind: "text" },
          {
            id: "category",
            label: "Type",
            kind: "select",
            options: ["Pleasure", "Mastery", "Connection", "Routine", "Other"],
          },
          {
            id: "expected-difficulty",
            label: "Expected difficulty (0–10)",
            kind: "slider",
          },
          {
            id: "expected-pleasure",
            label: "Expected pleasure (0–10)",
            kind: "slider",
          },
        ],
      },
      {
        id: "scheduling",
        heading: "Scheduling",
        fields: [
          { id: "date", label: "Date", kind: "date" },
          { id: "time", label: "Time", kind: "time" },
        ],
      },
      {
        id: "completion",
        heading: "Completion",
        fields: [
          {
            id: "completed",
            label: "Did you do it?",
            kind: "select",
            options: ["Yes", "Partial", "No"],
          },
          {
            id: "mood-before",
            label: "Mood before (0–10)",
            kind: "slider",
          },
          {
            id: "mood-after",
            label: "Mood after (0–10)",
            kind: "slider",
          },
          {
            id: "reflection",
            label: "What did you notice?",
            kind: "long",
          },
        ],
      },
    ],
  },

  // C. Sleep Diary
  {
    id: "ws-sleep-diary",
    shortName: "Sleep diary",
    title: "Sleep Diary",
    category: "sleep",
    description:
      "Daily sleep parameters and lifestyle factors. Used to identify behavioural patterns affecting sleep.",
    evidence:
      "Sleep diary is a standard CBT-I instrument (Carney et al., 2012). Used for monitoring response to insomnia interventions.",
    tags: ["sleep", "insomnia", "cbt-i"],
    sections: [
      {
        id: "timing",
        heading: "Timing",
        fields: [
          { id: "date", label: "Date (morning of)", kind: "date" },
          { id: "bedtime", label: "Bedtime", kind: "time" },
          { id: "wake-time", label: "Wake time", kind: "time" },
          {
            id: "sleep-latency",
            label: "Sleep latency (minutes)",
            kind: "duration",
          },
          {
            id: "night-awakenings",
            label: "Number of awakenings",
            kind: "text",
          },
          {
            id: "total-sleep",
            label: "Estimated total sleep (hours)",
            kind: "duration",
          },
        ],
      },
      {
        id: "quality",
        heading: "Quality",
        fields: [
          {
            id: "sleep-quality",
            label: "Sleep quality (0–10)",
            kind: "slider",
          },
          {
            id: "restorative",
            label: "Felt restored on waking (0–10)",
            kind: "slider",
          },
        ],
      },
      {
        id: "lifestyle",
        heading: "Lifestyle factors",
        fields: [
          {
            id: "caffeine",
            label: "Caffeine after 2pm?",
            kind: "select",
            options: ["No", "Yes — light", "Yes — heavy"],
          },
          {
            id: "screen-use",
            label: "Screen use within 1h of bed",
            kind: "select",
            options: ["No", "Some", "Heavy"],
          },
          {
            id: "alcohol",
            label: "Alcohol that evening",
            kind: "select",
            options: ["No", "1–2 units", "More than 2"],
          },
          { id: "notes", label: "Notes", kind: "long" },
        ],
      },
    ],
  },

  // D. Panic Episode Log
  {
    id: "ws-panic-log",
    shortName: "Panic log",
    title: "Panic Episode Log",
    category: "panic",
    description:
      "Structured record of panic episodes: triggers, sensations, thoughts, behaviours, and recovery.",
    evidence:
      "Panic monitoring is a core component of Clark (1986) and Barlow (2002) panic treatment protocols.",
    tags: ["panic", "anxiety", "exposure"],
    sections: [
      {
        id: "context",
        heading: "Context",
        fields: [
          { id: "date", label: "Date", kind: "date" },
          { id: "time", label: "Time", kind: "time" },
          { id: "trigger", label: "Trigger (if any)", kind: "long" },
        ],
      },
      {
        id: "experience",
        heading: "What happened",
        fields: [
          {
            id: "sensations",
            label: "Physical sensations",
            kind: "long",
            hint: "racing heart, chest tightness, derealization, tingling…",
          },
          { id: "thoughts", label: "Thoughts", kind: "long" },
          { id: "behaviors", label: "What did you do?", kind: "long" },
        ],
      },
      {
        id: "metrics",
        heading: "Metrics",
        fields: [
          {
            id: "intensity",
            label: "Peak intensity (0–10)",
            kind: "slider",
          },
          {
            id: "duration",
            label: "Duration (minutes)",
            kind: "duration",
          },
        ],
      },
      {
        id: "recovery",
        heading: "Recovery",
        fields: [
          {
            id: "safety-behaviors",
            label: "Safety behaviours used",
            kind: "long",
          },
          {
            id: "recovery-strategy",
            label: "What helped you come back",
            kind: "long",
          },
        ],
      },
    ],
  },

  // E. Dissociation / Depersonalization Episode Log
  {
    id: "ws-dpdr-log",
    shortName: "DPDR log",
    title: "Dissociation and Depersonalization Episode Log",
    category: "dissociation",
    description:
      "Structured record of dissociative or depersonalization-derealization episodes. Direct support for thesis-relevant clinical work.",
    evidence:
      "Tracking the phenomenology of DPDR episodes is the foundation of stabilization-phase work (Hunter et al., 2003).",
    tags: ["dpdr", "depersonalization", "derealization", "dissociation", "thesis-relevant"],
    sections: [
      {
        id: "context",
        heading: "Situation",
        fields: [
          { id: "date", label: "Date", kind: "date" },
          { id: "context", label: "Where / what happened just before", kind: "long" },
          { id: "trigger", label: "Trigger (if identifiable)", kind: "text" },
        ],
      },
      {
        id: "experience",
        heading: "Experience",
        fields: [
          {
            id: "depersonalization-intensity",
            label: "Depersonalization intensity (0–10)",
            kind: "slider",
          },
          {
            id: "derealization-intensity",
            label: "Derealization intensity (0–10)",
            kind: "slider",
          },
          {
            id: "emotional-numbness",
            label: "Emotional numbness (0–10)",
            kind: "slider",
          },
          {
            id: "body-detachment",
            label: "Body detachment (0–10)",
            kind: "slider",
          },
          {
            id: "time-distortion",
            label: "Time distortion (0–10)",
            kind: "slider",
          },
        ],
      },
      {
        id: "response",
        heading: "Response",
        fields: [
          {
            id: "grounding-response",
            label: "What grounding did you try?",
            kind: "long",
          },
          {
            id: "effectiveness",
            label: "Was it helpful (0–10)?",
            kind: "slider",
          },
          { id: "notes", label: "Notes", kind: "long" },
        ],
      },
    ],
  },

  // F. Exposure Hierarchy
  {
    id: "ws-exposure-hierarchy",
    shortName: "Exposure",
    title: "Exposure Hierarchy",
    category: "exposure",
    description:
      "Build a ladder of feared situations rated on SUDS, plan graded exposures, record outcomes.",
    evidence:
      "Graded exposure is the most strongly evidenced behavioural treatment for specific phobia, social anxiety, agoraphobia, OCD.",
    tags: ["exposure", "anxiety", "avoidance", "ocd", "specific-phobia"],
    sections: [
      {
        id: "ladder",
        heading: "Ladder (repeat per rung)",
        description:
          "Add one entry per situation, ordered from lowest to highest SUDS.",
        fields: [
          {
            id: "situation",
            label: "Feared situation",
            kind: "long",
          },
          {
            id: "suds-expected",
            label: "Expected SUDS (0–100)",
            kind: "scale",
          },
          {
            id: "avoidance",
            label: "Current avoidance / safety behaviours",
            kind: "long",
          },
        ],
      },
      {
        id: "plan",
        heading: "Planned exposure",
        fields: [
          {
            id: "plan",
            label: "How will the exposure be conducted?",
            kind: "long",
          },
          {
            id: "duration",
            label: "Planned duration",
            kind: "duration",
          },
        ],
      },
      {
        id: "outcome",
        heading: "Outcome",
        fields: [
          {
            id: "suds-peak",
            label: "Peak SUDS during (0–100)",
            kind: "scale",
          },
          {
            id: "suds-end",
            label: "SUDS at end (0–100)",
            kind: "scale",
          },
          {
            id: "learning",
            label: "What did you learn?",
            kind: "long",
          },
        ],
      },
    ],
  },

  // G. Emotion Regulation Log
  {
    id: "ws-emotion-regulation",
    shortName: "Emotion reg",
    title: "Emotion Regulation Log",
    category: "emotion-regulation",
    description:
      "Notice an emotion, locate it in the body, identify the trigger, choose a regulation strategy, rate its effectiveness.",
    evidence:
      "Process-based emotion regulation (Gross, 2015). Used in DBT skills modules and unified-protocol approaches.",
    tags: ["emotion-regulation", "dbt", "dysregulation"],
    sections: [
      {
        id: "emotion",
        heading: "Emotion",
        fields: [
          { id: "emotion", label: "Name the emotion", kind: "text" },
          {
            id: "intensity",
            label: "Intensity (0–10)",
            kind: "slider",
          },
          { id: "body", label: "Where in the body?", kind: "text" },
          { id: "trigger", label: "What triggered it?", kind: "long" },
        ],
      },
      {
        id: "response",
        heading: "Response",
        fields: [
          {
            id: "first-impulse",
            label: "First impulse / urge",
            kind: "text",
          },
          {
            id: "strategy",
            label: "Strategy chosen",
            kind: "select",
            options: [
              "Paced breathing",
              "Grounding",
              "Distress tolerance (TIPP)",
              "Opposite action",
              "Cognitive reappraisal",
              "Acceptance / sitting with",
              "Reaching out",
              "Other",
            ],
          },
          {
            id: "effectiveness",
            label: "How effective (0–10)?",
            kind: "slider",
          },
          { id: "reflection", label: "Reflection", kind: "long" },
        ],
      },
    ],
  },

  // H. Sensory Profile Worksheet
  {
    id: "ws-sensory-profile",
    shortName: "Sensory profile",
    title: "Sensory Profile Worksheet",
    category: "sensory",
    description:
      "Map sensory triggers, typical responses, and accommodations that help.",
    evidence:
      "Sensory processing differences are well documented in ASD and stress-related presentations (Dunn, 1997; Crane, 2009).",
    tags: ["sensory", "autism", "overwhelm", "asd"],
    sections: [
      {
        id: "trigger",
        heading: "Sensory trigger",
        fields: [
          {
            id: "sense",
            label: "Sense involved",
            kind: "select",
            options: ["Sight", "Sound", "Touch", "Smell", "Taste", "Vestibular", "Proprioceptive", "Interoceptive"],
          },
          { id: "trigger", label: "Specific trigger", kind: "long" },
          { id: "environment", label: "Environment", kind: "text" },
        ],
      },
      {
        id: "response",
        heading: "Response",
        fields: [
          { id: "response", label: "What happens for you?", kind: "long" },
          { id: "intensity", label: "Intensity (0–10)", kind: "slider" },
          {
            id: "coping",
            label: "What helped",
            kind: "long",
          },
        ],
      },
      {
        id: "accommodation",
        heading: "Accommodation",
        fields: [
          {
            id: "accommodation",
            label: "What accommodation would help next time?",
            kind: "long",
          },
        ],
      },
    ],
  },

  // I. Session Preparation Sheet
  {
    id: "ws-session-prep",
    shortName: "Session prep",
    title: "Session Preparation Sheet (client-facing)",
    category: "session",
    description:
      "Fill in before a session to bring focused material into the room.",
    evidence:
      "Pre-session preparation supports therapeutic alliance and goal attainment (Tryon & Winograd, 2011).",
    tags: ["session-prep", "client"],
    sections: [
      {
        id: "since",
        heading: "Since the last session",
        fields: [
          { id: "changed", label: "What has changed since last time?", kind: "long" },
          { id: "difficult", label: "What was difficult?", kind: "long" },
          { id: "improved", label: "What improved?", kind: "long" },
        ],
      },
      {
        id: "today",
        heading: "Today",
        fields: [
          {
            id: "discuss",
            label: "What I want to discuss today",
            kind: "long",
          },
          {
            id: "questions",
            label: "Questions for my therapist",
            kind: "long",
          },
          {
            id: "events",
            label: "Important events to mention",
            kind: "long",
          },
        ],
      },
    ],
  },

  // J. Between-Session Reflection
  {
    id: "ws-between-session-reflection",
    shortName: "Reflection",
    title: "Between-Session Reflection",
    category: "session",
    description:
      "What stayed with the client after the session, what they noticed during the week, what they'd like to bring back.",
    evidence:
      "Structured reflective practice strengthens working-through processes (Schön, 1983).",
    tags: ["reflection", "client", "between-sessions"],
    sections: [
      {
        id: "afterwards",
        heading: "After the session",
        fields: [
          {
            id: "stayed",
            label: "What stayed with me after the session?",
            kind: "long",
          },
        ],
      },
      {
        id: "week",
        heading: "During the week",
        fields: [
          { id: "noticed", label: "What I noticed", kind: "long" },
          { id: "avoided", label: "What I avoided", kind: "long" },
        ],
      },
      {
        id: "next",
        heading: "Next session",
        fields: [
          {
            id: "bring-back",
            label: "What I want to bring back",
            kind: "long",
          },
          { id: "notes", label: "Notes", kind: "long" },
        ],
      },
    ],
  },
];

export function findWorksheet(id: string): WorksheetDefinition | undefined {
  return WORKSHEET_LIBRARY.find((w) => w.id === id);
}

export function worksheetsForCategory(
  category: WorksheetCategory
): WorksheetDefinition[] {
  return WORKSHEET_LIBRARY.filter((w) => w.category === category);
}

export function searchWorksheets(query: string): WorksheetDefinition[] {
  const q = query.trim().toLowerCase();
  if (!q) return WORKSHEET_LIBRARY;
  return WORKSHEET_LIBRARY.filter((w) => {
    const hay = `${w.title} ${w.description} ${w.tags.join(" ")} ${w.evidence}`;
    return hay.toLowerCase().includes(q);
  });
}

// Count of fields per worksheet — used in the library card.
export function worksheetFieldCount(w: WorksheetDefinition): number {
  return w.sections.reduce((acc, s) => acc + s.fields.length, 0);
}
