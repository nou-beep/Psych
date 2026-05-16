// Clinical workspace — types, seed data, and utilities for all new features

import { generateId, nowISO } from "@/lib/store";

// ── Session atmosphere tags ───────────────────────────────────

export const ATMOSPHERE_TAGS = [
  "breakthrough", "emotionally heavy", "guarded", "collaborative",
  "resistant", "disengaged", "dysregulated", "calm",
  "high participation", "low participation", "family concern",
  "supervision needed", "progress noted", "crisis",
] as const;

export type AtmosphereTag = typeof ATMOSPHERE_TAGS[number];

// ── Clinical Reflection ───────────────────────────────────────

export interface ClinicalReflection {
  id: string;
  date: string;
  linkedCaseId: string;
  whatLearned: string;
  whatDifficult: string;
  countertransference: string;
  emotionalImpact: string;
  ethicalQuestions: string;
  supervisionTopics: string;
  skillsToImprove: string;
  nextAction: string;
  tags: string[];
  atmosphereTags: AtmosphereTag[];
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
}

// ── Session Plan ──────────────────────────────────────────────

export interface SessionPlan {
  id: string;
  caseId: string;
  date: string;
  time: string;
  goals: string[];
  questionsToAsk: string[];
  toolsToUse: string[];
  interventionToTry: string[];
  followUpFromLast: string;
  supervisorInstructions: string;
  riskReminders: string;
  materialsNeeded: string[];
  worksheetsToGive: string[];
  atmosphereTags: AtmosphereTag[];
  status: "planned" | "completed" | "cancelled";
  postSessionNotes: string;
  createdAt: string;
}

// ── Intervention ──────────────────────────────────────────────

export interface Intervention {
  id: string;
  name: string;
  category: string;
  caseId: string;
  date: string;
  goalTargeted: string;
  response: string;
  effectiveness: 1 | 2 | 3 | 4 | 5;
  followUpNeeded: boolean;
  atmosphereTags: AtmosphereTag[];
  notes: string;
  createdAt: string;
}

export const INTERVENTION_CATEGORIES = [
  "Psychoeducation", "CBT", "Grounding", "Behavioral Activation",
  "Exposure", "Relaxation", "Emotional Regulation", "Communication",
  "Family Guidance", "Mindfulness", "Narrative", "Schema Work",
  "Somatic", "Custom",
];

// ── Ethics / Consent ──────────────────────────────────────────

export interface ConsentRecord {
  id: string;
  caseId: string;
  consentGiven: boolean;
  consentDate: string;
  anonymizationComplete: boolean;
  dataProtectionChecked: boolean;
  supervisorApproved: boolean;
  informationSheetGiven: boolean;
  withdrawalRightExplained: boolean;
  ethicsApprovalRef: string;
  notes: string;
  createdAt: string;
}

// ── Audio Note ────────────────────────────────────────────────

export interface AudioNote {
  id: string;
  name: string;
  durationSeconds: number;
  transcript: string;
  linkedType: "case" | "session" | "reflection" | "supervision" | "thesis" | "general";
  linkedId: string;
  tags: string[];
  isFavorite: boolean;
  createdAt: string;
}

// ── Clinical Formulation ──────────────────────────────────────

export type FormulationModel = "5ps" | "cbt" | "biopsychosocial" | "custom";

export interface FormulationCanvas {
  id: string;
  caseId: string;
  model: FormulationModel;
  title: string;
  sections: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

export const FORMULATION_MODELS: Record<FormulationModel, { label: string; sections: string[] }> = {
  "5ps": {
    label: "5 Ps Formulation",
    sections: ["Presenting Problem", "Predisposing Factors", "Precipitating Factors", "Perpetuating Factors", "Protective Factors"],
  },
  cbt: {
    label: "CBT Formulation",
    sections: ["Situation / Trigger", "Automatic Thoughts", "Emotions", "Physical Sensations", "Behaviors", "Consequences", "Core Beliefs"],
  },
  biopsychosocial: {
    label: "Biopsychosocial Model",
    sections: ["Biological Factors", "Psychological Factors", "Social Factors", "Cultural & Contextual Factors", "Strengths & Resources"],
  },
  custom: {
    label: "Custom Formulation",
    sections: ["Section 1", "Section 2", "Section 3", "Section 4"],
  },
};

// ── Clinical Terminology ──────────────────────────────────────

export interface ClinicalTerm {
  id: string;
  english: string;
  french: string;
  arabic: string;
  definition: string;
  synonyms: string[];
  relatedConcepts: string[];
  clinicalNoteExample: string;
  reportExample: string;
  reportPhrasing: string;
  tags: string[];
  dsmReference: string;
  isFavorite: boolean;
}

// ── Workbook Sheet ────────────────────────────────────────────

export interface WorkbookSheet {
  id: string;
  title: string;
  category: string;
  format: string;
  language: "en" | "fr" | "ar";
  ageGroup: "child" | "adolescent" | "adult" | "all";
  difficulty: "simple" | "intermediate" | "advanced";
  caseId: string;
  caseCode: string;
  content: WorkbookContent;
  therapistNote: string;
  isFavorite: boolean;
  isPrinted: boolean;
  createdAt: string;
}

export interface WorkbookContent {
  subtitle: string;
  introduction: string;
  instructions: string;
  exerciseBody: string;
  reflections: string[];
  practiceSection: string;
  footerNote: string;
}

export const WORKBOOK_CATEGORIES = [
  "Anxiety", "Depression", "Emotional Regulation", "Grounding",
  "Cognitive Distortions", "Behavioral Activation", "Sleep Hygiene",
  "Stress Management", "DPDR Grounding", "Self-Esteem",
  "Communication", "Mindfulness", "Relapse Prevention", "Custom",
];

export const WORKBOOK_FORMATS = [
  "Psychoeducation Handout", "Exercise Worksheet", "Reflection Worksheet",
  "Tracking Sheet", "Coping Card", "Session Homework", "Parent Guidance Sheet",
];

// ── Workbook template generator ───────────────────────────────

export function generateWorkbookContent(category: string, format: string, ageGroup: string): WorkbookContent {
  const templates: Record<string, WorkbookContent> = {
    Anxiety: {
      subtitle: "Grounding Through Your Senses",
      introduction: "Anxiety can make our mind race and our body tense. This worksheet uses a simple grounding technique — the 5-4-3-2-1 method — to help bring you back to the present moment.",
      instructions: "Find a comfortable, quiet space. Take three slow, deep breaths before beginning. Work through each sense slowly and mindfully.",
      exerciseBody: "5 things you can SEE right now:\n1. ___________________\n2. ___________________\n3. ___________________\n4. ___________________\n5. ___________________\n\n4 things you can TOUCH or feel:\n1. ___________________\n2. ___________________\n3. ___________________\n4. ___________________\n\n3 things you can HEAR:\n1. ___________________\n2. ___________________\n3. ___________________\n\n2 things you can SMELL:\n1. ___________________\n2. ___________________\n\n1 thing you can TASTE:\n1. ___________________",
      reflections: [
        "How did your body feel before the exercise? After?",
        "Which sense was easiest to focus on? Which was hardest?",
        "What would you like to try differently next time?",
      ],
      practiceSection: "Try this exercise once a day this week — even when you are not anxious. The more you practice, the easier it becomes when anxiety peaks.\n\nMy practice log:\nDay 1: _____ / Day 2: _____ / Day 3: _____ / Day 4: _____ / Day 5: _____",
      footerNote: "This worksheet is a clinical support tool. It is not a substitute for professional care.",
    },
    Depression: {
      subtitle: "Small Steps Toward Re-engagement",
      introduction: "When we feel low, activities that once felt meaningful can seem out of reach. Behavioral activation gently encourages us to re-engage with life — one small step at a time.",
      instructions: "Complete this sheet at your own pace. There is no pressure. Focus on small, manageable activities.",
      exerciseBody: "Step 1 — Write 3 activities that used to bring you joy or comfort:\n1. ___________________\n2. ___________________\n3. ___________________\n\nStep 2 — Choose ONE small activity to schedule this week:\nActivity: ___________________\nDay/Time: ___________________\n\nStep 3 — After the activity, note your mood:\nBefore (0–10): ___ After (0–10): ___\nWhat I noticed: ___________________",
      reflections: [
        "Was it easier or harder than expected?",
        "What would help you do it again?",
        "Who could support you with this?",
      ],
      practiceSection: "This week I will try:\n☐ Go for a 10-minute walk\n☐ Call or message someone I care about\n☐ Do one thing I used to enjoy\n☐ Spend time in natural light\n☐ Prepare one nourishing meal",
      footerNote: "Behavioral activation is an evidence-based approach. Discuss your experience with your therapist.",
    },
    "DPDR Grounding": {
      subtitle: "Reconnecting When the World Feels Distant",
      introduction: "Depersonalization and derealization can feel unsettling — as though you are watching yourself from a distance, or as though the world around you isn't quite real. This worksheet offers gentle grounding techniques to help you reconnect.",
      instructions: "You do not need to fight the feeling. Instead, gently guide your attention back to the present using your senses and body.",
      exerciseBody: "Physical grounding — Feel the weight of your body:\n• Press your feet firmly into the floor\n• Hold something with texture (fabric, pen, stone)\n• Touch something cold (glass of water, cool surface)\nWhat do you feel? ___________________\n\nSensory grounding — Engage a strong sense:\n• Smell something familiar (cologne, coffee, soap)\n• Listen to a familiar song\n• Look at one object and name 5 details about it\nWhat did you notice? ___________________\n\nSelf-affirmation:\nRepeat slowly: 'I am here. I am safe. This feeling will pass.'\nHow did this feel? ___________________",
      reflections: [
        "When does the feeling tend to appear? (Triggers?)",
        "Which technique helped the most today?",
        "What would you like to share with your therapist about this experience?",
      ],
      practiceSection: "My grounding kit (things that help reconnect me):\n1. ___________________\n2. ___________________\n3. ___________________\nI will use one of these the next time I notice the feeling.",
      footerNote: "DPDR experiences are recognized and treatable. You are not alone. Discuss your experiences openly with your clinician.",
    },
    "Emotional Regulation": {
      subtitle: "Understanding and Navigating Emotions",
      introduction: "Emotions carry important information. This worksheet helps you observe, name, and respond to your emotions with intention rather than reacting impulsively.",
      instructions: "Complete each section when you notice a strong emotion — or reflect on one from earlier today.",
      exerciseBody: "The emotion I'm noticing: ___________________\nIntensity (0–10): ___\nWhere I feel it in my body: ___________________\n\nWhat happened just before (the trigger):\n___________________\n\nThe thought connected to this emotion:\n'I am thinking that ___________________'\n\nIs this thought based on facts, or on a feeling?\n☐ Mostly facts  ☐ Mostly feeling  ☐ Both\n\nA more balanced thought might be:\n___________________\n\nWhat does this emotion need right now?\n☐ Expression  ☐ Comfort  ☐ Action  ☐ Rest  ☐ Space",
      reflections: [
        "What would you say to a friend feeling this way?",
        "What usually helps you when this emotion is strong?",
        "What would you like to work on with your therapist?",
      ],
      practiceSection: "This week, I will try:\n☐ Name my emotions out loud (even to myself)\n☐ Use opposite action when an emotion feels unhelpful\n☐ Journal one emotion per day\n☐ Try a 3-minute mindful breathing exercise",
      footerNote: "Emotional regulation is a skill — it develops with practice and support.",
    },
    "Sleep Hygiene": {
      subtitle: "Improving Your Sleep Routine",
      introduction: "Sleep quality significantly impacts mood, concentration, and emotional regulation. This worksheet helps you track and improve your sleep habits.",
      instructions: "Complete the daily tracker each morning after waking. Review patterns with your clinician at your next session.",
      exerciseBody: "My current sleep schedule:\nBedtime: ___  Wake time: ___  Hours slept: ___\n\nSleep diary — this week:\nMon: Bedtime ___ / Wake ___ / Quality (1–5) ___\nTue: Bedtime ___ / Wake ___ / Quality (1–5) ___\nWed: Bedtime ___ / Wake ___ / Quality (1–5) ___\nThu: Bedtime ___ / Wake ___ / Quality (1–5) ___\nFri: Bedtime ___ / Wake ___ / Quality (1–5) ___\n\nThings that disrupted my sleep this week:\n___________________",
      reflections: [
        "What time did you feel sleepiest this week?",
        "What helped you fall asleep most easily?",
        "What habits might be interfering with your sleep?",
      ],
      practiceSection: "My sleep hygiene goals:\n☐ No screens 30 minutes before bed\n☐ Keep the same sleep/wake schedule\n☐ Avoid caffeine after ___ pm\n☐ Wind-down ritual: ___________________",
      footerNote: "Sleep difficulties are common and manageable. Discuss your patterns with your clinician.",
    },
    "Cognitive Distortions": {
      subtitle: "Identifying Unhelpful Thinking Patterns",
      introduction: "Our thoughts strongly influence how we feel. Sometimes our minds fall into patterns called cognitive distortions — these are automatic thoughts that may not fully reflect reality.",
      instructions: "Choose one situation from this week. Work through the thought record below.",
      exerciseBody: "Situation: ___________________\n\nAutomatic thought: ___________________\n\nEmotion felt: ___________________  Intensity: ___/10\n\nWhich pattern might this be?\n☐ All-or-nothing thinking ('Everything is wrong')\n☐ Catastrophizing ('The worst will happen')\n☐ Mind reading ('They must think badly of me')\n☐ Overgeneralizing ('This always happens')\n☐ Filtering (focusing only on the negative)\n☐ Emotional reasoning ('I feel it, so it must be true')\n\nEvidence FOR the thought: ___________________\nEvidence AGAINST the thought: ___________________\n\nA more balanced perspective: ___________________\nNew emotion intensity: ___/10",
      reflections: [
        "Which distortion do you notice most in yourself?",
        "What would change if you believed the balanced thought?",
      ],
      practiceSection: "This week I will notice one automatic thought per day and ask: Is there evidence for and against this thought?",
      footerNote: "Thought records are a core CBT technique. Practice with your therapist's guidance.",
    },
    "Weekly Mood Tracker": {
      subtitle: "Tracking Your Emotional Patterns",
      introduction: "Mood tracking helps you and your clinician identify patterns, triggers, and progress over time.",
      instructions: "Rate your overall mood each day (0 = very low, 10 = very well). Add one word or brief note.",
      exerciseBody: "WEEK OF: ___________________\n\nMonday:    Mood _/10  | Note: ___________________\nTuesday:   Mood _/10  | Note: ___________________\nWednesday: Mood _/10  | Note: ___________________\nThursday:  Mood _/10  | Note: ___________________\nFriday:    Mood _/10  | Note: ___________________\nSaturday:  Mood _/10  | Note: ___________________\nSunday:    Mood _/10  | Note: ___________________\n\nWeekly average: ___/10\nLowest day: ___  Highest day: ___\nMain trigger(s) this week: ___________________",
      reflections: [
        "What patterns do you notice?",
        "What helped when your mood was low?",
        "What would you like to discuss at your next session?",
      ],
      practiceSection: "Next week's intention: ___________________",
      footerNote: "Bring this tracker to your next appointment.",
    },
  };

  return templates[category] ?? {
    subtitle: "",
    introduction: "This worksheet has been prepared for you by your clinician. Complete it at your own pace.",
    instructions: "Work through each section thoughtfully. There are no right or wrong answers.",
    exerciseBody: "Write your responses below:\n\n___________________\n\n___________________\n\n___________________",
    reflections: ["What came up for you while completing this?", "What would you like to share with your clinician?"],
    practiceSection: "This week I will: ___________________",
    footerNote: "Prepared by your clinician. Not for distribution.",
  };
}

// ── Terminology seed data ─────────────────────────────────────

export const seedTerminology: ClinicalTerm[] = [
  {
    id: "t01", english: "Anxiety", french: "Anxiété", arabic: "قلق",
    definition: "A state of apprehension, uncertainty, and fear resulting from the anticipation of a realistic or imagined threatening event or situation.",
    synonyms: ["worry", "apprehension", "nervousness", "tension"],
    relatedConcepts: ["panic", "avoidance", "rumination", "hyperarousal"],
    clinicalNoteExample: "The client presented with marked anxiety, reporting difficulty concentrating and persistent worry about several life domains.",
    reportExample: "Assessment results indicated clinically significant anxiety symptoms consistent with a generalized anxiety presentation.",
    reportPhrasing: "The client presented with observable anxiety symptomatology, including…",
    tags: ["mood", "anxiety", "core"],
    dsmReference: "DSM-5: 300.02 Generalized Anxiety Disorder",
    isFavorite: false,
  },
  {
    id: "t02", english: "Depression", french: "Dépression", arabic: "اكتئاب",
    definition: "A mood disorder characterized by persistent feelings of sadness, hopelessness, loss of interest, and reduced energy, affecting daily functioning.",
    synonyms: ["low mood", "depressive episode", "major depression"],
    relatedConcepts: ["anhedonia", "rumination", "withdrawal", "fatigue"],
    clinicalNoteExample: "The client described persistent low mood, loss of interest in activities, and significant fatigue over the past two weeks.",
    reportExample: "PHQ-9 scores indicated moderately severe depressive symptomatology (score = 18).",
    reportPhrasing: "The client's presentation was consistent with depressive symptomatology, characterized by…",
    tags: ["mood", "depression", "core"],
    dsmReference: "DSM-5: 296.2x Major Depressive Disorder",
    isFavorite: false,
  },
  {
    id: "t03", english: "Depersonalization", french: "Dépersonnalisation", arabic: "تبدد الشخصية",
    definition: "An experience of unreality, detachment, or being an outside observer with respect to one's thoughts, feelings, sensations, body, or actions.",
    synonyms: ["self-alienation", "ego-dystonic detachment"],
    relatedConcepts: ["derealization", "dissociation", "trauma", "anxiety"],
    clinicalNoteExample: "The client reported episodes of feeling detached from their body, as if observing themselves from outside.",
    reportExample: "DPDR-16 scores suggested clinically significant depersonalization experiences (score = 24).",
    reportPhrasing: "The client endorsed recurrent experiences of depersonalization, including…",
    tags: ["dpdr", "dissociation", "core"],
    dsmReference: "DSM-5: 300.6 Depersonalization/Derealization Disorder",
    isFavorite: false,
  },
  {
    id: "t04", english: "Derealization", french: "Déréalisation", arabic: "تبدد الواقع",
    definition: "Experiences of unreality or detachment from one's surroundings — people and objects appear as if unreal, distant, artificial, or visually distorted.",
    synonyms: ["environmental unreality", "reality detachment"],
    relatedConcepts: ["depersonalization", "dissociation", "anxiety", "trauma"],
    clinicalNoteExample: "The client described periods during which the environment appeared dreamlike or visually distorted.",
    reportExample: "Derealization symptoms were present and co-occurring with depersonalization experiences.",
    reportPhrasing: "The client reported derealization episodes characterized by…",
    tags: ["dpdr", "dissociation", "core"],
    dsmReference: "DSM-5: 300.6 Depersonalization/Derealization Disorder",
    isFavorite: false,
  },
  {
    id: "t05", english: "Emotional Regulation", french: "Régulation émotionnelle", arabic: "تنظيم عاطفي",
    definition: "The processes by which individuals influence which emotions they have, when they have them, and how they experience and express these emotions.",
    synonyms: ["affect regulation", "emotion management"],
    relatedConcepts: ["distress tolerance", "mindfulness", "coping", "impulsivity"],
    clinicalNoteExample: "The client demonstrated difficulties with emotional regulation, often experiencing rapid escalation from calm to distress.",
    reportExample: "Clinical observation and self-report indicated significant challenges with emotional regulation.",
    reportPhrasing: "The client presented with difficulties in emotional regulation, including…",
    tags: ["emotion", "regulation", "core"],
    dsmReference: "Related: DBT-informed care, Emotion-focused therapy",
    isFavorite: false,
  },
  {
    id: "t06", english: "Dissociation", french: "Dissociation", arabic: "تفارق",
    definition: "A mental process involving a disconnection between thoughts, feelings, surroundings, and behavior, often as a response to overwhelm or trauma.",
    synonyms: ["psychological detachment", "splitting"],
    relatedConcepts: ["depersonalization", "derealization", "trauma", "PTSD"],
    clinicalNoteExample: "The client reported dissociative episodes during which they had difficulty recalling events or felt disconnected from their surroundings.",
    reportExample: "Dissociative symptomatology was noted across multiple assessment domains.",
    reportPhrasing: "Dissociative experiences were reported, including…",
    tags: ["dissociation", "trauma", "core"],
    dsmReference: "DSM-5: Chapter on Dissociative Disorders",
    isFavorite: false,
  },
  {
    id: "t07", english: "Avoidance", french: "Évitement", arabic: "تجنب",
    definition: "A behavioral or cognitive strategy in which a person withdraws from situations, thoughts, or emotions perceived as threatening or distressing.",
    synonyms: ["escape", "experiential avoidance", "behavioral avoidance"],
    relatedConcepts: ["anxiety", "phobia", "safety behaviors", "reinforcement"],
    clinicalNoteExample: "The client endorsed marked avoidance of social situations, which appeared to reinforce anxious cognitions.",
    reportExample: "Pervasive avoidance behaviors were identified, consistent with an anxiety-related presentation.",
    reportPhrasing: "The client demonstrated avoidance of…",
    tags: ["behavior", "anxiety", "cbt"],
    dsmReference: "Key concept across anxiety disorders",
    isFavorite: false,
  },
  {
    id: "t08", english: "Rumination", french: "Rumination", arabic: "اجترار",
    definition: "Repetitive, passive focus on distressing feelings and their possible causes and consequences, rather than engaging in active problem-solving.",
    synonyms: ["perseverative thinking", "repetitive negative thinking"],
    relatedConcepts: ["depression", "anxiety", "worry", "cognitive fusion"],
    clinicalNoteExample: "The client reported difficulty disengaging from recurring thoughts about past events, which persisted throughout the day.",
    reportExample: "Ruminative thinking patterns were identified as a key maintaining factor in the client's depressive presentation.",
    reportPhrasing: "The client presented with ruminative thought patterns, notably…",
    tags: ["cognition", "depression", "core"],
    dsmReference: "Key feature in depressive and anxiety disorders",
    isFavorite: false,
  },
  {
    id: "t09", english: "Attachment", french: "Attachement", arabic: "تعلق",
    definition: "A deep and enduring emotional bond connecting one person to another across time and space, foundational to emotional development and relational functioning.",
    synonyms: ["bonding", "relational security"],
    relatedConcepts: ["secure base", "internal working model", "early experience", "relationships"],
    clinicalNoteExample: "The client showed patterns consistent with anxious attachment, including fear of abandonment and hypervigilance in relationships.",
    reportExample: "Attachment history was explored and appeared relevant to current relational difficulties.",
    reportPhrasing: "Attachment-related themes were identified, including…",
    tags: ["attachment", "development", "relationship"],
    dsmReference: "Related: Reactive Attachment Disorder (DSM-5: 313.89)",
    isFavorite: false,
  },
  {
    id: "t10", english: "Trauma", french: "Traumatisme", arabic: "صدمة",
    definition: "An emotional response to a deeply distressing or disturbing event that overwhelms one's ability to cope, producing lasting adverse effects on functioning.",
    synonyms: ["psychological trauma", "adverse experience", "traumatic event"],
    relatedConcepts: ["PTSD", "complex trauma", "dissociation", "hypervigilance", "avoidance"],
    clinicalNoteExample: "The client disclosed a history of childhood trauma, which appeared to inform current symptoms of hypervigilance and emotional dysregulation.",
    reportExample: "Trauma history was documented and considered in the clinical formulation.",
    reportPhrasing: "A trauma-informed approach was adopted given the client's reported history of…",
    tags: ["trauma", "ptsd", "core"],
    dsmReference: "DSM-5: 309.81 Post-Traumatic Stress Disorder",
    isFavorite: false,
  },
  {
    id: "t11", english: "Grounding", french: "Ancrage", arabic: "تأريض نفسي",
    definition: "A set of present-focused techniques (sensory, cognitive, or physical) used to help a person reconnect with the here-and-now during distress, dissociation, or flashbacks.",
    synonyms: ["present-moment awareness", "anchoring"],
    relatedConcepts: ["dissociation", "trauma", "anxiety", "mindfulness", "depersonalization"],
    clinicalNoteExample: "The client was introduced to a 5-4-3-2-1 grounding technique and reported reduced distress within two minutes.",
    reportExample: "Sensory grounding strategies were practiced in-session and assigned for home use.",
    reportPhrasing: "Grounding techniques were introduced as part of the intervention plan, including…",
    tags: ["intervention", "trauma", "core"],
    dsmReference: "Common technique across trauma, anxiety, and dissociative presentations",
    isFavorite: false,
  },
];

// ── Seed Reflections ──────────────────────────────────────────

export const seedReflections: ClinicalReflection[] = [
  {
    id: "r01",
    date: "2026-05-10",
    linkedCaseId: "case-001",
    whatLearned: "Allowing silence can be more therapeutic than filling space with questions. Today I waited and the client opened something they hadn't shared before.",
    whatDifficult: "Managing my own discomfort when the client discussed themes of hopelessness. I noticed the urge to reassure too quickly.",
    countertransference: "I felt a pull to rescue — possibly connected to my own difficulty tolerating helplessness in others.",
    emotionalImpact: "Moderately heavy session. I felt moved and needed 10 minutes of decompression afterwards.",
    ethicalQuestions: "The client mentioned a third party in a way that raised questions about confidentiality boundaries.",
    supervisionTopics: "Countertransference around rescue impulse. Silence as intervention technique.",
    skillsToImprove: "Tolerating uncertainty and not rushing toward resolution.",
    nextAction: "Discuss in supervision. Review attachment and trauma readings.",
    tags: ["countertransference", "silence", "attachment"],
    atmosphereTags: ["emotionally heavy", "breakthrough"],
    isPrivate: false,
    createdAt: "2026-05-10T18:00:00Z",
    updatedAt: "2026-05-10T18:00:00Z",
  },
];

// ── Seed Session Plans ────────────────────────────────────────

export const seedPlans: SessionPlan[] = [
  {
    id: "sp01",
    caseId: "case-001",
    date: "2026-05-16",
    time: "10:00",
    goals: ["Explore avoidance patterns", "Introduce thought record"],
    questionsToAsk: ["What situations did you avoid this week?", "What did you notice in your body before avoiding?"],
    toolsToUse: ["Thought record worksheet", "Body scan"],
    interventionToTry: ["Cognitive restructuring", "Psychoeducation on avoidance cycle"],
    followUpFromLast: "Client identified three situations where anxiety peaked. Agreed to track triggers.",
    supervisorInstructions: "Supervisor suggested slowing down and staying with the emotion rather than moving to techniques too quickly.",
    riskReminders: "No acute risk flagged. Monitor hopelessness statements.",
    materialsNeeded: ["Thought record form", "Anxiety psychoeducation handout"],
    worksheetsToGive: ["Anxiety Grounding Worksheet", "Cognitive Distortions Worksheet"],
    atmosphereTags: [],
    status: "planned",
    postSessionNotes: "",
    createdAt: "2026-05-14T09:00:00Z",
  },
];

// ── Seed Interventions ────────────────────────────────────────

export const seedInterventions: Intervention[] = [
  {
    id: "i01",
    name: "5-4-3-2-1 Grounding",
    category: "Grounding",
    caseId: "case-001",
    date: "2026-05-08",
    goalTargeted: "Reduce dissociative episodes",
    response: "Client engaged well, reported feeling 'more present' after the exercise.",
    effectiveness: 4,
    followUpNeeded: true,
    atmosphereTags: ["collaborative", "progress noted"],
    notes: "Client to practice daily. Review log next session.",
    createdAt: "2026-05-08T11:00:00Z",
  },
  {
    id: "i02",
    name: "Behavioral Activation — Pleasant Activity Schedule",
    category: "Behavioral Activation",
    caseId: "case-001",
    date: "2026-05-02",
    goalTargeted: "Improve mood and re-engagement with daily activities",
    response: "Client initially resistant but agreed to start with one activity per day.",
    effectiveness: 3,
    followUpNeeded: true,
    atmosphereTags: ["guarded", "progress noted"],
    notes: "Follow up on activity completion. Normalize setbacks.",
    createdAt: "2026-05-02T11:00:00Z",
  },
];

// ── Consent seed records ──────────────────────────────────────

export const seedConsent: ConsentRecord[] = [
  {
    id: "c01",
    caseId: "case-001",
    consentGiven: true,
    consentDate: "2026-01-15",
    anonymizationComplete: true,
    dataProtectionChecked: true,
    supervisorApproved: true,
    informationSheetGiven: true,
    withdrawalRightExplained: true,
    ethicsApprovalRef: "ETH-2026-017",
    notes: "Consent renewed at session 5 following role change.",
    createdAt: "2026-01-15T09:00:00Z",
  },
  {
    id: "c02",
    caseId: "case-002",
    consentGiven: true,
    consentDate: "2026-02-03",
    anonymizationComplete: true,
    dataProtectionChecked: false,
    supervisorApproved: false,
    informationSheetGiven: true,
    withdrawalRightExplained: true,
    ethicsApprovalRef: "",
    notes: "Data protection checklist pending. Supervisor approval pending.",
    createdAt: "2026-02-03T09:00:00Z",
  },
];

// ── Store keys ────────────────────────────────────────────────

export const CLINICAL_STORE_KEYS = {
  REFLECTIONS: "clinical_reflections",
  PLANS: "clinical_plans",
  INTERVENTIONS: "clinical_interventions",
  CONSENT: "clinical_consent",
  AUDIO_NOTES: "clinical_audio_notes",
  FORMULATIONS: "clinical_formulations",
  TERMINOLOGY: "clinical_terminology",
  WORKBOOKS: "clinical_workbooks",
};
