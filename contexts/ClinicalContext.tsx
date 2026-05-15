"use client";
import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { loadFromStorage, saveToStorage, generateId, nowISO } from "@/lib/store";
import {
  seedReflections, seedPlans, seedInterventions, seedConsent,
  seedTerminology, CLINICAL_STORE_KEYS,
  type ClinicalReflection, type SessionPlan, type Intervention,
  type ConsentRecord, type AudioNote, type FormulationCanvas,
  type ClinicalTerm, type WorkbookSheet,
} from "@/lib/clinical-data";

interface ClinicalContextType {
  reflections: ClinicalReflection[];
  plans: SessionPlan[];
  interventions: Intervention[];
  consent: ConsentRecord[];
  audioNotes: AudioNote[];
  formulations: FormulationCanvas[];
  terminology: ClinicalTerm[];
  workbooks: WorkbookSheet[];

  // Reflections
  addReflection: (data: Partial<ClinicalReflection>) => ClinicalReflection;
  updateReflection: (id: string, data: Partial<ClinicalReflection>) => void;
  deleteReflection: (id: string) => void;

  // Plans
  addPlan: (data: Partial<SessionPlan>) => SessionPlan;
  updatePlan: (id: string, data: Partial<SessionPlan>) => void;
  deletePlan: (id: string) => void;

  // Interventions
  addIntervention: (data: Partial<Intervention>) => Intervention;
  updateIntervention: (id: string, data: Partial<Intervention>) => void;
  deleteIntervention: (id: string) => void;

  // Consent
  upsertConsent: (caseId: string, data: Partial<ConsentRecord>) => void;
  getConsent: (caseId: string) => ConsentRecord | undefined;

  // Audio notes
  addAudioNote: (data: Partial<AudioNote>) => AudioNote;
  updateAudioNote: (id: string, data: Partial<AudioNote>) => void;
  deleteAudioNote: (id: string) => void;

  // Formulations
  addFormulation: (data: Partial<FormulationCanvas>) => FormulationCanvas;
  updateFormulation: (id: string, data: Partial<FormulationCanvas>) => void;
  deleteFormulation: (id: string) => void;

  // Terminology
  toggleFavoriteTerm: (id: string) => void;
  addTerm: (data: Partial<ClinicalTerm>) => ClinicalTerm;
  updateTerm: (id: string, data: Partial<ClinicalTerm>) => void;
  deleteTerm: (id: string) => void;

  // Workbooks
  addWorkbook: (data: Partial<WorkbookSheet>) => WorkbookSheet;
  updateWorkbook: (id: string, data: Partial<WorkbookSheet>) => void;
  deleteWorkbook: (id: string) => void;
  toggleFavoriteWorkbook: (id: string) => void;
}

const ClinicalContext = createContext<ClinicalContextType | null>(null);

export function ClinicalProvider({ children }: { children: ReactNode }) {
  const [reflections, setReflections] = useState<ClinicalReflection[]>([]);
  const [plans, setPlans] = useState<SessionPlan[]>([]);
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [consent, setConsent] = useState<ConsentRecord[]>([]);
  const [audioNotes, setAudioNotes] = useState<AudioNote[]>([]);
  const [formulations, setFormulations] = useState<FormulationCanvas[]>([]);
  const [terminology, setTerminology] = useState<ClinicalTerm[]>([]);
  const [workbooks, setWorkbooks] = useState<WorkbookSheet[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReflections(loadFromStorage(CLINICAL_STORE_KEYS.REFLECTIONS, seedReflections));
    setPlans(loadFromStorage(CLINICAL_STORE_KEYS.PLANS, seedPlans));
    setInterventions(loadFromStorage(CLINICAL_STORE_KEYS.INTERVENTIONS, seedInterventions));
    setConsent(loadFromStorage(CLINICAL_STORE_KEYS.CONSENT, seedConsent));
    setAudioNotes(loadFromStorage(CLINICAL_STORE_KEYS.AUDIO_NOTES, []));
    setFormulations(loadFromStorage(CLINICAL_STORE_KEYS.FORMULATIONS, []));
    setTerminology(loadFromStorage(CLINICAL_STORE_KEYS.TERMINOLOGY, seedTerminology));
    setWorkbooks(loadFromStorage(CLINICAL_STORE_KEYS.WORKBOOKS, []));
    setReady(true);
  }, []);

  useEffect(() => { if (ready) saveToStorage(CLINICAL_STORE_KEYS.REFLECTIONS, reflections); }, [reflections, ready]);
  useEffect(() => { if (ready) saveToStorage(CLINICAL_STORE_KEYS.PLANS, plans); }, [plans, ready]);
  useEffect(() => { if (ready) saveToStorage(CLINICAL_STORE_KEYS.INTERVENTIONS, interventions); }, [interventions, ready]);
  useEffect(() => { if (ready) saveToStorage(CLINICAL_STORE_KEYS.CONSENT, consent); }, [consent, ready]);
  useEffect(() => { if (ready) saveToStorage(CLINICAL_STORE_KEYS.AUDIO_NOTES, audioNotes); }, [audioNotes, ready]);
  useEffect(() => { if (ready) saveToStorage(CLINICAL_STORE_KEYS.FORMULATIONS, formulations); }, [formulations, ready]);
  useEffect(() => { if (ready) saveToStorage(CLINICAL_STORE_KEYS.TERMINOLOGY, terminology); }, [terminology, ready]);
  useEffect(() => { if (ready) saveToStorage(CLINICAL_STORE_KEYS.WORKBOOKS, workbooks); }, [workbooks, ready]);

  const addReflection = useCallback((data: Partial<ClinicalReflection>): ClinicalReflection => {
    const r: ClinicalReflection = {
      id: generateId(), date: new Date().toISOString().split("T")[0],
      linkedCaseId: "", whatLearned: "", whatDifficult: "", countertransference: "",
      emotionalImpact: "", ethicalQuestions: "", supervisionTopics: "",
      skillsToImprove: "", nextAction: "", tags: [], atmosphereTags: [],
      isPrivate: false, createdAt: nowISO(), updatedAt: nowISO(), ...data,
    };
    setReflections((p) => [r, ...p]);
    return r;
  }, []);

  const updateReflection = useCallback((id: string, data: Partial<ClinicalReflection>) => {
    setReflections((p) => p.map((r) => r.id === id ? { ...r, ...data, updatedAt: nowISO() } : r));
  }, []);

  const deleteReflection = useCallback((id: string) => {
    setReflections((p) => p.filter((r) => r.id !== id));
  }, []);

  const addPlan = useCallback((data: Partial<SessionPlan>): SessionPlan => {
    const p: SessionPlan = {
      id: generateId(), caseId: "", date: new Date().toISOString().split("T")[0],
      time: "", goals: [], questionsToAsk: [], toolsToUse: [], interventionToTry: [],
      followUpFromLast: "", supervisorInstructions: "", riskReminders: "",
      materialsNeeded: [], worksheetsToGive: [], atmosphereTags: [],
      status: "planned", postSessionNotes: "", createdAt: nowISO(), ...data,
    };
    setPlans((prev) => [p, ...prev]);
    return p;
  }, []);

  const updatePlan = useCallback((id: string, data: Partial<SessionPlan>) => {
    setPlans((p) => p.map((plan) => plan.id === id ? { ...plan, ...data } : plan));
  }, []);

  const deletePlan = useCallback((id: string) => {
    setPlans((p) => p.filter((plan) => plan.id !== id));
  }, []);

  const addIntervention = useCallback((data: Partial<Intervention>): Intervention => {
    const i: Intervention = {
      id: generateId(), name: "", category: "Custom", caseId: "",
      date: new Date().toISOString().split("T")[0], goalTargeted: "",
      response: "", effectiveness: 3, followUpNeeded: false,
      atmosphereTags: [], notes: "", createdAt: nowISO(), ...data,
    };
    setInterventions((p) => [i, ...p]);
    return i;
  }, []);

  const updateIntervention = useCallback((id: string, data: Partial<Intervention>) => {
    setInterventions((p) => p.map((i) => i.id === id ? { ...i, ...data } : i));
  }, []);

  const deleteIntervention = useCallback((id: string) => {
    setInterventions((p) => p.filter((i) => i.id !== id));
  }, []);

  const upsertConsent = useCallback((caseId: string, data: Partial<ConsentRecord>) => {
    setConsent((p) => {
      const existing = p.find((c) => c.caseId === caseId);
      if (existing) return p.map((c) => c.caseId === caseId ? { ...c, ...data } : c);
      const newRecord: ConsentRecord = {
        id: generateId(), caseId, consentGiven: false, consentDate: "",
        anonymizationComplete: false, dataProtectionChecked: false,
        supervisorApproved: false, informationSheetGiven: false,
        withdrawalRightExplained: false, ethicsApprovalRef: "",
        notes: "", createdAt: nowISO(), ...data,
      };
      return [...p, newRecord];
    });
  }, []);

  const getConsent = useCallback((caseId: string) => {
    return consent.find((c) => c.caseId === caseId);
  }, [consent]);

  const addAudioNote = useCallback((data: Partial<AudioNote>): AudioNote => {
    const n: AudioNote = {
      id: generateId(), name: "Voice note", durationSeconds: 0, transcript: "",
      linkedType: "general", linkedId: "", tags: [], isFavorite: false, createdAt: nowISO(), ...data,
    };
    setAudioNotes((p) => [n, ...p]);
    return n;
  }, []);

  const updateAudioNote = useCallback((id: string, data: Partial<AudioNote>) => {
    setAudioNotes((p) => p.map((n) => n.id === id ? { ...n, ...data } : n));
  }, []);

  const deleteAudioNote = useCallback((id: string) => {
    setAudioNotes((p) => p.filter((n) => n.id !== id));
  }, []);

  const addFormulation = useCallback((data: Partial<FormulationCanvas>): FormulationCanvas => {
    const f: FormulationCanvas = {
      id: generateId(), caseId: "", model: "5ps", title: "New Formulation",
      sections: {}, createdAt: nowISO(), updatedAt: nowISO(), ...data,
    };
    setFormulations((p) => [f, ...p]);
    return f;
  }, []);

  const updateFormulation = useCallback((id: string, data: Partial<FormulationCanvas>) => {
    setFormulations((p) => p.map((f) => f.id === id ? { ...f, ...data, updatedAt: nowISO() } : f));
  }, []);

  const deleteFormulation = useCallback((id: string) => {
    setFormulations((p) => p.filter((f) => f.id !== id));
  }, []);

  const toggleFavoriteTerm = useCallback((id: string) => {
    setTerminology((p) => p.map((t) => t.id === id ? { ...t, isFavorite: !t.isFavorite } : t));
  }, []);

  const addTerm = useCallback((data: Partial<ClinicalTerm>): ClinicalTerm => {
    const t: ClinicalTerm = {
      id: generateId(), english: "", french: "", arabic: "", definition: "",
      synonyms: [], relatedConcepts: [], clinicalNoteExample: "",
      reportExample: "", reportPhrasing: "", tags: [], dsmReference: "", isFavorite: false, ...data,
    };
    setTerminology((p) => [t, ...p]);
    return t;
  }, []);

  const updateTerm = useCallback((id: string, data: Partial<ClinicalTerm>) => {
    setTerminology((p) => p.map((t) => t.id === id ? { ...t, ...data } : t));
  }, []);

  const deleteTerm = useCallback((id: string) => {
    setTerminology((p) => p.filter((t) => t.id !== id));
  }, []);

  const addWorkbook = useCallback((data: Partial<WorkbookSheet>): WorkbookSheet => {
    const w: WorkbookSheet = {
      id: generateId(), title: "New Worksheet", category: "Custom", format: "Exercise Worksheet",
      language: "en", ageGroup: "adult", difficulty: "intermediate",
      caseId: "", caseCode: "", content: {
        subtitle: "", introduction: "", instructions: "", exerciseBody: "",
        reflections: [], practiceSection: "", footerNote: "",
      },
      therapistNote: "", isFavorite: false, isPrinted: false, createdAt: nowISO(), ...data,
    };
    setWorkbooks((p) => [w, ...p]);
    return w;
  }, []);

  const updateWorkbook = useCallback((id: string, data: Partial<WorkbookSheet>) => {
    setWorkbooks((p) => p.map((w) => w.id === id ? { ...w, ...data } : w));
  }, []);

  const deleteWorkbook = useCallback((id: string) => {
    setWorkbooks((p) => p.filter((w) => w.id !== id));
  }, []);

  const toggleFavoriteWorkbook = useCallback((id: string) => {
    setWorkbooks((p) => p.map((w) => w.id === id ? { ...w, isFavorite: !w.isFavorite } : w));
  }, []);

  return (
    <ClinicalContext.Provider value={{
      reflections, plans, interventions, consent, audioNotes,
      formulations, terminology, workbooks,
      addReflection, updateReflection, deleteReflection,
      addPlan, updatePlan, deletePlan,
      addIntervention, updateIntervention, deleteIntervention,
      upsertConsent, getConsent,
      addAudioNote, updateAudioNote, deleteAudioNote,
      addFormulation, updateFormulation, deleteFormulation,
      toggleFavoriteTerm, addTerm, updateTerm, deleteTerm,
      addWorkbook, updateWorkbook, deleteWorkbook, toggleFavoriteWorkbook,
    }}>
      {children}
    </ClinicalContext.Provider>
  );
}

export function useClinical() {
  const ctx = useContext(ClinicalContext);
  if (!ctx) throw new Error("useClinical must be used inside ClinicalProvider");
  return ctx;
}
