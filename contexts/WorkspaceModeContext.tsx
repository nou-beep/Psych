"use client";
// Workspace mode — global UI mode (session / writing / research /
// review / supervision / default). Persists in localStorage, applies
// CSS classes via the AccessibilityShell-style wrapper.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { loadFromStorage, saveToStorage } from "@/lib/store";
import {
  MODE_STORAGE_KEY,
  MODES,
  findMode,
  modeClassNames,
  type WorkspaceMode,
} from "@/lib/desk/modes";

interface WorkspaceModeContextType {
  mode: WorkspaceMode;
  setMode: (mode: WorkspaceMode) => void;
  modes: typeof MODES;
  classNames: string[];
}

const WorkspaceModeContext = createContext<WorkspaceModeContextType | null>(
  null
);

export function WorkspaceModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<WorkspaceMode>("default");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = loadFromStorage<WorkspaceMode | null>(
      MODE_STORAGE_KEY,
      null
    );
    if (stored && findMode(stored)) setModeState(stored);
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) saveToStorage(MODE_STORAGE_KEY, mode);
  }, [mode, ready]);

  const setMode = useCallback((m: WorkspaceMode) => setModeState(m), []);

  const classNames = useMemo(() => modeClassNames(mode), [mode]);

  return (
    <WorkspaceModeContext.Provider
      value={{ mode, setMode, modes: MODES, classNames }}
    >
      {children}
    </WorkspaceModeContext.Provider>
  );
}

export function useWorkspaceMode() {
  const ctx = useContext(WorkspaceModeContext);
  if (!ctx)
    throw new Error("useWorkspaceMode must be used inside WorkspaceModeProvider");
  return ctx;
}
