// Therapy Journeys — multi-step guided emotional experiences.
// Pure data + progress helpers. No timers, no streaks — gentle pacing only.

export type JourneyId =
  | "panic-recovery"
  | "emotional-grounding"
  | "burnout-reset"
  | "emotional-reconnection"
  | "dissociation-stabilization"
  | "sleep-reset"
  | "self-esteem-rebuilding"
  | "sensory-recovery";

export type JourneyStepKind =
  | "intro"
  | "breath"
  | "grounding"
  | "reflection"
  | "card"
  | "rest"
  | "outro";

export interface JourneyStep {
  id: string;
  kind: JourneyStepKind;
  title: string;
  body: string;
  microcopy?: string;
}

export interface Journey {
  id: JourneyId;
  title: string;
  microcopy: string;
  tags: string[];
  steps: JourneyStep[];
}

export const ALL_JOURNEYS: Journey[] = [
  {
    id: "panic-recovery",
    title: "Coming down from panic",
    microcopy: "A soft path back to your body.",
    tags: ["anxiety", "regulation", "breathing"],
    steps: [
      { id: "p1", kind: "intro", title: "You're here.", body: "You don't need to solve anything. Let's slow down together.", microcopy: "No tasks. Just steps." },
      { id: "p2", kind: "breath", title: "Lengthen the exhale.", body: "Breathe in for 4. Out for 6. Repeat a few times — only as much as feels good." },
      { id: "p3", kind: "grounding", title: "Notice the room.", body: "Name three things you can see, two things you can touch, one thing you can hear." },
      { id: "p4", kind: "rest", title: "Rest your shoulders.", body: "Let them drop. Let your jaw unclench a little." },
      { id: "p5", kind: "outro", title: "A softer place.", body: "Panic crested. It will fade. You stayed with yourself." },
    ],
  },
  {
    id: "emotional-grounding",
    title: "Coming back to yourself",
    microcopy: "Gentle anchors when things feel far away.",
    tags: ["depersonalization", "dissociation", "grounding"],
    steps: [
      { id: "g1", kind: "intro", title: "Welcome back.", body: "Even feeling distant is a feeling. It counts." },
      { id: "g2", kind: "grounding", title: "Hold something cool.", body: "Pick up something at room temperature or colder. Hold it for ten seconds." },
      { id: "g3", kind: "grounding", title: "Name where you are.", body: "Say (aloud or silently) the day, the room, and one thing that's true today." },
      { id: "g4", kind: "reflection", title: "What's one degree closer?", body: "Not all the way back — just one degree closer to yourself." },
      { id: "g5", kind: "outro", title: "Slowly is enough.", body: "Connection doesn't have to be sudden." },
    ],
  },
  {
    id: "burnout-reset",
    title: "A softer reset",
    microcopy: "For when everything has been too much.",
    tags: ["burnout", "rest", "low-energy"],
    steps: [
      { id: "b1", kind: "intro", title: "You can stop here.", body: "This is a stopping point — not a productivity break." },
      { id: "b2", kind: "rest", title: "Permission to do less.", body: "Pick one thing you're going to put down today, even for ten minutes." },
      { id: "b3", kind: "reflection", title: "What's left over?", body: "What thought or worry is still loud? Write it once. You don't have to act on it." },
      { id: "b4", kind: "card", title: "A gentle reminder.", body: "You're allowed to take breaks without earning them." },
      { id: "b5", kind: "outro", title: "Small is enough.", body: "A reset doesn't have to be dramatic." },
    ],
  },
  {
    id: "emotional-reconnection",
    title: "Tender reconnection",
    microcopy: "When you've drifted from what you feel.",
    tags: ["depression", "depersonalization", "reflection"],
    steps: [
      { id: "er1", kind: "intro", title: "Gentle hello.", body: "Even noticing you've drifted is a kind of arrival." },
      { id: "er2", kind: "reflection", title: "Where in your body?", body: "Is there anywhere in your body that feels something today? Even a small flicker counts." },
      { id: "er3", kind: "card", title: "Your feeling makes sense.", body: "Even if you can't name where it came from." },
      { id: "er4", kind: "outro", title: "Slowly is enough.", body: "You don't have to feel everything at once." },
    ],
  },
  {
    id: "dissociation-stabilization",
    title: "Soft return",
    microcopy: "When the edges of things blur.",
    tags: ["dissociation", "depersonalization", "grounding"],
    steps: [
      { id: "ds1", kind: "intro", title: "It's okay.", body: "Dissociation is your nervous system protecting you. It is not a failure." },
      { id: "ds2", kind: "grounding", title: "Press into your feet.", body: "Notice the points of contact. Notice the surface beneath you." },
      { id: "ds3", kind: "grounding", title: "Find one edge.", body: "Look at one object. Notice where it begins and where it ends." },
      { id: "ds4", kind: "outro", title: "One degree closer.", body: "Reorientation doesn't have to be complete to be real." },
    ],
  },
  {
    id: "sleep-reset",
    title: "Quieter night",
    microcopy: "A wind-down without pressure.",
    tags: ["sleep", "regulation", "rest"],
    steps: [
      { id: "sl1", kind: "intro", title: "Dim the light.", body: "If you can, soften the light around you." },
      { id: "sl2", kind: "breath", title: "Slower out-breaths.", body: "Breathe in for 4, out for 7. A handful of times — no counting pressure." },
      { id: "sl3", kind: "rest", title: "Let your jaw soften.", body: "Notice where you're holding tension. Let it set down for a while." },
      { id: "sl4", kind: "outro", title: "Not sleep — yet.", body: "Rest counts even when sleep doesn't come." },
    ],
  },
  {
    id: "self-esteem-rebuilding",
    title: "A kinder mirror",
    microcopy: "Small, real, true things.",
    tags: ["self-esteem", "validation", "reflection"],
    steps: [
      { id: "se1", kind: "intro", title: "Slowly.", body: "Self-esteem rebuilds in small, ordinary moments — not big declarations." },
      { id: "se2", kind: "reflection", title: "One small true thing.", body: "Name one true thing about you today. Just one." },
      { id: "se3", kind: "card", title: "What you'd say to a friend.", body: "What would you say to a friend feeling exactly what you're feeling?" },
      { id: "se4", kind: "outro", title: "Small is real.", body: "Small kind thoughts are still kind thoughts." },
    ],
  },
  {
    id: "sensory-recovery",
    title: "Sensory recovery",
    microcopy: "When the world feels too loud.",
    tags: ["sensory", "overwhelm", "regulation"],
    steps: [
      { id: "sn1", kind: "intro", title: "Permission to leave.", body: "If you can, step into a quieter room or close your eyes." },
      { id: "sn2", kind: "grounding", title: "Lower one input.", body: "Turn one sensory input down: dim a light, lower a sound, remove a layer." },
      { id: "sn3", kind: "rest", title: "Hum quietly.", body: "Humming can settle the nervous system. Try it for a few breaths." },
      { id: "sn4", kind: "outro", title: "You can leave again.", body: "Stepping away is a skill, not avoidance." },
    ],
  },
];

export function getJourney(id: JourneyId): Journey | undefined {
  return ALL_JOURNEYS.find((j) => j.id === id);
}

// Progress: which step indices have been completed.
export interface JourneyProgress {
  journeyId: JourneyId;
  completedSteps: string[];
  startedAt: string;
  updatedAt: string;
}

export function totalSteps(j: Journey): number {
  return j.steps.length;
}

export function completedCount(progress: JourneyProgress): number {
  return progress.completedSteps.length;
}

export function percentDone(j: Journey, p: JourneyProgress): number {
  if (j.steps.length === 0) return 0;
  return Math.round((p.completedSteps.length / j.steps.length) * 100);
}

export function nextStep(j: Journey, p: JourneyProgress): JourneyStep | null {
  const done = new Set(p.completedSteps);
  return j.steps.find((s) => !done.has(s.id)) ?? null;
}

export function markStepComplete(
  p: JourneyProgress,
  stepId: string
): JourneyProgress {
  if (p.completedSteps.includes(stepId)) return p;
  return {
    ...p,
    completedSteps: [...p.completedSteps, stepId],
    updatedAt: new Date().toISOString(),
  };
}

export function resetJourney(
  p: JourneyProgress,
  keepStartedAt = true
): JourneyProgress {
  return {
    journeyId: p.journeyId,
    completedSteps: [],
    startedAt: keepStartedAt ? p.startedAt : new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
