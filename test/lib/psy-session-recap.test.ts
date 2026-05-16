import { describe, it, expect } from "vitest";
import {
  buildSessionRecap,
  clientFacingFields,
  emotionalToneColour,
  emotionalToneCopy,
} from "@/lib/psy/session-recap";
import { emptyNode } from "@/lib/psy/nodes";

function lastSession() {
  return {
    date: "2026-05-15",
    topic: "Avoidance",
    emotionalThemes: "engaged well",
    interventionsUsed: "Thought record, Grounding",
    assignedWork: ["Anxiety worksheet"],
    unresolvedTopics: "test avoidance hypothesis",
    symptomChanges: "",
    riskUpdate: "",
    nextSessionFocus: "Review homework",
  };
}

describe("buildSessionRecap", () => {
  it("returns a structured recap with both therapist and client views", () => {
    const recap = buildSessionRecap({
      caseId: "c1",
      lastSession: lastSession(),
    });
    expect(recap.caseId).toBe("c1");
    expect(recap.date).toBe("2026-05-15");
    expect(recap.interventionsUsed).toEqual([
      "Thought record",
      "Grounding",
    ]);
    expect(recap.assignedWork).toEqual(["Anxiety worksheet"]);
    expect(recap.client.headline).toContain("avoidance");
    expect(recap.client.nextSteps.length).toBeGreaterThan(0);
    expect(recap.client.reflectionPrompts.length).toBeGreaterThan(0);
  });

  it("pulls themes from session-day nodes", () => {
    const recap = buildSessionRecap({
      caseId: "c1",
      lastSession: lastSession(),
      sessionDayNodes: [
        emptyNode("c1", "emotion", { tags: ["shame", "abandonment"] }),
        emptyNode("c1", "thought", { tags: ["shame"] }),
      ],
    });
    expect(recap.themes).toContain("shame");
  });

  it("detects a heavy emotional tone when heavy tags dominate", () => {
    const recap = buildSessionRecap({
      caseId: "c1",
      lastSession: lastSession(),
      sessionDayNodes: [
        emptyNode("c1", "emotion", {
          tags: ["shame", "abandonment", "dissociation"],
        }),
      ],
    });
    expect(recap.emotionalTone).toBe("heavy");
  });

  it("falls back gracefully when there's no prior session", () => {
    const recap = buildSessionRecap({
      caseId: "c1",
      lastSession: {
        date: null,
        topic: "—",
        emotionalThemes: "",
        interventionsUsed: "",
        assignedWork: [],
        unresolvedTopics: "",
        symptomChanges: "",
        riskUpdate: "",
        nextSessionFocus: "",
      },
    });
    expect(recap.date).toBeNull();
    expect(recap.themes).toEqual([]);
    expect(recap.client.headline).toMatch(/recap/i);
  });
});

describe("tone helpers", () => {
  it("emotionalToneColour returns a color for every known tone", () => {
    for (const t of ["heavy", "open", "mixed", "neutral", "unknown"]) {
      expect(emotionalToneColour(t)).toMatch(/^#/);
    }
  });

  it("emotionalToneCopy is non-empty and gentle", () => {
    expect(emotionalToneCopy("heavy")).toMatch(/heavier/i);
    expect(emotionalToneCopy("open")).toMatch(/open/i);
    expect(emotionalToneCopy("anything")).toBeTruthy();
  });
});

describe("clientFacingFields", () => {
  it("only exposes the client-safe subset", () => {
    const recap = buildSessionRecap({
      caseId: "c1",
      lastSession: lastSession(),
    });
    const fields = clientFacingFields(recap);
    expect(Object.keys(fields).sort()).toEqual([
      "emotionalTone",
      "headline",
      "keyFocusAreas",
      "nextSteps",
      "reflectionPrompts",
    ]);
  });
});
