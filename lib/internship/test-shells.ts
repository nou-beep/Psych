// Test shells — structured starters for common autism / developmental
// internship instruments. Every shell is a generic skeleton: name,
// domain, what it evaluates, age range, scoring method. No
// copyrighted items, no scoring tables. The user is expected to use
// official manuals for administration and interpretation.

import type { TestDomain } from "./types";

export interface TestShell {
  id: string;
  name: string;
  fullName?: string;
  domain: TestDomain;
  purpose: string;
  ageRange?: string;
  scoringMethod?: string;
  // A short paragraph the user reads while planning the administration.
  description: string;
  // Standard licensing reminder displayed beside every shell in the UI.
  licensingNote: string;
}

const LICENSING_NOTE =
  "Structured shell only. Use official test materials and the published manual for administration and interpretation.";

export const INTERNSHIP_TEST_SHELLS: TestShell[] = [
  {
    id: "cars-2",
    name: "CARS-2 (shell)",
    fullName: "Childhood Autism Rating Scale — 2nd ed.",
    domain: "screening",
    ageRange: "2 years +",
    scoringMethod: "Sum of 15 items, each rated 1–4; total score band.",
    purpose: "Quantify autism-spectrum severity from clinician observation.",
    description:
      "Clinician-rated scale. 15 items covering relating to people, imitation, emotional response, body use, object use, adaptation to change, visual response, listening response, taste/smell/touch, fear/nervousness, verbal communication, non-verbal communication, activity level, intellectual response, and general impression.",
    licensingNote: LICENSING_NOTE,
  },
  {
    id: "m-chat-r-f",
    name: "M-CHAT-R/F (shell)",
    fullName: "Modified Checklist for Autism in Toddlers — Revised with Follow-up",
    domain: "screening",
    ageRange: "16–30 months",
    scoringMethod: "20-item parent questionnaire + follow-up interview; risk bands.",
    purpose: "Early screening for autism risk in toddlers.",
    description:
      "Parent-completed questionnaire with a structured follow-up interview for borderline cases. Use the official scoring sheet to determine low / medium / high risk.",
    licensingNote: LICENSING_NOTE,
  },
  {
    id: "vineland",
    name: "Vineland (shell)",
    fullName: "Vineland Adaptive Behavior Scales",
    domain: "adaptive-functioning",
    ageRange: "0–90 years",
    scoringMethod: "Standard score / age-equivalent per domain.",
    purpose: "Assess adaptive functioning across communication, daily living, and socialization.",
    description:
      "Caregiver interview or rating form. Domains: Communication, Daily Living Skills, Socialization, Motor Skills (if age <7). Each domain produces a standard score and age-equivalent.",
    licensingNote: LICENSING_NOTE,
  },
  {
    id: "ablls-r",
    name: "ABLLS-R (shell)",
    fullName: "Assessment of Basic Language and Learning Skills — Revised",
    domain: "communication",
    ageRange: "Toddlers through early school age",
    scoringMethod: "Skill grid per area, marked 0–4.",
    purpose: "Map language / academic / self-help skills for ABA-style programming.",
    description:
      "Skills inventory across 25 areas (cooperation, visual performance, receptive language, motor imitation, vocal imitation, requests, labeling, intraverbals, spontaneous vocalizations, syntax, play, social interaction, group instruction, classroom routines, generalization, reading, math, writing, spelling, dressing, eating, grooming, toileting, gross motor, fine motor).",
    licensingNote: LICENSING_NOTE,
  },
  {
    id: "vb-mapp",
    name: "VB-MAPP (shell)",
    fullName: "Verbal Behavior Milestones Assessment and Placement Program",
    domain: "developmental",
    ageRange: "0–48 months developmental range",
    scoringMethod: "Milestone counts across 3 levels.",
    purpose: "Track verbal-behavior milestones for early intervention planning.",
    description:
      "Three milestone levels (0–18mo / 18–30mo / 30–48mo) across 16 skill areas. Companion barriers and transitions sub-scales available.",
    licensingNote: LICENSING_NOTE,
  },
  {
    id: "sensory-profile",
    name: "Sensory Profile (shell)",
    fullName: "Sensory Profile",
    domain: "sensory",
    ageRange: "Birth–adulthood (different forms per age)",
    scoringMethod: "Quadrant scores: Seeking, Avoiding, Sensitivity, Registration.",
    purpose: "Map sensory processing patterns across modalities.",
    description:
      "Caregiver/self-report rating. Modalities: auditory, visual, touch, taste/smell, body position (proprioceptive), movement (vestibular). Yields four pattern quadrants.",
    licensingNote: LICENSING_NOTE,
  },
  {
    id: "communication-checklist",
    name: "Communication observation checklist",
    domain: "communication",
    ageRange: "Any",
    scoringMethod: "Tick-list + free-text per session.",
    purpose: "Track expressive / receptive / pragmatic communication across sessions.",
    description:
      "Free observation grid with prompts: eye contact, joint attention, gestures, vocalisations, single words, phrases, requests, comments, turn-taking, repair of breakdown, prosody.",
    licensingNote: LICENSING_NOTE,
  },
  {
    id: "social-interaction-checklist",
    name: "Social interaction observation checklist",
    domain: "social-interaction",
    ageRange: "Any",
    scoringMethod: "Tick-list per session + frequency tallies.",
    purpose: "Observe initiation, response, reciprocity, and peer interaction.",
    description:
      "Prompts: initiates with adult, initiates with peer, responds to bid, sustains exchange, repair, shares enjoyment, parallel play, cooperative play, conflict tolerance.",
    licensingNote: LICENSING_NOTE,
  },
  {
    id: "emotional-regulation-checklist",
    name: "Emotional regulation observation checklist",
    domain: "emotional-regulation",
    ageRange: "Any",
    scoringMethod: "Free-text per episode + intensity 0–10.",
    purpose: "Map regulation strategies, triggers, recovery time.",
    description:
      "Prompts: trigger, intensity, duration, observable behaviour, co-regulator action, recovery time, strategy used by child, strategy used by adult, post-event reflection.",
    licensingNote: LICENSING_NOTE,
  },
  {
    id: "behavior-abc",
    name: "ABC behavior observation sheet",
    domain: "behavior",
    ageRange: "Any",
    scoringMethod: "Antecedent / Behaviour / Consequence rows + frequency.",
    purpose: "Functional analysis of specific behaviours.",
    description:
      "Each row: date / time, setting, antecedent, behaviour (observable), consequence, perceived function (escape / attention / sensory / tangible). Add intensity 0–10.",
    licensingNote: LICENSING_NOTE,
  },
  {
    id: "developmental-interview",
    name: "Developmental interview checklist",
    domain: "developmental",
    ageRange: "Any (early childhood focus)",
    scoringMethod: "Structured caregiver interview; free-text per area.",
    purpose: "Gather developmental history during intake.",
    description:
      "Areas: pregnancy and birth, early milestones (motor, language, social), feeding and sleep, sensory history, medical history, early educational setting, family history, current concerns.",
    licensingNote: LICENSING_NOTE,
  },
  {
    id: "clinical-observation-grid",
    name: "Clinical observation grid",
    domain: "developmental",
    ageRange: "Any",
    scoringMethod: "Free-text per axis + 0–4 engagement rating.",
    purpose: "Session-by-session global observation.",
    description:
      "Axes: arrival, transitions, engagement with materials, engagement with clinician, language sample, regulation events, exits / departures, parent handover notes.",
    licensingNote: LICENSING_NOTE,
  },
];

export function findTestShell(id: string): TestShell | undefined {
  return INTERNSHIP_TEST_SHELLS.find((s) => s.id === id);
}

export function testShellsByDomain(domain: import("./types").TestDomain): TestShell[] {
  return INTERNSHIP_TEST_SHELLS.filter((s) => s.domain === domain);
}
