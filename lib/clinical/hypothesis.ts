// Clinical Hypothesis Workspace — structured reasoning storage.
// This is NOT diagnosis automation. It records hypotheses, supporting
// and contradicting evidence, missing information, and supervision
// status to support clinical reasoning.

import { generateId, nowISO } from "@/lib/store";

export const HYPOTHESIS_STORAGE_KEY = "psych-clinical-hypotheses-v1";

export type HypothesisStatus =
  | "exploring"
  | "supported"
  | "unsupported"
  | "needs-further-assessment"
  | "discussed-in-supervision";

export const HYPOTHESIS_STATUS_LABELS: Record<HypothesisStatus, string> = {
  exploring: "Exploring",
  supported: "Supported",
  unsupported: "Unsupported",
  "needs-further-assessment": "Needs further assessment",
  "discussed-in-supervision": "Discussed in supervision",
};

export interface EvidenceItem {
  id: string;
  text: string;
  source?: string; // free-text reference (e.g. "Session 3", "PHQ-9 baseline")
  createdAt: string;
}

export interface ClinicalHypothesis {
  id: string;
  caseId: string;
  title: string;
  rationale: string;
  status: HypothesisStatus;
  confidence: 1 | 2 | 3 | 4 | 5;
  evidenceFor: EvidenceItem[];
  evidenceAgainst: EvidenceItem[];
  missingInformation: string[];
  differentials: string[]; // alternative considerations
  followUpQuestions: string[];
  linkedAssessmentIds: string[];
  supervisionComments: string;
  ruleOutNotes: string;
  createdAt: string;
  updatedAt: string;
}

export const HYPOTHESIS_DISCLAIMER =
  "This workspace supports structured clinical reasoning and supervision. It does not provide diagnoses.";

export function emptyHypothesis(caseId: string): ClinicalHypothesis {
  return {
    id: generateId(),
    caseId,
    title: "",
    rationale: "",
    status: "exploring",
    confidence: 3,
    evidenceFor: [],
    evidenceAgainst: [],
    missingInformation: [],
    differentials: [],
    followUpQuestions: [],
    linkedAssessmentIds: [],
    supervisionComments: "",
    ruleOutNotes: "",
    createdAt: nowISO(),
    updatedAt: nowISO(),
  };
}

export function addEvidence(
  h: ClinicalHypothesis,
  bucket: "evidenceFor" | "evidenceAgainst",
  text: string,
  source?: string
): ClinicalHypothesis {
  if (!text.trim()) return h;
  const next: EvidenceItem = {
    id: generateId(),
    text: text.trim(),
    source,
    createdAt: nowISO(),
  };
  return {
    ...h,
    [bucket]: [...h[bucket], next],
    updatedAt: nowISO(),
  };
}

export function removeEvidence(
  h: ClinicalHypothesis,
  bucket: "evidenceFor" | "evidenceAgainst",
  evidenceId: string
): ClinicalHypothesis {
  return {
    ...h,
    [bucket]: h[bucket].filter((e) => e.id !== evidenceId),
    updatedAt: nowISO(),
  };
}

export function setStatus(
  h: ClinicalHypothesis,
  status: HypothesisStatus
): ClinicalHypothesis {
  return { ...h, status, updatedAt: nowISO() };
}

// Quick metric: how well-evidenced is the hypothesis right now?
// Score = supporting evidence count − contradicting evidence count.
// (Pure descriptive helper — not a diagnostic indicator.)
export function evidenceBalance(h: ClinicalHypothesis): number {
  return h.evidenceFor.length - h.evidenceAgainst.length;
}
