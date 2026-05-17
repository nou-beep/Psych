// Emotional Weather — a soft, non-clinical taxonomy for how a moment feels.
// Each state has visuals (gradient, particles), supportive copy, and gentle
// suggestions. Pure data + helpers; the UI applies it.

export type EmotionalWeather =
  | "foggy"
  | "stormy"
  | "static"
  | "crowded"
  | "floating"
  | "disconnected"
  | "blurry"
  | "underwater"
  | "frozen"
  | "heavy"
  | "loud"
  | "numb"
  | "open";

export interface WeatherMeta {
  id: EmotionalWeather;
  label: string;
  microcopy: string;
  gradient: { from: string; to: string };
  particleStyle: "soft-dots" | "drops" | "sparks" | "fog" | "still" | "ripples";
  motionLevel: "calm" | "still" | "drifting" | "active";
  suggestionTags: string[]; // hints for which workbooks/cards/grounding tools to suggest
}

export const WEATHER_META: Record<EmotionalWeather, WeatherMeta> = {
  foggy: {
    id: "foggy",
    label: "Foggy",
    microcopy: "Things feel a little out of focus.",
    gradient: { from: "#E6E9EF", to: "#F0E9F5" },
    particleStyle: "fog",
    motionLevel: "drifting",
    suggestionTags: ["grounding", "sensory", "depersonalization"],
  },
  stormy: {
    id: "stormy",
    label: "Stormy",
    microcopy: "There's a lot moving inside.",
    gradient: { from: "#C7CFE0", to: "#7E8AAA" },
    particleStyle: "drops",
    motionLevel: "active",
    suggestionTags: ["regulation", "anxiety", "breathing"],
  },
  static: {
    id: "static",
    label: "Static",
    microcopy: "A quiet noise that won't settle.",
    gradient: { from: "#E8E3F0", to: "#D6D0E0" },
    particleStyle: "sparks",
    motionLevel: "active",
    suggestionTags: ["sensory", "grounding"],
  },
  crowded: {
    id: "crowded",
    label: "Crowded",
    microcopy: "Too many things asking for attention.",
    gradient: { from: "#F4E6E0", to: "#E0D0E8" },
    particleStyle: "soft-dots",
    motionLevel: "active",
    suggestionTags: ["overwhelm", "breathing", "stress"],
  },
  floating: {
    id: "floating",
    label: "Floating",
    microcopy: "A little untethered today.",
    gradient: { from: "#E5F0F7", to: "#F0E8F5" },
    particleStyle: "soft-dots",
    motionLevel: "drifting",
    suggestionTags: ["grounding", "depersonalization", "anchor"],
  },
  disconnected: {
    id: "disconnected",
    label: "Disconnected",
    microcopy: "Far from yourself, maybe.",
    gradient: { from: "#DDE3EC", to: "#E5DDEC" },
    particleStyle: "still",
    motionLevel: "still",
    suggestionTags: ["dissociation", "depersonalization", "grounding"],
  },
  blurry: {
    id: "blurry",
    label: "Blurry",
    microcopy: "Hard to find an edge to anything.",
    gradient: { from: "#F0EAF0", to: "#E6E8F0" },
    particleStyle: "fog",
    motionLevel: "drifting",
    suggestionTags: ["grounding", "depersonalization"],
  },
  underwater: {
    id: "underwater",
    label: "Underwater",
    microcopy: "Everything is muffled and slow.",
    gradient: { from: "#CCE0EA", to: "#A8C5D9" },
    particleStyle: "ripples",
    motionLevel: "drifting",
    suggestionTags: ["depression", "low-energy", "grounding"],
  },
  frozen: {
    id: "frozen",
    label: "Frozen",
    microcopy: "Stuck in place. That's okay.",
    gradient: { from: "#E3ECF0", to: "#CDD9DD" },
    particleStyle: "still",
    motionLevel: "still",
    suggestionTags: ["low-energy", "regulation", "grounding"],
  },
  heavy: {
    id: "heavy",
    label: "Heavy",
    microcopy: "Carrying something today.",
    gradient: { from: "#D8CCE0", to: "#B7A8C8" },
    particleStyle: "still",
    motionLevel: "still",
    suggestionTags: ["depression", "low-energy", "rest"],
  },
  loud: {
    id: "loud",
    label: "Loud",
    microcopy: "It's hard to hear yourself.",
    gradient: { from: "#F5D4D4", to: "#E8AAA3" },
    particleStyle: "sparks",
    motionLevel: "active",
    suggestionTags: ["overwhelm", "sensory", "anxiety"],
  },
  numb: {
    id: "numb",
    label: "Numb",
    microcopy: "Not much, in any direction.",
    gradient: { from: "#E8E8E8", to: "#D4D4D4" },
    particleStyle: "still",
    motionLevel: "still",
    suggestionTags: ["depression", "depersonalization", "rest"],
  },
  open: {
    id: "open",
    label: "Open",
    microcopy: "Some space to be here today.",
    gradient: { from: "#F5E6F0", to: "#E0E6F5" },
    particleStyle: "soft-dots",
    motionLevel: "calm",
    suggestionTags: ["reflection", "creative", "connection"],
  },
};

export const ALL_WEATHERS: EmotionalWeather[] = Object.keys(
  WEATHER_META
) as EmotionalWeather[];

export function getWeatherMeta(w: EmotionalWeather): WeatherMeta {
  return WEATHER_META[w];
}

// Suggest tags for the suggestion pipeline (cards / workbooks / grounding).
export function suggestionTagsFor(w: EmotionalWeather | null): string[] {
  if (!w) return [];
  return WEATHER_META[w]?.suggestionTags ?? [];
}

// Score how well a content item (with its own tags) matches a weather.
// Pure ranker used by the card / workbook / journey suggestion lists.
export function matchScore(itemTags: string[], weather: EmotionalWeather | null): number {
  if (!weather) return 0;
  const want = new Set(suggestionTagsFor(weather));
  let score = 0;
  for (const t of itemTags) {
    if (want.has(t)) score += 1;
  }
  return score;
}

export function rankByWeather<T extends { tags?: string[] }>(
  items: T[],
  weather: EmotionalWeather | null
): T[] {
  if (!weather) return items;
  return [...items].sort(
    (a, b) =>
      matchScore(b.tags ?? [], weather) - matchScore(a.tags ?? [], weather)
  );
}
