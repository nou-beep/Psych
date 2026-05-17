// Visual session-recap builder. Pure derivation: given a case + its
// session-related artefacts, returns a structured recap with two views
// — one for the client (gentle, simplified) and one for the therapist
// (full structure, linked observations).

import type { LastSessionSummary } from "@/lib/clinical/last-session";
import type { PsyNode } from "@/lib/psy/nodes";
import { analyzeThreads } from "@/lib/psy/threads";

export interface SessionRecapEmotionalShift {
  before: string;
  after: string;
}

export interface SessionRecap {
  caseId: string;
  date: string | null;
  topic: string;
  // Themes named in the session — pulled from any nodes dated on the
  // same day plus the session's reported topic.
  themes: string[];
  // Emotional tone heuristic (calm / charged / heavy / open / mixed)
  emotionalTone: string;
  // Interventions actually used (from the session record).
  interventionsUsed: string[];
  // Goals discussed (from the session plan).
  goalsDiscussed: string[];
  // What was left unresolved.
  unresolvedThreads: string[];
  // Therapist notes (formal).
  therapistNotes: string;
  // Work assigned for between sessions.
  assignedWork: string[];
  // Optional before/after emotional snapshot.
  emotionalShift?: SessionRecapEmotionalShift;

  // Client-facing simplified view
  client: {
    headline: string;
    keyFocusAreas: string[];
    nextSteps: string[];
    reflectionPrompts: string[];
  };
}

export interface SessionRecapInput {
  caseId: string;
  lastSession: LastSessionSummary;
  // Psy nodes dated on the session day (for theme detection).
  sessionDayNodes?: PsyNode[];
  // The clinician's notes paragraph (optional override).
  therapistNotesOverride?: string;
}

function detectEmotionalTone(nodes: PsyNode[]): string {
  if (nodes.length === 0) return "no data";
  const heavyTags = new Set([
    "shame",
    "fragmentation",
    "emotional flooding",
    "panic",
    "shutdown",
    "dissociation",
    "abandonment",
  ]);
  const openTags = new Set([
    "calm",
    "open",
    "trusting",
    "warmth",
    "curious",
    "breakthrough",
  ]);
  let heavy = 0;
  let open = 0;
  for (const n of nodes) {
    for (const t of n.tags) {
      const k = t.toLowerCase();
      if (heavyTags.has(k)) heavy += 1;
      if (openTags.has(k)) open += 1;
    }
  }
  if (heavy === 0 && open === 0) return "neutral";
  if (heavy > open * 1.5) return "heavy";
  if (open > heavy * 1.5) return "open";
  return "mixed";
}

function reflectionPromptsFor(
  themes: string[],
  unresolved: string[]
): string[] {
  const prompts: string[] = [];
  if (unresolved.length > 0) {
    prompts.push(
      `What stayed with you about ${unresolved[0]}?`
    );
  }
  if (themes.length > 0) {
    prompts.push(
      `Where did "${themes[0]}" show up since the session?`
    );
  }
  if (prompts.length === 0) {
    prompts.push("What stayed with you afterwards?");
  }
  return prompts;
}

export function buildSessionRecap(input: SessionRecapInput): SessionRecap {
  const { lastSession } = input;
  const themesFromNodes = analyzeThreads(input.sessionDayNodes ?? [])
    .filter((t) => t.count >= 1)
    .slice(0, 4)
    .map((t) => t.tag);

  const themes = Array.from(
    new Set(
      [
        ...themesFromNodes,
        ...lastSession.topic
          .split(/[·.,;]/)
          .map((s) => s.trim())
          .filter((s) => s && s !== "—"),
      ].slice(0, 6)
    )
  );

  const interventionsUsed = lastSession.interventionsUsed
    .split(/[,;]/)
    .map((s) => s.trim())
    .filter(Boolean);

  const goalsDiscussed = lastSession.unresolvedTopics
    .split(/[·,;]/)
    .map((s) => s.trim())
    .filter(Boolean);

  const unresolvedThreads = goalsDiscussed; // placeholder until session plans differentiate the two

  const emotionalTone = detectEmotionalTone(input.sessionDayNodes ?? []);

  const client = {
    headline: lastSession.topic && lastSession.topic !== "—"
      ? `We focused on ${lastSession.topic.toLowerCase()}.`
      : "Here's a soft recap of your last session.",
    keyFocusAreas: themes.slice(0, 3),
    nextSteps: [
      ...lastSession.assignedWork,
      ...(lastSession.nextSessionFocus
        ? [`Next focus: ${lastSession.nextSessionFocus}`]
        : []),
    ],
    reflectionPrompts: reflectionPromptsFor(themes, unresolvedThreads),
  };

  return {
    caseId: input.caseId,
    date: lastSession.date,
    topic: lastSession.topic,
    themes,
    emotionalTone,
    interventionsUsed,
    goalsDiscussed,
    unresolvedThreads,
    therapistNotes: input.therapistNotesOverride ?? lastSession.emotionalThemes,
    assignedWork: lastSession.assignedWork,
    client,
  };
}

export function emotionalToneColour(tone: string): string {
  switch (tone) {
    case "heavy":
      return "#8B4A66";
    case "open":
      return "#6E8A7B";
    case "mixed":
      return "#B07A4F";
    case "neutral":
      return "#7A6E8A";
    default:
      return "#94A3B8";
  }
}

// Helper used by the client view to pick a soft summary of the tone.
export function emotionalToneCopy(tone: string): string {
  switch (tone) {
    case "heavy":
      return "A heavier session — that's okay.";
    case "open":
      return "An open session — there was room.";
    case "mixed":
      return "A mixed session — there were several layers.";
    case "neutral":
      return "A grounded session.";
    default:
      return "A recent session.";
  }
}

// For the therapist view: not all observations get exposed to the
// client. This helper picks the subset the client sees so the
// "share recap" button can be honest about what's leaving the
// workspace.
export function clientFacingFields(recap: SessionRecap) {
  return {
    headline: recap.client.headline,
    keyFocusAreas: recap.client.keyFocusAreas,
    nextSteps: recap.client.nextSteps,
    reflectionPrompts: recap.client.reflectionPrompts,
    emotionalTone: recap.emotionalTone,
  };
}
