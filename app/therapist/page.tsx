"use client";
import Link from "next/link";
import { useMemo } from "react";
import {
  FolderOpen,
  ClipboardCheck,
  Target,
  ScrollText,
  CheckCircle,
  AlertCircle,
  Quote as QuoteIcon,
  PenLine,
  Sparkles as SparklesIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApp } from "@/contexts/AppContext";
import { WorkingOn } from "@/components/clinical/WorkingOn";
import { RecentTrails } from "@/components/shared/RecentTrails";
import {
  PaperStack,
  WorkspaceHeader,
  DeskPanel,
  PinnedNote,
  AnnotationLabel,
  MaterialCard,
  CurrentWorkRail,
  type CurrentWorkItem,
} from "@/components/desk";

const today = new Date();
const dateLine = today
  .toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })
  .toLowerCase();

const GREET_HOUR = today.getHours();
const greeting =
  GREET_HOUR < 12
    ? "good morning"
    : GREET_HOUR < 17
    ? "good afternoon"
    : "good evening";

const CASE_TONES = ["berry", "plum", "mauve", "lav"] as const;

export default function DashboardPage() {
  const { cases, checkIns, goals, transcripts, assessments } = useApp();

  const activeCases = useMemo(
    () => cases.filter((c) => !c.isArchived && c.status === "Active"),
    [cases]
  );
  const needsReview = useMemo(
    () => cases.filter((c) => !c.isArchived && c.status === "Needs Review"),
    [cases]
  );
  const todayStr = today.toISOString().split("T")[0];
  const todayCheckIns = checkIns.filter(
    (c) => c.date === todayStr && !c.isArchived
  );
  const activeGoals = goals.filter(
    (g) => !g.isArchived && g.status === "in-progress"
  );
  const recentCases = cases.filter((c) => !c.isArchived).slice(0, 4);
  const pendingAssessments = assessments.filter(
    (a) => a.scoreStatus === "Not started"
  ).length;

  // Recent activity timeline derived from check-ins / achieved goals.
  const activity = useMemo(() => {
    return [
      ...checkIns
        .filter((c) => !c.isArchived)
        .slice(0, 4)
        .map((c) => ({
          icon: <ClipboardCheck size={11} />,
          text: `check-in · case ${c.caseId}`,
          date: c.date,
        })),
      ...goals
        .filter((g) => !g.isArchived && g.status === "achieved")
        .slice(0, 2)
        .map((g) => ({
          icon: <CheckCircle size={11} />,
          text: `goal achieved · ${g.title}`,
          date: g.updatedAt.split("T")[0],
        })),
      ...transcripts
        .filter((t) => !t.isArchived)
        .slice(0, 2)
        .map((t) => ({
          icon: <ScrollText size={11} />,
          text: `transcript · ${t.title}`,
          date: t.createdAt.split("T")[0],
        })),
    ]
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 6);
  }, [checkIns, goals, transcripts]);

  // "On the desk" list — pinned material rail.
  const pinned: CurrentWorkItem[] = useMemo(() => {
    const items: CurrentWorkItem[] = [];
    const lastTranscript = transcripts.find((t) => !t.isArchived);
    if (lastTranscript) {
      items.push({
        id: `transcript-${lastTranscript.id}`,
        glyph: <ScrollText size={12} />,
        label: lastTranscript.title,
        sub: "transcript · recently coded",
        href: "/transcripts",
        tone: "berry",
      });
    }
    items.push({
      id: "quotes",
      glyph: <QuoteIcon size={12} />,
      label: "Quote bank",
      sub: "extract a line and tag it",
      href: "/research/quotes",
      tone: "plum",
    });
    items.push({
      id: "thinking",
      glyph: <SparklesIcon size={12} />,
      label: "Thinking",
      sub: "loose pieces on the wall",
      href: "/thinking",
      tone: "lav",
    });
    items.push({
      id: "thesis",
      glyph: <PenLine size={12} />,
      label: "Thesis writer · ch.4",
      sub: "last touched recently",
      href: "/thesis/writer",
      tone: "mauve",
    });
    return items;
  }, [transcripts]);

  return (
    <PaperStack>
      <WorkspaceHeader
        sectionMark={`${dateLine} · ${activeCases.length} active`}
        title={`${greeting},`}
        titleItalic="welcome back."
        subtitle={`${activeCases.length} active cases · ${activeGoals.length} goals in progress${
          needsReview.length > 0
            ? ` · ${needsReview.length} need review`
            : ""
        }.`}
        actions={
          <>
            <div style={{ display: "flex", gap: 6 }}>
              <Link href="/cases?action=new">
                <span className="desk-chip berry">+ new case</span>
              </Link>
              <Link href="/checkins?action=new">
                <span className="desk-chip plum">+ check-in</span>
              </Link>
              <Link href="/inbox">
                <span className="desk-chip">⌘ capture</span>
              </Link>
            </div>
            <AnnotationLabel tone="plum">
              ↳ today is steady. start with M.K., end light.
            </AnnotationLabel>
          </>
        }
      />

      {/* Main 3-column grid — collapses to 1 column under 1180px via
          .desk-3col so tablets in portrait stay usable. */}
      <div className="desk-3col">
        {/* LEFT COLUMN — agenda */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <DeskPanel
            title="today / agenda"
            meta={`${todayCheckIns.length} check-ins`}
          >
            <WorkingOn />
          </DeskPanel>

          <DeskPanel title="recent activity" controls={false}>
            {activity.length === 0 ? (
              <p
                style={{
                  fontSize: 12,
                  fontStyle: "italic",
                  color: "var(--ink-faded)",
                }}
              >
                Nothing yet — start by creating a case.
              </p>
            ) : (
              <ul
                style={{ listStyle: "none", padding: 0, margin: 0 }}
              >
                {activity.map((a, i) => (
                  <li
                    key={i}
                    style={{
                      display: "flex",
                      gap: 8,
                      alignItems: "flex-start",
                      padding: "6px 0",
                      borderBottom:
                        i < activity.length - 1
                          ? "1px dotted var(--border-light)"
                          : "none",
                    }}
                  >
                    <span
                      className="desk-mono"
                      style={{
                        fontSize: 9,
                        color: "var(--rose-dust)",
                        letterSpacing: "0.08em",
                        width: 56,
                        flexShrink: 0,
                        paddingTop: 3,
                      }}
                    >
                      {a.date}
                    </span>
                    <span
                      style={{
                        flex: 1,
                        fontSize: 12.5,
                        color: "var(--ink-soft)",
                      }}
                    >
                      <span style={{ color: "var(--mauve)", marginRight: 6 }}>
                        {a.icon}
                      </span>
                      {a.text}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </DeskPanel>

          <DeskPanel title="alerts" meta={`${needsReview.length}`}>
            {needsReview.length === 0 ? (
              <p
                style={{
                  fontSize: 12,
                  fontStyle: "italic",
                  color: "var(--ink-faded)",
                }}
              >
                Nothing flagged. Quiet desk.
              </p>
            ) : (
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {needsReview.map((c, i) => (
                  <li
                    key={c.id}
                    style={{
                      display: "flex",
                      gap: 8,
                      alignItems: "flex-start",
                      padding: "6px 0",
                      borderBottom:
                        i < needsReview.length - 1
                          ? "1px dotted var(--border-light)"
                          : "none",
                    }}
                  >
                    <AlertCircle size={11} style={{ color: "var(--berry)" }} />
                    <Link
                      href={`/cases/${c.id}`}
                      style={{
                        fontSize: 12.5,
                        color: "var(--ink-soft)",
                        textDecoration: "none",
                      }}
                    >
                      <span className="desk-serif" style={{ fontStyle: "italic" }}>
                        {c.code}
                      </span>{" "}
                      — {c.shortNote.slice(0, 60)}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </DeskPanel>
        </div>

        {/* CENTER COLUMN — active cases + recent trails */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <DeskPanel
            title="active cases"
            meta={`${activeCases.length} open · ${needsReview.length} review`}
            headerExtra={
              <span style={{ marginLeft: "auto", display: "flex", gap: 10 }}>
                <Link
                  href="/cases"
                  className="desk-mono"
                  style={{
                    fontSize: 9.5,
                    color: "var(--plum-mid)",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    borderBottom: "1px solid var(--plum-mid)",
                    textDecoration: "none",
                  }}
                >
                  all
                </Link>
                <Link
                  href="/cases?filter=this-week"
                  className="desk-mono"
                  style={{
                    fontSize: 9.5,
                    color: "var(--ink-faded)",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    textDecoration: "none",
                  }}
                >
                  week
                </Link>
              </span>
            }
          >
            {recentCases.length === 0 ? (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <p
                  className="desk-serif"
                  style={{
                    fontStyle: "italic",
                    color: "var(--ink-faded)",
                    fontSize: 13,
                  }}
                >
                  No cases yet.
                </p>
                <Link href="/cases?action=new">
                  <Button size="sm" className="mt-3">
                    Create first case
                  </Button>
                </Link>
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                }}
              >
                {recentCases.map((c, i) => {
                  const tone = CASE_TONES[i % CASE_TONES.length];
                  const isFeatured = i === 0;
                  return (
                    <MaterialCard
                      key={c.id}
                      tone={tone}
                      highlight={isFeatured}
                      href={`/cases/${c.id}`}
                      title={c.code}
                      meta={`${c.status}${
                        c.tags && c.tags.length > 0
                          ? ` · ${c.tags.slice(0, 2).join(" · ")}`
                          : ""
                      }`}
                      rightSlot={
                        <span className={`desk-chip ${tone}`}>
                          {c.type ? c.type.slice(0, 14) : "case"}
                        </span>
                      }
                    >
                      <div
                        className="desk-serif"
                        style={{
                          fontSize: 13,
                          fontStyle: "italic",
                          color: "var(--ink-soft)",
                          marginTop: 8,
                          lineHeight: 1.45,
                        }}
                      >
                        {c.shortNote || (
                          <span style={{ color: "var(--ink-ghost)" }}>
                            no notes yet — open to begin.
                          </span>
                        )}
                      </div>
                      {c.alerts && c.alerts.length > 0 && (
                        <div
                          style={{
                            marginTop: 10,
                            padding: "7px 9px",
                            background: "rgba(212,144,158,0.07)",
                            borderLeft: "2px solid var(--rose-dust)",
                            fontSize: 11.5,
                            color: "var(--ink-faded)",
                            fontStyle: "italic",
                          }}
                        >
                          {c.alerts[0]}
                        </div>
                      )}
                    </MaterialCard>
                  );
                })}
              </div>
            )}
          </DeskPanel>

          <DeskPanel
            title="recent trails"
            meta="continue where you left off"
            controls={false}
          >
            <RecentTrails />
          </DeskPanel>

          <DeskPanel
            title="quick stats"
            meta="today"
            controls={false}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr 1fr",
                gap: 12,
              }}
            >
              {[
                {
                  l: "active",
                  v: activeCases.length,
                  sub: `${needsReview.length} review`,
                },
                {
                  l: "check-ins",
                  v: todayCheckIns.length,
                  sub: "logged today",
                },
                {
                  l: "goals",
                  v: activeGoals.length,
                  sub: "in progress",
                },
                {
                  l: "assessments",
                  v: pendingAssessments,
                  sub: "pending",
                },
              ].map((s) => (
                <div key={s.l}>
                  <div
                    className="desk-serif"
                    style={{
                      fontSize: 24,
                      color: "var(--plum)",
                      fontWeight: 700,
                      lineHeight: 1,
                    }}
                  >
                    {s.v}
                  </div>
                  <div
                    className="desk-mono"
                    style={{
                      fontSize: 9,
                      color: "var(--rose-dust)",
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      marginTop: 4,
                    }}
                  >
                    {s.l}
                  </div>
                  <div
                    style={{
                      fontSize: 10.5,
                      color: "var(--ink-faded)",
                      marginTop: 1,
                    }}
                  >
                    {s.sub}
                  </div>
                </div>
              ))}
            </div>
          </DeskPanel>
        </div>

        {/* RIGHT COLUMN — thesis + pinned + goals */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <DeskPanel title="thesis · ch.4" meta="draft" tone="plum">
            <div
              className="desk-serif"
              style={{
                fontStyle: "italic",
                fontSize: 17,
                color: "var(--rose-pale)",
                lineHeight: 1.3,
              }}
            >
              When the body holds
              <br />
              what words will not.
            </div>
            <div
              className="desk-mono"
              style={{
                fontSize: 9,
                color: "rgba(234,197,204,0.55)",
                letterSpacing: "0.14em",
                marginTop: 6,
                textTransform: "uppercase",
              }}
            >
              last touched recently
            </div>
            <div
              style={{
                marginTop: 12,
                padding: 10,
                background: "rgba(255,255,255,0.05)",
                borderLeft: "2px solid var(--rose-dust)",
              }}
            >
              <Link
                href="/thesis/writer"
                className="desk-hand"
                style={{
                  color: "var(--rose-pale)",
                  fontSize: 15,
                  lineHeight: 1.4,
                  textDecoration: "none",
                }}
              >
                pick up where you stopped. it&rsquo;s still there.
              </Link>
            </div>
          </DeskPanel>

          <DeskPanel
            title="pinned / on the desk"
            meta={`${pinned.length}`}
            controls={false}
          >
            <CurrentWorkRail items={pinned} />
          </DeskPanel>

          <DeskPanel
            title="goals · progress"
            meta={`${activeGoals.length}`}
            controls={false}
          >
            {activeGoals.length === 0 ? (
              <div style={{ textAlign: "center", padding: "12px 0" }}>
                <Target
                  size={20}
                  style={{ color: "var(--ink-faded)", margin: "0 auto" }}
                />
                <p
                  className="desk-serif"
                  style={{
                    fontStyle: "italic",
                    color: "var(--ink-faded)",
                    fontSize: 12,
                    marginTop: 4,
                  }}
                >
                  No active goals.
                </p>
              </div>
            ) : (
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {activeGoals.slice(0, 5).map((g, i) => (
                  <li
                    key={g.id}
                    style={{
                      padding: "6px 0",
                      borderBottom:
                        i < Math.min(activeGoals.length, 5) - 1
                          ? "1px dotted var(--border-light)"
                          : "none",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 8,
                      }}
                    >
                      <span
                        className="desk-serif"
                        style={{
                          fontSize: 13,
                          fontStyle: "italic",
                          color: "var(--plum-mid)",
                          flex: 1,
                          minWidth: 0,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {g.title}
                      </span>
                      <span
                        className="desk-mono"
                        style={{
                          fontSize: 9,
                          color: "var(--ink-faded)",
                          letterSpacing: "0.08em",
                        }}
                      >
                        {g.progress}%
                      </span>
                    </div>
                    <div className="desk-bar" style={{ marginTop: 4, height: 3 }}>
                      <i style={{ width: `${g.progress}%` }} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </DeskPanel>
        </div>
      </div>

      {/* Floating stickies — the "lived-in" energy. Only one per side. */}
      <PinnedNote
        tone="y"
        rot={-3}
        pin
        author="to self"
        style={{ top: 56, left: "calc(300px + 24px)", width: 180, zIndex: 60 }}
      >
        keep mornings light.<br />
        review check-ins{" "}
        <span className="squiggle">after</span> the first session, not before.
      </PinnedNote>

      <PinnedNote
        tone="p"
        rot={2.2}
        author="last night"
        style={{ bottom: 80, right: 360, width: 180, zIndex: 60 }}
      >
        if two clients share a pattern this week —{" "}
        <em>write it down before you forget.</em>
      </PinnedNote>

      {/* Fallback CTA when truly empty — only render when there are no cases yet. */}
      {cases.length === 0 && (
        <div style={{ marginTop: 18, textAlign: "center" }}>
          <Link href="/cases?action=new">
            <Button size="md">
              <FolderOpen size={14} /> Create your first case
            </Button>
          </Link>
        </div>
      )}
    </PaperStack>
  );
}
