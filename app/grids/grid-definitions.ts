// All 8 printable grid template definitions.
// Each grid has columns (for table-type) or sections+items (for checklist-type).

export interface GridDefinition {
  id: string;
  letter: string;
  name: string;
  description: string;
  type: "table" | "checklist";
  columns?: string[];
  sampleRow?: Record<string, string>;
  sections?: { title: string; items: string[] }[];
}

export const GRID_DEFINITIONS: GridDefinition[] = [
  {
    id: "general-observation",
    letter: "A",
    name: "General Observation Grid",
    description: "All-purpose observation tracking across sessions.",
    type: "table",
    columns: ["Date", "Context", "Observed behavior", "Intensity", "Frequency", "Trigger", "Intervention", "Response", "Notes"],
    sampleRow: {
      Date: "15/05/2026",
      Context: "Individual session",
      "Observed behavior": "Example: avoidance when task initiated",
      Intensity: "3/5",
      Frequency: "2×",
      Trigger: "Academic demand",
      Intervention: "Verbal prompt",
      Response: "Partial compliance",
      Notes: "Follow-up needed",
    },
  },
  {
    id: "daily-behavior",
    letter: "B",
    name: "Daily Behavior Tracking Grid",
    description: "Time-based behavior log with antecedents and consequences.",
    type: "table",
    columns: ["Time", "Activity", "Behavior", "Antecedent", "Consequence", "Intensity (1–5)", "Duration", "Notes"],
    sampleRow: {
      Time: "10:30",
      Activity: "Circle time",
      Behavior: "Refusal to participate",
      Antecedent: "Loud noise",
      Consequence: "Redirected to quiet area",
      "Intensity (1–5)": "3",
      Duration: "5 min",
      Notes: "Calmed after 5 min",
    },
  },
  {
    id: "emotional-regulation",
    letter: "C",
    name: "Emotional Regulation Grid",
    description: "Tracks emotional responses and regulation strategies.",
    type: "table",
    columns: ["Date", "Emotion observed", "Regulation level", "Trigger", "Strategy used", "Response", "Follow-up"],
    sampleRow: {
      Date: "15/05/2026",
      "Emotion observed": "Anxiety / worry",
      "Regulation level": "Moderate",
      Trigger: "Upcoming exam",
      "Strategy used": "4-7-8 breathing",
      Response: "Calmed within 3 min",
      "Follow-up": "None needed",
    },
  },
  {
    id: "communication",
    letter: "D",
    name: "Communication Grid",
    description: "Documents communication modes and quality.",
    type: "table",
    columns: ["Date", "Communication mode", "Initiation", "Response", "Clarity", "Interaction quality", "Notes"],
    sampleRow: {
      Date: "15/05/2026",
      "Communication mode": "Verbal",
      Initiation: "Spontaneous",
      Response: "Reciprocal",
      Clarity: "Clear",
      "Interaction quality": "Good",
      Notes: "New vocabulary used",
    },
  },
  {
    id: "social-interaction",
    letter: "E",
    name: "Social Interaction Grid",
    description: "Observes quality and patterns in social engagement.",
    type: "table",
    columns: ["Date", "Context", "Interaction type", "Eye contact", "Turn-taking", "Participation", "Difficulties", "Notes"],
    sampleRow: {
      Date: "15/05/2026",
      Context: "Peer group activity",
      "Interaction type": "Parallel play",
      "Eye contact": "Occasional",
      "Turn-taking": "Emerging",
      Participation: "Partial",
      Difficulties: "Initiating contact",
      Notes: "Progress vs last session",
    },
  },
  {
    id: "sensory-observation",
    letter: "F",
    name: "Sensory Observation Grid",
    description: "Documents sensory reactions and regulation strategies.",
    type: "table",
    columns: ["Date", "Sensory domain", "Reaction observed", "Intensity", "Possible trigger", "Regulation strategy", "Notes"],
    sampleRow: {
      Date: "15/05/2026",
      "Sensory domain": "Auditory",
      "Reaction observed": "Covering ears",
      Intensity: "High",
      "Possible trigger": "Loud bell",
      "Regulation strategy": "Headphones offered",
      Notes: "Accommodation needed",
    },
  },
  {
    id: "clinical-interview",
    letter: "G",
    name: "Clinical Interview Checklist",
    description: "Structured checklist for initial clinical intake.",
    type: "checklist",
    sections: [
      {
        title: "Presenting Concern",
        items: [
          "Main reason for referral / consultation",
          "Duration and onset of presenting concern",
          "Previous episodes or similar history",
          "Client's own description of the concern",
        ],
      },
      {
        title: "History",
        items: [
          "Developmental history (if applicable)",
          "Medical and psychiatric history",
          "Previous psychological or therapeutic interventions",
          "Educational or occupational history",
        ],
      },
      {
        title: "Family Context",
        items: [
          "Family structure and key relationships",
          "Mental health history in family",
          "Significant life events or losses",
          "Support systems available",
        ],
      },
      {
        title: "Emotional & Cognitive Symptoms",
        items: [
          "Mood patterns (low mood, anxiety, irritability)",
          "Cognitive concerns (concentration, memory, rumination)",
          "Sleep and appetite",
          "Energy and motivation",
        ],
      },
      {
        title: "Behavioral Symptoms",
        items: [
          "Behavioral patterns noted by client or others",
          "Avoidance, withdrawal, or impulsivity",
          "Self-regulation difficulties",
          "Substance use or risk behaviors",
        ],
      },
      {
        title: "Risk Assessment",
        items: [
          "Risk factors identified",
          "Protective factors identified",
          "Safety plan discussed (if applicable)",
          "Referral for specialist support considered",
        ],
      },
      {
        title: "Clinical Hypotheses & Follow-Up",
        items: [
          "Initial clinical hypotheses (not diagnoses)",
          "Follow-up questions for next session",
          "Recommended assessment tools",
          "Next steps and action plan",
        ],
      },
    ],
  },
  {
    id: "custom",
    letter: "H",
    name: "Custom Assessment Grid",
    description: "Flexible grid — customize columns for any case need.",
    type: "table",
    columns: ["Date", "Observation area", "Description", "Intensity", "Duration", "Context", "Outcome", "Notes"],
    sampleRow: {
      Date: "15/05/2026",
      "Observation area": "Custom — fill in",
      Description: "Describe your observation",
      Intensity: "1–5",
      Duration: "Minutes",
      Context: "Session context",
      Outcome: "Result observed",
      Notes: "Additional notes",
    },
  },
];
