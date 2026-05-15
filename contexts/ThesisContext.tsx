"use client";
import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { loadFromStorage, saveToStorage, generateId, nowISO } from "@/lib/store";
import {
  seedParticipants,
  seedDesign,
  seedNotes,
  THESIS_STORE_KEYS,
  type ThesisParticipant,
  type ThesisDesign,
  type ThesisNote,
} from "@/lib/thesis-data";

interface ThesisContextType {
  participants: ThesisParticipant[];
  design: ThesisDesign;
  notes: ThesisNote[];
  reportSections: Record<string, string>;

  // Participants
  addParticipant: (data: Partial<ThesisParticipant>) => ThesisParticipant;
  updateParticipant: (id: string, data: Partial<ThesisParticipant>) => void;
  deleteParticipant: (id: string) => void;

  // Design
  updateDesign: (data: Partial<ThesisDesign>) => void;
  updateDesignArray: (key: keyof ThesisDesign, items: string[]) => void;

  // Notes
  addNote: (data: Partial<ThesisNote>) => ThesisNote;
  updateNote: (id: string, data: Partial<ThesisNote>) => void;
  deleteNote: (id: string) => void;

  // Report
  updateReportSection: (key: string, content: string) => void;

  // Computed
  completeParticipants: ThesisParticipant[];
  missingDataCount: number;
  groupCounts: Record<string, number>;
}

const ThesisContext = createContext<ThesisContextType | null>(null);

export function ThesisProvider({ children }: { children: ReactNode }) {
  const [participants, setParticipants] = useState<ThesisParticipant[]>([]);
  const [design, setDesign] = useState<ThesisDesign>(seedDesign);
  const [notes, setNotes] = useState<ThesisNote[]>([]);
  const [reportSections, setReportSections] = useState<Record<string, string>>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setParticipants(loadFromStorage(THESIS_STORE_KEYS.PARTICIPANTS, seedParticipants));
    setDesign(loadFromStorage(THESIS_STORE_KEYS.DESIGN, seedDesign));
    setNotes(loadFromStorage(THESIS_STORE_KEYS.NOTES, seedNotes));
    setReportSections(loadFromStorage(THESIS_STORE_KEYS.REPORT, {}));
    setReady(true);
  }, []);

  useEffect(() => { if (ready) saveToStorage(THESIS_STORE_KEYS.PARTICIPANTS, participants); }, [participants, ready]);
  useEffect(() => { if (ready) saveToStorage(THESIS_STORE_KEYS.DESIGN, design); }, [design, ready]);
  useEffect(() => { if (ready) saveToStorage(THESIS_STORE_KEYS.NOTES, notes); }, [notes, ready]);
  useEffect(() => { if (ready) saveToStorage(THESIS_STORE_KEYS.REPORT, reportSections); }, [reportSections, ready]);

  const addParticipant = useCallback((data: Partial<ThesisParticipant>): ThesisParticipant => {
    const next = participants.filter((p) => p.code.startsWith("P-")).length + 1;
    const p: ThesisParticipant = {
      id: generateId(),
      code: `P-${String(participants.length + 1).padStart(3, "0")}`,
      age: 0,
      gender: "Prefer not to say",
      group: "Control",
      depressionScore: null,
      anxietyScore: null,
      depersonalizationScore: null,
      derealizationScore: null,
      stressScore: null,
      emotionalRegulationScore: null,
      notes: "",
      hasMissingData: false,
      createdAt: nowISO(),
      ...data,
    };
    setParticipants((prev) => [...prev, p]);
    return p;
  }, [participants]);

  const updateParticipant = useCallback((id: string, data: Partial<ThesisParticipant>) => {
    setParticipants((prev) => prev.map((p) => p.id === id ? { ...p, ...data } : p));
  }, []);

  const deleteParticipant = useCallback((id: string) => {
    setParticipants((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const updateDesign = useCallback((data: Partial<ThesisDesign>) => {
    setDesign((prev) => ({ ...prev, ...data }));
  }, []);

  const updateDesignArray = useCallback((key: keyof ThesisDesign, items: string[]) => {
    setDesign((prev) => ({ ...prev, [key]: items }));
  }, []);

  const addNote = useCallback((data: Partial<ThesisNote>): ThesisNote => {
    const n: ThesisNote = {
      id: generateId(),
      title: "",
      content: "",
      category: "other",
      tags: [],
      linkedVariables: [],
      createdAt: nowISO(),
      updatedAt: nowISO(),
      ...data,
    };
    setNotes((prev) => [n, ...prev]);
    return n;
  }, []);

  const updateNote = useCallback((id: string, data: Partial<ThesisNote>) => {
    setNotes((prev) => prev.map((n) => n.id === id ? { ...n, ...data, updatedAt: nowISO() } : n));
  }, []);

  const deleteNote = useCallback((id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const updateReportSection = useCallback((key: string, content: string) => {
    setReportSections((prev) => ({ ...prev, [key]: content }));
  }, []);

  const completeParticipants = participants.filter((p) => !p.hasMissingData);
  const missingDataCount = participants.filter((p) => p.hasMissingData).length;
  const groupCounts = participants.reduce<Record<string, number>>((acc, p) => {
    acc[p.group] = (acc[p.group] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <ThesisContext.Provider value={{
      participants, design, notes, reportSections,
      addParticipant, updateParticipant, deleteParticipant,
      updateDesign, updateDesignArray,
      addNote, updateNote, deleteNote,
      updateReportSection,
      completeParticipants, missingDataCount, groupCounts,
    }}>
      {children}
    </ThesisContext.Provider>
  );
}

export function useThesis() {
  const ctx = useContext(ThesisContext);
  if (!ctx) throw new Error("useThesis must be used inside ThesisProvider");
  return ctx;
}
