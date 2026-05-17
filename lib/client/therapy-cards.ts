// Therapeutic Cards — soft decks of single-sentence supports.
// Pure data + draw / shuffle logic; the UI does the animation.

export type CardDeck =
  | "grounding"
  | "coping"
  | "validation"
  | "nervous-system"
  | "self-soothing"
  | "journaling"
  | "reflection"
  | "reassurance"
  | "sensory"
  | "reminders";

export interface TherapyCard {
  id: string;
  deck: CardDeck;
  prompt: string;
  microcopy?: string;
  tags: string[];
}

export const DECK_LABELS: Record<CardDeck, string> = {
  grounding: "Grounding",
  coping: "Coping",
  validation: "Emotional validation",
  "nervous-system": "Nervous system",
  "self-soothing": "Self-soothing",
  journaling: "Journaling prompts",
  reflection: "Emotional reflection",
  reassurance: "Reassurance",
  sensory: "Sensory grounding",
  reminders: "Gentle reminders",
};

// Curated deck. Add freely — no UI changes required, the deck adapts.
export const ALL_CARDS: TherapyCard[] = [
  // Grounding
  { id: "g1", deck: "grounding", prompt: "Notice five things you can see right now.", tags: ["sensory", "grounding", "anchor"] },
  { id: "g2", deck: "grounding", prompt: "Press your feet into the floor and feel the contact.", tags: ["sensory", "grounding", "body"] },
  { id: "g3", deck: "grounding", prompt: "Hold something cold for a few seconds — describe its temperature.", tags: ["sensory", "depersonalization"] },
  { id: "g4", deck: "grounding", prompt: "Name the room you are in, the day, and one thing you can hear.", tags: ["grounding", "depersonalization", "anchor"] },

  // Coping
  { id: "c1", deck: "coping", prompt: "It is okay to do less today. Less is not lazy.", tags: ["low-energy", "rest", "shame"] },
  { id: "c2", deck: "coping", prompt: "Pick the smallest possible next step. Just one.", tags: ["overwhelm", "anxiety"] },
  { id: "c3", deck: "coping", prompt: "You don't have to solve this right now.", tags: ["overwhelm", "anxiety", "stress"] },

  // Validation
  { id: "v1", deck: "validation", prompt: "Your feeling makes sense, even if you can't name where it came from.", tags: ["validation", "depersonalization"] },
  { id: "v2", deck: "validation", prompt: "Being overwhelmed is information, not failure.", tags: ["overwhelm", "validation"] },
  { id: "v3", deck: "validation", prompt: "You're allowed to feel two opposite things at the same time.", tags: ["validation", "regulation"] },

  // Nervous system
  { id: "ns1", deck: "nervous-system", prompt: "Lengthen the exhale: in for 4, out for 6.", tags: ["breathing", "regulation", "anxiety"] },
  { id: "ns2", deck: "nervous-system", prompt: "Place a hand on your chest and feel it rise and fall.", tags: ["regulation", "body"] },
  { id: "ns3", deck: "nervous-system", prompt: "Hum quietly for a few breaths — it can soothe the vagus nerve.", tags: ["regulation", "sensory"] },

  // Self-soothing
  { id: "ss1", deck: "self-soothing", prompt: "Wrap yourself in something soft. Stay there for a minute.", tags: ["sensory", "rest", "comfort"] },
  { id: "ss2", deck: "self-soothing", prompt: "Make warm water touch your hands.", tags: ["sensory", "comfort"] },

  // Journaling prompts
  { id: "j1", deck: "journaling", prompt: "What's taking up the most space in you today?", tags: ["reflection", "creative"] },
  { id: "j2", deck: "journaling", prompt: "If today had a weather, what would it be?", tags: ["reflection", "creative"] },
  { id: "j3", deck: "journaling", prompt: "What is one thing that has felt gentler this week?", tags: ["reflection", "rest"] },

  // Reflection
  { id: "r1", deck: "reflection", prompt: "What kindness could you offer yourself right now that you'd offer a friend?", tags: ["validation", "reflection"] },
  { id: "r2", deck: "reflection", prompt: "Where in your body is the feeling living right now?", tags: ["body", "reflection"] },

  // Reassurance
  { id: "re1", deck: "reassurance", prompt: "This feeling is not forever, even though it feels endless.", tags: ["validation", "depression"] },
  { id: "re2", deck: "reassurance", prompt: "Coming back to this app counts. You are still showing up.", tags: ["reassurance"] },

  // Sensory grounding
  { id: "s1", deck: "sensory", prompt: "Find one texture in the room and describe it in three words.", tags: ["sensory", "grounding"] },
  { id: "s2", deck: "sensory", prompt: "Smell something familiar — a candle, soap, a hand cream.", tags: ["sensory", "grounding", "anchor"] },

  // Reminders
  { id: "rm1", deck: "reminders", prompt: "You are allowed to take breaks without earning them.", tags: ["rest", "shame"] },
  { id: "rm2", deck: "reminders", prompt: "You are doing okay, even when it doesn't feel like it.", tags: ["reassurance"] },
];

// Filter helpers.
export function cardsInDeck(deck: CardDeck): TherapyCard[] {
  return ALL_CARDS.filter((c) => c.deck === deck);
}

export function cardsByIds(ids: string[]): TherapyCard[] {
  const set = new Set(ids);
  return ALL_CARDS.filter((c) => set.has(c.id));
}

// Fisher–Yates shuffle (deterministic when given a seeded random).
export function shuffleCards(
  cards: TherapyCard[],
  rng: () => number = Math.random
): TherapyCard[] {
  const out = [...cards];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

// Draw one card. If `avoidIds` is provided, prefers cards not in that set;
// only repeats when there are no fresh cards left.
export function drawCard(
  cards: TherapyCard[],
  avoidIds: string[] = [],
  rng: () => number = Math.random
): TherapyCard | null {
  if (cards.length === 0) return null;
  const avoid = new Set(avoidIds);
  const fresh = cards.filter((c) => !avoid.has(c.id));
  const pool = fresh.length > 0 ? fresh : cards;
  return pool[Math.floor(rng() * pool.length)];
}
