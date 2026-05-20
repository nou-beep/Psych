// Today — the "next 3-5 things" layer surfaced on every portal
// home. Pure functions that take the data each portal already owns
// and return a small list of actionable items in priority order.
//
// Items are kept minimal: a label, an optional subtitle, an href to
// jump into the work, and a `priority` so the UI can colour-rank.

export type TodayPriority = "critical" | "high" | "normal" | "low";

export interface TodayItem {
  id: string;
  label: string;
  subtitle?: string;
  /** href to jump straight into the work. */
  href: string;
  priority: TodayPriority;
  /** Optional category tag — drives the icon in the panel. */
  category?:
    | "thesis"
    | "internship"
    | "session"
    | "assessment"
    | "report"
    | "supervision"
    | "assignment"
    | "calendar";
}

// ─── Formation portal computation ─────────────────────────────

interface FormationSources {
  draftReportCount: number;
  pendingGridCount: number;
  testsAwaitingScore: number;
  supervisionNoteCount: number;
  thesisMissingDataCount: number;
  thesisReportSectionsDrafted: number;
  activeInternshipCases: number;
  /** ISO date today (yyyy-mm-dd). */
  todayISO: string;
}

export function computeFormationToday(
  sources: FormationSources
): TodayItem[] {
  const items: TodayItem[] = [];

  if (sources.draftReportCount > 0) {
    items.push({
      id: "reports-to-finalize",
      label:
        sources.draftReportCount === 1
          ? "1 report to finalize"
          : `${sources.draftReportCount} reports to finalize`,
      subtitle: "Daily · weekly · final",
      href: "/formation/internship/reports",
      priority: sources.draftReportCount >= 3 ? "high" : "normal",
      category: "report",
    });
  }

  if (sources.testsAwaitingScore > 0) {
    items.push({
      id: "tests-awaiting-score",
      label:
        sources.testsAwaitingScore === 1
          ? "1 test awaiting scoring"
          : `${sources.testsAwaitingScore} tests awaiting scoring`,
      subtitle: "Open the Internship Studio",
      href: "/formation/internship",
      priority: "normal",
      category: "assessment",
    });
  }

  if (sources.pendingGridCount > 0) {
    items.push({
      id: "pending-grids",
      label:
        sources.pendingGridCount === 1
          ? "1 grid waiting for entries"
          : `${sources.pendingGridCount} grids waiting for entries`,
      subtitle: "Tests & grids",
      href: "/formation/internship/tests-grids",
      priority: "normal",
      category: "internship",
    });
  }

  if (sources.thesisMissingDataCount > 0) {
    items.push({
      id: "thesis-missing-data",
      label:
        sources.thesisMissingDataCount === 1
          ? "1 thesis participant with missing data"
          : `${sources.thesisMissingDataCount} thesis participants with missing data`,
      subtitle: "Open Thesis Studio",
      href: "/formation/thesis",
      priority: "low",
      category: "thesis",
    });
  }

  if (sources.thesisReportSectionsDrafted < 4) {
    items.push({
      id: "thesis-writer-continue",
      label: "Continue the thesis writer",
      subtitle:
        sources.thesisReportSectionsDrafted === 0
          ? "No section drafted yet"
          : `${sources.thesisReportSectionsDrafted} section(s) drafted`,
      href: "/formation/thesis/writer",
      priority:
        sources.thesisReportSectionsDrafted === 0 ? "high" : "normal",
      category: "thesis",
    });
  }

  if (sources.activeInternshipCases === 0) {
    items.push({
      id: "open-first-case",
      label: "Open your first internship case",
      subtitle: "Internship Studio",
      href: "/formation/internship",
      priority: "high",
      category: "internship",
    });
  }

  if (sources.supervisionNoteCount === 0 && sources.activeInternshipCases > 0) {
    items.push({
      id: "prepare-supervision",
      label: "Prepare for supervision",
      subtitle: "No notes yet — capture questions for next session",
      href: "/formation/internship/supervision",
      priority: "normal",
      category: "supervision",
    });
  }

  return sortByPriority(items).slice(0, 6);
}

// ─── Therapist portal computation ─────────────────────────────

interface TherapistSources {
  activeCases: number;
  todayCheckIns: number;
  pendingAssessments: number;
  goalsInProgress: number;
  needsReviewCount: number;
}

export function computeTherapistToday(
  sources: TherapistSources
): TodayItem[] {
  const items: TodayItem[] = [];

  if (sources.needsReviewCount > 0) {
    items.push({
      id: "cases-need-review",
      label:
        sources.needsReviewCount === 1
          ? "1 case needs review"
          : `${sources.needsReviewCount} cases need review`,
      href: "/cases",
      priority: "critical",
      category: "session",
    });
  }

  if (sources.pendingAssessments > 0) {
    items.push({
      id: "assessments-pending",
      label:
        sources.pendingAssessments === 1
          ? "1 assessment to start"
          : `${sources.pendingAssessments} assessments to start`,
      href: "/assessments",
      priority: "high",
      category: "assessment",
    });
  }

  if (sources.todayCheckIns === 0 && sources.activeCases > 0) {
    items.push({
      id: "log-check-in",
      label: "Log today's first check-in",
      subtitle: "No check-in recorded today",
      href: "/checkins?action=new",
      priority: "normal",
      category: "session",
    });
  }

  if (sources.activeCases === 0) {
    items.push({
      id: "open-first-case-therapist",
      label: "Open your first clinical case",
      href: "/cases?action=new",
      priority: "high",
      category: "session",
    });
  }

  return sortByPriority(items).slice(0, 6);
}

// ─── Client portal computation ────────────────────────────────

interface ClientSources {
  pendingAssignments: number;
  todayHasCheckIn: boolean;
  upcomingSessionDate?: string;
}

export function computeClientToday(sources: ClientSources): TodayItem[] {
  const items: TodayItem[] = [];

  if (sources.pendingAssignments > 0) {
    items.push({
      id: "assignments-pending-client",
      label:
        sources.pendingAssignments === 1
          ? "1 thing from your therapist"
          : `${sources.pendingAssignments} things from your therapist`,
      href: "/client/assigned",
      priority: sources.pendingAssignments >= 3 ? "high" : "normal",
      category: "assignment",
    });
  }

  if (sources.upcomingSessionDate) {
    items.push({
      id: "upcoming-session",
      label: "Next session",
      subtitle: sources.upcomingSessionDate,
      href: "/client/calendar",
      priority: "normal",
      category: "calendar",
    });
  }

  if (!sources.todayHasCheckIn) {
    items.push({
      id: "today-checkin-client",
      label: "Today's reflection",
      subtitle: "Take a moment — your therapist sees this",
      href: "/client/checkin",
      priority: "low",
      category: "session",
    });
  }

  return sortByPriority(items).slice(0, 5);
}

// ─── Helpers ──────────────────────────────────────────────────

const PRIORITY_ORDER: Record<TodayPriority, number> = {
  critical: 0,
  high: 1,
  normal: 2,
  low: 3,
};

export function sortByPriority(items: TodayItem[]): TodayItem[] {
  return [...items].sort(
    (a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
  );
}
