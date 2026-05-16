// Psychoeducation Generator — soft, evidence-informed handouts that can
// be printed or rendered into reports. Each handout has:
//  - topic
//  - reading-difficulty variants (general / adolescent / parent / academic)
//  - linked workbook + intervention ids
//  - clinician note placeholder
//
// No copyrighted text. Each handout is written in the app's own voice.

export type HandoutStyle = "clinician" | "adolescent" | "parent" | "academic";

export interface HandoutVariant {
  style: HandoutStyle;
  intro: string;
  whatItIs: string;
  whatItFeelsLike: string;
  whatHelps: string;
  whenToSeekSupport: string;
  closing?: string;
}

export interface PsychoeducationTopic {
  id: string;
  title: string;
  category:
    | "anxiety"
    | "depression"
    | "dissociation"
    | "dpdr"
    | "regulation"
    | "stress"
    | "grounding"
    | "sleep"
    | "burnout"
    | "cognitive-distortions"
    | "behavioral-activation";
  tags: string[];
  variants: Record<HandoutStyle, HandoutVariant>;
  linkedWorkbookIds: string[];
  linkedInterventionIds: string[];
}

function v(
  style: HandoutStyle,
  base: Omit<HandoutVariant, "style">
): HandoutVariant {
  return { style, ...base };
}

export const PSYCHOEDUCATION_TOPICS: PsychoeducationTopic[] = [
  {
    id: "pe-anxiety",
    title: "Understanding anxiety",
    category: "anxiety",
    tags: ["anxiety", "core"],
    linkedWorkbookIds: ["wb-anxiety-grounding"],
    linkedInterventionIds: ["psychoed-anxiety", "mindful-breath", "cbt-thought-record"],
    variants: {
      clinician: v("clinician", {
        intro:
          "Anxiety is a survival response — the body's protective alarm. When the alarm fires in the absence of a true threat, or stays on after a threat has passed, it begins to interfere with everyday functioning.",
        whatItIs:
          "Anxiety is a state of heightened physiological arousal, anticipatory cognition, and behavioural avoidance.",
        whatItFeelsLike:
          "Racing thoughts, muscle tension, breath constriction, restlessness, difficulty concentrating, sleep disruption, and avoidance of feared situations.",
        whatHelps:
          "Psychoeducation, paced breathing, cognitive reappraisal, graded exposure, lifestyle anchors (sleep, exercise, reducing caffeine), and — when indicated — pharmacological support.",
        whenToSeekSupport:
          "When anxiety interferes with daily life, relationships, work/school, or when avoidance narrows your world.",
      }),
      adolescent: v("adolescent", {
        intro:
          "Anxiety isn't weakness. It's your body's smoke alarm — sometimes too sensitive.",
        whatItIs: "It's your brain doing 'what if' on repeat, with the body following.",
        whatItFeelsLike:
          "Heart racing, head spinning, breath shallow, wanting to escape, brain stuck on the worst case.",
        whatHelps:
          "Slow exhales, naming the thought, taking the smallest step instead of avoiding, talking to one safe person.",
        whenToSeekSupport:
          "When it's getting in the way of school, friendships, sleep, or doing things you used to enjoy.",
      }),
      parent: v("parent", {
        intro:
          "Anxiety in your child is real. Your role is not to fix it — it's to be the steady presence that helps them learn to ride it out.",
        whatItIs:
          "An over-active threat response — often inherited, often increased by stress, hugely modifiable with the right support.",
        whatItFeelsLike:
          "Avoidance, irritability, somatic complaints (stomach aches), reassurance-seeking, sleep difficulty.",
        whatHelps:
          "Predictable routines, validating the feeling without solving it for them, small approach steps, modelling your own regulation, working with a clinician.",
        whenToSeekSupport:
          "When school refusal, social withdrawal, or significant distress persists for more than a few weeks.",
      }),
      academic: v("academic", {
        intro:
          "Anxiety disorders are a heterogeneous group of conditions characterised by excessive fear, anxious cognition, and avoidance, conferring substantial functional impairment.",
        whatItIs:
          "Pathophysiologically, anxiety involves amygdala hyperreactivity, prefrontal cortex hypoactivation in regulatory contexts, and HPA-axis dysregulation.",
        whatItFeelsLike:
          "Phenomenologically: anticipatory worry, attentional bias toward threat, physiological hyperarousal, and behavioural avoidance.",
        whatHelps:
          "Evidence-based interventions include CBT, exposure therapy, mindfulness-based approaches, and — where indicated — pharmacotherapy (SSRIs / SNRIs).",
        whenToSeekSupport:
          "Clinical thresholds (e.g., GAD-7 ≥ 10) and functional impairment are key indicators.",
      }),
    },
  },
  {
    id: "pe-depression",
    title: "Understanding depression",
    category: "depression",
    tags: ["depression", "core"],
    linkedWorkbookIds: ["wb-burnout"],
    linkedInterventionIds: ["behavioral-activation", "cbt-thought-record"],
    variants: {
      clinician: v("clinician", {
        intro:
          "Depression is more than sadness. It is a sustained shift in mood, energy, and motivation that quietly narrows what a person can do.",
        whatItIs:
          "A mood disorder characterised by persistent low mood and/or anhedonia, with cognitive, somatic, and behavioural changes.",
        whatItFeelsLike:
          "Loss of interest, fatigue, sleep and appetite changes, cognitive heaviness, hopelessness, and self-critical thinking.",
        whatHelps:
          "Behavioural activation, cognitive interventions, social re-engagement, lifestyle anchors, and — where indicated — pharmacological support.",
        whenToSeekSupport:
          "When low mood persists for two weeks or more and interferes with daily functioning, or whenever suicidal thoughts are present.",
      }),
      adolescent: v("adolescent", {
        intro:
          "Depression isn't being lazy. It's your brain running out of fuel for things that used to feel okay.",
        whatItIs:
          "A real condition that changes how you think, feel, and move through the day.",
        whatItFeelsLike:
          "Tired all the time, hard to enjoy things, eating or sleeping more or less, feeling far from people, feeling like a burden.",
        whatHelps:
          "Doing one small thing today (yes, smaller than you think), some daylight, one trusted person, talking to a professional.",
        whenToSeekSupport:
          "When you keep waking up feeling the same way for weeks, or when scary thoughts come — that's when you tell someone.",
      }),
      parent: v("parent", {
        intro:
          "Depression in young people can look like irritability, withdrawal, or 'attitude' — not always tears.",
        whatItIs:
          "A treatable condition that often involves sleep, appetite, mood, and motivation changes.",
        whatItFeelsLike:
          "Withdrawal from previously enjoyed activities, sleep disruption, irritability, hopelessness, sometimes self-harm urges.",
        whatHelps:
          "Patience, gentle structure, validating without minimising, professional support, and removing means of self-harm when concerns exist.",
        whenToSeekSupport:
          "Sustained changes lasting more than two weeks, expressions of hopelessness, or any mention of self-harm or suicide.",
      }),
      academic: v("academic", {
        intro:
          "Major depressive disorder is a leading contributor to global disability, with a lifetime prevalence of ~15–20%.",
        whatItIs:
          "DSM-5-TR criteria require ≥5 symptoms (including depressed mood or anhedonia) over a 2-week period, with functional impairment.",
        whatItFeelsLike:
          "Anhedonia, cognitive slowing, somatic vegetative symptoms, ruminative cognitive processes.",
        whatHelps:
          "Evidence base supports behavioural activation, CBT, interpersonal therapy, and SSRI/SNRI pharmacotherapy.",
        whenToSeekSupport:
          "PHQ-9 ≥ 10 indicates clinically significant depression warranting structured intervention.",
      }),
    },
  },
  {
    id: "pe-dpdr",
    title: "Understanding depersonalization and derealization",
    category: "dpdr",
    tags: ["dpdr", "dissociation"],
    linkedWorkbookIds: ["wb-dpdr"],
    linkedInterventionIds: ["grounding-54321", "dpdr-grounding"],
    variants: {
      clinician: v("clinician", {
        intro:
          "Depersonalization and derealization are protective dissociative experiences — the mind creating distance from overwhelm.",
        whatItIs:
          "Persistent or recurrent experiences of feeling detached from one's self (depersonalization) or surroundings (derealization), with intact reality testing.",
        whatItFeelsLike:
          "Feeling outside the body, life feeling dreamlike, perceiving the world through glass, emotional numbing, time distortion.",
        whatHelps:
          "Stabilization and grounding, gradual reintroduction of sensory engagement, addressing co-occurring anxiety/depression, trauma-informed pacing.",
        whenToSeekSupport:
          "When experiences are distressing, persistent, or interfere with functioning.",
      }),
      adolescent: v("adolescent", {
        intro:
          "If you've felt like you're watching yourself from outside, or like the world isn't quite real — you're not alone, and you're not broken.",
        whatItIs:
          "It's a protective response. Your nervous system created distance from something that felt like too much.",
        whatItFeelsLike: "Floaty, blurry, far from yourself, sounds muffled, time strange.",
        whatHelps:
          "Sensory anchors: cold water, texture, naming what you see, slowly returning to your body — not forcing it.",
        whenToSeekSupport:
          "When this feeling keeps coming back and gets in the way of school, friends, or sleep.",
      }),
      parent: v("parent", {
        intro:
          "Depersonalization isn't psychosis. It's a dissociative experience — your young person's nervous system protecting them from overwhelm.",
        whatItIs:
          "A common, often-temporary experience of detachment from self or surroundings. Reality testing is intact.",
        whatItFeelsLike:
          "Vague, hard-to-describe — they may say things like 'I don't feel real' or 'everything looks strange'.",
        whatHelps:
          "Gentle grounding (without panic), sensory anchors, professional support, and reducing pressure to perform while they stabilize.",
        whenToSeekSupport:
          "If episodes are frequent, distressing, or interfering with day-to-day life.",
      }),
      academic: v("academic", {
        intro:
          "DPDR is a dissociative disorder under DSM-5-TR (300.6) and ICD-11 (6B66), often underdiagnosed.",
        whatItIs:
          "Persistent or recurrent depersonalization/derealization experiences with intact reality testing and significant distress.",
        whatItFeelsLike:
          "Phenomenology includes embodiment alterations, anomalous self-experience, and altered perception of surroundings.",
        whatHelps:
          "Limited but emerging evidence supports cognitive-behavioural approaches, grounding strategies, and addressing comorbid anxiety/depression. SSRIs may help in selected cases.",
        whenToSeekSupport:
          "Clinically significant DPDR with CDS or DES-II elevations warrants structured intervention and longitudinal monitoring.",
      }),
    },
  },
];

export function getHandout(
  id: string,
  style: HandoutStyle = "clinician"
): HandoutVariant | null {
  const t = PSYCHOEDUCATION_TOPICS.find((x) => x.id === id);
  if (!t) return null;
  return t.variants[style];
}

export function findTopic(id: string): PsychoeducationTopic | undefined {
  return PSYCHOEDUCATION_TOPICS.find((t) => t.id === id);
}

export function searchTopics(query: string): PsychoeducationTopic[] {
  const q = query.trim().toLowerCase();
  if (!q) return PSYCHOEDUCATION_TOPICS;
  return PSYCHOEDUCATION_TOPICS.filter((t) => {
    const hay = [t.title, t.category, ...t.tags].join(" ").toLowerCase();
    return hay.includes(q);
  });
}
