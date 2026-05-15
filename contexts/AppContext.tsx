"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import {
  loadFromStorage,
  saveToStorage,
  generateId,
  nowISO,
  STORE_KEYS,
} from "@/lib/store";
import {
  mockCases,
  mockDailyCheckIns,
  mockWeeklyReviews,
  mockMonthlyReviews,
  mockAssessments,
  mockSupervisionNotes,
  mockSessions,
  mockResearchParticipants,
  seedGoals,
  seedTranscripts,
  type PsychCase,
  type DailyCheckIn,
  type WeeklyReview,
  type MonthlyReview,
  type Assessment,
  type SupervisionNote,
  type Session,
  type ResearchParticipant,
  type Goal,
  type Transcript,
  type UploadedFile,
} from "@/lib/mock-data";

// ── Extended types with CRUD metadata ────────────────────────

export type CaseWithMeta = PsychCase & {
  isArchived?: boolean;
  isPinned?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type CheckInWithMeta = DailyCheckIn & {
  isArchived?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type WeeklyWithMeta = WeeklyReview & {
  isArchived?: boolean;
  createdAt?: string;
};

export type MonthlyWithMeta = MonthlyReview & {
  isArchived?: boolean;
  createdAt?: string;
};

export type AssessmentWithMeta = Assessment & {
  caseId?: string;
  isArchived?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type SupervisionWithMeta = SupervisionNote & {
  isArchived?: boolean;
  createdAt?: string;
};

export type SessionWithMeta = Session & {
  isArchived?: boolean;
};

// ── Context type ──────────────────────────────────────────────

interface AppContextType {
  // Data
  cases: CaseWithMeta[];
  checkIns: CheckInWithMeta[];
  weeklyReviews: WeeklyWithMeta[];
  monthlyReviews: MonthlyWithMeta[];
  assessments: AssessmentWithMeta[];
  supervisionNotes: SupervisionWithMeta[];
  sessions: SessionWithMeta[];
  goals: Goal[];
  transcripts: Transcript[];
  files: UploadedFile[];
  participants: ResearchParticipant[];
  pinnedCaseIds: string[];

  // Cases CRUD
  createCase: (data: Partial<CaseWithMeta>) => CaseWithMeta;
  updateCase: (id: string, data: Partial<CaseWithMeta>) => void;
  deleteCase: (id: string) => void;
  archiveCase: (id: string) => void;
  restoreCase: (id: string) => void;
  duplicateCase: (id: string) => CaseWithMeta | null;
  togglePinCase: (id: string) => void;

  // Check-ins CRUD
  createCheckIn: (data: Partial<CheckInWithMeta>) => CheckInWithMeta;
  updateCheckIn: (id: string, data: Partial<CheckInWithMeta>) => void;
  deleteCheckIn: (id: string) => void;
  archiveCheckIn: (id: string) => void;

  // Weekly reviews CRUD
  createWeekly: (data: Partial<WeeklyWithMeta>) => WeeklyWithMeta;
  updateWeekly: (id: string, data: Partial<WeeklyWithMeta>) => void;
  deleteWeekly: (id: string) => void;

  // Monthly reviews CRUD
  createMonthly: (data: Partial<MonthlyWithMeta>) => MonthlyWithMeta;
  updateMonthly: (id: string, data: Partial<MonthlyWithMeta>) => void;
  deleteMonthly: (id: string) => void;

  // Supervision CRUD
  createSupervision: (data: Partial<SupervisionWithMeta>) => SupervisionWithMeta;
  updateSupervision: (id: string, data: Partial<SupervisionWithMeta>) => void;
  deleteSupervision: (id: string) => void;

  // Goals CRUD
  createGoal: (data: Partial<Goal>) => Goal;
  updateGoal: (id: string, data: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  archiveGoal: (id: string) => void;
  restoreGoal: (id: string) => void;

  // Transcripts CRUD
  createTranscript: (data: Partial<Transcript>) => Transcript;
  updateTranscript: (id: string, data: Partial<Transcript>) => void;
  deleteTranscript: (id: string) => void;
  archiveTranscript: (id: string) => void;

  // Files CRUD
  addFile: (data: Partial<UploadedFile>) => UploadedFile;
  removeFile: (id: string) => void;
  renameFile: (id: string, name: string) => void;

  // Participants CRUD
  createParticipant: (data: Partial<ResearchParticipant>) => ResearchParticipant;
  updateParticipant: (id: string, data: Partial<ResearchParticipant>) => void;
  deleteParticipant: (id: string) => void;

  // Computed
  activeCases: CaseWithMeta[];
  getCase: (id: string) => CaseWithMeta | undefined;
  getCaseCheckIns: (caseId: string) => CheckInWithMeta[];
  getCaseWeekly: (caseId: string) => WeeklyWithMeta[];
  getCaseMonthly: (caseId: string) => MonthlyWithMeta[];
  getCaseSessions: (caseId: string) => SessionWithMeta[];
  getCaseSupervision: (caseId: string) => SupervisionWithMeta[];
  getCaseGoals: (caseId: string) => Goal[];
  getCaseTranscripts: (caseId: string) => Transcript[];
  getCaseFiles: (caseId: string) => UploadedFile[];
}

const AppContext = createContext<AppContextType | null>(null);

// ── Helper to seed with meta ──────────────────────────────────

function withMeta<T extends { id: string }>(items: T[]): (T & { isArchived?: boolean; createdAt?: string; updatedAt?: string }) [] {
  return items.map((item) => ({
    ...item,
    isArchived: false,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-05-01T00:00:00Z",
  }));
}

// ── Provider ──────────────────────────────────────────────────

export function AppProvider({ children }: { children: ReactNode }) {
  const [cases, setCases] = useState<CaseWithMeta[]>([]);
  const [checkIns, setCheckIns] = useState<CheckInWithMeta[]>([]);
  const [weeklyReviews, setWeeklyReviews] = useState<WeeklyWithMeta[]>([]);
  const [monthlyReviews, setMonthlyReviews] = useState<MonthlyWithMeta[]>([]);
  const [assessments, setAssessments] = useState<AssessmentWithMeta[]>([]);
  const [supervisionNotes, setSupervisionNotes] = useState<SupervisionWithMeta[]>([]);
  const [sessions, setSessions] = useState<SessionWithMeta[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [participants, setParticipants] = useState<ResearchParticipant[]>([]);
  const [pinnedCaseIds, setPinnedCaseIds] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    setCases(loadFromStorage(STORE_KEYS.CASES, withMeta(mockCases)));
    setCheckIns(loadFromStorage(STORE_KEYS.CHECKINS, withMeta(mockDailyCheckIns)));
    setWeeklyReviews(loadFromStorage(STORE_KEYS.WEEKLY, withMeta(mockWeeklyReviews)));
    setMonthlyReviews(loadFromStorage(STORE_KEYS.MONTHLY, withMeta(mockMonthlyReviews)));
    setAssessments(loadFromStorage(STORE_KEYS.ASSESSMENTS, withMeta(mockAssessments)));
    setSupervisionNotes(loadFromStorage(STORE_KEYS.SUPERVISION, withMeta(mockSupervisionNotes)));
    setSessions(loadFromStorage(STORE_KEYS.SESSIONS, withMeta(mockSessions)));
    setGoals(loadFromStorage(STORE_KEYS.GOALS, seedGoals));
    setTranscripts(loadFromStorage(STORE_KEYS.TRANSCRIPTS, seedTranscripts));
    setFiles(loadFromStorage(STORE_KEYS.FILES, []));
    setParticipants(loadFromStorage("psych-participants-v2", mockResearchParticipants));
    setPinnedCaseIds(loadFromStorage(STORE_KEYS.PINNED, []));
    setReady(true);
  }, []);

  // Persist to localStorage whenever state changes
  useEffect(() => { if (ready) saveToStorage(STORE_KEYS.CASES, cases); }, [cases, ready]);
  useEffect(() => { if (ready) saveToStorage(STORE_KEYS.CHECKINS, checkIns); }, [checkIns, ready]);
  useEffect(() => { if (ready) saveToStorage(STORE_KEYS.WEEKLY, weeklyReviews); }, [weeklyReviews, ready]);
  useEffect(() => { if (ready) saveToStorage(STORE_KEYS.MONTHLY, monthlyReviews); }, [monthlyReviews, ready]);
  useEffect(() => { if (ready) saveToStorage(STORE_KEYS.ASSESSMENTS, assessments); }, [assessments, ready]);
  useEffect(() => { if (ready) saveToStorage(STORE_KEYS.SUPERVISION, supervisionNotes); }, [supervisionNotes, ready]);
  useEffect(() => { if (ready) saveToStorage(STORE_KEYS.SESSIONS, sessions); }, [sessions, ready]);
  useEffect(() => { if (ready) saveToStorage(STORE_KEYS.GOALS, goals); }, [goals, ready]);
  useEffect(() => { if (ready) saveToStorage(STORE_KEYS.TRANSCRIPTS, transcripts); }, [transcripts, ready]);
  useEffect(() => { if (ready) saveToStorage(STORE_KEYS.FILES, files); }, [files, ready]);
  useEffect(() => { if (ready) saveToStorage("psych-participants-v2", participants); }, [participants, ready]);
  useEffect(() => { if (ready) saveToStorage(STORE_KEYS.PINNED, pinnedCaseIds); }, [pinnedCaseIds, ready]);

  // ── Cases ──

  const createCase = useCallback((data: Partial<CaseWithMeta>): CaseWithMeta => {
    const item: CaseWithMeta = {
      id: generateId(),
      code: data.code || `CASE-${Date.now().toString().slice(-4)}`,
      type: data.type || "Clinical Case",
      status: data.status || "Active",
      age: data.age || "",
      gender: data.gender || "",
      context: data.context || "",
      presentingConcerns: data.presentingConcerns || "",
      currentGoals: data.currentGoals || [],
      keyObservations: data.keyObservations || "",
      latestSummary: data.latestSummary || "",
      lastCheckIn: data.lastCheckIn || new Date().toISOString().split("T")[0],
      nextReportDue: data.nextReportDue || "",
      tags: data.tags || [],
      shortNote: data.shortNote || "",
      alerts: data.alerts || [],
      startDate: data.startDate || new Date().toISOString().split("T")[0],
      supervisor: data.supervisor || "",
      institution: data.institution || "",
      isArchived: false,
      isPinned: false,
      createdAt: nowISO(),
      updatedAt: nowISO(),
    };
    setCases((prev) => [item, ...prev]);
    return item;
  }, []);

  const updateCase = useCallback((id: string, data: Partial<CaseWithMeta>) => {
    setCases((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...data, updatedAt: nowISO() } : c))
    );
  }, []);

  const deleteCase = useCallback((id: string) => {
    setCases((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const archiveCase = useCallback((id: string) => {
    setCases((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isArchived: true, updatedAt: nowISO() } : c))
    );
  }, []);

  const restoreCase = useCallback((id: string) => {
    setCases((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isArchived: false, updatedAt: nowISO() } : c))
    );
  }, []);

  const duplicateCase = useCallback(
    (id: string): CaseWithMeta | null => {
      const source = cases.find((c) => c.id === id);
      if (!source) return null;
      const dupe: CaseWithMeta = {
        ...source,
        id: generateId(),
        code: `${source.code}-COPY`,
        isArchived: false,
        createdAt: nowISO(),
        updatedAt: nowISO(),
      };
      setCases((prev) => [dupe, ...prev]);
      return dupe;
    },
    [cases]
  );

  const togglePinCase = useCallback((id: string) => {
    setPinnedCaseIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [id, ...prev]
    );
  }, []);

  // ── Check-ins ──

  const createCheckIn = useCallback((data: Partial<CheckInWithMeta>): CheckInWithMeta => {
    const item: CheckInWithMeta = {
      id: generateId(),
      caseId: data.caseId || "",
      date: data.date || new Date().toISOString().split("T")[0],
      contextType: data.contextType || "",
      moodAffect: data.moodAffect || "",
      behaviorObservations: data.behaviorObservations || "",
      communicationObservations: data.communicationObservations || "",
      cognitiveObservations: data.cognitiveObservations || "",
      emotionalRegulation: data.emotionalRegulation || "",
      socialInteraction: data.socialInteraction || "",
      sensoryObservations: data.sensoryObservations || "",
      interventionUsed: data.interventionUsed || "",
      responseToIntervention: data.responseToIntervention || "",
      freeNotes: data.freeNotes || "",
      followUpNeeded: data.followUpNeeded ?? false,
      followUpNote: data.followUpNote,
      isArchived: false,
      createdAt: nowISO(),
      updatedAt: nowISO(),
    };
    setCheckIns((prev) => [item, ...prev]);
    return item;
  }, []);

  const updateCheckIn = useCallback((id: string, data: Partial<CheckInWithMeta>) => {
    setCheckIns((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...data, updatedAt: nowISO() } : c))
    );
  }, []);

  const deleteCheckIn = useCallback((id: string) => {
    setCheckIns((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const archiveCheckIn = useCallback((id: string) => {
    setCheckIns((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isArchived: true } : c))
    );
  }, []);

  // ── Weekly reviews ──

  const createWeekly = useCallback((data: Partial<WeeklyWithMeta>): WeeklyWithMeta => {
    const item: WeeklyWithMeta = {
      id: generateId(),
      caseId: data.caseId || "",
      weekStart: data.weekStart || "",
      weekEnd: data.weekEnd || "",
      mainProgress: data.mainProgress || "",
      mainDifficulties: data.mainDifficulties || "",
      repeatedPatterns: data.repeatedPatterns || "",
      effectiveInterventions: data.effectiveInterventions || "",
      concerns: data.concerns || "",
      goalsNextWeek: data.goalsNextWeek || "",
      questionsForSupervision: data.questionsForSupervision || "",
      isArchived: false,
      createdAt: nowISO(),
    };
    setWeeklyReviews((prev) => [item, ...prev]);
    return item;
  }, []);

  const updateWeekly = useCallback((id: string, data: Partial<WeeklyWithMeta>) => {
    setWeeklyReviews((prev) => prev.map((w) => (w.id === id ? { ...w, ...data } : w)));
  }, []);

  const deleteWeekly = useCallback((id: string) => {
    setWeeklyReviews((prev) => prev.filter((w) => w.id !== id));
  }, []);

  // ── Monthly reviews ──

  const createMonthly = useCallback((data: Partial<MonthlyWithMeta>): MonthlyWithMeta => {
    const item: MonthlyWithMeta = {
      id: generateId(),
      caseId: data.caseId || "",
      month: data.month || "",
      overallEvolution: data.overallEvolution || "",
      assessmentChanges: data.assessmentChanges || "",
      clinicalObservations: data.clinicalObservations || "",
      supervisionPoints: data.supervisionPoints || "",
      recommendations: data.recommendations || "",
      nextMonthObjectives: data.nextMonthObjectives || "",
      isArchived: false,
      createdAt: nowISO(),
    };
    setMonthlyReviews((prev) => [item, ...prev]);
    return item;
  }, []);

  const updateMonthly = useCallback((id: string, data: Partial<MonthlyWithMeta>) => {
    setMonthlyReviews((prev) => prev.map((m) => (m.id === id ? { ...m, ...data } : m)));
  }, []);

  const deleteMonthly = useCallback((id: string) => {
    setMonthlyReviews((prev) => prev.filter((m) => m.id !== id));
  }, []);

  // ── Supervision ──

  const createSupervision = useCallback((data: Partial<SupervisionWithMeta>): SupervisionWithMeta => {
    const item: SupervisionWithMeta = {
      id: generateId(),
      caseId: data.caseId || "",
      date: data.date || new Date().toISOString().split("T")[0],
      supervisorName: data.supervisorName || "",
      mainTopics: data.mainTopics || "",
      ethicalConcerns: data.ethicalConcerns || "",
      clinicalReflection: data.clinicalReflection || "",
      feedbackReceived: data.feedbackReceived || "",
      actionPlan: data.actionPlan || "",
      questionsRaised: data.questionsRaised || "",
      isArchived: false,
      createdAt: nowISO(),
    };
    setSupervisionNotes((prev) => [item, ...prev]);
    return item;
  }, []);

  const updateSupervision = useCallback((id: string, data: Partial<SupervisionWithMeta>) => {
    setSupervisionNotes((prev) => prev.map((s) => (s.id === id ? { ...s, ...data } : s)));
  }, []);

  const deleteSupervision = useCallback((id: string) => {
    setSupervisionNotes((prev) => prev.filter((s) => s.id !== id));
  }, []);

  // ── Goals ──

  const createGoal = useCallback((data: Partial<Goal>): Goal => {
    const item: Goal = {
      id: generateId(),
      caseId: data.caseId,
      title: data.title || "",
      category: data.category || "therapeutic",
      description: data.description || "",
      status: data.status || "not-started",
      priority: data.priority || "medium",
      progress: data.progress ?? 0,
      milestones: data.milestones || [],
      tags: data.tags || [],
      createdAt: nowISO(),
      updatedAt: nowISO(),
      isArchived: false,
    };
    setGoals((prev) => [item, ...prev]);
    return item;
  }, []);

  const updateGoal = useCallback((id: string, data: Partial<Goal>) => {
    setGoals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, ...data, updatedAt: nowISO() } : g))
    );
  }, []);

  const deleteGoal = useCallback((id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
  }, []);

  const archiveGoal = useCallback((id: string) => {
    setGoals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, isArchived: true, updatedAt: nowISO() } : g))
    );
  }, []);

  const restoreGoal = useCallback((id: string) => {
    setGoals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, isArchived: false, updatedAt: nowISO() } : g))
    );
  }, []);

  // ── Transcripts ──

  const createTranscript = useCallback((data: Partial<Transcript>): Transcript => {
    const item: Transcript = {
      id: generateId(),
      caseId: data.caseId,
      title: data.title || "Untitled Transcript",
      content: data.content || "",
      annotations: data.annotations || [],
      tags: data.tags || [],
      importantMoments: data.importantMoments || [],
      createdAt: nowISO(),
      updatedAt: nowISO(),
      isArchived: false,
    };
    setTranscripts((prev) => [item, ...prev]);
    return item;
  }, []);

  const updateTranscript = useCallback((id: string, data: Partial<Transcript>) => {
    setTranscripts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...data, updatedAt: nowISO() } : t))
    );
  }, []);

  const deleteTranscript = useCallback((id: string) => {
    setTranscripts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const archiveTranscript = useCallback((id: string) => {
    setTranscripts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isArchived: true } : t))
    );
  }, []);

  // ── Files ──

  const addFile = useCallback((data: Partial<UploadedFile>): UploadedFile => {
    const item: UploadedFile = {
      id: generateId(),
      caseId: data.caseId,
      name: data.name || "file",
      type: data.type || "application/octet-stream",
      size: data.size || 0,
      category: data.category || "other",
      uploadedAt: nowISO(),
      isArchived: false,
    };
    setFiles((prev) => [item, ...prev]);
    return item;
  }, []);

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const renameFile = useCallback((id: string, name: string) => {
    setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, name } : f)));
  }, []);

  // ── Participants ──

  const createParticipant = useCallback((data: Partial<ResearchParticipant>): ResearchParticipant => {
    const item: ResearchParticipant = {
      id: generateId(),
      code: data.code || `RES-${Date.now().toString().slice(-3)}`,
      studyTitle: data.studyTitle || "",
      status: data.status || "Active",
      interviewDate: data.interviewDate || new Date().toISOString().split("T")[0],
      keyThemes: data.keyThemes || [],
      memos: data.memos || "",
      codingStatus: data.codingStatus || "Not started",
    };
    setParticipants((prev) => [item, ...prev]);
    return item;
  }, []);

  const updateParticipant = useCallback((id: string, data: Partial<ResearchParticipant>) => {
    setParticipants((prev) => prev.map((p) => (p.id === id ? { ...p, ...data } : p)));
  }, []);

  const deleteParticipant = useCallback((id: string) => {
    setParticipants((prev) => prev.filter((p) => p.id !== id));
  }, []);

  // ── Computed values ──

  const activeCases = useMemo(
    () => cases.filter((c) => !c.isArchived && c.status === "Active"),
    [cases]
  );

  const getCase = useCallback(
    (id: string) => cases.find((c) => c.id === id || c.code.toLowerCase() === id.toLowerCase()),
    [cases]
  );

  const getCaseCheckIns = useCallback(
    (caseId: string) => checkIns.filter((c) => c.caseId === caseId && !c.isArchived),
    [checkIns]
  );

  const getCaseWeekly = useCallback(
    (caseId: string) => weeklyReviews.filter((w) => w.caseId === caseId && !w.isArchived),
    [weeklyReviews]
  );

  const getCaseMonthly = useCallback(
    (caseId: string) => monthlyReviews.filter((m) => m.caseId === caseId && !m.isArchived),
    [monthlyReviews]
  );

  const getCaseSessions = useCallback(
    (caseId: string) => sessions.filter((s) => s.caseId === caseId && !s.isArchived),
    [sessions]
  );

  const getCaseSupervision = useCallback(
    (caseId: string) => supervisionNotes.filter((s) => s.caseId === caseId && !s.isArchived),
    [supervisionNotes]
  );

  const getCaseGoals = useCallback(
    (caseId: string) => goals.filter((g) => g.caseId === caseId && !g.isArchived),
    [goals]
  );

  const getCaseTranscripts = useCallback(
    (caseId: string) => transcripts.filter((t) => t.caseId === caseId && !t.isArchived),
    [transcripts]
  );

  const getCaseFiles = useCallback(
    (caseId: string) => files.filter((f) => f.caseId === caseId && !f.isArchived),
    [files]
  );

  const value: AppContextType = {
    cases,
    checkIns,
    weeklyReviews,
    monthlyReviews,
    assessments,
    supervisionNotes,
    sessions,
    goals,
    transcripts,
    files,
    participants,
    pinnedCaseIds,
    createCase,
    updateCase,
    deleteCase,
    archiveCase,
    restoreCase,
    duplicateCase,
    togglePinCase,
    createCheckIn,
    updateCheckIn,
    deleteCheckIn,
    archiveCheckIn,
    createWeekly,
    updateWeekly,
    deleteWeekly,
    createMonthly,
    updateMonthly,
    deleteMonthly,
    createSupervision,
    updateSupervision,
    deleteSupervision,
    createGoal,
    updateGoal,
    deleteGoal,
    archiveGoal,
    restoreGoal,
    createTranscript,
    updateTranscript,
    deleteTranscript,
    archiveTranscript,
    addFile,
    removeFile,
    renameFile,
    createParticipant,
    updateParticipant,
    deleteParticipant,
    activeCases,
    getCase,
    getCaseCheckIns,
    getCaseWeekly,
    getCaseMonthly,
    getCaseSessions,
    getCaseSupervision,
    getCaseGoals,
    getCaseTranscripts,
    getCaseFiles,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
