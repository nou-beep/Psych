import { describe, it, expect } from "vitest";
import { MODES, findMode, modeClassNames } from "@/lib/desk/modes";

describe("workspace modes", () => {
  it("ships the user-requested modes", () => {
    const ids = MODES.map((m) => m.id);
    for (const expected of [
      "default",
      "session",
      "writing",
      "research",
      "review",
      "supervision",
    ]) {
      expect(ids).toContain(expected);
    }
  });

  it("each non-default mode declares a suggested preset id", () => {
    for (const m of MODES) {
      if (m.id === "default") continue;
      expect(m.flags.suggestedPresetId).toBeTruthy();
    }
  });

  it("findMode resolves by id", () => {
    expect(findMode("session")?.label).toBe("Session");
    expect(findMode("nope")).toBeUndefined();
  });

  it("modeClassNames emits the workspace-mode-{id} class for every mode", () => {
    for (const m of MODES) {
      expect(modeClassNames(m.id)).toContain(`workspace-mode-${m.id}`);
    }
  });

  it("modeClassNames adds the right combination of flag classes", () => {
    const writing = modeClassNames("writing");
    expect(writing).toContain("workspace-collapse-sidebar");
    expect(writing).toContain("workspace-quiet");
    const research = modeClassNames("research");
    expect(research).toContain("workspace-dense");
    const review = modeClassNames("review");
    expect(review).not.toContain("workspace-collapse-sidebar");
    expect(review).not.toContain("workspace-quiet");
  });
});
