"use client";
// Client home — clinically grounded entry surface. No fantasy aesthetic.
// Surfaces: today's check-in, assigned work, upcoming session, recent
// reflections, progress snapshot, grounding quick access.

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ClipboardCheck,
  Compass,
  Library,
  Notebook,
  LineChart,
  BookOpen,
  ArrowRight,
  CalendarClock,
} from "lucide-react";
import { ClientShell } from "@/components/client/ClientShell";
import { SessionRecapVisual } from "@/components/psy/SessionRecapVisual";
import { TodayPanel } from "@/components/workspace/TodayPanel";
import { computeClientToday } from "@/lib/clinical/today";
import { useClientPortal } from "@/contexts/ClientPortalContext";
import { useAuth } from "@/contexts/AuthContext";
import { useApp } from "@/contexts/AppContext";
import { loadFromStorage } from "@/lib/store";
import {
  loadAssignments,
  acknowledge,
  saveAssignments,
  type ClientAssignment,
} from "@/lib/client/assignments";
import { ALL_WORKBOOKS } from "@/lib/client/workbooks";
import { ALL_JOURNEYS } from "@/lib/client/journeys";
import {
  TRACKING_DOMAINS,
  TRACKING_STORAGE_KEY,
  domainAverages,
  homeworkCompletionRate,
  type ClientTrackingEntry,
} from "@/lib/client/client-tracking";
import {
  REFLECTIONS_STORAGE_KEY,
  REFLECTION_KIND_LABELS,
  timeline,
  type ClientReflection,
} from "@/lib/client/reflections";

export default function ClientHomePage() {
  const { session } = useAuth();
  const { cases } = useApp();
  const { setLowEnergyMode, lowEnergyMode } = useClientPortal();

  const [assignments, setAssignments] = useState<ClientAssignment[]>([]);
  const [entries, setEntries] = useState<ClientTrackingEntry[]>([]);
  const [reflections, setReflections] = useState<ClientReflection[]>([]);

  useEffect(() => {
    setAssignments(loadAssignments());
    setEntries(loadFromStorage<ClientTrackingEntry[]>(TRACKING_STORAGE_KEY, []));
    setReflections(
      loadFromStorage<ClientReflection[]>(REFLECTIONS_STORAGE_KEY, [])
    );
  }, []);

  const today = new Date().toISOString().split("T")[0];
  const todayEntry = entries.find((e) => e.date === today);
  const unreadAssignments = useMemo(
    () => assignments.filter((a) => !a.acknowledged),
    [assignments]
  );
  const averages = useMemo(() => domainAverages(entries, 14), [entries]);
  const homework = useMemo(() => homeworkCompletionRate(entries, 30), [entries]);
  const recentReflections = useMemo(() => timeline(reflections).slice(0, 3), [reflections]);

  function ack(id: string) {
    const next = acknowledge(assignments, id);
    setAssignments(next);
    saveAssignments(next);
  }

  function assignmentLabel(a: ClientAssignment): string {
    if (a.kind === "workbook") {
      const wb = ALL_WORKBOOKS.find((w) => w.id === a.targetId);
      return wb ? `Workbook · ${wb.title}` : "Workbook";
    }
    if (a.kind === "journey") {
      const j = ALL_JOURNEYS.find((x) => x.id === a.targetId);
      return j ? `Path · ${j.title}` : "Therapeutic path";
    }
    if (a.kind === "card") return "Therapeutic card";
    return "Therapist note";
  }

  function assignmentHref(a: ClientAssignment): string | null {
    if (a.kind === "workbook" && a.targetId) return `/client/workbooks/${a.targetId}`;
    if (a.kind === "journey" && a.targetId) return `/client/journeys/${a.targetId}`;
    if (a.kind === "card") return "/client/resources";
    return null;
  }

  const todayItems = computeClientToday({
    pendingAssignments: unreadAssignments.length,
    todayHasCheckIn: Boolean(todayEntry),
  });

  return (
    <ClientShell
      title="Welcome back."
      microcopy={
        session
          ? `Signed in as ${session.email}. A quieter companion for the work between sessions.`
          : "A quieter companion for the work between sessions."
      }
    >
      {todayItems.length > 0 && (
        <div style={{ marginBottom: "1.5rem" }}>
          <TodayPanel items={todayItems} />
        </div>
      )}
      {/* Today's check-in */}
      <section className="cp-card cp-fade-in" style={{ marginBottom: "1.25rem" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 8,
          }}
        >
          <h2
            style={{
              fontSize: "0.95rem",
              fontWeight: 600,
              margin: 0,
              color: "var(--cp-text)",
            }}
          >
            Today&rsquo;s check-in
          </h2>
          <span
            style={{
              fontSize: "0.72rem",
              color: "var(--cp-muted)",
            }}
          >
            {today}
          </span>
        </div>
        {todayEntry ? (
          <div>
            <p
              className="cp-microcopy"
              style={{ fontSize: "0.84rem", marginBottom: 8 }}
            >
              You&rsquo;ve checked in today. Edit or review anytime.
            </p>
            <Link
              href="/client/progress"
              style={ctaLinkStyle()}
            >
              <ClipboardCheck size={14} /> Update today&rsquo;s entry
            </Link>
          </div>
        ) : (
          <div>
            <p
              className="cp-microcopy"
              style={{ fontSize: "0.84rem", marginBottom: 8 }}
            >
              A short, structured check-in tracks mood, sleep, anxiety, and
              other domains over time.
            </p>
            <Link href="/client/progress" style={ctaLinkStyle()}>
              <ClipboardCheck size={14} /> Start today&rsquo;s check-in
            </Link>
          </div>
        )}
      </section>

      {/* Visual session recap — gentle summary */}
      {(() => {
        const recapCase = cases.find((c) => !c.isArchived);
        if (!recapCase) return null;
        return (
          <section className="cp-card cp-fade-in" style={{ marginBottom: "1.25rem" }}>
            <h2
              style={{
                fontSize: "0.95rem",
                fontWeight: 600,
                margin: "0 0 0.6rem",
                color: "var(--cp-text)",
              }}
            >
              Last session
            </h2>
            <SessionRecapVisual caseId={recapCase.id} view="client" />
          </section>
        );
      })()}

      {/* From your therapist */}
      {unreadAssignments.length > 0 && (
        <section className="cp-card cp-fade-in" style={{ marginBottom: "1.25rem" }}>
          <h2
            style={{
              fontSize: "0.95rem",
              fontWeight: 600,
              margin: "0 0 8px",
              color: "var(--cp-text)",
            }}
          >
            From your therapist
          </h2>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 8 }}>
            {unreadAssignments.map((a) => {
              const href = assignmentHref(a);
              return (
                <li
                  key={a.id}
                  className="cp-card-soft"
                  style={{ display: "flex", alignItems: "center", gap: 10 }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "0.88rem", color: "var(--cp-text)" }}>
                      {assignmentLabel(a)}
                    </div>
                    {a.note && (
                      <div
                        style={{
                          marginTop: 4,
                          fontSize: "0.78rem",
                          color: "var(--cp-muted)",
                          lineHeight: 1.5,
                        }}
                      >
                        “{a.note}”
                      </div>
                    )}
                  </div>
                  {href ? (
                    <Link
                      href={href}
                      onClick={() => ack(a.id)}
                      style={pillButtonStyle()}
                    >
                      Open
                    </Link>
                  ) : (
                    <button
                      onClick={() => ack(a.id)}
                      style={{ ...pillButtonStyle(), background: "var(--cp-card)" }}
                    >
                      Got it
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* Upcoming session — placeholder until real scheduling */}
      <section className="cp-card cp-fade-in" style={{ marginBottom: "1.25rem" }}>
        <h2
          style={{
            fontSize: "0.95rem",
            fontWeight: 600,
            margin: "0 0 6px",
            color: "var(--cp-text)",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <CalendarClock size={14} /> Upcoming session
        </h2>
        <p className="cp-microcopy" style={{ fontSize: "0.84rem" }}>
          Your therapist hasn&rsquo;t shared a next session yet. When they do,
          you&rsquo;ll see it here along with anything to prepare.
        </p>
      </section>

      {/* Quick access tiles */}
      <section
        className="cp-fade-in"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
          gap: 10,
          marginBottom: "1.25rem",
        }}
      >
        {[
          { href: "/client/workbooks", icon: Library, label: "Workbooks", sub: "Assigned & open" },
          { href: "/client/reflections", icon: Notebook, label: "Reflections", sub: "Between sessions" },
          { href: "/client/progress", icon: LineChart, label: "Progress", sub: "Daily check-ins" },
          { href: "/client/resources", icon: BookOpen, label: "Resources", sub: "Psychoeducation" },
          { href: "/client/grounding", icon: Compass, label: "Grounding", sub: "Stabilization tools" },
          { href: "/client/notes", icon: Notebook, label: "Therapist notes", sub: "From your therapist" },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="cp-card-soft"
              style={{
                textDecoration: "none",
                display: "block",
                color: "var(--cp-text)",
              }}
            >
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 10,
                  background: "var(--cp-glow)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--cp-accent)",
                  marginBottom: 8,
                }}
              >
                <Icon size={15} />
              </div>
              <div style={{ fontSize: "0.86rem", fontWeight: 500 }}>{item.label}</div>
              <div
                style={{
                  fontSize: "0.72rem",
                  color: "var(--cp-muted)",
                  marginTop: 2,
                }}
              >
                {item.sub}
              </div>
            </Link>
          );
        })}
      </section>

      {/* Progress snapshot */}
      <section className="cp-card cp-fade-in" style={{ marginBottom: "1.25rem" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 8,
          }}
        >
          <h2
            style={{
              fontSize: "0.95rem",
              fontWeight: 600,
              margin: 0,
              color: "var(--cp-text)",
            }}
          >
            Progress overview
          </h2>
          <Link
            href="/client/progress"
            style={{
              fontSize: "0.78rem",
              color: "var(--cp-accent)",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            Open <ArrowRight size={11} />
          </Link>
        </div>
        <p
          className="cp-microcopy"
          style={{ fontSize: "0.78rem", marginBottom: 12 }}
        >
          Two-week averages across tracked domains. Empty rows haven&rsquo;t
          been recorded yet.
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
            gap: 8,
          }}
        >
          {TRACKING_DOMAINS.map((d) => {
            const v = averages[d.id];
            return (
              <div
                key={d.id}
                style={{
                  padding: "0.7rem 0.85rem",
                  borderRadius: 14,
                  border: "1px solid var(--cp-border)",
                  background: "var(--cp-card-soft)",
                }}
              >
                <div
                  style={{
                    fontSize: "0.68rem",
                    color: "var(--cp-muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    marginBottom: 2,
                  }}
                >
                  {d.label}
                </div>
                <div
                  style={{
                    fontSize: "1.05rem",
                    color: "var(--cp-text)",
                    fontWeight: 600,
                  }}
                >
                  {v === null ? "—" : v.toFixed(1)}
                </div>
              </div>
            );
          })}
          {homework.rate !== null && (
            <div
              style={{
                padding: "0.7rem 0.85rem",
                borderRadius: 14,
                border: "1px solid var(--cp-border)",
                background: "var(--cp-card-soft)",
              }}
            >
              <div
                style={{
                  fontSize: "0.68rem",
                  color: "var(--cp-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginBottom: 2,
                }}
              >
                Homework done
              </div>
              <div
                style={{
                  fontSize: "1.05rem",
                  color: "var(--cp-text)",
                  fontWeight: 600,
                }}
              >
                {Math.round(homework.rate * 100)}%
              </div>
              <div
                style={{
                  fontSize: "0.66rem",
                  color: "var(--cp-muted)",
                  marginTop: 2,
                }}
              >
                {homework.numerator} / {homework.denominator} · last 30 days
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Recent reflections */}
      {recentReflections.length > 0 && (
        <section className="cp-card cp-fade-in" style={{ marginBottom: "1.25rem" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          >
            <h2
              style={{
                fontSize: "0.95rem",
                fontWeight: 600,
                margin: 0,
                color: "var(--cp-text)",
              }}
            >
              Recent reflections
            </h2>
            <Link
              href="/client/reflections"
              style={{
                fontSize: "0.78rem",
                color: "var(--cp-accent)",
                textDecoration: "none",
              }}
            >
              View all →
            </Link>
          </div>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 6 }}>
            {recentReflections.map((r) => (
              <li
                key={r.id}
                className="cp-card-soft"
                style={{ fontSize: "0.86rem", color: "var(--cp-text)" }}
              >
                <div
                  style={{
                    fontSize: "0.68rem",
                    color: "var(--cp-muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    marginBottom: 2,
                  }}
                >
                  {REFLECTION_KIND_LABELS[r.kind]} · {r.date}
                </div>
                <p
                  style={{
                    margin: 0,
                    lineHeight: 1.5,
                    color: "var(--cp-text)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {r.body || "(empty draft)"}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Low-energy quick toggle */}
      <section
        className="cp-fade-in"
        style={{
          textAlign: "center",
          fontSize: "0.78rem",
          color: "var(--cp-muted)",
          marginTop: "2rem",
        }}
      >
        <button
          onClick={() => setLowEnergyMode(!lowEnergyMode)}
          style={{
            all: "unset",
            cursor: "pointer",
            color: "var(--cp-accent)",
            textDecoration: "underline",
          }}
        >
          {lowEnergyMode ? "Turn off low-energy mode" : "Turn on low-energy mode"}
        </button>
      </section>
    </ClientShell>
  );
}

function ctaLinkStyle(): React.CSSProperties {
  return {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "0.5rem 0.9rem",
    borderRadius: 999,
    background: "var(--cp-accent)",
    color: "white",
    fontSize: "0.85rem",
    textDecoration: "none",
    fontWeight: 500,
  };
}

function pillButtonStyle(): React.CSSProperties {
  return {
    padding: "0.4rem 0.8rem",
    borderRadius: 999,
    background: "var(--cp-accent)",
    color: "white",
    textDecoration: "none",
    fontSize: "0.78rem",
    cursor: "pointer",
    border: "none",
  };
}
