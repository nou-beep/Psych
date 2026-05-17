"use client";
// Calendar-driven dashboard widgets: today's sessions, upcoming
// deadlines, this week's clinical load. Reads the same localStorage
// the /calendar page writes to. Defensive — never crashes on bad data.

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  CalendarCheck,
  CalendarClock,
  CalendarX,
  ClipboardList,
} from "lucide-react";
import { loadFromStorage } from "@/lib/store";
import {
  CALENDAR_STORAGE_KEY,
  CATEGORY_META,
  calendarLoad,
  endOfWeekISO,
  expandRecurrences,
  isOverdue,
  startOfWeekISO,
  type CalendarEvent,
} from "@/lib/clinical/calendar";
import { useApp } from "@/contexts/AppContext";

const MAX_LIST = 4;

export function CalendarDashboardWidgets() {
  const { cases } = useApp();
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  useEffect(() => {
    try {
      const stored = loadFromStorage<unknown>(CALENDAR_STORAGE_KEY, []);
      if (Array.isArray(stored)) {
        setEvents(stored.filter((e): e is CalendarEvent => !!e && typeof e === "object"));
      }
    } catch {
      setEvents([]);
    }
  }, []);

  const today = useMemo(() => new Date().toISOString().split("T")[0], []);
  const weekStart = startOfWeekISO(today);
  const weekEnd = endOfWeekISO(today);

  const todayOccurrences = useMemo(
    () => expandRecurrences(events, today, today),
    [events, today]
  );
  const weekOccurrences = useMemo(
    () => expandRecurrences(events, weekStart, weekEnd),
    [events, weekStart, weekEnd]
  );
  const upcomingDeadlines = useMemo(() => {
    return events
      .filter(
        (e) =>
          !e.done &&
          ["report-due", "assessment-due", "follow-up", "workbook-review"].includes(
            e.category
          ) &&
          e.date >= today
      )
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, MAX_LIST);
  }, [events, today]);

  const overdue = useMemo(
    () =>
      events
        .filter((e) => isOverdue(e, today))
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(0, MAX_LIST),
    [events, today]
  );

  const upcomingSupervision = useMemo(() => {
    return events
      .filter((e) => e.category === "supervision" && e.date >= today && !e.done)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, MAX_LIST);
  }, [events, today]);

  const load = useMemo(() => calendarLoad(events, today), [events, today]);

  // Don't render the widgets row if there's truly nothing — we still
  // want the user to see this section if anything is on the calendar.
  const hasAny =
    todayOccurrences.length > 0 ||
    weekOccurrences.length > 0 ||
    upcomingDeadlines.length > 0 ||
    overdue.length > 0 ||
    upcomingSupervision.length > 0;

  if (!hasAny) {
    return (
      <div
        className="alive-hover rounded-2xl border p-4 mb-5"
        style={{
          borderColor: "var(--psych-border)",
          background: "var(--psych-card)",
        }}
        data-section="calendar"
      >
        <div className="flex items-center gap-3">
          <CalendarClock size={18} style={{ color: "var(--section-accent)" }} />
          <div className="flex-1">
            <div className="text-sm font-medium" style={{ color: "var(--psych-text)" }}>
              No calendar entries yet
            </div>
            <div className="text-xs" style={{ color: "var(--psych-muted)" }}>
              Add sessions, supervision, or deadlines so they appear here.
            </div>
          </div>
          <Link
            href="/calendar"
            className="text-xs px-2.5 py-1 rounded-lg border alive-hover"
            style={{
              borderColor: "var(--psych-border)",
              color: "var(--section-accent, var(--psych-primary))",
            }}
          >
            Open calendar →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-5 grid grid-cols-1 lg:grid-cols-2 gap-3" data-section="calendar">
      <Card
        title="Today's sessions"
        href="/calendar"
        icon={<CalendarCheck size={14} />}
        empty="Nothing scheduled today."
        count={load.todayCount}
      >
        {todayOccurrences.slice(0, MAX_LIST).map((occ) => (
          <EventRow key={`${occ.id}-${occ.occurrenceDate}`} occ={occ} cases={cases} />
        ))}
        {todayOccurrences.length > MAX_LIST && (
          <MoreLink href="/calendar" count={todayOccurrences.length - MAX_LIST} />
        )}
      </Card>

      <Card
        title="Upcoming deadlines"
        href="/calendar"
        icon={<ClipboardList size={14} />}
        empty="No pending deadlines."
        count={upcomingDeadlines.length}
      >
        {upcomingDeadlines.map((ev) => (
          <EventRow key={ev.id} occ={{ ...ev, occurrenceDate: ev.date }} cases={cases} />
        ))}
      </Card>

      <Card
        title="This week's load"
        href="/calendar"
        icon={<CalendarClock size={14} />}
        empty="Light week."
        count={load.weekCount}
      >
        {weekOccurrences.slice(0, MAX_LIST).map((occ) => (
          <EventRow
            key={`${occ.id}-${occ.occurrenceDate}-w`}
            occ={occ}
            cases={cases}
            showDate
          />
        ))}
        {weekOccurrences.length > MAX_LIST && (
          <MoreLink href="/calendar" count={weekOccurrences.length - MAX_LIST} />
        )}
      </Card>

      <Card
        title={overdue.length > 0 ? `Overdue (${overdue.length})` : "Upcoming supervision"}
        href="/calendar"
        icon={
          overdue.length > 0 ? (
            <CalendarX size={14} style={{ color: "#9B4D3A" }} />
          ) : (
            <CalendarCheck size={14} />
          )
        }
        empty={overdue.length > 0 ? "" : "No supervision scheduled."}
        count={overdue.length || upcomingSupervision.length}
        warn={overdue.length > 0}
      >
        {(overdue.length > 0 ? overdue : upcomingSupervision).map((ev) => (
          <EventRow
            key={ev.id}
            occ={{ ...ev, occurrenceDate: ev.date }}
            cases={cases}
            showDate
            warn={overdue.length > 0}
          />
        ))}
      </Card>
    </div>
  );
}

function Card({
  title,
  href,
  icon,
  empty,
  count,
  children,
  warn,
}: {
  title: string;
  href: string;
  icon: React.ReactNode;
  empty: string;
  count: number;
  children?: React.ReactNode;
  warn?: boolean;
}) {
  return (
    <div
      className="alive-hover rounded-2xl border p-4"
      style={{
        borderColor: "var(--psych-border)",
        background: "var(--psych-card)",
        borderLeft: warn ? "4px solid #9B4D3A" : undefined,
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <div
          className="flex items-center gap-2 text-sm font-semibold"
          style={{ color: warn ? "#9B4D3A" : "var(--psych-text)" }}
        >
          {icon}
          <span>{title}</span>
        </div>
        <Link
          href={href}
          className="text-[11px]"
          style={{ color: "var(--psych-muted)" }}
        >
          Open <ArrowRight size={10} className="inline" />
        </Link>
      </div>
      {count === 0 ? (
        <p className="text-xs" style={{ color: "var(--psych-muted)" }}>
          {empty}
        </p>
      ) : (
        <ul className="space-y-1.5">{children}</ul>
      )}
    </div>
  );
}

function EventRow({
  occ,
  cases,
  showDate,
  warn,
}: {
  occ: CalendarEvent & { occurrenceDate: string };
  cases: Array<{ id: string; code: string }>;
  showDate?: boolean;
  warn?: boolean;
}) {
  const meta = CATEGORY_META[occ.category];
  const caseCode = cases.find((c) => c.id === occ.caseId)?.code;
  return (
    <li className="flex items-center gap-2 text-sm">
      <span
        className="w-2 h-2 rounded-full flex-shrink-0"
        style={{ background: meta.color }}
      />
      <span
        className="text-[11px] font-mono flex-shrink-0"
        style={{ color: warn ? "#9B4D3A" : "var(--psych-muted)" }}
      >
        {showDate ? occ.occurrenceDate : occ.startTime ?? "—"}
      </span>
      <span
        className="flex-1 truncate"
        style={{
          color: "var(--psych-text)",
          textDecoration: occ.done ? "line-through" : "none",
        }}
      >
        {occ.title || meta.label}
      </span>
      {caseCode && (
        <Link
          href={`/cases/${occ.caseId}`}
          className="text-[10px] font-mono flex-shrink-0"
          style={{ color: "var(--psych-primary)" }}
        >
          {caseCode}
        </Link>
      )}
    </li>
  );
}

function MoreLink({ href, count }: { href: string; count: number }) {
  return (
    <li>
      <Link
        href={href}
        className="text-[11px]"
        style={{ color: "var(--psych-muted)" }}
      >
        +{count} more
      </Link>
    </li>
  );
}
