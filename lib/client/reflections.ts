// Client reflection system — clinically realistic reflections the
// client writes between sessions. Four kinds the user requested:
// post-session, "things I forgot to say", emotional reactions, and
// questions for next session.

import { generateId, nowISO } from "@/lib/store";

export type ReflectionKind =
  | "post-session"
  | "forgot-to-say"
  | "emotional-reaction"
  | "question-for-next";

export const REFLECTION_KIND_LABELS: Record<ReflectionKind, string> = {
  "post-session": "Post-session reflection",
  "forgot-to-say": "Things I forgot to say",
  "emotional-reaction": "Emotional reactions",
  "question-for-next": "Questions for next session",
};

export const REFLECTION_KIND_PROMPTS: Record<ReflectionKind, string> = {
  "post-session":
    "What came up afterwards? What is sitting with you from the session?",
  "forgot-to-say":
    "What did you want to say but didn't get to? No need to explain everything.",
  "emotional-reaction":
    "What feelings have moved through you between sessions?",
  "question-for-next":
    "What would you like to bring up next time?",
};

export interface ClientReflection {
  id: string;
  kind: ReflectionKind;
  date: string;
  body: string;
  audioId?: string; // optional voice note id
  linkedSessionId?: string; // optional reference to a planner session id
  visibleToTherapist: boolean; // placeholder — real sync comes later
  createdAt: string;
  updatedAt: string;
}

export const REFLECTIONS_STORAGE_KEY = "psych-client-reflections-v1";

export function emptyReflection(kind: ReflectionKind = "post-session"): ClientReflection {
  const now = nowISO();
  return {
    id: generateId(),
    kind,
    date: new Date().toISOString().split("T")[0],
    body: "",
    visibleToTherapist: false,
    createdAt: now,
    updatedAt: now,
  };
}

export function update(
  r: ClientReflection,
  patch: Partial<ClientReflection>
): ClientReflection {
  return { ...r, ...patch, updatedAt: nowISO() };
}

export function timeline(
  reflections: ClientReflection[]
): ClientReflection[] {
  return [...reflections].sort((a, b) => b.date.localeCompare(a.date));
}

export function reflectionsByKind(
  reflections: ClientReflection[],
  kind: ReflectionKind
): ClientReflection[] {
  return timeline(reflections.filter((r) => r.kind === kind));
}
