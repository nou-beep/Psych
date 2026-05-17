// Human traces — computes "evidence of work" indicators for a case
// desktop, thesis chapter, transcript, or article. These drive subtle
// visual layering (more dots, slightly denser borders, a faint count
// label) — never numbers in your face. The point is that a heavily
// worked case desktop *feels* heavier than a fresh one.
//
// Pure functions: the UI reads `caseTraces(...)` and renders.

export interface CaseTraceInputs {
  sessionCount: number;
  checkInCount: number;
  worksheetCount: number;
  noteCount: number;
  timelineEventCount: number;
  bodyMapRevisionCount: number;
  quoteCount: number;
  codingCount: number;
  openLoopCount: number;
  supervisionNoteCount: number;
  lastTouchedISO?: string;
}

export type DensityLevel =
  | "blank"
  | "light"
  | "moderate"
  | "developed"
  | "dense";

export const DENSITY_LABELS: Record<DensityLevel, string> = {
  blank: "Just starting",
  light: "Early traces",
  moderate: "Taking shape",
  developed: "Well worked",
  dense: "Deeply layered",
};

// Each input has a soft cap so a single huge number doesn't dominate.
// Caps were picked to feel "well worked" at typical mid-thesis density.
const CAPS: Record<keyof CaseTraceInputs, number> = {
  sessionCount: 30,
  checkInCount: 50,
  worksheetCount: 20,
  noteCount: 80,
  timelineEventCount: 40,
  bodyMapRevisionCount: 10,
  quoteCount: 30,
  codingCount: 100,
  openLoopCount: 10,
  supervisionNoteCount: 10,
  lastTouchedISO: 1,
};

// Each numeric input contributes proportionally to its cap.
const KEYS: Array<keyof CaseTraceInputs> = [
  "sessionCount",
  "checkInCount",
  "worksheetCount",
  "noteCount",
  "timelineEventCount",
  "bodyMapRevisionCount",
  "quoteCount",
  "codingCount",
  "openLoopCount",
  "supervisionNoteCount",
];

export interface CaseTraces {
  density: DensityLevel;
  // 0-100 normalized score.
  score: number;
  // Highlighted facets — the 1-3 inputs that contributed most.
  topFacets: Array<{ key: keyof CaseTraceInputs; value: number; label: string }>;
  // Days since last touch (or null if unknown).
  daysSinceTouched: number | null;
  // Subtle phrase the UI can use as a tooltip — "16 sessions, 4 worksheets, 22 quotes".
  hint: string;
}

const FACET_LABELS: Record<keyof CaseTraceInputs, string> = {
  sessionCount: "sessions",
  checkInCount: "check-ins",
  worksheetCount: "worksheets",
  noteCount: "notes",
  timelineEventCount: "timeline events",
  bodyMapRevisionCount: "body map revisions",
  quoteCount: "quotes",
  codingCount: "coded fragments",
  openLoopCount: "open loops",
  supervisionNoteCount: "supervision notes",
  lastTouchedISO: "last touch",
};

export function caseTraces(input: CaseTraceInputs): CaseTraces {
  let weighted = 0;
  let denom = 0;
  for (const k of KEYS) {
    const v = Math.max(0, input[k] as number);
    const cap = CAPS[k] || 1;
    weighted += Math.min(1, v / cap);
    denom += 1;
  }
  const score = Math.round((weighted / denom) * 100);
  const density: DensityLevel =
    score >= 70
      ? "dense"
      : score >= 45
      ? "developed"
      : score >= 22
      ? "moderate"
      : score >= 5
      ? "light"
      : "blank";

  const facets = KEYS.map((k) => ({
    key: k,
    value: input[k] as number,
    label: FACET_LABELS[k],
  }))
    .filter((f) => f.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 3);

  const daysSinceTouched = input.lastTouchedISO
    ? Math.max(
        0,
        Math.floor(
          (Date.now() - Date.parse(input.lastTouchedISO)) /
            (24 * 60 * 60 * 1000)
        )
      )
    : null;

  const hint = facets.length
    ? facets.map((f) => `${f.value} ${f.label}`).join(", ")
    : "no traces yet";

  return {
    density,
    score,
    topFacets: facets,
    daysSinceTouched,
    hint,
  };
}

// ─── Chapter traces (thesis writer) ────────────────────────────

export interface ChapterTraceInputs {
  wordCount: number;
  sectionCount: number;
  draftSectionCount: number;
  unresolvedMarkerCount: number;
  linkedQuoteCount: number;
  linkedReferenceCount: number;
  lastTouchedISO?: string;
}

const CHAPTER_TARGETS = {
  wordCount: 3000,
  sectionCount: 6,
  linkedQuoteCount: 8,
  linkedReferenceCount: 15,
};

export interface ChapterTraces {
  // 0-100 readiness score.
  score: number;
  // Editorial vibe label.
  state:
    | "blank"
    | "outlined"
    | "drafted"
    | "in-revision"
    | "near-complete";
  hint: string;
  // Soft warning strings the UI can show beside the chapter title.
  flags: string[];
  daysSinceTouched: number | null;
}

export function chapterTraces(input: ChapterTraceInputs): ChapterTraces {
  const w = Math.min(1, input.wordCount / CHAPTER_TARGETS.wordCount);
  const s = Math.min(1, input.sectionCount / CHAPTER_TARGETS.sectionCount);
  const q = Math.min(1, input.linkedQuoteCount / CHAPTER_TARGETS.linkedQuoteCount);
  const r = Math.min(
    1,
    input.linkedReferenceCount / CHAPTER_TARGETS.linkedReferenceCount
  );
  // Average across the 4 facets, then dock for unresolved markers and
  // draft sections so a chapter doesn't grade itself out of revision.
  const baseline = (w + s + q + r) / 4;
  const draftPenalty =
    input.sectionCount > 0
      ? (input.draftSectionCount / input.sectionCount) * 0.15
      : 0;
  const markerPenalty = Math.min(0.25, input.unresolvedMarkerCount * 0.04);
  const score = Math.max(
    0,
    Math.round((baseline - draftPenalty - markerPenalty) * 100)
  );

  const state: ChapterTraces["state"] =
    score >= 80
      ? "near-complete"
      : score >= 55
      ? "in-revision"
      : score >= 25
      ? "drafted"
      : input.sectionCount > 0
      ? "outlined"
      : "blank";

  const flags: string[] = [];
  if (input.draftSectionCount > 0 && input.sectionCount > 0) {
    flags.push(
      `${input.draftSectionCount}/${input.sectionCount} sections still drafts`
    );
  }
  if (input.unresolvedMarkerCount > 0) {
    flags.push(
      `${input.unresolvedMarkerCount} unresolved marker${
        input.unresolvedMarkerCount === 1 ? "" : "s"
      }`
    );
  }
  if (input.linkedReferenceCount === 0 && input.wordCount > 400) {
    flags.push("no references cited yet");
  }
  if (input.linkedQuoteCount === 0 && input.wordCount > 800) {
    flags.push("no quotes anchored");
  }

  const daysSinceTouched = input.lastTouchedISO
    ? Math.max(
        0,
        Math.floor(
          (Date.now() - Date.parse(input.lastTouchedISO)) /
            (24 * 60 * 60 * 1000)
        )
      )
    : null;

  const hint = `${input.wordCount} words · ${input.sectionCount} section${
    input.sectionCount === 1 ? "" : "s"
  } · ${input.linkedReferenceCount} ref${
    input.linkedReferenceCount === 1 ? "" : "s"
  }`;

  return { score, state, hint, flags, daysSinceTouched };
}

// ─── Phrase helpers ────────────────────────────────────────────

export function daysSinceLabel(days: number | null): string {
  if (days === null) return "—";
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 14) return "a week ago";
  if (days < 30) return `${Math.round(days / 7)} weeks ago`;
  if (days < 60) return "a month ago";
  return `${Math.round(days / 30)} months ago`;
}
