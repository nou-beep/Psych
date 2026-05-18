// Internship Studio — typed data models.
//
// One model file so consumers can `import type { InternshipCase,
// InternshipTest, ... }` from a single place. Pure types + a couple of
// label/status constants. No mutations live here.

export type ConsentStatus = "verbal" | "written" | "pending" | "n/a";

export type TestDomain =
  | "communication"
  | "social-interaction"
  | "sensory"
  | "behavior"
  | "emotional-regulation"
  | "adaptive-functioning"
  | "cognition"
  | "developmental"
  | "screening";

export const TEST_DOMAIN_LABELS: Record<TestDomain, string> = {
  communication: "Communication",
  "social-interaction": "Social interaction",
  sensory: "Sensory",
  behavior: "Behavior",
  "emotional-regulation": "Emotional regulation",
  "adaptive-functioning": "Adaptive functioning",
  cognition: "Cognition",
  developmental: "Developmental",
  screening: "Screening",
};

export type TestStatus =
  | "planned"
  | "administered"
  | "awaiting-scoring"
  | "scored"
  | "reviewed"
  | "in-report";

export const TEST_STATUS_LABELS: Record<TestStatus, string> = {
  planned: "Planned",
  administered: "Administered",
  "awaiting-scoring": "Awaiting scoring",
  scored: "Scored",
  reviewed: "Reviewed in supervision",
  "in-report": "Inserted in report",
};

// ─── Identification + clinical context ──────────────────────────────

export interface InternshipIdentification {
  caseCode: string; // anonymized — never a real name
  age?: string; // e.g. "6 years" / "11 mo"
  setting?: string; // e.g. "association · medico-social"
  internshipPlace?: string;
  supervisor?: string;
  reasonForFollowUp?: string;
  presentingConcerns?: string;
  diagnosticContext?: string;
  consent: ConsentStatus;
}

// Free-text clinical-context bag. All fields optional so partial
// profiles render gracefully. The new structured selectors live on
// `structuredProfile`; the free-text fields stay for nuance that
// doesn't fit a chip.
export interface InternshipClinicalContext {
  developmentalObservations?: string;
  communicationProfile?: string;
  socialInteraction?: string;
  emotionalRegulation?: string;
  sensoryProfile?: string;
  behaviorObservations?: string;
  attentionEngagement?: string;
  autonomyAdaptive?: string;
  familySchoolContext?: string;
  // Optional structured profile — driven by chips / segmented
  // controls / multi-select on the Overview tab. Lives here so
  // existing case records continue to parse.
  structuredProfile?: import("./structured-profile").StructuredProfile;
}

// ─── Case ─────────────────────────────────────────────────────────

export interface InternshipCase {
  id: string;
  identification: InternshipIdentification;
  context: InternshipClinicalContext;
  // Date the internship case was opened.
  startDate: string;
  // ISO timestamps.
  createdAt: string;
  updatedAt: string;
  // Soft-delete.
  archived?: boolean;
}

// ─── Tests ───────────────────────────────────────────────────────

export interface InternshipTestScore {
  // Free-text score / band / raw value — many tests have non-numeric scoring.
  rawScore?: string;
  // Optional standardized score.
  standardScore?: string;
  // Optional band / interpretation label (e.g. "moderate symptoms").
  band?: string;
}

export interface InternshipTest {
  id: string;
  caseId: string;
  // Anchor on a test-shell id (see test-shells.ts) when seeded; manual
  // tests can leave shellId undefined.
  shellId?: string;
  name: string;
  domain: TestDomain;
  purpose?: string;
  ageRange?: string;
  status: TestStatus;
  // Planning + administration.
  plannedDate?: string;
  administrationDate?: string;
  scoringMethod?: string;
  score?: InternshipTestScore;
  interpretationNotes?: string;
  supervisorComments?: string;
  // Linked attachments and grids surface through file/grid records.
  fileIds: string[];
  gridIds: string[];
  // Audit.
  createdAt: string;
  updatedAt: string;
}

// ─── Grids ───────────────────────────────────────────────────────

// A grid is a structured observation form. We store the entries
// (not the form schema — that lives in grid-library.ts) so the same
// grid can be filled multiple times across sessions.
export interface InternshipGridEntry {
  id: string;
  // Free-form key/value of the grid's columns this row covers.
  fields: Record<string, string>;
  // The session / observation moment this entry belongs to.
  date?: string;
  sessionLabel?: string;
  notes?: string;
  createdAt: string;
}

export interface InternshipGrid {
  id: string;
  caseId: string;
  // Anchor on a grid-library shell id.
  shellId: string;
  // Display name override (defaults to shell name).
  name?: string;
  // Linked tests (which test prompted this grid).
  linkedTestIds: string[];
  entries: InternshipGridEntry[];
  // Optional weekly synthesis paragraph the user writes once the
  // grid has accumulated enough rows.
  weeklySynthesis?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Reports ─────────────────────────────────────────────────────

export type InternshipReportKind =
  | "daily"
  | "weekly"
  | "monthly"
  | "test-admin"
  | "grid-summary"
  | "supervision-summary"
  | "final";

export const INTERNSHIP_REPORT_LABELS: Record<InternshipReportKind, string> = {
  daily: "Daily observation",
  weekly: "Weekly synthesis",
  monthly: "Monthly synthesis",
  "test-admin": "Test administration",
  "grid-summary": "Evaluation grid summary",
  "supervision-summary": "Supervision summary",
  final: "Final internship report",
};

// Daily report sections — matches the brief exactly.
export interface DailyReportSections {
  date: string;
  contextSession?: string;
  // Structured context chip — drives the "context / session" line
  // when the user picks from the standard CONTEXT_OPTIONS.
  contextChip?: import("@/components/ui/structured/options").ClinicalContext;
  objectives?: string;
  observations?: string;
  communication?: string;
  socialInteraction?: string;
  behavior?: string;
  emotionalRegulation?: string;
  sensoryNotes?: string;
  // Free-text fallback — the chip selections below auto-generate
  // this string but the user can edit it freely.
  interventionUsed?: string;
  // Structured chip selections for the intervention section.
  // Persisted so the chip state survives reloads and can drive
  // weekly / final-report assembly.
  interventionChips?: import("./intervention-chips").InterventionChip[];
  response?: string;
  // Structured chip for the response section.
  responseQuality?: import("@/components/ui/structured/options").ResponseQuality;
  reflection?: string;
  nextSteps?: string;
}

// Weekly report sections.
export interface WeeklyReportSections {
  weekStart: string;
  weekEnd: string;
  sessionsCompleted?: number;
  progressObserved?: string;
  difficulties?: string;
  repeatedPatterns?: string;
  testsAdministered?: string;
  gridsCompleted?: string;
  supervisionQuestions?: string;
  nextWeekObjectives?: string;
  // Daily report ids that fed into this weekly synthesis.
  sourceDailyIds: string[];
}

// Final report has the most sections; kept loose so an unfinished
// report still renders.
export interface FinalReportSections {
  coverPage?: string;
  internshipContext?: string;
  casePresentation?: string;
  observationMethodology?: string;
  testsAdministered?: string;
  evaluationGrids?: string;
  clinicalObservations?: string;
  interventionReflection?: string;
  progressEvolution?: string;
  supervisionReflections?: string;
  limits?: string;
  recommendations?: string;
  conclusion?: string;
  appendices?: string;
}

export interface InternshipReport {
  id: string;
  caseId: string;
  kind: InternshipReportKind;
  title: string;
  // Only one of these is populated, matching `kind`.
  daily?: DailyReportSections;
  weekly?: WeeklyReportSections;
  monthly?: WeeklyReportSections; // same shape; sourceDailyIds may be larger
  final?: FinalReportSections;
  // Free-text body for the simpler report kinds.
  body?: string;
  // Linked supervision / test ids surfaced in the report.
  linkedSupervisionIds: string[];
  linkedTestIds: string[];
  linkedGridIds: string[];
  // Audit + status.
  draft: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Supervision ─────────────────────────────────────────────────

export interface InternshipSupervisionNote {
  id: string;
  caseId: string;
  date: string;
  supervisor?: string;
  casesDiscussed?: string;
  testsDiscussed?: string;
  gridsReviewed?: string;
  clinicalQuestions?: string;
  feedbackReceived?: string;
  correctionsRequested?: string;
  actionPlan?: string;
  followUp?: string;
  // Cross-links.
  linkedTestIds: string[];
  linkedGridIds: string[];
  linkedReportIds: string[];
  createdAt: string;
  updatedAt: string;
}

// ─── Files ────────────────────────────────────────────────────────

export type InternshipFileKind =
  | "test-pdf"
  | "consent"
  | "scanned-grid"
  | "report-draft"
  | "supervisor-feedback"
  | "other";

export const INTERNSHIP_FILE_KIND_LABELS: Record<InternshipFileKind, string> = {
  "test-pdf": "Test PDF",
  consent: "Consent document",
  "scanned-grid": "Scanned grid",
  "report-draft": "Report draft",
  "supervisor-feedback": "Supervisor feedback",
  other: "Other",
};

export interface InternshipFile {
  id: string;
  caseId: string;
  kind: InternshipFileKind;
  // Filename for display. We don't store binary in localStorage; this
  // record is metadata only (the user keeps the actual file on disk).
  name: string;
  size?: number;
  notes?: string;
  tags: string[];
  // Cross-links.
  linkedTestId?: string;
  linkedGridId?: string;
  linkedReportId?: string;
  // Audit.
  uploadedAt: string;
}

// ─── Daily/Weekly convenience aliases (the brief asked for these
// explicitly as separate types — they're slim views over reports). ─

export type InternshipDailyReport = InternshipReport & { kind: "daily"; daily: DailyReportSections };
export type InternshipWeeklyReport = InternshipReport & { kind: "weekly"; weekly: WeeklyReportSections };
