// DSM-5-TR + ICD-11 Reference System.
//
// IMPORTANT: this module contains NO copyrighted DSM/ICD criterion text.
// Only descriptive structure: disorder names, placeholder code fields,
// associated features (drafted by clinicians from public-domain sources),
// differential considerations, and links to assessments / interventions
// in this app. The clinician supplies authoritative criterion text from
// their licensed reference; this module is a navigation + linkage layer.

export interface DisorderReference {
  id: string;
  name: string;
  dsmCode?: string; // placeholder — clinician fills from their reference
  icdCode?: string; // placeholder
  shortSummary: string; // general lay-friendly description (clinician edits)
  category: string;
  associatedFeatures: string[];
  differentialConsiderations: string[];
  culturalConsiderations: string[];
  specifiers: string[]; // placeholders
  linkedAssessmentIds: string[];
  linkedInterventionIds: string[];
  linkedTerminologyIds: string[];
  // Suggested workbook ids for psychoeducation/intervention.
  linkedWorkbookIds: string[];
  tags: string[];
}

export const DISORDER_REFERENCE: DisorderReference[] = [
  {
    id: "mdd",
    name: "Major Depressive Disorder",
    dsmCode: "DSM-5-TR: see official text",
    icdCode: "ICD-11: 6A70",
    shortSummary:
      "Persistent low mood and/or anhedonia for at least two weeks, with accompanying somatic, cognitive, and motivational symptoms causing significant impairment.",
    category: "Depressive disorders",
    associatedFeatures: [
      "Anhedonia",
      "Cognitive distortions",
      "Sleep disturbance",
      "Appetite change",
      "Psychomotor change",
      "Hopelessness / suicidal ideation",
    ],
    differentialConsiderations: [
      "Persistent depressive disorder",
      "Bipolar depression",
      "Adjustment disorder",
      "Bereavement",
      "Substance-induced mood disorder",
      "Medical aetiology (thyroid, anaemia, etc.)",
    ],
    culturalConsiderations: [
      "Cultural variation in somatic presentation",
      "Stigma may shape help-seeking",
    ],
    specifiers: [
      "with anxious distress",
      "with melancholic features",
      "with atypical features",
      "with peripartum onset",
      "seasonal pattern",
    ],
    linkedAssessmentIds: ["phq9", "bdi2"],
    linkedInterventionIds: ["behavioral-activation", "cbt-thought-record"],
    linkedTerminologyIds: ["t02"],
    linkedWorkbookIds: ["wb-burnout"],
    tags: ["depression", "mood"],
  },
  {
    id: "gad",
    name: "Generalized Anxiety Disorder",
    dsmCode: "DSM-5-TR: see official text",
    icdCode: "ICD-11: 6B00",
    shortSummary:
      "Excessive, persistent, difficult-to-control worry across multiple domains for at least six months, with somatic anxiety symptoms.",
    category: "Anxiety disorders",
    associatedFeatures: [
      "Excessive worry",
      "Muscle tension",
      "Sleep disturbance",
      "Concentration difficulty",
      "Irritability",
    ],
    differentialConsiderations: [
      "Panic disorder",
      "Social anxiety disorder",
      "OCD",
      "PTSD",
      "Health anxiety",
      "Substance-induced anxiety",
    ],
    culturalConsiderations: [
      "Cultural variation in idioms of distress",
      "Worry content shaped by context (e.g. migration stress)",
    ],
    specifiers: [],
    linkedAssessmentIds: ["gad7", "dass21"],
    linkedInterventionIds: ["cbt-thought-record", "mindful-breath", "psychoed-anxiety"],
    linkedTerminologyIds: ["t01"],
    linkedWorkbookIds: ["wb-anxiety-grounding"],
    tags: ["anxiety"],
  },
  {
    id: "dpdr",
    name: "Depersonalization/Derealization Disorder",
    dsmCode: "DSM-5-TR: see official text",
    icdCode: "ICD-11: 6B66",
    shortSummary:
      "Persistent or recurrent depersonalization (detachment from one's mind/body) and/or derealization (unreality of surroundings), with intact reality testing and significant distress.",
    category: "Dissociative disorders",
    associatedFeatures: [
      "Emotional numbing",
      "Mind-body disconnect",
      "Perceptual alterations",
      "Time distortion",
      "Often comorbid with anxiety / depression",
    ],
    differentialConsiderations: [
      "Other dissociative disorders",
      "Psychotic disorder",
      "Panic disorder",
      "PTSD",
      "Substance/medical aetiology",
    ],
    culturalConsiderations: ["Trance experiences in cultural context"],
    specifiers: [],
    linkedAssessmentIds: ["cds29", "des2"],
    linkedInterventionIds: ["grounding-54321", "dpdr-grounding"],
    linkedTerminologyIds: ["t03", "t04", "t06"],
    linkedWorkbookIds: ["wb-dpdr"],
    tags: ["dissociation", "depersonalization"],
  },
  {
    id: "ptsd",
    name: "Post-Traumatic Stress Disorder",
    dsmCode: "DSM-5-TR: see official text",
    icdCode: "ICD-11: 6B40",
    shortSummary:
      "Exposure to a qualifying traumatic event followed by intrusion symptoms, avoidance, negative alterations in cognition/mood, and arousal/reactivity changes, persisting >1 month.",
    category: "Trauma- and stressor-related disorders",
    associatedFeatures: [
      "Re-experiencing",
      "Avoidance",
      "Hypervigilance",
      "Sleep disturbance",
      "Emotional numbing",
    ],
    differentialConsiderations: [
      "Acute stress disorder",
      "Adjustment disorder",
      "Complex PTSD (ICD-11)",
      "Depressive disorder",
      "Panic disorder",
    ],
    culturalConsiderations: [
      "Cultural variation in trauma narratives and shame",
      "Refugee and persecution-related contexts",
    ],
    specifiers: ["with dissociative symptoms", "with delayed expression"],
    linkedAssessmentIds: ["pcl5", "des2"],
    linkedInterventionIds: ["trauma-stabilization", "grounding-54321"],
    linkedTerminologyIds: ["t10"],
    linkedWorkbookIds: ["wb-dpdr"],
    tags: ["trauma", "ptsd"],
  },
  {
    id: "social-anxiety",
    name: "Social Anxiety Disorder",
    dsmCode: "DSM-5-TR: see official text",
    icdCode: "ICD-11: 6B04",
    shortSummary:
      "Marked fear or anxiety about social situations in which the individual is exposed to scrutiny, leading to avoidance and significant distress or impairment.",
    category: "Anxiety disorders",
    associatedFeatures: [
      "Anticipatory anxiety",
      "Post-event rumination",
      "Performance fears",
      "Avoidance",
    ],
    differentialConsiderations: [
      "Generalized anxiety disorder",
      "Avoidant personality disorder",
      "Body dysmorphic disorder",
      "Autism spectrum disorder (social communication differences)",
    ],
    culturalConsiderations: [
      "Cultural norms around assertiveness",
      "Taijin kyofusho variant",
    ],
    specifiers: ["performance only"],
    linkedAssessmentIds: ["gad7"],
    linkedInterventionIds: ["exposure-graded", "cbt-thought-record"],
    linkedTerminologyIds: [],
    linkedWorkbookIds: [],
    tags: ["anxiety", "social"],
  },
  {
    id: "asd",
    name: "Autism Spectrum Disorder",
    dsmCode: "DSM-5-TR: see official text",
    icdCode: "ICD-11: 6A02",
    shortSummary:
      "Persistent deficits in social communication and interaction with restricted, repetitive patterns of behaviour, interests, or activities — present early in development.",
    category: "Neurodevelopmental disorders",
    associatedFeatures: [
      "Sensory sensitivities",
      "Special interests",
      "Routine reliance",
      "Differences in social reciprocity",
    ],
    differentialConsiderations: [
      "ADHD",
      "Social anxiety disorder",
      "Intellectual developmental disorder",
      "Reactive attachment disorder",
      "Language disorder",
    ],
    culturalConsiderations: [
      "Cultural variation in eye contact norms",
      "Service access disparities",
    ],
    specifiers: [
      "with or without intellectual impairment",
      "with or without language impairment",
      "severity levels 1–3",
    ],
    linkedAssessmentIds: ["aq50", "raads-r"],
    linkedInterventionIds: ["sensory-toolbox", "communication-i-statements"],
    linkedTerminologyIds: [],
    linkedWorkbookIds: ["wb-sensory"],
    tags: ["neurodevelopmental", "autism"],
  },
];

export function findDisorder(id: string): DisorderReference | undefined {
  return DISORDER_REFERENCE.find((d) => d.id === id);
}

export function searchDisorders(query: string): DisorderReference[] {
  const q = query.trim().toLowerCase();
  if (!q) return DISORDER_REFERENCE;
  return DISORDER_REFERENCE.filter((d) => {
    const hay = [
      d.name,
      d.shortSummary,
      d.category,
      ...d.associatedFeatures,
      ...d.tags,
    ]
      .join(" ")
      .toLowerCase();
    return hay.includes(q);
  });
}
