// Evidence-Based Intervention Library — curated catalogue, organised by
// therapeutic modality, with indication / goal / evidence-level tags.
// "Evidence level" labels are placeholders — clinicians edit per their
// own appraisal.

export type ModalityId =
  | "CBT"
  | "ACT"
  | "DBT"
  | "Grounding"
  | "Psychoeducation"
  | "Behavioral Activation"
  | "Exposure"
  | "Emotional Regulation"
  | "Mindfulness"
  | "Communication"
  | "Parent Guidance"
  | "Trauma-Informed Stabilization"
  | "Dissociation Grounding"
  | "Sensory Regulation";

export type EvidenceLevel =
  | "strong"
  | "moderate"
  | "emerging"
  | "clinical-consensus"
  | "placeholder";

export interface LibraryIntervention {
  id: string;
  name: string;
  modality: ModalityId;
  description: string;
  therapeuticGoal: string;
  indications: string[];
  contraindications: string[];
  evidenceLevel: EvidenceLevel;
  evidenceNote?: string;
  linkedSymptoms: string[];
  linkedDisorders: string[];
  linkedWorkbookIds: string[];
  printableHandout?: string;
  tags: string[];
}

export const INTERVENTION_LIBRARY: LibraryIntervention[] = [
  {
    id: "cbt-thought-record",
    name: "Cognitive Thought Record",
    modality: "CBT",
    description:
      "Identify a triggering situation, automatic thoughts, emotions, supporting/contradicting evidence, and develop a balanced alternative.",
    therapeuticGoal:
      "Reduce influence of automatic thoughts; build cognitive flexibility.",
    indications: ["depression", "anxiety", "rumination"],
    contraindications: ["acute psychotic features", "severe dissociation"],
    evidenceLevel: "strong",
    evidenceNote: "Well-established across anxiety and depressive disorders.",
    linkedSymptoms: ["rumination", "anxiety", "low mood"],
    linkedDisorders: ["MDD", "GAD", "social anxiety"],
    linkedWorkbookIds: ["wb-anxiety-grounding"],
    tags: ["cognition", "core"],
  },
  {
    id: "act-defusion",
    name: "Cognitive Defusion",
    modality: "ACT",
    description:
      "Distance from the literal content of thoughts using techniques such as labelling thoughts as thoughts, leaves-on-a-stream visualisation, or repetition until a word loses meaning.",
    therapeuticGoal:
      "Reduce fusion with distressing thoughts; increase psychological flexibility.",
    indications: ["anxiety", "rumination", "self-critical thinking"],
    contraindications: [],
    evidenceLevel: "moderate",
    linkedSymptoms: ["rumination", "self-criticism"],
    linkedDisorders: ["GAD", "MDD"],
    linkedWorkbookIds: [],
    tags: ["acceptance"],
  },
  {
    id: "dbt-tipp",
    name: "DBT TIPP (distress tolerance)",
    modality: "DBT",
    description:
      "Temperature change (cold water on face), Intense exercise (brief), Paced breathing, Paired muscle relaxation — to lower extreme emotional arousal quickly.",
    therapeuticGoal: "Down-regulate acute distress; tolerate strong affect without acting impulsively.",
    indications: ["emotion crisis", "self-harm urge", "panic"],
    contraindications: ["cardiac concerns", "eating-disordered exercise patterns"],
    evidenceLevel: "moderate",
    linkedSymptoms: ["emotional dysregulation", "impulsivity"],
    linkedDisorders: ["BPD", "PTSD"],
    linkedWorkbookIds: [],
    tags: ["distress-tolerance"],
  },
  {
    id: "grounding-54321",
    name: "5-4-3-2-1 Sensory Grounding",
    modality: "Grounding",
    description:
      "Name 5 things you see, 4 you can touch, 3 you can hear, 2 you can smell, 1 you can taste. Anchors awareness to the present.",
    therapeuticGoal:
      "Interrupt dissociation, panic, or intrusive trauma cues by recruiting sensory awareness.",
    indications: ["dissociation", "panic", "depersonalization", "flashback"],
    contraindications: [],
    evidenceLevel: "clinical-consensus",
    linkedSymptoms: ["dissociation", "depersonalization", "anxiety"],
    linkedDisorders: ["DPDR", "PTSD", "panic disorder"],
    linkedWorkbookIds: ["wb-dpdr"],
    tags: ["sensory", "grounding"],
  },
  {
    id: "behavioral-activation",
    name: "Behavioral Activation",
    modality: "Behavioral Activation",
    description:
      "Plan brief value-aligned activities; track mood before/after to disrupt depressive withdrawal.",
    therapeuticGoal: "Re-engage with reinforcing activities; reduce depressive avoidance.",
    indications: ["depression", "anhedonia", "withdrawal"],
    contraindications: [],
    evidenceLevel: "strong",
    linkedSymptoms: ["low mood", "withdrawal", "anhedonia"],
    linkedDisorders: ["MDD", "dysthymia"],
    linkedWorkbookIds: ["wb-burnout"],
    tags: ["behavioral", "core"],
  },
  {
    id: "exposure-graded",
    name: "Graded Exposure",
    modality: "Exposure",
    description:
      "Construct a hierarchy of feared stimuli; engage from least to most distressing, allowing habituation without safety behaviours.",
    therapeuticGoal: "Reduce conditioned anxiety responses; rebuild approach behaviour.",
    indications: ["specific phobia", "social anxiety", "agoraphobia", "OCD"],
    contraindications: ["acute trauma without stabilization", "imminent self-harm risk"],
    evidenceLevel: "strong",
    linkedSymptoms: ["avoidance", "anxiety"],
    linkedDisorders: ["specific phobia", "social anxiety", "OCD"],
    linkedWorkbookIds: [],
    tags: ["behavioral"],
  },
  {
    id: "emotion-regulation-check",
    name: "Emotion Identification & Regulation Practice",
    modality: "Emotional Regulation",
    description:
      "Name the emotion, locate it in the body, rate intensity, identify trigger, choose a regulation strategy (expression / comfort / action / space).",
    therapeuticGoal: "Build emotion granularity and reduce reactive dysregulation.",
    indications: ["emotional dysregulation", "labile affect", "alexithymia"],
    contraindications: [],
    evidenceLevel: "moderate",
    linkedSymptoms: ["dysregulation", "irritability"],
    linkedDisorders: ["BPD", "MDD", "GAD"],
    linkedWorkbookIds: ["wb-emotional-reg"],
    tags: ["emotion"],
  },
  {
    id: "mindful-breath",
    name: "Paced Breathing",
    modality: "Mindfulness",
    description:
      "Inhale for 4, exhale for 6 — lengthened exhale recruits parasympathetic activity.",
    therapeuticGoal: "Down-regulate hyperarousal; build interoceptive awareness.",
    indications: ["anxiety", "panic", "stress"],
    contraindications: ["acute respiratory difficulty"],
    evidenceLevel: "moderate",
    linkedSymptoms: ["anxiety", "stress"],
    linkedDisorders: ["GAD", "panic disorder"],
    linkedWorkbookIds: [],
    tags: ["regulation"],
  },
  {
    id: "psychoed-anxiety",
    name: "Psychoeducation — anxiety cycle",
    modality: "Psychoeducation",
    description:
      "Educate on the fear-avoidance cycle: threat appraisal → physiology → avoidance → reinforcement. Normalises symptoms without minimising them.",
    therapeuticGoal: "Demystify anxiety; create rationale for exposure and cognitive work.",
    indications: ["anxiety disorders"],
    contraindications: [],
    evidenceLevel: "clinical-consensus",
    linkedSymptoms: ["anxiety", "avoidance"],
    linkedDisorders: ["GAD", "panic", "social anxiety"],
    linkedWorkbookIds: [],
    tags: ["psychoeducation"],
  },
  {
    id: "dpdr-grounding",
    name: "Sensory anchors for DPDR",
    modality: "Dissociation Grounding",
    description:
      "Temperature contrast, paired physical pressure, naming + describing one object in detail. Builds an anchor library for derealization episodes.",
    therapeuticGoal: "Reduce duration and distress of depersonalization episodes.",
    indications: ["depersonalization", "derealization"],
    contraindications: [],
    evidenceLevel: "emerging",
    linkedSymptoms: ["depersonalization", "derealization", "dissociation"],
    linkedDisorders: ["DPDR"],
    linkedWorkbookIds: ["wb-dpdr"],
    tags: ["grounding", "sensory"],
  },
  {
    id: "communication-i-statements",
    name: "Communication — \"I\" statements",
    modality: "Communication",
    description:
      "Re-script blame-laden communication into feeling + impact + request format.",
    therapeuticGoal: "Increase relational repair; reduce escalation in conflict.",
    indications: ["interpersonal conflict", "anger"],
    contraindications: [],
    evidenceLevel: "clinical-consensus",
    linkedSymptoms: ["irritability", "relationship strain"],
    linkedDisorders: [],
    linkedWorkbookIds: [],
    tags: ["communication"],
  },
  {
    id: "sensory-toolbox",
    name: "Sensory regulation toolbox",
    modality: "Sensory Regulation",
    description:
      "Build an individualised toolbox of preferred sensory inputs (weighted blanket, smell, soft texture, dim light) for use in dysregulated moments.",
    therapeuticGoal: "Reduce sensory load; support nervous system regulation.",
    indications: ["sensory overwhelm", "autism", "stress"],
    contraindications: [],
    evidenceLevel: "emerging",
    linkedSymptoms: ["sensory overload"],
    linkedDisorders: ["ASD", "anxiety"],
    linkedWorkbookIds: ["wb-sensory"],
    tags: ["sensory"],
  },
  {
    id: "trauma-stabilization",
    name: "Trauma-informed stabilization",
    modality: "Trauma-Informed Stabilization",
    description:
      "Phase 1 trauma work: safety, resourcing, window-of-tolerance education, container exercises. Trauma processing follows only once stabilization is established.",
    therapeuticGoal: "Build affect-regulation capacity prior to trauma processing.",
    indications: ["PTSD", "complex trauma"],
    contraindications: ["premature trauma processing"],
    evidenceLevel: "strong",
    linkedSymptoms: ["dissociation", "hyperarousal"],
    linkedDisorders: ["PTSD", "complex PTSD"],
    linkedWorkbookIds: [],
    tags: ["trauma"],
  },
];

export const MODALITY_ORDER: ModalityId[] = [
  "CBT",
  "ACT",
  "DBT",
  "Behavioral Activation",
  "Exposure",
  "Grounding",
  "Mindfulness",
  "Emotional Regulation",
  "Psychoeducation",
  "Trauma-Informed Stabilization",
  "Dissociation Grounding",
  "Sensory Regulation",
  "Communication",
  "Parent Guidance",
];

export function interventionsForModality(
  modality: ModalityId
): LibraryIntervention[] {
  return INTERVENTION_LIBRARY.filter((i) => i.modality === modality);
}

export function interventionsForSymptom(
  symptom: string
): LibraryIntervention[] {
  const q = symptom.toLowerCase();
  return INTERVENTION_LIBRARY.filter((i) =>
    i.linkedSymptoms.some((s) => s.toLowerCase() === q)
  );
}

export function searchInterventions(query: string): LibraryIntervention[] {
  const q = query.trim().toLowerCase();
  if (!q) return INTERVENTION_LIBRARY;
  return INTERVENTION_LIBRARY.filter((i) => {
    const hay = [
      i.name,
      i.description,
      i.therapeuticGoal,
      i.modality,
      ...i.indications,
      ...i.tags,
      ...i.linkedSymptoms,
    ]
      .join(" ")
      .toLowerCase();
    return hay.includes(q);
  });
}
