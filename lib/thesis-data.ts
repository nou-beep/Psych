// Thesis Studio — types, seed data, and statistical utilities

// ── Types ─────────────────────────────────────────────────────

export interface ThesisParticipant {
  id: string;
  code: string;
  age: number;
  gender: string;
  group: "Clinical" | "Subclinical" | "Control";
  depressionScore: number | null;
  anxietyScore: number | null;
  depersonalizationScore: number | null;
  derealizationScore: number | null;
  stressScore: number | null;
  emotionalRegulationScore: number | null;
  notes: string;
  hasMissingData: boolean;
  createdAt: string;
}

export interface ThesisDesign {
  title: string;
  researchProblem: string;
  researchQuestions: string[];
  hypotheses: string[];
  independentVariables: string[];
  dependentVariables: string[];
  controlVariables: string[];
  sampleDescription: string;
  inclusionCriteria: string;
  exclusionCriteria: string;
  methodology: string;
  ethicalConsiderations: string;
}

export interface ThesisNote {
  id: string;
  title: string;
  content: string;
  category: "article" | "concept" | "citation" | "feedback" | "statistics" | "methodology" | "dsm" | "other";
  tags: string[];
  linkedVariables: string[];
  createdAt: string;
  updatedAt: string;
}

export interface QuestionnaireResponse {
  id: string;
  questionnaireName: string;
  participantCode: string;
  responses: Record<string, number | null>;
  totalScore: number | null;
  subscores: Record<string, number | null>;
  completedAt: string;
}

export interface ReportSection {
  id: string;
  title: string;
  content: string;
  order: number;
}

// ── Statistical utility functions ─────────────────────────────

export function statMean(arr: number[]): number {
  if (!arr.length) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

export function statMedian(arr: number[]): number {
  if (!arr.length) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

export function statStdDev(arr: number[]): number {
  if (arr.length < 2) return 0;
  const m = statMean(arr);
  const variance = arr.reduce((a, b) => a + (b - m) ** 2, 0) / (arr.length - 1);
  return Math.sqrt(variance);
}

export function statMode(arr: number[]): number {
  if (!arr.length) return 0;
  const freq: Record<number, number> = {};
  arr.forEach((v) => { freq[v] = (freq[v] ?? 0) + 1; });
  return Number(Object.entries(freq).sort((a, b) => b[1] - a[1])[0][0]);
}

export function pearsonR(x: number[], y: number[]): number {
  const n = Math.min(x.length, y.length);
  if (n < 2) return 0;
  const mx = statMean(x.slice(0, n));
  const my = statMean(y.slice(0, n));
  let num = 0, dx = 0, dy = 0;
  for (let i = 0; i < n; i++) {
    num += (x[i] - mx) * (y[i] - my);
    dx += (x[i] - mx) ** 2;
    dy += (y[i] - my) ** 2;
  }
  const den = Math.sqrt(dx * dy);
  return den === 0 ? 0 : num / den;
}

export function interpretR(r: number): string {
  const abs = Math.abs(r);
  const dir = r >= 0 ? "positive" : "negative";
  if (abs >= 0.7) return `strong ${dir}`;
  if (abs >= 0.4) return `moderate ${dir}`;
  if (abs >= 0.2) return `weak ${dir}`;
  return "negligible";
}

export function interpretRClinical(r: number): string {
  const abs = Math.abs(r);
  const dir = r >= 0 ? "increases with" : "decreases as";
  if (abs >= 0.7) return `Scores are strongly associated (one variable notably ${dir} the other).`;
  if (abs >= 0.4) return `A moderate association is apparent, suggesting a meaningful co-occurrence.`;
  if (abs >= 0.2) return `A weak association was observed, which should be interpreted with caution.`;
  return `No meaningful association was detected between these variables.`;
}

export function describeGroup(group: "Clinical" | "Subclinical" | "Control"): string {
  const map = {
    Clinical: "Participants meeting clinical threshold criteria",
    Subclinical: "Participants with elevated but sub-threshold scores",
    Control: "Non-clinical comparison group participants",
  };
  return map[group];
}

// ── Seed Data ─────────────────────────────────────────────────

export const seedParticipants: ThesisParticipant[] = [
  { id: "p01", code: "P-001", age: 23, gender: "Female", group: "Clinical", depressionScore: 18, anxietyScore: 16, depersonalizationScore: 24, derealizationScore: 22, stressScore: 28, emotionalRegulationScore: 32, notes: "Reports frequent dissociative episodes", hasMissingData: false, createdAt: "2026-01-10T09:00:00Z" },
  { id: "p02", code: "P-002", age: 27, gender: "Male", group: "Clinical", depressionScore: 21, anxietyScore: 18, depersonalizationScore: 28, derealizationScore: 26, stressScore: 31, emotionalRegulationScore: 38, notes: "", hasMissingData: false, createdAt: "2026-01-10T09:00:00Z" },
  { id: "p03", code: "P-003", age: 20, gender: "Female", group: "Subclinical", depressionScore: 11, anxietyScore: 9, depersonalizationScore: 14, derealizationScore: 12, stressScore: 18, emotionalRegulationScore: 22, notes: "", hasMissingData: false, createdAt: "2026-01-10T09:00:00Z" },
  { id: "p04", code: "P-004", age: 31, gender: "Female", group: "Clinical", depressionScore: 16, anxietyScore: 14, depersonalizationScore: 20, derealizationScore: 19, stressScore: 25, emotionalRegulationScore: 29, notes: "Follow-up scheduled", hasMissingData: false, createdAt: "2026-01-10T09:00:00Z" },
  { id: "p05", code: "P-005", age: 24, gender: "Non-binary", group: "Subclinical", depressionScore: 9, anxietyScore: 10, depersonalizationScore: 11, derealizationScore: 8, stressScore: 14, emotionalRegulationScore: 18, notes: "", hasMissingData: false, createdAt: "2026-01-10T09:00:00Z" },
  { id: "p06", code: "P-006", age: 29, gender: "Male", group: "Control", depressionScore: 3, anxietyScore: 2, depersonalizationScore: 4, derealizationScore: 3, stressScore: 6, emotionalRegulationScore: 8, notes: "", hasMissingData: false, createdAt: "2026-01-10T09:00:00Z" },
  { id: "p07", code: "P-007", age: 22, gender: "Female", group: "Control", depressionScore: 2, anxietyScore: 3, depersonalizationScore: 2, derealizationScore: 4, stressScore: 5, emotionalRegulationScore: 6, notes: "", hasMissingData: false, createdAt: "2026-01-10T09:00:00Z" },
  { id: "p08", code: "P-008", age: 34, gender: "Male", group: "Clinical", depressionScore: 22, anxietyScore: 19, depersonalizationScore: null, derealizationScore: null, stressScore: 33, emotionalRegulationScore: null, notes: "DPDR scale incomplete — not usable for DPDR analysis", hasMissingData: true, createdAt: "2026-01-10T09:00:00Z" },
  { id: "p09", code: "P-009", age: 26, gender: "Female", group: "Clinical", depressionScore: 14, anxietyScore: 15, depersonalizationScore: 18, derealizationScore: 17, stressScore: 22, emotionalRegulationScore: 26, notes: "", hasMissingData: false, createdAt: "2026-01-10T09:00:00Z" },
  { id: "p10", code: "P-010", age: 19, gender: "Female", group: "Subclinical", depressionScore: 8, anxietyScore: 7, depersonalizationScore: 9, derealizationScore: 7, stressScore: 12, emotionalRegulationScore: 15, notes: "", hasMissingData: false, createdAt: "2026-01-10T09:00:00Z" },
  { id: "p11", code: "P-011", age: 28, gender: "Male", group: "Control", depressionScore: 4, anxietyScore: 3, depersonalizationScore: 5, derealizationScore: 3, stressScore: 7, emotionalRegulationScore: 9, notes: "", hasMissingData: false, createdAt: "2026-01-10T09:00:00Z" },
  { id: "p12", code: "P-012", age: 25, gender: "Female", group: "Clinical", depressionScore: 19, anxietyScore: 17, depersonalizationScore: 23, derealizationScore: 21, stressScore: 29, emotionalRegulationScore: 35, notes: "", hasMissingData: false, createdAt: "2026-01-10T09:00:00Z" },
  { id: "p13", code: "P-013", age: 21, gender: "Female", group: "Subclinical", depressionScore: 10, anxietyScore: 8, depersonalizationScore: 12, derealizationScore: 10, stressScore: 15, emotionalRegulationScore: 19, notes: "", hasMissingData: false, createdAt: "2026-01-10T09:00:00Z" },
  { id: "p14", code: "P-014", age: 33, gender: "Male", group: "Control", depressionScore: 1, anxietyScore: 2, depersonalizationScore: 3, derealizationScore: 2, stressScore: 4, emotionalRegulationScore: 5, notes: "", hasMissingData: false, createdAt: "2026-01-10T09:00:00Z" },
  { id: "p15", code: "P-015", age: 30, gender: "Female", group: "Clinical", depressionScore: 20, anxietyScore: 16, depersonalizationScore: 25, derealizationScore: 23, stressScore: 30, emotionalRegulationScore: 36, notes: "", hasMissingData: false, createdAt: "2026-01-10T09:00:00Z" },
];

export const seedDesign: ThesisDesign = {
  title: "The Relationship Between Depression, Anxiety, and Depersonalization/Derealization Symptoms in a Non-Clinical and Clinical Sample",
  researchProblem: "Depersonalization and derealization are frequently reported in individuals with depression and anxiety disorders, yet remain underdiagnosed and poorly understood in clinical settings. The mechanisms linking these symptoms remain unclear.",
  researchQuestions: [
    "Is there a significant positive correlation between depression scores and depersonalization/derealization scores?",
    "Is there a significant positive correlation between anxiety scores and depersonalization/derealization scores?",
    "Do clinical-group participants score significantly higher on DPDR measures than subclinical and control groups?",
  ],
  hypotheses: [
    "H1: There will be a significant positive correlation between depression scores (PHQ-9) and depersonalization scores (DPDR-16).",
    "H2: There will be a significant positive correlation between anxiety scores (GAD-7) and depersonalization scores (DPDR-16).",
    "H3: Clinical-group participants will show significantly higher DPDR scores compared to control participants.",
    "H0: No significant differences in DPDR scores will be found between groups.",
  ],
  independentVariables: ["Group membership (Clinical / Subclinical / Control)", "Depression severity (PHQ-9 score)", "Anxiety severity (GAD-7 score)"],
  dependentVariables: ["Depersonalization score (DPDR-16)", "Derealization score (DPDR-16)", "Total DPDR composite score"],
  controlVariables: ["Age", "Gender", "Medication status", "Prior diagnosis", "Stress level (PSS score)"],
  sampleDescription: "A convenience sample of 15 participants aged 19–34 years recruited through university networks and clinical outreach. Participants were categorized into Clinical (n=7), Subclinical (n=4), and Control (n=4) groups based on PHQ-9 and GAD-7 cutoff scores.",
  inclusionCriteria: "Age 18–40 years. Able to read and write in the language of assessment. Willing to provide informed consent.",
  exclusionCriteria: "Active psychotic disorder. Neurological condition affecting cognition. Currently hospitalized. Substance use disorder (primary).",
  methodology: "Cross-sectional correlational design. Participants completed validated self-report questionnaires including PHQ-9, GAD-7, DPDR-16, and PSS. Pearson correlation analysis and one-way ANOVA will be used to test hypotheses. All data are anonymized.",
  ethicalConsiderations: "Informed consent obtained from all participants. Anonymized participant codes used throughout. Data stored securely. Participants debriefed after completion. Right to withdraw guaranteed without consequence. University ethics committee approval pending.",
};

export const seedNotes: ThesisNote[] = [
  {
    id: "tn01",
    title: "Sierra et al. (2005) — Cambridge Depersonalization Scale",
    content: "The Cambridge Depersonalization Scale (CDS) is a 29-item self-report measure of depersonalization severity with strong psychometric properties. Cronbach's alpha reported at 0.89. Suitable for clinical and research contexts.",
    category: "article",
    tags: ["dpdr", "measurement", "validity"],
    linkedVariables: ["depersonalizationScore", "derealizationScore"],
    createdAt: "2026-02-01T10:00:00Z",
    updatedAt: "2026-02-01T10:00:00Z",
  },
  {
    id: "tn02",
    title: "DSM-5 — Depersonalization/Derealization Disorder (300.6)",
    content: "Characterized by persistent or recurrent experiences of depersonalization (feeling detached from one's own mind or body) and/or derealization (feeling of unreality or detachment from surroundings). Reality testing remains intact. Not attributable to substances or another mental disorder.",
    category: "dsm",
    tags: ["dsm5", "dpdr", "diagnostic"],
    linkedVariables: ["depersonalizationScore", "derealizationScore"],
    createdAt: "2026-02-02T10:00:00Z",
    updatedAt: "2026-02-02T10:00:00Z",
  },
  {
    id: "tn03",
    title: "Correlation interpretation thresholds (Cohen, 1988)",
    content: "Cohen (1988) proposed the following benchmarks for Pearson r: Small effect r = .10, Medium effect r = .30, Large effect r = .50. These should be interpreted in the context of the research area — clinical correlations often considered meaningful at r > .30.",
    category: "statistics",
    tags: ["correlation", "effect-size", "cohen"],
    linkedVariables: [],
    createdAt: "2026-02-03T10:00:00Z",
    updatedAt: "2026-02-03T10:00:00Z",
  },
];

export const THESIS_STORE_KEYS = {
  PARTICIPANTS: "thesis_participants",
  DESIGN: "thesis_design",
  NOTES: "thesis_notes",
  REPORT: "thesis_report",
};
