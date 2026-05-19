"use client";
// Client Calendar — therapist-assigned material, sessions, and
// completion-aware reminders. Reads from the shared calendar engine
// and the assignment store.

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  CalendarRange,
  Clock,
  CheckCircle2,
  Circle,
  ArrowRight,
  ClipboardCheck,
  Brain,
  Library,
  FileText,
} from "lucide-react";
import { ClientShell } from "@/components/client/ClientShell";
import { loadFromStorage } from "@/lib/store";
import {
  CALENDAR_STORAGE_KEY,
  CATEGORY_META,
  expandRecurrences,
  type CalendarEvent,
} from "@/lib/clinical/calendar";
import {
  loadAssignments,
  type ClientAssignment,
} from "@/lib/client/assignments";
import { ALL_WORKBOOKS } from "@/lib/client/workbooks";

// Client-relevant categories — the rest (supervision, thesis,
// report-due, research) are therapist/formation concerns.
const CLIENT_CATEGORIES = new Set([
  "session",
  "intake",
  "assessment-due",
  "workbook-review",
  "worksheet-due",
  "follow-up",
]);

function todayISO(): string {
  return new Date().toISOString().split("T")[0];
}

function addDaysISO(start: string, days: number): string {
  const d = new Date(start + "T00:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

function formatHumanDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export default function ClientCalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [assignments, setAssignments] = useState<ClientAssignment[]>([]);

  useEffect(() => {
    setEvents(loadFromStorage<CalendarEvent[]>(CALENDAR_STORAGE_KEY, []));
    setAssignments(loadAssignments());
  }, []);

  const today = todayISO();
  const horizon = addDaysISO(today, 30);

  const upcoming = useMemo(() => {
    const expanded = expandRecurrences(events, today, horizon);
    return expanded.filter((e) => CLIENT_CATEGORIES.has(e.category));
  }, [events, today, horizon]);

  const byDay = useMemo(() => {
    const groups: Record<
      string,
      Array<(typeof upcoming)[number]>
    > = {};
    for (const occ of upcoming) {
      const day = occ.occurrenceDate;
      if (!groups[day]) groups[day] = [];
      groups[day].push(occ);
    }
    return Object.entries(groups).sort(([a], [b]) =>
      a.localeCompare(b)
    );
  }, [upcoming]);

  const unacknowledged = assignments.filter((a) => !a.acknowledged);

  return (
    <ClientShell
      title="Calendar"
      microcopy="Your upcoming sessions, assigned work, and reminders — the next 30 days."
    >
      {/* Summary row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "0.75rem",
          marginBottom: "1.5rem",
        }}
      >
        <SummaryTile
          icon={<CalendarRange size={16} />}
          label="Upcoming events"
          value={String(upcoming.length)}
          tint="#9882C0"
        />
        <SummaryTile
          icon={<ClipboardCheck size={16} />}
          label="New from therapist"
          value={String(unacknowledged.length)}
          tint="#7C4FB3"
        />
        <SummaryTile
          icon={<CheckCircle2 size={16} />}
          label="Completed assignments"
          value={String(
            assignments.filter((a) => a.acknowledged).length
          )}
          tint="#10B981"
        />
      </div>

      {/* Day-by-day timeline */}
      {byDay.length === 0 ? (
        <div
          style={{
            padding: "2rem",
            textAlign: "center",
            borderRadius: 18,
            background: "rgba(255,255,255,0.5)",
            border: "1px solid rgba(140,100,200,0.15)",
          }}
        >
          <Circle
            size={28}
            style={{
              color: "#9882C0",
              opacity: 0.5,
              margin: "0 auto 0.5rem",
            }}
          />
          <p
            style={{
              color: "#5C4870",
              fontSize: "0.9rem",
              margin: 0,
            }}
          >
            Nothing on the calendar for the next 30 days.
          </p>
          <p
            style={{
              color: "#7A6090",
              fontSize: "0.78rem",
              marginTop: 6,
            }}
          >
            Your therapist will assign work and book sessions as you go.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {byDay.map(([day, occs]) => (
            <section key={day}>
              <h2
                style={{
                  fontSize: "0.78rem",
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: "#5C4870",
                  marginBottom: 8,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <span>{formatHumanDate(day)}</span>
                {day === today && (
                  <span
                    style={{
                      fontSize: "0.65rem",
                      padding: "2px 8px",
                      borderRadius: 999,
                      background: "rgba(140,100,200,0.18)",
                      color: "#5B36A8",
                      letterSpacing: "0.04em",
                    }}
                  >
                    TODAY
                  </span>
                )}
              </h2>
              <div className="space-y-2">
                {occs.map((occ) => {
                  const meta = CATEGORY_META[occ.category];
                  return (
                    <div
                      key={`${occ.id}-${occ.occurrenceDate}`}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: "0.9rem 1rem",
                        borderRadius: 16,
                        background: "rgba(255,255,255,0.7)",
                        border: `1px solid ${meta.color}33`,
                      }}
                    >
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 12,
                          background: meta.color + "22",
                          color: meta.color,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <CalendarRange size={16} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p
                          style={{
                            margin: 0,
                            fontWeight: 500,
                            color: "#1F1733",
                            fontSize: "0.92rem",
                          }}
                        >
                          {occ.title || meta.label}
                        </p>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            color: "#7A6090",
                            fontSize: "0.74rem",
                            marginTop: 2,
                          }}
                        >
                          {occ.startTime && (
                            <>
                              <Clock size={11} />
                              {occ.startTime}
                              {occ.endTime ? `–${occ.endTime}` : ""}
                              <span style={{ margin: "0 4px" }}>·</span>
                            </>
                          )}
                          <span>{meta.label}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}

      {/* Recent assignments list — quick access from calendar */}
      {assignments.length > 0 && (
        <section style={{ marginTop: "2rem" }}>
          <h2
            style={{
              fontSize: "0.78rem",
              fontWeight: 600,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: "#5C4870",
              marginBottom: 8,
            }}
          >
            Therapist-assigned work
          </h2>
          <div className="space-y-2">
            {assignments.slice(0, 6).map((a) => {
              const wb = ALL_WORKBOOKS.find((w) => w.id === a.targetId);
              const href =
                a.kind === "workbook" && a.targetId
                  ? `/client/workbooks/${a.targetId}`
                  : a.kind === "assessment"
                  ? "/client/assessments"
                  : "/client/assigned";
              const Icon =
                a.kind === "workbook"
                  ? Library
                  : a.kind === "assessment"
                  ? Brain
                  : a.kind === "card"
                  ? FileText
                  : ClipboardCheck;
              const tint = a.kind === "assessment" ? "#7C4FB3" : "#9882C0";
              return (
                <Link key={a.id} href={href}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "0.8rem 1rem",
                      borderRadius: 14,
                      background: "rgba(255,255,255,0.6)",
                      border: a.acknowledged
                        ? "1px solid rgba(16,185,129,0.25)"
                        : "1px solid rgba(140,100,200,0.2)",
                      cursor: "pointer",
                    }}
                  >
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 10,
                        background: tint + "22",
                        color: tint,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Icon size={14} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p
                        style={{
                          margin: 0,
                          fontWeight: 500,
                          color: "#1F1733",
                          fontSize: "0.9rem",
                        }}
                      >
                        {wb?.title ??
                          (a.kind === "assessment"
                            ? "Assessment to complete"
                            : a.kind === "card"
                            ? "Therapeutic card"
                            : "Therapist note")}
                      </p>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "0.72rem",
                          color: "#7A6090",
                        }}
                      >
                        {a.acknowledged
                          ? "Acknowledged"
                          : "Awaiting your attention"}
                      </p>
                    </div>
                    <ArrowRight
                      size={14}
                      style={{ color: "#7A6090", flexShrink: 0 }}
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </ClientShell>
  );
}

interface SummaryTileProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  tint: string;
}

function SummaryTile({ icon, label, value, tint }: SummaryTileProps) {
  return (
    <div
      style={{
        padding: "1rem 1.1rem",
        borderRadius: 16,
        background: "rgba(255,255,255,0.6)",
        border: "1px solid rgba(140,100,200,0.16)",
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}
    >
      <div
        style={{
          width: 38,
          height: 38,
          borderRadius: 12,
          background: tint + "22",
          color: tint,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <p
          style={{
            margin: 0,
            fontSize: "0.74rem",
            color: "#7A6090",
            letterSpacing: "0.02em",
          }}
        >
          {label}
        </p>
        <p
          style={{
            margin: 0,
            fontSize: "1.4rem",
            fontWeight: 600,
            color: "#1F1733",
          }}
        >
          {value}
        </p>
      </div>
    </div>
  );
}
