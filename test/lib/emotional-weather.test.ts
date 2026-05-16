import { describe, it, expect } from "vitest";
import {
  ALL_WEATHERS,
  WEATHER_META,
  getWeatherMeta,
  matchScore,
  rankByWeather,
  suggestionTagsFor,
} from "@/lib/client/emotional-weather";

describe("emotional-weather metadata", () => {
  it("exposes a meta entry for every listed weather", () => {
    for (const w of ALL_WEATHERS) {
      expect(WEATHER_META[w]).toBeDefined();
      expect(WEATHER_META[w].label.length).toBeGreaterThan(0);
      expect(WEATHER_META[w].microcopy.length).toBeGreaterThan(0);
    }
  });

  it("every weather has non-empty suggestion tags", () => {
    for (const w of ALL_WEATHERS) {
      expect(WEATHER_META[w].suggestionTags.length).toBeGreaterThan(0);
    }
  });

  it("getWeatherMeta returns the right object", () => {
    expect(getWeatherMeta("foggy").label).toBe("Foggy");
  });
});

describe("suggestionTagsFor", () => {
  it("returns an empty list for null", () => {
    expect(suggestionTagsFor(null)).toEqual([]);
  });
  it("returns the meta tags for a weather", () => {
    expect(suggestionTagsFor("stormy")).toEqual(
      WEATHER_META.stormy.suggestionTags
    );
  });
});

describe("matchScore", () => {
  it("returns 0 when there is no weather", () => {
    expect(matchScore(["x"], null)).toBe(0);
  });
  it("counts overlapping tags", () => {
    // foggy → ["grounding", "sensory", "depersonalization"]
    expect(matchScore(["grounding", "sensory"], "foggy")).toBe(2);
    expect(matchScore(["unrelated"], "foggy")).toBe(0);
  });
});

describe("rankByWeather", () => {
  it("sorts items with the most matching tags first", () => {
    const items = [
      { id: "a", tags: ["unrelated"] },
      { id: "b", tags: ["grounding", "sensory"] },
      { id: "c", tags: ["grounding"] },
    ];
    const ranked = rankByWeather(items, "foggy");
    expect(ranked.map((x) => x.id)).toEqual(["b", "c", "a"]);
  });

  it("is a no-op when weather is null", () => {
    const items = [{ id: "a", tags: [] }, { id: "b", tags: [] }];
    expect(rankByWeather(items, null)).toEqual(items);
  });

  it("does not mutate the input array", () => {
    const items = [
      { id: "a", tags: ["unrelated"] },
      { id: "b", tags: ["grounding"] },
    ];
    const before = items.map((x) => x.id);
    rankByWeather(items, "foggy");
    expect(items.map((x) => x.id)).toEqual(before);
  });
});
