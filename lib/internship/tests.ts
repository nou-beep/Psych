// Internship test helpers — pure functions for creating planned
// tests, advancing through the status flow, recording scores, and
// linking grids.

import { generateId, nowISO } from "@/lib/store";
import { findTestShell } from "./test-shells";
import { suggestGridShellsForTest } from "./grid-library";
import type {
  InternshipTest,
  InternshipTestScore,
  TestDomain,
  TestStatus,
} from "./types";

// Allowed status transitions. Anything not listed is a no-op.
const STATUS_NEXT: Record<TestStatus, TestStatus[]> = {
  planned: ["administered"],
  administered: ["awaiting-scoring", "scored"],
  "awaiting-scoring": ["scored"],
  scored: ["reviewed", "in-report"],
  reviewed: ["in-report"],
  "in-report": [],
};

export function newTestFromShell(input: {
  caseId: string;
  shellId: string;
  plannedDate?: string;
}): InternshipTest | null {
  const shell = findTestShell(input.shellId);
  if (!shell) return null;
  const now = nowISO();
  return {
    id: generateId(),
    caseId: input.caseId,
    shellId: shell.id,
    name: shell.name,
    domain: shell.domain,
    purpose: shell.purpose,
    ageRange: shell.ageRange,
    status: "planned",
    plannedDate: input.plannedDate,
    scoringMethod: shell.scoringMethod,
    fileIds: [],
    gridIds: [],
    createdAt: now,
    updatedAt: now,
  };
}

export function newManualTest(input: {
  caseId: string;
  name: string;
  domain: TestDomain;
  purpose?: string;
  ageRange?: string;
  scoringMethod?: string;
  plannedDate?: string;
}): InternshipTest {
  const now = nowISO();
  return {
    id: generateId(),
    caseId: input.caseId,
    name: input.name.trim(),
    domain: input.domain,
    purpose: input.purpose,
    ageRange: input.ageRange,
    scoringMethod: input.scoringMethod,
    status: "planned",
    plannedDate: input.plannedDate,
    fileIds: [],
    gridIds: [],
    createdAt: now,
    updatedAt: now,
  };
}

// Returns true when the transition is legal per STATUS_NEXT.
export function canTransition(from: TestStatus, to: TestStatus): boolean {
  return STATUS_NEXT[from]?.includes(to) ?? false;
}

export function setStatus(
  list: InternshipTest[],
  id: string,
  next: TestStatus,
  extras: Partial<InternshipTest> = {}
): InternshipTest[] {
  const now = nowISO();
  return list.map((t) => {
    if (t.id !== id) return t;
    if (!canTransition(t.status, next)) return t;
    return { ...t, status: next, ...extras, updatedAt: now };
  });
}

export function patchTest(
  list: InternshipTest[],
  id: string,
  patch: Partial<Omit<InternshipTest, "id" | "createdAt" | "caseId">>
): InternshipTest[] {
  const now = nowISO();
  return list.map((t) =>
    t.id === id ? { ...t, ...patch, updatedAt: now } : t
  );
}

export function recordScore(
  list: InternshipTest[],
  id: string,
  score: InternshipTestScore,
  interpretationNotes?: string
): InternshipTest[] {
  const now = nowISO();
  return list.map((t) => {
    if (t.id !== id) return t;
    // Recording a score also advances status if we're behind.
    let nextStatus: TestStatus = t.status;
    if (
      t.status === "planned" ||
      t.status === "administered" ||
      t.status === "awaiting-scoring"
    ) {
      nextStatus = "scored";
    }
    return {
      ...t,
      score,
      interpretationNotes: interpretationNotes ?? t.interpretationNotes,
      status: nextStatus,
      updatedAt: now,
    };
  });
}

export function attachGrid(
  list: InternshipTest[],
  testId: string,
  gridId: string
): InternshipTest[] {
  const now = nowISO();
  return list.map((t) => {
    if (t.id !== testId) return t;
    if (t.gridIds.includes(gridId)) return t;
    return { ...t, gridIds: [...t.gridIds, gridId], updatedAt: now };
  });
}

export function detachGrid(
  list: InternshipTest[],
  testId: string,
  gridId: string
): InternshipTest[] {
  const now = nowISO();
  return list.map((t) => {
    if (t.id !== testId) return t;
    if (!t.gridIds.includes(gridId)) return t;
    return {
      ...t,
      gridIds: t.gridIds.filter((g) => g !== gridId),
      updatedAt: now,
    };
  });
}

export function testsForCase(
  list: InternshipTest[],
  caseId: string
): InternshipTest[] {
  return list.filter((t) => t.caseId === caseId);
}

// Sugar over the grid-library suggestion — exposed here so consumers
// can ask the test directly rather than reading the test domain
// themselves.
export function suggestGridsForTest(test: InternshipTest) {
  return suggestGridShellsForTest({ domain: test.domain });
}

export interface TestsBreakdown {
  total: number;
  byStatus: Record<TestStatus, number>;
}

export function testsBreakdown(list: InternshipTest[]): TestsBreakdown {
  const byStatus = {
    planned: 0,
    administered: 0,
    "awaiting-scoring": 0,
    scored: 0,
    reviewed: 0,
    "in-report": 0,
  } as Record<TestStatus, number>;
  for (const t of list) byStatus[t.status]++;
  return { total: list.length, byStatus };
}
