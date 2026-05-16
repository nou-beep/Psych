// Interactive client workbooks — structured emotional exercises with
// pure-data shape so the UI can render them without any business logic.

export type WorkbookKind =
  | "before-after"
  | "thought-cards"
  | "emotion-slider"
  | "body-map"
  | "free-write";

export interface WorkbookStep {
  id: string;
  kind: WorkbookKind;
  title: string;
  prompt: string;
  microcopy?: string;
}

export interface ClientWorkbook {
  id: string;
  title: string;
  category:
    | "anxiety"
    | "depression"
    | "grounding"
    | "regulation"
    | "dissociation"
    | "dpdr"
    | "self-esteem"
    | "burnout"
    | "stress"
    | "sensory"
    | "reconnection"
    | "identity";
  microcopy: string;
  tags: string[];
  steps: WorkbookStep[];
}

export const ALL_WORKBOOKS: ClientWorkbook[] = [
  {
    id: "wb-anxiety-grounding",
    title: "Soft grounding for anxiety",
    category: "anxiety",
    microcopy: "Six gentle steps. You don't have to finish.",
    tags: ["anxiety", "grounding", "breathing"],
    steps: [
      { id: "s1", kind: "before-after", title: "Right now", prompt: "Move this slider to where your distress is right now.", microcopy: "Honest is enough." },
      { id: "s2", kind: "free-write", title: "What's loud?", prompt: "What's been loudest inside today?" },
      { id: "s3", kind: "emotion-slider", title: "Intensity", prompt: "How intense is the loudest feeling?" },
      { id: "s4", kind: "thought-cards", title: "Pick a thought", prompt: "Which of these is closest to a thought you keep having?" },
      { id: "s5", kind: "free-write", title: "Reframe", prompt: "What's a kinder thing you'd say to a friend who felt this way?" },
      { id: "s6", kind: "before-after", title: "Now", prompt: "Where is your distress now?" },
    ],
  },
  {
    id: "wb-dpdr",
    title: "When everything feels far",
    category: "dpdr",
    microcopy: "For depersonalization or derealization days.",
    tags: ["depersonalization", "grounding", "sensory"],
    steps: [
      { id: "s1", kind: "before-after", title: "Distance", prompt: "How far from yourself do you feel?" },
      { id: "s2", kind: "body-map", title: "Body map", prompt: "Where in your body does the distance live?" },
      { id: "s3", kind: "thought-cards", title: "A reassurance", prompt: "Pick a card you can sit with." },
      { id: "s4", kind: "free-write", title: "One degree closer", prompt: "What's one small thing that might make you a degree closer?" },
      { id: "s5", kind: "before-after", title: "Distance now", prompt: "Where is the distance now?" },
    ],
  },
  {
    id: "wb-burnout",
    title: "Quieter reset",
    category: "burnout",
    microcopy: "For when everything has been too much.",
    tags: ["burnout", "rest", "low-energy"],
    steps: [
      { id: "s1", kind: "free-write", title: "What's left over?", prompt: "What's still loud that you'd like to put down today?" },
      { id: "s2", kind: "thought-cards", title: "A reminder", prompt: "Choose one reminder to hold." },
      { id: "s3", kind: "free-write", title: "One thing to put down", prompt: "What's one thing you give yourself permission to leave undone today?" },
    ],
  },
  {
    id: "wb-self-esteem",
    title: "Small true things",
    category: "self-esteem",
    microcopy: "Self-esteem rebuilds in tiny moments.",
    tags: ["self-esteem", "reflection"],
    steps: [
      { id: "s1", kind: "free-write", title: "One true thing", prompt: "Name one small true thing about you today." },
      { id: "s2", kind: "free-write", title: "What you'd say", prompt: "What would you say to a friend in your exact situation?" },
      { id: "s3", kind: "thought-cards", title: "A kindness", prompt: "Choose a card you could offer yourself." },
    ],
  },
  {
    id: "wb-sensory",
    title: "Sensory recovery",
    category: "sensory",
    microcopy: "When the world feels too loud.",
    tags: ["sensory", "overwhelm", "regulation"],
    steps: [
      { id: "s1", kind: "emotion-slider", title: "Sensory load", prompt: "How loud is it (in any sense)?" },
      { id: "s2", kind: "free-write", title: "One input to lower", prompt: "What's one input you can turn down?" },
      { id: "s3", kind: "before-after", title: "Now", prompt: "After lowering, where is the load?" },
    ],
  },
  {
    id: "wb-emotional-reg",
    title: "Riding a wave",
    category: "regulation",
    microcopy: "Sitting with a wave until it passes.",
    tags: ["regulation", "validation"],
    steps: [
      { id: "s1", kind: "emotion-slider", title: "Where is the wave?", prompt: "How tall is the wave right now?" },
      { id: "s2", kind: "body-map", title: "Where in the body?", prompt: "Where do you feel it?" },
      { id: "s3", kind: "free-write", title: "What it might need", prompt: "What does this feeling need? Expression? Comfort? Space?" },
    ],
  },
];

// Used by the cards prompt in workbook steps.
export const SAMPLE_THOUGHT_CARDS = [
  "This will pass, even though it feels endless.",
  "Being overwhelmed is information, not failure.",
  "I'm allowed to do less today.",
  "I don't have to solve this right now.",
  "My feeling makes sense, even if I can't name where it came from.",
  "Small kind thoughts are still kind thoughts.",
];

// Progress shape — stored in localStorage per workbook id.
export interface WorkbookProgress {
  workbookId: string;
  // Free-form payload per step. Keyed by step id.
  answers: Record<
    string,
    {
      text?: string;
      sliderBefore?: number;
      sliderAfter?: number;
      bodyMap?: string[];
      chosenCard?: string;
    }
  >;
  startedAt: string;
  updatedAt: string;
  completed: boolean;
}

export function emptyProgress(workbookId: string): WorkbookProgress {
  const now = new Date().toISOString();
  return {
    workbookId,
    answers: {},
    startedAt: now,
    updatedAt: now,
    completed: false,
  };
}

export function setAnswer(
  progress: WorkbookProgress,
  stepId: string,
  patch: Partial<WorkbookProgress["answers"][string]>
): WorkbookProgress {
  return {
    ...progress,
    answers: {
      ...progress.answers,
      [stepId]: { ...(progress.answers[stepId] ?? {}), ...patch },
    },
    updatedAt: new Date().toISOString(),
  };
}

export function markCompleted(progress: WorkbookProgress): WorkbookProgress {
  return { ...progress, completed: true, updatedAt: new Date().toISOString() };
}

export function getWorkbook(id: string): ClientWorkbook | undefined {
  return ALL_WORKBOOKS.find((w) => w.id === id);
}

export function percentCompleted(
  wb: ClientWorkbook,
  p: WorkbookProgress
): number {
  if (wb.steps.length === 0) return 0;
  const touched = wb.steps.filter((s) => p.answers[s.id]).length;
  return Math.round((touched / wb.steps.length) * 100);
}
