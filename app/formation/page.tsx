"use client";
// Formation Portal dashboard — academic + training workspace overview.
// Surfaces thesis progress, internship cases, grids, supervision and
// upcoming deadlines side by side so the trainee sees both tracks at
// a glance.

import Link from "next/link";
import {
  GraduationCap,
  Briefcase,
  FlaskConical,
  FileText,
  Grid3X3,
  Sparkles,
  ArrowRight,
  ClipboardCheck,
  UserCheck,
  BookMarked,
  Plus,
  CalendarRange,
  ScrollText,
} from "lucide-react";
import { StatCard } from "@/components/shared/StatCard";
import { SectionCard } from "@/components/shared/SectionCard";
import { Button } from "@/components/ui/button";
import { TodayPanel } from "@/components/workspace/TodayPanel";
import { MemoryRail } from "@/components/workspace/MemoryRail";
import { useThesis } from "@/contexts/ThesisContext";
import { useInternship } from "@/contexts/InternshipContext";
import { useLocale, useT } from "@/contexts/LocaleContext";
import { computeFormationToday } from "@/lib/clinical/today";

const quickActionConfig = [
  { labelKey: "formation.dashboard.quickActions.thesisOverview", icon: GraduationCap, href: "/formation/thesis", tint: "#8E72CC" },
  { labelKey: "formation.dashboard.quickActions.thesisWriter", icon: FileText, href: "/formation/thesis/writer", tint: "#5B36A8" },
  { labelKey: "formation.dashboard.quickActions.internshipOverview", icon: Briefcase, href: "/formation/internship", tint: "#9F1239" },
  { labelKey: "formation.dashboard.quickActions.testsGrids", icon: Grid3X3, href: "/formation/internship/tests-grids", tint: "#3B82F6" },
  { labelKey: "formation.dashboard.quickActions.supervision", icon: UserCheck, href: "/formation/internship/supervision", tint: "#10B981" },
  { labelKey: "formation.dashboard.quickActions.literature", icon: BookMarked, href: "/formation/thesis/literature", tint: "#F59E0B" },
];

export default function FormationDashboardPage() {
  const thesis = useThesis();
  const internship = useInternship();
  const t = useT();
  const { formatDate } = useLocale();

  const today = new Date();
  const displayDate = formatDate(today, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const activeCases = internship.cases.filter((c) => !c.archived);
  const recentCases = activeCases.slice(0, 4);

  const pendingGrids = internship.grids.filter(
    (g) => g.entries.length === 0
  ).length;
  const testsAwaitingScore = internship.tests.filter(
    (test) =>
      test.status === "planned" ||
      test.status === "administered" ||
      test.status === "awaiting-scoring"
  ).length;
  const reportsToFinalize = internship.reports.filter((r) => r.draft).length;
  const supervisionNotes = internship.supervision.length;

  const thesisComplete = thesis.completeParticipants.length;
  const thesisMissing = thesis.missingDataCount;
  const reportSectionCount = Object.values(thesis.reportSections).filter(
    (v) => typeof v === "string" && v.trim().length > 0
  ).length;
  const noteCount = thesis.notes.length;

  const greetingHour = today.getHours();
  const greeting =
    greetingHour < 12
      ? t("formation.dashboard.hero.greetingMorning")
      : greetingHour < 17
        ? t("formation.dashboard.hero.greetingAfternoon")
        : t("formation.dashboard.hero.greetingEvening");

  const todayItems = computeFormationToday({
    draftReportCount: reportsToFinalize,
    pendingGridCount: pendingGrids,
    testsAwaitingScore,
    supervisionNoteCount: supervisionNotes,
    thesisMissingDataCount: thesisMissing,
    thesisReportSectionsDrafted: reportSectionCount,
    activeInternshipCases: activeCases.length,
    todayISO: today.toISOString().split("T")[0],
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      {/* Hero */}
      <div
        className="relative rounded-3xl p-6 md:p-8 overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, rgba(140,100,200,0.10), rgba(199,178,224,0.08))",
          border: "1px solid var(--psych-border)",
        }}
      >
        <div
          className="orb orb-primary decorative"
          style={{
            width: 180,
            height: 180,
            top: -40,
            right: -40,
            background: "#B49AE2",
            opacity: 0.18,
          }}
        />
        <div
          className="orb orb-accent decorative"
          style={{
            width: 100,
            height: 100,
            bottom: -20,
            right: 120,
            background: "#C7B2E0",
            opacity: 0.16,
          }}
        />

        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles
              size={14}
              className="animate-sparkle"
              style={{ color: "#8E72CC" }}
            />
            <span
              className="text-xs font-medium"
              style={{ color: "#5B36A8" }}
            >
              {displayDate}
            </span>
          </div>
          <h1
            className="text-2xl font-bold mb-1"
            style={{ color: "var(--psych-text)" }}
          >
            {greeting}, Nouhaila ✦
          </h1>
          <p className="text-sm" style={{ color: "var(--psych-muted)" }}>
            {t("formation.dashboard.hero.subtitle")}
          </p>
        </div>
      </div>

      {/* Today layer + Memory Rail — psychologically-native frame */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4">
        <TodayPanel items={todayItems} />
        <div style={{ minHeight: 220 }}>
          <MemoryRail density="comfortable" />
        </div>
      </div>

      {/* Stat cards — formation-specific */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          label={t("formation.dashboard.stats.internshipCases")}
          value={String(activeCases.length)}
          icon={<Briefcase size={16} />}
          color="#9F1239"
          subtext={
            activeCases.length === 0
              ? t("formation.dashboard.stats.internshipCasesNone")
              : t("formation.dashboard.stats.internshipCasesActive")
          }
          delay={0}
        />
        <StatCard
          label={t("formation.dashboard.stats.gridsPending")}
          value={String(pendingGrids)}
          icon={<Grid3X3 size={16} />}
          color="#3B82F6"
          subtext={t("formation.dashboard.stats.gridsPendingSub", { count: testsAwaitingScore })}
          delay={50}
        />
        <StatCard
          label={t("formation.dashboard.stats.reportsToFinalize")}
          value={String(reportsToFinalize)}
          icon={<FileText size={16} />}
          color="#F59E0B"
          subtext={t("formation.dashboard.stats.reportsToFinalizeSub")}
          delay={100}
        />
        <StatCard
          label={t("formation.dashboard.stats.thesisParticipants")}
          value={String(thesisComplete)}
          icon={<FlaskConical size={16} />}
          color="#8E72CC"
          subtext={t("formation.dashboard.stats.thesisParticipantsSub", { count: thesisMissing })}
          delay={150}
        />
      </div>

      {/* Quick actions */}
      <SectionCard
        title={t("formation.dashboard.quickActions.title")}
        className="animate-fade-up delay-2"
      >
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
          {quickActionConfig.map((action) => (
            <Link key={action.labelKey} href={action.href}>
              <div
                className="flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all hover:scale-105 cursor-pointer text-center"
                style={{
                  backgroundColor: "var(--psych-bg)",
                  borderColor: "var(--psych-border)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor =
                    action.tint;
                  (e.currentTarget as HTMLElement).style.backgroundColor =
                    "var(--psych-primary-light)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor =
                    "var(--psych-border)";
                  (e.currentTarget as HTMLElement).style.backgroundColor =
                    "var(--psych-bg)";
                }}
              >
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: action.tint + "20" }}
                >
                  <action.icon size={16} style={{ color: action.tint }} />
                </div>
                <span
                  className="text-[11px] font-medium leading-tight"
                  style={{ color: "var(--psych-text)" }}
                >
                  {t(action.labelKey)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </SectionCard>

      {/* Two-column: Thesis snapshot + Internship snapshot */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Thesis */}
        <SectionCard
          title={t("formation.dashboard.thesis.title")}
          action={
            <Link href="/formation/thesis">
              <Button variant="ghost" size="sm">
                {t("common.open")} <ArrowRight size={12} />
              </Button>
            </Link>
          }
        >
          <div className="space-y-3">
            <ThesisRow
              icon={<FlaskConical size={14} />}
              label={t("formation.dashboard.thesis.completeParticipants")}
              value={String(thesisComplete)}
              hint={t("formation.dashboard.thesis.completeParticipantsHint", { missing: thesisMissing })}
              tint="#8E72CC"
            />
            <ThesisRow
              icon={<FileText size={14} />}
              label={t("formation.dashboard.thesis.reportSections")}
              value={String(reportSectionCount)}
              hint={t("formation.dashboard.thesis.reportSectionsHint")}
              tint="#5B36A8"
            />
            <ThesisRow
              icon={<ScrollText size={14} />}
              label={t("formation.dashboard.thesis.notes")}
              value={String(noteCount)}
              hint={t("formation.dashboard.thesis.notesHint")}
              tint="#7C4FB3"
            />
            <ThesisRow
              icon={<BookMarked size={14} />}
              label={t("formation.dashboard.thesis.variables")}
              value={String(
                thesis.design.independentVariables.length +
                  thesis.design.dependentVariables.length +
                  thesis.design.controlVariables.length
              )}
              hint={t("formation.dashboard.thesis.variablesHint")}
              tint="#3B82F6"
            />
            <div className="pt-2 flex gap-2">
              <Link href="/formation/thesis" className="flex-1">
                <Button size="sm" variant="outline" className="w-full">
                  {t("formation.dashboard.thesis.openDashboard")}
                </Button>
              </Link>
              <Link href="/formation/thesis/writer" className="flex-1">
                <Button size="sm" className="w-full">
                  <FileText size={12} /> {t("formation.dashboard.thesis.openWriter")}
                </Button>
              </Link>
            </div>
          </div>
        </SectionCard>

        {/* Internship */}
        <SectionCard
          title={t("formation.dashboard.internship.title")}
          action={
            <Link href="/formation/internship">
              <Button variant="ghost" size="sm">
                {t("common.open")} <ArrowRight size={12} />
              </Button>
            </Link>
          }
        >
          {recentCases.length === 0 ? (
            <div className="text-center py-8">
              <Briefcase
                size={24}
                className="mx-auto mb-2"
                style={{ color: "var(--psych-muted)" }}
              />
              <p
                className="text-xs"
                style={{ color: "var(--psych-muted)" }}
              >
                {t("formation.dashboard.internship.none")}
              </p>
              <Link href="/formation/internship">
                <Button size="sm" className="mt-3">
                  <Plus size={13} /> {t("formation.dashboard.internship.openStudio")}
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {recentCases.map((c) => (
                <Link
                  key={c.id}
                  href={`/formation/internship/cases/${c.id}`}
                >
                  <div
                    className="flex items-center gap-3 p-3 rounded-xl border transition-all hover:scale-[1.01] cursor-pointer"
                    style={{
                      backgroundColor: "var(--psych-bg)",
                      borderColor: "var(--psych-border)",
                    }}
                  >
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                      style={{
                        background:
                          "linear-gradient(135deg, #8E72CC, #B49AE2)",
                      }}
                    >
                      {(c.identification.caseCode ?? "??").slice(-2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-sm font-medium font-mono"
                        style={{ color: "var(--psych-text)" }}
                      >
                        {c.identification.caseCode}
                      </p>
                      <p
                        className="text-xs truncate"
                        style={{ color: "var(--psych-muted)" }}
                      >
                        {c.identification.age ?? t("formation.dashboard.internship.ageMissing")}
                        {c.identification.diagnosticContext
                          ? ` · ${c.identification.diagnosticContext}`
                          : ""}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
              <div className="pt-2 flex gap-2">
                <Link href="/formation/internship/tests-grids" className="flex-1">
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full"
                  >
                    <Grid3X3 size={12} /> {t("formation.dashboard.internship.testsGrids")}
                  </Button>
                </Link>
                <Link href="/formation/internship/supervision" className="flex-1">
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full"
                  >
                    <UserCheck size={12} /> {t("formation.dashboard.internship.supervision")}
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </SectionCard>
      </div>

      {/* Bottom row — supervision + upcoming */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SectionCard
            title={t("formation.dashboard.supervision.title")}
            action={
              <Link href="/formation/internship/supervision">
                <Button variant="ghost" size="sm">
                  {t("formation.dashboard.supervision.allNotes")}
                </Button>
              </Link>
            }
          >
            {supervisionNotes === 0 ? (
              <div className="text-center py-6">
                <UserCheck
                  size={20}
                  className="mx-auto mb-2"
                  style={{ color: "var(--psych-muted)" }}
                />
                <p
                  className="text-xs"
                  style={{ color: "var(--psych-muted)" }}
                >
                  {t("formation.dashboard.supervision.none")}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {internship.supervision.slice(0, 4).map((note) => (
                  <div
                    key={note.id}
                    className="flex items-center gap-3 p-3 rounded-xl border"
                    style={{
                      backgroundColor: "var(--psych-bg)",
                      borderColor: "var(--psych-border)",
                    }}
                  >
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-white flex-shrink-0"
                      style={{
                        background:
                          "linear-gradient(135deg, #10B981, #3B82F6)",
                      }}
                    >
                      <UserCheck size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-sm font-medium truncate"
                        style={{ color: "var(--psych-text)" }}
                      >
                        {note.clinicalQuestions ??
                          note.casesDiscussed ??
                          t("formation.dashboard.supervision.fallbackLabel")}
                      </p>
                      <p
                        className="text-xs truncate"
                        style={{ color: "var(--psych-muted)" }}
                      >
                        {note.date}
                        {note.supervisor
                          ? ` · ${note.supervisor}`
                          : ""}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </div>

        {/* Upcoming */}
        <div>
          <SectionCard
            title={t("formation.dashboard.upcoming.title")}
            action={
              <Link href="/formation/calendar">
                <Button variant="ghost" size="sm">
                  {t("formation.dashboard.upcoming.viewCalendar")}
                </Button>
              </Link>
            }
          >
            <div className="space-y-3 text-xs">
              <UpcomingRow
                icon={<CalendarRange size={12} />}
                label={t("formation.dashboard.upcoming.nextSupervisor")}
                hint={t("formation.dashboard.upcoming.nextSupervisorHint")}
                tint="#10B981"
              />
              <UpcomingRow
                icon={<ClipboardCheck size={12} />}
                label={t("formation.dashboard.upcoming.weeklySynthesis")}
                hint={t("formation.dashboard.upcoming.weeklySynthesisHint")}
                tint="#3B82F6"
              />
              <UpcomingRow
                icon={<FileText size={12} />}
                label={t("formation.dashboard.upcoming.finalReport")}
                hint={t("formation.dashboard.upcoming.finalReportHint")}
                tint="#F59E0B"
              />
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}

interface ThesisRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint: string;
  tint: string;
}

function ThesisRow({ icon, label, value, hint, tint }: ThesisRowProps) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: tint + "20", color: tint }}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p
          className="text-sm font-medium"
          style={{ color: "var(--psych-text)" }}
        >
          {label}
        </p>
        <p
          className="text-[10px]"
          style={{ color: "var(--psych-muted)" }}
        >
          {hint}
        </p>
      </div>
      <span
        className="text-lg font-bold"
        style={{ color: tint }}
      >
        {value}
      </span>
    </div>
  );
}

interface UpcomingRowProps {
  icon: React.ReactNode;
  label: string;
  hint: string;
  tint: string;
}

function UpcomingRow({ icon, label, hint, tint }: UpcomingRowProps) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: tint + "20", color: tint }}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p style={{ color: "var(--psych-text)" }}>{label}</p>
        <p
          className="text-[10px]"
          style={{ color: "var(--psych-muted)" }}
        >
          {hint}
        </p>
      </div>
    </div>
  );
}
