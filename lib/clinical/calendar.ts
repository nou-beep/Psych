// Clinical Calendar — pure event model + view helpers. Persists in
// localStorage via the caller; this file is logic-only.
//
// Event categories map to the section colour tokens so the UI can
// pick up the right accent automatically.

import { generateId, nowISO } from "@/lib/store";

export type CalendarCategory =
  | "session"
  | "supervision"
  | "assessment-due"
  | "report-due"
  | "follow-up"
  | "workbook-review"
  | "intake"
  | "research"
  | "thesis-deadline"
  | "writing-session"
  | "session-prep"
  | "worksheet-due"
  | "other";

export const CATEGORY_META: Record<
  CalendarCategory,
  { label: string; section: string; color: string }
> = {
  session: { label: "Therapy session", section: "client", color: "#9882C0" },
  supervision: { label: "Supervision", section: "supervision", color: "#8B4A66" },
  "assessment-due": { label: "Assessment due", section: "assessments", color: "#6B7AA0" },
  "report-due": { label: "Report due", section: "reports", color: "#8A6E5D" },
  "follow-up": { label: "Follow-up", section: "interventions", color: "#B07A4F" },
  "workbook-review": { label: "Workbook review", section: "client", color: "#9882C0" },
  intake: { label: "Intake appointment", section: "client", color: "#6E8A7B" },
  research: { label: "Research deadline", section: "research", color: "#7E7A6E" },
  "thesis-deadline": { label: "Thesis deadline", section: "research", color: "#7E7A6E" },
  "writing-session": { label: "Writing session", section: "research", color: "#9882C0" },
  "session-prep": { label: "Session prep", section: "client", color: "#6B7AA0" },
  "worksheet-due": { label: "Worksheet due", section: "interventions", color: "#B07A4F" },
  other: { label: "Other", section: "calendar", color: "#6E8A7B" },
};

export type Recurrence = "none" | "weekly" | "biweekly" | "monthly";

export interface CalendarEvent {
  id: string;
  title: string;
  category: CalendarCategory;
  // ISO date YYYY-MM-DD
  date: string;
  // Optional HH:MM start
  startTime?: string;
  // Optional HH:MM end
  endTime?: string;
  recurrence: Recurrence;
  // Recurrence end date (inclusive). If unset, recurrence is open-ended.
  recurrenceUntil?: string;
  caseId?: string;
  linkedReportId?: string;
  linkedAssessmentId?: string;
  notes?: string;
  done: boolean;
  createdAt: string;
  updatedAt: string;
}

export const CALENDAR_STORAGE_KEY = "psych-calendar-v1";

export function emptyEvent(overrides: Partial<CalendarEvent> = {}): CalendarEvent {
  const now = nowISO();
  return {
    id: generateId(),
    title: "",
    category: "session",
    date: new Date().toISOString().split("T")[0],
    recurrence: "none",
    done: false,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

// ─── Recurrence expansion ──────────────────────────────────────

// Expand a single event into the concrete occurrences that fall within
// [from, to] (inclusive). Pure function; no I/O. Used by every view.
export function expandRecurrences(
  events: CalendarEvent[],
  from: string,
  to: string
): Array<CalendarEvent & { occurrenceDate: string }> {
  const out: Array<CalendarEvent & { occurrenceDate: string }> = [];
  for (const ev of events) {
    const occurrences = occurrenceDates(ev, from, to);
    for (const d of occurrences) {
      out.push({ ...ev, occurrenceDate: d });
    }
  }
  return out.sort((a, b) => {
    if (a.occurrenceDate !== b.occurrenceDate) {
      return a.occurrenceDate.localeCompare(b.occurrenceDate);
    }
    return (a.startTime ?? "").localeCompare(b.startTime ?? "");
  });
}

function occurrenceDates(
  ev: CalendarEvent,
  from: string,
  to: string
): string[] {
  const start = ev.date;
  if (ev.recurrence === "none") {
    return start >= from && start <= to ? [start] : [];
  }
  const stride =
    ev.recurrence === "weekly"
      ? 7
      : ev.recurrence === "biweekly"
      ? 14
      : 0; // "monthly" handled separately
  if (ev.recurrence === "monthly") {
    return monthlyOccurrences(start, from, to, ev.recurrenceUntil);
  }
  return strideOccurrences(start, from, to, stride, ev.recurrenceUntil);
}

function strideOccurrences(
  start: string,
  from: string,
  to: string,
  strideDays: number,
  until: string | undefined
): string[] {
  if (strideDays <= 0) return [];
  const out: string[] = [];
  let cursor = new Date(start + "T00:00:00Z");
  const fromDate = new Date(from + "T00:00:00Z");
  const toDate = new Date(to + "T00:00:00Z");
  const untilDate = until ? new Date(until + "T00:00:00Z") : null;

  // Fast-forward cursor to the first occurrence >= from
  while (cursor < fromDate) {
    cursor = addDays(cursor, strideDays);
  }
  while (cursor <= toDate) {
    if (untilDate && cursor > untilDate) break;
    out.push(cursor.toISOString().split("T")[0]);
    cursor = addDays(cursor, strideDays);
  }
  return out;
}

function monthlyOccurrences(
  start: string,
  from: string,
  to: string,
  until: string | undefined
): string[] {
  const out: string[] = [];
  let cursor = new Date(start + "T00:00:00Z");
  const fromDate = new Date(from + "T00:00:00Z");
  const toDate = new Date(to + "T00:00:00Z");
  const untilDate = until ? new Date(until + "T00:00:00Z") : null;

  // Fast-forward
  while (cursor < fromDate) {
    cursor = addMonths(cursor, 1);
  }
  while (cursor <= toDate) {
    if (untilDate && cursor > untilDate) break;
    out.push(cursor.toISOString().split("T")[0]);
    cursor = addMonths(cursor, 1);
  }
  return out;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  d.setUTCMonth(d.getUTCMonth() + months);
  return d;
}

// ─── View helpers ──────────────────────────────────────────────

export function startOfWeekISO(date: string): string {
  const d = new Date(date + "T00:00:00Z");
  const day = d.getUTCDay(); // 0 (Sun) - 6 (Sat)
  // Treat Monday as the first day of the week.
  const offset = (day + 6) % 7;
  d.setUTCDate(d.getUTCDate() - offset);
  return d.toISOString().split("T")[0];
}

export function endOfWeekISO(date: string): string {
  const start = startOfWeekISO(date);
  const d = new Date(start + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + 6);
  return d.toISOString().split("T")[0];
}

export function startOfMonthISO(date: string): string {
  const d = new Date(date + "T00:00:00Z");
  d.setUTCDate(1);
  return d.toISOString().split("T")[0];
}

export function endOfMonthISO(date: string): string {
  const d = new Date(date + "T00:00:00Z");
  d.setUTCMonth(d.getUTCMonth() + 1);
  d.setUTCDate(0); // last day of the previous (i.e. original) month
  return d.toISOString().split("T")[0];
}

export function daysBetween(from: string, to: string): string[] {
  const out: string[] = [];
  let cursor = new Date(from + "T00:00:00Z");
  const toDate = new Date(to + "T00:00:00Z");
  while (cursor <= toDate) {
    out.push(cursor.toISOString().split("T")[0]);
    cursor = addDays(cursor, 1);
  }
  return out;
}

// Group day → events for week / month rendering.
export function groupByDay(
  occurrences: Array<CalendarEvent & { occurrenceDate: string }>
): Record<string, Array<CalendarEvent & { occurrenceDate: string }>> {
  const out: Record<string, Array<CalendarEvent & { occurrenceDate: string }>> = {};
  for (const occ of occurrences) {
    if (!out[occ.occurrenceDate]) out[occ.occurrenceDate] = [];
    out[occ.occurrenceDate].push(occ);
  }
  return out;
}

// ─── Overdue + dashboard helpers ───────────────────────────────

export function isOverdue(event: CalendarEvent, today: string): boolean {
  if (event.done) return false;
  if (event.recurrence !== "none") return false;
  return event.date < today;
}

export interface CalendarLoad {
  todayCount: number;
  weekCount: number;
  pendingTaskCount: number;
  overdueCount: number;
}

export function calendarLoad(
  events: CalendarEvent[],
  today: string
): CalendarLoad {
  const weekStart = startOfWeekISO(today);
  const weekEnd = endOfWeekISO(today);
  const occToday = expandRecurrences(events, today, today);
  const occWeek = expandRecurrences(events, weekStart, weekEnd);
  return {
    todayCount: occToday.length,
    weekCount: occWeek.length,
    pendingTaskCount: events.filter(
      (e) =>
        !e.done &&
        ["assessment-due", "report-due", "follow-up", "workbook-review"].includes(
          e.category
        )
    ).length,
    overdueCount: events.filter((e) => isOverdue(e, today)).length,
  };
}
