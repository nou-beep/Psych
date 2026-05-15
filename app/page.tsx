"use client";
// Dashboard — the home page of Psych. Shows daily check-ins, recent cases,
// stat cards, quick actions, and assessment reminders.

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
  Calendar,
  TrendingUp,
} from "lucide-react";
import { StatCard } from "@/components/shared/StatCard";
import { CaseCard } from "@/components/shared/CaseCard";
import { SectionCard } from "@/components/shared/SectionCard";
import { Button } from "@/components/ui/button";
import { Badge, getStatusVariant } from "@/components/ui/badge";
import {
  mockCases,
  mockDailyCheckIns,
  mockAssessments,
} from "@/lib/mock-data";

// Today's date for display
const today = new Date();
const todayStr = today.toLocaleDateString("en-CA"); // YYYY-MM-DD
const displayDate = today.toLocaleDateString("en-US", {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
});

const quickActions = [
  { label: "New Case", icon: FolderOpen, href: "/cases", color: "#F43F5E" },
  { label: "Check-in", icon: ClipboardCheck, href: "/checkins", color: "#8B5CF6" },
  { label: "Assessment", icon: Brain, href: "/assessments", color: "#0EA5E9" },
  { label: "Report", icon: FileText, href: "/reports", color: "#F97316" },
  { label: "Print Grid", icon: Grid3X3, href: "/grids", color: "#10B981" },
];

export default function Dashboard() {
  const activeCases = mockCases.filter((c) => c.status === "Active").length;
  const needsReview = mockCases.filter((c) => c.status === "Needs Review").length;
  const pendingReports = mockCases.filter(
    (c) => c.status === "Active" || c.status === "Needs Review"
  ).length;
  const recentCheckIns = mockDailyCheckIns.slice(0, 3);
  const recentCases = mockCases.slice(0, 3);
  const assessmentsDue = mockAssessments.filter((a) => a.lastCompleted === null).length;

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">

      {/* Welcome hero */}
      <div
        className="relative rounded-3xl p-6 md:p-8 overflow-hidden"
        style={{
          background: "linear-gradient(135deg, var(--psych-gradient-from), var(--psych-gradient-to))",
          border: "1px solid var(--psych-border)",
        }}
      >
        {/* Decorative sparkles */}
        <div className="absolute top-4 right-6 decorative opacity-30">
          <Sparkles size={32} style={{ color: "var(--psych-primary)" }} />
        </div>
        <div className="absolute top-10 right-16 decorative opacity-20">
          <Sparkles size={16} style={{ color: "var(--psych-accent)" }} />
        </div>
        <div className="absolute bottom-4 right-10 decorative opacity-20 text-2xl">✦</div>

        <p
          className="text-xs font-semibold uppercase tracking-widest mb-1"
          style={{ color: "var(--psych-primary)" }}
        >
          {displayDate}
        </p>
        <h2
          className="text-2xl md:text-3xl font-bold mb-2"
          style={{ color: "var(--psych-text)" }}
        >
          Welcome back ✦
        </h2>
        <p className="text-sm max-w-lg" style={{ color: "var(--psych-muted)" }}>
          Your clinical workspace is ready. You have{" "}
          <strong style={{ color: "var(--psych-primary)" }}>{activeCases} active cases</strong>
          {needsReview > 0 && (
            <>
              {" "}and{" "}
              <strong style={{ color: "#DC2626" }}>{needsReview} needing review</strong>
            </>
          )}
          .
        </p>
      </div>

      {/* Quick actions */}
      <div>
        <h3
          className="text-xs font-semibold uppercase tracking-widest mb-3"
          style={{ color: "var(--psych-muted)" }}
        >
          Quick actions
        </h3>
        <div className="flex flex-wrap gap-2">
          {quickActions.map(({ label, icon: Icon, href, color }) => (
            <Link key={href} href={href}>
              <button
                className="flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all hover:scale-105 hover:shadow-md"
                style={{
                  backgroundColor: "var(--psych-card)",
                  borderColor: "var(--psych-border)",
                  color: "var(--psych-text)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = color;
                  (e.currentTarget as HTMLElement).style.color = color;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = "var(--psych-border)";
                  (e.currentTarget as HTMLElement).style.color = "var(--psych-text)";
                }}
              >
                <Plus size={13} />
                <Icon size={14} />
                {label}
              </button>
            </Link>
          ))}
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Active Cases"
          value={activeCases}
          icon={FolderOpen}
          trend="+1 this month"
          trendPositive
        />
        <StatCard
          label="Pending Reports"
          value={pendingReports}
          icon={FileText}
          trend="2 due this week"
          trendPositive={false}
        />
        <StatCard
          label="Check-ins (week)"
          value={recentCheckIns.length}
          icon={ClipboardCheck}
          trend="Logged today"
          trendPositive
        />
        <StatCard
          label="Assessments Due"
          value={assessmentsDue}
          icon={Brain}
          trend="Not yet started"
          trendPositive={false}
        />
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Today's check-ins */}
        <SectionCard
          title="Today's Check-ins"
          description={todayStr}
          headerAction={
            <Link href="/checkins">
              <Button variant="ghost" size="sm">+ New</Button>
            </Link>
          }
        >
          {recentCheckIns.length > 0 ? (
            <div className="space-y-3">
              {recentCheckIns.map((checkIn) => {
                const relatedCase = mockCases.find((c) => c.id === checkIn.caseId);
                return (
                  <div
                    key={checkIn.id}
                    className="flex items-start gap-3 p-3 rounded-xl"
                    style={{ backgroundColor: "var(--psych-bg)" }}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold"
                      style={{
                        backgroundColor: "var(--psych-primary-light)",
                        color: "var(--psych-primary)",
                      }}
                    >
                      <ClipboardCheck size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className="text-xs font-mono font-bold"
                          style={{ color: "var(--psych-primary)" }}
                        >
                          {relatedCase?.code ?? checkIn.caseId}
                        </span>
                        <span
                          className="text-xs"
                          style={{ color: "var(--psych-muted)" }}
                        >
                          {checkIn.date}
                        </span>
                      </div>
                      <p
                        className="text-xs mt-0.5 line-clamp-1"
                        style={{ color: "var(--psych-muted)" }}
                      >
                        {checkIn.contextType}
                      </p>
                      {checkIn.followUpNeeded && (
                        <span className="inline-flex items-center gap-1 text-[10px] mt-1" style={{ color: "#92400E" }}>
                          <AlertCircle size={10} /> Follow-up needed
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-center py-6" style={{ color: "var(--psych-muted)" }}>
              No check-ins logged today yet.
            </p>
          )}
        </SectionCard>

        {/* Assessment reminders */}
        <SectionCard
          title="Assessment Reminders"
          description="Not yet completed"
          headerAction={
            <Link href="/assessments">
              <Button variant="ghost" size="sm">View all</Button>
            </Link>
          }
        >
          <div className="space-y-2">
            {mockAssessments
              .filter((a) => a.lastCompleted === null || a.scoreStatus === "Not started")
              .map((assessment) => (
                <div
                  key={assessment.id}
                  className="flex items-center justify-between p-3 rounded-xl"
                  style={{ backgroundColor: "var(--psych-bg)" }}
                >
                  <div>
                    <p
                      className="text-xs font-semibold"
                      style={{ color: "var(--psych-text)" }}
                    >
                      {assessment.title}
                    </p>
                    <p className="text-[10px]" style={{ color: "var(--psych-muted)" }}>
                      {assessment.category} · Not started
                    </p>
                  </div>
                  <Link href="/assessments">
                    <Button variant="secondary" size="sm">
                      Open
                    </Button>
                  </Link>
                </div>
              ))}
          </div>
        </SectionCard>
      </div>

      {/* Recent cases */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3
            className="text-sm font-semibold flex items-center gap-2"
            style={{ color: "var(--psych-text)" }}
          >
            <TrendingUp size={14} style={{ color: "var(--psych-primary)" }} />
            Recent Cases
          </h3>
          <Link href="/cases">
            <Button variant="ghost" size="sm">View all cases →</Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recentCases.map((c) => (
            <CaseCard key={c.id} caseData={c} />
          ))}
        </div>
      </div>

      {/* Weekly snapshot */}
      <SectionCard title="Weekly Snapshot" description="Current week overview">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Sessions held", value: "4", icon: "📅" },
            { label: "Check-ins logged", value: "5", icon: "✅" },
            { label: "Reports pending", value: "3", icon: "📄" },
            { label: "Reviews due", value: "2", icon: "🔍" },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-xl p-4 text-center"
              style={{ backgroundColor: "var(--psych-bg)" }}
            >
              <div className="text-2xl mb-1">{item.icon}</div>
              <div
                className="text-xl font-bold"
                style={{ color: "var(--psych-primary)" }}
              >
                {item.value}
              </div>
              <div
                className="text-[10px] font-medium uppercase tracking-wide mt-0.5"
                style={{ color: "var(--psych-muted)" }}
              >
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

    </div>
  );
}
