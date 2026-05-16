"use client";
import Link from "next/link";
import {
  FolderOpen,
  ClipboardCheck,
  Brain,
  FileText,
  Grid3X3,
  Plus,
  AlertCircle,
  Sparkles,
  Target,
  ScrollText,
  CheckCircle,
} from "lucide-react";
import { StatCard } from "@/components/shared/StatCard";
import { SectionCard } from "@/components/shared/SectionCard";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useApp } from "@/contexts/AppContext";

const today = new Date();
const displayDate = today.toLocaleDateString("en-US", {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
});

const quickActions = [
  { label: "New Case", icon: FolderOpen, href: "/cases?action=new", color: "var(--psych-primary)" },
  { label: "Check-in", icon: ClipboardCheck, href: "/checkins?action=new", color: "#3B82F6" },
  { label: "New Goal", icon: Target, href: "/goals?action=new", color: "#10B981" },
  { label: "Transcript", icon: ScrollText, href: "/transcripts?action=new", color: "#F59E0B" },
  { label: "Print Grid", icon: Grid3X3, href: "/grids", color: "#8B5CF6" },
  { label: "Report", icon: FileText, href: "/reports", color: "#EC4899" },
];

export default function DashboardPage() {
  const { cases, checkIns, goals, transcripts, assessments } = useApp();

  const activeCases = cases.filter((c) => !c.isArchived && c.status === "Active");
  const needsReview = cases.filter((c) => !c.isArchived && c.status === "Needs Review");
  const todayStr = today.toISOString().split("T")[0];
  const todayCheckIns = checkIns.filter((c) => c.date === todayStr && !c.isArchived);
  const activeGoals = goals.filter((g) => !g.isArchived && g.status === "in-progress");
  const achievedGoals = goals.filter((g) => !g.isArchived && g.status === "achieved");
  const recentCases = cases.filter((c) => !c.isArchived).slice(0, 3);
  const pendingAssessments = assessments.filter((a) => a.scoreStatus === "Not started").length;

  const avgProgress =
    activeGoals.length > 0
      ? Math.round(activeGoals.reduce((s, g) => s + g.progress, 0) / activeGoals.length)
      : 0;

  const greetingHour = today.getHours();
  const greeting =
    greetingHour < 12 ? "Good morning" : greetingHour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">

      {/* Hero */}
      <div
        className="relative rounded-3xl p-6 md:p-8 overflow-hidden"
        style={{
          background: "linear-gradient(135deg, var(--psych-gradient-from), var(--psych-gradient-to))",
          border: "1px solid var(--psych-border)",
        }}
      >
        {/* Decorative orbs */}
        <div className="orb orb-primary decorative" style={{ width: 180, height: 180, top: -40, right: -40 }} />
        <div className="orb orb-accent decorative" style={{ width: 100, height: 100, bottom: -20, right: 120 }} />

        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={14} className="animate-sparkle" style={{ color: "var(--psych-primary)" }} />
            <span className="text-xs font-medium" style={{ color: "var(--psych-primary)" }}>
              {displayDate}
            </span>
          </div>
          <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--psych-text)" }}>
            {greeting} ✦
          </h1>
          <p className="text-sm" style={{ color: "var(--psych-muted)" }}>
            {activeCases.length} active cases · {activeGoals.length} goals in progress
            {needsReview.length > 0 && ` · ${needsReview.length} need review`}
          </p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          {
            label: "Active Cases",
            value: activeCases.length,
            icon: <FolderOpen size={16} />,
            color: "var(--psych-primary)",
            sub: `${needsReview.length} need review`,
          },
          {
            label: "Today's Check-ins",
            value: todayCheckIns.length,
            icon: <ClipboardCheck size={16} />,
            color: "#3B82F6",
            sub: "logged today",
          },
          {
            label: "Goals In Progress",
            value: activeGoals.length,
            icon: <Target size={16} />,
            color: "#10B981",
            sub: `${achievedGoals.length} achieved`,
          },
          {
            label: "Assessments Pending",
            value: pendingAssessments,
            icon: <Brain size={16} />,
            color: "#F59E0B",
            sub: "not started",
          },
        ].map((s, i) => (
          <StatCard
            key={s.label}
            label={s.label}
            value={String(s.value)}
            icon={s.icon}
            color={s.color}
            subtext={s.sub}
            delay={i * 50}
          />
        ))}
      </div>

      {/* Quick actions */}
      <SectionCard title="Quick Actions" className="animate-fade-up delay-2">
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
          {quickActions.map((action) => (
            <Link key={action.href} href={action.href}>
              <div
                className="flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all hover:scale-105 cursor-pointer text-center"
                style={{
                  backgroundColor: "var(--psych-bg)",
                  borderColor: "var(--psych-border)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = action.color;
                  (e.currentTarget as HTMLElement).style.backgroundColor = "var(--psych-primary-light)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = "var(--psych-border)";
                  (e.currentTarget as HTMLElement).style.backgroundColor = "var(--psych-bg)";
                }}
              >
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: action.color + "20" }}
                >
                  <action.icon size={16} style={{ color: action.color }} />
                </div>
                <span className="text-[11px] font-medium leading-tight" style={{ color: "var(--psych-text)" }}>
                  {action.label}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </SectionCard>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent cases */}
        <div className="lg:col-span-2 animate-fade-up delay-3">
          <SectionCard
            title="Recent Cases"
            action={
              <Link href="/cases">
                <Button variant="ghost" size="sm">View all</Button>
              </Link>
            }
          >
            {recentCases.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm" style={{ color: "var(--psych-muted)" }}>No cases yet</p>
                <Link href="/cases?action=new">
                  <Button size="sm" className="mt-3">
                    <Plus size={13} /> Create First Case
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {recentCases.map((c) => (
                  <Link key={c.id} href={`/cases/${c.id}`}>
                    <div
                      className="flex items-center gap-3 p-3 rounded-xl border transition-all hover:scale-[1.01] cursor-pointer"
                      style={{
                        backgroundColor: "var(--psych-bg)",
                        borderColor: "var(--psych-border)",
                      }}
                    >
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                        style={{ background: "linear-gradient(135deg, var(--psych-primary), var(--psych-accent))" }}
                      >
                        {c.code.slice(0, 1)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium font-mono" style={{ color: "var(--psych-text)" }}>
                          {c.code}
                        </p>
                        <p className="text-xs truncate" style={{ color: "var(--psych-muted)" }}>
                          {c.shortNote}
                        </p>
                      </div>
                      <span
                        className="text-[10px] px-2 py-0.5 rounded-full flex-shrink-0"
                        style={{
                          backgroundColor:
                            c.status === "Active"
                              ? "#D1FAE5"
                              : c.status === "Needs Review"
                              ? "#FEE2E2"
                              : "var(--psych-primary-light)",
                          color:
                            c.status === "Active"
                              ? "#065F46"
                              : c.status === "Needs Review"
                              ? "#991B1B"
                              : "var(--psych-primary)",
                        }}
                      >
                        {c.status}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </SectionCard>
        </div>

        {/* Goals snapshot */}
        <div className="animate-fade-up delay-4">
          <SectionCard
            title="Goals"
            action={
              <Link href="/goals">
                <Button variant="ghost" size="sm">View all</Button>
              </Link>
            }
          >
            {activeGoals.length === 0 ? (
              <div className="text-center py-6">
                <Target size={24} className="mx-auto mb-2" style={{ color: "var(--psych-muted)" }} />
                <p className="text-xs" style={{ color: "var(--psych-muted)" }}>No active goals</p>
                <Link href="/goals?action=new">
                  <Button size="sm" className="mt-3">
                    <Plus size={13} /> Add Goal
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span style={{ color: "var(--psych-muted)" }}>Avg. progress</span>
                  <span className="font-medium" style={{ color: "var(--psych-primary)" }}>{avgProgress}%</span>
                </div>
                <ProgressBar value={avgProgress} size="md" />
                <div className="space-y-2.5 mt-3">
                  {activeGoals.slice(0, 4).map((g) => (
                    <div key={g.id} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="text-xs truncate flex-1" style={{ color: "var(--psych-text)" }}>
                          {g.title}
                        </p>
                        <span className="text-[10px] ml-2 flex-shrink-0" style={{ color: "var(--psych-muted)" }}>
                          {g.progress}%
                        </span>
                      </div>
                      <ProgressBar value={g.progress} size="xs" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </SectionCard>
        </div>
      </div>

      {/* Alerts */}
      {(needsReview.length > 0 || cases.filter((c) => c.alerts && c.alerts.length > 0 && !c.isArchived).length > 0) && (
        <SectionCard className="animate-fade-up delay-5">
          <div className="flex items-start gap-3">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: "#FEE2E2" }}
            >
              <AlertCircle size={16} style={{ color: "#DC2626" }} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium mb-2" style={{ color: "var(--psych-text)" }}>
                Alerts
              </p>
              <div className="space-y-1">
                {needsReview.map((c) => (
                  <Link key={c.id} href={`/cases/${c.id}`}>
                    <p className="text-xs hover:underline" style={{ color: "#DC2626" }}>
                      ✦ {c.code} — needs review
                    </p>
                  </Link>
                ))}
                {cases
                  .filter((c) => c.alerts && c.alerts.length > 0 && !c.isArchived)
                  .map((c) =>
                    c.alerts!.map((alert, i) => (
                      <p key={i} className="text-xs" style={{ color: "var(--psych-muted)" }}>
                        · {c.code}: {alert}
                      </p>
                    ))
                  )}
              </div>
            </div>
          </div>
        </SectionCard>
      )}

      {/* Recent activity */}
      <SectionCard title="Recent Activity" className="animate-fade-up delay-5">
        <div className="space-y-2">
          {[
            ...checkIns.filter((c) => !c.isArchived).slice(0, 2).map((c) => ({
              icon: <ClipboardCheck size={12} />,
              text: `Check-in logged for case ${c.caseId}`,
              date: c.date,
              color: "#3B82F6",
            })),
            ...goals.filter((g) => !g.isArchived && g.status === "achieved").slice(0, 1).map((g) => ({
              icon: <CheckCircle size={12} />,
              text: `Goal achieved: ${g.title}`,
              date: g.updatedAt.split("T")[0],
              color: "#10B981",
            })),
            ...transcripts.filter((t) => !t.isArchived).slice(0, 1).map((t) => ({
              icon: <ScrollText size={12} />,
              text: `Transcript: ${t.title}`,
              date: t.createdAt.split("T")[0],
              color: "#F59E0B",
            })),
          ]
            .sort((a, b) => b.date.localeCompare(a.date))
            .slice(0, 5)
            .map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-xs py-1">
                <div
                  className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: item.color + "20", color: item.color }}
                >
                  {item.icon}
                </div>
                <span className="flex-1" style={{ color: "var(--psych-text)" }}>{item.text}</span>
                <span style={{ color: "var(--psych-muted)" }}>{item.date}</span>
              </div>
            ))}
          {checkIns.length === 0 && goals.length === 0 && (
            <p className="text-xs text-center py-4" style={{ color: "var(--psych-muted)" }}>
              No activity yet — start by creating a case ✦
            </p>
          )}
        </div>
      </SectionCard>
    </div>
  );
}
