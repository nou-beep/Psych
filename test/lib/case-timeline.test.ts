import { describe, it, expect } from "vitest";
import {
  buildTimeline,
  groupTimelineByMonth,
  filterTimeline,
  type TimelineSources,
} from "@/lib/case-timeline";

function sources(): TimelineSources {
  return {
    caseId: "c1",
    checkIns: [
      { id: "c1a", caseId: "c1", date: "2026-05-10", moodAffect: "calm" },
      {
        id: "c1b",
        caseId: "c1",
        date: "2026-05-12",
        moodAffect: "anxious",
        followUpNeeded: true,
      },
      { id: "other", caseId: "OTHER", date: "2026-05-12" },
    ],
    weeklyReviews: [
      {
        id: "w1",
        caseId: "c1",
        weekStart: "2026-05-09",
        weekEnd: "2026-05-15",
        mainProgress: "Good",
      },
    ],
    monthlyReviews: [
      { id: "m1", caseId: "c1", month: "2026-05-01", overallEvolution: "ok" },
    ],
    sessions: [
      { id: "s1", caseId: "c1", date: "2026-05-15", topic: "Avoidance" },
    ],
    sessionPlans: [
      {
        id: "p1",
        caseId: "c1",
        date: "2026-05-14",
        status: "planned",
        goals: ["A", "B"],
      },
    ],
    assessments: [
      {
        id: "a1",
        caseId: "c1",
        title: "PHQ-9",
        lastCompleted: "2026-04-20",
        scoreStatus: "Complete",
      },
      {
        id: "a2",
        caseId: "c1",
        title: "GAD-7",
        lastCompleted: null,
        scoreStatus: "Not started",
      },
    ],
    supervisionNotes: [
      { id: "sup1", caseId: "c1", date: "2026-05-08", mainTopics: "transference" },
    ],
    reflections: [
      { id: "r1", linkedCaseId: "c1", date: "2026-05-11", whatLearned: "silence" },
    ],
    interventions: [
      { id: "i1", caseId: "c1", date: "2026-05-15", name: "Grounding", effectiveness: 4 },
      { id: "i2", caseId: "c1", date: "2026-05-15", name: "ABC", effectiveness: 2 },
    ],
    transcripts: [
      {
        id: "t1",
        caseId: "c1",
        title: "Session transcript",
        createdAt: "2026-05-15T10:00:00Z",
      },
    ],
    audioNotes: [
      {
        id: "au1",
        linkedType: "case",
        linkedId: "c1",
        name: "voice memo",
        createdAt: "2026-05-13T10:00:00Z",
      },
      {
        id: "au2",
        linkedType: "case",
        linkedId: "OTHER",
        name: "wrong",
        createdAt: "2026-05-13T10:00:00Z",
      },
    ],
    goals: [
      {
        id: "g1",
        caseId: "c1",
        title: "Reduce avoidance",
        status: "achieved",
        updatedAt: "2026-05-10T00:00:00Z",
      },
    ],
    reports: [
      {
        id: "rep1",
        caseId: "c1",
        title: "Weekly",
        createdAt: "2026-05-15T11:00:00Z",
      },
    ],
  };
}

describe("buildTimeline", () => {
  it("filters every source by caseId", () => {
    const events = buildTimeline(sources());
    expect(events.every((e) => e.caseId === "c1")).toBe(true);
    expect(events.find((e) => e.sourceId === "other")).toBeUndefined();
    expect(events.find((e) => e.sourceId === "au2")).toBeUndefined();
  });

  it("emits events from every supported source", () => {
    const events = buildTimeline(sources());
    const types = new Set(events.map((e) => e.type));
    [
      "check-in",
      "weekly-review",
      "monthly-review",
      "session-plan",
      "session",
      "assessment",
      "supervision",
      "reflection",
      "intervention",
      "transcript",
      "audio-note",
      "goal",
      "report",
    ].forEach((t) => expect(types.has(t as never)).toBe(true));
  });

  it("sorts events newest-first", () => {
    const events = buildTimeline(sources());
    for (let i = 1; i < events.length; i++) {
      expect(events[i - 1].date >= events[i].date).toBe(true);
    }
  });

  it("flags milestones for monthly reviews, achieved goals, and effective interventions", () => {
    const events = buildTimeline(sources());
    const milestone = (t: string) =>
      events.find((e) => e.type === t && e.isMilestone);
    expect(milestone("monthly-review")).toBeTruthy();
    expect(milestone("goal")).toBeTruthy();
    expect(milestone("intervention")).toBeTruthy();
    expect(milestone("report")).toBeTruthy();
    // Less-effective intervention (effectiveness 2) should NOT be milestone.
    expect(
      events.find((e) => e.type === "intervention" && e.sourceId === "i2")
        ?.isMilestone
    ).toBeFalsy();
  });

  it("ignores entries with no usable date", () => {
    const events = buildTimeline({
      caseId: "c1",
      checkIns: [{ id: "x", caseId: "c1", date: "" }],
    });
    expect(events).toEqual([]);
  });
});

describe("groupTimelineByMonth", () => {
  it("buckets events by YYYY-MM newest-first", () => {
    const events = buildTimeline(sources());
    const groups = groupTimelineByMonth(events);
    expect(groups.length).toBeGreaterThan(0);
    expect(groups[0].month).toBe("2026-05");
    expect(groups.find((g) => g.month === "2026-04")).toBeTruthy();
    for (const g of groups) {
      for (const e of g.events) {
        expect(e.date.startsWith(g.month)).toBe(true);
      }
    }
  });
});

describe("filterTimeline", () => {
  it("filters by type", () => {
    const events = buildTimeline(sources());
    const filtered = filterTimeline(events, { types: ["intervention"] });
    expect(filtered.every((e) => e.type === "intervention")).toBe(true);
  });

  it("filters by search across title and detail (case-insensitive)", () => {
    const events = buildTimeline(sources());
    // Matches the session topic "Avoidance" *and* the goal title "Reduce avoidance".
    expect(filterTimeline(events, { search: "Avoidance" }).length).toBe(2);
    expect(filterTimeline(events, { search: "silence" }).length).toBe(1);
    expect(filterTimeline(events, { search: "nothing-matches" }).length).toBe(0);
  });

  it("returns all events when no filters are set", () => {
    const events = buildTimeline(sources());
    expect(filterTimeline(events, {}).length).toBe(events.length);
  });
});
