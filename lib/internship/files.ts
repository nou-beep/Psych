// Internship file metadata. We store metadata only — binaries don't
// belong in localStorage. The user keeps the original file on disk;
// this record gives the workspace something to cross-link against.

import { generateId, nowISO } from "@/lib/store";
import type { InternshipFile, InternshipFileKind } from "./types";

export function newFileRecord(input: {
  caseId: string;
  kind: InternshipFileKind;
  name: string;
  size?: number;
  notes?: string;
  tags?: string[];
  linkedTestId?: string;
  linkedGridId?: string;
  linkedReportId?: string;
}): InternshipFile {
  return {
    id: generateId(),
    caseId: input.caseId,
    kind: input.kind,
    name: input.name.trim(),
    size: input.size,
    notes: input.notes,
    tags: (input.tags ?? []).map((t) => t.trim()).filter(Boolean),
    linkedTestId: input.linkedTestId,
    linkedGridId: input.linkedGridId,
    linkedReportId: input.linkedReportId,
    uploadedAt: nowISO(),
  };
}

export function filesForCase(
  list: InternshipFile[],
  caseId: string
): InternshipFile[] {
  return list.filter((f) => f.caseId === caseId);
}

export function filesForTest(
  list: InternshipFile[],
  testId: string
): InternshipFile[] {
  return list.filter((f) => f.linkedTestId === testId);
}
