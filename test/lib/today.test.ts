import { describe, it, expect } from "vitest";
import {
  computeClientToday,
  computeFormationToday,
  computeTherapistToday,
  sortByPriority,
  type TodayItem,
} from "@/lib/clinical/today";

describe("computeFormationToday", () => {
  it("flags 'open your first case' when there are none", () => {
    const items = computeFormationToday({
      draftReportCount: 0,
      pendingGridCount: 0,
      testsAwaitingScore: 0,
      supervisionNoteCount: 0,
      thesisMissingDataCount: 0,
      thesisReportSectionsDrafted: 1,
      activeInternshipCases: 0,
      todayISO: "2026-05-19",
    });
    expect(items.some((i) => i.id === "open-first-case")).toBe(true);
  });

  it("reports drafts surface with a count", () => {
    const items = computeFormationToday({
      draftReportCount: 3,
      pendingGridCount: 0,
      testsAwaitingScore: 0,
      supervisionNoteCount: 1,
      thesisMissingDataCount: 0,
      thesisReportSectionsDrafted: 5,
      activeInternshipCases: 2,
      todayISO: "2026-05-19",
    });
    const reports = items.find((i) => i.id === "reports-to-finalize");
    expect(reports?.label).toContain("3");
    expect(reports?.priority === "high" || reports?.priority === "normal").toBe(
      true
    );
  });

  it("orders critical before low", () => {
    const items: TodayItem[] = [
      { id: "a", label: "low", href: "/x", priority: "low" },
      { id: "b", label: "crit", href: "/x", priority: "critical" },
      { id: "c", label: "norm", href: "/x", priority: "normal" },
      { id: "d", label: "high", href: "/x", priority: "high" },
    ];
    expect(sortByPriority(items).map((i) => i.id)).toEqual([
      "b",
      "d",
      "c",
      "a",
    ]);
  });

  it("caps the list at 6 items", () => {
    const items = computeFormationToday({
      draftReportCount: 5,
      pendingGridCount: 5,
      testsAwaitingScore: 5,
      supervisionNoteCount: 0,
      thesisMissingDataCount: 5,
      thesisReportSectionsDrafted: 0,
      activeInternshipCases: 5,
      todayISO: "2026-05-19",
    });
    expect(items.length).toBeLessThanOrEqual(6);
  });

  it("suggests preparing supervision when notes are empty but cases exist", () => {
    const items = computeFormationToday({
      draftReportCount: 0,
      pendingGridCount: 0,
      testsAwaitingScore: 0,
      supervisionNoteCount: 0,
      thesisMissingDataCount: 0,
      thesisReportSectionsDrafted: 5,
      activeInternshipCases: 2,
      todayISO: "2026-05-19",
    });
    expect(items.some((i) => i.id === "prepare-supervision")).toBe(true);
  });
});

describe("computeTherapistToday", () => {
  it("surfaces 'cases need review' as critical", () => {
    const items = computeTherapistToday({
      activeCases: 5,
      todayCheckIns: 2,
      pendingAssessments: 1,
      goalsInProgress: 3,
      needsReviewCount: 2,
    });
    const review = items.find((i) => i.id === "cases-need-review");
    expect(review?.priority).toBe("critical");
    expect(review?.label).toContain("2");
  });

  it("nudges first check-in when none logged today", () => {
    const items = computeTherapistToday({
      activeCases: 3,
      todayCheckIns: 0,
      pendingAssessments: 0,
      goalsInProgress: 0,
      needsReviewCount: 0,
    });
    expect(items.some((i) => i.id === "log-check-in")).toBe(true);
  });
});

describe("computeClientToday", () => {
  it("highlights pending assignments", () => {
    const items = computeClientToday({
      pendingAssignments: 4,
      todayHasCheckIn: false,
    });
    expect(
      items.some((i) => i.id === "assignments-pending-client")
    ).toBe(true);
  });

  it("surfaces upcoming session when present", () => {
    const items = computeClientToday({
      pendingAssignments: 0,
      todayHasCheckIn: true,
      upcomingSessionDate: "2026-05-22",
    });
    expect(items.some((i) => i.id === "upcoming-session")).toBe(true);
  });

  it("offers gentle check-in nudge when no check-in today", () => {
    const items = computeClientToday({
      pendingAssignments: 0,
      todayHasCheckIn: false,
    });
    expect(items.some((i) => i.id === "today-checkin-client")).toBe(true);
  });
});
