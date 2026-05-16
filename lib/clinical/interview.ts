// Clinical Interview Structuring — structured templates the clinician
// fills in. Each template is a list of sections, each with prompts
// (questions to consider) and a free-text answer field.
//
// Pure data + small helpers. Persistence happens in the UI.

import { generateId, nowISO } from "@/lib/store";

export interface InterviewSection {
  id: string;
  title: string;
  prompts: string[];
  // For specialised templates this section may be the focus area.
  emphasis?: "core" | "trauma" | "anxiety" | "dissociation" | "developmental";
}

export interface InterviewTemplate {
  id: string;
  title: string;
  description: string;
  audience: string;
  sections: InterviewSection[];
}

const CORE_SECTIONS: InterviewSection[] = [
  {
    id: "presenting",
    title: "Presenting complaint",
    prompts: [
      "What brings you in today, in your own words?",
      "When did this start? Is it constant or intermittent?",
      "What helps? What makes it worse?",
    ],
  },
  {
    id: "history-illness",
    title: "History of presenting illness",
    prompts: [
      "Timeline of symptoms — onset, course, recent changes.",
      "Triggers, precipitants, and patterns.",
      "Functional impact across domains.",
    ],
  },
  {
    id: "psychiatric-history",
    title: "Psychiatric history",
    prompts: [
      "Previous diagnoses (if any).",
      "Past treatment — therapy, medication, hospitalization.",
      "Suicide / self-harm history.",
    ],
  },
  {
    id: "medical-history",
    title: "Medical history",
    prompts: [
      "Significant medical conditions.",
      "Current medications and supplements.",
      "Sleep and appetite baseline.",
    ],
  },
  {
    id: "developmental",
    title: "Developmental history",
    prompts: [
      "Early milestones and any concerns reported.",
      "School and learning history.",
      "Significant childhood events.",
    ],
  },
  {
    id: "family-history",
    title: "Family history",
    prompts: [
      "Family psychiatric history.",
      "Family medical history of relevance.",
      "Family relationships — past and present.",
    ],
  },
  {
    id: "education",
    title: "Educational history",
    prompts: [
      "Highest level of education / current studies.",
      "Significant academic experiences (positive and challenging).",
      "Any learning differences identified.",
    ],
  },
  {
    id: "occupation",
    title: "Occupational history",
    prompts: [
      "Current work / role.",
      "Job satisfaction and stressors.",
      "Career changes and gaps.",
    ],
  },
  {
    id: "trauma",
    title: "Trauma history",
    prompts: [
      "Has the client experienced any events that felt life-threatening or deeply unsafe?",
      "Approach with care — let the client set the pace.",
      "Note responses, distress level, and what helped them in past.",
    ],
    emphasis: "trauma",
  },
  {
    id: "substance",
    title: "Substance use",
    prompts: [
      "Current and historical alcohol, tobacco, cannabis, prescription, other substance use.",
      "Patterns, contexts, consequences.",
      "Past attempts to reduce — what helped, what didn't.",
    ],
  },
  {
    id: "sleep",
    title: "Sleep",
    prompts: [
      "Usual bedtime, wake time, total sleep.",
      "Sleep latency, awakenings, restorative quality.",
      "Nightmares or sleep disturbances.",
    ],
  },
  {
    id: "appetite",
    title: "Appetite and eating",
    prompts: [
      "Recent appetite changes.",
      "Relationship with food.",
      "Weight changes (only if relevant and welcome to discuss).",
    ],
  },
  {
    id: "regulation",
    title: "Emotional regulation",
    prompts: [
      "How do strong emotions move through? What helps?",
      "Are there moments when the body feels overwhelming?",
      "Strategies that have worked in the past.",
    ],
  },
  {
    id: "cognition",
    title: "Cognition",
    prompts: [
      "Concentration, memory, decision-making.",
      "Speed of thought, intrusive thoughts.",
      "Recent changes.",
    ],
  },
  {
    id: "social",
    title: "Social functioning",
    prompts: [
      "Quality and breadth of close relationships.",
      "Social engagement vs. avoidance.",
      "Loneliness or isolation.",
    ],
  },
  {
    id: "relationships",
    title: "Interpersonal relationships",
    prompts: [
      "Significant current relationships.",
      "Patterns or recurring dynamics.",
      "Support network composition.",
    ],
  },
  {
    id: "risk",
    title: "Risk assessment",
    prompts: [
      "Current ideation — self-harm, suicide, harm to others.",
      "Plan, intent, means, prior attempts.",
      "Safety plan in place / to be created.",
    ],
  },
  {
    id: "protective",
    title: "Protective factors",
    prompts: [
      "Reasons for living.",
      "People, pets, roles that anchor them.",
      "Future-oriented commitments.",
    ],
  },
  {
    id: "strengths",
    title: "Strengths & resources",
    prompts: [
      "Personal qualities the client identifies.",
      "Coping strategies that have worked.",
      "Communities, faith, or other resources.",
    ],
  },
  {
    id: "previous-treatment",
    title: "Previous treatment",
    prompts: [
      "Past therapy — what worked, what didn't.",
      "Past medication trials.",
      "What they're looking for this time.",
    ],
  },
  {
    id: "medications",
    title: "Medications (placeholder)",
    prompts: [
      "Current psychiatric medications and dosages.",
      "Tolerability and adherence.",
      "Prescriber and last review.",
    ],
  },
];

export const INTAKE_TEMPLATE: InterviewTemplate = {
  id: "intake-general",
  title: "General intake interview",
  description: "Comprehensive intake covering history, current functioning, risk, and resources.",
  audience: "Adult intake",
  sections: CORE_SECTIONS,
};

export const FOLLOW_UP_TEMPLATE: InterviewTemplate = {
  id: "follow-up",
  title: "Follow-up review",
  description:
    "Brief follow-up structure focused on changes since the last session, ongoing risks, and intervention response.",
  audience: "Returning client",
  sections: [
    {
      id: "since-last",
      title: "Since the last session",
      prompts: [
        "Any significant events since last time?",
        "How have you been sleeping / eating / moving?",
        "Changes in mood or energy.",
      ],
    },
    {
      id: "intervention-response",
      title: "Intervention response",
      prompts: [
        "What did you try from our last session?",
        "What was useful? What didn't land?",
        "Anything that surprised you.",
      ],
    },
    {
      id: "risk-update",
      title: "Risk update",
      prompts: [
        "Current ideation, frequency, intensity.",
        "Use of safety plan / supports.",
        "New stressors.",
      ],
    },
    {
      id: "plan",
      title: "Plan for next period",
      prompts: ["Goals for the coming sessions.", "Between-session tasks.", "Resources needed."],
    },
  ],
};

export const ANXIETY_INTAKE: InterviewTemplate = {
  id: "intake-anxiety",
  title: "Anxiety-focused intake",
  description: "Intake with emphasis on anxiety phenomenology, avoidance, and triggers.",
  audience: "Adult or older adolescent with anxiety presentation",
  sections: [
    ...CORE_SECTIONS.slice(0, 4),
    {
      id: "anxiety-phenomenology",
      title: "Anxiety phenomenology",
      prompts: [
        "Where does anxiety live in your body?",
        "What thoughts cycle most?",
        "Physical symptoms — heart, breath, gut, muscle tension.",
      ],
      emphasis: "anxiety",
    },
    {
      id: "avoidance-map",
      title: "Avoidance map",
      prompts: [
        "What have you stopped doing because of anxiety?",
        "What do you do to feel safer in the moment?",
        "Safety behaviours / reassurance-seeking.",
      ],
      emphasis: "anxiety",
    },
    ...CORE_SECTIONS.slice(7),
  ],
};

export const DISSOCIATION_INTAKE: InterviewTemplate = {
  id: "intake-dissociation",
  title: "Dissociation-focused intake",
  description:
    "Intake structure for depersonalization, derealization, and dissociative experiences. Trauma sections are paced carefully.",
  audience: "Client with DPDR or dissociative phenomenology",
  sections: [
    ...CORE_SECTIONS.slice(0, 3),
    {
      id: "dissociation-phenomenology",
      title: "Dissociation phenomenology",
      prompts: [
        "When did you first notice feeling detached / unreal?",
        "How does it begin? How does it end?",
        "What makes it more or less intense?",
      ],
      emphasis: "dissociation",
    },
    {
      id: "embodiment",
      title: "Embodiment",
      prompts: [
        "How connected do you feel to your body day-to-day?",
        "Where does the disconnection live most strongly?",
        "What helps you feel a degree more present?",
      ],
      emphasis: "dissociation",
    },
    ...CORE_SECTIONS.slice(8),
  ],
};

export const DEVELOPMENTAL_INTAKE: InterviewTemplate = {
  id: "intake-developmental",
  title: "Developmental / neurodevelopmental intake",
  description:
    "Intake emphasising developmental history, sensory experience, and neurodivergent context.",
  audience: "Older child / adolescent / adult with neurodevelopmental query",
  sections: [
    CORE_SECTIONS[0], // presenting
    {
      id: "developmental-detailed",
      title: "Detailed developmental history",
      prompts: [
        "Pregnancy, birth, early milestones.",
        "Sensory experiences (lights, sound, touch, taste).",
        "Friendships and play in early years.",
        "Routine and predictability needs.",
      ],
      emphasis: "developmental",
    },
    {
      id: "school-experience",
      title: "School / learning experience",
      prompts: [
        "Strengths and challenges across school years.",
        "Diagnoses or supports received.",
        "Bullying or social difficulty.",
      ],
    },
    {
      id: "sensory-profile",
      title: "Sensory profile",
      prompts: [
        "Sensory inputs that are difficult.",
        "Sensory inputs that regulate.",
        "Routines and rituals that help.",
      ],
      emphasis: "developmental",
    },
    ...CORE_SECTIONS.slice(8),
  ],
};

export const INTERVIEW_TEMPLATES: InterviewTemplate[] = [
  INTAKE_TEMPLATE,
  FOLLOW_UP_TEMPLATE,
  ANXIETY_INTAKE,
  DISSOCIATION_INTAKE,
  DEVELOPMENTAL_INTAKE,
];

// ─── Saved interviews ───────────────────────────────────────────

export interface SavedInterview {
  id: string;
  templateId: string;
  caseId?: string;
  date: string;
  answers: Record<string, string>; // keyed by section id
  clinicianNotes: string;
  createdAt: string;
  updatedAt: string;
}

export const INTERVIEW_STORAGE_KEY = "psych-clinical-interviews-v1";

export function emptyInterview(
  templateId: string,
  caseId?: string
): SavedInterview {
  return {
    id: generateId(),
    templateId,
    caseId,
    date: new Date().toISOString().split("T")[0],
    answers: {},
    clinicianNotes: "",
    createdAt: nowISO(),
    updatedAt: nowISO(),
  };
}

export function setAnswer(
  interview: SavedInterview,
  sectionId: string,
  text: string
): SavedInterview {
  return {
    ...interview,
    answers: { ...interview.answers, [sectionId]: text },
    updatedAt: nowISO(),
  };
}

export function findTemplate(id: string): InterviewTemplate | undefined {
  return INTERVIEW_TEMPLATES.find((t) => t.id === id);
}

// Comparison: which sections changed between intake and follow-up.
export function diffInterviews(
  a: SavedInterview,
  b: SavedInterview,
  template: InterviewTemplate
): Array<{ sectionId: string; sectionTitle: string; before: string; after: string }> {
  const out: Array<{ sectionId: string; sectionTitle: string; before: string; after: string }> = [];
  for (const s of template.sections) {
    const av = (a.answers[s.id] ?? "").trim();
    const bv = (b.answers[s.id] ?? "").trim();
    if (av !== bv) out.push({ sectionId: s.id, sectionTitle: s.title, before: av, after: bv });
  }
  return out;
}
