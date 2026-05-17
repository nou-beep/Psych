// Therapy Memory — gentle observations from saved client activity.
// Pure function. Returns a small set of "noticings" written in soft,
// non-clinical language. Never diagnoses, never extrapolates, never asks
// "why."

import type { EmotionalWeather } from "@/lib/client/emotional-weather";

export interface MemoryInput {
  // Recent emotional weather entries (newest last is fine — we don't care).
  weatherHistory?: EmotionalWeather[];
  // Number of audio/voice reflections the user has saved.
  audioReflectionCount?: number;
  // Number of completed journey steps in the last 30 days.
  completedSteps?: number;
  // IDs of decks the user has favourited cards from.
  favouriteDecks?: string[];
  // Number of comfort objects saved.
  comfortObjectCount?: number;
  // Number of grounding tool uses (any kind).
  groundingUses?: number;
  // Number of low-energy sessions (when low-energy mode is on).
  lowEnergySessions?: number;
}

export interface MemoryNote {
  id: string;
  text: string;
  tone: "warm" | "soft" | "gentle";
}

// Returns at most `max` notes. Always returns 0–max items. Empty inputs
// produce zero notes — the UI is responsible for handling that case.
export function buildMemoryNotes(
  input: MemoryInput,
  max: number = 3
): MemoryNote[] {
  const notes: MemoryNote[] = [];
  const history = input.weatherHistory ?? [];

  // Most-frequent weather.
  if (history.length >= 3) {
    const counts: Partial<Record<EmotionalWeather, number>> = {};
    for (const w of history) counts[w] = (counts[w] ?? 0) + 1;
    let best: EmotionalWeather | null = null;
    let bestCount = 0;
    for (const w of Object.keys(counts) as EmotionalWeather[]) {
      const c = counts[w] ?? 0;
      if (c > bestCount) {
        bestCount = c;
        best = w;
      }
    }
    if (best && bestCount >= 2) {
      notes.push({
        id: "freq-weather",
        tone: "soft",
        text: `Lately, "${best}" keeps showing up. That's worth noticing — softly.`,
      });
    }
  }

  if ((input.audioReflectionCount ?? 0) >= 3) {
    notes.push({
      id: "voice",
      tone: "warm",
      text: "Voice reflections seem to come easier than written ones on some days. Whatever lands is enough.",
    });
  }

  if ((input.groundingUses ?? 0) >= 5) {
    notes.push({
      id: "grounding",
      tone: "warm",
      text: "Grounding tools have been a steady companion. Thank you for coming back.",
    });
  }

  if ((input.completedSteps ?? 0) >= 5) {
    notes.push({
      id: "journeys",
      tone: "warm",
      text: "You've moved through several journey steps. Each one was a soft yes.",
    });
  }

  if ((input.comfortObjectCount ?? 0) >= 3) {
    notes.push({
      id: "comfort",
      tone: "gentle",
      text: "Your comfort shelf is growing. Anchors don't have to be loud to count.",
    });
  }

  if ((input.lowEnergySessions ?? 0) >= 3) {
    notes.push({
      id: "low-energy",
      tone: "gentle",
      text: "You've used Low Energy mode a few times. Less is enough on those days.",
    });
  }

  if ((input.favouriteDecks ?? []).length >= 2) {
    notes.push({
      id: "decks",
      tone: "warm",
      text: "A few card decks seem to be home base. Returning is its own kind of healing.",
    });
  }

  return notes.slice(0, max);
}
