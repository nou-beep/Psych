// =============================================================
// PSYCH MOCK DATA
// All data here is fictional and anonymized. Case codes are used
// instead of real names. This file simulates what a real database
// would provide. To connect to Supabase later, replace the exports
// below with async fetch functions.
// =============================================================

// ── TYPES ────────────────────────────────────────────────────

export type CaseType =
  | "Clinical Case"
  | "Child Follow-Up"
  | "Autism Internship Case"
  | "Adult Case"
  | "Research Participant"
  | "Supervision Case"
  | "Assessment Only";

export type CaseStatus = "Active" | "Paused" | "Archived" | "Needs Review";

export interface PsychCase {
  id: string;
  code: string;
  type: CaseType;
  status: CaseStatus;
  age: string;
  gender: string;
  context: string;
  presentingConcerns: string;
  currentGoals: string[];
  keyObservations: string;
  latestSummary: string;
  lastCheckIn: string;
  nextReportDue: string;
  tags: string[];
  shortNote: string;
  alerts?: string[];
  startDate: string;
  supervisor: string;
  institution: string;
}

export interface DailyCheckIn {
  id: string;
  caseId: string;
  date: string;
  contextType: string;
  moodAffect: string;
  behaviorObservations: string;
  communicationObservations: string;
  cognitiveObservations: string;
  emotionalRegulation: string;
  socialInteraction: string;
  sensoryObservations: string;
  interventionUsed: string;
  responseToIntervention: string;
  freeNotes: string;
  followUpNeeded: boolean;
  followUpNote?: string;
}

export interface WeeklyReview {
  id: string;
  caseId: string;
  weekStart: string;
  weekEnd: string;
  mainProgress: string;
  mainDifficulties: string;
  repeatedPatterns: string;
  effectiveInterventions: string;
  concerns: string;
  goalsNextWeek: string;
  questionsForSupervision: string;
}

export interface MonthlyReview {
  id: string;
  caseId: string;
  month: string;
  overallEvolution: string;
  assessmentChanges: string;
  clinicalObservations: string;
  supervisionPoints: string;
  recommendations: string;
  nextMonthObjectives: string;
}

export interface Assessment {
  id: string;
  title: string;
  description: string;
  caseTypeRelevance: string[];
  lastCompleted: string | null;
  scoreStatus: string;
  scoreValue?: string;
  category: string;
}

export interface SupervisionNote {
  id: string;
  caseId: string;
  date: string;
  supervisorName: string;
  mainTopics: string;
  ethicalConcerns: string;
  clinicalReflection: string;
  feedbackReceived: string;
  actionPlan: string;
  questionsRaised: string;
}

export interface ResearchParticipant {
  id: string;
  code: string;
  studyTitle: string;
  status: string;
  interviewDate: string;
  keyThemes: string[];
  memos: string;
  codingStatus: string;
}

export interface Session {
  id: string;
  caseId: string;
  date: string;
  sessionNumber: number;
  type: string;
  duration: string;
  mainTopics: string;
  observations: string;
  interventions: string;
  nextSteps: string;
}

// ── NEW TYPES ─────────────────────────────────────────────────

export interface Milestone {
  id: string;
  title: string;
  completed: boolean;
}

export interface Goal {
  id: string;
  caseId?: string;
  title: string;
  category: "therapeutic" | "behavioral" | "research" | "observation" | "intervention";
  description: string;
  status: "not-started" | "in-progress" | "achieved" | "paused";
  priority: "low" | "medium" | "high";
  progress: number;
  milestones: Milestone[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
  isArchived: boolean;
}

export interface TranscriptAnnotation {
  id: string;
  selectedText: string;
  note: string;
  color: "pink" | "yellow" | "green" | "blue" | "purple";
}

export interface Transcript {
  id: string;
  caseId?: string;
  title: string;
  content: string;
  annotations: TranscriptAnnotation[];
  tags: string[];
  importantMoments: string[];
  createdAt: string;
  updatedAt: string;
  isArchived: boolean;
}

export interface UploadedFile {
  id: string;
  caseId?: string;
  name: string;
  type: string;
  size: number;
  category: "pdf" | "docx" | "txt" | "image" | "audio" | "transcript" | "other";
  uploadedAt: string;
  isArchived: boolean;
}

// ── SEED GOALS ────────────────────────────────────────────────

export const seedGoals: Goal[] = [
  {
    id: "goal-001",
    caseId: "case-001",
    title: "Develop anxiety regulation strategies",
    category: "therapeutic",
    description:
      "Help client build a toolkit of evidence-based anxiety regulation strategies including breathing, grounding, and cognitive restructuring.",
    status: "in-progress",
    priority: "high",
    progress: 60,
    milestones: [
      { id: "m1", title: "Introduce breathing techniques", completed: true },
      { id: "m2", title: "Practice cognitive restructuring", completed: true },
      { id: "m3", title: "Independent use outside sessions", completed: false },
    ],
    tags: ["anxiety", "CBT", "regulation"],
    createdAt: "2026-02-15T10:00:00Z",
    updatedAt: "2026-05-10T14:30:00Z",
    isArchived: false,
  },
  {
    id: "goal-002",
    caseId: "case-002",
    title: "Reduce behavioral outbursts",
    category: "behavioral",
    description:
      "Target reduction in classroom behavioral incidents from baseline of 4/week to below 1/week through emotion regulation and antecedent strategies.",
    status: "in-progress",
    priority: "high",
    progress: 45,
    milestones: [
      { id: "m4", title: "Baseline behavioral assessment", completed: true },
      { id: "m5", title: "Introduce emotion vocabulary", completed: true },
      { id: "m6", title: "Teacher strategy training", completed: false },
      { id: "m7", title: "Sustained reduction below 1/week", completed: false },
    ],
    tags: ["behavior", "child", "school"],
    createdAt: "2026-03-01T09:00:00Z",
    updatedAt: "2026-05-09T11:00:00Z",
    isArchived: false,
  },
  {
    id: "goal-003",
    caseId: "int-ap-001",
    title: "Build sensory regulation toolkit",
    category: "intervention",
    description:
      "Co-create a personalized sensory toolkit including preferred calming strategies, sensory-safe spaces, and self-advocacy scripts.",
    status: "in-progress",
    priority: "medium",
    progress: 75,
    milestones: [
      { id: "m8", title: "Sensory profile mapping", completed: true },
      { id: "m9", title: "Identify calming strategies", completed: true },
      { id: "m10", title: "Create visual toolkit card", completed: true },
      { id: "m11", title: "Independent use at school", completed: false },
    ],
    tags: ["sensory", "autism", "self-advocacy"],
    createdAt: "2026-01-20T10:00:00Z",
    updatedAt: "2026-05-11T09:30:00Z",
    isArchived: false,
  },
];

// ── SEED TRANSCRIPTS ──────────────────────────────────────────

export const seedTranscripts: Transcript[] = [
  {
    id: "tr-001",
    caseId: "res-004",
    title: "Interview 1 — RES-004",
    content:
      "<p><strong>Researcher:</strong> Can you tell me a bit about what it was like returning to work after the incident?</p><br/><p><strong>Participant:</strong> It was... honestly, terrifying. I kept waiting for something to go wrong again. My whole team was different with me — some people were overly kind, which was almost harder than people being distant.</p><br/><p><strong>Researcher:</strong> What do you mean by that?</p><br/><p><strong>Participant:</strong> It's like they were walking on eggshells. And that made me feel more broken, you know? Like I was fragile. I didn't want to be fragile. I wanted to just do my job.</p><br/><p><strong>Researcher:</strong> How did you eventually find a way to manage?</p><br/><p><strong>Participant:</strong> Honestly, it was one colleague. She didn't treat me differently. She just... included me. That made all the difference.</p>",
    annotations: [
      {
        id: "ann-001",
        selectedText: "walking on eggshells",
        note: "Key theme: peer avoidance behavior — explore further in Interview 2",
        color: "yellow",
      },
      {
        id: "ann-002",
        selectedText: "She just... included me",
        note: "Protective factor: peer inclusion as catalyst for recovery",
        color: "green",
      },
    ],
    tags: ["occupational-trauma", "peer-support", "return-to-work"],
    importantMoments: ["terrifying return experience", "fragility perception", "inclusion as turning point"],
    createdAt: "2026-05-06T14:00:00Z",
    updatedAt: "2026-05-08T10:00:00Z",
    isArchived: false,
  },
];

// ── CASES ────────────────────────────────────────────────────

export const mockCases: PsychCase[] = [
  {
    id: "case-001",
    code: "CASE-001",
    type: "Adult Case",
    status: "Active",
    age: "28",
    gender: "Female",
    context: "Individual outpatient clinical follow-up. University internship setting.",
    presentingConcerns:
      "Generalized anxiety, sleep difficulties, academic performance concerns, and social withdrawal noted over the past 6 months.",
    currentGoals: [
      "Develop effective anxiety regulation strategies",
      "Improve sleep hygiene",
      "Rebuild social connection and reduce avoidance",
      "Explore cognitive patterns linked to perfectionism",
    ],
    keyObservations:
      "Client demonstrates good verbal insight and motivation for change. Strong therapeutic alliance formed. Avoidant coping mechanisms remain prominent under stress.",
    latestSummary:
      "Session 8 — Client reported partial improvement in sleep. Continues to struggle with academic pressures. CBT-based thought restructuring introduced with positive initial response.",
    lastCheckIn: "2026-05-10",
    nextReportDue: "2026-05-17",
    tags: ["anxiety", "CBT", "adult", "university"],
    shortNote: "Strong progress. Monthly report due next week.",
    alerts: ["Monthly report due in 7 days"],
    startDate: "2026-02-15",
    supervisor: "Dr. Leclerc",
    institution: "Université de Montréal — Internship Clinic",
  },
  {
    id: "case-002",
    code: "CASE-002",
    type: "Child Follow-Up",
    status: "Active",
    age: "9",
    gender: "Male",
    context: "School-based clinical support. Referred by school psychologist.",
    presentingConcerns:
      "Behavioral difficulties in classroom, emotional dysregulation, opposition and frustration tolerance difficulties. Family context includes recent parental separation.",
    currentGoals: [
      "Reduce frequency of behavioral outbursts",
      "Develop emotional vocabulary and regulation tools",
      "Strengthen school-home communication",
      "Support family in consistent behavioral strategies",
    ],
    keyObservations:
      "Child shows creativity and humor in sessions. Responds well to play-based and narrative techniques. More difficult after weekends (parental transitions).",
    latestSummary:
      "Session 6 — Used emotion cards and story-based metaphors. Child identified three regulation strategies. Teacher report shows slight decrease in classroom incidents.",
    lastCheckIn: "2026-05-09",
    nextReportDue: "2026-05-24",
    tags: ["child", "behavioral", "school", "family-context"],
    shortNote: "Gradual progress. Collaboration with school team ongoing.",
    startDate: "2026-03-01",
    supervisor: "Dr. Tremblay",
    institution: "École Primaire Saint-Laurent — Psychological Services",
  },
  {
    id: "int-ap-001",
    code: "INT-AP-001",
    type: "Autism Internship Case",
    status: "Active",
    age: "14",
    gender: "Non-binary",
    context: "Specialized internship placement. Autism-focused support program.",
    presentingConcerns:
      "Social navigation difficulties in secondary school environment, sensory sensitivities, executive function challenges in organization and task initiation.",
    currentGoals: [
      "Build social scripts for common peer interactions",
      "Develop sensory regulation toolkit",
      "Improve executive function strategies for homework management",
      "Strengthen self-advocacy skills",
    ],
    keyObservations:
      "Strong interests in science and visual media. Uses humor as social bridge. Sensory needs particularly pronounced in noisy environments. Highly motivated when topics align with interests.",
    latestSummary:
      "Session 5 — Introduced visual schedule for after-school routine. Discussed sensory-safe spaces at school. Collaborated on a personal interest-based communication project.",
    lastCheckIn: "2026-05-11",
    nextReportDue: "2026-05-20",
    tags: ["autism", "adolescent", "sensory", "school-transition"],
    shortNote: "Consistent progress. Final internship report due end of May.",
    alerts: ["Internship evaluation grid due in 9 days"],
    startDate: "2026-01-20",
    supervisor: "Dr. Morin",
    institution: "CIUSSS — Specialized Youth Services",
  },
  {
    id: "res-004",
    code: "RES-004",
    type: "Research Participant",
    status: "Active",
    age: "35",
    gender: "Male",
    context: "Qualitative research study on coping strategies post-trauma. University ethics approved.",
    presentingConcerns:
      "Research context — participant shares lived experience of post-traumatic stress in occupational setting.",
    currentGoals: [
      "Complete two semi-structured interviews",
      "Member check transcript review",
      "Thematic analysis contribution",
    ],
    keyObservations:
      "Participant is articulate and engaged. Provided rich narrative data. Expressed interest in receiving anonymized summary findings.",
    latestSummary:
      "Interview 1 completed. Three primary themes emerging: workplace safety, peer support, and coping agency. Second interview scheduled.",
    lastCheckIn: "2026-05-06",
    nextReportDue: "2026-05-30",
    tags: ["research", "trauma", "qualitative", "occupational"],
    shortNote: "First interview transcribed. Thematic coding in progress.",
    startDate: "2026-04-10",
    supervisor: "Prof. Arsenault",
    institution: "UQAM — Research Ethics Board Approved Study",
  },
  {
    id: "sup-002",
    code: "SUP-002",
    type: "Supervision Case",
    status: "Needs Review",
    age: "42",
    gender: "Female",
    context: "Clinical supervision case presented during group supervision. Complex presentation.",
    presentingConcerns:
      "Complex trauma history, dissociative symptoms, co-occurring depression. Internship student seeks guidance on therapeutic approach and boundary management.",
    currentGoals: [
      "Clarify appropriate therapeutic framework",
      "Discuss limit-setting and referral considerations",
      "Reflect on countertransference reactions",
      "Develop safe trauma-informed plan",
    ],
    keyObservations:
      "Case raises important questions around therapeutic scope, referral thresholds, and the student clinician's own emotional responses. Supervision is essential for safe continuation.",
    latestSummary:
      "Brought to group supervision on May 7. Consensus: continue with structured trauma-informed approach. Referral to specialist if dissociation escalates. Student requested individual supervision.",
    lastCheckIn: "2026-05-07",
    nextReportDue: "2026-05-14",
    tags: ["supervision", "trauma", "complex-case", "countertransference"],
    shortNote: "Needs review — supervision meeting urgent.",
    alerts: [
      "Supervision session needs to be scheduled",
      "Referral decision pending",
    ],
    startDate: "2026-04-28",
    supervisor: "Dr. Beausoleil",
    institution: "CEGEP Clinique — Supervision Program",
  },
];

// ── SESSIONS ─────────────────────────────────────────────────

export const mockSessions: Session[] = [
  {
    id: "ses-001-1",
    caseId: "case-001",
    date: "2026-05-10",
    sessionNumber: 8,
    type: "Individual — CBT",
    duration: "50 minutes",
    mainTopics: "Thought records, sleep diary review, academic pressure",
    observations: "Client arrived on time, affect slightly subdued. Good engagement once session began.",
    interventions: "Cognitive restructuring — challenging catastrophic thoughts about exams. Sleep hygiene reinforcement.",
    nextSteps: "Complete thought record worksheet before next session. Practice 4-7-8 breathing technique nightly.",
  },
  {
    id: "ses-001-2",
    caseId: "case-001",
    date: "2026-05-03",
    sessionNumber: 7,
    type: "Individual — CBT",
    duration: "50 minutes",
    mainTopics: "Social withdrawal, avoidance patterns, peer relationships",
    observations: "Client reflective and open. Identified two key avoidance triggers.",
    interventions: "Behavioral activation planning. Graded exposure discussion for social situations.",
    nextSteps: "Attend one social event before next session. Log emotions before/after.",
  },
  {
    id: "ses-002-1",
    caseId: "case-002",
    date: "2026-05-09",
    sessionNumber: 6,
    type: "Child — Play-based + Narrative",
    duration: "45 minutes",
    mainTopics: "Emotional vocabulary, frustration triggers, coping tools",
    observations: "Child engaged enthusiastically with emotion card activity. Mentioned missing dad.",
    interventions: "Emotion wheel exploration, story metaphor about 'the volcano feeling'.",
    nextSteps: "Share emotion wheel with parents. Suggest using at home during transitions.",
  },
  {
    id: "ses-int-1",
    caseId: "int-ap-001",
    date: "2026-05-11",
    sessionNumber: 5,
    type: "Adolescent — Skills-based + Sensory",
    duration: "60 minutes",
    mainTopics: "Sensory regulation, school environment mapping, visual schedule",
    observations: "Very engaged when discussing sensory preferences. Showed photo of favourite quiet space.",
    interventions: "Co-created visual daily schedule. Sensory toolkit brainstorm. Interest-based project introduced.",
    nextSteps: "Trial visual schedule for one week. Bring list of sensory-friendly spaces identified at school.",
  },
];

// ── DAILY CHECK-INS ──────────────────────────────────────────

export const mockDailyCheckIns: DailyCheckIn[] = [
  {
    id: "chk-001",
    caseId: "case-001",
    date: "2026-05-10",
    contextType: "Individual session — clinical internship",
    moodAffect: "Subdued on arrival, gradually more engaged. Mild anxious affect noted.",
    behaviorObservations: "Punctual. Fidgeted with sleeve during exam discussion. Eye contact maintained.",
    communicationObservations: "Verbal, clear, thoughtful. Some avoidant deflection when discussing family.",
    cognitiveObservations: "Rumination patterns evident. Thought record showed all-or-nothing thinking style.",
    emotionalRegulation: "Moderate — used breathing technique once during session when distressed.",
    socialInteraction: "N/A in individual session. Reports continued social withdrawal this week.",
    sensoryObservations: "No particular sensory observations.",
    interventionUsed: "Cognitive restructuring, thought records, sleep hygiene reinforcement.",
    responseToIntervention: "Positive. Client completed thought record and reported it felt 'less catastrophic' afterward.",
    freeNotes: "Client mentioned considering withdrawing from one course. Worth exploring next session.",
    followUpNeeded: true,
    followUpNote: "Explore course withdrawal decision and academic pressure in next session.",
  },
  {
    id: "chk-002",
    caseId: "case-002",
    date: "2026-05-09",
    contextType: "School-based session",
    moodAffect: "Energetic on arrival. Some sadness emerging mid-session.",
    behaviorObservations: "Active, playful. Mild frustration when activity didn't go as planned — recovered quickly.",
    communicationObservations: "Spontaneous speech, good narrative. Used new emotion words (proud, sad-but-okay).",
    cognitiveObservations: "Beginning to link triggers to emotional responses. Still some magical thinking.",
    emotionalRegulation: "Improved compared to last month. Used 'belly breathing' independently during frustration.",
    socialInteraction: "Asked about a peer conflict. Role-played a repair scenario.",
    sensoryObservations: "No significant sensory concerns.",
    interventionUsed: "Emotion wheel, narrative metaphor (volcano), role-play.",
    responseToIntervention: "Enthusiastic. Wanted to take emotion wheel home.",
    freeNotes: "Mentioned missing dad again. Parental separation grief still present. May need parent consultation soon.",
    followUpNeeded: true,
    followUpNote: "Consider parent consultation to support emotional vocabulary use at home.",
  },
  {
    id: "chk-003",
    caseId: "int-ap-001",
    date: "2026-05-11",
    contextType: "Specialized internship session",
    moodAffect: "Calm and focused. Brightened significantly when science topic arose.",
    behaviorObservations: "Stimming (hand-flapping) briefly at session start — calmed quickly. Otherwise regulated.",
    communicationObservations: "Detailed and expressive on preferred topics. More literal in social-script practice.",
    cognitiveObservations: "Strong visual processing. Excellent memory for details. Difficulty with open-ended questions.",
    emotionalRegulation: "Good self-regulation throughout. Named discomfort when asked to role-play unfamiliar social scenario.",
    socialInteraction: "Practiced greeting script. Identified two peers as 'safe' at school.",
    sensoryObservations: "Overhead lighting reported as uncomfortable. Requested sunglasses option — noted for follow-up.",
    interventionUsed: "Visual schedule co-creation, sensory toolkit brainstorm, interest-based project.",
    responseToIntervention: "Highly engaged. Completed visual schedule independently and showed satisfaction.",
    freeNotes: "Lighting concern should be shared with school team. Could be part of accommodation plan.",
    followUpNeeded: true,
    followUpNote: "Follow up with school re: lighting accommodations and quiet space access.",
  },
  {
    id: "chk-004",
    caseId: "case-001",
    date: "2026-05-03",
    contextType: "Individual session — clinical internship",
    moodAffect: "Slightly better affect than last session. Some humor observed.",
    behaviorObservations: "Relaxed posture. Made several self-deprecating jokes — possible minimization.",
    communicationObservations: "Open and verbal. Spent significant time discussing a friend situation.",
    cognitiveObservations: "Shows awareness of own avoidance but struggles to challenge it in the moment.",
    emotionalRegulation: "Moderate. Reported using breathing technique 3x this week at night.",
    socialInteraction: "Attended a small gathering — reported feeling 'exhausted but okay'.",
    sensoryObservations: "N/A.",
    interventionUsed: "Behavioral activation review, graded exposure planning.",
    responseToIntervention: "Receptive. Agreed to plan one social outing per week as exposure.",
    freeNotes: "Positive momentum. Client showing more willingness to engage socially.",
    followUpNeeded: false,
  },
  {
    id: "chk-005",
    caseId: "sup-002",
    date: "2026-05-07",
    contextType: "Group supervision — case presentation",
    moodAffect: "N/A (supervision context)",
    behaviorObservations:
      "Student intern presented case clearly. Showed some anxiety when discussing countertransference.",
    communicationObservations: "Good clinical formulation. Some uncertainty about diagnostic hypotheses.",
    cognitiveObservations: "N/A — supervision notes.",
    emotionalRegulation: "Student managed anxiety well during challenging feedback.",
    socialInteraction: "Group dynamic supportive. Three supervisors contributed.",
    sensoryObservations: "N/A.",
    interventionUsed: "Group supervision, Socratic questioning, trauma-informed framework discussion.",
    responseToIntervention: "Student felt clearer post-session. Requested individual follow-up.",
    freeNotes:
      "Recommend student reads on dissociative presentations before next session. Referral criteria discussed.",
    followUpNeeded: true,
    followUpNote: "Schedule individual supervision. Finalize referral decision.",
  },
];

// ── WEEKLY REVIEWS ───────────────────────────────────────────

export const mockWeeklyReviews: WeeklyReview[] = [
  {
    id: "wk-001",
    caseId: "case-001",
    weekStart: "2026-05-05",
    weekEnd: "2026-05-11",
    mainProgress:
      "Client attended session regularly. Sleep improved by approximately 45 minutes per night. Used breathing technique independently three times.",
    mainDifficulties:
      "Academic pressure remains high. Still avoids initiating social contact.",
    repeatedPatterns:
      "All-or-nothing thinking appears consistently around academic performance. Avoidance spikes near exam periods.",
    effectiveInterventions:
      "Cognitive restructuring through thought records. Behavioral activation — graded exposure to social events.",
    concerns:
      "Client mentioned possible course withdrawal. This decision needs to be explored carefully — potential impact on self-esteem.",
    goalsNextWeek:
      "Continue sleep diary. Complete two thought records independently. Attend one small social gathering.",
    questionsForSupervision:
      "How to balance supporting academic adjustment while not reinforcing avoidance? When to involve campus mental health services?",
  },
  {
    id: "wk-002",
    caseId: "case-002",
    weekStart: "2026-05-05",
    weekEnd: "2026-05-09",
    mainProgress:
      "Child used belly breathing at school without prompting (confirmed by teacher). Used emotion vocabulary at home twice (parent report).",
    mainDifficulties:
      "Monday mornings remain difficult following parent transitions. Two behavioral incidents in classroom this week.",
    repeatedPatterns:
      "Behavioral incidents correlate with transition days and unstructured time. Emotional dysregulation follows helplessness theme.",
    effectiveInterventions:
      "Narrative metaphor resonated well. Emotion wheel used enthusiastically.",
    concerns:
      "Grief around parental separation still present and likely under-processed. Parent consultation needed soon.",
    goalsNextWeek:
      "Introduce transition coping card for Monday mornings. Begin parent consultation planning.",
    questionsForSupervision:
      "Is it appropriate to involve both parents separately or together? How to address grief therapeutically without full trauma processing at this age?",
  },
  {
    id: "wk-003",
    caseId: "int-ap-001",
    weekStart: "2026-05-05",
    weekEnd: "2026-05-11",
    mainProgress:
      "Visual schedule trialed for 4 days — reported as 'helpful' by both student and parent. Identified two safe peers at school.",
    mainDifficulties:
      "Overhead lighting remains distressing. Sensory overload reported on crowded lunch period.",
    repeatedPatterns:
      "Strong performance when interests are integrated. Difficulty with spontaneous social demands.",
    effectiveInterventions:
      "Interest-based approach. Visual supports. Co-creation of tools (rather than imposing).",
    concerns:
      "School accommodation plan not yet in place. Lighting and quiet space concerns need formal documentation.",
    goalsNextWeek:
      "Draft letter to school team about accommodations. Practice two conversation-opener scripts.",
    questionsForSupervision:
      "What is our scope regarding school advocacy? Should we draft accommodation recommendations or refer to school psych?",
  },
];

// ── MONTHLY REVIEWS ──────────────────────────────────────────

export const mockMonthlyReviews: MonthlyReview[] = [
  {
    id: "mo-001",
    caseId: "case-001",
    month: "April 2026",
    overallEvolution:
      "Moderate positive evolution over April. Therapeutic alliance solidified. CBT framework introduced and received well. Client shows growing capacity for self-reflection.",
    assessmentChanges:
      "Anxiety self-report scale (informal) suggests slight reduction from initial presentation. Sleep diary shows inconsistent but overall improving trend.",
    clinicalObservations:
      "Avoidance remains central pattern. Perfectionism schema evident in academic and social domains. Client demonstrates insight but struggles to translate insight into behavioral change.",
    supervisionPoints:
      "Discussed at supervision April 25. Supervisor noted strong alliance. Suggested introducing acceptance-based strategies alongside CBT.",
    recommendations:
      "Continue weekly sessions. Introduce ACT-informed values clarification exercise. Explore family history of anxiety in upcoming sessions.",
    nextMonthObjectives:
      "Reduce avoidance in at least two behavioral domains. Sleep score above 7/10 for 3 consecutive nights. Complete first values mapping exercise.",
  },
  {
    id: "mo-002",
    caseId: "int-ap-001",
    month: "April 2026",
    overallEvolution:
      "Significant positive evolution in April. Student engaged consistently and showed motivation. Visual supports and interest-based activities produced strong outcomes.",
    assessmentChanges:
      "Behavioral observation grid shows decrease in sensory-triggered distress episodes (from 4/week to 1-2/week). Social script use increased.",
    clinicalObservations:
      "Executive function challenges persist in homework initiation. However, the visual schedule is showing early promise. Peer identification improving.",
    supervisionPoints:
      "Reviewed with supervisor April 22. Praised interest-based approach. Raised question about school accommodation advocacy scope.",
    recommendations:
      "Formalize school communication. Begin accommodation documentation. Continue sensory regulation toolkit development.",
    nextMonthObjectives:
      "Complete draft school accommodation letter. Trial earplug use during loud periods. Practice three new social scripts.",
  },
];

// ── ASSESSMENTS ──────────────────────────────────────────────

export const mockAssessments: Assessment[] = [
  {
    id: "asmnt-001",
    title: "Clinical Interview Checklist",
    description:
      "Structured checklist for gathering initial clinical information. Covers presenting concerns, history, family context, emotional/cognitive/behavioral symptoms, risk and protective factors.",
    caseTypeRelevance: ["Clinical Case", "Adult Case", "Child Follow-Up", "Supervision Case"],
    lastCompleted: "2026-02-15",
    scoreStatus: "Completed",
    scoreValue: "Full intake",
    category: "Interview",
  },
  {
    id: "asmnt-002",
    title: "Anxiety Observation Scale",
    description:
      "Informal observation-based anxiety scale. Tracks anxious behaviors, avoidance, and physiological signs across sessions. Not a standardized psychometric tool.",
    caseTypeRelevance: ["Clinical Case", "Adult Case", "Child Follow-Up"],
    lastCompleted: "2026-04-30",
    scoreStatus: "In Progress",
    scoreValue: "Moderate (5/10)",
    category: "Observation Scale",
  },
  {
    id: "asmnt-003",
    title: "Behavioral Observation Grid",
    description:
      "Session-by-session behavioral tracking. Records frequency and intensity of target behaviors, antecedents, and consequences.",
    caseTypeRelevance: ["Child Follow-Up", "Autism Internship Case", "Assessment Only"],
    lastCompleted: "2026-05-09",
    scoreStatus: "Ongoing",
    scoreValue: "Trend improving",
    category: "Behavioral Grid",
  },
  {
    id: "asmnt-004",
    title: "Sensory Profile (Observational)",
    description:
      "Observational sensory preference and sensitivity profile. Documents sensory domains, preferences, and regulation strategies. Not a standardized tool.",
    caseTypeRelevance: ["Autism Internship Case", "Child Follow-Up", "Assessment Only"],
    lastCompleted: "2026-04-22",
    scoreStatus: "Completed",
    scoreValue: "Profile mapped",
    category: "Sensory",
  },
  {
    id: "asmnt-005",
    title: "Depression Symptom Checklist",
    description:
      "Informal checklist based on clinical observation. Documents low mood, anhedonia, energy, sleep, appetite, and concentration concerns. Supports clinical hypothesis formation.",
    caseTypeRelevance: ["Clinical Case", "Adult Case", "Supervision Case"],
    lastCompleted: null,
    scoreStatus: "Not started",
    category: "Checklist",
  },
  {
    id: "asmnt-006",
    title: "Custom Assessment Grid",
    description:
      "Flexible assessment grid. Can be customized with any columns needed for a specific case. Printable and reusable.",
    caseTypeRelevance: [
      "Clinical Case",
      "Child Follow-Up",
      "Autism Internship Case",
      "Adult Case",
      "Assessment Only",
    ],
    lastCompleted: null,
    scoreStatus: "Template",
    category: "Custom",
  },
];

// ── SUPERVISION NOTES ────────────────────────────────────────

export const mockSupervisionNotes: SupervisionNote[] = [
  {
    id: "sup-note-001",
    caseId: "case-001",
    date: "2026-04-25",
    supervisorName: "Dr. Leclerc",
    mainTopics:
      "CBT framework for generalized anxiety, pacing of exposure work, building self-compassion alongside cognitive techniques.",
    ethicalConcerns: "None identified at this time.",
    clinicalReflection:
      "Reflecting on my tendency to rush toward problem-solving. Supervisor encouraged sitting with the client's ambivalence more before moving to action. Important reminder.",
    feedbackReceived:
      "Strong therapeutic alliance noted. Need to slow down and allow more silence. Introduce ACT-informed values work.",
    actionPlan:
      "Read chapter on ACT for anxiety this week. Prepare values clarification exercise for next session.",
    questionsRaised: "When is it appropriate to recommend adjunct pharmacological consultation?",
  },
  {
    id: "sup-note-002",
    caseId: "case-002",
    date: "2026-04-29",
    supervisorName: "Dr. Tremblay",
    mainTopics:
      "Child behavioral dysregulation, parental separation grief, school-home communication strategies.",
    ethicalConcerns:
      "Confidentiality with child client — what to share with school vs. what stays in clinical space.",
    clinicalReflection:
      "I noticed I was uncomfortable with the child's sadness about their dad. Supervisor helped me reflect on not rushing to 'fix' grief. Need to stay present.",
    feedbackReceived:
      "Good use of narrative technique. Emotion vocabulary work is producing results. Plan parent consultation.",
    actionPlan:
      "Schedule parent consultation for mid-May. Review literature on child grief post-parental separation.",
    questionsRaised:
      "How to handle parental conflict if both parents attend consultation? What are boundaries of our role vs. family therapist?",
  },
  {
    id: "sup-note-003",
    caseId: "sup-002",
    date: "2026-05-07",
    supervisorName: "Dr. Beausoleil",
    mainTopics:
      "Complex trauma presentation, dissociative symptoms, scope of practice for intern, referral considerations.",
    ethicalConcerns:
      "Risk assessment needed given complexity. Ensuring intern student not exceeding their competency level. Need clear escalation path.",
    clinicalReflection:
      "This case brings up strong countertransference — a sense of helplessness I need to monitor. Discussing in individual supervision.",
    feedbackReceived:
      "Good case formulation presented. Keep applying trauma-informed lens. Do not attempt trauma processing without specific training and supervision clearance.",
    actionPlan:
      "Assess risk at next session. Prepare referral letter if dissociation escalates. Schedule individual supervision.",
    questionsRaised:
      "Is stabilization phase sufficient for this internship context, or should we refer immediately to specialist?",
  },
];

// ── RESEARCH PARTICIPANTS ────────────────────────────────────

export const mockResearchParticipants: ResearchParticipant[] = [
  {
    id: "rp-001",
    code: "RES-004",
    studyTitle: "Coping Strategies Following Occupational Trauma: A Qualitative Study",
    status: "Active",
    interviewDate: "2026-05-06",
    keyThemes: ["Workplace safety perceptions", "Peer support networks", "Coping agency and control"],
    memos:
      "Participant provided particularly rich account of return-to-work experience. Noted the role of direct supervisor behavior in recovery. Consider expanding probe questions around organizational factors in Interview 2.",
    codingStatus: "Interview 1 — initial coding in progress",
  },
  {
    id: "rp-002",
    code: "RES-007",
    studyTitle: "Coping Strategies Following Occupational Trauma: A Qualitative Study",
    status: "Active",
    interviewDate: "2026-04-28",
    keyThemes: ["Isolation and stigma", "Healthcare access barriers", "Personal meaning-making"],
    memos:
      "Participant expressed strong emotions during discussion of seeking help. Important to reflect on researcher positionality here. Themes of stigma around mental health in their workplace are prominent.",
    codingStatus: "Interview 1 — transcription complete, coding not started",
  },
];

// ── HELPER: Get case by ID or code ───────────────────────────

export function getCaseById(id: string): PsychCase | undefined {
  return mockCases.find(
    (c) => c.id === id || c.code.toLowerCase() === id.toLowerCase()
  );
}

export function getCheckInsForCase(caseId: string): DailyCheckIn[] {
  return mockDailyCheckIns.filter((c) => c.caseId === caseId);
}

export function getWeeklyReviewsForCase(caseId: string): WeeklyReview[] {
  return mockWeeklyReviews.filter((r) => r.caseId === caseId);
}

export function getMonthlyReviewsForCase(caseId: string): MonthlyReview[] {
  return mockMonthlyReviews.filter((r) => r.caseId === caseId);
}

export function getSessionsForCase(caseId: string): Session[] {
  return mockSessions.filter((s) => s.caseId === caseId);
}

export function getSupervisionNotesForCase(caseId: string): SupervisionNote[] {
  return mockSupervisionNotes.filter((n) => n.caseId === caseId);
}

// ── REPORT PREVIEW DATA ──────────────────────────────────────

export const reportPreviewData = {
  studentName: "Your Name",
  institution: "Your University / Institution",
  internshipPlace: "Your Internship Site",
  supervisorName: "Your Supervisor",
  reportingCase: mockCases[0],
  dailyCheckIn: mockDailyCheckIns[0],
  weeklyReview: mockWeeklyReviews[0],
  monthlyReview: mockMonthlyReviews[0],
};
