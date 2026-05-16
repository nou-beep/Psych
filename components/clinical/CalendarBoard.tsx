"use client";
// Week + month calendar views. Day view is the simplest agenda-style
// list rendered inline by the page. Keeps the component dumb — no
// persistence here, the page owns events.

import {
  daysBetween,
  endOfMonthISO,
  endOfWeekISO,
  expandRecurrences,
  groupByDay,
  startOfMonthISO,
  startOfWeekISO,
  CATEGORY_META,
  type CalendarEvent,
} from "@/lib/clinical/calendar";

interface Props {
  events: CalendarEvent[];
  view: "week" | "month";
  anchor: string; // any date inside the displayed week/month
  onSelectDate: (date: string) => void;
  onSelectEvent: (event: CalendarEvent) => void;
}

const WEEK_DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function CalendarBoard({
  events,
  view,
  anchor,
  onSelectDate,
  onSelectEvent,
}: Props) {
  const from = view === "week" ? startOfWeekISO(anchor) : startOfMonthISO(anchor);
  const to = view === "week" ? endOfWeekISO(anchor) : endOfMonthISO(anchor);
  const allDays = daysBetween(from, to);
  const occurrences = expandRecurrences(events, from, to);
  const grouped = groupByDay(occurrences);

  // For month view, pad to the start of the first week
  const monthStartWeek = view === "month" ? startOfWeekISO(from) : from;
  const monthEndWeek = view === "month" ? endOfWeekISO(to) : to;
  const days = view === "month" ? daysBetween(monthStartWeek, monthEndWeek) : allDays;

  return (
    <div
      style={{
        background: "var(--psych-card)",
        border: "1px solid var(--psych-border)",
        borderRadius: 16,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          background: "var(--psych-sidebar)",
          borderBottom: "1px solid var(--psych-border)",
        }}
      >
        {WEEK_DAY_LABELS.map((d) => (
          <div
            key={d}
            style={{
              padding: "0.55rem 0.6rem",
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: "var(--psych-muted)",
            }}
          >
            {d}
          </div>
        ))}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
        }}
      >
        {days.map((d) => {
          const inMonth = d >= from && d <= to;
          const dayEvents = grouped[d] ?? [];
          const isToday = d === new Date().toISOString().split("T")[0];
          return (
            <button
              key={d}
              onClick={() => onSelectDate(d)}
              className="alive-hover"
              style={{
                all: "unset",
                cursor: "pointer",
                display: "block",
                textAlign: "left",
                minHeight: view === "month" ? 92 : 140,
                padding: "0.5rem",
                borderRight: "1px solid var(--psych-border)",
                borderBottom: "1px solid var(--psych-border)",
                background: isToday
                  ? "var(--psych-primary-light)"
                  : inMonth
                  ? "var(--psych-card)"
                  : "var(--psych-bg)",
                opacity: inMonth ? 1 : 0.55,
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: isToday ? "var(--psych-accent)" : "var(--psych-text)",
                  marginBottom: 6,
                }}
              >
                {parseInt(d.split("-")[2], 10)}
              </div>
              <div style={{ display: "grid", gap: 3 }}>
                {dayEvents.slice(0, view === "month" ? 3 : 8).map((occ) => {
                  const meta = CATEGORY_META[occ.category];
                  return (
                    <div
                      key={`${occ.id}-${occ.occurrenceDate}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectEvent(occ);
                      }}
                      style={{
                        fontSize: 11,
                        padding: "2px 6px",
                        borderRadius: 6,
                        background: meta.color + "22",
                        color: meta.color,
                        borderLeft: `3px solid ${meta.color}`,
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        textDecoration: occ.done ? "line-through" : "none",
                        opacity: occ.done ? 0.55 : 1,
                      }}
                    >
                      {occ.startTime ? `${occ.startTime} · ` : ""}
                      {occ.title || meta.label}
                    </div>
                  );
                })}
                {dayEvents.length > (view === "month" ? 3 : 8) && (
                  <div
                    style={{
                      fontSize: 10,
                      color: "var(--psych-muted)",
                    }}
                  >
                    +{dayEvents.length - (view === "month" ? 3 : 8)} more
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
