"use client";

// Internship Studio context — loads/persists the six record types,
// exposes helpers for the pages to call. Pure React context wired to
// localStorage; pure-logic mutations live in lib/internship/.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { loadFromStorage, saveToStorage } from "@/lib/store";
import { INTERNSHIP_STORAGE_KEYS } from "@/lib/internship/storage";
import {
  archiveCase,
  newCase,
  patchContext,
  patchIdentification,
} from "@/lib/internship/case";
import {
  attachGrid,
  detachGrid,
  newManualTest,
  newTestFromShell,
  patchTest,
  recordScore,
  setStatus,
} from "@/lib/internship/tests";
import {
  addEntry,
  newGridFromShell,
  patchEntry,
  removeEntry,
  setWeeklySynthesis,
} from "@/lib/internship/grids";
import {
  assembleFinalDraft,
  assembleWeeklyFromDailies,
  markComplete,
  newDailyReport,
  newFinalReport,
  newSimpleReport,
  newWeeklyReport,
  patchDailySections,
  patchFinalSections,
  patchReport,
  patchWeeklySections,
} from "@/lib/internship/reports";
import {
  linkSupervisionTo,
  newSupervisionNote,
  patchSupervisionNote,
  unlinkSupervisionFrom,
} from "@/lib/internship/supervision";
import { newFileRecord } from "@/lib/internship/files";
import {
  clearItemScore as clearItemScoreFn,
  newAdministration,
  patchAdministration as patchAdminFn,
  removeAdministration as removeAdminFn,
  scoreItem as scoreItemFn,
  type CapabilityScore,
  type ScorableGridAdministration,
} from "@/lib/internship/scorable-grids";
import { buildDailyFromGrid, buildGridSummaryReportBody } from "@/lib/internship/scorable-text";
import { findScorableTemplate } from "@/lib/internship/scorable-templates";
import {
  INTERNSHIP_SEED_ACCEPTED_KEY,
  SEED_INTERNSHIP_CASES,
  SEED_INTERNSHIP_REPORTS,
  SEED_INTERNSHIP_SCORABLE,
  SEED_INTERNSHIP_SUPERVISION,
  SEED_INTERNSHIP_TESTS,
  SEED_STRUCTURED_PROFILE,
} from "@/lib/internship/seed";
import { DEFAULT_INSTITUTION } from "@/lib/internship/institutions";
import type {
  InternshipCase,
  InternshipClinicalContext,
  InternshipFile,
  InternshipFileKind,
  InternshipGrid,
  InternshipIdentification,
  InternshipReport,
  InternshipReportKind,
  InternshipSupervisionNote,
  InternshipTest,
  InternshipTestScore,
  TestDomain,
  TestStatus,
} from "@/lib/internship/types";

interface InternshipContextValue {
  // State.
  cases: InternshipCase[];
  tests: InternshipTest[];
  grids: InternshipGrid[];
  reports: InternshipReport[];
  supervision: InternshipSupervisionNote[];
  files: InternshipFile[];

  // Cases.
  createCase: (input: Parameters<typeof newCase>[0]) => InternshipCase;
  updateCaseIdentification: (
    id: string,
    patch: Partial<InternshipIdentification>
  ) => void;
  updateCaseContext: (
    id: string,
    patch: Partial<InternshipClinicalContext>
  ) => void;
  // Structured profile (chip / segmented selections per domain).
  updateCaseStructuredProfile: (
    id: string,
    next: import("@/lib/internship/structured-profile").StructuredProfile
  ) => void;
  // One-shot: applies the internship-report-derived institutional
  // defaults + the seeded structured profile to an existing case.
  seedCaseFromInternshipReport: (id: string) => InternshipCase | null;
  setCaseArchived: (id: string, archived: boolean) => void;

  // Tests.
  planTestFromShell: (input: {
    caseId: string;
    shellId: string;
    plannedDate?: string;
  }) => InternshipTest | null;
  planManualTest: (input: {
    caseId: string;
    name: string;
    domain: TestDomain;
    plannedDate?: string;
    purpose?: string;
    scoringMethod?: string;
  }) => InternshipTest;
  advanceTestStatus: (id: string, next: TestStatus) => void;
  updateTest: (
    id: string,
    patch: Partial<Omit<InternshipTest, "id" | "createdAt" | "caseId">>
  ) => void;
  recordTestScore: (
    id: string,
    score: InternshipTestScore,
    interpretationNotes?: string
  ) => void;
  attachGridToTest: (testId: string, gridId: string) => void;
  detachGridFromTest: (testId: string, gridId: string) => void;

  // Grids.
  createGridFromShell: (input: {
    caseId: string;
    shellId: string;
    linkedTestId?: string;
    name?: string;
  }) => InternshipGrid | null;
  addGridEntry: (
    gridId: string,
    entry: { fields: Record<string, string>; date?: string; sessionLabel?: string; notes?: string }
  ) => void;
  updateGridEntry: (
    gridId: string,
    entryId: string,
    patch: Partial<{
      fields: Record<string, string>;
      date: string;
      sessionLabel: string;
      notes: string;
    }>
  ) => void;
  removeGridEntry: (gridId: string, entryId: string) => void;
  setGridWeeklySynthesis: (gridId: string, synthesis: string) => void;

  // Reports.
  createDailyReport: (caseId: string, date: string) => InternshipReport;
  createWeeklyReport: (
    caseId: string,
    weekStart: string,
    weekEnd: string
  ) => InternshipReport;
  createFinalReport: (caseId: string) => InternshipReport;
  createSimpleReport: (input: {
    caseId: string;
    kind: Exclude<
      InternshipReportKind,
      "daily" | "weekly" | "monthly" | "final"
    >;
    title?: string;
  }) => InternshipReport;
  assembleWeekly: (
    caseId: string,
    weekStart: string,
    weekEnd: string
  ) => InternshipReport;
  assembleFinal: (caseId: string) => InternshipReport;
  updateReport: (
    id: string,
    patch: Partial<Omit<InternshipReport, "id" | "createdAt" | "caseId" | "kind">>
  ) => void;
  updateDailySections: (
    id: string,
    patch: Partial<NonNullable<InternshipReport["daily"]>>
  ) => void;
  updateWeeklySections: (
    id: string,
    patch: Partial<NonNullable<InternshipReport["weekly"]>>
  ) => void;
  updateFinalSections: (
    id: string,
    patch: Partial<NonNullable<InternshipReport["final"]>>
  ) => void;
  markReportComplete: (id: string) => void;

  // Supervision.
  createSupervisionNote: (input: {
    caseId: string;
    date: string;
    supervisor?: string;
  }) => InternshipSupervisionNote;
  updateSupervisionNote: (
    id: string,
    patch: Partial<
      Omit<InternshipSupervisionNote, "id" | "createdAt" | "caseId">
    >
  ) => void;
  linkSupervision: (
    noteId: string,
    kind: "test" | "grid" | "report",
    targetId: string
  ) => void;
  unlinkSupervision: (
    noteId: string,
    kind: "test" | "grid" | "report",
    targetId: string
  ) => void;

  // Scorable grid administrations (click-based engine).
  scorableAdmins: ScorableGridAdministration[];
  createScorableAdmin: (input: {
    caseId: string;
    templateId: string;
    date?: string;
    evaluator?: string;
    context?: string;
    sessionLabel?: string;
    linkedTestId?: string;
  }) => ScorableGridAdministration;
  scoreScorableItem: (
    adminId: string,
    itemId: string,
    score: CapabilityScore,
    extra?: { note?: string; evidence?: string }
  ) => void;
  clearScorableItem: (adminId: string, itemId: string) => void;
  patchScorableAdmin: (
    id: string,
    patch: Partial<
      Omit<ScorableGridAdministration, "id" | "createdAt" | "caseId" | "scores">
    >
  ) => void;
  removeScorableAdmin: (id: string) => void;
  // Convenience: build a daily report or grid-summary simple report
  // from a scored administration in one click.
  createDailyFromScorableAdmin: (adminId: string) => InternshipReport | null;
  createGridSummaryReport: (adminId: string) => InternshipReport | null;
  // Append the grid summary into the most recent draft weekly report
  // for the case (or null if none exists yet).
  addScorableAdminToWeekly: (adminId: string) => InternshipReport | null;
  // Same, into the most recent draft supervision note.
  addScorableAdminToSupervision: (
    adminId: string
  ) => InternshipSupervisionNote | null;

  // Files.
  createFile: (input: {
    caseId: string;
    kind: InternshipFileKind;
    name: string;
    notes?: string;
    tags?: string[];
    linkedTestId?: string;
    linkedGridId?: string;
    linkedReportId?: string;
  }) => InternshipFile;
  removeFile: (id: string) => void;

  // Seed control.
  seedAccepted: boolean;
  acceptSeed: () => void;
  resetSeed: () => void;
}

const InternshipContext = createContext<InternshipContextValue | null>(null);

export function InternshipProvider({ children }: { children: ReactNode }) {
  const [cases, setCases] = useState<InternshipCase[]>([]);
  const [tests, setTests] = useState<InternshipTest[]>([]);
  const [grids, setGrids] = useState<InternshipGrid[]>([]);
  const [reports, setReports] = useState<InternshipReport[]>([]);
  const [supervision, setSupervision] = useState<InternshipSupervisionNote[]>(
    []
  );
  const [files, setFiles] = useState<InternshipFile[]>([]);
  const [scorableAdmins, setScorableAdmins] = useState<
    ScorableGridAdministration[]
  >([]);
  const [seedAccepted, setSeedAccepted] = useState(false);
  const [ready, setReady] = useState(false);

  // Initial load — pull each blob from localStorage, seed on first run.
  useEffect(() => {
    try {
      const storedCases = loadFromStorage<InternshipCase[]>(
        INTERNSHIP_STORAGE_KEYS.cases,
        []
      );
      const storedTests = loadFromStorage<InternshipTest[]>(
        INTERNSHIP_STORAGE_KEYS.tests,
        []
      );
      const storedGrids = loadFromStorage<InternshipGrid[]>(
        INTERNSHIP_STORAGE_KEYS.grids,
        []
      );
      const storedReports = loadFromStorage<InternshipReport[]>(
        INTERNSHIP_STORAGE_KEYS.reports,
        []
      );
      const storedSupervision = loadFromStorage<InternshipSupervisionNote[]>(
        INTERNSHIP_STORAGE_KEYS.supervision,
        []
      );
      const storedFiles = loadFromStorage<InternshipFile[]>(
        INTERNSHIP_STORAGE_KEYS.files,
        []
      );
      const storedScorable = loadFromStorage<ScorableGridAdministration[]>(
        INTERNSHIP_STORAGE_KEYS.scorableAdmins,
        []
      );
      const accepted = loadFromStorage<boolean>(
        INTERNSHIP_SEED_ACCEPTED_KEY,
        false
      );

      // If nothing is in storage and the user hasn't dismissed the seed,
      // start with the seeded case.
      const noUserData =
        storedCases.length === 0 &&
        storedTests.length === 0 &&
        storedReports.length === 0;
      if (noUserData && !accepted) {
        setCases(SEED_INTERNSHIP_CASES);
        setTests(SEED_INTERNSHIP_TESTS);
        setReports(SEED_INTERNSHIP_REPORTS);
        setSupervision(SEED_INTERNSHIP_SUPERVISION);
        setScorableAdmins(SEED_INTERNSHIP_SCORABLE);
      } else {
        setCases(storedCases);
        setTests(storedTests);
        setGrids(storedGrids);
        setReports(storedReports);
        setSupervision(storedSupervision);
        setFiles(storedFiles);
        setScorableAdmins(storedScorable);
      }
      setSeedAccepted(accepted);
    } catch {
      // localStorage unavailable — keep empty state.
    } finally {
      setReady(true);
    }
  }, []);

  // Persist on change.
  useEffect(() => {
    if (!ready) return;
    saveToStorage(INTERNSHIP_STORAGE_KEYS.cases, cases);
  }, [cases, ready]);
  useEffect(() => {
    if (!ready) return;
    saveToStorage(INTERNSHIP_STORAGE_KEYS.tests, tests);
  }, [tests, ready]);
  useEffect(() => {
    if (!ready) return;
    saveToStorage(INTERNSHIP_STORAGE_KEYS.grids, grids);
  }, [grids, ready]);
  useEffect(() => {
    if (!ready) return;
    saveToStorage(INTERNSHIP_STORAGE_KEYS.reports, reports);
  }, [reports, ready]);
  useEffect(() => {
    if (!ready) return;
    saveToStorage(INTERNSHIP_STORAGE_KEYS.supervision, supervision);
  }, [supervision, ready]);
  useEffect(() => {
    if (!ready) return;
    saveToStorage(INTERNSHIP_STORAGE_KEYS.files, files);
  }, [files, ready]);
  useEffect(() => {
    if (!ready) return;
    saveToStorage(INTERNSHIP_STORAGE_KEYS.scorableAdmins, scorableAdmins);
  }, [scorableAdmins, ready]);

  // ─── Cases ───────────────────────────────────────────────
  const createCase = useCallback(
    (input: Parameters<typeof newCase>[0]) => {
      const c = newCase(input);
      setCases((list) => [c, ...list]);
      return c;
    },
    []
  );
  const updateCaseIdentification = useCallback(
    (id: string, patch: Partial<InternshipIdentification>) =>
      setCases((list) => patchIdentification(list, id, patch)),
    []
  );
  const updateCaseContext = useCallback(
    (id: string, patch: Partial<InternshipClinicalContext>) =>
      setCases((list) => patchContext(list, id, patch)),
    []
  );
  const updateCaseStructuredProfile = useCallback(
    (
      id: string,
      next: import("@/lib/internship/structured-profile").StructuredProfile
    ) =>
      setCases((list) =>
        patchContext(list, id, { structuredProfile: next })
      ),
    []
  );
  const setCaseArchived = useCallback(
    (id: string, archived: boolean) =>
      setCases((list) => archiveCase(list, id, archived)),
    []
  );
  // Applies the internship-report-derived defaults to an existing
  // case in one shot — identification (institutional context,
  // supervisor) + structured profile chip seed. Keeps any
  // free-text the user already wrote.
  const seedCaseFromInternshipReport = useCallback(
    (id: string): InternshipCase | null => {
      const existing = cases.find((c) => c.id === id);
      if (!existing) return null;
      // Apply institutional defaults to identification, then merge
      // the seeded structured profile (existing context fields are
      // preserved).
      setCases((list) => {
        const withId = patchIdentification(list, id, {
          setting: DEFAULT_INSTITUTION.setting,
          internshipPlace: DEFAULT_INSTITUTION.name,
          supervisor: DEFAULT_INSTITUTION.academicSupervisor,
        });
        return patchContext(withId, id, {
          structuredProfile: SEED_STRUCTURED_PROFILE,
        });
      });
      return existing;
    },
    [cases]
  );

  // ─── Tests ───────────────────────────────────────────────
  const planTestFromShell = useCallback(
    (input: { caseId: string; shellId: string; plannedDate?: string }) => {
      const t = newTestFromShell(input);
      if (t) setTests((list) => [t, ...list]);
      return t;
    },
    []
  );
  const planManualTest = useCallback(
    (input: {
      caseId: string;
      name: string;
      domain: TestDomain;
      plannedDate?: string;
      purpose?: string;
      scoringMethod?: string;
    }) => {
      const t = newManualTest(input);
      setTests((list) => [t, ...list]);
      return t;
    },
    []
  );
  const advanceTestStatus = useCallback(
    (id: string, next: TestStatus) =>
      setTests((list) => setStatus(list, id, next)),
    []
  );
  const updateTest = useCallback(
    (
      id: string,
      patch: Partial<Omit<InternshipTest, "id" | "createdAt" | "caseId">>
    ) => setTests((list) => patchTest(list, id, patch)),
    []
  );
  const recordTestScore = useCallback(
    (id: string, score: InternshipTestScore, interpretationNotes?: string) =>
      setTests((list) => recordScore(list, id, score, interpretationNotes)),
    []
  );
  const attachGridToTest = useCallback(
    (testId: string, gridId: string) =>
      setTests((list) => attachGrid(list, testId, gridId)),
    []
  );
  const detachGridFromTest = useCallback(
    (testId: string, gridId: string) =>
      setTests((list) => detachGrid(list, testId, gridId)),
    []
  );

  // ─── Grids ───────────────────────────────────────────────
  const createGridFromShell = useCallback(
    (input: {
      caseId: string;
      shellId: string;
      linkedTestId?: string;
      name?: string;
    }) => {
      const g = newGridFromShell(input);
      if (g) {
        setGrids((list) => [g, ...list]);
        if (input.linkedTestId) {
          setTests((list) => attachGrid(list, input.linkedTestId!, g.id));
        }
      }
      return g;
    },
    []
  );
  const addGridEntry = useCallback(
    (
      gridId: string,
      entry: { fields: Record<string, string>; date?: string; sessionLabel?: string; notes?: string }
    ) => setGrids((list) => addEntry(list, gridId, entry)),
    []
  );
  const updateGridEntry = useCallback(
    (
      gridId: string,
      entryId: string,
      patch: Partial<{
        fields: Record<string, string>;
        date: string;
        sessionLabel: string;
        notes: string;
      }>
    ) => setGrids((list) => patchEntry(list, gridId, entryId, patch)),
    []
  );
  const removeGridEntry = useCallback(
    (gridId: string, entryId: string) =>
      setGrids((list) => removeEntry(list, gridId, entryId)),
    []
  );
  const setGridWeeklySynthesis = useCallback(
    (gridId: string, synthesis: string) =>
      setGrids((list) => setWeeklySynthesis(list, gridId, synthesis)),
    []
  );

  // ─── Reports ─────────────────────────────────────────────
  const createDailyReport = useCallback((caseId: string, date: string) => {
    const r = newDailyReport({ caseId, date });
    setReports((list) => [r, ...list]);
    return r;
  }, []);
  const createWeeklyReport = useCallback(
    (caseId: string, weekStart: string, weekEnd: string) => {
      const r = newWeeklyReport({ caseId, weekStart, weekEnd });
      setReports((list) => [r, ...list]);
      return r;
    },
    []
  );
  const createFinalReport = useCallback((caseId: string) => {
    const r = newFinalReport({ caseId });
    setReports((list) => [r, ...list]);
    return r;
  }, []);
  const createSimpleReport = useCallback(
    (input: {
      caseId: string;
      kind: Exclude<
        InternshipReportKind,
        "daily" | "weekly" | "monthly" | "final"
      >;
      title?: string;
    }) => {
      const r = newSimpleReport(input);
      setReports((list) => [r, ...list]);
      return r;
    },
    []
  );

  const assembleWeekly = useCallback(
    (caseId: string, weekStart: string, weekEnd: string) => {
      const dailies = reports.filter(
        (r) => r.caseId === caseId && r.kind === "daily"
      );
      const r = assembleWeeklyFromDailies({
        caseId,
        weekStart,
        weekEnd,
        dailies,
      });
      setReports((list) => [r, ...list]);
      return r;
    },
    [reports]
  );

  const assembleFinal = useCallback(
    (caseId: string) => {
      const weeklies = reports.filter(
        (r) => r.caseId === caseId && r.kind === "weekly"
      );
      const caseTests = tests.filter((t) => t.caseId === caseId);
      const caseGrids = grids.filter((g) => g.caseId === caseId);
      const caseSupervision = supervision.filter((s) => s.caseId === caseId);
      const r = assembleFinalDraft({
        caseId,
        weeklyReports: weeklies,
        tests: caseTests.map((t) => ({
          name: t.name,
          status: t.status,
          interpretationNotes: t.interpretationNotes,
        })),
        grids: caseGrids.map((g) => ({
          name: g.name,
          weeklySynthesis: g.weeklySynthesis,
        })),
        supervisionNotes: caseSupervision.map((s) => ({
          date: s.date,
          feedbackReceived: s.feedbackReceived,
        })),
      });
      setReports((list) => [r, ...list]);
      return r;
    },
    [reports, tests, grids, supervision]
  );

  const updateReport = useCallback(
    (
      id: string,
      patch: Partial<
        Omit<InternshipReport, "id" | "createdAt" | "caseId" | "kind">
      >
    ) => setReports((list) => patchReport(list, id, patch)),
    []
  );
  const updateDailySections = useCallback(
    (id: string, patch: Partial<NonNullable<InternshipReport["daily"]>>) =>
      setReports((list) => patchDailySections(list, id, patch)),
    []
  );
  const updateWeeklySections = useCallback(
    (id: string, patch: Partial<NonNullable<InternshipReport["weekly"]>>) =>
      setReports((list) => patchWeeklySections(list, id, patch)),
    []
  );
  const updateFinalSections = useCallback(
    (id: string, patch: Partial<NonNullable<InternshipReport["final"]>>) =>
      setReports((list) => patchFinalSections(list, id, patch)),
    []
  );
  const markReportComplete = useCallback(
    (id: string) => setReports((list) => markComplete(list, id)),
    []
  );

  // ─── Supervision ─────────────────────────────────────────
  const createSupervisionNote = useCallback(
    (input: { caseId: string; date: string; supervisor?: string }) => {
      const n = newSupervisionNote(input);
      setSupervision((list) => [n, ...list]);
      return n;
    },
    []
  );
  const updateSupervisionNote = useCallback(
    (
      id: string,
      patch: Partial<
        Omit<InternshipSupervisionNote, "id" | "createdAt" | "caseId">
      >
    ) => setSupervision((list) => patchSupervisionNote(list, id, patch)),
    []
  );
  const linkSupervision = useCallback(
    (
      noteId: string,
      kind: "test" | "grid" | "report",
      targetId: string
    ) =>
      setSupervision((list) => linkSupervisionTo(list, noteId, kind, targetId)),
    []
  );
  const unlinkSupervision = useCallback(
    (
      noteId: string,
      kind: "test" | "grid" | "report",
      targetId: string
    ) =>
      setSupervision((list) =>
        unlinkSupervisionFrom(list, noteId, kind, targetId)
      ),
    []
  );

  // ─── Scorable grid administrations ────────────────────────
  const createScorableAdmin = useCallback(
    (input: {
      caseId: string;
      templateId: string;
      date?: string;
      evaluator?: string;
      context?: string;
      sessionLabel?: string;
      linkedTestId?: string;
    }) => {
      const a = newAdministration(input);
      setScorableAdmins((list) => [a, ...list]);
      return a;
    },
    []
  );
  const scoreScorableItem = useCallback(
    (
      adminId: string,
      itemId: string,
      score: CapabilityScore,
      extra: { note?: string; evidence?: string } = {}
    ) =>
      setScorableAdmins((list) =>
        scoreItemFn(list, adminId, itemId, score, extra)
      ),
    []
  );
  const clearScorableItem = useCallback(
    (adminId: string, itemId: string) =>
      setScorableAdmins((list) => clearItemScoreFn(list, adminId, itemId)),
    []
  );
  const patchScorableAdmin = useCallback(
    (
      id: string,
      patch: Partial<
        Omit<ScorableGridAdministration, "id" | "createdAt" | "caseId" | "scores">
      >
    ) => setScorableAdmins((list) => patchAdminFn(list, id, patch)),
    []
  );
  const removeScorableAdmin = useCallback(
    (id: string) =>
      setScorableAdmins((list) => removeAdminFn(list, id)),
    []
  );
  const createDailyFromScorableAdmin = useCallback(
    (adminId: string): InternshipReport | null => {
      const admin = scorableAdmins.find((a) => a.id === adminId);
      if (!admin) return null;
      const template = findScorableTemplate(admin.templateId);
      if (!template) return null;
      const sections = buildDailyFromGrid(admin, template);
      const r = newDailyReport({
        caseId: admin.caseId,
        date: admin.date,
        initial: sections,
      });
      // Attach a structured back-link to the test that prompted the
      // grid so the report card surfaces it.
      const withLink = admin.linkedTestId
        ? { ...r, linkedTestIds: [admin.linkedTestId] }
        : r;
      setReports((list) => [withLink, ...list]);
      return withLink;
    },
    [scorableAdmins]
  );
  const createGridSummaryReport = useCallback(
    (adminId: string): InternshipReport | null => {
      const admin = scorableAdmins.find((a) => a.id === adminId);
      if (!admin) return null;
      const template = findScorableTemplate(admin.templateId);
      if (!template) return null;
      const body = buildGridSummaryReportBody(admin, template);
      const r = newSimpleReport({
        caseId: admin.caseId,
        kind: "grid-summary",
        title: `${template.name} · ${admin.date}`,
        body,
      });
      setReports((list) => [r, ...list]);
      return r;
    },
    [scorableAdmins]
  );
  // Append the grid summary into the most recent weekly draft for
  // the case so the user doesn't manually copy/paste the synthesis.
  const addScorableAdminToWeekly = useCallback(
    (adminId: string): InternshipReport | null => {
      const admin = scorableAdmins.find((a) => a.id === adminId);
      if (!admin) return null;
      const template = findScorableTemplate(admin.templateId);
      if (!template) return null;
      const weekly = reports
        .filter((r) => r.kind === "weekly" && r.caseId === admin.caseId)
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];
      if (!weekly || !weekly.weekly) return null;
      const block = buildGridSummaryReportBody(admin, template);
      const existing = weekly.weekly.gridsCompleted ?? "";
      setReports((list) =>
        patchWeeklySections(list, weekly.id, {
          gridsCompleted: existing ? `${existing}\n\n${block}` : block,
        })
      );
      return weekly;
    },
    [scorableAdmins, reports]
  );
  // Append the grid summary into the most recent supervision note.
  const addScorableAdminToSupervision = useCallback(
    (adminId: string): InternshipSupervisionNote | null => {
      const admin = scorableAdmins.find((a) => a.id === adminId);
      if (!admin) return null;
      const template = findScorableTemplate(admin.templateId);
      if (!template) return null;
      const note = supervision
        .filter((n) => n.caseId === admin.caseId)
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];
      if (!note) return null;
      const block = buildGridSummaryReportBody(admin, template);
      const existing = note.gridsReviewed ?? "";
      setSupervision((list) =>
        patchSupervisionNote(list, note.id, {
          gridsReviewed: existing ? `${existing}\n\n${block}` : block,
        })
      );
      return note;
    },
    [scorableAdmins, supervision]
  );

  // ─── Files ───────────────────────────────────────────────
  const createFile = useCallback(
    (input: {
      caseId: string;
      kind: InternshipFileKind;
      name: string;
      notes?: string;
      tags?: string[];
      linkedTestId?: string;
      linkedGridId?: string;
      linkedReportId?: string;
    }) => {
      const f = newFileRecord(input);
      setFiles((list) => [f, ...list]);
      return f;
    },
    []
  );
  const removeFile = useCallback((id: string) => {
    setFiles((list) => list.filter((f) => f.id !== id));
  }, []);

  // ─── Seed control ────────────────────────────────────────
  const acceptSeed = useCallback(() => {
    setSeedAccepted(true);
    saveToStorage(INTERNSHIP_SEED_ACCEPTED_KEY, true);
  }, []);
  const resetSeed = useCallback(() => {
    setCases(SEED_INTERNSHIP_CASES);
    setTests(SEED_INTERNSHIP_TESTS);
    setReports(SEED_INTERNSHIP_REPORTS);
    setSupervision(SEED_INTERNSHIP_SUPERVISION);
    setScorableAdmins(SEED_INTERNSHIP_SCORABLE);
    setGrids([]);
    setFiles([]);
  }, []);

  const value = useMemo<InternshipContextValue>(
    () => ({
      cases,
      tests,
      grids,
      reports,
      supervision,
      files,
      createCase,
      updateCaseIdentification,
      updateCaseContext,
      updateCaseStructuredProfile,
      seedCaseFromInternshipReport,
      setCaseArchived,
      planTestFromShell,
      planManualTest,
      advanceTestStatus,
      updateTest,
      recordTestScore,
      attachGridToTest,
      detachGridFromTest,
      createGridFromShell,
      addGridEntry,
      updateGridEntry,
      removeGridEntry,
      setGridWeeklySynthesis,
      createDailyReport,
      createWeeklyReport,
      createFinalReport,
      createSimpleReport,
      assembleWeekly,
      assembleFinal,
      updateReport,
      updateDailySections,
      updateWeeklySections,
      updateFinalSections,
      markReportComplete,
      createSupervisionNote,
      updateSupervisionNote,
      linkSupervision,
      unlinkSupervision,
      createFile,
      removeFile,
      scorableAdmins,
      createScorableAdmin,
      scoreScorableItem,
      clearScorableItem,
      patchScorableAdmin,
      removeScorableAdmin,
      createDailyFromScorableAdmin,
      createGridSummaryReport,
      addScorableAdminToWeekly,
      addScorableAdminToSupervision,
      seedAccepted,
      acceptSeed,
      resetSeed,
    }),
    [
      cases,
      tests,
      grids,
      reports,
      supervision,
      files,
      createCase,
      updateCaseIdentification,
      updateCaseContext,
      updateCaseStructuredProfile,
      seedCaseFromInternshipReport,
      setCaseArchived,
      planTestFromShell,
      planManualTest,
      advanceTestStatus,
      updateTest,
      recordTestScore,
      attachGridToTest,
      detachGridFromTest,
      createGridFromShell,
      addGridEntry,
      updateGridEntry,
      removeGridEntry,
      setGridWeeklySynthesis,
      createDailyReport,
      createWeeklyReport,
      createFinalReport,
      createSimpleReport,
      assembleWeekly,
      assembleFinal,
      updateReport,
      updateDailySections,
      updateWeeklySections,
      updateFinalSections,
      markReportComplete,
      createSupervisionNote,
      updateSupervisionNote,
      linkSupervision,
      unlinkSupervision,
      createFile,
      removeFile,
      scorableAdmins,
      createScorableAdmin,
      scoreScorableItem,
      clearScorableItem,
      patchScorableAdmin,
      removeScorableAdmin,
      createDailyFromScorableAdmin,
      createGridSummaryReport,
      addScorableAdminToWeekly,
      addScorableAdminToSupervision,
      seedAccepted,
      acceptSeed,
      resetSeed,
    ]
  );

  return (
    <InternshipContext.Provider value={value}>
      {children}
    </InternshipContext.Provider>
  );
}

export function useInternship() {
  const ctx = useContext(InternshipContext);
  if (!ctx)
    throw new Error("useInternship must be used inside InternshipProvider");
  return ctx;
}
