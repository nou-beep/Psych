"use client";
// SeanceContext — React wrapper over the pure séance store
// (lib/internship/seance.ts). Continuous persistence: every change
// autosaves to localStorage through a useEffect — no explicit Save
// button in the workspace.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  addFollowUp,
  addHomework,
  addSeance,
  addSeanceNote,
  archiveSeance,
  clearSeanceObservation,
  finaliseSeance,
  loadSeances,
  newSeance,
  patchSeance,
  removeFollowUp,
  removeHomework,
  removeSeanceNote,
  reopenSeance,
  restoreSeance,
  saveSeances,
  setSeanceObservation,
  toggleFollowUp,
  toggleHomework,
  toggleLinkedAssessment,
  toggleLinkedWorksheet,
  type Seance,
  type SeanceContext as SeanceCtx,
  type SeanceNoteType,
  type SeanceObservationCategory,
} from "@/lib/internship/seance";

interface SeanceContextValue {
  seances: Seance[];
  ready: boolean;
  create: (input: {
    dossierId: string;
    date?: string;
    context?: SeanceCtx;
  }) => Seance;
  patch: (
    id: string,
    patch: Partial<Pick<Seance, "date" | "status" | "nextAppointment">>
  ) => void;
  finalise: (id: string) => void;
  reopen: (id: string) => void;
  archive: (id: string) => void;
  restore: (id: string) => void;
  addNote: (
    seanceId: string,
    input: { type: SeanceNoteType; text: string }
  ) => void;
  removeNote: (seanceId: string, noteId: string) => void;
  setObservation: (
    seanceId: string,
    input: {
      category: SeanceObservationCategory;
      value: string;
      note?: string;
    }
  ) => void;
  clearObservation: (
    seanceId: string,
    category: SeanceObservationCategory
  ) => void;
  addHomeworkItem: (seanceId: string, text: string) => void;
  toggleHomeworkItem: (seanceId: string, todoId: string) => void;
  removeHomeworkItem: (seanceId: string, todoId: string) => void;
  addFollowUpItem: (seanceId: string, text: string) => void;
  toggleFollowUpItem: (seanceId: string, todoId: string) => void;
  removeFollowUpItem: (seanceId: string, todoId: string) => void;
  toggleAssessmentLink: (seanceId: string, assessmentId: string) => void;
  toggleWorksheetLink: (seanceId: string, worksheetId: string) => void;
}

const SeanceReactContext = createContext<SeanceContextValue | null>(null);

export function SeanceProvider({ children }: { children: ReactNode }) {
  const [seances, setSeances] = useState<Seance[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setSeances(loadSeances());
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) saveSeances(seances);
  }, [seances, ready]);

  const create = useCallback(
    (input: { dossierId: string; date?: string; context?: SeanceCtx }) => {
      const s = newSeance(input);
      setSeances((prev) => addSeance(prev, s));
      return s;
    },
    []
  );

  const patch = useCallback(
    (
      id: string,
      p: Partial<Pick<Seance, "date" | "status" | "nextAppointment">>
    ) => setSeances((prev) => patchSeance(prev, id, p)),
    []
  );

  const finalise = useCallback(
    (id: string) => setSeances((prev) => finaliseSeance(prev, id)),
    []
  );
  const reopen = useCallback(
    (id: string) => setSeances((prev) => reopenSeance(prev, id)),
    []
  );
  const archive = useCallback(
    (id: string) => setSeances((prev) => archiveSeance(prev, id)),
    []
  );
  const restore = useCallback(
    (id: string) => setSeances((prev) => restoreSeance(prev, id)),
    []
  );

  const addNote = useCallback(
    (seanceId: string, input: { type: SeanceNoteType; text: string }) =>
      setSeances((prev) => addSeanceNote(prev, seanceId, input)),
    []
  );
  const removeNote = useCallback(
    (seanceId: string, noteId: string) =>
      setSeances((prev) => removeSeanceNote(prev, seanceId, noteId)),
    []
  );

  const setObservation = useCallback(
    (
      seanceId: string,
      input: {
        category: SeanceObservationCategory;
        value: string;
        note?: string;
      }
    ) => setSeances((prev) => setSeanceObservation(prev, seanceId, input)),
    []
  );
  const clearObservation = useCallback(
    (seanceId: string, category: SeanceObservationCategory) =>
      setSeances((prev) =>
        clearSeanceObservation(prev, seanceId, category)
      ),
    []
  );

  const addHomeworkItem = useCallback(
    (seanceId: string, text: string) =>
      setSeances((prev) => addHomework(prev, seanceId, text)),
    []
  );
  const toggleHomeworkItem = useCallback(
    (seanceId: string, todoId: string) =>
      setSeances((prev) => toggleHomework(prev, seanceId, todoId)),
    []
  );
  const removeHomeworkItem = useCallback(
    (seanceId: string, todoId: string) =>
      setSeances((prev) => removeHomework(prev, seanceId, todoId)),
    []
  );
  const addFollowUpItem = useCallback(
    (seanceId: string, text: string) =>
      setSeances((prev) => addFollowUp(prev, seanceId, text)),
    []
  );
  const toggleFollowUpItem = useCallback(
    (seanceId: string, todoId: string) =>
      setSeances((prev) => toggleFollowUp(prev, seanceId, todoId)),
    []
  );
  const removeFollowUpItem = useCallback(
    (seanceId: string, todoId: string) =>
      setSeances((prev) => removeFollowUp(prev, seanceId, todoId)),
    []
  );

  const toggleAssessmentLink = useCallback(
    (seanceId: string, assessmentId: string) =>
      setSeances((prev) =>
        toggleLinkedAssessment(prev, seanceId, assessmentId)
      ),
    []
  );
  const toggleWorksheetLink = useCallback(
    (seanceId: string, worksheetId: string) =>
      setSeances((prev) =>
        toggleLinkedWorksheet(prev, seanceId, worksheetId)
      ),
    []
  );

  const value = useMemo<SeanceContextValue>(
    () => ({
      seances,
      ready,
      create,
      patch,
      finalise,
      reopen,
      archive,
      restore,
      addNote,
      removeNote,
      setObservation,
      clearObservation,
      addHomeworkItem,
      toggleHomeworkItem,
      removeHomeworkItem,
      addFollowUpItem,
      toggleFollowUpItem,
      removeFollowUpItem,
      toggleAssessmentLink,
      toggleWorksheetLink,
    }),
    [
      seances,
      ready,
      create,
      patch,
      finalise,
      reopen,
      archive,
      restore,
      addNote,
      removeNote,
      setObservation,
      clearObservation,
      addHomeworkItem,
      toggleHomeworkItem,
      removeHomeworkItem,
      addFollowUpItem,
      toggleFollowUpItem,
      removeFollowUpItem,
      toggleAssessmentLink,
      toggleWorksheetLink,
    ]
  );

  return (
    <SeanceReactContext.Provider value={value}>
      {children}
    </SeanceReactContext.Provider>
  );
}

export function useSeances(): SeanceContextValue {
  const ctx = useContext(SeanceReactContext);
  if (!ctx) throw new Error("useSeances must be used inside SeanceProvider");
  return ctx;
}
