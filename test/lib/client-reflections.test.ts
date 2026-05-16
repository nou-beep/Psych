import { describe, it, expect } from "vitest";
import {
  REFLECTION_KIND_LABELS,
  REFLECTION_KIND_PROMPTS,
  emptyReflection,
  reflectionsByKind,
  timeline,
  update,
} from "@/lib/client/reflections";

describe("reflection kinds", () => {
  it("covers the four clinical kinds", () => {
    for (const k of [
      "post-session",
      "forgot-to-say",
      "emotional-reaction",
      "question-for-next",
    ] as const) {
      expect(REFLECTION_KIND_LABELS[k]).toBeTruthy();
      expect(REFLECTION_KIND_PROMPTS[k]).toBeTruthy();
    }
  });
});

describe("emptyReflection", () => {
  it("defaults to post-session and not-visible-to-therapist", () => {
    const r = emptyReflection();
    expect(r.kind).toBe("post-session");
    expect(r.visibleToTherapist).toBe(false);
    expect(r.body).toBe("");
  });

  it("accepts a kind override", () => {
    expect(emptyReflection("forgot-to-say").kind).toBe("forgot-to-say");
  });
});

describe("update", () => {
  it("merges patch and refreshes updatedAt", async () => {
    const r = emptyReflection();
    const before = r.updatedAt;
    await new Promise((r) => setTimeout(r, 5));
    const next = update(r, { body: "wrote something" });
    expect(next.body).toBe("wrote something");
    expect(next.updatedAt).not.toBe(before);
  });
});

describe("timeline & reflectionsByKind", () => {
  it("sorts newest first", () => {
    const a = { ...emptyReflection(), id: "a", date: "2026-01-01" };
    const b = { ...emptyReflection(), id: "b", date: "2026-03-01" };
    const c = { ...emptyReflection(), id: "c", date: "2026-02-01" };
    expect(timeline([a, b, c]).map((r) => r.id)).toEqual(["b", "c", "a"]);
  });

  it("filters by kind", () => {
    const a = emptyReflection("post-session");
    const b = emptyReflection("forgot-to-say");
    expect(reflectionsByKind([a, b], "forgot-to-say")).toEqual([b]);
  });
});
