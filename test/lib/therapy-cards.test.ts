import { describe, it, expect } from "vitest";
import {
  ALL_CARDS,
  DECK_LABELS,
  cardsInDeck,
  cardsByIds,
  shuffleCards,
  drawCard,
  type TherapyCard,
} from "@/lib/client/therapy-cards";

describe("deck data", () => {
  it("every card has an id, deck, prompt, and tags", () => {
    for (const c of ALL_CARDS) {
      expect(c.id).toBeTruthy();
      expect(c.deck).toBeTruthy();
      expect(c.prompt.length).toBeGreaterThan(0);
      expect(Array.isArray(c.tags)).toBe(true);
    }
  });

  it("every deck used by a card has a human label", () => {
    const decksInData = Array.from(new Set(ALL_CARDS.map((c) => c.deck)));
    for (const d of decksInData) {
      expect(DECK_LABELS[d]).toBeTruthy();
    }
  });

  it("cardsInDeck filters to that deck only", () => {
    const grounding = cardsInDeck("grounding");
    expect(grounding.length).toBeGreaterThan(0);
    expect(grounding.every((c) => c.deck === "grounding")).toBe(true);
  });
});

describe("cardsByIds", () => {
  it("returns the cards in the original deck order", () => {
    const ids = ALL_CARDS.slice(0, 3).map((c) => c.id);
    expect(cardsByIds(ids).map((c) => c.id)).toEqual(ids);
  });
});

describe("shuffleCards", () => {
  it("returns the same set of cards", () => {
    const shuffled = shuffleCards(ALL_CARDS);
    expect(shuffled.length).toBe(ALL_CARDS.length);
    expect(new Set(shuffled.map((c) => c.id))).toEqual(
      new Set(ALL_CARDS.map((c) => c.id))
    );
  });

  it("is deterministic with a seeded RNG", () => {
    const seed = () => {
      let s = 42;
      return () => {
        s = (s * 9301 + 49297) % 233280;
        return s / 233280;
      };
    };
    const a = shuffleCards(ALL_CARDS, seed());
    const b = shuffleCards(ALL_CARDS, seed());
    expect(a.map((c) => c.id)).toEqual(b.map((c) => c.id));
  });

  it("does not mutate the input", () => {
    const input = [...ALL_CARDS];
    const before = input.map((c) => c.id);
    shuffleCards(input);
    expect(input.map((c) => c.id)).toEqual(before);
  });
});

describe("drawCard", () => {
  const small: TherapyCard[] = [
    { id: "a", deck: "grounding", prompt: "A", tags: [] },
    { id: "b", deck: "grounding", prompt: "B", tags: [] },
    { id: "c", deck: "grounding", prompt: "C", tags: [] },
  ];

  it("returns null when the deck is empty", () => {
    expect(drawCard([])).toBeNull();
  });

  it("returns a fresh card when one is available", () => {
    const drawn = drawCard(small, ["a", "b"]);
    expect(drawn?.id).toBe("c");
  });

  it("falls back to any card when nothing is fresh", () => {
    const drawn = drawCard(small, ["a", "b", "c"]);
    expect(drawn).not.toBeNull();
    expect(["a", "b", "c"]).toContain(drawn!.id);
  });
});
