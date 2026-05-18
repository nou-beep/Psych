// Internship report helpers — new daily, weekly, monthly, and final
// reports plus a weekly-assembly function that pulls in source
// daily reports.

import { generateId, nowISO } from "@/lib/store";
import type {
  DailyReportSections,
  FinalReportSections,
  InternshipReport,
  InternshipReportKind,
  WeeklyReportSections,
} from "./types";

// ─── Constructors ────────────────────────────────────────────────

export function newDailyReport(input: {
  caseId: string;
  date: string;
  initial?: Partial<DailyReportSections>;
}): InternshipReport {
  const now = nowISO();
  return {
    id: generateId(),
    caseId: input.caseId,
    kind: "daily",
    title: `Daily · ${input.date}`,
    daily: { date: input.date, ...(input.initial ?? {}) },
    linkedSupervisionIds: [],
    linkedTestIds: [],
    linkedGridIds: [],
    draft: true,
    createdAt: now,
    updatedAt: now,
  };
}

export function newWeeklyReport(input: {
  caseId: string;
  weekStart: string;
  weekEnd: string;
  sourceDailyIds?: string[];
  initial?: Partial<WeeklyReportSections>;
}): InternshipReport {
  const now = nowISO();
  return {
    id: generateId(),
    caseId: input.caseId,
    kind: "weekly",
    title: `Weekly · ${input.weekStart} → ${input.weekEnd}`,
    weekly: {
      weekStart: input.weekStart,
      weekEnd: input.weekEnd,
      sourceDailyIds: input.sourceDailyIds ?? [],
      ...(input.initial ?? {}),
    },
    linkedSupervisionIds: [],
    linkedTestIds: [],
    linkedGridIds: [],
    draft: true,
    createdAt: now,
    updatedAt: now,
  };
}

export function newFinalReport(input: {
  caseId: string;
  initial?: Partial<FinalReportSections>;
}): InternshipReport {
  const now = nowISO();
  return {
    id: generateId(),
    caseId: input.caseId,
    kind: "final",
    title: "Final internship report",
    final: { ...(input.initial ?? {}) },
    linkedSupervisionIds: [],
    linkedTestIds: [],
    linkedGridIds: [],
    draft: true,
    createdAt: now,
    updatedAt: now,
  };
}

export function newSimpleReport(input: {
  caseId: string;
  kind: Exclude<
    InternshipReportKind,
    "daily" | "weekly" | "monthly" | "final"
  >;
  title?: string;
  body?: string;
}): InternshipReport {
  const now = nowISO();
  return {
    id: generateId(),
    caseId: input.caseId,
    kind: input.kind,
    title: input.title ?? "New report",
    body: input.body,
    linkedSupervisionIds: [],
    linkedTestIds: [],
    linkedGridIds: [],
    draft: true,
    createdAt: now,
    updatedAt: now,
  };
}

// ─── Mutations ────────────────────────────────────────────────────

export function patchReport(
  list: InternshipReport[],
  id: string,
  patch: Partial<Omit<InternshipReport, "id" | "createdAt" | "caseId" | "kind">>
): InternshipReport[] {
  const now = nowISO();
  return list.map((r) =>
    r.id === id ? { ...r, ...patch, updatedAt: now } : r
  );
}

export function patchDailySections(
  list: InternshipReport[],
  id: string,
  sections: Partial<DailyReportSections>
): InternshipReport[] {
  const now = nowISO();
  return list.map((r) => {
    if (r.id !== id || r.kind !== "daily" || !r.daily) return r;
    return {
      ...r,
      daily: { ...r.daily, ...sections },
      updatedAt: now,
    };
  });
}

export function patchWeeklySections(
  list: InternshipReport[],
  id: string,
  sections: Partial<WeeklyReportSections>
): InternshipReport[] {
  const now = nowISO();
  return list.map((r) => {
    if (r.id !== id || r.kind !== "weekly" || !r.weekly) return r;
    return {
      ...r,
      weekly: { ...r.weekly, ...sections },
      updatedAt: now,
    };
  });
}

export function patchFinalSections(
  list: InternshipReport[],
  id: string,
  sections: Partial<FinalReportSections>
): InternshipReport[] {
  const now = nowISO();
  return list.map((r) => {
    if (r.id !== id || r.kind !== "final" || !r.final) return r;
    return {
      ...r,
      final: { ...r.final, ...sections },
      updatedAt: now,
    };
  });
}

export function markComplete(
  list: InternshipReport[],
  id: string
): InternshipReport[] {
  return patchReport(list, id, { draft: false });
}

export function reportsForCase(
  list: InternshipReport[],
  caseId: string
): InternshipReport[] {
  return list.filter((r) => r.caseId === caseId);
}

// ─── Weekly assembly ──────────────────────────────────────────────
//
// Given a window + a list of daily reports for the case, build a
// pre-filled weekly report the user can edit. Concatenates per-area
// notes from each daily report with a "Day N · date" header.

export function assembleWeeklyFromDailies(input: {
  caseId: string;
  weekStart: string;
  weekEnd: string;
  dailies: InternshipReport[];
}): InternshipReport {
  const inWindow = input.dailies
    .filter(
      (d) =>
        d.kind === "daily" &&
        d.daily &&
        d.daily.date >= input.weekStart &&
        d.daily.date <= input.weekEnd
    )
    .sort((a, b) =>
      (a.daily?.date ?? "").localeCompare(b.daily?.date ?? "")
    );

  const join = (
    pick: (d: DailyReportSections) => string | undefined
  ): string => {
    const out: string[] = [];
    inWindow.forEach((d, i) => {
      const v = d.daily ? pick(d.daily) : undefined;
      if (v && v.trim()) {
        out.push(`Day ${i + 1} · ${d.daily?.date}\n${v.trim()}`);
      }
    });
    return out.join("\n\n");
  };

  return newWeeklyReport({
    caseId: input.caseId,
    weekStart: input.weekStart,
    weekEnd: input.weekEnd,
    sourceDailyIds: inWindow.map((d) => d.id),
    initial: {
      sessionsCompleted: inWindow.length,
      progressObserved:
        join((d) => d.observations) || undefined,
      difficulties: join((d) => d.behavior) || undefined,
      repeatedPatterns:
        join((d) => d.communication) || undefined,
      nextWeekObjectives:
        join((d) => d.nextSteps) || undefined,
    },
  });
}

// ─── Final assembly ──────────────────────────────────────────────
//
// Pulls the relevant material (weekly reports, tests, grids,
// supervision notes) into a draft final report so the user can edit
// rather than start from a blank canvas.

export function assembleFinalDraft(input: {
  caseId: string;
  weeklyReports: InternshipReport[];
  tests: Array<{ name: string; status: string; interpretationNotes?: string }>;
  grids: Array<{ name?: string; weeklySynthesis?: string }>;
  supervisionNotes: Array<{ date: string; feedbackReceived?: string }>;
}): InternshipReport {
  const weeks = input.weeklyReports.filter((r) => r.kind === "weekly");

  const weeklyProgress = weeks
    .map((w) =>
      `Week ${w.weekly?.weekStart} → ${w.weekly?.weekEnd}\n${(w.weekly?.progressObserved ?? "").trim()}`.trim()
    )
    .join("\n\n");

  const testsBlock = input.tests
    .map(
      (t) =>
        `• ${t.name} (${t.status})${
          t.interpretationNotes ? `\n  ${t.interpretationNotes}` : ""
        }`
    )
    .join("\n");

  const gridsBlock = input.grids
    .map(
      (g) =>
        `• ${g.name ?? "Grid"}${
          g.weeklySynthesis ? `\n  ${g.weeklySynthesis}` : ""
        }`
    )
    .join("\n");

  const supervisionBlock = input.supervisionNotes
    .map(
      (s) =>
        `• ${s.date}${s.feedbackReceived ? ` — ${s.feedbackReceived}` : ""}`
    )
    .join("\n");

  return newFinalReport({
    caseId: input.caseId,
    initial: {
      progressEvolution: weeklyProgress || undefined,
      testsAdministered: testsBlock || undefined,
      evaluationGrids: gridsBlock || undefined,
      supervisionReflections: supervisionBlock || undefined,
    },
  });
}
