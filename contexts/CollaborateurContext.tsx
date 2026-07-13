"use client";
// CollaborateurContext — React wrapper over the pure caseload store
// (lib/therapist/collaborateurs.ts). Continuous persistence; also
// hosts the demo-data seed/clear and the JSON export/import used as
// the data-safety mechanism (localStorage is single-browser).

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
  addAbsenceEntry,
  addAssignment,
  addCheckIn,
  addCollaborateur,
  addMoodEntry,
  addResource,
  addRiskEntry,
  buildDatasetExport,
  buildSampleCollaborateurs,
  clearSampleData,
  hasSampleData,
  loadCollaborateurs,
  newCollaborateur,
  parseDatasetImport,
  patchCollaborateur,
  removeAssignment,
  removeResource,
  saveCollaborateurs,
  setDeparture,
  toggleAssignment,
  type Collaborateur,
  type ContactChannel,
  type Departure,
  type RiskLevel,
} from "@/lib/therapist/collaborateurs";
import {
  loadSeances,
  saveSeances,
  type Seance,
} from "@/lib/internship/seance";

interface CollaborateurContextValue {
  collaborateurs: Collaborateur[];
  ready: boolean;
  hasDemo: boolean;
  create: (input: {
    displayName: string;
    team: string;
    role: string;
    manager?: string;
  }) => Collaborateur;
  patch: (
    id: string,
    patch: Partial<
      Pick<Collaborateur, "displayName" | "team" | "role" | "manager" | "status">
    >
  ) => void;
  logMood: (
    id: string,
    input: { date: string; functioning: number; note?: string }
  ) => void;
  logRisk: (
    id: string,
    input: {
      date: string;
      flightRisk: RiskLevel;
      burnoutRisk: RiskLevel;
      note?: string;
    }
  ) => void;
  logAbsence: (
    id: string,
    input: { date: string; days: number; reason?: string }
  ) => void;
  recordDeparture: (id: string, departure: Departure | null) => void;
  assign: (
    id: string,
    input: { worksheetId?: string; text?: string; dueDate?: string }
  ) => void;
  toggleAssign: (id: string, assignmentId: string) => void;
  removeAssign: (id: string, assignmentId: string) => void;
  addCaseResource: (id: string, input: { label: string; note?: string }) => void;
  removeCaseResource: (id: string, resourceId: string) => void;
  logCheckIn: (
    id: string,
    input: {
      date: string;
      channel: ContactChannel;
      summary: string;
      seemed?: string;
    }
  ) => void;
  seedDemo: () => void;
  clearDemo: () => void;
  exportJSON: () => string;
  importJSON: (json: string) => boolean;
}

const CollaborateurReactContext =
  createContext<CollaborateurContextValue | null>(null);

export function CollaborateurProvider({ children }: { children: ReactNode }) {
  const [collaborateurs, setCollaborateurs] = useState<Collaborateur[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setCollaborateurs(loadCollaborateurs());
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) saveCollaborateurs(collaborateurs);
  }, [collaborateurs, ready]);

  const create = useCallback(
    (input: {
      displayName: string;
      team: string;
      role: string;
      manager?: string;
    }) => {
      const c = newCollaborateur(input);
      setCollaborateurs((prev) => addCollaborateur(prev, c));
      return c;
    },
    []
  );

  const patch = useCallback(
    (
      id: string,
      p: Partial<
        Pick<
          Collaborateur,
          "displayName" | "team" | "role" | "manager" | "status"
        >
      >
    ) => setCollaborateurs((prev) => patchCollaborateur(prev, id, p)),
    []
  );

  const logMood = useCallback(
    (id: string, input: { date: string; functioning: number; note?: string }) =>
      setCollaborateurs((prev) => addMoodEntry(prev, id, input)),
    []
  );
  const logRisk = useCallback(
    (
      id: string,
      input: {
        date: string;
        flightRisk: RiskLevel;
        burnoutRisk: RiskLevel;
        note?: string;
      }
    ) => setCollaborateurs((prev) => addRiskEntry(prev, id, input)),
    []
  );
  const logAbsence = useCallback(
    (id: string, input: { date: string; days: number; reason?: string }) =>
      setCollaborateurs((prev) => addAbsenceEntry(prev, id, input)),
    []
  );
  const recordDeparture = useCallback(
    (id: string, departure: Departure | null) =>
      setCollaborateurs((prev) => setDeparture(prev, id, departure)),
    []
  );
  const assign = useCallback(
    (
      id: string,
      input: { worksheetId?: string; text?: string; dueDate?: string }
    ) => setCollaborateurs((prev) => addAssignment(prev, id, input)),
    []
  );
  const toggleAssign = useCallback(
    (id: string, assignmentId: string) =>
      setCollaborateurs((prev) => toggleAssignment(prev, id, assignmentId)),
    []
  );
  const removeAssign = useCallback(
    (id: string, assignmentId: string) =>
      setCollaborateurs((prev) => removeAssignment(prev, id, assignmentId)),
    []
  );
  const addCaseResource = useCallback(
    (id: string, input: { label: string; note?: string }) =>
      setCollaborateurs((prev) => addResource(prev, id, input)),
    []
  );
  const removeCaseResource = useCallback(
    (id: string, resourceId: string) =>
      setCollaborateurs((prev) => removeResource(prev, id, resourceId)),
    []
  );
  const logCheckIn = useCallback(
    (
      id: string,
      input: {
        date: string;
        channel: ContactChannel;
        summary: string;
        seemed?: string;
      }
    ) => setCollaborateurs((prev) => addCheckIn(prev, id, input)),
    []
  );

  const seedDemo = useCallback(() => {
    const today = new Date().toISOString().slice(0, 10);
    setCollaborateurs((prev) => [
      ...buildSampleCollaborateurs(today),
      ...prev.filter((c) => !c.isSample),
    ]);
  }, []);

  const clearDemo = useCallback(() => {
    setCollaborateurs((prev) => clearSampleData(prev));
  }, []);

  const exportJSON = useCallback((): string => {
    const seances = loadSeances();
    return JSON.stringify(
      buildDatasetExport(collaborateurs, seances),
      null,
      2
    );
  }, [collaborateurs]);

  const importJSON = useCallback((json: string): boolean => {
    const parsed = parseDatasetImport(json);
    if (!parsed) return false;
    setCollaborateurs(parsed.collaborateurs);
    saveSeances(parsed.seances as Seance[]);
    return true;
  }, []);

  const hasDemo = useMemo(
    () => hasSampleData(collaborateurs),
    [collaborateurs]
  );

  const value = useMemo<CollaborateurContextValue>(
    () => ({
      collaborateurs,
      ready,
      hasDemo,
      create,
      patch,
      logMood,
      logRisk,
      logAbsence,
      recordDeparture,
      assign,
      toggleAssign,
      removeAssign,
      addCaseResource,
      removeCaseResource,
      logCheckIn,
      seedDemo,
      clearDemo,
      exportJSON,
      importJSON,
    }),
    [
      collaborateurs,
      ready,
      hasDemo,
      create,
      patch,
      logMood,
      logRisk,
      logAbsence,
      recordDeparture,
      assign,
      toggleAssign,
      removeAssign,
      addCaseResource,
      removeCaseResource,
      logCheckIn,
      seedDemo,
      clearDemo,
      exportJSON,
      importJSON,
    ]
  );

  return (
    <CollaborateurReactContext.Provider value={value}>
      {children}
    </CollaborateurReactContext.Provider>
  );
}

export function useCollaborateurs(): CollaborateurContextValue {
  const ctx = useContext(CollaborateurReactContext);
  if (!ctx)
    throw new Error(
      "useCollaborateurs must be used inside CollaborateurProvider"
    );
  return ctx;
}
