import { describe, it, expect } from "vitest";
import { buildMemoryNotes } from "@/lib/client/memory";

describe("buildMemoryNotes", () => {
  it("returns nothing for empty input", () => {
    expect(buildMemoryNotes({})).toEqual([]);
  });

  it("notices a recurring weather only when it appears at least twice in a 3+ history", () => {
    const notes = buildMemoryNotes({
      weatherHistory: ["foggy", "foggy", "open"],
    });
    expect(notes.length).toBeGreaterThanOrEqual(1);
    expect(notes.find((n) => n.id === "freq-weather")).toBeTruthy();
    expect(notes[0].text).toMatch(/foggy/);
  });

  it("does not produce a weather note when the history is too short", () => {
    expect(
      buildMemoryNotes({ weatherHistory: ["foggy", "foggy"] }).find(
        (n) => n.id === "freq-weather"
      )
    ).toBeUndefined();
  });

  it("notices voice reflections only at the 3+ threshold", () => {
    expect(buildMemoryNotes({ audioReflectionCount: 2 })).toEqual([]);
    expect(
      buildMemoryNotes({ audioReflectionCount: 3 }).find((n) => n.id === "voice")
    ).toBeTruthy();
  });

  it("caps the number of notes returned", () => {
    const notes = buildMemoryNotes(
      {
        weatherHistory: ["foggy", "foggy", "foggy"],
        audioReflectionCount: 10,
        groundingUses: 10,
        completedSteps: 10,
        comfortObjectCount: 10,
        lowEnergySessions: 10,
        favouriteDecks: ["a", "b", "c"],
      },
      2
    );
    expect(notes.length).toBe(2);
  });

  it("uses soft, validating tone (no diagnostic vocabulary)", () => {
    const notes = buildMemoryNotes({
      weatherHistory: ["foggy", "foggy", "foggy"],
      groundingUses: 10,
    });
    const forbidden = [
      "disorder",
      "diagnos",
      "symptom",
      "pathology",
      "abnormal",
    ];
    for (const note of notes) {
      for (const word of forbidden) {
        expect(note.text.toLowerCase()).not.toContain(word);
      }
    }
  });
});
