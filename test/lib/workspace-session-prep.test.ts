import { describe, it, expect } from "vitest";
import {
  addAgendaItem,
  addFocusPoint,
  buildPrepBundle,
  emptyPrep,
  patchPrep,
  removeAgendaItem,
  removeFocusPoint,
  toggleAgendaItem,
} from "@/lib/workspace/session-prep";
import type { PsychCase, DailyCheckIn, Session } from "@/lib/mock-data";

const sampleCase: PsychCase = {
  id: "case-1",
  code: "C-101",
  type: "Adult Case",
  status: "Active",
  age: "29",
  gender: "F",
  context: "",
  presentingConcerns: "",
  currentGoals: [],
  keyObservations: "",
  latestSummary: "",
  lastCheckIn: "",
  nextReportDue: "",
  tags: [],
  shortNote: "",
  startDate: "2025-09-01",
  supervisor: "Dr X",
  institution: "",
};

describe("emptyPrep", () => {
  it("creates an empty prep note for a case", () => {
    const p = emptyPrep("case-1");
    expect(p.caseId).toBe("case-1");
    expect(p.prepNotes).toBe("");
    expect(p.agenda).toEqual([]);
    expect(p.focusPoints).toEqual([]);
    expect(p.attachedWorksheetIds).toEqual([]);
  });
});

describe("focus points + agenda mutations", () => {
  it("adds and removes focus points", () => {
    let p = emptyPrep("case-1");
    p = addFocusPoint(p, "Explore avoidance pattern");
    expect(p.focusPoints).toHaveLength(1);
    expect(p.focusPoints[0].pinned).toBe(true);
    p = removeFocusPoint(p, p.focusPoints[0].id);
    expect(p.focusPoints).toHaveLength(0);
  });

  it("ignores empty focus point body", () => {
    let p = emptyPrep("case-1");
    p = addFocusPoint(p, "   ");
    expect(p.focusPoints).toHaveLength(0);
  });

  it("agenda items: add, toggle complete, remove", () => {
    let p = emptyPrep("case-1");
    p = addAgendaItem(p, "Review last week's worksheet", 10);
    expect(p.agenda).toHaveLength(1);
    expect(p.agenda[0].durationMinutes).toBe(10);
    expect(p.agenda[0].completed).toBe(false);
    p = toggleAgendaItem(p, p.agenda[0].id);
    expect(p.agenda[0].completed).toBe(true);
    p = removeAgendaItem(p, p.agenda[0].id);
    expect(p.agenda).toHaveLength(0);
  });

  it("patchPrep creates a record if none exists", () => {
    const list = patchPrep([], "case-1", { prepNotes: "ready" });
    expect(list).toHaveLength(1);
    expect(list[0].prepNotes).toBe("ready");
  });

  it("patchPrep updates an existing record", () => {
    const base = emptyPrep("case-1");
    const list = patchPrep([base], "case-1", { supervisionQuestions: "ask X" });
    expect(list).toHaveLength(1);
    expect(list[0].supervisionQuestions).toBe("ask X");
  });
});

describe("buildPrepBundle aggregation", () => {
  it("filters sessions/checkIns/assessments to the case", () => {
    const sessions: Session[] = [
      {
        id: "s1",
        caseId: "case-1",
        date: "2025-05-01",
        sessionNumber: 1,
        type: "follow-up",
        duration: "60",
        mainTopics: "",
        observations: "",
        interventions: "",
        nextSteps: "",
      },
      {
        id: "s2",
        caseId: "case-2",
        date: "2025-05-02",
        sessionNumber: 1,
        type: "follow-up",
        duration: "60",
        mainTopics: "",
        observations: "",
        interventions: "",
        nextSteps: "",
      },
    ];
    const checkIns: DailyCheckIn[] = [
      {
        id: "c1",
        caseId: "case-1",
        date: "2025-05-03",
        contextType: "",
        moodAffect: "plus anxieux",
        behaviorObservations: "",
        communicationObservations: "",
        cognitiveObservations: "",
        emotionalRegulation: "moins régulé",
        socialInteraction: "",
        sensoryObservations: "",
        interventionUsed: "",
        responseToIntervention: "",
        freeNotes: "",
        followUpNeeded: false,
      },
      {
        id: "c2",
        caseId: "case-1",
        date: "2025-04-01",
        contextType: "",
        moodAffect: "stable",
        behaviorObservations: "",
        communicationObservations: "",
        cognitiveObservations: "",
        emotionalRegulation: "stable",
        socialInteraction: "",
        sensoryObservations: "",
        interventionUsed: "",
        responseToIntervention: "",
        freeNotes: "",
        followUpNeeded: false,
      },
    ];

    const bundle = buildPrepBundle({
      case: sampleCase,
      sessions,
      checkIns,
      assessments: [],
      openLoops: [
        { id: "l1", caseId: "case-1", title: "follow up", status: "open", updatedAt: "2025-05-01" },
        { id: "l2", caseId: "case-2", title: "other", status: "open", updatedAt: "2025-05-01" },
      ],
      threads: [
        { id: "t1", caseId: "case-1", label: "avoidance", intensity: 5, updatedAt: "2025-05-01" },
      ],
    });

    expect(bundle.recentSessions).toHaveLength(1);
    expect(bundle.recentSessions[0].id).toBe("s1");
    expect(bundle.recentCheckIns[0].id).toBe("c1");
    expect(bundle.openLoops).toHaveLength(1);
    expect(bundle.activeThreads).toHaveLength(1);
    expect(bundle.trends.length).toBeGreaterThan(0);
    // 'plus' (latest moodAffect) should hint upward trend
    const moodTrend = bundle.trends.find((t) => t.label === "Mood / affect");
    expect(moodTrend?.direction).toBe("up");
  });

  it("flags stale data when no recent sessions / check-ins / assessments", () => {
    const bundle = buildPrepBundle({
      case: sampleCase,
      sessions: [],
      checkIns: [],
      assessments: [],
      openLoops: [],
      threads: [],
    });
    expect(bundle.staleFlags).toContain("No sessions on record for this case");
    expect(bundle.staleFlags).toContain("No check-ins yet");
    expect(bundle.staleFlags).toContain("No assessments linked");
  });
});
