// Internship case helpers — pure functions for creating cases,
// patching identification / context, and toggling archive state.
// Status transitions for tests live in tests.ts; for grids / reports
// in their own files.

import { generateId, nowISO } from "@/lib/store";
import type {
  InternshipCase,
  InternshipClinicalContext,
  InternshipIdentification,
} from "./types";

export function newCase(input: {
  caseCode: string;
  age?: string;
  setting?: string;
  internshipPlace?: string;
  supervisor?: string;
  reasonForFollowUp?: string;
  presentingConcerns?: string;
  diagnosticContext?: string;
  consent?: InternshipIdentification["consent"];
  startDate?: string;
  context?: Partial<InternshipClinicalContext>;
}): InternshipCase {
  const now = nowISO();
  return {
    id: generateId(),
    identification: {
      caseCode: input.caseCode.trim(),
      age: input.age,
      setting: input.setting,
      internshipPlace: input.internshipPlace,
      supervisor: input.supervisor,
      reasonForFollowUp: input.reasonForFollowUp,
      presentingConcerns: input.presentingConcerns,
      diagnosticContext: input.diagnosticContext,
      consent: input.consent ?? "pending",
    },
    context: { ...(input.context ?? {}) },
    startDate: input.startDate ?? now.slice(0, 10),
    createdAt: now,
    updatedAt: now,
  };
}

export function patchIdentification(
  list: InternshipCase[],
  id: string,
  patch: Partial<InternshipIdentification>
): InternshipCase[] {
  const now = nowISO();
  return list.map((c) =>
    c.id === id
      ? {
          ...c,
          identification: { ...c.identification, ...patch },
          updatedAt: now,
        }
      : c
  );
}

export function patchContext(
  list: InternshipCase[],
  id: string,
  patch: Partial<InternshipClinicalContext>
): InternshipCase[] {
  const now = nowISO();
  return list.map((c) =>
    c.id === id
      ? {
          ...c,
          context: { ...c.context, ...patch },
          updatedAt: now,
        }
      : c
  );
}

export function archiveCase(
  list: InternshipCase[],
  id: string,
  archived: boolean
): InternshipCase[] {
  const now = nowISO();
  return list.map((c) =>
    c.id === id ? { ...c, archived, updatedAt: now } : c
  );
}

export function activeCases(list: InternshipCase[]): InternshipCase[] {
  return list.filter((c) => !c.archived);
}
