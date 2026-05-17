// Mental Status Examination — structured fields + descriptors for each
// domain. Pure data; the UI renders dropdowns and free-text fields.

export interface MSEDomain {
  id: keyof MSEEntry;
  label: string;
  descriptors: string[];
  reportPhrasing: string; // template snippet for inclusion in formal reports
}

export interface MSEEntry {
  id: string;
  caseId?: string;
  date: string;
  // Domains (free-text descriptions clinicians compile).
  appearance: string;
  behavior: string;
  speech: string;
  mood: string;
  affect: string;
  thoughtProcess: string;
  thoughtContent: string;
  perception: string;
  cognition: string;
  memory: string;
  concentration: string;
  orientation: string;
  insight: string;
  judgment: string;
  psychomotor: string;
  riskObservations: string;
  // Selected descriptor chips (per domain). Helps with quick entry +
  // longitudinal comparison.
  chips: Partial<Record<keyof MSEEntry, string[]>>;
  clinicianNotes: string;
  createdAt: string;
  updatedAt: string;
}

export const MSE_DOMAINS: MSEDomain[] = [
  {
    id: "appearance",
    label: "Appearance",
    descriptors: [
      "well-groomed",
      "casually dressed",
      "dishevelled",
      "appropriate for setting",
      "weight loss apparent",
      "self-care concerns",
    ],
    reportPhrasing:
      "The client presented as {desc}, with attire appropriate to the setting.",
  },
  {
    id: "behavior",
    label: "Behavior",
    descriptors: [
      "cooperative",
      "engaged",
      "guarded",
      "restless",
      "fidgety",
      "psychomotor slowing",
      "withdrawn",
      "agitated",
    ],
    reportPhrasing:
      "Behavior throughout the session was {desc}, with eye contact …",
  },
  {
    id: "speech",
    label: "Speech",
    descriptors: [
      "normal rate and rhythm",
      "soft",
      "loud",
      "pressured",
      "slowed",
      "monosyllabic",
      "fluent",
      "circumstantial",
    ],
    reportPhrasing: "Speech was {desc}, with no articulation difficulties noted.",
  },
  {
    id: "mood",
    label: "Mood (subjective)",
    descriptors: [
      "anxious",
      "low",
      "neutral",
      "irritable",
      "elevated",
      "tearful",
      "numb",
      "ashamed",
    ],
    reportPhrasing: "The client described their mood as {desc}.",
  },
  {
    id: "affect",
    label: "Affect (observed)",
    descriptors: [
      "congruent with mood",
      "incongruent",
      "blunted",
      "flat",
      "restricted range",
      "labile",
      "reactive",
      "full range",
    ],
    reportPhrasing: "Affect was observed to be {desc}, …",
  },
  {
    id: "thoughtProcess",
    label: "Thought process",
    descriptors: [
      "linear",
      "goal-directed",
      "circumstantial",
      "tangential",
      "flight of ideas",
      "loose associations",
      "thought blocking",
    ],
    reportPhrasing: "Thought process appeared {desc}.",
  },
  {
    id: "thoughtContent",
    label: "Thought content",
    descriptors: [
      "no abnormal content noted",
      "ruminative themes",
      "worry-focused",
      "self-critical",
      "intrusive thoughts",
      "obsessional",
      "themes of hopelessness",
    ],
    reportPhrasing: "Thought content was characterised by {desc}.",
  },
  {
    id: "perception",
    label: "Perception",
    descriptors: [
      "no perceptual disturbance reported",
      "depersonalization reported",
      "derealization reported",
      "no hallucinations noted",
      "illusions noted",
    ],
    reportPhrasing: "Perceptual experience: {desc}.",
  },
  {
    id: "cognition",
    label: "Cognition",
    descriptors: [
      "grossly intact",
      "alert",
      "attentive",
      "impaired attention",
      "executive function concerns",
    ],
    reportPhrasing: "Cognition appeared {desc}.",
  },
  {
    id: "memory",
    label: "Memory",
    descriptors: [
      "intact for recent and remote events",
      "recent memory difficulties",
      "remote recall concerns",
      "not formally tested",
    ],
    reportPhrasing: "Memory was {desc}.",
  },
  {
    id: "concentration",
    label: "Concentration",
    descriptors: [
      "intact",
      "mildly impaired",
      "easily distracted",
      "fluctuating",
    ],
    reportPhrasing: "Concentration was {desc}.",
  },
  {
    id: "orientation",
    label: "Orientation",
    descriptors: [
      "oriented x4 (person, place, time, situation)",
      "oriented x3",
      "disoriented to time",
      "disoriented to place",
    ],
    reportPhrasing: "Orientation: {desc}.",
  },
  {
    id: "insight",
    label: "Insight",
    descriptors: ["good", "fair", "limited", "poor", "fluctuating"],
    reportPhrasing: "Insight into difficulties was {desc}.",
  },
  {
    id: "judgment",
    label: "Judgment",
    descriptors: ["good", "fair", "limited", "impulsive at times", "intact"],
    reportPhrasing: "Judgment in present functioning was {desc}.",
  },
  {
    id: "psychomotor",
    label: "Psychomotor activity",
    descriptors: ["unremarkable", "slowed", "agitated", "restless", "tense"],
    reportPhrasing: "Psychomotor activity was {desc}.",
  },
  {
    id: "riskObservations",
    label: "Risk observations",
    descriptors: [
      "no acute risk concerns reported or observed",
      "passive ideation reported",
      "active ideation reported — safety plan reviewed",
      "self-harm concerns discussed",
      "supervision flagged",
    ],
    reportPhrasing: "Risk assessment in-session: {desc}.",
  },
];

export const MSE_STORAGE_KEY = "psych-mse-entries-v1";

export function emptyMSE(caseId?: string): MSEEntry {
  const now = new Date().toISOString();
  return {
    id: `mse-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    caseId,
    date: now.split("T")[0],
    appearance: "",
    behavior: "",
    speech: "",
    mood: "",
    affect: "",
    thoughtProcess: "",
    thoughtContent: "",
    perception: "",
    cognition: "",
    memory: "",
    concentration: "",
    orientation: "",
    insight: "",
    judgment: "",
    psychomotor: "",
    riskObservations: "",
    chips: {},
    clinicianNotes: "",
    createdAt: now,
    updatedAt: now,
  };
}

// Builds a formal narrative paragraph from MSE entry — used to insert
// into reports.
export function mseAsReportNarrative(entry: MSEEntry): string {
  const parts: string[] = [];
  for (const d of MSE_DOMAINS) {
    const val = entry[d.id];
    if (typeof val !== "string" || !val.trim()) continue;
    parts.push(d.reportPhrasing.replace("{desc}", val.trim()));
  }
  return parts.join(" ");
}

export function diffMSE(
  a: MSEEntry,
  b: MSEEntry
): Array<{ domain: string; before: string; after: string }> {
  const out: Array<{ domain: string; before: string; after: string }> = [];
  for (const d of MSE_DOMAINS) {
    const av = (a[d.id] as string) ?? "";
    const bv = (b[d.id] as string) ?? "";
    if (av !== bv) out.push({ domain: d.label, before: av, after: bv });
  }
  return out;
}
