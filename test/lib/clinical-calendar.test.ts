import { describe, it, expect } from "vitest";
import {
  CATEGORY_META,
  calendarLoad,
  daysBetween,
  emptyEvent,
  endOfMonthISO,
  endOfWeekISO,
  expandRecurrences,
  groupByDay,
  isOverdue,
  startOfMonthISO,
  startOfWeekISO,
  type CalendarEvent,
} from "@/lib/clinical/calendar";

describe("calendar metadata", () => {
  it("every category has a label, section, and colour", () => {
    for (const meta of Object.values(CATEGORY_META)) {
      expect(meta.label.length).toBeGreaterThan(0);
      expect(meta.section.length).toBeGreaterThan(0);
      expect(meta.color).toMatch(/^#/);
    }
  });
});

describe("week / month boundaries", () => {
  // 2026-05-13 was a Wednesday in the standard calendar — Monday-first
  // means start should be 2026-05-11, end 2026-05-17.
  it("startOfWeekISO uses Monday as the first day", () => {
    expect(startOfWeekISO("2026-05-13")).toBe("2026-05-11");
    expect(endOfWeekISO("2026-05-13")).toBe("2026-05-17");
  });

  it("startOfMonthISO / endOfMonthISO bracket the calendar month", () => {
    expect(startOfMonthISO("2026-05-13")).toBe("2026-05-01");
    expect(endOfMonthISO("2026-05-13")).toBe("2026-05-31");
    expect(endOfMonthISO("2026-02-10")).toBe("2026-02-28");
  });

  it("daysBetween enumerates inclusive days", () => {
    const days = daysBetween("2026-05-11", "2026-05-13");
    expect(days).toEqual(["2026-05-11", "2026-05-12", "2026-05-13"]);
  });
});

describe("expandRecurrences", () => {
  function ev(overrides: Partial<CalendarEvent>): CalendarEvent {
    return {
      ...emptyEvent(),
      title: "Session",
      category: "session",
      ...overrides,
    };
  }

  it("non-recurring events are included only when in range", () => {
    const e = ev({ date: "2026-05-15" });
    expect(
      expandRecurrences([e], "2026-05-01", "2026-05-31").map((x) => x.occurrenceDate)
    ).toEqual(["2026-05-15"]);
    expect(expandRecurrences([e], "2026-06-01", "2026-06-30")).toEqual([]);
  });

  it("weekly recurrence yields the right occurrences", () => {
    const e = ev({ date: "2026-05-04", recurrence: "weekly" });
    const occ = expandRecurrences([e], "2026-05-01", "2026-05-31").map(
      (x) => x.occurrenceDate
    );
    expect(occ).toEqual([
      "2026-05-04",
      "2026-05-11",
      "2026-05-18",
      "2026-05-25",
    ]);
  });

  it("biweekly recurrence yields every two weeks", () => {
    const e = ev({ date: "2026-05-04", recurrence: "biweekly" });
    const occ = expandRecurrences([e], "2026-05-01", "2026-06-15").map(
      (x) => x.occurrenceDate
    );
    expect(occ).toEqual([
      "2026-05-04",
      "2026-05-18",
      "2026-06-01",
      "2026-06-15",
    ]);
  });

  it("monthly recurrence walks month-by-month", () => {
    const e = ev({ date: "2026-01-15", recurrence: "monthly" });
    const occ = expandRecurrences([e], "2026-01-01", "2026-04-30").map(
      (x) => x.occurrenceDate
    );
    expect(occ).toEqual([
      "2026-01-15",
      "2026-02-15",
      "2026-03-15",
      "2026-04-15",
    ]);
  });

  it("recurrenceUntil clamps the series", () => {
    const e = ev({
      date: "2026-05-04",
      recurrence: "weekly",
      recurrenceUntil: "2026-05-15",
    });
    const occ = expandRecurrences([e], "2026-05-01", "2026-05-31").map(
      (x) => x.occurrenceDate
    );
    expect(occ).toEqual(["2026-05-04", "2026-05-11"]);
  });

  it("results are sorted by date then start time", () => {
    const a = ev({ date: "2026-05-04", startTime: "10:00" });
    const b = ev({ date: "2026-05-04", startTime: "09:00" });
    const c = ev({ date: "2026-05-05" });
    const occ = expandRecurrences([a, b, c], "2026-05-04", "2026-05-05").map(
      (x) => `${x.occurrenceDate}@${x.startTime ?? ""}`
    );
    expect(occ).toEqual([
      "2026-05-04@09:00",
      "2026-05-04@10:00",
      "2026-05-05@",
    ]);
  });
});

describe("groupByDay", () => {
  it("groups occurrences keyed by date", () => {
    const grouped = groupByDay(
      expandRecurrences(
        [
          { ...emptyEvent(), date: "2026-05-04", title: "a" },
          { ...emptyEvent(), date: "2026-05-04", title: "b" },
          { ...emptyEvent(), date: "2026-05-05", title: "c" },
        ],
        "2026-05-01",
        "2026-05-31"
      )
    );
    expect(grouped["2026-05-04"]).toHaveLength(2);
    expect(grouped["2026-05-05"]).toHaveLength(1);
  });
});

describe("isOverdue", () => {
  it("flags past, non-done, non-recurring tasks", () => {
    expect(isOverdue({ ...emptyEvent({ date: "2026-01-01" }) }, "2026-05-01")).toBe(true);
  });
  it("ignores done events", () => {
    expect(isOverdue({ ...emptyEvent({ date: "2026-01-01", done: true }) }, "2026-05-01")).toBe(false);
  });
  it("ignores recurring events", () => {
    expect(
      isOverdue({ ...emptyEvent({ date: "2026-01-01", recurrence: "weekly" }) }, "2026-05-01")
    ).toBe(false);
  });
});

describe("calendarLoad", () => {
  it("computes today / week / pending / overdue counts", () => {
    const events: CalendarEvent[] = [
      { ...emptyEvent({ date: "2026-05-13", category: "session" }) },
      { ...emptyEvent({ date: "2026-05-13", category: "supervision" }) },
      { ...emptyEvent({ date: "2026-05-14", category: "report-due" }) },
      { ...emptyEvent({ date: "2026-01-01", category: "follow-up" }) },
    ];
    const load = calendarLoad(events, "2026-05-13");
    expect(load.todayCount).toBe(2);
    expect(load.weekCount).toBe(3); // 2 today + 1 tomorrow inside the same week
    expect(load.pendingTaskCount).toBe(2); // report-due + follow-up
    expect(load.overdueCount).toBe(1);
  });
});
