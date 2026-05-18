// Grid library — printable / editable observation grids the
// internship workspace can attach to a case. Each grid is defined as
// a name + columns + intended frequency; the actual entries live on
// the InternshipGrid record.
//
// Critically, this file also owns the domain → grid suggestion
// logic the brief flagged as "very important": given a test's
// domain, return the grid shell ids the user can attach with one
// click.

import type { TestDomain } from "./types";

export interface GridColumn {
  // Stable key — used in InternshipGridEntry.fields.
  key: string;
  label: string;
  // Optional helper hint shown beneath the column header.
  hint?: string;
  // free-text | numeric | rating
  kind?: "text" | "numeric" | "rating";
}

export interface GridShell {
  id: string;
  name: string;
  description: string;
  // What entry frequency this grid is designed for.
  frequency: "per-session" | "per-event" | "daily" | "weekly";
  columns: GridColumn[];
}

export const INTERNSHIP_GRID_SHELLS: GridShell[] = [
  {
    id: "general-clinical-observation",
    name: "General Clinical Observation Grid",
    description: "Session-by-session global observation across all axes.",
    frequency: "per-session",
    columns: [
      { key: "arrival", label: "Arrival" },
      { key: "engagement", label: "Engagement (0–4)", kind: "rating" },
      { key: "language-sample", label: "Language sample" },
      { key: "regulation-events", label: "Regulation events" },
      { key: "exit", label: "Exit / handover" },
      { key: "notes", label: "Notes" },
    ],
  },
  {
    id: "communication-grid",
    name: "Communication Grid",
    description: "Expressive / receptive / pragmatic communication tracking.",
    frequency: "per-session",
    columns: [
      { key: "eye-contact", label: "Eye contact" },
      { key: "joint-attention", label: "Joint attention" },
      { key: "gestures", label: "Gestures" },
      { key: "vocalisations", label: "Vocalisations / words" },
      { key: "requests", label: "Requests" },
      { key: "comments", label: "Comments" },
      { key: "repair", label: "Repair of breakdown" },
    ],
  },
  {
    id: "expressive-receptive-grid",
    name: "Expressive / Receptive Language Observation Grid",
    description: "Side-by-side expressive vs receptive language sampling.",
    frequency: "per-session",
    columns: [
      { key: "prompt", label: "Prompt / situation" },
      { key: "expressive", label: "Expressive response" },
      { key: "receptive", label: "Receptive response" },
      { key: "level-of-support", label: "Level of support" },
    ],
  },
  {
    id: "social-communication-grid",
    name: "Social Communication Grid",
    description: "Pragmatic / social communication functions observed.",
    frequency: "per-session",
    columns: [
      { key: "function", label: "Communicative function" },
      { key: "modality", label: "Modality (gesture/word/AAC)" },
      { key: "partner", label: "Partner (adult/peer)" },
      { key: "context", label: "Context" },
    ],
  },
  {
    id: "social-interaction-grid",
    name: "Social Interaction Grid",
    description: "Initiation, response, reciprocity across the session.",
    frequency: "per-session",
    columns: [
      { key: "initiation", label: "Initiation (count)", kind: "numeric" },
      { key: "response", label: "Response (count)", kind: "numeric" },
      { key: "reciprocity", label: "Reciprocity (0–4)", kind: "rating" },
      { key: "with-whom", label: "With whom" },
      { key: "notes", label: "Notes" },
    ],
  },
  {
    id: "joint-attention-grid",
    name: "Joint Attention Grid",
    description: "Initiation vs response to joint attention bids.",
    frequency: "per-session",
    columns: [
      { key: "type", label: "Type (initiated / responded)" },
      { key: "trigger", label: "Trigger" },
      { key: "duration", label: "Duration (s)", kind: "numeric" },
      { key: "outcome", label: "Outcome" },
    ],
  },
  {
    id: "peer-interaction-grid",
    name: "Peer Interaction Grid",
    description: "Specifically peer-directed interaction across the session.",
    frequency: "per-session",
    columns: [
      { key: "peer", label: "Peer (anonymized)" },
      { key: "context", label: "Context" },
      { key: "child-bid", label: "Child bid" },
      { key: "peer-response", label: "Peer response" },
      { key: "outcome", label: "Outcome" },
    ],
  },
  {
    id: "sensory-profile-grid",
    name: "Sensory Profile Grid",
    description: "Per-modality sensory observation.",
    frequency: "per-session",
    columns: [
      { key: "modality", label: "Modality" },
      { key: "stimulus", label: "Stimulus" },
      { key: "response", label: "Response" },
      { key: "intensity", label: "Intensity (0–10)", kind: "numeric" },
    ],
  },
  {
    id: "sensory-trigger-log",
    name: "Sensory Trigger Log",
    description: "Trigger → response → recovery time.",
    frequency: "per-event",
    columns: [
      { key: "trigger", label: "Trigger" },
      { key: "response", label: "Response" },
      { key: "recovery-time", label: "Recovery time", kind: "text" },
      { key: "strategy", label: "Strategy used" },
    ],
  },
  {
    id: "regulation-strategy-grid",
    name: "Regulation Strategy Grid",
    description: "Strategies tried + effectiveness.",
    frequency: "per-event",
    columns: [
      { key: "trigger", label: "Trigger" },
      { key: "strategy", label: "Strategy" },
      { key: "effectiveness", label: "Effectiveness (0–10)", kind: "numeric" },
      { key: "notes", label: "Notes" },
    ],
  },
  {
    id: "abc-behavior-grid",
    name: "ABC Behavior Grid",
    description: "Antecedent → Behaviour → Consequence functional analysis.",
    frequency: "per-event",
    columns: [
      { key: "antecedent", label: "Antecedent" },
      { key: "behavior", label: "Behaviour (observable)" },
      { key: "consequence", label: "Consequence" },
      { key: "function", label: "Hypothesised function" },
      { key: "intensity", label: "Intensity (0–10)", kind: "numeric" },
    ],
  },
  {
    id: "frequency-intensity-behavior-tracker",
    name: "Frequency / Intensity Behavior Tracker",
    description: "Repeated count + intensity over a window.",
    frequency: "daily",
    columns: [
      { key: "behavior", label: "Behaviour" },
      { key: "count", label: "Count", kind: "numeric" },
      { key: "avg-intensity", label: "Avg intensity (0–10)", kind: "numeric" },
      { key: "context", label: "Context" },
    ],
  },
  {
    id: "trigger-response-grid",
    name: "Trigger / Response Grid",
    description: "What triggered what, paired.",
    frequency: "per-event",
    columns: [
      { key: "trigger", label: "Trigger" },
      { key: "immediate-response", label: "Immediate response" },
      { key: "downstream-response", label: "Downstream response" },
      { key: "notes", label: "Notes" },
    ],
  },
  {
    id: "emotional-regulation-grid",
    name: "Emotional Regulation Grid",
    description: "Episode-level emotional regulation tracking.",
    frequency: "per-event",
    columns: [
      { key: "trigger", label: "Trigger" },
      { key: "emotion", label: "Emotion" },
      { key: "intensity", label: "Intensity (0–10)", kind: "numeric" },
      { key: "duration", label: "Duration" },
      { key: "co-reg-strategy", label: "Co-regulation strategy" },
      { key: "outcome", label: "Outcome" },
    ],
  },
  {
    id: "meltdown-shutdown-grid",
    name: "Meltdown / Shutdown Observation Grid",
    description: "Distinguish meltdown vs shutdown patterns over time.",
    frequency: "per-event",
    columns: [
      { key: "type", label: "Type (meltdown / shutdown)" },
      { key: "antecedent", label: "Antecedent" },
      { key: "signs", label: "Observable signs" },
      { key: "duration", label: "Duration" },
      { key: "recovery", label: "Recovery process" },
    ],
  },
  {
    id: "coping-strategy-response-grid",
    name: "Coping Strategy Response Grid",
    description: "Which coping strategies the child engaged + their effect.",
    frequency: "per-event",
    columns: [
      { key: "strategy-offered", label: "Strategy offered" },
      { key: "engagement", label: "Engagement (0–4)", kind: "rating" },
      { key: "effect", label: "Effect observed" },
      { key: "notes", label: "Notes" },
    ],
  },
  {
    id: "attention-engagement-grid",
    name: "Attention and Engagement Grid",
    description: "Focused / sustained / divided attention across activities.",
    frequency: "per-session",
    columns: [
      { key: "activity", label: "Activity" },
      { key: "attention-type", label: "Attention type" },
      { key: "duration", label: "Duration", kind: "text" },
      { key: "support-level", label: "Support needed" },
    ],
  },
  {
    id: "autonomy-grid",
    name: "Autonomy / Adaptive Functioning Grid",
    description: "Daily-living skill independence per area.",
    frequency: "weekly",
    columns: [
      { key: "skill", label: "Skill" },
      { key: "level", label: "Level (independent / supported / dependent)" },
      { key: "context", label: "Context" },
      { key: "next-step", label: "Next step" },
    ],
  },
  {
    id: "daily-living-skills-grid",
    name: "Daily Living Skills Grid",
    description: "Hygiene / dressing / eating / toileting tracking.",
    frequency: "daily",
    columns: [
      { key: "domain", label: "Domain" },
      { key: "skill", label: "Skill" },
      { key: "level", label: "Independence level" },
      { key: "notes", label: "Notes" },
    ],
  },
  {
    id: "routine-participation-grid",
    name: "Routine Participation Grid",
    description: "Participation in expected routines vs needed support.",
    frequency: "daily",
    columns: [
      { key: "routine", label: "Routine" },
      { key: "participation", label: "Participation (0–4)", kind: "rating" },
      { key: "support", label: "Support needed" },
      { key: "notes", label: "Notes" },
    ],
  },
  {
    id: "transition-difficulty-grid",
    name: "Transition Difficulty Grid",
    description: "Transitions between activities / settings.",
    frequency: "per-event",
    columns: [
      { key: "transition", label: "Transition" },
      { key: "difficulty", label: "Difficulty (0–10)", kind: "numeric" },
      { key: "strategy", label: "Strategy used" },
      { key: "outcome", label: "Outcome" },
    ],
  },
  {
    id: "intervention-response-grid",
    name: "Intervention Response Grid",
    description: "Track response to a specific intervention across sessions.",
    frequency: "per-session",
    columns: [
      { key: "intervention", label: "Intervention" },
      { key: "fidelity", label: "Fidelity (0–4)", kind: "rating" },
      { key: "response", label: "Child response" },
      { key: "notes", label: "Notes" },
    ],
  },
  {
    id: "session-participation-grid",
    name: "Session Participation Grid",
    description: "Per-session participation snapshot.",
    frequency: "per-session",
    columns: [
      { key: "objective", label: "Objective" },
      { key: "achieved", label: "Achieved? (yes / partial / no)" },
      { key: "support", label: "Support level" },
      { key: "notes", label: "Notes" },
    ],
  },
  {
    id: "supervisor-review-grid",
    name: "Supervisor Review Grid",
    description: "What the supervisor flagged + actions taken.",
    frequency: "weekly",
    columns: [
      { key: "flagged", label: "Flagged" },
      { key: "action", label: "Action" },
      { key: "owner", label: "Owner (self / supervisor / shared)" },
      { key: "due", label: "Due" },
    ],
  },
];

export function findGridShell(id: string): GridShell | undefined {
  return INTERNSHIP_GRID_SHELLS.find((g) => g.id === id);
}

// ─── Domain → grid suggestion ─────────────────────────────────────
//
// One of the most important behaviours in the studio: given a test's
// domain, propose the grids that should be attached to the case.

const DOMAIN_GRID_MAP: Record<TestDomain, string[]> = {
  communication: [
    "communication-grid",
    "expressive-receptive-grid",
    "social-communication-grid",
  ],
  "social-interaction": [
    "social-interaction-grid",
    "joint-attention-grid",
    "peer-interaction-grid",
  ],
  sensory: [
    "sensory-profile-grid",
    "sensory-trigger-log",
    "regulation-strategy-grid",
  ],
  behavior: [
    "abc-behavior-grid",
    "frequency-intensity-behavior-tracker",
    "trigger-response-grid",
  ],
  "emotional-regulation": [
    "emotional-regulation-grid",
    "meltdown-shutdown-grid",
    "coping-strategy-response-grid",
  ],
  "adaptive-functioning": [
    "autonomy-grid",
    "daily-living-skills-grid",
    "routine-participation-grid",
  ],
  cognition: ["attention-engagement-grid", "general-clinical-observation"],
  developmental: [
    "general-clinical-observation",
    "session-participation-grid",
    "intervention-response-grid",
  ],
  screening: ["general-clinical-observation"],
};

export function suggestGridShellsForDomain(domain: TestDomain): GridShell[] {
  const ids = DOMAIN_GRID_MAP[domain] ?? [];
  return ids
    .map(findGridShell)
    .filter((g): g is GridShell => Boolean(g));
}

export function suggestGridShellsForTest(test: {
  domain: TestDomain;
}): GridShell[] {
  return suggestGridShellsForDomain(test.domain);
}
