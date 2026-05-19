// Storage keys for the internship studio. Each record type has its
// own key so unrelated updates don't churn a single blob.

export const INTERNSHIP_STORAGE_KEYS = {
  cases: "psych-internship-cases-v1",
  tests: "psych-internship-tests-v1",
  grids: "psych-internship-grids-v1",
  reports: "psych-internship-reports-v1",
  supervision: "psych-internship-supervision-v1",
  files: "psych-internship-files-v1",
  scorableAdmins: "psych-internship-scorable-grids-v1",
  // Generic ScoreSet administrations (any schema beyond acquisition).
  scoreSetAdmins: "psych-internship-score-set-admins-v1",
} as const;

export type InternshipStorageKey =
  (typeof INTERNSHIP_STORAGE_KEYS)[keyof typeof INTERNSHIP_STORAGE_KEYS];
