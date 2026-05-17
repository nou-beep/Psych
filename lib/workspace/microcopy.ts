// Microcopy — psychologically-aware UI language for Eyla.
//
// One file so the workspace doesn't drift into productivity / wellness
// / startup tone. UI surfaces import phrases from here instead of
// hard-coding "Task complete", "Insight generated", etc.
//
// Two helpers also live here:
//   • `replaceProductivityJargon(text)` — best-effort substitution for
//     drift words ("insights" → "patterns", "goals" → "intentions").
//     The UI uses this on dynamic strings.
//   • `tone(key, fallback)` — typed key lookup so a typo in a call site
//     surfaces at compile time.

export const PHRASES = {
  // Confirmation toasts
  saved: "Material archived",
  draftSaved: "Draft kept",
  capturedToInbox: "Captured to inbox",
  pinned: "Pinned",
  unpinned: "Unpinned",
  archived: "Set aside",
  unarchived: "Brought back",
  resolved: "Marked as resolved",
  reopened: "Reopened",
  deleted: "Removed",
  copied: "Copied",

  // Loops
  reviewPatterns: "Review patterns",
  followUpNeeded: "Needs follow-up",
  revisitLater: "Come back to this",
  parked: "Parked for now",

  // Empty states
  emptyInbox: "Nothing waiting. Captures will land here.",
  emptyCases: "No cases on the desk yet.",
  emptyThoughts: "A blank wall. Drop a thought to start thinking.",
  emptyOpenLoops: "Nothing unresolved right now.",
  emptyRecent: "No recent work yet.",
  emptyArticles: "No articles in the pile.",

  // Action verbs
  capture: "Capture",
  open: "Open",
  resume: "Resume",
  pickUpAgain: "Pick this up again",
  setAside: "Set aside",
  bringBack: "Bring back",
  archiveAction: "Archive",
  remove: "Remove",

  // Workspace memory
  lastVisited: "Last visited",
  continueWhereYouLeftOff: "Continue where you left off",
  recentlyWorkedOn: "Recently worked on",

  // Density / state
  justStarting: "Just starting",
  earlyTraces: "Early traces",
  takingShape: "Taking shape",
  wellWorked: "Well worked",
  deeplyLayered: "Deeply layered",

  // Thinking mode
  thinkingMode: "Thinking",
  dropThought: "Drop a thought",
  loosePiece: "Loose piece",
  thoughtsCount: (n: number) =>
    n === 0
      ? "no thoughts yet"
      : n === 1
      ? "1 thought on the wall"
      : `${n} thoughts on the wall`,
} as const;

export type PhraseKey = keyof typeof PHRASES;

// Quick lookup — compile-time safe.
export function tone<K extends PhraseKey>(
  key: K
): (typeof PHRASES)[K] {
  return PHRASES[key];
}

// ─── Drift-word substitution ──────────────────────────────────
//
// We touch dynamic strings (e.g. AI labels, default fields) through
// this so the wellness/productivity tone stops creeping in.
//
// Case-insensitive whole-word matches. Replacements preserve the
// original casing where possible (Title Case stays Title Case).

const DRIFT_MAP: Array<[RegExp, string]> = [
  [/\bgenerate insights\b/gi, "review patterns"],
  [/\binsights?\b/gi, "patterns"],
  [/\bunlock( your)? potential\b/gi, "look at this again"],
  [/\bemotional ecosystem\b/gi, "emotional landscape"],
  [/\bwellness journey\b/gi, "clinical work"],
  [/\bhealing space\b/gi, "workspace"],
  [/\bAI companion\b/gi, "workspace"],
  [/\bself-care path\b/gi, "session work"],
  [/\bproductivity streak\b/gi, "work rhythm"],
  [/\bproductivity\b/gi, "work"],
  [/\btask complete\b/gi, "marked as resolved"],
  [/\btask completed\b/gi, "marked as resolved"],
  [/\bcontent saved\b/gi, "material archived"],
  [/\bgenerate( a)? summary\b/gi, "summarise this"],
  [/\bsmart suggestions\b/gi, "linked material"],
];

function preserveCase(original: string, replacement: string): string {
  if (!original) return replacement;
  // If the original was Title Case, capitalize first char of replacement.
  if (original[0] === original[0].toUpperCase()) {
    return replacement[0].toUpperCase() + replacement.slice(1);
  }
  return replacement;
}

export function replaceProductivityJargon(text: string): string {
  if (!text) return text;
  let out = text;
  for (const [pattern, replacement] of DRIFT_MAP) {
    out = out.replace(pattern, (match) => preserveCase(match, replacement));
  }
  return out;
}

// ─── Status verbs ─────────────────────────────────────────────
// Centralised so toast / button / menu use the same vocabulary.

export const STATUS_VERBS = {
  archive: "Set aside",
  unarchive: "Bring back",
  resolve: "Mark resolved",
  reopen: "Reopen",
  pin: "Pin",
  unpin: "Unpin",
  pickUp: "Pick this up again",
  park: "Park for now",
} as const;

export type StatusVerb = keyof typeof STATUS_VERBS;
