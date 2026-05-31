"use client";
// ThesisDatasetContext — holds the participant dataset for the
// Analyse des données workspace. Persists every change to
// localStorage. Pure mutations live in lib/thesis/dataset.ts; this
// context is the React wrapper that re-renders consumers.

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
  addRespondent,
  loadDataset,
  newRespondent,
  patchRespondent,
  removeRespondent,
  saveDataset,
  type Respondent,
} from "@/lib/thesis/dataset";

interface AddInput {
  age: number;
  sex: Respondent["sex"];
  group: Respondent["group"];
  phq9: number;
  gad7: number;
  des?: number;
  cds?: number;
}

interface ThesisDatasetContextValue {
  records: Respondent[];
  ready: boolean;
  add: (input: AddInput) => Respondent;
  update: (
    id: string,
    patch: Partial<Omit<Respondent, "id" | "createdAt">>
  ) => void;
  remove: (id: string) => void;
  clear: () => void;
}

const ThesisDatasetContext =
  createContext<ThesisDatasetContextValue | null>(null);

export function ThesisDatasetProvider({ children }: { children: ReactNode }) {
  const [records, setRecords] = useState<Respondent[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setRecords(loadDataset());
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) saveDataset(records);
  }, [records, ready]);

  const add = useCallback((input: AddInput): Respondent => {
    const r = newRespondent(input);
    setRecords((prev) => addRespondent(prev, r));
    return r;
  }, []);

  const update = useCallback(
    (id: string, patch: Partial<Omit<Respondent, "id" | "createdAt">>) => {
      setRecords((prev) => patchRespondent(prev, id, patch));
    },
    []
  );

  const remove = useCallback((id: string) => {
    setRecords((prev) => removeRespondent(prev, id));
  }, []);

  const clear = useCallback(() => {
    setRecords([]);
  }, []);

  const value = useMemo<ThesisDatasetContextValue>(
    () => ({ records, ready, add, update, remove, clear }),
    [records, ready, add, update, remove, clear]
  );

  return (
    <ThesisDatasetContext.Provider value={value}>
      {children}
    </ThesisDatasetContext.Provider>
  );
}

export function useThesisDataset(): ThesisDatasetContextValue {
  const ctx = useContext(ThesisDatasetContext);
  if (!ctx)
    throw new Error(
      "useThesisDataset must be used inside ThesisDatasetProvider"
    );
  return ctx;
}
